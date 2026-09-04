import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  Pin, 
  Bookmark, 
  Search, 
  Calendar, 
  User, 
  Download, 
  ExternalLink, 
  CheckCheck, 
  Clock, 
  AlertTriangle, 
  BookOpen, 
  Award, 
  Sparkles, 
  Layers, 
  FileText,
  X
} from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { AnnouncementItem, AnnouncementCategory, AnnouncementUrgency } from '../../types/announcement';
import { announcementService } from '../../services/announcementService';

export interface PengumumanMahasiswaPageProps {
  onNavigate?: (path: string) => void;
}

type TabCategory = 'SEMUA' | 'AKADEMIK' | 'KEMAHASISWAAN' | 'KEISLAMAN' | 'KEUANGAN' | 'TERSIMPAN';

export const PengumumanMahasiswaPage: React.FC<PengumumanMahasiswaPageProps> = ({
  onNavigate
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<TabCategory>('SEMUA');
  const [announcements, setAnnouncements] = useState<(AnnouncementItem & { isRead: boolean; isBookmarked: boolean })[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('SEMUA');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<(AnnouncementItem & { isRead: boolean; isBookmarked: boolean }) | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Auto reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, urgencyFilter]);

  const hasActiveFilters = searchQuery !== '' || urgencyFilter !== 'SEMUA' || activeTab !== 'SEMUA';

  const handleResetFilters = () => {
    setSearchQuery('');
    setUrgencyFilter('SEMUA');
    setActiveTab('SEMUA');
    setCurrentPage(1);
  };

  // Load announcements
  const loadData = () => {
    const studentId = user?.id || 'usr-mhs-01';
    const items = announcementService.getAnnouncements(studentId);
    setAnnouncements(items);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Statistics
  const stats = useMemo(() => {
    const studentId = user?.id || 'usr-mhs-01';
    return announcementService.getAnnouncementStats(studentId);
  }, [announcements, user]);

  // Handle Mark Single As Read
  const handleOpenDetail = (item: AnnouncementItem & { isRead: boolean; isBookmarked: boolean }) => {
    const studentId = user?.id || 'usr-mhs-01';
    if (!item.isRead) {
      announcementService.markAsRead(item.id, studentId);
      loadData();
    }
    setSelectedAnnouncement({ ...item, isRead: true });
  };

  // Handle Toggle Bookmark
  const handleToggleBookmark = (e: React.MouseEvent, item: AnnouncementItem & { isRead: boolean; isBookmarked: boolean }) => {
    e.stopPropagation();
    const studentId = user?.id || 'usr-mhs-01';
    const isSaved = announcementService.toggleBookmark(item.id, studentId);
    loadData();

    if (selectedAnnouncement && selectedAnnouncement.id === item.id) {
      setSelectedAnnouncement({ ...selectedAnnouncement, isBookmarked: isSaved });
    }

    toast.success(
      isSaved ? 'Pengumuman Disimpan' : 'Pengumuman Dihapus dari Simpanan',
      isSaved 
        ? `"${item.title.substring(0, 40)}..." telah ditambahkan ke daftar tersimpan.`
        : `Pengumuman telah dihapus dari daftar tersimpan.`
    );
  };

  // Handle Mark All As Read
  const handleMarkAllAsRead = () => {
    const studentId = user?.id || 'usr-mhs-01';
    announcementService.markAllAsRead(studentId);
    loadData();
    toast.success(
      'Semua Telah Dibaca',
      'Seluruh pengumuman telah ditandai sebagai telah dibaca.'
    );
  };

  // Filtered announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      // Tab Category filter
      if (activeTab === 'TERSIMPAN') {
        if (!item.isBookmarked) return false;
      } else if (activeTab !== 'SEMUA') {
        if (item.category !== activeTab) return false;
      }

      // Urgency filter
      if (urgencyFilter !== 'SEMUA' && item.urgency !== urgencyFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchSummary = item.summary.toLowerCase().includes(query);
        const matchPublisher = item.publisherName.toLowerCase().includes(query);
        const matchTag = item.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchTitle && !matchSummary && !matchPublisher && !matchTag) return false;
      }

      return true;
    });
  }, [announcements, activeTab, urgencyFilter, searchQuery]);

  // Paginated Announcements
  const totalPages = Math.ceil(filteredAnnouncements.length / pageSize) || 1;
  const paginatedAnnouncements = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAnnouncements.slice(start, start + pageSize);
  }, [filteredAnnouncements, currentPage, pageSize]);

  // Helper Badge Kategori
  const getCategoryBadge = (category: AnnouncementCategory) => {
    switch (category) {
      case 'AKADEMIK':
        return <Badge variant="primary">Akademik</Badge>;
      case 'KEMAHASISWAAN':
        return <Badge variant="success">Kemahasiswaan & Beasiswa</Badge>;
      case 'KEISLAMAN':
        return <Badge variant="warning">Keislaman & Ma'had</Badge>;
      case 'PERKULIAHAN':
        return <Badge variant="default">Perkuliahan</Badge>;
      case 'KEUANGAN':
        return <Badge variant="danger">Keuangan & SPP</Badge>;
      case 'DARURAT_PENTING':
        return <Badge variant="danger">Penting & Darurat</Badge>;
      default:
        return <Badge variant="default">{category}</Badge>;
    }
  };

  // Helper Urgency Badge
  const getUrgencyBadge = (urgency: AnnouncementUrgency) => {
    if (urgency === 'PENTING') {
      return (
        <span 
          style={{ 
            fontSize: '11px', 
            fontWeight: 'var(--font-weight-bold)', 
            color: 'var(--color-danger-main)', 
            backgroundColor: '#fee2e2', 
            padding: '2px 8px', 
            borderRadius: 'var(--radius-full)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <AlertTriangle size={12} /> Penting
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 'var(--space-1)' }}>
            <Badge variant="primary">Pusat Informasi Kampus</Badge>
            <Badge variant="default">STAI AL-ITTIHAD</Badge>
            {stats.unreadCount > 0 && (
              <Badge variant="warning">{stats.unreadCount} Belum Dibaca</Badge>
            )}
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--text-primary)' }}>
            Pengumuman & Informasi Akademik
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Pemberitahuan resmi rilis kalender akademik, beasiswa tahfidz, kajian keislaman, dan kebijakan rektorat.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {stats.unreadCount > 0 && (
            <Button 
              variant="outline" 
              icon={CheckCheck}
              onClick={handleMarkAllAsRead}
            >
              Tandai Semua Telah Dibaca
            </Button>
          )}
        </div>
      </div>

      {/* 2. Scorecard Ringkasan Pengumuman */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', 
          gap: 'var(--space-4)' 
        }}
      >
        {/* Total Pengumuman */}
        <Card style={{ borderLeft: '4px solid var(--color-primary-600)' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
                  Total Pengumuman
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary-700)', marginTop: '4px' }}>
                  {stats.total}
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }}>
                <Bell size={20} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '6px' }}>
              Periode Semester Ganjil 2026/2027
            </div>
          </CardBody>
        </Card>

        {/* Belum Dibaca */}
        <Card style={{ borderLeft: '4px solid var(--color-warning-main)' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
                  Belum Dibaca
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-warning-dark)', marginTop: '4px' }}>
                  {stats.unreadCount}
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-warning-subtle)', color: 'var(--color-warning-dark)' }}>
                <Clock size={20} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: stats.unreadCount > 0 ? 'var(--color-warning-dark)' : 'var(--color-success-700)', marginTop: '6px', fontWeight: 'var(--font-weight-medium)' }}>
              {stats.unreadCount > 0 ? 'Perlu ditinjau segera' : 'Semua sudah dibaca'}
            </div>
          </CardBody>
        </Card>

        {/* Disematkan / Prioritas */}
        <Card style={{ borderLeft: '4px solid var(--color-danger-main)' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
                  Disematkan (Penting)
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-danger-main)', marginTop: '4px' }}>
                  {stats.pinnedCount}
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#fee2e2', color: 'var(--color-danger-main)' }}>
                <Pin size={20} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger-main)', marginTop: '6px' }}>
              Surat Edaran Rektorat & BAAK
            </div>
          </CardBody>
        </Card>

        {/* Disimpan */}
        <Card style={{ borderLeft: '4px solid #8b5cf6' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
                  Tersimpan (Favorit)
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: '#7c3aed', marginTop: '4px' }}>
                  {stats.bookmarkedCount}
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                <Bookmark size={20} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: '#7c3aed', marginTop: '6px' }}>
              Arsip referensi belajar pribadi
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Tab Kategori & Filter Pencarian */}
      <Card>
        <CardBody style={{ padding: 'var(--space-4)' }}>
          {/* Tab Navigation */}
          <div 
            className="flex items-center gap-2 overflow-x-auto" 
            style={{ 
              borderBottom: '1px solid var(--border-color)', 
              paddingBottom: 'var(--space-3)',
              marginBottom: 'var(--space-4)'
            }}
          >
            <Button
              variant={activeTab === 'SEMUA' ? 'primary' : 'ghost'}
              size="sm"
              icon={Bell}
              onClick={() => setActiveTab('SEMUA')}
            >
              Semua ({stats.total})
            </Button>
            <Button
              variant={activeTab === 'AKADEMIK' ? 'primary' : 'ghost'}
              size="sm"
              icon={BookOpen}
              onClick={() => setActiveTab('AKADEMIK')}
            >
              Akademik
            </Button>
            <Button
              variant={activeTab === 'KEMAHASISWAAN' ? 'primary' : 'ghost'}
              size="sm"
              icon={Award}
              onClick={() => setActiveTab('KEMAHASISWAAN')}
            >
              Kemahasiswaan & Beasiswa
            </Button>
            <Button
              variant={activeTab === 'KEISLAMAN' ? 'primary' : 'ghost'}
              size="sm"
              icon={Sparkles}
              onClick={() => setActiveTab('KEISLAMAN')}
            >
              Keislaman & Ma'had
            </Button>
            <Button
              variant={activeTab === 'KEUANGAN' ? 'primary' : 'ghost'}
              size="sm"
              icon={Layers}
              onClick={() => setActiveTab('KEUANGAN')}
            >
              Keuangan
            </Button>
            <Button
              variant={activeTab === 'TERSIMPAN' ? 'primary' : 'ghost'}
              size="sm"
              icon={Bookmark}
              onClick={() => setActiveTab('TERSIMPAN')}
            >
              Tersimpan ({stats.bookmarkedCount})
            </Button>
          </div>

          {/* Search Bar & Urgency Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
              <Search 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-muted)' 
                }} 
              />
              <input
                type="text"
                placeholder="Cari judul, kata kunci, atau penerbit pengumuman..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: 'var(--text-sm)',
                  backgroundColor: 'var(--bg-default)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Urgensi:</span>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: 'var(--text-xs)',
                  backgroundColor: 'var(--bg-default)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="SEMUA">Semua Tingkat Urgensi</option>
                <option value="PENTING">Hanya Penting</option>
                <option value="NORMAL">Standar / Normal</option>
              </select>

              {hasActiveFilters && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={X} 
                  onClick={handleResetFilters}
                  title="Reset Semua Filter"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 4. Daftar Kartu Pengumuman */}
      {filteredAnnouncements.length === 0 ? (
        <Card>
          <CardBody style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
            <div 
              style={{ 
                display: 'inline-flex', 
                padding: '16px', 
                borderRadius: 'var(--radius-full)', 
                backgroundColor: 'var(--bg-subtle)', 
                color: 'var(--text-muted)',
                marginBottom: 'var(--space-3)'
              }}
            >
              <Bell size={32} />
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              Tidak Ada Pengumuman Ditemukan
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', maxWidth: '400px', margin: '4px auto 0' }}>
              Tidak ada pengumuman yang sesuai dengan filter atau kata kunci pencarian Anda.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {paginatedAnnouncements.map((item) => {
            const isUnread = !item.isRead;

            return (
              <Card 
                key={item.id}
                style={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderLeft: item.isPinned 
                    ? '4px solid var(--color-primary-600)' 
                    : isUnread 
                      ? '4px solid var(--color-warning-main)' 
                      : '1px solid var(--border-color)',
                  backgroundColor: isUnread ? '#fffdfa' : 'var(--bg-surface)'
                }}
                onClick={() => handleOpenDetail(item)}
              >
                <CardBody style={{ padding: 'var(--space-5)' }}>
                  <div className="flex flex-col gap-3">
                    {/* Header Row: Badges, Date, Actions */}
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.isPinned && (
                          <span 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              color: 'var(--color-primary-800)',
                              backgroundColor: 'var(--color-primary-50)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              border: '1px solid var(--color-primary-200)'
                            }}
                          >
                            <Pin size={12} /> Disematkan
                          </span>
                        )}
                        {getCategoryBadge(item.category)}
                        {getUrgencyBadge(item.urgency)}
                        {isUnread && (
                          <Badge variant="warning" style={{ fontSize: '10px' }}>BARU</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs text-muted" style={{ color: 'var(--text-muted)' }}>
                          <Calendar size={13} />
                          <span>
                            {new Date(item.publishedAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleToggleBookmark(e, item)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: item.isBookmarked ? '#7c3aed' : 'var(--text-muted)',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'color 0.2s ease'
                          }}
                          title={item.isBookmarked ? 'Hapus Simpanan' : 'Simpan Pengumuman'}
                          aria-label={item.isBookmarked ? 'Hapus Simpanan' : 'Simpan Pengumuman'}
                        >
                          <Bookmark size={18} fill={item.isBookmarked ? '#7c3aed' : 'none'} />
                        </button>
                      </div>
                    </div>

                    {/* Judul & Ringkasan */}
                    <div>
                      <h3 
                        style={{ 
                          fontSize: 'var(--text-base)', 
                          fontWeight: isUnread ? 'var(--font-weight-bold)' : 'var(--font-weight-semibold)', 
                          color: 'var(--text-primary)',
                          lineHeight: '1.4'
                        }}
                      >
                        {item.title}
                      </h3>
                      <p 
                        style={{ 
                          fontSize: 'var(--text-sm)', 
                          color: 'var(--text-secondary)', 
                          marginTop: '6px',
                          lineHeight: '1.5'
                        }}
                      >
                        {item.summary}
                      </p>
                    </div>

                    {/* Footer Info: Publisher & Tags */}
                    <div 
                      className="flex justify-between items-center flex-wrap gap-2" 
                      style={{ 
                        borderTop: '1px solid var(--border-subtle)', 
                        paddingTop: 'var(--space-3)',
                        marginTop: 'var(--space-1)'
                      }}
                    >
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <User size={13} />
                        <span>{item.publisherName}</span>
                        <span>•</span>
                        <span>{item.publisherRole}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {item.attachments && item.attachments.length > 0 && (
                          <span 
                            style={{ 
                              fontSize: '11px', 
                              color: 'var(--color-primary-700)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px' 
                            }}
                          >
                            <Download size={12} /> {item.attachments.length} Berkas Lampiran
                          </span>
                        )}

                        <div className="flex gap-1">
                          {item.tags.slice(0, 3).map((tag) => (
                            <span 
                              key={tag}
                              style={{ 
                                fontSize: '10px', 
                                backgroundColor: 'var(--bg-subtle)', 
                                padding: '2px 6px', 
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-muted)'
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}

          <Card>
            <CardBody style={{ padding: 'var(--space-2) var(--space-4)' }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredAnnouncements.length}
                pageSize={pageSize}
                pageSizeOptions={[5, 10, 20]}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemLabel="pengumuman"
              />
            </CardBody>
          </Card>
        </div>
      )}

      {/* 5. Modal Detail Pengumuman Lengkap */}
      {selectedAnnouncement && (
        <Modal
          isOpen={!!selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
          title="Rincian Pengumuman Resmi Kampus"
          maxWidth="760px"
        >
          <div className="flex flex-col gap-6">
            {/* Header Info */}
            <div className="flex flex-col gap-3" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-4)' }}>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedAnnouncement.isPinned && (
                  <Badge variant="primary">Disematkan</Badge>
                )}
                {getCategoryBadge(selectedAnnouncement.category)}
                {getUrgencyBadge(selectedAnnouncement.urgency)}
              </div>

              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: '1.3' }}>
                {selectedAnnouncement.title}
              </h2>

              <div className="flex justify-between items-center flex-wrap gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <div className="flex items-center gap-2">
                  <User size={14} />
                  <span><strong>{selectedAnnouncement.publisherName}</strong> ({selectedAnnouncement.publisherRole})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>
                    {new Date(selectedAnnouncement.publishedAt).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Isi Pengumuman HTML */}
            <div 
              className="prose"
              style={{ 
                fontSize: 'var(--text-sm)', 
                lineHeight: '1.7', 
                color: 'var(--text-primary)' 
              }}
              dangerouslySetInnerHTML={{ __html: selectedAnnouncement.contentHtml }}
            />

            {/* Daftar Lampiran Berkas PDF / SK */}
            {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
              <div 
                style={{ 
                  backgroundColor: 'var(--bg-subtle)', 
                  padding: 'var(--space-4)', 
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)' 
                }}
              >
                <div className="flex items-center gap-2" style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
                  <FileText size={16} color="var(--color-primary-700)" />
                  <span>Dokumen Lampiran Resmi ({selectedAnnouncement.attachments.length})</span>
                </div>

                <div className="flex flex-col gap-2">
                  {selectedAnnouncement.attachments.map((att) => (
                    <div 
                      key={att.id}
                      className="flex justify-between items-center p-3 bg-white"
                      style={{ 
                        borderRadius: 'var(--radius-md)', 
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-surface)' 
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div style={{ padding: '6px 8px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '11px', fontWeight: 'bold' }}>
                          {att.fileType}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500', fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                            {att.fileName}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            Ukuran Berkas: {att.fileSize}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Download}
                        onClick={() => {
                          toast.info(
                            'Mengunduh Dokumen',
                            `Berkas "${att.fileName}" sedang diunduh.`
                          );
                        }}
                      >
                        Unduh
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tautan Aksi Cepat / CTA */}
            {selectedAnnouncement.actionLink && onNavigate && (
              <div 
                style={{ 
                  backgroundColor: 'var(--color-primary-50)', 
                  border: '1px solid var(--color-primary-200)', 
                  padding: 'var(--space-4)', 
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 'var(--space-2)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)', color: 'var(--color-primary-900)' }}>
                    Tindakan Terkait Pengumuman
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-800)', marginTop: '2px' }}>
                    Akses langsung ke menu yang berkaitan dengan pengumuman ini.
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  icon={ExternalLink}
                  onClick={() => {
                    if (selectedAnnouncement.actionLink) {
                      onNavigate(selectedAnnouncement.actionLink.path);
                      setSelectedAnnouncement(null);
                    }
                  }}
                >
                  {selectedAnnouncement.actionLink.label}
                </Button>
              </div>
            )}

            {/* Footer Modal */}
            <div className="flex justify-between items-center flex-wrap gap-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-3)' }}>
              <button
                type="button"
                onClick={(e) => handleToggleBookmark(e, selectedAnnouncement)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: selectedAnnouncement.isBookmarked ? '#7c3aed' : 'var(--text-muted)',
                  fontSize: 'var(--text-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: '500'
                }}
              >
                <Bookmark size={16} fill={selectedAnnouncement.isBookmarked ? '#7c3aed' : 'none'} />
                {selectedAnnouncement.isBookmarked ? 'Tersimpan di Favorit' : 'Simpan Pengumuman'}
              </button>

              <Button variant="secondary" onClick={() => setSelectedAnnouncement(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
