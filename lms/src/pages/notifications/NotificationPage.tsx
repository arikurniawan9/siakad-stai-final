import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Search, 
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
  Clock,
  Plus,
  Send,
  X
} from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { InAppNotification, NotificationCategory, NotificationPriority } from '../../types/notification';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { UserRole } from '../../types/roles';

export interface NotificationPageProps {
  onNavigate?: (path: string) => void;
}

type TabCategory = 'SEMUA' | 'UNREAD' | 'AKADEMIK' | 'TUGAS_NILAI' | 'KRS_BIMBINGAN' | 'EWS_KEAMANAN' | 'SISTEM';

export const NotificationPage: React.FC<NotificationPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<TabCategory>('SEMUA');
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('SEMUA');
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  // Form state broadcast
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastCategory, setBroadcastCategory] = useState<NotificationCategory>('PENGUMUMAN');
  const [broadcastPriority, setBroadcastPriority] = useState<NotificationPriority>('SEDANG');
  const [broadcastRoles, setBroadcastRoles] = useState<UserRole[]>(['mahasiswa', 'dosen']);
  const [broadcastDeepLink, setBroadcastDeepLink] = useState('/');

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

  // Statistics
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const highPriority = notifications.filter((n) => n.priority === 'TINGGI').length;
    const academic = notifications.filter((n) => ['AKADEMIK', 'KRS', 'NILAI'].includes(n.category)).length;

    return { total, unread, highPriority, academic };
  }, [notifications]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Auto reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, priorityFilter, searchQuery]);

  const hasActiveFilters = searchQuery !== '' || priorityFilter !== 'SEMUA' || activeTab !== 'SEMUA';

  const handleResetFilters = () => {
    setSearchQuery('');
    setPriorityFilter('SEMUA');
    setActiveTab('SEMUA');
    setCurrentPage(1);
  };

  // Filtered dataset
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Tab filter
      if (activeTab === 'UNREAD' && n.isRead) return false;
      if (activeTab === 'AKADEMIK' && !['AKADEMIK', 'PERKULIAHAN', 'PENGUMUMAN'].includes(n.category)) return false;
      if (activeTab === 'TUGAS_NILAI' && !['TUGAS', 'NILAI', 'DISKUSI'].includes(n.category)) return false;
      if (activeTab === 'KRS_BIMBINGAN' && !['KRS', 'BIMBINGAN'].includes(n.category)) return false;
      if (activeTab === 'EWS_KEAMANAN' && !['EWS', 'KEAMANAN'].includes(n.category)) return false;
      if (activeTab === 'SISTEM' && n.category !== 'SISTEM') return false;

      // Priority filter
      if (priorityFilter !== 'SEMUA' && n.priority !== priorityFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchMsg = n.message.toLowerCase().includes(q);
        const matchSender = n.senderName?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchMsg && !matchSender) return false;
      }

      return true;
    });
  }, [notifications, activeTab, priorityFilter, searchQuery]);

  // Paginated Notifications
  const totalPages = Math.ceil(filteredNotifications.length / pageSize) || 1;
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredNotifications.slice(start, start + pageSize);
  }, [filteredNotifications, currentPage, pageSize]);

  const handleMarkAllRead = () => {
    if (!user) return;
    notificationService.markAllAsRead(user.id, user.role);
    toast.success('Berhasil', 'Semua notifikasi telah ditandai sebagai dibaca.');
    loadNotifications();
  };

  const handleClearRead = () => {
    if (!user) return;
    notificationService.clearReadNotifications(user.id, user.role);
    toast.info('Dibersihkan', 'Notifikasi yang sudah dibaca telah dihapus dari daftar.');
    loadNotifications();
  };

  const handleItemClick = (notif: InAppNotification) => {
    notificationService.markAsRead(notif.id);
    loadNotifications();
    if (notif.deepLinkPath && onNavigate) {
      onNavigate(notif.deepLinkPath);
    }
  };

  const handleToggleRead = (e: React.MouseEvent, notif: InAppNotification) => {
    e.stopPropagation();
    if (notif.isRead) {
      notificationService.markAsUnread(notif.id);
    } else {
      notificationService.markAsRead(notif.id);
    }
    loadNotifications();
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    notificationService.deleteNotification(id);
    toast.info('Dihapus', 'Notifikasi telah dihapus.');
    loadNotifications();
  };

  const handleSendBroadcast = () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.warning('Validasi', 'Judul dan isi pesan notifikasi wajib diisi.');
      return;
    }

    notificationService.createNotification({
      targetRoles: broadcastRoles,
      title: broadcastTitle,
      message: broadcastMessage,
      category: broadcastCategory,
      priority: broadcastPriority,
      deepLinkPath: broadcastDeepLink || '/',
      actionLabel: 'Lihat Informasi',
      senderName: user?.name || 'Administrator',
      senderRole: user?.roleLabel || 'Admin'
    });

    toast.success('Notifikasi Terkirim', `Notifikasi broadcast berhasil dikirim ke ${broadcastRoles.join(', ')}.`);
    setIsBroadcastModalOpen(false);
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  const canBroadcast = user && ['admin_akademik', 'administrator_sistem', 'kaprodi', 'pimpinan', 'dosen'].includes(user.role);

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'NILAI': return <Award size={18} color="#059669" />;
      case 'TUGAS': return <ClipboardList size={18} color="#7c3aed" />;
      case 'DISKUSI': return <MessageSquare size={18} color="#2563eb" />;
      case 'KRS': return <FileCheck size={18} color="#4f46e5" />;
      case 'BIMBINGAN': return <Users size={18} color="#0891b2" />;
      case 'EWS': return <AlertTriangle size={18} color="#d97706" />;
      case 'KEAMANAN': return <ShieldAlert size={18} color="#e11d48" />;
      case 'SISTEM': return <Server size={18} color="#475569" />;
      case 'PENGUMUMAN': return <Megaphone size={18} color="#ca8a04" />;
      default: return <BookOpen size={18} color="var(--color-primary-700)" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-1)' }}>
            <Badge variant="primary">Layanan Terintegrasi 7 Role</Badge>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Pusat Informasi & Notifikasi Real-time
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
            Pusat Notifikasi Akademik
          </h1>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            Pantau seluruh pembaruan nilai, tugas, persetujuan KRS, peringatan EWS, dan pengumuman kampus STAI AL-ITTIHAD.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {canBroadcast && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsBroadcastModalOpen(true)}
            >
              Kirim Notifikasi
            </Button>
          )}
          {stats.unread > 0 && (
            <Button
              variant="secondary"
              icon={CheckCheck}
              onClick={handleMarkAllRead}
            >
              Tandai Semua Dibaca
            </Button>
          )}
          {notifications.some((n) => n.isRead) && (
            <Button
              variant="outline"
              icon={Trash2}
              onClick={handleClearRead}
            >
              Bersihkan Terbaca
            </Button>
          )}
        </div>
      </div>

      {/* 2. Kartu Statistik Ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex items-center gap-3">
              <div style={{ padding: '10px', backgroundColor: 'var(--color-primary-50)', borderRadius: '10px', color: 'var(--color-primary-700)' }}>
                <Bell size={20} />
              </div>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Total Notifikasi</span>
                <h3 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'bold' }}>{stats.total}</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex items-center gap-3">
              <div style={{ padding: '10px', backgroundColor: '#fef2f2', borderRadius: '10px', color: '#dc2626' }}>
                <CheckCheck size={20} />
              </div>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Belum Dibaca</span>
                <h3 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: stats.unread > 0 ? '#dc2626' : 'inherit' }}>
                  {stats.unread}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex items-center gap-3">
              <div style={{ padding: '10px', backgroundColor: '#fffbeb', borderRadius: '10px', color: '#d97706' }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Prioritas Tinggi</span>
                <h3 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: '#d97706' }}>
                  {stats.highPriority}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex items-center gap-3">
              <div style={{ padding: '10px', backgroundColor: '#eff6ff', borderRadius: '10px', color: '#2563eb' }}>
                <BookOpen size={20} />
              </div>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Akademik & KRS</span>
                <h3 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: '#2563eb' }}>
                  {stats.academic}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Filter Bar & Tabs Kategori */}
      <Card>
        <CardBody style={{ padding: 'var(--space-4)' }}>
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'SEMUA', label: 'Semua' },
                { id: 'UNREAD', label: `Belum Dibaca (${stats.unread})` },
                { id: 'AKADEMIK', label: 'Akademik' },
                { id: 'TUGAS_NILAI', label: 'Tugas & Nilai' },
                { id: 'KRS_BIMBINGAN', label: 'KRS & Bimbingan' },
                { id: 'EWS_KEAMANAN', label: 'EWS & Keamanan' },
                { id: 'SISTEM', label: 'Sistem' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabCategory)}
                  style={{
                    padding: '6px 12px',
                    fontSize: 'var(--text-xs)',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                    backgroundColor: activeTab === tab.id ? 'var(--color-primary-600)' : 'var(--color-slate-100)',
                    color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search & Priority Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Cari notifikasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 32px',
                    fontSize: 'var(--text-xs)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-default)',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default)',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="SEMUA">Semua Prioritas</option>
                <option value="TINGGI">Prioritas Tinggi</option>
                <option value="SEDANG">Prioritas Sedang</option>
                <option value="RENDAH">Prioritas Rendah</option>
              </select>

              {hasActiveFilters && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={X} 
                  onClick={handleResetFilters}
                  title="Reset Semua Filter"
                >
                  Reset Filter
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 4. Daftar Notifikasi Terintegrasi */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardBody style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--color-primary-50)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-600)', marginBottom: 'var(--space-3)' }}>
              <CheckCheck size={28} />
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', margin: '0 0 var(--space-1) 0' }}>
              Tidak Ada Notifikasi
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
              {activeTab === 'UNREAD' 
                ? 'Semua notifikasi telah Anda selesaikan dan baca.' 
                : 'Tidak ada notifikasi yang sesuai dengan kriteria filter saat ini.'}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {paginatedNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              className="hover:bg-slate-50 transition"
              style={{
                backgroundColor: notif.isRead ? '#ffffff' : 'rgba(236, 253, 245, 0.55)',
                border: notif.isRead ? '1px solid var(--border-default)' : '1px solid var(--color-primary-300)',
                borderRadius: '12px',
                padding: 'var(--space-4)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-4)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
              }}
            >
              {/* Category Icon */}
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '10px', 
                  backgroundColor: 'var(--color-slate-100)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0 
                }}
              >
                {getCategoryIcon(notif.category)}
              </div>

              {/* Content Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2" style={{ marginBottom: '4px' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span style={{ fontWeight: notif.isRead ? '600' : 'bold', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      {notif.title}
                    </span>
                    {!notif.isRead && (
                      <Badge variant="primary">Baru</Badge>
                    )}
                    {notif.priority === 'TINGGI' && (
                      <Badge variant="danger">Penting</Badge>
                    )}
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', backgroundColor: 'var(--color-slate-100)', padding: '1px 6px', borderRadius: '4px' }}>
                      {notif.category}
                    </span>
                  </div>

                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    {new Date(notif.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(notif.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </span>
                </div>

                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '0 0 var(--space-3) 0', lineHeight: 1.5 }}>
                  {notif.message}
                </p>

                {/* Sender & Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-2)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Pengirim: <strong>{notif.senderName || 'Sistem Terintegrasi SALAM'}</strong> {notif.senderRole ? `(${notif.senderRole})` : ''}
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => handleToggleRead(e, notif)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}
                    >
                      {notif.isRead ? 'Tandai Belum Dibaca' : 'Tandai Dibaca'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteItem(e, notif.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--text-xs)', color: 'var(--color-danger-main)' }}
                    >
                      Hapus
                    </button>
                    {notif.actionLabel && (
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-700)', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        {notif.actionLabel} <ArrowRight size={13} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Card>
            <CardBody style={{ padding: 'var(--space-2) var(--space-4)' }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredNotifications.length}
                pageSize={pageSize}
                pageSizeOptions={[5, 10, 20, 50]}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemLabel="notifikasi"
              />
            </CardBody>
          </Card>
        </div>
      )}

      {/* 5. Modal Kirim Notifikasi Broadcast (Role Berwenang) */}
      {isBroadcastModalOpen && (
        <Modal
          isOpen={isBroadcastModalOpen}
          onClose={() => setIsBroadcastModalOpen(false)}
          title="Kirim Notifikasi Broadcast Sistem"
        >
          <div className="flex flex-col gap-4">
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Kirimkan pemberitahuan real-time langsung ke akun pengguna berdasarkan peran target dalam LMS STAI AL-ITTIHAD.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'bold', marginBottom: '4px' }}>
                Judul Notifikasi <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Pengumuman Batas Pengisian KRS Semester Ganjil"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: 'var(--text-sm)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'bold', marginBottom: '4px' }}>
                Isi Pesan Notifikasi <span style={{ color: 'red' }}>*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan rincian instruksi atau pengumuman secara padat dan jelas..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: 'var(--text-sm)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default)',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'bold', marginBottom: '4px' }}>
                  Kategori Notifikasi
                </label>
                <select
                  value={broadcastCategory}
                  onChange={(e) => setBroadcastCategory(e.target.value as NotificationCategory)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: 'var(--text-sm)', borderRadius: '8px', border: '1px solid var(--border-default)' }}
                >
                  <option value="PENGUMUMAN">PENGUMUMAN (Pengumuman Umum)</option>
                  <option value="AKADEMIK">AKADEMIK (Jadwal/Kalender)</option>
                  <option value="KRS">KRS (Rencana Studi)</option>
                  <option value="TUGAS">TUGAS (Tugas Kuliah)</option>
                  <option value="NILAI">NILAI (Hasil Evaluasi/Grade)</option>
                  <option value="EWS">EWS (Early Warning System)</option>
                  <option value="SISTEM">SISTEM (Pemeliharaan/Server)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'bold', marginBottom: '4px' }}>
                  Tingkat Prioritas
                </label>
                <select
                  value={broadcastPriority}
                  onChange={(e) => setBroadcastPriority(e.target.value as NotificationPriority)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: 'var(--text-sm)', borderRadius: '8px', border: '1px solid var(--border-default)' }}
                >
                  <option value="SEDANG">SEDANG (Standar)</option>
                  <option value="TINGGI">TINGGI (Penting / Mendesak)</option>
                  <option value="RENDAH">RENDAH (Informasi Santai)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'bold', marginBottom: '6px' }}>
                Peran Target Penerima
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { role: 'mahasiswa', label: 'Mahasiswa' },
                  { role: 'dosen', label: 'Dosen' },
                  { role: 'dosen_pa', label: 'Dosen PA' },
                  { role: 'kaprodi', label: 'Kaprodi' },
                  { role: 'admin_akademik', label: 'Admin Akademik' },
                  { role: 'pimpinan', label: 'Pimpinan' },
                  { role: 'administrator_sistem', label: 'Admin Sistem' }
                ].map((item) => {
                  const isChecked = broadcastRoles.includes(item.role as UserRole);
                  return (
                    <label
                      key={item.role}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: isChecked ? '1px solid var(--color-primary-600)' : '1px solid var(--border-default)',
                        backgroundColor: isChecked ? 'var(--color-primary-50)' : '#ffffff',
                        fontSize: 'var(--text-xs)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setBroadcastRoles((prev) => 
                            prev.includes(item.role as UserRole)
                              ? prev.filter((r) => r !== item.role)
                              : [...prev, item.role as UserRole]
                          );
                        }}
                      />
                      <span>{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'bold', marginBottom: '4px' }}>
                Tautan Navigasi Cepat (Deep Link Path)
              </label>
              <input
                type="text"
                placeholder="Contoh: /krs, /tugas, /jadwal, /laporan"
                value={broadcastDeepLink}
                onChange={(e) => setBroadcastDeepLink(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: 'var(--text-sm)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default)'
                }}
              />
            </div>

            <div className="flex justify-end gap-2" style={{ marginTop: 'var(--space-4)' }}>
              <Button variant="outline" onClick={() => setIsBroadcastModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" icon={Send} onClick={handleSendBroadcast}>
                Kirimkan Sekarang
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
