import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { 
    ShieldCheck, 
    Lock, 
    User, 
    Mail, 
    Eye, 
    EyeOff, 
    Sparkles, 
    RefreshCw, 
    CheckCircle2, 
    AlertTriangle,
    Database,
    Zap
} from 'lucide-react';

export default function SetupSuperadmin() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: 'Super Administrator',
        username: 'superadmin',
        email: 'superadmin@staialittihad.ac.id',
        password: '',
        password_confirmation: '',
        phone_number: '081234567890',
        seed_default_accounts: true,
    });

    const handleFillDefault = () => {
        setData({
            name: 'Super Administrator',
            username: 'superadmin',
            email: 'superadmin@staialittihad.ac.id',
            password: 'salam123',
            password_confirmation: 'salam123',
            phone_number: '081234567890',
            seed_default_accounts: true,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/setup/superadmin');
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            <Head title="Setup Super Administrator" />

            {/* Ambient Background Aura */}
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
                {/* Brand Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 mb-2">
                        <img src="/logostai.png" alt="Logo STAI Al-Ittihad" className="w-full h-full object-contain drop-shadow-md" />
                    </div>
                    <h2 className="text-xl font-extrabold text-white tracking-tight">SIAKAD TERPADU</h2>
                    <p className="text-xs font-semibold text-emerald-400 tracking-wider uppercase mt-0.5">STAI Al-Ittihad Cianjur</p>
                </div>

                {/* Setup Card */}
                <div className="mt-4 bg-white py-5 px-5 sm:px-6 shadow-2xl rounded-2xl border border-slate-100 relative">
                    {/* Setup Status Banner */}
                    <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-start space-x-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <p className="font-bold text-amber-900">Inisialisasi Sistem — Belum Ada Superadmin</p>
                            <p className="text-amber-700 text-[11px] mt-0.5 leading-relaxed">
                                Basis data mendeteksi belum adanya akun Super Administrator. Silakan konfigurasikan akun pengendali utama sistem sebelum masuk.
                            </p>
                        </div>
                    </div>

                    {/* Quick Preset Button */}
                    <button
                        type="button"
                        onClick={handleFillDefault}
                        className="w-full mb-4 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                    >
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>⚡ Isi Otomatis Kredensial Standar (superadmin / salam123)</span>
                    </button>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* 1. Nama Lengkap */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Nama Lengkap Super Administrator
                            </label>
                            <div className="relative rounded-md shadow-2xs">
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                                    <User className="w-3.5 h-3.5" />
                                </div>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Super Administrator"
                                    className="block w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-emerald-500 focus:border-emerald-500 transition"
                                    required
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-[11px] font-semibold text-rose-600">{errors.name}</p>
                            )}
                        </div>

                        {/* 2. Username Login */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Username Login
                            </label>
                            <div className="relative rounded-md shadow-2xs">
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 font-mono text-xs font-bold">
                                    @
                                </div>
                                <input
                                    type="text"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value.toLowerCase())}
                                    placeholder="superadmin"
                                    className="block w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-emerald-500 focus:border-emerald-500 transition"
                                    required
                                />
                            </div>
                            {errors.username && (
                                <p className="mt-1 text-[11px] font-semibold text-rose-600">{errors.username}</p>
                            )}
                        </div>

                        {/* 3. Email */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Email Resmi
                            </label>
                            <div className="relative rounded-md shadow-2xs">
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                                    <Mail className="w-3.5 h-3.5" />
                                </div>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="superadmin@staialittihad.ac.id"
                                    className="block w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-emerald-500 focus:border-emerald-500 transition"
                                    required
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-[11px] font-semibold text-rose-600">{errors.email}</p>
                            )}
                        </div>

                        {/* 4. Password & Konfirmasi Password */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Kata Sandi Baru
                                </label>
                                <div className="relative rounded-md shadow-2xs">
                                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                                        <Lock className="w-3.5 h-3.5" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Minimal 6 karakter"
                                        className="block w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-emerald-500 focus:border-emerald-500 transition"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Konfirmasi Sandi
                                </label>
                                <div className="relative rounded-md shadow-2xs">
                                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                                        <Lock className="w-3.5 h-3.5" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Ulangi kata sandi"
                                        className="block w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-emerald-500 focus:border-emerald-500 transition"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        {errors.password && (
                            <p className="text-[11px] font-semibold text-rose-600">{errors.password}</p>
                        )}

                        {/* 5. Checkbox Seed Default Accounts */}
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 mt-2">
                            <label className="flex items-start space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.seed_default_accounts}
                                    onChange={(e) => setData('seed_default_accounts', e.target.checked)}
                                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <div className="text-[11px]">
                                    <span className="font-bold text-slate-800">
                                        Sekaligus semai akun civitas akademika default (UserSeeder)
                                    </span>
                                    <p className="text-slate-500 text-[10px] mt-0.5">
                                        Menyediakan akun Admin BAAK, Keuangan BSI, Kaprodi, Dosen PA, Dosen, dan Mahasiswa siap pakai dengan kata sandi: <span className="font-mono font-bold text-emerald-700">salam123</span>.
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500 transition disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? (
                                    <span className="flex items-center space-x-1.5">
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Menginisialisasi Superadmin...</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center space-x-1.5">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>Buat Akun & Masuk ke Dashboard</span>
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-4 text-center text-[11px] text-slate-400">
                    SIAKAD Enterprise STAI Al-Ittihad Cianjur • Automated Disaster Recovery Engine
                </div>
            </div>
        </div>
    );
}
