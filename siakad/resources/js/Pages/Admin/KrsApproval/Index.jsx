import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    BookOpen, Search, Filter, CheckCircle2, Clock, 
    XCircle, RefreshCw, Printer, Check, Eye, X, 
    MinusCircle, ChevronDown, Sparkles, GraduationCap, 
    Calendar, Users, Award, ShieldCheck, AlertCircle, 
    Loader2, CheckSquare, Layers, FileText, ArrowRight,
    Trash2, Plus, Edit3, Zap, Building, Clock3
} from 'lucide-react';

export default function KrsApprovalIndex({ 
    students = null, 
    studyPrograms = [], 
    batchYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'],
    academicPeriods = [],
    activePeriod, 
    currentPeriodObj = null,
    selectedProdiObj = null,
    isSelectionComplete = false,
    rooms = [],
    classNames = ['Kelas A', 'Kelas B', 'Kelas C', 'Kelas Reguler', 'Kelas Karyawan'],
    semesterLevels = [1, 2, 3, 4, 5, 6, 7, 8],
    stats = {}, 
    filters = {} 
}) {
    // Primary Filter States
    const [prodi, setProdi] = useState(filters.study_program || '');
    const [year, setYear] = useState(filters.academic_year || '');
    const [period, setPeriod] = useState(filters.academic_period || (activePeriod?.id ? String(activePeriod.id) : ''));
    const [selectedClass, setSelectedClass] = useState(filters.class_name || '');
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [perPage, setPerPage] = useState(filters.per_page || 20);

    // Asynchronous In-Place Data States
    const [studentsData, setStudentsData] = useState(students);
    const [currentStats, setCurrentStats] = useState(stats);
    const [isSelectionActive, setIsSelectionActive] = useState(isSelectionComplete);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Dropdown Popover States
    const [isProdiDropdownOpen, setIsProdiDropdownOpen] = useState(false);
    const [prodiSearch, setProdiSearch] = useState('');
    const prodiDropdownRef = useRef(null);

    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const yearDropdownRef = useRef(null);

    const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
    const periodDropdownRef = useRef(null);

    const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
    const classDropdownRef = useRef(null);

    // Modals & Detail States
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [actionSuccessMsg, setActionSuccessMsg] = useState('');

    // Interactive Manage & Add Courses Modal States
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [managingStudent, setManagingStudent] = useState(null);
    const [krsDetails, setKrsDetails] = useState(null);
    const [isLoadingKrsDetails, setIsLoadingKrsDetails] = useState(false);
    const [searchAvailable, setSearchAvailable] = useState('');
    const [filterSemesterLevel, setFilterSemesterLevel] = useState('all');
    const [selectedClassIds, setSelectedClassIds] = useState([]);
    const [isProcessingItem, setIsProcessingItem] = useState(false);
    const [modalFeedback, setModalFeedback] = useState(null);

    // Reject Modal
    const [rejectTarget, setRejectTarget] = useState(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectNotes, setRejectNotes] = useState('Silakan sesuaikan pilihan mata kuliah dengan arahan Dosen PA.');

    // Helper to build clean query
    const buildCleanQuery = (overrides = {}) => {
        const raw = {
            study_program: prodi,
            academic_year: year,
            academic_period: period,
            class_name: selectedClass,
            status: statusFilter,
            search,
            per_page: Number(perPage) !== 20 ? perPage : undefined,
            ...overrides,
        };

        const clean = {};
        for (const [k, v] of Object.entries(raw)) {
            if (v !== undefined && v !== null && v !== '') {
                clean[k] = v;
            }
        }
        return clean;
    };

    // Asynchronous In-Place Fetcher
    const fetchKrsData = async (newProdi = prodi, newYear = year, newPeriod = period, newClass = selectedClass, newStatus = statusFilter, newSearch = search, page = 1) => {
        if (!newProdi || !newYear) {
            setIsSelectionActive(false);
            setStudentsData(null);
            return;
        }

        setIsLoadingData(true);

        const cleanParams = buildCleanQuery({
            study_program: newProdi,
            academic_year: newYear,
            academic_period: newPeriod,
            class_name: newClass,
            status: newStatus,
            search: newSearch,
            page: page > 1 ? page : undefined,
        });

        const queryString = new URLSearchParams(cleanParams).toString();

        try {
            const res = await fetch(`/admin/krs-approval?${queryString}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            const result = await res.json();
            if (result.success) {
                setStudentsData(result.students);
                setCurrentStats(result.stats);
                setIsSelectionActive(result.isSelectionComplete);
            }
        } catch (error) {
            console.error('Error fetching KRS data:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleTriggerFilter = (newProdi = prodi, newYear = year, newPeriod = period, newClass = selectedClass) => {
        setProdi(newProdi);
        setYear(newYear);
        setPeriod(newPeriod);
        setSelectedClass(newClass);
        fetchKrsData(newProdi, newYear, newPeriod, newClass, statusFilter, search, 1);
    };

    const handleResetFilter = () => {
        setProdi('');
        setYear('');
        setSelectedClass('');
        setSearch('');
        setStatusFilter('');
        setIsSelectionActive(false);
        setStudentsData(null);
    };

    // Close Dropdowns on Click Outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (prodiDropdownRef.current && !prodiDropdownRef.current.contains(e.target)) {
                setIsProdiDropdownOpen(false);
            }
            if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target)) {
                setIsYearDropdownOpen(false);
            }
            if (periodDropdownRef.current && !periodDropdownRef.current.contains(e.target)) {
                setIsPeriodDropdownOpen(false);
            }
            if (classDropdownRef.current && !classDropdownRef.current.contains(e.target)) {
                setIsClassDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filtered Study Programs in dropdown
    const filteredStudyPrograms = studyPrograms.filter(p => 
        p.name.toLowerCase().includes(prodiSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(prodiSearch.toLowerCase()) ||
        (p.national_code && p.national_code.includes(prodiSearch))
    );

    const currentProdi = selectedProdiObj || studyPrograms.find(p => 
        String(p.id) === String(prodi) || p.code === prodi || p.name === prodi
    );

    const currentPeriod = currentPeriodObj || academicPeriods.find(p => String(p.id) === String(period)) || activePeriod;

    // Actions
    const handleApprove = async (krsId) => {
        if (!krsId) return;
        setIsActionLoading(true);
        try {
            const res = await fetch(`/admin/krs-approval/${krsId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                }
            });
            const data = await res.json();
            if (data.success) {
                setActionSuccessMsg(data.message);
                setTimeout(() => setActionSuccessMsg(''), 4000);
                fetchKrsData();
            }
        } catch (err) {
            console.error('Error approving KRS:', err);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleConfirmReject = async (e) => {
        e.preventDefault();
        if (!rejectTarget?.krs_submission_id) return;
        setIsActionLoading(true);
        try {
            const res = await fetch(`/admin/krs-approval/${rejectTarget.krs_submission_id}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ notes: rejectNotes })
            });
            const data = await res.json();
            if (data.success) {
                setIsRejectModalOpen(false);
                setRejectTarget(null);
                setActionSuccessMsg(data.message);
                setTimeout(() => setActionSuccessMsg(''), 4000);
                fetchKrsData();
            }
        } catch (err) {
            console.error('Error rejecting KRS:', err);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleBulkApprove = async () => {
        if (!confirm(`Setujui seluruh ${currentStats.pending || 0} pengajuan KRS yang berstatus menunggu approval?`)) return;
        setIsActionLoading(true);
        try {
            const res = await fetch('/admin/krs-approval/bulk-approve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ academic_period_id: period })
            });
            const data = await res.json();
            if (data.success) {
                setActionSuccessMsg(data.message);
                setTimeout(() => setActionSuccessMsg(''), 4000);
                fetchKrsData();
            }
        } catch (err) {
            console.error('Error bulk approving KRS:', err);
        } finally {
            setIsActionLoading(false);
        }
    };

    // --- Interactive KRS Management Handlers ---
    const showModalFeedback = (type, message) => {
        setModalFeedback({ type, message });
        setTimeout(() => setModalFeedback(null), 4500);
    };

    const fetchStudentKrsDetails = async (studentId, silent = false) => {
        if (!studentId) return;
        if (!silent) setIsLoadingKrsDetails(true);
        try {
            const periodParam = period ? `?academic_period_id=${encodeURIComponent(period)}` : '';
            const res = await fetch(`/admin/krs-approval/${studentId}/courses${periodParam}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            const data = await res.json();
            if (data.success) {
                setKrsDetails(data);
            } else {
                showModalFeedback('error', data.message || 'Gagal memuat rincian rencana studi');
            }
        } catch (err) {
            console.error('Error fetching student KRS details:', err);
            showModalFeedback('error', 'Terjadi kesalahan jaringan saat memuat data');
        } finally {
            if (!silent) setIsLoadingKrsDetails(false);
        }
    };

    const handleOpenManageModal = (student) => {
        setManagingStudent(student);
        setKrsDetails(null);
        setSelectedClassIds([]);
        setSearchAvailable('');
        setFilterSemesterLevel('all');
        setModalFeedback(null);
        setIsManageModalOpen(true);
        fetchStudentKrsDetails(student.id);
    };

    const handleAddCourse = async (courseClassId) => {
        if (!managingStudent?.id || isProcessingItem) return;
        setIsProcessingItem(true);
        try {
            const res = await fetch(`/admin/krs-approval/${managingStudent.id}/add-course`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    course_class_id: courseClassId,
                    academic_period_id: period || undefined,
                })
            });
            const data = await res.json();
            if (data.success) {
                showModalFeedback('success', data.message);
                setKrsDetails(data);
                fetchKrsData(); // sync background table
            } else {
                showModalFeedback('error', data.message || 'Gagal menambahkan mata kuliah');
            }
        } catch (err) {
            console.error('Error adding course:', err);
            showModalFeedback('error', 'Gagal menambahkan mata kuliah');
        } finally {
            setIsProcessingItem(false);
        }
    };

    const handleRemoveCourse = async (courseClassId, krsItemId = null) => {
        if (!managingStudent?.id || isProcessingItem) return;
        if (!confirm('Apakah Anda yakin ingin menghapus mata kuliah ini dari rencana studi mahasiswa?')) return;
        setIsProcessingItem(true);
        try {
            const res = await fetch(`/admin/krs-approval/${managingStudent.id}/remove-course`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    course_class_id: courseClassId,
                    krs_item_id: krsItemId,
                    academic_period_id: period || undefined,
                })
            });
            const data = await res.json();
            if (data.success) {
                showModalFeedback('success', data.message);
                setKrsDetails(data);
                fetchKrsData(); // sync background table
            } else {
                showModalFeedback('error', data.message || 'Gagal menghapus mata kuliah');
            }
        } catch (err) {
            console.error('Error removing course:', err);
            showModalFeedback('error', 'Gagal menghapus mata kuliah');
        } finally {
            setIsProcessingItem(false);
        }
    };

    const handleBatchAddPackage = async (semesterLevel) => {
        if (!managingStudent?.id || isProcessingItem) return;
        if (!confirm(`Tambahkan seluruh paket mata kuliah Semester ${semesterLevel} ke rencana studi ${managingStudent.name}?`)) return;
        setIsProcessingItem(true);
        try {
            const res = await fetch(`/admin/krs-approval/${managingStudent.id}/batch-add-package`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    semester_level: semesterLevel,
                    semester: semesterLevel,
                    academic_period_id: period || undefined,
                })
            });
            const data = await res.json();
            if (data.success) {
                showModalFeedback('success', data.message);
                setKrsDetails(data);
                fetchKrsData(); // sync background table
            } else {
                showModalFeedback('error', data.message || 'Gagal menambahkan paket mata kuliah');
            }
        } catch (err) {
            console.error('Error adding package:', err);
            showModalFeedback('error', 'Gagal menambahkan paket mata kuliah');
        } finally {
            setIsProcessingItem(false);
        }
    };

    const handleModalUpdateStatus = async (newStatus, notes = '') => {
        if (!managingStudent?.id || isProcessingItem) return;
        setIsProcessingItem(true);
        try {
            const res = await fetch(`/admin/krs-approval/${managingStudent.id}/update-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    status: newStatus,
                    notes: notes,
                    academic_period_id: period || undefined,
                })
            });
            const data = await res.json();
            if (data.success) {
                showModalFeedback('success', data.message);
                setKrsDetails(data);
                fetchKrsData(); // sync background table
            } else {
                showModalFeedback('error', data.message || 'Gagal mengubah status KRS');
            }
        } catch (err) {
            console.error('Error updating status:', err);
            showModalFeedback('error', 'Gagal memperbarui status');
        } finally {
            setIsProcessingItem(false);
        }
    };

    const filteredAvailableClasses = useMemo(() => {
        if (!krsDetails?.available_classes) return [];
        return krsDetails.available_classes.filter(c => {
            const matchSearch = !searchAvailable || 
                c.course_name?.toLowerCase().includes(searchAvailable.toLowerCase()) ||
                c.course_code?.toLowerCase().includes(searchAvailable.toLowerCase()) ||
                (c.class_name && c.class_name.toLowerCase().includes(searchAvailable.toLowerCase())) ||
                (c.lecturer_name && c.lecturer_name.toLowerCase().includes(searchAvailable.toLowerCase()));
            
            const matchSemester = filterSemesterLevel === 'all' || 
                String(c.semester_level) === String(filterSemesterLevel);

            return matchSearch && matchSemester;
        });
    }, [krsDetails?.available_classes, searchAvailable, filterSemesterLevel]);

    // Multi-select Course Operations (Pilih 1-1 atau Pilih Semua)
    const isAllFilteredSelected = useMemo(() => {
        if (!filteredAvailableClasses || filteredAvailableClasses.length === 0) return false;
        return filteredAvailableClasses.every(c => selectedClassIds.includes(c.course_class_id));
    }, [filteredAvailableClasses, selectedClassIds]);

    const handleToggleSelectAll = () => {
        if (isAllFilteredSelected) {
            const filteredIds = new Set(filteredAvailableClasses.map(c => c.course_class_id));
            setSelectedClassIds(prev => prev.filter(id => !filteredIds.has(id)));
        } else {
            const combined = new Set([...selectedClassIds, ...filteredAvailableClasses.map(c => c.course_class_id)]);
            setSelectedClassIds(Array.from(combined));
        }
    };

    const handleToggleSelectCourse = (courseClassId) => {
        setSelectedClassIds(prev => 
            prev.includes(courseClassId) 
                ? prev.filter(id => id !== courseClassId)
                : [...prev, courseClassId]
        );
    };

    const selectedClasses = useMemo(() => {
        if (!krsDetails?.available_classes || selectedClassIds.length === 0) return [];
        return krsDetails.available_classes.filter(c => selectedClassIds.includes(c.course_class_id));
    }, [krsDetails?.available_classes, selectedClassIds]);

    const selectedCredits = useMemo(() => {
        return selectedClasses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
    }, [selectedClasses]);

    const handleAddSelectedCourses = async () => {
        if (!managingStudent?.id || selectedClassIds.length === 0 || isProcessingItem) return;

        const totalWillBe = (krsDetails?.total_credits || 0) + selectedCredits;
        if (totalWillBe > (krsDetails?.max_credits || 24)) {
            alert(`Gagal: Total beban SKS akan menjadi ${totalWillBe} SKS, melebihi batas maksimal ${krsDetails?.max_credits || 24} SKS! Kurangi pilihan mata kuliah.`);
            return;
        }

        setIsProcessingItem(true);
        try {
            const res = await fetch(`/admin/krs-approval/${managingStudent.id}/batch-add-selected`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    course_class_ids: selectedClassIds,
                    academic_period_id: period || undefined,
                })
            });
            const data = await res.json();
            if (data.success) {
                showModalFeedback('success', data.message);
                setSelectedClassIds([]);
                setKrsDetails(data);
                fetchKrsData(); // sync background table
            } else {
                showModalFeedback('error', data.message || 'Gagal menambahkan mata kuliah terpilih');
            }
        } catch (err) {
            console.error('Error adding selected courses:', err);
            showModalFeedback('error', 'Terjadi kesalahan saat menambahkan mata kuliah terpilih');
        } finally {
            setIsProcessingItem(false);
        }
    };

    const studentList = studentsData?.data || [];

    return (
        <AppLayout title="Data Rencana Studi">
            <Head title="Rencana Studi (KRS)" />

            <div className="space-y-3.5">
                {/* 1. COMPACT HERO HEADER DENGAN SUB-BAR FILTER 3-TINGKAT (Prodi, Angkatan, Semester) */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative border border-slate-700/50 z-20">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-black mb-1">
                                <Sparkles className="w-3 h-3 text-teal-400" />
                                <span>AKADEMIK & RENCANA STUDI</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                                Data Rencana Studi (KRS)
                            </h2>
                        </div>

                        {/* Action Buttons Toolbar */}
                        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                            <Link
                                href={`/admin/krs-approval/package${prodi && year ? `?study_program=${prodi}&academic_year=${year}&academic_period=${period}${selectedClass ? `&class_name=${selectedClass}` : ''}` : ''}`}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400 text-white font-extrabold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md shadow-teal-950/40 cursor-pointer border border-teal-400/40 hover:scale-[1.02] active:scale-[0.98]"
                                title="Buka Halaman Paket KRS Massal per Kelas & Ruangan"
                            >
                                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                                <span>Paket KRS Massal (Kelas & Ruangan)</span>
                            </Link>

                            {isSelectionActive && currentStats.pending > 0 && (
                                <button
                                    type="button"
                                    onClick={handleBulkApprove}
                                    disabled={isActionLoading}
                                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Setujui Semua ({currentStats.pending} Pengajuan)</span>
                                </button>
                            )}

                            {isSelectionActive && (
                                <span className="px-3 py-1.5 bg-slate-800 text-teal-300 rounded-xl text-xs font-bold border border-slate-700">
                                    Semester: <strong className="text-white">{currentPeriod?.name || 'Aktif'}</strong>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Integrated Sub-bar: Filter Prodi, Angkatan, & Semester */}
                    <div className="relative z-30 mt-3 pt-3 border-t border-slate-700/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="flex items-center space-x-2.5">
                            <div className="p-1.5 bg-teal-500/20 text-teal-400 rounded-lg border border-teal-500/30 shrink-0">
                                <BookOpen className="w-4 h-4" />
                            </div>
                            <div className="flex items-center space-x-2 flex-wrap text-xs">
                                <span className="font-bold text-slate-300">Filter KRS:</span>
                                {currentProdi && year ? (
                                    <div className="inline-flex items-center space-x-1.5 flex-wrap">
                                        <span className="font-black text-white">{currentProdi.name}</span>
                                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-teal-500/30 text-teal-300 border border-teal-500/40">
                                            {currentProdi.national_code || currentProdi.code}
                                        </span>
                                        <span className="text-[11px] font-bold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-md border border-teal-600/40">
                                            Angkatan {year}
                                        </span>
                                        <span className="text-[11px] font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-600/40">
                                            {currentPeriod?.name}
                                        </span>
                                        {selectedClass ? (
                                            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-600/40 inline-flex items-center space-x-1">
                                                <span>{selectedClass}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedClass('');
                                                        handleTriggerFilter(prodi, year, period, '');
                                                    }}
                                                    className="hover:text-white cursor-pointer ml-0.5"
                                                    title="Hapus Filter Kelas"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ) : (
                                            <span className="text-[11px] font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/60">
                                                Semua Kelas
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-slate-400 italic">Pilih Program Studi, Angkatan, Semester & Kelas di samping</span>
                                )}
                            </div>
                        </div>

                        {/* Dropdown Selectors on Header */}
                        <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 w-full lg:w-auto">
                            {/* 1. Dropdown Prodi Popover */}
                            <div ref={prodiDropdownRef} className="relative w-full sm:w-60">
                                <button
                                    type="button"
                                    onClick={() => setIsProdiDropdownOpen(prev => !prev)}
                                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition shadow-2xs cursor-pointer text-left border ${
                                        isProdiDropdownOpen 
                                            ? 'border-teal-400 ring-2 ring-teal-500/30 bg-slate-800 text-white' 
                                            : currentProdi 
                                                ? 'border-teal-500/50 bg-teal-950/50 hover:bg-teal-900/50 text-teal-200 font-bold' 
                                                : 'border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2 truncate">
                                        <GraduationCap className={`w-3.5 h-3.5 shrink-0 ${currentProdi ? 'text-teal-400' : 'text-slate-400'}`} />
                                        <span className="truncate">
                                            {currentProdi ? currentProdi.name : 'Pilih Program Studi...'}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-1 shrink-0 ml-1.5">
                                        {prodi && (
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setProdi('');
                                                    setIsProdiDropdownOpen(false);
                                                    handleTriggerFilter('', year, period);
                                                }}
                                                className="p-0.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
                                                title="Reset Prodi"
                                            >
                                                <X className="w-3 h-3" />
                                            </span>
                                        )}
                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                            isProdiDropdownOpen ? 'rotate-180 text-teal-400' : ''
                                        }`} />
                                    </div>
                                </button>

                                {isProdiDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-1.5 w-full sm:w-80 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn p-2 space-y-1.5">
                                        <div className="relative">
                                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                                            <input
                                                type="text"
                                                value={prodiSearch}
                                                onChange={(e) => setProdiSearch(e.target.value)}
                                                placeholder="Cari program studi..."
                                                className="w-full text-[11px] pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="max-h-56 overflow-y-auto space-y-1 divide-y divide-slate-100">
                                            {filteredStudyPrograms.map((p) => {
                                                const isSelected = String(p.id) === String(prodi) || p.code === prodi || p.name === prodi;
                                                return (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => {
                                                            setProdi(String(p.id));
                                                            setIsProdiDropdownOpen(false);
                                                            handleTriggerFilter(String(p.id), year, period);
                                                        }}
                                                        className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between text-[11px] ${
                                                            isSelected ? 'bg-teal-50 border border-teal-200 font-bold text-teal-950' : 'hover:bg-slate-50 text-slate-700'
                                                        }`}
                                                    >
                                                        <div>
                                                            <p className="font-bold">{p.name}</p>
                                                            <p className="text-[10px] text-slate-400">{p.code} - {p.degree || 'S1'}</p>
                                                        </div>
                                                        {isSelected && <Check className="w-3.5 h-3.5 text-teal-600" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 2. Dropdown Angkatan Popover */}
                            <div ref={yearDropdownRef} className="relative w-full sm:w-36">
                                <button
                                    type="button"
                                    onClick={() => setIsYearDropdownOpen(prev => !prev)}
                                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition shadow-2xs cursor-pointer text-left border ${
                                        isYearDropdownOpen 
                                            ? 'border-teal-400 ring-2 ring-teal-500/30 bg-slate-800 text-white' 
                                            : year 
                                                ? 'border-teal-500/50 bg-teal-950/50 hover:bg-teal-900/50 text-teal-200 font-bold' 
                                                : 'border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center space-x-1.5 truncate">
                                        <Calendar className={`w-3.5 h-3.5 shrink-0 ${year ? 'text-teal-400' : 'text-slate-400'}`} />
                                        <span className="truncate">{year ? `Angk. ${year}` : 'Angkatan...'}</span>
                                    </div>

                                    <div className="flex items-center space-x-1 shrink-0 ml-1">
                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                            isYearDropdownOpen ? 'rotate-180 text-teal-400' : ''
                                        }`} />
                                    </div>
                                </button>

                                {isYearDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-1.5 w-full sm:w-44 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn p-2 space-y-1">
                                        {batchYears.map((y) => {
                                            const isSelected = String(y) === String(year);
                                            return (
                                                <div
                                                    key={y}
                                                    onClick={() => {
                                                        setYear(String(y));
                                                        setIsYearDropdownOpen(false);
                                                        handleTriggerFilter(prodi, String(y), period);
                                                    }}
                                                    className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between text-[11px] ${
                                                        isSelected 
                                                            ? 'bg-teal-50 border border-teal-200 font-bold text-teal-950' 
                                                            : 'hover:bg-slate-50 text-slate-700'
                                                    }`}
                                                >
                                                    <span className="font-bold">Angkatan {y}</span>
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-teal-600" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* 3. Dropdown Semester Popover */}
                            <div ref={periodDropdownRef} className="relative w-full sm:w-48">
                                <button
                                    type="button"
                                    onClick={() => setIsPeriodDropdownOpen(prev => !prev)}
                                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition shadow-2xs cursor-pointer text-left border ${
                                        isPeriodDropdownOpen 
                                            ? 'border-purple-400 ring-2 ring-purple-500/30 bg-slate-800 text-white' 
                                            : period 
                                                ? 'border-purple-500/50 bg-purple-950/50 hover:bg-purple-900/50 text-purple-200 font-bold' 
                                                : 'border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center space-x-1.5 truncate">
                                        <Layers className={`w-3.5 h-3.5 shrink-0 ${period ? 'text-purple-400' : 'text-slate-400'}`} />
                                        <span className="truncate">{currentPeriod ? currentPeriod.name : 'Semester...'}</span>
                                    </div>

                                    <div className="flex items-center space-x-1 shrink-0 ml-1">
                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                            isPeriodDropdownOpen ? 'rotate-180 text-purple-400' : ''
                                        }`} />
                                    </div>
                                </button>

                                {isPeriodDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-1.5 w-full sm:w-60 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn p-2 space-y-1">
                                        {academicPeriods.map((p) => {
                                            const isSelected = String(p.id) === String(period);
                                            return (
                                                <div
                                                    key={p.id}
                                                    onClick={() => {
                                                        setPeriod(String(p.id));
                                                        setIsPeriodDropdownOpen(false);
                                                        handleTriggerFilter(prodi, year, String(p.id));
                                                    }}
                                                    className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between text-[11px] ${
                                                        isSelected 
                                                            ? 'bg-purple-50 border border-purple-200 font-bold text-purple-950' 
                                                            : 'hover:bg-slate-50 text-slate-700'
                                                    }`}
                                                >
                                                    <div>
                                                        <span className="font-bold">{p.name}</span>
                                                        <span className="text-[10px] text-slate-400 block">{p.year_name}</span>
                                                    </div>
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-purple-600" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* 4. Dropdown Kelas / Rombel Popover */}
                            <div ref={classDropdownRef} className="relative w-full sm:w-36">
                                <button
                                    type="button"
                                    onClick={() => setIsClassDropdownOpen(prev => !prev)}
                                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition shadow-2xs cursor-pointer text-left border ${
                                        isClassDropdownOpen 
                                            ? 'border-emerald-400 ring-2 ring-emerald-500/30 bg-slate-800 text-white' 
                                            : selectedClass 
                                                ? 'border-emerald-500/50 bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-200 font-bold' 
                                                : 'border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center space-x-1.5 truncate">
                                        <Users className={`w-3.5 h-3.5 shrink-0 ${selectedClass ? 'text-emerald-400' : 'text-slate-400'}`} />
                                        <span className="truncate">{selectedClass ? selectedClass : 'Semua Kelas'}</span>
                                    </div>

                                    <div className="flex items-center space-x-1 shrink-0 ml-1">
                                        {selectedClass && (
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedClass('');
                                                    setIsClassDropdownOpen(false);
                                                    handleTriggerFilter(prodi, year, period, '');
                                                }}
                                                className="p-0.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
                                                title="Reset Kelas"
                                            >
                                                <X className="w-3 h-3" />
                                            </span>
                                        )}
                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                            isClassDropdownOpen ? 'rotate-180 text-emerald-400' : ''
                                        }`} />
                                    </div>
                                </button>

                                {isClassDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-1.5 w-full sm:w-48 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn p-2 space-y-1">
                                        <div
                                            onClick={() => {
                                                setSelectedClass('');
                                                setIsClassDropdownOpen(false);
                                                handleTriggerFilter(prodi, year, period, '');
                                            }}
                                            className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between text-[11px] ${
                                                !selectedClass 
                                                    ? 'bg-emerald-50 border border-emerald-200 font-bold text-emerald-950' 
                                                    : 'hover:bg-slate-50 text-slate-700'
                                            }`}
                                        >
                                            <span className="font-bold">Semua Kelas</span>
                                            {!selectedClass && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                        </div>
                                        {classNames.map((c) => {
                                            const isSelected = selectedClass === c;
                                            return (
                                                <div
                                                    key={c}
                                                    onClick={() => {
                                                        setSelectedClass(c);
                                                        setIsClassDropdownOpen(false);
                                                        handleTriggerFilter(prodi, year, period, c);
                                                    }}
                                                    className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between text-[11px] ${
                                                        isSelected 
                                                            ? 'bg-emerald-50 border border-emerald-200 font-bold text-emerald-950' 
                                                            : 'hover:bg-slate-50 text-slate-700'
                                                    }`}
                                                >
                                                    <span className="font-bold">{c}</span>
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Tombol Reset */}
                            {(prodi || year) && (
                                <button
                                    type="button"
                                    onClick={handleResetFilter}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer shrink-0"
                                    title="Reset Pilihan"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notification Toast */}
                {actionSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-between animate-fadeIn">
                        <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>{actionSuccessMsg}</span>
                        </div>
                        <button onClick={() => setActionSuccessMsg('')} className="text-emerald-600 hover:text-emerald-900">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* 2. STATS CARDS (4-GRID) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Total Mahasiswa</span>
                            <span className="p-1 bg-teal-100 text-teal-800 rounded-md"><Users className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-slate-900">{currentStats.total_students || 0} Orang</p>
                            <p className="text-[10px] text-slate-500">Angkatan {year || '-'}</p>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase">Telah Disetujui</span>
                            <span className="p-1 bg-emerald-100 text-emerald-800 rounded-md"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-emerald-700">{currentStats.approved || 0} Mahasiswa</p>
                            <p className="text-[10px] text-slate-500">KRS Aktif Kuliah</p>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-amber-600 uppercase">Menunggu Persetujuan</span>
                            <span className="p-1 bg-amber-100 text-amber-800 rounded-md"><Clock className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-amber-700">{currentStats.pending || 0} Mahasiswa</p>
                            <p className="text-[10px] text-slate-500">Perlu Verifikasi PA</p>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-rose-600 uppercase">Belum KRS</span>
                            <span className="p-1 bg-rose-100 text-rose-800 rounded-md"><XCircle className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-rose-700">{currentStats.not_submitted || 0} Mahasiswa</p>
                            <p className="text-[10px] text-slate-500">Belum Mengisi KRS</p>
                        </div>
                    </div>
                </div>

                {/* 3. TABEL DATA RENCANA STUDI (PERSIS SEPERTI GAMBAR REFERENSI akademik-krs-dll.png) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    {/* Filter Status Bar */}
                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter Status:</span>
                            {['', 'DISETUJUI', 'DIAJUKAN', 'BELUM_KRS'].map((st) => (
                                <button
                                    key={st}
                                    type="button"
                                    onClick={() => {
                                        setStatusFilter(st);
                                        fetchKrsData(prodi, year, period, selectedClass, st, search, 1);
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                                        statusFilter === st 
                                            ? 'bg-slate-900 text-white shadow-2xs' 
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    {st === '' ? 'Semua' : st === 'DISETUJUI' ? 'Disetujui' : st === 'DIAJUKAN' ? 'Menunggu' : 'Belum KRS'}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    fetchKrsData(prodi, year, period, selectedClass, statusFilter, e.target.value, 1);
                                }}
                                placeholder="Cari Nama / NIM..."
                                className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-800 text-white font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-3 px-3.5 text-center w-12 border-r border-slate-700">No.</th>
                                    <th className="py-3 px-3.5 text-center w-36 border-r border-slate-700">Aksi</th>
                                    <th className="py-3 px-3.5 border-r border-slate-700">NIM</th>
                                    <th className="py-3 px-3.5 border-r border-slate-700">Nama</th>
                                    <th className="py-3 px-3.5 text-center w-24 border-r border-slate-700">Angkatan</th>
                                    <th className="py-3 px-3.5 text-center w-28 border-r border-slate-700">Kelas</th>
                                    <th className="py-3 px-3.5 text-center w-24 border-r border-slate-700">SKS</th>
                                    <th className="py-3 px-3.5 text-center w-40">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {!isSelectionActive ? (
                                    <tr>
                                        <td colSpan="8" className="py-16 text-center text-slate-500">
                                            <div className="max-w-md mx-auto flex flex-col items-center">
                                                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                                                    <BookOpen className="w-6 h-6" />
                                                </div>
                                                <h4 className="font-bold text-slate-800 text-sm">Pilih Program Studi & Angkatan</h4>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Gunakan menu dropdown di bagian atas untuk menampilkan data rencana studi mahasiswa berdasarkan prodi, angkatan, semester, dan kelas.
                                                </p>
                                                <Link
                                                    href={`/admin/krs-approval/package${prodi && year ? `?study_program=${prodi}&academic_year=${year}&academic_period=${period}${selectedClass ? `&class_name=${selectedClass}` : ''}` : ''}`}
                                                    className="mt-4 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                                                >
                                                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                                                    <span>Buka Halaman Paket KRS Massal per Kelas</span>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : isLoadingData ? (
                                    <tr>
                                        <td colSpan="8" className="py-16 text-center text-slate-500">
                                            <div className="flex items-center justify-center space-x-2">
                                                <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                                                <span className="font-bold text-slate-700">Memuat data Rencana Studi...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : studentList.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-slate-400">
                                            Tidak ada data mahasiswa yang cocok dengan filter yang dipilih.
                                        </td>
                                    </tr>
                                ) : (
                                    studentList.map((stu, index) => {
                                        const isApproved = stu.status === 'DISETUJUI';
                                        const isPending = stu.status === 'DIAJUKAN';
                                        const isNotSubmitted = stu.status === 'BELUM_KRS';

                                        return (
                                            <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-2.5 px-3.5 text-center font-bold text-slate-500 border-r border-slate-100">
                                                    {((studentsData?.current_page || 1) - 1) * perPage + index + 1}
                                                </td>

                                                {/* Kolom Aksi Sesuai Referensi (Detail/Edit, Approve, Reject/Minus, Print) */}
                                                <td className="py-2.5 px-3 text-center border-r border-slate-100">
                                                    <div className="flex items-center justify-center space-x-1.5">
                                                        {/* 1. Edit / Kelola KRS (Tambah/Hapus MK) */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenManageModal(stu)}
                                                            className="p-1 text-teal-700 hover:text-teal-950 hover:bg-teal-100 rounded transition cursor-pointer"
                                                            title="Kelola & Tambah Mata Kuliah"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </button>

                                                        {/* 2. Detail Rencana Studi */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenManageModal(stu)}
                                                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition cursor-pointer"
                                                            title="Rincian Rencana Studi (KRS)"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>

                                                        {/* 3. Approve (Check) */}
                                                        {stu.krs_submission_id && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleApprove(stu.krs_submission_id)}
                                                                disabled={isApproved || isActionLoading}
                                                                className={`p-1 rounded transition cursor-pointer ${
                                                                    isApproved 
                                                                        ? 'text-emerald-300 cursor-not-allowed' 
                                                                        : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                                                                }`}
                                                                title="Setujui Rencana Studi (KRS)"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}

                                                        {/* 4. Reject / Cancel (Minus) */}
                                                        {stu.krs_submission_id && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setRejectTarget(stu);
                                                                    setIsRejectModalOpen(true);
                                                                }}
                                                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition cursor-pointer"
                                                                title="Tolak / Batalkan KRS"
                                                            >
                                                                <MinusCircle className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}

                                                        {/* 5. Print KRS PDF */}
                                                        {stu.krs_submission_id && (
                                                            <a
                                                                href={`/admin/krs-approval/${stu.krs_submission_id}/print-pdf`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition cursor-pointer"
                                                                title="Cetak Lembar KRS PDF Resmi"
                                                            >
                                                                <Printer className="w-3.5 h-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* NIM */}
                                                <td className="py-2.5 px-3.5 font-mono font-bold text-slate-800 border-r border-slate-100">
                                                    {stu.nim}
                                                </td>

                                                {/* Nama */}
                                                <td className="py-2.5 px-3.5 font-bold text-slate-900 border-r border-slate-100">
                                                    {stu.name}
                                                    {stu.advisor_name !== '-' && (
                                                        <span className="block text-[10px] font-normal text-slate-400">
                                                            PA: {stu.advisor_name}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Angkatan */}
                                                <td className="py-2.5 px-3.5 text-center font-bold text-slate-700 border-r border-slate-100">
                                                    {stu.batch_year}
                                                </td>

                                                {/* Kelas / Rombel */}
                                                <td className="py-2.5 px-3.5 text-center border-r border-slate-100">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                                        stu.class_type && stu.class_type !== '-'
                                                            ? 'bg-teal-50 text-teal-800 border border-teal-200' 
                                                            : 'text-slate-400'
                                                    }`}>
                                                        {stu.class_type || '-'}
                                                    </span>
                                                </td>

                                                {/* SKS */}
                                                <td className="py-2.5 px-3.5 text-center font-mono font-bold text-slate-800 border-r border-slate-100">
                                                    {stu.credits > 0 ? Number(stu.credits).toFixed(2) : '-'}
                                                </td>

                                                {/* Status (Telah Disetujui / Belum KRS / Menunggu) */}
                                                <td className="py-2.5 px-3.5 text-center">
                                                    {isApproved && (
                                                        <span className="font-bold text-emerald-600 text-xs">
                                                            Telah Disetujui
                                                        </span>
                                                    )}
                                                    {isPending && (
                                                        <span className="font-bold text-amber-600 text-xs">
                                                            Menunggu Approval
                                                        </span>
                                                    )}
                                                    {isNotSubmitted && (
                                                        <span className="font-bold text-rose-600 text-xs">
                                                            Belum KRS
                                                        </span>
                                                    )}
                                                    {stu.status === 'DRAFT' && (
                                                        <span className="font-bold text-slate-500 text-xs">
                                                            Draf Belum Submit
                                                        </span>
                                                    )}
                                                    {stu.status === 'DITOLAK' && (
                                                        <span className="font-bold text-rose-700 text-xs">
                                                            Perlu Revisi
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    {isSelectionActive && studentsData && studentsData.total > 0 && (
                        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                            <div>
                                Menampilkan <strong>{((studentsData.current_page - 1) * perPage) + 1}</strong> s.d. <strong>{Math.min(studentsData.total, studentsData.current_page * perPage)}</strong> dari <strong>{studentsData.total}</strong> mahasiswa
                            </div>
                            <div className="flex items-center space-x-1">
                                {Array.from({ length: studentsData.last_page }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => fetchKrsData(prodi, year, period, selectedClass, statusFilter, search, p)}
                                        className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                                            studentsData.current_page === p 
                                                ? 'bg-slate-900 text-white' 
                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL KELOLA & DETAIL RENCANA STUDI MAHASISWA (KRS) */}
            {isManageModalOpen && managingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp my-auto max-h-[92vh] flex flex-col">
                        {/* Header Gradient */}
                        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 border-b border-slate-700/60">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h3 className="text-sm sm:text-base font-black tracking-tight text-white">
                                            Kelola Rencana Studi: {managingStudent.name}
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                            NIM: {managingStudent.nim}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 mt-0.5">
                                        Program Studi: <strong className="text-teal-300">{managingStudent.study_program}</strong> • Angkatan: <strong className="text-white">{managingStudent.batch_year || year}</strong> • Periode: <strong className="text-white">{currentPeriod?.name || 'Aktif'}</strong>
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsManageModalOpen(false)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
                            {/* Feedback Notification (Toast-like alert in modal) */}
                            {modalFeedback && (
                                <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition animate-fadeIn ${
                                    modalFeedback.type === 'success' 
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                                        : 'bg-rose-50 border-rose-300 text-rose-900'
                                }`}>
                                    <div className="flex items-center space-x-2">
                                        {modalFeedback.type === 'success' ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                        )}
                                        <span>{modalFeedback.message}</span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setModalFeedback(null)}
                                        className="text-slate-400 hover:text-slate-700"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}

                            {isLoadingKrsDetails ? (
                                <div className="py-20 text-center text-slate-500">
                                    <Loader2 className="w-7 h-7 animate-spin text-teal-600 mx-auto mb-2" />
                                    <p className="text-xs font-bold text-slate-700">Memuat rincian rencana studi & katalog kelas...</p>
                                    <p className="text-[11px] text-slate-400">Sinkronisasi data mahasiswa dan jadwal perkuliahan</p>
                                </div>
                            ) : krsDetails ? (
                                <>
                                    {/* Strip Ringkasan & Tindakan Status Admin */}
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                                        {/* Status & Dosen PA */}
                                        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                                            <div>
                                                <span className="text-slate-400 text-[10px] block font-semibold uppercase tracking-wider">Status KRS</span>
                                                <div className="mt-0.5">
                                                    {krsDetails.status === 'DISETUJUI' && (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px]">
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                            <span>Disetujui</span>
                                                        </span>
                                                    )}
                                                    {krsDetails.status === 'DIAJUKAN' && (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[11px]">
                                                            <Clock className="w-3 h-3 text-amber-600" />
                                                            <span>Menunggu Approval</span>
                                                        </span>
                                                    )}
                                                    {krsDetails.status === 'BELUM_KRS' && (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[11px]">
                                                            <AlertCircle className="w-3 h-3 text-rose-600" />
                                                            <span>Belum Isi KRS</span>
                                                        </span>
                                                    )}
                                                    {krsDetails.status === 'DRAFT' && (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 border border-slate-300 font-bold text-[11px]">
                                                            <Edit3 className="w-3 h-3 text-slate-600" />
                                                            <span>Draf Belum Diajukan</span>
                                                        </span>
                                                    )}
                                                    {krsDetails.status === 'DITOLAK' && (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[11px]">
                                                            <XCircle className="w-3 h-3 text-rose-600" />
                                                            <span>Perlu Revisi</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="h-7 w-px bg-slate-200 hidden sm:block"></div>

                                            <div>
                                                <span className="text-slate-400 text-[10px] block font-semibold uppercase tracking-wider">Dosen Wali (PA)</span>
                                                <span className="font-bold text-slate-900 mt-0.5 block truncate max-w-[200px]">
                                                    {krsDetails.student?.advisor_name || '-'}
                                                </span>
                                            </div>

                                            <div className="h-7 w-px bg-slate-200 hidden sm:block"></div>

                                            {/* SKS Meter & Progress */}
                                            <div className="min-w-[160px]">
                                                <div className="flex items-center justify-between text-[11px] mb-1">
                                                    <span className="text-slate-500 font-semibold">Beban SKS:</span>
                                                    <span className="font-bold font-mono text-slate-900">
                                                        <strong className="text-teal-600 text-xs">{krsDetails.total_credits}</strong> / {krsDetails.max_credits} SKS
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-300 ${
                                                            krsDetails.total_credits > krsDetails.max_credits 
                                                                ? 'bg-rose-500' 
                                                                : krsDetails.total_credits >= 18 
                                                                    ? 'bg-emerald-500' 
                                                                    : 'bg-teal-500'
                                                        }`}
                                                        style={{ width: `${Math.min(100, (krsDetails.total_credits / (krsDetails.max_credits || 24)) * 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Quick Toggle Buttons */}
                                        <div className="flex items-center space-x-1.5 self-end md:self-center">
                                            {krsDetails.status !== 'DISETUJUI' && krsDetails.enrolled_items?.length > 0 && (
                                                <button
                                                    type="button"
                                                    disabled={isProcessingItem}
                                                    onClick={() => handleModalUpdateStatus('DISETUJUI')}
                                                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition flex items-center space-x-1 cursor-pointer disabled:opacity-50 shadow-xs"
                                                    title="Setujui KRS Mahasiswa Ini"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>Setujui KRS</span>
                                                </button>
                                            )}

                                            {krsDetails.status !== 'DITOLAK' && krsDetails.enrolled_items?.length > 0 && (
                                                <button
                                                    type="button"
                                                    disabled={isProcessingItem}
                                                    onClick={() => {
                                                        const notes = prompt('Catatan evaluasi revisi mahasiswa (opsional):', 'Silakan sesuaikan pilihan mata kuliah.');
                                                        if (notes !== null) {
                                                            handleModalUpdateStatus('DITOLAK', notes);
                                                        }
                                                    }}
                                                    className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold text-xs transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                                                    title="Minta Mahasiswa Melakukan Revisi"
                                                >
                                                    <MinusCircle className="w-3.5 h-3.5" />
                                                    <span>Revisi</span>
                                                </button>
                                            )}

                                            {krsDetails.status !== 'DRAFT' && (
                                                <button
                                                    type="button"
                                                    disabled={isProcessingItem}
                                                    onClick={() => handleModalUpdateStatus('DRAFT')}
                                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs transition cursor-pointer disabled:opacity-50"
                                                    title="Kembalikan ke Status Draf"
                                                >
                                                    <span>Draf</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* 1. BAGIAN DAFTAR RENCANA STUDI MAHASISWA (Mata Kuliah Terpilih) */}
                                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                                        <div className="bg-slate-100/90 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <BookOpen className="w-4 h-4 text-teal-700" />
                                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                                                    Daftar Rencana Studi Mahasiswa
                                                </h4>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                                                    {krsDetails.enrolled_items?.length || 0} Mata Kuliah Terpilih ({krsDetails.total_credits} SKS)
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-slate-500 italic hidden sm:inline">
                                                Klik tombol ikon merah <Trash2 className="w-3 h-3 inline text-rose-500" /> untuk menghapus mata kuliah dari KRS
                                            </span>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                                                        <th className="p-2.5 text-center w-12 border-r border-slate-200">Aksi</th>
                                                        <th className="p-2.5 text-center w-10 border-r border-slate-200">No.</th>
                                                        <th className="p-2.5 border-r border-slate-200">Kode MK</th>
                                                        <th className="p-2.5 border-r border-slate-200">Nama Mata Kuliah</th>
                                                        <th className="p-2.5 text-center w-14 border-r border-slate-200">SMT</th>
                                                        <th className="p-2.5 text-center w-14 border-r border-slate-200">Kelas</th>
                                                        <th className="p-2.5 text-center w-14 border-r border-slate-200">SKS</th>
                                                        <th className="p-2.5 border-r border-slate-200">Jadwal & Ruang</th>
                                                        <th className="p-2.5">Dosen Pengampu</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {krsDetails.enrolled_items && krsDetails.enrolled_items.length > 0 ? (
                                                        krsDetails.enrolled_items.map((item, idx) => (
                                                            <tr key={item.course_class_id || idx} className="hover:bg-slate-50/80 transition-colors">
                                                                <td className="p-2 text-center border-r border-slate-100">
                                                                    <button
                                                                        type="button"
                                                                        disabled={isProcessingItem}
                                                                        onClick={() => handleRemoveCourse(item.course_class_id, item.krs_item_id)}
                                                                        className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg transition cursor-pointer disabled:opacity-40"
                                                                        title="Hapus mata kuliah ini dari rencana studi"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </td>
                                                                <td className="p-2.5 text-center font-bold text-slate-400 border-r border-slate-100">
                                                                    {idx + 1}
                                                                </td>
                                                                <td className="p-2.5 font-mono font-bold text-slate-800 border-r border-slate-100">
                                                                    {item.course_code}
                                                                </td>
                                                                <td className="p-2.5 font-bold text-slate-900 border-r border-slate-100">
                                                                    {item.course_name}
                                                                </td>
                                                                <td className="p-2.5 text-center border-r border-slate-100">
                                                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                                                                        {item.semester_level || '-'}
                                                                    </span>
                                                                </td>
                                                                <td className="p-2.5 text-center border-r border-slate-100">
                                                                    <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-bold text-[11px] border border-teal-200">
                                                                        {item.class_name || 'A'}
                                                                    </span>
                                                                </td>
                                                                <td className="p-2.5 text-center font-mono font-bold text-teal-700 border-r border-slate-100">
                                                                    {Number(item.credits).toFixed(0)}
                                                                </td>
                                                                <td className="p-2.5 text-slate-600 text-[11px] border-r border-slate-100">
                                                                    {item.day_of_week ? (
                                                                        <span>
                                                                            {item.day_of_week}, {item.start_time?.slice(0, 5)}-{item.end_time?.slice(0, 5)} <span className="text-slate-400">({item.room_name || item.room_code || 'Ruang'})</span>
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-slate-400">Jadwal Reguler</span>
                                                                    )}
                                                                </td>
                                                                <td className="p-2.5 text-slate-700 font-medium text-[11px]">
                                                                    {item.lecturer_name || '-'}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="9" className="py-8 text-center bg-slate-50/50">
                                                                <div className="flex flex-col items-center justify-center space-y-1 text-slate-400">
                                                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                                                    <span className="font-bold text-slate-700 text-xs">Belum ada mata kuliah yang diambil</span>
                                                                    <p className="text-[11px]">
                                                                        Silakan pilih dan tambahkan mata kuliah yang tersedia pada katalog penawaran di bawah.
                                                                    </p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* 2. BAGIAN DAFTAR PENAWARAN MATA KULIAH (Katalog Kelas Tersedia) */}
                                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                                        <div className="bg-slate-100/90 px-3.5 py-2.5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                                            <div className="flex items-center space-x-2">
                                                <Layers className="w-4 h-4 text-teal-700" />
                                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                                                    Daftar Penawaran Mata Kuliah (Kelas Tersedia)
                                                </h4>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                                                    {filteredAvailableClasses.length} Kelas
                                                </span>
                                            </div>

                                            {/* Sub-toolbar: Search, Semester Tabs, and Batch Button */}
                                            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                                                {/* Search Box */}
                                                <div className="relative">
                                                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        value={searchAvailable}
                                                        onChange={(e) => setSearchAvailable(e.target.value)}
                                                        placeholder="Cari MK / Dosen / Kelas..."
                                                        className="pl-8 pr-3 py-1 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:border-teal-500 w-44"
                                                    />
                                                    {searchAvailable && (
                                                        <button 
                                                            onClick={() => setSearchAvailable('')} 
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Semester Filter Tabs */}
                                                <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFilterSemesterLevel('all')}
                                                        className={`px-2 py-0.5 rounded font-bold transition text-[11px] ${
                                                            filterSemesterLevel === 'all'
                                                                ? 'bg-slate-900 text-white'
                                                                : 'text-slate-600 hover:text-slate-900'
                                                        }`}
                                                    >
                                                        Semua SMT
                                                    </button>
                                                    {(krsDetails.available_semesters && krsDetails.available_semesters.length > 0 
                                                        ? krsDetails.available_semesters 
                                                        : [2, 4, 6]
                                                    ).map((sem) => (
                                                        <button
                                                            key={sem}
                                                            type="button"
                                                            onClick={() => setFilterSemesterLevel(String(sem))}
                                                            className={`px-2 py-0.5 rounded font-bold transition text-[11px] ${
                                                                String(filterSemesterLevel) === String(sem)
                                                                    ? 'bg-teal-700 text-white'
                                                                    : 'text-slate-600 hover:text-slate-900'
                                                            }`}
                                                        >
                                                            SMT {sem}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Select All Toggle Button */}
                                                {filteredAvailableClasses.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={handleToggleSelectAll}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer border ${
                                                            isAllFilteredSelected
                                                                ? 'bg-slate-800 text-white border-slate-700'
                                                                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
                                                        }`}
                                                        title={isAllFilteredSelected ? 'Batalkan pilihan seluruh mata kuliah' : 'Pilih seluruh mata kuliah di katalog ini'}
                                                    >
                                                        <CheckSquare className="w-3.5 h-3.5" />
                                                        <span>{isAllFilteredSelected ? 'Batal Pilih Semua' : `Pilih Semua (${filteredAvailableClasses.length})`}</span>
                                                    </button>
                                                )}

                                                {/* Batch Add Package Button */}
                                                {filterSemesterLevel !== 'all' && filteredAvailableClasses.length > 0 && (
                                                    <button
                                                        type="button"
                                                        disabled={isProcessingItem}
                                                        onClick={() => handleBatchAddPackage(filterSemesterLevel)}
                                                        className="px-2.5 py-1 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer disabled:opacity-50 shadow-xs"
                                                        title={`Ambil seluruh ${filteredAvailableClasses.length} mata kuliah Semester ${filterSemesterLevel} sekaligus`}
                                                    >
                                                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                                                        <span>Paket SMT {filterSemesterLevel} ({filteredAvailableClasses.length} MK)</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Floating / Inline Batch Selected Action Bar */}
                                        {selectedClassIds.length > 0 && (
                                            <div className="bg-teal-50/90 border-b border-teal-300/80 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-fadeIn">
                                                <div className="flex items-center space-x-2 text-xs">
                                                    <div className="p-1.5 bg-teal-600 text-white rounded-lg shadow-xs">
                                                        <CheckSquare className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-1.5 flex-wrap">
                                                            <span className="font-extrabold text-slate-900">
                                                                {selectedClassIds.length} Mata Kuliah Dipilih
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded-full bg-teal-200/80 text-teal-900 font-mono font-bold text-[11px]">
                                                                +{selectedCredits} SKS
                                                            </span>
                                                            <span className="text-slate-500 text-[11px]">
                                                                (Total akan menjadi: <strong className={((krsDetails.total_credits + selectedCredits) > (krsDetails.max_credits || 24)) ? 'text-rose-600 font-bold' : 'text-slate-800 font-bold'}>{(krsDetails.total_credits + selectedCredits)} SKS</strong> / Maks {krsDetails.max_credits || 24} SKS)
                                                            </span>
                                                        </div>
                                                        {((krsDetails.total_credits + selectedCredits) > (krsDetails.max_credits || 24)) && (
                                                            <p className="text-[11px] font-bold text-rose-600 mt-0.5">
                                                                ⚠️ Peringatan: Total SKS melebihi batas maksimal {krsDetails.max_credits || 24} SKS. Kurangi pilihan mata kuliah.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedClassIds([])}
                                                        className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                                                    >
                                                        Batal
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={isProcessingItem || ((krsDetails.total_credits + selectedCredits) > (krsDetails.max_credits || 24))}
                                                        onClick={handleAddSelectedCourses}
                                                        className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        <span>Tambahkan {selectedClassIds.length} MK Terpilih (+{selectedCredits} SKS)</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="overflow-x-auto max-h-72">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead className="sticky top-0 bg-slate-100 z-10">
                                                    <tr className="text-slate-700 font-bold border-b border-slate-200">
                                                        {/* Checkbox Header (Select All) */}
                                                        <th className="p-2.5 text-center w-10 border-r border-slate-200">
                                                            <input
                                                                type="checkbox"
                                                                checked={isAllFilteredSelected}
                                                                onChange={handleToggleSelectAll}
                                                                title="Pilih Semua Mata Kuliah Ditampilkan"
                                                                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                                                            />
                                                        </th>
                                                        <th className="p-2.5 text-center w-14 border-r border-slate-200" title="Tambah 1-1 Langsung">
                                                            Aksi (1-1)
                                                        </th>
                                                        <th className="p-2.5 text-center w-10 border-r border-slate-200">No.</th>
                                                        <th className="p-2.5 border-r border-slate-200">Kode MK</th>
                                                        <th className="p-2.5 border-r border-slate-200">Nama Mata Kuliah</th>
                                                        <th className="p-2.5 text-center w-14 border-r border-slate-200">SMT</th>
                                                        <th className="p-2.5 text-center w-14 border-r border-slate-200">Kelas</th>
                                                        <th className="p-2.5 text-center w-14 border-r border-slate-200">SKS</th>
                                                        <th className="p-2.5 border-r border-slate-200">Jadwal & Ruangan</th>
                                                        <th className="p-2.5 border-r border-slate-200">Dosen Pengampu</th>
                                                        <th className="p-2.5 text-center w-20">Kuota</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {filteredAvailableClasses.length > 0 ? (
                                                        filteredAvailableClasses.map((cls, idx) => {
                                                            const willExceed = (krsDetails.total_credits + cls.credits) > (krsDetails.max_credits || 24);
                                                            const isChecked = selectedClassIds.includes(cls.course_class_id);

                                                            return (
                                                                <tr 
                                                                    key={cls.course_class_id || idx} 
                                                                    className={`transition-colors ${
                                                                        isChecked 
                                                                            ? 'bg-teal-50/80' 
                                                                            : 'hover:bg-slate-50/80'
                                                                    }`}
                                                                >
                                                                    {/* 1. Checkbox Pilih 1-1 */}
                                                                    <td className="p-2 text-center border-r border-slate-100">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isChecked}
                                                                            onChange={() => handleToggleSelectCourse(cls.course_class_id)}
                                                                            title={`Pilih ${cls.course_name}`}
                                                                            className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                                                                        />
                                                                    </td>

                                                                    {/* 2. Tombol Aksi Tambah 1-1 Langsung */}
                                                                    <td className="p-2 text-center border-r border-slate-100">
                                                                        <button
                                                                            type="button"
                                                                            disabled={isProcessingItem || willExceed}
                                                                            onClick={() => handleAddCourse(cls.course_class_id)}
                                                                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                                                                                willExceed 
                                                                                    ? 'text-slate-300 bg-slate-100 cursor-not-allowed' 
                                                                                    : 'text-teal-700 bg-teal-50 hover:bg-teal-700 hover:text-white border border-teal-200'
                                                                            }`}
                                                                            title={willExceed ? 'Beban SKS melebihi batas maksimal' : `Tambahkan 1 MK ini: ${cls.course_name} (${cls.credits} SKS)`}
                                                                        >
                                                                            <Plus className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </td>

                                                                    <td className="p-2.5 text-center font-bold text-slate-400 border-r border-slate-100">
                                                                        {idx + 1}
                                                                    </td>
                                                                    <td className="p-2.5 font-mono font-bold text-slate-800 border-r border-slate-100">
                                                                        {cls.course_code}
                                                                    </td>
                                                                    <td className="p-2.5 font-bold text-slate-900 border-r border-slate-100">
                                                                        {cls.course_name}
                                                                    </td>
                                                                    <td className="p-2.5 text-center border-r border-slate-100">
                                                                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                                                                            {cls.semester_level || '-'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-2.5 text-center border-r border-slate-100">
                                                                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                                                                            {cls.class_name || 'A'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-2.5 text-center font-mono font-bold text-teal-700 border-r border-slate-100">
                                                                        {Number(cls.credits).toFixed(0)}
                                                                    </td>
                                                                    <td className="p-2.5 text-slate-600 text-[11px] border-r border-slate-100">
                                                                        {cls.day_of_week ? (
                                                                            <span>
                                                                                {cls.day_of_week}, {cls.start_time?.slice(0, 5)}-{cls.end_time?.slice(0, 5)} <span className="text-slate-400">({cls.room_name || cls.room_code || 'Ruang'})</span>
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-slate-400">Jadwal Reguler</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="p-2.5 text-slate-700 font-medium text-[11px] border-r border-slate-100">
                                                                        {cls.lecturer_name || '-'}
                                                                    </td>
                                                                    <td className="p-2.5 text-center text-[11px]">
                                                                        <span className="font-mono text-slate-600">
                                                                            {cls.enrolled_count || 0}/{cls.capacity || 40}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="11" className="py-8 text-center text-slate-400">
                                                                Tidak ada kelas perkuliahan yang cocok dengan filter atau seluruh kelas semester ini telah dipilih.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            ) : null}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                            <div>
                                {krsDetails?.submission?.id && (
                                    <a
                                        href={`/admin/krs-approval/${krsDetails.submission.id}/print-pdf`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                        <span>Cetak Lembar KRS PDF</span>
                                    </a>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-slate-600 hidden sm:inline">
                                    Total SKS Terpilih: <strong className="text-teal-700 font-mono">{krsDetails?.total_credits || 0} SKS</strong>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setIsManageModalOpen(false)}
                                    className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                                >
                                    Selesai / Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL REJECT / REVISI KRS */}
            {isRejectModalOpen && rejectTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp">
                        <div className="bg-gradient-to-r from-rose-900 to-slate-900 p-4 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <MinusCircle className="w-5 h-5 text-rose-400" />
                                <h3 className="text-sm font-black">Tolak / Minta Revisi KRS</h3>
                            </div>
                            <button onClick={() => setIsRejectModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmReject} className="p-4 space-y-3">
                            <p className="text-xs text-slate-600">
                                Berikan catatan evaluasi perbaikan untuk mahasiswa <strong>{rejectTarget.name}</strong> ({rejectTarget.nim}):
                            </p>
                            <textarea
                                value={rejectNotes}
                                onChange={(e) => setRejectNotes(e.target.value)}
                                rows="3"
                                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                placeholder="Tuliskan catatan revisi..."
                                required
                            />

                            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsRejectModalOpen(false)}
                                    className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isActionLoading}
                                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                                >
                                    {isActionLoading ? 'Memproses...' : 'Tolak & Kembalikan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
