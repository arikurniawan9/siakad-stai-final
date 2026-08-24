import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Send, ShieldCheck, AlertTriangle, CheckCircle2, Download, 
    UploadCloud, Database, Server, Settings, RefreshCw, FileCode,
    Layers, Users, BookOpen, Clock, Activity, Check, Info
} from 'lucide-react';

export default function PddiktiIndex({ activePeriod, stats = {}, config = {}, syncLogs = [] }) {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'dryrun', 'sync', 'config'
    const [isValidating, setIsValidating] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedSyncTarget, setSelectedSyncTarget] = useState('MATA_KULIAH');

    const configForm = useForm({
        feeder_url: config.feeder_url || 'http://localhost:8100/ws/live.php?json',
        feeder_token: config.feeder_token || 'mock_pddikti_token_stai_alittihad_2026',
        feeder_mode: config.feeder_mode || 'SANDBOX',
    });

    const handleRunDryRun = () => {
        setIsValidating(true);
        router.post('/admin/pddikti/validate-dryrun', {}, {
            onFinish: () => {
                setIsValidating(false);
                setActiveTab('dryrun');
            },
        });
    };

    const handleRunSync = () => {
        if (confirm(`Jalankan sinkronisasi data tabel ${selectedSyncTarget} ke PDDIKTI Neo Feeder?`)) {
            setIsSyncing(true);
            router.post('/admin/pddikti/sync-simulate', { target: selectedSyncTarget }, {
                onFinish: () => setIsSyncing(false),
            });
        }
    };

    const handleSaveConfig = (e) => {
        e.preventDefault();
        configForm.post('/admin/pddikti/config');
    };

    const latestValidation = syncLogs.find(l => l.sync_action === 'VALIDATE_DRYRUN');
    const validationIssues = latestValidation && latestValidation.validation_errors 
        ? (typeof latestValidation.validation_errors === 'string' ? JSON.parse(latestValidation.validation_errors) : latestValidation.validation_errors)
        : [];

    return (
        <AppLayout title="PDDIKTI Neo Feeder Sync Connector">
            <Head title="PDDIKTI Neo Feeder — SIAKAD" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">PDDIKTI Neo Feeder Sync Connector</h2>
                        <p className="text-xs text-slate-500">
                            Gateway pelaporan akademik berkala ke Pangkalan Data Pendidikan Tinggi (PDDIKTI) Kemendikbudristek & Kemenag.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleRunDryRun}
                            disabled={isValidating}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-emerald-400 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
                        >
                            <ShieldCheck className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
                            <span>{isValidating ? 'Memvalidasi...' : 'Jalankan Dry-Run Validator'}</span>
                        </button>
                        <button
                            onClick={handleRunSync}
                            disabled={isSyncing}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
                        >
                            <Send className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                            <span>{isSyncing ? 'Mengirim...' : 'Kirim ke Feeder'}</span>
                        </button>
                    </div>
                </div>

                {/* Feeder Environment Banner */}
                <div className="p-4 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl text-white shadow-xl border border-blue-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-400/30">
                            <Server className="w-6 h-6 text-blue-300" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="font-black text-sm text-white">Konektor Neo Feeder Web Service</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                    config.feeder_mode === 'SANDBOX' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/30 text-emerald-300'
                                }`}>
                                    MODE {config.feeder_mode}
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-0.5">
                                Kode PT: <strong className="text-white">{config.institution_code}</strong> ({config.institution_name}) • Periode: <strong className="text-emerald-300">{activePeriod?.name || '2026/2027 Ganjil'}</strong>
                            </p>
                        </div>
                    </div>
                    <div className="text-left md:text-right">
                        <span className="text-[10px] font-mono text-slate-400 block">WS Endpoint Feeder:</span>
                        <code className="text-[11px] font-mono font-bold text-emerald-400 bg-white/10 px-2 py-0.5 rounded border border-white/10">
                            {config.feeder_url}
                        </code>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
                            activeTab === 'overview' ? 'border-emerald-600 text-emerald-700 font-black' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Database className="w-4 h-4" />
                        <span>Kesiapan Data ({stats.total_students + stats.total_courses + stats.total_classes} Data)</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('dryrun')}
                        className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
                            activeTab === 'dryrun' ? 'border-emerald-600 text-emerald-700 font-black' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Hasil Dry-Run ({validationIssues.length} Temuan)</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('sync')}
                        className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
                            activeTab === 'sync' ? 'border-emerald-600 text-emerald-700 font-black' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Send className="w-4 h-4" />
                        <span>Ekspor & Kirim Feeder</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
                            activeTab === 'config' ? 'border-emerald-600 text-emerald-700 font-black' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Settings className="w-4 h-4" />
                        <span>Pengaturan Web Service</span>
                    </button>
                </div>

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Mahasiswa</span>
                                <p className="text-xl font-black text-slate-900 mt-1">{stats.total_students}</p>
                                <span className="text-[10px] text-emerald-600 font-bold">Siap Lapor AKM</span>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Dosen Pengajar</span>
                                <p className="text-xl font-black text-slate-900 mt-1">{stats.total_lecturers}</p>
                                <span className="text-[10px] text-emerald-600 font-bold">NIDN Terverifikasi</span>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Mata Kuliah</span>
                                <p className="text-xl font-black text-slate-900 mt-1">{stats.total_courses}</p>
                                <span className="text-[10px] text-blue-600 font-bold">Kurikulum OBE</span>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Kelas Kuliah</span>
                                <p className="text-xl font-black text-slate-900 mt-1">{stats.total_classes}</p>
                                <span className="text-[10px] text-emerald-600 font-bold">Terjadwal</span>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Aktivitas KRS</span>
                                <p className="text-xl font-black text-slate-900 mt-1">{stats.total_krs}</p>
                                <span className="text-[10px] text-emerald-600 font-bold">Disetujui PA</span>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Nilai Mutu</span>
                                <p className="text-xl font-black text-slate-900 mt-1">{stats.total_grades}</p>
                                <span className="text-[10px] text-emerald-600 font-bold">Gradebook Lulus</span>
                            </div>
                        </div>

                        {/* Recent Sync History */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-xs font-black text-slate-900 uppercase">Riwayat Aktivitas Neo Feeder PDDIKTI</h3>
                                <span className="text-xs font-bold text-slate-500">{syncLogs.length} Entri Terakhir</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                                            <th className="py-2.5 px-4">Waktu</th>
                                            <th className="py-2.5 px-4">Tabel Target</th>
                                            <th className="py-2.5 px-4">Aksi</th>
                                            <th className="py-2.5 px-4">Status</th>
                                            <th className="py-2.5 px-4">Record Valid / Total</th>
                                            <th className="py-2.5 px-4">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {syncLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                                                    Belum ada catatan aktivitas Feeder PDDIKTI. Jalankan Dry-Run Validator untuk memulai audit data.
                                                </td>
                                            </tr>
                                        ) : (
                                            syncLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-slate-50">
                                                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                                                        {new Date(log.created_at).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="py-3 px-4 font-bold text-slate-900">{log.table_target}</td>
                                                    <td className="py-3 px-4">
                                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                                                            {log.sync_action}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                            log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 font-bold">
                                                        <span className="text-emerald-700">{log.valid_records}</span> / {log.total_records}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-500 text-[11px] max-w-sm truncate">
                                                        {log.details || '-'}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: DRY-RUN VALIDATOR */}
                {activeTab === 'dryrun' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-black text-emerald-400">Dry-Run Validation Engine</h3>
                                <p className="text-xs text-slate-300 mt-0.5">
                                    Mendeteksi potensi galat sebelum data dikirim ke Neo Feeder (Format NIK, SKS nol, Dosen kosong, dll).
                                </p>
                            </div>
                            <button
                                onClick={handleRunDryRun}
                                disabled={isValidating}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shrink-0"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
                                <span>{isValidating ? 'Memindai Ulang...' : 'Pindai Ulang Database'}</span>
                            </button>
                        </div>

                        {validationIssues.length === 0 ? (
                            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                                <h4 className="text-sm font-black text-emerald-900">Database 100% Bersih & Siap Lapor ke PDDIKTI</h4>
                                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                                    Tidak ditemukan galat kritis NIK, SKS, ataupun kelas tanpa dosen. Data memenuhi standar pelaporan Ditjen Diktiristek.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-700">Daftar Catatan Evaluasi Pra-Kirim:</span>
                                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                        {validationIssues.length} Anomali Terdeteksi
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {validationIssues.map((issue, idx) => (
                                        <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                                    issue.severity === 'ERROR' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {issue.severity} • {issue.category}
                                                </span>
                                                <span className="font-mono text-[10px] font-bold text-slate-500">{issue.identifier}</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-800 pt-1">{issue.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: SYNC & EXPORT */}
                {activeTab === 'sync' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['MATA_KULIAH', 'KELAS_KULIAH', 'MAHASISWA', 'NILAI_KULIAH'].map((target) => (
                                <div
                                    key={target}
                                    className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                                        selectedSyncTarget === target
                                            ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                                            : 'bg-white border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <div>
                                        <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                            TABEL: {target}
                                        </span>
                                        <h4 className="text-sm font-black text-slate-900 mt-2">
                                            {target === 'MATA_KULIAH' && 'Master Mata Kuliah Kurikulum'}
                                            {target === 'KELAS_KULIAH' && 'Plotting Kelas & Jadwal'}
                                            {target === 'MAHASISWA' && 'Biodata Mahasiswa & AKM'}
                                            {target === 'NILAI_KULIAH' && 'KHS & Transkrip Nilai'}
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Format baku Web Service Neo Feeder Kemendikbudristek.
                                        </p>
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                                        <a
                                            href={`/admin/pddikti/export?target=${target.toLowerCase()}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>JSON</span>
                                        </a>
                                        <button
                                            onClick={() => {
                                                setSelectedSyncTarget(target);
                                                handleRunSync();
                                            }}
                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                                        >
                                            <Send className="w-3.5 h-3.5" />
                                            <span>Kirim Feeder</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 4: CONFIG */}
                {activeTab === 'config' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-xl">
                        <h3 className="text-sm font-black text-slate-900 uppercase mb-4">
                            Konfigurasi Web Service PDDIKTI Neo Feeder
                        </h3>
                        <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">URL Web Service Neo Feeder:</label>
                                <input
                                    type="text"
                                    value={configForm.data.feeder_url}
                                    onChange={(e) => configForm.setData('feeder_url', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold"
                                    required
                                />
                                <p className="text-[11px] text-slate-400 mt-1">Default local: http://localhost:8100/ws/live.php?json</p>
                            </div>
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Feeder Access Token / Password:</label>
                                <input
                                    type="password"
                                    value={configForm.data.feeder_token}
                                    onChange={(e) => configForm.setData('feeder_token', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold"
                                    required
                                />
                            </div>
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Mode Operasi:</label>
                                <select
                                    value={configForm.data.feeder_mode}
                                    onChange={(e) => configForm.setData('feeder_mode', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                >
                                    <option value="SANDBOX">SANDBOX (Pengujian / Simulasi)</option>
                                    <option value="PRODUCTION">PRODUCTION (Server Resmi Kemendikbud)</option>
                                </select>
                            </div>
                            <div className="pt-3 border-t border-slate-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={configForm.processing}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs"
                                >
                                    Simpan Pengaturan Feeder
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
