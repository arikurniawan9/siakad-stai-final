import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    BookOpen, Plus, Trash2, Edit3, Search, 
    Layers, CheckCircle2, ChevronRight, Filter, 
    BookMarked, Sparkles
} from 'lucide-react';

export default function CoursesIndex({ studyPrograms = [], selectedProgramId = null, courses = [] }) {
    const [programId, setProgramId] = useState(selectedProgramId ? String(selectedProgramId) : '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Instant auto-fetch saat opsi prodi dipilih
    const handleProgramChange = (val) => {
        setProgramId(val);
        if (val) {
            router.get('/admin/courses', { program_id: val }, { preserveState: true, preserveScroll: true });
        } else {
            router.get('/admin/courses', {}, { preserveState: true, preserveScroll: true });
        }
    };

    const form = useForm({
        study_program_id: selectedProgramId || (studyPrograms[0]?.id || 1),
        code: '',
        name: '',
        credits: 2.00,
        theory_credits: 2.00,
        practice_credits: 0.00,
        field_credits: 0.00,
        course_type: 'Wajib',
        course_group: 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)',
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        form.post('/admin/courses', {
            onSuccess: () => {
                setIsCreateOpen(false);
                form.reset();
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus mata kuliah ini?')) {
            router.delete(`/admin/courses/${id}`);
        }
    };

    const selectedProdiObj = studyPrograms.find(p => String(p.id) === String(programId));

    return (
        <AppLayout title="Data Matakuliah — Program Studi">
            <Head title="Data Matakuliah — SIAKAD" />

            <div className="space-y-5">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <div>
                        <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
                            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg"><BookMarked className="w-4 h-4" /></span>
                            <span>Data Matakuliah</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Katalog master mata kuliah institusi, rincian bobot SKS tatap muka, praktikum, lapangan, dan kelompok kurikulum.
                        </p>
                    </div>

                    {selectedProgramId && (
                        <button
                            onClick={() => {
                                form.setData('study_program_id', selectedProgramId);
                                setIsCreateOpen(true);
                            }}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Mata Kuliah</span>
                        </button>
                    )}
                </div>

                {/* Filter Selector Bar: Program Studi (Auto Fetch) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex flex-col md:flex-row items-center gap-3">
                        <div className="flex items-center space-x-1.5 shrink-0 md:w-36">
                            <Filter className="w-3.5 h-3.5 text-emerald-600" />
                            <label className="text-xs font-black text-slate-700">
                                Program Studi:
                            </label>
                        </div>
                        <div className="flex-1 w-full">
                            <select
                                value={programId}
                                onChange={(e) => handleProgramChange(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                            >
                                <option value="">-- Pilih Program Studi (Otomatis Muncul) --</option>
                                {studyPrograms.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.national_code ? `${p.national_code} - ` : ''}{p.name} {p.degree ? `(${p.degree})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <span className="hidden md:inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 shrink-0">
                            <Sparkles className="w-3 h-3 text-emerald-500" />
                            <span>Otomatis Dimuat</span>
                        </span>
                    </div>
                </div>

                {/* Results Section */}
                {selectedProgramId ? (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                            <div className="text-xs">
                                <span className="text-slate-500 font-medium">Katalog Mata Kuliah untuk: </span>
                                <strong className="text-slate-900 font-black">
                                    {selectedProdiObj?.national_code ? `${selectedProdiObj.national_code} - ` : ''}
                                    {selectedProdiObj?.name}
                                </strong>
                            </div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                {courses.length} Mata Kuliah Tersedia
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                                        <th rowSpan="2" className="py-3 px-3 text-center w-12 border-r border-slate-800">No.</th>
                                        <th rowSpan="2" className="py-3 px-3 text-center w-20 border-r border-slate-800">Action</th>
                                        <th colSpan="2" className="py-2 px-3 text-center border-r border-slate-800 bg-slate-800">Matakuliah</th>
                                        <th colSpan="4" className="py-2 px-3 text-center border-r border-slate-800 bg-slate-800">Jumlah SKS</th>
                                        <th rowSpan="2" className="py-3 px-3 text-center border-r border-slate-800">Jenis MK</th>
                                        <th rowSpan="2" className="py-3 px-4">Kelompok MK</th>
                                    </tr>
                                    <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                                        <th className="py-2 px-3 w-28 border-r border-slate-800 bg-slate-800/80">Kode</th>
                                        <th className="py-2 px-4 border-r border-slate-800 bg-slate-800/80">Nama</th>
                                        <th className="py-2 px-2 text-center w-16 border-r border-slate-800 bg-slate-800/80">Total</th>
                                        <th className="py-2 px-2 text-center w-20 border-r border-slate-800 bg-slate-800/80">Tatap Muka</th>
                                        <th className="py-2 px-2 text-center w-18 border-r border-slate-800 bg-slate-800/80">Praktikum</th>
                                        <th className="py-2 px-2 text-center w-18 border-r border-slate-800 bg-slate-800/80">Lapangan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {courses.length > 0 ? (
                                        courses.map((c, idx) => (
                                            <tr key={c.id} className="hover:bg-emerald-50/40 transition group">
                                                <td className="py-3.5 px-3 text-center font-bold text-slate-500">
                                                    {idx + 1}
                                                </td>
                                                <td className="py-3.5 px-3 text-center">
                                                    <button
                                                        onClick={() => handleDelete(c.id)}
                                                        className="p-1 rounded-md text-rose-500 hover:bg-rose-100 transition cursor-pointer"
                                                        title="Hapus Mata Kuliah"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                                <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                                                    {c.code}
                                                </td>
                                                <td className="py-3.5 px-4 font-bold text-slate-900">
                                                    {c.name}
                                                </td>
                                                <td className="py-3.5 px-2 text-center font-mono font-black text-slate-900 bg-slate-50/50">
                                                    {Number(c.credits).toFixed(2)}
                                                </td>
                                                <td className="py-3.5 px-2 text-center font-mono text-slate-700">
                                                    {Number(c.theory_credits || c.credits).toFixed(2)}
                                                </td>
                                                <td className="py-3.5 px-2 text-center font-mono text-slate-500">
                                                    {Number(c.practice_credits || 0).toFixed(2)}
                                                </td>
                                                <td className="py-3.5 px-2 text-center font-mono text-slate-500">
                                                    {Number(c.field_credits || 0).toFixed(2)}
                                                </td>
                                                <td className="py-3.5 px-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        c.course_type === 'Wajib' || c.course_type === 'WAJIB_PRODI'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {c.course_type?.replace('_PRODI', '')}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                                                    {c.course_group || 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="10" className="py-8 text-center text-slate-400">
                                                Belum ada data mata kuliah untuk program studi ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* Initial Prompt State */
                    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-2.5 shadow-2xs">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                            <BookMarked className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-black text-slate-800">Silakan Pilih Program Studi</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                            Pilih program studi pada menu dropdown di atas, daftar mata kuliah akan otomatis ditampilkan seketika.
                        </p>
                    </div>
                )}

                {/* MODAL TAMBAH MATA KULIAH */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-900 uppercase">Tambah Mata Kuliah Baru</h3>
                                <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer">Batal</button>
                            </div>
                            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Program Studi:</label>
                                    <select
                                        value={form.data.study_program_id}
                                        onChange={(e) => form.setData('study_program_id', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        required
                                    >
                                        {studyPrograms.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.national_code ? `${p.national_code} - ` : ''}{p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Kode Mata Kuliah:</label>
                                        <input
                                            type="text"
                                            value={form.data.code}
                                            onChange={(e) => form.setData('code', e.target.value)}
                                            placeholder="Contoh: STAIES111"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold uppercase"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Total SKS:</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={form.data.credits}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value) || 0;
                                                form.setData({
                                                    ...form.data,
                                                    credits: val,
                                                    theory_credits: val
                                                });
                                            }}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nama Mata Kuliah:</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="Contoh: Ahlussunnah Wal Jamaah"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">SKS Tatap Muka:</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={form.data.theory_credits}
                                            onChange={(e) => form.setData('theory_credits', parseFloat(e.target.value) || 0)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">SKS Praktikum:</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={form.data.practice_credits}
                                            onChange={(e) => form.setData('practice_credits', parseFloat(e.target.value) || 0)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">SKS Lapangan:</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={form.data.field_credits}
                                            onChange={(e) => form.setData('field_credits', parseFloat(e.target.value) || 0)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Jenis MK:</label>
                                        <select
                                            value={form.data.course_type}
                                            onChange={(e) => form.setData('course_type', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        >
                                            <option value="Wajib">Wajib</option>
                                            <option value="Pilihan">Pilihan</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Kelompok MK:</label>
                                        <select
                                            value={form.data.course_group}
                                            onChange={(e) => form.setData('course_group', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        >
                                            <option value="MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)">MKU/MKDU</option>
                                            <option value="MKK (Mata Kuliah Keahlian)">MKK (Keahlian)</option>
                                            <option value="MKDK (Mata Kuliah Dasar Keahlian)">MKDK (Dasar Keahlian)</option>
                                            <option value="MKB (Mata Kuliah Keahlian Berkarya)">MKB (Berkarya)</option>
                                            <option value="MPK (Mata Kuliah Pengembangan Kepribadian)">MPK</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold cursor-pointer">Batal</button>
                                    <button type="submit" disabled={form.processing} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold cursor-pointer">Simpan Mata Kuliah</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
