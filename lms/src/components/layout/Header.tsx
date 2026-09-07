import React from 'react';
import { Menu, LogOut, PanelLeftClose, PanelLeftOpen, Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/roles';
import { ROLE_LABELS } from '../../constants/permissions';
import { REGISTERED_USERS } from '../../services/authService';
import { NotificationDropdown } from './NotificationDropdown';

export interface HeaderProps {
  activePath: string;
  onToggleMobileSidebar: () => void;
  onNavigate?: (path: string) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onNavigate,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
  isFocusMode = false,
  onToggleFocusMode
}) => {
  const { user, switchRole, logout } = useAuth();

  if (!user) return null;

  const canSwitchRole = 
    user.role === 'administrator_sistem' || 
    user.role === 'admin_akademik' ||
    user.originalRole === 'administrator_sistem' ||
    user.originalRole === 'admin_akademik';

  return (
    <header className="header-topbar">
      <div className="header-left">
        {/* Mobile menu drawer trigger */}
        <button 
          className="mobile-menu-btn" 
          onClick={onToggleMobileSidebar}
          aria-label="Buka Menu Navigasi"
          title="Buka Menu"
        >
          <Menu size={20} />
        </button>

        {/* Desktop Sidebar Toggle Button (Hide and Seek) */}
        {onToggleSidebarCollapse && (
          <button
            type="button"
            className="header-toggle-sidebar-btn"
            onClick={onToggleSidebarCollapse}
            title={isSidebarCollapsed ? 'Tampilkan Bilah Sisi (Ctrl+B)' : 'Sembunyikan Bilah Sisi (Ctrl+B)'}
            aria-label={isSidebarCollapsed ? 'Tampilkan Bilah Sisi' : 'Sembunyikan Bilah Sisi'}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            <span>{isSidebarCollapsed ? 'Buka Menu' : 'Sembunyikan Menu'}</span>
          </button>
        )}
        
        {/* Role Display: Dropdown selector ONLY for Admin & Superadmin */}
        {canSwitchRole ? (
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <span 
              className="hidden sm:inline-block"
              style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-semibold)', whiteSpace: 'nowrap' }}
            >
              Simulasi Peran:
            </span>
            <select 
              value={user.role} 
              onChange={(e) => switchRole(e.target.value as UserRole)}
              className="form-select"
              aria-label="Pilih Peran Pengguna (Khusus Admin & Superadmin)"
              style={{ 
                padding: '4px 8px', 
                fontSize: 'var(--text-xs)', 
                fontWeight: 'var(--font-weight-semibold)',
                width: 'auto',
                maxWidth: 'min(180px, 40vw)',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-50)',
                color: 'var(--color-primary-900)',
                borderColor: 'var(--color-primary-200)',
                cursor: 'pointer',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
              title="Fitur Khusus Admin & Superadmin untuk simulasi tampilan peran"
            >
              {REGISTERED_USERS.map((u) => (
                <option key={u.id} value={u.role}>
                  {ROLE_LABELS[u.role]}: {u.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div 
            className="flex items-center gap-1.5 px-3 py-1 rounded-full" 
            style={{ 
              backgroundColor: 'var(--color-primary-50)', 
              border: '1px solid var(--color-primary-200)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-primary-900)',
              fontWeight: 600
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-success-main)', display: 'inline-block' }}></span>
            <span>{user.roleLabel || ROLE_LABELS[user.role]}</span>
          </div>
        )}

        {/* LMS Indicator Badge */}
        <div 
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full" 
          style={{ 
            backgroundColor: 'var(--color-primary-50)', 
            border: '1px solid var(--color-primary-200)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-primary-900)',
            fontWeight: 'var(--font-weight-semibold)'
          }}
          title="Sistem Pembelajaran Daring (Terintegrasi SALAM SIAKAD)"
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-success-main)', display: 'inline-block' }}></span>
          <span>LMS Pembelajaran Daring</span>
        </div>
      </div>

      <div className="header-right">
        {/* Direct Link / Bridge to SALAM SIAKAD */}
        <a
          href="http://salam.stai-alittihad.ac.id/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-sm hidden sm:inline-flex items-center gap-1.5"
          style={{
            borderColor: 'var(--color-primary-300)',
            color: 'var(--color-primary-800)',
            backgroundColor: 'var(--color-primary-50)',
            fontWeight: 'var(--font-weight-semibold)',
            fontSize: 'var(--text-xs)',
            padding: '4px 10px',
            textDecoration: 'none',
            borderRadius: 'var(--radius-full)'
          }}
          title="Buka Sistem Informasi Akademik Resmi (SALAM SIAKAD)"
        >
          <ExternalLink size={13} />
          <span>Portal SALAM SIAKAD</span>
        </a>
        {/* Focus Mode Toggle (Layar Penuh / Hide All Navs) */}
        {onToggleFocusMode && (
          <button
            type="button"
            className="btn btn-ghost btn-sm hidden md:flex"
            onClick={onToggleFocusMode}
            title={isFocusMode ? 'Kembali ke Tampilan Normal' : 'Mode Fokus Layar Penuh (Sembunyikan Navigasi)'}
            aria-label="Mode Fokus"
            style={{ padding: '6px 8px', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}
          >
            {isFocusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span style={{ fontSize: 'var(--text-xs)' }}>
              {isFocusMode ? 'Normal' : 'Fokus'}
            </span>
          </button>
        )}

        {/* Notifikasi Dropdown */}
        <NotificationDropdown onNavigate={onNavigate || (() => {})} />

        {/* User Identity Chip */}
        <div className="flex items-center gap-2 sm:gap-3" style={{ paddingLeft: 'var(--space-2)', borderLeft: '1px solid var(--border-default)' }}>
          <div className="hidden md:flex" style={{ textAlign: 'right', flexDirection: 'column' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              {user.identityNumber}
            </span>
          </div>

          <div 
            title={`${user.name} (${user.identityNumber})`}
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: 'var(--radius-full)', 
              backgroundColor: 'var(--color-primary-100)', 
              color: 'var(--color-primary-800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: 'var(--text-xs)',
              flexShrink: 0
            }}
          >
            {user.name.charAt(0)}
          </div>

          <button
            onClick={logout}
            className="btn btn-ghost btn-sm"
            title="Keluar dari akun"
            aria-label="Keluar"
            style={{ color: 'var(--color-danger-main)', padding: '6px', minWidth: '32px', minHeight: '32px' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
