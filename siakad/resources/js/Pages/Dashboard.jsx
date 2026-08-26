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
    Megaphone, TrendingUp, Award, FileCheck, Sliders, Send, Key, Landmark
} from 'lucide-react';

export default function Dashboard({ stats = {}, systemMetrics = {}, auditFeed = [], recentBsiTransactions = [] }) {
    const { auth, academic } = usePage().props;
    const user = auth?.user || {};
    const role = user.role || 'mahasiswa';
    const [simulatingBsi, setSimulatingBsi] = useState(false);
    const [testingBsi, setTestingBsi] = useState(false);

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
            <Head title={role === 'superadmin' ? 'Developer Health & System Dashboard' : 'Dasbor — SIAKAD STAI Al-Ittihad'} />

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
                        {/* 1. Header Banner Developer */}
                        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden border border-purple-800/40">
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black mb-1">
                                        <Activity className="w-3 h-3 text-purple-400 animate-pulse" />
                                        <span>PUSAT KONTROL DEVELOPER & PEMELIHARAAN SISTEM</span>
                                    </div>
                                    <h2 className="text-base sm:text-lg font-black tracking-tight">
                                        {greeting.text}, Tim Developer ({user.name}) {greeting.emoji}
                                    </h2>
                                    <p className="text-[11px] text-purple-200 mt-0.5 italic max-w-xl">
                                        "{quote.text}" — <span className="font-semibold text-purple-300">{quote.author}</span>
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                                    <Link
                                        href="/admin/bsi-gateway"
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition shadow flex items-center space-x-1.5 cursor-pointer border border-emerald-400/40"
                                    >
                                        <Landmark className="w-3.5 h-3.5 text-emerald-300" />
                                        <span>🏦 BSI Smart Billing H2H</span>
                                    </Link>
                                    <Link
                                        href="/admin/database"
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-black transition shadow flex items-center space-x-1"
                                    >
                                        <Database className="w-3 h-3" />
                                        <span>Backup & Seeder DB</span>
                                    </Link>
                                    <Link
                                        href="/admin/settings"
                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold transition shadow flex items-center space-x-1 border border-slate-700"
                                    >
                                        <HardDrive className="w-3 h-3 text-cyan-400" />
                                        <span>Diagnostik</span>
                                    </Link>
                                    <Link
                                        href="/admin/users"
                                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-[11px] font-black transition shadow flex items-center space-x-1"
                                    >
                                        <span>🎭 Menyamar</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* 2. Statistik Utama Kampus & Perbankan (6 KPI Cards) */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                                <div className="flex items-center justify-between text-slate-500">
                                    <span className="text-[10px] font-bold">Mahasiswa</span>
                                    <span className="p-1 rounded-lg bg-teal-50 text-teal-700"><GraduationCap className="w-3.5 h-3.5" /></span>
                                </div>
                                <p className="text-lg font-black text-slate-900 mt-1">{stats.total_students ?? 1248}</p>
                                <p className="text-[9px] text-teal-600 font-semibold mt-0.5">Siswa Terdaftar</p>
                            </div>

                            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                                <div className="flex items-center justify-between text-slate-500">
                                    <span className="text-[10px] font-bold">Dosen Pengajar</span>
                                    <span className="p-1 rounded-lg bg-indigo-50 text-indigo-700"><Users className="w-3.5 h-3.5" /></span>
                                </div>
                                <p className="text-lg font-black text-slate-900 mt-1">{stats.total_lecturers ?? 42}</p>
                                <p className="text-[9px] text-indigo-600 font-semibold mt-0.5">Tenaga Pengajar</p>
                            </div>

                            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                                <div className="flex items-center justify-between text-slate-500">
                                    <span className="text-[10px] font-bold">Program Studi</span>
                                    <span className="p-1 rounded-lg bg-purple-50 text-purple-700"><School className="w-3.5 h-3.5" /></span>
                                </div>
                                <p className="text-lg font-black text-slate-900 mt-1">{stats.total_study_programs ?? 5}</p>
                                <p className="text-[9px] text-purple-600 font-semibold mt-0.5">Jurusan S1 Aktif</p>
                            </div>

                            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                                <div className="flex items-center justify-between text-slate-500">
                                    <span className="text-[10px] font-bold">Penerimaan VA BSI</span>
                                    <span className="p-1 rounded-lg bg-emerald-50 text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                                </div>
                                <p className="text-sm font-black text-emerald-600 mt-1 font-mono truncate">{formatRp(stats.total_va_paid_amount ?? 2500000)}</p>
                                <p className="text-[9px] text-emerald-600 font-semibold mt-0.5">{stats.total_va_paid_count ?? 1} Setoran Lunas</p>
                            </div>

                            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                                <div className="flex items-center justify-between text-slate-500">
                                    <span className="text-[10px] font-bold">Tagihan Pending</span>
                                    <span className="p-1 rounded-lg bg-amber-50 text-amber-700"><Clock className="w-3.5 h-3.5" /></span>
                                </div>
                                <p className="text-sm font-black text-amber-600 mt-1 font-mono truncate">{formatRp(stats.total_va_pending_amount ?? 0)}</p>
                                <p className="text-[9px] text-amber-600 font-semibold mt-0.5">{stats.total_va_pending_count ?? 0} VA Menunggu</p>
                            </div>

                            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                                <div className="flex items-center justify-between text-slate-500">
                                    <span className="text-[10px] font-bold">Pendaftar PMB</span>
                                    <span className="p-1 rounded-lg bg-cyan-50 text-cyan-700"><UserCheck2 className="w-3.5 h-3.5" /></span>
                                </div>
                                <p className="text-lg font-black text-slate-900 mt-1">{stats.total_pmb_applicants ?? 2}</p>
                                <p className="text-[9px] text-cyan-600 font-semibold mt-0.5">PMB 2026/2027</p>
                            </div>
                        </div>

                        {/* 3. Telemetry Health Grid (Compact) */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* DB Health */}
                            <Link 
                                href="/admin/database"
                                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-400 hover:bg-indigo-50/30 transition group block"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-indigo-900">Database Engine</span>
                                    <span className="p-1 bg-emerald-100 text-emerald-800 rounded-md group-hover:bg-indigo-100 group-hover:text-indigo-800"><Database className="w-3.5 h-3.5" /></span>
                                </div>
                                <p className="text-sm font-black text-slate-900 mt-1 group-hover:text-indigo-950">{systemMetrics.db_engine || 'PostgreSQL 16'}</p>
                                <p className="text-[10px] font-semibold text-emerald-600 flex items-center space-x-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span>Kapasitas: {systemMetrics.db_size || '14.2 MB'} ⚙️</span>
                                </p>
                            </Link>

                            {/* BSI Smart Billing Gateway Health */}
                            <Link 
                                href="/admin/bsi-gateway"
                                className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-2xs hover:border-emerald-400 hover:bg-emerald-50/40 transition group block"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-emerald-900">BSI Smart Billing</span>
                                    <span className="p-1 bg-emerald-100 text-emerald-800 rounded-md group-hover:bg-emerald-200"><Landmark className="w-3.5 h-3.5" /></span>
                                </div>
                                <p className="text-sm font-black text-slate-900 mt-1 group-hover:text-emerald-950">BI-SNAP (H2H Direct)</p>
                                <p className="text-[10px] font-semibold text-emerald-600 flex items-center space-x-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span>{systemMetrics.bsi_biller_code || 'Biller 8891 Sandbox Active'}</span>
                                </p>
                            </Link>

                            {/* LMS Health */}
                            <Link
                                href="/admin/lms-sync"
                                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-300 hover:bg-purple-50/30 transition group block"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-purple-900">SALAM LMS Gateway</span>
                                    <span className="p-1 bg-purple-100 text-purple-800 rounded-md group-hover:bg-purple-200"><RefreshCw className="w-3.5 h-3.5" /></span>
                                </div>
                                <p className="text-sm font-black text-slate-900 mt-1 group-hover:text-purple-950">Node.js Express Bridge</p>
                                <p className="text-[10px] font-semibold text-purple-600 flex items-center space-x-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                                    <span>Port 5000 Sync Active</span>
                                </p>
                            </Link>

                            {/* Runtime Engine */}
                            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500">Framework Runtime</span>
                                    <span className="p-1 bg-amber-100 text-amber-800 rounded-md"><Cpu className="w-3.5 h-3.5" /></span>
                                </div>
                                <p className="text-sm font-black text-slate-900 mt-1">Laravel 13 • PHP {systemMetrics.php_version || '8.4'}</p>
                                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Memori: {systemMetrics.server_memory || '24.5 MB'}</p>
                            </div>
                        </div>

                        {/* 4. BSI SMART BILLING & BI-SNAP H2H GATEWAY CONTROL CARD */}
                        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 p-4 sm:p-5 rounded-2xl border border-emerald-800/50 shadow-sm text-white space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-900/60 pb-2.5">
                                <div className="flex items-center space-x-2">
                                    <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
                                        <Landmark className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-xs font-black text-white uppercase tracking-wider">
                                                Pusat Integrasi Bank Syariah Indonesia (BSI) Smart Billing
                                            </h3>
                                            <span className="px-2 py-0.2 bg-amber-400 text-slate-950 rounded text-[9px] font-black">
                                                BI-SNAP Direct H2H
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-emerald-200 mt-0.5">
                                            Koneksi langsung Host-to-Host (H2H) dengan core banking BSI. Otentikasi Service Code 73, inquiry otomatis Code 24, push callback pelunasan Code 25, dan rekening giro penampung.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleQuickTestBsi}
                                        disabled={testingBsi}
                                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white rounded-lg text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                                    >
                                        <Radio className={`w-3 h-3 ${testingBsi ? 'animate-spin' : ''}`} />
                                        <span>{testingBsi ? 'Menguji...' : 'Uji Ping H2H'}</span>
                                    </button>
                                    <Link
                                        href="/admin/bsi-gateway"
                                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition shadow flex items-center space-x-1 cursor-pointer"
                                    >
                                        <Sliders className="w-3 h-3" />
                                        <span>Pusat Kontrol BSI →</span>
                                    </Link>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                                    <span className="text-slate-400">Institusi Biller:</span>
                                    <p className="font-mono font-bold text-amber-300 mt-0.5">8891 - BI-SNAP-DEV</p>
                                </div>
                                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                                    <span className="text-slate-400">Mode Server:</span>
                                    <p className="font-bold text-emerald-400 mt-0.5">🟡 BSI Sandbox (Dev Ready)</p>
                                </div>
                                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                                    <span className="text-slate-400">Routing Network:</span>
                                    <p className="font-bold text-white mt-0.5 truncate">Zone-A (NTT / Telkom)</p>
                                </div>
                                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                                    <span className="text-slate-400">Inbound Endpoints:</span>
                                    <p className="font-mono text-[9px] text-emerald-300 mt-0.5 truncate">/api/v1/bsi/va/inquiry & payment</p>
                                </div>
                            </div>
                        </div>

                        {/* 5. DUA KOLOM UTAMA SUPERADMIN: NAVIGASI MODUL & AUDIT TRAIL */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            {/* KOLOM KIRI (LEBAR 8): MODUL AKSES CEPAT & TRANSAKSI VA TERKINI */}
                            <div className="lg:col-span-8 space-y-4">
                                {/* Grid Akses Cepat Modul Superadmin */}
                                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                                            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>Pusat Manajemen & Modul Superadmin</span>
                                        </h3>
                                        <span className="text-[10px] text-slate-400 font-semibold">Tersusun Berdasarkan Kategori</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {/* Kategori 1: Perbankan & Kas */}
                                        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-emerald-950 flex items-center space-x-1.5">
                                                    <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span>Perbankan & Kas Kampus</span>
                                                </span>
                                            </div>
                                            <div className="space-y-1 text-xs">
                                                <Link href="/admin/bsi-gateway" className="flex items-center justify-between p-1.5 rounded-lg hover:bg-emerald-100/70 text-emerald-900 font-medium transition">
                                                    <span>🏦 Pusat BSI Smart Billing H2H</span>
                                                    <ChevronRight className="w-3 h-3 text-emerald-600" />
                                                </Link>
                                                <Link href="/admin/finance" className="flex items-center justify-between p-1.5 rounded-lg hover:bg-emerald-100/70 text-emerald-900 font-medium transition">
                                                    <span>💳 Setup Tarif SPP, UKT & VA</span>
                                                    <ChevronRight className="w-3 h-3 text-emerald-600" />
                                                </Link>
                                                <Link href="/admin/pmb" className="flex items-center justify-between p-1.5 rounded-lg hover:bg-emerald-100/70 text-emerald-900 font-medium transition">
                                                    <span>📝 Verifikasi Keuangan PMB</span>
                                                    <ChevronRight className="w-3 h-3 text-emerald-600" />
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Kategori 2: Kesehatan & Database */}
                                        <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-indigo-950 flex items-center space-x-1.5">
                                                    <Database className="w-3.5 h-3.5 text-indigo-600" />
                                                    <span>Kesehatan & Keamanan Sistem</span>
                                                </span>
                                            </div>
                                            <div className="space-y-1 text-xs">
                                                <Link href="/admin/database" className="flex items-center justify-between p-1.5 rounded-lg hover:bg-indigo-100/70 text-indigo-900 font-medium transition">
                                                    <span>💾 Backup, Restore & Seeder DB</span>
                                                    <ChevronRight className="w-3 h-3 text-indigo-600" />
                                                </Link>
                                                <Link href="/admin/settings" className="flex items-center justify-between p-1.5 rounded-lg hover:bg-indigo-100/70 text-indigo-900 font-medium transition">
                                                    <span>⚙️ Diagnostik & Maintenance Mode</span>
                                                    <ChevronRight className="w-3 h-3 text-indigo-600" />
                                                </Link>
                                                <Link href="/admin/audit-logs" className="flex items-center justify-between p-1.5 rounded-lg hover:bg-indigo-100/70 text-indigo-900 font-medium transition">
                                                    <span>🛡️ Visual Audit Log & Security</span>
                                                    <ChevronRight className="w-3 h-3 text-indigo-600" />
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Kategori 3: Integrasi Eksternal */}
                                        <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-purple-950 flex items-center space-x-1.5">
                                                    <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
                                                    <span>Integrasi Eksternal & Feeder</span>
                                                </span>
                                            </div>
                                            <div className="space-y-1 text-xs">
                                                <Link href="/admin/lms-sync" className="flex items-center justify-between p-1.5 rounded-lg hover:bg-purple-100/70 text-purple-900 font-medium transition">
                                                    <span>💻 Bridge Sinkronisasi SALAM LMS</span>
                                                    <ChevronRight className="w-3 h-3 text-purple-600" />
                                                </Link>
                                                <Link href="/admin/pddikti" className="flex items-center justify-between p-1.5 rounded-lg hover:bg-purple-100/70 text-purple-900 font-medium transition">
                                                    <span>🏛️ Integrasi Neo Feeder PDDIKTI</span>
                                                    <ChevronRight className="w-3 h-3 text-purple-600" />
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Kategori 4: Civitas & Kurikulum */}
                                        <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/80 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-teal-950 flex items-center space-x-1.5">
                                                    <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                                                    <span>Civitas & Manajemen Studi</span>
                                                </span>
                                            </div>
                                            <div className="space-y-1 text-xs">
                                                <Link href="/admin/users" className="flex items-center justify-between p-1.5 rounded-lg hover:bg-teal-100/70 text-teal-900 font-medium transition">
                                                    <span>👥 Semua Akun Pengguna Civitas</span>
                                                    <ChevronRight className="w-3 h-3 text-teal-600" />
                                                </Link>
                                                <Link href="/admin/curricula" className="flex items-center justify-between p-1.5 rounded-lg hover:bg-teal-100/70 text-teal-900 font-medium transition">
                                                    <span>📚 Master Kurikulum & Matakuliah</span>
                                                    <ChevronRight className="w-3 h-3 text-teal-600" />
                                                </Link>
                                                <Link href="/admin/schedules" className="flex items-center justify-between p-1.5 rounded-lg hover:bg-teal-100/70 text-teal-900 font-medium transition">
                                                    <span>📅 Plotting Jadwal Anti-Bentrok</span>
                                                    <ChevronRight className="w-3 h-3 text-teal-600" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Transaksi Virtual Account BSI Terkini */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                                            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>Transaksi Virtual Account BSI Terkini</span>
                                        </h3>
                                        <Link href="/admin/bsi-gateway" className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1">
                                            <span>Lihat Semua Transaksi</span>
                                            <ChevronRight className="w-3 h-3" />
                                        </Link>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                                                <tr>
                                                    <th className="px-4 py-2.5">No. VA BSI</th>
                                                    <th className="px-4 py-2.5">Mahasiswa / Pendaftar</th>
                                                    <th className="px-4 py-2.5">Pos Tagihan</th>
                                                    <th className="px-4 py-2.5">Nominal</th>
                                                    <th className="px-4 py-2.5">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {recentBsiTransactions && recentBsiTransactions.length > 0 ? (
                                                    recentBsiTransactions.map((tx) => (
                                                        <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                                                            <td className="px-4 py-2.5 font-mono font-bold text-slate-900">
                                                                {tx.va_number}
                                                            </td>
                                                            <td className="px-4 py-2.5">
                                                                <p className="font-bold text-slate-900">{tx.customer_name}</p>
                                                            </td>
                                                            <td className="px-4 py-2.5 text-slate-600">
                                                                {tx.fee_name}
                                                            </td>
                                                            <td className="px-4 py-2.5 font-mono font-bold text-slate-900">
                                                                {formatRp(tx.amount)}
                                                            </td>
                                                            <td className="px-4 py-2.5">
                                                                {tx.status === 'PAID' ? (
                                                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                                                        LUNAS
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                                                        PENDING
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic">
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
                                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-200 shadow-2xs space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <div className="flex items-center space-x-1.5">
                                            <span className="text-base">🎭</span>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                                Mode Menyamar (Impersonate)
                                            </h3>
                                        </div>
                                        <Link href="/admin/users" className="text-[10px] font-bold text-purple-700 hover:underline">
                                            Semua Akun →
                                        </Link>
                                    </div>

                                    <div className="space-y-1.5">
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
                                            className="w-full p-2 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
                                        >
                                            <div>
                                                <p className="font-bold text-[11px] text-slate-900 group-hover:text-blue-900">🏛️ Admin BAAK</p>
                                                <p className="text-[9px] text-slate-500 font-mono">adminakademik</p>
                                            </div>
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[9px] font-bold">Masuk</span>
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
                                            className="w-full p-2 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
                                        >
                                            <div>
                                                <p className="font-bold text-[11px] text-slate-900 group-hover:text-emerald-900">💳 Biro Keuangan</p>
                                                <p className="text-[9px] text-slate-500 font-mono">keuangan</p>
                                            </div>
                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">Masuk</span>
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
                                            className="w-full p-2 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
                                        >
                                            <div>
                                                <p className="font-bold text-[11px] text-slate-900 group-hover:text-purple-900">🎓 Kaprodi PAI</p>
                                                <p className="text-[9px] text-slate-500 font-mono">2118097201</p>
                                            </div>
                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-[9px] font-bold">Masuk</span>
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
                                            className="w-full p-2 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
                                        >
                                            <div>
                                                <p className="font-bold text-[11px] text-slate-900 group-hover:text-amber-900">📋 Dosen PA</p>
                                                <p className="text-[9px] text-slate-500 font-mono">2115047802</p>
                                            </div>
                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-bold">Masuk</span>
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
                                            className="w-full p-2 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
                                        >
                                            <div>
                                                <p className="font-bold text-[11px] text-slate-900 group-hover:text-indigo-900">👨‍🎓 Mahasiswa (S1 PAI)</p>
                                                <p className="text-[9px] text-slate-500 font-mono">21010042</p>
                                            </div>
                                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[9px] font-bold">Masuk</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Live Activity & Audit Trail */}
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <h3 className="text-xs font-black text-slate-900 uppercase flex items-center space-x-1.5">
                                            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                                            <span>Aktivitas Sistem & Audit Trail</span>
                                        </h3>
                                        <Link href="/admin/audit-logs" className="text-[10px] font-bold text-slate-500 hover:text-slate-800">
                                            Semua Log →
                                        </Link>
                                    </div>

                                    <div className="space-y-2">
                                        {auditFeed && auditFeed.length > 0 ? (
                                            auditFeed.map((item) => (
                                                <div key={item.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] space-y-0.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-slate-800 truncate max-w-[120px]">
                                                            {item.user_name || 'System / Guest'}
                                                        </span>
                                                        <span className="text-[9px] font-mono text-slate-400">
                                                            {item.created_at}
                                                        </span>
                                                    </div>
                                                    <p className="font-mono text-emerald-700 font-semibold truncate">
                                                        {item.action}
                                                    </p>
                                                    <p className="text-slate-400 text-[9px]">
                                                        IP: {item.ip_address || '127.0.0.1'} • {item.target_entity || 'System'}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-3 bg-slate-50 rounded-lg text-center text-slate-400 text-[10px]">
                                                Belum ada rekam audit baru.
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
                {/* 4. KHUSUS ROLE LAINNYA */}
                {/* ========================================================================= */}
                {(role === 'keuangan' || role === 'kaprodi' || role === 'dosen' || role === 'dosen_pa') && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                        <div>
                            <h3 className="text-sm font-black text-slate-900">
                                {greeting.text}, {user.name} {greeting.emoji}
                            </h3>
                            <p className="text-[11px] text-slate-500 italic mt-0.5">
                                "{quote.text}" — <span className="font-semibold text-slate-700">{quote.author}</span>
                            </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                            <Link href="/admin/curricula" className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-800">
                                📚 Kurikulum
                            </Link>
                            <Link href="/admin/facilities" className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-800">
                                🏛️ Gedung & Ruang
                            </Link>
                            <a href="http://localhost:3001" target="_blank" rel="noreferrer" className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-[11px] font-bold">
                                💻 SALAM LMS
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
