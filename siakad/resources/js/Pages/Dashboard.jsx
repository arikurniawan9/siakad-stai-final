import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import ImpersonationModal from '../Components/ImpersonationModal';
import { 
    Users, GraduationCap, CreditCard, Building2, 
    BookOpen, CheckCircle2, Clock, AlertTriangle, 
    ChevronRight, ArrowUpRight, Shield, RefreshCw, 
    Sparkles, Star, School, FileText, Activity, 
    HardDrive, Cpu, Radio, ShieldCheck, Database,
    Server, Terminal, AlertOctagon, Check, Play,
    Megaphone, TrendingUp, Award, FileCheck, Sliders, Send, Key, Landmark,
    UserCheck2, ShieldAlert, Settings, FileSpreadsheet, Printer, Download, Lock, Unlock, ArrowRight
} from 'lucide-react';

export default function Dashboard({ 
    stats = {}, 
    systemMetrics = {}, 
    auditFeed = [], 
    recentBsiTransactions = [],
    lecturerClasses = [],
    lecturerStats = {}
}) {
    const { auth, academic } = usePage().props;
    const user = auth?.user || {};
    const role = user.role || 'mahasiswa';
    const [simulatingBsi, setSimulatingBsi] = useState(false);
    const [testingBsi, setTestingBsi] = useState(false);
    const [clearingCache, setClearingCache] = useState(false);
    const [retryingJobs, setRetryingJobs] = useState(false);
    const [flushingJobs, setFlushingJobs] = useState(false);

    const handleQuickClearCache = () => {
        setClearingCache(true);
        router.post('/admin/settings/clear-cache', {}, {
            preserveScroll: true,
            onFinish: () => setClearingCache(false)
        });
    };

    const handleRetryJobs = () => {
        setRetryingJobs(true);
        router.post('/admin/settings/retry-jobs', {}, {
            preserveScroll: true,
            onFinish: () => setRetryingJobs(false)
        });
    };

    const handleFlushJobs = () => {
        if (confirm('Bersihkan seluruh daftar background jobs yang gagal?')) {
            setFlushingJobs(true);
            router.post('/admin/settings/flush-jobs', {}, {
                preserveScroll: true,
                onFinish: () => setFlushingJobs(false)
            });
        }
    };

    // Format currency IDR
    const formatRp = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val || 0);
    };

    // Dynamic Time Greeting (Pagi / Siang / Sore / Malam)
    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 4 && hour < 11) return { text: 'Selamat pagi', emoji: '🌅' };
        if (hour >= 11 && hour < 15) return { text: 'Selamat siang', emoji: '☀️' };
        if (hour >= 15 && hour < 18) return { text: 'Selamat sore', emoji: '🌇' };
        return { text: 'Selamat malam', emoji: '🌙' };
    };

    // Curated Indonesian Motivational Quotes
    const motivationalQuotes = [
        { text: "Pendidikan adalah senjata paling ampuh yang bisa Anda gunakan untuk mengubah dunia.", author: "Nelson Mandela" },
        { text: "Sebaik-baik manusia adalah yang paling bermanfaat bagi sesamanya.", author: "HR. Ahmad" },
        { text: "Ilmu tanpa amal bagaikan pohon yang tak berbuah. Jadikan setiap karya sebagai ladang keberkahan.", author: "Pepatah Ulama" },
        { text: "Kesuksesan berawal dari langkah kecil yang dilakukan secara konsisten setiap hari.", author: "Kata Mutiara" },
        { text: "Bekerja dengan ikhlas dan tulus akan membuahkan hasil terbaik bagi masa depan generasi bangsa.", author: "Inspirasi Hari Ini" },
        { text: "Kunci keberhasilan adalah fokus pada tujuan, berikhtiar dengan tekun, dan bertawakal.", author: "Kutipan Bijak" },
        { text: "Hari baru adalah kesempatan emas untuk terus bertumbuh dan menebar kebaikan lebih luas.", author: "Motivasi Pagi" },
    ];

    const greeting = getTimeGreeting();
    const quote = motivationalQuotes[new Date().getDate() % motivationalQuotes.length];

    // Impersonation Modal State
    const [modalUser, setModalUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openImpersonateModal = (targetData) => {
        setModalUser(targetData);
        setIsModalOpen(true);
    };

    const handleTestBsiWebhook = async () => {
        setSimulatingBsi(true);
        try {
            const res = await fetch('/api/v1/bsi/va/simulate-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ va_number: '99280221010042' }),
            });
            const result = await res.json();
            if (result.success) {
                alert('✅ Test Koneksi BSI VA Berhasil! Webhook callback diterima dan diproses.');
                router.reload();
            } else {
                alert('Response: ' + result.message);
            }
        } catch (err) {
            console.error(err);
            alert('Kesalahan jaringan.');
        } finally {
            setSimulatingBsi(false);
        }
    };

    const handleQuickTestBsi = async () => {
        setTestingBsi(true);
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/admin/bsi-gateway/test-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
            });
            const result = await res.json();
            if (result.success || result.status === 'ONLINE') {
                alert(`✅ BSI Smart Billing H2H: ${result.status} (${result.latency_ms} ms)\n\n• Pesan: ${result.message}\n• Biller Code: ${result.details?.institution_code}\n• Environment: ${result.details?.environment}\n• Routing: ${result.details?.routing_network}\n• Spesifikasi: ${result.details?.auth_spec}`);
            } else {
                alert('Response BSI: ' + result.message);
            }
        } catch (err) {
            console.error(err);
            alert('Kesalahan jaringan: ' + err.message);
        } finally {
            setTestingBsi(false);
        }
    };

    return (
        <AppLayout title={role === 'superadmin' ? 'Dasbor Developer & Sistem' : 'Dasbor Akademik'}>
            <Head title={role === 'superadmin' ? 'Dasbor Sistem' : 'Dasbor Akademik'} />

            {/* Premium Impersonation Modal */}
            <ImpersonationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                targetUser={modalUser}
            />

            <div className="space-y-3.5">
                {/* PINNED ANNOUNCEMENT BROADCAST BANNER */}
                <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 rounded-2xl p-4 text-white shadow-sm border border-emerald-700/40 flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl shrink-0 mt-0.5">
                            <Megaphone className="w-4 h-4 text-emerald-400 animate-bounce" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                                <span className="px-2 py-0.2 bg-amber-400 text-slate-950 rounded font-black text-[9px] uppercase">
                                    PENGUMUMAN RESMI
                                </span>
                                <span className="text-[10px] text-emerald-300 font-medium">Biro Akademik (BAAK)</span>
                            </div>
                            <h4 className="text-xs font-black text-white">
                                Jadwal Pengisian KRS Online & Batas Akhir Pembayaran SPP TA 2026/2027
                            </h4>
                            <p className="text-[11px] text-slate-300 leading-relaxed max-w-2xl">
                                Pengisian KRS Online semester ganjil dibuka tanggal 1 s.d. 10 September 2026. Mahasiswa diharapkan memastikan tagihan SPP telah terverifikasi lunas melalui BSI Virtual Account (9928).
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/admin/announcements"
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white rounded-lg text-[10px] font-bold transition whitespace-nowrap shrink-0 self-center"
                    >
                        Lihat Semua →
                    </Link>
                </div>
                {role === 'superadmin' && (
                    <>
                        {/* 1. EXECUTIVE COMMAND HERO */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 text-white p-5 sm:p-6 shadow-sm">
                            {/* Ambient Glow */}
                            <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10 space-y-4">
                                {/* Top Operational Pill Row */}
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                            <span>Sistem Operasional Optimal</span>
                                        </div>
                                        <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] font-medium text-slate-300">
                                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                                            <span>{systemMetrics.is_maintenance ? 'Mode Pemeliharaan' : 'Produksi Aktif'}</span>
                                        </div>
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-400">
                                        {systemMetrics.db_engine || 'PostgreSQL 16'} • PHP {systemMetrics.php_version || '8.4'}
                                    </div>
                                </div>

                                {/* Main Welcome & Action Buttons */}
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                            <span>{greeting.text}, {user.name}</span>
                                            <span className="text-xl">{greeting.emoji}</span>
                                        </h2>
                                        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                                            Pusat kendali arsitektur sistem, orkestrasi perbankan BSI, dan manajemen data SALAM SIAKAD.
                                        </p>
                                        <p className="text-[11px] text-indigo-200/80 mt-1.5 italic">
                                            "{quote.text}" — <span className="font-medium text-indigo-300">{quote.author}</span>
                                        </p>
                                    </div>

                                    {/* Action Shortcuts Bar */}
                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={handleQuickClearCache}
                                            disabled={clearingCache}
                                            className="px-3.5 py-2 bg-white/10 hover:bg-white/15 active:bg-white/20 text-white rounded-xl text-xs font-semibold transition border border-white/10 flex items-center space-x-2 shadow-2xs cursor-pointer disabled:opacity-50"
                                            title="Bersihkan cache framework dan view"
                                        >
                                            <RefreshCw className={`w-3.5 h-3.5 ${clearingCache ? 'animate-spin text-amber-300' : 'text-slate-300'}`} />
                                            <span>{clearingCache ? 'Membersihkan...' : 'Clear Cache'}</span>
                                        </button>

                                        <Link
                                            href="/admin/database"
                                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-1.5 border border-indigo-500/40"
                                        >
                                            <Database className="w-3.5 h-3.5 text-indigo-200" />
                                            <span>Database Manager</span>
                                        </Link>

                                        <Link
                                            href="/admin/bsi-gateway"
                                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-1.5 border border-emerald-500/40"
                                        >
                                            <Landmark className="w-3.5 h-3.5 text-emerald-200" />
                                            <span>BSI Gateway</span>
                                        </Link>

                                        <Link
                                            href="/admin/settings"
                                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 hover:text-white rounded-xl text-xs font-medium transition border border-slate-700 flex items-center space-x-1.5"
                                        >
                                            <Settings className="w-3.5 h-3.5 text-slate-400" />
                                            <span>Pengaturan</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. STATISTIK UTAMA KAMPUS & FINANSIAL (6 KPI CARDS) */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
                            {/* Card 1: Mahasiswa */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-300 hover:shadow-xs transition">
                                <div className="flex items-center justify-between text-slate-500">
                                    <span className="text-[11px] font-bold text-slate-500">Mahasiswa</span>
                                    <span className="p-1.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-100"><GraduationCap className="w-4 h-4" /></span>
                                </div>
                                <p className="text-xl font-black text-slate-900 mt-2">{stats.total_students ?? 1248}</p>
                                <p className="text-[10px] text-teal-600 font-semibold mt-0.5">Civitas Terdaftar</p>
                            </div>

                            {/* Card 2: Dosen */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition">
                                <div className="flex items-center justify-between text-slate-500">
                                    <span className="text-[11px] font-bold text-slate-500">Dosen Pengajar</span>
                                    <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100"><Users className="w-4 h-4" /></span>
                                </div>
                                <p className="text-xl font-black text-slate-900 mt-2">{stats.total_lecturers ?? 42}</p>
                                <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">Tenaga Pendidik</p>
                            </div>

                            {/* Card 3: Program Studi */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-300 hover:shadow-xs transition">
                                <div className="flex items-center justify-between text-slate-500">
                                    <span className="text-[11px] font-bold text-slate-500">Program Studi</span>
                                    <span className="p-1.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100"><School className="w-4 h-4" /></span>
                                </div>
                                <p className="text-xl font-black text-slate-900 mt-2">{stats.total_study_programs ?? 5}</p>
                                <p className="text-[10px] text-purple-600 font-semibold mt-0.5">Jenjang S1 Terdaftar</p>
                            </div>

                            {/* Card 4: VA BSI Lunas */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition">
                                <div className="flex items-center justify-between text-slate-500">
                                    <span className="text-[11px] font-bold text-slate-500">Setoran BSI Lunas</span>
                                    <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100"><CheckCircle2 className="w-4 h-4" /></span>
                                </div>
                                <p className="text-base font-black text-emerald-600 mt-2 font-mono truncate">{formatRp(stats.total_va_paid_amount ?? 2500000)}</p>
                                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{stats.total_va_paid_count ?? 1} Transaksi Lunas</p>
                            </div>

                            {/* Card 5: VA BSI Pending */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-300 hover:shadow-xs transition">
                                <div className="flex items-center justify-between text-slate-500">
                                    <span className="text-[11px] font-bold text-slate-500">Tagihan Pending</span>
                                    <span className="p-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100"><Clock className="w-4 h-4" /></span>
                                </div>
                                <p className="text-base font-black text-amber-600 mt-2 font-mono truncate">{formatRp(stats.total_va_pending_amount ?? 0)}</p>
                                <p className="text-[10px] text-amber-600 font-semibold mt-0.5">{stats.total_va_pending_count ?? 0} VA Menunggu</p>
                            </div>

                            {/* Card 6: PMB */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-cyan-300 hover:shadow-xs transition">
                                <div className="flex items-center justify-between text-slate-500">
                                    <span className="text-[11px] font-bold text-slate-500">Pendaftar PMB</span>
                                    <span className="p-1.5 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100"><UserCheck2 className="w-4 h-4" /></span>
                                </div>
                                <p className="text-xl font-black text-slate-900 mt-2">{stats.total_pmb_applicants ?? 2}</p>
                                <p className="text-[10px] text-cyan-600 font-semibold mt-0.5">Gelombang 2026/2027</p>
                            </div>
                        </div>

                        {/* 3. TELEMETRI SISTEM & GATEWAY TERPADU (PREMIUM 4-GRID CARD) */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <div className="flex items-center space-x-2.5">
                                    <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                            Status Infrastruktur & Gateway Terintegrasi
                                        </h3>
                                        <p className="text-[11px] text-slate-500">
                                            Kondisi waktu nyata konektivitas database, gateway core banking, LMS bridge, dan background queue.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleQuickTestBsi}
                                        disabled={testingBsi}
                                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                        <Radio className={`w-3.5 h-3.5 ${testingBsi ? 'animate-spin text-emerald-600' : 'text-emerald-700'}`} />
                                        <span>{testingBsi ? 'Menguji...' : 'Uji Ping H2H'}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {/* Card A: PostgreSQL Engine */}
                                <Link
                                    href="/admin/database"
                                    className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-indigo-50/40 hover:border-indigo-300 transition group block"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-bold text-slate-600 group-hover:text-indigo-950 flex items-center gap-1.5">
                                            <Database className="w-3.5 h-3.5 text-indigo-600" />
                                            <span>Database Engine</span>
                                        </span>
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                            Online
                                        </span>
                                    </div>
                                    <p className="text-base font-black text-slate-900 group-hover:text-indigo-950">
                                        {systemMetrics.db_engine || 'PostgreSQL 16'}
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 mt-1">
                                        <span>Kapasitas: <strong className="text-slate-800 font-mono">{systemMetrics.db_size || '14.2 MB'}</strong></span>
                                        <span className="text-indigo-600 font-bold group-hover:translate-x-0.5 transition">Kelola →</span>
                                    </div>
                                </Link>

                                {/* Card B: BSI Gateway */}
                                <Link
                                    href="/admin/bsi-gateway"
                                    className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-300 transition group block"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-bold text-slate-600 group-hover:text-emerald-950 flex items-center gap-1.5">
                                            <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>BSI Smart Billing</span>
                                        </span>
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                            BI-SNAP H2H
                                        </span>
                                    </div>
                                    <p className="text-base font-black text-slate-900 group-hover:text-emerald-950">
                                        Biller 8891
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 mt-1">
                                        <span>Inquiry (24) & Bayar (25)</span>
                                        <span className="text-emerald-600 font-bold group-hover:translate-x-0.5 transition">Gateway →</span>
                                    </div>
                                </Link>

                                {/* Card C: LMS Sync Bridge */}
                                <Link
                                    href="/admin/lms-sync"
                                    className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-purple-50/40 hover:border-purple-300 transition group block"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-bold text-slate-600 group-hover:text-purple-950 flex items-center gap-1.5">
                                            <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
                                            <span>LMS Sync Bridge</span>
                                        </span>
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                                            Port 5000
                                        </span>
                                    </div>
                                    <p className="text-base font-black text-slate-900 group-hover:text-purple-950">
                                        REST Express API
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 mt-1">
                                        <span>SSO & Kelas Sinkron</span>
                                        <span className="text-purple-600 font-bold group-hover:translate-x-0.5 transition">Sync →</span>
                                    </div>
                                </Link>

                                {/* Card D: Queue Workers & Background */}
                                <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                                            <Cpu className="w-3.5 h-3.5 text-amber-600" />
                                            <span>Queue & Worker</span>
                                        </span>
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                            Number(systemMetrics.failed_jobs) > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            {Number(systemMetrics.failed_jobs) > 0 ? `${systemMetrics.failed_jobs} Gagal` : 'Normal'}
                                        </span>
                                    </div>
                                    <p className="text-base font-black text-slate-900">
                                        {systemMetrics.pending_jobs || 0} Antrean
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 mt-1">
                                        <span>Driver: <strong className="text-slate-800 font-mono">{systemMetrics.queue_driver || 'database'}</strong></span>
                                        {Number(systemMetrics.failed_jobs) > 0 ? (
                                            <button 
                                                type="button" 
                                                onClick={handleRetryJobs}
                                                disabled={retryingJobs}
                                                className="text-amber-600 font-bold hover:underline cursor-pointer"
                                            >
                                                {retryingJobs ? '...' : 'Ulangi Jobs'}
                                            </button>
                                        ) : (
                                            <span className="text-emerald-600 font-bold">WA Active</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. DUA KOLOM UTAMA: MODUL & TRANSAKSI (KIRI-8) + MENYAMAR & AUDIT (KANAN-4) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            {/* KOLOM KIRI (LEBAR 8) */}
                            <div className="lg:col-span-8 space-y-4">
                                {/* Modul Akses Cepat Superadmin */}
                                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                        <div className="flex items-center space-x-2">
                                            <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
                                                <Sliders className="w-3.5 h-3.5" />
                                            </div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                                Modul & Navigasi Cepat
                                            </h3>
                                        </div>
                                        <span className="text-[10px] font-semibold text-slate-400">4 Kategori Utama</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {/* Kategori 1: Perbankan & Kas */}
                                        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-2">
                                            <div className="flex items-center space-x-2 text-slate-900">
                                                <div className="p-1 bg-emerald-100/70 text-emerald-700 rounded-lg">
                                                    <Landmark className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-900">Perbankan & Kas</span>
                                            </div>
                                            <div className="space-y-1">
                                                <Link href="/admin/bsi-gateway" className="flex items-center justify-between p-2 rounded-lg hover:bg-white text-xs text-slate-700 font-medium transition hover:shadow-2xs border border-transparent hover:border-slate-200">
                                                    <span>🏦 BSI Smart Billing H2H Direct</span>
                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                </Link>
                                                <Link href="/admin/finance" className="flex items-center justify-between p-2 rounded-lg hover:bg-white text-xs text-slate-700 font-medium transition hover:shadow-2xs border border-transparent hover:border-slate-200">
                                                    <span>💳 Setup Tarif SPP, UKT & Generate VA</span>
                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                </Link>
                                                <Link href="/admin/pmb" className="flex items-center justify-between p-2 rounded-lg hover:bg-white text-xs text-slate-700 font-medium transition hover:shadow-2xs border border-transparent hover:border-slate-200">
                                                    <span>📝 Verifikasi Keuangan PMB</span>
                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Kategori 2: Akademik & Kurikulum */}
                                        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-2">
                                            <div className="flex items-center space-x-2 text-slate-900">
                                                <div className="p-1 bg-teal-100/70 text-teal-700 rounded-lg">
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-900">Akademik & Kurikulum</span>
                                            </div>
                                            <div className="space-y-1">
                                                <Link href="/admin/curricula" className="flex items-center justify-between p-2 rounded-lg hover:bg-white text-xs text-slate-700 font-medium transition hover:shadow-2xs border border-transparent hover:border-slate-200">
                                                    <span>📚 Master Kurikulum & Mata Kuliah</span>
                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                </Link>
                                                <Link href="/admin/schedules" className="flex items-center justify-between p-2 rounded-lg hover:bg-white text-xs text-slate-700 font-medium transition hover:shadow-2xs border border-transparent hover:border-slate-200">
                                                    <span>📅 Plotting Jadwal & Ruang Kuliah</span>
                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                </Link>
                                                <Link href="/admin/grades" className="flex items-center justify-between p-2 rounded-lg hover:bg-white text-xs text-slate-700 font-medium transition hover:shadow-2xs border border-transparent hover:border-slate-200">
                                                    <span>📝 Penilaian DPNA & Kunci Nilai</span>
                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Kategori 3: Integrasi & Feeder */}
                                        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-2">
                                            <div className="flex items-center space-x-2 text-slate-900">
                                                <div className="p-1 bg-purple-100/70 text-purple-700 rounded-lg">
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-900">Integrasi Eksternal</span>
                                            </div>
                                            <div className="space-y-1">
                                                <Link href="/admin/lms-sync" className="flex items-center justify-between p-2 rounded-lg hover:bg-white text-xs text-slate-700 font-medium transition hover:shadow-2xs border border-transparent hover:border-slate-200">
                                                    <span>💻 Bridge Sinkronisasi LMS</span>
                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                </Link>
                                                <Link href="/admin/pddikti" className="flex items-center justify-between p-2 rounded-lg hover:bg-white text-xs text-slate-700 font-medium transition hover:shadow-2xs border border-transparent hover:border-slate-200">
                                                    <span>🏛️ Integrasi Neo Feeder PDDIKTI</span>
                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                </Link>
                                                <a href="/sso/lms" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-white text-xs text-slate-700 font-medium transition hover:shadow-2xs border border-transparent hover:border-slate-200">
                                                    <span>🔑 Portal Launch SSO LMS</span>
                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                </a>
                                            </div>
                                        </div>

                                        {/* Kategori 4: Pemeliharaan, Database & Pengawasan */}
                                        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-2">
                                            <div className="flex items-center space-x-2 text-slate-900">
                                                <div className="p-1 bg-indigo-100/70 text-indigo-700 rounded-lg">
                                                    <Database className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-900">Database & Pemeliharaan</span>
                                            </div>
                                            <div className="space-y-1">
                                                <Link href="/admin/database" className="flex items-center justify-between p-2 rounded-lg hover:bg-white text-xs text-slate-700 font-medium transition hover:shadow-2xs border border-transparent hover:border-slate-200">
                                                    <span>💾 Kelola Tabel & Hapus Data Percobaan</span>
                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                </Link>
                                                <Link href="/admin/audit-logs" className="flex items-center justify-between p-2 rounded-lg hover:bg-white text-xs text-slate-700 font-medium transition hover:shadow-2xs border border-transparent hover:border-slate-200">
                                                    <span>🛡️ Visual Audit Log Tracker</span>
                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                </Link>
                                                <Link href="/admin/settings" className="flex items-center justify-between p-2 rounded-lg hover:bg-white text-xs text-slate-700 font-medium transition hover:shadow-2xs border border-transparent hover:border-slate-200">
                                                    <span>⚙️ Pengaturan Global & Maintenance</span>
                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Transaksi Virtual Account BSI Terkini */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                                    <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
                                                <CreditCard className="w-3.5 h-3.5" />
                                            </div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                                Transaksi Virtual Account BSI Terkini
                                            </h3>
                                        </div>
                                        <Link href="/admin/bsi-gateway" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1">
                                            <span>Lihat Semua Transaksi</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                                                <tr>
                                                    <th className="px-4 py-3">No. VA BSI</th>
                                                    <th className="px-4 py-3">Mahasiswa / Pendaftar</th>
                                                    <th className="px-4 py-3">Pos Tagihan</th>
                                                    <th className="px-4 py-3">Nominal</th>
                                                    <th className="px-4 py-3 text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {recentBsiTransactions && recentBsiTransactions.length > 0 ? (
                                                    recentBsiTransactions.map((tx) => (
                                                        <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                                                            <td className="px-4 py-3 font-mono font-bold text-slate-900">
                                                                {tx.va_number}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <p className="font-bold text-slate-900">{tx.customer_name}</p>
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-600">
                                                                <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                                                                    {tx.fee_name}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 font-mono font-bold text-slate-900">
                                                                {formatRp(tx.amount)}
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                {tx.status === 'PAID' ? (
                                                                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                                                        LUNAS
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                                                        PENDING
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">
                                                            Belum ada data transaksi VA BSI tercatat.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* KOLOM KANAN (LEBAR 4): PORTAL MENYAMAR & AUDIT LOG FEED */}
                            <div className="lg:col-span-4 space-y-4">
                                {/* 1-Click Role Impersonation Hub */}
                                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                        <div className="flex items-center space-x-2">
                                            <div className="p-1 rounded-lg bg-purple-50 text-purple-600">
                                                <Key className="w-3.5 h-3.5" />
                                            </div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                                Mode Menyamar
                                            </h3>
                                        </div>
                                        <Link href="/admin/users" className="text-xs font-bold text-purple-700 hover:underline">
                                            Semua Akun →
                                        </Link>
                                    </div>

                                    <p className="text-[11px] text-slate-500">
                                        Masuk instan sebagai civitas untuk memeriksa tampilan & izin akses tanpa kata sandi.
                                    </p>

                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => openImpersonateModal({
                                                id: 2,
                                                name: 'Budi Santoso, S.Kom',
                                                role: 'admin_akademik',
                                                identity_number: '198504122010011002',
                                                username: 'adminakademik',
                                                email: 'budi.santoso@staialittihad.ac.id',
                                                study_program: 'Biro Administrasi Akademik (BAAK)',
                                            })}
                                            className="w-full p-2.5 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-300 border border-slate-200 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
                                        >
                                            <div className="flex items-center space-x-2.5 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
                                                    BA
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-xs text-slate-900 group-hover:text-blue-900 truncate">Biro BAAK</p>
                                                    <p className="text-[10px] text-slate-500 font-mono truncate">adminakademik</p>
                                                </div>
                                            </div>
                                            <span className="px-2.5 py-1 bg-white group-hover:bg-blue-600 group-hover:text-white text-slate-700 border border-slate-200 group-hover:border-blue-600 rounded-lg text-[10px] font-bold transition shrink-0">
                                                Masuk
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => openImpersonateModal({
                                                id: 3,
                                                name: 'H. Ridwan Kamil, S.E.',
                                                role: 'keuangan',
                                                identity_number: '198203152008011003',
                                                username: 'keuangan',
                                                email: 'keuangan@staialittihad.ac.id',
                                                study_program: 'Biro Keuangan & Perbankan BSI',
                                            })}
                                            className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50/60 hover:border-emerald-300 border border-slate-200 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
                                        >
                                            <div className="flex items-center space-x-2.5 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                                                    KU
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-xs text-slate-900 group-hover:text-emerald-900 truncate">Biro Keuangan</p>
                                                    <p className="text-[10px] text-slate-500 font-mono truncate">keuangan</p>
                                                </div>
                                            </div>
                                            <span className="px-2.5 py-1 bg-white group-hover:bg-emerald-600 group-hover:text-white text-slate-700 border border-slate-200 group-hover:border-emerald-600 rounded-lg text-[10px] font-bold transition shrink-0">
                                                Masuk
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => openImpersonateModal({
                                                id: 4,
                                                name: "Dr. Ahmad Syafi'i, M.Ag",
                                                role: 'kaprodi',
                                                identity_number: '2118097201',
                                                username: '2118097201',
                                                email: 'kaprodi.pai@staialittihad.ac.id',
                                                study_program: 'Program Studi S1 PAI',
                                            })}
                                            className="w-full p-2.5 bg-slate-50 hover:bg-purple-50/60 hover:border-purple-300 border border-slate-200 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
                                        >
                                            <div className="flex items-center space-x-2.5 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition">
                                                    KP
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-xs text-slate-900 group-hover:text-purple-900 truncate">Kaprodi PAI</p>
                                                    <p className="text-[10px] text-slate-500 font-mono truncate">2118097201</p>
                                                </div>
                                            </div>
                                            <span className="px-2.5 py-1 bg-white group-hover:bg-purple-600 group-hover:text-white text-slate-700 border border-slate-200 group-hover:border-purple-600 rounded-lg text-[10px] font-bold transition shrink-0">
                                                Masuk
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => openImpersonateModal({
                                                id: 5,
                                                name: 'Dra. Hj. Siti Maryam, M.Pd.I',
                                                role: 'dosen_pa',
                                                identity_number: '2115047802',
                                                username: '2115047802',
                                                email: 'siti.maryam.pa@staialittihad.ac.id',
                                                study_program: 'Fakultas Tarbiyah (Dosen PA)',
                                            })}
                                            className="w-full p-2.5 bg-slate-50 hover:bg-amber-50/60 hover:border-amber-300 border border-slate-200 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
                                        >
                                            <div className="flex items-center space-x-2.5 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 font-black text-xs flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition">
                                                    PA
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-xs text-slate-900 group-hover:text-amber-900 truncate">Dosen PA</p>
                                                    <p className="text-[10px] text-slate-500 font-mono truncate">2115047802</p>
                                                </div>
                                            </div>
                                            <span className="px-2.5 py-1 bg-white group-hover:bg-amber-600 group-hover:text-white text-slate-700 border border-slate-200 group-hover:border-amber-600 rounded-lg text-[10px] font-bold transition shrink-0">
                                                Masuk
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => openImpersonateModal({
                                                id: 7,
                                                name: 'Ahmad Fauzi Rahman',
                                                role: 'mahasiswa',
                                                identity_number: '21.01.0042',
                                                username: '21010042',
                                                email: 'ahmad.fauzi@staialittihad.ac.id',
                                                study_program: 'Pendidikan Agama Islam (S1)',
                                            })}
                                            className="w-full p-2.5 bg-slate-50 hover:bg-indigo-50/60 hover:border-indigo-300 border border-slate-200 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
                                        >
                                            <div className="flex items-center space-x-2.5 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
                                                    M
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-xs text-slate-900 group-hover:text-indigo-900 truncate">Mahasiswa (PAI)</p>
                                                    <p className="text-[10px] text-slate-500 font-mono truncate">21010042</p>
                                                </div>
                                            </div>
                                            <span className="px-2.5 py-1 bg-white group-hover:bg-indigo-600 group-hover:text-white text-slate-700 border border-slate-200 group-hover:border-indigo-600 rounded-lg text-[10px] font-bold transition shrink-0">
                                                Masuk
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Live Activity & Audit Trail */}
                                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                        <div className="flex items-center space-x-2">
                                            <div className="p-1 rounded-lg bg-rose-50 text-rose-600">
                                                <ShieldAlert className="w-3.5 h-3.5" />
                                            </div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                                Aktivitas & Audit Trail
                                            </h3>
                                        </div>
                                        <Link href="/admin/audit-logs" className="text-xs font-bold text-slate-500 hover:text-slate-800">
                                            Semua Log →
                                        </Link>
                                    </div>

                                    <div className="space-y-2">
                                        {auditFeed && auditFeed.length > 0 ? (
                                            auditFeed.map((item) => (
                                                <div key={item.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-slate-900 truncate max-w-[130px]">
                                                            {item.user_name || 'System / Guest'}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-slate-400">
                                                            {item.created_at}
                                                        </span>
                                                    </div>
                                                    <p className="font-mono text-indigo-700 font-semibold text-[11px] truncate">
                                                        {item.action}
                                                    </p>
                                                    <p className="text-slate-400 text-[10px]">
                                                        IP: {item.ip_address || '127.0.0.1'} • {item.target_entity || 'System'}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-xs italic">
                                                Belum ada rekaman log audit terbaru.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ========================================================================= */}
                {/* 2. KHUSUS ADMIN BAAK (COMPACT) */}
                {/* ========================================================================= */}
                {role === 'admin_akademik' && (
                    <>
                        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-blue-800/40">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-black mb-1">
                                        <School className="w-3 h-3 text-blue-400" />
                                        <span>PORTAL BIRO AKADEMIK (BAAK)</span>
                                    </div>
                                    <h2 className="text-base sm:text-lg font-black tracking-tight">
                                        {greeting.text}, {user.name} {greeting.emoji}
                                    </h2>
                                    <p className="text-[11px] text-blue-200 mt-0.5 italic max-w-xl">
                                        "{quote.text}" — <span className="font-semibold text-blue-300">{quote.author}</span>
                                    </p>
                                </div>

                                {academic?.active_period && (
                                    <div className="bg-white/10 rounded-lg p-2 border border-white/10 text-left">
                                        <p className="text-[9px] text-blue-300 uppercase font-bold">Periode Aktif</p>
                                        <p className="text-xs font-extrabold text-white">{academic.active_period.name}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Statistik Operasional (Compact) */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] font-bold text-slate-500">Mahasiswa Aktif</span>
                                <p className="text-lg font-black text-slate-900 mt-1">1,248</p>
                                <p className="text-[9px] text-emerald-600 font-semibold">5 Prodi S1</p>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] font-bold text-slate-500">Beban Kurikulum</span>
                                <p className="text-lg font-black text-slate-900 mt-1">144 SKS</p>
                                <p className="text-[9px] text-blue-600 font-semibold">Kurikulum OBE</p>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] font-bold text-slate-500">Gedung & Ruang</span>
                                <p className="text-lg font-black text-slate-900 mt-1">2 Gd / 4 Ruang</p>
                                <p className="text-[9px] text-purple-600 font-semibold">355 Kursi</p>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] font-bold text-slate-500">Dosen Pengajar</span>
                                <p className="text-lg font-black text-slate-900 mt-1">42 Dosen</p>
                                <p className="text-[9px] text-emerald-600 font-semibold">Sync LMS Aktif</p>
                            </div>
                        </div>

                        {/* Shortcut BAAK */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                            <h3 className="text-xs font-black text-slate-900 uppercase">Akses Cepat Pengelolaan</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                                <Link href="/admin/facilities" className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg transition text-left">
                                    <Building2 className="w-4 h-4 text-blue-600 mb-1" />
                                    <p className="text-[11px] font-bold text-slate-900">Gedung & Ruang</p>
                                </Link>
                                <Link href="/admin/curricula" className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg transition text-left">
                                    <GraduationCap className="w-4 h-4 text-blue-600 mb-1" />
                                    <p className="text-[11px] font-bold text-slate-900">Kurikulum SKS</p>
                                </Link>
                                <Link href="/admin/users" className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg transition text-left">
                                    <Users className="w-4 h-4 text-blue-600 mb-1" />
                                    <p className="text-[11px] font-bold text-slate-900">Data Akun Civitas</p>
                                </Link>
                                <Link href="/admin/academic-periods" className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg transition text-left">
                                    <School className="w-4 h-4 text-blue-600 mb-1" />
                                    <p className="text-[11px] font-bold text-slate-900">Tahun & Semester</p>
                                </Link>
                            </div>
                        </div>
                    </>
                )}

                {/* ========================================================================= */}
                {/* 3. KHUSUS MAHASISWA (COMPACT) */}
                {/* ========================================================================= */}
                {role === 'mahasiswa' && (
                    <>
                        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-slate-700/50">
                            <h2 className="text-base sm:text-lg font-black">
                                {greeting.text}, {user.name} {greeting.emoji}
                            </h2>
                            <p className="text-[11px] text-emerald-200 mt-0.5 italic">
                                "{quote.text}" — <span className="font-semibold text-emerald-300">{quote.author}</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs lg:col-span-2 space-y-3">
                                <h3 className="text-xs font-black text-slate-900 uppercase">Tagihan & VA BSI</h3>
                                <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-xl p-3.5 text-white">
                                    <p className="text-[9px] text-emerald-300 font-bold uppercase tracking-wider">Bank Syariah Indonesia (BSI) VA</p>
                                    <p className="text-lg font-mono font-black text-emerald-400 tracking-wider mt-0.5">9928 02 21010042</p>
                                    <p className="text-[11px] text-slate-300 mt-1">SPP Semester Ganjil • Rp 2.500.000,- (<span className="text-emerald-400 font-bold">LUNAS</span>)</p>
                                </div>
                                <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg text-[11px] text-emerald-900 border border-emerald-200">
                                    <span>Financial Lock: Terbuka (Bisa isi KRS)</span>
                                    <Link href="/student/krs" className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded text-[10px]">Isi KRS →</Link>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                                <h3 className="text-xs font-black text-slate-900 uppercase">Ringkasan Studi</h3>
                                <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between items-center text-[11px]">
                                    <span className="text-slate-600">IPK:</span>
                                    <span className="font-black text-emerald-600 text-sm">3.82</span>
                                </div>
                                <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between items-center text-[11px]">
                                    <span className="text-slate-600">SKS Lulus:</span>
                                    <span className="font-black text-slate-900 text-sm">68 / 144</span>
                                </div>
                                <Link href="/student/khs" className="block text-center py-1.5 bg-slate-800 text-white rounded-lg text-[11px] font-bold hover:bg-slate-900">
                                    Lihat KHS Digital
                                </Link>
                            </div>
                        </div>
                    </>
                )}

                {/* ========================================================================= */}
                {/* 4. KHUSUS DOSEN & DOSEN PA (PORTAL AKADEMIK DOSEN) */}
                {/* ========================================================================= */}
                {(role === 'dosen' || role === 'dosen_pa') && (
                    <div className="space-y-4">
                        {/* Header Banner Dosen */}
                        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-teal-800/40">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-black mb-1">
                                        <Award className="w-3 h-3 text-teal-400" />
                                        <span>PORTAL DOSEN PENGAMPU {role === 'dosen_pa' ? '& PEMBIMBING AKADEMIK (PA)' : ''}</span>
                                    </div>
                                    <h2 className="text-base sm:text-lg font-black tracking-tight">
                                        {greeting.text}, {user.name} {greeting.emoji}
                                    </h2>
                                    <p className="text-[11px] text-teal-200 mt-0.5">
                                        NIDN: <span className="font-mono font-bold text-white">{user.identity_number || '-'}</span> • {user.study_program || 'STAI Al-Ittihad Cianjur'}
                                    </p>
                                    <p className="text-[11px] text-slate-300 mt-1 italic max-w-xl">
                                        "{quote.text}" — <span className="font-semibold text-teal-300">{quote.author}</span>
                                    </p>
                                </div>

                                {academic?.active_period && (
                                    <div className="bg-white/10 rounded-xl p-3 border border-white/10 text-left shrink-0">
                                        <p className="text-[9px] text-teal-300 uppercase font-bold">Semester Aktif</p>
                                        <p className="text-xs font-extrabold text-white">{academic.active_period.name}</p>
                                        <p className="text-[10px] text-emerald-300 mt-0.5">Sync Penilaian Terbuka</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 4 Stat Cards Dosen */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Kelas Mengajar</span>
                                <p className="text-base sm:text-lg font-black text-slate-900 mt-1">{lecturerStats.total_classes || 0} Kelas</p>
                                <p className="text-[10px] text-emerald-600 font-semibold">{lecturerStats.total_credits || 0} Total SKS</p>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Mahasiswa Diajar</span>
                                <p className="text-base sm:text-lg font-black text-slate-900 mt-1">{lecturerStats.total_students || 0} Mahasiswa</p>
                                <p className="text-[10px] text-blue-600 font-semibold">Aktif Terdaftar</p>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Status Input DPNA</span>
                                <p className="text-base sm:text-lg font-black text-emerald-700 mt-1">
                                    {lecturerStats.completed_classes || 0} Selesai
                                </p>
                                <p className="text-[10px] text-amber-600 font-semibold">
                                    {lecturerStats.open_classes || 0} Kelas Belum Lengkap
                                </p>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">
                                    {role === 'dosen_pa' ? 'Mahasiswa Bimbingan' : 'Nilai Terkunci'}
                                </span>
                                <p className="text-base sm:text-lg font-black text-purple-700 mt-1">
                                    {role === 'dosen_pa' 
                                        ? `${lecturerStats.advising_students || 0} Mahasiswa` 
                                        : `${lecturerStats.locked_classes || 0} Kelas (Lock)`}
                                </p>
                                <p className="text-[10px] text-purple-600 font-semibold">
                                    {role === 'dosen_pa' ? 'Perwalian Aktif' : 'DPNA Resmi'}
                                </p>
                            </div>
                        </div>

                        {/* DAFTAR MATA KULIAH & KELAS YANG DIAMPU */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase flex items-center space-x-2">
                                        <BookOpen className="w-4 h-4 text-emerald-600" />
                                        <span>Mata Kuliah & Kelas yang Diampu Semester Ini</span>
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Menampilkan seluruh mata kuliah yang Anda ampu beserta status pengisian lembar nilai DPNA.
                                    </p>
                                </div>
                                <Link 
                                    href="/admin/grades"
                                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
                                >
                                    <span>Buka Semua di Modul Penilaian</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            {lecturerClasses.length === 0 ? (
                                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <Award className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                                    <p className="text-xs font-bold text-slate-600">Belum ada kelas perkuliahan yang ditugaskan.</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Hubungi BAAK jika Anda telah ditugaskan mengampu mata kuliah pada semester ini.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {lecturerClasses.map((cls) => (
                                        <div 
                                            key={cls.id}
                                            className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-3"
                                        >
                                            {/* Info MK & Kelas */}
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        {cls.course_code}
                                                    </span>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                                                        Kelas {cls.name}
                                                    </span>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                                        {cls.credits} SKS
                                                    </span>
                                                    <span className="text-[10px] text-slate-500">
                                                        Semester {cls.semester_level || 1}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-black text-slate-900">
                                                    {cls.course_name}
                                                </h4>
                                                <p className="text-[11px] text-slate-500 flex items-center space-x-2">
                                                    <span>🏛️ {cls.room_name || 'Ruang Kuliah'}</span>
                                                    <span>•</span>
                                                    <span>👥 <strong>{cls.enrolled_count}</strong> Mahasiswa Terdaftar</span>
                                                </p>
                                            </div>

                                            {/* Status Nilai DPNA */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                {cls.is_locked ? (
                                                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                        <Lock className="w-3 h-3" />
                                                        <span>DPNA Terkunci</span>
                                                    </span>
                                                ) : cls.is_completed ? (
                                                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>Nilai Lengkap</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{cls.graded_count}/{cls.enrolled_count} Terinput</span>
                                                    </span>
                                                )}

                                                <div className="flex items-center space-x-1.5 ml-auto md:ml-0">
                                                    <Link
                                                        href={`/admin/grades/${cls.id}`}
                                                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-xs"
                                                    >
                                                        <Award className="w-3.5 h-3.5" />
                                                        <span>Input Nilai DPNA</span>
                                                    </Link>

                                                    <a
                                                        href={`/admin/grades/${cls.id}/export-excel`}
                                                        download
                                                        title="Ekspor DPNA ke Excel (.xls)"
                                                        className="p-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-lg transition"
                                                    >
                                                        <FileSpreadsheet className="w-4 h-4" />
                                                    </a>

                                                    <a
                                                        href={`/admin/grades/${cls.id}/export-pdf`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        title="Cetak DPNA Resmi (PDF)"
                                                        className="p-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition"
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* PINTASAN CEPAT MENU DOSEN */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <Link href="/admin/grades" className="p-3 bg-white hover:bg-emerald-50 border border-slate-200 rounded-xl transition text-left space-y-1">
                                <Award className="w-5 h-5 text-emerald-600" />
                                <p className="text-xs font-black text-slate-900">Modul DPNA</p>
                                <p className="text-[10px] text-slate-500">Lembar Penilaian</p>
                            </Link>
                            {role === 'dosen_pa' && (
                                <Link href="/admin/academic-advising" className="p-3 bg-white hover:bg-blue-50 border border-slate-200 rounded-xl transition text-left space-y-1">
                                    <UserCheck2 className="w-5 h-5 text-blue-600" />
                                    <p className="text-xs font-black text-slate-900">Bimbingan PA</p>
                                    <p className="text-[10px] text-slate-500">Persetujuan KRS</p>
                                </Link>
                            )}
                            <Link href="/admin/schedules" className="p-3 bg-white hover:bg-purple-50 border border-slate-200 rounded-xl transition text-left space-y-1">
                                <Clock className="w-5 h-5 text-purple-600" />
                                <p className="text-xs font-black text-slate-900">Jadwal Kuliah</p>
                                <p className="text-[10px] text-slate-500">Waktu & Ruangan</p>
                            </Link>
                            <a href="https://lms.stai-alittihad.ac.id" target="_blank" rel="noreferrer" className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition text-left space-y-1">
                                <GraduationCap className="w-5 h-5 text-emerald-700" />
                                <p className="text-xs font-black text-emerald-900">SALAM LMS</p>
                                <p className="text-[10px] text-emerald-700">E-Learning Kampus</p>
                            </a>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* 5. KHUSUS KEUANGAN & KAPRODI */}
                {/* ========================================================================= */}
                {(role === 'keuangan' || role === 'kaprodi') && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                        <div>
                            <h3 className="text-sm font-black text-slate-900">
                                {greeting.text}, {user.name} {greeting.emoji}
                            </h3>
                            <p className="text-[11px] text-slate-500 italic mt-0.5">
                                "{quote.text}" — <span className="font-semibold text-slate-700">{quote.author}</span>
                            </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                            <Link href="/admin/grades" className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-800">
                                🎖️ Penilaian DPNA
                            </Link>
                            <Link href="/admin/curricula" className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-800">
                                📚 Kurikulum
                            </Link>
                            <Link href="/admin/facilities" className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-800">
                                🏛️ Gedung & Ruang
                            </Link>
                            <a href="https://lms.stai-alittihad.ac.id" target="_blank" rel="noreferrer" className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 text-[11px] font-bold text-center transition">
                                💻 SALAM LMS
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
