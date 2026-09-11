import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import * as XLSX from 'xlsx';
import { 
    BookOpen, Plus, Trash2, Edit2, Search, 
    Layers, CheckCircle2, ChevronRight, Filter, 
    BookMarked, Sparkles, X, Save, GraduationCap,
    ChevronDown, Check, Lock, RefreshCw, ChevronLeft,
    AlertTriangle, UploadCloud, FileSpreadsheet, Printer,
    Download, FileText, AlertCircle, Loader2, ArrowRight,
    FileCheck, Info
} from 'lucide-react';

export default function CoursesIndex({ studyPrograms = [], selectedProgramId = null, courses = [] }) {
    const [programId, setProgramId] = useState(selectedProgramId ? String(selectedProgramId) : '');
    const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);
    const programDropdownRef = useRef(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Modal Tambah / Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    // Modal Hapus
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // =========================================================================
    // STATE MODAL IMPOR EXCEL
    // =========================================================================
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importStep, setImportStep] = useState('upload'); // 'upload' | 'preview' | 'success'
    const [importFile, setImportFile] = useState(null);
    const [isParsing, setIsParsing] = useState(false);
    const [analyzedData, setAnalyzedData] = useState(null);
    const [conflictMode, setConflictMode] = useState('skip'); // 'skip' | 'overwrite'
    const [previewFilter, setPreviewFilter] = useState('all'); // 'all' | 'ready' | 'conflict' | 'invalid'
    const [isProcessingImport, setIsProcessingImport] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const fileInputRef = useRef(null);

    // Active Study Program Object
    const activeProgramObj = useMemo(() => {
        return studyPrograms.find(p => String(p.id) === String(programId)) || null;
    }, [studyPrograms, programId]);

    // Close active modal or dropdown on ESC key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
                if (isImportModalOpen && !isProcessingImport) {
                    setIsImportModalOpen(false);
                } else if (courseToDelete && !isDeleting) {
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
    }, [isModalOpen, isProgramDropdownOpen, courseToDelete, isImportModalOpen, isProcessingImport, isDeleting]);

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

    // Form Mata Kuliah Manual
    const form = useForm({
        study_program_id: studyPrograms[0]?.id || 1,
        code: '',
        name: '',
        name_en: '',
        credits: 2.00,
        theory_credits: 2.00,
        practice_credits: 0.00,
        field_credits: 0.00,
        semester_level: 1,
        course_type: 'Wajib',
        course_group: 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)',
        description: '',
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
                name_en: course.name_en || '',
                credits: parseFloat(course.credits) || 2.00,
                theory_credits: parseFloat(course.theory_credits) || 2.00,
                practice_credits: parseFloat(course.practice_credits) || 0.00,
                field_credits: parseFloat(course.field_credits) || 0.00,
                semester_level: course.semester_level || 1,
                course_type: course.course_type || 'Wajib',
                course_group: course.course_group || 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)',
                description: course.description || '',
            });
        } else {
            const initialProgramId = programId ? parseInt(programId) : (studyPrograms[0]?.id || 1);
            const autoCode = generateCourseCode(initialProgramId);
            form.reset();
            form.setData({
                study_program_id: initialProgramId,
                code: autoCode,
                name: '',
                name_en: '',
                credits: 2.00,
                theory_credits: 2.00,
                practice_credits: 0.00,
                field_credits: 0.00,
                semester_level: 1,
                course_type: 'Wajib',
                course_group: 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)',
                description: '',
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

    // =========================================================================
    // HANDLERS EKSPOR EXCEL & PDF
    // =========================================================================
    const handleExportExcel = () => {
        const url = `/admin/courses/export-excel` + (programId ? `?program_id=${programId}` : '');
        window.location.href = url;
    };

    const handlePrintPdf = () => {
        const url = `/admin/courses/print-pdf` + (programId ? `?program_id=${programId}` : '');
        window.open(url, '_blank');
    };

    // =========================================================================
    // HANDLERS IMPOR EXCEL
    // =========================================================================
    const openImportModal = () => {
        setImportStep('upload');
        setImportFile(null);
        setAnalyzedData(null);
        setImportResult(null);
        setConflictMode('skip');
        setPreviewFilter('all');
        setIsImportModalOpen(true);
    };

    const handleFileSelect = (file) => {
        if (!file) return;
        setImportFile(file);
        setIsParsing(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.SheetNames[0];
                const rawJson = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: '' });

                if (!rawJson || rawJson.length === 0) {
                    alert('Berkas Excel kosong atau tidak memiliki baris data yang valid.');
                    setIsParsing(false);
                    return;
                }

                // Normalisasi nama kolom fleksibel
                const records = rawJson.map(row => {
                    const findVal = (keys) => {
                        for (const k of keys) {
                            const foundKey = Object.keys(row).find(
                                rk => rk.toLowerCase().replace(/[^a-z0-9_]/g, '_').trim() === k.toLowerCase().replace(/[^a-z0-9_]/g, '_').trim()
                            );
                            if (foundKey && row[foundKey] !== undefined && row[foundKey] !== '') {
                                return row[foundKey];
                            }
                        }
                        return '';
                    };

                    return {
                        kode_mk: findVal(['kode_mk', 'code', 'kode', 'kode_mata_kuliah', 'kode_matakuliah', 'kd_mk']),
                        nama_mk: findVal(['nama_mk', 'name', 'nama', 'nama_mata_kuliah', 'nama_matakuliah', 'matakuliah']),
                        nama_mk_en: findVal(['nama_mk_en', 'name_en', 'nama_inggris', 'english_name', 'course_name_en']),
                        sks_total: findVal(['sks_total', 'credits', 'sks', 'total_sks', 'bobot_sks', 'bobot']),
                        sks_tatap_muka: findVal(['sks_tatap_muka', 'theory_credits', 'teori', 'tatap_muka', 'sks_teori']),
                        sks_praktikum: findVal(['sks_praktikum', 'practice_credits', 'praktik', 'praktikum', 'sks_praktik']),
                        sks_lapangan: findVal(['sks_lapangan', 'field_credits', 'lapangan', 'sks_lapangan']),
                        semester: findVal(['semester', 'semester_level', 'smt', 'sem']),
                        jenis_mk: findVal(['jenis_mk', 'course_type', 'jenis', 'sifat']),
                        kelompok_mk: findVal(['kelompok_mk', 'course_group', 'kelompok']),
                        kode_prodi: findVal(['kode_prodi', 'program_code', 'prodi', 'program_studi']),
                        deskripsi: findVal(['deskripsi', 'description', 'keterangan', 'silabus']),
                    };
                });

                // Kirim ke server untuk verifikasi & analisis awal
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                const res = await fetch('/admin/courses/check-import', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify({
                        records,
                        program_id: programId || null,
                    }),
                });

                const jsonResult = await res.json();
                if (res.ok && jsonResult.success) {
                    setAnalyzedData(jsonResult);
                    setImportStep('preview');
                } else {
                    alert(jsonResult.message || 'Gagal menganalisis struktur data berkas Excel.');
                }
            } catch (err) {
                console.error('Import parse error:', err);
                alert('Gagal membaca isi berkas. Pastikan file berformat .xlsx, .xls, atau .csv yang valid.');
            } finally {
                setIsParsing(false);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleExecuteImport = async () => {
        if (!analyzedData || !analyzedData.analyzed) return;
        setIsProcessingImport(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch('/admin/courses/process-import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    records: analyzedData.analyzed,
                    conflict_mode: conflictMode,
                    program_id: programId || null,
                }),
            });

            const result = await res.json();
            if (res.ok && result.success) {
                setImportResult(result);
                setImportStep('success');
            } else {
                alert(result.message || 'Terjadi kesalahan saat memproses impor data.');
            }
        } catch (err) {
            console.error('Import process error:', err);
            alert('Koneksi terputus saat mengeksekusi impor data.');
        } finally {
            setIsProcessingImport(false);
        }
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

    // Filter baris yang ditampilkan pada preview impor
    const filteredImportRows = useMemo(() => {
        if (!analyzedData || !analyzedData.analyzed) return [];
        if (previewFilter === 'all') return analyzedData.analyzed;
        return analyzedData.analyzed.filter(r => r.status === previewFilter);
    }, [analyzedData, previewFilter]);

    return (
        <AppLayout title="Data Matakuliah — Program Studi">
            <Head title="Data Mata Kuliah" />

            <div className="space-y-3.5">
                {/* 1. COMPACT HERO HEADER DENGAN INTEGRATED SUB-BAR & ACTION BUTTONS */}
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
                            <p className="text-xs text-slate-300 mt-0.5">
                                Kelola katalog kurikulum, beban SKS, serta fitur ekspor-impor berkas akademik resmi.
                            </p>
                        </div>

                        {/* Top Global Action Buttons */}
                        <div className="flex items-center space-x-2 flex-wrap">
                            <button
                                type="button"
                                onClick={openImportModal}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer border border-emerald-500/40 active:scale-95"
                                title="Import Data Mata Kuliah dari Excel"
                            >
                                <UploadCloud className="w-3.5 h-3.5 text-emerald-300" />
                                <span>Impor Excel</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleExportExcel}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer border border-slate-700 active:scale-95"
                                title="Ekspor Data ke Format Excel (.xls) Resmi"
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Ekspor Excel</span>
                            </button>

                            <button
                                type="button"
                                onClick={handlePrintPdf}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer border border-slate-700 active:scale-95"
                                title="Cetak / Pratinjau Dokumen PDF Resmi Ber-KOP"
                            >
                                <Printer className="w-3.5 h-3.5 text-amber-400" />
                                <span>Cetak / PDF</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => openModal()}
                                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition shadow-sm shadow-emerald-500/30 cursor-pointer active:scale-95"
                                title="Tambah Mata Kuliah Baru Secara Manual"
                            >
                                <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
                                <span>Tambah MK</span>
                            </button>
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
                                    <span className="text-xs text-slate-400 italic">Belum dipilih (Menampilkan seluruh prodi)</span>
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
                                        <button
                                            type="button"
                                            onClick={() => setIsProgramDropdownOpen(false)}
                                            className="text-slate-400 hover:text-slate-600 p-0.5"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* List Program Studi */}
                                    <div className="max-h-72 overflow-y-auto p-1.5 space-y-1 divide-y divide-slate-100/50">
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
                    <div className="bg-white p-10 sm:p-14 rounded-2xl border border-slate-200 text-center space-y-4 shadow-2xs animate-fadeIn">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
                            <BookMarked className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-black text-slate-900">Pilih Program Studi Terlebih Dahulu</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                            Silakan pilih salah satu program studi pada menu di atas untuk memfilter kurikulum, atau gunakan tombol ekspor/impor massal untuk seluruh program studi.
                        </p>
                        <div className="pt-2 flex items-center justify-center space-x-2 flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setIsProgramDropdownOpen(true)}
                                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                            >
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>Pilih Program Studi ({studyPrograms.length})</span>
                            </button>
                            <button
                                type="button"
                                onClick={openImportModal}
                                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-300"
                            >
                                <UploadCloud className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Impor dari Excel</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleExportExcel}
                                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-300"
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Ekspor Semua MK (.xls)</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* TABEL DATA MATA KULIAH PROGRAM STUDI TERPILIH */
                    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden animate-fadeIn">
                        {/* Toolbar Filter, Search & Action Buttons */}
                        <div className="p-3 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs relative z-20">
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

                            {/* Search Box & Action Buttons */}
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
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

                                {/* Tombol Impor Excel */}
                                <button
                                    type="button"
                                    onClick={openImportModal}
                                    title="Import Data Mata Kuliah dari File Excel / CSV"
                                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer active:scale-95"
                                >
                                    <UploadCloud className="w-3.5 h-3.5 text-emerald-700" />
                                    <span className="hidden sm:inline">Impor</span>
                                </button>

                                {/* Tombol Ekspor Excel */}
                                <button
                                    type="button"
                                    onClick={handleExportExcel}
                                    title="Ekspor Daftar Mata Kuliah ke Format Excel (.xls)"
                                    className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer active:scale-95"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="hidden sm:inline">Excel</span>
                                </button>

                                {/* Tombol Cetak / PDF */}
                                <button
                                    type="button"
                                    onClick={handlePrintPdf}
                                    title="Cetak Dokumen Resmi / Simpan sebagai PDF"
                                    className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer active:scale-95"
                                >
                                    <Printer className="w-3.5 h-3.5 text-amber-600" />
                                    <span className="hidden sm:inline">PDF</span>
                                </button>

                                {/* Tombol Tambah Mata Kuliah */}
                                <button
                                    type="button"
                                    onClick={() => openModal()}
                                    title="Tambah Mata Kuliah Baru"
                                    className="p-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-lg transition flex items-center justify-center shadow-xs cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
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
                                        <th rowSpan="2" className="py-2.5 px-2 text-center border-r border-slate-800 w-12">Smt</th>
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
                                                <BookMarked className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                <p className="font-bold text-xs">Tidak ada mata kuliah yang terdaftar di program studi ini.</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">Klik tombol "+ Tambah Mata Kuliah" atau "Impor Excel" untuk memasukkan kurikulum.</p>
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
                                                    <div>{item.name}</div>
                                                    {item.name_en && (
                                                        <div className="text-[10px] text-slate-400 font-normal italic">{item.name_en}</div>
                                                    )}
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

                                                <td className="py-2.5 px-2 text-center font-bold text-slate-800">
                                                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">
                                                        {item.semester_level || 1}
                                                    </span>
                                                </td>

                                                <td className="py-2.5 px-3 text-center">
                                                    <span className={`px-2 py-0.5 text-[9px] font-black rounded-full border ${
                                                        item.course_type === 'Wajib' || item.course_type === 'WAJIB_PRODI' || item.course_type === 'WAJIB_INSTITUSI'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                        {item.course_type?.replace('_PRODI', '')}
                                                    </span>
                                                </td>

                                                <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                                                    <span title={item.course_group}>
                                                        {item.course_group?.split(' ')[0] || item.course_group || '-'}
                                                    </span>
                                                </td>

                                                <td className="py-2.5 px-3 text-center">
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <button 
                                                            type="button"
                                                            onClick={() => openModal(item)}
                                                            className="p-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded transition cursor-pointer"
                                                            title="Edit Mata Kuliah"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => setCourseToDelete(item)}
                                                            className="p-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded transition cursor-pointer"
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

                        {/* Pagination Footer */}
                        <div className="p-3 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                            <div className="text-slate-500 text-[11px]">
                                Menampilkan <span className="font-bold text-slate-800">{fromIndex}</span> s.d.{' '}
                                <span className="font-bold text-slate-800">{toIndex}</span> dari{' '}
                                <span className="font-bold text-slate-800">{totalFiltered}</span> mata kuliah
                                {searchTerm && <span className="italic"> (difilter dari {courses.length} total)</span>}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center space-x-1">
                                    <button
                                        type="button"
                                        disabled={safeCurrentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                        if (totalPages > 7) {
                                            if (p !== 1 && p !== totalPages && Math.abs(p - safeCurrentPage) > 1) {
                                                if (p === 2 || p === totalPages - 1) {
                                                    return <span key={p} className="px-1 text-slate-400">...</span>;
                                                }
                                                return null;
                                            }
                                        }
                                        const isActive = p === safeCurrentPage;
                                        return (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setCurrentPage(p)}
                                                className={`min-w-7 h-7 px-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                                    isActive
                                                        ? 'bg-emerald-600 text-white shadow-2xs'
                                                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}

                                    <button
                                        type="button"
                                        disabled={safeCurrentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* MODAL IMPOR MATA KULIAH DARI EXCEL (PREMIUM 3-STEP WIZARD) */}
            {/* ========================================================================= */}
            {isImportModalOpen && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !isProcessingImport) setIsImportModalOpen(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-2xs animate-fadeIn"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
                        {/* Header Modal */}
                        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between border-b border-slate-700 shrink-0">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                                    <UploadCloud className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xs text-white">Import Data Mata Kuliah dari Excel</h3>
                                    <p className="text-[10px] text-emerald-300">
                                        Unggah file spreadsheet .xlsx, .xls, atau .csv untuk menambahkan katalog mata kuliah massal
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                                    ESC
                                </span>
                                <button 
                                    type="button" 
                                    disabled={isProcessingImport}
                                    onClick={() => setIsImportModalOpen(false)} 
                                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body: Wizard Steps */}
                        <div className="p-5 overflow-y-auto space-y-4 flex-1">
                            {/* STEP 1: UPLOAD FILE & DOWNLOAD TEMPLATE */}
                            {importStep === 'upload' && (
                                <div className="space-y-4">
                                    {/* Download Template Banner */}
                                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                        <div className="flex items-start space-x-3">
                                            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                                                <FileSpreadsheet className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-emerald-950 text-xs">Format & Template Resmi Excel</h4>
                                                <p className="text-[11px] text-emerald-800 mt-0.5">
                                                    Gunakan template resmi yang telah memuat struktur kolom, validasi SKS, dan contoh mata kuliah.
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href="/admin/courses/template-excel"
                                            className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition shadow-xs shrink-0"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Unduh Template (.xlsx)</span>
                                        </a>
                                    </div>

                                    {/* Dropzone Area */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                                handleFileSelect(e.dataTransfer.files[0]);
                                            }
                                        }}
                                        className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3"
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".xlsx, .xls, .csv"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    handleFileSelect(e.target.files[0]);
                                                }
                                            }}
                                            className="hidden"
                                        />

                                        {isParsing ? (
                                            <div className="space-y-2 py-4">
                                                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                                                <p className="text-xs font-bold text-slate-700">Membaca & menganalisis isi file Excel...</p>
                                                <p className="text-[10px] text-slate-400">Harap tunggu sebentar</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                                                    <UploadCloud className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">
                                                        Klik untuk memilih berkas atau seret & jatuhkan di sini
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 mt-1">
                                                        Mendukung format Microsoft Excel (<strong>.xlsx</strong>, <strong>.xls</strong>) atau <strong>.csv</strong>
                                                    </p>
                                                </div>
                                                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold shadow-2xs">
                                                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span>Pilih File Excel Anda</span>
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Panduan Kolom */}
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                                        <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                                            <Info className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>Petunjuk Pengisian Kolom Excel:</span>
                                        </div>
                                        <ul className="list-disc list-inside space-y-0.5 text-[10.5px] text-slate-600 pl-1">
                                            <li><strong className="text-slate-800">kode_mk</strong>: Kode unik mata kuliah (contoh: PAI-101, PIAUD-201, MKU-101).</li>
                                            <li><strong className="text-slate-800">nama_mk</strong>: Nama resmi mata kuliah (contoh: Ulumul Qur'an, Fiqih Mawaris).</li>
                                            <li><strong className="text-slate-800">sks_total</strong>: Bobot SKS total (angka: 2, 3, 4).</li>
                                            <li><strong className="text-slate-800">sks_tatap_muka, sks_praktikum, sks_lapangan</strong>: Rincian SKS (opsional).</li>
                                            <li><strong className="text-slate-800">semester</strong>: Semester penawaran mata kuliah (1 s.d. 8).</li>
                                            <li><strong className="text-slate-800">kode_prodi</strong>: PAI / PIAUD / MPI (opsional jika prodi sudah dipilih di atas).</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: PREVIEW & CONFLICT RESOLUTION */}
                            {importStep === 'preview' && analyzedData && (
                                <div className="space-y-4">
                                    {/* 4 Summary Stat Cards */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                                            <div className="text-[10px] uppercase font-black text-slate-500">Total Baris</div>
                                            <div className="text-lg font-black text-slate-900 mt-0.5">{analyzedData.summary?.total || 0}</div>
                                            <div className="text-[9px] text-slate-400">data di berkas</div>
                                        </div>
                                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                                            <div className="text-[10px] uppercase font-black text-emerald-700">Siap Diimpor</div>
                                            <div className="text-lg font-black text-emerald-800 mt-0.5">{analyzedData.summary?.ready || 0}</div>
                                            <div className="text-[9px] text-emerald-600">mata kuliah baru</div>
                                        </div>
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                                            <div className="text-[10px] uppercase font-black text-amber-700">Sudah Ada</div>
                                            <div className="text-lg font-black text-amber-800 mt-0.5">{analyzedData.summary?.conflicts || 0}</div>
                                            <div className="text-[9px] text-amber-600">kode terdaftar</div>
                                        </div>
                                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
                                            <div className="text-[10px] uppercase font-black text-rose-700">Tidak Valid</div>
                                            <div className="text-lg font-black text-rose-800 mt-0.5">{analyzedData.summary?.invalid || 0}</div>
                                            <div className="text-[9px] text-rose-600">format salah</div>
                                        </div>
                                    </div>

                                    {/* Mode Penanganan Konflik */}
                                    {analyzedData.summary?.conflicts > 0 && (
                                        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 text-xs">
                                            <div className="flex items-center space-x-2 text-amber-900 font-bold">
                                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                                <span>Ditemukan {analyzedData.summary.conflicts} Mata Kuliah dengan Kode yang Sudah Ada:</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                                <label className={`flex items-start space-x-2.5 p-2 rounded-lg border cursor-pointer transition ${
                                                    conflictMode === 'skip' 
                                                        ? 'bg-white border-amber-400 shadow-2xs ring-1 ring-amber-400' 
                                                        : 'bg-amber-50/50 border-amber-200 hover:bg-white'
                                                }`}>
                                                    <input 
                                                        type="radio" 
                                                        name="conflict_mode" 
                                                        value="skip" 
                                                        checked={conflictMode === 'skip'} 
                                                        onChange={() => setConflictMode('skip')}
                                                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                    />
                                                    <div>
                                                        <strong className="text-slate-800 block text-[11px]">Lewati Duplikat (Skip)</strong>
                                                        <span className="text-[10px] text-slate-500">Mata kuliah yang sudah ada di database tidak akan diubah.</span>
                                                    </div>
                                                </label>

                                                <label className={`flex items-start space-x-2.5 p-2 rounded-lg border cursor-pointer transition ${
                                                    conflictMode === 'overwrite' 
                                                        ? 'bg-white border-emerald-500 shadow-2xs ring-1 ring-emerald-500' 
                                                        : 'bg-amber-50/50 border-amber-200 hover:bg-white'
                                                }`}>
                                                    <input 
                                                        type="radio" 
                                                        name="conflict_mode" 
                                                        value="overwrite" 
                                                        checked={conflictMode === 'overwrite'} 
                                                        onChange={() => setConflictMode('overwrite')}
                                                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                    />
                                                    <div>
                                                        <strong className="text-slate-800 block text-[11px]">Perbarui Data yang Ada (Overwrite)</strong>
                                                        <span className="text-[10px] text-slate-500">Perbarui nama MK, SKS, semester, dan kelompok sesuai data berkas.</span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {/* Filter Tabs & Preview Table */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                                            <span className="font-bold text-slate-700 text-[11px]">Pratinjau Data ({filteredImportRows.length} baris):</span>
                                            <div className="flex items-center space-x-1 text-[10px]">
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewFilter('all')}
                                                    className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                                                        previewFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    Semua ({analyzedData.summary?.total || 0})
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewFilter('ready')}
                                                    className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                                                        previewFilter === 'ready' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                    }`}
                                                >
                                                    Siap ({analyzedData.summary?.ready || 0})
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewFilter('conflict')}
                                                    className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                                                        previewFilter === 'conflict' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                                    }`}
                                                >
                                                    Konflik ({analyzedData.summary?.conflicts || 0})
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewFilter('invalid')}
                                                    className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                                                        previewFilter === 'invalid' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                                    }`}
                                                >
                                                    Tidak Valid ({analyzedData.summary?.invalid || 0})
                                                </button>
                                            </div>
                                        </div>

                                        {/* Scrollable Preview Table */}
                                        <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl overflow-x-auto">
                                            <table className="w-full text-left border-collapse text-[10.5px]">
                                                <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                                                    <tr>
                                                        <th className="py-1.5 px-2 text-center w-8">No</th>
                                                        <th className="py-1.5 px-2 text-center w-24">Status</th>
                                                        <th className="py-1.5 px-2 text-center w-24">Kode MK</th>
                                                        <th className="py-1.5 px-3">Nama Mata Kuliah</th>
                                                        <th className="py-1.5 px-2 text-center w-12">SKS</th>
                                                        <th className="py-1.5 px-2 text-center w-10">Smt</th>
                                                        <th className="py-1.5 px-2 text-center w-16">Jenis</th>
                                                        <th className="py-1.5 px-2.5">Keterangan / Pesan</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {filteredImportRows.map((row, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50">
                                                            <td className="py-1.5 px-2 text-center text-slate-400 font-mono">
                                                                {row.row_index || idx + 1}
                                                            </td>
                                                            <td className="py-1.5 px-2 text-center">
                                                                {row.status === 'ready' && (
                                                                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold">
                                                                        Siap Impor
                                                                    </span>
                                                                )}
                                                                {row.status === 'conflict' && (
                                                                    <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-bold">
                                                                        Sudah Ada
                                                                    </span>
                                                                )}
                                                                {row.status === 'invalid' && (
                                                                    <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[9px] font-bold">
                                                                        Tidak Valid
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-800">
                                                                {row.code || '-'}
                                                            </td>
                                                            <td className="py-1.5 px-3 font-bold text-slate-900">
                                                                <div>{row.name || '-'}</div>
                                                                {row.name_en && <div className="text-[9px] text-slate-400 italic font-normal">{row.name_en}</div>}
                                                            </td>
                                                            <td className="py-1.5 px-2 text-center font-mono font-bold">
                                                                {row.credits}
                                                            </td>
                                                            <td className="py-1.5 px-2 text-center font-mono text-slate-600">
                                                                {row.semester_level || 1}
                                                            </td>
                                                            <td className="py-1.5 px-2 text-center text-[9.5px]">
                                                                {row.course_type}
                                                            </td>
                                                            <td className="py-1.5 px-2.5 text-[9.5px] text-slate-500">
                                                                {row.message}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: SUCCESS RESULT */}
                            {importStep === 'success' && importResult && (
                                <div className="py-8 px-4 text-center space-y-3 animate-fadeIn">
                                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-base font-black text-slate-900">Proses Impor Berhasil!</h4>
                                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                                        {importResult.message}
                                    </p>

                                    {/* Detail Pill */}
                                    <div className="flex items-center justify-center space-x-2 pt-2">
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
                                            +{importResult.details?.created || 0} Baru Ditambahkan
                                        </span>
                                        <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">
                                            ↻ {importResult.details?.updated || 0} Diperbarui
                                        </span>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-bold">
                                            ⊘ {importResult.details?.skipped || 0} Dilewati
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
                            {importStep === 'upload' && (
                                <div className="flex justify-end w-full">
                                    <button
                                        type="button"
                                        onClick={() => setIsImportModalOpen(false)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                </div>
                            )}

                            {importStep === 'preview' && (
                                <>
                                    <button
                                        type="button"
                                        disabled={isProcessingImport}
                                        onClick={() => setImportStep('upload')}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                                    >
                                        Unggah Ulang File
                                    </button>

                                    <button
                                        type="button"
                                        disabled={isProcessingImport || (analyzedData?.summary?.ready === 0 && (conflictMode === 'skip' || analyzedData?.summary?.conflicts === 0))}
                                        onClick={handleExecuteImport}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer active:scale-95"
                                    >
                                        {isProcessingImport ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                <span>Memproses Impor...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-3.5 h-3.5" />
                                                <span>
                                                    Proses Impor ({conflictMode === 'overwrite' 
                                                        ? (analyzedData?.summary?.ready || 0) + (analyzedData?.summary?.conflicts || 0) 
                                                        : (analyzedData?.summary?.ready || 0)} Data)
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </>
                            )}

                            {importStep === 'success' && (
                                <div className="flex justify-end w-full">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsImportModalOpen(false);
                                            router.reload({ preserveScroll: true });
                                        }}
                                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                                    >
                                        Selesai & Muat Ulang Data
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL TAMBAH / EDIT MATA KULIAH MANUAL */}
            {/* ========================================================================= */}
            {isModalOpen && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !form.processing) setIsModalOpen(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-2xs animate-fadeIn"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
                        {/* Header Dark Gradient */}
                        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between border-b border-slate-700">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xs text-white">
                                        {editingCourse ? 'Perbarui Data Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
                                    </h3>
                                    <p className="text-[10px] text-emerald-300">
                                        {editingCourse ? `Sunting data atribut mata kuliah [${editingCourse.code}]` : 'Daftarkan mata kuliah baru ke dalam katalog kurikulum'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                                    ESC
                                </span>
                                <button 
                                    type="button" 
                                    disabled={form.processing}
                                    onClick={() => setIsModalOpen(false)} 
                                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleFormSubmit} className="p-5 space-y-3 text-xs">
                            {/* Program Studi Selector */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                    Program Studi <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={form.data.study_program_id}
                                    onChange={(e) => {
                                        const newPId = parseInt(e.target.value);
                                        form.setData('study_program_id', newPId);
                                        if (!editingCourse) {
                                            form.setData('code', generateCourseCode(newPId));
                                        }
                                    }}
                                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-emerald-500"
                                    required
                                >
                                    {studyPrograms.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.code} — {p.name} ({p.degree || 'S1'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Kode & Nama MK */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                        Kode MK <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.code}
                                        onChange={(e) => form.setData('code', e.target.value.toUpperCase())}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-emerald-500"
                                        placeholder="Contoh: PAI-101"
                                        required
                                    />
                                    {form.errors.code && (
                                        <span className="text-[10px] text-rose-500">{form.errors.code}</span>
                                    )}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                        Nama Mata Kuliah (Indonesia) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-emerald-500"
                                        placeholder="Contoh: Ulumul Qur'an"
                                        required
                                    />
                                    {form.errors.name && (
                                        <span className="text-[10px] text-rose-500">{form.errors.name}</span>
                                    )}
                                </div>
                            </div>

                            {/* Nama Inggris & Semester */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div className="sm:col-span-2">
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                        Nama Mata Kuliah (Inggris) <span className="text-slate-400 font-normal">(Opsional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.name_en}
                                        onChange={(e) => form.setData('name_en', e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-500"
                                        placeholder="Contoh: Quranic Studies"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                        Semester Penawaran
                                    </label>
                                    <select
                                        value={form.data.semester_level}
                                        onChange={(e) => form.setData('semester_level', parseInt(e.target.value))}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-emerald-500"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                            <option key={s} value={s}>Semester {s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Bobot SKS Breakdown */}
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-4 gap-2">
                                <div>
                                    <label className="block font-bold text-emerald-800 mb-1 text-[10px] uppercase">SKS Total:</label>
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
                                                theory_credits: val,
                                            });
                                        }}
                                        className="w-full p-2 bg-white border border-emerald-300 text-emerald-950 font-black rounded-lg text-center focus:outline-emerald-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase">Tatap Muka:</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={form.data.theory_credits}
                                        onChange={(e) => form.setData('theory_credits', parseFloat(e.target.value) || 0)}
                                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-center focus:outline-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase">Praktikum:</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={form.data.practice_credits}
                                        onChange={(e) => form.setData('practice_credits', parseFloat(e.target.value) || 0)}
                                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-center focus:outline-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase">Lapangan:</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={form.data.field_credits}
                                        onChange={(e) => form.setData('field_credits', parseFloat(e.target.value) || 0)}
                                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-center focus:outline-emerald-500"
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
                                        <option value="WAJIB_PRODI">Wajib Program Studi</option>
                                        <option value="WAJIB_INSTITUSI">Wajib Institusi</option>
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

                            {/* Deskripsi Silabus */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                    Ringkasan Silabus / Deskripsi <span className="text-slate-400 font-normal">(Opsional)</span>
                                </label>
                                <textarea
                                    rows="2"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-500 text-xs"
                                    placeholder="Ringkasan capaian pembelajaran & pokok bahasan materi perkuliahan..."
                                />
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
                                    Data mata kuliah ini beserta jadwal atau rombel kelas yang menggunakannya akan terpengaruh. Pastikan Anda yakin sebelum melanjutkan.
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
