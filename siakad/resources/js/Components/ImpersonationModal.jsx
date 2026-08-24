import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ShieldAlert, ShieldCheck, X, ArrowRight, UserCheck, Sparkles, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';

export default function ImpersonationModal({ isOpen, onClose, targetUser }) {
    const { auth } = usePage().props;
    const currentUser = auth?.user || {};
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen || !targetUser) return null;

    // Aturan Hak Akses:
    // Superadmin: Semua role
    // Admin BAAK (admin_akademik): Hanya mahasiswa, dosen, dosen_pa
    const isSuperadmin = currentUser.role === 'superadmin';
    const isAdminAkademik = currentUser.role === 'admin_akademik';
    const allowedRolesForAdmin = ['mahasiswa', 'dosen', 'dosen_pa'];
    const isDeniedForAdmin = isAdminAkademik && !allowedRolesForAdmin.includes(targetUser.role);

    const handleConfirm = () => {
        if (isDeniedForAdmin) return;
        setSubmitting(true);
        router.post(`/impersonate/${targetUser.id}`, {}, {
            onFinish: () => {
                setSubmitting(false);
                onClose();
            },
        });
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'superadmin':
                return 'bg-purple-100 text-purple-900 border-purple-300';
            case 'admin_akademik':
                return 'bg-blue-100 text-blue-900 border-blue-300';
            case 'keuangan':
                return 'bg-amber-100 text-amber-900 border-amber-300';
            case 'kaprodi':
                return 'bg-indigo-100 text-indigo-900 border-indigo-300';
            case 'dosen_pa':
            case 'dosen':
                return 'bg-emerald-100 text-emerald-900 border-emerald-300';
            case 'mahasiswa':
                return 'bg-teal-100 text-teal-900 border-teal-300';
            default:
                return 'bg-slate-100 text-slate-900 border-slate-300';
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop Blur Overlay */}
            <div 
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            ></div>

            <div className="min-h-full flex items-center justify-center p-4">
                {/* Modal Container */}
                <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
                    {/* Header Decorative Background */}
                    <div className={`px-6 py-5 text-white relative ${
                        isDeniedForAdmin 
                            ? 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-900' 
                            : 'bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl shadow-lg font-black shrink-0">
                                    🎭
                                </div>
                                <div>
                                    <h3 className="text-base font-black tracking-tight text-white flex items-center space-x-2">
                                        <span>Konfirmasi Mode Menyamar</span>
                                        <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                                            {isSuperadmin ? 'Superadmin' : 'Admin BAAK'}
                                        </span>
                                    </h3>
                                    <p className="text-[11px] text-purple-200 mt-0.5">
                                        Audit tampilan, hak akses & fitur dari perspektif akun pengguna
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 space-y-5 text-xs">
                        {/* Target User Info Card */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0 ring-2 ring-purple-500/30">
                                {targetUser.name ? targetUser.name.charAt(0) : 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-sm font-black text-slate-900 truncate">
                                        {targetUser.name}
                                    </h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getRoleColor(targetUser.role)}`}>
                                        {targetUser.role?.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                                    ID/NIM/NIDN: <span className="font-bold text-slate-700">{targetUser.identity_number || targetUser.username || '-'}</span>
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">
                                    {targetUser.study_program || targetUser.email}
                                </p>
                            </div>
                        </div>

                        {/* Denied Warning for Admin BAAK */}
                        {isDeniedForAdmin ? (
                            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-rose-900">
                                <div className="flex items-center space-x-2">
                                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                                    <h4 className="font-black text-xs">Batasan Hak Akses Menyamar Admin BAAK</h4>
                                </div>
                                <p className="text-[11px] leading-relaxed text-rose-800">
                                    Sebagai <strong>Admin BAAK</strong>, Anda hanya diizinkan untuk menyamar ke akun <strong>Dosen</strong> dan <strong>Mahasiswa</strong> untuk membantu asistensi akademik. Anda tidak diizinkan menyamar ke akun <strong>{targetUser.role?.toUpperCase()}</strong>.
                                </p>
                            </div>
                        ) : (
                            /* Audit & Security Notes */
                            <div className="space-y-2">
                                <div className="p-3 bg-purple-50 border border-purple-200/80 rounded-xl flex items-start space-x-2.5 text-purple-900">
                                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                                    <div className="text-[11px] leading-relaxed">
                                        <strong className="font-bold">Akses Penuh Sesuai Peran:</strong> Anda akan beralih navigasi dan melihat seluruh menu, data perkuliahan, formulir, serta tombol aksi persis seperti pengguna ini.
                                    </div>
                                </div>

                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2.5 text-amber-900">
                                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div className="text-[11px] leading-relaxed">
                                        <strong className="font-bold">Keamanan Terjamin:</strong> Banner emas akan tetap melayang di atas layar. Anda dapat mengklik tombol <span className="underline font-bold">"Kembali ke Admin"</span> kapan saja.
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition text-xs cursor-pointer"
                            >
                                {isDeniedForAdmin ? 'Tutup' : 'Batal'}
                            </button>
                            {!isDeniedForAdmin && (
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    disabled={submitting}
                                    className="px-5 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl font-black transition text-xs shadow-lg shadow-purple-900/20 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                                >
                                    <span>{submitting ? 'Memproses Masuk...' : '🎭 Mulai Menyamar Sekarang'}</span>
                                    {!submitting && <ArrowRight className="w-3.5 h-3.5" />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
