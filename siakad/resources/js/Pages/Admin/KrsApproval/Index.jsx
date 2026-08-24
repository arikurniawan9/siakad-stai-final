import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    BookOpen, CheckCircle2, Clock, XCircle, Search, 
    Filter, ChevronRight, User, Award, Check, Eye, 
    AlertTriangle, ShieldCheck, RefreshCw, FileText
} from 'lucide-react';

export default function KrsApprovalIndex({ activePeriod, submissions = [], stats = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [rejectNotes, setRejectNotes] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/krs-approval', { search, status: statusFilter }, { preserveState: true });
    };

    const handleApprove = (id) => {
        if (confirm('Setujui rencana studi (KRS) mahasiswa ini?')) {
            router.post(`/admin/krs-approval/${id}/approve`);
        }
    };

    const handleOpenReject = (sub) => {
        setSelectedSubmission(sub);
        setRejectNotes('Silakan sesuaikan pilihan mata kuliah dengan dosen wali.');
        setShowRejectModal(true);
    };

    const handleConfirmReject = (e) => {
        e.preventDefault();
        router.post(`/admin/krs-approval/${selectedSubmission.id}/reject`, { notes: rejectNotes }, {
            onSuccess: () => {
                setShowRejectModal(false);
                setSelectedSubmission(null);
            },
        });
    };

    const handleBulkApprove = () => {
        if (confirm(`Setujui seluruh ${stats.pending || 0} pengajuan KRS yang sedang menunggu persetujuan?`)) {
            router.post('/admin/krs-approval/bulk-approve');
        }
    };

    return (
        <AppLayout title="Approval & Monitoring KRS Mahasiswa">
            <Head title="Approval KRS — SIAKAD" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Monitoring & Persetujuan KRS Mahasiswa</h2>
                        <p className="text-xs text-slate-500">
                            Validasi beban SKS & persetujuan rencana studi semester ({activePeriod?.name || 'Semester Aktif'}).
                        </p>
                    </div>
                    {stats.pending > 0 && (
                        <button
                            onClick={handleBulkApprove}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                        >
                            <Check className="w-4 h-4" />
                            <span>Setujui Semua ({stats.pending} Pengajuan)</span>
                        </button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-slate-500">Total Pengajuan KRS</span>
                        <p className="text-2xl font-black text-slate-900 mt-1">{stats.total || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-emerald-600">Disetujui (Approved)</span>
                        <p className="text-2xl font-black text-emerald-700 mt-1">{stats.approved || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-amber-600">Menunggu Approval</span>
                        <p className="text-2xl font-black text-amber-700 mt-1">{stats.pending || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-slate-400">Draf Belum Submit</span>
                        <p className="text-2xl font-black text-slate-700 mt-1">{stats.draft || 0}</p>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
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
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                router.get('/admin/krs-approval', { search, status: e.target.value }, { preserveState: true });
                            }}
                            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">Semua Status</option>
                            <option value="DIAJUKAN">Menunggu Persetujuan</option>
                            <option value="DISETUJUI">Disetujui</option>
                            <option value="DITOLAK">Ditolak / Perlu Revisi</option>
                            <option value="DRAFT">Draf</option>
                        </select>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                {/* Submissions List */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-4">Mahasiswa</th>
                                    <th className="py-3 px-4">Program Studi</th>
                                    <th className="py-3 px-4">Dosen Wali (PA)</th>
                                    <th className="py-3 px-4 text-center">Beban SKS</th>
                                    <th className="py-3 px-4">Status KRS</th>
                                    <th className="py-3 px-4 text-right">Aksi Review</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {submissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                                            Tidak ada data pengajuan KRS yang sesuai filter.
                                        </td>
                                    </tr>
                                ) : (
                                    submissions.map((sub) => {
                                        const isApproved = sub.status === 'DISETUJUI';
                                        const isPending = sub.status === 'DIAJUKAN';
                                        const isRejected = sub.status === 'DITOLAK';
                                        return (
                                            <tr key={sub.id} className="hover:bg-slate-50 transition">
                                                <td className="py-3 px-4">
                                                    <p className="font-black text-slate-900">{sub.student_name}</p>
                                                    <p className="text-[11px] font-mono text-slate-500">NIM: {sub.student_nim}</p>
                                                </td>
                                                <td className="py-3 px-4 text-slate-700 font-medium">
                                                    {sub.study_program || 'Pendidikan Agama Islam (S1)'}
                                                </td>
                                                <td className="py-3 px-4 text-slate-600">
                                                    {sub.advisor_name || 'Dra. Hj. Siti Maryam, M.Pd.I'}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-black text-slate-800">
                                                        {sub.total_credits} / {sub.max_credits_allowed || 24} SKS
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                        isApproved ? 'bg-emerald-100 text-emerald-800' :
                                                        isPending ? 'bg-amber-100 text-amber-800' :
                                                        isRejected ? 'bg-rose-100 text-rose-800' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {isApproved && <CheckCircle2 className="w-3 h-3" />}
                                                        {isPending && <Clock className="w-3 h-3" />}
                                                        {isRejected && <XCircle className="w-3 h-3" />}
                                                        <span>{sub.status}</span>
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end space-x-1.5">
                                                        <button
                                                            onClick={() => setSelectedSubmission(sub)}
                                                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold transition flex items-center space-x-1"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>Lihat MK ({sub.items?.length || 0})</span>
                                                        </button>

                                                        {isPending && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(sub.id)}
                                                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition"
                                                                >
                                                                    Setujui
                                                                </button>
                                                                <button
                                                                    onClick={() => handleOpenReject(sub)}
                                                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-[11px] font-bold transition"
                                                                >
                                                                    Tolak
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL DETAIL ITEM KRS */}
                {selectedSubmission && !showRejectModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase">
                                        Rencana Studi: {selectedSubmission.student_name} ({selectedSubmission.student_nim})
                                    </h3>
                                    <p className="text-[11px] text-slate-500">Total SKS Diambil: <strong className="text-emerald-700">{selectedSubmission.total_credits} SKS</strong></p>
                                </div>
                                <button onClick={() => setSelectedSubmission(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Tutup</button>
                            </div>

                            <div className="overflow-x-auto max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                                        <tr>
                                            <th className="py-2.5 px-3">Kode</th>
                                            <th className="py-2.5 px-3">Mata Kuliah</th>
                                            <th className="py-2.5 px-3">Kelas</th>
                                            <th className="py-2.5 px-3 text-center">SKS</th>
                                            <th className="py-2.5 px-3 text-center">Semester</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedSubmission.items?.map((it, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">{it.course_code}</td>
                                                <td className="py-2.5 px-3 font-bold text-slate-900">{it.course_name}</td>
                                                <td className="py-2.5 px-3 text-slate-600">{it.class_name}</td>
                                                <td className="py-2.5 px-3 text-center font-bold">{it.credits}</td>
                                                <td className="py-2.5 px-3 text-center text-slate-500">Sem {it.semester_level}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <span className="text-[11px] text-slate-500">
                                    Status Pengajuan: <strong className="text-slate-800">{selectedSubmission.status}</strong>
                                </span>
                                <div className="flex items-center space-x-2">
                                    {selectedSubmission.status === 'DIAJUKAN' && (
                                        <button
                                            onClick={() => {
                                                handleApprove(selectedSubmission.id);
                                                setSelectedSubmission(null);
                                            }}
                                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs shadow-xs"
                                        >
                                            Setujui KRS Sekarang
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedSubmission(null)}
                                        className="px-4 py-2 bg-slate-800 text-white rounded-lg font-bold text-xs"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL REJECT NOTES */}
                {showRejectModal && selectedSubmission && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <h3 className="text-sm font-black text-slate-900 uppercase">Tolak Pengajuan KRS</h3>
                            <form onSubmit={handleConfirmReject} className="space-y-3 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Catatan Revisi untuk Mahasiswa:</label>
                                    <textarea
                                        value={rejectNotes}
                                        onChange={(e) => setRejectNotes(e.target.value)}
                                        rows={4}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                                        placeholder="Tuliskan alasan penolakan dan instruksi revisi..."
                                        required
                                    />
                                </div>
                                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                                    <button type="button" onClick={() => setShowRejectModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Batal</button>
                                    <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-lg font-bold">Tolak & Minta Revisi</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
