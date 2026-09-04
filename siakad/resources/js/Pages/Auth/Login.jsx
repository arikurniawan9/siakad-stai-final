import React, { useState, useEffect } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Lock, User, RefreshCw, ShieldCheck, CheckCircle2, ChevronRight, Info } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        captcha: '',
        remember: false,
    });

    const [captchaImage, setCaptchaImage] = useState('');
    const [loadingCaptcha, setLoadingCaptcha] = useState(false);
    const [showHints, setShowHints] = useState(false);

    const fetchCaptcha = async () => {
        setLoadingCaptcha(true);
        try {
            const res = await fetch('/captcha/generate');
            const result = await res.json();
            if (result.success) {
                setCaptchaImage(result.captcha_image);
                setData('captcha', '');
            }
        } catch (err) {
            console.error('Failed to load captcha', err);
        } finally {
            setLoadingCaptcha(false);
        }
    };

    useEffect(() => {
        fetchCaptcha();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login', {
            onError: () => {
                fetchCaptcha();
                reset('password', 'captcha');
            },
        });
    };

    const handleSelectRole = (username) => {
        setData((prev) => ({
            ...prev,
            login: username,
            password: 'salam123',
        }));
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            <Head title="Masuk" />

            {/* Background Decorative Islamic Geometry Elements */}
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
                {/* Brand Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-xl shadow-emerald-950/40 p-2 mb-3 border border-slate-200">
                        <img src="/logostai.png" alt="Logo STAI Al-Ittihad" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">SIAKAD TERPADU</h2>
                    <p className="text-sm font-semibold text-emerald-400 tracking-wider uppercase mt-0.5">STAI Al-Ittihad Cianjur</p>
                    <p className="text-xs text-slate-400 mt-2">Sistem Informasi Akademik & Layanan Keuangan Syariah</p>
                </div>

                {/* Login Card */}
                <div className="mt-6 bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100 relative">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* 1. Login Identifier */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Identitas Pengguna (NIM / NIDN / Username / Email)
                            </label>
                            <div className="relative rounded-lg shadow-xs">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={data.login}
                                    onChange={(e) => setData('login', e.target.value)}
                                    placeholder="Contoh: 21010042 atau adminakademik"
                                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                                    required
                                />
                            </div>
                            {errors.login && (
                                <p className="mt-1 text-xs font-semibold text-rose-600">{errors.login}</p>
                            )}
                        </div>

                        {/* 2. Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Kata Sandi (Password)
                            </label>
                            <div className="relative rounded-lg shadow-xs">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                                    required
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-xs font-semibold text-rose-600">{errors.password}</p>
                            )}
                        </div>

                        {/* 3. Captcha 4-Digit with Auto-Uppercase */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Kode Keamanan (4 Digit)
                            </label>
                            <div className="flex items-center space-x-3">
                                {/* Captcha Image Box */}
                                <div className="h-12 w-40 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center overflow-hidden shadow-inner relative">
                                    {loadingCaptcha ? (
                                        <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            <span>Memuat...</span>
                                        </div>
                                    ) : captchaImage ? (
                                        <img src={captchaImage} alt="Captcha" className="h-full w-full object-contain select-none" />
                                    ) : (
                                        <span className="text-xs text-slate-400">Gagal memuat</span>
                                    )}
                                </div>

                                {/* Refresh Button */}
                                <button
                                    type="button"
                                    onClick={fetchCaptcha}
                                    title="Segarkan Kode Captcha"
                                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-300 transition"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loadingCaptcha ? 'animate-spin' : ''}`} />
                                </button>

                                {/* Captcha Input */}
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        maxLength={4}
                                        value={data.captcha}
                                        onChange={(e) => setData('captcha', e.target.value.toUpperCase())}
                                        placeholder="KODE"
                                        className="block w-full py-2.5 text-center tracking-widest font-black text-sm uppercase bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                                        required
                                    />
                                </div>
                            </div>
                            {errors.captcha && (
                                <p className="mt-1 text-xs font-semibold text-rose-600">{errors.captcha}</p>
                            )}
                            <p className="mt-1 text-[10px] text-slate-400 italic">
                                * Masukkan 4 karakter huruf/angka di atas. Huruf otomatis kapital.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition disabled:opacity-50"
                            >
                                {processing ? (
                                    <span className="flex items-center space-x-2">
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Memproses Masuk...</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center space-x-2">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>Masuk ke Sistem SIAKAD</span>
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Quick Demo Credentials Toggle */}
                    <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                        <button
                            type="button"
                            onClick={() => setShowHints(!showHints)}
                            className="inline-flex items-center space-x-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-bold"
                        >
                            <Info className="w-3.5 h-3.5" />
                            <span>{showHints ? 'Tutup Akun Demo' : 'Klik di Sini untuk Akun Demo Uji Coba (7 Peran)'}</span>
                        </button>

                        {showHints && (
                            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-[11px] space-y-1.5">
                                <p className="font-bold text-slate-800 text-xs mb-1">Pilih Akun Demo (Password: <span className="text-emerald-600 font-black">salam123</span>):</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    <button onClick={() => handleSelectRole('superadmin')} type="button" className="p-1.5 bg-white border border-slate-200 rounded hover:bg-emerald-50 text-left">
                                        <p className="font-bold text-slate-800">👑 Superadmin</p>
                                        <p className="text-[10px] text-slate-500">superadmin</p>
                                    </button>
                                    <button onClick={() => handleSelectRole('adminakademik')} type="button" className="p-1.5 bg-white border border-slate-200 rounded hover:bg-emerald-50 text-left">
                                        <p className="font-bold text-slate-800">🏛️ Admin BAAK</p>
                                        <p className="text-[10px] text-slate-500">adminakademik</p>
                                    </button>
                                    <button onClick={() => handleSelectRole('keuangan')} type="button" className="p-1.5 bg-white border border-slate-200 rounded hover:bg-emerald-50 text-left">
                                        <p className="font-bold text-slate-800">💳 Keuangan BSI</p>
                                        <p className="text-[10px] text-slate-500">keuangan</p>
                                    </button>
                                    <button onClick={() => handleSelectRole('2118097201')} type="button" className="p-1.5 bg-white border border-slate-200 rounded hover:bg-emerald-50 text-left">
                                        <p className="font-bold text-slate-800">🎓 Kaprodi PAI</p>
                                        <p className="text-[10px] text-slate-500">2118097201</p>
                                    </button>
                                    <button onClick={() => handleSelectRole('2115047802')} type="button" className="p-1.5 bg-white border border-slate-200 rounded hover:bg-emerald-50 text-left">
                                        <p className="font-bold text-slate-800">📋 Dosen PA</p>
                                        <p className="text-[10px] text-slate-500">2115047802</p>
                                    </button>
                                    <button onClick={() => handleSelectRole('21010042')} type="button" className="p-1.5 bg-white border border-slate-200 rounded hover:bg-emerald-50 text-left">
                                        <p className="font-bold text-slate-800">👨‍🎓 Mahasiswa</p>
                                        <p className="text-[10px] text-slate-500">21010042</p>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Footer Link to LMS */}
                <div className="mt-6 text-center text-xs text-slate-400">
                    Ingin belajar daring?{' '}
                    <a href="http://localhost:3001" target="_blank" rel="noreferrer" className="font-bold text-emerald-400 hover:underline inline-flex items-center">
                        Buka SALAM LMS STAI Al-Ittihad <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </a>
                </div>
            </div>
        </div>
    );
}
