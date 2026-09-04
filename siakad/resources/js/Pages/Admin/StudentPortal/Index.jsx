import React, { useState, useRef, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import ImpersonationModal from '../../../Components/ImpersonationModal';
import { 
    KeyRound, Search, Filter, ShieldCheck, CheckCircle2,
    RefreshCw, User, Lock, Mail, Phone, GraduationCap,
    Copy, Check, AlertCircle, X, Loader2, Sparkles, Key,
    Users, UserCheck, ShieldAlert, BookOpen, Play
} from 'lucide-react';

export default function StudentPortalIndex({
    students,
    studyPrograms = [],
    filters = {}
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [prodi, setProdi] = useState(filters.study_program || '');
    const [status, setStatus] = useState(filters.status || '');
    const [perPage, setPerPage] = useState(filters.per_page || 15);

    const [studentsData, setStudentsData] = useState(students);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Impersonate Modal
    const [impersonateUser, setImpersonateUser] = useState(null);
    const [isImpersonateOpen, setIsImpersonateOpen] = useState(false);

    // Reset Password Alert
    const [resetMsg, setResetMsg] = useState('');
    const [copiedNim, setCopiedNim] = useState(null);

    const [isProdiDropdownOpen, setIsProdiDropdownOpen] = useState(false);
    const [prodiSearch, setProdiSearch] = useState('');
    const prodiDropdownRef = useRef(null);

    const isFirstRender = useRef(true);

    const currentProdi = studyPrograms.find(p => String(p.id) === String(prodi) || p.code === prodi || p.name === prodi);

    const filteredStudyPrograms = studyPrograms.filter(p => {
        if (!prodiSearch) return true;
        const q = prodiSearch.toLowerCase();
        return p.name?.toLowerCase().includes(q) || p.code?.toLowerCase().includes(q) || (p.national_code && p.national_code.toLowerCase().includes(q));
    });

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (prodiDropdownRef.current && !prodiDropdownRef.current.contains(e.target)) {
                setIsProdiDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchStudentsData = async (newSearch = search, newProdi = prodi, newStatus = status, page = 1) => {
        setIsLoadingData(true);

        const params = new URLSearchParams();
        if (newSearch) params.append('search', newSearch);
        if (newProdi) params.append('study_program', newProdi);
        if (newStatus) params.append('status', newStatus);
        if (page > 1) params.append('page', page);
        params.append('format', 'json');

        try {
            const res = await fetch(`/admin/student-portal?${params.toString()}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                }
            });
            const data = await res.json();
            if (data.success) {
                setStudentsData(data.students);
            }
        } catch (err) {
            console.error('Error fetching student portal accounts:', err);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            fetchStudentsData(search, prodi, status);
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    const handleCopyNim = (nim) => {
        navigator.clipboard.writeText(nim);
        setCopiedNim(nim);
        setTimeout(() => setCopiedNim(null), 2000);
    };

    const handlePaginationClick = (e, url) => {
        e.preventDefault();
        if (!url) return;
        try {
            const parsedUrl = new URL(url, window.location.origin);
            const page = parsedUrl.searchParams.get('page') || 1;
            fetchStudentsData(search, prodi, status, page);
        } catch (err) {}
    };

    const handleResetPassword = async (stu) => {
        if (!confirm(`Reset password default 'salam123' untuk akun mahasiswa: ${stu.name}?`)) return;

        try {
            const res = await fetch('/admin/student-portal/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ user_id: stu.id })
            });
            const data = await res.json();
            if (data.success) {
                setResetMsg(data.message);
                setTimeout(() => setResetMsg(''), 4000);
            }
        } catch (err) {
            console.error('Error resetting password:', err);
        }
    };

    const studentList = studentsData?.data || [];

    return (
        <AppLayout title="User Portal Mahasiswa">
            <Head title="User Portal Mahasiswa" />

            <div className="space-y-3.5">
                {/* 1. COMPACT HERO HEADER DENGAN INTEGRATED SUB-BAR PILIH PRODI (Gaya /admin/study-programs) */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative border border-slate-700/50 z-20">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black mb-1">
                                <Sparkles className="w-3 h-3 text-indigo-400" />
                                <span>KEMAHASISWAAN & AKADEMIK</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                                User Portal & Akses Akun Mahasiswa
                            </h2>
                        </div>

                        {/* Info Badge */}
                        <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700">
                                Default Password: <strong className="text-indigo-400 font-mono">salam123</strong>
                            </span>
                        </div>
                    </div>

                    {/* Integrated Sub-bar: Pilih Program Studi */}
                    <div className="relative z-30 mt-3 pt-3 border-t border-slate-700/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="flex items-center space-x-2.5">
                            <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30 shrink-0">
                                <KeyRound className="w-4 h-4" />
                            </div>
                            <div className="flex items-center space-x-2 flex-wrap text-xs">
                                <span className="font-bold text-slate-300">Filter Akun:</span>
                                {currentProdi ? (
                                    <div className="inline-flex items-center space-x-1.5">
                                        <span className="font-black text-white">{currentProdi.name}</span>
                                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                                            {currentProdi.national_code || currentProdi.code}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-slate-400 italic">Semua Program Studi (atau pilih di samping)</span>
                                )}
                            </div>
                        </div>

                        {/* Dropdown Prodi & Action on Header */}
                        <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 w-full lg:w-auto">
                            <div ref={prodiDropdownRef} className="relative w-full sm:w-64">
                                <button
                                    type="button"
                                    onClick={() => setIsProdiDropdownOpen(prev => !prev)}
                                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition shadow-2xs cursor-pointer text-left border ${
                                        isProdiDropdownOpen 
                                            ? 'border-indigo-400 ring-2 ring-indigo-500/30 bg-slate-800 text-white' 
                                            : currentProdi 
                                                ? 'border-indigo-500/50 bg-indigo-950/50 hover:bg-indigo-900/50 text-indigo-200 font-bold' 
                                                : 'border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2 truncate">
                                        <GraduationCap className={`w-3.5 h-3.5 shrink-0 ${currentProdi ? 'text-indigo-400' : 'text-slate-400'}`} />
                                        <span className="truncate">
                                            {currentProdi ? currentProdi.name : 'Semua Program Studi...'}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-1 shrink-0 ml-1.5">
                                        {prodi && (
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setProdi('');
                                                    setIsProdiDropdownOpen(false);
                                                    fetchStudentsData(search, '', status);
                                                }}
                                                className="p-0.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
                                                title="Reset Prodi"
                                            >
                                                <X className="w-3 h-3" />
                                            </span>
                                        )}
                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                            isProdiDropdownOpen ? 'rotate-180 text-indigo-400' : ''
                                        }`} />
                                    </div>
                                </button>

                                {isProdiDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-1.5 w-full sm:w-80 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn p-2 space-y-1.5">
                                        <div className="relative">
                                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                                            <input
                                                type="text"
                                                value={prodiSearch}
                                                onChange={(e) => setProdiSearch(e.target.value)}
                                                placeholder="Cari prodi..."
                                                className="w-full text-[11px] pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="max-h-56 overflow-y-auto space-y-1 divide-y divide-slate-100">
                                            <div
                                                onClick={() => {
                                                    setProdi('');
                                                    setIsProdiDropdownOpen(false);
                                                    fetchStudentsData(search, '', status);
                                                }}
                                                className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between text-[11px] ${
                                                    !prodi ? 'bg-indigo-50 text-indigo-950 font-bold' : 'hover:bg-slate-50 text-slate-600'
                                                }`}
                                            >
                                                <span>-- Semua Program Studi --</span>
                                                {!prodi && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                                            </div>

                                            {filteredStudyPrograms.map((p) => {
                                                const isSelected = String(p.id) === String(prodi);
                                                return (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => {
                                                            setProdi(String(p.id));
                                                            setIsProdiDropdownOpen(false);
                                                            fetchStudentsData(search, String(p.id), status);
                                                        }}
                                                        className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between ${
                                                            isSelected ? 'bg-indigo-50 font-bold text-indigo-950' : 'hover:bg-slate-50 text-slate-700'
                                                        }`}
                                                    >
                                                        <span className="text-[11px] truncate">{p.national_code ? `${p.national_code} - ` : ''}{p.name} ({p.degree || 'S1'})</span>
                                                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tombol Reset */}
                            {(prodi || search || status) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setProdi('');
                                        setSearch('');
                                        setStatus('');
                                        fetchStudentsData('', '', '');
                                    }}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer shrink-0"
                                    title="Reset Filter"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. COMPACT STATS CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Total Akun Terdata</span>
                            <span className="p-1 bg-indigo-100 text-indigo-800 rounded-md"><Users className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-slate-900">{studentsData?.total || studentList.length} User</p>
                            <p className="text-[10px] text-slate-500">Hak Akses Mahasiswa</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-indigo-600 font-bold">
                            Akun Portal
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Akun Aktif</span>
                            <span className="p-1 bg-emerald-100 text-emerald-800 rounded-md"><UserCheck className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-slate-900">{studentList.filter(s => s.is_active).length} User</p>
                            <p className="text-[10px] text-slate-500">Dapat Login Portal</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-emerald-600 font-bold">
                            Login Aktif
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Akun Nonaktif</span>
                            <span className="p-1 bg-rose-100 text-rose-800 rounded-md"><ShieldAlert className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-slate-900">{studentList.filter(s => !s.is_active).length} User</p>
                            <p className="text-[10px] text-slate-500">Terblokir / Cuti</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-rose-600 font-bold">
                            Tidak Aktif
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Terdaftar Email</span>
                            <span className="p-1 bg-blue-100 text-blue-800 rounded-md"><Mail className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-slate-900">{studentList.filter(s => s.email).length} User</p>
                            <p className="text-[10px] text-slate-500">Email Valid</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-blue-600 font-bold">
                            Kontak Terdata
                        </div>
                    </div>
                </div>

                {/* 3. TABS SWITCHER KEMAHASISWAAN (Gaya /admin/study-programs) */}
                <div className="flex border-b border-slate-200 space-x-2 sm:space-x-6 overflow-x-auto">
                    <Link
                        href="/admin/students"
                        className="pb-3 text-xs font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer"
                    >
                        <GraduationCap className="w-4 h-4" />
                        <span>Data Mahasiswa</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            Data Induk
                        </span>
                    </Link>

                    <Link
                        href="/admin/student-curricula"
                        className="pb-3 text-xs font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer"
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Kurikulum Mahasiswa</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            Plotting
                        </span>
                    </Link>

                    <Link
                        href="/admin/academic-advising"
                        className="pb-3 text-xs font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer"
                    >
                        <UserCheck className="w-4 h-4" />
                        <span>Bimbingan Akademik</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            Dosen PA
                        </span>
                    </Link>

                    <Link
                        href="/admin/student-portal"
                        className="pb-3 text-xs font-bold border-b-2 border-indigo-600 text-indigo-700 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer"
                    >
                        <KeyRound className="w-4 h-4" />
                        <span>User Portal Mahasiswa</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                            {studentsData?.total || studentList.length} Akun
                        </span>
                    </Link>
                </div>

                {resetMsg && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{resetMsg}</span>
                    </div>
                )}

                {/* TABLE CONTAINER */}
                <div className="bg-white rounded-2xl shadow-2xs border border-slate-200 overflow-hidden relative">
                    {isLoadingData && (
                        <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-2xs flex items-center justify-center">
                            <div className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold">
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                                <span>Memuat akun portal...</span>
                            </div>
                        </div>
                    )}

                    {/* TOOLBAR */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/60 to-white">
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama, NIM, username, atau email..."
                                className="w-full text-[11px] pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-medium"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 text-xs">
                            <select
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    fetchStudentsData(search, prodi, e.target.value);
                                }}
                                className="text-[11px] px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700"
                            >
                                <option value="">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-3 w-10 text-center">No.</th>
                                    <th className="py-3 px-3 w-32 text-center">Aksi Portal</th>
                                    <th className="py-3 px-4 w-36 font-mono">NIM (Username)</th>
                                    <th className="py-3 px-4">Nama Mahasiswa</th>
                                    <th className="py-3 px-4">Program Studi</th>
                                    <th className="py-3 px-4">Email Login</th>
                                    <th className="py-3 px-3 text-center">Status Akun</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[11px]">
                                {studentList.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                                            Tidak ada data akun mahasiswa yang sesuai dengan filter pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    studentList.map((stu, idx) => (
                                        <tr key={stu.id} className="hover:bg-slate-50 transition">
                                            <td className="py-3 px-3 text-center font-bold text-slate-400 text-[10px]">
                                                {(studentsData?.from || 1) + idx}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <div className="flex items-center justify-center space-x-1.5">
                                                    {/* Impersonate */}
                                                    <div className="relative group">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setImpersonateUser(stu);
                                                                setIsImpersonateOpen(true);
                                                            }}
                                                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg text-[10.5px] font-bold transition flex items-center space-x-1 cursor-pointer shadow-2xs"
                                                        >
                                                            <KeyRound className="w-3 h-3" />
                                                            <span>Menyamar</span>
                                                        </button>
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-50 animate-fadeIn">
                                                            <div className="bg-slate-900 text-white text-[9.5px] font-bold px-2 py-0.8 rounded-md shadow-lg whitespace-nowrap">
                                                                Simulasi Login Mahasiswa
                                                            </div>
                                                            <div className="w-1 h-1 bg-slate-900 rotate-45 -mt-0.5"></div>
                                                        </div>
                                                    </div>

                                                    {/* Reset Password */}
                                                    <div className="relative group">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleResetPassword(stu)}
                                                            className="px-2 py-1 bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white rounded-lg text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer shadow-2xs"
                                                        >
                                                            <Key className="w-3 h-3" />
                                                        </button>
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-50 animate-fadeIn">
                                                            <div className="bg-slate-900 text-white text-[9.5px] font-bold px-2 py-0.8 rounded-md shadow-lg whitespace-nowrap">
                                                                Reset Password Default (salam123)
                                                            </div>
                                                            <div className="w-1 h-1 bg-slate-900 rotate-45 -mt-0.5"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                                <div className="flex items-center space-x-1.5">
                                                    <span>{stu.identity_number || stu.username}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyNim(stu.identity_number || stu.username)}
                                                        className="text-slate-400 hover:text-indigo-600 cursor-pointer transition"
                                                        title="Salin NIM/Username"
                                                    >
                                                        {copiedNim === (stu.identity_number || stu.username) ? (
                                                            <Check className="w-3 h-3 text-emerald-600" />
                                                        ) : (
                                                            <Copy className="w-3 h-3" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-bold text-slate-900">
                                                {stu.name}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">
                                                {stu.study_program || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">
                                                {stu.email || '-'}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                                    stu.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {stu.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION FOOTER */}
                    {studentsData && studentsData.total > 0 && (
                        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50/50">
                            <div className="text-slate-500 text-[11px]">
                                Menampilkan <strong className="text-slate-800">{studentsData.from || 0}</strong> - <strong className="text-slate-800">{studentsData.to || 0}</strong> dari <strong className="text-slate-800">{studentsData.total}</strong> akun mahasiswa
                            </div>

                            {/* Pagination Links (Async click) */}
                            <div className="flex items-center space-x-1">
                                {studentsData.links?.map((link, index) => {
                                    if (!link.url && link.label.includes('Previous')) return null;
                                    if (!link.url && link.label.includes('Next')) return null;

                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={(e) => handlePaginationClick(e, link.url)}
                                            disabled={!link.url || link.active}
                                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                                                link.active 
                                                    ? 'bg-indigo-600 text-white shadow-xs cursor-default' 
                                                    : link.url 
                                                    ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200' 
                                                    : 'text-slate-400 cursor-not-allowed opacity-50'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* IMPERSONATE MODAL */}
            {impersonateUser && (
                <ImpersonationModal
                    isOpen={isImpersonateOpen}
                    onClose={() => {
                        setIsImpersonateOpen(false);
                        setImpersonateUser(null);
                    }}
                    user={impersonateUser}
                />
            )}
        </AppLayout>
    );
}
