import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    School, Calendar, CheckCircle2, Clock, 
    Plus, Sparkles, AlertCircle, ArrowRight, 
    Layers, BookOpen, CreditCard, Star, FileText, Check, X
} from 'lucide-react';

export default function AcademicPeriodsIndex({ academicYears = [], academicPeriods = [], activePeriod = null }) {
    const [activeTab, setActiveTab] = useState('periods'); // 'periods' | 'years'
    const [showYearModal, setShowYearModal] = useState(false);
    const [showPeriodModal, setShowPeriodModal] = useState(false);

    // Form Tahun Akademik
    const yearForm = useForm({
        code: '2027/2028',
        name: 'Tahun Akademik 2027/2028',
        start_date: '2027-09-01',
        end_date: '2028-08-31',
    });

    // Form Periode Semester
    const periodForm = useForm({
        academic_year_id: academicYears[0]?.id || '',
        code: '20262',
        name: 'Semester Genap 2026/2027',
        semester_type: 'GENAP',
        start_date: '2027-02-01',
        end_date: '2027-07-31',
        krs_start_date: '2027-01-15',
        krs_end_date: '2027-02-10',
        payment_start_date: '2027-01-05',
        payment_end_date: '2027-02-05',
        grading_start_date: '2027-07-01',
        grading_end_date: '2027-07-25',
        edom_start_date: '2027-06-15',
        edom_end_date: '2027-07-15',
    });

    const submitYear = (e) => {
        e.preventDefault();
        yearForm.post('/admin/academic-periods/years', {
            onSuccess: () => {
                setShowYearModal(false);
                yearForm.reset();
            },
        });
    };

    const submitPeriod = (e) => {
        e.preventDefault();
        periodForm.post('/admin/academic-periods/periods', {
            onSuccess: () => {
                setShowPeriodModal(false);
                periodForm.reset();
            },
        });
    };

    const handleActivatePeriod = (periodId, periodName) => {
        if (confirm(`Apakah Anda yakin ingin MENGAKTIFKAN "${periodName}" sebagai semester berjalan kampus?`)) {
            router.post(`/admin/academic-periods/${periodId}/activate`);
        }
    };

    return (
        <AppLayout title="Master Tahun & Periode Akademik">
            <Head title="Tahun & Periode Akademik — SIAKAD" />

            <div className="space-y-3.5">
                {/* 1. COMPACT HERO HEADER */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden border border-slate-700/50">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black mb-1">
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                <span>PENGATURAN KALENDER & SEMESTER</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                                Tahun & Periode Akademik
                            </h2>
                            <p className="text-[11px] text-slate-300 mt-0.5 max-w-xl">
                                Siklus perkuliahan, jadwal pengisian KRS, pembayaran SPP BSI, input nilai, dan kuesioner EDOM.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                            <button
                                onClick={() => setShowYearModal(true)}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold transition flex items-center space-x-1 shadow border border-slate-700 cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                                <span>+ Tahun Akademik</span>
                            </button>
                            <button
                                onClick={() => setShowPeriodModal(true)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-black transition flex items-center space-x-1 shadow cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Periode Semester</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. COMPACT STATS & ACTIVE SEMESTER CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Active Period */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Semester Aktif</span>
                            <span className="p-1 bg-emerald-100 text-emerald-800 rounded-md"><School className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-xs font-black text-slate-900 leading-tight">{activePeriod?.name || 'Belum Ada'}</p>
                            <p className="text-[10px] font-mono font-bold text-emerald-700 mt-0.5">Kode: {activePeriod?.code || '-'}</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center space-x-1 text-[9px] text-emerald-600 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Sedang Berjalan</span>
                        </div>
                    </div>

                    {/* Total Academic Years */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Tahun Akademik</span>
                            <span className="p-1 bg-blue-100 text-blue-800 rounded-md"><Calendar className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-slate-900">{academicYears.length} TA</p>
                            <p className="text-[10px] text-slate-500">Tahun Ajaran Sistem</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-blue-600 font-bold">
                            Kalender Terdaftar
                        </div>
                    </div>

                    {/* KRS Schedule */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Jadwal KRS</span>
                            <span className="p-1 bg-purple-100 text-purple-800 rounded-md"><BookOpen className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-[10px] text-slate-600">{activePeriod?.krs_start_date} s.d.</p>
                            <p className="text-xs font-black text-purple-800">{activePeriod?.krs_end_date}</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-purple-600 font-bold">
                            Masa KRS Mahasiswa
                        </div>
                    </div>

                    {/* Payment Schedule */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Bayar SPP BSI</span>
                            <span className="p-1 bg-amber-100 text-amber-800 rounded-md"><CreditCard className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-[10px] text-slate-600">{activePeriod?.payment_start_date} s.d.</p>
                            <p className="text-xs font-black text-amber-800">{activePeriod?.payment_end_date}</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-amber-600 font-bold">
                            Jatuh Tempo VA BSI
                        </div>
                    </div>
                </div>

                {/* 3. TABS SWITCHER */}
                <div className="flex border-b border-slate-200 space-x-4">
                    <button
                        onClick={() => setActiveTab('periods')}
                        className={`pb-2 text-[11px] font-bold border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
                            activeTab === 'periods'
                                ? 'border-emerald-600 text-emerald-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <School className="w-3.5 h-3.5" />
                        <span>Periode Semester ({academicPeriods.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('years')}
                        className={`pb-2 text-[11px] font-bold border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
                            activeTab === 'years'
                                ? 'border-emerald-600 text-emerald-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Master Tahun Akademik ({academicYears.length})</span>
                    </button>
                </div>

                {/* TAB 1: DAFTAR PERIODE SEMESTER (COMPACT TABLE) */}
                {activeTab === 'periods' && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-[11px]">
                                <thead>
                                    <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="py-2.5 px-3">Kode</th>
                                        <th className="py-2.5 px-3">Nama Semester</th>
                                        <th className="py-2.5 px-3">Masa Kuliah</th>
                                        <th className="py-2.5 px-3">Masa KRS</th>
                                        <th className="py-2.5 px-3">Bayar SPP</th>
                                        <th className="py-2.5 px-3 text-center">Status</th>
                                        <th className="py-2.5 px-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {academicPeriods.map((p) => (
                                        <tr key={p.id} className={`transition ${p.is_active ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-slate-50'}`}>
                                            <td className="py-2.5 px-3 font-mono font-bold">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] border ${
                                                    p.is_active ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-200'
                                                }`}>
                                                    {p.code}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <p className="font-bold text-slate-900">{p.name}</p>
                                                <p className="text-[10px] text-slate-500">{p.year_name} • {p.semester_type}</p>
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-600">
                                                {p.start_date} s.d. {p.end_date}
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <span className="text-purple-900 font-bold">{p.krs_start_date}</span>
                                                <span className="text-slate-400"> s.d. </span>
                                                <span className="text-purple-900 font-bold">{p.krs_end_date}</span>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <span className="text-amber-900 font-bold">{p.payment_start_date}</span>
                                                <span className="text-slate-400"> s.d. </span>
                                                <span className="text-amber-900 font-bold">{p.payment_end_date}</span>
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                {p.is_active ? (
                                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black border border-emerald-300 inline-flex items-center space-x-1">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>AKTIF</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-medium text-slate-400">Nonaktif</span>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                {!p.is_active ? (
                                                    <button
                                                        onClick={() => handleActivatePeriod(p.id, p.name)}
                                                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-[10px] font-bold transition shadow-2xs cursor-pointer"
                                                    >
                                                        Aktifkan
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] text-emerald-700 font-black">✓ Berjalan</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 2: MASTER TAHUN AKADEMIK (COMPACT GRID) */}
                {activeTab === 'years' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {academicYears.map((yr) => (
                            <div key={yr.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-mono font-bold text-[11px] border border-slate-200">
                                        {yr.code}
                                    </span>
                                    <Calendar className="w-4 h-4 text-emerald-600" />
                                </div>
                                <h3 className="text-xs font-black text-slate-900">{yr.name}</h3>
                                <div className="p-2 bg-slate-50 rounded-lg text-[10px] space-y-0.5 text-slate-600">
                                    <p><span className="font-bold">Mulai:</span> {yr.start_date}</p>
                                    <p><span className="font-bold">Selesai:</span> {yr.end_date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* MODAL 1: TAMBAH TAHUN AKADEMIK BARU */}
                {showYearModal && (
                    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-2xs flex items-center justify-center p-3">
                        <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <div>
                                    <h3 className="text-xs font-black text-slate-900">Tambah Tahun Akademik</h3>
                                    <p className="text-[10px] text-slate-500">Definisikan master kalender tahun ajaran baru.</p>
                                </div>
                                <button onClick={() => setShowYearModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={submitYear} className="space-y-3 text-[11px]">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-0.5">Kode Tahun Akademik *</label>
                                    <input
                                        type="text"
                                        value={yearForm.data.code}
                                        onChange={(e) => yearForm.setData('code', e.target.value)}
                                        placeholder="Contoh: 2027/2028"
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-0.5">Nama Tahun Akademik *</label>
                                    <input
                                        type="text"
                                        value={yearForm.data.name}
                                        onChange={(e) => yearForm.setData('name', e.target.value)}
                                        placeholder="Contoh: Tahun Akademik 2027/2028"
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-0.5">Tanggal Mulai *</label>
                                        <input
                                            type="date"
                                            value={yearForm.data.start_date}
                                            onChange={(e) => yearForm.setData('start_date', e.target.value)}
                                            className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-0.5">Tanggal Berakhir *</label>
                                        <input
                                            type="date"
                                            value={yearForm.data.end_date}
                                            onChange={(e) => yearForm.setData('end_date', e.target.value)}
                                            className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowYearModal(false)}
                                        className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={yearForm.processing}
                                        className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 cursor-pointer"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 2: TAMBAH PERIODE SEMESTER BARU */}
                {showPeriodModal && (
                    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-2xs flex items-center justify-center p-3">
                        <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <div>
                                    <h3 className="text-xs font-black text-slate-900">Tambah Periode Semester</h3>
                                    <p className="text-[10px] text-slate-500">Atur jadwal masa kuliah, KRS, dan SPP.</p>
                                </div>
                                <button onClick={() => setShowPeriodModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={submitPeriod} className="space-y-2.5 text-[11px]">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-0.5">Tahun Akademik *</label>
                                        <select
                                            value={periodForm.data.academic_year_id}
                                            onChange={(e) => periodForm.setData('academic_year_id', e.target.value)}
                                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                                            required
                                        >
                                            {academicYears.map((yr) => (
                                                <option key={yr.id} value={yr.id}>{yr.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-0.5">Tipe Semester *</label>
                                        <select
                                            value={periodForm.data.semester_type}
                                            onChange={(e) => periodForm.setData('semester_type', e.target.value)}
                                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                                        >
                                            <option value="GANJIL">Semester Ganjil</option>
                                            <option value="GENAP">Semester Genap</option>
                                            <option value="PENDEK">Semester Pendek</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-0.5">Kode Semester *</label>
                                        <input
                                            type="text"
                                            value={periodForm.data.code}
                                            onChange={(e) => periodForm.setData('code', e.target.value)}
                                            placeholder="Contoh: 20262"
                                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-0.5">Nama Semester *</label>
                                        <input
                                            type="text"
                                            value={periodForm.data.name}
                                            onChange={(e) => periodForm.setData('name', e.target.value)}
                                            placeholder="Contoh: Semester Genap"
                                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                                    <p className="font-bold text-slate-800 text-[10px] uppercase">1. Masa Perkuliahan</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="date"
                                            value={periodForm.data.start_date}
                                            onChange={(e) => periodForm.setData('start_date', e.target.value)}
                                            className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-[10px]"
                                            required
                                        />
                                        <input
                                            type="date"
                                            value={periodForm.data.end_date}
                                            onChange={(e) => periodForm.setData('end_date', e.target.value)}
                                            className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-[10px]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="p-2 bg-purple-50 rounded-xl border border-purple-200 space-y-1">
                                    <p className="font-bold text-purple-900 text-[10px] uppercase">2. Masa Pengisian KRS</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="date"
                                            value={periodForm.data.krs_start_date}
                                            onChange={(e) => periodForm.setData('krs_start_date', e.target.value)}
                                            className="w-full p-1.5 bg-white border border-purple-300 rounded-lg text-[10px]"
                                            required
                                        />
                                        <input
                                            type="date"
                                            value={periodForm.data.krs_end_date}
                                            onChange={(e) => periodForm.setData('krs_end_date', e.target.value)}
                                            className="w-full p-1.5 bg-white border border-purple-300 rounded-lg text-[10px]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                                    <p className="font-bold text-amber-900 text-[10px] uppercase">3. Masa Bayar SPP BSI</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="date"
                                            value={periodForm.data.payment_start_date}
                                            onChange={(e) => periodForm.setData('payment_start_date', e.target.value)}
                                            className="w-full p-1.5 bg-white border border-amber-300 rounded-lg text-[10px]"
                                            required
                                        />
                                        <input
                                            type="date"
                                            value={periodForm.data.payment_end_date}
                                            onChange={(e) => periodForm.setData('payment_end_date', e.target.value)}
                                            className="w-full p-1.5 bg-white border border-amber-300 rounded-lg text-[10px]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowPeriodModal(false)}
                                        className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={periodForm.processing}
                                        className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 cursor-pointer"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
