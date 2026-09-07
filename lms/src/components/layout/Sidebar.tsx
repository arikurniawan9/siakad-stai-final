import React, { useState, useEffect } from 'react';
import { LogOut, PanelLeftClose, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNavigationByRole } from '../../constants/navigation';
import { academicService } from '../../services/academicService';
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
  const [classCount, setClassCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const isLecturer = user.role === 'dosen' || user.role === 'dosen_pa';
    const isStudent = user.role === 'mahasiswa';

    const updateCount = () => {
      const classes = academicService.getClasses();
      if (isLecturer) {
        const userNidn = (user.identityNumber || '').replace(/[^0-9]/g, '');
        const filtered = classes.filter((cls) => {
          const clsNidn = (cls.lecturerNidn || '').replace(/[^0-9]/g, '');
          return (
            (clsNidn && userNidn && clsNidn === userNidn) ||
            cls.lecturerId === user.id ||
            cls.lecturerNidn === user.identityNumber ||
            cls.lecturerName.toLowerCase().includes(user.name.toLowerCase()) ||
            (cls.classLecturerName && cls.classLecturerName.toLowerCase().includes(user.name.toLowerCase()))
          );
        });
        setClassCount(filtered.length);
      } else if (isStudent) {
        const userNim = (user.identityNumber || user.username || '').replace(/[^0-9]/g, '');
        const filtered = classes.filter((cls) => academicService.isStudentEnrolledInClass(cls.id, userNim, user.id));
        setClassCount(filtered.length);
      } else {
        setClassCount(classes.length);
      }
    };

    updateCount();
    academicService.fetchClassesFromBackend().then(() => {
      updateCount();
    });
  }, [user]);

  const getItemBadge = (item: { id: string; path: string; badge?: string | number }): string | number | undefined => {
    if (item.id === 'mata-kuliah-saya' || item.path === '/mata-kuliah') {
      if (classCount !== null && classCount > 0) {
        return classCount;
      }
      return undefined;
    }
    return item.badge;
  };

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
                <div className="sidebar-brand-title">SALAM LMS</div>
                <div className="sidebar-brand-subtitle">PEMBELAJARAN DARING</div>
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
                          if (item.isExternal && item.externalUrl) {
                            window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
                          } else {
                            onNavigate(item.path);
                          }
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
                        {(() => {
                          const badgeContent = getItemBadge(item);
                          if (!badgeContent) return null;
                          return isCollapsed ? (
                            <span className="nav-badge-dot" />
                          ) : (
                            <span className="nav-badge">{badgeContent}</span>
                          );
                        })()}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Quick Link Bridge ke SALAM SIAKAD */}
        {!isCollapsed ? (
          <div style={{ padding: '8px 12px', margin: '0 8px 8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-50)', border: '1px solid var(--color-primary-200)' }}>
            <a
              href="http://salam.stai-alittihad.ac.id/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--color-primary-900)',
                textDecoration: 'none',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-semibold)'
              }}
              title="Akses Sistem Informasi Akademik Resmi (KRS, KHS, Tagihan, DPNA)"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ExternalLink size={14} color="var(--color-primary-700)" />
                <span>Portal SALAM SIAKAD</span>
              </div>
              <span style={{ fontSize: '10px', backgroundColor: 'var(--color-primary-200)', color: 'var(--color-primary-900)', padding: '1px 5px', borderRadius: '4px' }}>
                Resmi
              </span>
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <a
              href="http://salam.stai-alittihad.ac.id/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-50)',
                color: 'var(--color-primary-800)',
                textDecoration: 'none',
                border: '1px solid var(--color-primary-200)'
              }}
              title="Buka Portal SALAM SIAKAD (Resmi)"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        )}

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
