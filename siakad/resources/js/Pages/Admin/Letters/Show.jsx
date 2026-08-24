import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Printer, ArrowLeft, CheckCircle2, QrCode, 
    Landmark, ExternalLink, Award, FileText
} from 'lucide-react';

export default function LetterShow({ letter }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout title="Cetak Surat Keterangan Aktif Kuliah">
            <Head title={`Surat Keterangan ${letter.student_name} — SIAKAD`} />

            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header Navbar (Hidden on Print) */}
                <div className="flex items-center justify-between print:hidden">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/admin/letters"
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Surat Keterangan Aktif Kuliah</h2>
                            <p className="text-xs font-mono text-slate-500">{letter.letter_number}</p>
                        </div>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Cetak Dokumen Resmi (PDF)</span>
                    </button>
                </div>

                {/* OFFICIAL LETTER DOCUMENT CARD (Window.print ready) */}
                <div className="bg-white rounded-2xl border border-slate-300 p-8 sm:p-12 shadow-md space-y-6 text-slate-900 text-xs sm:text-sm font-serif leading-relaxed">
                    {/* Institutional Letterhead (Kop Surat Resmi) */}
                    <div className="border-b-2 border-double border-slate-900 pb-4 flex items-center space-x-4">
                        <div className="w-16 h-16 bg-emerald-800 rounded-2xl flex items-center justify-center font-black text-white text-3xl font-sans shrink-0 shadow">
                            S
                        </div>
                        <div className="text-center flex-1 space-y-0.5 font-sans">
                            <h2 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                                YAYASAN PENDIDIKAN ISLAM AL-ITTIHAD CIANJUR
                            </h2>
                            <h1 className="text-base sm:text-lg font-black uppercase text-slate-950 tracking-wide">
                                SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD
                            </h1>
                            <p className="text-xs font-bold text-emerald-800">
                                BIRO ADMINISTRASI AKADEMIK, KEMAHASISWAAN & KEUANGAN (BAAKK)
                            </p>
                            <p className="text-[10px] text-slate-500 font-sans">
                                Jl. Bojong Herang No. 12 Cianjur • Telp: (0263) 228192 • Website: www.staialittihad.ac.id • Email: info@staialittihad.ac.id
                            </p>
                        </div>
                    </div>

                    {/* Letter Title */}
                    <div className="text-center py-2 space-y-1 font-sans">
                        <h2 className="text-sm sm:text-base font-black uppercase tracking-widest underline text-slate-950">
                            SURAT KETERANGAN AKTIF KULIAH
                        </h2>
                        <p className="text-xs font-mono font-bold text-slate-700">Nomor: {letter.letter_number}</p>
                    </div>

                    {/* Body Intro */}
                    <p>
                        Yang bertanda tangan di bawah ini, Wakil Ketua I Bidang Akademik Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur, dengan ini menerangkan bahwa:
                    </p>

                    {/* Student Identity Grid */}
                    <div className="pl-6 space-y-2 font-sans text-xs sm:text-sm">
                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-bold text-slate-700">Nama Lengkap</span>
                            <span className="col-span-2 font-black text-slate-900">: {letter.student_name}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-bold text-slate-700">Nomor Induk Mahasiswa (NIM)</span>
                            <span className="col-span-2 font-mono font-bold text-slate-900">: {letter.student_nim}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-bold text-slate-700">Tempat / Tgl. Lahir</span>
                            <span className="col-span-2 text-slate-900">: {letter.birth_info}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-bold text-slate-700">Program Studi</span>
                            <span className="col-span-2 font-bold text-emerald-900">: {letter.study_program}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-bold text-slate-700">Fakultas</span>
                            <span className="col-span-2 text-slate-900">: {letter.faculty}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-bold text-slate-700">Semester / Tahun Akademik</span>
                            <span className="col-span-2 font-bold text-slate-900">: Semester {letter.semester_level} • TA {letter.academic_year}</span>
                        </div>
                    </div>

                    {/* Statement Paragraph */}
                    <p>
                        Adalah benar mahasiswa aktif yang terdaftar secara sah pada Pangkalan Data Pendidikan Tinggi (PDDIKTI) dan saat ini sedang menempuh perkuliahan pada Semester Ganjil Tahun Akademik 2026/2027 di STAI Al-Ittihad Cianjur.
                    </p>
                    <p>
                        Surat keterangan ini diberikan kepada yang bersangkutan untuk dipergunakan sebagai: <strong className="font-sans font-bold underline text-slate-950">{letter.purpose}</strong>.
                    </p>
                    <p>
                        Demikian surat keterangan ini kami terbitkan dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.
                    </p>

                    {/* Signatures & QR Verification */}
                    <div className="pt-6 grid grid-cols-2 items-center gap-6 font-sans">
                        {/* QR Verification Seal */}
                        <a
                            href={`/verify/${letter.qr_hash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-3 hover:border-emerald-300 transition"
                        >
                            <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                                <QrCode className="w-10 h-10 text-slate-900" />
                            </div>
                            <div className="text-[10px] space-y-0.5">
                                <p className="font-bold text-slate-400">Verifikasi Dokumen Resmi</p>
                                <p className="font-mono text-emerald-800 font-bold truncate max-w-xs">{letter.qr_hash}</p>
                                <span className="inline-flex items-center space-x-1 text-emerald-600 font-bold">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Tervalidasi Sistem SIAKAD</span>
                                </span>
                            </div>
                        </a>

                        {/* Signatory Box */}
                        <div className="text-right space-y-1">
                            <p className="text-xs text-slate-600">Cianjur, {letter.issue_date}</p>
                            <p className="text-xs font-bold text-slate-900">{letter.signatory_role}</p>
                            <div className="h-14 flex items-center justify-end">
                                <span className="text-[11px] font-mono text-emerald-800 font-bold italic">[Tanda Tangan Digital Terverifikasi]</span>
                            </div>
                            <p className="text-xs font-black text-slate-950 underline">{letter.signatory_name}</p>
                            <p className="text-[10px] font-mono text-slate-500">NIDN: {letter.signatory_nidn}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
