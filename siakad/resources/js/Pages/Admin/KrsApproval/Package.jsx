import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Users, BookOpen, Check, X, Search, CheckSquare, Square, 
    Layers, Building, Calendar, Sparkles, AlertCircle, Loader2, 
    RefreshCw, ChevronDown, CheckCircle2, ShieldCheck, Zap, 
    Filter, ArrowRight, UserCheck, CheckCheck, ChevronLeft,
    GraduationCap, Eye, ExternalLink
} from 'lucide-react';

export default function KrsPackageIndex({
    studyPrograms = [],
    batchYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'],
    academicPeriods = [],
    activePeriod = null,
    rooms = [],
    classNames = ['Kelas A', 'Kelas B', 'Kelas C', 'Kelas Reguler', 'Kelas Karyawan'],
    semesterLevels = [1, 2, 3, 4, 5, 6, 7, 8],
    initialFilters = {}
}) {
    // --- Configuration States ---
    const [selectedProdi, setSelectedProdi] = useState(
        initialFilters.study_program || (studyPrograms[0]?.id ? String(studyPrograms[0].id) : '')
    );
    const [selectedYear, setSelectedYear] = useState(
        initialFilters.academic_year || batchYears[0] || '2026'
    );
    const [selectedPeriod, setSelectedPeriod] = useState(
        initialFilters.academic_period || (activePeriod?.id ? String(activePeriod.id) : (academicPeriods[0]?.id ? String(academicPeriods[0].id) : '1'))
    );
    const [selectedSemesterLevel, setSelectedSemesterLevel] = useState(
        initialFilters.semester_level || '1'
    );
    const [selectedClassName, setSelectedClassName] = useState(
        initialFilters.class_name || 'Kelas A'
    );
    const [customClassName, setCustomClassName] = useState('');
    const [isCustomClass, setIsCustomClass] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState(
        initialFilters.room_id || (rooms[0]?.id ? String(rooms[0].id) : '')
    );
    const [targetStatus, setTargetStatus] = useState('DISETUJUI');

    // --- Students List States ---
    const [students, setStudents] = useState([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [studentSearch, setStudentSearch] = useState('');
    const [studentStatusFilter, setStudentStatusFilter] = useState('all');

    // --- Offered Classes / Courses List States ---
    const [offeredClasses, setOfferedClasses] = useState([]);
    const [isLoadingClasses, setIsLoadingClasses] = useState(false);
    const [selectedClassIds, setSelectedClassIds] = useState([]);
    const [classSearch, setClassSearch] = useState('');

    // --- Submission & Feedback States ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);

    // Final Class Name
    const effectiveClassName = isCustomClass ? (customClassName.trim() || 'Kelas A') : selectedClassName;

    // Selected Objects
    const currentProdiObj = useMemo(() => {
        return studyPrograms.find(p => String(p.id) === String(selectedProdi)) || studyPrograms[0];
    }, [studyPrograms, selectedProdi]);

    const currentPeriodObj = useMemo(() => {
        return academicPeriods.find(p => String(p.id) === String(selectedPeriod)) || activePeriod;
    }, [academicPeriods, selectedPeriod, activePeriod]);

    const currentRoomObj = useMemo(() => {
        return rooms.find(r => String(r.id) === String(selectedRoomId));
    }, [rooms, selectedRoomId]);

    // --- Fetch Students ---
    const fetchStudents = async (prodiId = selectedProdi, yearVal = selectedYear, periodVal = selectedPeriod) => {
        if (!prodiId) return;
        setIsLoadingStudents(true);
        try {
            const params = new URLSearchParams({
                study_program_id: prodiId,
                academic_year: yearVal,
                academic_period_id: periodVal,
            });
            const res = await fetch(`/admin/krs-approval/students-by-batch?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            const data = await res.json();
            if (data.success) {
                setStudents(data.students || []);
                // Otomatis pilih semua mahasiswa awal
                setSelectedStudentIds((data.students || []).map(s => s.id));
            } else {
                setStudents([]);
                setSelectedStudentIds([]);
            }
        } catch (err) {
            console.error('Error fetching students:', err);
            setStudents([]);
        } finally {
            setIsLoadingStudents(false);
        }
    };

    // --- Fetch Offered Classes / Courses ---
    const fetchOfferedClasses = async (prodiId = selectedProdi, periodVal = selectedPeriod, semLevel = selectedSemesterLevel) => {
        if (!prodiId) return;
        setIsLoadingClasses(true);
        try {
            const params = new URLSearchParams({
                study_program_id: prodiId,
                academic_period_id: periodVal,
                semester_level: semLevel,
            });
            const res = await fetch(`/admin/krs-approval/classes-courses-offered?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            const data = await res.json();
            if (data.success) {
                setOfferedClasses(data.classes || []);
                // Otomatis pilih semua mata kuliah yang ditawarkan
                setSelectedClassIds((data.classes || []).map(c => c.course_class_id));
            } else {
                setOfferedClasses([]);
                setSelectedClassIds([]);
            }
        } catch (err) {
            console.error('Error fetching offered classes:', err);
            setOfferedClasses([]);
        } finally {
            setIsLoadingClasses(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchStudents(selectedProdi, selectedYear, selectedPeriod);
        fetchOfferedClasses(selectedProdi, selectedPeriod, selectedSemesterLevel);
    }, []);

    // Filter changes
    const handleProdiChange = (newProdi) => {
        setSelectedProdi(newProdi);
        fetchStudents(newProdi, selectedYear, selectedPeriod);
        fetchOfferedClasses(newProdi, selectedPeriod, selectedSemesterLevel);
    };

    const handleYearChange = (newYear) => {
        setSelectedYear(newYear);
        fetchStudents(selectedProdi, newYear, selectedPeriod);
    };

    const handlePeriodChange = (newPeriod) => {
        setSelectedPeriod(newPeriod);
        fetchStudents(selectedProdi, selectedYear, newPeriod);
        fetchOfferedClasses(selectedProdi, newPeriod, selectedSemesterLevel);
    };

    const handleSemesterLevelChange = (newSem) => {
        setSelectedSemesterLevel(newSem);
        fetchOfferedClasses(selectedProdi, selectedPeriod, newSem);
    };

    // Filtered Students
    const filteredStudents = useMemo(() => {
        return (students || []).filter(s => {
            const q = studentSearch.toLowerCase().trim();
            const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.nim.toLowerCase().includes(q);
            if (!matchesSearch) return false;

            if (studentStatusFilter === 'belum_krs') return !s.has_krs || s.krs_status === 'BELUM_KRS';
            if (studentStatusFilter === 'sudah_krs') return s.has_krs && s.krs_status !== 'BELUM_KRS';
            return true;
        });
    }, [students, studentSearch, studentStatusFilter]);

    const isAllFilteredStudentsSelected = useMemo(() => {
        if (filteredStudents.length === 0) return false;
        return filteredStudents.every(s => selectedStudentIds.includes(s.id));
    }, [filteredStudents, selectedStudentIds]);

    const handleToggleAllStudents = () => {
        if (isAllFilteredStudentsSelected) {
            const visibleIds = new Set(filteredStudents.map(s => s.id));
            setSelectedStudentIds(prev => prev.filter(id => !visibleIds.has(id)));
        } else {
            const currentSelected = new Set(selectedStudentIds);
            filteredStudents.forEach(s => currentSelected.add(s.id));
            setSelectedStudentIds(Array.from(currentSelected));
        }
    };

    const handleToggleSingleStudent = (studentId) => {
        setSelectedStudentIds(prev => 
            prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
        );
    };

    // Filtered Offered Classes
    const filteredClasses = useMemo(() => {
        return (offeredClasses || []).filter(c => {
            const q = classSearch.toLowerCase().trim();
            if (!q) return true;
            return c.course_name.toLowerCase().includes(q) ||
                   c.course_code.toLowerCase().includes(q) ||
                   (c.class_name && c.class_name.toLowerCase().includes(q)) ||
                   (c.lecturer_name && c.lecturer_name.toLowerCase().includes(q));
        });
    }, [offeredClasses, classSearch]);

    const isAllFilteredClassesSelected = useMemo(() => {
        if (filteredClasses.length === 0) return false;
        return filteredClasses.every(c => selectedClassIds.includes(c.course_class_id));
    }, [filteredClasses, selectedClassIds]);

    const handleToggleAllClasses = () => {
        if (isAllFilteredClassesSelected) {
            const visibleIds = new Set(filteredClasses.map(c => c.course_class_id));
            setSelectedClassIds(prev => prev.filter(id => !visibleIds.has(id)));
        } else {
            const currentSelected = new Set(selectedClassIds);
            filteredClasses.forEach(c => currentSelected.add(c.course_class_id));
            setSelectedClassIds(Array.from(currentSelected));
        }
    };

    const handleToggleSingleClass = (classId) => {
        setSelectedClassIds(prev => 
            prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]
        );
    };

    const totalSelectedCredits = useMemo(() => {
        return (offeredClasses || [])
            .filter(c => selectedClassIds.includes(c.course_class_id))
            .reduce((acc, c) => acc + Number(c.credits || 0), 0);
    }, [offeredClasses, selectedClassIds]);

    // --- Submit Mass KRS ---
    const handleExecuteMassAssign = async () => {
        if (selectedStudentIds.length === 0) {
            setFeedback({ type: 'error', message: 'Silakan pilih minimal 1 mahasiswa untuk dimasukkan ke kelas!' });
            return;
        }
        if (selectedClassIds.length === 0) {
            setFeedback({ type: 'error', message: 'Silakan pilih minimal 1 mata kuliah untuk dimasukkan ke dalam KRS!' });
            return;
        }

        const confirmMsg = `Yakin ingin mendaftarkan ${selectedClassIds.length} mata kuliah (${totalSelectedCredits} SKS) secara massal ke ${selectedStudentIds.length} mahasiswa ${effectiveClassName}?`;
        if (!window.confirm(confirmMsg)) return;

        setIsSubmitting(true);
        setFeedback(null);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch('/admin/krs-approval/mass-assign-class', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    student_ids: selectedStudentIds,
                    course_class_ids: selectedClassIds,
                    academic_period_id: Number(selectedPeriod),
                    status: targetStatus,
                    class_name: effectiveClassName,
                    room_id: selectedRoomId ? Number(selectedRoomId) : null,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setFeedback({
                    type: 'success',
                    message: data.message || `Berhasil mendaftarkan ${selectedClassIds.length} mata kuliah ke ${selectedStudentIds.length} mahasiswa!`
                });
                fetchStudents(selectedProdi, selectedYear, selectedPeriod);
            } else {
                setFeedback({
                    type: 'error',
                    message: data.message || 'Terjadi kesalahan saat memproses pendaftaran massal.'
                });
            }
        } catch (err) {
            console.error('Error executing mass assign:', err);
            setFeedback({
                type: 'error',
                message: 'Gagal terhubung ke server. Silakan periksa koneksi dan coba lagi.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Link URL to Monitoring KRS with matching filter
    const viewMonitoringUrl = useMemo(() => {
        const params = new URLSearchParams({
            study_program: selectedProdi,
            academic_year: selectedYear,
            academic_period: selectedPeriod,
            class_name: effectiveClassName,
        });
        return `/admin/krs-approval?${params.toString()}`;
    }, [selectedProdi, selectedYear, selectedPeriod, effectiveClassName]);

    return (
        <AppLayout>
            <Head title="Paket KRS Massal per Kelas & Ruangan — SIAKAD STAI AL-ITTIHAD" />

            <div className="space-y-5 pb-20">
                
                {/* 1. Header Navigation & Breadcrumb */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-700/80">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            {/* Breadcrumbs */}
                            <div className="flex items-center space-x-2 text-xs text-teal-300 font-bold">
                                <Link href="/dashboard" className="hover:underline text-slate-400">Dashboard</Link>
                                <span className="text-slate-500">/</span>
                                <Link href="/admin/krs-approval" className="hover:underline text-slate-400">Rencana Studi (KRS)</Link>
                                <span className="text-slate-500">/</span>
                                <span className="text-teal-300">Paket KRS Massal</span>
                            </div>

                            <div className="flex items-center space-x-3 pt-1">
                                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center shrink-0">
                                    <Zap className="w-6 h-6 text-amber-300 fill-amber-300/20" />
                                </div>
                                <div>
                                    <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center space-x-2">
                                        <span>Paket KRS Massal per Kelas & Ruangan</span>
                                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 border border-teal-400/40">
                                            Rombel & Ruang
                                        </span>
                                    </h1>
                                    <p className="text-xs text-slate-300 mt-0.5">
                                        Atur pembagian kelas/ruangan, isi mahasiswa ke dalam rombel, dan masukkan mata kuliah secara serentak
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Actions */}
                        <div className="flex items-center space-x-2.5 self-start md:self-auto flex-wrap">
                            <Link
                                href={viewMonitoringUrl}
                                className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-teal-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-slate-700 shadow-sm"
                                title="Lihat daftar mahasiswa dan KRS hasil pemaketan di halaman monitoring"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Lihat Siswa / KRS Kelas Ini</span>
                                <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                            </Link>

                            <Link
                                href="/admin/krs-approval"
                                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 border border-slate-700 shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Kembali ke Monitoring</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. Top Configuration Card */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                            <Filter className="w-3.5 h-3.5 text-teal-600" />
                            <span>Filter Alur: Prodi, Angkatan, Semester & Kelas/Ruangan</span>
                        </h3>
                        <div className="text-[11px] text-slate-500 font-semibold">
                            Periode Aktif: <strong className="text-slate-800">{currentPeriodObj?.name || 'Ganjil 2026/2027'}</strong>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        
                        {/* 1. Program Studi */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1 flex items-center space-x-1">
                                <Building className="w-3 h-3 text-teal-600" />
                                <span>Program Studi</span>
                            </label>
                            <select
                                value={selectedProdi}
                                onChange={(e) => handleProdiChange(e.target.value)}
                                className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                            >
                                {studyPrograms.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} ({p.degree || 'S1'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Tahun Angkatan */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1 flex items-center space-x-1">
                                <Calendar className="w-3 h-3 text-teal-600" />
                                <span>Tahun Angkatan</span>
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) => handleYearChange(e.target.value)}
                                className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                            >
                                {batchYears.map((y) => (
                                    <option key={y} value={y}>
                                        Angkatan {y}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 3. Tingkat Semester */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1 flex items-center space-x-1">
                                <Layers className="w-3 h-3 text-purple-600" />
                                <span>Tingkat Semester</span>
                            </label>
                            <select
                                value={selectedSemesterLevel}
                                onChange={(e) => handleSemesterLevelChange(e.target.value)}
                                className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
                            >
                                <option value="all">Semua Semester Ditawarkan</option>
                                {semesterLevels.map((s) => (
                                    <option key={s} value={s}>
                                        Semester {s} {s % 2 === 1 ? '(Ganjil)' : '(Genap)'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 4. Nama Kelas / Rombel */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                                    <Users className="w-3 h-3 text-emerald-600" />
                                    <span>Nama Kelas / Rombel</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsCustomClass(!isCustomClass)}
                                    className="text-[10px] font-bold text-teal-600 hover:text-teal-800 transition"
                                >
                                    {isCustomClass ? 'Pilihan Default' : '+ Kustom'}
                                </button>
                            </div>
                            {isCustomClass ? (
                                <input
                                    type="text"
                                    value={customClassName}
                                    onChange={(e) => setCustomClassName(e.target.value)}
                                    placeholder="Ketik nama kelas..."
                                    className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            ) : (
                                <select
                                    value={selectedClassName}
                                    onChange={(e) => setSelectedClassName(e.target.value)}
                                    className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                                >
                                    {classNames.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* 5. Ruangan Kuliah */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1 flex items-center space-x-1">
                                <Building className="w-3 h-3 text-blue-600" />
                                <span>Ruangan Kuliah</span>
                            </label>
                            <select
                                value={selectedRoomId}
                                onChange={(e) => setSelectedRoomId(e.target.value)}
                                className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                            >
                                <option value="">-- Tanpa Ruangan Khusus --</option>
                                {rooms.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.code} - {r.name} ({r.capacity} Kursi)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Alert Banner / Toast */}
                    {feedback && (
                        <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between animate-fadeIn ${
                            feedback.type === 'success' 
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                                : 'bg-rose-50 border-rose-300 text-rose-900'
                        }`}>
                            <div className="flex items-center space-x-2.5">
                                {feedback.type === 'success' ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                                )}
                                <span>{feedback.message}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                {feedback.type === 'success' && (
                                    <Link
                                        href={viewMonitoringUrl}
                                        className="px-2.5 py-1 bg-emerald-700 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-800 transition flex items-center space-x-1"
                                    >
                                        <Eye className="w-3 h-3" />
                                        <span>Buka Hasil di Monitoring</span>
                                    </Link>
                                )}
                                <button 
                                    type="button" 
                                    onClick={() => setFeedback(null)} 
                                    className="p-1 text-slate-400 hover:text-slate-600 transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Main Two-Column Interactive Workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    
                    {/* =========================================================================
                        KOLOM KIRI: 1. Siswa / Mahasiswa Kelas Ini
                    ========================================================================= */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[620px]">
                        
                        {/* Header Kolom Mahasiswa */}
                        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
                                    <Users className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-xs text-slate-800 leading-tight">
                                        1. Calon Mahasiswa Kelas ({effectiveClassName})
                                    </h4>
                                    <span className="text-[11px] text-slate-400">
                                        Pilih manual satu per satu atau pilih semua
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="px-2.5 py-1 rounded-lg bg-teal-100/80 text-teal-800 font-mono font-bold text-xs border border-teal-200">
                                    {selectedStudentIds.length} / {students.length} Dipilih
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedStudentIds(students.map(s => s.id))}
                                    className="px-2.5 py-1 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition cursor-pointer"
                                >
                                    Pilih Semua
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedStudentIds([])}
                                    className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-slate-200/60 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>

                        {/* Filter Bar Mahasiswa */}
                        <div className="p-2.5 bg-slate-50/50 border-b border-slate-200 flex items-center space-x-2 shrink-0">
                            <div className="relative flex-1">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                    placeholder="Cari nama mahasiswa atau NIM..."
                                    className="w-full text-xs pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                />
                            </div>

                            <select
                                value={studentStatusFilter}
                                onChange={(e) => setStudentStatusFilter(e.target.value)}
                                className="text-xs font-semibold bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-slate-700 cursor-pointer"
                            >
                                <option value="all">Semua ({students.length})</option>
                                <option value="belum_krs">Belum Isi KRS ({students.filter(s => !s.has_krs || s.krs_status === 'BELUM_KRS').length})</option>
                                <option value="sudah_krs">Sudah KRS ({students.filter(s => s.has_krs && s.krs_status !== 'BELUM_KRS').length})</option>
                            </select>
                        </div>

                        {/* List Mahasiswa (Scrollable) */}
                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                            {isLoadingStudents ? (
                                <div className="p-12 text-center text-slate-400 space-y-2">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600" />
                                    <p className="text-xs">Memuat daftar mahasiswa...</p>
                                </div>
                            ) : filteredStudents.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 space-y-2">
                                    <Users className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                                    <p className="font-bold text-xs text-slate-700">Tidak ada mahasiswa yang cocok</p>
                                    <p className="text-[11px] text-slate-400">
                                        Pastikan pilihan Prodi dan Angkatan di atas sudah sesuai.
                                    </p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                                        <tr>
                                            <th className="p-3 w-10 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllFilteredStudentsSelected}
                                                    onChange={handleToggleAllStudents}
                                                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                                                />
                                            </th>
                                            <th className="p-3">Mahasiswa & NIM</th>
                                            <th className="p-3 text-center">Kelas Saat Ini</th>
                                            <th className="p-3 text-center">Status KRS</th>
                                            <th className="p-3 text-center">SKS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs">
                                        {filteredStudents.map((stu) => {
                                            const isSelected = selectedStudentIds.includes(stu.id);
                                            return (
                                                <tr
                                                    key={stu.id}
                                                    onClick={() => handleToggleSingleStudent(stu.id)}
                                                    className={`transition cursor-pointer ${
                                                        isSelected ? 'bg-teal-50/70 font-medium' : 'hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleToggleSingleStudent(stu.id)}
                                                            className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="font-bold text-slate-900 leading-tight">
                                                            {stu.name}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                                            NIM: {stu.nim}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                                            {stu.class_type || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {stu.krs_status === 'DISETUJUI' ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                                Disetujui
                                                            </span>
                                                        ) : stu.krs_status === 'DIAJUKAN' ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                                                Diajukan
                                                            </span>
                                                        ) : stu.krs_status === 'DRAFT' ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                                                                Draf
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                                                                Belum KRS
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-center font-mono font-bold text-slate-700">
                                                        {stu.total_credits} SKS
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* =========================================================================
                        KOLOM KANAN: 2. Penawaran Mata Kuliah untuk Kelas Ini
                    ========================================================================= */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[620px]">
                        
                        {/* Header Kolom Mata Kuliah */}
                        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-xs text-slate-800 leading-tight">
                                        2. Mata Kuliah Dimasukkan ke Kelas Ini
                                    </h4>
                                    <span className="text-[11px] text-slate-400">
                                        Pilih manual satu per satu atau pilih semua
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="px-2.5 py-1 rounded-lg bg-purple-100/80 text-purple-800 font-mono font-bold text-xs border border-purple-200">
                                    {selectedClassIds.length} MK ({totalSelectedCredits} SKS)
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedClassIds(offeredClasses.map(c => c.course_class_id))}
                                    className="px-2.5 py-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition cursor-pointer"
                                >
                                    Pilih Semua
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedClassIds([])}
                                    className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-slate-200/60 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>

                        {/* Search Bar Mata Kuliah */}
                        <div className="p-2.5 bg-slate-50/50 border-b border-slate-200 shrink-0">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={classSearch}
                                    onChange={(e) => setClassSearch(e.target.value)}
                                    placeholder="Cari mata kuliah, kode MK, atau nama dosen..."
                                    className="w-full text-xs pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                />
                            </div>
                        </div>

                        {/* List Mata Kuliah (Scrollable) */}
                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                            {isLoadingClasses ? (
                                <div className="p-12 text-center text-slate-400 space-y-2">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600" />
                                    <p className="text-xs">Memuat mata kuliah yang ditawarkan...</p>
                                </div>
                            ) : filteredClasses.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 space-y-2">
                                    <BookOpen className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                                    <p className="font-bold text-xs text-slate-700">Tidak ada penawaran mata kuliah</p>
                                    <p className="text-[11px] text-slate-400">
                                        Pilih tingkat semester lain atau pastikan kelas perkuliahan sudah dibuat di jadwal.
                                    </p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                                        <tr>
                                            <th className="p-3 w-10 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllFilteredClassesSelected}
                                                    onChange={handleToggleAllClasses}
                                                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                                                />
                                            </th>
                                            <th className="p-3">Mata Kuliah & Kode</th>
                                            <th className="p-3 text-center">SKS & Smt</th>
                                            <th className="p-3">Dosen & Ruangan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs">
                                        {filteredClasses.map((cls) => {
                                            const isSelected = selectedClassIds.includes(cls.course_class_id);
                                            return (
                                                <tr
                                                    key={cls.course_class_id}
                                                    onClick={() => handleToggleSingleClass(cls.course_class_id)}
                                                    className={`transition cursor-pointer ${
                                                        isSelected ? 'bg-purple-50/70 font-medium' : 'hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleToggleSingleClass(cls.course_class_id)}
                                                            className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="font-bold text-slate-900 leading-tight">
                                                            {cls.course_name}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center space-x-2">
                                                            <span>{cls.course_code}</span>
                                                            <span className="text-[10px] font-sans font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                                                                {cls.class_name || 'Reguler'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className="font-mono font-bold text-purple-700 block">
                                                            {cls.credits} SKS
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 block mt-0.5">
                                                            Semester {cls.semester_level || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="text-xs font-bold text-slate-800 truncate max-w-[190px]">
                                                            {cls.lecturer_name || 'Dosen Belum Ditugaskan'}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-1.5">
                                                            <span>{cls.room_name ? `${cls.room_code || ''} (${cls.room_name})` : 'Ruang Fleksibel'}</span>
                                                            {cls.day_of_week && (
                                                                <span className="font-semibold text-slate-600">
                                                                    • {cls.day_of_week}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Bottom Sticky Execution Bar */}
                <div className="sticky bottom-4 z-40 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
                    
                    {/* Status Target Selection */}
                    <div className="flex items-center space-x-3">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                            Status KRS Hasil:
                        </span>
                        <div className="flex items-center space-x-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
                            <button
                                type="button"
                                onClick={() => setTargetStatus('DISETUJUI')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                                    targetStatus === 'DISETUJUI'
                                        ? 'bg-emerald-500 text-white shadow-xs'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Langsung Disetujui (Rekomendasi)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setTargetStatus('DIAJUKAN')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                                    targetStatus === 'DIAJUKAN'
                                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <span>Simpan Draf Diajukan</span>
                            </button>
                        </div>
                    </div>

                    {/* Summary & Big Execution Button */}
                    <div className="flex items-center space-x-3">
                        <div className="hidden sm:block text-right">
                            <div className="text-xs font-bold text-teal-300">
                                {selectedStudentIds.length} Siswa Terpilih • {selectedClassIds.length} Mata Kuliah ({totalSelectedCredits} SKS)
                            </div>
                            <div className="text-[11px] text-slate-400">
                                Target: {effectiveClassName} {currentRoomObj ? `(${currentRoomObj.name})` : ''}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleExecuteMassAssign}
                            disabled={isSubmitting || selectedStudentIds.length === 0 || selectedClassIds.length === 0}
                            className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 rounded-xl text-xs font-black transition flex items-center space-x-2 shadow-lg shadow-teal-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                                    <span>Sedang Mendaftarkan KRS Massal...</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                                    <span>
                                        Daftarkan {selectedClassIds.length} MK ke {selectedStudentIds.length} Mahasiswa
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
