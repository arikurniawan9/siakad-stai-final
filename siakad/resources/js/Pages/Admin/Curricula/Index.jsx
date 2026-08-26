import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    BookOpen, Plus, Trash2, Edit2, Search, 
    Layers, CheckCircle2, ChevronRight, Filter, 
    SlidersHorizontal, Eye, FileSpreadsheet, Sparkles, X, Save,
    Award, Calendar, GraduationCap, ChevronDown, Check, Lock,
    RefreshCw, ChevronLeft, AlertTriangle
} from 'lucide-react';

export default function CurriculaIndex({ studyPrograms = [], selectedProgramId = null, curricula = [] }) {
    const [programId, setProgramId] = useState(selectedProgramId ? String(selectedProgramId) : '');
    const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);
    const programDropdownRef = useRef(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCurriculum, setEditingCurriculum] = useState(null);

    // State Konfirmasi Hapus Modal
    const [curriculumToDelete, setCurriculumToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Active Study Program Object
    const activeProgramObj = useMemo(() => {
        return studyPrograms.find(p => String(p.id) === String(programId)) || null;
    }, [studyPrograms, programId]);

    // Close active modal or dropdown on ESC key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
                if (curriculumToDelete) {
                    setCurriculumToDelete(null);
                } else if (isProgramDropdownOpen) {
                    setIsProgramDropdownOpen(false);
                } else if (isModalOpen) {
                    setIsModalOpen(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, isProgramDropdownOpen, curriculumToDelete]);

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

    // Form Kurikulum
    const form = useForm({
        study_program_id: studyPrograms[0]?.id || 1,
        code: '',
        name: '',
        start_year: new Date().getFullYear(),
        ideal_semesters: 8,
        total_credits_required: 144,
        mandatory_credits: 136,
        elective_credits: 8,
        is_active: true,
    });

    // Helper untuk auto-generate kode kurikulum
    const generateCurriculumCode = (targetProgramId = null) => {
        const pId = targetProgramId || programId || (studyPrograms[0]?.id ? String(studyPrograms[0].id) : null);
        const targetProgram = studyPrograms.find(p => String(p.id) === String(pId));
        const prefix = targetProgram?.code ? targetProgram.code.replace(/[^A-Za-z0-9]/g, '').toUpperCase() : 'PRD';
        const year = new Date().getFullYear();
        
        let candidate = `KUR-${prefix}-${year}`;
        let counter = 1;
        while (curricula.some(c => c.code?.toUpperCase() === candidate.toUpperCase())) {
            counter++;
            candidate = `KUR-${prefix}-${year}-v${counter}`;
        }
        return candidate;
    };

    // Handle Program Studi Switch
    const handleProgramChange = (newProgramId) => {
        setProgramId(newProgramId);
        setCurrentPage(1);
        setSearchTerm('');
        if (newProgramId) {
            router.get('/admin/curricula', { program_id: newProgramId }, { preserveState: true, preserveScroll: true });
        } else {
            router.get('/admin/curricula', {}, { preserveState: true, preserveScroll: true });
        }
    };

    // Open Modal Tambah / Edit
    const openModal = (curriculum = null) => {
        setEditingCurriculum(curriculum);
        if (curriculum) {
            form.setData({
                study_program_id: curriculum.study_program_id,
                code: curriculum.code || '',
                name: curriculum.name || '',
                start_year: curriculum.start_year || new Date().getFullYear(),
                ideal_semesters: curriculum.ideal_semesters || 8,
                total_credits_required: curriculum.total_credits_required || 144,
                mandatory_credits: curriculum.mandatory_credits || 136,
                elective_credits: curriculum.elective_credits || 8,
                is_active: Boolean(curriculum.is_active),
            });
        } else {
            const initialProgramId = programId ? parseInt(programId) : (studyPrograms[0]?.id || 1);
            const autoCode = generateCurriculumCode(initialProgramId);
            const targetProg = studyPrograms.find(p => p.id === initialProgramId);
            form.reset();
            form.setData({
                study_program_id: initialProgramId,
                code: autoCode,
                name: targetProg ? `Kurikulum OBE ${targetProg.code} ${new Date().getFullYear()}` : '',
                start_year: new Date().getFullYear(),
                ideal_semesters: 8,
                total_credits_required: 144,
                mandatory_credits: 136,
                elective_credits: 8,
                is_active: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (editingCurriculum) {
            form.put(`/admin/curricula/${editingCurriculum.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post('/admin/curricula', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    // Eksekusi Hapus Kurikulum
    const confirmDeleteCurriculum = () => {
        if (!curriculumToDelete) return;
        setIsDeleting(true);
        router.delete(`/admin/curricula/${curriculumToDelete.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setCurriculumToDelete(null);
            },
        });
    };

    // Filter Kurikulum Program Studi Terpilih
    const prodiCurricula = useMemo(() => {
        if (!programId) return [];
        return curricula.filter(c => String(c.study_program_id) === String(programId));
    }, [curricula, programId]);

    // Search filter
    const filteredCurricula = useMemo(() => {
        if (!programId) return [];
        return prodiCurricula.filter(c => {
            const q = searchTerm.toLowerCase().trim();
            if (!q) return true;
            return (
                c.name?.toLowerCase().includes(q) || 
                c.code?.toLowerCase().includes(q) ||
                (c.start_year && String(c.start_year).includes(q))
            );
        });
    }, [prodiCurricula, programId, searchTerm]);

    const totalFiltered = filteredCurricula.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / perPage));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    const paginatedCurricula = useMemo(() => {
        const start = (safeCurrentPage - 1) * perPage;
        return filteredCurricula.slice(start, start + perPage);
    }, [filteredCurricula, safeCurrentPage, perPage]);

    const fromIndex = totalFiltered === 0 ? 0 : (safeCurrentPage - 1) * perPage + 1;
    const toIndex = Math.min(safeCurrentPage * perPage, totalFiltered);


    return (
        <AppLayout title="Data Kurikulum — Program Studi">
            <Head title="Data Kurikulum — SIAKAD" />

            <div className="space-y-3.5">
                {/* 1. COMPACT HERO HEADER DENGAN INTEGRATED SUB-BAR PILIH PROGRAM STUDI (THEMA PURPLE) */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-purple-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative border border-slate-700/50 z-10">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black mb-1">
                                <Sparkles className="w-3 h-3 text-purple-400" />
                                <span>STRUKTUR KURIKULUM & AKADEMIK</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                                Data Kurikulum Program Studi
                            </h2>
                        </div>
                    </div>

                    {/* Integrated Sub-bar Pilih Program Studi */}
                    <div className="relative z-20 mt-3 pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-2.5">
                            <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                            <div className="flex items-center space-x-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-300">Program Studi:</span>
                                {activeProgramObj ? (
                                    <div className="inline-flex items-center space-x-1.5">
                                        <span className="text-xs font-black text-white">{activeProgramObj.name}</span>
                                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300 border border-purple-500/40">
                                            {activeProgramObj.code}
                                        </span>
                                        {activeProgramObj.degree && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                                {activeProgramObj.degree}
                                            </span>
                                        )}
                                        <span className="text-[11px] text-slate-300 font-medium">
                                            ({prodiCurricula.length} Kurikulum)
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
                                        ? 'border-purple-400 ring-2 ring-purple-500/30 bg-slate-800 text-white' 
                                        : activeProgramObj 
                                            ? 'border-purple-500/50 bg-purple-950/50 hover:bg-purple-900/50 text-purple-200 font-bold' 
                                            : 'border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 font-medium'
                                }`}
                            >
                                <div className="flex items-center space-x-2 truncate">
                                    <GraduationCap className={`w-3.5 h-3.5 shrink-0 ${activeProgramObj ? 'text-purple-400' : 'text-slate-400'}`} />
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
                                        isProgramDropdownOpen ? 'rotate-180 text-purple-400' : ''
                                    }`} />
                                </div>
                            </button>

                            {/* Popover Dropdown Menu */}
                            {isProgramDropdownOpen && (
                                <div className="absolute right-0 top-full mt-1.5 w-full sm:w-88 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn">
                                    {/* Header Popover */}
                                    <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                                            <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
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
                                            const cCount = p.curricula_count ?? (curricula.filter(c => String(c.study_program_id) === String(p.id)).length);
                                            return (
                                                <div
                                                    key={p.id}
                                                    onClick={() => {
                                                        handleProgramChange(String(p.id));
                                                        setIsProgramDropdownOpen(false);
                                                    }}
                                                    className={`p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between group ${
                                                        isSelected
                                                            ? 'bg-purple-50 border border-purple-300 shadow-2xs'
                                                            : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-2.5 min-w-0">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${
                                                            isSelected 
                                                                ? 'bg-purple-600 text-white shadow-xs' 
                                                                : 'bg-slate-100 text-slate-600 group-hover:bg-purple-100 group-hover:text-purple-800'
                                                        }`}>
                                                            <GraduationCap className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center space-x-1.5">
                                                                <h4 className={`text-xs truncate ${
                                                                    isSelected ? 'text-purple-950 font-black' : 'text-slate-900 font-bold group-hover:text-purple-700'
                                                                }`}>
                                                                    {p.name}
                                                                </h4>
                                                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                                                    isSelected 
                                                                        ? 'bg-purple-200/80 text-purple-900' 
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
                                                                ? 'bg-purple-600 text-white font-black'
                                                                : 'bg-slate-100 text-slate-600 group-hover:bg-purple-50 group-hover:text-purple-800'
                                                        }`}>
                                                            {cCount} Kurikulum
                                                        </span>
                                                        {isSelected && (
                                                            <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
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

                {/* 2. KONTEN UTAMA: EMPTY STATE ATAU TABEL KURIKULUM */}
                {!programId ? (
                    /* PLACEHOLDER KETIKA BELUM MEMILIH PROGRAM STUDI (THEMA PURPLE) */
                    <div className="bg-white p-10 sm:p-14 rounded-2xl border border-slate-200 text-center space-y-3 shadow-2xs animate-fadeIn">
                        <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto shadow-2xs">
                            <GraduationCap className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-black text-slate-900">Pilih Program Studi Terlebih Dahulu</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                            Silakan pilih salah satu program studi pada menu pilihan di atas untuk menampilkan daftar kurikulum akademik yang bernaung di program studi tersebut.
                        </p>
                        <div className="pt-2 flex items-center justify-center space-x-2">
                            <button
                                type="button"
                                onClick={() => setIsProgramDropdownOpen(true)}
                                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs shadow-purple-500/20"
                            >
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>Pilih Program Studi ({studyPrograms.length})</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* TABEL DATA KURIKULUM PROGRAM STUDI TERPILIH */
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
                                    className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 shadow-2xs focus:outline-purple-500 cursor-pointer"
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
                                        placeholder="Cari nama / kode kurikulum..."
                                        className="pl-8 pr-7 py-1 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-purple-500 w-52 sm:w-60 shadow-2xs"
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

                                {/* Tombol Tambah Kurikulum (Icon + Tooltip) */}
                                <div className="relative group">
                                    <button
                                        type="button"
                                        onClick={() => openModal()}
                                        title="Tambah Kurikulum Baru"
                                        aria-label="Tambah Kurikulum Baru"
                                        className="p-1.5 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white rounded-lg transition flex items-center justify-center shadow-xs cursor-pointer"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                    {/* Floating Tooltip (Muncul ke bawah agar tidak tertutup header) */}
                                    <div className="absolute right-0 top-full mt-2 hidden group-hover:flex flex-col items-end pointer-events-none z-50">
                                        <div className="w-2 h-2 mr-2.5 -mb-1 bg-slate-900 rotate-45 border-l border-t border-slate-700 z-10"></div>
                                        <span className="whitespace-nowrap px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-xl border border-slate-700">
                                            Tambah Kurikulum
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
                                        <th rowSpan="2" className="py-2.5 px-3 border-r border-slate-800">Kode & Nama Kurikulum</th>
                                        <th rowSpan="2" className="py-2.5 px-3 border-r border-slate-800">Program Studi</th>
                                        <th rowSpan="2" className="py-2.5 px-3 text-center border-r border-slate-800">Masa Studi</th>
                                        <th colSpan="3" className="py-1.5 px-2 text-center border-b border-slate-800 bg-slate-800">Beban SKS</th>
                                        <th rowSpan="2" className="py-2.5 px-3 text-center border-r border-slate-800">Matakuliah</th>
                                        <th rowSpan="2" className="py-2.5 px-3 text-center border-r border-slate-800">Status</th>
                                        <th rowSpan="2" className="py-2.5 px-3 text-center w-24">Aksi</th>
                                    </tr>
                                    <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[9px]">
                                        <th className="py-1 px-2 text-center w-14 border-r border-slate-800 bg-slate-800/80">Lulus</th>
                                        <th className="py-1 px-2 text-center w-14 border-r border-slate-800 bg-slate-800/80">Wajib</th>
                                        <th className="py-1 px-2 text-center w-14 border-r border-slate-800 bg-slate-800/80">Pilihan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {paginatedCurricula.length === 0 ? (
                                        <tr>
                                            <td colSpan="10" className="py-8 text-center text-slate-500">
                                                <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                <p className="font-bold text-xs">Tidak ada kurikulum yang terdaftar di program studi ini.</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">Klik tombol "+ Tambah Kurikulum" untuk menetapkan kurikulum baru.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedCurricula.map((item, idx) => (
                                            <tr key={item.id} className="hover:bg-purple-50/40 transition">
                                                <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                                                    {(safeCurrentPage - 1) * perPage + idx + 1}
                                                </td>

                                                <td className="py-2.5 px-3">
                                                    <div className="flex items-center space-x-1.5">
                                                        <span className="font-mono text-[10px] font-black text-purple-950 px-2 py-0.5 bg-purple-50 border border-purple-200 rounded">
                                                            {item.code}
                                                        </span>
                                                        <span className="text-slate-900 font-bold">{item.name}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                                        Tahun Berlaku: <strong className="text-slate-600">{item.start_year}</strong>
                                                    </p>
                                                </td>

                                                <td className="py-2.5 px-3 text-slate-700">
                                                    <span className="font-bold text-slate-800">
                                                        {item.study_program_code} - {item.study_program_name}
                                                    </span>
                                                    {item.study_program_degree && (
                                                        <span className="ml-1.5 px-1.5 py-0.2 bg-slate-100 border border-slate-200 rounded text-[9px] font-black text-slate-600">
                                                            {item.study_program_degree}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                                                    {item.ideal_semesters || 8} Sem
                                                </td>

                                                <td className="py-2.5 px-2 text-center font-mono font-black text-slate-900 bg-slate-50/50">
                                                    {item.total_credits_required || 144}
                                                </td>
                                                <td className="py-2.5 px-2 text-center font-mono font-black text-blue-700 bg-blue-50/30">
                                                    {item.mandatory_credits || 136}
                                                </td>
                                                <td className="py-2.5 px-2 text-center font-mono font-black text-amber-700 bg-amber-50/30">
                                                    {item.elective_credits || 8}
                                                </td>

                                                <td className="py-2.5 px-3 text-center">
                                                    <Link
                                                        href={`/admin/course-curriculum?program_id=${item.study_program_id}&curriculum_id=${item.id}`}
                                                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-[10px] font-black transition border border-purple-200"
                                                        title="Buka Plotting Matakuliah Kurikulum"
                                                    >
                                                        <BookOpen className="w-3 h-3 text-purple-600" />
                                                        <span>{item.courses_count || 0} MK →</span>
                                                    </Link>
                                                </td>

                                                <td className="py-2.5 px-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                        item.is_active 
                                                            ? 'bg-purple-100 text-purple-800 border-purple-300' 
                                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                                    }`}>
                                                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </td>

                                                <td className="py-2.5 px-3 text-center">
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openModal(item)}
                                                            className="p-1 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-md transition cursor-pointer"
                                                            title="Edit Data Kurikulum"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCurriculumToDelete(item)}
                                                            className="p-1 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition cursor-pointer"
                                                            title="Hapus Kurikulum"
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
                                Menampilkan <strong className="text-slate-800 font-bold">{fromIndex}</strong> - <strong className="text-slate-800 font-bold">{toIndex}</strong> dari <strong className="text-slate-800 font-bold">{totalFiltered}</strong> kurikulum di <strong className="text-slate-800">{activeProgramObj?.name}</strong>
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
                                                        ? 'bg-purple-600 text-white shadow-xs'
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
            {/* MODAL FORM: TAMBAH / EDIT KURIKULUM (THEMA PURPLE) */}
            {/* ========================================================================= */}
            {isModalOpen && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsModalOpen(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-2xs animate-fadeIn"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
                        {/* Header Dark Gradient (Purple) */}
                        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-purple-950 text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center space-x-2">
                                <div className="p-1.5 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xs text-white">
                                        {editingCurriculum ? 'Edit Data Kurikulum' : 'Tambah Kurikulum Baru'}
                                    </h3>
                                    <p className="text-[10px] text-slate-300">
                                        {editingCurriculum ? `Memperbarui rincian kurikulum ${editingCurriculum.name}` : 'Tetapkan kurikulum untuk program studi'}
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
                                    {programId && !editingCurriculum && (
                                        <span className="text-[9px] font-bold text-purple-800 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200 flex items-center space-x-1">
                                            <Lock className="w-2.5 h-2.5 text-purple-600" />
                                            <span>Terkunci</span>
                                        </span>
                                    )}
                                </div>
                                {programId && !editingCurriculum ? (
                                    <div className="w-full p-2 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-800 text-xs flex items-center justify-between shadow-2xs">
                                        <div className="flex items-center space-x-2 truncate">
                                            <GraduationCap className="w-3.5 h-3.5 text-purple-700 shrink-0" />
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
                                                code: editingCurriculum ? form.data.code : generateCurriculumCode(newPId)
                                            });
                                        }}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-purple-500"
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

                            {/* Kode & Tahun Mulai */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block font-bold text-slate-700 text-[11px]">
                                            Kode Kurikulum <span className="text-rose-500">*</span>
                                            {!editingCurriculum && (
                                                <span className="text-[10px] text-purple-600 font-normal ml-1.5">(Terisi otomatis, dapat diedit)</span>
                                            )}
                                        </label>
                                        {!editingCurriculum && (
                                            <button
                                                type="button"
                                                onClick={() => form.setData('code', generateCurriculumCode(form.data.study_program_id))}
                                                className="text-[10px] text-purple-600 hover:text-purple-700 font-bold flex items-center space-x-1 cursor-pointer transition"
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
                                        placeholder="Contoh: KUR-PAI-2024"
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold uppercase focus:outline-purple-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                        Tahun Mulai Berlaku <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="2000"
                                        max="2099"
                                        value={form.data.start_year}
                                        onChange={(e) => form.setData('start_year', parseInt(e.target.value) || new Date().getFullYear())}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold focus:outline-purple-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Nama Kurikulum */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                    Nama Lengkap Kurikulum <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="Contoh: Kurikulum Merdeka OBE PAI 2026"
                                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold focus:outline-purple-500"
                                    required
                                />
                            </div>

                            {/* Masa Studi & Beban SKS */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase">Masa Studi (Sem):</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="14"
                                        value={form.data.ideal_semesters}
                                        onChange={(e) => form.setData('ideal_semesters', parseInt(e.target.value) || 8)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-center focus:outline-purple-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase">SKS Lulus:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.data.total_credits_required}
                                        onChange={(e) => form.setData('total_credits_required', parseInt(e.target.value) || 144)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-center text-slate-900 focus:outline-purple-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase">SKS Wajib:</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.data.mandatory_credits}
                                        onChange={(e) => form.setData('mandatory_credits', parseInt(e.target.value) || 0)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-center text-blue-700 focus:outline-purple-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase">SKS Pilihan:</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.data.elective_credits}
                                        onChange={(e) => form.setData('elective_credits', parseInt(e.target.value) || 0)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-center text-amber-700 focus:outline-purple-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Status Aktif */}
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-900 text-xs">Status Kurikulum</p>
                                    <p className="text-[10px] text-slate-500">Kurikulum aktif dapat dipilih mahasiswa saat menyusun rencana studi.</p>
                                </div>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_active}
                                        onChange={(e) => form.setData('is_active', e.target.checked)}
                                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                                    />
                                    <span className="font-bold text-xs">{form.data.is_active ? 'Aktif' : 'Nonaktif'}</span>
                                </label>
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
                                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-xs flex items-center space-x-1.5 cursor-pointer"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{form.processing ? 'Menyimpan...' : (editingCurriculum ? 'Perbarui Kurikulum' : 'Simpan Kurikulum')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL KONFIRMASI HAPUS (PREMIUM ROSE / RED DESIGN) */}
            {/* ========================================================================= */}
            {curriculumToDelete && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !isDeleting) setCurriculumToDelete(null);
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
                                    <h3 className="font-bold text-xs text-white">Konfirmasi Hapus Kurikulum</h3>
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
                                    onClick={() => setCurriculumToDelete(null)} 
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
                                        {curriculumToDelete.code}
                                    </span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-rose-200 rounded text-slate-700">
                                        Tahun {curriculumToDelete.start_year}
                                    </span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-rose-200 rounded text-slate-700">
                                        {curriculumToDelete.total_credits_required || 144} SKS
                                    </span>
                                </div>
                                <p className="text-xs font-black text-slate-900 leading-snug">
                                    {curriculumToDelete.name}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                    Program Studi: <strong className="text-slate-700">{curriculumToDelete.study_program_name}</strong>
                                </p>
                            </div>

                            {/* Warning Alert */}
                            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-[11px] leading-relaxed">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <span>
                                    Data kurikulum ini beserta data plotting mata kuliah dan mahasiswa yang bernaung di bawahnya akan terpengaruh. Pastikan Anda benar-benar yakin sebelum menghapus.
                                </span>
                            </div>

                            {/* Footer Buttons */}
                            <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    disabled={isDeleting}
                                    onClick={() => setCurriculumToDelete(null)} 
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="button" 
                                    disabled={isDeleting}
                                    onClick={confirmDeleteCurriculum}
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
