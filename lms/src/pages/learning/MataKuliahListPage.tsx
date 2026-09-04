import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  ArrowRight, 
  Clock,
  Search,
  X
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { AcademicClass } from '../../types/academic';
import { academicService } from '../../services/academicService';
import { useAuth } from '../../context/AuthContext';
import { KAMUS_UI } from '../../constants/dictionary';

export interface MataKuliahListPageProps {
  onSelectClass: (classId: string) => void;
}

export const MataKuliahListPage: React.FC<MataKuliahListPageProps> = ({ onSelectClass }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProdi, setFilterProdi] = useState('SEMUA');

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

  // Auto reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterProdi]);

  const hasActiveFilters = searchQuery !== '' || filterProdi !== 'SEMUA';

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterProdi('SEMUA');
    setCurrentPage(1);
  };

  // Filter kelas berdasarkan peran
  const roleFilteredClasses = classes.filter((cls) => {
    if (isLecturer && user?.identityNumber) {
      // Dosen melihat kelas yang diampunya
      return cls.lecturerNidn === user.identityNumber || cls.lecturerId === user.id;
    }
    return true; // Mahasiswa & Admin melihat semua kelas terdaftar
  });

  const filteredClasses = useMemo(() => {
    return roleFilteredClasses.filter((cls) => {
      const matchesSearch = 
        cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.lecturerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesProdi = filterProdi === 'SEMUA' || cls.studyProgramCode === filterProdi;
      return matchesSearch && matchesProdi;
    });
  }, [roleFilteredClasses, searchQuery, filterProdi]);

  // Paginated Classes
  const totalPages = Math.ceil(filteredClasses.length / pageSize) || 1;
  const paginatedClasses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClasses.slice(start, start + pageSize);
  }, [filteredClasses, currentPage, pageSize]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1>{KAMUS_UI.MATA_KULIAH_SAYA}</h1>
          <p>
            {isStudent 
              ? 'Daftar mata kuliah aktif yang Anda ikuti pada Semester Ganjil 2026/2027' 
              : 'Daftar kelas perkuliahan yang Anda ampu pada semester aktif'}
          </p>
        </div>

        <Badge variant="primary" style={{ padding: '6px 14px', fontSize: 'var(--text-xs)' }}>
          Semester Ganjil 2026/2027
        </Badge>
      </div>

      {/* Filter & Pencarian */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div style={{ position: 'relative', flex: 1, width: '100%' }}>
              <Input
                placeholder="Cari nama mata kuliah, kode kelas, atau dosen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px' }}
              />
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
            </div>

            <select
              className="form-select"
              value={filterProdi}
              onChange={(e) => setFilterProdi(e.target.value)}
              style={{ width: 'auto', minWidth: '220px' }}
            >
              <option value="SEMUA">Semua Program Studi</option>
              <option value="PAI">Pendidikan Agama Islam (PAI)</option>
              <option value="MPI">Manajemen Pendidikan Islam (MPI)</option>
              <option value="ES">Ekonomi Syariah (ES)</option>
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

      {/* Grid Mata Kuliah */}
      {filteredClasses.length === 0 ? (
        <Card>
          <CardBody style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
            <p className="text-muted">{KAMUS_UI.TIDAK_ADA_DATA}</p>
          </CardBody>
        </Card>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
            {paginatedClasses.map((cls) => (
              <Card key={cls.id} interactive onClick={() => onSelectClass(cls.id)}>
                <CardHeader>
                  <Badge variant="primary">{cls.code}</Badge>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {cls.credits} SKS • {cls.studyProgramCode}
                  </span>
                </CardHeader>
                <CardBody>
                  <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-1)', color: 'var(--text-primary)' }}>
                    {cls.name}
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                    {cls.courseName}
                  </p>

                  <div className="flex flex-col gap-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    <div className="flex items-center gap-2">
                      <Users size={14} color="var(--color-primary-700)" />
                      <span>Dosen: <strong>{cls.lecturerName}</strong></span>
                    </div>
                    {cls.schedules.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Clock size={14} color="var(--color-primary-700)" />
                        <span>{cls.schedules[0].dayOfWeek}, {cls.schedules[0].startTime}–{cls.schedules[0].endTime} ({cls.schedules[0].room})</span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar simulasi */}
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    <div className="flex justify-between items-center" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                      <span className="text-muted">Progres Pertemuan</span>
                      <span style={{ fontWeight: 'bold' }}>4/16 Selesai</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-slate-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ width: '25%', height: '100%', backgroundColor: 'var(--color-primary-600)' }} />
                    </div>
                  </div>
                </CardBody>
                <CardFooter>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {cls.studentCount} Mahasiswa
                  </span>
                  <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
                    Buka Ruang Kelas
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Card>
            <CardBody style={{ padding: 'var(--space-2) var(--space-4)' }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredClasses.length}
                pageSize={pageSize}
                pageSizeOptions={[3, 6, 12, 24]}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemLabel="mata kuliah"
              />
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
};
