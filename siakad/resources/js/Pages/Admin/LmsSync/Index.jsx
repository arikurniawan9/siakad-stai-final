import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    RefreshCw, CheckCircle2, Server, ArrowRight, ExternalLink, 
    ShieldCheck, Database, Download, Upload, Activity, AlertCircle,
    Check, Clock, FileCode, Layers, Info
} from 'lucide-react';

export default function LmsSyncIndex({ syncLogs = [], stats = {}, activePeriod = {} }) {
    const [syncingPush, setSyncingPush] = useState(false);
    const [syncingPull, setSyncingPull] = useState(false);
    const [testingConn, setTestingConn] = useState(false);
    const [connStatus, setConnStatus] = useState({
        status: 'CHECKING',
        latency_ms: null,
        message: 'Memeriksa gateway SALAM LMS...',
    });
    const [selectedLog, setSelectedLog] = useState(null);

    const checkConnection = async () => {
        setTestingConn(true);
        try {
            const res = await fetch('/admin/lms-sync/test-connection');
            const data = await res.json();
            setConnStatus(data);
        } catch (err) {
            setConnStatus({
                status: 'OFFLINE',
                latency_ms: null,
                message: 'LMS Gateway tidak dapat dihubungi (Port 5000 Standby). Antrean otomatis aktif.',
            });
        } finally {
            setTestingConn(false);
        }
    };

    useEffect(() => {
        checkConnection();
    }, []);

    const handlePushSync = () => {
        if (confirm('Jalankan sinkronisasi data master akademik (Periode, Prodi, MK, Kelas, & Mahasiswa Terdaftar) ke SALAM LMS?')) {
            setSyncingPush(true);
            router.post('/admin/lms-sync/push', {}, {
                onFinish: () => {
                    setSyncingPush(false);
                    checkConnection();
                },
            });
        }
    };

    const handlePullGrades = () => {
        if (confirm('Tarik rekapitulasi nilai tugas, kuis CBT, dan presensi dari SALAM LMS ke Gradebook SIAKAD?')) {
            setSyncingPull(true);
            router.post('/admin/lms-sync/pull-grades', {}, {
                onFinish: () => {
                    setSyncingPull(false);
                    checkConnection();
                },
            });
        }
    };

    return (
        <AppLayout title="Gateway Sinkronisasi SALAM LMS">
            <Head title="Integrasi SALAM LMS — SIAKAD" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Gateway Sinkronisasi SALAM LMS</h2>
                        <p className="text-xs text-slate-500">Jembatan integrasi dua arah data akademik SIAKAD ⇄ Ruang Kelas, CBT & Gradebook SALAM LMS.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={checkConnection}
                            disabled={testingConn}
                            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                        >
                            <Activity className={`w-3.5 h-3.5 ${testingConn ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
                            <span>Tes Koneksi</span>
                        </button>
                        <a
                            href={stats.lms_frontend_url || 'http://localhost:8080'}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-emerald-400 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                        >
                            <span>Buka Portal LMS</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                            onClick={handlePushSync}
                            disabled={syncingPush}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
                        >
                            <Upload className={`w-3.5 h-3.5 ${syncingPush ? 'animate-bounce' : ''}`} />
                            <span>{syncingPush ? 'Mengirim Data...' : 'Kirim Data ke LMS (Push)'}</span>
                        </button>
                        <button
                            onClick={handlePullGrades}
                            disabled={syncingPull}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
                        >
                            <Download className={`w-3.5 h-3.5 ${syncingPull ? 'animate-bounce' : ''}`} />
                            <span>{syncingPull ? 'Menarik Nilai...' : 'Tarik Nilai LMS (Pull)'}</span>
                        </button>
                    </div>
                </div>

                {/* Connection Status Card */}
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    connStatus.status === 'ONLINE'
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                        : connStatus.status === 'STANDBY' || connStatus.status === 'SYNC_CACHED_LOCAL'
                        ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                    <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                            connStatus.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                        }`} />
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="font-black text-xs uppercase tracking-wide">Status Gateway LMS:</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                    connStatus.status === 'ONLINE' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                                }`}>
                                    {connStatus.status}
                                </span>
                                {connStatus.latency_ms && (
                                    <span className="text-[10px] font-mono font-bold text-slate-500">
                                        ({connStatus.latency_ms} ms)
                                    </span>
                                )}
                            </div>
                            <p className="text-xs mt-0.5 opacity-90">{connStatus.message}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 block">Endpoint Target:</span>
                        <code className="text-[11px] font-bold text-slate-700 bg-white/70 px-2 py-0.5 rounded border border-slate-200">
                            {stats.lms_api_url}
                        </code>
                    </div>
                </div>

                {/* Architecture Diagram Box */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-xl border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Arsitektur Integrasi & Siklus Data Dua Arah</h3>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                            Periode Aktif: {activePeriod?.name || '2026/2027 Ganjil'}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                            <Database className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                            <h4 className="text-sm font-black">SIAKAD STAI (Master)</h4>
                            <p className="text-[11px] text-slate-300 mt-1">Master Kurikulum, Jadwal Anti-Clash, KRS Mahasiswa Disetujui PA, & Status SPP VA BSI</p>
                        </div>

                        <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-mono font-bold">
                                <span>PUSH ➔ Master & Enrolled</span>
                            </div>
                            <div className="w-full border-t border-dashed border-emerald-500/40 my-0.5" />
                            <div className="flex items-center space-x-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-mono font-bold">
                                <span>PULL ⬅ Nilai Tugas & Kuis CBT</span>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                            <Server className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                            <h4 className="text-sm font-black">SALAM LMS (Learning Engine)</h4>
                            <p className="text-[11px] text-slate-300 mt-1">Materi RPS, Presensi QR Dinamis, Pengumpulan Tugas S3 MinIO, & Ujian CBT Lockdown</p>
                        </div>
                    </div>
                </div>

                {/* Sync Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-slate-500">Mata Kuliah Siap Kirim</span>
                        <p className="text-2xl font-black text-slate-900 mt-1">{stats.total_courses}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-slate-500">Kelas Perkuliahan Aktif</span>
                        <p className="text-2xl font-black text-slate-900 mt-1">{stats.total_classes}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-slate-500">Enrollment Mahasiswa</span>
                        <p className="text-2xl font-black text-slate-900 mt-1">{stats.total_enrollments}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-slate-500">Rekap Nilai Terintegrasi</span>
                        <p className="text-2xl font-black text-emerald-700 mt-1">{stats.total_grades}</p>
                    </div>
                </div>

                {/* Sync Logs Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Riwayat Log Sinkronisasi Realtime</h3>
                            <p className="text-[11px] text-slate-400">Jejak audit seluruh pengiriman data dan penarikan gradebook.</p>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{syncLogs.length} Aktivitas Terakhir</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                                    <th className="py-2.5 px-4">Waktu</th>
                                    <th className="py-2.5 px-4">Tipe Aksi</th>
                                    <th className="py-2.5 px-4">Status</th>
                                    <th className="py-2.5 px-4">Data Diproses</th>
                                    <th className="py-2.5 px-4">Ringkasan Payload</th>
                                    <th className="py-2.5 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {syncLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                                            Belum ada catatan log sinkronisasi. Tekan tombol "Kirim Data ke LMS" di atas untuk memulai.
                                        </td>
                                    </tr>
                                ) : (
                                    syncLogs.map((log) => {
                                        const isPush = log.sync_type === 'PUSH_MASTER_TO_LMS';
                                        const isPull = log.sync_type === 'PULL_GRADES_FROM_LMS';
                                        return (
                                            <tr key={log.id} className="hover:bg-slate-50">
                                                <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                                                    {new Date(log.created_at).toLocaleString('id-ID')}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-black ${
                                                        isPush ? 'bg-emerald-100 text-emerald-800' : isPull ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                    }`}>
                                                        {isPush ? <Upload className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                                                        <span>{log.sync_type}</span>
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-bold text-slate-800">
                                                    {log.records_processed} Records
                                                </td>
                                                <td className="py-3 px-4 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                                                    {typeof log.payload_summary === 'string' ? log.payload_summary : JSON.stringify(log.payload_summary)}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedLog(log)}
                                                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold transition"
                                                    >
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Log Detail Modal */}
                {selectedLog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-900 uppercase">Detail Log Sinkronisasi #{selectedLog.id}</h3>
                                <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
                                    Tutup
                                </button>
                            </div>
                            <div className="space-y-2 text-xs">
                                <p><span className="font-bold text-slate-500">Tipe:</span> <code className="font-bold text-emerald-700">{selectedLog.sync_type}</code></p>
                                <p><span className="font-bold text-slate-500">Status:</span> <span className="font-bold">{selectedLog.status}</span></p>
                                <p><span className="font-bold text-slate-500">Waktu:</span> {new Date(selectedLog.created_at).toLocaleString('id-ID')}</p>
                                <p><span className="font-bold text-slate-500">Total Record:</span> {selectedLog.records_processed}</p>
                                {selectedLog.error_message && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                        <span className="font-bold">Error / Keterangan:</span>
                                        <p className="mt-1 font-mono text-[11px]">{selectedLog.error_message}</p>
                                    </div>
                                )}
                                <div>
                                    <span className="font-bold text-slate-500 block mb-1">Payload Summary JSON:</span>
                                    <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto max-h-48">
                                        {JSON.stringify(typeof selectedLog.payload_summary === 'string' ? JSON.parse(selectedLog.payload_summary) : selectedLog.payload_summary, null, 2)}
                                    </pre>
                                </div>
                            </div>
                            <div className="text-right pt-2 border-t border-slate-100">
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900"
                                >
                                    Selesai
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
