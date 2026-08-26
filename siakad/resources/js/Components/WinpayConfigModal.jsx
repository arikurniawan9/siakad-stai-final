import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { 
    CreditCard, ShieldCheck, Radio, Check, Copy, RefreshCw, 
    X, Server, CheckCircle2, AlertTriangle, Send, Key, 
    ExternalLink, Eye, EyeOff, Sparkles, Activity
} from 'lucide-react';

export default function WinpayConfigModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState('config'); // config | test | history
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testingPing, setTestingPing] = useState(false);
    const [simulating, setSimulating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showSecret, setShowSecret] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        winpay_enabled: true,
        winpay_env: 'sandbox',
        winpay_merchant_id: 'WP_STAI_ALITTIHAD_2026',
        winpay_secret_key: 'sk_sandbox_stai_winpay_secret_key_2026',
        winpay_api_url: 'https://sandbox-api.winpay.id',
        winpay_channels: ['VA_BSI', 'VA_MANDIRI', 'VA_BCA', 'VA_BRI', 'QRIS'],
    });

    const [callbackUrl, setCallbackUrl] = useState('');
    const [recentTx, setRecentTx] = useState([]);
    const [stats, setStats] = useState({});
    const [pingResult, setPingResult] = useState(null);
    const [simulationResult, setSimulationResult] = useState(null);
    const [selectedChannel, setSelectedChannel] = useState('VA_BSI');

    // Fetch initial config
    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await fetch('/admin/winpay/config');
            const data = await res.json();
            if (data.success) {
                setFormData(data.config);
                setCallbackUrl(data.stats.callback_url);
                setRecentTx(data.recent_transactions || []);
                setStats(data.stats || {});
            }
        } catch (err) {
            console.error('Failed to load Winpay config:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, [isOpen]);

    const handleCopyCallback = () => {
        if (callbackUrl) {
            navigator.clipboard.writeText(callbackUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleChannelToggle = (channelCode) => {
        setFormData(prev => {
            const exists = prev.winpay_channels.includes(channelCode);
            return {
                ...prev,
                winpay_channels: exists 
                    ? prev.winpay_channels.filter(c => c !== channelCode)
                    : [...prev.winpay_channels, channelCode]
            };
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/admin/winpay/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': token || '',
                },
                body: JSON.stringify(formData),
            });

            const text = await res.text();
            let data;
            try { data = JSON.parse(text); } catch { throw new Error(text.substring(0, 150)); }

            alert('✅ Pengaturan Winpay Payment Gateway berhasil disimpan!');
            fetchConfig();
        } catch (err) {
            console.error(err);
            alert('Terjadi kesalahan saat menyimpan pengaturan: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleTestPing = async () => {
        setTestingPing(true);
        setPingResult(null);
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/admin/winpay/test-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': token || '',
                },
            });
            const text = await res.text();
            let result;
            try { result = JSON.parse(text); } catch { throw new Error('Respon server bukan JSON: ' + text.substring(0, 100)); }
            setPingResult(result);
        } catch (err) {
            setPingResult({
                status: 'ERROR',
                message: 'Gagal terhubung ke API: ' + err.message,
            });
        } finally {
            setTestingPing(false);
        }
    };

    const handleSimulatePayment = async () => {
        setSimulating(true);
        setSimulationResult(null);
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/admin/winpay/simulate-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': token || '',
                },
                body: JSON.stringify({ channel: selectedChannel }),
            });
            const text = await res.text();
            let result;
            try { result = JSON.parse(text); } catch { throw new Error('Respon server bukan JSON: ' + text.substring(0, 100)); }
            setSimulationResult(result);
            if (result.success) {
                fetchConfig(); // Refresh transactions list
            }
        } catch (err) {
            setSimulationResult({
                success: false,
                message: 'Gagal simulasi: ' + err.message,
            });
        } finally {
            setSimulating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
                
                {/* MODAL HEADER */}
                <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/50 shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl text-indigo-300">
                            <CreditCard className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="text-sm sm:text-base font-black tracking-tight text-white">
                                    Pengaturan Koneksi Winpay Gateway
                                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                    formData.winpay_env === 'production' 
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                }`}>
                                    {formData.winpay_env === 'production' ? '🔴 Production' : '🟡 Sandbox'}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-300 mt-0.5">
                                Khusus Hak Akses Superadmin • Manajemen API, Webhook & Simulator Pembayaran
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* NAVIGATION TABS */}
                <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center space-x-2 shrink-0">
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center space-x-1.5 cursor-pointer ${
                            activeTab === 'config'
                                ? 'bg-white text-indigo-950 border-t-2 border-indigo-600 shadow-2xs'
                                : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Key className="w-3.5 h-3.5" />
                        <span>Kredensial & Saluran</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('test')}
                        className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center space-x-1.5 cursor-pointer ${
                            activeTab === 'test'
                                ? 'bg-white text-indigo-950 border-t-2 border-indigo-600 shadow-2xs'
                                : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Uji Koneksi & Simulator</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center space-x-1.5 cursor-pointer ${
                            activeTab === 'history'
                                ? 'bg-white text-indigo-950 border-t-2 border-indigo-600 shadow-2xs'
                                : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Riwayat Webhook ({recentTx.length})</span>
                    </button>
                </div>

                {/* MODAL BODY */}
                <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
                    
                    {/* TAB 1: KREDENSIAL & KONFIGURASI */}
                    {activeTab === 'config' && (
                        <form onSubmit={handleSave} className="space-y-4">
                            {/* Status & Environment Mode */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Status Gateway</label>
                                    <label className="flex items-center space-x-2 cursor-pointer mt-1">
                                        <input
                                            type="checkbox"
                                            checked={formData.winpay_enabled}
                                            onChange={(e) => setFormData({ ...formData, winpay_enabled: e.target.checked })}
                                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                        />
                                        <span className="text-xs font-bold text-slate-900">
                                            {formData.winpay_enabled ? '🟢 Integrasi Winpay Aktif' : '⚪ Nonaktif'}
                                        </span>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Mode Environment</label>
                                    <div className="flex items-center space-x-3 mt-1">
                                        <label className="flex items-center space-x-1.5 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="winpay_env"
                                                value="sandbox"
                                                checked={formData.winpay_env === 'sandbox'}
                                                onChange={() => setFormData({ 
                                                    ...formData, 
                                                    winpay_env: 'sandbox',
                                                    winpay_api_url: 'https://sandbox-api.winpay.id' 
                                                })}
                                                className="text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="font-bold text-amber-700">Sandbox (Uji Coba)</span>
                                        </label>
                                        <label className="flex items-center space-x-1.5 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="winpay_env"
                                                value="production"
                                                checked={formData.winpay_env === 'production'}
                                                onChange={() => setFormData({ 
                                                    ...formData, 
                                                    winpay_env: 'production',
                                                    winpay_api_url: 'https://api.winpay.id' 
                                                })}
                                                className="text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="font-bold text-rose-700">Production (Live)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Merchant ID & Secret Key */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                        Merchant ID / Client Code <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.winpay_merchant_id}
                                        onChange={(e) => setFormData({ ...formData, winpay_merchant_id: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Contoh: WP_STAI_ALITTIHAD_2026"
                                        required
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Diberikan oleh tim integrasi Winpay.</p>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                        Secret Key / Private Key (HMAC SHA-256) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showSecret ? "text" : "password"}
                                            value={formData.winpay_secret_key}
                                            onChange={(e) => setFormData({ ...formData, winpay_secret_key: e.target.value })}
                                            className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                                            placeholder="sk_live_xxxx atau sk_sandbox_xxxx"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowSecret(!showSecret)}
                                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                                        >
                                            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">Kunci rahasia untuk memvalidasi tanda tangan webhook.</p>
                                </div>
                            </div>

                            {/* Base API Endpoint */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    Base API Endpoint Winpay <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    value={formData.winpay_api_url}
                                    onChange={(e) => setFormData({ ...formData, winpay_api_url: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            {/* Supported Payment Channels */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                    Saluran Pembayaran Aktif (Payment Channels)
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {[
                                        { id: 'VA_BSI', label: '🏦 Bank BSI (VA 9928)', badge: 'Prioritas' },
                                        { id: 'VA_MANDIRI', label: '🏦 Bank Mandiri (VA)', badge: 'Populer' },
                                        { id: 'VA_BCA', label: '🏦 Bank BCA (VA)', badge: 'Populer' },
                                        { id: 'VA_BRI', label: '🏦 Bank BRI (BRIVA)', badge: 'Aktif' },
                                        { id: 'VA_PERMATA', label: '🏦 Bank Permata (VA)', badge: 'Aktif' },
                                        { id: 'QRIS', label: '📱 QRIS Dinamis & Statis', badge: 'Instan' },
                                    ].map(ch => {
                                        const isChecked = formData.winpay_channels.includes(ch.id);
                                        return (
                                            <div
                                                key={ch.id}
                                                onClick={() => handleChannelToggle(ch.id)}
                                                className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                                                    isChecked
                                                        ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 font-bold'
                                                        : 'bg-slate-50 border-slate-200 text-slate-500'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {}}
                                                        className="rounded text-indigo-600 pointer-events-none"
                                                    />
                                                    <span className="text-[11px]">{ch.label}</span>
                                                </div>
                                                <span className="text-[9px] px-1.5 py-0.2 bg-white rounded border border-slate-200 text-slate-600">
                                                    {ch.badge}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Public Webhook Callback URL */}
                            <div className="p-3.5 bg-indigo-950 text-white rounded-2xl border border-indigo-900 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-indigo-200 flex items-center space-x-1">
                                        <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                        <span>URL Webhook Callback Notifikasi (Daftarkan di Dashboard Winpay)</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleCopyCallback}
                                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                                    >
                                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                        <span>{copied ? 'Tersalin!' : 'Salin URL'}</span>
                                    </button>
                                </div>
                                <p className="font-mono text-[11px] text-emerald-300 bg-black/40 p-2 rounded-lg break-all select-all">
                                    {callbackUrl || 'http://localhost:8000/api/v1/winpay/callback'}
                                </p>
                                <p className="text-[10px] text-indigo-300">
                                    * Winpay akan mengirimkan notifikasi HTTP POST ke URL ini setiap kali mahasiswa melunasi tagihan.
                                </p>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-md flex items-center space-x-1.5 cursor-pointer"
                                >
                                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan Winpay'}</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TAB 2: TEST PING & SIMULATOR PEMBAYARAN */}
                    {activeTab === 'test' && (
                        <div className="space-y-4">
                            {/* Test 1: Ping / Healthcheck */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
                                            <Activity className="w-4 h-4 text-indigo-600" />
                                            <span>1. Uji Handshake & Latensi API Winpay</span>
                                        </h4>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            Memeriksa ketersediaan server Winpay dan validasi engine enkripsi HMAC-SHA256.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleTestPing}
                                        disabled={testingPing}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow flex items-center space-x-1.5 cursor-pointer"
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 ${testingPing ? 'animate-spin' : ''}`} />
                                        <span>{testingPing ? 'Menguji...' : 'Test Ping Server'}</span>
                                    </button>
                                </div>

                                {pingResult && (
                                    <div className={`p-3 rounded-xl border font-mono text-[11px] ${
                                        pingResult.status === 'ONLINE' || pingResult.status === 'ONLINE_STANDBY'
                                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                                            : 'bg-rose-50 border-rose-300 text-rose-950'
                                    }`}>
                                        <div className="flex items-center justify-between font-bold border-b border-emerald-200 pb-1.5 mb-2">
                                            <span>STATUS: {pingResult.status} ({pingResult.latency_ms} ms)</span>
                                            <span>{pingResult.details?.timestamp}</span>
                                        </div>
                                        <p className="font-sans font-semibold mb-1">{pingResult.message}</p>
                                        <div className="text-[10px] text-slate-600 space-y-0.5">
                                            <p>• Merchant Code: <strong>{pingResult.details?.merchant_id}</strong></p>
                                            <p>• Algoritma Signature: <strong>{pingResult.details?.signature_algo}</strong></p>
                                            <p>• Test Hash: <code>{pingResult.details?.test_signature}</code></p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Test 2: Webhook Simulator */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                                <h4 className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
                                    <Send className="w-4 h-4 text-emerald-600" />
                                    <span>2. Simulator Notifikasi Pembayaran (Webhook Callback)</span>
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                    Mensimulasikan respons pembayaran sukses dari Winpay untuk melunasi tagihan SPP/PMB secara otomatis.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                                    <div className="w-full sm:w-1/2">
                                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Pilih Saluran Pembayaran</label>
                                        <select
                                            value={selectedChannel}
                                            onChange={(e) => setSelectedChannel(e.target.value)}
                                            className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                                        >
                                            <option value="VA_BSI">🏦 Bank BSI Virtual Account</option>
                                            <option value="VA_MANDIRI">🏦 Bank Mandiri Virtual Account</option>
                                            <option value="VA_BCA">🏦 Bank BCA Virtual Account</option>
                                            <option value="VA_BRI">🏦 Bank BRI (BRIVA)</option>
                                            <option value="QRIS">📱 QRIS Dinamis (All E-Wallet / M-Banking)</option>
                                        </select>
                                    </div>

                                    <div className="w-full sm:w-1/2 flex items-end">
                                        <button
                                            type="button"
                                            onClick={handleSimulatePayment}
                                            disabled={simulating}
                                            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow flex items-center justify-center space-x-1.5 cursor-pointer"
                                        >
                                            <CreditCard className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
                                            <span>{simulating ? 'Memproses Simulasi...' : 'Kirim Simulasi Webhook Lunas'}</span>
                                        </button>
                                    </div>
                                </div>

                                {simulationResult && (
                                    <div className={`p-3.5 rounded-xl border text-[11px] ${
                                        simulationResult.success
                                            ? 'bg-emerald-950 text-white border-emerald-800'
                                            : 'bg-rose-50 text-rose-950 border-rose-300'
                                    }`}>
                                        <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-1">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>{simulationResult.message}</span>
                                        </div>
                                        {simulationResult.data && (
                                            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-emerald-900 font-mono text-[10px] text-slate-200">
                                                <p>• Order ID: <span className="text-amber-300">{simulationResult.data.order_id}</span></p>
                                                <p>• Winpay Tx ID: <span className="text-indigo-300">{simulationResult.data.winpay_transaction_id}</span></p>
                                                <p>• Invoice: <span className="text-white">{simulationResult.data.invoice_number}</span></p>
                                                <p>• Saluran: <span className="text-emerald-300">{simulationResult.data.channel}</span></p>
                                                <p>• Nominal: <strong>Rp {Number(simulationResult.data.amount).toLocaleString('id-ID')}</strong></p>
                                                <p>• Status Baru: <span className="text-emerald-400 font-bold">{simulationResult.data.status}</span></p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: RIWAYAT TRANSAKSI WINPAY */}
                    {activeTab === 'history' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black text-slate-900">
                                    Log Transaksi & Webhook Terakhir (10 Data Terbaru)
                                </h4>
                                <button
                                    onClick={fetchConfig}
                                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition flex items-center space-x-1"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    <span>Segarkan</span>
                                </button>
                            </div>

                            {recentTx.length === 0 ? (
                                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500">
                                    <CreditCard className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
                                    <p className="font-bold text-xs">Belum ada transaksi Winpay tercatat.</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Gunakan tab <strong>Uji Koneksi & Simulator</strong> untuk menguji alur webhook pertama Anda.
                                    </p>
                                </div>
                            ) : (
                                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                                    <table className="w-full text-left text-[11px]">
                                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                            <tr>
                                                <th className="p-2.5">Order ID</th>
                                                <th className="p-2.5">Mahasiswa / Invoice</th>
                                                <th className="p-2.5">Saluran</th>
                                                <th className="p-2.5 text-right">Nominal</th>
                                                <th className="p-2.5 text-center">Status</th>
                                                <th className="p-2.5">Waktu</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium">
                                            {recentTx.map(tx => (
                                                <tr key={tx.id} className="hover:bg-slate-50">
                                                    <td className="p-2.5 font-mono text-[10px] text-indigo-900 font-bold">
                                                        {tx.order_id}
                                                    </td>
                                                    <td className="p-2.5">
                                                        <p className="font-bold text-slate-900">{tx.student_name || 'Simulasi Mahasiswa'}</p>
                                                        <p className="text-[10px] text-slate-500 font-mono">{tx.invoice_number}</p>
                                                    </td>
                                                    <td className="p-2.5">
                                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-[10px] font-bold">
                                                            {tx.channel}
                                                        </span>
                                                    </td>
                                                    <td className="p-2.5 text-right font-bold text-slate-900">
                                                        Rp {Number(tx.amount).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="p-2.5 text-center">
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                                            tx.status === 'PAID'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-2.5 text-[10px] text-slate-500 font-mono whitespace-nowrap">
                                                        {new Date(tx.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* MODAL FOOTER */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
                    <span className="flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Keamanan Enkripsi SHA-256 Aktif & Terlindungi</span>
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>

            </div>
        </div>
    );
}
