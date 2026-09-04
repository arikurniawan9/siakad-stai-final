import React from 'react';
import { LogOut, PanelLeftClose } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNavigationByRole } from '../../constants/navigation';
import { KAMUS_UI } from '../../constants/dictionary';

export interface SidebarProps {
  activePath: string;
  onNavigate: (path: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePath,
  onNavigate,
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const navGroups = getNavigationByRole(user.role);

  return (
    <>
      {/* Backdrop for mobile drawer */}
      <div 
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Brand Header */}
        <div 
          className="sidebar-header" 
          style={{ justifyContent: isCollapsed ? 'center' : 'space-between' }}
        >
          <div 
            className="sidebar-brand-group"
            style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', width: isCollapsed ? '100%' : 'auto' }}
          >
            <div 
              className="sidebar-logo-icon" 
              title="SALAM STAI AL-ITTIHAD"
              onClick={isCollapsed && onToggleCollapse ? onToggleCollapse : undefined}
              style={{ cursor: isCollapsed ? 'pointer' : 'default' }}
            >
              <img 
                src="/logo.png" 
                alt="Logo STAI AL-ITTIHAD" 
                className="sidebar-logo-img" 
              />
            </div>
            {!isCollapsed && (
              <div className="sidebar-brand-text">
                <div className="sidebar-brand-title">SALAM</div>
                <div className="sidebar-brand-subtitle">STAI AL-ITTIHAD</div>
              </div>
            )}
          </div>

          {/* Collapse Button inside Expanded Sidebar */}
          {!isCollapsed && onToggleCollapse && (
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={onToggleCollapse}
              title="Sembunyikan / Ringkaskan Bilah Sisi (Ctrl+B)"
              aria-label="Ringkaskan Navigasi"
            >
              <PanelLeftClose size={18} />
            </button>
          )}
        </div>

        {/* Scrollable Navigation List */}
        <nav className="sidebar-content" aria-label="Navigasi Utama">
          {navGroups.map((group, groupIdx) => (
            <div key={group.id} style={{ width: '100%' }}>
              {isCollapsed ? (
                groupIdx > 0 && <div className="sidebar-nav-divider" />
              ) : (
                <div className="nav-group-title">{group.title}</div>
              )}

              <ul className="nav-items-list">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePath === item.path;

                  return (
                    <li key={item.id}>
                      <button
                        className={`nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          onNavigate(item.path);
                          onClose();
                        }}
                        title={isCollapsed ? item.label : undefined}
                        style={{
                          width: isCollapsed ? '42px' : '100%',
                          height: isCollapsed ? '42px' : 'auto',
                          margin: isCollapsed ? '2px auto' : undefined,
                          justifyContent: isCollapsed ? 'center' : 'flex-start',
                          padding: isCollapsed ? '0' : 'var(--space-2) var(--space-3)'
                        }}
                      >
                        <Icon size={isCollapsed ? 19 : 18} style={{ flexShrink: 0 }} />
                        {!isCollapsed && (
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                        )}
                        {item.badge && (
                          isCollapsed ? (
                            <span className="nav-badge-dot" />
                          ) : (
                            <span className="nav-badge">{item.badge}</span>
                          )
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="sidebar-footer">
          {!isCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.roleLabel}
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.studyProgram || 'STAI Al-Ittihad'}
              </span>
            </div>
          )}

          <button 
            className="btn btn-ghost btn-sm"
            onClick={logout}
            title={KAMUS_UI.KELUAR}
            aria-label={KAMUS_UI.KELUAR}
            style={{ 
              color: 'var(--color-danger-main)',
              width: isCollapsed ? '38px' : 'auto',
              height: isCollapsed ? '38px' : 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isCollapsed ? 0 : undefined
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};
