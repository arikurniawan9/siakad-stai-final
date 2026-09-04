import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import ImpersonationModal from '../../../Components/ImpersonationModal';
import { 
    Users, Search, UserCheck, ShieldAlert, Filter, 
    ArrowRight, ShieldCheck, CheckCircle2, Plus, Edit2, 
    KeyRound, ToggleLeft, ToggleRight, Trash2, Upload, 
    Download, UserPlus, Sparkles, Check, X, ChevronDown,
    RefreshCw, AlertTriangle, Shield, BookOpen, GraduationCap,
    Award, Mail, Phone, Lock
} from 'lucide-react';

export default function UsersIndex({ 
    users, 
    studyPrograms = [], 
    stats = {}, 
    filters = {} 
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');
    const [prodi, setProdi] = useState(filters.study_program || '');
    const [perPage, setPerPage] = useState(filters.per_page || 15);

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isImpersonateOpen, setIsImpersonateOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [userToReset, setUserToReset] = useState(null);

    // Form Create
    const createForm = useForm({
        name: '',
        username: '',
        identity_number: '',
        nik: '',
        email: '',
        role: 'mahasiswa',
        study_program: 'Pendidikan Agama Islam (S1)',
        gender: 'L',
        phone_number: '',
        password: 'salam123',
    });

    // Form Edit
    const editForm = useForm({
        name: '',
        username: '',
        identity_number: '',
        nik: '',
        email: '',
        role: 'mahasiswa',
        study_program: '',
        gender: 'L',
        phone_number: '',
        is_active: true,
    });

    // Batch Import Data State
    const [importRecords, setImportRecords] = useState([]);

    // Close active modal on ESC key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
                if (userToDelete) {
                    setUserToDelete(null);
                } else if (userToReset) {
                    setUserToReset(null);
                } else if (isCreateOpen) {
                    setIsCreateOpen(false);
                } else if (isEditOpen) {
                    setIsEditOpen(false);
                } else if (isImportOpen) {
                    setIsImportOpen(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCreateOpen, isEditOpen, isImportOpen, userToDelete, userToReset]);

    // Trigger URL change
    const triggerFilter = (newRole = role, newProdi = prodi, newPerPage = perPage, newSearch = search) => {
        router.get('/admin/users', { 
            search: newSearch, 
            role: newRole, 
            study_program: newProdi,
            per_page: newPerPage
        }, { preserveState: true, replace: true, preserveScroll: true });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        triggerFilter(role, prodi, perPage, search);
    };

    const handleClearSearch = () => {
        setSearch('');
        triggerFilter(role, prodi, perPage, '');
    };

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        triggerFilter(newRole, prodi, perPage, search);
    };

    const handleProdiChange = (newProdi) => {
        setProdi(newProdi);
        triggerFilter(role, newProdi, perPage, search);
    };

    const handlePerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        triggerFilter(role, prodi, newPerPage, search);
    };

    const handleOpenCreate = () => {
        createForm.reset();
        createForm.setData({
            name: '',
            username: '',
            identity_number: '',
            nik: '',
            email: '',
            role: 'mahasiswa',
            study_program: prodi || studyPrograms[0]?.name || 'Pendidikan Agama Islam (S1)',
            gender: 'L',
            phone_number: '',
            password: 'salam123',
        });
        setIsCreateOpen(true);
    };

    const handleOpenEdit = (u) => {
        setSelectedUser(u);
        editForm.setData({
            name: u.name,
            username: u.username,
            identity_number: u.identity_number || '',
            nik: u.nik || '',
            email: u.email,
            role: u.role,
            study_program: u.study_program || '',
            gender: u.gender || 'L',
            phone_number: u.phone_number || '',
            is_active: u.is_active,
        });
        setIsEditOpen(true);
    };

    const handleOpenImpersonate = (u) => {
        setSelectedUser(u);
        setIsImpersonateOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post('/admin/users', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        editForm.put(`/admin/users/${selectedUser.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
            },
        });
    };

    const handleConfirmResetPassword = () => {
        if (!userToReset) return;
        router.post(`/admin/users/${userToReset.id}/reset-password`, {}, {
            onSuccess: () => setUserToReset(null),
        });
    };

    const handleConfirmDelete = () => {
        if (!userToDelete) return;
        router.delete(`/admin/users/${userToDelete.id}`, {
            onSuccess: () => setUserToDelete(null),
        });
    };

    const handleToggleStatus = (u) => {
        router.post(`/admin/users/${u.id}/toggle-status`);
    };

    const handleGenerateMockImport = () => {
        const mockData = [
            { name: 'Muhammad Rizky Pratama', username: '22010001', identity_number: '22010001', email: 'rizky.pratama@staialittihad.ac.id', role: 'mahasiswa', study_program: 'Pendidikan Agama Islam (S1)', gender: 'L' },
            { name: 'Nabila Nur Azizah', username: '22010002', identity_number: '22010002', email: 'nabila.azizah@staialittihad.ac.id', role: 'mahasiswa', study_program: 'Pendidikan Agama Islam (S1)', gender: 'P' },
            { name: 'Fajar Hidayatullah, M.Pd', username: '2119058801', identity_number: '2119058801', email: 'fajar.hidayat@staialittihad.ac.id', role: 'dosen', study_program: 'Manajemen Pendidikan Islam (S1)', gender: 'L' },
        ];
        setImportRecords(mockData);
    };

    const handleImportSubmit = () => {
        router.post('/admin/users/import-batch', { records: importRecords }, {
            onSuccess: () => {
                setIsImportOpen(false);
                setImportRecords([]);
            },
        });
    };

    const getRoleBadgeStyle = (userRole) => {
        switch (userRole) {
            case 'superadmin':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'admin_akademik':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'keuangan':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'kaprodi':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'dosen_pa':
                return 'bg-teal-100 text-teal-800 border-teal-200';
            case 'dosen':
                return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'mahasiswa':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getRoleLabel = (userRole) => {
        switch (userRole) {
            case 'superadmin': return 'Superadmin';
            case 'admin_akademik': return 'Admin BAAK';
            case 'keuangan': return 'Keuangan';
            case 'kaprodi': return 'Kaprodi';
            case 'dosen_pa': return 'Dosen PA';
            case 'dosen': return 'Dosen';
            case 'mahasiswa': return 'Mahasiswa';
            default: return userRole;
        }
    };

    return (
        <AppLayout title="Manajemen Pengguna & Akun">
            <Head title="Manajemen Pengguna" />

            {/* Impersonation Modal */}
            <ImpersonationModal
                isOpen={isImpersonateOpen}
                onClose={() => setIsImpersonateOpen(false)}
                targetUser={selectedUser}
            />

            <div className="space-y-3.5">
                {/* 1. COMPACT HERO HEADER DENGAN TEMA DARK-EMERALD */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative border border-slate-700/50 z-10">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black mb-1">
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                <span>SUPERADMIN / DEVELOPER • MANAJEMEN PENGGUNA & AKUN</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                                Manajemen Pengguna Civitas Akademika
                            </h2>
                            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                                Kelola akun mahasiswa, dosen, dan staf institusi, reset kata sandi default, aktifkan/nonaktifkan akun, dan portal penyamaran (impersonation).
                            </p>
                        </div>

                        {/* Statistik Singkat Pengguna */}
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Pengguna</span>
                                <span className="text-sm font-black text-emerald-400">{stats.total || users.total || 0}</span>
                            </div>
                            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Akun Aktif</span>
                                <span className="text-sm font-black text-teal-300">{stats.active || 0}</span>
                            </div>
                            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Mahasiswa</span>
                                <span className="text-sm font-black text-blue-300">{stats.students || 0}</span>
                            </div>
                            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Dosen / Pendidik</span>
                                <span className="text-sm font-black text-amber-300">{stats.lecturers || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. SUB-BAR NAVIGASI TAB PERAN (ROLE) & FILTER CEPAT */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-1.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
                        <button
                            type="button"
                            onClick={() => handleRoleChange('')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                                !role 
                                    ? 'bg-slate-900 text-white shadow-xs' 
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                        >
                            <Users className="w-3.5 h-3.5" />
                            <span>Semua Peran</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                                !role ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                                {stats.total || 0}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleRoleChange('mahasiswa')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                                role === 'mahasiswa' 
                                    ? 'bg-emerald-600 text-white shadow-xs' 
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                        >
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Mahasiswa</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                                role === 'mahasiswa' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                                {stats.students || 0}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleRoleChange('dosen')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                                role === 'dosen' 
                                    ? 'bg-teal-600 text-white shadow-xs' 
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                        >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Dosen</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleRoleChange('dosen_pa')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                                role === 'dosen_pa' 
                                    ? 'bg-teal-700 text-white shadow-xs' 
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                        >
                            <Shield className="w-3.5 h-3.5" />
                            <span>Dosen PA</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleRoleChange('kaprodi')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                                role === 'kaprodi' 
                                    ? 'bg-indigo-600 text-white shadow-xs' 
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                        >
                            <Award className="w-3.5 h-3.5" />
                            <span>Kaprodi</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleRoleChange('admin_akademik')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                                role === 'admin_akademik' 
                                    ? 'bg-blue-600 text-white shadow-xs' 
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Admin BAAK</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleRoleChange('superadmin')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                                role === 'superadmin' 
                                    ? 'bg-purple-600 text-white shadow-xs' 
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                        >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Superadmin</span>
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Per Page Selector */}
                        <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                            <span className="text-[11px] font-medium text-slate-400">Tampilkan:</span>
                            <select
                                value={perPage}
                                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 3. TOOLBAR PENCARIAN & AKSI UTAMA */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    {/* Search Input */}
                    <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama, username, NIM, NIDN, atau email..."
                            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                                title="Hapus Pencarian"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </form>

                    {/* Filter Prodi Selector */}
                    <div className="w-full sm:w-60">
                        <select
                            value={prodi}
                            onChange={(e) => handleProdiChange(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">Semua Program Studi</option>
                            {studyPrograms.map((p) => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0 justify-end">
                        <button
                            type="button"
                            onClick={() => triggerFilter(role, prodi, perPage, search)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                            title="Segarkan Data"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setImportRecords([]);
                                setIsImportOpen(true);
                            }}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                        >
                            <Upload className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Impor Batch</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleOpenCreate}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                        >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Tambah Pengguna</span>
                        </button>
                    </div>
                </div>

                {/* 4. TABEL PENGGUNA SISTEM */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-4">Pengguna & Identitas Akun</th>
                                    <th className="py-3 px-4">NIM / NIDN / NIP</th>
                                    <th className="py-3 px-4">Peran (Role)</th>
                                    <th className="py-3 px-4">Homebase Program Studi</th>
                                    <th className="py-3 px-4 text-center">Status Akun</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <Users className="w-10 h-10 text-slate-300" />
                                                <p className="text-sm font-bold text-slate-600">Tidak ada pengguna yang cocok.</p>
                                                <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau sesuaikan filter peran / prodi.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/80 transition">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-2.5">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center font-black text-white text-xs shadow-2xs shrink-0">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{u.name}</p>
                                                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                                                            <span className="font-mono text-emerald-700 bg-emerald-50 px-1 rounded">
                                                                @{u.username}
                                                            </span>
                                                            <span className="font-mono">{u.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col space-y-1">
                                                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px] w-fit">
                                                        {u.identity_number || '-'}
                                                    </span>
                                                    {u.nik && (
                                                        <span className="font-mono text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 w-fit">
                                                            NIK: {u.nik}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getRoleBadgeStyle(u.role)}`}>
                                                    {getRoleLabel(u.role)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-600 font-medium">
                                                {u.study_program || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleToggleStatus(u)}
                                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black transition cursor-pointer border ${
                                                        u.is_active 
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                                    }`}
                                                >
                                                    {u.is_active ? '● AKTIF' : '○ NONAKTIF'}
                                                </button>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end space-x-1">
                                                    {/* Impersonate Button */}
                                                    <button
                                                        onClick={() => handleOpenImpersonate(u)}
                                                        title="Menyamar sebagai pengguna ini"
                                                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-black transition flex items-center space-x-1 cursor-pointer"
                                                    >
                                                        <span>🎭</span>
                                                        <span className="hidden sm:inline">Menyamar</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEdit(u)}
                                                        title="Edit Data Pengguna"
                                                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setUserToReset(u)}
                                                        title="Reset Password ke salam123"
                                                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                                                    >
                                                        <KeyRound className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setUserToDelete(u)}
                                                        title="Hapus Akun Pengguna"
                                                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <span className="text-slate-500 text-[11px]">
                            Menampilkan <span className="font-bold text-slate-700">{users.from || 0}</span> - <span className="font-bold text-slate-700">{users.to || 0}</span> dari <span className="font-bold text-slate-700">{users.total}</span> pengguna
                        </span>
                        <div className="flex items-center space-x-1">
                            {users.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                        link.active
                                            ? 'bg-emerald-600 text-white'
                                            : link.url
                                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            : 'text-slate-300 pointer-events-none'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* MODAL CREATE USER */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
                        <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 sm:p-5 text-white flex items-center justify-between">
                                <div>
                                    <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black mb-1">
                                        <UserPlus className="w-3 h-3 text-emerald-400" />
                                        <span>MANAJEMEN PENGGUNA</span>
                                    </div>
                                    <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-white">
                                        Tambah Pengguna Baru
                                    </h3>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                                        ESC
                                    </span>
                                    <button 
                                        onClick={() => setIsCreateOpen(false)} 
                                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleCreateSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nama Lengkap:</label>
                                    <input
                                        type="text"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="Contoh: Budi Santoso, S.Kom"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Username Login:</label>
                                        <input
                                            type="text"
                                            value={createForm.data.username}
                                            onChange={(e) => createForm.setData('username', e.target.value)}
                                            placeholder="budisantoso"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">NIM / NIDN / NIP:</label>
                                        <input
                                            type="text"
                                            value={createForm.data.identity_number}
                                            onChange={(e) => createForm.setData('identity_number', e.target.value)}
                                            placeholder="21010042 / 2112087501"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">NIK (16 Digit):</label>
                                        <input
                                            type="text"
                                            maxLength={16}
                                            value={createForm.data.nik}
                                            onChange={(e) => createForm.setData('nik', e.target.value.replace(/[^0-9]/g, ''))}
                                            placeholder="Contoh: 3203011204850002"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Email:</label>
                                        <input
                                            type="email"
                                            value={createForm.data.email}
                                            onChange={(e) => createForm.setData('email', e.target.value)}
                                            placeholder="user@staialittihad.ac.id"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Peran (Role):</label>
                                        <select
                                            value={createForm.data.role}
                                            onChange={(e) => createForm.setData('role', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        >
                                            <option value="mahasiswa">Mahasiswa</option>
                                            <option value="dosen">Dosen Pengampu</option>
                                            <option value="dosen_pa">Dosen PA (Wali)</option>
                                            <option value="kaprodi">Ketua Prodi</option>
                                            <option value="keuangan">Keuangan</option>
                                            <option value="admin_akademik">Admin BAAK</option>
                                            <option value="superadmin">Superadmin</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin:</label>
                                        <select
                                            value={createForm.data.gender}
                                            onChange={(e) => createForm.setData('gender', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        >
                                            <option value="L">Laki-laki</option>
                                            <option value="P">Perempuan</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Homebase Prodi:</label>
                                        <select
                                            value={createForm.data.study_program}
                                            onChange={(e) => createForm.setData('study_program', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        >
                                            <option value="">Tidak Terikat Prodi</option>
                                            {studyPrograms.map((p) => (
                                                <option key={p.id} value={p.name}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Kata Sandi Akun:</label>
                                    <input
                                        type="text"
                                        value={createForm.data.password}
                                        onChange={(e) => createForm.setData('password', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        required
                                    />
                                    <span className="text-[10px] text-slate-400 mt-1 block">Default standar: salam123</span>
                                </div>

                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsCreateOpen(false)} 
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition cursor-pointer"
                                    >
                                        Batal (ESC)
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={createForm.processing} 
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                                    >
                                        Simpan Pengguna
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL EDIT USER */}
                {isEditOpen && selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
                        <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 sm:p-5 text-white flex items-center justify-between">
                                <div>
                                    <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black mb-1">
                                        <Edit2 className="w-3 h-3 text-emerald-400" />
                                        <span>MANAJEMEN PENGGUNA</span>
                                    </div>
                                    <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-white">
                                        Edit Data Pengguna
                                    </h3>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                                        ESC
                                    </span>
                                    <button 
                                        onClick={() => setIsEditOpen(false)} 
                                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleEditSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nama Lengkap:</label>
                                    <input
                                        type="text"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Username:</label>
                                        <input
                                            type="text"
                                            value={editForm.data.username}
                                            onChange={(e) => editForm.setData('username', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">NIM / NIDN / NIP:</label>
                                        <input
                                            type="text"
                                            value={editForm.data.identity_number}
                                            onChange={(e) => editForm.setData('identity_number', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">NIK (16 Digit):</label>
                                        <input
                                            type="text"
                                            maxLength={16}
                                            value={editForm.data.nik}
                                            onChange={(e) => editForm.setData('nik', e.target.value.replace(/[^0-9]/g, ''))}
                                            placeholder="Contoh: 3203011204850002"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Email:</label>
                                        <input
                                            type="email"
                                            value={editForm.data.email}
                                            onChange={(e) => editForm.setData('email', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Peran (Role):</label>
                                        <select
                                            value={editForm.data.role}
                                            onChange={(e) => editForm.setData('role', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        >
                                            <option value="mahasiswa">Mahasiswa</option>
                                            <option value="dosen">Dosen Pengampu</option>
                                            <option value="dosen_pa">Dosen PA (Wali)</option>
                                            <option value="kaprodi">Ketua Prodi</option>
                                            <option value="keuangan">Keuangan</option>
                                            <option value="admin_akademik">Admin BAAK</option>
                                            <option value="superadmin">Superadmin</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Homebase Prodi:</label>
                                    <select
                                        value={editForm.data.study_program}
                                        onChange={(e) => editForm.setData('study_program', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    >
                                        <option value="">Tidak Terikat Prodi</option>
                                        {studyPrograms.map((p) => (
                                            <option key={p.id} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditOpen(false)} 
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition cursor-pointer"
                                    >
                                        Batal (ESC)
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={editForm.processing} 
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                                    >
                                        Perbarui Pengguna
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL IMPORT EXCEL */}
                {isImportOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
                        <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 sm:p-5 text-white flex items-center justify-between">
                                <div>
                                    <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black mb-1">
                                        <Upload className="w-3 h-3 text-emerald-400" />
                                        <span>IMPOR MASSAL DATA</span>
                                    </div>
                                    <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-white">
                                        Impor Batch Pengguna (Excel)
                                    </h3>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                                        ESC
                                    </span>
                                    <button 
                                        onClick={() => setIsImportOpen(false)} 
                                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-4 sm:p-5 space-y-3.5 text-xs">
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-slate-800">Template Impor Akun</p>
                                        <p className="text-[11px] text-slate-500">Kolom: Name, Username, Identity Number, Email, Role, Prodi</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleGenerateMockImport}
                                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-lg font-bold transition text-xs flex items-center space-x-1 cursor-pointer"
                                    >
                                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>Muat 3 Contoh Data</span>
                                    </button>
                                </div>

                                {importRecords.length > 0 && (
                                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                                        <div className="p-2.5 bg-slate-100 border-b border-slate-200 font-bold text-[10px] uppercase text-slate-700 flex items-center justify-between">
                                            <span>Pratinjau Data Siap Impor ({importRecords.length} Akun)</span>
                                            <button
                                                onClick={() => setImportRecords([])}
                                                className="text-rose-600 hover:text-rose-800 text-[10px] font-bold cursor-pointer"
                                            >
                                                Bersihkan
                                            </button>
                                        </div>
                                        <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
                                            {importRecords.map((r, idx) => (
                                                <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition">
                                                    <div>
                                                        <span className="font-bold text-slate-900">{r.name}</span>
                                                        <span className="text-slate-400 font-mono ml-2 text-[11px]">(@{r.username})</span>
                                                        <p className="text-[10px] text-slate-400">{r.study_program}</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${getRoleBadgeStyle(r.role)}`}>
                                                        {getRoleLabel(r.role)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px]">
                                    ℹ️ Semua akun hasil impor otomatis disetel dengan password default: <strong className="font-mono text-emerald-700 font-bold">salam123</strong>.
                                </div>

                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsImportOpen(false)} 
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition cursor-pointer"
                                    >
                                        Batal (ESC)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleImportSubmit}
                                        disabled={importRecords.length === 0}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                                    >
                                        Proses Impor ({importRecords.length} Akun)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL KONFIRMASI HAPUS USER */}
                {userToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
                        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-4 text-white flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30">
                                        <AlertTriangle className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-tight text-white">
                                        Konfirmasi Hapus Akun
                                    </h3>
                                </div>
                                <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                                    ESC
                                </span>
                            </div>

                            <div className="p-5 space-y-4 text-xs">
                                <p className="text-slate-700">
                                    Apakah Anda yakin ingin menghapus akun pengguna <strong className="text-slate-900">{userToDelete.name}</strong> (@{userToDelete.username}) secara permanen?
                                </p>
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px]">
                                    ⚠️ Tindakan ini akan menghapus akun dan sesi login pengguna yang bersangkutan.
                                </div>

                                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setUserToDelete(null)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition cursor-pointer"
                                    >
                                        Batal (ESC)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmDelete}
                                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                                    >
                                        Ya, Hapus Akun
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL KONFIRMASI RESET PASSWORD */}
                {userToReset && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
                        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 text-white flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                                        <KeyRound className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-tight text-white">
                                        Reset Kata Sandi Akun
                                    </h3>
                                </div>
                                <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                                    ESC
                                </span>
                            </div>

                            <div className="p-5 space-y-4 text-xs">
                                <p className="text-slate-700">
                                    Setel ulang kata sandi pengguna <strong className="text-slate-900">{userToReset.name}</strong> (@{userToReset.username}) kembali ke kata sandi standar institusi?
                                </p>
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px]">
                                    🔑 Kata sandi akan diatur kembali ke: <strong className="font-mono font-bold">salam123</strong>.
                                </div>

                                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setUserToReset(null)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition cursor-pointer"
                                    >
                                        Batal (ESC)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmResetPassword}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                                    >
                                        Reset ke 'salam123'
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
