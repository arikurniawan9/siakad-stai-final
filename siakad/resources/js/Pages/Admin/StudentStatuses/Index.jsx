import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Users, Search, Plus, Eye, Edit3, CheckCircle2, 
    Sparkles, Award, Calendar, ShieldCheck, 
    UserX, UserCheck, AlertTriangle, X, RefreshCw
} from 'lucide-react';

export default function StudentStatusesIndex({ 
    students = [], 
    studyPrograms = [],
    batchYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'],
    academicPeriods = [],
    activePeriod,
    stats = {},
    filters = {}
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [prodi, setProdi] = useState(filters.study_program || '');
    const [year, setYear] = useState(filters.academic_year || '');
    const [statusType, setStatusType] = useState(filters.status_type || '');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const form = useForm({
        student_id: '',
        status_type: 'CUTI',
        reason: '',
        sk_number: '',
    });

    const handleOpenEdit = (stu) => {
        setSelectedStudent(stu);
        form.setData({
            student_id: stu.id,
            status_type: stu.status_type || 'AKTIF',
            reason: stu.leave_reason || '',
            sk_number: stu.sk_number || '',
        });
        setIsEditModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        form.post('/admin/student-statuses/update', {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedStudent(null);
            }
        });
    };

    return (
        <AppLayout title="Status Kuliah Mahasiswa">
            <Head title="Status Kuliah Mahasiswa" />

            <div className="space-y-3.5">
                {/* 1. HERO HEADER */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative border border-slate-700/50 z-20">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-black mb-1">
                                <Sparkles className="w-3 h-3 text-teal-400" />
                                <span>AKADEMIK & STATUS KULIAH</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                                Status Semester Mahasiswa & Cuti Akademik
                            </h2>
                        </div>
                    </div>
                </div>

                {/* 2. STATS CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Total Mahasiswa</span>
                        <p className="text-base font-black text-slate-900 mt-1">{stats.total || 0} Orang</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Aktif Kuliah</span>
                        <p className="text-base font-black text-emerald-700 mt-1">{stats.active || 0} Mahasiswa</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-amber-600 uppercase">Cuti Akademik</span>
                        <p className="text-base font-black text-amber-700 mt-1">{stats.cuti || 0} Mahasiswa</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-rose-600 uppercase">Non-Aktif / DO</span>
                        <p className="text-base font-black text-rose-700 mt-1">{Number(stats.non_active || 0) + Number(stats.drop_out || 0)} Mahasiswa</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-purple-600 uppercase">Lulus Kuliah</span>
                        <p className="text-base font-black text-purple-700 mt-1">{stats.graduated || 0} Alumni</p>
                    </div>
                </div>

                {/* 3. TABEL DATA STATUS */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Daftar Status Semester Mahasiswa</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-800 text-white font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-3 px-3 text-center w-12 border-r border-slate-700">No.</th>
                                    <th className="py-3 px-3 text-center w-16 border-r border-slate-700">Aksi</th>
                                    <th className="py-3 px-3 border-r border-slate-700">NIM</th>
                                    <th className="py-3 px-3 border-r border-slate-700">Nama Mahasiswa</th>
                                    <th className="py-3 px-3 border-r border-slate-700">Program Studi</th>
                                    <th className="py-3 px-3 text-center w-32 border-r border-slate-700">Status Semester</th>
                                    <th className="py-3 px-3">Keterangan / Alasan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-400">
                                            Tidak ada data mahasiswa yang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((stu, idx) => (
                                        <tr key={stu.id} className="hover:bg-slate-50">
                                            <td className="py-2.5 px-3 text-center font-bold text-slate-400 border-r border-slate-100">{idx + 1}</td>
                                            <td className="py-2.5 px-3 text-center border-r border-slate-100">
                                                <button
                                                    onClick={() => handleOpenEdit(stu)}
                                                    className="p-1 text-teal-600 hover:bg-teal-50 rounded"
                                                    title="Ubah Status Semester"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800 border-r border-slate-100">{stu.nim}</td>
                                            <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-100">{stu.name}</td>
                                            <td className="py-2.5 px-3 border-r border-slate-100">{stu.study_program}</td>
                                            <td className="py-2.5 px-3 text-center border-r border-slate-100">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                    stu.status_type === 'AKTIF' ? 'bg-emerald-100 text-emerald-800' :
                                                    stu.status_type === 'CUTI' ? 'bg-amber-100 text-amber-800' :
                                                    stu.status_type === 'LULUS' ? 'bg-purple-100 text-purple-800' : 'bg-rose-100 text-rose-800'
                                                }`}>
                                                    {stu.status_type}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                                                {stu.leave_reason || '-'} {stu.sk_number ? `(SK: ${stu.sk_number})` : ''}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL UBAH STATUS */}
            {isEditModalOpen && selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp">
                        <div className="bg-gradient-to-r from-slate-900 to-teal-950 p-4 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-black">Ubah Status Semester: {selectedStudent.name}</h3>
                                <p className="text-[11px] text-teal-300">NIM: {selectedStudent.nim}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-4 space-y-3">
                            <div>
                                <label className="text-[11px] font-bold text-slate-700">Status Semester Baru *</label>
                                <select
                                    value={form.data.status_type}
                                    onChange={(e) => form.setData('status_type', e.target.value)}
                                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                                    required
                                >
                                    <option value="AKTIF">AKTIF KULIAH</option>
                                    <option value="CUTI">CUTI AKADEMIK</option>
                                    <option value="NON_AKTIF">NON-AKTIF</option>
                                    <option value="DROP_OUT">DROP OUT (DO)</option>
                                    <option value="KELUAR">MENGUNDURKAN DIRI (KELUAR)</option>
                                    <option value="LULUS">LULUS / ALUMNI</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-700">Alasan / Keterangan</label>
                                <textarea
                                    value={form.data.reason}
                                    onChange={(e) => form.setData('reason', e.target.value)}
                                    rows="2"
                                    placeholder="Contoh: Mengajukan cuti karena alasan pekerjaan..."
                                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-700">Nomor SK / Surat Dispensasi</label>
                                <input
                                    type="text"
                                    value={form.data.sk_number}
                                    onChange={(e) => form.setData('sk_number', e.target.value)}
                                    placeholder="Contoh: SK/CUTI/2026/012"
                                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
