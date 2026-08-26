import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    LayoutDashboard, Building2, School, GraduationCap, 
    CreditCard, BookOpen, Star, FileText, Settings, 
    LogOut, UserCheck, ShieldAlert, ChevronDown, Menu, 
    X, Bell, ExternalLink, RefreshCw, UserCheck2, Landmark,
    Activity, Database, Terminal, ShieldCheck, AlertOctagon, Server,
    Users, ChevronLeft, ChevronRight, HardDrive, Cpu, Radio, Award,
    Megaphone, FileCheck, Sparkles, BookMarked, ArrowRightLeft, Layers
} from 'lucide-react';

export default function AppLayout({ title, children }) {
    const { auth, academic, flash } = usePage().props;
    const pageUrl = usePage().url || '';
    const user = auth?.user || {};
    const impersonation = auth?.impersonation || {};
    
    // Sidebar state: collapsed on desktop, open on mobile
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const userDropdownRef = useRef(null);

    // Auto-close user dropdown on outside click and ESC key press
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setUserDropdownOpen(false);
                setShowProfileModal(false);
            }
        };

        if (userDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [userDropdownOpen]);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const role = user.role || 'mahasiswa';

    const handleStopImpersonate = (e) => {
        e.preventDefault();
        router.post('/impersonate/stop');
    };

    // Helper to determine active route
    const isItemActive = (href) => {
        if (!href) return false;
        if (href === '/dashboard') {
            return pageUrl === '/dashboard';
        }
        return pageUrl.startsWith(href);
    };

    // Helper for vibrant, luxury color-coded icon badges
    const getMenuIconStyle = (href, highlight, isActive) => {
        if (highlight) {
            return {
                boxBg: isActive 
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30' 
                    : 'bg-purple-900/40 text-amber-300 ring-1 ring-purple-500/40 group-hover:bg-amber-400 group-hover:text-slate-950',
                activeItemBg: 'bg-purple-950/80 text-amber-200 border-l-2 border-amber-400 shadow-inner'
            };
        }
        if (href.includes('/announcements')) {
            return {
                boxBg: isActive 
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' 
                    : 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30 group-hover:bg-amber-500 group-hover:text-white',
                activeItemBg: 'bg-amber-950/40 text-amber-200 border-l-2 border-amber-400'
            };
        }
        if (href.includes('/curricula')) {
            return {
                boxBg: isActive 
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30' 
                    : 'bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/30 group-hover:bg-purple-500 group-hover:text-white',
                activeItemBg: 'bg-purple-950/40 text-purple-200 border-l-2 border-purple-400'
            };
        }
        if (href.includes('/courses')) {
            return {
                boxBg: isActive 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
                    : 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-white',
                activeItemBg: 'bg-emerald-950/40 text-emerald-200 border-l-2 border-emerald-400'
            };
        }
        if (href.includes('/course-curriculum')) {
            return {
                boxBg: isActive 
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' 
                    : 'bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white',
                activeItemBg: 'bg-indigo-950/40 text-indigo-200 border-l-2 border-indigo-400'
            };
        }
        if (href.includes('/users')) {
            return {
                boxBg: isActive 
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' 
                    : 'bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white',
                activeItemBg: 'bg-indigo-950/40 text-indigo-200 border-l-2 border-indigo-400'
            };
        }
        if (href.includes('/study-programs')) {
            return {
                boxBg: isActive 
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' 
                    : 'bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white',
                activeItemBg: 'bg-indigo-950/40 text-indigo-200 border-l-2 border-indigo-400'
            };
        }
        if (href.includes('/students')) {
            return {
                boxBg: isActive 
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30' 
                    : 'bg-teal-500/15 text-teal-400 ring-1 ring-teal-500/30 group-hover:bg-teal-500 group-hover:text-white',
                activeItemBg: 'bg-teal-950/40 text-teal-200 border-l-2 border-teal-400'
            };
        }
        if (href.includes('/lecturers')) {
            return {
                boxBg: isActive 
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30' 
                    : 'bg-teal-500/15 text-teal-400 ring-1 ring-teal-500/30 group-hover:bg-teal-500 group-hover:text-white',
                activeItemBg: 'bg-teal-950/40 text-teal-200 border-l-2 border-teal-400'
            };
        }
        if (href.includes('/krs-approval') || href.includes('/student/krs')) {
            return {
                boxBg: isActive 
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' 
                    : 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30 group-hover:bg-blue-500 group-hover:text-white',
                activeItemBg: 'bg-blue-950/40 text-blue-200 border-l-2 border-blue-400'
            };
        }
        if (href.includes('/grades') || href.includes('/student/khs')) {
            return {
                boxBg: isActive 
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30' 
                    : 'bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30 group-hover:bg-rose-500 group-hover:text-white',
                activeItemBg: 'bg-rose-950/40 text-rose-200 border-l-2 border-rose-400'
            };
        }
        if (href.includes('/edom')) {
            return {
                boxBg: isActive 
                    ? 'bg-yellow-500 text-slate-950 shadow-md shadow-yellow-500/30' 
                    : 'bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/30 group-hover:bg-yellow-500 group-hover:text-slate-950',
                activeItemBg: 'bg-yellow-950/40 text-yellow-200 border-l-2 border-yellow-400'
            };
        }
        if (href.includes('/yudisium')) {
            return {
                boxBg: isActive 
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30' 
                    : 'bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/30 group-hover:bg-purple-500 group-hover:text-white',
                activeItemBg: 'bg-purple-950/40 text-purple-200 border-l-2 border-purple-400'
            };
        }
        if (href.includes('/letters')) {
            return {
                boxBg: isActive 
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30' 
                    : 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-white',
                activeItemBg: 'bg-cyan-950/40 text-cyan-200 border-l-2 border-cyan-400'
            };
        }
        if (href.includes('/bsi-gateway')) {
            return {
                boxBg: isActive 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
                    : 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-white',
                activeItemBg: 'bg-emerald-950/40 text-emerald-200 border-l-2 border-emerald-400'
            };
        }
        if (href.includes('/finance') || href.includes('/student/bills')) {
            return {
                boxBg: isActive 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
                    : 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-white',
                activeItemBg: 'bg-emerald-950/40 text-emerald-200 border-l-2 border-emerald-400'
            };
        }
        if (href.includes('/pmb')) {
            return {
                boxBg: isActive 
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30' 
                    : 'bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30 group-hover:bg-orange-500 group-hover:text-white',
                activeItemBg: 'bg-orange-950/40 text-orange-200 border-l-2 border-orange-400'
            };
        }
        if (href.includes('/audit-logs')) {
            return {
                boxBg: isActive 
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/30' 
                    : 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30 group-hover:bg-red-500 group-hover:text-white',
                activeItemBg: 'bg-red-950/40 text-red-200 border-l-2 border-red-400'
            };
        }
        if (href.includes('/facilities')) {
            return {
                boxBg: isActive 
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' 
                    : 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30 group-hover:bg-blue-500 group-hover:text-white',
                activeItemBg: 'bg-blue-950/40 text-blue-200 border-l-2 border-blue-400'
            };
        }
        if (href.includes('/academic-periods')) {
            return {
                boxBg: isActive 
                    ? 'bg-lime-500 text-slate-950 shadow-md shadow-lime-500/30' 
                    : 'bg-lime-500/15 text-lime-400 ring-1 ring-lime-500/30 group-hover:bg-lime-500 group-hover:text-slate-950',
                activeItemBg: 'bg-lime-950/40 text-lime-200 border-l-2 border-lime-400'
            };
        }
        if (href.includes('/schedules')) {
            return {
                boxBg: isActive 
                    ? 'bg-fuchsia-500 text-white shadow-md shadow-fuchsia-500/30' 
                    : 'bg-fuchsia-500/15 text-fuchsia-400 ring-1 ring-fuchsia-500/30 group-hover:bg-fuchsia-500 group-hover:text-white',
                activeItemBg: 'bg-fuchsia-950/40 text-fuchsia-200 border-l-2 border-fuchsia-400'
            };
        }
        if (href.includes('/lms-sync')) {
            return {
                boxBg: isActive 
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30' 
                    : 'bg-teal-500/15 text-teal-400 ring-1 ring-teal-500/30 group-hover:bg-teal-500 group-hover:text-white',
                activeItemBg: 'bg-teal-950/40 text-teal-200 border-l-2 border-teal-400'
            };
        }
        if (href.includes('/pddikti')) {
            return {
                boxBg: isActive 
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30' 
                    : 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-white',
                activeItemBg: 'bg-cyan-950/40 text-cyan-200 border-l-2 border-cyan-400'
            };
        }
        if (href.includes('/database')) {
            return {
                boxBg: isActive 
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' 
                    : 'bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white',
                activeItemBg: 'bg-indigo-950/40 text-indigo-200 border-l-2 border-indigo-400'
            };
        }
        if (href.includes('/settings')) {
            return {
                boxBg: isActive 
                    ? 'bg-slate-300 text-slate-950 shadow-md shadow-slate-400/30' 
                    : 'bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/30 group-hover:bg-slate-300 group-hover:text-slate-950',
                activeItemBg: 'bg-slate-900 text-white border-l-2 border-slate-400'
            };
        }
        if (href.includes('/dashboard')) {
            return {
                boxBg: isActive 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
                    : 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-white',
                activeItemBg: 'bg-emerald-950/40 text-emerald-200 border-l-2 border-emerald-400'
            };
        }
        return {
            boxBg: isActive 
                ? 'bg-emerald-500 text-white shadow-md' 
                : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700 group-hover:text-white',
            activeItemBg: 'bg-slate-900 text-white border-l-2 border-emerald-400'
        };
    };

    // MENU KHUSUS SUPERADMIN (TIM DEVELOPER & SYSADMIN)
    const getSuperadminNav = () => [
        { label: 'Dasbor Developer', href: '/dashboard', icon: Activity },
        { header: 'MASTER AKADEMIK' },
        { label: 'Master Gedung & Ruang', href: '/admin/facilities', icon: Building2 },
        { label: 'Tahun & Periode Semester', href: '/admin/academic-periods', icon: School },
        { label: 'Penjadwalan Kuliah', href: '/admin/schedules', icon: BookOpen },
        { header: 'STRUKTUR KURIKULUM' },
        { label: 'Program Studi & Fakultas', href: '/admin/study-programs', icon: GraduationCap },
        { label: 'Data Kurikulum', href: '/admin/curricula', icon: Layers },
        { label: 'Data Mata Kuliah', href: '/admin/courses', icon: BookMarked },
        { label: 'Matakuliah - Kurikulum', href: '/admin/course-curriculum', icon: ArrowRightLeft },
        { header: 'PERBANKAN & BILLING BSI' },
        { label: 'BSI Smart Billing H2H', href: '/admin/bsi-gateway', icon: Landmark, highlight: true },
        { label: 'Keuangan & Setup Tarif VA', href: '/admin/finance', icon: CreditCard },
        { label: 'Penerimaan Mahasiswa (PMB)', href: '/admin/pmb', icon: UserCheck2 },
        { header: 'KESEHATAN & DATABASE' },
        { label: 'Backup & Seeder Database', href: '/admin/database', icon: Database },
        { label: 'Audit Log & Keamanan', href: '/admin/audit-logs', icon: ShieldAlert },
        { header: 'INTEGRASI SERVER & LMS' },
        { label: 'Sinkronisasi SALAM LMS', href: '/admin/lms-sync', icon: RefreshCw },
        { label: 'Neo Feeder PDDIKTI', href: '/admin/pddikti', icon: Server },
        { header: 'DATA CIVITAS & PENGGUNA' },
        { label: 'Semua Akun (Portal Menyamar)', href: '/admin/users', icon: ShieldCheck, highlight: true },
        { label: 'Data Mahasiswa', href: '/admin/students', icon: GraduationCap },
        { label: 'Data Dosen & Pengajar', href: '/admin/lecturers', icon: Users },
        { header: 'OPERASIONAL AKADEMIK' },
        { label: 'Pusat Pengumuman', href: '/admin/announcements', icon: Megaphone },
        { label: 'Approval KRS Mahasiswa', href: '/admin/krs-approval', icon: UserCheck },
        { label: 'Gradebook & DPNA Nilai', href: '/admin/grades', icon: Award },
        { label: 'Evaluasi Dosen (EDOM)', href: '/admin/edom', icon: Star },
        { label: 'Skrining Yudisium', href: '/admin/yudisium', icon: FileCheck },
        { label: 'Surat Keterangan Aktif', href: '/admin/letters', icon: FileText },
    ];

    // MENU KHUSUS ADMIN (ADMIN BAAK / OPERASIONAL AKADEMIK)
    const getAdminNav = () => [
        { label: 'Dasbor Akademik', href: '/dashboard', icon: LayoutDashboard },
        { header: 'MASTER AKADEMIK' },
        { label: 'Gedung & Ruang Kelas', href: '/admin/facilities', icon: Building2 },
        { label: 'Tahun & Periode Semester', href: '/admin/academic-periods', icon: School },
        { label: 'Penjadwalan Kuliah', href: '/admin/schedules', icon: BookOpen },
        { header: 'STRUKTUR KURIKULUM' },
        { label: 'Program Studi & Fakultas', href: '/admin/study-programs', icon: GraduationCap },
        { label: 'Data Kurikulum', href: '/admin/curricula', icon: Layers },
        { label: 'Data Mata Kuliah', href: '/admin/courses', icon: BookMarked },
        { label: 'Matakuliah - Kurikulum', href: '/admin/course-curriculum', icon: ArrowRightLeft },
        { header: 'DATA CIVITAS AKADEMIKA' },
        { label: 'Data Mahasiswa (Angkatan)', href: '/admin/students', icon: GraduationCap },
        { label: 'Data Dosen & Pengajar', href: '/admin/lecturers', icon: Users },
        { header: 'OPERASIONAL STUDI' },
        { label: 'Pusat Pengumuman', href: '/admin/announcements', icon: Megaphone },
        { label: 'Approval KRS Mahasiswa', href: '/admin/krs-approval', icon: UserCheck },
        { label: 'Gradebook & DPNA Nilai', href: '/admin/grades', icon: Award },
        { label: 'Evaluasi Dosen (EDOM)', href: '/admin/edom', icon: Star },
        { label: 'Skrining Yudisium', href: '/admin/yudisium', icon: FileCheck },
        { label: 'Surat Keterangan Aktif', href: '/admin/letters', icon: FileText },
        { header: 'LAYANAN & KEUANGAN' },
        { label: 'Keuangan & Setup Tarif VA', href: '/admin/finance', icon: CreditCard },
        { label: 'Penerimaan Mahasiswa (PMB)', href: '/admin/pmb', icon: UserCheck2 },
        { label: 'Audit Log Aktivitas', href: '/admin/audit-logs', icon: ShieldAlert },
        { label: 'Sinkronisasi SALAM LMS', href: '/admin/lms-sync', icon: RefreshCw },
        { label: 'Neo Feeder PDDIKTI', href: '/admin/pddikti', icon: Database },
    ];

    // MENU ROLE LAINNYA (Keuangan, Kaprodi, Dosen, Mahasiswa)
    const getOtherRoleNav = () => {
        if (role === 'keuangan') {
            return [
                { label: 'Dasbor Keuangan', href: '/dashboard', icon: LayoutDashboard },
                { header: 'BILLING & PERBANKAN BSI' },
                { label: 'BSI Smart Billing H2H', href: '/admin/bsi-gateway', icon: Landmark, highlight: true },
                { label: 'Tagihan SPP Massal & VA', href: '/admin/finance', icon: CreditCard },
                { label: 'Verifikasi PMB Billing', href: '/admin/finance', icon: UserCheck2 },
            ];
        }
        if (role === 'kaprodi') {
            return [
                { label: 'Dasbor Kaprodi', href: '/dashboard', icon: LayoutDashboard },
                { header: 'MASTER & FASILITAS' },
                { label: 'Gedung & Ruang Kuliah', href: '/admin/facilities', icon: Building2 },
                { header: 'STRUKTUR KURIKULUM' },
                { label: 'Data Kurikulum', href: '/admin/curricula', icon: Layers },
                { label: 'Data Mata Kuliah', href: '/admin/courses', icon: BookMarked },
                { label: 'Matakuliah - Kurikulum', href: '/admin/course-curriculum', icon: ArrowRightLeft },
                { header: 'PROGRAM STUDI' },
                { label: 'Approval KRS Mahasiswa', href: '/admin/krs-approval', icon: UserCheck },
                { label: 'Gradebook & Nilai DPNA', href: '/admin/grades', icon: Award },
                { label: 'Evaluasi Mutu EDOM', href: '/admin/edom', icon: Star },
            ];
        }
        if (role === 'dosen_pa' || role === 'dosen') {
            return [
                { label: 'Dasbor Dosen', href: '/dashboard', icon: LayoutDashboard },
                { header: 'STRUKTUR KURIKULUM' },
                { label: 'Data Kurikulum', href: '/admin/curricula', icon: Layers },
                { label: 'Data Mata Kuliah', href: '/admin/courses', icon: BookMarked },
                { label: 'Matakuliah - Kurikulum', href: '/admin/course-curriculum', icon: ArrowRightLeft },
                { header: 'AKADEMIK & BIMBINGAN' },
                { label: 'Approval KRS Mahasiswa', href: '/admin/krs-approval', icon: UserCheck },
                { label: 'Gradebook & Nilai DPNA', href: '/admin/grades', icon: Award },
                { label: 'Hasil Evaluasi EDOM', href: '/admin/edom', icon: Star },
            ];
        }
        // Mahasiswa
        return [
            { label: 'Dasbor Mahasiswa', href: '/dashboard', icon: LayoutDashboard },
            { header: 'STUDI AKADEMIK' },
            { label: 'KRS Online', href: '/student/krs', icon: BookOpen },
            { label: 'Kartu Hasil Studi (KHS)', href: '/student/khs', icon: FileText },
            { label: 'Tagihan VA BSI Saya', href: '/student/bills', icon: CreditCard },
        ];
    };

    const navItems = role === 'superadmin' ? getSuperadminNav() : role === 'admin_akademik' ? getAdminNav() : getOtherRoleNav();

    return (
        <div className="min-h-screen bg-slate-100/90 flex flex-col font-sans text-slate-800">
            {/* 1. STICKY IMPERSONATION BANNER (MODE MENYAMAR AKTIF) */}
            {impersonation.is_active && (
                <div className="sticky top-0 z-50 h-10 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 shadow-md flex items-center justify-between border-b border-amber-600 shrink-0">
                    <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center font-black text-[10px] animate-pulse">
                            🎭
                        </div>
                        <span className="text-[11px] md:text-xs font-black text-slate-950">
                            MODE MENYAMAR: Sedang melihat sebagai <span className="underline">{user.name}</span> ({user.role?.toUpperCase()}). Real Admin: {impersonation.admin_name}.
                        </span>
                    </div>
                    <button
                        onClick={handleStopImpersonate}
                        className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-amber-400 text-[10px] font-black rounded-lg transition shadow flex items-center space-x-1 cursor-pointer"
                    >
                        <span>✕ Kembali ke Admin</span>
                    </button>
                </div>
            )}

            <div className="flex flex-1 relative">
                {/* 2. PREMIUM SIDEBAR NAVIGATION */}
                <aside 
                    className={`fixed ${impersonation.is_active ? 'top-10 h-[calc(100vh-2.5rem)]' : 'top-0 h-screen'} left-0 z-40 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-300 flex flex-col transition-all duration-200 ease-in-out border-r border-slate-800 shadow-2xl ${
                        mobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
                    } ${sidebarCollapsed ? 'md:w-16' : 'md:w-64'}`}
                >
                    {/* Brand Header (Compact h-14 Glassmorphic) */}
                    <div className="h-14 flex items-center justify-between px-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 relative">
                        <div className="flex items-center space-x-2.5 overflow-hidden">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-base shadow-lg shrink-0 ring-2 ${
                                role === 'superadmin' 
                                    ? 'bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-500 ring-purple-500/30' 
                                    : 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-400 ring-emerald-500/30'
                            }`}>
                                {role === 'superadmin' ? '⚡' : 'S'}
                            </div>
                            {!sidebarCollapsed && (
                                <div className="truncate">
                                    <h1 className="text-xs font-black text-white tracking-wide leading-tight flex items-center space-x-1.5">
                                        <span>SIAKAD</span>
                                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-black border ${
                                            role === 'superadmin' 
                                                ? 'bg-purple-500/30 text-purple-300 border-purple-400/40' 
                                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                                        }`}>
                                            {role === 'superadmin' ? 'DEV' : 'PREMIUM'}
                                        </span>
                                    </h1>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">
                                        {role === 'superadmin' ? 'Developer Control' : 'STAI Al-Ittihad'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Mobile Close Button */}
                        <button onClick={() => setMobileSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* TOMBOL BULAT HIDE-SEEK (DESKTOP TOGGLE BUTTON) */}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        title={sidebarCollapsed ? "Perluas Sidebar" : "Kecilkan Sidebar"}
                        className="hidden md:flex absolute -right-3 top-4 w-6 h-6 rounded-full bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white items-center justify-center shadow-lg border-2 border-slate-950 z-50 transition transform hover:scale-110 cursor-pointer"
                    >
                        {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5 stroke-[3]" /> : <ChevronLeft className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    {/* Nav Items List (Vibrant Color-Coded Icons & Ultra-Sleek Scrollbar) */}
                    <nav className={`flex-1 overflow-y-auto px-2.5 py-3 space-y-1 custom-sidebar-scrollbar ${
                        role === 'superadmin' ? 'developer-scrollbar' : ''
                    }`}>
                        {navItems.map((item, idx) => {
                            if (item.header) {
                                if (sidebarCollapsed) return <div key={idx} className="my-2 border-t border-slate-800/80"></div>;
                                return (
                                    <div key={idx} className="pt-3 pb-1 px-2.5 text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center space-x-1.5">
                                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                        <span>{item.header}</span>
                                    </div>
                                );
                            }
                            const Icon = item.icon;
                            const active = isItemActive(item.href);
                            const iconStyle = getMenuIconStyle(item.href, item.highlight, active);

                            return (
                                <Link
                                    key={idx}
                                    href={item.href}
                                    title={sidebarCollapsed ? item.label : undefined}
                                    className={`flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 group ${
                                        active 
                                            ? `${iconStyle.activeItemBg} shadow-xs font-black` 
                                            : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                                    }`}
                                >
                                    {/* Vibrant Color Icon Box */}
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${iconStyle.boxBg}`}>
                                        <Icon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
                                    </div>
                                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Quick LMS Link & User Pill */}
                    <div className="p-2.5 bg-slate-900/95 border-t border-slate-800/80 space-y-2">
                        <a
                            href="http://localhost:3000"
                            target="_blank"
                            rel="noreferrer"
                            title={sidebarCollapsed ? "Buka SALAM LMS" : undefined}
                            className="flex items-center justify-between px-2.5 py-2 bg-gradient-to-r from-emerald-950/60 to-teal-950/40 hover:from-emerald-900/70 hover:to-teal-900/60 text-emerald-300 border border-emerald-700/40 rounded-xl text-[11px] font-bold transition shadow-xs group"
                        >
                            <span className="flex items-center space-x-2">
                                <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/30">
                                    <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                                </div>
                                {!sidebarCollapsed && <span>Buka SALAM LMS</span>}
                            </span>
                            {!sidebarCollapsed && <ExternalLink className="w-3 h-3 text-emerald-400" />}
                        </a>
                    </div>
                </aside>

                {/* 3. MAIN CONTENT CONTAINER */}
                <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
                    sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
                }`}>
                    {/* Top Header Navbar (Compact h-14 with z-40 to stay above main content) */}
                    <header className={`h-14 bg-white border-b border-slate-200 flex items-center justify-between px-3 md:px-5 sticky ${impersonation.is_active ? 'top-10' : 'top-0'} z-40 shadow-2xs`}>
                        <div className="flex items-center space-x-2.5">
                            <button
                                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                                className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                                <Menu className="w-4 h-4" />
                            </button>

                            {/* Badge Role Indicator */}
                            <div className="flex items-center space-x-1.5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    role === 'superadmin' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                                    role === 'admin_akademik' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                                    role === 'keuangan' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                                    role === 'kaprodi' ? 'bg-indigo-100 text-indigo-900 border border-indigo-300' :
                                    role === 'dosen_pa' || role === 'dosen' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                                    'bg-teal-100 text-teal-900 border border-teal-300'
                                }`}>
                                    {role?.replace('_', ' ')}
                                </span>
                                {academic?.active_period && (
                                    <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                        📅 {academic.active_period.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Right Navigation Controls */}
                        <div className="flex items-center space-x-3">
                            <div ref={userDropdownRef} className="relative z-50">
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className={`flex items-center space-x-2 p-1.5 rounded-xl transition cursor-pointer ${
                                        userDropdownOpen ? 'bg-slate-100 ring-2 ring-emerald-500/30' : 'hover:bg-slate-100'
                                    }`}
                                >
                                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center font-black text-xs shadow-xs">
                                        {user.name ? user.name.charAt(0) : 'U'}
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <p className="text-xs font-bold text-slate-900 truncate max-w-32">{user.name}</p>
                                        <p className="text-[10px] text-slate-400 truncate max-w-32 font-mono">{user.identity_number || user.username}</p>
                                    </div>
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${userDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                                </button>

                                {userDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                        {/* User Identity Box */}
                                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl">
                                            <div className="flex items-center space-x-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                                                    {user.name ? user.name.charAt(0) : 'U'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                                                    <div className="flex items-center space-x-1.5 mt-0.5">
                                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                            {role?.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 truncate font-mono">
                                                            {user.identity_number || user.username}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {user.email && (
                                                <p className="text-[10px] text-slate-500 truncate font-mono mt-1.5">
                                                    {user.email}
                                                </p>
                                            )}
                                        </div>

                                        {/* Action Items */}
                                        <div className="p-1.5 space-y-0.5">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUserDropdownOpen(false);
                                                    setShowProfileModal(true);
                                                }}
                                                className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition cursor-pointer text-left"
                                            >
                                                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                                <span>Pengaturan Profil</span>
                                            </button>

                                            {(role === 'superadmin' || role === 'admin_akademik') && (
                                                <Link
                                                    href="/admin/settings"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition cursor-pointer text-left"
                                                >
                                                    <Settings className="w-4 h-4 text-blue-600 shrink-0" />
                                                    <span>Pengaturan Sistem</span>
                                                </Link>
                                            )}

                                            <div className="my-1 border-t border-slate-100"></div>

                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer text-left"
                                            >
                                                <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                                                <span>Keluar (Logout)</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Flash Notifications */}
                    {flash?.success && (
                        <div className="m-4 mb-0 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between shadow-2xs">
                            <span>✓ {flash.success}</span>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="m-4 mb-0 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center justify-between shadow-2xs">
                            <span>⚠ {flash.error}</span>
                        </div>
                    )}

                    {/* Main Content View Container */}
                    <main className="p-3 sm:p-5 flex-1 overflow-x-hidden">
                        {children}
                    </main>

                    {/* Compact Footer */}
                    <footer className="h-10 bg-white border-t border-slate-200 px-5 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>© 2026 STAI Al-Ittihad Cianjur • SIAKAD Enterprise Engine v2.5</span>
                        <span className="hidden sm:inline">Bank Syariah Indonesia (BSI) VA Ready</span>
                    </footer>
                </div>
            </div>

            {/* MODAL PENGATURAN PROFIL & AKUN */}
            {showProfileModal && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowProfileModal(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-2xs animate-fadeIn"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
                        {/* Header Dark Gradient */}
                        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">
                                    <UserCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xs text-white">Profil & Pengaturan Akun</h3>
                                    <p className="text-[10px] text-slate-300">Informasi kredensial pengguna aktif SIAKAD</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                                    ESC
                                </span>
                                <button 
                                    type="button" 
                                    onClick={() => setShowProfileModal(false)} 
                                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Profile Info Content */}
                        <div className="p-5 space-y-3.5 text-xs">
                            {/* User Identity Card */}
                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-3">
                                <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                                    {user.name ? user.name.charAt(0) : 'U'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-black text-sm text-slate-900 truncate">{user.name}</h4>
                                    <div className="flex items-center space-x-2 mt-0.5">
                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                                            {role?.replace('_', ' ')}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                            @{user.username}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">No. Identitas / NIP / NIM</span>
                                    <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block truncate">
                                        {user.identity_number || '-'}
                                    </span>
                                </div>
                                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Email Terdaftar</span>
                                    <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block truncate">
                                        {user.email || '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Status Card */}
                            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] flex items-start space-x-2.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold">Status Akun Terverifikasi</span>
                                    <p className="text-[10px] text-emerald-800/80 mt-0.5">
                                        Akun aktif dan memiliki izin penuh modul sesuai hak akses role {role?.replace('_', ' ')}.
                                    </p>
                                </div>
                            </div>

                            {/* Security Note */}
                            <div className="p-2.5 bg-slate-50 rounded-xl text-slate-500 text-[10px] border border-slate-200 leading-relaxed">
                                💡 Untuk pembaruan gelar akademik atau pergantian password, silakan hubungi Tim IT / Administrator SIAKAD.
                            </div>

                            {/* Actions Footer */}
                            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                                {(role === 'superadmin' || role === 'admin_akademik') ? (
                                    <Link
                                        href="/admin/settings"
                                        onClick={() => setShowProfileModal(false)}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                                    >
                                        <Settings className="w-3.5 h-3.5" />
                                        <span>Buka Pengaturan Sistem →</span>
                                    </Link>
                                ) : <span />}

                                <button
                                    type="button"
                                    onClick={() => setShowProfileModal(false)}
                                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
