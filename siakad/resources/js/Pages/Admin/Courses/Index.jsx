import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    BookOpen, Plus, Trash2, Edit2, Search, 
    Layers, CheckCircle2, ChevronRight, Filter, 
    BookMarked, Sparkles, X, Save, GraduationCap,
    ChevronDown, Check, Lock, RefreshCw, ChevronLeft,
    AlertTriangle
} from 'lucide-react';

export default function CoursesIndex({ studyPrograms = [], selectedProgramId = null, courses = [] }) {
    const [programId, setProgramId] = useState(selectedProgramId ? String(selectedProgramId) : '');
    const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);
    const programDropdownRef = useRef(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    // State Konfirmasi Hapus Modal
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Active Study Program Object
    const activeProgramObj = useMemo(() => {
        return studyPrograms.find(p => String(p.id) === String(programId)) || null;
    }, [studyPrograms, programId]);

    // Close active modal or dropdown on ESC key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
                if (courseToDelete) {
                    setCourseToDelete(null);
                } else if (isProgramDropdownOpen) {
                    setIsProgramDropdownOpen(false);
                } else if (isModalOpen) {
                    setIsModalOpen(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, isProgramDropdownOpen, courseToDelete]);

    // Close program dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (programDropdownRef.current && !programDropdownRef.current.contains(event.target)) {
                setIsProgramDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Form Mata Kuliah
    const form = useForm({
        study_program_id: studyPrograms[0]?.id || 1,
        code: '',
        name: '',
        credits: 2.00,
        theory_credits: 2.00,
        practice_credits: 0.00,
        field_credits: 0.00,
        course_type: 'Wajib',
        course_group: 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)',
    });

    // Helper untuk auto-generate kode matakuliah
    const generateCourseCode = (targetProgramId = null) => {
        const pId = targetProgramId || programId || (studyPrograms[0]?.id ? String(studyPrograms[0].id) : null);
        const targetProgram = studyPrograms.find(p => String(p.id) === String(pId));
        const prefix = targetProgram?.code ? targetProgram.code.replace(/[^A-Za-z0-9]/g, '').toUpperCase() : 'MK';
        
        let num = 101;
        let candidate = `${prefix}${num}`;
        while (courses.some(c => c.code?.toUpperCase() === candidate.toUpperCase())) {
            num++;
            candidate = `${prefix}${num}`;
        }
        return candidate;
    };

    // Handle Program Studi Switch
    const handleProgramChange = (newProgramId) => {
        setProgramId(newProgramId);
        setCurrentPage(1);
        setSearchTerm('');
        if (newProgramId) {
            router.get('/admin/courses', { program_id: newProgramId }, { preserveState: true, preserveScroll: true });
        } else {
            router.get('/admin/courses', {}, { preserveState: true, preserveScroll: true });
        }
    };

    // Open Modal Tambah / Edit
    const openModal = (course = null) => {
        setEditingCourse(course);
        if (course) {
            form.setData({
                study_program_id: course.study_program_id,
                code: course.code || '',
                name: course.name || '',
                credits: parseFloat(course.credits) || 2.00,
                theory_credits: parseFloat(course.theory_credits) || 2.00,
                practice_credits: parseFloat(course.practice_credits) || 0.00,
                field_credits: parseFloat(course.field_credits) || 0.00,
                course_type: course.course_type || 'Wajib',
                course_group: course.course_group || 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)',
            });
        } else {
            const initialProgramId = programId ? parseInt(programId) : (studyPrograms[0]?.id || 1);
            const autoCode = generateCourseCode(initialProgramId);
            form.reset();
            form.setData({
                study_program_id: initialProgramId,
                code: autoCode,
                name: '',
                credits: 2.00,
                theory_credits: 2.00,
                practice_credits: 0.00,
                field_credits: 0.00,
                course_type: 'Wajib',
                course_group: 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)',
            });
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (editingCourse) {
            form.put(`/admin/courses/${editingCourse.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post('/admin/courses', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    // Eksekusi Hapus Mata Kuliah
    const confirmDeleteCourse = () => {
        if (!courseToDelete) return;
        setIsDeleting(true);
        router.delete(`/admin/courses/${courseToDelete.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setCourseToDelete(null);
            },
        });
    };

    // Filter courses on client side
    const filteredCourses = useMemo(() => {
        if (!programId) return [];
        return courses.filter(c => {
            const q = searchTerm.toLowerCase().trim();
            if (!q) return true;
            return (
                c.name?.toLowerCase().includes(q) || 
                c.code?.toLowerCase().includes(q) ||
                (c.course_type && c.course_type.toLowerCase().includes(q)) ||
                (c.course_group && c.course_group.toLowerCase().includes(q))
            );
        });
    }, [courses, programId, searchTerm]);

    const totalFiltered = filteredCourses.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / perPage));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    const paginatedCourses = useMemo(() => {
        const start = (safeCurrentPage - 1) * perPage;
        return filteredCourses.slice(start, start + perPage);
    }, [filteredCourses, safeCurrentPage, perPage]);

    const fromIndex = totalFiltered === 0 ? 0 : (safeCurrentPage - 1) * perPage + 1;
    const toIndex = Math.min(safeCurrentPage * perPage, totalFiltered);

    return (
        <AppLayout title="Data Matakuliah — Program Studi">
            <Head title="Data Mata Kuliah" />

            <div className="space-y-3.5">
                {/* 1. COMPACT HERO HEADER DENGAN INTEGRATED SUB-BAR PILIH PROGRAM STUDI */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative border border-slate-700/50 z-10">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black mb-1">
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                <span>STRUKTUR KURIKULUM & MATAKULIAH</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                                Data Mata Kuliah Program Studi
                            </h2>
                        </div>
                    </div>

                    {/* Integrated Sub-bar Pilih Program Studi */}
                    <div className="relative z-20 mt-3 pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-2.5">
                            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                            <div className="flex items-center space-x-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-300">Program Studi:</span>
                                {activeProgramObj ? (
                                    <div className="inline-flex items-center space-x-1.5">
                                        <span className="text-xs font-black text-white">{activeProgramObj.name}</span>
                                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                                            {activeProgramObj.code}
                                        </span>
                                        {activeProgramObj.degree && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                                {activeProgramObj.degree}
                                            </span>
                                        )}
                                        <span className="text-[11px] text-slate-300 font-medium">
                                            ({courses.length} Mata Kuliah Tersedia)
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-400 italic">Belum dipilih</span>
                                )}
                            </div>
                        </div>

                        {/* Custom Dropdown Trigger */}
                        <div ref={programDropdownRef} className="relative w-full sm:w-80">
                            <button
                                type="button"
                                onClick={() => setIsProgramDropdownOpen(prev => !prev)}
                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition shadow-2xs cursor-pointer text-left border ${
                                    isProgramDropdownOpen 
                                        ? 'border-emerald-400 ring-2 ring-emerald-500/30 bg-slate-800 text-white' 
                                        : activeProgramObj 
                                            ? 'border-emerald-500/50 bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-200 font-bold' 
                                            : 'border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 font-medium'
                                }`}
                            >
                                <div className="flex items-center space-x-2 truncate">
                                    <GraduationCap className={`w-3.5 h-3.5 shrink-0 ${activeProgramObj ? 'text-emerald-400' : 'text-slate-400'}`} />
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
                                            title="Reset Pilihan"
                                        >
                                            <X className="w-3 h-3" />
                                        </span>
                                    )}
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                        isProgramDropdownOpen ? 'rotate-180 text-emerald-400' : ''
                                    }`} />
                                </div>
                            </button>

                            {/* Popover Dropdown Menu */}
                            {isProgramDropdownOpen && (
                                <div className="absolute right-0 top-full mt-1.5 w-full sm:w-88 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn">
                                    {/* Header Popover */}
                                    <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                                            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>PILIH PROGRAM STUDI ({studyPrograms.length})</span>
                                        </span>
                                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                                            ESC
                                        </span>
                                    </div>

                                    {/* List Program Studi */}
                                    <div className="p-2 space-y-1.5 max-h-72 overflow-y-auto divide-y divide-slate-100/70">
                                        {studyPrograms.map((p) => {
                                            const isSelected = String(p.id) === String(programId);
                                            const cCount = p.courses_count ?? 0;
                                            return (
                                                <div
                                                    key={p.id}
                                                    onClick={() => {
                                                        handleProgramChange(String(p.id));
                                                        setIsProgramDropdownOpen(false);
                                                    }}
                                                    className={`p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between group ${
                                                        isSelected
                                                            ? 'bg-emerald-50 border border-emerald-300 shadow-2xs'
                                                            : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-2.5 min-w-0">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${
                                                            isSelected 
                                                                ? 'bg-emerald-600 text-white shadow-xs' 
                                                                : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800'
                                                        }`}>
                                                            <GraduationCap className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center space-x-1.5">
                                                                <h4 className={`text-xs truncate ${
                                                                    isSelected ? 'text-emerald-950 font-black' : 'text-slate-900 font-bold group-hover:text-emerald-700'
                                                                }`}>
                                                                    {p.name}
                                                                </h4>
                                                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                                                    isSelected 
                                                                        ? 'bg-emerald-200/80 text-emerald-900' 
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
                                                                ? 'bg-emerald-600 text-white font-black'
                                                                : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-800'
                                                        }`}>
                                                            {cCount} MK
                                                        </span>
                                                        {isSelected && (
                                                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                                                <Check className="w-3 h-3" />
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
                    </div>
                </div>

                {/* 2. KONTEN UTAMA: EMPTY STATE ATAU TABEL MATA KULIAH */}
                {!programId ? (
                    /* PLACEHOLDER KETIKA BELUM MEMILIH PROGRAM STUDI */
                    <div className="bg-white p-10 sm:p-14 rounded-2xl border border-slate-200 text-center space-y-3 shadow-2xs animate-fadeIn">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
                            <BookMarked className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-black text-slate-900">Pilih Program Studi Terlebih Dahulu</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                            Silakan pilih salah satu program studi pada menu pilihan di atas untuk menampilkan katalog mata kuliah akademik yang bernaung di program studi tersebut.
                        </p>
                        <div className="pt-2 flex items-center justify-center space-x-2">
                            <button
                                type="button"
                                onClick={() => setIsProgramDropdownOpen(true)}
                                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                            >
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>Pilih Program Studi ({studyPrograms.length})</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* TABEL DATA MATA KULIAH PROGRAM STUDI TERPILIH */
                    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden animate-fadeIn">
                        {/* Toolbar Filter & Per-Page Controls */}
                        <div className="p-3 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs relative z-20">
                            <div className="flex items-center space-x-2">
                                <span className="text-slate-600 text-[11px] font-bold">Tampilkan:</span>
                                <select
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 shadow-2xs focus:outline-emerald-500 cursor-pointer"
                                >
                                    <option value={5}>5 baris</option>
                                    <option value={10}>10 baris</option>
                                    <option value={25}>25 baris</option>
                                    <option value={50}>50 baris</option>
                                </select>
                                <span className="text-slate-500 text-[11px]">per halaman</span>
                            </div>

                            {/* Search Box & Tombol Tambah */}
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
                                        placeholder="Cari nama / kode mata kuliah..."
                                        className="pl-8 pr-7 py-1 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-emerald-500 w-52 sm:w-60 shadow-2xs"
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

                                {/* Tombol Tambah Mata Kuliah (Icon + Tooltip) */}
                                <div className="relative group">
                                    <button
                                        type="button"
                                        onClick={() => openModal()}
                                        title="Tambah Mata Kuliah Baru"
                                        aria-label="Tambah Mata Kuliah Baru"
                                        className="p-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-lg transition flex items-center justify-center shadow-xs cursor-pointer"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                    {/* Floating Tooltip (Muncul ke bawah agar tidak tertutup header) */}
                                    <div className="absolute right-0 top-full mt-2 hidden group-hover:flex flex-col items-end pointer-events-none z-50">
                                        <div className="w-2 h-2 mr-2.5 -mb-1 bg-slate-900 rotate-45 border-l border-t border-slate-700 z-10"></div>
                                        <span className="whitespace-nowrap px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-xl border border-slate-700">
                                            Tambah Mata Kuliah
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
                                            <td colSpan="10" className="py-8 text-center text-slate-500">
                                                <BookMarked className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                <p className="font-bold text-xs">Tidak ada mata kuliah yang terdaftar di program studi ini.</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">Klik tombol "+ Tambah Mata Kuliah" untuk menetapkan mata kuliah baru.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedCourses.map((item, idx) => (
                                            <tr key={item.id} className="hover:bg-emerald-50/40 transition">
                                                <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                                                    {(safeCurrentPage - 1) * perPage + idx + 1}
                                                </td>

                                                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                                                    <span className="font-mono text-[10px] font-black text-emerald-950 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded">
                                                        {item.code}
                                                    </span>
                                                </td>

                                                <td className="py-2.5 px-4 font-bold text-slate-900">
                                                    {item.name}
                                                </td>

                                                <td className="py-2.5 px-2 text-center font-mono font-black text-slate-900 bg-slate-50/50">
                                                    {Number(item.credits).toFixed(2)}
                                                </td>
                                                <td className="py-2.5 px-2 text-center font-mono text-slate-700">
                                                    {Number(item.theory_credits || item.credits).toFixed(2)}
                                                </td>
                                                <td className="py-2.5 px-2 text-center font-mono text-slate-500">
                                                    {Number(item.practice_credits || 0).toFixed(2)}
                                                </td>
                                                <td className="py-2.5 px-2 text-center font-mono text-slate-500">
                                                    {Number(item.field_credits || 0).toFixed(2)}
                                                </td>

                                                <td className="py-2.5 px-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                        item.course_type === 'Wajib' || item.course_type === 'WAJIB_PRODI'
                                                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                                                            : 'bg-amber-50 text-amber-800 border-amber-200'
                                                    }`}>
                                                        {item.course_type?.replace('_PRODI', '')}
                                                    </span>
                                                </td>

                                                <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                                                    {item.course_group || 'MKU/MKDU'}
                                                </td>

                                                <td className="py-2.5 px-3 text-center">
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openModal(item)}
                                                            className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition cursor-pointer"
                                                            title="Edit Mata Kuliah"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCourseToDelete(item)}
                                                            className="p-1 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition cursor-pointer"
                                                            title="Hapus Mata Kuliah"
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
                                Menampilkan <strong className="text-slate-800 font-bold">{fromIndex}</strong> - <strong className="text-slate-800 font-bold">{toIndex}</strong> dari <strong className="text-slate-800 font-bold">{totalFiltered}</strong> mata kuliah di <strong className="text-slate-800">{activeProgramObj?.name}</strong>
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
                                                        ? 'bg-emerald-600 text-white shadow-xs'
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
            {/* MODAL FORM: TAMBAH / EDIT MATA KULIAH */}
            {/* ========================================================================= */}
            {isModalOpen && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsModalOpen(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-2xs animate-fadeIn"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
                        {/* Header Dark Gradient */}
                        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center space-x-2">
                                <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">
                                    <BookMarked className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xs text-white">
                                        {editingCourse ? 'Edit Data Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
                                    </h3>
                                    <p className="text-[10px] text-slate-300">
                                        {editingCourse ? `Memperbarui rincian mata kuliah ${editingCourse.name}` : 'Tetapkan mata kuliah baru untuk program studi'}
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

                        <form onSubmit={handleFormSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs flex-1">
                            {/* Pilihan Program Studi */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block font-bold text-slate-700 text-[11px]">
                                        Program Studi <span className="text-rose-500">*</span>
                                    </label>
                                    {programId && !editingCourse && (
                                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center space-x-1">
                                            <Lock className="w-2.5 h-2.5 text-emerald-600" />
                                            <span>Terkunci</span>
                                        </span>
                                    )}
                                </div>
                                {programId && !editingCourse ? (
                                    <div className="w-full p-2 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-800 text-xs flex items-center justify-between shadow-2xs">
                                        <div className="flex items-center space-x-2 truncate">
                                            <GraduationCap className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                            <span className="truncate">
                                                {activeProgramObj?.name || 'Program Studi Terpilih'} ({activeProgramObj?.code})
                                            </span>
                                        </div>
                                        <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                                    </div>
                                ) : (
                                    <select
                                        value={form.data.study_program_id}
                                        onChange={(e) => {
                                            const newPId = e.target.value;
                                            form.setData({
                                                ...form.data,
                                                study_program_id: newPId,
                                                code: editingCourse ? form.data.code : generateCourseCode(newPId)
                                            });
                                        }}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-emerald-500"
                                        required
                                    >
                                        {studyPrograms.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.code} - {p.name} {p.degree ? `(${p.degree})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Kode & Total SKS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block font-bold text-slate-700 text-[11px]">
                                            Kode Mata Kuliah <span className="text-rose-500">*</span>
                                            {!editingCourse && (
                                                <span className="text-[10px] text-emerald-600 font-normal ml-1.5">(Terisi otomatis, dapat diedit)</span>
                                            )}
                                        </label>
                                        {!editingCourse && (
                                            <button
                                                type="button"
                                                onClick={() => form.setData('code', generateCourseCode(form.data.study_program_id))}
                                                className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center space-x-1 cursor-pointer transition"
                                                title="Generate ulang kode otomatis"
                                            >
                                                <RefreshCw className="w-2.5 h-2.5" />
                                                <span>Auto Code</span>
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={form.data.code}
                                        onChange={(e) => form.setData('code', e.target.value.toUpperCase())}
                                        placeholder="Contoh: PAI101"
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold uppercase focus:outline-emerald-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                        Total Bobot SKS <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={form.data.credits}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value) || 0;
                                            form.setData({
                                                ...form.data,
                                                credits: val,
                                                theory_credits: val
                                            });
                                        }}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold focus:outline-emerald-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Nama Mata Kuliah */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                    Nama Lengkap Mata Kuliah <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="Contoh: Metodologi Penelitian Pendidikan Islam"
                                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold focus:outline-emerald-500"
                                    required
                                />
                            </div>

                            {/* Rincian Komposisi SKS */}
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase">SKS Tatap Muka:</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={form.data.theory_credits}
                                        onChange={(e) => form.setData('theory_credits', parseFloat(e.target.value) || 0)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-center focus:outline-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase">SKS Praktikum:</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={form.data.practice_credits}
                                        onChange={(e) => form.setData('practice_credits', parseFloat(e.target.value) || 0)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-center focus:outline-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase">SKS Lapangan:</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={form.data.field_credits}
                                        onChange={(e) => form.setData('field_credits', parseFloat(e.target.value) || 0)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-center focus:outline-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Jenis & Kelompok MK */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                        Jenis Mata Kuliah <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={form.data.course_type}
                                        onChange={(e) => form.setData('course_type', e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-emerald-500"
                                        required
                                    >
                                        <option value="Wajib">Wajib</option>
                                        <option value="Pilihan">Pilihan</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                        Kelompok Mata Kuliah <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={form.data.course_group}
                                        onChange={(e) => form.setData('course_group', e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-emerald-500"
                                        required
                                    >
                                        <option value="MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)">MKU/MKDU (Umum)</option>
                                        <option value="MKK (Mata Kuliah Keahlian)">MKK (Keahlian)</option>
                                        <option value="MKDK (Mata Kuliah Dasar Keahlian)">MKDK (Dasar Keahlian)</option>
                                        <option value="MKB (Mata Kuliah Keahlian Berkarya)">MKB (Berkarya)</option>
                                        <option value="MPK (Mata Kuliah Pengembangan Kepribadian)">MPK (Kepribadian)</option>
                                    </select>
                                </div>
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
                                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-xs flex items-center space-x-1.5 cursor-pointer"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{form.processing ? 'Menyimpan...' : (editingCourse ? 'Perbarui Mata Kuliah' : 'Simpan Mata Kuliah')}</span>
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
                                    <h3 className="font-bold text-xs text-white">Konfirmasi Hapus Mata Kuliah</h3>
                                    <p className="text-[10px] text-rose-300">Tindakan ini permanen dan tidak dapat dibatalkan</p>
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
                                        {Number(courseToDelete.credits).toFixed(1)} SKS
                                    </span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-rose-200 rounded text-slate-700">
                                        {courseToDelete.course_type?.replace('_PRODI', '')}
                                    </span>
                                </div>
                                <p className="text-xs font-black text-slate-900 leading-snug">
                                    {courseToDelete.name}
                                </p>
                                {courseToDelete.course_group && (
                                    <p className="text-[10px] text-slate-500 truncate">
                                        {courseToDelete.course_group}
                                    </p>
                                )}
                            </div>

                            {/* Warning Alert */}
                            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-[11px] leading-relaxed">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <span>
                                    Data mata kuliah ini beserta relasi kurikulum dan jadwal yang menggunakannya akan terpengaruh. Pastikan Anda benar-benar yakin sebelum melanjutkan.
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
                                    <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Permanen'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
