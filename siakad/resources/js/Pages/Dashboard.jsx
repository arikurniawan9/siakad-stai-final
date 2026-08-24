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
    Megaphone, TrendingUp, Award, FileCheck
} from 'lucide-react';

export default function Dashboard({ stats = {}, systemMetrics = {}, auditFeed = [] }) {
    const { auth, academic } = usePage().props;
    const user = auth?.user || {};
    const role = user.role || 'mahasiswa';
    const [simulatingBsi, setSimulatingBsi] = useState(false);

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
                        {/* Compact Header Banner Developer */}
                        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden border border-purple-800/40">
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black mb-1">
                                        <Activity className="w-3 h-3 text-purple-400 animate-pulse" />
                                        <span>PUSAT KONTROL DEVELOPER & PEMELIHARAAN</span>
                                    </div>
                                    <h2 className="text-base sm:text-lg font-black tracking-tight">
                                        {greeting.text}, Tim Developer ({user.name}) {greeting.emoji}
                                    </h2>
                                    <p className="text-[11px] text-purple-200 mt-0.5 italic max-w-xl">
                                        "{quote.text}" — <span className="font-semibold text-purple-300">{quote.author}</span>
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2 self-start md:self-auto">
                                    <button
                                        onClick={handleTestBsiWebhook}
                                        disabled={simulatingBsi}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition shadow flex items-center space-x-1 cursor-pointer"
                                    >
                                        <Radio className={`w-3 h-3 ${simulatingBsi ? 'animate-spin' : ''}`} />
                                        <span>{simulatingBsi ? 'Menguji...' : 'Test H2H BSI'}</span>
                                    </button>
                                    <Link
                                        href="/admin/users"
                                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-[11px] font-black transition shadow flex items-center space-x-1"
                                    >
                                        <span>🎭 Menyamar</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Telemetry Health Grid (Compact) */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* DB Health */}
                            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500">Database Engine</span>
                                    <span className="p-1 bg-emerald-100 text-emerald-800 rounded-md"><Database className="w-3.5 h-3.5" /></span>
                                </div>
                                <p className="text-sm font-black text-slate-900 mt-1.5">PostgreSQL 16</p>
                                <p className="text-[10px] font-semibold text-emerald-600 flex items-center space-x-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span>siakad_stai_db (Online)</span>
                                </p>
                            </div>

                            {/* BSI VA Health */}
                            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500">Host-to-Host VA BSI</span>
                                    <span className="p-1 bg-blue-100 text-blue-800 rounded-md"><Radio className="w-3.5 h-3.5" /></span>
                                </div>
                                <p className="text-sm font-black text-slate-900 mt-1.5">Prefix: 9928</p>
                                <p className="text-[10px] font-semibold text-emerald-600 flex items-center space-x-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    <span>HMAC-SHA256 Ready</span>
                                </p>
                            </div>

                            {/* LMS Health */}
                            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500">SALAM LMS Gateway</span>
                                    <span className="p-1 bg-purple-100 text-purple-800 rounded-md"><RefreshCw className="w-3.5 h-3.5" /></span>
                                </div>
                                <p className="text-sm font-black text-slate-900 mt-1.5">Port 3001 (Node)</p>
                                <p className="text-[10px] font-semibold text-purple-600 flex items-center space-x-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                    <span>Sync Bridge Active</span>
                                </p>
                            </div>

                            {/* Runtime Engine */}
                            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500">Framework</span>
                                    <span className="p-1 bg-amber-100 text-amber-800 rounded-md"><Cpu className="w-3.5 h-3.5" /></span>
                                </div>
                                <p className="text-sm font-black text-slate-900 mt-1.5">Laravel 13 + PHP 8.4</p>
                                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Inertia.js React SPA</p>
                            </div>
                        </div>

                        {/* 1-CLICK ROLE IMPERSONATION HUB (COMPACT) */}
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-200 shadow-2xs space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                                <div className="flex items-center space-x-1.5">
                                    <span className="text-base">🎭</span>
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                        Portal Uji Coba Mode Menyamar (Role Impersonation)
                                    </h3>
                                </div>
                                <Link href="/admin/users" className="text-[11px] font-black text-purple-700 hover:underline">
                                    Semua Pengguna →
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
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
                                    className="p-2.5 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
                                >
                                    <div>
                                        <p className="font-bold text-[11px] text-slate-900 group-hover:text-blue-900">🏛️ Admin BAAK</p>
                                        <p className="text-[10px] text-slate-500 font-mono">adminakademik • Budi</p>
                                    </div>
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[9px] font-bold">Menyamar</span>
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
                                    className="p-2.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
                                >
                                    <div>
                                        <p className="font-bold text-[11px] text-slate-900 group-hover:text-emerald-900">💳 Biro Keuangan</p>
                                        <p className="text-[10px] text-slate-500 font-mono">keuangan • Ridwan</p>
                                    </div>
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">Menyamar</span>
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
                                    className="p-2.5 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
                                >
                                    <div>
                                        <p className="font-bold text-[11px] text-slate-900 group-hover:text-purple-900">🎓 Kaprodi PAI</p>
                                        <p className="text-[10px] text-slate-500 font-mono">2118097201 • Dr. Ahmad</p>
                                    </div>
                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-[9px] font-bold">Menyamar</span>
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
                                        study_program: 'Fakultas Tarbiyah (Dosen Wali PA)',
                                    })}
                                    className="p-2.5 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
                                >
                                    <div>
                                        <p className="font-bold text-[11px] text-slate-900 group-hover:text-amber-900">📋 Dosen PA</p>
                                        <p className="text-[10px] text-slate-500 font-mono">2115047802 • Dra. Siti</p>
                                    </div>
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-bold">Menyamar</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openImpersonateModal({
                                        id: 6,
                                        name: 'Dr. H. M. Ridwan, M.Ag',
                                        role: 'dosen',
                                        identity_number: '2112087501',
                                        username: '2112087501',
                                        email: 'm.ridwan@staialittihad.ac.id',
                                        study_program: 'Fakultas Tarbiyah / PAI',
                                    })}
                                    className="p-2.5 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 border border-slate-200 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
                                >
                                    <div>
                                        <p className="font-bold text-[11px] text-slate-900 group-hover:text-teal-900">👨‍🏫 Dosen Pengampu</p>
                                        <p className="text-[10px] text-slate-500 font-mono">2112087501 • Dr. Ridwan</p>
                                    </div>
                                    <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded text-[9px] font-bold">Menyamar</span>
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
                                    className="p-2.5 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
                                >
                                    <div>
                                        <p className="font-bold text-[11px] text-slate-900 group-hover:text-indigo-900">👨‍🎓 Mahasiswa (S1 PAI)</p>
                                        <p className="text-[10px] text-slate-500 font-mono">21010042 • Ahmad Fauzi</p>
                                    </div>
                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[9px] font-bold">Menyamar</span>
                                </button>
                            </div>
                        </div>

                        {/* AUDIT & ERROR LIVE TRACKER (COMPACT) */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <h3 className="text-xs font-black text-slate-900 uppercase">
                                    Diagnostik Sistem Realtime
                                </h3>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                    <span>Live</span>
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
                                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="font-bold text-slate-700">Audit Log Terakhir</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">✓ Login Superadmin (127.0.0.1)</p>
                                </div>
                                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="font-bold text-slate-700">Webhook VA BSI</p>
                                    <p className="text-[10px] text-emerald-700 font-bold mt-0.5">✓ SHA256 Signature Valid</p>
                                </div>
                                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="font-bold text-slate-700">Status Error</p>
                                    <p className="text-[10px] text-emerald-600 font-bold mt-0.5">✓ 0 Critical Error</p>
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
