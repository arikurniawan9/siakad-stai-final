import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  ArrowRight, 
  Clock, 
  Search, 
  X, 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { AcademicClass } from '../../types/academic';
import { academicService } from '../../services/academicService';
import { useAuth } from '../../context/AuthContext';
import { KAMUS_UI } from '../../constants/dictionary';
import { PremiumSelect, PremiumSelectOption } from '../../components/ui/PremiumSelect';

export interface MataKuliahListPageProps {
  onSelectClass: (classId: string) => void;
}

export const MataKuliahListPage: React.FC<MataKuliahListPageProps> = ({ onSelectClass }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProdi, setFilterProdi] = useState('');
  const [filterClassId, setFilterClassId] = useState('');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'code_asc' | 'credits_desc' | 'students_desc'>('name_asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  useEffect(() => {
    // Ambil kelas aktif dari cache/service
    const allClasses = academicService.getClasses();
    setClasses(allClasses);

    // Muat data kelas riil terkini dari database SIAKAD via backend
    academicService.fetchClassesFromBackend().then((fresh) => {
      if (fresh && fresh.length > 0) {
        setClasses(fresh);
      }
    });
  }, []);

  const isStudent = user?.role === 'mahasiswa';
  const isLecturer = user?.role === 'dosen' || user?.role === 'dosen_pa';

  // Filter kelas berdasarkan peran pengguna
  const roleFilteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      if (isLecturer && user) {
        // Dosen melihat kelas yang diampunya
        const userNidn = (user.identityNumber || '').replace(/[^0-9]/g, '');
        const clsNidn = (cls.lecturerNidn || '').replace(/[^0-9]/g, '');
        return (
          (clsNidn && userNidn && clsNidn === userNidn) ||
          cls.lecturerId === user.id ||
          cls.lecturerNidn === user.identityNumber ||
          cls.lecturerName.toLowerCase().includes(user.name.toLowerCase())
        );
      }
      if (isStudent && user) {
        // Mahasiswa melihat kelas yang diambilnya sesuai KRS / SIAKAD
        const userNim = (user.identityNumber || user.username || '').replace(/[^0-9]/g, '');
        return academicService.isStudentEnrolledInClass(cls.id, userNim, user.id);
      }
      return true; // Admin Akademik, Kaprodi, Pimpinan, dan Superadmin melihat semua kelas
    });
  }, [classes, isLecturer, isStudent, user]);

  // Program studi dinamis sesuai kelas yang diampu / diikuti
  const availableProdis = useMemo(() => {
    const allProdis = academicService.getStudyPrograms();
    if (!isLecturer && !isStudent) {
      return allProdis;
    }

    // Untuk dosen & mahasiswa, tampilkan HANYA prodi dari kelas yang diampu / diikuti
    const prodiCodesInClasses = Array.from(
      new Set(roleFilteredClasses.map((cls) => cls.studyProgramCode).filter(Boolean))
    );

    const fallbackNames: Record<string, string> = {
      PAI: 'Pendidikan Agama Islam',
      PIAUD: 'Pendidikan Islam Anak Usia Dini',
      MPI: 'Manajemen Pendidikan Islam',
      ES: 'Ekonomi Syariah',
      MKU: 'Mata Kuliah Umum'
    };

    return prodiCodesInClasses.map((code) => {
      const found = allProdis.find((p) => p.code === code);
      if (found) return found;

      return {
        id: `prodi-${code.toLowerCase()}`,
        externalId: `EXT-PRODI-${code}`,
        code,
        name: fallbackNames[code] || code,
        degree: 'S1' as const,
        faculty: 'Fakultas Tarbiyah',
        isActive: true,
        sourceSystem: 'SIAKAD_STAI'
      };
    });
  }, [roleFilteredClasses, isLecturer, isStudent]);

  // Reset filterProdi jika prodi terpilih tidak lagi tersedia dalam opsi kelas dosen
  useEffect(() => {
    if (filterProdi && filterProdi !== 'SEMUA' && !availableProdis.some((p) => p.code === filterProdi)) {
      setFilterProdi('');
    }
  }, [availableProdis, filterProdi]);

  // Reset filterClassId jika kelas terpilih tidak lagi tersedia
  useEffect(() => {
    if (filterClassId && filterClassId !== 'SEMUA' && !roleFilteredClasses.some((c) => c.id === filterClassId || c.code === filterClassId)) {
      setFilterClassId('');
    }
  }, [roleFilteredClasses, filterClassId]);

  // Auto reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterProdi, filterClassId, sortBy]);

  // Hitung jumlah kelas per Program Studi
  const getProdiCount = (prodiCode: string) => {
    if (prodiCode === 'SEMUA') {
      return roleFilteredClasses.length;
    }
    return roleFilteredClasses.filter((cls) => cls.studyProgramCode === prodiCode).length;
  };

  // Ringkasan metrik statistik
  const metrics = useMemo(() => {
    const totalClasses = roleFilteredClasses.length;
    const totalSks = roleFilteredClasses.reduce((sum, cls) => sum + (cls.credits || 0), 0);
    const totalStudents = roleFilteredClasses.reduce((sum, cls) => sum + (cls.studentCount || 0), 0);
    return { totalClasses, totalSks, totalStudents };
  }, [roleFilteredClasses]);

  const isSelectionComplete = Boolean(filterProdi && filterClassId);

  // Filter pencarian cerdas multi-token dan sorting
  const filteredClasses = useMemo(() => {
    if (!isSelectionComplete) {
      return [];
    }

    const query = searchQuery.trim().toLowerCase();
    const tokens = query ? query.split(/\s+/).filter(Boolean) : [];

    const result = roleFilteredClasses.filter((cls) => {
      // 1. Filter Kelas Spesifik
      if (filterClassId !== 'SEMUA' && cls.id !== filterClassId && cls.code !== filterClassId) {
        return false;
      }

      // 2. Filter Program Studi
      if (filterProdi !== 'SEMUA' && cls.studyProgramCode !== filterProdi) {
        return false;
      }

      // 3. Multi-token search matching across all fields
      if (tokens.length === 0) return true;

      const scheduleText = (cls.schedules || [])
        .map((s) => `${s.dayOfWeek} ${s.startTime} ${s.endTime} ${s.room} ${s.isOnline ? 'online daring' : 'offline tatap muka'}`)
        .join(' ');

      const combinedText = [
        cls.code || '',
        cls.name || '',
        cls.courseCode || '',
        cls.courseName || '',
        cls.className || '',
        cls.section || '',
        cls.studyProgramCode || '',
        cls.lecturerName || '',
        cls.lecturerNidn || '',
        cls.academicPeriodName || '',
        scheduleText
      ]
        .join(' ')
        .toLowerCase();

      // Setiap kata kunci harus cocok pada teks gabungan
      return tokens.every((token) => combinedText.includes(token));
    });

    // 4. Pengurutan data (Sorting)
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name, 'id');
        case 'name_desc':
          return b.name.localeCompare(a.name, 'id');
        case 'code_asc':
          return (a.code || '').localeCompare(b.code || '', 'id');
        case 'credits_desc':
          return (b.credits || 0) - (a.credits || 0);
        case 'students_desc':
          return (b.studentCount || 0) - (a.studentCount || 0);
        default:
          return 0;
      }
    });
  }, [isSelectionComplete, roleFilteredClasses, searchQuery, filterProdi, filterClassId, sortBy]);

  // Paginated Classes
  const totalPages = Math.ceil(filteredClasses.length / pageSize) || 1;
  const paginatedClasses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClasses.slice(start, start + pageSize);
  }, [filteredClasses, currentPage, pageSize]);

  // Opsi Dropdown Program Studi untuk PremiumSelect
  const prodiOptions: PremiumSelectOption[] = useMemo(() => {
    const list: PremiumSelectOption[] = [
      {
        value: 'SEMUA',
        label: 'Semua Program Studi',
        sublabel: `Tampilkan mata kuliah dari semua prodi yang diampu (${roleFilteredClasses.length} kelas)`,
        badge: `${getProdiCount('SEMUA')} Kelas`,
        icon: Layers
      }
    ];

    availableProdis.forEach((prodi) => {
      const count = getProdiCount(prodi.code);
      list.push({
        value: prodi.code,
        label: `${prodi.name} (${prodi.code})`,
        sublabel: `${prodi.faculty || 'Fakultas Tarbiyah'} • Program S1`,
        badge: `${count} Kelas`,
        icon: GraduationCap
      });
    });

    return list;
  }, [availableProdis, roleFilteredClasses]);

  // Opsi Dropdown Kelas Perkuliahan untuk PremiumSelect
  const classOptions: PremiumSelectOption[] = useMemo(() => {
    const targetClasses = (filterProdi && filterProdi !== 'SEMUA')
      ? roleFilteredClasses.filter((cls) => cls.studyProgramCode === filterProdi)
      : roleFilteredClasses;

    const list: PremiumSelectOption[] = [
      {
        value: 'SEMUA',
        label: filterProdi && filterProdi !== 'SEMUA' ? `Semua Kelas (${filterProdi})` : 'Semua Kelas Perkuliahan',
        sublabel: `Tampilkan seluruh ${targetClasses.length} kelas aktif`,
        badge: `${targetClasses.length} Kelas`,
        icon: BookOpen
      }
    ];

    targetClasses.forEach((cls) => {
      list.push({
        value: cls.id,
        label: `[${cls.code}] ${cls.name}`,
        sublabel: `${cls.courseName || cls.name} • ${cls.credits} SKS • ${cls.studyProgramCode || 'Prodi'}`,
        badge: `${cls.studentCount || 0} Mhs`,
        icon: BookOpen
      });
    });

    return list;
  }, [roleFilteredClasses, filterProdi]);

  const handleProdiChange = (selectedCode: string) => {
    setFilterProdi(selectedCode);
    if (selectedCode && selectedCode !== 'SEMUA') {
      if (filterClassId && filterClassId !== 'SEMUA') {
        const currentClass = roleFilteredClasses.find(c => c.id === filterClassId || c.code === filterClassId);
        if (currentClass && currentClass.studyProgramCode !== selectedCode) {
          setFilterClassId('');
        }
      }
    }
  };

  const handleClassChange = (selectedId: string) => {
    setFilterClassId(selectedId);
    if (selectedId && selectedId !== 'SEMUA') {
      const selectedClass = roleFilteredClasses.find(c => c.id === selectedId || c.code === selectedId);
      if (selectedClass && selectedClass.studyProgramCode) {
        if (filterProdi !== selectedClass.studyProgramCode) {
          setFilterProdi(selectedClass.studyProgramCode);
        }
      }
    }
  };

  const hasActiveFilters = searchQuery.trim() !== '' || Boolean(filterProdi) || Boolean(filterClassId);

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterProdi('');
    setFilterClassId('');
    setSortBy('name_asc');
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
              {KAMUS_UI.MATA_KULIAH_SAYA}
            </h1>
            <Badge variant="primary" style={{ padding: '4px 10px', fontSize: '11px' }}>
              Real-time SIAKAD
            </Badge>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
            {isStudent 
              ? 'Daftar mata kuliah aktif yang Anda ikuti pada Semester Ganjil 2026/2027' 
              : isLecturer
                ? 'Daftar kelas perkuliahan aktif yang Anda ampu sesuai penugasan SIAKAD STAI Al-Ittihad'
                : 'Daftar seluruh kelas perkuliahan terintegrasi SIAKAD STAI Al-Ittihad'}
          </p>
        </div>

        {/* Quick Stats Banner */}
        <div className="flex items-center gap-2 flex-wrap">
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 14px', 
              backgroundColor: 'var(--bg-surface)', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ backgroundColor: 'var(--color-primary-50)', padding: '6px', borderRadius: 'var(--radius-md)' }}>
              <BookOpen size={16} color="var(--color-primary-700)" />
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Kelas</div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{metrics.totalClasses} Kelas</div>
            </div>
          </div>

          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 14px', 
              backgroundColor: 'var(--bg-surface)', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ backgroundColor: 'var(--color-accent-100)', padding: '6px', borderRadius: 'var(--radius-md)' }}>
              <Sparkles size={16} color="var(--color-accent-700)" />
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Beban SKS</div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{metrics.totalSks} SKS</div>
            </div>
          </div>

          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 14px', 
              backgroundColor: 'var(--bg-surface)', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ backgroundColor: 'var(--color-slate-100)', padding: '6px', borderRadius: 'var(--radius-md)' }}>
              <Users size={16} color="var(--text-secondary)" />
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Mahasiswa</div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{metrics.totalStudents} Orang</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Pencarian Interaktif Premium */}
      <Card 
        style={{ 
          border: '1px solid var(--border-default)', 
          boxShadow: 'var(--shadow-sm)',
          overflow: 'visible',
          position: 'relative',
          zIndex: 20
        }}
      >
        <CardBody style={{ padding: 'var(--space-4) var(--space-5)', overflow: 'visible' }}>
          <div className="flex flex-col gap-4">
            {/* Dua Select Option Premium (Prodi & Kelas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                style={{
                  backgroundColor: 'var(--color-slate-50)',
                  border: filterProdi ? '1.5px solid var(--color-primary-500)' : '1.5px solid var(--border-default)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '12px 14px',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <PremiumSelect
                  label="1. Pilih Program Studi (SIAKAD)"
                  value={filterProdi}
                  onChange={handleProdiChange}
                  options={prodiOptions}
                  icon={GraduationCap}
                  badgeCount={`${availableProdis.length} Prodi`}
                  placeholder="— Pilih Program Studi —"
                />
              </div>

              <div 
                style={{
                  backgroundColor: 'var(--color-primary-50)',
                  border: filterClassId ? '1.5px solid var(--color-primary-600)' : '1.5px solid var(--color-primary-200)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '12px 14px',
                  boxShadow: '0 2px 6px rgba(4, 120, 87, 0.05)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <PremiumSelect
                  label="2. Pilih Kelas Perkuliahan (SIAKAD)"
                  value={filterClassId}
                  onChange={handleClassChange}
                  options={classOptions}
                  icon={BookOpen}
                  badgeCount={filterProdi && filterProdi !== 'SEMUA' ? `${classOptions.length - 1} Kelas` : `${roleFilteredClasses.length} Kelas`}
                  placeholder={filterProdi ? "— Pilih Kelas Perkuliahan —" : "Pilih Program Studi terlebih dahulu..."}
                />
              </div>
            </div>

            {/* Input Pencarian Multifungsi + Urutan (Sort) */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* Search Box dengan Clear Icon */}
              <div style={{ position: 'relative', flex: 1 }}>
                <Search 
                  size={16} 
                  style={{ 
                    position: 'absolute', 
                    left: '14px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-muted)',
                    pointerEvents: 'none'
                  }} 
                />
                <input
                  type="text"
                  placeholder="Cari nama mata kuliah, kode MK, dosen, hari, atau ruang kuliah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{
                    paddingLeft: '40px',
                    paddingRight: searchQuery ? '36px' : '14px',
                    height: '44px',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-sm)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1.5px solid var(--border-default)'
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'var(--color-slate-200)',
                      border: 'none',
                      borderRadius: 'var(--radius-full)',
                      width: '22px',
                      height: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      padding: 0,
                      transition: 'all var(--transition-fast)'
                    }}
                    title="Hapus kata kunci pencarian"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Reset Filter Button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    height: '44px',
                    padding: '0 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px solid var(--color-slate-200)',
                    backgroundColor: 'var(--color-slate-100)',
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all var(--transition-fast)'
                  }}
                  title="Reset semua pilihan"
                >
                  <X size={14} />
                  Reset Pilihan
                </button>
              )}
            </div>

            {/* Informasi Hasil Pencarian & Active Filters Status */}
            <div 
              className="flex items-center justify-between flex-wrap gap-2 pt-3"
              style={{ borderTop: '1px solid var(--border-subtle)', fontSize: 'var(--text-xs)' }}
            >
              <div className="flex items-center gap-2 flex-wrap">
                {isSelectionComplete ? (
                  <span style={{ color: 'var(--text-muted)' }}>
                    Menampilkan <strong style={{ color: 'var(--color-primary-700)' }}>{filteredClasses.length}</strong> dari {roleFilteredClasses.length} kelas perkuliahan
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} color="var(--color-primary-600)" />
                    Silakan tentukan <strong>Program Studi</strong> dan <strong>Kelas Perkuliahan</strong> di atas untuk menampilkan data.
                  </span>
                )}

                {filterProdi && (
                  <span 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 10px',
                      backgroundColor: 'var(--color-primary-50)',
                      color: 'var(--color-primary-800)',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--color-primary-200)',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    Prodi: {filterProdi === 'SEMUA' ? 'Semua Prodi' : (availableProdis.find(p => p.code === filterProdi)?.name || filterProdi)}
                    <button 
                      type="button"
                      onClick={() => handleProdiChange('')}
                      title="Hapus filter prodi"
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: 'inherit' }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {filterClassId && (
                  <span 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 10px',
                      backgroundColor: 'var(--color-primary-100)',
                      color: 'var(--color-primary-900)',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--color-primary-300)',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    Kelas: {filterClassId === 'SEMUA' ? 'Semua Kelas' : (roleFilteredClasses.find(c => c.id === filterClassId || c.code === filterClassId)?.name || filterClassId)}
                    <button 
                      type="button"
                      onClick={() => handleClassChange('')}
                      title="Hapus filter kelas"
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: 'inherit' }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {searchQuery.trim() !== '' && (
                  <span 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 10px',
                      backgroundColor: 'var(--color-slate-100)',
                      color: 'var(--text-secondary)',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-default)',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    Pencarian: &quot;{searchQuery}&quot;
                    <button 
                      type="button"
                      onClick={() => setSearchQuery('')}
                      title="Hapus kata kunci pencarian"
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: 'inherit' }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  icon={X} 
                  onClick={handleResetFilters}
                  style={{ color: 'var(--color-danger-main)', fontSize: '11px', padding: '2px 8px' }}
                >
                  Reset Semua Pilihan
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Grid Kelas Perkuliahan atau Panduan Pemilihan */}
      {!isSelectionComplete ? (
        <Card 
          style={{ 
            border: '1.5px dashed var(--color-primary-300)', 
            backgroundColor: 'var(--color-primary-50)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 4px 12px rgba(4, 120, 87, 0.04)'
          }}
        >
          <CardBody style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
            <div 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                backgroundColor: '#ffffff',
                color: 'var(--color-primary-700)',
                border: '1.5px solid var(--color-primary-200)',
                boxShadow: '0 4px 14px rgba(4, 120, 87, 0.12)',
                marginBottom: 'var(--space-4)'
              }}
            >
              <GraduationCap size={32} />
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-primary-900)', marginBottom: 'var(--space-2)' }}>
              {!filterProdi 
                ? 'Silakan Pilih Program Studi & Kelas Perkuliahan Terlebih Dahulu' 
                : 'Program Studi Terpilih — Silakan Pilih Kelas Perkuliahan'}
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto var(--space-5)', lineHeight: 1.6 }}>
              {!filterProdi 
                ? 'Data mata kuliah belum ditampilkan. Silakan pilih Program Studi dan Kelas Perkuliahan pada opsi filter di atas untuk melihat jadwal, RPS/silabus, dan daftar mahasiswa aktif.'
                : `Program studi telah dipilih. Sekarang silakan tentukan Kelas Perkuliahan pada opsi nomor 2 di atas untuk menampilkan data kelas.`}
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: filterProdi ? 'var(--color-primary-600)' : '#ffffff',
                  color: filterProdi ? '#ffffff' : 'var(--text-secondary)',
                  border: filterProdi ? '1px solid var(--color-primary-700)' : '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                {filterProdi ? <CheckCircle2 size={14} /> : <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-primary-500)' }} />}
                1. Pilih Program Studi {filterProdi ? `(${filterProdi === 'SEMUA' ? 'Semua' : filterProdi})` : ''}
              </span>
              <span style={{ color: 'var(--color-primary-500)', fontWeight: 'bold', fontSize: '14px' }}>➔</span>
              <span 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: filterClassId ? 'var(--color-primary-600)' : '#ffffff',
                  color: filterClassId ? '#ffffff' : 'var(--text-secondary)',
                  border: filterClassId ? '1px solid var(--color-primary-700)' : '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                {filterClassId ? <CheckCircle2 size={14} /> : <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-slate-400)' }} />}
                2. Pilih Kelas Perkuliahan
              </span>
            </div>
          </CardBody>
        </Card>
      ) : filteredClasses.length === 0 ? (
        <Card style={{ border: '1px solid var(--border-default)' }}>
          <CardBody style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <div 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--color-slate-100)',
                color: 'var(--text-muted)',
                marginBottom: 'var(--space-4)'
              }}
            >
              <Search size={26} />
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
              Tidak ada kelas perkuliahan ditemukan
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto var(--space-5)' }}>
              {hasActiveFilters 
                ? 'Tidak ada kelas yang cocok dengan kata kunci pencarian atau kelas yang dipilih.' 
                : 'Belum ada jadwal kelas aktif pada semester ini.'}
            </p>
            {hasActiveFilters && (
              <Button variant="primary" size="sm" onClick={handleResetFilters}>
                Reset Filter Pencarian
              </Button>
            )}
          </CardBody>
        </Card>

      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
            {paginatedClasses.map((cls) => (
              <Card 
                key={cls.id} 
                interactive 
                onClick={() => onSelectClass(cls.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                  transition: 'all var(--transition-normal)'
                }}
              >
                <div>
                  <CardHeader style={{ padding: 'var(--space-3-5) var(--space-5)', backgroundColor: 'var(--bg-surface)' }}>
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" style={{ fontWeight: 700 }}>{cls.code}</Badge>
                      <Badge variant="default" style={{ fontSize: '10px' }}>{cls.studyProgramCode}</Badge>
                    </div>
                    <span 
                      style={{ 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        color: 'var(--color-primary-800)',
                        backgroundColor: 'var(--color-primary-50)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--color-primary-200)'
                      }}
                    >
                      {cls.credits} SKS
                    </span>
                  </CardHeader>
                  
                  <CardBody style={{ padding: 'var(--space-4) var(--space-5)' }}>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'bold', marginBottom: '2px', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {cls.name}
                    </h3>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                      {cls.courseName}
                    </p>

                    <div className="flex flex-col gap-2.5" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-2">
                        <Users size={14} color="var(--color-primary-700)" style={{ flexShrink: 0 }} />
                        <span className="truncate">Dosen: <strong>{cls.lecturerName}</strong></span>
                      </div>
                      
                      {cls.schedules.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Clock size={14} color="var(--color-primary-700)" style={{ flexShrink: 0 }} />
                          <span>{cls.schedules[0].dayOfWeek}, {cls.schedules[0].startTime}–{cls.schedules[0].endTime}</span>
                          <span 
                            style={{ 
                              backgroundColor: 'var(--color-slate-100)', 
                              padding: '1px 6px', 
                              borderRadius: 'var(--radius-sm)', 
                              fontSize: '10px', 
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-default)'
                            }}
                          >
                            {cls.schedules[0].room}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Perkuliahan */}
                    <div style={{ marginTop: 'var(--space-4)' }}>
                      <div className="flex justify-between items-center" style={{ fontSize: '11px', marginBottom: '4px' }}>
                        <span className="text-muted flex items-center gap-1">
                          <CheckCircle2 size={11} color="var(--color-primary-600)" /> Progres Pertemuan
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>4 / 16 Selesai (25%)</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-slate-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{ width: '25%', height: '100%', backgroundColor: 'var(--color-primary-600)', borderRadius: 'var(--radius-full)' }} />
                      </div>
                    </div>
                  </CardBody>
                </div>

                <CardFooter style={{ padding: 'var(--space-3) var(--space-5)', backgroundColor: 'var(--color-slate-50)' }}>
                  <span className="flex items-center gap-1.5" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    <Users size={13} color="var(--text-muted)" />
                    <strong>{cls.studentCount}</strong> Mahasiswa
                  </span>
                  <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
                    Buka Ruang Kelas
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Card 
            style={{ 
              border: '1px solid var(--border-default)', 
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xs)',
              marginTop: 'var(--space-2)'
            }}
          >
            <CardBody style={{ padding: '10px 16px' }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredClasses.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                showPageSizeSelector={false}
                itemLabel="mata kuliah"
              />
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
};

