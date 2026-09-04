import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Landmark, CreditCard, ShieldCheck, Radio, Check, Copy, RefreshCw,
    X, Server, CheckCircle2, AlertTriangle, Send, Key,
    ExternalLink, Eye, EyeOff, Sparkles, Activity, FileSpreadsheet,
    Building2, Search, Filter, ArrowUpRight, Clock, User, FileText,
    DollarSign, CheckCircle, AlertCircle, Database, Phone, Mail, ChevronRight,
    Terminal, PlayCircle
} from 'lucide-react';

export default function BsiGatewayIndex({
    config = {},
    stats = {},
    transactions = { data: [] },
    feeTypeBreakdown = [],
    recentAuditLogs = [],
    feeTypes = [],
    filters = {}
}) {
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | config | transactions | simulator | history | reconciliation
    const [formData, setFormData] = useState({ ...config });
    const [saving, setSaving] = useState(false);
    const [testingPing, setTestingPing] = useState(false);
    const [pingResult, setPingResult] = useState(null);
    const [copiedField, setCopiedField] = useState(null);
    const [showSecretTokens, setShowSecretTokens] = useState(false);

    // Search & Filter state for transactions
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'ALL');
    const [selectedFeeType, setSelectedFeeType] = useState(filters.fee_type || 'ALL');

    // Simulator states
    const [inquiryVa, setInquiryVa] = useState('');
    const [inquiryLoading, setInquiryLoading] = useState(false);
    const [inquiryResult, setInquiryResult] = useState(null);

    const [paymentVa, setPaymentVa] = useState('');
    const [paymentChannel, setPaymentChannel] = useState('BSI_MOBILE');
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentResult, setPaymentResult] = useState(null);

    // Modal detail
    const [selectedTxDetail, setSelectedTxDetail] = useState(null);

    // Copy to clipboard helper
    const copyText = (text, fieldName) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // Format currency IDR
    const formatRp = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val || 0);
    };

    // Handle Save Config
    const handleSaveConfig = (e) => {
        e.preventDefault();
        setSaving(true);
        router.post('/admin/bsi-gateway/config', formData, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    // Handle Test Ping H2H
    const handleTestPing = async () => {
        setTestingPing(true);
        setPingResult(null);
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/admin/bsi-gateway/test-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
            });
            const data = await res.json();
            setPingResult(data);
        } catch (err) {
            setPingResult({
                success: false,
                status: 'OFFLINE',
                message: 'Gagal menghubungi gateway: ' + err.message,
            });
        } finally {
            setTestingPing(false);
        }
    };

    // Handle Execute Simulator Inquiry
    const handleRunInquiry = async () => {
        if (!inquiryVa) {
            alert('Silakan masukkan nomor VA untuk pengujian.');
            return;
        }
        setInquiryLoading(true);
        setInquiryResult(null);
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/admin/bsi-gateway/simulate-inquiry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
                body: JSON.stringify({ va_number: inquiryVa }),
            });
            const data = await res.json();
            setInquiryResult(data);
        } catch (err) {
            setInquiryResult({
                success: false,
                response_message: 'Koneksi simulator terputus: ' + err.message,
            });
        } finally {
            setInquiryLoading(false);
        }
    };

    // Handle Execute Simulator Payment
    const handleRunPayment = async () => {
        if (!paymentVa) {
            alert('Silakan masukkan nomor VA untuk pengujian.');
            return;
        }
        setPaymentLoading(true);
        setPaymentResult(null);
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/admin/bsi-gateway/simulate-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
                body: JSON.stringify({
                    va_number: paymentVa,
                    channel: paymentChannel,
                }),
            });
            const data = await res.json();
            setPaymentResult(data);
            if (data.success) {
                router.reload({ only: ['transactions', 'stats', 'feeTypeBreakdown'] });
            }
        } catch (err) {
            setPaymentResult({
                success: false,
                message: 'Gagal mengeksekusi callback: ' + err.message,
            });
        } finally {
            setPaymentLoading(false);
        }
    };

    // Handle Search / Filter submission
    const handleFilterChange = (newStatus, newFeeType) => {
        router.get('/admin/bsi-gateway', {
            search: searchQuery,
            status: newStatus !== undefined ? newStatus : selectedStatus,
            fee_type: newFeeType !== undefined ? newFeeType : selectedFeeType,
        }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout>
            <Head title="BSI Smart Billing H2H" />

            <div className="space-y-4">
                {/* 1. HEADER BANNER UTAMA BSI SMART BILLING */}
                <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-2xl p-5 text-white shadow-lg border border-emerald-700/40 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start space-x-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0 ring-2 ring-emerald-300/40">
                                <Landmark className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wide flex items-center space-x-1">
                                        <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                                        <span>BANK SYARIAH INDONESIA (BSI)</span>
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                                        DIRECT H2H • BI-SNAP
                                    </span>
                                    <span className="px-2 py-0.5 bg-slate-800/80 text-emerald-300 rounded text-[10px] font-mono font-semibold border border-emerald-500/30">
                                        Biller: {config.bsi_institution_code || '8891'}
                                    </span>
                                </div>
                                <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                                    Pusat Kontrol BSI Smart Billing & Virtual Account H2H
                                </h1>
                                <p className="text-xs text-slate-300 max-w-2xl mt-0.5 leading-relaxed">
                                    Integrasi perbankan syariah Host-to-Host (H2H) langsung dengan BSI Smart Billing. Menangani otentikasi BI-SNAP, inquiry real-time, push notification callback pelunasan, rekonsiliasi, dan saldo rekening giro penampung.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
                            <button
                                type="button"
                                onClick={handleTestPing}
                                disabled={testingPing}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition shadow flex items-center space-x-1.5 cursor-pointer border border-emerald-400/40"
                            >
                                <Radio className={`w-3.5 h-3.5 ${testingPing ? 'animate-spin' : ''}`} />
                                <span>{testingPing ? 'Menguji Gateway...' : 'Uji Koneksi H2H'}</span>
                            </button>

                            <a
                                href="/admin/bsi-gateway/export-reconciliation"
                                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition shadow border border-slate-700 flex items-center space-x-1.5"
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Unduh Rekonsiliasi</span>
                            </a>
                        </div>
                    </div>

                    {/* Quick Latency Check Toast if result available */}
                    {pingResult && (
                        <div className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between ${
                            pingResult.status === 'ONLINE' 
                                ? 'bg-emerald-900/60 border-emerald-500/50 text-emerald-200' 
                                : 'bg-red-900/60 border-red-500/50 text-red-200'
                        }`}>
                            <div className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${pingResult.status === 'ONLINE' ? 'bg-emerald-400 animate-ping' : 'bg-red-400'}`}></span>
                                <span className="font-bold">{pingResult.message}</span>
                                {pingResult.latency_ms && (
                                    <span className="px-2 py-0.5 rounded bg-black/30 font-mono text-[10px]">
                                        Latensi: {pingResult.latency_ms} ms
                                    </span>
                                )}
                            </div>
                            <button onClick={() => setPingResult(null)} className="text-white/70 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* 2. TAB NAVIGASI */}
                <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap gap-1">
                    {[
                        { id: 'dashboard', label: 'Ringkasan & Saldo', icon: Activity },
                        { id: 'config', label: 'Konfigurasi BSI Smart Billing', icon: Server },
                        { id: 'transactions', label: 'Halaman Transaksi & VA', icon: CreditCard, count: stats.total_transactions },
                        { id: 'simulator', label: 'Simulator Inquiry & Sandbox', icon: Terminal },
                        { id: 'history', label: 'Riwayat Callback & Audit', icon: ShieldCheck, count: recentAuditLogs.length },
                        { id: 'reconciliation', label: 'Rekening & Rekonsiliasi', icon: Building2 },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 cursor-pointer ${
                                    isActive
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{tab.label}</span>
                                {tab.count !== undefined && (
                                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                                        isActive ? 'bg-emerald-800 text-emerald-200' : 'bg-slate-200 text-slate-700'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ========================================================= */}
                {/* TAB 1: DASHBOARD RINGKASAN & SALDO                         */}
                {/* ========================================================= */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-4">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                                    <span>Saldo Terkumpul (Lunas)</span>
                                    <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                                        <DollarSign className="w-4 h-4" />
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mt-2">
                                    {formatRp(stats.total_paid_amount)}
                                </h3>
                                <p className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center space-x-1">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>{stats.total_paid} transaksi berhasil diselesaikan</span>
                                </p>
                            </div>

                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                                    <span>Tagihan Pending (Menunggu)</span>
                                    <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                                        <Clock className="w-4 h-4" />
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mt-2">
                                    {formatRp(stats.total_pending_amount)}
                                </h3>
                                <p className="text-[11px] font-semibold text-amber-600 mt-1 flex items-center space-x-1">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{stats.total_pending} VA aktif belum dibayar</span>
                                </p>
                            </div>

                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                                    <span>Rekening Giro BSI STAI</span>
                                    <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
                                        <Landmark className="w-4 h-4" />
                                    </span>
                                </div>
                                <h3 className="text-base font-black text-slate-900 mt-2 font-mono">
                                    {config.bsi_account_number || '7188919928'}
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-1 truncate">
                                    {config.bsi_account_name || 'STAI AL-ITTIHAD PENAMPUNG'}
                                </p>
                            </div>

                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                                    <span>Spesifikasi Gateway</span>
                                    <span className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
                                        <ShieldCheck className="w-4 h-4" />
                                    </span>
                                </div>
                                <h3 className="text-base font-black text-slate-900 mt-2">
                                    BI-SNAP v2.4 (H2H)
                                </h3>
                                <p className="text-[11px] text-purple-700 font-semibold mt-1">
                                    Code 73 (Auth) & 24 (Inq) & 25 (Pay)
                                </p>
                            </div>
                        </div>

                        {/* Breakdown per Fee Type */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                                        <CreditCard className="w-4 h-4 text-emerald-600" />
                                        <span>Rincian Penerimaan Dana per Pos Tagihan</span>
                                    </h3>
                                    <span className="text-xs text-slate-400">Terverifikasi Otomatis BSI</span>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {feeTypeBreakdown.length > 0 ? (
                                        feeTypeBreakdown.map((item, idx) => (
                                            <div key={idx} className="py-2.5 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">{item.fee_name}</p>
                                                    <p className="text-[10px] text-slate-400">
                                                        Kode: <span className="font-mono font-semibold text-slate-600">{item.fee_code}</span> • {item.total_count} Tagihan
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-emerald-600 font-mono">
                                                        {formatRp(item.paid_amount)}
                                                    </p>
                                                    <p className="text-[10px] text-amber-600 font-mono">
                                                        Pending: {formatRp(item.pending_amount)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-400 italic py-4 text-center">Belum ada data transaksi tercatat.</p>
                                    )}
                                </div>
                            </div>

                            {/* Alur Transaksi H2H BSI Quick Guide */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-4 shadow-md border border-slate-800 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                        <span>DIAGRAM ALUR H2H BSI</span>
                                    </div>
                                    <h4 className="text-xs font-black text-white">
                                        4 Operasi Kunci Smart Billing (BPI ⇄ SIAKAD)
                                    </h4>
                                    <div className="space-y-2 text-[11px] text-slate-300">
                                        <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start space-x-2">
                                            <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                                            <div>
                                                <span className="font-bold text-white">Purchase & Get VA</span>: Mahasiswa terima nomor VA 14-16 digit ({config.bsi_institution_code || '8891'}+Jenis+NIM).
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start space-x-2">
                                            <span className="w-4 h-4 rounded-full bg-teal-400 text-slate-950 font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                                            <div>
                                                <span className="font-bold text-white">Inquiry (H2H)</span>: BSI hubungi URL Inquiry Biller saat nasabah memasukkan VA di ATM/Mobile.
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start space-x-2">
                                            <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                                            <div>
                                                <span className="font-bold text-white">Payment Callback</span>: BSI kirim push notification saat setoran sukses, SIAKAD langsung ubah invoice jadi LUNAS.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setActiveTab('simulator')}
                                    className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center space-x-1.5"
                                >
                                    <Terminal className="w-3.5 h-3.5" />
                                    <span>Buka Sandbox Simulator →</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* TAB 2: KONFIGURASI INSTITUSI BSI (Sesuai Screenshot Zoom)  */}
                {/* ========================================================= */}
                {activeTab === 'config' && (
                    <form onSubmit={handleSaveConfig} className="space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-6">
                            {/* Section A: Profil Institusi & Mode Transaksi */}
                            <div>
                                <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
                                    <Building2 className="w-4 h-4 text-emerald-600" />
                                    <span>1. Konfigurasi Institusi & Mode Transaksi</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Mode Environment
                                        </label>
                                        <select
                                            value={formData.bsi_env}
                                            onChange={(e) => setFormData({ ...formData, bsi_env: e.target.value })}
                                            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                        >
                                            <option value="sandbox">🧪 Sandbox (UAT / Pengujian BSI)</option>
                                            <option value="production">🚀 Production (Live Core Banking BSI)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Kode Institusi Biller BSI
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.bsi_institution_code}
                                            onChange={(e) => setFormData({ ...formData, bsi_institution_code: e.target.value })}
                                            placeholder="cth: 8891 atau 9928"
                                            className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Nama Institusi (Tampilan Portal BSI)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.bsi_institution_name}
                                            onChange={(e) => setFormData({ ...formData, bsi_institution_name: e.target.value })}
                                            placeholder="cth: 8891 - BI-SNAP-DEV"
                                            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Skenario Alur Transaksi SmartBilling / Host (Biller)
                                        </label>
                                        <select
                                            value={formData.bsi_transaction_mode}
                                            onChange={(e) => setFormData({ ...formData, bsi_transaction_mode: e.target.value })}
                                            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                        >
                                            <option value="NORMAL_QUEUE">Inquiry & Payment response dari Biller (Alur Normal)</option>
                                            <option value="PRE_GENERATED">Pre-generated VA (Biller Push ke BSI lebih dulu)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Format Tampilan Pada Field Keterangan Channel BSI
                                        </label>
                                        <select
                                            value={formData.bsi_desc_format}
                                            onChange={(e) => setFormData({ ...formData, bsi_desc_format: e.target.value })}
                                            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                        >
                                            <option value="STANDARD_DESCRIPTION">Format Keterangan Standard (cth: FAKULTAS PAI)</option>
                                            <option value="NIM_NAME">Format NIM - Nama Lengkap Mahasiswa</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section B: Host to Host (H2H) & Notifikasi HTTP */}
                            <div>
                                <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
                                    <Server className="w-4 h-4 text-emerald-600" />
                                    <span>2. Spesifikasi Host to Host (H2H) & Webhook Callback</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                    {/* H2H Block */}
                                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black text-slate-900">Host to Host (Inquiry Engine)</span>
                                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                                Service Code 73, 24, 25
                                            </span>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                                Routing Network
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.bsi_routing_zone}
                                                onChange={(e) => setFormData({ ...formData, bsi_routing_zone: e.target.value })}
                                                className="w-full text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                                Token Host to Host (Secret Key)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showSecretTokens ? 'text' : 'password'}
                                                    value={formData.bsi_h2h_token}
                                                    onChange={(e) => setFormData({ ...formData, bsi_h2h_token: e.target.value })}
                                                    className="w-full text-xs font-mono font-bold px-3 py-1.5 pr-8 rounded-lg border border-slate-300 bg-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowSecretTokens(!showSecretTokens)}
                                                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                                >
                                                    {showSecretTokens ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                                URL Host to Host Inquiry (Pasang di Portal BSI)
                                            </label>
                                            <div className="flex space-x-1.5">
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={stats.inquiry_url}
                                                    className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 select-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => copyText(stats.inquiry_url, 'inquiry_url')}
                                                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center shrink-0 cursor-pointer"
                                                >
                                                    {copiedField === 'inquiry_url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* HTTP Push Notification Block */}
                                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black text-slate-900">Notifikasi HTTP (Payment Callback)</span>
                                            <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px] font-bold">
                                                Service Code 73, 34
                                            </span>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                                Endpoint Server BSI Smart Billing
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.bsi_api_url}
                                                onChange={(e) => setFormData({ ...formData, bsi_api_url: e.target.value })}
                                                className="w-full text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                                Token Notifikasi HTTP (Secret Key)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showSecretTokens ? 'text' : 'password'}
                                                    value={formData.bsi_http_token}
                                                    onChange={(e) => setFormData({ ...formData, bsi_http_token: e.target.value })}
                                                    className="w-full text-xs font-mono font-bold px-3 py-1.5 pr-8 rounded-lg border border-slate-300 bg-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowSecretTokens(!showSecretTokens)}
                                                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                                >
                                                    {showSecretTokens ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                                URL Notifikasi Pembayaran (Pasang di Portal BSI)
                                            </label>
                                            <div className="flex space-x-1.5">
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={stats.payment_url}
                                                    className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 select-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => copyText(stats.payment_url, 'payment_url')}
                                                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center shrink-0 cursor-pointer"
                                                >
                                                    {copiedField === 'payment_url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section C: Otentikasi BI-SNAP Public Key */}
                            <div>
                                <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
                                    <Key className="w-4 h-4 text-emerald-600" />
                                    <span>3. Otentikasi (BI SNAP - Service Code 73 Public Key)</span>
                                </h3>

                                <div className="mt-3">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Public Key BSI (Format X.509 PEM)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={formData.bsi_public_key}
                                        onChange={(e) => setFormData({ ...formData, bsi_public_key: e.target.value })}
                                        className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-900 text-emerald-300"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Section D: Rekening Giro Penampung BSI */}
                            <div>
                                <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
                                    <Landmark className="w-4 h-4 text-emerald-600" />
                                    <span>4. Data Rekening Giro Penampung BSI STAI Al-Ittihad</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Nomor Rekening Giro BSI
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.bsi_account_number}
                                            onChange={(e) => setFormData({ ...formData, bsi_account_number: e.target.value })}
                                            placeholder="cth: 7188919928"
                                            className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Nama Pemilik Rekening Giro
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.bsi_account_name}
                                            onChange={(e) => setFormData({ ...formData, bsi_account_name: e.target.value })}
                                            placeholder="cth: STAI AL-ITTIHAD PENAMPUNG SPP"
                                            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Kantor Cabang BSI (KC Mitra)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.bsi_account_branch}
                                            onChange={(e) => setFormData({ ...formData, bsi_account_branch: e.target.value })}
                                            placeholder="cth: KC Sukabumi A Yani"
                                            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section E: Notifikasi & Rekonsiliasi */}
                            <div>
                                <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
                                    <Mail className="w-4 h-4 text-emerald-600" />
                                    <span>5. Notifikasi Otomatis & Email Rekonsiliasi</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                        <span className="text-xs font-bold text-slate-800">Notifikasi Email</span>
                                        <div className="flex items-center space-x-3 text-xs">
                                            <label className="flex items-center space-x-1.5 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.bsi_notify_customer_email}
                                                    onChange={(e) => setFormData({ ...formData, bsi_notify_customer_email: e.target.checked })}
                                                    className="rounded text-emerald-600 focus:ring-emerald-500"
                                                />
                                                <span>Notifikasi ke Pelanggan</span>
                                            </label>
                                            <label className="flex items-center space-x-1.5 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.bsi_notify_institution_email}
                                                    onChange={(e) => setFormData({ ...formData, bsi_notify_institution_email: e.target.checked })}
                                                    className="rounded text-emerald-600 focus:ring-emerald-500"
                                                />
                                                <span>Notifikasi ke Institusi</span>
                                            </label>
                                        </div>
                                        <input
                                            type="email"
                                            value={formData.bsi_institution_email}
                                            onChange={(e) => setFormData({ ...formData, bsi_institution_email: e.target.value })}
                                            placeholder="Email Tujuan Notifikasi Institusi"
                                            className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                                        />
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                        <span className="text-xs font-bold text-slate-800">Notifikasi WhatsApp</span>
                                        <div className="flex items-center space-x-3 text-xs">
                                            <label className="flex items-center space-x-1.5 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.bsi_notify_customer_wa}
                                                    onChange={(e) => setFormData({ ...formData, bsi_notify_customer_wa: e.target.checked })}
                                                    className="rounded text-emerald-600 focus:ring-emerald-500"
                                                />
                                                <span>Notifikasi ke Pelanggan</span>
                                            </label>
                                            <label className="flex items-center space-x-1.5 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.bsi_notify_institution_wa}
                                                    onChange={(e) => setFormData({ ...formData, bsi_notify_institution_wa: e.target.checked })}
                                                    className="rounded text-emerald-600 focus:ring-emerald-500"
                                                />
                                                <span>Notifikasi ke Institusi</span>
                                            </label>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.bsi_institution_wa}
                                            onChange={(e) => setFormData({ ...formData, bsi_institution_wa: e.target.value })}
                                            placeholder="Nomor WhatsApp Institusi (08xx)"
                                            className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Bar */}
                        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                            <span className="text-xs text-slate-500">
                                Pastikan URL Inquiry & Callback telah diselaraskan pada dashboard Smart Billing BSI.
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...config })}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                                >
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition shadow flex items-center space-x-1.5 cursor-pointer"
                                >
                                    {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{saving ? 'Menyimpan...' : 'Simpan Konfigurasi BSI'}</span>
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* ========================================================= */}
                {/* TAB 3: DAFTAR TRANSAKSI VIRTUAL ACCOUNT                   */}
                {/* ========================================================= */}
                {activeTab === 'transactions' && (
                    <div className="space-y-3.5">
                        {/* Filter Bar */}
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
                                        placeholder="Cari No. VA, NIM, Nama..."
                                        className="text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 w-64 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <select
                                    value={selectedStatus}
                                    onChange={(e) => {
                                        setSelectedStatus(e.target.value);
                                        handleFilterChange(e.target.value, undefined);
                                    }}
                                    className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold"
                                >
                                    <option value="ALL">Semua Status</option>
                                    <option value="PAID">LUNAS (Paid)</option>
                                    <option value="PENDING">PENDING (Menunggu)</option>
                                    <option value="EXPIRED">KADALUARSA (Expired)</option>
                                </select>

                                <select
                                    value={selectedFeeType}
                                    onChange={(e) => {
                                        setSelectedFeeType(e.target.value);
                                        handleFilterChange(undefined, e.target.value);
                                    }}
                                    className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold"
                                >
                                    <option value="ALL">Semua Jenis Tagihan</option>
                                    {feeTypes.map((ft, idx) => (
                                        <option key={idx} value={ft.code}>{ft.name}</option>
                                    ))}
                                </select>

                                <button
                                    onClick={() => handleFilterChange()}
                                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
                                >
                                    Terapkan
                                </button>
                            </div>

                            <a
                                href="/admin/bsi-gateway/export-reconciliation"
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 self-start md:self-auto shrink-0 shadow-xs"
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                <span>Ekspor CSV</span>
                            </a>
                        </div>

                        {/* Tabel Transaksi */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                                        <tr>
                                            <th className="px-4 py-3">Nomor VA BSI</th>
                                            <th className="px-4 py-3">Mahasiswa / Pendaftar</th>
                                            <th className="px-4 py-3">Jenis Tagihan</th>
                                            <th className="px-4 py-3">Nominal (Rp)</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">No. Jurnal / Ref BSI</th>
                                            <th className="px-4 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {transactions.data && transactions.data.length > 0 ? (
                                            transactions.data.map((tx) => (
                                                <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center space-x-1.5">
                                                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                                                {tx.va_number}
                                                            </span>
                                                            <button
                                                                onClick={() => copyText(tx.va_number, `va_${tx.id}`)}
                                                                title="Salin Nomor VA"
                                                                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                                            >
                                                                {copiedField === `va_${tx.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                                            </button>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                                            Inv: {tx.invoice_number}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="font-bold text-slate-900">{tx.customer_name}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono">{tx.customer_identifier}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                                                            {tx.fee_type_name}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono font-black text-slate-900">
                                                        {formatRp(tx.amount)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {tx.status === 'PAID' ? (
                                                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black inline-flex items-center space-x-1">
                                                                <CheckCircle className="w-3 h-3" />
                                                                <span>LUNAS</span>
                                                            </span>
                                                        ) : tx.status === 'PENDING' ? (
                                                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black inline-flex items-center space-x-1">
                                                                <Clock className="w-3 h-3" />
                                                                <span>PENDING</span>
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                                                                {tx.status}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="font-mono text-[11px] text-slate-600">
                                                            {tx.bsi_reference_no || '-'}
                                                        </span>
                                                        {tx.channel && (
                                                            <span className="text-[9px] text-slate-400 block">
                                                                Channel: {tx.channel}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end space-x-1">
                                                            <button
                                                                onClick={() => {
                                                                    setInquiryVa(tx.va_number);
                                                                    setActiveTab('simulator');
                                                                }}
                                                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition"
                                                            >
                                                                Inquiry
                                                            </button>
                                                            {tx.status === 'PENDING' && (
                                                                <button
                                                                    onClick={() => {
                                                                        setPaymentVa(tx.va_number);
                                                                        setActiveTab('simulator');
                                                                    }}
                                                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black transition shadow-xs"
                                                                >
                                                                    Bayar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">
                                                    Tidak ada transaksi yang cocok dengan kriteria pencarian.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {transactions.links && transactions.links.length > 3 && (
                                <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                    <span>Menampilkan data transaksi Virtual Account BSI</span>
                                    <div className="flex space-x-1">
                                        {transactions.links.map((link, idx) => (
                                            <button
                                                key={idx}
                                                disabled={!link.url || link.active}
                                                onClick={() => link.url && router.get(link.url)}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                                    link.active
                                                        ? 'bg-emerald-600 text-white'
                                                        : link.url
                                                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                        : 'text-slate-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* TAB 4: SIMULATOR SANDBOX INQUIRY & PAYMENT                */}
                {/* ========================================================= */}
                {activeTab === 'simulator' && (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 rounded-2xl text-white border border-indigo-900/40">
                            <div className="flex items-center space-x-2 text-xs font-black text-indigo-300 mb-1 uppercase tracking-wide">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>SANDBOX TEST ENGINE — BSI SMART BILLING & BI-SNAP</span>
                            </div>
                            <h3 className="text-base font-black text-white">
                                Simulator Uji Alur Host-to-Host (Inquiry & Push Callback)
                            </h3>
                            <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
                                Uji coba komunikasi real-time antara sistem core banking BSI dengan server SIAKAD tanpa perlu menunggu koneksi VPN atau integrasi production aktif.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Simulator A: INQUIRY (BSI -> Biller) */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                                            <Search className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900">1. Simulator Inquiry H2H (BSI ➔ SIAKAD)</h4>
                                            <p className="text-[10px] text-slate-400">Mensimulasikan pengecekan data saat VA diinput di ATM/Mobile</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px] font-bold font-mono">
                                        Code 24
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Nomor Virtual Account BSI
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={inquiryVa}
                                            onChange={(e) => setInquiryVa(e.target.value)}
                                            placeholder="cth: 99280221010042 atau 992801260001"
                                            className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRunInquiry}
                                            disabled={inquiryLoading}
                                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black transition shadow flex items-center space-x-1 shrink-0 cursor-pointer"
                                        >
                                            {inquiryLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
                                            <span>Inquiry</span>
                                        </button>
                                    </div>
                                </div>

                                {inquiryResult && (
                                    <div className="mt-3 p-3 rounded-xl bg-slate-900 text-emerald-300 text-xs font-mono border border-slate-800 space-y-1.5">
                                        <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                                            <span>RESPONSE JSON DARI SIAKAD KE BSI</span>
                                            <span className={inquiryResult.success ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                                {inquiryResult.response_code || '0000'}
                                            </span>
                                        </div>
                                        <pre className="text-[10px] overflow-x-auto max-h-52 leading-relaxed">
                                            {JSON.stringify(inquiryResult, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>

                            {/* Simulator B: PAYMENT CALLBACK (BSI -> Biller) */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900">2. Simulator Payment Callback (BSI ➔ SIAKAD)</h4>
                                            <p className="text-[10px] text-slate-400">Mensimulasikan debet rekening sukses & pelunasan otomatis</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                                        Code 25
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Nomor Virtual Account BSI
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentVa}
                                        onChange={(e) => setPaymentVa(e.target.value)}
                                        placeholder="cth: 99280221010042"
                                        className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Saluran Pembayaran (Channel BSI)
                                    </label>
                                    <div className="flex space-x-2">
                                        <select
                                            value={paymentChannel}
                                            onChange={(e) => setPaymentChannel(e.target.value)}
                                            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white"
                                        >
                                            <option value="BSI_MOBILE">BSI Mobile Banking</option>
                                            <option value="ATM_BSI">ATM Bank BSI</option>
                                            <option value="TELLER">Teller Kantor Cabang BSI</option>
                                            <option value="INTERBANK_PRIMA">Transfer Antar Bank (PRIMA / Bersama)</option>
                                        </select>

                                        <button
                                            type="button"
                                            onClick={handleRunPayment}
                                            disabled={paymentLoading}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition shadow flex items-center space-x-1 shrink-0 cursor-pointer"
                                        >
                                            {paymentLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                            <span>Bayar 1-Klik</span>
                                        </button>
                                    </div>
                                </div>

                                {paymentResult && (
                                    <div className="mt-3 p-3 rounded-xl bg-slate-900 text-emerald-300 text-xs font-mono border border-slate-800 space-y-1.5">
                                        <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                                            <span>CALLBACK STATUS NOTIFICATION</span>
                                            <span className={paymentResult.success ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                                {paymentResult.success ? '2002500 SUCCESS' : 'FAILED'}
                                            </span>
                                        </div>
                                        <pre className="text-[10px] overflow-x-auto max-h-52 leading-relaxed">
                                            {JSON.stringify(paymentResult, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* TAB 5: RIWAYAT CALLBACK & AUDIT LOG                       */}
                {/* ========================================================= */}
                {activeTab === 'history' && (
                    <div className="space-y-3.5">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    <span>Rekam Jejak Transaksi & Audit Log BSI Host-to-Host</span>
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Catatan timestamp lengkap setiap kali terjadi inquiry, settlement, atau perubahan konfigurasi.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                                    <tr>
                                        <th className="px-4 py-3">Waktu Kejadian</th>
                                        <th className="px-4 py-3">Aksi / Event</th>
                                        <th className="px-4 py-3">IP Address</th>
                                        <th className="px-4 py-3">Target Entitas</th>
                                        <th className="px-4 py-3">Detail Payload</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                                    {recentAuditLogs && recentAuditLogs.length > 0 ? (
                                        recentAuditLogs.map((log) => {
                                            let detailParsed = {};
                                            try {
                                                detailParsed = typeof log.details === 'string' ? JSON.parse(log.details) : (log.details || {});
                                            } catch {
                                                detailParsed = { text: log.details };
                                            }
                                            return (
                                                <tr key={log.id} className="hover:bg-slate-50/80">
                                                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                                                        {log.created_at}
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-200 text-[10px]">
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-slate-500">
                                                        {log.ip_address || '-'}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-slate-700 font-semibold">
                                                        {log.target_entity || '-'} ({log.target_id || '-'})
                                                    </td>
                                                    <td className="px-4 py-2.5 text-slate-600 truncate max-w-xs">
                                                        {JSON.stringify(detailParsed)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">
                                                Belum ada log audit callback tercatat.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* TAB 6: REKENING PENAMPUNG & REKONSILIASI GIRO BSI           */}
                {/* ========================================================= */}
                {activeTab === 'reconciliation' && (
                    <div className="space-y-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-3 gap-3">
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                                        <Building2 className="w-4 h-4 text-emerald-600" />
                                        <span>Rekening Giro Penampung Institusi (Bank Syariah Indonesia)</span>
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Seluruh dana pembayaran SPP/UKT & PMB yang disetor melalui VA otomatis disalurkan ke rekening resmi ini.
                                    </p>
                                </div>

                                <a
                                    href="/admin/bsi-gateway/export-reconciliation"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow flex items-center space-x-1.5 shrink-0"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5" />
                                    <span>Unduh Berkas Rekonsiliasi (CSV)</span>
                                </a>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Nomor Rekening Giro</span>
                                    <span className="text-lg font-black font-mono text-slate-900">
                                        {config.bsi_account_number || '7188919928'}
                                    </span>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Nama Pemilik Rekening</span>
                                    <span className="text-sm font-black text-slate-900">
                                        {config.bsi_account_name || 'STAI AL-ITTIHAD CIANJUR PENAMPUNG SPP'}
                                    </span>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Kantor Cabang Pengelola</span>
                                    <span className="text-sm font-black text-slate-900">
                                        {config.bsi_account_branch || 'KC Sukabumi A Yani Yudy'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                                <p className="font-bold flex items-center space-x-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Layanan Settlement Otomatis H+0 Bank Syariah Indonesia</span>
                                </p>
                                <p className="text-[11px] text-emerald-800 leading-relaxed">
                                    Dana pembayaran mahasiswa yang masuk lewat BSI Mobile, ATM BSI, atau Kliring Antar-Bank (PRIMA/Bersama/BI-FAST) masuk secara real-time ke rekening giro penampung dengan referensi nomor jurnal BSI terikat ke masing-masing invoice mahasiswa.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
