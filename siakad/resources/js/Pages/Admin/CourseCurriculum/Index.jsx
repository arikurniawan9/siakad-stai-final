import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Layers, Plus, Trash2, Edit2, Search, 
    BookOpen, CheckCircle2, ChevronRight, Filter, 
    BookMarked, ArrowRightLeft, Sparkles, X, Save,
    GraduationCap, ChevronDown, Check, Lock, ChevronLeft,
    AlertTriangle
} from 'lucide-react';

export default function CourseCurriculumIndex({ 
    studyPrograms = [], 
    selectedProgramId = null, 
    curricula = [], 
    selectedCurriculumId = null, 
    mappedCourses = [], 
    availableCourses = [] 
}) {
    const [programId, setProgramId] = useState(selectedProgramId ? String(selectedProgramId) : '');
    const [curriculumId, setCurriculumId] = useState(selectedCurriculumId ? String(selectedCurriculumId) : '');

    const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);
    const [isCurriculumDropdownOpen, setIsCurriculumDropdownOpen] = useState(false);
    const programDropdownRef = useRef(null);
    const curriculumDropdownRef = useRef(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [semesterFilter, setSemesterFilter] = useState('ALL'); // 'ALL' | 1 | 2 ... 8
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Modal State - Plotting / Edit Semester
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Modal State - Konfirmasi Hapus
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Active Study Program & Curriculum Objects
    const activeProgramObj = useMemo(() => {
        return studyPrograms.find(p => String(p.id) === String(programId)) || null;
    }, [studyPrograms, programId]);

    const activeCurriculumObj = useMemo(() => {
        return curricula.find(c => String(c.id) === String(curriculumId)) || null;
    }, [curricula, curriculumId]);

    // Close active modal or dropdown on ESC key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
                if (courseToDelete) {
                    setCourseToDelete(null);
                } else if (isProgramDropdownOpen) {
                    setIsProgramDropdownOpen(false);
                } else if (isCurriculumDropdownOpen) {
                    setIsCurriculumDropdownOpen(false);
                } else if (isModalOpen) {
                    setIsModalOpen(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, isProgramDropdownOpen, isCurriculumDropdownOpen, courseToDelete]);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (programDropdownRef.current && !programDropdownRef.current.contains(event.target)) {
                setIsProgramDropdownOpen(false);
            }
            if (curriculumDropdownRef.current && !curriculumDropdownRef.current.contains(event.target)) {
                setIsCurriculumDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Switch Program Studi
    const handleProgramChange = (newProgramId) => {
        setProgramId(newProgramId);
        setCurriculumId('');
        setCurrentPage(1);
        setSearchTerm('');
        setSemesterFilter('ALL');
        if (newProgramId) {
            router.get('/admin/course-curriculum', { program_id: newProgramId }, { preserveState: true, preserveScroll: true });
        } else {
            router.get('/admin/course-curriculum', {}, { preserveState: true, preserveScroll: true });
        }
    };

    // Switch Kurikulum
    const handleCurriculumChange = (newCurriculumId) => {
        setCurriculumId(newCurriculumId);
        setCurrentPage(1);
        setSearchTerm('');
        setSemesterFilter('ALL');
        if (programId && newCurriculumId) {
            router.get('/admin/course-curriculum', { 
                program_id: programId, 
                curriculum_id: newCurriculumId 
            }, { preserveState: true, preserveScroll: true });
        }
    };

    // Form untuk assign / edit matakuliah di kurikulum
    const form = useForm({
        program_id: '',
        curriculum_id: '',
        course_id: '',
        semester: 1,
    });

    const openModal = (item = null) => {
        setEditingItem(item);
        if (item) {
            form.setData({
                program_id: programId,
                curriculum_id: curriculumId,
                course_id: item.id,
                semester: item.semester_level || 1,
            });
        } else {
            form.setData({
                program_id: programId,
                curriculum_id: curriculumId,
                course_id: availableCourses[0]?.id || '',
                semester: 1,
            });
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            form.put(`/admin/course-curriculum/${editingItem.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        } else {
            if (!form.data.course_id) {
                alert('Pilih mata kuliah terlebih dahulu.');
                return;
            }
            form.post('/admin/course-curriculum', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    // Eksekusi Hapus Mata Kuliah dari Kurikulum
    const confirmDeleteCourse = () => {
        if (!courseToDelete) return;
        setIsDeleting(true);
        router.delete(`/admin/course-curriculum/${courseToDelete.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setCourseToDelete(null);
            },
        });
    };

    // Filter courses on client side by search & semester
    const filteredCourses = useMemo(() => {
        if (!programId || !curriculumId) return [];
        return mappedCourses.filter(c => {
            // Filter Semester
            if (semesterFilter !== 'ALL' && Number(c.semester_level) !== Number(semesterFilter)) {
                return false;
            }
            // Filter Search
            const q = searchTerm.toLowerCase().trim();
            if (!q) return true;
            return (
                c.name?.toLowerCase().includes(q) || 
                c.code?.toLowerCase().includes(q) ||
                (c.course_type && c.course_type.toLowerCase().includes(q)) ||
                (c.course_group && c.course_group.toLowerCase().includes(q))
            );
        });
    }, [mappedCourses, programId, curriculumId, semesterFilter, searchTerm]);

    const totalFiltered = filteredCourses.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / perPage));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    const paginatedCourses = useMemo(() => {
        const start = (safeCurrentPage - 1) * perPage;
        return filteredCourses.slice(start, start + perPage);
    }, [filteredCourses, safeCurrentPage, perPage]);

    const fromIndex = totalFiltered === 0 ? 0 : (safeCurrentPage - 1) * perPage + 1;
    const toIndex = Math.min(safeCurrentPage * perPage, totalFiltered);

    // Hitung total SKS yang terplot di kurikulum
    const totalPlottedCredits = useMemo(() => {
        return mappedCourses.reduce((acc, curr) => acc + (parseFloat(curr.credits) || 0), 0);
    }, [mappedCourses]);

    return (
        <AppLayout title="Matakuliah - Kurikulum">
            <Head title="Matakuliah - Kurikulum — SIAKAD" />

            <div className="space-y-3.5">
                {/* 1. COMPACT HERO HEADER DENGAN INTEGRATED DUAL-PICKER (PRODI & KURIKULUM) */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative border border-slate-700/50 z-10">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black mb-1">
                                <Sparkles className="w-3 h-3 text-indigo-400" />
                                <span>STRUKTUR KURIKULUM & PLOTTING SEMESTER</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center space-x-2">
                                <span>Data Matakuliah - Kurikulum</span>
                            </h2>
                        </div>

                        {/* Ringkasan Beban SKS Kurikulum */}
                        {activeCurriculumObj && (
                            <div className="flex items-center space-x-2 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-xs">
                                <span className="text-indigo-300 font-medium">Beban Terplot:</span>
                                <strong className="font-mono text-white font-black">{totalPlottedCredits.toFixed(1)} SKS</strong>
                                <span className="text-slate-400">/</span>
                                <span className="text-slate-300">{activeCurriculumObj.total_credits_required || 144} SKS Standar</span>
                            </div>
                        )}
                    </div>

                    {/* Integrated Sub-bar: Pemilih Program Studi & Kurikulum */}
                    <div className="relative z-20 mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* 1. Pemilih Program Studi */}
                        <div ref={programDropdownRef} className="relative">
                            <div className="flex items-center justify-between mb-1 text-[11px]">
                                <span className="text-slate-300 font-bold flex items-center space-x-1">
                                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Program Studi:</span>
                                </span>
                                {activeProgramObj && (
                                    <span className="text-[10px] text-indigo-300 font-mono font-bold">
                                        {curricula.length} Kurikulum
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsProgramDropdownOpen(prev => !prev)}
                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition shadow-2xs cursor-pointer text-left border ${
                                    isProgramDropdownOpen 
                                        ? 'border-indigo-400 ring-2 ring-indigo-500/30 bg-slate-800 text-white' 
                                        : activeProgramObj 
                                            ? 'border-indigo-500/50 bg-indigo-950/50 hover:bg-indigo-900/50 text-indigo-200 font-bold' 
                                            : 'border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 font-medium'
                                }`}
                            >
                                <div className="flex items-center space-x-2 truncate">
                                    <GraduationCap className={`w-3.5 h-3.5 shrink-0 ${activeProgramObj ? 'text-indigo-400' : 'text-slate-400'}`} />
                                    <span className="truncate">
                                        {activeProgramObj ? `${activeProgramObj.code} - ${activeProgramObj.name}` : 'Pilih Program Studi...'}
                                    </span>
                                </div>

                                <div className="flex items-center space-x-1 shrink-0 ml-1.5">
                                    {programId && (
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleProgramChange('');
                                                setIsProgramDropdownOpen(false);
                                            }}
                                            className="p-0.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
                                            title="Reset Program Studi"
                                        >
                                            <X className="w-3 h-3" />
                                        </span>
                                    )}
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                        isProgramDropdownOpen ? 'rotate-180 text-indigo-400' : ''
                                    }`} />
                                </div>
                            </button>

                            {/* Popover Program Studi */}
                            {isProgramDropdownOpen && (
                                <div className="absolute left-0 top-full mt-1.5 w-full sm:w-88 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn">
                                    <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                                            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                                            <span>PILIH PROGRAM STUDI ({studyPrograms.length})</span>
                                        </span>
                                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                                            ESC
                                        </span>
                                    </div>

                                    <div className="p-2 space-y-1 max-h-64 overflow-y-auto divide-y divide-slate-100/70">
                                        {studyPrograms.map((p) => {
                                            const isSelected = String(p.id) === String(programId);
                                            const cCount = p.curricula_count ?? 0;
                                            return (
                                                <div
                                                    key={p.id}
                                                    onClick={() => {
                                                        handleProgramChange(String(p.id));
                                                        setIsProgramDropdownOpen(false);
                                                    }}
                                                    className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between group ${
                                                        isSelected
                                                            ? 'bg-indigo-50 border border-indigo-300 shadow-2xs'
                                                            : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-2.5 min-w-0">
                                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${
                                                            isSelected 
                                                                ? 'bg-indigo-600 text-white shadow-xs' 
                                                                : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-800'
                                                        }`}>
                                                            <GraduationCap className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center space-x-1.5">
                                                                <h4 className={`text-xs truncate ${
                                                                    isSelected ? 'text-indigo-950 font-black' : 'text-slate-900 font-bold group-hover:text-indigo-700'
                                                                }`}>
                                                                    {p.name}
                                                                </h4>
                                                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                                                    isSelected 
                                                                        ? 'bg-indigo-200/80 text-indigo-900' 
                                                                        : 'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                    {p.code}
                                                                </span>
                                                            </div>
                                                            {p.degree && (
                                                                <span className="text-[9px] font-bold text-slate-400">
                                                                    Jenjang {p.degree}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                            isSelected
                                                                ? 'bg-indigo-600 text-white font-black'
                                                                : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-800'
                                                        }`}>
                                                            {cCount} Kurikulum
                                                        </span>
                                                        {isSelected && (
                                                            <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                                                <Check className="w-2.5 h-2.5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Pemilih Kurikulum (Hanya aktif jika Program Studi sudah dipilih) */}
                        <div ref={curriculumDropdownRef} className="relative">
                            <div className="flex items-center justify-between mb-1 text-[11px]">
                                <span className="text-slate-300 font-bold flex items-center space-x-1">
                                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Kurikulum Program Studi:</span>
                                </span>
                                {activeCurriculumObj && (
                                    <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                        <span>{mappedCourses.length} MK Terplot</span>
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                disabled={!programId}
                                onClick={() => setIsCurriculumDropdownOpen(prev => !prev)}
                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition shadow-2xs text-left border ${
                                    !programId
                                        ? 'border-slate-800 bg-slate-800/40 text-slate-500 cursor-not-allowed'
                                        : isCurriculumDropdownOpen 
                                            ? 'border-indigo-400 ring-2 ring-indigo-500/30 bg-slate-800 text-white cursor-pointer' 
                                            : activeCurriculumObj 
                                                ? 'border-indigo-500/50 bg-indigo-950/50 hover:bg-indigo-900/50 text-indigo-200 font-bold cursor-pointer' 
                                                : 'border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 font-medium cursor-pointer'
                                }`}
                            >
                                <div className="flex items-center space-x-2 truncate">
                                    <Layers className={`w-3.5 h-3.5 shrink-0 ${activeCurriculumObj ? 'text-indigo-400' : 'text-slate-400'}`} />
                                    <span className="truncate">
                                        {!programId 
                                            ? 'Pilih Program Studi Terlebih Dahulu...' 
                                            : (activeCurriculumObj 
                                                ? `${activeCurriculumObj.name} (${activeCurriculumObj.start_year})` 
                                                : 'Pilih Kurikulum...')}
                                    </span>
                                </div>

                                <div className="flex items-center space-x-1 shrink-0 ml-1.5">
                                    {curriculumId && (
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCurriculumChange('');
                                                setIsCurriculumDropdownOpen(false);
                                            }}
                                            className="p-0.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
                                            title="Reset Kurikulum"
                                        >
                                            <X className="w-3 h-3" />
                                        </span>
                                    )}
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                        isCurriculumDropdownOpen ? 'rotate-180 text-indigo-400' : ''
                                    }`} />
                                </div>
                            </button>

                            {/* Popover Kurikulum */}
                            {isCurriculumDropdownOpen && programId && (
                                <div className="absolute right-0 top-full mt-1.5 w-full sm:w-88 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn">
                                    <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                                            <Layers className="w-3.5 h-3.5 text-indigo-600" />
                                            <span>PILIH KURIKULUM ({curricula.length})</span>
                                        </span>
                                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                                            ESC
                                        </span>
                                    </div>

                                    <div className="p-2 space-y-1 max-h-64 overflow-y-auto divide-y divide-slate-100/70">
                                        {curricula.length === 0 ? (
                                            <div className="p-4 text-center text-xs text-slate-500 space-y-1">
                                                <p className="font-bold">Belum ada kurikulum untuk prodi ini.</p>
                                                <Link 
                                                    href={`/admin/curricula?program_id=${programId}`}
                                                    className="inline-block text-indigo-600 hover:underline font-bold text-[11px]"
                                                >
                                                    + Buat Kurikulum Baru di Menu Kurikulum
                                                </Link>
                                            </div>
                                        ) : (
                                            curricula.map((c) => {
                                                const isSelected = String(c.id) === String(curriculumId);
                                                const mkCount = c.courses_count ?? 0;
                                                return (
                                                    <div
                                                        key={c.id}
                                                        onClick={() => {
                                                            handleCurriculumChange(String(c.id));
                                                            setIsCurriculumDropdownOpen(false);
                                                        }}
                                                        className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between group ${
                                                            isSelected
                                                                ? 'bg-indigo-50 border border-indigo-300 shadow-2xs'
                                                                : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                                        }`}
                                                    >
                                                        <div className="flex items-center space-x-2.5 min-w-0">
                                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${
                                                                isSelected 
                                                                    ? 'bg-indigo-600 text-white shadow-xs' 
                                                                    : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-800'
                                                            }`}>
                                                                <Layers className="w-3.5 h-3.5" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center space-x-1.5">
                                                                    <h4 className={`text-xs truncate ${
                                                                        isSelected ? 'text-indigo-950 font-black' : 'text-slate-900 font-bold group-hover:text-indigo-700'
                                                                    }`}>
                                                                        {c.name}
                                                                    </h4>
                                                                    <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-slate-100 text-slate-700">
                                                                        {c.start_year}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[9px] text-slate-400 font-bold">
                                                                    {c.total_credits_required || 144} SKS • {c.is_active ? 'Aktif' : 'Nonaktif'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                                isSelected
                                                                    ? 'bg-indigo-600 text-white font-black'
                                                                    : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-800'
                                                            }`}>
                                                                {mkCount} MK
                                                            </span>
                                                            {isSelected && (
                                                                <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                                                    <Check className="w-2.5 h-2.5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. KONTEN UTAMA: EMPTY STATES ATAU TABEL PLOTTING MATAKULIAH */}
                {!programId ? (
                    /* PLACEHOLDER KETIKA BELUM MEMILIH PROGRAM STUDI */
                    <div className="bg-white p-10 sm:p-14 rounded-2xl border border-slate-200 text-center space-y-3 shadow-2xs animate-fadeIn">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto shadow-2xs">
                            <GraduationCap className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-black text-slate-900">Pilih Program Studi Terlebih Dahulu</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                            Silakan pilih salah satu program studi pada menu pilihan di atas untuk menampilkan daftar kurikulum dan pemetaan mata kuliahnya.
                        </p>
                        <div className="pt-2 flex items-center justify-center space-x-2">
                            <button
                                type="button"
                                onClick={() => setIsProgramDropdownOpen(true)}
                                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                            >
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>Pilih Program Studi ({studyPrograms.length})</span>
                            </button>
                        </div>
                    </div>
                ) : !curriculumId ? (
                    /* PLACEHOLDER KETIKA PROGRAM STUDI SUDAH DIPILIH TETAPI KURIKULUM BELUM */
                    <div className="bg-white p-10 sm:p-14 rounded-2xl border border-slate-200 text-center space-y-3 shadow-2xs animate-fadeIn">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto shadow-2xs">
                            <Layers className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-black text-slate-900">Pilih Kurikulum Terlebih Dahulu</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                            Pilih kurikulum aktif untuk <strong className="text-slate-800">{activeProgramObj?.name}</strong> pada menu di atas untuk menampilkan struktur sebaran mata kuliah per semester.
                        </p>
                        {curricula.length > 0 ? (
                            <div className="pt-2 flex items-center justify-center space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCurriculumDropdownOpen(true)}
                                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                                >
                                    <Layers className="w-3.5 h-3.5" />
                                    <span>Pilih Kurikulum ({curricula.length})</span>
                                </button>
                            </div>
                        ) : (
                            <div className="pt-2">
                                <Link
                                    href={`/admin/curricula?program_id=${programId}`}
                                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Buat Kurikulum Baru di Menu Kurikulum</span>
                                </Link>
                            </div>
                        )}
                    </div>
                ) : (
                    /* TABEL PLOTTING MATAKULIAH KURIKULUM */
                    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden animate-fadeIn">
                        {/* Toolbar Filter, Semester Pills & Search Controls */}
                        <div className="p-3 bg-slate-50/70 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs relative z-20">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center space-x-1.5">
                                    <span className="text-slate-600 text-[11px] font-bold">Baris:</span>
                                    <select
                                        value={perPage}
                                        onChange={(e) => {
                                            setPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 shadow-2xs focus:outline-indigo-500 cursor-pointer"
                                    >
                                        <option value={5}>5 baris</option>
                                        <option value={10}>10 baris</option>
                                        <option value={25}>25 baris</option>
                                        <option value={50}>50 baris</option>
                                    </select>
                                </div>

                                {/* Semester Quick Filters */}
                                <div className="flex items-center space-x-1 pl-2 border-l border-slate-200 overflow-x-auto">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSemesterFilter('ALL');
                                            setCurrentPage(1);
                                        }}
                                        className={`px-2 py-0.8 rounded-lg text-[10px] font-black transition cursor-pointer ${
                                            semesterFilter === 'ALL'
                                                ? 'bg-indigo-600 text-white shadow-2xs'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        Semua Smt
                                    </button>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((smt) => (
                                        <button
                                            key={smt}
                                            type="button"
                                            onClick={() => {
                                                setSemesterFilter(smt);
                                                setCurrentPage(1);
                                            }}
                                            className={`px-2 py-0.8 rounded-lg text-[10px] font-black transition cursor-pointer ${
                                                semesterFilter === smt
                                                    ? 'bg-indigo-600 text-white shadow-2xs'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            Smt {smt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Search Box & Tombol Tambah (Icon + Tooltip) */}
                            <div className="flex items-center space-x-2">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        placeholder="Cari kode / nama matakuliah..."
                                        className="pl-8 pr-7 py-1 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-indigo-500 w-52 sm:w-60 shadow-2xs"
                                    />
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setCurrentPage(1);
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>

                                {/* Tombol Tambah Mata Kuliah ke Kurikulum (Icon + Tooltip) */}
                                <div className="relative group">
                                    <button
                                        type="button"
                                        onClick={() => openModal()}
                                        title="Plotting Mata Kuliah ke Kurikulum"
                                        aria-label="Plotting Mata Kuliah ke Kurikulum"
                                        className="p-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-lg transition flex items-center justify-center shadow-xs cursor-pointer"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                    {/* Floating Tooltip (Muncul ke bawah agar tidak tertutup header) */}
                                    <div className="absolute right-0 top-full mt-2 hidden group-hover:flex flex-col items-end pointer-events-none z-50">
                                        <div className="w-2 h-2 mr-2.5 -mb-1 bg-slate-900 rotate-45 border-l border-t border-slate-700 z-10"></div>
                                        <span className="whitespace-nowrap px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-xl border border-slate-700">
                                            Plotting Mata Kuliah ke Kurikulum
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-[11px]">
                                <thead>
                                    <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                                        <th rowSpan="2" className="py-2.5 px-3 text-center w-10 border-r border-slate-800">No.</th>
                                        <th colSpan="2" className="py-1.5 px-3 text-center border-r border-slate-800 bg-slate-800">Mata Kuliah</th>
                                        <th rowSpan="2" className="py-2.5 px-2 text-center w-16 border-r border-slate-800">Semester</th>
                                        <th colSpan="4" className="py-1.5 px-2 text-center border-r border-slate-800 bg-slate-800">Jumlah Bobot SKS</th>
                                        <th rowSpan="2" className="py-2.5 px-3 text-center border-r border-slate-800">Jenis MK</th>
                                        <th rowSpan="2" className="py-2.5 px-3 border-r border-slate-800">Kelompok MK</th>
                                        <th rowSpan="2" className="py-2.5 px-3 text-center w-24">Aksi</th>
                                    </tr>
                                    <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[9px]">
                                        <th className="py-1 px-3 w-28 border-r border-slate-800 bg-slate-800/80">Kode</th>
                                        <th className="py-1 px-4 border-r border-slate-800 bg-slate-800/80">Nama Mata Kuliah</th>
                                        <th className="py-1 px-2 text-center w-14 border-r border-slate-800 bg-slate-800/80">Total</th>
                                        <th className="py-1 px-2 text-center w-14 border-r border-slate-800 bg-slate-800/80">Tatap Muka</th>
                                        <th className="py-1 px-2 text-center w-14 border-r border-slate-800 bg-slate-800/80">Praktikum</th>
                                        <th className="py-1 px-2 text-center w-14 border-r border-slate-800 bg-slate-800/80">Lapangan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {paginatedCourses.length === 0 ? (
                                        <tr>
                                            <td colSpan="11" className="py-8 text-center text-slate-500">
                                                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                <p className="font-bold text-xs">Tidak ada mata kuliah yang terplot pada kriteria ini.</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">Klik tombol "+" di atas untuk menambahkan mata kuliah ke kurikulum.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedCourses.map((c, idx) => (
                                            <tr key={c.id} className="hover:bg-indigo-50/40 transition">
                                                <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                                                    {(safeCurrentPage - 1) * perPage + idx + 1}
                                                </td>

                                                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                                                    <span className="font-mono text-[10px] font-black text-indigo-950 px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded">
                                                        {c.code}
                                                    </span>
                                                </td>

                                                <td className="py-2.5 px-4 font-bold text-slate-900">
                                                    {c.name}
                                                </td>

                                                <td className="py-2.5 px-2 text-center">
                                                    <span className="inline-flex items-center px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-[10px] font-black text-indigo-800">
                                                        Smt {c.semester_level || 1}
                                                    </span>
                                                </td>

                                                <td className="py-2.5 px-2 text-center font-mono font-black text-slate-900 bg-slate-50/50">
                                                    {Number(c.credits).toFixed(2)}
                                                </td>
                                                <td className="py-2.5 px-2 text-center font-mono text-slate-700">
                                                    {Number(c.theory_credits || c.credits).toFixed(2)}
                                                </td>
                                                <td className="py-2.5 px-2 text-center font-mono text-slate-500">
                                                    {Number(c.practice_credits || 0).toFixed(2)}
                                                </td>
                                                <td className="py-2.5 px-2 text-center font-mono text-slate-500">
                                                    {Number(c.field_credits || 0).toFixed(2)}
                                                </td>

                                                <td className="py-2.5 px-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                        c.course_type === 'Wajib' || c.course_type === 'WAJIB_PRODI'
                                                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                                                            : 'bg-amber-50 text-amber-800 border-amber-200'
                                                    }`}>
                                                        {c.course_type?.replace('_PRODI', '')}
                                                    </span>
                                                </td>

                                                <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                                                    {c.course_group || 'MKU/MKDU'}
                                                </td>

                                                <td className="py-2.5 px-3 text-center">
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openModal(c)}
                                                            className="p-1 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition cursor-pointer"
                                                            title="Edit Penempatan Semester"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCourseToDelete(c)}
                                                            className="p-1 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition cursor-pointer"
                                                            title="Hapus dari Kurikulum"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Bar */}
                        <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                            <div className="text-slate-500 text-[11px]">
                                Menampilkan <strong className="text-slate-800 font-bold">{fromIndex}</strong> - <strong className="text-slate-800 font-bold">{toIndex}</strong> dari <strong className="text-slate-800 font-bold">{totalFiltered}</strong> mata kuliah di <strong className="text-slate-800">{activeCurriculumObj?.name}</strong>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center space-x-1">
                                    <button
                                        type="button"
                                        disabled={safeCurrentPage === 1}
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        className={`px-2 py-1 rounded-lg border text-xs font-bold transition flex items-center space-x-1 ${
                                            safeCurrentPage === 1
                                                ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-white'
                                                : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100 cursor-pointer shadow-2xs'
                                        }`}
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline text-[11px]">Sebelumnya</span>
                                    </button>

                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                            <button
                                                key={pageNum}
                                                type="button"
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                                                    pageNum === safeCurrentPage
                                                        ? 'bg-indigo-600 text-white shadow-xs'
                                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        disabled={safeCurrentPage === totalPages}
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        className={`px-2 py-1 rounded-lg border text-xs font-bold transition flex items-center space-x-1 ${
                                            safeCurrentPage === totalPages
                                                ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-white'
                                                : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100 cursor-pointer shadow-2xs'
                                        }`}
                                    >
                                        <span className="hidden sm:inline text-[11px]">Berikutnya</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* MODAL PLOTTING / EDIT PENEMPATAN MATA KULIAH */}
            {/* ========================================================================= */}
            {isModalOpen && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsModalOpen(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-2xs animate-fadeIn"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
                        {/* Header Dark Gradient */}
                        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30">
                                    <ArrowRightLeft className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xs text-white">
                                        {editingItem ? 'Ubah Penempatan Semester' : 'Plotting Mata Kuliah ke Kurikulum'}
                                    </h3>
                                    <p className="text-[10px] text-slate-300">
                                        {activeCurriculumObj?.name} • {activeProgramObj?.name}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                                    ESC
                                </span>
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-5 space-y-3.5 text-xs">
                            {/* Kurikulum & Prodi Info Box */}
                            <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Target Kurikulum:</span>
                                    <strong className="text-slate-900 font-black">{activeCurriculumObj?.name} ({activeCurriculumObj?.start_year})</strong>
                                </div>
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                            </div>

                            {/* Pilihan Mata Kuliah */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                    Mata Kuliah <span className="text-rose-500">*</span>
                                </label>
                                {editingItem ? (
                                    <div className="w-full p-2 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-800 text-xs flex items-center justify-between">
                                        <span>{editingItem.code} - {editingItem.name}</span>
                                        <Lock className="w-3 h-3 text-slate-400" />
                                    </div>
                                ) : (
                                    <select
                                        value={form.data.course_id}
                                        onChange={(e) => form.setData('course_id', e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-indigo-500"
                                        required
                                    >
                                        <option value="">-- Pilih Mata Kuliah --</option>
                                        {availableCourses.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.code} - {c.name} [{Number(c.credits).toFixed(1)} SKS]
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Pilihan Semester */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                    Penempatan Semester <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={form.data.semester}
                                    onChange={(e) => form.setData('semester', parseInt(e.target.value))}
                                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-indigo-500"
                                    required
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                        <option key={s} value={s}>Semester {s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={form.processing} 
                                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-xs flex items-center space-x-1.5 cursor-pointer"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{form.processing ? 'Menyimpan...' : (editingItem ? 'Perbarui Penempatan' : 'Plotting ke Kurikulum')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL KONFIRMASI HAPUS (PREMIUM ROSE / RED DESIGN) */}
            {/* ========================================================================= */}
            {courseToDelete && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !isDeleting) setCourseToDelete(null);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-2xs animate-fadeIn"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-rose-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
                        {/* Header Dark Rose Gradient */}
                        <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-rose-950 to-slate-950 text-white flex items-center justify-between border-b border-rose-900/40">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                                    <Trash2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xs text-white">Hapus Mata Kuliah dari Kurikulum</h3>
                                    <p className="text-[10px] text-rose-300">Penempatan semester kurikulum ini akan dibatalkan</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                                    ESC
                                </span>
                                <button 
                                    type="button" 
                                    disabled={isDeleting}
                                    onClick={() => setCourseToDelete(null)} 
                                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-4">
                            {/* Item Details Box */}
                            <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-3.5 space-y-1.5">
                                <div className="flex items-center space-x-2">
                                    <span className="font-mono text-[10px] font-black px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded">
                                        {courseToDelete.code}
                                    </span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-rose-200 rounded text-slate-700">
                                        Semester {courseToDelete.semester_level || 1}
                                    </span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-rose-200 rounded text-slate-700">
                                        {Number(courseToDelete.credits).toFixed(1)} SKS
                                    </span>
                                </div>
                                <p className="text-xs font-black text-slate-900 leading-snug">
                                    {courseToDelete.name}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                    Kurikulum: <strong className="text-slate-700">{activeCurriculumObj?.name}</strong>
                                </p>
                            </div>

                            {/* Warning Alert */}
                            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-[11px] leading-relaxed">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <span>
                                    Pelepasan mata kuliah ini dari kurikulum akan membatalkan plotting semester yang telah dibuat dan dapat memengaruhi rencana studi mahasiswa yang mengambil kurikulum ini.
                                </span>
                            </div>

                            {/* Footer Buttons */}
                            <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    disabled={isDeleting}
                                    onClick={() => setCourseToDelete(null)} 
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="button" 
                                    disabled={isDeleting}
                                    onClick={confirmDeleteCourse}
                                    className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/30 transition flex items-center space-x-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus dari Kurikulum'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
