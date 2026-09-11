import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    GraduationCap, Printer, CheckCircle2, Award, 
    FileText, QrCode, ShieldCheck, Download
} from 'lucide-react';

export default function TranscriptsIndex({ 
    student = {}, 
    semesters = {}, 
    summary = {}, 
    signatory = {} 
}) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout title="Transkrip Nilai Akademik (8 Semester)">
            <Head title="Transkrip Nilai Akademik" />

            <div className="space-y-6 max-w-5xl mx-auto">
                {/* Action Bar (Hidden on Print) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                    <div>
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black mb-1">
                            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                            <span>TRANSKRIP AKADEMIK LENGKAP 8 SEMESTER</span>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                            Transkrip Prestasi Akademik Mahasiswa
                        </h2>
                        <p className="text-xs text-slate-500">
                            Rekapitulasi capaian nilai seluruh semester (1 s.d. 8) berstandar borang akreditasi & PDDIKTI.
                        </p>
                    </div>

                    <div className="flex items-center space-x-2.5">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                        >
                            <Printer className="w-4 h-4 text-slate-300" />
                            <span>Cetak Transkrip (PDF)</span>
                        </button>
                    </div>
                </div>

                {/* OFFICIAL TRANSCRIPT DOCUMENT */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-lg space-y-6 text-xs text-slate-800 print:shadow-none print:border-none print:p-0">
                    {/* Kop Institusi Resmi */}
                    <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <img 
                                src="/logostai.png" 
                                alt="Logo STAI Al-Ittihad" 
                                className="w-16 h-16 object-contain shrink-0" 
                            />
                            <div>
                                <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide">
                                    SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR
                                </h1>
                                <p className="text-xs font-bold text-emerald-800">
                                    BIRO ADMINISTRASI AKADEMIK & SISTEM INFORMASI (BAAK)
                                </p>
                                <p className="text-[10px] text-slate-500">
                                    Jl. Raya Bandung Km. 03 Bojong, Karangtengah, Cianjur, Jawa Barat 43281 • www.stai-alittihad.ac.id
                                </p>
                            </div>
                        </div>
                        <div className="hidden sm:block text-right text-[10px] font-mono text-slate-400">
                            <p className="font-bold text-slate-700">DOKUMEN RESMI</p>
                            <p>No: TR/{new Date().getFullYear()}/STAI/{student.nim}</p>
                        </div>
                    </div>

                    {/* Judul Dokumen */}
                    <div className="text-center space-y-1 py-1">
                        <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-widest border-b inline-block border-slate-900 pb-0.5">
                            TRANSKRIP PRESTASI AKADEMIK MAHASISWA
                        </h2>
                        <p className="text-[11px] font-bold text-slate-600 font-mono">
                            PROGRAM SARJANA (STRATA-1)
                        </p>
                    </div>

                    {/* Biodata Mahasiswa */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium print:bg-transparent print:p-0 print:border-none">
                        <div className="flex">
                            <span className="w-32 text-slate-500 font-semibold">Nama Mahasiswa</span>
                            <span className="text-slate-900 font-bold">: {student.name}</span>
                        </div>
                        <div className="flex">
                            <span className="w-32 text-slate-500 font-semibold">Program Studi</span>
                            <span className="text-slate-900 font-bold">: {student.study_program}</span>
                        </div>
                        <div className="flex">
                            <span className="w-32 text-slate-500 font-semibold">Nomor Induk (NIM)</span>
                            <span className="text-slate-900 font-mono font-bold">: {student.nim}</span>
                        </div>
                        <div className="flex">
                            <span className="w-32 text-slate-500 font-semibold">Fakultas</span>
                            <span className="text-slate-900">: {student.faculty}</span>
                        </div>
                        <div className="flex">
                            <span className="w-32 text-slate-500 font-semibold">Nomor Induk (NIK)</span>
                            <span className="text-slate-900 font-mono">: {student.nik}</span>
                        </div>
                        <div className="flex">
                            <span className="w-32 text-slate-500 font-semibold">Gelar Akademik</span>
                            <span className="text-emerald-700 font-bold">: {student.degree}</span>
                        </div>
                        <div className="flex">
                            <span className="w-32 text-slate-500 font-semibold">Tempat, Tgl Lahir</span>
                            <span className="text-slate-900">: {student.place_birth}, {student.date_birth}</span>
                        </div>
                        <div className="flex">
                            <span className="w-32 text-slate-500 font-semibold">Tahun Masuk</span>
                            <span className="text-slate-900 font-mono">: {student.entry_year}</span>
                        </div>
                    </div>

                    {/* Rekap 8 Semester (Grid 2 Kolom) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
                        {Object.entries(semesters).map(([semNum, semData]) => (
                            <div key={semNum} className="border border-slate-200 rounded-xl overflow-hidden print:border-slate-300">
                                <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 flex justify-between items-center text-[11px] font-bold text-slate-900">
                                    <span>{semData.name}</span>
                                    <span className="text-[10px] text-slate-600 font-mono">
                                        {semData.semester_credits} SKS • IPS: {semData.semester_ips}
                                    </span>
                                </div>
                                <table className="w-full text-[11px]">
                                    <thead className="bg-slate-50 text-slate-500 text-[9px] uppercase border-b border-slate-100 font-bold">
                                        <tr>
                                            <th className="px-2.5 py-1 text-left">Kode</th>
                                            <th className="px-2.5 py-1 text-left">Mata Kuliah</th>
                                            <th className="px-2 py-1 text-center">SKS</th>
                                            <th className="px-2 py-1 text-center">Nilai</th>
                                            <th className="px-2 py-1 text-center">Mutu</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {semData.courses.map((c, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50">
                                                <td className="px-2.5 py-1 font-mono text-[10px] text-slate-500">{c.code}</td>
                                                <td className="px-2.5 py-1 font-medium text-slate-800 truncate max-w-[170px]" title={c.name}>
                                                    {c.name}
                                                </td>
                                                <td className="px-2 py-1 text-center font-mono">{c.credits}</td>
                                                <td className="px-2 py-1 text-center font-bold text-emerald-700">{c.grade}</td>
                                                <td className="px-2 py-1 text-center font-mono text-slate-600">
                                                    {(c.credits * c.point).toFixed(1)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>

                    {/* Ringkasan IPK & Kelulusan */}
                    <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 print:bg-slate-100 print:text-slate-900 print:border print:border-slate-300">
                        <div className="flex items-center space-x-6">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Total SKS Lulus</p>
                                <p className="text-xl font-black text-white print:text-slate-900">
                                    {summary.total_credits} <span className="text-xs font-normal text-slate-400">/ {summary.required_credits} SKS</span>
                                </p>
                            </div>
                            <div className="h-8 w-px bg-slate-700 print:bg-slate-300" />
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Indeks Prestasi Kumulatif (IPK)</p>
                                <p className="text-2xl font-black text-amber-400 print:text-emerald-700 font-mono">
                                    {summary.ipk}
                                </p>
                            </div>
                            <div className="h-8 w-px bg-slate-700 print:bg-slate-300" />
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Predikat Kelulusan</p>
                                <p className="text-sm font-black text-emerald-400 print:text-slate-900">
                                    {summary.predicate}
                                </p>
                            </div>
                        </div>

                        <div className="text-right text-[10px] text-slate-400 print:text-slate-600 font-mono">
                            <p>Total Mata Kuliah: {summary.total_courses}</p>
                            <p>Status: LULUS YUDISIUM</p>
                        </div>
                    </div>

                    {/* Lembar Tanda Tangan & QR Verification */}
                    <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-16 h-16 p-1 bg-white border border-slate-300 rounded-lg flex items-center justify-center">
                                <QrCode className="w-14 h-14 text-slate-800" />
                            </div>
                            <div className="text-[10px] text-slate-500 space-y-0.5">
                                <p className="font-bold text-slate-800">Verifikasi Dokumen Digital</p>
                                <p>Pindai QR untuk memeriksa keabsahan transkrip resmi.</p>
                                <p className="font-mono text-indigo-700">siakad.stai-alittihad.ac.id/verify/{student.nim}</p>
                            </div>
                        </div>

                        <div className="text-right text-xs space-y-1">
                            <p className="text-slate-500">Cianjur, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <p className="font-bold text-slate-800">{signatory.structural_position || 'Ketua STAI Al-Ittihad'}</p>
                            <div className="h-12 flex items-center justify-end">
                                <span className="text-[10px] font-mono font-bold text-emerald-700 px-2 py-0.5 border border-emerald-500/40 rounded bg-emerald-50/50">
                                    ✓ DIGITAL SEALED & SIGNED
                                </span>
                            </div>
                            <p className="font-black text-slate-900 underline">{signatory.official_name || 'Prof. Dr. KH. Abdul Halim, M.A.'}</p>
                            <p className="font-mono text-[10px] text-slate-500">NIP: {signatory.official_nip || '196803151994031002'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
