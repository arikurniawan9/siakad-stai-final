import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Users, BookOpen, Layers, Search, Plus, Trash2, Edit2, 
    CheckCircle2, AlertTriangle, ChevronRight, Filter, 
    FileSpreadsheet, Sparkles, X, Save, GraduationCap, 
    ChevronDown, Check, UserCheck, School, ArrowRightLeft, 
    Info, BookMarked, UserPlus, Clock, Shield, Award,
    CheckCircle, HelpCircle, ExternalLink
} from 'lucide-react';

export default function LecturerAssignmentsIndex({
    academicPeriods = [],
    activePeriod = null,
    selectedPeriodId = 1,
    studyPrograms = [],
    selectedProgramId = 'ALL',
    lecturers = [],
    coursesWithClasses = [],
    stats = {},
    filters = {}
}) {
    // State View Mode: 'by_lecturer' (Dosen-Centric) | 'by_course' (Mata Kuliah-Centric)
    const [viewMode, setViewMode] = useState('by_lecturer');

    // Filter states
    const [periodId, setPeriodId] = useState(selectedPeriodId);
    const [prodiId, setProdiId] = useState(selectedProgramId);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Modal States
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isQuickClassModalOpen, setIsQuickClassModalOpen] = useState(false);
    const [selectedLecturer, setSelectedLecturer] = useState(null);
    const [selectedCourseForClass, setSelectedCourseForClass] = useState(null);
    const [assignmentToRemove, setAssignmentToRemove] = useState(null);

    // Form Assign Mata Kuliah ke Dosen
    const assignForm = useForm({
        lecturer_id: '',
        academic_period_id: periodId,
        course_ids: [],
        course_class_ids: [],
        is_primary: true,
    });

    // Form Quick Class
    const quickClassForm = useForm({
        academic_period_id: periodId,
        course_id: '',
        class_name: 'Kelas B',
        lecturer_id: '',
        capacity: 35,
        delivery_mode: 'TATAP_MUKA',
        is_primary: true,
    });

    // Search filter untuk pemilihan mata kuliah di dalam modal
    const [modalCourseSearch, setModalCourseSearch] = useState('');
    const [modalCourseProdiFilter, setModalCourseProdiFilter] = useState('ALL');

    // Update form period_id ketika filter period berubah
    useEffect(() => {
        assignForm.setData('academic_period_id', periodId);
        quickClassForm.setData('academic_period_id', periodId);
    }, [periodId]);

    // Handle Period Change
    const handlePeriodChange = (newPeriodId) => {
        setPeriodId(newPeriodId);
        router.get('/admin/lecturer-assignments', {
            period_id: newPeriodId,
            program_id: prodiId,
            search: searchTerm,
        }, { preserveState: true, preserveScroll: true });
    };

    // Handle Prodi Change
    const handleProdiChange = (newProdiId) => {
        setProdiId(newProdiId);
        router.get('/admin/lecturer-assignments', {
            period_id: periodId,
            program_id: newProdiId,
            search: searchTerm,
        }, { preserveState: true, preserveScroll: true });
    };

    // Handle Search Submit
    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/lecturer-assignments', {
            period_id: periodId,
            program_id: prodiId,
            search: searchTerm,
        }, { preserveState: true, preserveScroll: true });
    };

    // Buka Modal Assign untuk dosen tertentu
    const handleOpenAssignModal = (lecturer = null) => {
        if (lecturer) {
            assignForm.setData({
                lecturer_id: lecturer.id,
                academic_period_id: periodId,
                course_ids: [],
                course_class_ids: [],
                is_primary: true,
            });
            setSelectedLecturer(lecturer);
        } else {
            assignForm.reset();
            assignForm.setData('academic_period_id', periodId);
            setSelectedLecturer(null);
        }
        setModalCourseSearch('');
        setModalCourseProdiFilter('ALL');
        setIsAssignModalOpen(true);
    };

    // Buka Modal Detail Penugasan Dosen
    const handleOpenDetailModal = (lecturer) => {
        setSelectedLecturer(lecturer);
        setIsDetailModalOpen(true);
    };

    // Buka Modal Quick Class untuk mata kuliah tertentu
    const handleOpenQuickClassModal = (course) => {
        setSelectedCourseForClass(course);
        quickClassForm.setData({
            academic_period_id: periodId,
            course_id: course.id,
            class_name: `Kelas ${String.fromCharCode(65 + (course.classes?.length || 0))}`,
            lecturer_id: lecturers[0]?.id || '',
            capacity: 35,
            delivery_mode: 'TATAP_MUKA',
            is_primary: true,
        });
        setIsQuickClassModalOpen(true);
    };

    // Toggle pemilihan Course ID di Modal Assign
    const toggleCourseSelection = (courseId) => {
        const current = [...assignForm.data.course_ids];
        const index = current.indexOf(courseId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(courseId);
        }
        assignForm.setData('course_ids', current);
    };

    // Pilih Semua / Kosongkan Mata Kuliah yang difilter
    const handleSelectAllFilteredCourses = (filteredList) => {
        const filteredIds = filteredList.map(c => c.id);
        const allSelected = filteredIds.every(id => assignForm.data.course_ids.includes(id));
        if (allSelected) {
            // Deselect all filtered
            assignForm.setData('course_ids', assignForm.data.course_ids.filter(id => !filteredIds.includes(id)));
        } else {
            // Select all filtered
            const combined = Array.from(new Set([...assignForm.data.course_ids, ...filteredIds]));
            assignForm.setData('course_ids', combined);
        }
    };

    // Submit Penugasan
    const submitAssign = (e) => {
        e.preventDefault();
        assignForm.post('/admin/lecturer-assignments/assign', {
            preserveScroll: true,
            onSuccess: () => {
                setIsAssignModalOpen(false);
                assignForm.reset();
            }
        });
    };

    // Submit Quick Class
    const submitQuickClass = (e) => {
        e.preventDefault();
        quickClassForm.post('/admin/lecturer-assignments/quick-class', {
            preserveScroll: true,
            onSuccess: () => {
                setIsQuickClassModalOpen(false);
                quickClassForm.reset();
            }
        });
    };

    // Eksekusi Pencabutan Penugasan
    const executeRemoveAssignment = () => {
        if (!assignmentToRemove) return;
        router.delete('/admin/lecturer-assignments/remove', {
            data: {
                course_class_id: assignmentToRemove.course_class_id,
                lecturer_id: assignmentToRemove.lecturer_id,
            },
            preserveScroll: true,
            onSuccess: () => {
                setAssignmentToRemove(null);
                // Update selectedLecturer jika modal detail sedang terbuka
                if (selectedLecturer) {
                    const updatedClasses = selectedLecturer.assigned_classes.filter(
                        c => c.course_class_id !== assignmentToRemove.course_class_id
                    );
                    setSelectedLecturer({
                        ...selectedLecturer,
                        assigned_classes: updatedClasses,
                        assigned_classes_count: updatedClasses.length,
                        total_credits: updatedClasses.reduce((acc, curr) => acc + Number(curr.credits || 0), 0)
                    });
                }
            }
        });
    };

    // Filter daftar mata kuliah di modal
    const filteredModalCourses = useMemo(() => {
        return coursesWithClasses.filter(c => {
            const matchesSearch = !modalCourseSearch 
                || c.name.toLowerCase().includes(modalCourseSearch.toLowerCase())
                || c.code.toLowerCase().includes(modalCourseSearch.toLowerCase());
            
            const matchesProdi = modalCourseProdiFilter === 'ALL' 
                || String(c.study_program_id) === String(modalCourseProdiFilter);

            return matchesSearch && matchesProdi;
        });
    }, [coursesWithClasses, modalCourseSearch, modalCourseProdiFilter]);

    // Kalkulasi Total SKS terpilih di modal
    const selectedCreditsCount = useMemo(() => {
        const selectedCourses = coursesWithClasses.filter(c => assignForm.data.course_ids.includes(c.id));
        return selectedCourses.reduce((sum, c) => sum + Number(c.credits || 0), 0);
    }, [coursesWithClasses, assignForm.data.course_ids]);

    // Format Dosen Aktif Terpilih di Modal
    const activeModalLecturer = useMemo(() => {
        return lecturers.find(l => String(l.id) === String(assignForm.data.lecturer_id)) || selectedLecturer;
    }, [lecturers, assignForm.data.lecturer_id, selectedLecturer]);

    return (
        <AppLayout title="Plotting Dosen Pengampu Mata Kuliah">
            <Head title="Plotting Dosen Pengampu Mata Kuliah - SIAKAD STAI Al-Ittihad" />

            <div className="space-y-6 pb-12">
                {/* HEADER SECTION */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                    Penugasan Pengajaran Semester
                                </span>
                                {activePeriod && (
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold tracking-wider">
                                        Periode: {activePeriod.name}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                                <UserCheck className="w-8 h-8 text-indigo-400" />
                                Plotting Dosen Pengampu Mata Kuliah
                            </h1>
                            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
                                Hubungkan dan relasikan setiap dosen pendidik dengan berbagai mata kuliah dan kelas perkuliahan. 
                                Satu dosen dapat memegang beberapa mata kuliah sekaligus dengan akumulasi beban SKS otomatis.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <a
                                href={`/admin/lecturer-assignments/export-excel?period_id=${periodId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-sm hover:shadow"
                            >
                                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                                Ekspor Rekap Excel
                            </a>

                            <button
                                onClick={() => handleOpenAssignModal()}
                                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition hover:scale-[1.02] cursor-pointer"
                            >
                                <UserPlus className="w-4 h-4" />
                                + Tugaskan Mata Kuliah
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4 STATS KPI CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* CARD 1: Dosen Aktif */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dosen Aktif Mengajar</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-black text-slate-900">{stats.active_teaching_lecturers || 0}</h3>
                                <span className="text-xs font-semibold text-slate-400">dari {stats.total_lecturers || 0} Dosen</span>
                            </div>
                            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                {stats.total_lecturers ? Math.round(((stats.active_teaching_lecturers || 0) / stats.total_lecturers) * 100) : 0}% terplot semester ini
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>

                    {/* CARD 2: Mata Kuliah */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mata Kuliah Ditawarkan</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-black text-slate-900">{stats.total_courses_offered || 0}</h3>
                                <span className="text-xs font-semibold text-slate-400">Mata Kuliah</span>
                            </div>
                            <p className="text-[11px] text-indigo-600 font-bold flex items-center gap-1">
                                <Award className="w-3.5 h-3.5" />
                                Total Beban: {stats.total_credits_taught || 0} SKS
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                            <BookOpen className="w-6 h-6" />
                        </div>
                    </div>

                    {/* CARD 3: Kelas Terdistribusi */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kelas Perkuliahan</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-black text-slate-900">{stats.total_classes_offered || 0}</h3>
                                <span className="text-xs font-semibold text-slate-400">Rombel / Kelas</span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">
                                Mode: Tatap Muka & Hybrid
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                            <Layers className="w-6 h-6" />
                        </div>
                    </div>

                    {/* CARD 4: Kelas Belum Ada Dosen */}
                    <div className={`rounded-2xl p-5 border shadow-sm flex items-center justify-between ${
                        (stats.unassigned_classes_count || 0) > 0 
                            ? 'bg-amber-50/50 border-amber-200' 
                            : 'bg-white border-slate-200/80'
                    }`}>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kelas Belum Terplot</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className={`text-2xl font-black ${
                                    (stats.unassigned_classes_count || 0) > 0 ? 'text-amber-700' : 'text-slate-900'
                                }`}>
                                    {stats.unassigned_classes_count || 0}
                                </h3>
                                <span className="text-xs font-semibold text-slate-400">Kelas</span>
                            </div>
                            <p className={`text-[11px] font-bold flex items-center gap-1 ${
                                (stats.unassigned_classes_count || 0) > 0 ? 'text-amber-600' : 'text-emerald-600'
                            }`}>
                                {(stats.unassigned_classes_count || 0) > 0 ? (
                                    <>
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        Perlu ditentukan dosen pengampu
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Seluruh kelas telah terisi dosen
                                    </>
                                )}
                            </p>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
                            (stats.unassigned_classes_count || 0) > 0 
                                ? 'bg-amber-100 border-amber-200 text-amber-700' 
                                : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        }`}>
                            <Shield className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* CONTROLS & FILTER TOOLBAR */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* VIEW MODE TOGGLE */}
                        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                            <button
                                onClick={() => setViewMode('by_lecturer')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                    viewMode === 'by_lecturer'
                                        ? 'bg-white text-indigo-700 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Users className="w-4 h-4" />
                                Berdasarkan Dosen ({lecturers.length})
                            </button>
                            <button
                                onClick={() => setViewMode('by_course')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                    viewMode === 'by_course'
                                        ? 'bg-white text-indigo-700 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <BookOpen className="w-4 h-4" />
                                Berdasarkan Mata Kuliah ({coursesWithClasses.length})
                            </button>
                        </div>

                        {/* SELECTORS (PERIODE & PRODI) */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Periode Selector */}
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                                <School className="w-3.5 h-3.5 text-slate-500" />
                                <span className="text-slate-500 font-medium">Periode:</span>
                                <select
                                    value={periodId}
                                    onChange={(e) => handlePeriodChange(e.target.value)}
                                    className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer text-xs"
                                >
                                    {academicPeriods.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} {p.is_active ? '★ (Aktif)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Prodi Selector */}
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                                <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                                <span className="text-slate-500 font-medium">Prodi:</span>
                                <select
                                    value={prodiId}
                                    onChange={(e) => handleProdiChange(e.target.value)}
                                    className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer text-xs"
                                >
                                    <option value="ALL">Semua Program Studi</option>
                                    {studyPrograms.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.degree})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SEARCH BOX */}
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={
                                viewMode === 'by_lecturer'
                                    ? "Cari nama dosen pengampu, NIDN, atau email institusi..."
                                    : "Cari nama mata kuliah, kode MK, atau kelas perkuliahan..."
                            }
                            className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition outline-none"
                        />
                        <button
                            type="submit"
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {/* ========================================================= */}
                {/* VIEW MODE 1: BERDASARKAN DOSEN (DOSEN-CENTRIC)             */}
                {/* ========================================================= */}
                {viewMode === 'by_lecturer' && (
                    <div className="space-y-4">
                        {lecturers.length === 0 ? (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
                                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                                <h3 className="text-base font-bold text-slate-700">Tidak ada data dosen ditemukan</h3>
                                <p className="text-xs text-slate-500 max-w-md mx-auto">
                                    Coba ubah kata kunci pencarian atau filter program studi untuk menampilkan dosen lainnya.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {lecturers.map((lec) => {
                                    const hasClasses = lec.assigned_classes && lec.assigned_classes.length > 0;
                                    const totalSks = lec.total_credits || 0;

                                    return (
                                        <div 
                                            key={lec.id}
                                            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition p-5 space-y-4 flex flex-col justify-between"
                                        >
                                            <div className="space-y-3">
                                                {/* DOSEN HEADER */}
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                                                            {lec.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <h4 className="font-bold text-slate-900 text-sm leading-snug">
                                                                {lec.name}
                                                            </h4>
                                                            <p className="font-mono text-xs text-slate-500">
                                                                NIDN: <span className="font-bold text-slate-700">{lec.identity_number || '-'}</span>
                                                            </p>
                                                            <p className="text-[11px] text-slate-500">
                                                                Homebase: <span className="font-medium text-slate-700">{lec.study_program || '-'}</span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* BEBAN SKS BADGE */}
                                                    <div className="text-right shrink-0">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black ${
                                                            totalSks >= 12 && totalSks <= 16
                                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                                : totalSks > 16
                                                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                                    : totalSks > 0
                                                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                        }`}>
                                                            <Award className="w-3.5 h-3.5" />
                                                            {totalSks} SKS
                                                        </span>
                                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                                            {lec.assigned_classes_count || 0} Kelas ({lec.assigned_courses_count || 0} MK)
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* DAFTAR MATA KULIAH YANG DIAMPU */}
                                                <div className="pt-2 border-t border-slate-100">
                                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                        Mata Kuliah Diampu Semester Ini:
                                                    </p>

                                                    {hasClasses ? (
                                                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                                                            {lec.assigned_classes.map((cls) => (
                                                                <div 
                                                                    key={cls.class_lecturer_id}
                                                                    className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/70 rounded-lg text-xs text-indigo-900 transition"
                                                                >
                                                                    <BookMarked className="w-3 h-3 text-indigo-600 shrink-0" />
                                                                    <span className="font-bold">{cls.course_name}</span>
                                                                    <span className="px-1 py-0.2 bg-indigo-200/60 text-indigo-800 font-mono text-[10px] rounded">
                                                                        {cls.class_name}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-indigo-600">
                                                                        ({cls.credits} SKS)
                                                                    </span>
                                                                    <button
                                                                        onClick={() => setAssignmentToRemove({
                                                                            course_class_id: cls.course_class_id,
                                                                            lecturer_id: lec.id,
                                                                            course_name: cls.course_name,
                                                                            class_name: cls.class_name,
                                                                            lecturer_name: lec.name
                                                                        })}
                                                                        title="Cabut penugasan mata kuliah ini"
                                                                        className="ml-1 text-slate-400 hover:text-rose-600 transition"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="py-2.5 px-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
                                                            <p className="text-xs text-slate-400 font-medium">
                                                                Belum ada mata kuliah yang ditugaskan pada semester ini.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* ACTION BUTTONS PER DOSEN */}
                                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                                <button
                                                    onClick={() => handleOpenDetailModal(lec)}
                                                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <Info className="w-3.5 h-3.5 text-slate-500" />
                                                    Detail & Rekap
                                                </button>

                                                <button
                                                    onClick={() => handleOpenAssignModal(lec)}
                                                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <Plus className="w-3.5 h-3.5 text-indigo-600" />
                                                    + Tambah Mata Kuliah
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ========================================================= */}
                {/* VIEW MODE 2: BERDASARKAN MATA KULIAH (COURSE-CENTRIC)      */}
                {/* ========================================================= */}
                {viewMode === 'by_course' && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                    Katalog Mata Kuliah & Dosen Pengampu
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Daftar mata kuliah aktif dan kelas-kelasnya beserta dosen yang telah ditugaskan.
                                </p>
                            </div>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                                {coursesWithClasses.length} Mata Kuliah
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="py-3 px-4 w-12 text-center">No</th>
                                        <th className="py-3 px-4 w-28">Kode MK</th>
                                        <th className="py-3 px-4">Nama Mata Kuliah</th>
                                        <th className="py-3 px-4 text-center w-20">SKS</th>
                                        <th className="py-3 px-4 text-center w-20">Semester</th>
                                        <th className="py-3 px-4">Program Studi</th>
                                        <th className="py-3 px-4 min-w-[320px]">Kelas & Dosen Pengampu</th>
                                        <th className="py-3 px-4 text-right w-36">Aksi Cepat</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {coursesWithClasses.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-12 text-center text-slate-400">
                                                <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                                <p className="font-bold text-slate-600">Tidak ada data mata kuliah.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        coursesWithClasses.map((course, idx) => (
                                            <tr key={course.id} className="hover:bg-slate-50/50 transition">
                                                <td className="py-3 px-4 text-center font-bold text-slate-400">
                                                    {idx + 1}
                                                </td>
                                                <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                                                    {course.code}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-bold text-slate-900">{course.name}</p>
                                                    <span className="text-[10px] text-slate-400">{course.course_type}</span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="px-2 py-0.5 bg-slate-100 font-black text-slate-800 rounded border border-slate-200 text-[11px]">
                                                        {course.credits} SKS
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center text-slate-600 font-bold">
                                                    Smt {course.semester_level || '-'}
                                                </td>
                                                <td className="py-3 px-4 text-slate-600 font-medium">
                                                    {course.study_program_name || '-'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {course.classes && course.classes.length > 0 ? (
                                                        <div className="space-y-1.5">
                                                            {course.classes.map((cls) => {
                                                                const hasLec = cls.lecturers && cls.lecturers.length > 0;
                                                                return (
                                                                    <div 
                                                                        key={cls.id}
                                                                        className="flex items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                                                                                {cls.name}
                                                                            </span>
                                                                            {hasLec ? (
                                                                                cls.lecturers.map((l) => (
                                                                                    <span key={l.class_lecturer_id} className="font-bold text-indigo-900 flex items-center gap-1">
                                                                                        <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                                                                                        {l.lecturer_name}
                                                                                        <button
                                                                                            onClick={() => setAssignmentToRemove({
                                                                                                course_class_id: cls.id,
                                                                                                lecturer_id: l.lecturer_id,
                                                                                                course_name: course.name,
                                                                                                class_name: cls.name,
                                                                                                lecturer_name: l.lecturer_name
                                                                                            })}
                                                                                            title="Cabut dosen dari kelas ini"
                                                                                            className="text-slate-400 hover:text-rose-600 transition"
                                                                                        >
                                                                                            <X className="w-3 h-3" />
                                                                                        </button>
                                                                                    </span>
                                                                                ))
                                                                            ) : (
                                                                                <span className="text-amber-700 font-bold text-[11px] flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                                                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                                                                                    Belum Ada Dosen
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-[10px] text-slate-400 shrink-0">
                                                                            {cls.enrolled_count || 0} Mhs
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-xs">
                                                            Belum ada rombel kelas yang dibuka
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        onClick={() => handleOpenQuickClassModal(course)}
                                                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                                                    >
                                                        <Plus className="w-3.5 h-3.5 text-indigo-600" />
                                                        Buka Kelas
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================================= */}
            {/* MODAL 1: TUGASKAN MATA KULIAH KE DOSEN                    */}
            {/* ========================================================= */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* MODAL HEADER */}
                        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-indigo-900/40">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-white">
                                        Plotting Mata Kuliah ke Dosen
                                    </h3>
                                    <p className="text-xs text-indigo-200/80">
                                        Tugaskan satu dosen untuk mengampu satu atau beberapa mata kuliah sekaligus.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAssignModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* MODAL FORM BODY */}
                        <form onSubmit={submitAssign} className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* PILIH DOSEN */}
                            <div>
                                <label className="block font-bold text-slate-700 text-xs mb-1.5">
                                    Pilih Dosen Pendidik <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={assignForm.data.lecturer_id}
                                    onChange={(e) => assignForm.setData('lecturer_id', e.target.value)}
                                    required
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="">-- Pilih Dosen Pengampu --</option>
                                    {lecturers.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.name} {l.identity_number ? `(NIDN: ${l.identity_number})` : ''} - {l.study_program || 'Umum'} [{l.total_credits || 0} SKS]
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* PERAN DOSEN (Dosen Utama vs Team Teaching) */}
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-900">Peran Pengampu Kuliah</p>
                                    <p className="text-[11px] text-slate-500">Tentukan apakah sebagai dosen utama atau tim pengajar.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="is_primary"
                                            checked={assignForm.data.is_primary === true}
                                            onChange={() => assignForm.setData('is_primary', true)}
                                            className="text-indigo-600 focus:ring-indigo-500"
                                        />
                                        Dosen Utama
                                    </label>
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="is_primary"
                                            checked={assignForm.data.is_primary === false}
                                            onChange={() => assignForm.setData('is_primary', false)}
                                            className="text-indigo-600 focus:ring-indigo-500"
                                        />
                                        Team Teaching
                                    </label>
                                </div>
                            </div>

                            {/* PILIH MATA KULIAH CHECKLIST SECTION */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block font-bold text-slate-800 text-xs">
                                            Pilih Mata Kuliah yang Akan Diampu <span className="text-rose-500">*</span>
                                        </label>
                                        <span className="text-[11px] text-slate-500">
                                            Centang satu atau lebih mata kuliah di bawah ini.
                                        </span>
                                    </div>
                                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-black">
                                        {assignForm.data.course_ids.length} MK Dipilih ({selectedCreditsCount} SKS)
                                    </span>
                                </div>

                                {/* SEARCH & FILTER MATA KULIAH DALAM MODAL */}
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={modalCourseSearch}
                                            onChange={(e) => setModalCourseSearch(e.target.value)}
                                            placeholder="Cari mata kuliah..."
                                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500"
                                        />
                                    </div>
                                    <select
                                        value={modalCourseProdiFilter}
                                        onChange={(e) => setModalCourseProdiFilter(e.target.value)}
                                        className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
                                    >
                                        <option value="ALL">Semua Prodi</option>
                                        {studyPrograms.map((p) => (
                                            <option key={p.id} value={p.id}>{p.code}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectAllFilteredCourses(filteredModalCourses)}
                                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer"
                                    >
                                        Pilih Semua
                                    </button>
                                </div>

                                {/* LIST MATA KULIAH CHECKBOXES */}
                                <div className="border border-slate-200 rounded-xl max-h-56 overflow-y-auto divide-y divide-slate-100 p-1 bg-slate-50/50">
                                    {filteredModalCourses.length === 0 ? (
                                        <div className="py-6 text-center text-slate-400 text-xs font-medium">
                                            Tidak ada mata kuliah yang cocok dengan pencarian.
                                        </div>
                                    ) : (
                                        filteredModalCourses.map((c) => {
                                            const isChecked = assignForm.data.course_ids.includes(c.id);
                                            return (
                                                <label 
                                                    key={c.id}
                                                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition text-xs ${
                                                        isChecked ? 'bg-indigo-50/80 border border-indigo-200/80' : 'hover:bg-slate-100'
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-2.5">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => toggleCourseSelection(c.id)}
                                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                                        />
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1 rounded">
                                                                    {c.code}
                                                                </span>
                                                                <span className="font-bold text-slate-900">{c.name}</span>
                                                            </div>
                                                            <span className="text-[10px] text-slate-400">
                                                                {c.study_program_name} • Smt {c.semester_level}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 font-black rounded text-[10px] shrink-0">
                                                        {c.credits} SKS
                                                    </span>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* MODAL FOOTER */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setIsAssignModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={assignForm.processing || assignForm.data.course_ids.length === 0 || !assignForm.data.lecturer_id}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer"
                                >
                                    <Save className="w-4 h-4" />
                                    {assignForm.processing ? 'Menyimpan...' : 'Simpan Penugasan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 2: DETAIL PENUGASAN DOSEN                           */}
            {/* ========================================================= */}
            {isDetailModalOpen && selectedLecturer && (
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* HEADER */}
                        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                                    <Info className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-white">
                                        Rekap Penugasan Mengajar
                                    </h3>
                                    <p className="text-xs text-indigo-200/80">
                                        {selectedLecturer.name} (NIDN: {selectedLecturer.identity_number || '-'})
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="p-6 overflow-y-auto space-y-4 flex-1">
                            {/* RINGKASAN STATS */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Mata Kuliah</p>
                                    <p className="text-lg font-black text-slate-900">{selectedLecturer.assigned_courses_count || 0}</p>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Kelas Perkuliahan</p>
                                    <p className="text-lg font-black text-slate-900">{selectedLecturer.assigned_classes_count || 0}</p>
                                </div>
                                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase">Beban SKS</p>
                                    <p className="text-lg font-black text-indigo-900">{selectedLecturer.total_credits || 0} SKS</p>
                                </div>
                            </div>

                            {/* TABEL LIST KELAS YANG DIAMPU */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                                            <th className="py-2.5 px-3">Kode & Mata Kuliah</th>
                                            <th className="py-2.5 px-3 text-center">Kelas</th>
                                            <th className="py-2.5 px-3 text-center">SKS</th>
                                            <th className="py-2.5 px-3 text-center">Peserta</th>
                                            <th className="py-2.5 px-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(!selectedLecturer.assigned_classes || selectedLecturer.assigned_classes.length === 0) ? (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                                                    Belum ada mata kuliah yang diampu dosen ini.
                                                </td>
                                            </tr>
                                        ) : (
                                            selectedLecturer.assigned_classes.map((cls) => (
                                                <tr key={cls.class_lecturer_id} className="hover:bg-slate-50">
                                                    <td className="py-2.5 px-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1 rounded">
                                                                {cls.course_code}
                                                            </span>
                                                            <span className="font-bold text-slate-900">{cls.course_name}</span>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400">{cls.study_program_name}</span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                                                        {cls.class_name}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center font-bold text-indigo-700">
                                                        {cls.credits}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center text-slate-600">
                                                        {cls.enrolled_count || 0} mhs
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right">
                                                        <button
                                                            onClick={() => setAssignmentToRemove({
                                                                course_class_id: cls.course_class_id,
                                                                lecturer_id: selectedLecturer.id,
                                                                course_name: cls.course_name,
                                                                class_name: cls.class_name,
                                                                lecturer_name: selectedLecturer.name
                                                            })}
                                                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-bold transition cursor-pointer"
                                                        >
                                                            Cabut
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                            <button
                                onClick={() => {
                                    setIsDetailModalOpen(false);
                                    handleOpenAssignModal(selectedLecturer);
                                }}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                + Tambah Mata Kuliah Lagi
                            </button>
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 3: QUICK CREATE CLASS & ASSIGN LECTURER             */}
            {/* ========================================================= */}
            {isQuickClassModalOpen && selectedCourseForClass && (
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-white">Buka Kelas Perkuliahan</h3>
                                    <p className="text-xs text-indigo-200/80">{selectedCourseForClass.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsQuickClassModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitQuickClass} className="p-6 space-y-4">
                            <div>
                                <label className="block font-bold text-slate-700 text-xs mb-1">
                                    Nama Rombel / Kelas <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={quickClassForm.data.class_name}
                                    onChange={(e) => quickClassForm.setData('class_name', e.target.value)}
                                    placeholder="e.g. Kelas A / Kelas B / Reguler"
                                    required
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 text-xs mb-1">
                                    Dosen Pengampu Kelas <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={quickClassForm.data.lecturer_id}
                                    onChange={(e) => quickClassForm.setData('lecturer_id', e.target.value)}
                                    required
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                                >
                                    <option value="">-- Pilih Dosen --</option>
                                    {lecturers.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.name} {l.identity_number ? `(${l.identity_number})` : ''} [{l.total_credits || 0} SKS]
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 text-xs mb-1">Kapasitas</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="200"
                                        value={quickClassForm.data.capacity}
                                        onChange={(e) => quickClassForm.setData('capacity', e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 text-xs mb-1">Metode</label>
                                    <select
                                        value={quickClassForm.data.delivery_mode}
                                        onChange={(e) => quickClassForm.setData('delivery_mode', e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                                    >
                                        <option value="TATAP_MUKA">Tatap Muka</option>
                                        <option value="DARING">Daring</option>
                                        <option value="HYBRID">Hybrid</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setIsQuickClassModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={quickClassForm.processing}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
                                >
                                    <Save className="w-4 h-4" />
                                    Simpan Kelas & Dosen
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 4: KONFIRMASI CABUT PENUGASAN                       */}
            {/* ========================================================= */}
            {assignmentToRemove && (
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="font-bold text-base text-slate-900">Cabut Penugasan Dosen?</h3>
                            <p className="text-xs text-slate-500">
                                Anda akan mencabut penugasan <strong className="text-slate-800">{assignmentToRemove.lecturer_name}</strong> dari mata kuliah <strong className="text-indigo-600">{assignmentToRemove.course_name} ({assignmentToRemove.class_name})</strong>.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setAssignmentToRemove(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                                Batalkan
                            </button>
                            <button
                                type="button"
                                onClick={executeRemoveAssignment}
                                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-rose-600/20"
                            >
                                <Trash2 className="w-4 h-4" />
                                Ya, Cabut Penugasan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
