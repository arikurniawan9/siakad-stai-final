import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { 
    X, User, Mail, Phone, Lock, KeyRound, ShieldCheck, 
    AlertCircle, CheckCircle2, Eye, EyeOff, Save, Sparkles 
} from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose, user = {}, role = '' }) {
    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'

    // Form Profil State
    const [profileData, setProfileData] = useState({
        name: user.name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        gender: user.gender || 'L',
    });
    const [profileErrors, setProfileErrors] = useState({});
    const [profileSuccess, setProfileSuccess] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Form Password State
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({});
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    // Sinkronisasi data awal saat modal terbuka
    useEffect(() => {
        if (isOpen) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
                gender: user.gender || 'L',
            });
            setProfileErrors({});
            setProfileSuccess('');
            setPasswordData({
                current_password: '',
                password: '',
                password_confirmation: '',
            });
            setPasswordErrors({});
            setPasswordSuccess('');
        }
    }, [isOpen, user]);

    // Submit Update Profile
    const handleProfileSubmit = (e) => {
        e.preventDefault();
        setIsSavingProfile(true);
        setProfileErrors({});
        setProfileSuccess('');

        router.put('/profile', profileData, {
            preserveScroll: true,
            onSuccess: () => {
                setProfileSuccess('Profil berhasil diperbarui dengan sukses!');
                setTimeout(() => setProfileSuccess(''), 4000);
            },
            onError: (errs) => {
                setProfileErrors(errs);
            },
            onFinish: () => {
                setIsSavingProfile(false);
            },
        });
    };

    // Submit Update Password
    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        setIsSavingPassword(true);
        setPasswordErrors({});
        setPasswordSuccess('');

        if (passwordData.password !== passwordData.password_confirmation) {
            setPasswordErrors({ password_confirmation: 'Konfirmasi kata sandi tidak cocok dengan kata sandi baru.' });
            setIsSavingPassword(false);
            return;
        }

        router.put('/profile/password', passwordData, {
            preserveScroll: true,
            onSuccess: () => {
                setPasswordSuccess('Kata sandi login berhasil diperbarui! Gunakan kata sandi baru ini untuk login berikutnya.');
                setPasswordData({
                    current_password: '',
                    password: '',
                    password_confirmation: '',
                });
                setTimeout(() => setPasswordSuccess(''), 5000);
            },
            onError: (errs) => {
                setPasswordErrors(errs);
            },
            onFinish: () => {
                setIsSavingPassword(false);
            },
        });
    };

    return (
        <div 
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/75 backdrop-blur-2xs animate-fadeIn"
        >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
                {/* Header Gradient */}
                <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center space-x-2.5">
                        <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-sm text-white flex items-center space-x-2">
                                <span>Pengaturan Profil & Akun</span>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                                    {role?.replace('_', ' ')}
                                </span>
                            </h3>
                            <p className="text-[11px] text-slate-300">
                                Kelola biodata pribadi dan kata sandi akses akun Anda secara mandiri
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                            ESC
                        </span>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-2.5 gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 ${
                            activeTab === 'profile'
                                ? 'bg-white text-emerald-800 border-emerald-600 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
                        }`}
                    >
                        <User className="w-3.5 h-3.5" />
                        <span>Profil & Biodata</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('password')}
                        className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 ${
                            activeTab === 'password'
                                ? 'bg-white text-emerald-800 border-emerald-600 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
                        }`}
                    >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Ganti Kata Sandi</span>
                    </button>
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="p-5 overflow-y-auto space-y-4 text-xs">
                    {/* TAB 1: EDIT PROFIL */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            {/* Alert Sukses */}
                            {profileSuccess && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center space-x-2 animate-fadeIn">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span className="font-bold text-[11px]">{profileSuccess}</span>
                                </div>
                            )}

                            {/* Info Kredensial Tidak Dapat Diubah Sembarangan */}
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">No. Identitas / NIP / NIM</span>
                                    <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block truncate">
                                        {user.identity_number || user.username || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Username Login</span>
                                    <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block truncate">
                                        @{user.username || '-'}
                                    </span>
                                </div>
                                {user.study_program && (
                                    <div className="col-span-2 pt-1.5 border-t border-slate-200/60">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Homebase / Program Studi</span>
                                        <span className="font-bold text-slate-700 text-xs mt-0.5 block">
                                            {user.study_program}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Nama Lengkap & Gelar */}
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">
                                    Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                                        placeholder="Contoh: Dr. Ahmad Fauzi, M.Pd.I"
                                    />
                                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                </div>
                                {profileErrors.name && (
                                    <p className="text-rose-600 text-[11px] mt-1 font-semibold">{profileErrors.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">
                                    Alamat Email Aktif <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition font-mono"
                                        placeholder="nama@staialittihad.ac.id"
                                    />
                                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                </div>
                                {profileErrors.email && (
                                    <p className="text-rose-600 text-[11px] mt-1 font-semibold">{profileErrors.email}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Nomor WhatsApp / HP */}
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">
                                        Nomor WhatsApp / HP
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={profileData.phone_number}
                                            onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition font-mono"
                                            placeholder="Contoh: 081234567890"
                                        />
                                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                    </div>
                                    {profileErrors.phone_number && (
                                        <p className="text-rose-600 text-[11px] mt-1 font-semibold">{profileErrors.phone_number}</p>
                                    )}
                                </div>

                                {/* Jenis Kelamin */}
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">
                                        Jenis Kelamin
                                    </label>
                                    <select
                                        value={profileData.gender}
                                        onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
                                    >
                                        <option value="L">Laki-laki (L)</option>
                                        <option value="P">Perempuan (P)</option>
                                    </select>
                                    {profileErrors.gender && (
                                        <p className="text-rose-600 text-[11px] mt-1 font-semibold">{profileErrors.gender}</p>
                                    )}
                                </div>
                            </div>

                            {/* Tombol Simpan Profil */}
                            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingProfile}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TAB 2: GANTI PASSWORD */}
                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            {/* Alert Sukses */}
                            {passwordSuccess && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center space-x-2 animate-fadeIn">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span className="font-bold text-[11px]">{passwordSuccess}</span>
                                </div>
                            )}

                            {/* Security Notice */}
                            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-start space-x-2.5">
                                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold">Keamanan Akun Pengguna</span>
                                    <p className="text-[10px] text-amber-800/80 mt-0.5 leading-relaxed">
                                        Masukkan kata sandi saat ini untuk verifikasi kepemilikan akun sebelum membuat kata sandi baru.
                                    </p>
                                </div>
                            </div>

                            {/* Kata Sandi Lama */}
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">
                                    Kata Sandi Saat Ini <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        required
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition font-mono"
                                        placeholder="Masukkan kata sandi lama Anda"
                                    />
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {passwordErrors.current_password && (
                                    <p className="text-rose-600 text-[11px] mt-1 font-semibold flex items-center space-x-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span>{passwordErrors.current_password}</span>
                                    </p>
                                )}
                            </div>

                            {/* Kata Sandi Baru */}
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">
                                    Kata Sandi Baru (Min. 6 Karakter) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        required
                                        value={passwordData.password}
                                        onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                        className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition font-mono"
                                        placeholder="Ketik kata sandi baru yang aman"
                                    />
                                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {passwordErrors.password && (
                                    <p className="text-rose-600 text-[11px] mt-1 font-semibold">{passwordErrors.password}</p>
                                )}
                            </div>

                            {/* Konfirmasi Kata Sandi Baru */}
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">
                                    Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        value={passwordData.password_confirmation}
                                        onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                                        className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition font-mono"
                                        placeholder="Ketik ulang kata sandi baru"
                                    />
                                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {passwordErrors.password_confirmation && (
                                    <p className="text-rose-600 text-[11px] mt-1 font-semibold">{passwordErrors.password_confirmation}</p>
                                )}
                            </div>

                            {/* Tombol Update Password */}
                            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingPassword}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <Lock className="w-4 h-4" />
                                    <span>{isSavingPassword ? 'Menyimpan...' : 'Perbarui Kata Sandi'}</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
