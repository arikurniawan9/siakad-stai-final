import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import ImpersonationModal from '../../../Components/ImpersonationModal';
import { 
    Users, Search, UserPlus, Upload, Filter, 
    Edit2, KeyRound, Trash2, CheckCircle2, ChevronRight,
    GraduationCap, Calendar, BookOpen, Star, ShieldCheck
} from 'lucide-react';

export default function LecturersIndex({ lecturers, academicYears = [], studyPrograms = [], activePeriod, stats = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [prodi, setProdi] = useState(filters.study_program || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [selectedLecturer, setSelectedLecturer] = useState(null);
    const [isImpersonateOpen, setIsImpersonateOpen] = useState(false);

    // Create Form
    const createForm = useForm({
        name: '',
        identity_number: '',
        email: '',
        role: 'dosen',
        study_program: studyPrograms[0]?.name || 'Pendidikan Agama Islam (S1)',
        gender: 'L',
        phone_number: '',
    });

    // Edit Form
    const editForm = useForm({
        name: '',
        identity_number: '',
        email: '',
        role: 'dosen',
        study_program: '',
        gender: 'L',
        phone_number: '',
        is_active: true,
    });

    const [importRecords, setImportRecords] = useState([]);

    const handleFilterChange = (newProdi, newRole) => {
        router.get('/admin/lecturers', { search, study_program: newProdi, role: newRole }, { preserveState: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/lecturers', { search, study_program: prodi, role: roleFilter }, { preserveState: true });
    };

    const handleOpenEdit = (lec) => {
        setSelectedLecturer(lec);
        editForm.setData({
            name: lec.name,
            identity_number: lec.identity_number || '',
            email: lec.email,
            role: lec.role,
            study_program: lec.study_program || '',
            gender: lec.gender || 'L',
            phone_number: lec.phone_number || '',
            is_active: lec.is_active,
        });
        setIsEditOpen(true);
    };

    const handleOpenImpersonate = (lec) => {
        setSelectedLecturer(lec);
        setIsImpersonateOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post('/admin/lecturers', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        editForm.put(`/admin/lecturers/${selectedLecturer.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
            },
        });
    };

    const handleResetPassword = (lec) => {
        if (confirm(`Reset kata sandi dosen ${lec.name} (${lec.identity_number}) ke password default 'salam123'?`)) {
            router.post(`/admin/users/${lec.id}/reset-password`);
        }
    };

    const handleToggleStatus = (lec) => {
        router.post(`/admin/users/${lec.id}/toggle-status`);
    };

    const handleGenerateMockImport = () => {
        const mockData = [
            { name: 'Dr. H. M. Ridwan, M.Ag', identity_number: '2112087501', email: 'm.ridwan@staialittihad.ac.id', role: 'dosen', study_program: 'Pendidikan Agama Islam (S1)' },
            { name: 'Dra. Hj. Siti Maryam, M.Pd.I', identity_number: '2115047802', email: 'siti.maryam@staialittihad.ac.id', role: 'dosen_pa', study_program: 'Pendidikan Agama Islam (S1)' },
            { name: 'Dr. Ahmad Syafi\'i, M.Ag', identity_number: '2118097201', email: 'ahmad.syafii@staialittihad.ac.id', role: 'kaprodi', study_program: 'Pendidikan Agama Islam (S1)' },
        ];
        setImportRecords(mockData);
    };

    const handleImportSubmit = () => {
        router.post('/admin/lecturers/import-batch', { records: importRecords }, {
            onSuccess: () => {
                setIsImportOpen(false);
                setImportRecords([]);
            },
        });
    };

    return (
        <AppLayout title="Direktori Data Dosen & Pengajar">
            <Head title="Data Dosen — SIAKAD" />

            {/* Impersonation Modal */}
            <ImpersonationModal
                isOpen={isImpersonateOpen}
                onClose={() => setIsImpersonateOpen(false)}
                targetUser={selectedLecturer}
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Direktori Tenaga Pendidik (Dosen)</h2>
                        <p className="text-xs text-slate-500">
                            Kelola data dosen pengampu, dosen wali (PA), dan kaprodi pada semester ({activePeriod?.name || 'Periode Aktif'}).
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsImportOpen(true)}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-slate-200 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                        >
                            <Upload className="w-4 h-4 text-emerald-400" />
                            <span>Impor Excel Dosen</span>
                        </button>
                        <button
                            onClick={() => {
                                createForm.reset();
                                setIsCreateOpen(true);
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Tambah Dosen Baru</span>
                        </button>
                    </div>
                </div>

                {/* Filter Controls (Prodi & Role) */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
                    {/* Prodi Selector */}
                    <div className="w-full md:w-64">
                        <select
                            value={prodi}
                            onChange={(e) => {
                                setProdi(e.target.value);
                                handleFilterChange(e.target.value, roleFilter);
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">Semua Homebase Prodi</option>
                            {studyPrograms.map((p) => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Role Filter */}
                    <div className="w-full md:w-56">
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                handleFilterChange(prodi, e.target.value);
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">Semua Jabatan</option>
                            <option value="dosen">Dosen Pengampu</option>
                            <option value="dosen_pa">Dosen PA (Wali)</option>
                            <option value="kaprodi">Ketua Prodi</option>
                        </select>
                    </div>

                    {/* Search Input */}
                    <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 w-full">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama dosen atau NIDN..."
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {/* Lecturers Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-4">Nama Dosen & Gelar</th>
                                    <th className="py-3 px-4">NIDN / NIP</th>
                                    <th className="py-3 px-4">Homebase Program Studi</th>
                                    <th className="py-3 px-4">Jabatan Akademik</th>
                                    <th className="py-3 px-4 text-center">Kelas Ajar (Aktif)</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {lecturers.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                                            Tidak ada data dosen yang sesuai dengan kriteria pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    lecturers.data.map((lec) => (
                                        <tr key={lec.id} className="hover:bg-slate-50 transition">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-teal-800 flex items-center justify-center font-black text-white text-xs">
                                                        {lec.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900">{lec.name}</p>
                                                        <p className="text-[11px] text-slate-400 font-mono">{lec.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-mono font-bold text-slate-800">
                                                {lec.identity_number || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-slate-700 font-medium">
                                                {lec.study_program || 'Pendidikan Agama Islam (S1)'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                    lec.role === 'kaprodi' ? 'bg-indigo-100 text-indigo-800' :
                                                    lec.role === 'dosen_pa' ? 'bg-teal-100 text-teal-800' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {lec.role === 'kaprodi' ? 'Ketua Prodi' : lec.role === 'dosen_pa' ? 'Dosen PA (Wali)' : 'Dosen Pengampu'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="px-2.5 py-1 bg-emerald-50 rounded-lg font-black text-emerald-800 text-xs">
                                                    {lec.teaching_classes_count || 1} Kelas
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleToggleStatus(lec)}
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-black transition cursor-pointer ${
                                                        lec.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                                                    }`}
                                                >
                                                    {lec.is_active ? '● AKTIF' : '○ NONAKTIF'}
                                                </button>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end space-x-1.5">
                                                    {/* Impersonate Button */}
                                                    <button
                                                        onClick={() => handleOpenImpersonate(lec)}
                                                        title="Menyamar sebagai dosen ini"
                                                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-black transition flex items-center space-x-1"
                                                    >
                                                        <span>🎭</span>
                                                        <span className="hidden sm:inline">Menyamar</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEdit(lec)}
                                                        title="Edit Data Dosen"
                                                        className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleResetPassword(lec)}
                                                        title="Reset Password ke salam123"
                                                        className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
                                                    >
                                                        <KeyRound className="w-3.5 h-3.5" />
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
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                            Menampilkan {lecturers.from || 0} - {lecturers.to || 0} dari {lecturers.total} dosen
                        </span>
                        <div className="flex items-center space-x-1">
                            {lecturers.links.map((link, idx) => (
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

                {/* MODAL CREATE LECTURER */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-900 uppercase">Tambah Dosen Baru</h3>
                                <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Batal</button>
                            </div>
                            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nama Lengkap & Gelar:</label>
                                    <input
                                        type="text"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="Contoh: Dr. H. M. Ridwan, M.Ag"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">NIDN / NIP:</label>
                                        <input
                                            type="text"
                                            value={createForm.data.identity_number}
                                            onChange={(e) => createForm.setData('identity_number', e.target.value)}
                                            placeholder="Contoh: 2112087501"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold font-mono"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Jabatan:</label>
                                        <select
                                            value={createForm.data.role}
                                            onChange={(e) => createForm.setData('role', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        >
                                            <option value="dosen">Dosen Pengampu</option>
                                            <option value="dosen_pa">Dosen PA (Wali)</option>
                                            <option value="kaprodi">Ketua Prodi</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Email Institusi:</label>
                                        <input
                                            type="email"
                                            value={createForm.data.email}
                                            onChange={(e) => createForm.setData('email', e.target.value)}
                                            placeholder="dosen@staialittihad.ac.id"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Homebase Prodi:</label>
                                        <select
                                            value={createForm.data.study_program}
                                            onChange={(e) => createForm.setData('study_program', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        >
                                            {studyPrograms.map((p) => (
                                                <option key={p.id} value={p.name}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-lg text-emerald-800 text-[11px] font-medium">
                                    ℹ️ Password akun otomatis disetel ke default: <strong className="font-mono">salam123</strong>.
                                </div>
                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Batal</button>
                                    <button type="submit" disabled={createForm.processing} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold">Simpan Dosen</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL EDIT LECTURER */}
                {isEditOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-900 uppercase">Edit Data Dosen</h3>
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
                                        <label className="font-bold text-slate-700 block mb-1">NIDN / NIP:</label>
                                        <input
                                            type="text"
                                            value={editForm.data.identity_number}
                                            onChange={(e) => editForm.setData('identity_number', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold font-mono"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Jabatan:</label>
                                        <select
                                            value={editForm.data.role}
                                            onChange={(e) => editForm.setData('role', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        >
                                            <option value="dosen">Dosen Pengampu</option>
                                            <option value="dosen_pa">Dosen PA (Wali)</option>
                                            <option value="kaprodi">Ketua Prodi</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Homebase Prodi:</label>
                                    <select
                                        value={editForm.data.study_program}
                                        onChange={(e) => editForm.setData('study_program', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                    >
                                        {studyPrograms.map((p) => (
                                            <option key={p.id} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Batal</button>
                                    <button type="submit" disabled={editForm.processing} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold">Perbarui Dosen</button>
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
                                <h3 className="text-sm font-black text-slate-900 uppercase">Impor Massal Tenaga Dosen (Excel)</h3>
                                <button onClick={() => setIsImportOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Batal</button>
                            </div>
                            <div className="space-y-3 text-xs">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-slate-800">Template Impor Dosen</p>
                                        <p className="text-[11px] text-slate-500">Kolom: Name, NIDN, Email, Role, Homebase Prodi</p>
                                    </div>
                                    <button
                                        onClick={handleGenerateMockImport}
                                        className="px-3 py-1.5 bg-slate-800 text-emerald-400 rounded-lg font-bold"
                                    >
                                        Muat Contoh Data
                                    </button>
                                </div>

                                {importRecords.length > 0 && (
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="p-2.5 bg-slate-100 font-black text-[10px] uppercase">
                                            Pratinjau Data Siap Impor ({importRecords.length} Dosen)
                                        </div>
                                        <div className="max-h-40 overflow-y-auto divide-y divide-slate-100">
                                            {importRecords.map((r, idx) => (
                                                <div key={idx} className="p-2.5 flex items-center justify-between text-[11px]">
                                                    <div>
                                                        <span className="font-bold text-slate-900">{r.name}</span>
                                                        <span className="text-slate-400 font-mono ml-2">({r.identity_number})</span>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold text-[10px]">
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
                                        Proses Impor Dosen
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
