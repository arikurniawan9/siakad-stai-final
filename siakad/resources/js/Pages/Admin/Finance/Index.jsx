import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    CreditCard, CheckCircle2, Clock, AlertTriangle, 
    Search, Filter, Plus, Calendar, DollarSign, 
    ArrowRight, RefreshCw, Landmark, Trash2, Edit2, 
    Building2, Settings, Sparkles, Check, X, Layers
} from 'lucide-react';

export default function FinanceIndex({ 
    invoices, tariffs = [], feeTypes = [], academicYears = [], 
    studyPrograms = [], academicPeriods = [], activePeriod, 
    stats = {}, filters = {} 
}) {
    const [activeTab, setActiveTab] = useState('invoices'); // invoices | tariffs | generator | sandbox
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [selectedYearId, setSelectedYearId] = useState(filters.academic_year_id || academicYears[0]?.id || '');

    // Modals
    const [showTariffModal, setShowTariffModal] = useState(false);
    const [showFeeTypeModal, setShowFeeTypeModal] = useState(false);

    // Form Setup Tarif
    const tariffForm = useForm({
        academic_year_id: selectedYearId || academicYears[0]?.id || 1,
        study_program_id: '',
        fee_type_id: feeTypes[0]?.id || 2,
        amount: 2500000,
        description: 'Tarif Biaya Resmi',
    });

    // Form Tambah Jenis Biaya
    const feeTypeForm = useForm({
        code: '',
        name: '',
        va_bill_code: '06',
        default_amount: 500000,
        is_periodic: true,
    });

    // Form Mass Generator
    const generatorForm = useForm({
        academic_period_id: activePeriod?.id || academicPeriods[0]?.id || 1,
        fee_type_id: feeTypes[1]?.id || 2, // default SPP
        batch_year: '',
        study_program_id: '',
        override_amount: '',
        due_date: '2026-09-15',
    });

    // Sandbox Simulator
    const [sandboxVa, setSandboxVa] = useState('99280221010042');
    const [sandboxAmount, setSandboxAmount] = useState('2500000');
    const [sandboxResult, setSandboxResult] = useState(null);
    const [simulating, setSimulating] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/finance', { search, status: statusFilter, academic_year_id: selectedYearId }, { preserveState: true });
    };

    const handleYearFilterChange = (yId) => {
        setSelectedYearId(yId);
        tariffForm.setData('academic_year_id', yId);
        router.get('/admin/finance', { search, status: statusFilter, academic_year_id: yId }, { preserveState: true });
    };

    const handleTariffSubmit = (e) => {
        e.preventDefault();
        tariffForm.post('/admin/finance/tariffs', {
            onSuccess: () => {
                setShowTariffModal(false);
                tariffForm.reset('amount', 'description');
            },
        });
    };

    const handleDeleteTariff = (id) => {
        if (confirm('Hapus konfigurasi tarif biaya ini?')) {
            router.delete(`/admin/finance/tariffs/${id}`);
        }
    };

    const handleFeeTypeSubmit = (e) => {
        e.preventDefault();
        feeTypeForm.post('/admin/finance/fee-types', {
            onSuccess: () => {
                setShowFeeTypeModal(false);
                feeTypeForm.reset();
            },
        });
    };

    const handleGeneratorSubmit = (e) => {
        e.preventDefault();
        if (confirm('Jalankan generator tagihan massal untuk mahasiswa yang dipilih?')) {
            generatorForm.post('/admin/finance/mass-generate', {
                onSuccess: () => {
                    setActiveTab('invoices');
                },
            });
        }
    };

    const handleSimulatePayment = (vaNum, amt) => {
        setSimulating(true);
        fetch('/api/v1/bsi/va/simulate-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({
                va_number: vaNum || sandboxVa,
                amount: amt || sandboxAmount,
                channel: 'BSI_MOBILE',
            }),
        })
        .then(res => res.json())
        .then(data => {
            setSandboxResult(data);
            setSimulating(false);
            router.reload({ preserveScroll: true });
        })
        .catch(err => {
            setSandboxResult({ status: 'ERROR', message: err.message });
            setSimulating(false);
        });
    };

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
    };

    return (
        <AppLayout title="Sistem Manajemen Keuangan & Setup Tarif">
            <Head title="Manajemen Keuangan & Tarif" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Sistem Manajemen Keuangan & Setup Tarif</h2>
                        <p className="text-xs text-slate-500">
                            Konfigurasi komponen biaya per tahun akademik, generator tagihan massal, & integrasi Virtual Account BSI (9928).
                        </p>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-500">Total Penerimaan Lunas (Kas)</span>
                            <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">{formatRupiah(stats.total_paid || 0)}</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
                        <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-500">Total Piutang Belum Bayar</span>
                            <p className="text-xl sm:text-2xl font-black text-rose-700 mt-0.5">{formatRupiah(stats.total_unpaid || 0)}</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-500">Total VA BSI Terbit</span>
                            <p className="text-xl sm:text-2xl font-black text-blue-800 mt-0.5">{stats.total_va || 0} Akun VA</p>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs space-x-4 overflow-x-auto text-xs font-bold">
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={`py-3.5 border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'invoices' ? 'border-emerald-600 text-emerald-800 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <CreditCard className="w-4 h-4" />
                        <span>1. Monitoring Tagihan & VA BSI ({invoices.total || 0})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('tariffs')}
                        className={`py-3.5 border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'tariffs' ? 'border-emerald-600 text-emerald-800 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Settings className="w-4 h-4" />
                        <span>2. Setup Tarif Biaya per Tahun Akademik ({tariffs.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('generator')}
                        className={`py-3.5 border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'generator' ? 'border-emerald-600 text-emerald-800 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>3. Generator Tagihan Massal Otomatis</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('sandbox')}
                        className={`py-3.5 border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'sandbox' ? 'border-emerald-600 text-emerald-800 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Landmark className="w-4 h-4" />
                        <span>4. Sandbox H2H Gateway BSI</span>
                    </button>
                </div>

                {/* TAB 1: MONITORING TAGIHAN */}
                {activeTab === 'invoices' && (
                    <div className="space-y-4">
                        {/* Search & Filter Bar */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
                            <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 w-full">
                                <div className="relative flex-1">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari nomor invoice, nama mahasiswa, NIM, atau nomor VA 9928..."
                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        router.get('/admin/finance', { search, status: e.target.value, academic_year_id: selectedYearId }, { preserveState: true });
                                    }}
                                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="LUNAS">Lunas</option>
                                    <option value="BELUM_BAYAR">Belum Bayar</option>
                                    <option value="KADALUARSA">Kadaluarsa</option>
                                </select>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition"
                                >
                                    Cari
                                </button>
                            </form>
                        </div>

                        {/* Invoices Table */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                                            <th className="py-3 px-4">Nomor Invoice</th>
                                            <th className="py-3 px-4">Nama Mahasiswa / PMB</th>
                                            <th className="py-3 px-4">Jenis Tagihan</th>
                                            <th className="py-3 px-4">Nomor VA BSI (9928)</th>
                                            <th className="py-3 px-4 text-right">Nominal Tagihan</th>
                                            <th className="py-3 px-4 text-center">Status</th>
                                            <th className="py-3 px-4 text-right">Simulasi H2H</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {invoices.data.map((inv) => {
                                            const isPaid = inv.status === 'LUNAS';
                                            return (
                                                <tr key={inv.id} className="hover:bg-slate-50 transition">
                                                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                                        {inv.invoice_number}
                                                        <span className="block text-[10px] text-slate-400 font-sans">Jatuh Tempo: {inv.due_date?.slice(0, 10)}</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <p className="font-black text-slate-900">{inv.user_name || inv.applicant_name}</p>
                                                        <p className="text-[11px] font-mono text-slate-500">{inv.user_nim || inv.applicant_reg_num} • {inv.user_prodi || 'PMB'}</p>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700">
                                                            {inv.fee_name}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                                                        {inv.va_number || '-'}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                                                        {formatRupiah(inv.final_amount)}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                                            isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                                        }`}>
                                                            {inv.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        {!isPaid && inv.va_number ? (
                                                            <button
                                                                onClick={() => handleSimulatePayment(inv.va_number, inv.final_amount)}
                                                                disabled={simulating}
                                                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-black transition flex items-center space-x-1 ml-auto shadow-2xs cursor-pointer"
                                                            >
                                                                <span>⚡ Bayar via BSI</span>
                                                            </button>
                                                        ) : (
                                                            <span className="text-[10px] font-mono text-emerald-700 font-bold">
                                                                ✓ {inv.payment_method || 'VA_BSI'}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs text-slate-500">
                                    Menampilkan {invoices.from || 0} - {invoices.to || 0} dari {invoices.total} tagihan
                                </span>
                                <div className="flex items-center space-x-1">
                                    {invoices.links.map((link, idx) => (
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

                {/* TAB 2: SETUP TARIF BIAYA PER TAHUN AKADEMIK */}
                {activeTab === 'tariffs' && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            {/* Academic Year Selector */}
                            <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-slate-700">Tahun Akademik:</span>
                                <select
                                    value={selectedYearId}
                                    onChange={(e) => handleYearFilterChange(e.target.value)}
                                    className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
                                >
                                    {academicYears.map((y) => (
                                        <option key={y.id} value={y.id}>Tahun Akademik {y.code} ({y.name})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setShowFeeTypeModal(true)}
                                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Komponen Biaya</span>
                                </button>
                                <button
                                    onClick={() => {
                                        tariffForm.setData('academic_year_id', selectedYearId);
                                        setShowTariffModal(true);
                                    }}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Setup Tarif Baru</span>
                                </button>
                            </div>
                        </div>

                        {/* Tariffs Table */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                                            <th className="py-3 px-4">Tahun Akademik</th>
                                            <th className="py-3 px-4">Komponen Biaya</th>
                                            <th className="py-3 px-4">Program Studi</th>
                                            <th className="py-3 px-4">Deskripsi / Peruntukan</th>
                                            <th className="py-3 px-4 text-right">Besaran Tarif (Rp)</th>
                                            <th className="py-3 px-4 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {tariffs.map((t) => (
                                            <tr key={t.id} className="hover:bg-slate-50 transition">
                                                <td className="py-3 px-4 font-mono font-bold text-slate-800">
                                                    {t.year_code}
                                                </td>
                                                <td className="py-3 px-4 font-black text-slate-900">
                                                    {t.fee_name} <span className="text-[10px] text-slate-400 font-mono">({t.fee_code})</span>
                                                </td>
                                                <td className="py-3 px-4 text-slate-700 font-medium">
                                                    {t.study_program_name || <span className="text-emerald-700 font-bold">Semua Program Studi (General)</span>}
                                                </td>
                                                <td className="py-3 px-4 text-slate-500">
                                                    {t.description || '-'}
                                                </td>
                                                <td className="py-3 px-4 text-right font-mono font-black text-emerald-800 text-sm">
                                                    {formatRupiah(t.amount)}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <button
                                                        onClick={() => handleDeleteTariff(t.id)}
                                                        className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition"
                                                        title="Hapus Tarif"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: GENERATOR TAGIHAN MASSAL OTOMATIS */}
                {activeTab === 'generator' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto space-y-6">
                        <div className="border-b border-slate-100 pb-3">
                            <h3 className="text-base font-black text-slate-900 uppercase">Generator Invoicing SPP / Biaya Massal</h3>
                            <p className="text-xs text-slate-500">
                                Otomatis menerbitkan tagihan mahasiswa dan membuat Virtual Account BSI (Prefix 9928) sesuai setup tarif.
                            </p>
                        </div>

                        <form onSubmit={handleGeneratorSubmit} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Periode Semester Target:</label>
                                    <select
                                        value={generatorForm.data.academic_period_id}
                                        onChange={(e) => generatorForm.setData('academic_period_id', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold"
                                    >
                                        {academicPeriods.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} {p.is_active ? '★ (Aktif)' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Jenis Pembayaran:</label>
                                    <select
                                        value={generatorForm.data.fee_type_id}
                                        onChange={(e) => generatorForm.setData('fee_type_id', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold"
                                    >
                                        {feeTypes.map(ft => (
                                            <option key={ft.id} value={ft.id}>{ft.name} ({ft.code})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Filter Angkatan Mahasiswa:</label>
                                    <select
                                        value={generatorForm.data.batch_year}
                                        onChange={(e) => generatorForm.setData('batch_year', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold"
                                    >
                                        <option value="">Semua Angkatan Mahasiswa Aktif</option>
                                        <option value="2026">Angkatan 2026 (Mhs Baru)</option>
                                        <option value="2025">Angkatan 2025</option>
                                        <option value="2024">Angkatan 2024</option>
                                        <option value="2023">Angkatan 2023</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Filter Program Studi:</label>
                                    <select
                                        value={generatorForm.data.study_program_id}
                                        onChange={(e) => generatorForm.setData('study_program_id', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold"
                                    >
                                        <option value="">Semua Program Studi</option>
                                        {studyPrograms.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Batas Akhir Bayar (Jatuh Tempo):</label>
                                    <input
                                        type="date"
                                        value={generatorForm.data.due_date}
                                        onChange={(e) => generatorForm.setData('due_date', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Override Nominal Khusus (Opsional):</label>
                                    <input
                                        type="number"
                                        value={generatorForm.data.override_amount}
                                        onChange={(e) => generatorForm.setData('override_amount', e.target.value)}
                                        placeholder="Kosongkan untuk gunakan setup tarif prodi"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold font-mono"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs space-y-1">
                                <p className="font-bold">⚡ Otomasi Billing Bank Syariah Indonesia:</p>
                                <p className="text-[11px] text-emerald-800">
                                    Sistem akan otomatis mencocokkan besaran biaya sesuai tarif Tahun Akademik & Program Studi tiap mahasiswa, lalu menerbitkan nomor VA BSI format <strong className="font-mono">9928 + 02 + NIM</strong>.
                                </p>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={generatorForm.processing}
                                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition shadow-md flex items-center space-x-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span>Jalankan Generator Tagihan Massal</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* TAB 4: SANDBOX H2H GATEWAY BSI */}
                {activeTab === 'sandbox' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto space-y-6">
                        <div className="border-b border-slate-100 pb-3">
                            <h3 className="text-base font-black text-slate-900 uppercase">Simulator Pembayaran Virtual Account BSI</h3>
                            <p className="text-xs text-slate-500">
                                Uji coba integrasi Host-to-Host (H2H) Bank Syariah Indonesia tanpa transaksi uang riil.
                            </p>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nomor Virtual Account (9928):</label>
                                    <input
                                        type="text"
                                        value={sandboxVa}
                                        onChange={(e) => setSandboxVa(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-emerald-900"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nominal Transaksi (Rp):</label>
                                    <input
                                        type="number"
                                        value={sandboxAmount}
                                        onChange={(e) => setSandboxAmount(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => handleSimulatePayment(sandboxVa, sandboxAmount)}
                                disabled={simulating}
                                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-xl font-mono font-bold text-xs transition shadow-md flex items-center justify-center space-x-2"
                            >
                                <Landmark className="w-4 h-4" />
                                <span>{simulating ? 'Menghubungkan ke BSI API Gateway...' : 'Kirim Simulasi Pembayaran Callback BSI'}</span>
                            </button>

                            {sandboxResult && (
                                <div className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto space-y-1">
                                    <p className="text-slate-400 font-bold">[Response Payload Gateway BSI]:</p>
                                    <pre>{JSON.stringify(sandboxResult, null, 2)}</pre>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* MODAL SETUP TARIF */}
                {showTariffModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-900 uppercase">Setup Tarif Biaya per Tahun Akademik</h3>
                                <button onClick={() => setShowTariffModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Batal</button>
                            </div>
                            <form onSubmit={handleTariffSubmit} className="space-y-3 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Tahun Akademik:</label>
                                    <select
                                        value={tariffForm.data.academic_year_id}
                                        onChange={(e) => tariffForm.setData('academic_year_id', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                    >
                                        {academicYears.map(y => <option key={y.id} value={y.id}>{y.code} ({y.name})</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Komponen Biaya:</label>
                                        <select
                                            value={tariffForm.data.fee_type_id}
                                            onChange={(e) => tariffForm.setData('fee_type_id', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        >
                                            {feeTypes.map(ft => <option key={ft.id} value={ft.id}>{ft.name} ({ft.code})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Program Studi:</label>
                                        <select
                                            value={tariffForm.data.study_program_id}
                                            onChange={(e) => tariffForm.setData('study_program_id', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        >
                                            <option value="">Semua Prodi (General)</option>
                                            {studyPrograms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nominal Tarif (Rp):</label>
                                    <input
                                        type="number"
                                        value={tariffForm.data.amount}
                                        onChange={(e) => tariffForm.setData('amount', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-sm"
                                        required
                                        min={0}
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Deskripsi / Catatan:</label>
                                    <input
                                        type="text"
                                        value={tariffForm.data.description}
                                        onChange={(e) => tariffForm.setData('description', e.target.value)}
                                        placeholder="Contoh: SPP/UKT Semesteran Mahasiswa Reguler"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                                    />
                                </div>
                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setShowTariffModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Batal</button>
                                    <button type="submit" disabled={tariffForm.processing} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold">Simpan Tarif</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL TAMBAH JENIS BIAYA */}
                {showFeeTypeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-900 uppercase">Tambah Jenis Komponen Biaya</h3>
                                <button onClick={() => setShowFeeTypeModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Batal</button>
                            </div>
                            <form onSubmit={handleFeeTypeSubmit} className="space-y-3 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Kode Biaya (Singkat):</label>
                                    <input
                                        type="text"
                                        value={feeTypeForm.data.code}
                                        onChange={(e) => feeTypeForm.setData('code', e.target.value.toUpperCase())}
                                        placeholder="Contoh: STUDI_TOUR / KKN"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nama Komponen Biaya:</label>
                                    <input
                                        type="text"
                                        value={feeTypeForm.data.name}
                                        onChange={(e) => feeTypeForm.setData('name', e.target.value)}
                                        placeholder="Contoh: Biaya Kuliah Kerja Nyata (KKN)"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Kode Bill VA (2 Digit):</label>
                                        <input
                                            type="text"
                                            maxLength={2}
                                            value={feeTypeForm.data.va_bill_code}
                                            onChange={(e) => feeTypeForm.setData('va_bill_code', e.target.value)}
                                            placeholder="06"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Nominal Default (Rp):</label>
                                        <input
                                            type="number"
                                            value={feeTypeForm.data.default_amount}
                                            onChange={(e) => feeTypeForm.setData('default_amount', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setShowFeeTypeModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Batal</button>
                                    <button type="submit" disabled={feeTypeForm.processing} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold">Simpan Komponen</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
