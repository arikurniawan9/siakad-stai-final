import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    GraduationCap, Building2, Plus, Edit2, Trash2, Search, 
    CheckCircle2, XCircle, ShieldCheck, Award, BookOpen, 
    Users, School, X, Save, RefreshCw, Layers, Check, Filter
} from 'lucide-react';

export default function StudyProgramsIndex({ studyPrograms = [], faculties = [], lecturers = [] }) {
    const [activeTab, setActiveTab] = useState('prodi'); // prodi | faculty
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFacultyFilter, setSelectedFacultyFilter] = useState('');
    const [selectedDegreeFilter, setSelectedDegreeFilter] = useState('');

    // Modal State - Prodi
    const [isProdiModalOpen, setIsProdiModalOpen] = useState(false);
    const [editingProdi, setEditingProdi] = useState(null);

    // Modal State - Faculty
    const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);

    // Form Prodi
    const prodiForm = useForm({
        faculty_id: '',
        code: '',
        name: '',
        degree: 'S1',
        accreditation: 'Baik Sekali',
        sk_number: '',
        head_of_program_id: '',
        secretary_id: '',
        is_active: true,
    });

    // Form Faculty
    const facultyForm = useForm({
        code: '',
        name: '',
        dean_name: '',
        is_active: true,
    });

    // Open Prodi Modal
    const openProdiModal = (prodi = null) => {
        setEditingProdi(prodi);
        if (prodi) {
            prodiForm.setData({
                faculty_id: prodi.faculty_id || '',
                code: prodi.code || '',
                name: prodi.name || '',
                degree: prodi.degree || 'S1',
                accreditation: prodi.accreditation || 'Baik Sekali',
                sk_number: prodi.sk_number || '',
                head_of_program_id: prodi.head_of_program_id || '',
                secretary_id: prodi.secretary_id || '',
                is_active: Boolean(prodi.is_active),
            });
        } else {
            prodiForm.reset();
            prodiForm.setData({
                faculty_id: faculties[0]?.id || '',
                code: '',
                name: '',
                degree: 'S1',
                accreditation: 'Baik Sekali',
                sk_number: '',
                head_of_program_id: '',
                secretary_id: '',
                is_active: true,
            });
        }
        setIsProdiModalOpen(true);
    };

    // Open Faculty Modal
    const openFacultyModal = (faculty = null) => {
        setEditingFaculty(faculty);
        if (faculty) {
            facultyForm.setData({
                code: faculty.code || '',
                name: faculty.name || '',
                dean_name: faculty.dean_name || '',
                is_active: Boolean(faculty.is_active),
            });
        } else {
            facultyForm.reset();
            facultyForm.setData({
                code: '',
                name: '',
                dean_name: '',
                is_active: true,
            });
        }
        setIsFacultyModalOpen(true);
    };

    // Submit Prodi
    const handleProdiSubmit = (e) => {
        e.preventDefault();
        if (editingProdi) {
            prodiForm.put(`/admin/study-programs/${editingProdi.id}`, {
                onSuccess: () => {
                    setIsProdiModalOpen(false);
                    prodiForm.reset();
                },
            });
        } else {
            prodiForm.post('/admin/study-programs', {
                onSuccess: () => {
                    setIsProdiModalOpen(false);
                    prodiForm.reset();
                },
            });
        }
    };

    // Submit Faculty
    const handleFacultySubmit = (e) => {
        e.preventDefault();
        if (editingFaculty) {
            facultyForm.put(`/admin/faculties/${editingFaculty.id}`, {
                onSuccess: () => {
                    setIsFacultyModalOpen(false);
                    facultyForm.reset();
                },
            });
        } else {
            facultyForm.post('/admin/faculties', {
                onSuccess: () => {
                    setIsFacultyModalOpen(false);
                    facultyForm.reset();
                },
            });
        }
    };

    // Delete Handlers
    const handleDeleteProdi = (prodi) => {
        if (confirm(`Apakah Anda yakin ingin menghapus Program Studi ${prodi.name} (${prodi.code})?`)) {
            router.delete(`/admin/study-programs/${prodi.id}`);
        }
    };

    const handleDeleteFaculty = (faculty) => {
        if (confirm(`Apakah Anda yakin ingin menghapus Fakultas ${faculty.name}?`)) {
            router.delete(`/admin/faculties/${faculty.id}`);
        }
    };

    // Filter Prodi
    const filteredProdi = studyPrograms.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (p.national_code && p.national_code.includes(searchTerm));
        const matchesFaculty = !selectedFacultyFilter || String(p.faculty_id) === String(selectedFacultyFilter);
        const matchesDegree = !selectedDegreeFilter || p.degree === selectedDegreeFilter;
        return matchesSearch && matchesFaculty && matchesDegree;
    });

    // Stats calculations
    const totalProdi = studyPrograms.length;
    const totalFaculties = faculties.length;
    const totalStudents = studyPrograms.reduce((acc, p) => acc + (p.students_count || 0), 0);
    const unggulCount = studyPrograms.filter(p => p.accreditation === 'Unggul' || p.accreditation === 'A').length;

    return (
        <AppLayout title="Master Program Studi & Fakultas">
            <Head title="Manajemen Program Studi — SIAKAD" />

            <div className="space-y-6">
                {/* HEADER BANNER */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-md border border-indigo-900/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center space-x-3.5">
                        <div className="p-3 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-2xl">
                            <GraduationCap className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-300 rounded-full font-black text-[10px] uppercase tracking-wider border border-indigo-400/40">
                                    STRUKTUR AKADEMIK
                                </span>
                                <span className="text-[11px] text-slate-400">STAI Al-Ittihad Cianjur</span>
                            </div>
                            <h2 className="text-xl font-black tracking-tight text-white mt-1">
                                Manajemen Program Studi & Fakultas
                            </h2>
                            <p className="text-xs text-indigo-200 mt-0.5">
                                Kelola struktur jurusan, jenjang studi, SK akreditasi BAN-PT/LAM, pimpinan Kaprodi, dan kode resmi PDDIKTI.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 self-start md:self-auto">
                        <button
                            type="button"
                            onClick={() => openFacultyModal()}
                            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border border-white/10"
                        >
                            <Building2 className="w-3.5 h-3.5" />
                            <span>+ Tambah Fakultas</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => openProdiModal()}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition shadow-md flex items-center space-x-1.5 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>+ Tambah Program Studi</span>
                        </button>
                    </div>
                </div>

                {/* STATS METRIC GRID */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">Total Program Studi</span>
                            <span className="p-1.5 bg-indigo-100 text-indigo-800 rounded-xl"><GraduationCap className="w-4 h-4" /></span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2">{totalProdi}</p>
                        <p className="text-[10px] text-indigo-600 font-bold mt-0.5">Aktif di Sistem Akademik</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">Fakultas / Jurusan</span>
                            <span className="p-1.5 bg-blue-100 text-blue-800 rounded-xl"><Building2 className="w-4 h-4" /></span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2">{totalFaculties}</p>
                        <p className="text-[10px] text-blue-600 font-bold mt-0.5">Struktur Fakultas Resmi</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">Akreditasi Unggul / A</span>
                            <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-xl"><Award className="w-4 h-4" /></span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2">{unggulCount}</p>
                        <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Standar Mutu BAN-PT</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">Estimasi Mahasiswa</span>
                            <span className="p-1.5 bg-amber-100 text-amber-800 rounded-xl"><Users className="w-4 h-4" /></span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2">1,248</p>
                        <p className="text-[10px] text-amber-600 font-bold mt-0.5">Mahasiswa Terdaftar</p>
                    </div>
                </div>

                {/* TABS NAVIGATION & SEARCH CONTROLS */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('prodi')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                                    activeTab === 'prodi'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                }`}
                            >
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>Daftar Program Studi ({totalProdi})</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('faculty')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                                    activeTab === 'faculty'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                }`}
                            >
                                <Building2 className="w-3.5 h-3.5" />
                                <span>Daftar Fakultas ({totalFaculties})</span>
                            </button>
                        </div>

                        {activeTab === 'prodi' && (
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                                    <input
                                        type="text"
                                        placeholder="Cari kode / nama prodi..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium w-48 sm:w-56 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <select
                                    value={selectedFacultyFilter}
                                    onChange={(e) => setSelectedFacultyFilter(e.target.value)}
                                    className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                                >
                                    <option value="">Semua Fakultas</option>
                                    {faculties.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedDegreeFilter}
                                    onChange={(e) => setSelectedDegreeFilter(e.target.value)}
                                    className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                                >
                                    <option value="">Semua Jenjang</option>
                                    <option value="S1">S1 (Sarjana)</option>
                                    <option value="S2">S2 (Magister)</option>
                                    <option value="D3">D3 (Diploma)</option>
                                    <option value="Profesi">Profesi</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* TAB 1: TABEL PROGRAM STUDI */}
                    {activeTab === 'prodi' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                                        <th className="p-3">Kode Prodi</th>
                                        <th className="p-3">Nama Program Studi</th>
                                        <th className="p-3">Jenjang</th>
                                        <th className="p-3">Fakultas</th>
                                        <th className="p-3">Akreditasi</th>
                                        <th className="p-3">Ketua Prodi (Kaprodi)</th>
                                        <th className="p-3 text-center">Kurikulum</th>
                                        <th className="p-3 text-center">Status</th>
                                        <th className="p-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {filteredProdi.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="p-8 text-center text-slate-400">
                                                Tidak ada Program Studi yang cocok dengan pencarian.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProdi.map((prodi) => (
                                            <tr key={prodi.id} className="hover:bg-indigo-50/30 transition">
                                                <td className="p-3">
                                                    <span className="font-mono font-black text-indigo-950 px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded-md">
                                                        {prodi.code}
                                                    </span>
                                                </td>

                                                <td className="p-3">
                                                    <p className="font-black text-slate-900">{prodi.name}</p>
                                                    {prodi.sk_number && (
                                                        <p className="text-[10px] text-slate-400">SK: {prodi.sk_number}</p>
                                                    )}
                                                </td>

                                                <td className="p-3">
                                                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-black text-slate-800 text-[10px]">
                                                        {prodi.degree}
                                                    </span>
                                                </td>

                                                <td className="p-3 text-slate-700">
                                                    {prodi.faculty_name || '-'}
                                                </td>

                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                                        prodi.accreditation === 'Unggul' || prodi.accreditation === 'A'
                                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                            : prodi.accreditation === 'Baik Sekali' || prodi.accreditation === 'B'
                                                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                                                    }`}>
                                                        ★ {prodi.accreditation}
                                                    </span>
                                                </td>

                                                <td className="p-3">
                                                    {prodi.head_of_program_name ? (
                                                        <div>
                                                            <p className="font-bold text-slate-900">{prodi.head_of_program_name}</p>
                                                            <p className="text-[10px] text-slate-400 font-mono">NIDN: {prodi.head_of_program_nidn || '-'}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-[11px]">- Belum Diplot -</span>
                                                    )}
                                                </td>

                                                <td className="p-3 text-center">
                                                    <span className="font-bold text-slate-700">
                                                        {prodi.curricula_count || 0} Kurikulum
                                                    </span>
                                                </td>

                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        prodi.is_active 
                                                            ? 'bg-emerald-100 text-emerald-800' 
                                                            : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                        {prodi.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </td>

                                                <td className="p-3 text-right">
                                                    <div className="flex items-center justify-end space-x-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => openProdiModal(prodi)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                            title="Edit Program Studi"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteProdi(prodi)}
                                                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                            title="Hapus Program Studi"
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
                    )}

                    {/* TAB 2: TABEL FAKULTAS */}
                    {activeTab === 'faculty' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                                        <th className="p-3">Kode</th>
                                        <th className="p-3">Nama Fakultas</th>
                                        <th className="p-3">Nama Dekan</th>
                                        <th className="p-3 text-center">Jumlah Prodi</th>
                                        <th className="p-3 text-center">Status</th>
                                        <th className="p-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {faculties.map((f) => (
                                        <tr key={f.id} className="hover:bg-slate-50 transition">
                                            <td className="p-3 font-mono font-bold text-slate-900">
                                                {f.code}
                                            </td>
                                            <td className="p-3 font-bold text-slate-900">
                                                {f.name}
                                            </td>
                                            <td className="p-3 text-slate-700">
                                                {f.dean_name || '-'}
                                            </td>
                                            <td className="p-3 text-center font-bold text-indigo-700">
                                                {f.prodi_count} Program Studi
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    f.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {f.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                <div className="flex items-center justify-end space-x-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openFacultyModal(f)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteFaculty(f)}
                                                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* MODAL FORM: TAMBAH / EDIT PROGRAM STUDI */}
            {/* ========================================================================= */}
            {isProdiModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
                        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-white">
                                        {editingProdi ? 'Edit Data Program Studi' : 'Tambah Program Studi Baru'}
                                    </h3>
                                    <p className="text-[11px] text-slate-300">
                                        {editingProdi ? `Memperbarui rincian prodi ${editingProdi.name}` : 'Lengkapi informasi prodi, fakultas, dan akreditasi'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsProdiModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleProdiSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
                            {/* Fakultas & Jenjang */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2">
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Fakultas Naungan <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={prodiForm.data.faculty_id}
                                        onChange={(e) => prodiForm.setData('faculty_id', e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                                        required
                                    >
                                        <option value="">Pilih Fakultas...</option>
                                        {faculties.map(f => (
                                            <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Jenjang Pendidikan <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={prodiForm.data.degree}
                                        onChange={(e) => prodiForm.setData('degree', e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                                        required
                                    >
                                        <option value="S1">S1 — Sarjana</option>
                                        <option value="S2">S2 — Magister</option>
                                        <option value="S3">S3 — Doktor</option>
                                        <option value="D3">D3 — Diploma Tiga</option>
                                        <option value="D4">D4 — Sarjana Terapan</option>
                                        <option value="Profesi">Profesi</option>
                                    </select>
                                </div>
                            </div>

                            {/* Kode Prodi & Akreditasi */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Kode Singkat Prodi <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: PAI / MPI / HES"
                                        value={prodiForm.data.code}
                                        onChange={(e) => prodiForm.setData('code', e.target.value.toUpperCase())}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold uppercase"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Peringkat Akreditasi <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={prodiForm.data.accreditation}
                                        onChange={(e) => prodiForm.setData('accreditation', e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                                        required
                                    >
                                        <option value="Unggul">Unggul (BAN-PT / LAM)</option>
                                        <option value="Baik Sekali">Baik Sekali</option>
                                        <option value="Baik">Baik</option>
                                        <option value="A">A (Instrumen Lama)</option>
                                        <option value="B">B (Instrumen Lama)</option>
                                        <option value="C">C (Instrumen Lama)</option>
                                        <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Nama Lengkap Program Studi <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Pendidikan Agama Islam"
                                    value={prodiForm.data.name}
                                    onChange={(e) => prodiForm.setData('name', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                                    required
                                />
                            </div>

                            {/* SK Number */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Nomor SK Izin Operasional / Akreditasi
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: SK-BAN-PT-PAI-2024 / Keputusan Dirjen Pendis"
                                    value={prodiForm.data.sk_number}
                                    onChange={(e) => prodiForm.setData('sk_number', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                                />
                            </div>

                            {/* Kaprodi & Sekretaris */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Ketua Program Studi (Kaprodi)</label>
                                    <select
                                        value={prodiForm.data.head_of_program_id}
                                        onChange={(e) => prodiForm.setData('head_of_program_id', e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                                    >
                                        <option value="">-- Pilih Dosen Kaprodi --</option>
                                        {lecturers.map(l => (
                                            <option key={l.id} value={l.id}>{l.name} ({l.identity_number || l.role})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Sekretaris Program Studi</label>
                                    <select
                                        value={prodiForm.data.secretary_id}
                                        onChange={(e) => prodiForm.setData('secretary_id', e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                                    >
                                        <option value="">-- Pilih Dosen Sekretaris --</option>
                                        {lecturers.map(l => (
                                            <option key={l.id} value={l.id}>{l.name} ({l.identity_number || l.role})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Status Aktif */}
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-900">Status Operasional Prodi</p>
                                    <p className="text-[10px] text-slate-500">Prodi aktif dapat dipilih mahasiswa untuk KRS dan penerimaan PMB.</p>
                                </div>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={prodiForm.data.is_active}
                                        onChange={(e) => prodiForm.setData('is_active', e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded"
                                    />
                                    <span className="font-bold text-xs">{prodiForm.data.is_active ? 'Aktif' : 'Nonaktif'}</span>
                                </label>
                            </div>

                            <div className="pt-2 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsProdiModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={prodiForm.processing}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow flex items-center space-x-1.5"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{prodiForm.processing ? 'Menyimpan...' : 'Simpan Program Studi'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL FORM: TAMBAH / EDIT FAKULTAS */}
            {/* ========================================================================= */}
            {isFacultyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <h3 className="font-black text-sm text-white">
                                    {editingFaculty ? 'Edit Data Fakultas' : 'Tambah Fakultas Baru'}
                                </h3>
                            </div>
                            <button onClick={() => setIsFacultyModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleFacultySubmit} className="p-6 space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Kode Fakultas <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: TARBIYAH / SYARIAH"
                                    value={facultyForm.data.code}
                                    onChange={(e) => facultyForm.setData('code', e.target.value.toUpperCase())}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold uppercase"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Nama Fakultas <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Fakultas Tarbiyah dan Keguruan"
                                    value={facultyForm.data.name}
                                    onChange={(e) => facultyForm.setData('name', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Nama Dekan Fakultas</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Prof. Dr. KH. Abdul Halim, M.A."
                                    value={facultyForm.data.dean_name}
                                    onChange={(e) => facultyForm.setData('dean_name', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                                />
                            </div>

                            <div className="pt-2 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsFacultyModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={facultyForm.processing}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow flex items-center space-x-1.5"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{facultyForm.processing ? 'Menyimpan...' : 'Simpan Fakultas'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
