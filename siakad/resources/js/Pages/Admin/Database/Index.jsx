import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { 
    Database, HardDrive, Download, Trash2, RefreshCw, 
    Upload, Play, ShieldAlert, CheckCircle2, AlertTriangle, 
    Layers, Sparkles, FileText, Calendar, Server, Clock, 
    Users, CreditCard, School, ChevronRight, X
} from 'lucide-react';

export default function DatabaseIndex({ backups, tableStats, dbInfo }) {
    const [activeTab, setActiveTab] = useState('backups'); // backups | upload | seeders | tables
    const [creatingBackup, setCreatingBackup] = useState(false);
    const [runningSeeder, setRunningSeeder] = useState(null);
    const [restoringFile, setRestoringFile] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, filename: null });

    const uploadForm = useForm({
        backup_file: null,
    });

    const handleCreateBackup = () => {
        setCreatingBackup(true);
        router.post('/admin/database/backup', {}, {
            preserveScroll: true,
            onFinish: () => setCreatingBackup(false),
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
        if (!confirmModal.filename) return;
        setRestoringFile(confirmModal.filename);
        setConfirmModal({ isOpen: false, filename: null });

        router.post('/admin/database/restore', {
            filename: confirmModal.filename
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

        if (confirm('PERINGATAN: Memulihkan database dari file upload akan menimpa seluruh data saat ini. Lanjutkan?')) {
            uploadForm.post('/admin/database/restore', {
                preserveScroll: true,
                onSuccess: () => uploadForm.reset(),
            });
        }
    };

    const handleRunSeeder = (type) => {
        const confirmMsg = type === 'full' 
            ? 'PERINGATAN: Menjalankan Full Master Seeder akan memperbarui data master dan akun default. Lanjutkan?'
            : `Jalankan seeder untuk '${type}'?`;

        if (confirm(confirmMsg)) {
            setRunningSeeder(type);
            router.post('/admin/database/seeder', { type }, {
                preserveScroll: true,
                onFinish: () => setRunningSeeder(null),
            });
        }
    };

    const seederModules = [
        {
            type: 'full',
            title: 'Full Master & Dummy Seeder',
            description: 'Memperbarui data 7 Role User, Fakultas, 7 Program Studi, Kurikulum OBE, Gedung, Ruang, dan Pengaturan Sistem.',
            icon: Sparkles,
            color: 'emerald',
            badge: 'Rekomendasi Awal',
        },
        {
            type: 'pmb',
            title: 'PMB & Virtual Account Generator',
            description: 'Generate 5 calon mahasiswa baru otomatis lengkap dengan nomor registrasi, invoice biaya PMB, dan nomor VA BSI (9928).',
            icon: Users,
            color: 'blue',
            badge: 'Testing PMB & VA',
        },
        {
            type: 'finance',
            title: 'Tagihan SPP & Keuangan Mahasiswa',
            description: 'Generate tagihan SPP semester ganjil untuk seluruh mahasiswa aktif lengkap dengan VA BSI.',
            icon: CreditCard,
            color: 'purple',
            badge: 'Testing Billing & Keuangan',
        },
        {
            type: 'curriculum',
            title: 'Kurikulum OBE & Master Matakuliah',
            description: 'Seed struktur kurikulum OBE terbaru, sebaran beban SKS wajib & pilihan, dan daftar mata kuliah per program studi.',
            icon: School,
            color: 'amber',
            badge: 'Testing Akademik',
        },
    ];

    return (
        <AppLayout title="Manajemen Database, Backup & Seeder">
            <Head title="Database & Backup" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-900/50 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div className="flex items-center space-x-4">
                        <div className="p-3.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-2xl shrink-0">
                            <Database className="w-7 h-7 text-indigo-400" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-300 rounded-full font-black text-[10px] uppercase tracking-wider border border-indigo-400/40">
                                    KHUSUS SUPERADMIN
                                </span>
                                <span className="text-[11px] text-slate-400">PostgreSQL Driver</span>
                            </div>
                            <h2 className="text-xl font-black tracking-tight text-white mt-1">
                                Manajemen Database, Backup & Seeder Data
                            </h2>
                            <p className="text-xs text-indigo-200 mt-0.5 max-w-xl">
                                Kelola cadangan snapshot database (.json), pemulihan data (restore), penghapusan backup, serta generator data seeder untuk lingkungan pengembangan.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                        <button
                            type="button"
                            disabled={creatingBackup}
                            onClick={handleCreateBackup}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-black transition shadow-lg shadow-indigo-600/30 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                        >
                            <HardDrive className={`w-4 h-4 text-indigo-200 ${creatingBackup ? 'animate-spin' : ''}`} />
                            <span>{creatingBackup ? 'Membuat Snapshot...' : '+ Buat Backup Database Sekarang'}</span>
                        </button>
                    </div>
                </div>

                {/* Database Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Nama Database</p>
                        <p className="text-sm font-black text-slate-900 font-mono mt-0.5">{dbInfo.database}</p>
                        <p className="text-[10px] text-emerald-600 font-bold mt-1">🟢 Host: {dbInfo.host}:{dbInfo.port}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Ukuran Database</p>
                        <p className="text-base font-black text-indigo-950 mt-0.5">{dbInfo.size}</p>
                        <p className="text-[10px] text-slate-500 mt-1">Storage PostgreSQL</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Total Tabel Terdaftar</p>
                        <p className="text-base font-black text-slate-900 mt-0.5">{dbInfo.total_tables} Tabel</p>
                        <p className="text-[10px] text-slate-500 mt-1">Struktur Skema SIAKAD</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Total Baris Record</p>
                        <p className="text-base font-black text-emerald-700 mt-0.5">{dbInfo.total_rows.toLocaleString('id-ID')} Baris</p>
                        <p className="text-[10px] text-slate-500 mt-1">{backups.length} File Backup Tersedia</p>
                    </div>
                </div>

                {/* Auto Backup Scheduler Status Card */}
                <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-4 rounded-2xl border border-emerald-800/40 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
                            <Clock className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h4 className="text-xs font-black text-white uppercase tracking-wider">Jadwal Pencadangan Otomatis (Auto Backup Scheduler)</h4>
                                <span className="px-2 py-0.2 bg-emerald-500 text-slate-950 rounded font-black text-[9px]">AKTIF</span>
                            </div>
                            <p className="text-[11px] text-emerald-200 mt-0.5">
                                Pencadangan snapshot JSON berjalan otomatis setiap hari pukul <strong>01:00 WIB</strong> via cron scheduler dengan kebijakan retensi <strong>14 arsip terbaru</strong>.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                        <span className="px-3 py-1 bg-white/10 text-emerald-300 rounded-lg text-[10px] font-mono font-bold">
                            Retensi: 14 Snapshot
                        </span>
                    </div>
                </div>

                {/* TAB CONTROLS */}
                <div className="flex border-b border-slate-200 space-x-2 bg-slate-100/60 p-1.5 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('backups')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                            activeTab === 'backups'
                                ? 'bg-white text-indigo-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <HardDrive className="w-4 h-4" />
                        <span>Daftar File Backup ({backups.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                            activeTab === 'upload'
                                ? 'bg-white text-indigo-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Upload className="w-4 h-4" />
                        <span>Upload & Restore File</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('seeders')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                            activeTab === 'seeders'
                                ? 'bg-white text-indigo-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Database Seeder & Generator</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('tables')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                            activeTab === 'tables'
                                ? 'bg-white text-indigo-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Layers className="w-4 h-4" />
                        <span>Katalog Tabel ({tableStats.length})</span>
                    </button>
                </div>

                {/* ========================================================================= */}
                {/* TAB 1: DAFTAR FILE BACKUP */}
                {/* ========================================================================= */}
                {activeTab === 'backups' && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                            <div>
                                <h3 className="font-bold text-xs text-slate-900">Arsip File Backup Server</h3>
                                <p className="text-[11px] text-slate-500">Tersimpan di direktori storage/app/backups</p>
                            </div>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                                {backups.length} File Tersimpan
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                                        <th className="py-3 px-4 w-12 text-center">No.</th>
                                        <th className="py-3 px-4">Nama File Backup</th>
                                        <th className="py-3 px-3 text-center">Ukuran</th>
                                        <th className="py-3 px-4 text-center">Jumlah Data</th>
                                        <th className="py-3 px-4">Waktu Pembuatan</th>
                                        <th className="py-3 px-4 text-center w-52">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {backups.length > 0 ? (
                                        backups.map((item, idx) => (
                                            <tr key={item.filename} className="hover:bg-slate-50/60 transition">
                                                <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                                                    {idx + 1}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center space-x-2">
                                                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                                                        <span className="font-mono font-bold text-slate-900">
                                                            {item.filename}
                                                        </span>
                                                    </div>
                                                    {item.meta?.created_by && (
                                                        <p className="text-[10px] text-slate-400 mt-0.5">Dibuat oleh: <strong className="text-slate-600">{item.meta.created_by}</strong></p>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-3 text-center font-bold text-slate-700">
                                                    {item.size_mb > 1 ? `${item.size_mb} MB` : `${item.size_kb} KB`}
                                                </td>

                                                <td className="py-3.5 px-4 text-center text-slate-700">
                                                    <span className="px-2 py-0.5 bg-slate-100 rounded-md font-bold text-[11px]">
                                                        {item.meta?.total_rows ? `${item.meta.total_rows.toLocaleString('id-ID')} Baris` : '-'}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4 text-slate-600">
                                                    <div className="flex items-center space-x-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>{item.created_at}</span>
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4 text-center">
                                                    <div className="flex items-center justify-center space-x-1.5">
                                                        {/* Download */}
                                                        <a
                                                            href={`/admin/database/download/${item.filename}`}
                                                            className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition flex items-center space-x-1 text-[11px] font-bold"
                                                            title="Download File Backup"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                            <span>Unduh</span>
                                                        </a>

                                                        {/* Restore */}
                                                        <button
                                                            type="button"
                                                            disabled={restoringFile === item.filename}
                                                            onClick={() => setConfirmModal({ isOpen: true, filename: item.filename })}
                                                            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition flex items-center space-x-1 text-[11px] font-bold cursor-pointer"
                                                            title="Restore Database dari File Ini"
                                                        >
                                                            <RefreshCw className={`w-3.5 h-3.5 ${restoringFile === item.filename ? 'animate-spin' : ''}`} />
                                                            <span>Pulihkan</span>
                                                        </button>

                                                        {/* Delete */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteBackup(item.filename)}
                                                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition flex items-center space-x-1 text-[11px] font-bold cursor-pointer"
                                                            title="Hapus File Backup"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="py-12 text-center text-slate-400">
                                                Belum ada file backup yang dibuat. Klik tombol <strong>"+ Buat Backup Database Sekarang"</strong> di atas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 2: UPLOAD & RESTORE MANUAL */}
                {/* ========================================================================= */}
                {activeTab === 'upload' && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
                        <div>
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-base text-slate-900">Upload & Restore File Backup</h3>
                                    <p className="text-xs text-slate-500">Unggah file backup .json dari komputer lokal untuk memulihkan basis data.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold">Peringatan Keamanan Database:</p>
                                <p className="text-[11px] mt-0.5">
                                    Proses restore akan menghapus dan menimpa data yang ada saat ini dengan data dari file backup. Pastikan Anda telah membuat backup snapshot terbaru sebelum melakukan restore.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleUploadRestore} className="space-y-4">
                            <div>
                                <label className="block font-bold text-slate-700 text-xs mb-1">
                                    Pilih File Backup (.json):
                                </label>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={(e) => uploadForm.setData('backup_file', e.target.files[0])}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                                    required
                                />
                                {uploadForm.errors.backup_file && (
                                    <p className="text-rose-600 font-bold text-[11px] mt-1">{uploadForm.errors.backup_file}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={uploadForm.processing || !uploadForm.data.backup_file}
                                className="w-full py-3 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black rounded-xl text-xs transition shadow-lg shadow-amber-600/30 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${uploadForm.processing ? 'animate-spin' : ''}`} />
                                <span>{uploadForm.processing ? 'Memulihkan Database...' : 'Mulai Restore Database dari File Upload'}</span>
                            </button>
                        </form>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 3: SEEDER & GENERATOR DATA */}
                {/* ========================================================================= */}
                {activeTab === 'seeders' && (
                    <div className="space-y-4">
                        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black text-white">Generator Data & Seeder Pengembangan</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Gunakan seeder ini untuk menguji modul SIAKAD, PMB, Kurikulum OBE, dan simulasi perbankan Virtual Account.
                                </p>
                            </div>
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/30">
                                Mode Development
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {seederModules.map((m) => {
                                const IconComp = m.icon;
                                const isRunning = runningSeeder === m.type;

                                return (
                                    <div
                                        key={m.type}
                                        className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition"
                                    >
                                        <div className="space-y-2.5">
                                            <div className="flex items-start justify-between">
                                                <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-2xl">
                                                    <IconComp className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-black px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                                                    {m.badge}
                                                </span>
                                            </div>

                                            <div>
                                                <h4 className="font-black text-sm text-slate-900">{m.title}</h4>
                                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{m.description}</p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={isRunning}
                                            onClick={() => handleRunSeeder(m.type)}
                                            className="w-full py-2.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                                        >
                                            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                                            <span>{isRunning ? 'Mengeksekusi Seeder...' : 'Jalankan Seeder Ini'}</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 4: KATALOG TABEL & STATISTIK BARIS */}
                {/* ========================================================================= */}
                {activeTab === 'tables' && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                            <div>
                                <h3 className="font-bold text-xs text-slate-900">Katalog Skema & Jumlah Baris Database</h3>
                                <p className="text-[11px] text-slate-500">Tabel aktif yang masuk dalam cakupan auto-backup snapshot</p>
                            </div>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                                {tableStats.length} Tabel Aktif
                            </span>
                        </div>

                        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {tableStats.map((t) => (
                                <div key={t.name} className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-200 transition flex items-center justify-between">
                                    <div className="min-w-0 pr-2">
                                        <p className="font-mono text-xs font-bold text-slate-800 truncate">{t.name}</p>
                                        <p className="text-[10px] text-slate-400">PostgreSQL Table</p>
                                    </div>
                                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-bold text-[11px] text-indigo-900 shrink-0">
                                        {t.rows} baris
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* MODAL KONFIRMASI RESTORE */}
            {/* ========================================================================= */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
                        <div className="p-6 space-y-4 text-center">
                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                                <AlertTriangle className="w-6 h-6" />
                            </div>

                            <div>
                                <h3 className="font-black text-base text-slate-900">Konfirmasi Restore Database</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Apakah Anda yakin ingin memulihkan database dari file:
                                </p>
                                <p className="font-mono font-bold text-xs text-indigo-700 mt-1 bg-indigo-50 p-2 rounded-xl border border-indigo-200 break-all">
                                    {confirmModal.filename}
                                </p>
                                <p className="text-[11px] text-rose-600 font-bold mt-2">
                                    PERHATIAN: Seluruh data saat ini akan ditimpa dengan data dari file backup ini!
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setConfirmModal({ isOpen: false, filename: null })}
                                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRestoreConfirm}
                                    className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs transition shadow cursor-pointer"
                                >
                                    Ya, Pulihkan Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
