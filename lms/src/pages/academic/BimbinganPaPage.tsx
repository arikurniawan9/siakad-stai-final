import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Search, 
  MessageSquare, 
  Printer, 
  TrendingUp, 
  Check, 
  X, 
  Send, 
  Unlock, 
  Eye, 
  Award
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { 
  AdviseeKrsOverview, 
  KrsAdvisorStats, 
  StudentKrsData, 
  KrsConsultationMessage,
  KrsStatus
} from '../../types/krs';
import { krsService } from '../../services/krsService';
import { ExportDropdown, ExportConfig } from '../../components/export-import';

type BimbinganTabView = 'roster_krs' | 'consultation_center' | 'recap_summary';
type StatusFilter = 'SEMUA' | 'MENUNGGU_PERSETUJUAN' | 'DISETUJUI' | 'DITOLAK_REVISI' | 'DRAF';

export const BimbinganPaPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const advisorId = user?.id || 'usr-dsn-01';
  const [activeTab, setActiveTab] = useState<BimbinganTabView>('roster_krs');
  const [stats, setStats] = useState<KrsAdvisorStats | null>(() => {
    return krsService.getAdvisorStats(advisorId);
  });
  const [advisees, setAdvisees] = useState<AdviseeKrsOverview[]>(() => {
    return krsService.getAdviseesKrsOverview(advisorId);
  });
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('SEMUA');
  const [semesterFilter, setSemesterFilter] = useState<string>('SEMUA');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Verification Modal State
  const [selectedStudentForReview, setSelectedStudentForReview] = useState<StudentKrsData | null>(null);
  const [advisorNotesInput, setAdvisorNotesInput] = useState<string>('');
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'UNLOCK' | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  // Chat State
  const [selectedChatStudentId, setSelectedChatStudentId] = useState<string>('usr-mhs-01');
  const [chatMessages, setChatMessages] = useState<KrsConsultationMessage[]>([]);
  const [chatInputText, setChatInputText] = useState<string>('');

  // Print Preview
  const [printKrsModalData, setPrintKrsModalData] = useState<StudentKrsData | null>(null);

  // Load Advisees Data
  const loadAdviseesData = useCallback(() => {
    const list = krsService.getAdviseesKrsOverview(advisorId);
    const summary = krsService.getAdvisorStats(advisorId);
    setAdvisees(list);
    setStats(summary);
  }, [advisorId]);

  useEffect(() => {
    loadAdviseesData();
  }, [loadAdviseesData]);

  // Load Chat for selected student
  const loadChat = useCallback((studentId: string) => {
    const msgs = krsService.getConsultationMessages(studentId);
    setChatMessages(msgs);
    krsService.markMessagesAsRead(studentId, 'DOSEN_PA');
  }, []);

  useEffect(() => {
    if (selectedChatStudentId) {
      loadChat(selectedChatStudentId);
    }
  }, [selectedChatStudentId, loadChat]);

  // Auto reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, semesterFilter]);

  // Filter Advisees
  const filteredAdvisees = useMemo(() => {
    return advisees.filter(a => {
      const matchSearch = 
        a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.studentNim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.studyProgram.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (statusFilter !== 'SEMUA' && a.krsStatus !== statusFilter) return false;
      if (semesterFilter !== 'SEMUA' && a.semesterNumber.toString() !== semesterFilter) return false;

      return true;
    });
  }, [advisees, searchQuery, statusFilter, semesterFilter]);

  // Paginated Advisees
  const totalPages = Math.ceil(filteredAdvisees.length / pageSize) || 1;
  const paginatedAdvisees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAdvisees.slice(start, start + pageSize);
  }, [filteredAdvisees, currentPage, pageSize]);

  // Open Review Detail
  const handleOpenReview = (studentId: string) => {
    const fullStudentData = krsService.getStudentKrs(studentId);
    setSelectedStudentForReview(fullStudentData);
    setAdvisorNotesInput(fullStudentData.academicAdvisorNotes || '');
  };

  // Open Chat tab for student
  const handleOpenChatForStudent = (studentId: string) => {
    setSelectedChatStudentId(studentId);
    setActiveTab('consultation_center');
  };

  // Open Print Modal
  const handleOpenPrintPreview = (studentId: string) => {
    const fullStudentData = krsService.getStudentKrs(studentId);
    setPrintKrsModalData(fullStudentData);
  };

  // Trigger Action Modal (Setujui / Revisi / Buka Kunci)
  const handleTriggerAction = (type: 'APPROVE' | 'REJECT' | 'UNLOCK') => {
    setActionType(type);
    if (type === 'APPROVE') {
      setAdvisorNotesInput('KRS telah diverifikasi dan disetujui sesuai kurikulum STAI Al-Ittihad.');
    } else if (type === 'REJECT') {
      setAdvisorNotesInput('');
    } else if (type === 'UNLOCK') {
      setAdvisorNotesInput('Pembukaan kunci pengisian KRS atas permohonan penyesuaian mata kuliah.');
    }
    setConfirmModalOpen(true);
  };

  // Execute Action
  const handleExecuteAction = () => {
    if (!selectedStudentForReview || !actionType) return;

    if (actionType === 'APPROVE') {
      const res = krsService.approveAdviseeKrs(advisorId, selectedStudentForReview.studentId, advisorNotesInput);
      if (res.success) {
        toast.success('KRS Disetujui', res.message);
        setConfirmModalOpen(false);
        setSelectedStudentForReview(res.krs || null);
        loadAdviseesData();
      } else {
        toast.danger('Gagal Menyetujui', res.message);
      }
    } else if (actionType === 'REJECT') {
      if (!advisorNotesInput.trim()) {
        toast.warning('Catatan Revisi Wajib Diisi', 'Harap berikan instruksi perbaikan yang jelas untuk mahasiswa.');
        return;
      }
      const res = krsService.rejectAdviseeKrs(advisorId, selectedStudentForReview.studentId, advisorNotesInput);
      if (res.success) {
        toast.warning('Permintaan Revisi Terkirim', res.message);
        setConfirmModalOpen(false);
        setSelectedStudentForReview(res.krs || null);
        loadAdviseesData();
      } else {
        toast.danger('Gagal Meminta Revisi', res.message);
      }
    } else if (actionType === 'UNLOCK') {
      const res = krsService.unlockAdviseeKrs(advisorId, selectedStudentForReview.studentId, advisorNotesInput);
      if (res.success) {
        toast.info('Kunci KRS Dibuka', res.message);
        setConfirmModalOpen(false);
        setSelectedStudentForReview(res.krs || null);
        loadAdviseesData();
      } else {
        toast.danger('Gagal Membuka Kunci', res.message);
      }
    }
  };

  // Send Chat Message
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !selectedChatStudentId) return;

    const advisorName = user?.name || 'Dr. H. M. Ridwan, M.Ag';
    const updated = krsService.sendConsultationMessage(
      selectedChatStudentId,
      advisorId,
      advisorName,
      'DOSEN_PA',
      chatInputText
    );
    setChatMessages(updated);
    setChatInputText('');
    toast.success('Pesan Terkirim', 'Pesan bimbingan telah diteruskan ke mahasiswa.');
    loadAdviseesData();
  };

  // Quick Reply Snippets
  const handleQuickReply = (text: string) => {
    setChatInputText(text);
  };

  const getStatusBadge = (status: KrsStatus) => {
    switch (status) {
      case 'DISETUJUI':
        return <Badge variant="success">Disetujui</Badge>;
      case 'MENUNGGU_PERSETUJUAN':
        return <Badge variant="warning">Menunggu Verifikasi</Badge>;
      case 'DITOLAK_REVISI':
        return <Badge variant="danger">Perlu Revisi</Badge>;
      default:
        return <Badge variant="default">Draf</Badge>;
    }
  };

  // Export Config
  const adviseeExportConfig: ExportConfig<AdviseeKrsOverview> = useMemo(() => ({
    filename: `SALAM_Rekap_Bimbingan_PA_${new Date().toISOString().slice(0, 10)}`,
    title: 'REKAPITULASI BIMBINGAN AKADEMIK & KRS MAHASISWA',
    subtitle: `Dosen Wali: ${user?.name || 'Dr. H. M. Ridwan, M.Ag'} | Periode: Semester Ganjil 2026/2027`,
    data: filteredAdvisees,
    columns: [
      { key: 'studentNim', header: 'NIM', width: '110px' },
      { key: 'studentName', header: 'Nama Mahasiswa', width: '220px' },
      { key: 'studyProgram', header: 'Program Studi', width: '160px' },
      { key: 'semesterNumber', header: 'Semester', width: '70px', align: 'center' },
      { key: 'previousSemesterGpa', header: 'IPS Lalu', width: '80px', align: 'center' },
      { key: 'maxCreditQuota', header: 'Batas SKS', width: '80px', align: 'center' },
      { key: 'totalCreditsTaken', header: 'SKS Diambil', width: '90px', align: 'center' },
      { key: 'krsStatus', header: 'Status KRS', width: '130px', align: 'center' },
      { key: 'submissionDate', header: 'Waktu Pengajuan', width: '140px' }
    ],
    metadata: {
      'Dosen Pembimbing Akademik': user?.name || 'Dr. H. M. Ridwan, M.Ag',
      'Total Mahasiswa Bimbingan': `${advisees.length} Mahasiswa`,
      'Menunggu Verifikasi': `${stats?.pendingApproval || 0} Mahasiswa`,
      'Sudah Disetujui': `${stats?.approved || 0} Mahasiswa`,
      'Waktu Unduh': new Date().toLocaleString('id-ID')
    }
  }), [filteredAdvisees, advisees, stats, user]);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 'var(--space-1)' }}>
            <Badge variant="primary">Semester Ganjil 2026/2027</Badge>
            <Badge variant="default">Dosen Wali / PA</Badge>
            {stats && stats.pendingApproval > 0 && (
              <Badge variant="warning">{stats.pendingApproval} Perlu Verifikasi Segera</Badge>
            )}
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--text-primary)' }}>
            Persetujuan KRS &amp; Bimbingan Akademik
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Verifikasi rencana studi mahasiswa bimbingan, kontrol beban SKS, audit bentrok jadwal, dan bimbingan konseling daring.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <ExportDropdown 
            config={adviseeExportConfig} 
            buttonLabel="Ekspor Rekap Bimbingan" 
          />
        </div>
      </div>

      {/* 2. Executive Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Advisees */}
        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  TOTAL MHS BIMBINGAN
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {stats?.totalAdvisees || 0}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Mahasiswa Aktif
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', marginTop: '6px' }}>
                  <TrendingUp size={13} />
                  <span>Rata-Rata Beban: {stats?.totalCreditsAverage || 0} SKS</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-primary-50)', 
                  color: 'var(--color-primary-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Users size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Pending Approval */}
        <Card style={{ border: stats && stats.pendingApproval > 0 ? '1.5px solid #fde047' : undefined }}>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'bold', color: '#854d0e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  MENUNGGU PERSETUJUAN
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: '#854d0e', marginTop: '4px' }}>
                  {stats?.pendingApproval || 0}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: '#a16207', marginLeft: '6px' }}>
                    Antrean Verifikasi
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: '#a16207', marginTop: '6px' }}>
                  <Clock size={13} />
                  <span>Perlu Tindakan Dosen PA</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: '#fef9c3', 
                  color: '#854d0e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Clock size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Approved */}
        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'bold', color: 'var(--color-success-text)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  KRS TELAH DISAHKAN
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--color-success-text)', marginTop: '4px' }}>
                  {stats?.approved || 0}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--color-success-text)', marginLeft: '6px' }}>
                    / {stats?.totalAdvisees || 0} Mhs
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-success-text)', marginTop: '6px' }}>
                  <CheckCircle2 size={13} />
                  <span>Terkunci &amp; Terdaftar di Kelas</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-success-surface)', 
                  color: 'var(--color-success-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CheckCircle2 size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Needs Revision / Draft */}
        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  REVISI &amp; DRAF
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {(stats?.revisionNeeded || 0) + (stats?.draftCount || 0)}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    ({stats?.revisionNeeded || 0} Revisi, {stats?.draftCount || 0} Draf)
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: '#dc2626', marginTop: '6px' }}>
                  <AlertCircle size={13} />
                  <span>Belum Mengajukan Final</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: '#fee2e2', 
                  color: '#b91c1c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <AlertCircle size={22} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="tabs-nav-container">
        <button
          className={`btn ${activeTab === 'roster_krs' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('roster_krs')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none', whiteSpace: 'nowrap' }}
        >
          <FileText size={16} />
          <span>Verifikasi KRS Mahasiswa ({advisees.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'consultation_center' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('consultation_center')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none', whiteSpace: 'nowrap' }}
        >
          <MessageSquare size={16} />
          <span>Pusat Konsultasi &amp; Bimbingan Chat</span>
        </button>

        <button
          className={`btn ${activeTab === 'recap_summary' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('recap_summary')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none', whiteSpace: 'nowrap' }}
        >
          <Award size={16} />
          <span>Rekapitulasi &amp; Distribusi Beban SKS</span>
        </button>
      </div>

      {/* 4. Tab 1: Verifikasi KRS Mahasiswa */}
      {activeTab === 'roster_krs' && (
        <div className="flex flex-col gap-4">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
              {(['SEMUA', 'MENUNGGU_PERSETUJUAN', 'DISETUJUI', 'DITOLAK_REVISI', 'DRAF'] as StatusFilter[]).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: 'var(--radius-full)', minHeight: '30px', padding: '3px 12px', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}
                >
                  {st === 'SEMUA' ? 'Semua Status' : st === 'MENUNGGU_PERSETUJUAN' ? 'Menunggu Verifikasi' : st === 'DISETUJUI' ? 'Disetujui' : st === 'DITOLAK_REVISI' ? 'Perlu Revisi' : 'Draf'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2" style={{ width: '100%', maxWidth: '360px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Input 
                  placeholder="Cari NIM atau Nama Mahasiswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '32px', minHeight: '34px', fontSize: 'var(--text-xs)' }}
                />
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              </div>

              {(searchQuery || statusFilter !== 'SEMUA' || semesterFilter !== 'SEMUA') && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={X} 
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('SEMUA');
                    setSemesterFilter('SEMUA');
                  }}
                  title="Reset Filter"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Roster Table */}
          <Card>
            <CardBody style={{ padding: 0 }}>
              <div className="table-container" style={{ border: 'none', margin: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '45px', textAlign: 'center' }}>No</th>
                      <th style={{ width: '110px' }}>NIM</th>
                      <th>Nama Mahasiswa</th>
                      <th style={{ width: '140px' }}>Prodi &amp; Smt</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>IPS Lalu</th>
                      <th style={{ width: '110px', textAlign: 'center' }}>Beban SKS</th>
                      <th style={{ width: '140px', textAlign: 'center' }}>Status KRS</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Peringatan</th>
                      <th style={{ width: '160px', textAlign: 'center' }}>Aksi Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAdvisees.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                          <Users size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                          <div>Tidak ada mahasiswa bimbingan yang sesuai dengan filter.</div>
                        </td>
                      </tr>
                    ) : (
                      paginatedAdvisees.map((adv, idx) => {
                        const isPending = adv.krsStatus === 'MENUNGGU_PERSETUJUAN';
                        const isExceed = adv.totalCreditsTaken > adv.maxCreditQuota;

                        return (
                          <tr key={adv.studentId} style={{ backgroundColor: isPending ? '#fffbeb' : undefined }}>
                            <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                              {(currentPage - 1) * pageSize + idx + 1}
                            </td>
                            <td>
                              <Badge variant="primary" style={{ fontFamily: 'var(--font-mono)' }}>
                                {adv.studentNim}
                              </Badge>
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <div>
                                  <strong style={{ color: 'var(--text-primary)' }}>{adv.studentName}</strong>
                                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                                    IPK: {adv.cumulativeGpa.toFixed(2)} • {adv.courseCount} MK
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ fontSize: 'var(--text-xs)' }}>
                              <div>{adv.studyProgram}</div>
                              <div style={{ color: 'var(--text-muted)' }}>Semester {adv.semesterNumber}</div>
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                              {adv.previousSemesterGpa.toFixed(2)}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <strong style={{ color: isExceed ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                                {adv.totalCreditsTaken}
                              </strong>
                              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                /{adv.maxCreditQuota} SKS
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {getStatusBadge(adv.krsStatus)}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {adv.hasScheduleConflict && (
                                <Badge variant="danger" title="Terdapat bentrok jadwal kuliah">
                                  ⚠️ Bentrok
                                </Badge>
                              )}
                              {isExceed && (
                                <Badge variant="danger" title="Melebihi kuota beban SKS">
                                  ⚠️ Over SKS
                                </Badge>
                              )}
                              {!adv.hasScheduleConflict && !isExceed && (
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-dark)' }}>
                                  ✓ Valid
                                </span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant={isPending ? 'primary' : 'secondary'}
                                  size="sm"
                                  icon={Eye}
                                  onClick={() => handleOpenReview(adv.studentId)}
                                  title="Review & Verifikasi Rencana Studi"
                                  style={{ minHeight: '28px', padding: '2px 8px', fontSize: '0.6875rem' }}
                                >
                                  {isPending ? 'Verifikasi' : 'Detail'}
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={MessageSquare}
                                  onClick={() => handleOpenChatForStudent(adv.studentId)}
                                  title="Bimbingan & Chat Mahasiswa"
                                  style={{ minHeight: '28px', padding: '2px 6px', color: 'var(--color-primary-800)' }}
                                >
                                  Chat
                                </Button>

                                {adv.krsStatus === 'DISETUJUI' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={Printer}
                                    onClick={() => handleOpenPrintPreview(adv.studentId)}
                                    title="Cetak Lembar KRS Mahasiswa"
                                    style={{ minHeight: '28px', padding: '2px 6px' }}
                                  >
                                    Cetak
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody style={{ padding: 'var(--space-2) var(--space-4)' }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredAdvisees.length}
                pageSize={pageSize}
                pageSizeOptions={[3, 6, 12, 24]}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemLabel="mahasiswa"
              />
            </CardBody>
          </Card>
        </div>
      )}

      {/* 5. Tab 2: Pusat Konsultasi & Bimbingan Chat */}
      {activeTab === 'consultation_center' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Advisees Chat List */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Daftar Mahasiswa Bimbingan</CardTitle>
                <CardSubtitle>Pilih mahasiswa untuk membuka kanal konsultasi</CardSubtitle>
              </div>
            </CardHeader>
            <CardBody style={{ padding: 'var(--space-2)' }}>
              <div className="flex flex-col gap-1" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {advisees.map(a => {
                  const isSelected = a.studentId === selectedChatStudentId;

                  return (
                    <div
                      key={a.studentId}
                      onClick={() => setSelectedChatStudentId(a.studentId)}
                      style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'var(--color-primary-50)' : 'transparent',
                        border: isSelected ? '1px solid var(--color-primary-200)' : '1px solid transparent',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <strong style={{ fontSize: 'var(--text-xs)', color: isSelected ? 'var(--color-primary-950)' : 'var(--text-primary)' }}>
                          {a.studentName}
                        </strong>
                        {getStatusBadge(a.krsStatus)}
                      </div>
                      <div className="flex justify-between items-center" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <span>NIM: {a.studentNim}</span>
                        <span>Smt {a.semesterNumber} • {a.totalCreditsTaken} SKS</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Right: Active Chat Room */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center w-full">
                  <div>
                    <CardTitle>
                      Konsultasi Bimbingan: {advisees.find(a => a.studentId === selectedChatStudentId)?.studentName || 'Mahasiswa'}
                    </CardTitle>
                    <CardSubtitle>
                      NIM: {advisees.find(a => a.studentId === selectedChatStudentId)?.studentNim} • Semester {advisees.find(a => a.studentId === selectedChatStudentId)?.semesterNumber}
                    </CardSubtitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => handleOpenReview(selectedChatStudentId)}
                  >
                    Periksa KRS
                  </Button>
                </div>
              </CardHeader>

              <CardBody className="flex flex-col gap-4">
                {/* Messages Stream */}
                <div className="flex flex-col gap-3" style={{ minHeight: '260px', maxHeight: '360px', overflowY: 'auto' }}>
                  {chatMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                      Belum ada percakapan dengan mahasiswa ini. Tulis pesan bimbingan di bawah.
                    </div>
                  ) : (
                    chatMessages.map(m => {
                      const isMe = m.senderRole === 'DOSEN_PA';

                      return (
                        <div
                          key={m.id}
                          style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            padding: 'var(--space-3) var(--space-4)',
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: isMe ? 'var(--color-primary-100)' : 'var(--color-slate-100)',
                            border: isMe ? '1px solid var(--color-primary-300)' : '1px solid var(--border-default)'
                          }}
                        >
                          <div className="flex justify-between items-center gap-3" style={{ marginBottom: '4px' }}>
                            <strong style={{ fontSize: 'var(--text-xs)', color: isMe ? 'var(--color-primary-950)' : 'var(--text-primary)' }}>
                              {m.senderName} ({isMe ? 'Dosen PA' : 'Mahasiswa'})
                            </strong>
                            <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                              {new Date(m.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                            </span>
                          </div>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                            {m.message}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Reply Suggestions */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Balasan Cepat:</span>
                  {[
                    'Wa’alaikumsalam. Rencana studi Anda telah saya periksa dan memenuhi syarat kurikulum.',
                    'Harap perhatikan batas kuota SKS Anda dan kurangi 1 mata kuliah pilihan.',
                    'Silakan temui saya pada jam bimbingan tatap muka hari Senin/Kamis di Ruang Dosen.'
                  ].map((quick, qIdx) => (
                    <button
                      key={qIdx}
                      type="button"
                      onClick={() => handleQuickReply(quick)}
                      style={{
                        padding: '2px 8px',
                        fontSize: '0.6875rem',
                        backgroundColor: 'var(--color-slate-100)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-full)',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                      }}
                    >
                      {quick.slice(0, 35)}...
                    </button>
                  ))}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendChatMessage} className="flex gap-2">
                  <Input
                    placeholder="Tulis pesan bimbingan / arahan akademik kepada mahasiswa..."
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    icon={Send}
                    disabled={!chatInputText.trim()}
                  >
                    Kirim
                  </Button>
                </form>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Rekapitulasi & Distribusi SKS */}
      {activeTab === 'recap_summary' && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Distribusi Mahasiswa Bimbingan per Angkatan &amp; Status</CardTitle>
                <CardSubtitle>Pemantauan beban SKS, IPS semester lalu, dan kelancaran studi mahasiswa</CardSubtitle>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Angkatan 2024 (Semester 5)</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
                    {advisees.filter(a => a.semesterNumber === 5).length} Mahasiswa
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-primary-800)', marginTop: '4px' }}>
                    Rata-rata 22.0 SKS • Fokus PPL &amp; Metodologi Penelitian
                  </div>
                </div>

                <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Angkatan 2025 (Semester 3)</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
                    {advisees.filter(a => a.semesterNumber === 3).length} Mahasiswa
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-primary-800)', marginTop: '4px' }}>
                    Rata-rata 20.5 SKS • Pemenuhan Mata Kuliah Keahlian Prodi
                  </div>
                </div>

                <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Angkatan 2026 (Semester 1)</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
                    {advisees.filter(a => a.semesterNumber === 1).length} Mahasiswa
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-primary-800)', marginTop: '4px' }}>
                    Paket 20 SKS • Mata Kuliah Wajib Institusi &amp; Dasar
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: REVIEW & VERIFIKASI DETAIL KRS MAHASISWA
          ========================================================================= */}
      {selectedStudentForReview && (
        <Modal
          isOpen={Boolean(selectedStudentForReview)}
          onClose={() => setSelectedStudentForReview(null)}
          title={`Verifikasi Rencana Studi: ${selectedStudentForReview.studentName} (${selectedStudentForReview.studentNim})`}
          maxWidth="900px"
          footer={
            <div className="flex justify-between items-center w-full flex-wrap gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setSelectedStudentForReview(null)}
              >
                Tutup
              </Button>

              <div className="flex gap-2">
                {selectedStudentForReview.krsStatus === 'DISETUJUI' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Unlock}
                    onClick={() => handleTriggerAction('UNLOCK')}
                  >
                    Buka Kunci Revisi
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={X}
                      onClick={() => handleTriggerAction('REJECT')}
                    >
                      Minta Revisi
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Check}
                      onClick={() => handleTriggerAction('APPROVE')}
                    >
                      Setujui &amp; Sahkan KRS
                    </Button>
                  </>
                )}
              </div>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            {/* Student Academic Info Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Status KRS:</span>
                <div>{getStatusBadge(selectedStudentForReview.krsStatus)}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>IPS Semester Lalu:</span>
                <div style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>
                  {selectedStudentForReview.previousSemesterGpa.toFixed(2)}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Beban / Kuota SKS:</span>
                <div style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)', color: selectedStudentForReview.totalCreditsTaken > selectedStudentForReview.maxCreditQuota ? 'var(--color-danger)' : 'var(--color-primary-800)' }}>
                  {selectedStudentForReview.totalCreditsTaken} / {selectedStudentForReview.maxCreditQuota} SKS
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>SKS Kumulatif:</span>
                <div style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>
                  {selectedStudentForReview.totalCumulativeCreditsEarned} / 144 SKS
                </div>
              </div>
            </div>

            {/* Conflict Warnings */}
            {selectedStudentForReview.courses.some(c => !!c.scheduleConflictWith) && (
              <div style={{ padding: 'var(--space-3)', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: '#9f1239' }}>
                <strong>⚠️ Peringatan Jadwal Bentrok Terdeteksi:</strong> Terdapat mata kuliah yang bertabrakan pada jam perkuliahan yang sama. Sebaiknya minta mahasiswa merevisi pilihan kelas sebelum disetujui.
              </div>
            )}

            {/* Courses Table */}
            <div className="table-container" style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>No</th>
                    <th style={{ width: '90px' }}>Kode</th>
                    <th>Nama Mata Kuliah</th>
                    <th style={{ width: '55px', textAlign: 'center' }}>SKS</th>
                    <th>Hari &amp; Jam</th>
                    <th>Ruang</th>
                    <th>Dosen Pengampu</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudentForReview.courses.map((c, idx) => (
                    <tr key={c.id} style={{ backgroundColor: c.scheduleConflictWith ? '#fff1f2' : undefined }}>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td>
                        <Badge variant={c.scheduleConflictWith ? 'danger' : 'primary'} style={{ fontFamily: 'var(--font-mono)' }}>
                          {c.courseCode}
                        </Badge>
                      </td>
                      <td>
                        <strong>{c.courseName}</strong>
                        {c.scheduleConflictWith && (
                          <div style={{ fontSize: '0.6875rem', color: '#be123c' }}>
                            Bentrok dengan: {c.scheduleConflictWith}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{c.credits}</td>
                      <td style={{ fontSize: 'var(--text-xs)' }}>{c.dayOfWeek}, {c.startTime}-{c.endTime}</td>
                      <td style={{ fontSize: 'var(--text-xs)' }}>{c.roomName}</td>
                      <td style={{ fontSize: 'var(--text-xs)' }}>{c.lecturerName}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: 'var(--color-slate-50)', fontWeight: 'bold' }}>
                    <td colSpan={3} style={{ textAlign: 'right', padding: '6px 8px' }}>Total SKS:</td>
                    <td style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--color-primary-800)' }}>
                      {selectedStudentForReview.totalCreditsTaken} SKS
                    </td>
                    <td colSpan={3} style={{ padding: '6px 8px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {selectedStudentForReview.courses.length} Mata Kuliah Terdaftar
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Advisor Notes Area */}
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                Catatan Dosen Pembimbing Akademik:
              </label>
              <Input
                value={advisorNotesInput}
                onChange={(e) => setAdvisorNotesInput(e.target.value)}
                placeholder="Tuliskan catatan arahan, apresiasi, atau instruksi perbaikan untuk mahasiswa..."
                style={{ marginTop: '4px' }}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 2: KONFIRMASI TINDAKAN (SETUJUI / REVISI / UNLOCK)
          ========================================================================= */}
      {confirmModalOpen && (
        <Modal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          title={
            actionType === 'APPROVE' 
              ? 'Konfirmasi Pengesahan KRS' 
              : actionType === 'REJECT' 
              ? 'Konfirmasi Permintaan Revisi KRS' 
              : 'Konfirmasi Buka Kunci KRS'
          }
          maxWidth="480px"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setConfirmModalOpen(false)}
              >
                Batal
              </Button>
              <Button 
                variant={actionType === 'APPROVE' ? 'primary' : actionType === 'REJECT' ? 'danger' : 'outline'} 
                size="sm" 
                onClick={handleExecuteAction}
              >
                {actionType === 'APPROVE' ? 'Ya, Sahkan KRS' : actionType === 'REJECT' ? 'Kirim Revisi' : 'Buka Kunci'}
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-3 text-xs">
            <p style={{ margin: 0 }}>
              {actionType === 'APPROVE' && (
                <>Apakah Anda yakin ingin menyetujui dan mengesahkan Kartu Rencana Studi mahasiswa <strong>{selectedStudentForReview?.studentName}</strong> ({selectedStudentForReview?.totalCreditsTaken} SKS)? KRS akan terkunci dan mahasiswa resmi terdaftar di kelas perkuliahan.</>
              )}
              {actionType === 'REJECT' && (
                <>Apakah Anda yakin ingin meminta revisi rencana studi kepada mahasiswa <strong>{selectedStudentForReview?.studentName}</strong>? Status KRS akan berubah menjadi <em>Perlu Revisi</em>.</>
              )}
              {actionType === 'UNLOCK' && (
                <>Apakah Anda yakin ingin membuka kunci KRS mahasiswa <strong>{selectedStudentForReview?.studentName}</strong> agar dapat menambah/membatalkan mata kuliah?</>
              )}
            </p>
            {advisorNotesInput && (
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
                <strong>Catatan yang akan dikirimkan:</strong>
                <div style={{ marginTop: '2px', color: 'var(--text-secondary)' }}>"{advisorNotesInput}"</div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 3: CETAK LEMBAR KRS RESMI MAHASISWA
          ========================================================================= */}
      {printKrsModalData && (
        <Modal
          isOpen={Boolean(printKrsModalData)}
          onClose={() => setPrintKrsModalData(null)}
          title="Pratinjau Cetak Lembar KRS Mahasiswa"
          maxWidth="840px"
          footer={
            <div className="flex justify-between items-center w-full">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setPrintKrsModalData(null)}
              >
                Tutup
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                icon={Printer}
                onClick={() => window.print()}
              >
                Cetak Lembar KRS (Print / PDF)
              </Button>
            </div>
          }
        >
          <div 
            style={{ 
              backgroundColor: 'white', 
              padding: 'var(--space-6)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-default)',
              fontFamily: 'serif' 
            }}
          >
            {/* Kop Surat */}
            <div style={{ textAlign: 'center', borderBottom: '3px double #0f172a', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                Jl. Raya Bandung KM. 03, Bojong, Karangtengah, Cianjur, Jawa Barat 43281
              </div>
            </div>

            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', textDecoration: 'underline' }}>
                KARTU RENCANA STUDI (KRS)
              </div>
              <div style={{ fontSize: '0.75rem', color: '#334155' }}>
                SEMESTER GANJIL TAHUN AKADEMIK 2026/2027
              </div>
            </div>

            {/* Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', marginBottom: 'var(--space-4)' }}>
              <div>
                <div><strong>Nama:</strong> {printKrsModalData.studentName}</div>
                <div><strong>NIM:</strong> {printKrsModalData.studentNim}</div>
                <div><strong>Prodi:</strong> {printKrsModalData.studyProgram}</div>
              </div>
              <div>
                <div><strong>Semester:</strong> {printKrsModalData.semesterNumber} (Ganjil)</div>
                <div><strong>Total SKS:</strong> {printKrsModalData.totalCreditsTaken} SKS</div>
                <div><strong>Dosen Wali:</strong> {printKrsModalData.academicAdvisorName}</div>
              </div>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.6875rem', marginBottom: 'var(--space-6)' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #0f172a', borderTop: '1px solid #0f172a' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'center' }}>No</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Kode</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Nama Mata Kuliah</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center' }}>SKS</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Hari &amp; Jam</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Dosen</th>
                </tr>
              </thead>
              <tbody>
                {printKrsModalData.courses.map((c, idx) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ padding: '6px 8px' }}><strong>{c.courseCode}</strong></td>
                    <td style={{ padding: '6px 8px' }}>{c.courseName}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>{c.credits}</td>
                    <td style={{ padding: '6px 8px' }}>{c.dayOfWeek}, {c.startTime}-{c.endTime}</td>
                    <td style={{ padding: '6px 8px' }}>{c.lecturerName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
};
