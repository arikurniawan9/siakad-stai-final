import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, 
  Pin, 
  Lock, 
  Plus, 
  ArrowRight,
  Eye,
  Search,
  X
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { DiscussionThread } from '../../types/forum';
import { forumService } from '../../services/forumService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { KAMUS_UI } from '../../constants/dictionary';

export interface ForumListPageProps {
  onSelectThread: (threadId: string) => void;
}

export const ForumListPage: React.FC<ForumListPageProps> = ({ onSelectThread }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMeeting, setFilterMeeting] = useState<string>('SEMUA');
  const [createModal, setCreateModal] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Form New Thread
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [meetingNumber, setMeetingNumber] = useState<number>(1);
  const [tagsInput, setTagsInput] = useState('');

  const loadThreads = () => {
    setThreads(forumService.getThreads());
  };

  useEffect(() => {
    loadThreads();
  }, []);

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const created = forumService.createThread({
        classId: 'cls-pai301-a',
        meetingId: `mtg-pai301a-0${meetingNumber}`,
        courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
        meetingNumber,
        title,
        content,
        authorId: user.id,
        authorName: user.name,
        authorNimOrNidn: user.identityNumber || '21.01.0042',
        authorRole: user.role,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
      });

      loadThreads();
      setCreateModal(false);
      setTitle('');
      setContent('');
      setTagsInput('');
      toast.success('Topik Dibuat', 'Topik diskusi berhasil dipublikasikan ke forum kelas.');
      onSelectThread(created.id);
    } catch (err: any) {
      toast.danger('Gagal Membuat Topik', err.message);
    }
  };

  // Auto reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterMeeting]);

  const hasActiveFilters = searchQuery !== '' || filterMeeting !== 'SEMUA';

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterMeeting('SEMUA');
    setCurrentPage(1);
  };

  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      const matchesSearch = 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesMeeting = filterMeeting === 'SEMUA' || t.meetingNumber?.toString() === filterMeeting;
      return matchesSearch && matchesMeeting;
    });
  }, [threads, searchQuery, filterMeeting]);

  // Paginated Threads
  const totalPages = Math.ceil(filteredThreads.length / pageSize) || 1;
  const paginatedThreads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredThreads.slice(start, start + pageSize);
  }, [filteredThreads, currentPage, pageSize]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1>{KAMUS_UI.FORUM_DISKUSI} Kelas</h1>
          <p>Ruang kolaborasi akademik interaktif per pertemuan untuk bertukar gagasan dan kajian ilmiah</p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setCreateModal(true)}>
          Mulai Topik Diskusi Baru
        </Button>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div style={{ position: 'relative', flex: 1, width: '100%' }}>
              <Input
                placeholder="Cari topik diskusi atau tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px' }}
              />
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
            </div>

            <select
              className="form-select"
              value={filterMeeting}
              onChange={(e) => setFilterMeeting(e.target.value)}
              style={{ width: 'auto', minWidth: '220px' }}
            >
              <option value="SEMUA">Semua Sesi Pertemuan</option>
              <option value="1">Pertemuan 1: Pengantar Ushul Fiqih</option>
              <option value="2">Pertemuan 2: Kaidah Lughawiyah</option>
              <option value="3">Pertemuan 3: Sumber Hukum Islam</option>
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
        </CardBody>
      </Card>

      {/* Threads List */}
      <div className="flex flex-col gap-4">
        {filteredThreads.length === 0 ? (
          <Card>
            <CardBody style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
              <p className="text-muted">{KAMUS_UI.TIDAK_ADA_DATA}</p>
            </CardBody>
          </Card>
        ) : (
          <>
            {paginatedThreads.map((thread) => (
              <Card 
                key={thread.id} 
                style={{ 
                  borderLeft: thread.isPinned ? '4px solid var(--color-primary-600)' : '1px solid var(--border-default)',
                  boxShadow: thread.isPinned ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {thread.isPinned && (
                      <Badge variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Pin size={12} /> Disematkan
                      </Badge>
                    )}
                    {thread.isLocked && (
                      <Badge variant="danger" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Lock size={12} /> Terkunci
                      </Badge>
                    )}
                    <Badge variant="default">Pertemuan {thread.meetingNumber}</Badge>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      Diposting oleh <strong>{thread.authorName}</strong> ({thread.authorRole === 'dosen' ? 'Dosen Pengampu' : 'Mahasiswa'}) • {new Date(thread.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                    <span className="flex items-center gap-1">
                      <Eye size={14} /> {thread.viewsCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={14} /> {thread.totalRepliesCount} balasan
                    </span>
                  </div>
                </CardHeader>

                <CardBody>
                  <h3 
                    style={{ 
                      fontSize: 'var(--text-lg)', 
                      marginBottom: 'var(--space-2)', 
                      cursor: 'pointer',
                      color: 'var(--text-primary)'
                    }}
                    onClick={() => onSelectThread(thread.id)}
                  >
                    {thread.title}
                  </h3>

                  <p 
                    style={{ 
                      fontSize: 'var(--text-sm)', 
                      color: 'var(--text-secondary)', 
                      lineHeight: 1.6,
                      marginBottom: 'var(--space-4)'
                    }}
                  >
                    {thread.content.length > 200 ? `${thread.content.substring(0, 200)}...` : thread.content}
                  </p>

                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div className="flex gap-1 flex-wrap">
                      {thread.tags.map((t, idx) => (
                        <Badge key={idx} variant="default" style={{ fontSize: '0.6875rem' }}>
                          #{t}
                        </Badge>
                      ))}
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      icon={ArrowRight} 
                      iconPosition="right"
                      onClick={() => onSelectThread(thread.id)}
                    >
                      Buka Diskusi ({thread.totalRepliesCount})
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}

            <Card>
              <CardBody style={{ padding: 'var(--space-2) var(--space-4)' }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredThreads.length}
                  pageSize={pageSize}
                  pageSizeOptions={[5, 10, 20]}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  itemLabel="topik diskusi"
                />
              </CardBody>
            </Card>
          </>
        )}
      </div>

      {/* MODAL: Buat Topik Diskusi Baru */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Mulai Topik Diskusi Perkuliahan Baru"
        maxWidth="600px"
      >
        <form onSubmit={handleCreateThread} className="flex flex-col gap-4">
          <Input
            label="Judul Topik Diskusi"
            placeholder="Tuliskan pokok bahasan atau pertanyaan diskusi..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="form-group">
            <label className="form-label">Terkait dengan Pertemuan:</label>
            <select
              className="form-select"
              value={meetingNumber}
              onChange={(e) => setMeetingNumber(parseInt(e.target.value) || 1)}
            >
              <option value={1}>Pertemuan 1: Pengantar Ushul Fiqih</option>
              <option value={2}>Pertemuan 2: Kaidah Lughawiyah</option>
              <option value={3}>Pertemuan 3: Sumber Hukum Islam</option>
              <option value={4}>Pertemuan 4: Metodologi Ijtihad</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Uraian / Pertanyaan Diskusi:</label>
            <textarea
              className="form-textarea"
              rows={5}
              placeholder="Sampaikan konteks, rujukan awal, atau pertanyaan pemantik diskusi secara runtut..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <Input
            label="Tag / Kata Kunci (Dipisahkan Koma)"
            placeholder="AI, Smart Contract, Ushul Fiqih"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />

          <div className="modal-footer" style={{ margin: '0 calc(-1 * var(--space-5)) calc(-1 * var(--space-5))' }}>
            <Button variant="secondary" type="button" onClick={() => setCreateModal(false)}>
              {KAMUS_UI.BATAL}
            </Button>
            <Button variant="primary" type="submit">
              Terbitkan Topik Diskusi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
