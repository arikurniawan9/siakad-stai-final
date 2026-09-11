import React, { useState, useMemo, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { 
    Database, HardDrive, Download, Trash2, RefreshCw, 
    Upload, Play, ShieldAlert, CheckCircle2, AlertTriangle, 
    Layers, FileText, Server, Users, Search, Flame, 
    ShieldCheck, Lock, AlertOctagon, Info, Eye, CheckSquare, 
    Square, Check, X, ChevronLeft, ChevronRight, Building2,
    Calendar, Sparkles, Cloud, Send, Bell
} from 'lucide-react';

export default function DatabaseIndex({ 
    tableCatalog = [], 
    totalTestRows = 0, 
    backups = [], 
    cloudStatus = {},
    telegramStatus = {},
    purgeStats = {}, 
    dbInfo = {} 
}) {
    // 1. Navigation Tab: tables | purge | backups | upload | seeders
    const [activeTab, setActiveTab] = useState('tables');

    // 2. Search & Category Filters for Table Catalog
    const [tableSearch, setTableSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all'); // all | transactional | master | log | system
    const [onlyWithRows, setOnlyWithRows] = useState(false);

    // 3. Truncate & Purge Modals
    const [truncateModal, setTruncateModal] = useState({ isOpen: false, table: null });
    const [purgeModal, setPurgeModal] = useState({ isOpen: false, module: null, title: '', description: '', affectedRows: '' });
    const [totalResetModal, setTotalResetModal] = useState({ isOpen: false, inputConfirm: '' });
    const [purgeAllExceptAdminModal, setPurgeAllExceptAdminModal] = useState({
        isOpen: false,
        inputConfirm: '',
        keepFacultiesAndPrograms: true,
        keepFeeTypes: true,
    });
    const [isPurging, setIsPurging] = useState(false);

    // 4. Data Viewer Modal (View Data in Table + Delete 1-1 or Multi)
    const [viewerModal, setViewerModal] = useState({
        isOpen: false,
        tableName: null,
        tableLabel: '',
        isLoading: false,
        data: null,
        selectedIds: [],
        searchQuery: '',
        page: 1,
    });

    // 5. Utility States (Backup, Cloud S3, Telegram & Seeder)
    const [creatingBackup, setCreatingBackup] = useState(false);
    const [backupOptions, setBackupOptions] = useState({
        encrypt: true,
        upload_cloud: true,
        notify_telegram: true,
    });
    const [testingTelegram, setTestingTelegram] = useState(false);
    const [uploadingCloud, setUploadingCloud] = useState(null);
    const [runningSeeder, setRunningSeeder] = useState(null);
    const [restoringFile, setRestoringFile] = useState(null);
    const [confirmRestoreModal, setConfirmRestoreModal] = useState({ isOpen: false, filename: null });

    const uploadForm = useForm({
        backup_file: null,
    });

    // Counts per category
    const categoryCounts = useMemo(() => {
        const counts = { all: tableCatalog.length, transactional: 0, master: 0, log: 0, system: 0 };
        tableCatalog.forEach(t => {
            if (counts[t.category] !== undefined) {
                counts[t.category]++;
            }
        });
        return counts;
    }, [tableCatalog]);

    // Filtered Table Catalog
    const filteredTables = useMemo(() => {
        return tableCatalog.filter(item => {
            if (categoryFilter !== 'all' && item.category !== categoryFilter) {
                return false;
            }
            if (onlyWithRows && item.rows === 0) {
                return false;
            }
            if (tableSearch.trim()) {
                const query = tableSearch.toLowerCase();
                const matchName = item.name.toLowerCase().includes(query);
                const matchLabel = item.label?.toLowerCase().includes(query);
                const matchDesc = item.description?.toLowerCase().includes(query);
                const matchCascade = item.cascade_detail?.toLowerCase().includes(query);
                return matchName || matchLabel || matchDesc || matchCascade;
            }
            return true;
        });
    }, [tableCatalog, categoryFilter, onlyWithRows, tableSearch]);

    // --- DATA VIEWER MODAL HANDLERS ---
    const handleOpenViewer = async (table, page = 1, search = '') => {
        setViewerModal({
            isOpen: true,
            tableName: table.name,
            tableLabel: table.label || table.name,
            isLoading: true,
            data: null,
            selectedIds: [],
            searchQuery: search,
            page: page,
        });

        try {
            const res = await fetch(`/admin/database/table-data?table=${encodeURIComponent(table.name)}&page=${page}&search=${encodeURIComponent(search)}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            const json = await res.json();
            if (json.success) {
                setViewerModal(prev => ({
                    ...prev,
                    isLoading: false,
                    data: json,
                    selectedIds: [],
                }));
            } else {
                alert(json.message || 'Gagal memuat data tabel.');
                setViewerModal(prev => ({ ...prev, isLoading: false }));
            }
        } catch (err) {
            console.error(err);
            alert('Terjadi kesalahan jaringan.');
            setViewerModal(prev => ({ ...prev, isLoading: false }));
        }
    };

    const handleSelectAllRows = () => {
        if (!viewerModal.data?.records) return;
        const pk = viewerModal.data.primary_key;
        if (!pk) return;

        const currentIds = viewerModal.data.records.map(r => r._pk || r[pk]).filter(Boolean);
        if (viewerModal.selectedIds.length === currentIds.length) {
            setViewerModal(prev => ({ ...prev, selectedIds: [] }));
        } else {
            setViewerModal(prev => ({ ...prev, selectedIds: currentIds }));
        }
    };

    const handleToggleRowSelection = (id) => {
        setViewerModal(prev => {
            const exists = prev.selectedIds.includes(id);
            return {
                ...prev,
                selectedIds: exists 
                    ? prev.selectedIds.filter(item => item !== id)
                    : [...prev.selectedIds, id]
            };
        });
    };

    const handleDeleteSingleRow = async (id) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus baris data ID #${id} dari tabel "${viewerModal.tableName}"?`)) return;
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch('/admin/database/table-data/delete-rows', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                },
                body: JSON.stringify({
                    table: viewerModal.tableName,
                    ids: [id],
                })
            });
            const json = await res.json();
            if (json.success) {
                handleOpenViewer({ name: viewerModal.tableName, label: viewerModal.tableLabel }, viewerModal.page, viewerModal.searchQuery);
                router.reload({ only: ['tableCatalog', 'totalTestRows', 'purgeStats', 'dbInfo'] });
            } else {
                alert(json.message || 'Gagal menghapus data.');
            }
        } catch (err) {
            console.error(err);
            alert('Terjadi kesalahan saat menghapus data.');
        }
    };

    const handleDeleteMultiRows = async () => {
        const count = viewerModal.selectedIds.length;
        if (count === 0) return;
        if (!confirm(`Hapus ${count} baris data terpilih dari tabel "${viewerModal.tableName}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch('/admin/database/table-data/delete-rows', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                },
                body: JSON.stringify({
                    table: viewerModal.tableName,
                    ids: viewerModal.selectedIds,
                })
            });
            const json = await res.json();
            if (json.success) {
                handleOpenViewer({ name: viewerModal.tableName, label: viewerModal.tableLabel }, viewerModal.page, viewerModal.searchQuery);
                router.reload({ only: ['tableCatalog', 'totalTestRows', 'purgeStats', 'dbInfo'] });
            } else {
                alert(json.message || 'Gagal menghapus data terpilih.');
            }
        } catch (err) {
            console.error(err);
            alert('Terjadi kesalahan saat menghapus data terpilih.');
        }
    };

    // --- TRUNCATE ACTIONS ---
    const handleOpenTruncate = (table) => {
        if (table.is_protected) return;
        setTruncateModal({ isOpen: true, table });
    };

    const handleExecuteTruncate = () => {
        if (!truncateModal.table) return;
        setIsPurging(true);
        router.post('/admin/database/truncate-table', {
            table: truncateModal.table.name
        }, {
            preserveScroll: true,
            onFinish: () => {
                setIsPurging(false);
                setTruncateModal({ isOpen: false, table: null });
            }
        });
    };

    // --- PURGE ACTIONS ---
    const handleOpenPurgeModal = (moduleKey, title, description, affectedRows) => {
        setPurgeModal({
            isOpen: true,
            module: moduleKey,
            title,
            description,
            affectedRows,
        });
    };

    const handleExecutePurge = () => {
        if (!purgeModal.module) return;
        setIsPurging(true);
        router.post('/admin/database/purge-module', {
            module: purgeModal.module,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setIsPurging(false);
                setPurgeModal({ isOpen: false, module: null, title: '', description: '', affectedRows: '' });
            },
        });
    };

    const handleExecuteTotalReset = () => {
        if (totalResetModal.inputConfirm !== 'RESET DATA PERCOBAAN') return;
        setIsPurging(true);
        router.post('/admin/database/purge-module', {
            module: 'all_test_data'
        }, {
            preserveScroll: true,
            onFinish: () => {
                setIsPurging(false);
                setTotalResetModal({ isOpen: false, inputConfirm: '' });
            }
        });
    };

    const handleExecutePurgeAllExceptAdmin = () => {
        if (purgeAllExceptAdminModal.inputConfirm !== 'HAPUS SEMUA KECUALI ADMIN') return;
        setIsPurging(true);
        router.post('/admin/database/purge-all-except-admin', {
            keep_faculties_and_programs: purgeAllExceptAdminModal.keepFacultiesAndPrograms,
            keep_fee_types: purgeAllExceptAdminModal.keepFeeTypes,
            confirm_phrase: purgeAllExceptAdminModal.inputConfirm,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setIsPurging(false);
                setPurgeAllExceptAdminModal({
                    isOpen: false,
                    inputConfirm: '',
                    keepFacultiesAndPrograms: true,
                    keepFeeTypes: true,
                });
            }
        });
    };

    // --- BACKUP & RESTORE ACTIONS ---
    const handleCreateBackup = () => {
        setCreatingBackup(true);
        router.post('/admin/database/backup', backupOptions, {
            preserveScroll: true,
            onFinish: () => setCreatingBackup(false),
        });
    };

    const handleUploadToCloud = (filename) => {
        setUploadingCloud(filename);
        router.post(`/admin/database/backup/cloud-upload/${filename}`, {}, {
            preserveScroll: true,
            onFinish: () => setUploadingCloud(null),
        });
    };

    const handleTestTelegram = () => {
        setTestingTelegram(true);
        router.post('/admin/database/telegram/test', {}, {
            preserveScroll: true,
            onFinish: () => setTestingTelegram(false),
        });
    };

    const handleDeleteBackup = (filename) => {
        if (confirm(`Apakah Anda yakin ingin menghapus file backup "${filename}" dari server?`)) {
            router.delete(`/admin/database/backup/${filename}`, {
                preserveScroll: true,
            });
        }
    };

    const handleRestoreConfirm = () => {
        if (!confirmRestoreModal.filename) return;
        setRestoringFile(confirmRestoreModal.filename);
        setConfirmRestoreModal({ isOpen: false, filename: null });

        router.post('/admin/database/restore', {
            filename: confirmRestoreModal.filename
        }, {
            preserveScroll: true,
            onFinish: () => setRestoringFile(null),
        });
    };

    const handleUploadRestore = (e) => {
        e.preventDefault();
        if (!uploadForm.data.backup_file) {
            alert('Silakan pilih file backup (.json) terlebih dahulu.');
            return;
        }

        if (confirm('PERINGATAN: Memulihkan database dari file upload akan menimpa data yang ada. Lanjutkan?')) {
            uploadForm.post('/admin/database/restore', {
                preserveScroll: true,
                onSuccess: () => uploadForm.reset(),
            });
        }
    };

    const handleRunSeeder = (type) => {
        const confirmMsg = type === 'full' 
            ? 'PERINGATAN: Menjalankan Full Master Seeder akan memperbarui data master institusi dan akun default. Lanjutkan?'
            : `Jalankan seeder untuk '${type}'?`;

        if (confirm(confirmMsg)) {
            setRunningSeeder(type);
            router.post('/admin/database/seeder', { type }, {
                preserveScroll: true,
                onFinish: () => setRunningSeeder(null),
            });
        }
    };

    return (
        <AppLayout title="Database Management & Purge">
            <Head title="Database Management & Purge" />

            <div className="space-y-5 max-w-7xl mx-auto pb-16">
                {/* 1. COMPACT HERO HEADER */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-slate-700/50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black mb-1">
                                <Database className="w-3 h-3 text-indigo-400" />
                                <span>DATABASE &amp; PURGE ENGINE TELEMETRY</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                                Database Management &amp; Pembersihan Data
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                                    Superadmin
                                </span>
                            </h2>
                            <p className="text-[11px] text-slate-300 mt-0.5 max-w-2xl">
                                Manajemen tabel PostgreSQL, pratinjau data interaktif, hapus baris satuan/massal, truncate aman per tabel, dan backup/restore.
                            </p>
                        </div>

                        {/* Quick Counters */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <div className="px-3 py-1.5 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-300">
                                <span>Tabel: <strong className="text-white font-bold">{tableCatalog.length}</strong></span>
                            </div>
                            <div className="px-3 py-1.5 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-300">
                                <span>Total Record: <strong className="text-white font-bold">{(dbInfo.total_rows || 0).toLocaleString()}</strong></span>
                            </div>
                            <div className="px-3 py-1.5 bg-rose-950/70 border border-rose-800/50 rounded-lg text-rose-200">
                                <span>Percobaan: <strong className="text-white font-bold">{totalTestRows.toLocaleString()}</strong></span>
                            </div>
                            <div className="px-3 py-1.5 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-300">
                                <span>Size: <strong className="text-white font-bold">{dbInfo.size || '0 MB'}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. TABS SWITCHER (GAYA GEDUNG & RUANG / MASTER AKADEMIK STAI) */}
                <div className="flex border-b border-slate-200 space-x-6 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('tables')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                            activeTab === 'tables'
                                ? 'border-emerald-600 text-emerald-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Database className="w-4 h-4" />
                        <span>Katalog &amp; Truncate Tabel</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'tables' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {tableCatalog.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('purge')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                            activeTab === 'purge'
                                ? 'border-rose-600 text-rose-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Flame className="w-4 h-4" />
                        <span>Pembersihan Data Percobaan (Purge Engine)</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'purge' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {totalTestRows} Baris
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('backups')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                            activeTab === 'backups'
                                ? 'border-indigo-600 text-indigo-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <HardDrive className="w-4 h-4" />
                        <span>File Backup Database</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'backups' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {backups.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('upload')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                            activeTab === 'upload'
                                ? 'border-indigo-600 text-indigo-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Upload className="w-4 h-4" />
                        <span>Upload &amp; Restore</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('seeders')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                            activeTab === 'seeders'
                                ? 'border-indigo-600 text-indigo-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Play className="w-4 h-4" />
                        <span>Database Seeder</span>
                    </button>
                </div>

                {/* ========================================================================= */}
                {/* TAB 1: KATALOG & TRUNCATE TABEL (DALAM BENTUK TABEL COMPACT) */}
                {/* ========================================================================= */}
                {activeTab === 'tables' && (
                    <div className="space-y-4">
                        {/* Search & Filter Bar */}
                        <div className="bg-white rounded-xl p-3.5 sm:p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={tableSearch}
                                    onChange={(e) => setTableSearch(e.target.value)}
                                    placeholder="Cari nama tabel (misal: pmb, invoices, krs, users) atau kata kunci..."
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                                {tableSearch && (
                                    <button
                                        type="button"
                                        onClick={() => setTableSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Category Filter Buttons */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setCategoryFilter('all')}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                                        categoryFilter === 'all' 
                                            ? 'bg-slate-900 text-white' 
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    Semua ({categoryCounts.all})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCategoryFilter('transactional')}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                                        categoryFilter === 'transactional' 
                                            ? 'bg-rose-600 text-white' 
                                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                    }`}
                                >
                                    Transaksi ({categoryCounts.transactional})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCategoryFilter('master')}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                                        categoryFilter === 'master' 
                                            ? 'bg-emerald-700 text-white' 
                                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                    }`}
                                >
                                    Master ({categoryCounts.master})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCategoryFilter('log')}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                                        categoryFilter === 'log' 
                                            ? 'bg-sky-700 text-white' 
                                            : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                                    }`}
                                >
                                    Log ({categoryCounts.log})
                                </button>

                                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100 select-none ml-1">
                                    <input
                                        type="checkbox"
                                        checked={onlyWithRows}
                                        onChange={(e) => setOnlyWithRows(e.target.checked)}
                                        className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-3.5 h-3.5"
                                    />
                                    <span>&gt; 0 baris</span>
                                </label>
                            </div>
                        </div>

                        {/* TABLE FORMAT (Compact Table Layout) */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-black tracking-wider">
                                            <th className="py-3 px-3 text-center w-12 border-r border-slate-100">#</th>
                                            <th className="py-3 px-3.5 border-r border-slate-100 min-w-[220px]">Nama Tabel &amp; Entitas</th>
                                            <th className="py-3 px-3 border-r border-slate-100 text-center w-36">Kategori</th>
                                            <th className="py-3 px-3 border-r border-slate-100 text-center w-24">Jumlah Record</th>
                                            <th className="py-3 px-3.5 border-r border-slate-100 min-w-[320px]">Rincian Data &amp; Efek Cascade</th>
                                            <th className="py-3 px-3 text-center w-40">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {filteredTables.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="py-8 text-center text-slate-400">
                                                    Tidak ada tabel yang sesuai dengan pencarian / filter Anda.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTables.map((item, idx) => {
                                                const isTransactional = item.category === 'transactional';
                                                const isMaster = item.category === 'master';
                                                const isLog = item.category === 'log';
                                                const isUsers = item.name === 'users';
                                                const hasRows = item.rows > 0;

                                                return (
                                                    <tr key={item.name} className="hover:bg-slate-50/80 transition">
                                                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-400 border-r border-slate-100">
                                                            {idx + 1}
                                                        </td>

                                                        <td className="py-2.5 px-3.5 border-r border-slate-100">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                                                                    {item.name}
                                                                </span>
                                                            </div>
                                                            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                                                                {item.label}
                                                            </span>
                                                        </td>

                                                        <td className="py-2.5 px-3 text-center border-r border-slate-100">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                                                                isTransactional
                                                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                                    : isMaster
                                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                        : isLog
                                                                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                                                                            : 'bg-slate-100 text-slate-600 border-slate-200'
                                                            }`}>
                                                                {item.category_label}
                                                            </span>
                                                        </td>

                                                        <td className="py-2.5 px-3 text-center font-mono border-r border-slate-100">
                                                            <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                                                                hasRows
                                                                    ? isTransactional
                                                                        ? 'bg-rose-100 text-rose-800'
                                                                        : 'bg-slate-100 text-slate-800'
                                                                    : 'text-slate-400'
                                                            }`}>
                                                                {item.rows.toLocaleString()}
                                                            </span>
                                                        </td>

                                                        <td className="py-2.5 px-3.5 border-r border-slate-100 leading-relaxed">
                                                            <p className="text-slate-600 line-clamp-1 font-medium">{item.description}</p>
                                                            <p className="text-[11px] text-rose-800 line-clamp-2 mt-0.5">
                                                                <strong>Cascade:</strong> {item.cascade_detail}
                                                            </p>
                                                        </td>

                                                        <td className="py-2.5 px-3 text-center">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                {/* 1. Tombol View Data Modal */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenViewer(item, 1, '')}
                                                                    className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition cursor-pointer"
                                                                    title="Lihat Data Tabel (Buka Pratinjau & Hapus Baris)"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                </button>

                                                                {/* 2. Tombol Kosongkan / Truncate */}
                                                                {item.is_protected ? (
                                                                    <span className="p-1.5 text-slate-300 cursor-not-allowed" title="Terkunci (Proteksi Migrasi)">
                                                                        <Lock className="w-3.5 h-3.5" />
                                                                    </span>
                                                                ) : !hasRows ? (
                                                                    <span className="p-1.5 text-slate-300 cursor-not-allowed" title="Tabel Kosong">
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </span>
                                                                ) : isTransactional ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOpenTruncate(item)}
                                                                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition cursor-pointer"
                                                                        title="Kosongkan Tabel (TRUNCATE CASCADE)"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                ) : isUsers ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOpenTruncate(item)}
                                                                        className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition cursor-pointer"
                                                                        title="Bersihkan Akun Mahasiswa Dummy"
                                                                    >
                                                                        <Users className="w-3.5 h-3.5" />
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOpenTruncate(item)}
                                                                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                                                                        title="Truncate Tabel (Master Data)"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 2: PEMBERSIHAN DATA PERCOBAAN (PURGE ENGINE MODUL) */}
                {/* ========================================================================= */}
                {activeTab === 'purge' && (
                    <div className="space-y-4">
                        {/* 1. ULTRA PRODUCTION PURGE: HAPUS SEMUA DATA KECUALI AKUN SUPERADMIN DAN ADMIN */}
                        <div className="bg-gradient-to-r from-red-950 via-rose-950 to-slate-950 rounded-2xl p-5 sm:p-6 text-white border-2 border-red-600/80 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
                            
                            <div className="space-y-2 relative z-10 max-w-2xl">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/30 text-red-200 rounded-full text-[10px] font-black border border-red-500/50 uppercase tracking-widest animate-pulse">
                                        <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                                        PRODUCTION CLEAN SLATE ENGINE
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-bold border border-emerald-500/30">
                                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                        Proteksi: Superadmin &amp; Admin Tetap Utuh
                                    </span>
                                </div>
                                
                                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                                    Hapus Semua Data (Kecuali Akun Superadmin &amp; Admin)
                                </h3>
                                
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Mengosongkan seluruh database untuk persiapan rilis produksi: menghapus semua akun pengguna dummy ({purgeStats.admin_protection?.users_to_delete || 0} akun mahasiswa, dosen, keuangan), seluruh transaksi PMB, invoice tagihan, KRS, nilai, jadwal, absensi, skripsi, dan LMS. 
                                    <span className="text-emerald-300 font-bold block mt-1">
                                        🛡️ HANYA akun Super Administrator ('superadmin') dan Admin Akademik ('adminakademik') yang dipertahankan.
                                    </span>
                                </p>

                                <div className="flex flex-wrap items-center gap-2.5 pt-1 text-[11px] text-slate-300">
                                    <div className="px-2.5 py-1 bg-slate-900/80 rounded-lg border border-slate-700/80 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-rose-400" />
                                        <span>Akun Dihapus: <strong className="text-rose-300 font-bold">{purgeStats.admin_protection?.users_to_delete || 0}</strong></span>
                                    </div>
                                    <div className="px-2.5 py-1 bg-slate-900/80 rounded-lg border border-slate-700/80 flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>Akun Terlindungi: <strong className="text-emerald-300 font-bold">{purgeStats.admin_protection?.preserved_admins || 2}</strong></span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setPurgeAllExceptAdminModal({
                                        isOpen: true,
                                        inputConfirm: '',
                                        keepFacultiesAndPrograms: true,
                                        keepFeeTypes: true,
                                    })}
                                    className="w-full sm:w-auto px-5 py-3 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black rounded-xl text-xs shadow-xl shadow-red-950/50 transition cursor-pointer flex items-center justify-center gap-2.5 border border-red-400/50 uppercase tracking-wider"
                                >
                                    <AlertOctagon className="w-4 h-4 text-amber-300" />
                                    <span>Hapus Semua Kecuali Admin</span>
                                </button>
                            </div>
                        </div>

                        {/* Master Reset Banner Card */}
                        <div className="bg-gradient-to-r from-red-950 via-rose-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-rose-700/60 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-500/20 text-red-300 rounded-full text-[10px] font-black border border-red-500/30 uppercase">
                                    <Flame className="w-3 h-3 text-red-400" /> Total Safe Purge
                                </span>
                                <h3 className="text-base sm:text-lg font-bold">Reset Total Seluruh Data Transaksi Percobaan</h3>
                                <p className="text-xs text-slate-300 max-w-xl">
                                    Mengosongkan seluruh data transaksi dummy (PMB, Billing, KRS, Nilai, Absensi, EDOM) sekaligus dalam 1 transaksi aman. 
                                    <strong className="text-emerald-300"> Master Data fakultas, prodi, kurikulum, matakuliah &amp; akun staf tetap utuh.</strong>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setTotalResetModal({ isOpen: true, inputConfirm: '' })}
                                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2 shrink-0 border border-red-400/40"
                            >
                                <Flame className="w-4 h-4 text-amber-300" />
                                Reset Semua Data Percobaan
                            </button>
                        </div>

                        {/* Modul Purge Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {/* 1. PMB */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-800 text-xs">1. Pendaftar PMB</span>
                                    <span className="text-xs font-mono font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                                        {purgeStats.pmb?.applicants || 0} pendaftar
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2">
                                    Hapus calon mahasiswa, berkas upload PMB, tagihan formulir &amp; transaksi VA BSI.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenPurgeModal('pmb', 'Pendaftar PMB', 'Seluruh pendaftar calon mahasiswa baru, berkas upload dokumen, invoice tagihan PMB, dan transaksi VA BSI terkait.', `${purgeStats.pmb?.applicants || 0} calon mahasiswa`)}
                                    disabled={!purgeStats.pmb?.applicants}
                                    className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Kosongkan Data PMB
                                </button>
                            </div>

                            {/* 2. Keuangan */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-800 text-xs">2. Tagihan &amp; VA Keuangan</span>
                                    <span className="text-xs font-mono font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                                        {purgeStats.finance?.invoices || 0} invoice
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2">
                                    Hapus seluruh invoice SPP/UKT, riwayat transaksi VA BSI, Winpay, dan dispensasi.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenPurgeModal('finance', 'Tagihan & Keuangan', 'Seluruh invoice tagihan mahasiswa, transaksi VA BSI, transaksi Winpay, dan dispensasi keuangan.', `${purgeStats.finance?.invoices || 0} tagihan invoice`)}
                                    disabled={!purgeStats.finance?.invoices}
                                    className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Kosongkan Data Keuangan
                                </button>
                            </div>

                            {/* 3. KRS */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-800 text-xs">3. Rencana Studi (KRS)</span>
                                    <span className="text-xs font-mono font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                                        {purgeStats.krs?.submissions || 0} pengajuan
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2">
                                    Hapus pengajuan KRS, rincian mata kuliah KRS, dan reset status mahasiswa ke Belum KRS.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenPurgeModal('krs', 'Rencana Studi (KRS)', 'Seluruh pengajuan formulir KRS, item matakuliah yang diambil, dan peserta kelas.', `${purgeStats.krs?.submissions || 0} pengajuan KRS`)}
                                    disabled={!purgeStats.krs?.submissions}
                                    className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Kosongkan Data KRS
                                </button>
                            </div>

                            {/* 4. Nilai */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-800 text-xs">4. Nilai &amp; KHS Mahasiswa</span>
                                    <span className="text-xs font-mono font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                                        {purgeStats.grades?.course_grades || 0} nilai
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2">
                                    Hapus rekapitulasi nilai perkuliahan, buku nilai DPNA, catatan KHS, dan transkrip.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenPurgeModal('grades', 'Nilai & KHS', 'Seluruh nilai perkuliahan mahasiswa, rekaman lembar KHS semester, dan transkrip kumulatif.', `${purgeStats.grades?.course_grades || 0} record nilai`)}
                                    disabled={!purgeStats.grades?.course_grades}
                                    className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Kosongkan Data Nilai
                                </button>
                            </div>

                            {/* 5. Presensi */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-800 text-xs">5. Pertemuan &amp; Presensi</span>
                                    <span className="text-xs font-mono font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                                        {purgeStats.attendance?.meetings || 0} sesi
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2">
                                    Hapus sesi pertemuan perkuliahan, PIN &amp; QR absensi, dan histori kehadiran mahasiswa.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenPurgeModal('attendance', 'Presensi Perkuliahan', 'Seluruh pertemuan kuliah dan riwayat absensi mahasiswa.', `${purgeStats.attendance?.meetings || 0} pertemuan`)}
                                    disabled={!purgeStats.attendance?.meetings}
                                    className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Kosongkan Data Presensi
                                </button>
                            </div>

                            {/* 6. Audit Log */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-800 text-xs">6. Log Aktivitas Audit</span>
                                    <span className="text-xs font-mono font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200">
                                        {purgeStats.audit_logs?.total || 0} log
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2">
                                    Hapus riwayat rekam jejak aktivitas audit sistem untuk efisiensi ruang database.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenPurgeModal('audit_logs', 'Audit Logs', 'Seluruh riwayat catatan aktivitas login dan eksekusi modul.', `${purgeStats.audit_logs?.total || 0} log`)}
                                    disabled={!purgeStats.audit_logs?.total}
                                    className="w-full py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-lg text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Bersihkan Audit Log
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 3: FILE BACKUP DATABASE (S3 CLOUD & TELEGRAM SENTINEL) */}
                {/* ========================================================================= */}
                {activeTab === 'backups' && (
                    <div className="space-y-4">
                        {/* Telemetri Cloud Storage & Telegram Sentinel */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Card 1: Cloud Storage (S3 / MinIO / R2) */}
                            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 border border-indigo-800/40 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                    <Cloud className="w-24 h-24 text-white" />
                                </div>
                                <div className="flex items-start justify-between relative z-10 gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                                            <Cloud className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">Cloud Storage Archiving</h4>
                                            <p className="text-sm font-black text-white">{cloudStatus?.provider || 'S3 Compatible Storage'}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                        cloudStatus?.is_configured 
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                                    }`}>
                                        {cloudStatus?.mode === 'LIVE_CLOUD' ? 'S3 Production Terhubung' : 'Staging Cloud Aktif'}
                                    </span>
                                </div>
                                <div className="mt-4 pt-3 border-t border-indigo-800/40 flex items-center justify-between text-xs text-indigo-200/80">
                                    <div>
                                        <span className="text-[11px] text-indigo-400 block">Target Bucket:</span>
                                        <span className="font-mono font-bold text-white text-xs">{cloudStatus?.bucket || 'stai-siakad-backups'}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[11px] text-indigo-400 block">Region:</span>
                                        <span className="font-mono font-bold text-white text-xs">{cloudStatus?.region || 'us-east-1'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Telegram Sentinel Bot */}
                            <div className="bg-gradient-to-br from-sky-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 border border-sky-800/40 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                    <Send className="w-24 h-24 text-white" />
                                </div>
                                <div className="flex items-start justify-between relative z-10 gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
                                            <Bell className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">Telegram Sentinel Bot</h4>
                                            <p className="text-sm font-black text-white">
                                                {telegramStatus?.is_configured ? 'Sentinel Aktif (Real-time)' : 'Audit Sentinel (Simulasi)'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleTestTelegram}
                                        disabled={testingTelegram}
                                        className="px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-[10px] transition cursor-pointer disabled:opacity-50 flex items-center gap-1 shrink-0"
                                    >
                                        <Send className="w-3 h-3" />
                                        {testingTelegram ? 'Menguji...' : 'Uji Bot'}
                                    </button>
                                </div>
                                <div className="mt-4 pt-3 border-t border-sky-800/40 flex items-center justify-between text-xs text-sky-200/80">
                                    <div>
                                        <span className="text-[11px] text-sky-400 block">Target Channel / Chat ID:</span>
                                        <span className="font-mono font-bold text-white text-xs">{telegramStatus?.chat_id || 'Chat ID Default (Audit)'}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[11px] text-sky-400 block">Status Sentinel:</span>
                                        <span className="inline-flex items-center gap-1 font-bold text-emerald-400 text-xs">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                            Siaga 24/7
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Panel Buat Cadangan Database Baru */}
                        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <Database className="w-4 h-4 text-indigo-600" />
                                        Pencadangan Database Komprehensif
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Membuat snapshot seluruh tabel data institusi, transaksi akademik, dan keuangan ke arsip terkompresi.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                    <button
                                        type="button"
                                        onClick={handleCreateBackup}
                                        disabled={creatingBackup}
                                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-sm shrink-0"
                                    >
                                        <Download className="w-4 h-4" />
                                        {creatingBackup ? 'Memproses Cadangan...' : 'Cadangkan Database Sekarang'}
                                    </button>
                                </div>
                            </div>

                            {/* Opsi Tambahan Pencadangan */}
                            <div className="pt-3 border-t border-slate-100 flex items-center gap-4 flex-wrap text-xs text-slate-600">
                                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={backupOptions.encrypt}
                                        onChange={(e) => setBackupOptions({ ...backupOptions, encrypt: e.target.checked })}
                                        className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4"
                                    />
                                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                                        Enkripsi AES-256-CBC (Standar Audit ISO 27001)
                                    </span>
                                </label>

                                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={backupOptions.upload_cloud}
                                        onChange={(e) => setBackupOptions({ ...backupOptions, upload_cloud: e.target.checked })}
                                        className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4"
                                    />
                                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                                        <Cloud className="w-3.5 h-3.5 text-indigo-600" />
                                        Sinkronkan ke Cloud Storage
                                    </span>
                                </label>

                                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={backupOptions.notify_telegram}
                                        onChange={(e) => setBackupOptions({ ...backupOptions, notify_telegram: e.target.checked })}
                                        className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4"
                                    />
                                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                                        <Send className="w-3.5 h-3.5 text-sky-600" />
                                        Kirim Notifikasi Telegram Sentinel
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Tabel Daftar Berkas Cadangan */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700">Daftar Berkas Cadangan Tersimpan ({backups.length} Arsip)</span>
                                <span className="text-[11px] text-slate-400">Retensi Otomatis: 14 arsip terbaru</span>
                            </div>

                            {backups.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-xs">
                                    Belum ada file backup database yang dibuat di server. Klik tombol &quot;Cadangkan Database Sekarang&quot; di atas untuk membuat cadangan pertama.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {backups.map((b) => (
                                        <div key={b.filename} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/80 transition">
                                            <div className="min-w-0 space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono font-bold text-slate-900 text-xs truncate">{b.filename}</span>
                                                    {b.is_encrypted ? (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                                            <Lock className="w-2.5 h-2.5" />
                                                            AES-256
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                            Plain JSON
                                                        </span>
                                                    )}
                                                    {b.is_cloud_synced ? (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                                                            <Cloud className="w-2.5 h-2.5" />
                                                            Cloud Synced
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                                            Lokal Server
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-slate-400 block">
                                                    Dibuat: {b.created_at} • Ukuran: {b.size_formatted || `${b.size_kb} KB`}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                                {!b.is_cloud_synced && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUploadToCloud(b.filename)}
                                                        disabled={uploadingCloud === b.filename}
                                                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1"
                                                        title="Unggah ke Cloud Storage"
                                                    >
                                                        <Cloud className="w-3.5 h-3.5" />
                                                        {uploadingCloud === b.filename ? 'Mengunggah...' : 'Upload Cloud'}
                                                    </button>
                                                )}
                                                <a
                                                    href={`/admin/database/download/${b.filename}`}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                    title="Download Arsip"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmRestoreModal({ isOpen: true, filename: b.filename })}
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                                                    title="Pulihkan Database dari Arsip Ini"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteBackup(b.filename)}
                                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                    title="Hapus File Cadangan"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 4: UPLOAD & RESTORE MANUAL */}
                {/* ========================================================================= */}
                {activeTab === 'upload' && (
                    <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
                                <Upload className="w-5 h-5" />
                            </span>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Upload &amp; Restore Database (.json)</h3>
                                <p className="text-xs text-slate-500">Pilih file backup yang sebelumnya telah Anda unduh dari SIAKAD.</p>
                            </div>
                        </div>

                        <form onSubmit={handleUploadRestore} className="space-y-4 pt-2">
                            <input
                                type="file"
                                accept=".json"
                                onChange={(e) => uploadForm.setData('backup_file', e.target.files[0])}
                                className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                            />
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                                ⚠️ <strong>PERINGATAN:</strong> Memulihkan database dari file akan menimpa seluruh data tabel yang ada. Pastikan file backup valid.
                            </div>
                            <button
                                type="submit"
                                disabled={uploadForm.processing || !uploadForm.data.backup_file}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                {uploadForm.processing ? 'Memulihkan Database...' : 'Mulai Restore Data'}
                            </button>
                        </form>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 5: DATABASE SEEDER */}
                {/* ========================================================================= */}
                {activeTab === 'seeders' && (
                    <div className="space-y-4 max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
                                    <Play className="w-5 h-5" />
                                </span>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Jalankan Database Seeder</h3>
                                    <p className="text-xs text-slate-500">Inisialisasi data master atau generate data dummy untuk keperluan pengujian sistem.</p>
                                </div>
                            </div>

                            <div className="space-y-2.5 pt-2">
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                                    <div>
                                        <strong className="text-slate-900 block">Seeder Kurikulum OBE &amp; Matakuliah</strong>
                                        <span className="text-slate-500 text-[11px]">Memperbarui master kurikulum OBE 5 prodi &amp; 38 matakuliah.</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRunSeeder('curriculum')}
                                        disabled={runningSeeder !== null}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition cursor-pointer shrink-0"
                                    >
                                        Jalankan
                                    </button>
                                </div>

                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                                    <div>
                                        <strong className="text-slate-900 block">Generate 5 Calon Mahasiswa PMB</strong>
                                        <span className="text-slate-500 text-[11px]">Membuat 5 pendaftar dummy lengkap dengan invoice &amp; VA BSI.</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRunSeeder('pmb')}
                                        disabled={runningSeeder !== null}
                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs transition cursor-pointer shrink-0"
                                    >
                                        Generate
                                    </button>
                                </div>

                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                                    <div>
                                        <strong className="text-slate-900 block">Generate Tagihan SPP Mahasiswa</strong>
                                        <span className="text-slate-500 text-[11px]">Menerbitkan invoice SPP &amp; VA BSI untuk seluruh akun mahasiswa.</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRunSeeder('finance')}
                                        disabled={runningSeeder !== null}
                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs transition cursor-pointer shrink-0"
                                    >
                                        Generate
                                    </button>
                                </div>

                                <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl flex items-center justify-between gap-3 text-xs mt-3">
                                    <div>
                                        <strong className="text-indigo-950 block">Full Master Database Seeder</strong>
                                        <span className="text-indigo-700 text-[11px]">Mengisi master fakultas, prodi, kurikulum, matakuliah, gedung, ruang, dan akun staf default.</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRunSeeder('full')}
                                        disabled={runningSeeder !== null}
                                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition cursor-pointer shrink-0"
                                    >
                                        Full Seeder
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* MODAL 1: PRATINJAU DATA TABEL (VIEW DATA + HAPUS 1-1 / HAPUS MULTI) */}
            {/* ========================================================================= */}
            {viewerModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
                            <div className="flex items-center gap-3">
                                <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                                    <Database className="w-5 h-5" />
                                </span>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                                            Data Tabel: <span className="font-mono text-indigo-600 font-bold">{viewerModal.tableName}</span>
                                        </h3>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                                            {viewerModal.data?.total || 0} Total Record
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        {viewerModal.tableLabel} • Pratinjau isi tabel dan kelola data (hapus satuan / hapus multi).
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setViewerModal(prev => ({ ...prev, isOpen: false, data: null, selectedIds: [] }))}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search & Bulk Action Bar Inside Modal */}
                        <div className="p-3.5 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={viewerModal.searchQuery}
                                    onChange={(e) => {
                                        const q = e.target.value;
                                        setViewerModal(prev => ({ ...prev, searchQuery: q }));
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleOpenViewer({ name: viewerModal.tableName, label: viewerModal.tableLabel }, 1, viewerModal.searchQuery);
                                        }
                                    }}
                                    placeholder="Cari data di tabel ini... (tekan Enter)"
                                    className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Multi-Delete Bar */}
                            <div className="flex items-center gap-2 shrink-0">
                                {viewerModal.selectedIds.length > 0 ? (
                                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl animate-in fade-in">
                                        <span className="text-xs font-bold text-rose-800">
                                            {viewerModal.selectedIds.length} baris dipilih
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleDeleteMultiRows}
                                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Hapus Terpilih
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleOpenViewer({ name: viewerModal.tableName, label: viewerModal.tableLabel }, viewerModal.page, viewerModal.searchQuery)}
                                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                        title="Segarkan Data"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Table Content */}
                        <div className="flex-1 overflow-auto p-4">
                            {viewerModal.isLoading ? (
                                <div className="py-16 text-center text-slate-400">
                                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
                                    <p className="text-xs font-medium">Memuat baris data tabel...</p>
                                </div>
                            ) : !viewerModal.data?.records || viewerModal.data.records.length === 0 ? (
                                <div className="py-16 text-center text-slate-400">
                                    <Database className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                    <p className="text-xs font-semibold text-slate-600">Tabel ini saat ini kosong atau tidak ada data yang cocok.</p>
                                </div>
                            ) : (
                                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider">
                                                {/* Checkbox Select All */}
                                                <th className="py-2.5 px-3 text-center w-10 border-r border-slate-200">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            viewerModal.data.records.length > 0 &&
                                                            viewerModal.selectedIds.length === viewerModal.data.records.length
                                                        }
                                                        onChange={handleSelectAllRows}
                                                        className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-3.5 h-3.5 cursor-pointer"
                                                        title="Pilih Semua di Halaman Ini"
                                                    />
                                                </th>

                                                {/* Dynamic Column Headers */}
                                                {viewerModal.data.columns.map((col) => (
                                                    <th key={col} className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap font-mono">
                                                        {col}
                                                    </th>
                                                ))}

                                                {/* Action Column */}
                                                <th className="py-2.5 px-3 text-center w-16 whitespace-nowrap">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-sans">
                                            {viewerModal.data.records.map((row, rIdx) => {
                                                const pkVal = row._pk || row[viewerModal.data.primary_key];
                                                const isSelected = viewerModal.selectedIds.includes(pkVal);

                                                return (
                                                    <tr 
                                                        key={pkVal || rIdx} 
                                                        className={`transition ${isSelected ? 'bg-indigo-50/70' : 'hover:bg-slate-50/70'}`}
                                                    >
                                                        {/* Checkbox per row */}
                                                        <td className="py-2 px-3 text-center border-r border-slate-100">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => handleToggleRowSelection(pkVal)}
                                                                className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-3.5 h-3.5 cursor-pointer"
                                                            />
                                                        </td>

                                                        {/* Dynamic Cell Values */}
                                                        {viewerModal.data.columns.map((col) => {
                                                            const val = row[col];
                                                            return (
                                                                <td key={col} className="py-2 px-3 border-r border-slate-100 font-mono text-[11px] text-slate-800 max-w-[200px] truncate">
                                                                    {val !== null && val !== undefined ? String(val) : <span className="text-slate-300 italic">-</span>}
                                                                </td>
                                                            );
                                                        })}

                                                        {/* Delete 1-1 Button */}
                                                        <td className="py-2 px-3 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteSingleRow(pkVal)}
                                                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition cursor-pointer"
                                                                title={`Hapus baris data ID #${pkVal}`}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer / Pagination */}
                        {viewerModal.data && viewerModal.data.total > 0 && (
                            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                                <div>
                                    <span>Menampilkan halaman <strong>{viewerModal.data.current_page}</strong> dari <strong>{viewerModal.data.last_page}</strong> (Total <strong>{viewerModal.data.total}</strong> data)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        disabled={viewerModal.data.current_page <= 1}
                                        onClick={() => handleOpenViewer({ name: viewerModal.tableName, label: viewerModal.tableLabel }, viewerModal.data.current_page - 1, viewerModal.searchQuery)}
                                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        disabled={viewerModal.data.current_page >= viewerModal.data.last_page}
                                        onClick={() => handleOpenViewer({ name: viewerModal.tableName, label: viewerModal.tableLabel }, viewerModal.data.current_page + 1, viewerModal.searchQuery)}
                                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 2: KONFIRMASI KOSONGKAN TABEL (TRUNCATE CASCADE) */}
            {/* ========================================================================= */}
            {truncateModal.isOpen && truncateModal.table && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-3.5">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                                <AlertOctagon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    Kosongkan Tabel <span className="font-mono text-rose-600">{truncateModal.table.name}</span>
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {truncateModal.table.label} • {truncateModal.table.rows.toLocaleString()} baris data
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2 border border-slate-200 text-slate-700">
                            <div>
                                <strong className="text-slate-900 block">Fungsi Data:</strong>
                                <p className="text-slate-600 text-[11px]">{truncateModal.table.description}</p>
                            </div>
                            <div className="pt-2 border-t border-slate-200">
                                <strong className="text-rose-700 block text-[11px]">Dampak &amp; Relasi yang Ikut Dihapus (Cascade):</strong>
                                <p className="text-rose-900 text-[11px] font-medium leading-relaxed">{truncateModal.table.cascade_detail}</p>
                            </div>
                            {truncateModal.table.name === 'users' && (
                                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-[11px] font-medium">
                                    🛡️ Akun Superadmin aktif dan dosen/staf Anda dilindungi dan TIDAK akan terhapus.
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setTruncateModal({ isOpen: false, table: null })}
                                disabled={isPurging}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleExecuteTruncate}
                                disabled={isPurging}
                                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5"
                            >
                                {isPurging ? 'Sedang Mengosongkan...' : 'Ya, Kosongkan Tabel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL: HAPUS SEMUA DATA KECUALI AKUN SUPERADMIN DAN ADMIN */}
            {/* ========================================================================= */}
            {purgeAllExceptAdminModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-red-300 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start gap-3">
                            <div className="p-3 bg-red-100 text-red-600 rounded-xl shrink-0">
                                <AlertOctagon className="w-7 h-7 text-red-600 animate-pulse" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 font-black text-[9px] uppercase tracking-wider rounded">Tindakan Irreversibel</span>
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[9px] uppercase tracking-wider rounded">Admin Safe</span>
                                </div>
                                <h3 className="text-base font-black text-slate-900 mt-1">Hapus Semua Data Kecuali Superadmin &amp; Admin</h3>
                                <p className="text-xs text-slate-600 mt-0.5">
                                    Pembersihan total sistem untuk persiapan rilis produksi (Clean Slate Production).
                                </p>
                            </div>
                        </div>

                        {/* Impact Comparison Box */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {/* Dipertahankan */}
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                                <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px] uppercase tracking-wider">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    <span>Tetap Aman &amp; Utuh</span>
                                </div>
                                <ul className="space-y-1 text-slate-700 text-[11px]">
                                    <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                        <span><strong>Akun Superadmin</strong> ('superadmin')</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                        <span><strong>Akun Admin</strong> ('adminakademik')</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                        <span>Pengaturan Sistem &amp; Logo Portal</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                        <span>Skema &amp; Migrasi Database</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                        <span>Sesi Login Anda (Tidak logout)</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Dihapus Total */}
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                                <div className="flex items-center gap-1.5 font-bold text-rose-800 text-[11px] uppercase tracking-wider">
                                    <Trash2 className="w-4 h-4 text-rose-600" />
                                    <span>Dihapus Total (Bersih)</span>
                                </div>
                                <ul className="space-y-1 text-slate-700 text-[11px]">
                                    <li className="flex items-start gap-1.5">
                                        <X className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                        <span>Akun Mahasiswa, Dosen, Kaprodi, Keuangan</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <X className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                        <span>KRS, KHS, Nilai, Transkrip &amp; Bobot</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <X className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                        <span>Tagihan Invoice, VA BSI &amp; Winpay</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <X className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                        <span>Jadwal, Kelas, Absensi, Sesi Kuliah, LMS</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <X className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                        <span>PMB, Skripsi, Yudisium, EDOM, Audit Log</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Opsi Tambahan Checkbox */}
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Opsi Struktur Master:</span>
                            
                            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-medium">
                                <input 
                                    type="checkbox"
                                    checked={purgeAllExceptAdminModal.keepFacultiesAndPrograms}
                                    onChange={(e) => setPurgeAllExceptAdminModal(prev => ({ ...prev, keepFacultiesAndPrograms: e.target.checked }))}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                />
                                <span>Pertahankan Struktur Fakultas &amp; Program Studi (FTK, FEB, FDK, PIAUD, MPI, ES, BKI)</span>
                            </label>

                            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-medium">
                                <input 
                                    type="checkbox"
                                    checked={purgeAllExceptAdminModal.keepFeeTypes}
                                    onChange={(e) => setPurgeAllExceptAdminModal(prev => ({ ...prev, keepFeeTypes: e.target.checked }))}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                />
                                <span>Pertahankan Standar Master Jenis Biaya Keuangan (SPP, Formulir PMB)</span>
                            </label>
                        </div>

                        {/* Input konfirmasi */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700">
                                Ketik teks konfirmasi untuk menyetujui: <span className="font-mono text-red-600 font-black select-all">HAPUS SEMUA KECUALI ADMIN</span>
                            </label>
                            <input
                                type="text"
                                value={purgeAllExceptAdminModal.inputConfirm}
                                onChange={(e) => setPurgeAllExceptAdminModal(prev => ({ ...prev, inputConfirm: e.target.value }))}
                                placeholder="HAPUS SEMUA KECUALI ADMIN"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-red-700 tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                            />
                        </div>

                        {/* Tombol aksi */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setPurgeAllExceptAdminModal(prev => ({ ...prev, isOpen: false, inputConfirm: '' }))}
                                disabled={isPurging}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleExecutePurgeAllExceptAdmin}
                                disabled={isPurging || purgeAllExceptAdminModal.inputConfirm !== 'HAPUS SEMUA KECUALI ADMIN'}
                                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                                {isPurging ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Sedang Menghapus Database...</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertOctagon className="w-3.5 h-3.5" />
                                        <span>Hapus Semua Data Sekarang</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 3: TOTAL RESET DATA PERCOBAAN */}
            {/* ========================================================================= */}
            {totalResetModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-rose-200 space-y-3.5">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                                <Flame className="w-6 h-6 animate-bounce" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Reset Total Data Percobaan</h3>
                                <p className="text-xs text-slate-500">Membersihkan seluruh data transaksi dummy sekaligus.</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2 border border-slate-200 text-slate-700">
                            <p className="text-[11px] text-slate-600">
                                Seluruh data pendaftar PMB, tagihan invoice, KRS, nilai perkuliahan, presensi, kuesioner EDOM, dan mahasiswa dummy akan dikosongkan.
                            </p>
                            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-[11px] font-medium">
                                🛡️ <strong>MASTER DATA AMAN:</strong> Fakultas, Program Studi, Kurikulum, Matakuliah, Ruang, Periode Semester &amp; Akun Staf tetap utuh.
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700">
                                Ketik <span className="font-mono text-rose-600 bg-rose-50 px-1 py-0.5 rounded border border-rose-200 select-all">RESET DATA PERCOBAAN</span>:
                            </label>
                            <input
                                type="text"
                                value={totalResetModal.inputConfirm}
                                onChange={(e) => setTotalResetModal(prev => ({ ...prev, inputConfirm: e.target.value }))}
                                placeholder="RESET DATA PERCOBAAN"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-rose-700 tracking-wider focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setTotalResetModal({ isOpen: false, inputConfirm: '' })}
                                disabled={isPurging}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleExecuteTotalReset}
                                disabled={isPurging || totalResetModal.inputConfirm !== 'RESET DATA PERCOBAAN'}
                                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isPurging ? 'Sedang Mereset...' : 'Konfirmasi Reset Total'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 4: PURGE MODUL INDIVIDUAL */}
            {/* ========================================================================= */}
            {purgeModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-3.5">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Pembersihan Modul: {purgeModal.title}</h3>
                                <p className="text-xs text-slate-500">Target data: {purgeModal.affectedRows}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-200 text-slate-700">
                            <strong className="text-slate-900 block">Data yang Dihapus:</strong>
                            <p className="text-[11px] text-slate-600 leading-relaxed">{purgeModal.description}</p>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setPurgeModal({ isOpen: false, module: null, title: '', description: '', affectedRows: '' })}
                                disabled={isPurging}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleExecutePurge}
                                disabled={isPurging}
                                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1"
                            >
                                {isPurging ? 'Sedang Membersihkan...' : 'Ya, Bersihkan Modul Ini'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 5: KONFIRMASI RESTORE BACKUP */}
            {confirmRestoreModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-3.5">
                        <h3 className="text-sm font-bold text-slate-900">Konfirmasi Restore Database</h3>
                        <p className="text-xs text-slate-600">
                            Memulihkan database dari file <strong className="font-mono text-slate-900">{confirmRestoreModal.filename}</strong>? Tindakan ini akan menimpa data yang ada saat ini.
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setConfirmRestoreModal({ isOpen: false, filename: null })}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleRestoreConfirm}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                            >
                                Ya, Lakukan Restore
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
