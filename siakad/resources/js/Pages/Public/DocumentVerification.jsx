import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    ShieldCheck, CheckCircle2, QrCode, Award, GraduationCap, 
    FileText, Calendar, User, Landmark, ExternalLink, ArrowLeft,
    Lock, Sparkles
} from 'lucide-react';

export default function DocumentVerification({ document }) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 py-10 px-4 sm:px-6 flex flex-col justify-between font-sans text-slate-800">
            <Head title="Verifikasi Dokumen Resmi — STAI Al-Ittihad" />

            <div className="max-w-2xl mx-auto w-full space-y-6">
                {/* Header Logo */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 text-white font-black text-3xl shadow-xl shadow-emerald-900/50 border border-emerald-400/30">
                        S
                    </div>
                    <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                        PORTAL VERIFIKASI DOKUMEN DIGITAL
                    </h1>
                    <p className="text-xs text-emerald-300 font-medium">
                        Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur
                    </p>
                </div>

                {/* Main Security Verification Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-500/30">
                    {/* Top Security Status Ribbon */}
                    <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 p-5 text-white flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                <ShieldCheck className="w-8 h-8 text-emerald-200" />
                            </div>
                            <div>
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 font-mono text-[10px] font-black tracking-widest uppercase">
                                    TERVALIDASI RESMI
                                </span>
                                <h2 className="text-sm sm:text-base font-black mt-0.5">DOKUMEN ASLI TERVERIFIKASI</h2>
                            </div>
                        </div>
                        <div className="text-right hidden sm:block">
                            <span className="text-[10px] text-emerald-200 font-mono block">Waktu Verifikasi:</span>
                            <span className="text-[11px] font-bold">{document.verified_at}</span>
                        </div>
                    </div>

                    {/* Document Details Body */}
                    <div className="p-6 sm:p-8 space-y-6 text-xs">
                        <div className="border-b border-slate-100 pb-4">
                            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">Jenis Dokumen:</span>
                            <h3 className="text-base font-black text-slate-900">{document.document_type}</h3>
                            <p className="text-[11px] font-mono text-emerald-800 font-bold mt-0.5">{document.document_number}</p>
                        </div>

                        {/* Student Academic Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Nama Mahasiswa</span>
                                <p className="text-sm font-black text-slate-900">{document.student_name}</p>
                                <p className="text-xs font-mono font-bold text-slate-600 mt-0.5">NIM: {document.student_nim}</p>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Program Studi & Fakultas</span>
                                <p className="text-xs font-bold text-slate-900">{document.study_program}</p>
                                <p className="text-[11px] text-slate-500">{document.faculty}</p>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Periode Semester</span>
                                <p className="text-xs font-bold text-slate-800">{document.academic_period}</p>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Capaian Akademik</span>
                                <p className="text-xs font-black text-emerald-700">
                                    IPS: {document.semester_gpa} • IPK: {document.cumulative_gpa} ({document.total_credits} SKS)
                                </p>
                            </div>
                        </div>

                        {/* Signatory & Digital Signature */}
                        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <span className="text-[10px] text-emerald-800 font-bold uppercase block">Pejabat Pengesah:</span>
                                <p className="text-xs font-black text-slate-900">{document.signatory_name}</p>
                                <p className="text-[11px] text-slate-600">{document.signatory_role} (NIDN: {document.signatory_nidn})</p>
                            </div>
                            <div className="sm:text-right">
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-mono font-bold shadow-xs">
                                    <Lock className="w-3 h-3" />
                                    <span>Tanda Tangan Digital Terverifikasi</span>
                                </span>
                            </div>
                        </div>

                        {/* Hash & Security Signature */}
                        <div className="space-y-1">
                            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">Cryptographic Hash Signature:</span>
                            <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-xl break-all">
                                {document.hash}
                            </div>
                        </div>
                    </div>

                    {/* Footer Card */}
                    <div className="p-4 bg-slate-100 border-t border-slate-200 text-center text-[11px] text-slate-500">
                        Dokumen ini diterbitkan secara elektronik oleh Sistem Informasi Akademik (SIAKAD) STAI Al-Ittihad Cianjur dan memiliki kekuatan hukum yang sah.
                    </div>
                </div>

                {/* Back Link */}
                <div className="text-center pt-2">
                    <Link
                        href="/login"
                        className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Halaman Login SIAKAD</span>
                    </Link>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="text-center text-slate-500 text-[11px] pt-6">
                © 2026 STAI Al-Ittihad Cianjur • Lembaga Layanan Pendidikan Tinggi Keagamaan Islam
            </div>
        </div>
    );
}
