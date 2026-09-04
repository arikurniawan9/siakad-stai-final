import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Pin, 
  Lock, 
  Unlock, 
  Award, 
  ThumbsUp, 
  MessageSquare, 
  Send, 
  ShieldAlert, 
  Reply,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { DiscussionThread, DiscussionPost } from '../../types/forum';
import { forumService } from '../../services/forumService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { KAMUS_UI } from '../../constants/dictionary';

export interface ThreadDetailPageProps {
  threadId: string;
  onBack: () => void;
}

export const ThreadDetailPage: React.FC<ThreadDetailPageProps> = ({ threadId, onBack }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [thread, setThread] = useState<DiscussionThread | null>(null);
  const [posts, setPosts] = useState<DiscussionPost[]>([]);

  // Main reply form
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nested reply state
  const [replyingToPostId, setReplyingToPostId] = useState<string | null>(null);
  const [nestedContent, setNestedContent] = useState('');

  // Moderation hide modal
  const [hidingPostId, setHidingPostId] = useState<string | null>(null);
  const [hideReason, setHideReason] = useState('');

  const isLecturer = user?.role === 'dosen' || user?.role === 'dosen_pa' || user?.role === 'administrator_sistem';

  const loadData = () => {
    const thr = forumService.getThreadById(threadId);
    if (thr) setThread(thr);
    const psts = forumService.getPostsByThread(threadId);
    setPosts(psts);
  };

  useEffect(() => {
    loadData();
  }, [threadId]);

  if (!thread) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={onBack}>
          Kembali ke Forum
        </Button>
        <Card>
          <CardBody style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
            <p className="text-muted">Topik diskusi tidak ditemukan.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const handleSendMainReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      forumService.createPost({
        threadId: thread.id,
        authorId: user.id,
        authorName: user.name,
        authorNimOrNidn: user.identityNumber || '21.01.0042',
        authorRole: user.role,
        content: replyContent
      });

      setReplyContent('');
      loadData();
      toast.success('Tanggapan Terkirim', 'Tanggapan Anda berhasil ditambahkan ke forum diskusi.');
    } catch (err: any) {
      toast.danger('Gagal Mengirim Tanggapan', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendNestedReply = (parentPostId: string) => {
    if (!user || !nestedContent.trim()) return;

    try {
      forumService.createPost({
        threadId: thread.id,
        parentPostId,
        authorId: user.id,
        authorName: user.name,
        authorNimOrNidn: user.identityNumber || '21.01.0042',
        authorRole: user.role,
        content: nestedContent
      });

      setNestedContent('');
      setReplyingToPostId(null);
      loadData();
      toast.success('Balasan Terkirim', 'Balasan komentar berhasil dipublikasikan.');
    } catch (err: any) {
      toast.danger('Gagal', err.message);
    }
  };

  const handleTogglePin = () => {
    if (!user) return;
    try {
      const updated = forumService.togglePinThread(thread.id, user.name);
      setThread(updated);
      toast.success('Status Berubah', updated.isPinned ? 'Topik disematkan di atas.' : 'Sematan topik dilepas.');
    } catch (err: any) {
      toast.danger('Gagal', err.message);
    }
  };

  const handleToggleLock = () => {
    if (!user) return;
    try {
      const updated = forumService.toggleLockThread(thread.id, user.name);
      setThread(updated);
      toast.success('Status Berubah', updated.isLocked ? 'Diskusi dikunci.' : 'Diskusi dibuka kembali.');
    } catch (err: any) {
      toast.danger('Gagal', err.message);
    }
  };

  const handleToggleBestAnswer = (postId: string) => {
    if (!user) return;
    try {
      forumService.toggleBestAnswer(postId, user.name);
      loadData();
      toast.success('Jawaban Terbaik', 'Status jawaban terbaik berhasil diperbarui.');
    } catch (err: any) {
      toast.danger('Gagal', err.message);
    }
  };

  const handleHidePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !hidingPostId) return;

    try {
      forumService.hidePost(hidingPostId, hideReason || 'Melanggar etika diskusi akademik', user.name);
      setHidingPostId(null);
      setHideReason('');
      loadData();
      toast.warning('Konten Disembunyikan', 'Komentar telah disensor dari tampilan publik.');
    } catch (err: any) {
      toast.danger('Gagal', err.message);
    }
  };

  const handleUpvote = (postId: string) => {
    if (!user) return;
    forumService.toggleUpvote(postId, user.id);
    loadData();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={onBack}>
          Kembali ke {KAMUS_UI.FORUM_DISKUSI}
        </Button>
      </div>

      {/* Main Thread Card */}
      <Card style={{ borderLeft: thread.isPinned ? '4px solid var(--color-primary-600)' : '1px solid var(--border-default)' }}>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 w-full">
            <div className="flex items-center gap-2 flex-wrap">
              {thread.meetingNumber && <Badge variant="primary">Pertemuan {thread.meetingNumber}</Badge>}
              {thread.isPinned && <Badge variant="primary"><Pin size={11} /> Disematkan</Badge>}
              {thread.isLocked && <Badge variant="warning"><Lock size={11} /> Dikunci</Badge>}
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                {new Date(thread.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
              </span>
            </div>

            {/* Lecturer Moderation Tools */}
            {isLecturer && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" icon={Pin} onClick={handleTogglePin}>
                  {thread.isPinned ? 'Lepas Sematan' : 'Sematkan Topik'}
                </Button>
                <Button variant={thread.isLocked ? 'primary' : 'outline'} size="sm" icon={thread.isLocked ? Unlock : Lock} onClick={handleToggleLock}>
                  {thread.isLocked ? 'Buka Kunci' : 'Kunci Diskusi'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardBody className="flex flex-col gap-4">
          <h1 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
            {thread.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {thread.authorName.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>
                {thread.authorName}
                <Badge variant="default" style={{ marginLeft: '6px', fontSize: '0.6875rem' }}>
                  {thread.authorRole === 'dosen' ? 'Dosen' : 'Mahasiswa'}
                </Badge>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                NIM/NIDN: {thread.authorNimOrNidn} • {thread.courseName}
              </div>
            </div>
          </div>

          <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
            {thread.content}
          </p>

          <div className="flex gap-1 flex-wrap" style={{ marginTop: 'var(--space-2)' }}>
            {thread.tags.map((t, idx) => (
              <Badge key={idx} variant="default" style={{ fontSize: '0.6875rem' }}>
                #{t}
              </Badge>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Replies Thread Section */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 style={{ fontSize: 'var(--text-base)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare size={18} />
            <span>Tanggapan & Diskusi Mahasiswa ({posts.length})</span>
          </h3>
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardBody style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <p className="text-muted">Belum ada tanggapan pada topik ini. Jadilah yang pertama memulai diskusi!</p>
            </CardBody>
          </Card>
        ) : (
          posts.map((post) => {
            const hasUpvoted = user && post.upvotedUserIds?.includes(user.id);

            return (
              <Card 
                key={post.id}
                style={{ 
                  borderLeft: post.isBestAnswer ? '4px solid var(--color-success-border)' : '1px solid var(--border-default)',
                  backgroundColor: post.isBestAnswer ? 'var(--color-success-bg)' : 'var(--bg-surface)'
                }}
              >
                <CardBody className="flex flex-col gap-3">
                  {/* Best Answer Badge */}
                  {post.isBestAnswer && (
                    <div className="flex items-center gap-1" style={{ color: 'var(--color-success-text)', fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>
                      <Award size={16} />
                      <span>JAWABAN TERBAIK DARI DOSEN PENGAMPU</span>
                    </div>
                  )}

                  {/* Header Author */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-slate-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 'var(--text-xs)' }}>
                        {post.authorName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>
                          {post.authorName}
                          <Badge variant="default" style={{ marginLeft: '6px', fontSize: '0.6875rem' }}>
                            {post.authorRole === 'dosen' ? 'Dosen' : 'Mahasiswa'}
                          </Badge>
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                          {new Date(post.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons for Lecturer */}
                    {isLecturer && (
                      <div className="flex gap-1">
                        <Button 
                          variant={post.isBestAnswer ? 'primary' : 'outline'} 
                          size="sm" 
                          icon={Award}
                          onClick={() => handleToggleBestAnswer(post.id)}
                        >
                          {post.isBestAnswer ? 'Batalkan Terbaik' : 'Tandai Terbaik'}
                        </Button>
                        {!post.isHidden && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            icon={ShieldAlert}
                            onClick={() => setHidingPostId(post.id)}
                          >
                            Sembunyikan
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  {post.isHidden ? (
                    <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-100)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      [Komentar disembunyikan oleh moderator: {post.moderationReason || 'Melanggar etika diskusi'}]
                    </div>
                  ) : (
                    <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                      {post.content}
                    </p>
                  )}

                  {/* Bottom interactions */}
                  <div className="flex items-center gap-3" style={{ marginTop: 'var(--space-1)', fontSize: 'var(--text-xs)' }}>
                    <Button 
                      variant={hasUpvoted ? 'primary' : 'outline'} 
                      size="sm" 
                      icon={ThumbsUp} 
                      onClick={() => handleUpvote(post.id)}
                    >
                      Bermanfaat ({post.upvotesCount})
                    </Button>

                    {!thread.isLocked && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={Reply} 
                        onClick={() => setReplyingToPostId(replyingToPostId === post.id ? null : post.id)}
                      >
                        Balas
                      </Button>
                    )}
                  </div>

                  {/* Inline nested reply form */}
                  {replyingToPostId === post.id && (
                    <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      <textarea
                        className="form-textarea"
                        rows={2}
                        placeholder={`Balas tanggapan ${post.authorName}...`}
                        value={nestedContent}
                        onChange={(e) => setNestedContent(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setReplyingToPostId(null)}>
                          {KAMUS_UI.BATAL}
                        </Button>
                        <Button variant="primary" size="sm" icon={Send} onClick={() => handleSendNestedReply(post.id)}>
                          Kirim Balasan
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Nested Replies Level */}
                  {post.replies && post.replies.length > 0 && (
                    <div className="flex flex-col gap-2" style={{ marginTop: 'var(--space-3)', paddingLeft: 'var(--space-4)', borderLeft: '2px solid var(--color-primary-200)' }}>
                      {post.replies.map((child) => (
                        <div key={child.id} style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
                          <div className="flex justify-between items-center" style={{ marginBottom: '2px' }}>
                            <strong>{child.authorName}</strong>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                              {new Date(child.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {child.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })
        )}
      </div>

      {/* Main Reply Box at Bottom */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <CardTitle>Tulis Tanggapan Anda</CardTitle>
            <Badge variant="primary" style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '10px' }}>
              <Sparkles size={11} /> Poin Keaktifan Diskusi Aktif
            </Badge>
          </div>
        </CardHeader>
        <CardBody>
          {thread.isLocked ? (
            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning-main)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Lock size={16} />
              <span>Topik diskusi ini telah dikunci oleh dosen pengampu. Tanggapan baru tidak diizinkan.</span>
            </div>
          ) : (
            <form onSubmit={handleSendMainReply} className="flex flex-col gap-3">
              {/* Quick Academic & Arabic Snippets Toolbar */}
              <div className="flex items-center gap-1.5 flex-wrap bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-500 font-semibold px-1 text-[11px]">Bantuan Format:</span>
                <button
                  type="button"
                  onClick={() => setReplyContent(prev => `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\n${prev}`)}
                  className="px-2 py-1 rounded bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 transition-all font-serif"
                >
                  ﷽ Bismillah
                </button>
                <button
                  type="button"
                  onClick={() => setReplyContent(prev => `${prev}\n\n> « [Tuliskan Teks Matan/Ayat Arab di Sini] »\n> *Artinya: ...*\n\n`)}
                  className="px-2 py-1 rounded bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 transition-all"
                >
                  📖 Kutipan Dalil/Matan
                </button>
                <button
                  type="button"
                  onClick={() => setReplyContent(prev => `${prev}\n\n*Kaidah Fiqhiyyah:* الْأُمُورُ بِمَقَاصِدِهَا (Segala perkara bergantung pada tujuannya).\n\n`)}
                  className="px-2 py-1 rounded bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 transition-all"
                >
                  ⚖️ Kaidah Fiqh
                </button>
                <button
                  type="button"
                  onClick={() => setReplyContent(prev => `${prev}\n\n**Analisis CPMK & Relevansi Kontemporer:**\n1. ...\n2. ...\n`)}
                  className="px-2 py-1 rounded bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 transition-all"
                >
                  💡 Poin Analisis
                </button>
              </div>

              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Tuliskan argumen, analisis, atau pertanyaan ilmiah Anda secara santun dan terstruktur..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
              />

              <div className="flex justify-between items-center">
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Partisipasi aktif Anda akan otomatis tercatat dalam rekam jejak aktivitas belajar & sinkron ke SIAKAD.
                </span>

                <Button variant="primary" type="submit" icon={Send} isLoading={isSubmitting} style={{ backgroundColor: '#059669' }}>
                  {KAMUS_UI.KIRIM_BALASAN}
                </Button>
              </div>
            </form>
          )}
        </CardBody>
      </Card>

      {/* MODAL: Sembunyikan Komentar (Moderasi) */}
      <Modal
        isOpen={!!hidingPostId}
        onClose={() => setHidingPostId(null)}
        title="Moderasi Dosen: Sembunyikan Komentar"
        maxWidth="500px"
      >
        <form onSubmit={handleHidePost} className="flex flex-col gap-4">
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Komentar yang disembunyikan tidak akan dapat dibaca oleh mahasiswa lain dan digantikan dengan label sensor.
          </p>

          <div className="form-group">
            <label className="form-label">Alasan Moderasi:</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Contoh: Mengandung kata-kata tidak pantas / keluar dari topik materi..."
              value={hideReason}
              onChange={(e) => setHideReason(e.target.value)}
              required
            />
          </div>

          <div className="modal-footer" style={{ margin: '0 calc(-1 * var(--space-5)) calc(-1 * var(--space-5))' }}>
            <Button variant="secondary" type="button" onClick={() => setHidingPostId(null)}>
              {KAMUS_UI.BATAL}
            </Button>
            <Button variant="danger" type="submit">
              Sembunyikan Komentar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
