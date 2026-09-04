import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import * as XLSX from 'xlsx';
import AppLayout from '../../../Layouts/AppLayout';
import ImpersonationModal from '../../../Components/ImpersonationModal';
import { 
    Users, Search, UserPlus, Upload, Filter, 
    Edit2, KeyRound, Trash2, CheckCircle2, ChevronRight,
    GraduationCap, Calendar, BookOpen, Star, ShieldCheck,
    Sparkles, X, ChevronDown, Check, RefreshCw, AlertTriangle,
    Mail, Phone, Award, Layers, Shield, Loader2,
    Download, FileSpreadsheet, FileText, FileDown
} from 'lucide-react';

export default function LecturersIndex({ 
    lecturers, 
    academicYears = [], 
    studyPrograms = [], 
    activePeriod, 
    stats = {}, 
    filters = {} 
}) {
    // Active Tab State ('lecturers' | 'teaching' | 'advising' | 'portal')
    const [activeTab, setActiveTab] = useState('lecturers');

    // In-place asynchronous data states (URL browser tetap bersih di /admin/lecturers tanpa berpindah)
    const [lecturersData, setLecturersData] = useState(lecturers);
    const [statsData, setStatsData] = useState(stats);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const [search, setSearch] = useState(filters.search || '');
    const [prodi, setProdi] = useState(filters.study_program || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [perPage, setPerPage] = useState(filters.per_page || 15);

    // Dropdown popover state
    const [isProdiDropdownOpen, setIsProdiDropdownOpen] = useState(false);
    const prodiDropdownRef = useRef(null);

    // Export dropdown state
    const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
    const exportDropdownRef = useRef(null);

    // File input ref for CSV import
    const fileInputRef = useRef(null);

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [selectedLecturer, setSelectedLecturer] = useState(null);
    const [isImpersonateOpen, setIsImpersonateOpen] = useState(false);
    const [lecturerToDelete, setLecturerToDelete] = useState(null);
    const [lecturerToReset, setLecturerToReset] = useState(null);

    // Create Form
    const createForm = useForm({
        name: '',
        identity_number: '',
        nik: '',
        email: '',
        role: 'dosen',
        study_program: studyPrograms[0]?.name || 'Pendidikan Agama Islam (S1)',
        gender: 'L',
        phone_number: '',
    });

    // Edit Form
    const editForm = useForm({
        name: '',
        identity_number: '',
        nik: '',
        email: '',
        role: 'dosen',
        study_program: '',
        gender: 'L',
        phone_number: '',
        is_active: true,
    });

    const [importRecords, setImportRecords] = useState([]);

    // Sinkronisasi props saat Inertia memuat ulang data dari aksi CRUD
    useEffect(() => {
        setLecturersData(lecturers);
        setStatsData(stats);
    }, [lecturers, stats]);

    // Bersihkan URL query parameter agar browser tetap di /admin/lecturers
    useEffect(() => {
        if (window.location.search) {
            window.history.replaceState({}, '', '/admin/lecturers');
        }
    }, []);

    // Close active modal or dropdown on ESC key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
                if (lecturerToDelete) {
                    setLecturerToDelete(null);
                } else if (lecturerToReset) {
                    setLecturerToReset(null);
                } else if (isProdiDropdownOpen) {
                    setIsProdiDropdownOpen(false);
                } else if (isCreateOpen) {
                    setIsCreateOpen(false);
                } else if (isEditOpen) {
                    setIsEditOpen(false);
                } else if (isImportOpen) {
                    setIsImportOpen(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCreateOpen, isEditOpen, isImportOpen, isProdiDropdownOpen, lecturerToDelete, lecturerToReset]);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (prodiDropdownRef.current && !prodiDropdownRef.current.contains(event.target)) {
                setIsProdiDropdownOpen(false);
            }
            if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
                setIsExportDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch Asynchronous In-Place (Tanpa mengubah URL address bar)
    const fetchLecturersData = async (newProdi = prodi, newRole = roleFilter, newPerPage = perPage, newSearch = search, page = 1) => {
        setIsLoadingData(true);
        const params = new URLSearchParams();
        if (newSearch) params.append('search', newSearch);
        if (newProdi) params.append('study_program', newProdi);
        if (newRole) params.append('role', newRole);
        if (Number(newPerPage) !== 15) params.append('per_page', newPerPage);
        if (page > 1) params.append('page', page);
        params.append('format', 'json');

        try {
            const response = await fetch(`/admin/lecturers?${params.toString()}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setLecturersData(data.lecturers);
                    if (data.stats) setStatsData(data.stats);
                    window.history.replaceState({}, '', '/admin/lecturers');
                }
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setIsLoadingData(false);
        }
    };

    // Filter Trigger
    const triggerFilter = (newProdi = prodi, newRole = roleFilter, newPerPage = perPage, newSearch = search) => {
        fetchLecturersData(newProdi, newRole, newPerPage, newSearch, 1);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        triggerFilter(prodi, roleFilter, perPage, search);
    };

    const handleClearSearch = () => {
        setSearch('');
        triggerFilter(prodi, roleFilter, perPage, '');
    };

    const handleProdiChange = (newProdi) => {
        setProdi(newProdi);
        setIsProdiDropdownOpen(false);
        triggerFilter(newProdi, roleFilter, perPage, search);
    };

    const handleRoleChange = (newRole) => {
        setRoleFilter(newRole);
        triggerFilter(prodi, newRole, perPage, search);
    };

    const handlePerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        triggerFilter(prodi, roleFilter, newPerPage, search);
    };

    const handleOpenCreate = () => {
        createForm.reset();
        createForm.setData({
            name: '',
            identity_number: '',
            nik: '',
            email: '',
            role: 'dosen',
            study_program: studyPrograms[0]?.name || 'Pendidikan Agama Islam (S1)',
            gender: 'L',
            phone_number: '',
        });
        setIsCreateOpen(true);
    };

    const handleOpenEdit = (lec) => {
        setSelectedLecturer(lec);
        editForm.setData({
            name: lec.name,
            identity_number: lec.identity_number || '',
            nik: lec.nik || '',
            email: lec.email,
            role: lec.role,
            study_program: lec.study_program || '',
            gender: lec.gender || 'L',
            phone_number: lec.phone_number || '',
            is_active: lec.is_active,
        });
        setIsEditOpen(true);
    };

    const handleOpenImpersonate = (lec) => {
        setSelectedLecturer(lec);
        setIsImpersonateOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post('/admin/lecturers', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        editForm.put(`/admin/lecturers/${selectedLecturer.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
            },
        });
    };

    const handleConfirmResetPassword = () => {
        if (!lecturerToReset) return;
        router.post(`/admin/users/${lecturerToReset.id}/reset-password`, {}, {
            onSuccess: () => setLecturerToReset(null),
        });
    };

    const handleConfirmDelete = () => {
        if (!lecturerToDelete) return;
        router.delete(`/admin/lecturers/${lecturerToDelete.id}`, {
            onSuccess: () => setLecturerToDelete(null),
        });
    };

    const handleToggleStatus = (lec) => {
        router.post(`/admin/users/${lec.id}/toggle-status`);
    };

    const handleExportExcel = () => {
        setIsExportDropdownOpen(false);
        const params = new URLSearchParams();
        if (prodi) params.append('study_program', prodi);
        if (roleFilter) params.append('role', roleFilter);
        if (search) params.append('search', search);
        window.location.href = `/admin/lecturers/export/excel?${params.toString()}`;
    };

    const handleExportPdf = () => {
        setIsExportDropdownOpen(false);
        const params = new URLSearchParams();
        if (prodi) params.append('study_program', prodi);
        if (roleFilter) params.append('role', roleFilter);
        if (search) params.append('search', search);
        window.open(`/admin/lecturers/export/pdf?${params.toString()}`, '_blank');
    };

    const handleDownloadTemplate = () => {
        window.location.href = '/admin/lecturers/template-xlsx';
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

        if (isExcel) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                    const parsed = [];
                    rows.forEach((row) => {
                        const cleanRow = {};
                        Object.keys(row).forEach(k => {
                            cleanRow[k.trim().toLowerCase().replace(/[\s\/-]/g, '_')] = String(row[k] || '').trim();
                        });

                        const name = cleanRow.nama_lengkap || cleanRow.nama || cleanRow.name || '';
                        const identity_number = cleanRow.nidn_nip || cleanRow.nidn || cleanRow.nip || cleanRow.identity_number || '';
                        const nik = cleanRow.nik || cleanRow.no_ktp || cleanRow.ktp || '';
                        let email = cleanRow.email || cleanRow.email_institusi || '';
                        const study_program = cleanRow.program_studi || cleanRow.prodi || cleanRow.study_program || cleanRow.homebase || prodi || 'Pendidikan Agama Islam (S1)';
                        
                        let role = 'dosen';
                        const rVal = (cleanRow.jabatan || cleanRow.role || cleanRow.peran || '').toLowerCase();
                        if (rVal.includes('kaprodi') || rVal.includes('ketua')) role = 'kaprodi';
                        else if (rVal.includes('wali') || rVal.includes('pa')) role = 'dosen_pa';

                        const gender = (cleanRow.jenis_kelamin || cleanRow.gender || cleanRow.jk || 'L').toUpperCase().startsWith('P') ? 'P' : 'L';
                        const phone_number = cleanRow.no_hp || cleanRow.hp || cleanRow.phone || cleanRow.telepon || '';

                        if (name && identity_number) {
                            if (!email) email = `${identity_number}@staialittihad.ac.id`;
                            parsed.push({
                                name,
                                identity_number,
                                nik,
                                email,
                                study_program,
                                role,
                                gender,
                                phone_number
                            });
                        }
                    });

                    if (parsed.length > 0) {
                        setImportRecords(parsed);
                    } else {
                        alert('Tidak ditemukan baris data dosen yang valid di file Excel ini. Pastikan kolom nama_lengkap dan nidn_nip terisi.');
                    }
                } catch (err) {
                    console.error('Gagal membaca file Excel:', err);
                    alert('Gagal membaca file Excel. Pastikan format file .xlsx / .xls valid.');
                }
                if (fileInputRef.current) fileInputRef.current.value = '';
            };
            reader.readAsArrayBuffer(file);
        } else {
            // CSV / Text Fallback
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
                if (lines.length < 2) return;

                let delimiter = ',';
                if (lines[0].includes(';') && !lines[0].includes(',')) delimiter = ';';
                if (lines[0].includes('\t')) delimiter = '\t';

                const cleanHeader = lines[0].split(delimiter).map(h => 
                    h.replace(/["\r]/g, '').trim().toLowerCase().replace(/[\s\/-]/g, '_')
                );

                const parsed = [];
                for (let i = 1; i < lines.length; i++) {
                    const row = lines[i].split(delimiter).map(c => c.replace(/^["']|["']$/g, '').trim());
                    if (row.length < 2) continue;

                    const item = {
                        name: '',
                        identity_number: '',
                        nik: '',
                        email: '',
                        study_program: prodi || 'Pendidikan Agama Islam (S1)',
                        role: 'dosen',
                        gender: 'L',
                        phone_number: ''
                    };

                    cleanHeader.forEach((col, idx) => {
                        const val = row[idx] || '';
                        if (['nama', 'nama_lengkap', 'name'].includes(col)) item.name = val;
                        else if (['nidn', 'nip', 'nidn_nip', 'identity_number'].includes(col)) item.identity_number = val;
                        else if (['nik', 'no_ktp', 'ktp'].includes(col)) item.nik = val;
                        else if (['email', 'email_institusi'].includes(col)) item.email = val;
                        else if (['prodi', 'program_studi', 'study_program', 'homebase'].includes(col)) item.study_program = val;
                        else if (['jabatan', 'role', 'peran'].includes(col)) {
                            const r = val.toLowerCase();
                            if (r.includes('kaprodi') || r.includes('ketua')) item.role = 'kaprodi';
                            else if (r.includes('wali') || r.includes('pa')) item.role = 'dosen_pa';
                            else item.role = 'dosen';
                        }
                        else if (['gender', 'jenis_kelamin', 'jk'].includes(col)) item.gender = val.toUpperCase().startsWith('P') ? 'P' : 'L';
                        else if (['no_hp', 'hp', 'phone', 'phone_number', 'telepon', 'whatsapp'].includes(col)) item.phone_number = val;
                    });

                    if (item.name && item.identity_number) {
                        if (!item.email) item.email = `${item.identity_number}@staialittihad.ac.id`;
                        parsed.push(item);
                    }
                }

                setImportRecords(parsed);
                if (fileInputRef.current) fileInputRef.current.value = '';
            };
            reader.readAsText(file);
        }
    };

    const handleGenerateMockImport = () => {
        const mockData = [
            { name: 'Dr. H. M. Ridwan, M.Ag', identity_number: '2112087501', nik: '3203011208750001', email: 'm.ridwan@staialittihad.ac.id', role: 'dosen', study_program: 'Pendidikan Agama Islam (S1)', gender: 'L', phone_number: '08123456789' },
            { name: 'Dra. Hj. Siti Maryam, M.Pd.I', identity_number: '2115047802', nik: '3203015504780002', email: 'siti.maryam@staialittihad.ac.id', role: 'dosen_pa', study_program: 'Pendidikan Agama Islam (S1)', gender: 'P', phone_number: '08129876543' },
            { name: 'Dr. Ahmad Syafi\'i, M.Ag', identity_number: '2118097201', nik: '3203011809720001', email: 'ahmad.syafii@staialittihad.ac.id', role: 'kaprodi', study_program: 'Pendidikan Agama Islam (S1)', gender: 'L', phone_number: '08134567890' },
        ];
        setImportRecords(mockData);
    };

    const handleImportSubmit = () => {
        router.post('/admin/lecturers/import-batch', { records: importRecords }, {
            onSuccess: () => {
                setIsImportOpen(false);
                setImportRecords([]);
            },
        });
    };

    return (
        <AppLayout title="Direktori Tenaga Pendidik & Dosen">
            <Head title="Data Dosen & Pengajar" />

            {/* Impersonation Modal */}
            <ImpersonationModal
                isOpen={isImpersonateOpen}
                onClose={() => setIsImpersonateOpen(false)}
                targetUser={selectedLecturer}
            />

            <div className="space-y-3.5">
                {/* 1. COMPACT HERO HEADER DENGAN INTEGRATED SUB-BAR FILTER HOMEBASE */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative border border-slate-700/50 z-10">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black mb-1">
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                <span>CIVITAS AKADEMIKA • TENAGA PENDIDIK & DOSEN</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                                Direktori Dosen & Tenaga Pengajar
                            </h2>
                            <p className="text-xs text-slate-300 mt-0.5">
                                Kelola data dosen pengampu, dosen wali (PA), dan kaprodi pada semester ({activePeriod?.name || 'Periode Aktif'}).
                            </p>
                        </div>

                        {/* Statistik Singkat */}
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Dosen</span>
                                <span className="text-sm font-black text-emerald-400">{stats.total || 0}</span>
                            </div>
                            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Dosen PA</span>
                                <span className="text-sm font-black text-teal-300">{stats.advisors || 0}</span>
                            </div>
                            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Kaprodi</span>
                                <span className="text-sm font-black text-indigo-300">{stats.kaprodi || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Sub-bar Filter Homebase & Quick Selector */}
                    <div className="relative z-20 mt-3 pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-2.5">
                            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                            <div className="flex items-center space-x-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-300">Homebase Prodi:</span>
                                {prodi ? (
                                    <div className="inline-flex items-center space-x-1.5">
                                        <span className="text-xs font-black text-white">{prodi}</span>
                                        <button
                                            onClick={() => handleProdiChange('')}
                                            className="p-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition"
                                            title="Tampilkan Semua Prodi"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-xs text-emerald-400 font-bold">Semua Homebase Program Studi</span>
                                )}
                            </div>
                        </div>

                        {/* Custom Dropdown Trigger */}
                        <div ref={prodiDropdownRef} className="relative w-full sm:w-80">
                            <button
                                type="button"
                                onClick={() => setIsProdiDropdownOpen(prev => !prev)}
                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition shadow-2xs cursor-pointer text-left border ${
                                    isProdiDropdownOpen 
                                        ? 'border-emerald-400 ring-2 ring-emerald-500/30 bg-slate-800 text-white' 
                                        : prodi 
                                            ? 'border-emerald-500/50 bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-200 font-bold' 
                                            : 'border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 font-medium'
                                }`}
                            >
                                <div className="flex items-center space-x-2 truncate">
                                    <GraduationCap className={`w-3.5 h-3.5 shrink-0 ${prodi ? 'text-emerald-400' : 'text-slate-400'}`} />
                                    <span className="truncate">
                                        {prodi || 'Pilih Homebase Prodi...'}
                                    </span>
                                </div>

                                <div className="flex items-center space-x-1 shrink-0 ml-1.5">
                                    {prodi && (
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleProdiChange('');
                                            }}
                                            className="p-0.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
                                            title="Reset Pilihan"
                                        >
                                            <X className="w-3 h-3" />
                                        </span>
                                    )}
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                        isProdiDropdownOpen ? 'rotate-180 text-emerald-400' : ''
                                    }`} />
                                </div>
                            </button>

                            {/* Popover Dropdown Menu */}
                            {isProdiDropdownOpen && (
                                <div className="absolute right-0 top-full mt-1.5 w-full sm:w-88 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn">
                                    <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                                            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>HOMEBASE PROGRAM STUDI</span>
                                        </span>
                                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                                            ESC
                                        </span>
                                    </div>

                                    <div className="p-2 space-y-1 max-h-72 overflow-y-auto divide-y divide-slate-100/70">
                                        <button
                                            type="button"
                                            onClick={() => handleProdiChange('')}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                                                !prodi ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'hover:bg-slate-50 text-slate-700'
                                            }`}
                                        >
                                            <span>Semua Program Studi</span>
                                            {!prodi && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                        </button>
                                        {studyPrograms.map((p) => {
                                            const isSelected = p.name === prodi;
                                            return (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => handleProdiChange(p.name)}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                                                        isSelected ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'hover:bg-slate-50 text-slate-700'
                                                    }`}
                                                >
                                                    <div className="truncate pr-2">
                                                        <p className="truncate">{p.name}</p>
                                                        <p className="text-[10px] font-mono text-slate-400">{p.code} • {p.degree || 'S1'}</p>
                                                    </div>
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. TABS SWITCHER (Sistem Tab Tetap di Halaman Seperti /admin/students) */}
                <div className="flex border-b border-slate-200 space-x-2 sm:space-x-6 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('lecturers')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'lecturers'
                                ? 'border-emerald-600 text-emerald-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Data Induk Dosen</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'lecturers' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {statsData?.total || 0} Dosen
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('teaching')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'teaching'
                                ? 'border-indigo-600 text-indigo-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Beban Mengajar & Kelas</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'teaching' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {statsData?.lecturers || 0} Pengampu
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('advising')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'advising'
                                ? 'border-teal-600 text-teal-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Shield className="w-4 h-4" />
                        <span>Dosen PA (Wali Akademik)</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'advising' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {statsData?.advisors || 0} Dosen PA
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('portal')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'portal'
                                ? 'border-amber-600 text-amber-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <KeyRound className="w-4 h-4" />
                        <span>User Portal & Hak Akses</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'portal' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {statsData?.total || 0} Akun
                        </span>
                    </button>
                </div>

                {/* 3. TOOLBAR PENCARIAN, FILTER TAMPIL DATA & AKSI UTAMA */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-2.5">
                    {/* Search Bar & Filter Tampil Data Berdampingan */}
                    <div className="flex items-center space-x-2 w-full md:flex-1">
                        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={
                                    activeTab === 'lecturers' ? "Cari nama dosen, NIDN/NIP, NIK, email..." :
                                    activeTab === 'teaching' ? "Cari nama dosen atau NIDN untuk penugasan kelas..." :
                                    activeTab === 'advising' ? "Cari nama dosen wali PA..." :
                                    "Cari username, NIDN, NIK akun portal dosen..."
                                }
                                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    title="Hapus Pencarian"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </form>

                        {/* Filter Tampil Data di Samping Pencarian */}
                        <div className="shrink-0 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
                            <select
                                value={perPage}
                                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                                title="Jumlah data per halaman"
                            >
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>

                    {/* Tombol Aksi (Icon-Only dengan Tooltip & Opsi Ekspor) */}
                    <div className="flex items-center space-x-1.5 w-full md:w-auto shrink-0 justify-end">
                        {/* Segarkan Data */}
                        <button
                            type="button"
                            onClick={() => triggerFilter(prodi, roleFilter, perPage, search)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer relative group"
                            title="Segarkan Data Dosen"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-emerald-600' : ''}`} />
                            <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100 z-50 shadow-md">
                                Segarkan
                            </span>
                        </button>

                        {/* Ekspor (Dropdown Option Excel & PDF) */}
                        <div className="relative" ref={exportDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer relative group flex items-center space-x-0.5"
                                title="Ekspor Data (Excel / PDF)"
                            >
                                <Download className="w-4 h-4 text-slate-700" />
                                <ChevronDown className="w-3 h-3 text-slate-400" />
                                <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100 z-50 shadow-md">
                                    Ekspor
                                </span>
                            </button>

                            {/* Dropdown Menu Ekspor */}
                            {isExportDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn text-xs">
                                    <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Pilihan Format Ekspor
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleExportExcel}
                                        className="w-full px-3 py-2 text-left flex items-center space-x-2.5 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition cursor-pointer"
                                    >
                                        <div className="p-1.5 rounded bg-emerald-100 text-emerald-700">
                                            <FileSpreadsheet className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold">Unduh Format Excel (.xls)</p>
                                            <p className="text-[10px] text-slate-400">Data lengkap tabel & NIK</p>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleExportPdf}
                                        className="w-full px-3 py-2 text-left flex items-center space-x-2.5 hover:bg-rose-50 text-slate-700 hover:text-rose-800 transition cursor-pointer"
                                    >
                                        <div className="p-1.5 rounded bg-rose-100 text-rose-700">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold">Cetak / Ekspor PDF Resmi</p>
                                            <p className="text-[10px] text-slate-400">Kop STAI & pengesahan</p>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Impor Excel / CSV (Icon Saja dengan Tooltip) */}
                        <button
                            type="button"
                            onClick={() => {
                                setImportRecords([]);
                                setIsImportOpen(true);
                            }}
                            className="p-2 bg-slate-800 hover:bg-slate-900 text-emerald-400 rounded-lg transition shadow-2xs cursor-pointer relative group"
                            title="Impor Data Dosen (Excel/CSV)"
                        >
                            <Upload className="w-4 h-4 text-emerald-400" />
                            <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100 z-50 shadow-md">
                                Impor Dosen
                            </span>
                        </button>

                        {/* Tambah Dosen Baru (Icon Saja dengan Tooltip) */}
                        <button
                            type="button"
                            onClick={handleOpenCreate}
                            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-2xs cursor-pointer relative group"
                            title="Tambah Dosen Baru"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100 z-50 shadow-md">
                                Tambah Dosen
                            </span>
                        </button>
                    </div>
                </div>

                {/* 4. TABEL KONTEN (SESUAI ACTIVE TAB) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden relative">
                    {/* Loading Overlay */}
                    {isLoadingData && (
                        <div className="absolute inset-0 z-40 bg-white/70 backdrop-blur-2xs flex items-center justify-center">
                            <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-fadeIn">
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                                <span>Memuat data dosen...</span>
                            </div>
                        </div>
                    )}

                    {/* TAB A: DATA INDUK DOSEN */}
                    {activeTab === 'lecturers' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="py-3 px-4">Nama Dosen & Kontak</th>
                                        <th className="py-3 px-4">NIDN / NIP & NIK</th>
                                        <th className="py-3 px-4">Homebase Program Studi</th>
                                        <th className="py-3 px-4">Jabatan Akademik</th>
                                        <th className="py-3 px-4 text-center">Beban Mengajar</th>
                                        <th className="py-3 px-4 text-center">Status Akun</th>
                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {lecturersData.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center justify-center space-y-2">
                                                    <Users className="w-10 h-10 text-slate-300" />
                                                    <p className="text-sm font-bold text-slate-600">Tidak ada data dosen yang sesuai.</p>
                                                    <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau reset filter homebase / jabatan.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        lecturersData.data.map((lec) => (
                                            <tr key={lec.id} className="hover:bg-slate-50/80 transition">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center space-x-2.5">
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-emerald-950 flex items-center justify-center font-black text-white text-xs shadow-2xs shrink-0">
                                                            {lec.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 hover:text-emerald-700 transition">
                                                                {lec.name}
                                                            </p>
                                                            <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                                                                <span className="flex items-center space-x-1">
                                                                    <Mail className="w-3 h-3 text-slate-400" />
                                                                    <span className="font-mono">{lec.email}</span>
                                                                </span>
                                                                {lec.phone_number && (
                                                                    <span className="flex items-center space-x-1">
                                                                        <Phone className="w-3 h-3 text-slate-400" />
                                                                        <span className="font-mono">{lec.phone_number}</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-col space-y-1">
                                                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px] w-fit">
                                                            NIDN: {lec.identity_number || '-'}
                                                        </span>
                                                        {lec.nik && (
                                                            <span className="font-mono text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 w-fit">
                                                                NIK: {lec.nik}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-slate-700 font-medium">
                                                    {lec.study_program || 'Pendidikan Agama Islam (S1)'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                        lec.role === 'kaprodi' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                                                        lec.role === 'dosen_pa' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                                                        'bg-slate-100 text-slate-700 border border-slate-200'
                                                    }`}>
                                                        {lec.role === 'kaprodi' ? 'Ketua Prodi' : lec.role === 'dosen_pa' ? 'Dosen PA (Wali)' : 'Dosen Pengampu'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[11px]">
                                                        <BookOpen className="w-3 h-3 text-emerald-600" />
                                                        <span>{lec.teaching_classes_count || 0} Kelas</span>
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <button
                                                        onClick={() => handleToggleStatus(lec)}
                                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black transition cursor-pointer border ${
                                                            lec.is_active 
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                                        }`}
                                                    >
                                                        {lec.is_active ? '● AKTIF' : '○ NONAKTIF'}
                                                    </button>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end space-x-1">
                                                        <button
                                                            onClick={() => handleOpenImpersonate(lec)}
                                                            title="Menyamar sebagai dosen ini"
                                                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-black transition flex items-center space-x-1 cursor-pointer"
                                                        >
                                                            <span>🎭</span>
                                                            <span className="hidden sm:inline">Menyamar</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenEdit(lec)}
                                                            title="Edit Data Dosen"
                                                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setLecturerToReset(lec)}
                                                            title="Reset Password ke salam123"
                                                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                                                        >
                                                            <KeyRound className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setLecturerToDelete(lec)}
                                                            title="Hapus Data Dosen"
                                                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
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
                    )}

                    {/* TAB B: BEBAN MENGAJAR & KELAS */}
                    {activeTab === 'teaching' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-indigo-50/70 border-b border-indigo-100 text-indigo-900 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="py-3 px-4">Nama Dosen Pendidik</th>
                                        <th className="py-3 px-4">NIDN / NIP & NIK</th>
                                        <th className="py-3 px-4">Homebase Program Studi</th>
                                        <th className="py-3 px-4 text-center">Beban Mengajar Semester Ini</th>
                                        <th className="py-3 px-4 text-center">Status Beban Ajar</th>
                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {lecturersData.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-400">
                                                <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                                <p className="font-bold text-slate-600">Tidak ada data penugasan mengajar.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        lecturersData.data.map((lec) => (
                                            <tr key={lec.id} className="hover:bg-indigo-50/30 transition">
                                                <td className="py-3 px-4">
                                                    <p className="font-bold text-slate-900">{lec.name}</p>
                                                    <span className="text-[11px] text-slate-400 font-mono">{lec.email}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-col space-y-1">
                                                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px] w-fit">
                                                            NIDN: {lec.identity_number || '-'}
                                                        </span>
                                                        {lec.nik && (
                                                            <span className="font-mono text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 w-fit">
                                                                NIK: {lec.nik}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-slate-700 font-medium">
                                                    {lec.study_program}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-100 text-indigo-800 font-black rounded-lg text-xs">
                                                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                                                        <span>{lec.teaching_classes_count || 0} Kelas Ajar</span>
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {lec.teaching_classes_count > 0 ? (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                                                            <Check className="w-3 h-3 text-emerald-600" />
                                                            <span>Aktif Mengajar</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">
                                                            <span>Belum Ada Kelas</span>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        onClick={() => handleOpenEdit(lec)}
                                                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition cursor-pointer"
                                                    >
                                                        Kelola Dosen
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* TAB C: DOSEN PEMBIMBING AKADEMIK (PA) */}
                    {activeTab === 'advising' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-teal-50/70 border-b border-teal-100 text-teal-900 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="py-3 px-4">Nama Dosen Pembimbing (PA)</th>
                                        <th className="py-3 px-4">NIDN / NIP & NIK</th>
                                        <th className="py-3 px-4">Homebase Program Studi</th>
                                        <th className="py-3 px-4 text-center">Mahasiswa Bimbingan Aktif</th>
                                        <th className="py-3 px-4 text-center">Status Peran</th>
                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {lecturersData.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-400">
                                                <Shield className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                                <p className="font-bold text-slate-600">Tidak ada data dosen pembimbing.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        lecturersData.data.map((lec) => (
                                            <tr key={lec.id} className="hover:bg-teal-50/30 transition">
                                                <td className="py-3 px-4">
                                                    <p className="font-bold text-slate-900">{lec.name}</p>
                                                    <span className="text-[11px] text-slate-400 font-mono">{lec.email}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-col space-y-1">
                                                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px] w-fit">
                                                            NIDN: {lec.identity_number || '-'}
                                                        </span>
                                                        {lec.nik && (
                                                            <span className="font-mono text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 w-fit">
                                                                NIK: {lec.nik}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-slate-700 font-medium">
                                                    {lec.study_program}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-teal-100 text-teal-800 font-black rounded-lg text-xs">
                                                        <Users className="w-3.5 h-3.5 text-teal-600" />
                                                        <span>{lec.advising_students_count || 0} Mahasiswa</span>
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                                        lec.role === 'dosen_pa'
                                                            ? 'bg-teal-100 text-teal-800 border border-teal-200'
                                                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                    }`}>
                                                        {lec.role === 'dosen_pa' ? 'Dosen PA Resmi' : 'Dosen Pengampu'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        onClick={() => handleOpenEdit(lec)}
                                                        className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-bold transition cursor-pointer"
                                                    >
                                                        Edit Peran PA
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* TAB D: USER PORTAL & HAK AKSES */}
                    {activeTab === 'portal' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-amber-50/70 border-b border-amber-100 text-amber-900 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="py-3 px-4">Username & Nama Akun</th>
                                        <th className="py-3 px-4">NIDN / NIP & NIK</th>
                                        <th className="py-3 px-4">Email Login</th>
                                        <th className="py-3 px-4">Peran Hak Akses</th>
                                        <th className="py-3 px-4 text-center">Status Login</th>
                                        <th className="py-3 px-4 text-right">Aksi Keamanan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {lecturersData.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-400">
                                                <KeyRound className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                                <p className="font-bold text-slate-600">Tidak ada akun portal dosen ditemukan.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        lecturersData.data.map((lec) => (
                                            <tr key={lec.id} className="hover:bg-amber-50/30 transition">
                                                <td className="py-3 px-4">
                                                    <p className="font-bold text-slate-900">{lec.name}</p>
                                                    <span className="font-mono text-[11px] text-amber-800 bg-amber-50 px-1 rounded">
                                                        @{lec.username || lec.identity_number}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-col space-y-1">
                                                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px] w-fit">
                                                            NIDN: {lec.identity_number || '-'}
                                                        </span>
                                                        {lec.nik && (
                                                            <span className="font-mono text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 w-fit">
                                                                NIK: {lec.nik}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-slate-700 font-mono text-[11px]">
                                                    {lec.email}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase bg-slate-100 text-slate-700 border border-slate-200">
                                                        {lec.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <button
                                                        onClick={() => handleToggleStatus(lec)}
                                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black transition cursor-pointer border ${
                                                            lec.is_active 
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                                        }`}
                                                    >
                                                        {lec.is_active ? '● AKTIF' : '○ NONAKTIF'}
                                                    </button>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end space-x-1.5">
                                                        <button
                                                            onClick={() => handleOpenImpersonate(lec)}
                                                            className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-bold text-[10px] flex items-center space-x-1 cursor-pointer"
                                                        >
                                                            <span>🎭 Menyamar</span>
                                                        </button>
                                                        <button
                                                            onClick={() => setLecturerToReset(lec)}
                                                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[10px] flex items-center space-x-1 cursor-pointer"
                                                        >
                                                            <span>🔑 Reset Password</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <span className="text-slate-500 text-[11px]">
                            Menampilkan <span className="font-bold text-slate-700">{lecturersData.from || 0}</span> - <span className="font-bold text-slate-700">{lecturersData.to || 0}</span> dari <span className="font-bold text-slate-700">{lecturersData.total || 0}</span> data dosen
                        </span>
                        <div className="flex items-center space-x-1">
                            {lecturersData.links?.map((link, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        if (!link.url) return;
                                        const urlObj = new URL(link.url, window.location.origin);
                                        const p = urlObj.searchParams.get('page') || 1;
                                        fetchLecturersData(prodi, roleFilter, perPage, search, Number(p));
                                    }}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                        link.active
                                            ? 'bg-emerald-600 text-white'
                                            : link.url
                                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            : 'text-slate-300 pointer-events-none'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* MODAL CREATE LECTURER */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
                        <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 sm:p-5 text-white flex items-center justify-between">
                                <div>
                                    <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black mb-1">
                                        <UserPlus className="w-3 h-3 text-emerald-400" />
                                        <span>TAMBAH TENAGA PENDIDIK</span>
                                    </div>
                                    <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-white">
                                        Pendaftaran Dosen Baru
                                    </h3>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                                        ESC
                                    </span>
                                    <button 
                                        onClick={() => setIsCreateOpen(false)} 
                                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleCreateSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nama Lengkap & Gelar:</label>
                                    <input
                                        type="text"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="Contoh: Dr. H. M. Ridwan, M.Ag"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">NIDN / NIP:</label>
                                        <input
                                            type="text"
                                            value={createForm.data.identity_number}
                                            onChange={(e) => createForm.setData('identity_number', e.target.value)}
                                            placeholder="Contoh: 2112087501"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">No. KTP / NIK (16 Digit):</label>
                                        <input
                                            type="text"
                                            maxLength={16}
                                            value={createForm.data.nik}
                                            onChange={(e) => createForm.setData('nik', e.target.value.replace(/[^0-9]/g, ''))}
                                            placeholder="Contoh: 3203011208750001"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Jabatan Akademik:</label>
                                        <select
                                            value={createForm.data.role}
                                            onChange={(e) => createForm.setData('role', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        >
                                            <option value="dosen">Dosen Pengampu</option>
                                            <option value="dosen_pa">Dosen PA (Wali)</option>
                                            <option value="kaprodi">Ketua Prodi</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Email Institusi:</label>
                                        <input
                                            type="email"
                                            value={createForm.data.email}
                                            onChange={(e) => createForm.setData('email', e.target.value)}
                                            placeholder="dosen@staialittihad.ac.id"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">No. WhatsApp / HP:</label>
                                        <input
                                            type="text"
                                            value={createForm.data.phone_number}
                                            onChange={(e) => createForm.setData('phone_number', e.target.value)}
                                            placeholder="08123456789"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin:</label>
                                        <select
                                            value={createForm.data.gender}
                                            onChange={(e) => createForm.setData('gender', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        >
                                            <option value="L">Laki-laki</option>
                                            <option value="P">Perempuan</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Homebase Prodi:</label>
                                        <select
                                            value={createForm.data.study_program}
                                            onChange={(e) => createForm.setData('study_program', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        >
                                            {studyPrograms.map((p) => (
                                                <option key={p.id} value={p.name}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-medium flex items-center space-x-2">
                                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>Akun login otomatis diaktifkan dengan password default: <strong className="font-mono font-bold">salam123</strong>.</span>
                                </div>

                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsCreateOpen(false)} 
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition"
                                    >
                                        Batal (ESC)
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={createForm.processing} 
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs disabled:opacity-50"
                                    >
                                        Simpan Data Dosen
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL EDIT LECTURER */}
                {isEditOpen && selectedLecturer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
                        <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 sm:p-5 text-white flex items-center justify-between">
                                <div>
                                    <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black mb-1">
                                        <Edit2 className="w-3 h-3 text-emerald-400" />
                                        <span>PERBARUI DATA PENDIDIK</span>
                                    </div>
                                    <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-white">
                                        Edit Data Dosen
                                    </h3>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                                        ESC
                                    </span>
                                    <button 
                                        onClick={() => setIsEditOpen(false)} 
                                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleEditSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nama Lengkap & Gelar:</label>
                                    <input
                                        type="text"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">NIDN / NIP:</label>
                                        <input
                                            type="text"
                                            value={editForm.data.identity_number}
                                            onChange={(e) => editForm.setData('identity_number', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">No. KTP / NIK (16 Digit):</label>
                                        <input
                                            type="text"
                                            maxLength={16}
                                            value={editForm.data.nik}
                                            onChange={(e) => editForm.setData('nik', e.target.value.replace(/[^0-9]/g, ''))}
                                            placeholder="Contoh: 3203011208750001"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Jabatan Akademik:</label>
                                        <select
                                            value={editForm.data.role}
                                            onChange={(e) => editForm.setData('role', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        >
                                            <option value="dosen">Dosen Pengampu</option>
                                            <option value="dosen_pa">Dosen PA (Wali)</option>
                                            <option value="kaprodi">Ketua Prodi</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Email Institusi:</label>
                                        <input
                                            type="email"
                                            value={editForm.data.email}
                                            onChange={(e) => editForm.setData('email', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">No. WhatsApp / HP:</label>
                                        <input
                                            type="text"
                                            value={editForm.data.phone_number}
                                            onChange={(e) => editForm.setData('phone_number', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin:</label>
                                        <select
                                            value={editForm.data.gender}
                                            onChange={(e) => editForm.setData('gender', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        >
                                            <option value="L">Laki-laki</option>
                                            <option value="P">Perempuan</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Homebase Prodi:</label>
                                        <select
                                            value={editForm.data.study_program}
                                            onChange={(e) => editForm.setData('study_program', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        >
                                            {studyPrograms.map((p) => (
                                                <option key={p.id} value={p.name}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditOpen(false)} 
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition"
                                    >
                                        Batal (ESC)
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={editForm.processing} 
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs disabled:opacity-50"
                                    >
                                        Perbarui Dosen
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL IMPORT EXCEL / CSV */}
                {isImportOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
                        <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 sm:p-5 text-white flex items-center justify-between">
                                <div>
                                    <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black mb-1">
                                        <Upload className="w-3 h-3 text-emerald-400" />
                                        <span>IMPOR MASSAL TENAGA PENDIDIK</span>
                                    </div>
                                    <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-white">
                                        Pendaftaran Dosen via File Template
                                    </h3>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                                        ESC
                                    </span>
                                    <button 
                                        onClick={() => setIsImportOpen(false)} 
                                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-4 sm:p-5 space-y-4 text-xs">
                                {/* Box 1: Panduan & Unduh Template Resmi */}
                                <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div>
                                        <p className="font-bold text-emerald-950 flex items-center space-x-1.5">
                                            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                                            <span>Template Resmi & Sederhana Excel (.xlsx)</span>
                                        </p>
                                        <p className="text-[11px] text-emerald-800 mt-0.5">
                                            Kolom wajib diisi: <strong>nama_lengkap</strong>, <strong>nidn_nip</strong>, <strong>email</strong>, <strong>program_studi</strong>.
                                        </p>
                                        <p className="text-[10px] text-emerald-700/80 italic">
                                            *Data lainnya (NIK, No. HP, Jabatan) bersifat opsional dan dapat dilengkapi mandiri oleh dosen di portal.
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
                                        <button
                                            type="button"
                                            onClick={handleDownloadTemplate}
                                            className="flex-1 sm:flex-initial px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold transition text-xs flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
                                            title="Unduh file template Excel (.xlsx) siap isi"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Unduh Template (.XLSX)</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleGenerateMockImport}
                                            className="px-2.5 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold transition text-xs flex items-center space-x-1 cursor-pointer"
                                            title="Isi dengan 3 contoh data untuk uji coba"
                                        >
                                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                            <span className="hidden md:inline">Contoh Data</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Box 2: Dropzone / File Picker */}
                                <div>
                                    <input 
                                        ref={fileInputRef}
                                        type="file" 
                                        accept=".xlsx, .xls, .csv, text/csv" 
                                        onChange={handleFileUpload} 
                                        className="hidden" 
                                        id="csvFileInput"
                                    />
                                    <label 
                                        htmlFor="csvFileInput"
                                        className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-emerald-50/40 transition group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-slate-200/70 group-hover:bg-emerald-100 flex items-center justify-center mb-2 transition">
                                            <FileSpreadsheet className="w-5 h-5 text-slate-500 group-hover:text-emerald-700" />
                                        </div>
                                        <p className="font-bold text-slate-800 text-xs text-center">
                                            Klik untuk memilih file Excel template (.xlsx / .xls) yang telah diisi
                                        </p>
                                        <p className="text-[11px] text-slate-400 text-center mt-0.5">
                                            Mendukung format file Microsoft Excel (.xlsx / .xls) dengan deteksi kolom otomatis
                                        </p>
                                    </label>
                                </div>

                                {/* Box 3: Pratinjau Data Siap Impor */}
                                {importRecords.length > 0 && (
                                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                                        <div className="p-2.5 bg-slate-100 border-b border-slate-200 font-bold text-[10px] uppercase text-slate-700 flex items-center justify-between">
                                            <span className="flex items-center space-x-1.5 text-emerald-800">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>Pratinjau Data Siap Diimpor ({importRecords.length} Dosen)</span>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImportRecords([]);
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                }}
                                                className="text-rose-600 hover:text-rose-800 text-[10px] font-bold cursor-pointer hover:underline"
                                            >
                                                Bersihkan Data
                                            </button>
                                        </div>
                                        <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
                                            {importRecords.map((r, idx) => (
                                                <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition text-xs">
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-bold text-slate-900">{r.name}</span>
                                                            <span className="text-[11px] font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 text-slate-700">
                                                                NIDN: {r.identity_number}
                                                            </span>
                                                            {r.nik && (
                                                                <span className="text-[10px] font-mono bg-slate-50 px-1 py-0.2 rounded text-slate-500">
                                                                    NIK: {r.nik}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                                            {r.study_program} • <span className="font-mono">{r.email}</span>
                                                        </p>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase shrink-0">
                                                        {r.role === 'kaprodi' ? 'Kaprodi' : r.role === 'dosen_pa' ? 'Dosen PA' : 'Dosen'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Box 4: Catatan Akun */}
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px] flex items-center space-x-2">
                                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>Semua akun dosen otomatis dibuat aktif dengan username NIDN dan kata sandi default: <strong className="font-mono text-emerald-700">salam123</strong>.</span>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsImportOpen(false)} 
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition cursor-pointer"
                                    >
                                        Batal (ESC)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleImportSubmit}
                                        disabled={importRecords.length === 0}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                                    >
                                        Proses Impor ({importRecords.length} Dosen)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL KONFIRMASI HAPUS DOSEN */}
                {lecturerToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
                        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-4 text-white flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30">
                                        <AlertTriangle className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-tight text-white">
                                        Konfirmasi Hapus Dosen
                                    </h3>
                                </div>
                                <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                                    ESC
                                </span>
                            </div>

                            <div className="p-5 space-y-4 text-xs">
                                <p className="text-slate-700">
                                    Apakah Anda yakin ingin menghapus data dosen <strong className="text-slate-900">{lecturerToDelete.name}</strong> ({lecturerToDelete.identity_number})?
                                </p>
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px]">
                                    ⚠️ Tindakan ini akan menghapus akun login dan riwayat mengajar dosen yang bersangkutan.
                                </div>

                                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setLecturerToDelete(null)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition"
                                    >
                                        Batal (ESC)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmDelete}
                                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition shadow-xs"
                                    >
                                        Ya, Hapus Dosen
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL KONFIRMASI RESET PASSWORD */}
                {lecturerToReset && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
                        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 text-white flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                                        <KeyRound className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-tight text-white">
                                        Reset Kata Sandi Akun
                                    </h3>
                                </div>
                                <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                                    ESC
                                </span>
                            </div>

                            <div className="p-5 space-y-4 text-xs">
                                <p className="text-slate-700">
                                    Setel ulang kata sandi dosen <strong className="text-slate-900">{lecturerToReset.name}</strong> ({lecturerToReset.identity_number}) kembali ke kata sandi standar institusi?
                                </p>
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px]">
                                    🔑 Kata sandi akan diatur ke: <strong className="font-mono font-bold">salam123</strong>. Dosen dapat menggantinya setelah login.
                                </div>

                                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setLecturerToReset(null)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition"
                                    >
                                        Batal (ESC)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmResetPassword}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs"
                                    >
                                        Reset ke 'salam123'
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
