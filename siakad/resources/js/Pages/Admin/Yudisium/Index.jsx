import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    GraduationCap, Award, CheckCircle2, Clock, 
    Calendar, Plus, UserCheck, Search, Filter, 
    QrCode, FileCheck, XCircle, ChevronRight
} from 'lucide-react';

export default function YudisiumIndex({ applicants, periods = [], academicYears = [], stats = {} }) {
    const [activeTab, setActiveTab] = useState('applicants'); // applicants | periods
    const [isPeriodOpen, setIsPeriodOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);

    const periodForm = useForm({
        academic_year_id: academicYears[0]?.id || 1,
        name: 'Yudisium Sarjana Strata-1 (S1) Periode II TA 2026/2027',
        event_date: '2026-11-20',
        registration_deadline: '2026-10-31',
        sk_number: 'SK-YUDISIUM-STAI-2026/102',
    });

    const handlePeriodSubmit = (e) => {
        e.preventDefault();
        periodForm.post('/admin/yudisium/periods', {
            onSuccess: () => {
                setIsPeriodOpen(false);
                periodForm.reset();
            },
        });
    };

    const handleUpdateStatus = (app, newStatus) => {
        if (confirm(`Ubah status yudisium ${app.student_name} menjadi ${newStatus}?`)) {
            router.put(`/admin/yudisium/applicants/${app.id}/status`, { status: newStatus });
        }
    };

    return (
        <AppLayout title="Skrining Kelulusan, Yudisium & SK Sarjana">
            <Head title="Yudisium & Kelulusan — SIAKAD" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Skrining Yudisium & Kelulusan Sarjana</h2>
                        <p className="text-xs text-slate-500">
                            Validasi otomatis kelulusan 144 SKS, bebas tanggungan perpus/keuangan, & penerbitan SK Yudisium ber-QR.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsPeriodOpen(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Buka Sidang Yudisium Baru</span>
                    </button>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
                        <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-500">Total Pendaftar Yudisium</span>
                            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.total || 0}</p>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <FileCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-blue-600">Lolos Skrining Syarat</span>
                            <p className="text-2xl font-black text-blue-700 mt-0.5">{stats.verified || 0}</p>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-emerald-600">Resmi Lulus (Sarjana S1)</span>
                            <p className="text-2xl font-black text-emerald-700 mt-0.5">{stats.graduated || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Applicants Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-900 uppercase">Daftar Calon Wisudawan & Hasil Skrining</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {applicants.total || 0} Mahasiswa
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-4">Mahasiswa & NIM</th>
                                    <th className="py-3 px-4">Program Studi</th>
                                    <th className="py-3 px-4 text-center">Total SKS</th>
                                    <th className="py-3 px-4 text-center">IPK Akhir</th>
                                    <th className="py-3 px-4">Predikat Kelulusan</th>
                                    <th className="py-3 px-4 text-center">Bebas Administrasi</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {applicants.data.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-50 transition">
                                        <td className="py-3 px-4">
                                            <p className="font-black text-slate-900">{app.student_name}</p>
                                            <p className="text-[10px] font-mono text-slate-400">NIM: {app.student_nim}</p>
                                        </td>
                                        <td className="py-3 px-4 text-slate-700 font-medium">
                                            {app.student_prodi}
                                        </td>
                                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                                            {app.total_credits} SKS
                                        </td>
                                        <td className="py-3 px-4 text-center font-mono font-black text-emerald-700 text-sm">
                                            {app.gpa}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-black text-[10px]">
                                                {app.predicate}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex items-center justify-center space-x-1">
                                                <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold">
                                                    ✓ Perpus
                                                </span>
                                                <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold">
                                                    ✓ SPP
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                                app.status === 'RESMI_LULUS' ? 'bg-emerald-100 text-emerald-800' :
                                                app.status === 'LOLOS_VERIFIKASI' ? 'bg-blue-100 text-blue-800' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                                {app.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            {app.status !== 'RESMI_LULUS' ? (
                                                <button
                                                    onClick={() => handleUpdateStatus(app, 'RESMI_LULUS')}
                                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-black transition"
                                                >
                                                    Resmikan Lulus
                                                </button>
                                            ) : (
                                                <span className="text-[10px] text-emerald-700 font-bold font-mono">
                                                    ✓ Lulus Sarjana
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL BUAT PERIODE YUDISIUM */}
                {isPeriodOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-900 uppercase">Buka Periode Yudisium</h3>
                                <button onClick={() => setIsPeriodOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Batal</button>
                            </div>
                            <form onSubmit={handlePeriodSubmit} className="space-y-3 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nama Sidang Yudisium:</label>
                                    <input
                                        type="text"
                                        value={periodForm.data.name}
                                        onChange={(e) => periodForm.setData('name', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Tanggal Pelaksanaan:</label>
                                        <input
                                            type="date"
                                            value={periodForm.data.event_date}
                                            onChange={(e) => periodForm.setData('event_date', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Batas Daftar:</label>
                                        <input
                                            type="date"
                                            value={periodForm.data.registration_deadline}
                                            onChange={(e) => periodForm.setData('registration_deadline', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsPeriodOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Batal</button>
                                    <button type="submit" disabled={periodForm.processing} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold">Buka Periode</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
