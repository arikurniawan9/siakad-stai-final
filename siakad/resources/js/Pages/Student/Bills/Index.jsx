import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    CreditCard, Landmark, CheckCircle2, AlertCircle, 
    Copy, Check, ArrowUpRight, Clock, ShieldCheck, 
    Download, RefreshCw, FileText, Zap, Printer, X, Receipt
} from 'lucide-react';

export default function BillsIndex({ 
    invoices = [], 
    transactions = [], 
    vaNumber = '', 
    studentInfo = {},
    summary = {} 
}) {
    const [copied, setCopied] = useState(false);
    const [copiedVaIndex, setCopiedVaIndex] = useState(null);
    const [simulatingId, setSimulatingId] = useState(null);
    const [receiptModal, setReceiptModal] = useState(null);

    const copyVa = (textToCopy = vaNumber, index = null) => {
        navigator.clipboard.writeText(textToCopy);
        if (index !== null) {
            setCopiedVaIndex(index);
            setTimeout(() => setCopiedVaIndex(null), 2000);
        } else {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleSimulatePayment = (invoiceId, invoiceNumber) => {
        if (confirm(`Jalankan simulasi pelunasan tagihan ${invoiceNumber || ''} melalui BSI Virtual Account?`)) {
            setSimulatingId(invoiceId);
            router.post('/student/bills/simulate-pay', { invoice_id: invoiceId }, {
                preserveScroll: true,
                onFinish: () => setSimulatingId(null)
            });
        }
    };

    const formatRp = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val || 0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <AppLayout title="Tagihan Keuangan & VA BSI">
            <Head title="Tagihan Keuangan & VA BSI" />

            <div className="space-y-6 max-w-6xl mx-auto">
                {/* 1. Header Banner */}
                <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-emerald-800/40">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black mb-1">
                                <Landmark className="w-3 h-3 text-emerald-400" />
                                <span>PORTAL KEUANGAN & PEMBAYARAN MAHASISWA</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                                Tagihan Kuliah & BSI Virtual Account
                            </h2>
                            <p className="text-xs text-emerald-200/80 mt-1 max-w-xl">
                                Seluruh pembayaran tagihan SPP/UKT perkuliahan STAI Al-Ittihad Cianjur terintegrasi Host-to-Host (H2H) secara otomatis dengan Bank Syariah Indonesia (BSI).
                            </p>
                        </div>

                        {/* Financial Lock Guard Status */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10 text-left shrink-0">
                            <p className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider">Status Akses Akademik</p>
                            <div className="flex items-center space-x-2 mt-1">
                                {summary.is_financial_locked ? (
                                    <>
                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
                                        <span className="text-xs font-black text-rose-300">Terkunci (Ada Tunggakan)</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                                        <span className="text-xs font-black text-emerald-300">Terbuka (Bebas Keuangan)</span>
                                    </>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-300 mt-1">
                                {summary.is_financial_locked ? 'Harap lunasi tagihan untuk membuka pengisian KRS' : 'Dapat mengisi KRS & mengikuti perkuliahan/ujian'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. BSI Smart Billing VA Card & KPI Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* BSI VA Card */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-emerald-700/50 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                        <div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded font-black text-[9px] uppercase tracking-wider">
                                        BSI OPEN API H2H
                                    </span>
                                    <span className="text-xs text-emerald-200 font-semibold">Bank Syariah Indonesia</span>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-300 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                                    Prefix Biller: 992802
                                </span>
                            </div>

                            <div className="mt-4">
                                <p className="text-[11px] text-emerald-300 uppercase tracking-widest font-semibold">Nomor Virtual Account Utama (SPP/UKT)</p>
                                <div className="flex items-center space-x-3 mt-1.5">
                                    <span className="text-2xl sm:text-3xl font-mono font-black text-white tracking-widest">
                                        {vaNumber}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => copyVa(vaNumber)}
                                        className="px-3 py-1.5 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                                        title="Salin Nomor VA"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5 text-slate-200" />}
                                        <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-200">
                            <span>Bisa dibayar melalui BSI Mobile, BSI Net, ATM BSI, & Seluruh Bank (BI-FAST / Transfer Online)</span>
                            <span className="text-white font-bold flex items-center space-x-1">
                                <span>Otomatis Terverifikasi Real-time</span>
                                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                            </span>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3.5 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
                                <span>Rekapitulasi Tagihan</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${summary.remaining > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                    {summary.status || (summary.remaining > 0 ? 'BELUM LUNAS' : 'LUNAS')}
                                </span>
                            </h3>
                            <div className="space-y-2.5 mt-3 text-xs">
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Total Tagihan:</span>
                                    <span className="font-bold text-slate-900">{formatRp(summary.total_billed)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Sudah Dibayar:</span>
                                    <span className="font-bold text-emerald-600">{formatRp(summary.total_paid)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 text-xs">
                                    <span className="font-bold text-slate-700">Sisa Tagihan:</span>
                                    <span className={`font-black text-base ${summary.remaining > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {formatRp(summary.remaining)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                            <p className="font-bold text-slate-800">Layanan Informasi Keuangan</p>
                            <p>Biro Administrasi Keuangan STAI Al-Ittihad Cianjur (Senin - Jumat, 08.00 - 16.00 WIB).</p>
                        </div>
                    </div>
                </div>

                {/* 3. Invoices Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                                    Daftar Rincian Tagihan Mahasiswa
                                </h3>
                                <p className="text-[11px] text-slate-500">Rincian invoice biaya perkuliahan resmi</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">No. Invoice & VA</th>
                                    <th className="px-4 py-3">Jenis Biaya</th>
                                    <th className="px-4 py-3">Periode Semester</th>
                                    <th className="px-4 py-3 text-right">Nominal Tagihan</th>
                                    <th className="px-4 py-3 text-right">Jumlah Dibayar</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-center">Aksi / Simulasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                {invoices.length > 0 ? (
                                    invoices.map((inv, idx) => {
                                        const isPaid = inv.is_paid || ['LUNAS', 'PAID', 'SUCCESS'].includes((inv.status || '').toUpperCase());
                                        const invoiceVa = inv.va_number || vaNumber;

                                        return (
                                            <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                                                <td className="px-4 py-3.5">
                                                    <p className="font-mono font-bold text-indigo-700">{inv.invoice_number}</p>
                                                    <div className="flex items-center space-x-1.5 mt-0.5">
                                                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                            VA: {invoiceVa}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyVa(invoiceVa, idx)}
                                                            className="text-slate-400 hover:text-emerald-600 transition"
                                                            title="Salin VA"
                                                        >
                                                            {copiedVaIndex === idx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <p className="font-bold text-slate-900">{inv.fee_name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">Kode: {inv.fee_code}</p>
                                                </td>
                                                <td className="px-4 py-3.5 text-slate-600">
                                                    {inv.period_name || 'Semester Berjalan'}
                                                </td>
                                                <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                                                    {formatRp(inv.final_amount ?? inv.amount)}
                                                </td>
                                                <td className="px-4 py-3.5 text-right font-bold text-emerald-600">
                                                    {formatRp(inv.paid_amount)}
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    {isPaid ? (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                            <span>LUNAS</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                                                            <Clock className="w-3 h-3 text-amber-600" />
                                                            <span>BELUM LUNAS</span>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    {isPaid ? (
                                                        <div className="flex items-center justify-center space-x-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setReceiptModal(inv)}
                                                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[10px] transition inline-flex items-center space-x-1 cursor-pointer"
                                                                title="Lihat Kuitansi Pembayaran"
                                                            >
                                                                <Receipt className="w-3 h-3 text-emerald-600" />
                                                                <span>Kuitansi</span>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSimulatePayment(inv.id, inv.invoice_number)}
                                                            disabled={simulatingId === inv.id}
                                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition shadow-xs flex items-center space-x-1 mx-auto cursor-pointer disabled:opacity-50"
                                                        >
                                                            <Zap className="w-3 h-3 text-amber-300" />
                                                            <span>{simulatingId === inv.id ? 'Memproses...' : 'Simulasi Bayar 1-Klik'}</span>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">
                                            Tidak ada tagihan yang terdaftar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. Payment History (va_bsi_transactions) */}
                {transactions && transactions.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center space-x-2">
                                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                                        Riwayat Transaksi Host-to-Host BSI
                                    </h3>
                                    <p className="text-[11px] text-slate-500">Log mutasi pembayaran yang terhubung langsung dengan sistem Bank Syariah Indonesia</p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-500 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">Waktu Transaksi</th>
                                        <th className="px-4 py-3">No. Jurnal / Reff BSI</th>
                                        <th className="px-4 py-3">Keterangan Tagihan</th>
                                        <th className="px-4 py-3">Kanal Pembayaran</th>
                                        <th className="px-4 py-3 text-right">Nominal</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                                            <td className="px-4 py-3.5 text-slate-600">
                                                {formatDate(tx.payment_datetime || tx.created_at)}
                                            </td>
                                            <td className="px-4 py-3.5 font-mono text-slate-800 font-bold">
                                                {tx.bsi_reference_no || '-'}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <p className="font-bold text-slate-900">{tx.fee_name || 'Biaya Kuliah'}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">Inv: {tx.invoice_number}</p>
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-600">
                                                <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-700">
                                                    {tx.channel || 'BSI_MOBILE'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-bold text-emerald-600">
                                                {formatRp(tx.amount)}
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                    <span>BERHASIL</span>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 5. Payment Guide Tabs */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Panduan Tata Cara Pembayaran Virtual Account BSI (9928)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                            <p className="font-bold text-slate-900 text-[11px]">1. BSI Mobile (Aplikasi)</p>
                            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                                <li>Buka aplikasi BSI Mobile, pilih menu <strong>Bayar</strong>.</li>
                                <li>Pilih kategori <strong>Akademik / Institusi</strong>.</li>
                                <li>Pilih kode institusi <strong>9928 - STAI AL-ITTIHAD</strong>.</li>
                                <li>Masukkan Nomor VA: <code className="bg-slate-200 px-1 rounded font-bold">{vaNumber}</code>.</li>
                                <li>Periksa nama & rincian nominal, masukkan PIN.</li>
                            </ol>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                            <p className="font-bold text-slate-900 text-[11px]">2. ATM Bank Syariah Indonesia</p>
                            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                                <li>Masukkan Kartu ATM & PIN BSI.</li>
                                <li>Pilih menu <strong>Pembayaran / Pembelian</strong>.</li>
                                <li>Pilih <strong>Akademik</strong>.</li>
                                <li>Masukkan nomor VA: <code className="bg-slate-200 px-1 rounded font-bold">{vaNumber}</code>.</li>
                                <li>Konfirmasi transaksi dan simpan struk tanda terima.</li>
                            </ol>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                            <p className="font-bold text-slate-900 text-[11px]">3. Transfer Bank Lain (BCA / Mandiri / BRI / BNI)</p>
                            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                                <li>Pilih menu <strong>Transfer Antar Bank</strong>.</li>
                                <li>Pilih bank tujuan: <strong>Bank Syariah Indonesia (Kode: 451)</strong>.</li>
                                <li>Masukkan rekening tujuan: <code className="bg-slate-200 px-1 rounded font-bold">{vaNumber}</code>.</li>
                                <li>Masukkan nominal tagihan persis sesuai rincian.</li>
                                <li>Sistem memverifikasi pelunasan secara real-time.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Kuitansi Pembayaran Resmi */}
            {receiptModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 print:p-0 print:bg-white">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none">
                        {/* Header Modal - Hidden on print */}
                        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
                            <div className="flex items-center space-x-2">
                                <Receipt className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-bold uppercase tracking-wider">Bukti Pembayaran / Kuitansi Sah</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setReceiptModal(null)}
                                className="text-slate-400 hover:text-white transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Konten Kuitansi */}
                        <div className="p-6 space-y-5 text-slate-800">
                            {/* Kop STAI */}
                            <div className="text-center border-b border-slate-300 pb-4">
                                <h4 className="text-xs font-black tracking-wider uppercase text-slate-900">
                                    SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR
                                </h4>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                    Jl. Raya Bandung No. 01 Bojong, Cianjur - Jawa Barat | www.stai-alittihad.ac.id
                                </p>
                                <div className="mt-2 inline-block px-3 py-0.5 bg-slate-100 rounded border border-slate-300 text-[11px] font-black tracking-widest uppercase text-slate-800">
                                    TANDA BUKTI PEMBAYARAN KEUANGAN
                                </div>
                            </div>

                            {/* Data Mahasiswa & Tagihan */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-[10px] text-slate-500 block">Nama Mahasiswa:</span>
                                    <span className="font-bold text-slate-900">{studentInfo.name || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 block">NIM:</span>
                                    <span className="font-mono font-bold text-slate-900">{studentInfo.nim || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 block">Program Studi:</span>
                                    <span className="font-medium text-slate-800">{studentInfo.study_program || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 block">No. Invoice:</span>
                                    <span className="font-mono font-bold text-indigo-700">{receiptModal.invoice_number}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 block">Jenis Pembayaran:</span>
                                    <span className="font-bold text-slate-800">{receiptModal.fee_name}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 block">Periode Akademik:</span>
                                    <span className="font-medium text-slate-800">{receiptModal.period_name}</span>
                                </div>
                            </div>

                            {/* Kotak Nominal & Stamp */}
                            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl relative overflow-hidden flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold">Total Pembayaran</p>
                                    <p className="text-2xl font-black text-emerald-700 mt-0.5">
                                        {formatRp(receiptModal.final_amount ?? receiptModal.amount)}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        Ref Bank: <span className="font-mono font-bold text-slate-700">{receiptModal.bsi_reference_no || 'BSI-VERIFIED'}</span>
                                    </p>
                                </div>

                                <div className="border-2 border-emerald-600 rounded-lg px-2.5 py-1 text-center rotate-[-8deg] bg-white/80 shadow-xs">
                                    <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest block">LUNAS</span>
                                    <span className="text-[8px] text-emerald-600 block">BSI H2H SYSTEM</span>
                                </div>
                            </div>

                            {/* Footer & Tanggal */}
                            <div className="flex justify-between items-end pt-2 text-[10px] text-slate-500 border-t border-slate-100">
                                <div>
                                    <p>Waktu Bayar: {formatDate(receiptModal.paid_at || receiptModal.payment_datetime || new Date())}</p>
                                    <p>Metode: Virtual Account Bank Syariah Indonesia</p>
                                </div>
                                <div className="text-right">
                                    <p className="italic">Kuitansi ini sah dicetak otomatis dari SIAKAD STAI Al-Ittihad</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action - Hidden on print */}
                        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2 print:hidden">
                            <button
                                type="button"
                                onClick={() => setReceiptModal(null)}
                                className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                                Tutup
                            </button>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Cetak Kuitansi</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

