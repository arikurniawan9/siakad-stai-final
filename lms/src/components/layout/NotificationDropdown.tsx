import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bell, 
  CheckCheck, 
  ArrowRight,
  Award,
  ClipboardList,
  MessageSquare,
  BookOpen,
  AlertTriangle,
  ShieldAlert,
  Server,
  FileCheck,
  Users,
  Megaphone,
  Trash2,
  X
} from 'lucide-react';
import { InAppNotification, NotificationCategory } from '../../types/notification';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

export interface NotificationDropdownProps {
  onNavigate: (path: string) => void;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 45) {
      return 'Baru saja';
    }
    if (diffMin < 60) {
      return `${diffMin} mnt lalu`;
    }
    if (diffHours < 24) {
      return `${diffHours} jam lalu`;
    }
    if (diffDays === 1) {
      return `Kemarin, ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
    }
    if (diffDays < 7) {
      return `${diffDays} hari lalu`;
    }
    return `${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}, ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
  } catch {
    return dateString;
  }
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'SEMUA' | 'UNREAD' | 'TINGGI'>('SEMUA');
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 640;
    }
    return false;
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Responsive breakpoint listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadNotifications = useCallback(() => {
    if (user) {
      setNotifications(notificationService.getNotifications(user.id, user.role));
    }
  }, [user]);

  // Initial load and polling sync listener
  useEffect(() => {
    loadNotifications();
    // Memicu sinkronisasi API dari server database
    notificationService.fetchNotificationsFromApi().then(() => {
      loadNotifications();
    }).catch(() => {});

    const handleUpdate = () => {
      loadNotifications();
    };

    window.addEventListener('salam_notification_updated', handleUpdate);
    return () => {
      window.removeEventListener('salam_notification_updated', handleUpdate);
    };
  }, [loadNotifications]);

  // Click outside listener for desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isMobile && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'UNREAD') return !n.isRead;
    if (activeTab === 'TINGGI') return n.priority === 'TINGGI';
    return true;
  });

  const handleToggleOpen = () => {
    if (!isOpen) {
      // Saat membuka dropdown, perbarui notifikasi dari server secara instan
      notificationService.fetchNotificationsFromApi().catch(() => {});
      loadNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAllRead = () => {
    if (!user) return;
    notificationService.markAllAsRead(user.id, user.role);
    loadNotifications();
  };

  const handleClearRead = () => {
    if (!user) return;
    notificationService.clearReadNotifications(user.id, user.role);
    loadNotifications();
  };

  const handleItemClick = (notif: InAppNotification) => {
    if (!notif.isRead) {
      notificationService.markAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.deepLinkPath) {
      onNavigate(notif.deepLinkPath);
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'NILAI':
        return <Award size={15} color="#059669" />;
      case 'TUGAS':
        return <ClipboardList size={15} color="#7c3aed" />;
      case 'DISKUSI':
        return <MessageSquare size={15} color="#2563eb" />;
      case 'KRS':
        return <FileCheck size={15} color="#4f46e5" />;
      case 'BIMBINGAN':
        return <Users size={15} color="#0891b2" />;
      case 'EWS':
        return <AlertTriangle size={15} color="#d97706" />;
      case 'KEAMANAN':
        return <ShieldAlert size={15} color="#e11d48" />;
      case 'SISTEM':
        return <Server size={15} color="#475569" />;
      case 'PENGUMUMAN':
        return <Megaphone size={15} color="#ca8a04" />;
      default:
        return <BookOpen size={15} color="var(--color-primary-700)" />;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (priority === 'TINGGI') {
      return (
        <span style={{ fontSize: '0.625rem', fontWeight: 'bold', color: '#b91c1c', backgroundColor: '#fee2e2', padding: '1px 6px', borderRadius: '4px' }}>
          Penting
        </span>
      );
    }
    return null;
  };

  const panelContent = (
    <div 
      style={
        isMobile
          ? {
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              width: '100%',
              maxHeight: '85vh',
              backgroundColor: '#ffffff',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              border: '1px solid #cbd5e1',
              borderBottom: 'none',
              boxShadow: '0 -20px 25px -5px rgba(0, 0, 0, 0.25)',
              zIndex: 99999,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              paddingBottom: 'env(safe-area-inset-bottom, 12px)'
            }
          : {
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '400px',
              maxWidth: 'calc(100vw - 24px)',
              maxHeight: 'min(540px, calc(100vh - 100px))',
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.18), 0 10px 15px -3px rgba(0, 0, 0, 0.08)',
              zIndex: 99999,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }
      }
      onClick={(e) => e.stopPropagation()}
    >
      {/* Mobile Touch Drag Handle Indicator */}
      {isMobile && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: '8px', paddingBottom: '4px', backgroundColor: '#f8fafc' }}>
          <div style={{ width: '40px', height: '4px', backgroundColor: '#cbd5e1', borderRadius: '2px' }} />
        </div>
      )}

      {/* Header Panel */}
      <div 
        style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid #e2e8f0', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          flexShrink: 0
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-primary)' }}>Notifikasi</span>
          {unreadCount > 0 ? (
            <span style={{ backgroundColor: '#dc2626', color: '#ffffff', fontSize: '0.6875rem', fontWeight: 'bold', padding: '1px 7px', borderRadius: '10px' }}>
              {unreadCount} Baru
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '10px', fontWeight: '600' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
              Realtime
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary-700)', fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '600', padding: '4px 6px', borderRadius: '4px' }}
              title="Tandai semua sebagai telah dibaca"
            >
              <CheckCheck size={13} />
              <span>Baca Semua</span>
            </button>
          )}
          {notifications.some(n => n.isRead) && (
            <button
              type="button"
              onClick={handleClearRead}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: '3px', padding: '4px 6px', borderRadius: '4px' }}
              title="Hapus notifikasi yang sudah dibaca"
            >
              <Trash2 size={12} />
              <span>Bersihkan</span>
            </button>
          )}
          {isMobile && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Tutup"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips with Smooth Horizontal Scroll */}
      <div 
        style={{ 
          padding: '8px 12px', 
          display: 'flex', 
          gap: '6px', 
          borderBottom: '1px solid #f1f5f9',
          backgroundColor: '#ffffff',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('SEMUA')}
          style={{
            padding: '4px 10px',
            fontSize: '0.6875rem',
            borderRadius: '6px',
            border: 'none',
            fontWeight: activeTab === 'SEMUA' ? 'bold' : '500',
            backgroundColor: activeTab === 'SEMUA' ? 'var(--color-primary-50)' : '#f8fafc',
            color: activeTab === 'SEMUA' ? 'var(--color-primary-800)' : 'var(--text-secondary)',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          Semua ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('UNREAD')}
          style={{
            padding: '4px 10px',
            fontSize: '0.6875rem',
            borderRadius: '6px',
            border: 'none',
            fontWeight: activeTab === 'UNREAD' ? 'bold' : '500',
            backgroundColor: activeTab === 'UNREAD' ? 'var(--color-primary-50)' : '#f8fafc',
            color: activeTab === 'UNREAD' ? 'var(--color-primary-800)' : 'var(--text-secondary)',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          Belum Dibaca ({unreadCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('TINGGI')}
          style={{
            padding: '4px 10px',
            fontSize: '0.6875rem',
            borderRadius: '6px',
            border: 'none',
            fontWeight: activeTab === 'TINGGI' ? 'bold' : '500',
            backgroundColor: activeTab === 'TINGGI' ? 'var(--color-primary-50)' : '#f8fafc',
            color: activeTab === 'TINGGI' ? 'var(--color-primary-800)' : 'var(--text-secondary)',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          Penting ({notifications.filter(n => n.priority === 'TINGGI').length})
        </button>
      </div>

      {/* List Items */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', minHeight: isMobile ? '200px' : 'auto', maxHeight: isMobile ? '50vh' : '370px' }}>
        {filteredNotifications.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-slate-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-600)', marginBottom: '8px' }}>
              <CheckCheck size={20} />
            </div>
            <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-primary)' }}>
              {activeTab === 'UNREAD' ? 'Semua notifikasi telah dibaca' : 'Tidak ada notifikasi'}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.6875rem' }}>
              Anda sudah mendapatkan informasi terbaru dari sistem akademik.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: notif.isRead ? '#ffffff' : '#f0fdf4',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start'
              }}
              className="hover:bg-slate-50 transition"
            >
              {/* Category Icon */}
              <div 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '8px', 
                  backgroundColor: notif.isRead ? '#f1f5f9' : '#dcfce7', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0,
                  marginTop: '2px'
                }}
              >
                {getCategoryIcon(notif.category)}
              </div>

              {/* Message Content */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div className="flex justify-between items-start gap-2">
                  <span style={{ fontWeight: notif.isRead ? '600' : '700', fontSize: '0.8125rem', color: notif.isRead ? 'var(--text-primary)' : '#064e3b', wordBreak: 'break-word', lineHeight: 1.35 }}>
                    {notif.title}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {getPriorityBadge(notif.priority)}
                    {!notif.isRead && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669', display: 'inline-block' }} />
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0, wordBreak: 'break-word' }}>
                  {notif.message}
                </p>

                <div className="flex justify-between items-center" style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                    {notif.senderName ? `${notif.senderName} • ` : ''}
                    {formatRelativeTime(notif.createdAt)}
                  </span>
                  {notif.actionLabel && (
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-primary-800)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      {notif.actionLabel} <ArrowRight size={11} />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Navigation */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          textAlign: 'center',
          flexShrink: 0
        }}
      >
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            onNavigate('/notifikasi');
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-primary-800)',
            fontSize: '0.75rem',
            fontWeight: '700',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 8px'
          }}
        >
          <span>Pusat Notifikasi Lengkap</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
      {/* Bell Button with Live Badge */}
      <button
        type="button"
        onClick={handleToggleOpen}
        className="header-icon-btn"
        aria-label="Pusat Notifikasi Realtime"
        aria-expanded={isOpen}
        aria-haspopup="true"
        style={{ 
          position: 'relative',
          backgroundColor: isOpen ? 'var(--color-primary-50, #ecfdf5)' : 'transparent',
          color: isOpen ? 'var(--color-primary-800, #065f46)' : 'var(--text-secondary)'
        }}
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span 
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              minWidth: '18px',
              height: '18px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              borderRadius: '9px',
              fontSize: '0.625rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 0 0 2px var(--bg-surface, #ffffff)',
              animation: 'pulse 2s infinite'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile Backdrop Overlay */}
      {isOpen && isMobile && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            zIndex: 99998
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Popover / Bottom Sheet Content */}
      {isOpen && panelContent}
    </div>
  );
};
