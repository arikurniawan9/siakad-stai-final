import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    UserCheck, Users, Search, Filter, Plus, 
    Calendar, CheckCircle2, Clock, XCircle, Award, 
    GraduationCap, Phone, Mail, Building2, ChevronRight, 
    Sparkles, RefreshCw, CreditCard, ShieldCheck, Eye
} from 'lucide-react';

export default function PmbIndex({ 
    applicants, pmbPeriods = [], activePmbPeriod, 
    studyPrograms = [], academicYears = [], prodiStats = [], 
    stats = {}, filters = {} 
}) {
    const [activeTab, setActiveTab] = useState('applicants'); // applicants | waves | stats
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [periodFilter, setPeriodFilter] = useState(filters.pmb_period_id || '');
    const [prodiFilter, setProdiFilter] = useState(filters.study_program_id || '');

    // Modals
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);

    // Form Period
    const periodForm = useForm({
        academic_year_id: academicYears[0]?.id || 1,
        name: 'PMB Gelombang 2 TA 2026/2027',
        start_date: '2026-07-01',
        end_date: '2026-08-31',
        registration_fee: 250000,
        quota: 300,
    });

    // Form Status
    const statusForm = useForm({
        status: 'LULUS_SELEKSI',
        notes: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/pmb', { 
            search, 
            status: statusFilter, 
            pmb_period_id: periodFilter, 
            study_program_id: prodiFilter 
        }, { preserveState: true });
    };

    const handlePeriodSubmit = (e) => {
        e.preventDefault();
        periodForm.post('/admin/pmb/periods', {
            onSuccess: () => {
                setShowPeriodModal(false);
                periodForm.reset();
            },
        });
    };

    const handleOpenStatusModal = (app) => {
        setSelectedApplicant(app);
        statusForm.setData({
            status: app.status || 'TERVERIFIKASI',
            notes: app.notes || '',
        });
        setShowStatusModal(true);
    };

    const handleStatusSubmit = (e) => {
        e.preventDefault();
        statusForm.put(`/admin/pmb/applicants/${selectedApplicant.id}/status`, {
            onSuccess: () => {
                setShowStatusModal(false);
                setSelectedApplicant(null);
            },
        });
    };

    const handleEnrollStudent = (app) => {
        if (confirm(`Daftarkan ${app.full_name} sebagai Mahasiswa Resmi STAI Al-Ittihad? Sistem akan otomatis mengenerate NIM baru dan akun login SIAKAD.`)) {
            router.post(`/admin/pmb/applicants/${app.id}/enroll`);
        }
    };

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
    };

    return (
        <AppLayout title="Portal Penerimaan Mahasiswa Baru (PMB)">
            <Head title="Admin PMB — SIAKAD" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Penerimaan Mahasiswa Baru (PMB) Online</h2>
                        <p className="text-xs text-slate-500">
                            Manajemen pendaftaran, verifikasi Virtual Account BSI, seleksi kelulusan, & otomasi penerbitan NIM mahasiswa baru.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowPeriodModal(true)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Buka Gelombang Baru</span>
                        </button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-slate-500">Total Pendaftar PMB</span>
                        <p className="text-2xl font-black text-slate-900 mt-1">{stats.total || 0}</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-emerald-600">Terverifikasi (VA Lunas)</span>
                        <p className="text-2xl font-black text-emerald-700 mt-1">{stats.verified || 0}</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-blue-600">Lulus Seleksi / Diterima</span>
                        <p className="text-2xl font-black text-blue-700 mt-1">{stats.passed || 0}</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-rose-600">Menunggu Pembayaran</span>
                        <p className="text-2xl font-black text-rose-700 mt-1">{stats.pending_payment || 0}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs space-x-4 overflow-x-auto text-xs font-bold">
                    <button
                        onClick={() => setActiveTab('applicants')}
                        className={`py-3.5 border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'applicants' ? 'border-emerald-600 text-emerald-800 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>1. Data Calon Mahasiswa & Seleksi ({applicants.total || 0})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('waves')}
                        className={`py-3.5 border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'waves' ? 'border-emerald-600 text-emerald-800 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Calendar className="w-4 h-4" />
                        <span>2. Gelombang & Periode PMB ({pmbPeriods.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`py-3.5 border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'stats' ? 'border-emerald-600 text-emerald-800 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Award className="w-4 h-4" />
                        <span>3. Rekapitulasi Peminat per Prodi</span>
                    </button>
                </div>

                {/* TAB 1: CALON MAHASISWA */}
                {activeTab === 'applicants' && (
                    <div className="space-y-4">
                        {/* Filter Bar */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
                            <form onSubmit={handleSearch} className="flex-1 flex flex-col sm:flex-row items-center gap-2 w-full">
                                <div className="relative flex-1 w-full">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari nama, no. pendaftaran, NIK, atau asal sekolah..."
                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        router.get('/admin/pmb', { search, status: e.target.value, pmb_period_id: periodFilter, study_program_id: prodiFilter }, { preserveState: true });
                                    }}
                                    className="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="MENUNGGU_PEMBAYARAN">Menunggu Pembayaran</option>
                                    <option value="TERVERIFIKASI">Terverifikasi (VA Lunas)</option>
                                    <option value="LULUS_SELEKSI">Lulus Seleksi</option>
                                    <option value="SUDAH_DAFTAR_ULANG">Sudah Daftar Ulang (Mahasiswa)</option>
                                    <option value="DITOLAK">Ditolak / Tidak Lulus</option>
                                </select>
                                <select
                                    value={prodiFilter}
                                    onChange={(e) => {
                                        setProdiFilter(e.target.value);
                                        router.get('/admin/pmb', { search, status: statusFilter, pmb_period_id: periodFilter, study_program_id: e.target.value }, { preserveState: true });
                                    }}
                                    className="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold"
                                >
                                    <option value="">Semua Pilihan Prodi</option>
                                    {studyPrograms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition"
                                >
                                    Filter
                                </button>
                            </form>
                        </div>

                        {/* Applicants Table */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                                            <th className="py-3 px-4">No. Pendaftaran</th>
                                            <th className="py-3 px-4">Nama Calon Mahasiswa</th>
                                            <th className="py-3 px-4">Pilihan Prodi & Jalur</th>
                                            <th className="py-3 px-4">Asal Sekolah</th>
                                            <th className="py-3 px-4">VA BSI (992801)</th>
                                            <th className="py-3 px-4 text-center">Status PMB</th>
                                            <th className="py-3 px-4 text-right">Aksi Kelola</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {applicants.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                                                    Tidak ada data calon mahasiswa yang sesuai dengan filter pencarian.
                                                </td>
                                            </tr>
                                        ) : (
                                            applicants.data.map((app) => {
                                                const isPaid = app.invoice_status === 'LUNAS';
                                                const isPassed = app.status === 'LULUS_SELEKSI';
                                                const isEnrolled = app.status === 'SUDAH_DAFTAR_ULANG';
                                                return (
                                                    <tr key={app.id} className="hover:bg-slate-50 transition">
                                                        <td className="py-3 px-4 font-mono font-black text-emerald-800">
                                                            {app.registration_number}
                                                            <span className="block text-[10px] text-slate-400 font-sans font-normal">{app.period_name}</span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <p className="font-black text-slate-900">{app.full_name}</p>
                                                            <p className="text-[11px] font-mono text-slate-500">NIK: {app.nik} • {app.phone_number}</p>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <p className="font-bold text-slate-800">{app.first_choice_name}</p>
                                                            <span className="inline-block px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">
                                                                Jalur: {app.pathway}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-600">
                                                            {app.previous_school}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="font-mono font-bold text-slate-800">{app.va_number || '-'}</span>
                                                            <span className={`block text-[10px] font-bold ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                                {isPaid ? '✓ Terbayar Lunas' : 'Menunggu Bayar'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                                                isEnrolled ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                                                                isPassed ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                                                                app.status === 'TERVERIFIKASI' ? 'bg-emerald-100 text-emerald-900' :
                                                                app.status === 'DITOLAK' ? 'bg-rose-100 text-rose-900' :
                                                                'bg-slate-100 text-slate-600'
                                                            }`}>
                                                                {app.status?.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <div className="flex items-center justify-end space-x-1.5">
                                                                {isPassed && !isEnrolled && (
                                                                    <button
                                                                        onClick={() => handleEnrollStudent(app)}
                                                                        className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-[10px] font-black transition flex items-center space-x-1 shadow-2xs"
                                                                        title="Otomasi Terbitkan NIM & Akun Mahasiswa"
                                                                    >
                                                                        <GraduationCap className="w-3.5 h-3.5" />
                                                                        <span>Generate NIM</span>
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleOpenStatusModal(app)}
                                                                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[10px] font-bold transition"
                                                                >
                                                                    Ubah Status
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs text-slate-500">
                                    Menampilkan {applicants.from || 0} - {applicants.to || 0} dari {applicants.total} pendaftar
                                </span>
                                <div className="flex items-center space-x-1">
                                    {applicants.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || '#'}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                                                link.active
                                                    ? 'bg-emerald-600 text-white'
                                                    : link.url
                                                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                    : 'text-slate-300 pointer-events-none'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: GELOMBANG PMB */}
                {activeTab === 'waves' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pmbPeriods.map((wave) => (
                            <div key={wave.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono font-bold text-[10px]">
                                            Kuota: {wave.quota} Mahasiswa
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                            wave.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {wave.is_active ? '● PENDAFTARAN BUKA' : '○ TUTUP'}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-black text-slate-900">{wave.name}</h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        📅 {wave.start_date} s.d. {wave.end_date}
                                    </p>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="text-[10px] text-slate-400 font-bold block">Biaya Formulir Pendaftaran:</span>
                                        <p className="text-base font-mono font-black text-emerald-800">{formatRupiah(wave.registration_fee)}</p>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <a
                                        href="/pmb"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1"
                                    >
                                        <span>Buka Formulir Publik</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* TAB 3: REKAPITULASI PRODI */}
                {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                            <h3 className="text-sm font-black text-slate-900 uppercase">Distribusi Pilihan 1 Program Studi</h3>
                            <div className="space-y-3">
                                {prodiStats.map((ps, idx) => (
                                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                                        <span className="font-bold text-slate-800 text-xs">{ps.prodi_name}</span>
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-900 rounded-lg font-black text-xs">
                                            {ps.count} Calon Mahasiswa
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs text-slate-600">
                            <h3 className="text-sm font-black text-slate-900 uppercase">Petunjuk Penerimaan PMB</h3>
                            <p>
                                1. Calon mahasiswa mendaftar mandiri via portal <strong className="text-emerald-800">/pmb</strong> dan mendapatkan nomor Virtual Account BSI (992801...).
                            </p>
                            <p>
                                2. Setelah pembayaran tervalidasi oleh sistem/bank, status otomatis berubah menjadi <strong className="text-emerald-800">TERVERIFIKASI</strong>.
                            </p>
                            <p>
                                3. Admin dapat menetapkan status kelulusan menjadi <strong className="text-blue-800">LULUS_SELEKSI</strong> dan menekan tombol <strong className="text-purple-800">"Generate NIM"</strong> untuk otomatis menerbitkan NIM & akun mahasiswa resmi!
                            </p>
                        </div>
                    </div>
                )}

                {/* MODAL BUKA GELOMBANG BARU */}
                {showPeriodModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-900 uppercase">Buka Gelombang PMB Baru</h3>
                                <button onClick={() => setShowPeriodModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Batal</button>
                            </div>
                            <form onSubmit={handlePeriodSubmit} className="space-y-3 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Tahun Akademik Target:</label>
                                    <select
                                        value={periodForm.data.academic_year_id}
                                        onChange={(e) => periodForm.setData('academic_year_id', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                    >
                                        {academicYears.map(y => <option key={y.id} value={y.id}>{y.code} ({y.name})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nama Gelombang PMB:</label>
                                    <input
                                        type="text"
                                        value={periodForm.data.name}
                                        onChange={(e) => periodForm.setData('name', e.target.value)}
                                        placeholder="Contoh: PMB Gelombang 2 TA 2026/2027"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Tanggal Buka Pendaftaran:</label>
                                        <input
                                            type="date"
                                            value={periodForm.data.start_date}
                                            onChange={(e) => periodForm.setData('start_date', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Tanggal Tutup Pendaftaran:</label>
                                        <input
                                            type="date"
                                            value={periodForm.data.end_date}
                                            onChange={(e) => periodForm.setData('end_date', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Biaya Formulir Pendaftaran (Rp):</label>
                                        <input
                                            type="number"
                                            value={periodForm.data.registration_fee}
                                            onChange={(e) => periodForm.setData('registration_fee', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Target Kuota Mahasiswa:</label>
                                        <input
                                            type="number"
                                            value={periodForm.data.quota}
                                            onChange={(e) => periodForm.setData('quota', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold font-mono"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setShowPeriodModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Batal</button>
                                    <button type="submit" disabled={periodForm.processing} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold">Buka Gelombang</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL UBAH STATUS CALON MAHASISWA */}
                {showStatusModal && selectedApplicant && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-900 uppercase">Ubah Status Seleksi PMB</h3>
                                <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Batal</button>
                            </div>
                            <form onSubmit={handleStatusSubmit} className="space-y-3 text-xs">
                                <div>
                                    <p className="font-bold text-slate-900">{selectedApplicant.full_name}</p>
                                    <p className="text-[11px] font-mono text-slate-500">No. PMB: {selectedApplicant.registration_number}</p>
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Status Kelulusan / Seleksi:</label>
                                    <select
                                        value={statusForm.data.status}
                                        onChange={(e) => statusForm.setData('status', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                    >
                                        <option value="MENUNGGU_PEMBAYARAN">Menunggu Pembayaran Formulir</option>
                                        <option value="TERVERIFIKASI">Terverifikasi (Lunas Formulir)</option>
                                        <option value="LULUS_SELEKSI">Lulus Seleksi Masuk</option>
                                        <option value="SUDAH_DAFTAR_ULANG">Sudah Daftar Ulang (Mahasiswa)</option>
                                        <option value="DITOLAK">Ditolak / Tidak Lulus Seleksi</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Catatan / Keterangan:</label>
                                    <textarea
                                        value={statusForm.data.notes}
                                        onChange={(e) => statusForm.setData('notes', e.target.value)}
                                        rows={3}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                                        placeholder="Tuliskan catatan kelulusan atau syarat tambahan..."
                                    />
                                </div>
                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setShowStatusModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Batal</button>
                                    <button type="submit" disabled={statusForm.processing} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold">Simpan Status</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
