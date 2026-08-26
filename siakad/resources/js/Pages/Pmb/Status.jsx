import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Search, CheckCircle2, Clock, AlertTriangle, 
    CreditCard, Copy, Check, ArrowRight, ShieldCheck, 
    FileText, User, Sparkles, QrCode, Building2, Radio, 
    Download, Printer, RefreshCw
} from 'lucide-react';

export default function PmbStatus({ applicant, program, invoice, vaTransaction, searchRegNumber }) {
    const [regInput, setRegInput] = useState(searchRegNumber || '');
    const [copied, setCopied] = useState(false);
    const [simulating, setSimulating] = useState(false);
    const [selectedGateway, setSelectedGateway] = useState('BSI_H2H'); // BSI_H2H | WINPAY
    const [sandboxChannel, setSandboxChannel] = useState('BSI_H2H'); // BSI_H2H | VA_MANDIRI | VA_BCA | VA_BRI | QRIS

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/pmb/status', { reg_number: regInput });
    };

    const handleCopyVA = (textToCopy) => {
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    // Eksekusi Simulasi Pembayaran Sandbox
    const handleSimulatePayment = async () => {
        setSimulating(true);
        try {
            if (sandboxChannel === 'BSI_H2H') {
                if (!vaTransaction?.va_number) {
                    alert('Nomor VA BSI belum tersedia.');
                    return;
                }
                const res = await fetch('/api/v1/bsi/va/simulate-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ va_number: vaTransaction.va_number }),
                });
                const result = await res.json();
                if (result.success) {
                    alert('✅ Simulasi Host-to-Host BSI Berhasil! Pembayaran telah diverifikasi secara realtime.');
                    router.reload();
                } else {
                    alert('Gagal simulasi: ' + result.message);
                }
            } else {
                // Simulasi via Winpay Payment Gateway
                const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                const res = await fetch('/admin/winpay/simulate-payment', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': token || ''
                    },
                    body: JSON.stringify({ 
                        channel: sandboxChannel,
                        invoice_id: invoice?.id 
                    }),
                });
                const result = await res.json();
                if (result.success) {
                    alert(`✅ Simulasi Pembayaran Winpay (${sandboxChannel}) Berhasil! Tagihan PMB Lunas.`);
                    router.reload();
                } else {
                    alert('Gagal simulasi Winpay: ' + result.message);
                }
            }
        } catch (err) {
            console.error(err);
            alert('Terjadi kesalahan saat memproses simulasi pembayaran: ' + err.message);
        } finally {
            setSimulating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-800 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <Head title="Cek Status Pendaftaran PMB & Billing VA — STAI Al-Ittihad" />

            {/* Background Blurs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-2xl mx-auto z-10 relative space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold mb-3">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>Sistem Billing & Verifikasi VA PMB 2026/2027</span>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight uppercase">
                        Status Pendaftaran & Billing Pembayaran
                    </h1>
                    <p className="text-xs text-slate-300 mt-1">Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur</p>
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
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {/* Result Card */}
                {applicant ? (
                    <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 space-y-6">
                        {/* Status Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                            <div>
                                <span className="font-mono font-bold text-xs text-slate-400">{applicant.registration_number}</span>
                                <h2 className="text-lg font-black text-slate-900">{applicant.full_name}</h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Pilihan Prodi: <span className="font-bold text-emerald-700">{program?.name} ({program?.degree})</span>
                                </p>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
                                    {applicant.mother_name && <span>Ibu: <strong className="text-slate-700">{applicant.mother_name}</strong></span>}
                                    {applicant.nisn && <span>• NISN: <strong className="text-slate-700 font-mono">{applicant.nisn}</strong></span>}
                                    {applicant.previous_school && <span>• Asal: <strong className="text-slate-700">{applicant.previous_school}</strong></span>}
                                </div>
                            </div>
                            <div>
                                {applicant.status === 'MENUNGGU_PEMBAYARAN' && (
                                    <span className="px-3.5 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-black flex items-center space-x-1.5 border border-amber-300">
                                        <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                                        <span>Menunggu Pembayaran</span>
                                    </span>
                                )}
                                {(applicant.status === 'TERVERIFIKASI_BAYAR' || applicant.status === 'TERVERIFIKASI') && (
                                    <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black flex items-center space-x-1.5 border border-emerald-300">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>Lunas Terverifikasi Otomatis</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* VIRTUAL ACCOUNT CARD (BANK BSI & MULTI-CHANNEL) */}
                        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-800/40 relative overflow-hidden space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                                        <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                                        <span>BSI Host-to-Host Virtual Account (Prefix: 9928)</span>
                                    </div>
                                    <p className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-emerald-300 mt-2">
                                        {vaTransaction?.va_number || '99280126' + String(applicant.id).padStart(4, '0')}
                                    </p>
                                    <p className="text-[11px] text-slate-300 mt-0.5">Atas Nama: <strong className="text-white">{applicant.full_name}</strong></p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleCopyVA(vaTransaction?.va_number || '99280126' + String(applicant.id).padStart(4, '0'))}
                                    className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                                >
                                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    <span className="hidden sm:inline">{copied ? 'Tersalin!' : 'Salin VA'}</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
                                <div>
                                    <p className="text-slate-400 text-[10px]">Nominal Biaya Registrasi:</p>
                                    <p className="text-lg font-black text-white">Rp {Number(invoice?.final_amount || 250000).toLocaleString('id-ID')},-</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 text-[10px]">Status Tagihan:</p>
                                    <p className={`text-xs font-black ${invoice?.status === 'LUNAS' ? 'text-emerald-400' : 'text-amber-300'}`}>
                                        {invoice?.status === 'LUNAS' ? '✅ LUNAS (TERVERIFIKASI)' : '⏳ BELUM DIBAYAR'}
                                    </p>
                                    {invoice?.paid_at && (
                                        <p className="text-[10px] text-slate-400 mt-0.5">Waktu: {invoice.paid_at}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Petunjuk Pembayaran & UAT Sandbox Simulator */}
                        {invoice?.status !== 'LUNAS' ? (
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                                    <p className="font-bold text-slate-800 flex items-center space-x-1.5">
                                        <Building2 className="w-4 h-4 text-emerald-700" />
                                        <span>Cara Pembayaran via BSI Mobile / ATM BSI / ATM Bersama:</span>
                                    </p>
                                    <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
                                        <li>Buka aplikasi <strong>BSI Mobile</strong> atau kunjungi ATM BSI / Bank Lain.</li>
                                        <li>Pilih menu <strong>Bayar / Pembayaran &gt; Akademik / Institusi</strong>.</li>
                                        <li>Masukkan Kode Institusi: <strong className="text-emerald-700 font-mono font-bold">9928 (STAI Al-Ittihad)</strong> atau input nomor Virtual Account di atas.</li>
                                        <li>Periksa rincian nama <strong>{applicant.full_name}</strong> dan nominal <strong>Rp 250.000,-</strong>.</li>
                                        <li>Konfirmasi pembayaran. Status pendaftaran Anda akan langsung otomatis aktif seketika!</li>
                                    </ol>
                                </div>

                                {/* DEVELOPER / UAT SANDBOX SIMULATOR AREA */}
                                <div className="p-5 bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950 text-white rounded-2xl border border-amber-400/40 space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg">
                                            <Sparkles className="w-4 h-4 text-amber-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-white uppercase tracking-wider">
                                                Simulasi Pelunasan Sandbox (UAT / Pengujian)
                                            </h4>
                                            <p className="text-[10px] text-slate-300">
                                                Uji coba otomatisasi webhook pelunasan instan tanpa perlu transfer uang nyata.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <label className="text-[10px] text-slate-300 block mb-1 font-bold">Pilih Saluran Pembayaran Sandbox:</label>
                                            <select
                                                value={sandboxChannel}
                                                onChange={(e) => setSandboxChannel(e.target.value)}
                                                className="w-full p-2 bg-white/10 border border-white/20 rounded-xl text-xs font-bold text-white focus:bg-slate-900"
                                            >
                                                <option value="BSI_H2H" className="text-slate-900">1. Bank BSI Host-to-Host (VA 9928)</option>
                                                <option value="VA_MANDIRI" className="text-slate-900">2. Winpay - Mandiri Virtual Account</option>
                                                <option value="VA_BCA" className="text-slate-900">3. Winpay - BCA Virtual Account</option>
                                                <option value="VA_BRI" className="text-slate-900">4. Winpay - BRI Virtual Account</option>
                                                <option value="QRIS" className="text-slate-900">5. Winpay - QRIS Instant Pay</option>
                                            </select>
                                        </div>

                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                disabled={simulating}
                                                onClick={handleSimulatePayment}
                                                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black rounded-xl text-xs transition shadow flex items-center justify-center space-x-1.5 cursor-pointer"
                                            >
                                                <Sparkles className={`w-4 h-4 ${simulating ? 'animate-spin' : ''}`} />
                                                <span>{simulating ? 'Memproses Webhook...' : '⚡ Bayar Sekarang (Sandbox UAT)'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 text-emerald-900 text-xs space-y-3">
                                <div className="flex items-center space-x-2.5">
                                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm text-emerald-950">Pembayaran Uang Pendaftaran Lunas!</h4>
                                        <p className="text-[11px] text-emerald-700">
                                            Nomor registrasi <strong>{applicant.registration_number}</strong> telah terverifikasi secara resmi di sistem SIAKAD STAI Al-Ittihad.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-[11px] text-slate-700 space-y-1">
                                    <p className="font-bold text-emerald-900">Tahapan Selanjutnya Calon Mahasiswa:</p>
                                    <p>1. Simpan bukti nomor pendaftaran Anda: <strong className="font-mono text-slate-900">{applicant.registration_number}</strong></p>
                                    <p>2. Ikuti tes seleksi masuk online atau wawancara akademik sesuai jadwal gelombang PMB.</p>
                                    <p>3. Pengumuman kelulusan akan diinformasikan via WhatsApp ke nomor <strong className="font-mono">{applicant.phone_number}</strong>.</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : searchRegNumber ? (
                    <div className="bg-white p-8 rounded-3xl shadow-xl text-center space-y-3 border border-slate-100">
                        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                        <h3 className="text-base font-black text-slate-900">Data Pendaftaran Tidak Ditemukan</h3>
                        <p className="text-xs text-slate-500">Nomor registrasi <strong>{searchRegNumber}</strong> tidak terdaftar di sistem kami.</p>
                    </div>
                ) : null}

                {/* Navigation Links */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <Link href="/pmb" className="hover:text-emerald-400 transition flex items-center space-x-1">
                        <span>← Formulir Pendaftaran PMB</span>
                    </Link>
                    <Link href="/login" className="hover:text-white transition">
                        Portal Login SIAKAD →
                    </Link>
                </div>
            </div>
        </div>
    );
}
