import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import { 
    Scale, BookOpen, Award, GraduationCap, 
    Save, Plus, Trash2, Edit3, CheckCircle2, AlertTriangle, 
    Sparkles, Check, X, Percent, Sliders, ChevronDown, 
    Building2, Search, Clock
} from 'lucide-react';

export default function AcademicSettingsIndex({
    studyPrograms = [],
    gradingScales = [],
    gradeWeights = [],
    sksLimits = [],
    graduationPredicates = [],
    studyProgramDegrees = [],
    activePeriod
}) {
    // 4 Client-Side Tabs (Gaya Program Studi & Fakultas: Instan tanpa reload halaman)
    const [activeTab, setActiveTab] = useState('bobot-nilai'); // 'bobot-nilai' | 'sks-maksimum' | 'predikat-kelulusan' | 'gelar-kelulusan'
    
    // Prodi filter state (berlaku untuk Bobot Nilai & SKS Maksimum, default: belum dipilih)
    const [selectedProdi, setSelectedProdi] = useState('');

    // Confirmation modal state for deletions & template copies
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: 'Konfirmasi Tindakan',
        message: '',
        itemName: '',
        itemType: '',
        confirmText: 'Ya, Lanjutkan',
        cancelText: 'Batal',
        variant: 'danger', // 'danger' | 'warning'
        isLoading: false,
        onConfirm: null
    });

    // Custom dropdown popover state (sama persis seperti pada halaman Program Studi & Fakultas)
    const [isProdiDropdownOpen, setIsProdiDropdownOpen] = useState(false);
    const prodiDropdownRef = useRef(null);

    // Custom dropdown kategori SKS state
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const categoryDropdownRef = useRef(null);

    const SKS_CATEGORIES = [
        {
            id: 'REGULER',
            title: 'REGULER',
            subtitle: 'Berdasarkan Capaian IPS Semester Lalu',
            icon: BookOpen,
            badge: 'REGULER'
        },
        {
            id: 'MAHASISWA_BARU',
            title: 'MAHASISWA BARU',
            subtitle: 'Paket Terstruktur Semester 1 & 2',
            icon: Sparkles,
            badge: 'MHS BARU'
        },
        {
            id: 'SEMESTER_PENDEK',
            title: 'SEMESTER PENDEK',
            subtitle: 'Semester Antara / Remedial & Akselerasi',
            icon: Clock,
            badge: 'SEMESTER PENDEK'
        }
    ];

    // Close dropdown on ESC key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
                if (isProdiDropdownOpen) setIsProdiDropdownOpen(false);
                if (isCategoryDropdownOpen) setIsCategoryDropdownOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isProdiDropdownOpen, isCategoryDropdownOpen]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (prodiDropdownRef.current && !prodiDropdownRef.current.contains(event.target)) {
                setIsProdiDropdownOpen(false);
            }
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
                setIsCategoryDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeProdiObj = useMemo(() => {
        return studyPrograms.find(p => String(p.id) === String(selectedProdi)) || null;
    }, [studyPrograms, selectedProdi]);

    // Active scales & SKS limits filtered reactively from props
    const currentGradingScales = useMemo(() => {
        if (!selectedProdi) return [];
        return gradingScales.filter(s => String(s.study_program_id) === String(selectedProdi));
    }, [gradingScales, selectedProdi]);

    const currentSksLimits = useMemo(() => {
        if (!selectedProdi) return [];
        return sksLimits.filter(s => String(s.study_program_id) === String(selectedProdi));
    }, [sksLimits, selectedProdi]);

    // =========================================================================
    // 1. STATE & HANDLERS: BOBOT KOMPONEN PENILAIAN
    // =========================================================================
    const [weightsForm, setWeightsForm] = useState(gradeWeights);
    const [isSavingWeights, setIsSavingWeights] = useState(false);

    const totalWeight = weightsForm.reduce((acc, curr) => acc + (parseFloat(curr.weight_percentage) || 0), 0);
    const isWeightValid = Math.abs(totalWeight - 100.0) < 0.01;

    const handleWeightChange = (index, field, value) => {
        const updated = [...weightsForm];
        updated[index] = { ...updated[index], [field]: value };
        setWeightsForm(updated);
    };

    const handleSaveWeights = (e) => {
        e.preventDefault();
        if (!isWeightValid) {
            alert(`Total persentase bobot harus tepat 100% (Saat ini: ${totalWeight.toFixed(1)}%).`);
            return;
        }
        setIsSavingWeights(true);
        router.post('/admin/academic-settings/grading', { weights: weightsForm }, {
            preserveScroll: true,
            onFinish: () => setIsSavingWeights(false)
        });
    };

    // =========================================================================
    // 2. MODAL & STATE: SKALA HURUF MUTU (BOBOT NILAI)
    // =========================================================================
    const [showScaleModal, setShowScaleModal] = useState(false);
    const [editingScale, setEditingScale] = useState(null);
    const [scaleForm, setScaleForm] = useState({
        grade_letter: 'A',
        min_score: '80.00',
        max_score: '100.00',
        grade_point: '4.00',
        predicate: '',
        study_program_id: '',
        is_passing: true
    });
    const [isSavingScale, setIsSavingScale] = useState(false);
    const [isApplyingStandardScales, setIsApplyingStandardScales] = useState(false);

    const handleOpenCreateScale = () => {
        if (!selectedProdi) {
            alert('Silakan pilih Program Studi terlebih dahulu.');
            return;
        }
        setEditingScale(null);
        setScaleForm({
            grade_letter: 'A',
            min_score: '85.00',
            max_score: '100.00',
            grade_point: '4.00',
            predicate: '',
            study_program_id: String(selectedProdi),
            is_passing: true
        });
        setShowScaleModal(true);
    };

    const handleOpenEditScale = (scale) => {
        setEditingScale(scale);
        setScaleForm({
            grade_letter: scale.grade_letter,
            min_score: String(scale.min_score),
            max_score: String(scale.max_score),
            grade_point: String(scale.grade_point),
            predicate: scale.predicate || '',
            study_program_id: scale.study_program_id ? String(scale.study_program_id) : String(selectedProdi),
            is_passing: Boolean(scale.is_passing)
        });
        setShowScaleModal(true);
    };

    const handleSaveScale = (e) => {
        e.preventDefault();
        setIsSavingScale(true);

        if (editingScale) {
            router.post(`/admin/academic-settings/scales/${editingScale.id}`, scaleForm, {
                preserveScroll: true,
                onSuccess: () => setShowScaleModal(false),
                onFinish: () => setIsSavingScale(false)
            });
        } else {
            router.post('/admin/academic-settings/scales', scaleForm, {
                preserveScroll: true,
                onSuccess: () => setShowScaleModal(false),
                onFinish: () => setIsSavingScale(false)
            });
        }
    };

    const handleDeleteScale = (id, letter) => {
        setConfirmModal({
            isOpen: true,
            title: 'Hapus Skala Huruf Mutu',
            message: 'Apakah Anda yakin ingin menghapus baris skala nilai ini dari daftar program studi?',
            itemName: `Huruf Mutu: ${letter}`,
            itemType: 'Skala Nilai',
            confirmText: 'Ya, Hapus Data',
            cancelText: 'Batal',
            variant: 'danger',
            isLoading: false,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                router.delete(`/admin/academic-settings/scales/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false })),
                    onError: () => setConfirmModal(prev => ({ ...prev, isLoading: false }))
                });
            }
        });
    };

    const handleApplyStandardScales = () => {
        if (!selectedProdi) return;
        const currentProg = studyPrograms.find(p => String(p.id) === String(selectedProdi));
        setConfirmModal({
            isOpen: true,
            title: 'Terapkan Skala Standar Institusi',
            message: 'Sistem akan menerapkan konfigurasi template skala nilai standar institusi (A, B, C, D, E) untuk program studi ini.',
            itemName: currentProg ? `${currentProg.code} - ${currentProg.name}` : '',
            itemType: 'Program Studi',
            confirmText: 'Terapkan Standar',
            cancelText: 'Batal',
            variant: 'warning',
            isLoading: false,
            onConfirm: () => {
                setIsApplyingStandardScales(true);
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                router.post('/admin/academic-settings/copy-standard-scales', {
                    study_program_id: selectedProdi
                }, {
                    preserveScroll: true,
                    onFinish: () => {
                        setIsApplyingStandardScales(false);
                        setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
                    }
                });
            }
        });
    };

    // =========================================================================
    // 3. MODAL & STATE: BATAS SKS MAKSIMUM (PER PRODI)
    // =========================================================================
    const [showSksModal, setShowSksModal] = useState(false);
    const [editingSks, setEditingSks] = useState(null);
    const [sksForm, setSksForm] = useState({
        study_program_id: '',
        category: 'REGULER',
        min_ips: '3.50',
        max_ips: '4.00',
        max_sks: 24,
        description: ''
    });
    const [isSavingSks, setIsSavingSks] = useState(false);
    const [isApplyingStandardSks, setIsApplyingStandardSks] = useState(false);

    const handleOpenCreateSks = () => {
        if (!selectedProdi) {
            alert('Silakan pilih Program Studi terlebih dahulu.');
            return;
        }
        setEditingSks(null);
        setSksForm({
            study_program_id: String(selectedProdi),
            category: 'REGULER',
            min_ips: '3.00',
            max_ips: '3.49',
            max_sks: 22,
            description: ''
        });
        setShowSksModal(true);
    };

    const handleOpenEditSks = (lim) => {
        setEditingSks(lim);
        setSksForm({
            study_program_id: lim.study_program_id ? String(lim.study_program_id) : String(selectedProdi),
            category: lim.category || 'REGULER',
            min_ips: String(lim.min_ips),
            max_ips: String(lim.max_ips),
            max_sks: lim.max_sks,
            description: lim.description || ''
        });
        setShowSksModal(true);
    };

    const handleSaveSksSingle = (e) => {
        e.preventDefault();
        setIsSavingSks(true);
        if (editingSks) {
            router.post(`/admin/academic-settings/sks-limit/${editingSks.id}`, sksForm, {
                preserveScroll: true,
                onSuccess: () => setShowSksModal(false),
                onFinish: () => setIsSavingSks(false)
            });
        } else {
            router.post('/admin/academic-settings/sks-limit', sksForm, {
                preserveScroll: true,
                onSuccess: () => setShowSksModal(false),
                onFinish: () => setIsSavingSks(false)
            });
        }
    };

    const handleDeleteSks = (id, cat) => {
        setConfirmModal({
            isOpen: true,
            title: 'Hapus Aturan Batas SKS',
            message: 'Apakah Anda yakin ingin menghapus aturan batas beban SKS ini?',
            itemName: `Kategori: ${cat}`,
            itemType: 'Aturan Batas SKS',
            confirmText: 'Ya, Hapus Data',
            cancelText: 'Batal',
            variant: 'danger',
            isLoading: false,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                router.delete(`/admin/academic-settings/sks-limit/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false })),
                    onError: () => setConfirmModal(prev => ({ ...prev, isLoading: false }))
                });
            }
        });
    };

    const handleApplyStandardSks = () => {
        if (!selectedProdi) return;
        const currentProg = studyPrograms.find(p => String(p.id) === String(selectedProdi));
        setConfirmModal({
            isOpen: true,
            title: 'Terapkan Skema SKS Standar Institusi',
            message: 'Sistem akan menerapkan skema batas beban SKS standar (15 - 24 SKS) untuk program studi ini.',
            itemName: currentProg ? `${currentProg.code} - ${currentProg.name}` : '',
            itemType: 'Program Studi',
            confirmText: 'Terapkan Skema',
            cancelText: 'Batal',
            variant: 'warning',
            isLoading: false,
            onConfirm: () => {
                setIsApplyingStandardSks(true);
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                router.post('/admin/academic-settings/copy-standard-sks-limits', {
                    study_program_id: selectedProdi
                }, {
                    preserveScroll: true,
                    onFinish: () => {
                        setIsApplyingStandardSks(false);
                        setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
                    }
                });
            }
        });
    };

    // =========================================================================
    // 4. STATE & HANDLERS: PREDIKAT KELULUSAN (YUDISIUM)
    // =========================================================================
    const [predicatesForm, setPredicatesForm] = useState(graduationPredicates);
    const [isSavingPredicates, setIsSavingPredicates] = useState(false);

    const handlePredicateChange = (index, field, value) => {
        const updated = [...predicatesForm];
        updated[index] = { ...updated[index], [field]: value };
        setPredicatesForm(updated);
    };

    const handleSavePredicates = (e) => {
        e.preventDefault();
        setIsSavingPredicates(true);
        router.post('/admin/academic-settings/predicates', { predicates: predicatesForm }, {
            preserveScroll: true,
            onFinish: () => setIsSavingPredicates(false)
        });
    };

    // =========================================================================
    // 5. STATE & HANDLERS: GELAR KELULUSAN PROGRAM STUDI
    // =========================================================================
    const [degreesForm, setDegreesForm] = useState(studyProgramDegrees);
    const [isSavingDegrees, setIsSavingDegrees] = useState(false);

    const handleDegreeChange = (index, field, value) => {
        const updated = [...degreesForm];
        updated[index] = { ...updated[index], [field]: value };
        setDegreesForm(updated);
    };

    const handleSaveDegrees = (e) => {
        e.preventDefault();
        setIsSavingDegrees(true);
        router.post('/admin/academic-settings/degrees', { degrees: degreesForm }, {
            preserveScroll: true,
            onFinish: () => setIsSavingDegrees(false)
        });
    };

    return (
        <AppLayout title="Kebijakan & Pengaturan Akademik">
            <Head title="Kebijakan Akademik" />

            <div className="space-y-4">
                {/* 1. COMPACT HERO HEADER DENGAN INTEGRATED SUB-BAR PILIH PROGRAM STUDI (PERSIS SEPERTI PRODI & FAKULTAS) */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative border border-slate-700/50 z-10">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black mb-1">
                                <Sliders className="w-3 h-3 text-indigo-400" />
                                <span>SETTING & KEBIJAKAN AKADEMIK</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                                Kebijakan & Pengaturan Akademik
                            </h2>
                            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                                Standarisasi skala mutu penilaian OBE, batas beban studi SKS mahasiswa per prodi, predikat yudisium, dan gelar akademik resmi.
                            </p>
                        </div>
                    </div>

                    {/* Integrated Sub-bar Pilih Program Studi (Persis gaya Program Studi & Fakultas) */}
                    {(activeTab === 'bobot-nilai' || activeTab === 'sks-maksimum') && (
                        <div className="relative z-20 mt-3 pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
                                    <GraduationCap className="w-4 h-4" />
                                </div>
                                <div className="flex items-center space-x-2 flex-wrap">
                                    <span className="text-xs font-bold text-slate-300">Program Studi:</span>
                                    {activeProdiObj ? (
                                        <div className="inline-flex items-center space-x-1.5 flex-wrap">
                                            <span className="text-xs font-black text-white">{activeProdiObj.name}</span>
                                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300 border border-blue-500/40">
                                                {activeProdiObj.code}
                                            </span>
                                            <span className="text-[11px] text-slate-300 font-medium">
                                                ({activeProdiObj.faculty_name || 'Fakultas'} • {activeTab === 'bobot-nilai' ? `${currentGradingScales.length} Skala Nilai` : `${currentSksLimits.length} Aturan SKS`})
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">Belum dipilih</span>
                                    )}
                                </div>
                            </div>

                            {/* Custom Dropdown Trigger (Persis gaya Fakultas & Prodi) */}
                            <div ref={prodiDropdownRef} className="relative w-full sm:w-80">
                                <button
                                    type="button"
                                    onClick={() => setIsProdiDropdownOpen(prev => !prev)}
                                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition shadow-2xs cursor-pointer text-left border ${
                                        isProdiDropdownOpen 
                                            ? 'border-blue-400 ring-2 ring-blue-500/30 bg-slate-800 text-white' 
                                            : activeProdiObj 
                                                ? 'border-blue-500/50 bg-blue-950/50 hover:bg-blue-900/50 text-blue-200 font-bold' 
                                                : 'border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2 truncate">
                                        <GraduationCap className={`w-3.5 h-3.5 shrink-0 ${activeProdiObj ? 'text-blue-400' : 'text-slate-400'}`} />
                                        <span className="truncate">
                                            {activeProdiObj ? `${activeProdiObj.code} - ${activeProdiObj.name}` : 'Pilih Program Studi...'}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-1 shrink-0 ml-1.5">
                                        {selectedProdi && (
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedProdi('');
                                                    setIsProdiDropdownOpen(false);
                                                }}
                                                className="p-0.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
                                                title="Reset Pilihan"
                                            >
                                                <X className="w-3 h-3" />
                                            </span>
                                        )}
                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                            isProdiDropdownOpen ? 'rotate-180 text-blue-400' : ''
                                        }`} />
                                    </div>
                                </button>

                                {/* Popover Dropdown Menu */}
                                {isProdiDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-1.5 w-full sm:w-96 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn">
                                        {/* Header Popover */}
                                        <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                                                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                                                <span>PILIH PROGRAM STUDI ({studyPrograms.length})</span>
                                            </span>
                                            <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                                                ESC
                                            </span>
                                        </div>

                                        {/* List Prodi */}
                                        <div className="p-2 space-y-1.5 max-h-72 overflow-y-auto divide-y divide-slate-100/70">
                                            {/* Opsi Belum Dipilih (Default) */}
                                            <div
                                                onClick={() => {
                                                    setSelectedProdi('');
                                                    setIsProdiDropdownOpen(false);
                                                }}
                                                className={`p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between group ${
                                                    !selectedProdi
                                                        ? 'bg-slate-100 border border-slate-300 shadow-2xs'
                                                        : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-2.5 min-w-0">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${
                                                        !selectedProdi 
                                                            ? 'bg-slate-700 text-white shadow-xs' 
                                                            : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                                                    }`}>
                                                        <GraduationCap className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className={`text-xs ${
                                                            !selectedProdi ? 'text-slate-950 font-black' : 'text-slate-700 font-bold group-hover:text-slate-900'
                                                        }`}>
                                                            -- Belum Dipilih --
                                                        </h4>
                                                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                                                            Kembali ke tampilan awal pemilihan prodi
                                                        </p>
                                                    </div>
                                                </div>

                                                {!selectedProdi && (
                                                    <div className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center shadow-xs">
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>

                                            {studyPrograms.map((p) => {
                                                const isSelected = String(p.id) === String(selectedProdi);
                                                const count = activeTab === 'bobot-nilai'
                                                    ? gradingScales.filter(s => String(s.study_program_id) === String(p.id)).length
                                                    : sksLimits.filter(s => String(s.study_program_id) === String(p.id)).length;
                                                const label = activeTab === 'bobot-nilai' ? 'Skala' : 'Aturan';

                                                return (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => {
                                                            setSelectedProdi(String(p.id));
                                                            setIsProdiDropdownOpen(false);
                                                        }}
                                                        className={`p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between group ${
                                                            isSelected
                                                                ? 'bg-blue-50 border border-blue-300 shadow-2xs'
                                                                : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                                        }`}
                                                    >
                                                        <div className="flex items-center space-x-2.5 min-w-0">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${
                                                                isSelected 
                                                                    ? 'bg-blue-600 text-white shadow-xs' 
                                                                    : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-800'
                                                            }`}>
                                                                <GraduationCap className="w-4 h-4" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center space-x-1.5">
                                                                    <h4 className={`text-xs truncate ${
                                                                        isSelected ? 'text-blue-950 font-black' : 'text-slate-900 font-bold group-hover:text-blue-700'
                                                                    }`}>
                                                                        {p.name}
                                                                    </h4>
                                                                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                                                        isSelected 
                                                                            ? 'bg-blue-200/80 text-blue-900' 
                                                                            : 'bg-slate-100 text-slate-600'
                                                                    }`}>
                                                                        {p.code}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                                                                    {p.faculty_name || 'Fakultas'} • Jenjang {p.degree || 'S1'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                                isSelected
                                                                    ? 'bg-blue-600 text-white font-black'
                                                                    : count > 0 
                                                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                                                        : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                                {count > 0 ? `${count} ${label}` : 'Belum Ada'}
                                                            </span>
                                                            {isSelected && (
                                                                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
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
                    )}
                </div>

                {/* 2. TABS SWITCHER (GAYA PROGRAM STUDI & FAKULTAS TANPA RELOAD HALAMAN) */}
                <div className="flex border-b border-slate-200 space-x-6 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('bobot-nilai')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer shrink-0 ${
                            activeTab === 'bobot-nilai'
                                ? 'border-blue-600 text-blue-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Scale className="w-4 h-4" />
                        <span>Bobot & Skala Nilai</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'bobot-nilai' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {selectedProdi ? `${currentGradingScales.length} Skala` : 'Pilih Prodi'}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('sks-maksimum')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer shrink-0 ${
                            activeTab === 'sks-maksimum'
                                ? 'border-indigo-600 text-indigo-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Beban SKS Maksimum</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'sks-maksimum' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {selectedProdi ? `${currentSksLimits.length} Aturan` : 'Pilih Prodi'}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('predikat-kelulusan')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer shrink-0 ${
                            activeTab === 'predikat-kelulusan'
                                ? 'border-amber-600 text-amber-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Award className="w-4 h-4" />
                        <span>Predikat Kelulusan</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'predikat-kelulusan' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {graduationPredicates.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('gelar-kelulusan')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer shrink-0 ${
                            activeTab === 'gelar-kelulusan'
                                ? 'border-purple-600 text-purple-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <GraduationCap className="w-4 h-4" />
                        <span>Gelar Kelulusan</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'gelar-kelulusan' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {studyProgramDegrees.length}
                        </span>
                    </button>
                </div>

                {/* =========================================================================
                    TAB 1: BOBOT & SKALA NILAI
                   ========================================================================= */}
                {activeTab === 'bobot-nilai' && (
                    <div className="space-y-6">
                        {/* A. SKALA HURUF MUTU PER PROGRAM STUDI */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/60 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-black text-slate-900">
                                        Skala Huruf Mutu & Konversi Nilai
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {activeProdiObj 
                                            ? `Daftar standar skala nilai konversi untuk program studi ${activeProdiObj.name}.`
                                            : 'Silakan pilih program studi pada dropdown di atas untuk melihat data.'}
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        onClick={handleOpenCreateScale}
                                        disabled={!selectedProdi}
                                        className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>+ Tambah Skala Nilai</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* KONDISI 1: Belum Memilih Program Studi */}
                                {!selectedProdi && (
                                    <div className="py-14 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                                        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center ring-8 ring-blue-50/50 shadow-inner">
                                            <Scale className="w-7 h-7" />
                                        </div>
                                        <div className="max-w-md mx-auto space-y-1">
                                            <h4 className="text-sm font-black text-slate-800">
                                                Pilih Program Studi Terlebih Dahulu
                                            </h4>
                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                Gunakan dropdown <strong>Pilih Program Studi...</strong> pada bar navigasi di atas untuk menampilkan atau menyusun bobot nilai perkuliahan.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* KONDISI 2: Prodi Dipilih, Tapi Belum Ada Skala Nilai */}
                                {selectedProdi && currentGradingScales.length === 0 && (
                                    <div className="py-12 px-6 text-center border-2 border-dashed border-amber-200 rounded-2xl bg-amber-50/40 space-y-4">
                                        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center ring-4 ring-amber-100/60">
                                            <AlertTriangle className="w-6 h-6" />
                                        </div>
                                        <div className="max-w-lg mx-auto space-y-1.5">
                                            <h4 className="text-sm font-black text-amber-900">
                                                Bobot Nilai Belum Disetting untuk Prodi {activeProdiObj?.name || ''}
                                            </h4>
                                            <p className="text-xs text-amber-700 leading-relaxed">
                                                Program Studi ini belum memiliki konfigurasi skala huruf mutu. Anda dapat menambahkan skala baru atau menerapkan skala mutu standar institusi (A s.d. E) secara otomatis dengan 1 klik.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={handleOpenCreateScale}
                                                className="flex items-center space-x-1.5 px-4 py-2.5 bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-900 text-xs font-bold rounded-xl transition shadow-2xs cursor-pointer"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span>+ Tambah Skala Manual</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleApplyStandardScales}
                                                disabled={isApplyingStandardScales}
                                                className="flex items-center space-x-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl transition shadow-md shadow-amber-600/20 cursor-pointer disabled:opacity-50"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                <span>{isApplyingStandardScales ? 'Menerapkan...' : '⚡ Terapkan Skala Standar (A s.d. E)'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* KONDISI 3: Prodi Dipilih & Skala Nilai Sudah Ada */}
                                {selectedProdi && currentGradingScales.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                                            <div className="flex items-center space-x-2.5">
                                                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                                                <div className="text-xs">
                                                    <span className="text-slate-600 font-medium">Menampilkan matriks nilai untuk </span>
                                                    <span className="font-black text-slate-900">{activeProdiObj?.code} - {activeProdiObj?.name}</span>
                                                    <span className="text-slate-500 ml-1">({currentGradingScales.length} Tingkat Huruf Mutu)</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleApplyStandardScales}
                                                disabled={isApplyingStandardScales}
                                                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center space-x-1 cursor-pointer self-start sm:self-auto"
                                            >
                                                <Sparkles className="w-3.5 h-3.5" />
                                                <span>Reset ke Skala Standar Institusi</span>
                                            </button>
                                        </div>

                                        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
                                                    <tr>
                                                        <th className="py-3.5 px-4 w-14 text-center">No.</th>
                                                        <th className="py-3.5 px-4 w-20 text-center">Aksi</th>
                                                        <th className="py-3.5 px-6">Huruf Mutu</th>
                                                        <th className="py-3.5 px-6 text-center">Rentang Nilai Angka</th>
                                                        <th className="py-3.5 px-6 text-center">Angka Mutu (Bobot)</th>
                                                        <th className="py-3.5 px-4 text-center">Status Kelulusan</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {currentGradingScales.map((scale, idx) => (
                                                        <tr key={scale.id} className="hover:bg-slate-50/80 transition">
                                                            <td className="py-3.5 px-4 text-center font-bold text-slate-500">{idx + 1}</td>
                                                            <td className="py-3.5 px-4 text-center">
                                                                <div className="flex items-center justify-center space-x-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOpenEditScale(scale)}
                                                                        title="Edit Skala"
                                                                        className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition cursor-pointer"
                                                                    >
                                                                        <Edit3 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteScale(scale.id, scale.grade_letter)}
                                                                        title="Hapus Skala"
                                                                        className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white flex items-center justify-center transition cursor-pointer"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="py-3.5 px-6">
                                                                <span className="font-black text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                                                                    {scale.grade_letter}
                                                                </span>
                                                            </td>
                                                            <td className="py-3.5 px-6 text-center font-mono font-bold text-slate-800">
                                                                {parseFloat(scale.min_score).toFixed(1)} – {parseFloat(scale.max_score).toFixed(1)}
                                                            </td>
                                                            <td className="py-3.5 px-6 text-center font-black text-sm text-blue-600">
                                                                {parseFloat(scale.grade_point).toFixed(2)}
                                                            </td>
                                                            <td className="py-3.5 px-4 text-center">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                                                    scale.is_passing ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                                                }`}>
                                                                    {scale.is_passing ? 'LULUS' : 'MENGULANG'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* B. KOMPOSISI BOBOT KOMPONEN PENILAIAN (Hanya muncul jika Program Studi sudah dipilih) */}
                        {selectedProdi && (
                            <form onSubmit={handleSaveWeights} className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50/60 to-white">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                                                <Percent className="w-4 h-4" />
                                            </div>
                                            <h3 className="text-base font-black text-slate-900">
                                                Komposisi Bobot Komponen Penilaian OBE
                                            </h3>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Aturan pembagian persentase akumulasi nilai akhir perkuliahan (Wajib total 100%)
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-black flex items-center space-x-2 ${
                                            isWeightValid
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                                        }`}>
                                            {isWeightValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                            <span>Total Bobot: {totalWeight.toFixed(1)}%</span>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSavingWeights || !isWeightValid}
                                            className="flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>{isSavingWeights ? 'Menyimpan...' : 'Simpan Bobot'}</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        {weightsForm.map((w, idx) => (
                                            <div key={w.id || idx} className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 hover:border-blue-300 transition group space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                        {w.component_code}
                                                    </span>
                                                    <span className="text-xs font-black text-blue-600 group-hover:scale-110 transition">
                                                        {parseFloat(w.weight_percentage || 0).toFixed(0)}%
                                                    </span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-800 line-clamp-1">
                                                    {w.component_name}
                                                </p>
                                                <div className="pt-1">
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            min="0"
                                                            max="100"
                                                            value={w.weight_percentage}
                                                            onChange={(e) => handleWeightChange(idx, 'weight_percentage', e.target.value)}
                                                            className="w-full text-sm font-black px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-mono"
                                                        />
                                                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* =========================================================================
                    TAB 2: BEBAN SKS MAKSIMUM (PER PRODI)
                   ========================================================================= */}
                {activeTab === 'sks-maksimum' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/60 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-black text-slate-900">
                                        Data Batas SKS Maksimum Mahasiswa
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {activeProdiObj 
                                            ? `Matriks ketentuan beban SKS berdasarkan capaian IPS untuk program studi ${activeProdiObj.name}.`
                                            : 'Silakan pilih program studi pada dropdown di atas untuk melihat data.'}
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        onClick={handleOpenCreateSks}
                                        disabled={!selectedProdi}
                                        className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>+ Tambah Aturan SKS</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* KONDISI 1: Belum Memilih Program Studi */}
                                {!selectedProdi && (
                                    <div className="py-14 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                                        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center ring-8 ring-indigo-50/50 shadow-inner">
                                            <BookOpen className="w-7 h-7" />
                                        </div>
                                        <div className="max-w-md mx-auto space-y-1">
                                            <h4 className="text-sm font-black text-slate-800">
                                                Pilih Program Studi Terlebih Dahulu
                                            </h4>
                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                Gunakan dropdown <strong>Pilih Program Studi...</strong> pada bar navigasi di atas untuk memuat matriks batas SKS maksimum.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* KONDISI 2: Prodi Dipilih, Tapi Batas SKS Belum Disetting */}
                                {selectedProdi && currentSksLimits.length === 0 && (
                                    <div className="py-12 px-6 text-center border-2 border-dashed border-amber-200 rounded-2xl bg-amber-50/40 space-y-4">
                                        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center ring-4 ring-amber-100/60">
                                            <AlertTriangle className="w-6 h-6" />
                                        </div>
                                        <div className="max-w-lg mx-auto space-y-1.5">
                                            <h4 className="text-sm font-black text-amber-900">
                                                Batas SKS Belum Disetting untuk Prodi {activeProdiObj?.name || ''}
                                            </h4>
                                            <p className="text-xs text-amber-700 leading-relaxed">
                                                Program Studi ini belum memiliki konfigurasi matriks beban SKS. Anda dapat menambahkan aturan secara manual atau menerapkan skema standar institusi (15 - 24 SKS) dengan 1 klik.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={handleOpenCreateSks}
                                                className="flex items-center space-x-1.5 px-4 py-2.5 bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-900 text-xs font-bold rounded-xl transition shadow-2xs cursor-pointer"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span>+ Tambah Aturan Manual</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleApplyStandardSks}
                                                disabled={isApplyingStandardSks}
                                                className="flex items-center space-x-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl transition shadow-md shadow-amber-600/20 cursor-pointer disabled:opacity-50"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                <span>{isApplyingStandardSks ? 'Menerapkan...' : '⚡ Terapkan Skema Standar (15 - 24 SKS)'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* KONDISI 3: Prodi Dipilih & Batas SKS Sudah Ada */}
                                {selectedProdi && currentSksLimits.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                            <div className="flex items-center space-x-2.5">
                                                <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></span>
                                                <div className="text-xs">
                                                    <span className="text-slate-600 font-medium">Menampilkan aturan beban SKS untuk </span>
                                                    <span className="font-black text-slate-900">{activeProdiObj?.code} - {activeProdiObj?.name}</span>
                                                    <span className="text-slate-500 ml-1">({currentSksLimits.length} Ketentuan SKS)</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleApplyStandardSks}
                                                disabled={isApplyingStandardSks}
                                                className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 hover:underline flex items-center space-x-1 cursor-pointer self-start sm:self-auto"
                                            >
                                                <Sparkles className="w-3.5 h-3.5" />
                                                <span>Reset ke Skema Standar Institusi</span>
                                            </button>
                                        </div>

                                        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
                                                    <tr>
                                                        <th className="py-3.5 px-4 w-14 text-center">No.</th>
                                                        <th className="py-3.5 px-4 w-20 text-center">Aksi</th>
                                                        <th className="py-3.5 px-6">Kategori Aturan</th>
                                                        <th className="py-3.5 px-6 text-center">Rentang IPS</th>
                                                        <th className="py-3.5 px-6 text-center">Beban SKS Maks.</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {currentSksLimits.map((lim, idx) => (
                                                        <tr key={lim.id} className="hover:bg-slate-50/80 transition">
                                                            <td className="py-3.5 px-4 text-center font-bold text-slate-500">{idx + 1}</td>
                                                            <td className="py-3.5 px-4 text-center">
                                                                <div className="flex items-center justify-center space-x-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOpenEditSks(lim)}
                                                                        title="Edit Aturan SKS"
                                                                        className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition cursor-pointer"
                                                                    >
                                                                        <Edit3 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteSks(lim.id, lim.category)}
                                                                        title="Hapus Aturan"
                                                                        className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white flex items-center justify-center transition cursor-pointer"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="py-3.5 px-6">
                                                                <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-indigo-50 text-indigo-800 border border-indigo-200">
                                                                    {lim.category}
                                                                </span>
                                                            </td>
                                                            <td className="py-3.5 px-6 text-center font-mono font-bold text-slate-800">
                                                                {parseFloat(lim.min_ips).toFixed(2)} – {parseFloat(lim.max_ips).toFixed(2)}
                                                            </td>
                                                            <td className="py-3.5 px-6 text-center">
                                                                <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-black bg-indigo-100 text-indigo-900 border border-indigo-200">
                                                                    {lim.max_sks} SKS
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* =========================================================================
                    TAB 3: PREDIKAT KELULUSAN (YUDISIUM)
                   ========================================================================= */}
                {activeTab === 'predikat-kelulusan' && (
                    <form onSubmit={handleSavePredicates} className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50/60 to-white">
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    Predikat Kelulusan & Yudisium
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Daftar nama resmi predikat kelulusan yudisium mahasiswa (Bahasa Indonesia & Bahasa Inggris)
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSavingPredicates}
                                className="flex items-center space-x-1.5 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl transition shadow-md shadow-amber-600/20 disabled:opacity-50 cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                <span>{isSavingPredicates ? 'Menyimpan...' : 'Simpan Nama Predikat'}</span>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
                                        <tr>
                                            <th className="py-3.5 px-4 w-14 text-center">No.</th>
                                            <th className="py-3.5 px-6">Nama Predikat (Bahasa Indonesia)</th>
                                            <th className="py-3.5 px-6">Nama Predikat (English / Internasional)</th>
                                            <th className="py-3.5 px-6">Keterangan Singkat</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {predicatesForm.map((pred, idx) => (
                                            <tr key={pred.id} className="hover:bg-slate-50/80 transition">
                                                <td className="py-3.5 px-4 text-center font-bold text-slate-500">{idx + 1}</td>
                                                <td className="py-3.5 px-6 font-bold text-slate-900">
                                                    <input
                                                        type="text"
                                                        value={pred.predicate_name}
                                                        onChange={(e) => handlePredicateChange(idx, 'predicate_name', e.target.value)}
                                                        className="w-full font-bold text-xs px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                                        placeholder="Contoh: Dengan Pujian (Cum Laude)"
                                                        required
                                                    />
                                                </td>
                                                <td className="py-3.5 px-6">
                                                    <input
                                                        type="text"
                                                        value={pred.predicate_en || ''}
                                                        onChange={(e) => handlePredicateChange(idx, 'predicate_en', e.target.value)}
                                                        className="w-full font-medium text-xs px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                                        placeholder="Contoh: With Praise (Cum Laude)"
                                                    />
                                                </td>
                                                <td className="py-3.5 px-6">
                                                    <input
                                                        type="text"
                                                        value={pred.description || ''}
                                                        onChange={(e) => handlePredicateChange(idx, 'description', e.target.value)}
                                                        className="w-full text-xs px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                                        placeholder="Catatan / keterangan tambahan"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </form>
                )}

                {/* =========================================================================
                    TAB 4: GELAR KELULUSAN PROGRAM STUDI
                   ========================================================================= */}
                {activeTab === 'gelar-kelulusan' && (
                    <form onSubmit={handleSaveDegrees} className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50/60 to-white">
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    Pengaturan Gelar Akademik Program Studi
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Konfigurasi penulisan gelar resmi Indonesia dan Internasional (English) serta syarat beban SKS kelulusan per program studi.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSavingDegrees}
                                className="flex items-center space-x-1.5 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl transition shadow-md shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                <span>{isSavingDegrees ? 'Menyimpan...' : 'Simpan Data Gelar'}</span>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
                                        <tr>
                                            <th className="py-3.5 px-4 w-14 text-center">No.</th>
                                            <th className="py-3.5 px-6">Program Studi</th>
                                            <th className="py-3.5 px-6">Gelar Singkat (ID)</th>
                                            <th className="py-3.5 px-6">Gelar Lengkap (ID)</th>
                                            <th className="py-3.5 px-6">Gelar Singkat (EN)</th>
                                            <th className="py-3.5 px-6">Gelar Lengkap (EN)</th>
                                            <th className="py-3.5 px-6 text-center">Beban SKS Min.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {degreesForm.map((deg, idx) => (
                                            <tr key={deg.id} className="hover:bg-slate-50/80 transition">
                                                <td className="py-3.5 px-4 text-center font-bold text-slate-500">{idx + 1}</td>
                                                <td className="py-3.5 px-6 font-bold text-slate-900">
                                                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-purple-50 text-purple-800 border border-purple-200">
                                                        {deg.program_code}
                                                    </span>
                                                    <span className="ml-2 font-bold">{deg.program_name}</span>
                                                </td>
                                                <td className="py-3.5 px-6">
                                                    <input
                                                        type="text"
                                                        value={deg.degree_short_title}
                                                        onChange={(e) => handleDegreeChange(idx, 'degree_short_title', e.target.value)}
                                                        className="w-28 font-bold text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                                                    />
                                                </td>
                                                <td className="py-3.5 px-6">
                                                    <input
                                                        type="text"
                                                        value={deg.degree_full_title}
                                                        onChange={(e) => handleDegreeChange(idx, 'degree_full_title', e.target.value)}
                                                        className="w-full font-bold text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                                                    />
                                                </td>
                                                <td className="py-3.5 px-6">
                                                    <input
                                                        type="text"
                                                        value={deg.degree_short_title_en || ''}
                                                        onChange={(e) => handleDegreeChange(idx, 'degree_short_title_en', e.target.value)}
                                                        className="w-28 font-mono text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                                                    />
                                                </td>
                                                <td className="py-3.5 px-6">
                                                    <input
                                                        type="text"
                                                        value={deg.degree_full_title_en || ''}
                                                        onChange={(e) => handleDegreeChange(idx, 'degree_full_title_en', e.target.value)}
                                                        className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                                                    />
                                                </td>
                                                <td className="py-3.5 px-6 text-center">
                                                    <input
                                                        type="number"
                                                        value={deg.total_credits_required}
                                                        onChange={(e) => handleDegreeChange(idx, 'total_credits_required', parseInt(e.target.value) || 0)}
                                                        className="w-20 font-black text-center text-purple-900 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-xl text-sm"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </form>
                )}
            </div>

            {/* =========================================================================
                MODAL 1: TAMBAH / EDIT SKALA NILAI (PER PRODI DENGAN CARD TERKUNCI)
               ========================================================================= */}
            {showScaleModal && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowScaleModal(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
                >
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
                        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                                    <Scale className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-white">
                                        {editingScale ? 'Edit Skala Huruf Mutu' : 'Tambah Skala Huruf Mutu'}
                                    </h3>
                                    <p className="text-[11px] text-slate-300">Konfigurasi rentang angka dan indeks nilai</p>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setShowScaleModal(false)} 
                                className="p-1.5 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveScale} className="p-6 space-y-4 text-xs">
                            {/* PREMIUM LOCKED PRODI BANNER CARD */}
                            <div className="p-3.5 bg-gradient-to-r from-blue-50/90 to-indigo-50/50 rounded-2xl border border-blue-200/80 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                                        <GraduationCap className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-black text-slate-900 text-xs">
                                                {activeProdiObj?.name || 'Program Studi'}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-blue-100 text-blue-800">
                                                {activeProdiObj?.code}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                            {activeProdiObj?.faculty_name || 'Fakultas'} • Jenjang {activeProdiObj?.degree || 'S1'}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
                                    🔒 Terkunci
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Huruf Mutu (Grade):</label>
                                    <input
                                        type="text"
                                        maxLength="4"
                                        value={scaleForm.grade_letter}
                                        onChange={(e) => setScaleForm({ ...scaleForm, grade_letter: e.target.value.toUpperCase() })}
                                        placeholder="A, B+, C..."
                                        className="w-full font-black text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 uppercase"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Bobot Angka Mutu (0.0 - 4.0):</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="4"
                                        value={scaleForm.grade_point}
                                        onChange={(e) => setScaleForm({ ...scaleForm, grade_point: e.target.value })}
                                        placeholder="4.00, 3.50..."
                                        className="w-full font-black text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-blue-600"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Batas Nilai Minimum:</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={scaleForm.min_score}
                                        onChange={(e) => setScaleForm({ ...scaleForm, min_score: e.target.value })}
                                        className="w-full font-mono font-bold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Batas Nilai Maksimum:</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={scaleForm.max_score}
                                        onChange={(e) => setScaleForm({ ...scaleForm, max_score: e.target.value })}
                                        className="w-full font-mono font-bold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        required
                                    />
                                </div>
                            </div>

                            <label className="flex items-center space-x-2.5 cursor-pointer pt-2">
                                <input
                                    type="checkbox"
                                    checked={scaleForm.is_passing}
                                    onChange={(e) => setScaleForm({ ...scaleForm, is_passing: e.target.checked })}
                                    className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                                />
                                <span className="text-xs font-bold text-slate-800">
                                    Dinyatakan Lulus Mata Kuliah (Passing Grade)
                                </span>
                            </label>

                            <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowScaleModal(false)}
                                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingScale}
                                    className="px-5 py-2.5 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                                >
                                    {isSavingScale ? 'Menyimpan...' : 'Simpan Skala'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================================================
                MODAL 2: TAMBAH / EDIT ATURAN BATAS SKS (PER PRODI DENGAN CARD TERKUNCI)
               ========================================================================= */}
            {showSksModal && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowSksModal(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
                >
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-visible animate-in zoom-in-95 duration-150">
                        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-t-3xl flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-white">
                                        {editingSks ? 'Edit Aturan Batas SKS' : 'Tambah Aturan Batas SKS'}
                                    </h3>
                                    <p className="text-[11px] text-slate-300">Konfigurasi batas beban SKS berdasarkan capaian IPS</p>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setShowSksModal(false)} 
                                className="p-1.5 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveSksSingle} className="p-6 space-y-4 text-xs rounded-b-3xl">
                            {/* PREMIUM LOCKED PRODI BANNER CARD */}
                            <div className="p-3.5 bg-gradient-to-r from-indigo-50/90 to-purple-50/50 rounded-2xl border border-indigo-200/80 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                                        <GraduationCap className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-black text-slate-900 text-xs">
                                                {activeProdiObj?.name || 'Program Studi'}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-indigo-100 text-indigo-800">
                                                {activeProdiObj?.code}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                            {activeProdiObj?.faculty_name || 'Fakultas'} • Jenjang {activeProdiObj?.degree || 'S1'}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs">
                                    🔒 Terkunci
                                </span>
                            </div>

                            <div className="relative z-30">
                                <label className="block font-bold text-slate-700 mb-1.5">Kategori Aturan SKS:</label>
                                <div ref={categoryDropdownRef} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsCategoryDropdownOpen(prev => !prev)}
                                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition border cursor-pointer text-left ${
                                            isCategoryDropdownOpen
                                                ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white'
                                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300'
                                        }`}
                                    >
                                        {(() => {
                                            const currentCat = SKS_CATEGORIES.find(c => c.id === sksForm.category) || SKS_CATEGORIES[0];
                                            const CatIcon = currentCat.icon;
                                            return (
                                                <div className="flex items-center space-x-2.5 min-w-0 truncate">
                                                    <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                                                        <CatIcon className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div className="min-w-0 truncate">
                                                        <span className="font-black text-slate-900 mr-2">{currentCat.title}</span>
                                                        <span className="text-slate-500 font-medium">({currentCat.subtitle})</span>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
                                            isCategoryDropdownOpen ? 'rotate-180 text-indigo-600' : ''
                                        }`} />
                                    </button>

                                    {/* Popover Dropdown List (Select Option Style) */}
                                    {isCategoryDropdownOpen && (
                                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn p-1.5 space-y-1">
                                            {SKS_CATEGORIES.map((cat) => {
                                                const isSelected = sksForm.category === cat.id;
                                                const CatIcon = cat.icon;

                                                return (
                                                    <div
                                                        key={cat.id}
                                                        onClick={() => {
                                                            setSksForm({ ...sksForm, category: cat.id });
                                                            setIsCategoryDropdownOpen(false);
                                                        }}
                                                        className={`p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between group ${
                                                            isSelected
                                                                ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold'
                                                                : 'hover:bg-slate-50 text-slate-700 font-medium border border-transparent'
                                                        }`}
                                                    >
                                                        <div className="flex items-center space-x-2.5 min-w-0">
                                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${
                                                                isSelected
                                                                    ? 'bg-indigo-600 text-white shadow-xs'
                                                                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                                                            }`}>
                                                                <CatIcon className="w-3.5 h-3.5" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center space-x-1.5">
                                                                    <span className="text-xs font-bold text-slate-900">{cat.title}</span>
                                                                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                                                        isSelected ? 'bg-indigo-200 text-indigo-900' : 'bg-slate-100 text-slate-600'
                                                                    }`}>
                                                                        {cat.id}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                                                                    {cat.subtitle}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {isSelected && (
                                                            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0 ml-2">
                                                                <Check className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">IPS Minimum (0.00 - 4.00):</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="4"
                                        value={sksForm.min_ips}
                                        onChange={(e) => setSksForm({ ...sksForm, min_ips: e.target.value })}
                                        className="w-full font-mono font-bold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">IPS Maksimum (0.00 - 4.00):</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="4"
                                        value={sksForm.max_ips}
                                        onChange={(e) => setSksForm({ ...sksForm, max_ips: e.target.value })}
                                        className="w-full font-mono font-bold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Beban SKS Maksimum (1 - 30 SKS):</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={sksForm.max_sks}
                                    onChange={(e) => setSksForm({ ...sksForm, max_sks: parseInt(e.target.value) || 0 })}
                                    className="w-full font-black text-indigo-900 text-base px-3.5 py-2.5 bg-indigo-50/50 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2.5">
                                <button
                                    type="button"
                                    onClick={() => setShowSksModal(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingSks}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                                >
                                    {isSavingSks ? 'Menyimpan...' : (editingSks ? 'Simpan Perubahan' : 'Tambah Aturan')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================================================
                MODAL 3: KONFIRMASI TINDAKAN & HAPUS DATA (CUSTOM RESPONSIVE MODAL)
               ========================================================================= */}
            <DeleteConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                itemName={confirmModal.itemName}
                itemType={confirmModal.itemType}
                confirmText={confirmModal.confirmText}
                cancelText={confirmModal.cancelText}
                variant={confirmModal.variant}
                isLoading={confirmModal.isLoading}
            />
        </AppLayout>
    );
}
