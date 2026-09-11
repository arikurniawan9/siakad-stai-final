import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import UserProfileModal from '../Components/UserProfileModal';
import { 
    LayoutDashboard, Building2, School, GraduationCap, 
    CreditCard, BookOpen, Star, FileText, Settings, 
    LogOut, UserCheck, ShieldAlert, ChevronDown, Menu, 
    X, Bell, ExternalLink, RefreshCw, UserCheck2, Landmark,
    Activity, Database, Terminal, ShieldCheck, AlertOctagon, Server,
    Users, ChevronLeft, ChevronRight, HardDrive, Cpu, Radio, Award,
    Megaphone, FileCheck, Sparkles, BookMarked, ArrowRightLeft, Layers, Sliders,
    KeyRound, Trophy, Zap, TrendingUp, Check
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
    const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [currentDateTime, setCurrentDateTime] = useState(() => new Date());
    const isAcademicSettingsActive = pageUrl.includes('/admin/setting') || pageUrl.includes('/admin/academic-settings');
    const isPejabatActive = pageUrl.includes('/admin/setting/data-pejabat') || pageUrl.includes('/admin/setting/pejabat-pengesah') || pageUrl.includes('tab=data-pejabat') || pageUrl.includes('tab=pejabat-pengesah');

    const [openMenus, setOpenMenus] = useState({
        'setting': isAcademicSettingsActive,
        'pejabat': isPejabatActive
    });
    const userDropdownRef = useRef(null);

    useEffect(() => {
        const intervalId = window.setInterval(() => setCurrentDateTime(new Date()), 1000);

        return () => window.clearInterval(intervalId);
    }, []);

    // Sync menu collapse when navigating: auto-expand when entering academic settings, collapse when leaving
    useEffect(() => {
        const isAcademicActive = pageUrl.includes('/admin/setting') || pageUrl.includes('/admin/academic-settings');
        const isPejActive = pageUrl.includes('/admin/setting/data-pejabat') || pageUrl.includes('/admin/setting/pejabat-pengesah') || pageUrl.includes('tab=data-pejabat') || pageUrl.includes('tab=pejabat-pengesah');

        if (isAcademicActive) {
            setOpenMenus(prev => ({
                ...prev,
                'setting': true,
                'pejabat': isPejActive ? true : (prev['pejabat'] ?? false)
            }));
        } else {
            setOpenMenus(prev => ({
                ...prev,
                'setting': false,
                'pejabat': false
            }));
        }
    }, [pageUrl]);

    const toggleMenu = (key) => {
        setOpenMenus(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

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
    const currentDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(currentDateTime);
    const currentTime = new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(currentDateTime);

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
        if (href === '/admin/krs-approval') {
            return pageUrl === '/admin/krs-approval' || (pageUrl.startsWith('/admin/krs-approval?') && !pageUrl.includes('/package'));
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
        if (href.includes('/student-curricula')) {
            return {
                boxBg: isActive 
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30' 
                    : 'bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/30 group-hover:bg-purple-500 group-hover:text-white',
                activeItemBg: 'bg-purple-950/40 text-purple-200 border-l-2 border-purple-400'
            };
        }
        if (href.includes('/academic-advising')) {
            return {
                boxBg: isActive 
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30' 
                    : 'bg-teal-500/15 text-teal-400 ring-1 ring-teal-500/30 group-hover:bg-teal-500 group-hover:text-white',
                activeItemBg: 'bg-teal-950/40 text-teal-200 border-l-2 border-teal-400'
            };
        }
        if (href.includes('/student-portal')) {
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
        if (href.includes('/lecturer-assignments')) {
            return {
                boxBg: isActive 
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30' 
                    : 'bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/30 group-hover:bg-violet-600 group-hover:text-white',
                activeItemBg: 'bg-violet-950/40 text-violet-200 border-l-2 border-violet-400'
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
        if (href.includes('/krs-approval/package')) {
            return {
                boxBg: isActive 
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' 
                    : 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950',
                activeItemBg: 'bg-amber-950/40 text-amber-200 border-l-2 border-amber-400'
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
        { label: 'Plotting Dosen Pengampu', href: '/admin/lecturer-assignments', icon: UserCheck, highlight: true },
        { header: 'SETTING & KEBIJAKAN' },
        { label: 'Pengaturan Sistem & Maintenance', href: '/admin/settings', icon: Settings },
        { label: 'Kebijakan Akademik', href: '/admin/academic-settings', icon: Sliders },
        { label: 'Pejabat & Penugasan', href: '/admin/officials', icon: ShieldCheck },
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
        { header: 'KEMAHASISWAAN' },
        { label: 'Data Mahasiswa', href: '/admin/students', icon: GraduationCap },
        { header: 'DATA DOSEN & AKUN' },
        { label: 'Data Dosen & Pengajar', href: '/admin/lecturers', icon: Users },
        { label: 'Manajemen Akun & Pengguna', href: '/admin/users', icon: KeyRound },
        { header: 'AKADEMIK' },
        { label: 'Rencana Studi', href: '/admin/krs-approval', icon: BookOpen },
        { label: 'Paket KRS Massal', href: '/admin/krs-approval/package', icon: Zap },
        { label: 'Penilaian', href: '/admin/grades', icon: Award },
        { label: 'Hasil Studi', href: '/admin/khs', icon: FileText },
        { label: 'Transkrip', href: '/admin/transcripts', icon: GraduationCap },
        { label: 'Kelulusan & Tugas Akhir', href: '/admin/graduations', icon: FileCheck },
        { label: 'Skrining Yudisium', href: '/admin/yudisium', icon: Award },
        { label: 'Aktivitas Mahasiswa', href: '/admin/activities', icon: Trophy },
        { label: 'Status Kuliah Mahasiswa', href: '/admin/student-statuses', icon: Users },
        { label: 'Data Kuisioner', href: '/admin/edom', icon: Star },
        { label: 'Analitik & Akreditasi', href: '/admin/analytics', icon: TrendingUp, highlight: true },
        { label: 'Pusat Pengumuman', href: '/admin/announcements', icon: Megaphone },
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
        { label: 'Plotting Dosen Pengampu', href: '/admin/lecturer-assignments', icon: UserCheck, highlight: true },
        { header: 'SETTING & KEBIJAKAN' },
        { label: 'Pengaturan Sistem', href: '/admin/settings', icon: Settings },
        { label: 'Kebijakan Akademik', href: '/admin/academic-settings', icon: Sliders },
        { label: 'Pejabat & Penugasan', href: '/admin/officials', icon: ShieldCheck },
        { header: 'KEMAHASISWAAN' },
        { label: 'Data Mahasiswa', href: '/admin/students', icon: GraduationCap },
        { header: 'DATA DOSEN & PENGELOLA' },
        { label: 'Data Dosen & Pengajar', href: '/admin/lecturers', icon: Users },
        { label: 'Manajemen Akun & Pengguna', href: '/admin/users', icon: KeyRound },
        { header: 'AKADEMIK' },
        { label: 'Rencana Studi', href: '/admin/krs-approval', icon: BookOpen },
        { label: 'Paket KRS Massal', href: '/admin/krs-approval/package', icon: Zap },
        { label: 'Penilaian', href: '/admin/grades', icon: Award },
        { label: 'Hasil Studi', href: '/admin/khs', icon: FileText },
        { label: 'Transkrip', href: '/admin/transcripts', icon: GraduationCap },
        { label: 'Kelulusan & Tugas Akhir', href: '/admin/graduations', icon: FileCheck },
        { label: 'Skrining Yudisium', href: '/admin/yudisium', icon: Award },
        { label: 'Aktivitas Mahasiswa', href: '/admin/activities', icon: Trophy },
        { label: 'Status Kuliah Mahasiswa', href: '/admin/student-statuses', icon: Users },
        { label: 'Data Kuisioner', href: '/admin/edom', icon: Star },
        { label: 'Analitik & Akreditasi', href: '/admin/analytics', icon: TrendingUp, highlight: true },
        { label: 'Pusat Pengumuman', href: '/admin/announcements', icon: Megaphone },
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
            const hasDosenRole = user.roles?.includes('dosen');
            const items = [
                { label: 'Dasbor Kaprodi', href: '/dashboard', icon: LayoutDashboard },
                { header: 'MASTER & FASILITAS' },
                { label: 'Gedung & Ruang Kuliah', href: '/admin/facilities', icon: Building2 },
                { header: 'STRUKTUR KURIKULUM' },
                { label: 'Data Kurikulum', href: '/admin/curricula', icon: Layers },
                { label: 'Data Mata Kuliah', href: '/admin/courses', icon: BookMarked },
                { label: 'Matakuliah - Kurikulum', href: '/admin/course-curriculum', icon: ArrowRightLeft },
                { label: 'Plotting Dosen Pengampu', href: '/admin/lecturer-assignments', icon: UserCheck, highlight: true },
                { header: 'KEMAHASISWAAN PRODI' },
                { label: 'Data Mahasiswa Prodi', href: '/admin/students', icon: GraduationCap },
                { header: 'AKADEMIK & KRS PRODI' },
                { label: 'Rencana Studi (KRS)', href: '/admin/krs-approval', icon: BookOpen },
                { label: 'Paket KRS Massal', href: '/admin/krs-approval/package', icon: Zap },
                { label: 'Hasil Studi (KHS)', href: '/admin/khs', icon: FileText },
                { label: 'Transkrip', href: '/admin/transcripts', icon: GraduationCap },
                { label: 'Kelulusan', href: '/admin/graduations', icon: FileCheck },
                { label: 'Aktivitas Mahasiswa', href: '/admin/activities', icon: Trophy },
                { label: 'Status Kuliah Mahasiswa', href: '/admin/student-statuses', icon: Users },
                { label: 'Analitik & Akreditasi', href: '/admin/analytics', icon: TrendingUp, highlight: true },
            ];

            // Jika Kaprodi juga bertugas sebagai Dosen Pengajar
            if (hasDosenRole) {
                items.push(
                    { header: 'PERKULIAHAN & PENILAIAN' },
                    { label: 'Penilaian (DPNA)', href: '/admin/grades', icon: Award, highlight: true },
                    { label: 'Jadwal Kuliah', href: '/admin/schedules', icon: School },
                    { header: 'EVALUASI MUTU' },
                    { label: 'Hasil Evaluasi EDOM', href: '/admin/edom', icon: Star }
                );
            }

            return items;
        }
        if (role === 'dosen') {
            return [
                { label: 'Dasbor Dosen', href: '/dashboard', icon: LayoutDashboard },
                { header: 'PERKULIAHAN & PENILAIAN' },
                { label: 'Penilaian (DPNA)', href: '/admin/grades', icon: Award, highlight: true },
                { label: 'Jadwal Kuliah', href: '/admin/schedules', icon: School },
                { header: 'EVALUASI MUTU' },
                { label: 'Hasil Evaluasi EDOM', href: '/admin/edom', icon: Star },
            ];
        }
        if (role === 'dosen_pa') {
            const hasDosenRole = user.roles?.includes('dosen');
            const items = [
                { label: 'Dasbor Dosen PA', href: '/dashboard', icon: LayoutDashboard },
                { header: 'BIMBINGAN & MONITORING' },
                { label: 'Mahasiswa Bimbingan & Tagihan', href: '/admin/students', icon: UserCheck },
                { label: 'Rencana Studi (KRS)', href: '/admin/krs-approval', icon: BookOpen },
                { label: 'Paket KRS Massal', href: '/admin/krs-approval/package', icon: Zap },
            ];

            // Jika Dosen PA juga sebagai Dosen Pengajar
            if (hasDosenRole) {
                items.push(
                    { header: 'PERKULIAHAN & PENILAIAN' },
                    { label: 'Penilaian (DPNA)', href: '/admin/grades', icon: Award, highlight: true },
                    { label: 'Jadwal Kuliah', href: '/admin/schedules', icon: School },
                    { header: 'EVALUASI MUTU' },
                    { label: 'Hasil Evaluasi EDOM', href: '/admin/edom', icon: Star }
                );
            }

            return items;
        }
        // Mahasiswa Portal
        return [
            { label: 'Dasbor Mahasiswa', href: '/dashboard', icon: LayoutDashboard },
            { header: 'STUDI AKADEMIK' },
            { label: 'KRS Online', href: '/student/krs', icon: BookOpen },
            { label: 'Nilai Mata Kuliah', href: '/student/grades', icon: Award },
            { label: 'Tagihan Keuangan (VA BSI)', href: '/student/bills', icon: CreditCard, highlight: true },
            { label: 'Kartu Hasil Studi (KHS)', href: '/student/khs', icon: FileText },
            { label: 'Transkrip Nilai (8 Semester)', href: '/student/transcripts', icon: GraduationCap },
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
                            {role === 'superadmin' ? (
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-base shadow-lg shrink-0 ring-2 bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-500 ring-purple-500/30">
                                    ⚡
                                </div>
                            ) : (
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white p-0.5 shadow-lg shrink-0 ring-2 ring-emerald-500/30 overflow-hidden">
                                    <img src="/logostai.png" alt="Logo STAI" className="w-full h-full object-contain" />
                                </div>
                            )}
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

                            // Render Collapsible Group Menu (e.g. Setting)
                            if (item.isGroup) {
                                const isGroupOpen = openMenus[item.key] ?? true;
                                const isGroupActive = pageUrl.includes('/admin/academic-settings');

                                return (
                                    <div key={idx} className="space-y-0.5">
                                        <button
                                            type="button"
                                            onClick={() => toggleMenu(item.key)}
                                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 cursor-pointer group ${
                                                isGroupActive
                                                    ? 'bg-slate-900 text-white font-black'
                                                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-2.5 truncate">
                                                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 ring-1 ring-emerald-500/30">
                                                    <Icon className="w-3.5 h-3.5" />
                                                </div>
                                                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                                            </div>

                                            {!sidebarCollapsed && (
                                                <div className="flex items-center space-x-1.5 shrink-0">
                                                    {item.badge && (
                                                        <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[9px] font-black shadow-xs">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isGroupOpen ? 'rotate-0 text-emerald-400' : '-rotate-90'}`} />
                                                </div>
                                            )}
                                        </button>

                                        {/* Child Items */}
                                        {!sidebarCollapsed && isGroupOpen && (
                                            <div className="pl-6 pr-1 space-y-0.5 pt-0.5 border-l border-slate-800 ml-5">
                                                {item.children?.map((child, cIdx) => {
                                                    // Sub-Group (e.g. Pejabat)
                                                    if (child.isSubGroup) {
                                                        const isSubOpen = openMenus[child.key] ?? true;
                                                        const isSubActive = pageUrl.includes('/admin/setting/data-pejabat') || pageUrl.includes('/admin/setting/pejabat-pengesah') || pageUrl.includes('tab=data-pejabat') || pageUrl.includes('tab=pejabat-pengesah');

                                                        return (
                                                            <div key={cIdx} className="space-y-0.5 pt-0.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleMenu(child.key)}
                                                                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                                                        isSubActive ? 'text-white font-black' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center space-x-1.5">
                                                                        <ChevronDown className={`w-3 h-3 transition-transform ${isSubOpen ? 'rotate-0 text-emerald-400' : '-rotate-90'}`} />
                                                                        <span>{child.label}</span>
                                                                    </div>
                                                                    {child.badge && (
                                                                        <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[8px] font-black">
                                                                            {child.badge}
                                                                        </span>
                                                                    )}
                                                                </button>

                                                                {isSubOpen && (
                                                                    <div className="pl-4 space-y-0.5 border-l border-slate-800 ml-2">
                                                                        {child.children?.map((subChild, scIdx) => {
                                                                            const subActive = isItemActive(subChild.href);
                                                                            return (
                                                                                <Link
                                                                                    key={scIdx}
                                                                                    href={subChild.href}
                                                                                    className={`block px-2 py-1.5 rounded-lg text-[11px] transition ${
                                                                                        subActive
                                                                                            ? 'bg-slate-900 text-emerald-300 font-black border-l-2 border-emerald-400 pl-2'
                                                                                            : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                                                                                    }`}
                                                                                >
                                                                                    {subChild.label}
                                                                                </Link>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    }

                                                    const childActive = isItemActive(child.href);
                                                    return (
                                                        <Link
                                                            key={cIdx}
                                                            href={child.href}
                                                            className={`block px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition ${
                                                                childActive
                                                                    ? 'bg-slate-900 text-emerald-300 font-black border-l-2 border-emerald-400 pl-2'
                                                                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                                                            }`}
                                                        >
                                                            {child.label}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

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
                            href="/sso/lms"
                            target="_blank"
                            rel="noreferrer"
                            title={sidebarCollapsed ? "Buka SALAM LMS (SSO)" : undefined}
                            className="flex items-center justify-between px-2.5 py-2 bg-gradient-to-r from-emerald-950/60 to-teal-950/40 hover:from-emerald-900/70 hover:to-teal-900/60 text-emerald-300 border border-emerald-700/40 rounded-xl text-[11px] font-bold transition shadow-xs group"
                        >
                            <span className="flex items-center space-x-2">
                                <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/30">
                                    <Sparkles className="w-3 h-3 text-emerald-400" />
                                </div>
                                {!sidebarCollapsed && <span>Buka SALAM LMS (SSO)</span>}
                            </span>
                            {!sidebarCollapsed && <ExternalLink className="w-3 h-3 text-emerald-400" />}
                        </a>
                    </div>
                </aside>

                <button
                    type="button"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    title={sidebarCollapsed ? "Perluas Sidebar" : "Kecilkan Sidebar"}
                    aria-label={sidebarCollapsed ? "Perluas Sidebar" : "Kecilkan Sidebar"}
                    className={`hidden md:flex fixed ${impersonation.is_active ? 'top-14' : 'top-4'} ${sidebarCollapsed ? 'left-16' : 'left-64'} z-[60] h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white/20 bg-slate-800 text-slate-100 shadow-xl ring-2 ring-slate-950/60 transition duration-200 hover:scale-110 hover:bg-emerald-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer`}
                >
                    {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5 stroke-[3]" /> : <ChevronLeft className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

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

                                {user.roles && user.roles.length > 1 && (
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                                            className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition flex items-center space-x-1 cursor-pointer"
                                            title="Ganti Peran Aktif Akun Anda"
                                        >
                                            <ArrowRightLeft className="w-3 h-3" />
                                            <span className="hidden sm:inline">Ganti Peran ({user.roles.length})</span>
                                            <ChevronDown className={`w-2.5 h-2.5 transition-transform ${roleSwitcherOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {roleSwitcherOpen && (
                                            <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                                                <div className="px-3 py-1 text-[9px] font-black uppercase text-slate-400 border-b border-slate-100 flex items-center justify-between">
                                                    <span>Peran Aktif</span>
                                                    <span className="text-[8px] bg-amber-100 text-amber-800 px-1 rounded">Multi-Role</span>
                                                </div>
                                                {user.roles.map((r) => (
                                                    <button
                                                        key={r}
                                                        type="button"
                                                        onClick={() => {
                                                            setRoleSwitcherOpen(false);
                                                            router.post('/switch-role', { role: r });
                                                        }}
                                                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition text-left cursor-pointer ${
                                                            r === role
                                                                ? 'bg-emerald-50 text-emerald-800 font-black'
                                                                : 'text-slate-700 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        <span>{r.replace('_', ' ').toUpperCase()}</span>
                                                        {r === role && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {academic?.active_period && (
                                    <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                        📅 {academic.active_period.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Right Navigation Controls */}
                        <div className="flex items-center space-x-2.5">
                            <div className="hidden lg:flex flex-col items-end border-r border-slate-200 pr-3 leading-tight">
                                <time dateTime={currentDateTime.toISOString()} className="text-[10px] font-bold text-slate-500">
                                    {currentDate}
                                </time>
                                <time dateTime={currentDateTime.toISOString()} className="text-xs font-black tabular-nums text-emerald-700">
                                    {currentTime}
                                </time>
                            </div>

                            {/* SALAM LMS SSO 1-Click Launch Button */}
                            <a
                                href="/sso/lms"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Buka SALAM Learning Management System via Single Sign-On"
                                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-sm shadow-emerald-700/30 hover:from-emerald-700 hover:to-teal-800 transition transform hover:-translate-y-0.5 cursor-pointer ring-1 ring-emerald-400/40"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                                <span>SALAM LMS</span>
                                <ExternalLink className="w-3 h-3 opacity-80" />
                            </a>

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

                                        {/* Multi-Role Quick Switch in Dropdown */}
                                        {user.roles && user.roles.length > 1 && (
                                            <div className="px-3 py-2 border-b border-slate-100 bg-amber-50/60">
                                                <p className="text-[9px] font-black text-amber-900 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                                                    <ArrowRightLeft className="w-3 h-3 text-amber-700" />
                                                    <span>Ganti Peran ({user.roles.length} Tersedia)</span>
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map((r) => (
                                                        <button
                                                            key={r}
                                                            type="button"
                                                            onClick={() => {
                                                                setUserDropdownOpen(false);
                                                                router.post('/switch-role', { role: r });
                                                            }}
                                                            className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase transition cursor-pointer flex items-center space-x-1 ${
                                                                r === role
                                                                    ? 'bg-emerald-600 text-white shadow-xs'
                                                                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                                                            }`}
                                                        >
                                                            <span>{r.replace('_', ' ')}</span>
                                                            {r === role && <Check className="w-2.5 h-2.5" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

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

            {/* MODAL PENGATURAN PROFIL & AKUN (SELF-SERVICE) */}
            <UserProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                user={user}
                role={role}
            />
        </div>
    );
}
