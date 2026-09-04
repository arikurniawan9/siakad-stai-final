import React, { useState, useEffect, useRef } from 'react';
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
import { Badge } from '../ui/Badge';
import { InAppNotification, NotificationCategory } from '../../types/notification';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

export interface NotificationDropdownProps {
  onNavigate: (path: string) => void;
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

  const loadNotifications = () => {
    if (user) {
      setNotifications(notificationService.getNotifications(user.id, user.role));
    }
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => {
      loadNotifications();
    };

    window.addEventListener('salam_notification_updated', handleUpdate);
    return () => {
      window.removeEventListener('salam_notification_updated', handleUpdate);
    };
  }, [user]);

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
    notificationService.markAsRead(notif.id);
    loadNotifications();
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
      return <Badge variant="danger">Penting</Badge>;
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
              width: '380px',
              maxWidth: 'calc(100vw - 20px)',
              maxHeight: 'min(520px, calc(100vh - 100px))',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
          padding: '10px 14px', 
          borderBottom: '1px solid #e2e8f0', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          flexShrink: 0
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>Notifikasi</span>
          {unreadCount > 0 && <Badge variant="primary">{unreadCount} Baru</Badge>}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary-700)', fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '500', padding: '4px 6px' }}
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
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: '3px', padding: '4px 6px' }}
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
          padding: '6px 10px', 
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
            fontWeight: activeTab === 'SEMUA' ? 'bold' : 'normal',
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
            fontWeight: activeTab === 'UNREAD' ? 'bold' : 'normal',
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
            fontWeight: activeTab === 'TINGGI' ? 'bold' : 'normal',
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
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', minHeight: isMobile ? '200px' : 'auto', maxHeight: isMobile ? '50vh' : '360px' }}>
        {filteredNotifications.length === 0 ? (
          <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
            {activeTab === 'UNREAD' 
              ? 'Semua notifikasi telah Anda baca.' 
              : 'Tidak ada notifikasi dalam kategori ini.'}
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              style={{
                padding: '12px 14px',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: notif.isRead ? 'transparent' : 'rgba(236, 253, 245, 0.65)',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
              className="hover:bg-slate-50 transition"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {getCategoryIcon(notif.category)}
                  <span style={{ fontWeight: notif.isRead ? '600' : 'bold', fontSize: '0.8125rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                    {notif.title}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {getPriorityBadge(notif.priority)}
                  {!notif.isRead && (
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--color-primary-600)', flexShrink: 0 }} />
                  )}
                </div>
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0, wordBreak: 'break-word' }}>
                {notif.message}
              </p>

              <div className="flex justify-between items-center" style={{ marginTop: '3px' }}>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                  {notif.senderName ? `${notif.senderName} • ` : ''}
                  {new Date(notif.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}, {new Date(notif.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
                {notif.actionLabel && (
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-primary-800)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {notif.actionLabel} <ArrowRight size={11} />
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Navigation */}
      <div
        style={{
          padding: '10px 14px',
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
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px'
          }}
        >
          <span>Buka Pusat Notifikasi Lengkap</span>
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
        onClick={() => { setIsOpen(!isOpen); loadNotifications(); }}
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
              backgroundColor: 'var(--color-danger-main, #dc2626)',
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
