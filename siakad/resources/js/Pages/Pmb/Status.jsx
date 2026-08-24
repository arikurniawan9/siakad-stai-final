import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Search, CheckCircle2, Clock, AlertTriangle, 
    CreditCard, Copy, Check, ArrowRight, ShieldCheck, 
    FileText, User, Sparkles
} from 'lucide-react';

export default function PmbStatus({ applicant, program, invoice, vaTransaction, searchRegNumber }) {
    const [regInput, setRegInput] = useState(searchRegNumber || '');
    const [copied, setCopied] = useState(false);
    const [simulating, setSimulating] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/pmb/status', { reg_number: regInput });
    };

    const handleCopyVA = () => {
        if (vaTransaction?.va_number) {
            navigator.clipboard.writeText(vaTransaction.va_number);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handleSimulatePayment = async () => {
        if (!vaTransaction?.va_number) return;
        setSimulating(true);
        try {
            const res = await fetch('/api/v1/bsi/va/simulate-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ va_number: vaTransaction.va_number }),
            });
            const result = await res.json();
            if (result.success) {
                alert('✅ Simulasi Host-to-Host BSI Berhasil! Pembayaran telah diverifikasi secara realtime.');
                router.reload();
            } else {
                alert('Gagal simulasi: ' + result.message);
            }
        } catch (err) {
            console.error(err);
            alert('Terjadi kesalahan jaringan.');
        } finally {
            setSimulating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-800 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <Head title="Cek Status Pendaftaran PMB — STAI Al-Ittihad" />

            <div className="max-w-2xl mx-auto z-10 relative space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-2xl font-black text-white tracking-tight">STATUS PENDAFTARAN & BILLING VA BSI</h1>
                    <p className="text-xs text-slate-300 mt-1">Penerimaan Mahasiswa Baru STAI Al-Ittihad Cianjur</p>
                </div>

                {/* Search Box */}
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
                    <form onSubmit={handleSearch} className="flex items-center space-x-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <input
                                type="text"
                                value={regInput}
                                onChange={(e) => setRegInput(e.target.value.toUpperCase())}
                                placeholder="Masukkan Nomor Pendaftaran (e.g. PMB-2026-0001)"
                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {/* Result Card */}
                {applicant ? (
                    <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-100 space-y-6">
                        {/* Status Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                            <div>
                                <span className="font-mono font-bold text-xs text-slate-400">{applicant.registration_number}</span>
                                <h2 className="text-lg font-black text-slate-900">{applicant.full_name}</h2>
                                <p className="text-xs text-slate-500">Prodi: <span className="font-bold text-emerald-700">{program?.name} ({program?.degree})</span></p>
                            </div>
                            <div>
                                {applicant.status === 'MENUNGGU_PEMBAYARAN' && (
                                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold flex items-center space-x-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Menunggu Pembayaran</span>
                                    </span>
                                )}
                                {applicant.status === 'TERVERIFIKASI_BAYAR' && (
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center space-x-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Lunas Terverifikasi BSI</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* VIRTUAL ACCOUNT CARD (BANK SYARIAH INDONESIA) */}
                        {vaTransaction && (
                            <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-2xl p-5 shadow-lg border border-emerald-800/40 relative overflow-hidden">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Bank Syariah Indonesia (BSI) Virtual Account</p>
                                        <p className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-emerald-300 mt-1">
                                            {vaTransaction.va_number}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleCopyVA}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                        <span className="hidden sm:inline">{copied ? 'Tersalin!' : 'Salin VA'}</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/10 text-xs">
                                    <div>
                                        <p className="text-slate-400 text-[10px]">Nominal Tagihan:</p>
                                        <p className="text-base font-black text-white">Rp {Number(invoice?.final_amount || 250000).toLocaleString('id-ID')},-</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-400 text-[10px]">Status Tagihan:</p>
                                        <p className={`text-xs font-extrabold ${invoice?.status === 'LUNAS' ? 'text-emerald-400' : 'text-amber-300'}`}>
                                            {invoice?.status === 'LUNAS' ? 'LUNAS (OTOMATIS)' : 'BELUM DIBAYAR'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Petunjuk Pembayaran BSI */}
                        {invoice?.status !== 'LUNAS' ? (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                                <p className="font-bold text-slate-800">Cara Pembayaran via BSI Mobile / ATM BSI:</p>
                                <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
                                    <li>Buka aplikasi <strong>BSI Mobile</strong> atau kunjungi ATM BSI terdekat.</li>
                                    <li>Pilih menu <strong>Bayar / Pembayaran &gt; Akademik / Institusi</strong>.</li>
                                    <li>Masukkan Kode Institusi: <strong className="text-emerald-700 font-mono font-bold">9928 (STAI Al-Ittihad)</strong> atau langsung nomor VA di atas.</li>
                                    <li>Periksa nama pendaftar dan nominal <strong>Rp 250.000,-</strong> lalu konfirmasi PIN.</li>
                                    <li>Status pendaftaran Anda akan langsung otomatis terverifikasi tanpa perlu konfirmasi manual.</li>
                                </ol>

                                {/* DEVELOPER / UAT SANDBOX BUTTON */}
                                <div className="pt-3 border-t border-slate-200">
                                    <button
                                        type="button"
                                        disabled={simulating}
                                        onClick={handleSimulatePayment}
                                        className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-xs transition shadow flex items-center justify-center space-x-1.5"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        <span>{simulating ? 'Mengirim Webhook BSI...' : '⚡ Uji Coba Simulasi Pelunasan BSI (Sandbox UAT)'}</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-emerald-900 text-xs space-y-2">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <h4 className="font-black text-sm text-emerald-950">Pembayaran Berhasil Diverifikasi</h4>
                                </div>
                                <p className="text-[11px] text-emerald-800">
                                    Selamat! Pembayaran uang pendaftaran telah diterima sistem secara otomatis via Host-to-Host Bank Syariah Indonesia (BSI).
                                </p>
                            </div>
                        )}
                    </div>
                ) : searchRegNumber ? (
                    <div className="bg-white p-8 rounded-2xl shadow-xl text-center space-y-3">
                        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                        <h3 className="text-base font-black text-slate-900">Data Pendaftaran Tidak Ditemukan</h3>
                        <p className="text-xs text-slate-500">Nomor registrasi <strong>{searchRegNumber}</strong> tidak terdaftar di sistem kami.</p>
                    </div>
                ) : null}

                {/* Back to Form */}
                <div className="text-center">
                    <Link href="/pmb" className="text-xs font-bold text-emerald-400 hover:underline">
                        ← Kembali ke Halaman Formulir PMB
                    </Link>
                </div>
            </div>
        </div>
    );
}
