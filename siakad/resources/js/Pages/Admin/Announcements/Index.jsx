import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import { 
    Megaphone, Pin, Plus, Trash2, Calendar, 
    Users, AlertCircle, Info, AlertTriangle, Sparkles, 
    CheckCircle2, Clock, Globe, ShieldAlert
} from 'lucide-react';

export default function AnnouncementsIndex({ announcements, studyPrograms = [] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        id: null,
        title: '',
        isLoading: false
    });

    const form = useForm({
        title: '',
        content: '',
        type: 'INFO',
        target_role: 'ALL',
        target_study_program_id: '',
        target_batch_year: '',
        is_pinned: false,
        start_date: new Date().toISOString().slice(0, 10),
        end_date: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post('/admin/announcements', {
            onSuccess: () => {
                setIsCreateOpen(false);
                form.reset();
            },
        });
    };

    const handleTogglePin = (id) => {
        router.post(`/admin/announcements/${id}/toggle-pin`);
    };

    const handleDelete = (id, title) => {
        setDeleteModal({
            isOpen: true,
            id,
            title,
            isLoading: false
        });
    };

    const handleConfirmDelete = () => {
        if (!deleteModal.id) return;
        setDeleteModal(prev => ({ ...prev, isLoading: true }));
        router.delete(`/admin/announcements/${deleteModal.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ isOpen: false, id: null, title: '', isLoading: false });
            },
            onError: () => {
                setDeleteModal(prev => ({ ...prev, isLoading: false }));
            }
        });
    };

    const getTypeBadge = (type) => {
        switch (type) {
            case 'URGENT':
                return { bg: 'bg-rose-100 text-rose-900 border-rose-300', icon: AlertCircle };
            case 'WARNING':
                return { bg: 'bg-amber-100 text-amber-900 border-amber-300', icon: AlertTriangle };
            case 'EVENT':
                return { bg: 'bg-purple-100 text-purple-900 border-purple-300', icon: Sparkles };
            default:
                return { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: Info };
        }
    };

    return (
        <AppLayout title="Pusat Siaran Pengumuman & Broadcast Civitas">
            <Head title="Pusat Pengumuman" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Pusat Siaran Pengumuman Resmi Kampus</h2>
                        <p className="text-xs text-slate-500">
                            Terbitkan pengumuman akademik, batas akhir KRS/pembayaran, dan edaran pimpinan langsung ke dasbor civitas.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Buat Pengumuman Baru</span>
                    </button>
                </div>

                {/* Announcements Feed Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {announcements.data.map((ann) => {
                        const typeInfo = getTypeBadge(ann.type);
                        const TypeIcon = typeInfo.icon;
                        return (
                            <div 
                                key={ann.id} 
                                className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between space-y-3 relative transition ${
                                    ann.is_pinned ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200'
                                }`}
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center space-x-1.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase flex items-center space-x-1 ${typeInfo.bg}`}>
                                                <TypeIcon className="w-3 h-3" />
                                                <span>{ann.type}</span>
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                                                Target: {ann.target_role}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => handleTogglePin(ann.id)}
                                                className={`p-1 rounded transition ${ann.is_pinned ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-slate-600'}`}
                                                title={ann.is_pinned ? 'Lepas Sematan (Unpin)' : 'Sematkan di Atas (Pin)'}
                                            >
                                                <Pin className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(ann.id, ann.title)}
                                                className="p-1 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                                title="Hapus Pengumuman"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-sm font-black text-slate-900 leading-snug">
                                        {ann.title}
                                    </h3>
                                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                                        {ann.content}
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                                    <span>Oleh: <strong className="text-slate-700">{ann.author_name || 'Admin BAAK'}</strong></span>
                                    <span>📅 {ann.start_date || ann.created_at?.slice(0, 10)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* MODAL BUAT PENGUMUMAN */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-900 uppercase">Buat Siaran Pengumuman</h3>
                                <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Batal</button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Judul Pengumuman:</label>
                                    <input
                                        type="text"
                                        value={form.data.title}
                                        onChange={(e) => form.setData('title', e.target.value)}
                                        placeholder="Contoh: Jadwal Pengisian KRS Online Semester Ganjil"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Kategori / Urgensi:</label>
                                        <select
                                            value={form.data.type}
                                            onChange={(e) => form.setData('type', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        >
                                            <option value="INFO">Informasi Umum (Hijau)</option>
                                            <option value="WARNING">Penting / Batas Waktu (Kuning)</option>
                                            <option value="URGENT">Mendesak / Urgent (Merah)</option>
                                            <option value="EVENT">Kegiatan / Event (Ungu)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Target Civitas:</label>
                                        <select
                                            value={form.data.target_role}
                                            onChange={(e) => form.setData('target_role', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        >
                                            <option value="ALL">Semua Pengguna (Civitas)</option>
                                            <option value="STUDENT">Khusus Mahasiswa</option>
                                            <option value="LECTURER">Khusus Dosen</option>
                                            <option value="ADMIN">Khusus Staf & Admin</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Filter Program Studi (Opsional):</label>
                                    <select
                                        value={form.data.target_study_program_id}
                                        onChange={(e) => form.setData('target_study_program_id', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                    >
                                        <option value="">Semua Program Studi (Umum)</option>
                                        {studyPrograms.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Isi Pesan Pengumuman:</label>
                                    <textarea
                                        value={form.data.content}
                                        onChange={(e) => form.setData('content', e.target.value)}
                                        rows={4}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                                        placeholder="Tuliskan detail instruksi, tanggal penting, atau tautan terkait..."
                                        required
                                    />
                                </div>

                                <div className="flex items-center space-x-2 pt-1">
                                    <input
                                        type="checkbox"
                                        id="pinned"
                                        checked={form.data.is_pinned}
                                        onChange={(e) => form.setData('is_pinned', e.target.checked)}
                                        className="rounded text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <label htmlFor="pinned" className="font-bold text-slate-800 text-xs">
                                        📌 Sematkan di posisi teratas dashboard (Pinned Announcement)
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Batal</button>
                                    <button type="submit" disabled={form.processing} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold">Terbitkan Pengumuman</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL KONFIRMASI HAPUS PENGUMUMAN */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, title: '', isLoading: false })}
                onConfirm={handleConfirmDelete}
                title="Hapus Siaran Pengumuman"
                message="Apakah Anda yakin ingin menghapus pengumuman ini? Pengumuman tidak akan lagi ditampilkan pada dashboard civitas."
                itemName={deleteModal.title}
                itemType="Siaran Pengumuman"
                confirmText="Ya, Hapus Pengumuman"
                cancelText="Batal"
                variant="danger"
                isLoading={deleteModal.isLoading}
            />
        </AppLayout>
    );
}
