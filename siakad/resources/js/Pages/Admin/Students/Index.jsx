import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import ImpersonationModal from '../../../Components/ImpersonationModal';
import { 
    Users, Search, UserPlus, Upload, Filter, 
    Edit2, KeyRound, Trash2, CheckCircle2, ChevronRight,
    GraduationCap, Calendar, BookOpen, CreditCard, ShieldCheck
} from 'lucide-react';

export default function StudentsIndex({ students, academicYears = [], studyPrograms = [], activePeriod, stats = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [year, setYear] = useState(filters.academic_year || '');
    const [prodi, setProdi] = useState(filters.study_program || '');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isImpersonateOpen, setIsImpersonateOpen] = useState(false);

    // Create Form
    const createForm = useForm({
        name: '',
        identity_number: '',
        email: '',
        study_program: studyPrograms[0]?.name || 'Pendidikan Agama Islam (S1)',
        gender: 'L',
        phone_number: '',
    });

    // Edit Form
    const editForm = useForm({
        name: '',
        identity_number: '',
        email: '',
        study_program: '',
        gender: 'L',
        phone_number: '',
        is_active: true,
    });

    const [importRecords, setImportRecords] = useState([]);

    const handleFilterChange = (newYear, newProdi) => {
        router.get('/admin/students', { search, academic_year: newYear, study_program: newProdi }, { preserveState: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/students', { search, academic_year: year, study_program: prodi }, { preserveState: true });
    };

    const handleOpenEdit = (stu) => {
        setSelectedStudent(stu);
        editForm.setData({
            name: stu.name,
            identity_number: stu.identity_number || '',
            email: stu.email,
            study_program: stu.study_program || '',
            gender: stu.gender || 'L',
            phone_number: stu.phone_number || '',
            is_active: stu.is_active,
        });
        setIsEditOpen(true);
    };

    const handleOpenImpersonate = (stu) => {
        setSelectedStudent(stu);
        setIsImpersonateOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post('/admin/students', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        editForm.put(`/admin/students/${selectedStudent.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
            },
        });
    };

    const handleResetPassword = (stu) => {
        if (confirm(`Reset kata sandi mahasiswa ${stu.name} (${stu.identity_number}) ke password default 'salam123'?`)) {
            router.post(`/admin/users/${stu.id}/reset-password`);
        }
    };

    const handleToggleStatus = (stu) => {
        router.post(`/admin/users/${stu.id}/toggle-status`);
    };

    const handleGenerateMockImport = () => {
        const mockData = [
            { name: 'Muhammad Rizky Pratama', identity_number: '22010001', email: 'rizky.pratama@staialittihad.ac.id', study_program: 'Pendidikan Agama Islam (S1)', gender: 'L' },
            { name: 'Nabila Nur Azizah', identity_number: '22010002', email: 'nabila.azizah@staialittihad.ac.id', study_program: 'Pendidikan Agama Islam (S1)', gender: 'P' },
            { name: 'Siti Sarah Rahmawati', identity_number: '22010003', email: 'siti.sarah@staialittihad.ac.id', study_program: 'Manajemen Pendidikan Islam (S1)', gender: 'P' },
        ];
        setImportRecords(mockData);
    };

    const handleImportSubmit = () => {
        router.post('/admin/students/import-batch', { records: importRecords }, {
            onSuccess: () => {
                setIsImportOpen(false);
                setImportRecords([]);
            },
        });
    };

    return (
        <AppLayout title="Direktori Data Mahasiswa">
            <Head title="Data Mahasiswa — SIAKAD" />

            {/* Impersonation Modal */}
            <ImpersonationModal
                isOpen={isImpersonateOpen}
                onClose={() => setIsImpersonateOpen(false)}
                targetUser={selectedStudent}
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Direktori & Data Mahasiswa</h2>
                        <p className="text-xs text-slate-500">
                            Kelola data mahasiswa aktif, filter angkatan & program studi, serta pemantauan status studi.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsImportOpen(true)}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-slate-200 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                        >
                            <Upload className="w-4 h-4 text-emerald-400" />
                            <span>Impor Excel Mahasiswa</span>
                        </button>
                        <button
                            onClick={() => {
                                createForm.reset();
                                setIsCreateOpen(true);
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Tambah Mahasiswa Baru</span>
                        </button>
                    </div>
                </div>

                {/* Filter Controls (Academic Year & Study Program) */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
                    {/* Year Selector */}
                    <div className="w-full md:w-56 flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                        <select
                            value={year}
                            onChange={(e) => {
                                setYear(e.target.value);
                                handleFilterChange(e.target.value, prodi);
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">Semua Angkatan / Tahun</option>
                            <option value="2026">Angkatan 2026 (Mhs Baru)</option>
                            <option value="2025">Angkatan 2025</option>
                            <option value="2024">Angkatan 2024</option>
                            <option value="2023">Angkatan 2023</option>
                            <option value="2022">Angkatan 2022</option>
                            <option value="2021">Angkatan 2021</option>
                        </select>
                    </div>

                    {/* Prodi Selector */}
                    <div className="w-full md:w-64">
                        <select
                            value={prodi}
                            onChange={(e) => {
                                setProdi(e.target.value);
                                handleFilterChange(year, e.target.value);
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">Semua Program Studi</option>
                            {studyPrograms.map((p) => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
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
                                placeholder="Cari nama mahasiswa atau NIM..."
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

                {/* Students Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-4">Nama Mahasiswa</th>
                                    <th className="py-3 px-4">NIM</th>
                                    <th className="py-3 px-4">Program Studi</th>
                                    <th className="py-3 px-4 text-center">Angkatan</th>
                                    <th className="py-3 px-4 text-center">Status KRS</th>
                                    <th className="py-3 px-4 text-center">Status VA SPP</th>
                                    <th className="py-3 px-4 text-center">Akun</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                                            Tidak ada data mahasiswa yang sesuai dengan filter tahun/prodi yang dipilih.
                                        </td>
                                    </tr>
                                ) : (
                                    students.data.map((stu) => (
                                        <tr key={stu.id} className="hover:bg-slate-50 transition">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center font-black text-white text-xs">
                                                        {stu.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900">{stu.name}</p>
                                                        <p className="text-[11px] text-slate-400 font-mono">{stu.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-mono font-bold text-slate-800">
                                                {stu.identity_number || stu.username}
                                            </td>
                                            <td className="py-3 px-4 text-slate-700 font-medium">
                                                {stu.study_program || 'Pendidikan Agama Islam (S1)'}
                                            </td>
                                            <td className="py-3 px-4 text-center font-bold text-slate-700">
                                                {stu.batch_year}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                                    stu.krs_status === 'DISETUJUI' ? 'bg-emerald-100 text-emerald-800' :
                                                    stu.krs_status === 'DIAJUKAN' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {stu.krs_status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                                    stu.invoice_status === 'LUNAS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                                }`}>
                                                    {stu.invoice_status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleToggleStatus(stu)}
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-black transition cursor-pointer ${
                                                        stu.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                                                    }`}
                                                >
                                                    {stu.is_active ? '● AKTIF' : '○ NONAKTIF'}
                                                </button>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end space-x-1.5">
                                                    {/* Impersonate Button */}
                                                    <button
                                                        onClick={() => handleOpenImpersonate(stu)}
                                                        title="Menyamar sebagai mahasiswa ini"
                                                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-black transition flex items-center space-x-1"
                                                    >
                                                        <span>🎭</span>
                                                        <span className="hidden sm:inline">Menyamar</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEdit(stu)}
                                                        title="Edit Data"
                                                        className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleResetPassword(stu)}
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
                            Menampilkan {students.from || 0} - {students.to || 0} dari {students.total} mahasiswa
                        </span>
                        <div className="flex items-center space-x-1">
                            {students.links.map((link, idx) => (
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

                {/* MODAL CREATE STUDENT */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-900 uppercase">Tambah Mahasiswa Baru</h3>
                                <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Batal</button>
                            </div>
                            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Mahasiswa:</label>
                                    <input
                                        type="text"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="Contoh: Muhammad Farhan Al-Ghifari"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Nomor Induk Mahasiswa (NIM):</label>
                                        <input
                                            type="text"
                                            value={createForm.data.identity_number}
                                            onChange={(e) => createForm.setData('identity_number', e.target.value)}
                                            placeholder="Contoh: 26010001"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold font-mono"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin:</label>
                                        <select
                                            value={createForm.data.gender}
                                            onChange={(e) => createForm.setData('gender', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        >
                                            <option value="L">Laki-laki (Ikhwan)</option>
                                            <option value="P">Perempuan (Akhwat)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Email Mahasiswa:</label>
                                        <input
                                            type="email"
                                            value={createForm.data.email}
                                            onChange={(e) => createForm.setData('email', e.target.value)}
                                            placeholder="farhan@staialittihad.ac.id"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Program Studi:</label>
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
                                    <button type="submit" disabled={createForm.processing} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold">Simpan Mahasiswa</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL EDIT STUDENT */}
                {isEditOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-900 uppercase">Edit Data Mahasiswa</h3>
                                <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Batal</button>
                            </div>
                            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Mahasiswa:</label>
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
                                        <label className="font-bold text-slate-700 block mb-1">NIM:</label>
                                        <input
                                            type="text"
                                            value={editForm.data.identity_number}
                                            onChange={(e) => editForm.setData('identity_number', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold font-mono"
                                            required
                                        />
                                    </div>
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
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Program Studi:</label>
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
                                    <button type="submit" disabled={editForm.processing} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold">Perbarui Mahasiswa</button>
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
                                <h3 className="text-sm font-black text-slate-900 uppercase">Impor Massal Mahasiswa Baru (Excel)</h3>
                                <button onClick={() => setIsImportOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Batal</button>
                            </div>
                            <div className="space-y-3 text-xs">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-slate-800">Template Impor Mahasiswa</p>
                                        <p className="text-[11px] text-slate-500">Kolom: Name, NIM, Email, Program Studi</p>
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
                                            Pratinjau Data Siap Impor ({importRecords.length} Mahasiswa)
                                        </div>
                                        <div className="max-h-40 overflow-y-auto divide-y divide-slate-100">
                                            {importRecords.map((r, idx) => (
                                                <div key={idx} className="p-2.5 flex items-center justify-between text-[11px]">
                                                    <div>
                                                        <span className="font-bold text-slate-900">{r.name}</span>
                                                        <span className="text-slate-400 font-mono ml-2">({r.identity_number})</span>
                                                    </div>
                                                    <span className="text-slate-600">{r.study_program}</span>
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
                                        Proses Impor Mahasiswa
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
