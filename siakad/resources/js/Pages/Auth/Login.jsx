import React, { useState, useEffect } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Lock, User, RefreshCw, ShieldCheck, ChevronRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        captcha: '',
        remember: false,
    });

    const [captchaImage, setCaptchaImage] = useState('');
    const [loadingCaptcha, setLoadingCaptcha] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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

    return (
        <div className="login-page min-h-screen flex flex-col justify-center py-6 sm:py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            <Head title="Masuk" />

            {/* Ambient layers only animate transforms for smooth compositing. */}
            <div className="login-ambient login-ambient-primary" aria-hidden="true"></div>
            <div className="login-ambient login-ambient-secondary" aria-hidden="true"></div>
            <div className="login-ambient login-ambient-tertiary" aria-hidden="true"></div>

            {/* Subtle Texture & Soft Vignette */}
            <div className="absolute inset-0 bg-dot-grid opacity-50 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/80 pointer-events-none"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-sm z-10">
                {/* Brand Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-[4.5rem] h-[4.5rem] mb-3">
                        <img src="/logostai.png" alt="Logo STAI Al-Ittihad" className="w-full h-full object-contain drop-shadow-md" />
                    </div>
                    <h2 className="text-xl font-extrabold text-white tracking-tight">SIAKAD TERPADU</h2>
                    <p className="text-xs font-semibold text-emerald-400 tracking-wider uppercase mt-0.5">STAI Al-Ittihad Cianjur</p>
                </div>

                {/* Login Card */}
                <div className="login-card mt-5 py-5 px-5 sm:px-6 relative">
                    <div className="login-card-heading">
                        <span>Portal Akademik</span>
                        <span>Akses Terlindungi</span>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        {/* 1. Login Identifier */}
                        <div>
                            <div className="login-input-field">
                                <label htmlFor="login-identity">Identitas Pengguna</label>
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                                    <User className="w-3.5 h-3.5" />
                                </div>
                                <input
                                    id="login-identity"
                                    type="text"
                                    value={data.login}
                                    onChange={(e) => setData('login', e.target.value)}
                                    placeholder="Masukkan identitas Anda"
                                    className="login-form-input block w-full pl-8 pr-3 py-2.5 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-900 focus:outline-none transition placeholder:text-slate-400"
                                    required
                                />
                            </div>
                            {errors.login && (
                                <p className="mt-1 text-[11px] font-semibold text-rose-600">{errors.login}</p>
                            )}
                        </div>

                        {/* 2. Password */}
                        <div>
                            <div className="login-input-field">
                                <label htmlFor="login-password">Kata Sandi</label>
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-3.5 h-3.5" />
                                </div>
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="login-form-input block w-full pl-8 pr-8 py-2.5 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-900 focus:outline-none transition placeholder:text-slate-400"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition cursor-pointer"
                                    title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-3.5 h-3.5" />
                                    ) : (
                                        <Eye className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-[11px] font-semibold text-rose-600">{errors.password}</p>
                            )}
                        </div>

                        {/* 3. Captcha 4-Digit with Auto-Uppercase */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Kode Keamanan (4 Digit)
                            </label>
                            <div className="flex items-center space-x-2">
                                {/* Captcha Image Box */}
                                <div className="h-9 w-28 bg-slate-100 border border-slate-300 rounded-md flex items-center justify-center overflow-hidden shadow-inner relative flex-shrink-0">
                                    {loadingCaptcha ? (
                                        <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                                            <RefreshCw className="w-3 h-3 animate-spin" />
                                            <span>Memuat...</span>
                                        </div>
                                    ) : captchaImage ? (
                                        <img src={captchaImage} alt="Captcha" className="h-full w-full object-contain select-none" />
                                    ) : (
                                        <span className="text-[10px] text-slate-400">Gagal</span>
                                    )}
                                </div>

                                {/* Refresh Button */}
                                <button
                                    type="button"
                                    onClick={fetchCaptcha}
                                    title="Segarkan Kode Captcha"
                                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md border border-slate-300 transition flex-shrink-0 cursor-pointer"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${loadingCaptcha ? 'animate-spin' : ''}`} />
                                </button>

                                {/* Captcha Input */}
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        maxLength={4}
                                        value={data.captcha}
                                        onChange={(e) => setData('captcha', e.target.value.toUpperCase())}
                                        placeholder="KODE"
                                        className="block w-full py-2 text-center tracking-widest font-black text-xs uppercase bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-emerald-500 focus:border-emerald-500 transition"
                                        required
                                    />
                                </div>
                            </div>
                            {errors.captcha && (
                                <p className="mt-1 text-[11px] font-semibold text-rose-600">{errors.captcha}</p>
                            )}
                            <p className="mt-1 text-[9.5px] text-slate-400 italic">
                                * Masukkan 4 karakter di atas (otomatis kapital).
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={processing}
                                className="login-submit-button w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-md text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? (
                                    <span className="flex items-center space-x-1.5">
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Memproses Masuk...</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center space-x-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>Masuk ke Sistem SIAKAD</span>
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Bottom Footer Link to LMS */}
                <div className="mt-4 text-center text-[11px] text-slate-400">
                    Ingin belajar daring?{' '}
                    <a href="https://lms.stai-alittihad.ac.id" target="_blank" rel="noreferrer" className="font-bold text-emerald-400 hover:underline inline-flex items-center">
                        Buka SALAM LMS STAI Al-Ittihad <ChevronRight className="w-3 h-3 ml-0.5" />
                    </a>
                </div>
            </div>
        </div>
    );
}
