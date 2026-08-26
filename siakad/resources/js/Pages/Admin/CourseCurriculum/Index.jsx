import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Layers, Plus, Trash2, Edit3, Search, 
    BookOpen, CheckCircle2, ChevronRight, Filter, 
    BookMarked, ArrowRightLeft, Sparkles
} from 'lucide-react';

export default function CourseCurriculumIndex({ 
    studyPrograms = [], 
    selectedProgramId = null, 
    curricula = [], 
    selectedCurriculumId = null, 
    mappedCourses = [], 
    availableCourses = [] 
}) {
    const [programId, setProgramId] = useState(selectedProgramId ? String(selectedProgramId) : '');
    const [curriculumId, setCurriculumId] = useState(selectedCurriculumId ? String(selectedCurriculumId) : '');

    // Saat user memilih program studi -> otomatis fetch kurikulum & datanya
    const handleProgramChange = (val) => {
        setProgramId(val);
        setCurriculumId('');
        if (val) {
            router.get('/admin/course-curriculum', { program_id: val }, { preserveState: true, preserveScroll: true });
        } else {
            router.get('/admin/course-curriculum', {}, { preserveState: true, preserveScroll: true });
        }
    };

    // Saat user memilih kurikulum -> otomatis fetch sebaran matakuliah
    const handleCurriculumChange = (val) => {
        setCurriculumId(val);
        if (programId && val) {
            router.get('/admin/course-curriculum', { program_id: programId, curriculum_id: val }, { preserveState: true, preserveScroll: true });
        }
    };

    // Form untuk assign matakuliah ke kurikulum & semester
    const assignForm = useForm({
        program_id: selectedProgramId || '',
        curriculum_id: selectedCurriculumId || '',
        course_id: availableCourses[0]?.id || '',
        semester: 1,
    });

    useEffect(() => {
        if (selectedProgramId && selectedCurriculumId) {
            assignForm.setData({
                program_id: selectedProgramId,
                curriculum_id: selectedCurriculumId,
                course_id: availableCourses[0]?.id || '',
                semester: 1,
            });
        }
    }, [selectedProgramId, selectedCurriculumId, availableCourses]);

    const handleAssignSubmit = (e) => {
        e.preventDefault();
        if (!assignForm.data.course_id) {
            alert('Pilih mata kuliah yang akan ditambahkan.');
            return;
        }
        assignForm.post('/admin/course-curriculum', {
            preserveScroll: true,
        });
    };

    const handleDelete = (id) => {
        if (confirm('Hapus penempatan mata kuliah ini dari kurikulum?')) {
            router.delete(`/admin/course-curriculum/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const selectedProdiObj = studyPrograms.find(p => String(p.id) === String(programId));
    const selectedCurriculumObj = curricula.find(c => String(c.id) === String(selectedCurriculumId));

    return (
        <AppLayout title="Data Matakuliah - Kurikulum">
            <Head title="Matakuliah Kurikulum — SIAKAD" />

            <div className="space-y-5">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <div>
                        <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
                            <span className="p-1.5 bg-violet-100 text-violet-700 rounded-lg"><Layers className="w-4 h-4" /></span>
                            <span>Data Matakuliah - Kurikulum</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Petakan dan tempatkan mata kuliah ke dalam kurikulum prodi dan sebaran semester 1 s.d. 8.
                        </p>
                    </div>
                </div>

                {/* Filter Selector Bar: Program Studi & Kurikulum (Auto Fetch) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        <div className="md:col-span-6">
                            <div className="flex items-center space-x-1 mb-1">
                                <Filter className="w-3 h-3 text-violet-600" />
                                <label className="text-xs font-black text-slate-700">
                                    Program Studi:
                                </label>
                            </div>
                            <select
                                value={programId}
                                onChange={(e) => handleProgramChange(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-violet-500 focus:bg-white transition"
                            >
                                <option value="">-- Pilih Program Studi --</option>
                                {studyPrograms.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.code} - {p.name} {p.degree ? `(${p.degree})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-6">
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-black text-slate-700">
                                    Kurikulum:
                                </label>
                                {selectedCurriculumId && (
                                    <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                                        <Sparkles className="w-2.5 h-2.5" />
                                        <span>Aktif Dimuat</span>
                                    </span>
                                )}
                            </div>
                            <select
                                value={curriculumId || (selectedCurriculumId ? String(selectedCurriculumId) : '')}
                                onChange={(e) => handleCurriculumChange(e.target.value)}
                                disabled={!programId}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-violet-500 focus:bg-white transition disabled:bg-slate-100 disabled:text-slate-400"
                            >
                                <option value="">-- Pilih Kurikulum --</option>
                                {curricula.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.start_year})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Quick Assignment Bar (Muncul setelah memilih Kurikulum) */}
                    {selectedProgramId && selectedCurriculumId && (
                        <div className="pt-3 border-t border-slate-100">
                            <form onSubmit={handleAssignSubmit} className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                                <div className="md:col-span-6">
                                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                                        Matakuliah:
                                    </label>
                                    <select
                                        value={assignForm.data.course_id}
                                        onChange={(e) => assignForm.setData('course_id', e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                                        required
                                    >
                                        <option value="">-- Pilih Matakuliah --</option>
                                        {availableCourses.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.code} - {c.name} [SKS: {Number(c.credits).toFixed(2)}]
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                                        Semester:
                                    </label>
                                    <select
                                        value={assignForm.data.semester}
                                        onChange={(e) => assignForm.setData('semester', parseInt(e.target.value))}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                            <option key={s} value={s}>Semester {s}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-3 flex items-end">
                                    <button
                                        type="submit"
                                        disabled={assignForm.processing}
                                        className="w-full mt-4 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambahkan ke Kurikulum</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Results Section */}
                {selectedProgramId && selectedCurriculumId ? (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/70">
                            <div className="text-xs">
                                <span className="text-slate-500 font-medium">Struktur Kurikulum: </span>
                                <strong className="text-slate-900 font-black">
                                    {selectedCurriculumObj?.name || 'Kurikulum Terpilih'}
                                </strong>
                                <span className="text-slate-400 font-normal"> ({selectedProdiObj?.name})</span>
                            </div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 self-start sm:self-auto">
                                {mappedCourses.length} Mata Kuliah Terplot
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                                        <th rowSpan="2" className="py-3 px-3 text-center w-12 border-r border-slate-800">No.</th>
                                        <th rowSpan="2" className="py-3 px-3 text-center w-16 border-r border-slate-800">Action</th>
                                        <th colSpan="2" className="py-2 px-3 text-center border-r border-slate-800 bg-slate-800">Matakuliah</th>
                                        <th rowSpan="2" className="py-3 px-2 text-center w-14 border-r border-slate-800">SMT</th>
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
                                    {mappedCourses.length > 0 ? (
                                        mappedCourses.map((c, idx) => (
                                            <tr key={c.id} className="hover:bg-violet-50/40 transition group">
                                                <td className="py-3.5 px-3 text-center font-bold text-slate-500">
                                                    {idx + 1}
                                                </td>
                                                <td className="py-3.5 px-3 text-center">
                                                    <button
                                                        onClick={() => handleDelete(c.id)}
                                                        className="p-1 rounded-md text-rose-500 hover:bg-rose-100 transition cursor-pointer"
                                                        title="Hapus dari Kurikulum"
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
                                                <td className="py-3.5 px-2 text-center font-mono font-black text-violet-700 bg-violet-50/30 text-sm">
                                                    {c.semester_level || 1}
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
                                            <td colSpan="11" className="py-8 text-center text-slate-400">
                                                Belum ada mata kuliah yang diplotkan ke dalam kurikulum ini.
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
                        <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
                            <Layers className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-black text-slate-800">Silakan Pilih Program Studi & Kurikulum</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                            Pilih program studi dan nama kurikulum pada menu dropdown di atas, sebaran mata kuliah per semester akan otomatis ditampilkan seketika.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
