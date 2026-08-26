import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    BookOpen, Plus, Trash2, Edit2, Search, 
    Layers, CheckCircle2, ChevronRight, Filter, 
    SlidersHorizontal, Eye, FileSpreadsheet, Sparkles, X, Save,
    Award, Calendar, GraduationCap
} from 'lucide-react';

export default function CurriculaIndex({ studyPrograms = [], selectedProgramId = null, curricula = [] }) {
    const [programFilter, setProgramFilter] = useState(selectedProgramId ? String(selectedProgramId) : '');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCurriculum, setEditingCurriculum] = useState(null);

    // Form Kurikulum
    const form = useForm({
        study_program_id: studyPrograms[0]?.id || 1,
        code: '',
        name: '',
        start_year: new Date().getFullYear(),
        ideal_semesters: 8,
        total_credits_required: 144,
        mandatory_credits: 136,
        elective_credits: 8,
        is_active: true,
    });

    // Handle Filter Program Studi
    const handleProgramFilterChange = (val) => {
        setProgramFilter(val);
        if (val) {
            router.get('/admin/curricula', { program_id: val }, { preserveState: true, preserveScroll: true });
        } else {
            router.get('/admin/curricula', {}, { preserveState: true, preserveScroll: true });
        }
    };

    // Open Modal Tambah / Edit
    const openModal = (curriculum = null) => {
        setEditingCurriculum(curriculum);
        if (curriculum) {
            form.setData({
                study_program_id: curriculum.study_program_id,
                code: curriculum.code || '',
                name: curriculum.name || '',
                start_year: curriculum.start_year || new Date().getFullYear(),
                ideal_semesters: curriculum.ideal_semesters || 8,
                total_credits_required: curriculum.total_credits_required || 144,
                mandatory_credits: curriculum.mandatory_credits || 136,
                elective_credits: curriculum.elective_credits || 8,
                is_active: Boolean(curriculum.is_active),
            });
        } else {
            form.reset();
            form.setData({
                study_program_id: programFilter ? parseInt(programFilter) : (studyPrograms[0]?.id || 1),
                code: '',
                name: '',
                start_year: new Date().getFullYear(),
                ideal_semesters: 8,
                total_credits_required: 144,
                mandatory_credits: 136,
                elective_credits: 8,
                is_active: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (editingCurriculum) {
            form.put(`/admin/curricula/${editingCurriculum.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post('/admin/curricula', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleDelete = (item) => {
        if (confirm(`Apakah Anda yakin ingin menghapus kurikulum "${item.name}" (${item.code})?`)) {
            router.delete(`/admin/curricula/${item.id}`);
        }
    };

    // Filter by search term on client side
    const filteredCurricula = curricula.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (c.study_program_name && c.study_program_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                              (c.study_program_code && c.study_program_code.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const activeCurriculaCount = curricula.filter(c => c.is_active).length;

    return (
        <AppLayout title="Data Kurikulum — Program Studi">
            <Head title="Data Kurikulum — SIAKAD" />

            <div className="space-y-5">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-md border border-indigo-900/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center space-x-3.5">
                        <div className="p-3 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-2xl">
                            <Layers className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="px-2.5 py-0.5 bg-purple-500/30 text-purple-300 rounded-full font-black text-[10px] uppercase tracking-wider border border-purple-400/40">
                                    STRUKTUR KURIKULUM
                                </span>
                                <span className="text-[11px] text-slate-400">STAI Al-Ittihad Cianjur</span>
                            </div>
                            <h2 className="text-xl font-black tracking-tight text-white mt-1">
                                Data Kurikulum Akademik
                            </h2>
                            <p className="text-xs text-purple-200 mt-0.5">
                                Kelola penetapan kurikulum OBE/Merdeka, masa studi ideal, sebaran beban SKS lulus, wajib, dan pilihan per program studi.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 self-start md:self-auto shrink-0">
                        <button
                            type="button"
                            onClick={() => openModal()}
                            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-md hover:shadow-purple-500/30 flex items-center space-x-2 cursor-pointer shrink-0"
                        >
                            <Plus className="w-4 h-4 text-purple-200" />
                            <span>Tambah Kurikulum</span>
                        </button>
                    </div>
                </div>

                {/* Filter & Search Controls */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Dropdown Filter Program Studi */}
                        <div className="flex items-center space-x-2 flex-1 max-w-lg">
                            <Filter className="w-4 h-4 text-purple-600 shrink-0" />
                            <label className="text-xs font-black text-slate-700 shrink-0">
                                Program Studi:
                            </label>
                            <select
                                value={programFilter}
                                onChange={(e) => handleProgramFilterChange(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
                            >
                                <option value="">Semua Program Studi ({curricula.length} Kurikulum)</option>
                                {studyPrograms.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.code} - {p.name} {p.degree ? `(${p.degree})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full sm:w-64">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                placeholder="Cari nama / kode kurikulum..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium w-full focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Tabel Data Kurikulum */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                        <div className="text-xs">
                            <span className="text-slate-500 font-medium">Menampilkan Data: </span>
                            <strong className="text-slate-900 font-black">
                                {programFilter ? (
                                    (() => {
                                        const found = studyPrograms.find(p => String(p.id) === String(programFilter));
                                        return found ? `${found.code} - ${found.name}` : 'Semua Program Studi';
                                    })()
                                ) : 'Semua Program Studi'}
                            </strong>
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                            {filteredCurricula.length} Kurikulum Terdaftar
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                                    <th rowSpan="2" className="py-3 px-3.5 text-center w-12 border-r border-slate-800">No.</th>
                                    <th rowSpan="2" className="py-3 px-4 border-r border-slate-800">Kode & Nama Kurikulum</th>
                                    <th rowSpan="2" className="py-3 px-4 border-r border-slate-800">Program Studi</th>
                                    <th rowSpan="2" className="py-3 px-3 text-center border-r border-slate-800">Masa Studi</th>
                                    <th colSpan="3" className="py-2 px-3 text-center border-b border-slate-800 bg-slate-800">Jumlah SKS</th>
                                    <th rowSpan="2" className="py-3 px-3 text-center border-r border-slate-800">Mata Kuliah</th>
                                    <th rowSpan="2" className="py-3 px-3 text-center border-r border-slate-800">Status</th>
                                    <th rowSpan="2" className="py-3 px-3.5 text-center w-28">Aksi</th>
                                </tr>
                                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-2 px-3 text-center w-16 border-r border-slate-800 bg-slate-800/80">Lulus</th>
                                    <th className="py-2 px-3 text-center w-16 border-r border-slate-800 bg-slate-800/80">Wajib</th>
                                    <th className="py-2 px-3 text-center w-16 border-r border-slate-800 bg-slate-800/80">Pilihan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {filteredCurricula.length > 0 ? (
                                    filteredCurricula.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-purple-50/30 transition group">
                                            <td className="py-3.5 px-3.5 text-center font-bold text-slate-500">
                                                {idx + 1}
                                            </td>

                                            <td className="py-3.5 px-4 font-bold text-slate-900">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-mono text-[11px] font-black text-purple-950 px-2 py-0.5 bg-purple-50 border border-purple-200 rounded-md">
                                                        {item.code}
                                                    </span>
                                                    <span className="text-slate-900 font-bold">{item.name}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-0.5">Tahun Berlaku: <strong className="text-slate-600">{item.start_year}</strong></p>
                                            </td>

                                            <td className="py-3.5 px-4 text-slate-700">
                                                <span className="font-bold text-slate-800">
                                                    {item.study_program_code} - {item.study_program_name}
                                                </span>
                                                {item.study_program_degree && (
                                                    <span className="ml-1.5 px-1.5 py-0.2 bg-slate-100 border border-slate-200 rounded text-[9px] font-black text-slate-600">
                                                        {item.study_program_degree}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-3 text-center font-bold text-slate-700">
                                                {item.ideal_semesters || 8} Sem
                                            </td>

                                            <td className="py-3.5 px-3 text-center font-mono font-black text-slate-900 bg-slate-50/50">
                                                {item.total_credits_required || 144}
                                            </td>
                                            <td className="py-3.5 px-3 text-center font-mono font-black text-blue-700 bg-blue-50/30">
                                                {item.mandatory_credits || 136}
                                            </td>
                                            <td className="py-3.5 px-3 text-center font-mono font-black text-amber-700 bg-amber-50/30">
                                                {item.elective_credits || 8}
                                            </td>

                                            <td className="py-3.5 px-3 text-center">
                                                <Link
                                                    href={`/admin/course-curriculum?program_id=${item.study_program_id}&curriculum_id=${item.id}`}
                                                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-[10px] font-black transition border border-purple-200"
                                                    title="Buka Plotting Matakuliah Kurikulum"
                                                >
                                                    <BookOpen className="w-3 h-3" />
                                                    <span>{item.courses_count || 0} MK</span>
                                                </Link>
                                            </td>

                                            <td className="py-3.5 px-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    item.is_active 
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                }`}>
                                                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-3.5 text-center">
                                                <div className="flex items-center justify-center space-x-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openModal(item)}
                                                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                                        title="Edit Data Kurikulum"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                                                        title="Hapus Kurikulum"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="py-12 text-center text-slate-400">
                                            Tidak ada data kurikulum yang cocok dengan pencarian / filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* MODAL FORM: TAMBAH / EDIT KURIKULUM */}
            {/* ========================================================================= */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
                        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-purple-950 text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-white">
                                        {editingCurriculum ? 'Edit Data Kurikulum' : 'Tambah Kurikulum Baru'}
                                    </h3>
                                    <p className="text-[11px] text-slate-300">
                                        {editingCurriculum ? `Memperbarui rincian kurikulum ${editingCurriculum.name}` : 'Tetapkan kurikulum untuk program studi'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
                            {/* Kode & Tahun Mulai */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">
                                        Kode Kurikulum <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.code}
                                        onChange={(e) => form.setData('code', e.target.value.toUpperCase())}
                                        placeholder="Contoh: KUR-PAI-2024"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold uppercase"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">
                                        Tahun Mulai Berlaku <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="2000"
                                        max="2099"
                                        value={form.data.start_year}
                                        onChange={(e) => form.setData('start_year', parseInt(e.target.value) || 2024)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Nama Kurikulum */}
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">
                                    Nama Lengkap Kurikulum <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="Contoh: Kurikulum Merdeka OBE PAI 2024"
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                                    required
                                />
                            </div>

                            {/* Masa Studi & Beban SKS */}
                            <div className="grid grid-cols-4 gap-2.5 pt-1">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1 text-[11px]">Masa Studi (Sem):</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="14"
                                        value={form.data.ideal_semesters}
                                        onChange={(e) => form.setData('ideal_semesters', parseInt(e.target.value) || 8)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-center"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1 text-[11px]">SKS Lulus:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.data.total_credits_required}
                                        onChange={(e) => form.setData('total_credits_required', parseInt(e.target.value) || 144)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-center text-slate-900"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1 text-[11px]">SKS Wajib:</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.data.mandatory_credits}
                                        onChange={(e) => form.setData('mandatory_credits', parseInt(e.target.value) || 0)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-center text-blue-700"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1 text-[11px]">SKS Pilihan:</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.data.elective_credits}
                                        onChange={(e) => form.setData('elective_credits', parseInt(e.target.value) || 0)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-center text-amber-700"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Pilihan Program Studi (Posisi Sebelum Status Kurikulum) */}
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">
                                    Program Studi <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={form.data.study_program_id}
                                    onChange={(e) => form.setData('study_program_id', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                                    required
                                >
                                    {studyPrograms.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.code} - {p.name} {p.degree ? `(${p.degree})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Aktif */}
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-900">Status Kurikulum</p>
                                    <p className="text-[10px] text-slate-500">Kurikulum aktif dapat dipilih mahasiswa saat menyusun rencana studi.</p>
                                </div>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_active}
                                        onChange={(e) => form.setData('is_active', e.target.checked)}
                                        className="w-4 h-4 text-purple-600 rounded"
                                    />
                                    <span className="font-bold text-xs">{form.data.is_active ? 'Aktif' : 'Nonaktif'}</span>
                                </label>
                            </div>

                            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={form.processing} 
                                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow flex items-center space-x-1.5 cursor-pointer"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{form.processing ? 'Menyimpan...' : 'Simpan Kurikulum'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
