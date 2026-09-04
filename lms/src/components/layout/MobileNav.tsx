import React, { useState, useEffect } from 'react';
import { getMobileNavByRole } from '../../constants/navigation';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';

export interface MobileNavProps {
  activePath: string;
  onNavigate: (path: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activePath, onNavigate }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const loadUnread = () => {
    if (user) {
      setUnreadCount(notificationService.getUnreadCount(user.id, user.role));
    }
  };

  useEffect(() => {
    loadUnread();

    const handleUpdate = () => {
      loadUnread();
    };

    window.addEventListener('salam_notification_updated', handleUpdate);
    return () => {
      window.removeEventListener('salam_notification_updated', handleUpdate);
    };
  }, [user]);

  if (!user) return null;

  const navItems = getMobileNavByRole(user.role);

  return (
    <nav className="mobile-bottom-nav" aria-label="Navigasi Bawah Terpadu">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePath === item.path;
        const isNotifItem = item.path === '/notifikasi';
        const displayBadge = isNotifItem && unreadCount > 0 
          ? (unreadCount > 99 ? '99+' : String(unreadCount)) 
          : item.badge;

        return (
          <button
            key={item.id}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onNavigate(item.path)}
            aria-label={item.label}
          >
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <Icon size={20} />
              {isNotifItem && unreadCount > 0 && (
                <span 
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-8px',
                    minWidth: '16px',
                    height: '16px',
                    backgroundColor: 'var(--color-danger-main, #dc2626)',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '0.625rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    boxShadow: '0 0 0 2px var(--bg-surface, #ffffff)'
                  }}
                >
                  {displayBadge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
            {!isNotifItem && displayBadge && (
              <span className="mobile-nav-badge">{displayBadge}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
