import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    BookOpen, Plus, Trash2, Edit3, Search, 
    Layers, CheckCircle2, ChevronRight, Filter, 
    SlidersHorizontal, Eye, FileSpreadsheet, Sparkles
} from 'lucide-react';

export default function CurriculaIndex({ studyPrograms = [], selectedProgramId = null, curricula = [] }) {
    const [programId, setProgramId] = useState(selectedProgramId ? String(selectedProgramId) : '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Instant auto-fetch saat opsi prodi dipilih
    const handleProgramChange = (val) => {
        setProgramId(val);
        if (val) {
            router.get('/admin/curricula', { program_id: val }, { preserveState: true, preserveScroll: true });
        } else {
            router.get('/admin/curricula', {}, { preserveState: true, preserveScroll: true });
        }
    };

    const form = useForm({
        study_program_id: selectedProgramId || (studyPrograms[0]?.id || 1),
        code: '',
        name: '',
        start_year: new Date().getFullYear(),
        ideal_semesters: 8,
        total_credits_required: 144,
        mandatory_credits: 136,
        elective_credits: 8,
        is_active: true,
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        form.post('/admin/curricula', {
            onSuccess: () => {
                setIsCreateOpen(false);
                form.reset();
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data kurikulum ini?')) {
            router.delete(`/admin/curricula/${id}`);
        }
    };

    const selectedProdiObj = studyPrograms.find(p => String(p.id) === String(programId));

    return (
        <AppLayout title="Data Kurikulum — Program Studi">
            <Head title="Data Kurikulum — SIAKAD" />

            <div className="space-y-5">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <div>
                        <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
                            <span className="p-1.5 bg-purple-100 text-purple-700 rounded-lg"><Layers className="w-4 h-4" /></span>
                            <span>Data Kurikulum</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Kelola penetapan kurikulum, masa studi ideal, beban SKS lulus, wajib, dan pilihan per program studi.
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
                            <span>Tambah Kurikulum</span>
                        </button>
                    )}
                </div>

                {/* Filter Selector Bar: Program Studi (Auto Fetch) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex flex-col md:flex-row items-center gap-3">
                        <div className="flex items-center space-x-1.5 shrink-0 md:w-36">
                            <Filter className="w-3.5 h-3.5 text-purple-600" />
                            <label className="text-xs font-black text-slate-700">
                                Program Studi:
                            </label>
                        </div>
                        <div className="flex-1 w-full relative">
                            <select
                                value={programId}
                                onChange={(e) => handleProgramChange(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
                            >
                                <option value="">-- Pilih Program Studi (Otomatis Muncul) --</option>
                                {studyPrograms.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.national_code ? `${p.national_code} - ` : ''}{p.name} {p.degree ? `(${p.degree})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <span className="hidden md:inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200 shrink-0">
                            <Sparkles className="w-3 h-3 text-purple-500" />
                            <span>Otomatis Dimuat</span>
                        </span>
                    </div>
                </div>

                {/* Results Section */}
                {selectedProgramId ? (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                            <div className="text-xs">
                                <span className="text-slate-500 font-medium">Menampilkan Kurikulum untuk: </span>
                                <strong className="text-slate-900 font-black">
                                    {selectedProdiObj?.national_code ? `${selectedProdiObj.national_code} - ` : ''}
                                    {selectedProdiObj?.name}
                                </strong>
                            </div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                {curricula.length} Kurikulum Terdaftar
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                                        <th rowSpan="2" className="py-3 px-3.5 text-center w-12 border-r border-slate-800">No.</th>
                                        <th rowSpan="2" className="py-3 px-3.5 text-center w-24 border-r border-slate-800">Action</th>
                                        <th rowSpan="2" className="py-3 px-4 border-r border-slate-800">Kurikulum</th>
                                        <th rowSpan="2" className="py-3 px-4 text-center border-r border-slate-800">Masa Studi Ideal</th>
                                        <th colSpan="3" className="py-2 px-3 text-center border-b border-slate-800 bg-slate-800">Jumlah SKS</th>
                                    </tr>
                                    <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                                        <th className="py-2 px-3 text-center w-20 border-r border-slate-800 bg-slate-800/80">Lulus</th>
                                        <th className="py-2 px-3 text-center w-20 border-r border-slate-800 bg-slate-800/80">Wajib</th>
                                        <th className="py-2 px-3 text-center w-20 bg-slate-800/80">Pilihan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {curricula.length > 0 ? (
                                        curricula.map((item, idx) => (
                                            <tr key={item.id} className="hover:bg-blue-50/40 transition group">
                                                <td className="py-3.5 px-3.5 text-center font-bold text-slate-500">
                                                    {idx + 1}
                                                </td>
                                                <td className="py-3.5 px-3.5 text-center">
                                                    <div className="flex items-center justify-center space-x-1.5">
                                                        <Link
                                                            href={`/admin/course-curriculum?program_id=${item.study_program_id}&curriculum_id=${item.id}`}
                                                            className="p-1 rounded-md text-blue-600 hover:bg-blue-100 transition"
                                                            title="Lihat Matakuliah Kurikulum"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-1 rounded-md text-rose-500 hover:bg-rose-100 transition cursor-pointer"
                                                            title="Hapus Kurikulum"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 font-bold text-slate-900">
                                                    <div className="flex items-center space-x-2">
                                                        <span>{item.name}</span>
                                                        {item.is_active && (
                                                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black">
                                                                Aktif
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Kode: {item.code} • Mulai: {item.start_year}</p>
                                                </td>
                                                <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                                                    {item.ideal_semesters || 8} Semester
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
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="py-8 text-center text-slate-400">
                                                Belum ada data kurikulum untuk program studi ini.
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
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                            <Layers className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-black text-slate-800">Silakan Pilih Program Studi</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                            Pilih program studi pada menu dropdown di atas, data kurikulum akan otomatis ditampilkan seketika.
                        </p>
                    </div>
                )}

                {/* MODAL TAMBAH KURIKULUM */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-900 uppercase">Tambah Kurikulum Baru</h3>
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
                                        <label className="font-bold text-slate-700 block mb-1">Kode Kurikulum:</label>
                                        <input
                                            type="text"
                                            value={form.data.code}
                                            onChange={(e) => form.setData('code', e.target.value)}
                                            placeholder="Contoh: KUR-PIAUD-2023"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Tahun Mulai:</label>
                                        <input
                                            type="number"
                                            value={form.data.start_year}
                                            onChange={(e) => form.setData('start_year', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nama Kurikulum:</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="Contoh: KURIKULUM PIAUD 2023 STAI AL ITTIHAD"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-2 pt-1">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">SKS Lulus:</label>
                                        <input
                                            type="number"
                                            value={form.data.total_credits_required}
                                            onChange={(e) => form.setData('total_credits_required', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-center"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">SKS Wajib:</label>
                                        <input
                                            type="number"
                                            value={form.data.mandatory_credits}
                                            onChange={(e) => form.setData('mandatory_credits', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-center text-blue-700"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">SKS Pilihan:</label>
                                        <input
                                            type="number"
                                            value={form.data.elective_credits}
                                            onChange={(e) => form.setData('elective_credits', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-center text-amber-700"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold cursor-pointer">Batal</button>
                                    <button type="submit" disabled={form.processing} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold cursor-pointer">Simpan Kurikulum</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
