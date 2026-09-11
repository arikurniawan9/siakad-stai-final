import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    CreditCard, Landmark, CheckCircle2, AlertCircle, 
    Copy, Check, ArrowUpRight, Clock, ShieldCheck, 
    Download, RefreshCw, FileText, Zap
} from 'lucide-react';

export default function BillsIndex({ 
    invoices = [], 
    transactions = [], 
    vaNumber = '', 
    summary = {} 
}) {
    const [copied, setCopied] = useState(false);
    const [simulatingId, setSimulatingId] = useState(null);

    const copyVa = () => {
        navigator.clipboard.writeText(vaNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSimulatePayment = (invoiceId) => {
        if (confirm('Jalankan simulasi pelunasan tagihan melalui BSI Virtual Account?')) {
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

    return (
        <AppLayout title="Tagihan Keuangan & VA BSI">
            <Head title="Tagihan Keuangan & VA BSI" />

            <div className="space-y-5 max-w-6xl mx-auto">
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
                                Seluruh pembayaran tagihan SPP, UKT, dan registrasi perkuliahan STAI Al-Ittihad Cianjur terintegrasi Host-to-Host (H2H) secara otomatis dengan Bank Syariah Indonesia (BSI).
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
                                {summary.is_financial_locked ? 'Harap lunasi tagihan untuk membuka KRS' : 'Dapat mengisi KRS & mengikuti ujian'}
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
                                        BSI OPEN API
                                    </span>
                                    <span className="text-xs text-emerald-200 font-semibold">Bank Syariah Indonesia</span>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-300 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                                    Prefix Biller: 992802
                                </span>
                            </div>

                            <div className="mt-4">
                                <p className="text-[11px] text-emerald-300 uppercase tracking-widest font-semibold">Nomor Virtual Account Mahasiswa</p>
                                <div className="flex items-center space-x-3 mt-1.5">
                                    <span className="text-2xl sm:text-3xl font-mono font-black text-white tracking-widest">
                                        {vaNumber}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={copyVa}
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
                            <span>Bisa dibayar dari BSI Mobile, BSI Net, ATM BSI, & Seluruh Bank (BI-FAST / Transfer Online)</span>
                            <span className="text-white font-bold">Otomatis Lunas Real-time ⚡</span>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3.5 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                                Rekapitulasi Tagihan
                            </h3>
                            <div className="space-y-2 mt-3 text-xs">
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Total Tagihan:</span>
                                    <span className="font-bold text-slate-900">{formatRp(summary.total_billed)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Sudah Dibayar:</span>
                                    <span className="font-bold text-emerald-600">{formatRp(summary.total_paid)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                                    <span className="font-bold text-slate-700">Sisa Tagihan:</span>
                                    <span className={`font-black text-sm ${summary.remaining > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {formatRp(summary.remaining)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                            <p className="font-bold text-slate-800">Butuh Bantuan Pembayaran?</p>
                            <p>Hubungi Biro Keuangan STAI Al-Ittihad di jam operasional (08.00 - 16.00 WIB).</p>
                        </div>
                    </div>
                </div>

                {/* 3. Invoices Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                                <FileText className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                                Daftar Rincian Tagihan Mahasiswa
                            </h3>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">No. Invoice</th>
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
                                    invoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                                            <td className="px-4 py-3.5 font-mono font-bold text-indigo-700">
                                                {inv.invoice_number}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <p className="font-bold text-slate-900">{inv.fee_name}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">Kode: {inv.fee_code}</p>
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-600">
                                                {inv.period_name || 'Semester Ganjil'}
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                                                {formatRp(inv.amount)}
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-bold text-emerald-600">
                                                {formatRp(inv.paid_amount)}
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                {inv.status === 'PAID' ? (
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
                                                {inv.status === 'PAID' ? (
                                                    <span className="text-[11px] text-slate-400 font-semibold italic">Terverifikasi BSI</span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSimulatePayment(inv.id)}
                                                        disabled={simulatingId === inv.id}
                                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition shadow-xs flex items-center space-x-1 mx-auto cursor-pointer disabled:opacity-50"
                                                    >
                                                        <Zap className="w-3 h-3 text-amber-300" />
                                                        <span>{simulatingId === inv.id ? 'Memproses...' : 'Simulasi Bayar 1-Klik'}</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
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

                {/* 4. Payment Guide Tabs */}
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
                                <li>Masukkan Nomor VA: <code className="bg-slate-200 px-1 rounded">{vaNumber}</code>.</li>
                                <li>Periksa nama & rincian nominal, masukkan PIN.</li>
                            </ol>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                            <p className="font-bold text-slate-900 text-[11px]">2. ATM Bank Syariah Indonesia</p>
                            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                                <li>Masukkan Kartu ATM & PIN BSI.</li>
                                <li>Pilih menu <strong>Pembayaran / Pembelian</strong>.</li>
                                <li>Pilih <strong>Akademik</strong>.</li>
                                <li>Masukkan nomor VA: <code className="bg-slate-200 px-1 rounded">{vaNumber}</code>.</li>
                                <li>Konfirmasi transaksi dan simpan struk tanda terima.</li>
                            </ol>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                            <p className="font-bold text-slate-900 text-[11px]">3. Transfer Bank Lain (BCA / Mandiri / BRI)</p>
                            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                                <li>Pilih menu <strong>Transfer Antar Bank</strong>.</li>
                                <li>Pilih bank tujuan: <strong>Bank Syariah Indonesia (Kode: 451)</strong>.</li>
                                <li>Masukkan rekening tujuan: <code className="bg-slate-200 px-1 rounded">{vaNumber}</code>.</li>
                                <li>Masukkan nominal tagihan persis sesuai rincian.</li>
                                <li>Sistem memverifikasi secara otomatis instan.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
