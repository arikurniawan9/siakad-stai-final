import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { FileText, Printer, CheckCircle2, QrCode, Award, GraduationCap } from 'lucide-react';

export default function KhsIndex({ academicPeriods, selectedPeriodId, selectedPeriod, grades, summary }) {
    const handlePeriodChange = (periodId) => {
        router.get('/student/khs', { period_id: periodId }, { preserveState: true });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout title="Kartu Hasil Studi (KHS)">
            <Head title="Kartu Hasil Studi" />

            <div className="space-y-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Kartu Hasil Studi (KHS) Digital</h2>
                        <p className="text-xs text-slate-500">Laporan capaian nilai akademik resmi terverifikasi tanda tangan digital STAI Al-Ittihad.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <select
                            value={selectedPeriodId}
                            onChange={(e) => handlePeriodChange(e.target.value)}
                            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                            {academicPeriods.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Cetak KHS (PDF)</span>
                        </button>
                    </div>
                </div>

                {/* KHS OFFICIAL DOCUMENT CARD */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-lg space-y-6 text-xs text-slate-800">
                    {/* Document Official Header */}
                    <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <img 
                                src="/logostai.png" 
                                alt="Logo STAI Al-Ittihad" 
                                className="w-14 h-14 object-contain shrink-0" 
                            />
                            <div>
                                <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide">
                                    SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR
                                </h1>
                                <p className="text-xs font-bold text-emerald-800">BIRO ADMINISTRASI AKADEMIK & KEMAHASISWAAN (BAAK)</p>
                                <p className="text-[11px] text-slate-500">Kampus Terpadu: Jl. Raya Bandung Km. 03 Bojong, Karangtengah, Cianjur • Website: www.staialittihad.ac.id</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center py-2">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest underline">KARTU HASIL STUDI (KHS)</h2>
                        <p className="text-xs font-bold text-slate-600 mt-0.5">{selectedPeriod?.name?.toUpperCase()}</p>
                    </div>

                    {/* Student Identity Grid */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="space-y-1">
                            <p><span className="font-bold text-slate-600">Nama Mahasiswa:</span> Ahmad Fauzi Rahman</p>
                            <p><span className="font-bold text-slate-600">Nomor Induk (NIM):</span> 21.01.0042</p>
                            <p><span className="font-bold text-slate-600">Program Studi:</span> Pendidikan Agama Islam (S1)</p>
                        </div>
                        <div className="space-y-1 text-right sm:text-left">
                            <p><span className="font-bold text-slate-600">Fakultas:</span> Fakultas Tarbiyah dan Keguruan</p>
                            <p><span className="font-bold text-slate-600">Tahun Angkatan:</span> 2024</p>
                            <p><span className="font-bold text-slate-600">Dosen Pembimbing PA:</span> Dra. Hj. Siti Maryam, M.Pd.I</p>
                        </div>
                    </div>

                    {/* Grades Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse border border-slate-300">
                            <thead>
                                <tr className="bg-slate-100 text-slate-800 font-black uppercase text-[11px]">
                                    <th className="border border-slate-300 py-2.5 px-3 text-center w-10">No</th>
                                    <th className="border border-slate-300 py-2.5 px-3">Kode MK</th>
                                    <th className="border border-slate-300 py-2.5 px-3">Mata Kuliah</th>
                                    <th className="border border-slate-300 py-2.5 px-3 text-center">SKS</th>
                                    <th className="border border-slate-300 py-2.5 px-3 text-center">Nilai Angka</th>
                                    <th className="border border-slate-300 py-2.5 px-3 text-center">Huruf Mutu</th>
                                    <th className="border border-slate-300 py-2.5 px-3 text-center">Bobot</th>
                                    <th className="border border-slate-300 py-2.5 px-3 text-center">Mutu (K x N)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grades.map((g, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="border border-slate-300 py-2 px-3 text-center font-bold">{idx + 1}</td>
                                        <td className="border border-slate-300 py-2 px-3 font-mono font-bold">{g.code}</td>
                                        <td className="border border-slate-300 py-2 px-3 font-bold">{g.name}</td>
                                        <td className="border border-slate-300 py-2 px-3 text-center font-bold">{g.credits}</td>
                                        <td className="border border-slate-300 py-2 px-3 text-center font-medium">{g.final_score}</td>
                                        <td className="border border-slate-300 py-2 px-3 text-center font-black text-emerald-800">{g.grade_letter}</td>
                                        <td className="border border-slate-300 py-2 px-3 text-center font-bold">{g.grade_point.toFixed(2)}</td>
                                        <td className="border border-slate-300 py-2 px-3 text-center font-black">{(g.credits * g.grade_point).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Calculation Box */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">SKS Semester</p>
                            <p className="text-lg font-black text-slate-900">{summary.semester_credits} SKS</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">IP Semester (IPS)</p>
                            <p className="text-lg font-black text-emerald-700">{summary.semester_gpa.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Total SKS Kumulatif</p>
                            <p className="text-lg font-black text-slate-900">{summary.cumulative_credits} SKS</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">IP Kumulatif (IPK)</p>
                            <p className="text-lg font-black text-emerald-700">{summary.cumulative_gpa.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Digital Signatures & QR Verification */}
                    <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
                        {/* QR Code Verification */}
                        <a
                            href={`/verify/${summary.qr_hash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center space-x-3 p-3 bg-slate-50 hover:bg-emerald-50/60 rounded-xl border border-slate-200 hover:border-emerald-300 transition group cursor-pointer"
                        >
                            <div className="p-2 bg-white rounded-lg border border-slate-200 group-hover:border-emerald-400">
                                <QrCode className="w-10 h-10 text-slate-900 group-hover:text-emerald-700" />
                            </div>
                            <div>
                                <p className="text-[10px] font-mono font-bold text-slate-400">Verifikasi Dokumen Asli (Klik untuk Cek)</p>
                                <p className="text-[10px] font-mono text-emerald-800 truncate max-w-xs">{summary.qr_hash}</p>
                                <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-600 font-bold mt-0.5">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Tervalidasi Sistem SIAKAD STAI Al-Ittihad</span>
                                </span>
                            </div>
                        </a>

                        {/* Signature Box */}
                        <div className="text-center sm:text-right">
                            <p className="text-xs text-slate-600">Cianjur, 24 Agustus 2026</p>
                            <p className="text-xs font-bold text-slate-800 mt-1">Ketua Program Studi PAI</p>
                            <div className="h-12 flex items-center justify-center sm:justify-end">
                                <span className="text-[11px] text-emerald-800 font-mono font-bold italic">[Tanda Tangan Digital Terverifikasi]</span>
                            </div>
                            <p className="text-xs font-black text-slate-900 underline">Dr. Ahmad Syafi'i, M.Ag</p>
                            <p className="text-[10px] text-slate-500 font-mono">NIDN: 2118097201</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
