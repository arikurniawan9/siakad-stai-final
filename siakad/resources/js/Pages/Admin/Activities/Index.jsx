import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Trophy, Search, Plus, Eye, Trash2, CheckCircle2, 
    Sparkles, Award, Calendar, Users, ShieldCheck, 
    BookOpen, Layers, X, Briefcase, Medal, Building
} from 'lucide-react';

export default function ActivitiesIndex({ 
    activities = [], 
    studyPrograms = [],
    stats = {},
    filters = {}
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.activity_type || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const form = useForm({
        student_id: '',
        activity_type: 'MBKM_MAGANG',
        title: '',
        organization_name: '',
        location: '',
        start_date: '',
        end_date: '',
        recognition_credits: 4,
        sk_number: '',
        description: '',
    });

    const handleOpenCreate = () => {
        form.reset();
        setIsCreateModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        form.post('/admin/activities', {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                form.reset();
            }
        });
    };

    const handleDelete = (id, title) => {
        if (confirm(`Hapus data aktivitas "${title}"?`)) {
            form.delete(`/admin/activities/${id}`);
        }
    };

    return (
        <AppLayout title="Aktivitas Mahasiswa">
            <Head title="Aktivitas Mahasiswa & MBKM" />

            <div className="space-y-3.5">
                {/* 1. HERO HEADER */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative border border-slate-700/50 z-20">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-black mb-1">
                                <Sparkles className="w-3 h-3 text-teal-400" />
                                <span>AKADEMIK & PRESTASI</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                                Aktivitas Mahasiswa & Rekognisi MBKM
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={handleOpenCreate}
                            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer self-start md:self-auto"
                        >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Tambah Aktivitas</span>
                        </button>
                    </div>
                </div>

                {/* 2. STATS CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Total Aktivitas</span>
                        <p className="text-base font-black text-slate-900 mt-1">{stats.total_activities || 0} Kegiatan</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Program MBKM</span>
                        <p className="text-base font-black text-emerald-700 mt-1">{stats.total_mbkm || 0} Mahasiswa</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-purple-600 uppercase">Prestasi & Lomba</span>
                        <p className="text-base font-black text-purple-700 mt-1">{stats.total_prestasi || 0} Penghargaan</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-blue-600 uppercase">Total SKS Direkognisi</span>
                        <p className="text-base font-black text-blue-700 mt-1 font-mono">{stats.total_credits_recognized || 0} SKS</p>
                    </div>
                </div>

                {/* 3. TABEL AKTIVITAS */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Daftar Rekam Jejak Aktivitas Mahasiswa</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-800 text-white font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-3 px-3 text-center w-12 border-r border-slate-700">No.</th>
                                    <th className="py-3 px-3 text-center w-16 border-r border-slate-700">Aksi</th>
                                    <th className="py-3 px-3 border-r border-slate-700">Mahasiswa</th>
                                    <th className="py-3 px-3 border-r border-slate-700">Jenis Aktivitas</th>
                                    <th className="py-3 px-3 border-r border-slate-700">Nama Kegiatan / Instansi</th>
                                    <th className="py-3 px-3 text-center w-20 border-r border-slate-700">SKS</th>
                                    <th className="py-3 px-3 text-center w-28">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {activities.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-400">
                                            Belum ada data aktivitas mahasiswa. Klik "Tambah Aktivitas" untuk mencatat kegiatan baru.
                                        </td>
                                    </tr>
                                ) : (
                                    activities.map((act, idx) => (
                                        <tr key={act.id} className="hover:bg-slate-50">
                                            <td className="py-2.5 px-3 text-center font-bold text-slate-400 border-r border-slate-100">{idx + 1}</td>
                                            <td className="py-2.5 px-3 text-center border-r border-slate-100">
                                                <button
                                                    onClick={() => handleDelete(act.id, act.title)}
                                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                                    title="Hapus Aktivitas"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                            <td className="py-2.5 px-3 border-r border-slate-100">
                                                <span className="font-mono font-bold text-slate-800 block">{act.student_nim}</span>
                                                <span className="font-bold text-slate-900">{act.student_name}</span>
                                            </td>
                                            <td className="py-2.5 px-3 border-r border-slate-100">
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                                                    {act.activity_type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 border-r border-slate-100">
                                                <span className="font-bold text-slate-800 block">{act.title}</span>
                                                <span className="text-[11px] text-slate-500">{act.organization_name} {act.location ? `• ${act.location}` : ''}</span>
                                            </td>
                                            <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700 border-r border-slate-100">
                                                {act.recognition_credits} SKS
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                    {act.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL TAMBAH AKTIVITAS */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp">
                        <div className="bg-gradient-to-r from-slate-900 to-teal-950 p-4 text-white flex justify-between items-center">
                            <h3 className="text-sm font-black">Catat Aktivitas / MBKM Mahasiswa</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-4 space-y-3">
                            <div>
                                <label className="text-[11px] font-bold text-slate-700">User ID Mahasiswa *</label>
                                <input
                                    type="number"
                                    value={form.data.student_id}
                                    onChange={(e) => form.setData('student_id', e.target.value)}
                                    placeholder="Contoh: 15"
                                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-700">Jenis Aktivitas *</label>
                                <select
                                    value={form.data.activity_type}
                                    onChange={(e) => form.setData('activity_type', e.target.value)}
                                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                >
                                    <option value="MBKM_MAGANG">MBKM: Magang / Praktik Kerja</option>
                                    <option value="MBKM_MENGAJAR">MBKM: Kampus Mengajar</option>
                                    <option value="MBKM_STUDI_INDEPENDEN">MBKM: Studi Independen Bersertifikat</option>
                                    <option value="PRESTASI_LOMBA">Prestasi / Kejuaraan / Lomba</option>
                                    <option value="ORGANISASI">Kepengurusan Organisasi Mahasiswa</option>
                                    <option value="PENELITIAN">Riset / Publikasi Ilmiah</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-700">Nama Kegiatan *</label>
                                <input
                                    type="text"
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    placeholder="Contoh: Magang di Bank BSI KCP Cianjur"
                                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700">Instansi / Penyelenggara</label>
                                    <input
                                        type="text"
                                        value={form.data.organization_name}
                                        onChange={(e) => form.setData('organization_name', e.target.value)}
                                        placeholder="Contoh: Bank BSI"
                                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700">SKS Rekognisi (0-24)</label>
                                    <input
                                        type="number"
                                        value={form.data.recognition_credits}
                                        onChange={(e) => form.setData('recognition_credits', e.target.value)}
                                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-700">Nomor SK Rekognisi</label>
                                <input
                                    type="text"
                                    value={form.data.sk_number}
                                    onChange={(e) => form.setData('sk_number', e.target.value)}
                                    placeholder="Contoh: SK/STAI/MBKM/2026/042"
                                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold"
                                >
                                    Simpan Aktivitas
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
