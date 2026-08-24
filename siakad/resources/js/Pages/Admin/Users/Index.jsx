import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import ImpersonationModal from '../../../Components/ImpersonationModal';
import { 
    Users, Search, UserCheck, ShieldAlert, Filter, 
    ArrowRight, ShieldCheck, CheckCircle2, Plus, Edit2, 
    KeyRound, ToggleLeft, ToggleRight, Trash2, Upload, 
    Download, UserPlus, Sparkles, Check, X
} from 'lucide-react';

export default function UsersIndex({ users, studyPrograms = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');
    const [prodi, setProdi] = useState(filters.study_program || '');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isImpersonateOpen, setIsImpersonateOpen] = useState(false);

    // Form Create
    const createForm = useForm({
        name: '',
        username: '',
        identity_number: '',
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
        email: '',
        role: 'mahasiswa',
        study_program: '',
        gender: 'L',
        phone_number: '',
        is_active: true,
    });

    // Batch Import Data State
    const [importRecords, setImportRecords] = useState([]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/users', { search, role, study_program: prodi }, { preserveState: true });
    };

    const handleOpenCreate = () => {
        createForm.reset();
        setIsCreateOpen(true);
    };

    const handleOpenEdit = (u) => {
        setSelectedUser(u);
        editForm.setData({
            name: u.name,
            username: u.username,
            identity_number: u.identity_number || '',
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

    const handleResetPassword = (u) => {
        if (confirm(`Reset kata sandi akun ${u.name} (${u.username}) ke password default 'salam123'?`)) {
            router.post(`/admin/users/${u.id}/reset-password`);
        }
    };

    const handleToggleStatus = (u) => {
        router.post(`/admin/users/${u.id}/toggle-status`);
    };

    const handleDeleteUser = (u) => {
        if (confirm(`Hapus akun ${u.name} secara permanen dari sistem?`)) {
            router.delete(`/admin/users/${u.id}`);
        }
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

    return (
        <AppLayout title="Manajemen Pengguna & Akun">
            <Head title="Manajemen Pengguna — SIAKAD" />

            {/* Impersonation Modal */}
            <ImpersonationModal
                isOpen={isImpersonateOpen}
                onClose={() => setIsImpersonateOpen(false)}
                targetUser={selectedUser}
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Manajemen Pengguna Civitas Akademika</h2>
                        <p className="text-xs text-slate-500">Kelola akun mahasiswa, dosen, dan staf, reset kata sandi, serta mode penyamaran.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsImportOpen(true)}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-slate-200 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                        >
                            <Upload className="w-4 h-4 text-emerald-400" />
                            <span>Impor Excel / Batch</span>
                        </button>
                        <button
                            onClick={handleOpenCreate}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Tambah Pengguna Baru</span>
                        </button>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
                    <form onSubmit={handleSearch} className="flex-1 flex flex-col sm:flex-row items-center gap-2 w-full">
                        <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama, NIM, NIDN, username, atau email..."
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <select
                            value={role}
                            onChange={(e) => {
                                setRole(e.target.value);
                                router.get('/admin/users', { search, role: e.target.value, study_program: prodi }, { preserveState: true });
                            }}
                            className="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">Semua Peran</option>
                            <option value="superadmin">Superadmin (Developer)</option>
                            <option value="admin_akademik">Admin BAAK</option>
                            <option value="keuangan">Keuangan</option>
                            <option value="kaprodi">Kaprodi</option>
                            <option value="dosen_pa">Dosen PA</option>
                            <option value="dosen">Dosen</option>
                            <option value="mahasiswa">Mahasiswa</option>
                        </select>
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-4">Pengguna</th>
                                    <th className="py-3 px-4">NIM / NIDN</th>
                                    <th className="py-3 px-4">Peran (Role)</th>
                                    <th className="py-3 px-4">Program Studi</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi Kelola</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.data.map((u) => {
                                    const isSuperadmin = u.role === 'superadmin';
                                    const isMe = u.id === users.data[0]?.id; // approximation
                                    return (
                                        <tr key={u.id} className="hover:bg-slate-50 transition">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-2.5">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs ${
                                                        isSuperadmin ? 'bg-purple-700' : 'bg-slate-800'
                                                    }`}>
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900">{u.name}</p>
                                                        <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-mono font-bold text-slate-700">
                                                {u.identity_number || u.username}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                                    u.role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                                                    u.role === 'admin_akademik' ? 'bg-blue-100 text-blue-800' :
                                                    u.role === 'keuangan' ? 'bg-amber-100 text-amber-800' :
                                                    u.role === 'kaprodi' ? 'bg-indigo-100 text-indigo-800' :
                                                    u.role?.includes('dosen') ? 'bg-teal-100 text-teal-800' :
                                                    'bg-emerald-100 text-emerald-800'
                                                }`}>
                                                    {u.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-600 font-medium">
                                                {u.study_program || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleToggleStatus(u)}
                                                    title="Klik untuk ubah status"
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-black transition cursor-pointer ${
                                                        u.is_active ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                                    }`}
                                                >
                                                    {u.is_active ? '● AKTIF' : '○ NONAKTIF'}
                                                </button>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end space-x-1.5">
                                                    {/* Impersonate Button */}
                                                    <button
                                                        onClick={() => handleOpenImpersonate(u)}
                                                        title="Menyamar sebagai pengguna ini"
                                                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-black transition flex items-center space-x-1"
                                                    >
                                                        <span>🎭</span>
                                                        <span className="hidden sm:inline">Menyamar</span>
                                                    </button>
                                                    
                                                    {/* Edit Button */}
                                                    <button
                                                        onClick={() => handleOpenEdit(u)}
                                                        title="Edit Data Pengguna"
                                                        className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Reset Password */}
                                                    <button
                                                        onClick={() => handleResetPassword(u)}
                                                        title="Reset Password ke salam123"
                                                        className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
                                                    >
                                                        <KeyRound className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Delete */}
                                                    {!isSuperadmin && (
                                                        <button
                                                            onClick={() => handleDeleteUser(u)}
                                                            title="Hapus Akun"
                                                            className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links */}
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                            Menampilkan {users.from || 0} - {users.to || 0} dari {users.total} pengguna
                        </span>
                        <div className="flex items-center space-x-1">
                            {users.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-2.5 py-1 rounded text-xs font-bold transition ${
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-900 uppercase">Tambah Pengguna Baru</h3>
                                <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Batal</button>
                            </div>
                            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nama Lengkap & Gelar:</label>
                                    <input
                                        type="text"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="Contoh: Ahmad Fauzi Rahman / Dr. H. M. Ridwan, M.Ag"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Username / Login:</label>
                                        <input
                                            type="text"
                                            value={createForm.data.username}
                                            onChange={(e) => createForm.setData('username', e.target.value)}
                                            placeholder="Contoh: 21010042 / m.ridwan"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">NIM / NIDN / NIP:</label>
                                        <input
                                            type="text"
                                            value={createForm.data.identity_number}
                                            onChange={(e) => createForm.setData('identity_number', e.target.value)}
                                            placeholder="Contoh: 21010042"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Email Institusi:</label>
                                        <input
                                            type="email"
                                            value={createForm.data.email}
                                            onChange={(e) => createForm.setData('email', e.target.value)}
                                            placeholder="nama@staialittihad.ac.id"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Peran (Role):</label>
                                        <select
                                            value={createForm.data.role}
                                            onChange={(e) => createForm.setData('role', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        >
                                            <option value="mahasiswa">Mahasiswa</option>
                                            <option value="dosen">Dosen Pengampu</option>
                                            <option value="dosen_pa">Dosen PA (Wali)</option>
                                            <option value="kaprodi">Ketua Prodi</option>
                                            <option value="keuangan">Staf Keuangan</option>
                                            <option value="admin_akademik">Admin BAAK</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Program Studi:</label>
                                        <select
                                            value={createForm.data.study_program}
                                            onChange={(e) => createForm.setData('study_program', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        >
                                            <option value="Pendidikan Agama Islam (S1)">Pendidikan Agama Islam (S1)</option>
                                            <option value="Manajemen Pendidikan Islam (S1)">Manajemen Pendidikan Islam (S1)</option>
                                            <option value="Hukum Ekonomi Syariah (S1)">Hukum Ekonomi Syariah (S1)</option>
                                            <option value="Pendidikan Guru Madrasah Ibtidaiyah (S1)">PGMI (S1)</option>
                                            <option value="Ekonomi Syariah (S1)">Ekonomi Syariah (S1)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Kata Sandi Default:</label>
                                        <input
                                            type="text"
                                            value={createForm.data.password}
                                            onChange={(e) => createForm.setData('password', e.target.value)}
                                            className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2 font-mono font-bold text-emerald-800"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Batal</button>
                                    <button type="submit" disabled={createForm.processing} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold">Simpan Pengguna</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL EDIT USER */}
                {isEditOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-900 uppercase">Edit Data Pengguna</h3>
                                <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Batal</button>
                            </div>
                            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nama Lengkap & Gelar:</label>
                                    <input
                                        type="text"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Username:</label>
                                        <input
                                            type="text"
                                            value={editForm.data.username}
                                            onChange={(e) => editForm.setData('username', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">NIM / NIDN:</label>
                                        <input
                                            type="text"
                                            value={editForm.data.identity_number}
                                            onChange={(e) => editForm.setData('identity_number', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
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
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Peran (Role):</label>
                                        <select
                                            value={editForm.data.role}
                                            onChange={(e) => editForm.setData('role', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        >
                                            <option value="mahasiswa">Mahasiswa</option>
                                            <option value="dosen">Dosen Pengampu</option>
                                            <option value="dosen_pa">Dosen PA (Wali)</option>
                                            <option value="kaprodi">Ketua Prodi</option>
                                            <option value="keuangan">Staf Keuangan</option>
                                            <option value="admin_akademik">Admin BAAK</option>
                                            <option value="superadmin">Superadmin</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Program Studi:</label>
                                    <input
                                        type="text"
                                        value={editForm.data.study_program}
                                        onChange={(e) => editForm.setData('study_program', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                    />
                                </div>
                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Batal</button>
                                    <button type="submit" disabled={editForm.processing} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold">Perbarui Akun</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL IMPORT EXCEL */}
                {isImportOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-900 uppercase">Impor Massal Pengguna via Excel / Batch</h3>
                                <button onClick={() => setIsImportOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Batal</button>
                            </div>
                            <div className="space-y-3 text-xs">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-slate-800">Format Template Impor Mahasiswa & Dosen</p>
                                        <p className="text-[11px] text-slate-500">Kolom: Name, Identity_Number, Email, Role, Study_Program</p>
                                    </div>
                                    <button
                                        onClick={handleGenerateMockImport}
                                        className="px-3 py-1.5 bg-slate-800 text-emerald-400 rounded-lg font-bold"
                                    >
                                        Muat Contoh Data (3 Baris)
                                    </button>
                                </div>

                                {importRecords.length > 0 && (
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="p-2.5 bg-slate-100 font-black text-[10px] uppercase">
                                            Pratinjau Data Siap Impor ({importRecords.length} Data)
                                        </div>
                                        <div className="max-h-40 overflow-y-auto divide-y divide-slate-100">
                                            {importRecords.map((r, idx) => (
                                                <div key={idx} className="p-2.5 flex items-center justify-between text-[11px]">
                                                    <div>
                                                        <span className="font-bold text-slate-900">{r.name}</span>
                                                        <span className="text-slate-400 font-mono ml-2">({r.identity_number})</span>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                                        {r.role}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsImportOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Batal</button>
                                    <button
                                        onClick={handleImportSubmit}
                                        disabled={importRecords.length === 0}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold disabled:opacity-50"
                                    >
                                        Proses Impor ({importRecords.length} Akun)
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
