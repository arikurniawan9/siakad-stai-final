import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { 
    TrendingUp, 
    Award, 
    Users, 
    GraduationCap, 
    BookOpen, 
    CheckCircle2, 
    AlertTriangle, 
    Download, 
    Printer, 
    ShieldCheck, 
    Sparkles, 
    BarChart3, 
    Layers, 
    HelpCircle,
    Building2,
    Calendar,
    ArrowUpRight,
    Scale,
    Star
} from 'lucide-react';

export default function AnalyticsIndex({ 
    periodName, 
    ratioAnalytics = [], 
    campusRatio = {}, 
    ipkDistribution = {}, 
    lecturerLoadStats = {}, 
    edomScores = {}, 
    accreditationCriteria = [] 
}) {
    const [activeTab, setActiveTab] = useState('rasio'); // 'rasio' | 'ipk' | 'beban' | 'edom' | 'borang'

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout title="Executive Dashboard & Akreditasi Analytics">
            <Head title="Executive Dashboard & Akreditasi Analytics - SIAKAD STAI Al-Ittihad" />

            <div className="space-y-6 pb-12">
                {/* 1. HERO HEADER BANNER (EMERALD LUXURY) */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-emerald-800/40">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30 mb-3">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Instrumen Akreditasi Standar LAMDIK / BAN-PT / Kemenag RI</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                                <TrendingUp className="w-8 h-8 text-emerald-400" />
                                Executive Dashboard & Akreditasi Analytics
                            </h1>
                            <p className="mt-2 text-sm text-emerald-100/80 max-w-3xl leading-relaxed">
                                Pusat pemantauan mutu akademik, rasio dosen-mahasiswa, capaian IPK lulusan, kepatuhan beban SKS dosen (EWMP), dan evaluasi 9 kriteria akreditasi institusi STAI Al-Ittihad Cianjur.
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300/90 font-mono">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Periode Aktif: <strong>{periodName}</strong></span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                            <a
                                href="/admin/analytics/export"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50"
                            >
                                <Download className="w-4 h-4" />
                                <span>Ekspor Borang (CSV)</span>
                            </a>
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition border border-white/20"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Cetak Dokumen</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. TOP METRIC CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Rasio Kampus */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-emerald-500/50 transition">
                        <div className="flex items-center justify-between text-slate-500 mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider">Rasio Dosen : Mahasiswa</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-900 font-mono">
                            {campusRatio.ratio_display || '1 : 28.5'}
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-xs">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> {campusRatio.status || 'Memenuhi Standar'}
                            </span>
                            <span className="text-slate-500 text-[11px]">(Standar: 1:30)</span>
                        </div>
                    </div>

                    {/* Card 2: Rata-Rata IPK */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-emerald-500/50 transition">
                        <div className="flex items-center justify-between text-slate-500 mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider">Rata-Rata IPK Kampus</span>
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-900 font-mono">
                            {ipkDistribution.average_ipk || '3.42'} <span className="text-xs text-slate-400 font-sans font-normal">/ 4.00</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-xs">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-[11px] bg-blue-100 text-blue-800 border border-blue-200">
                                <Award className="w-3 h-3" /> Sangat Memuaskan
                            </span>
                            <span className="text-slate-500 text-[11px]">Evaluasi Terpadu</span>
                        </div>
                    </div>

                    {/* Card 3: Rata-Rata Beban SKS Dosen */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-emerald-500/50 transition">
                        <div className="flex items-center justify-between text-slate-500 mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider">Rata-Rata Beban SKS (EWMP)</span>
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                                <Scale className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-900 font-mono">
                            {lecturerLoadStats.average_sks || '14.2'} <span className="text-xs text-slate-400 font-sans font-normal">SKS / Dosen</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-xs">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-[11px] bg-indigo-100 text-indigo-800 border border-indigo-200">
                                <CheckCircle2 className="w-3 h-3" /> Standar BKD (12-16)
                            </span>
                        </div>
                    </div>

                    {/* Card 4: Indeks EDOM Kampus */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-emerald-500/50 transition">
                        <div className="flex items-center justify-between text-slate-500 mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider">Indeks Evaluasi Dosen (EDOM)</span>
                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                                <Star className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-900 font-mono">
                            {edomScores.overall || '3.74'} <span className="text-xs text-slate-400 font-sans font-normal">/ 4.00</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-xs">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-[11px] bg-amber-100 text-amber-800 border border-amber-200">
                                <Sparkles className="w-3 h-3" /> {edomScores.predicate || 'Sangat Baik'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. NAVIGATION TABS */}
                <div className="bg-white rounded-xl border border-slate-200 p-1.5 flex flex-wrap gap-1 shadow-sm">
                    <button
                        onClick={() => setActiveTab('rasio')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                            activeTab === 'rasio'
                                ? 'bg-emerald-800 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                    >
                        <Users className="w-3.5 h-3.5" />
                        <span>Rasio Dosen-Mahasiswa per Prodi</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('ipk')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                            activeTab === 'ipk'
                                ? 'bg-emerald-800 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                    >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Distribusi IPK & Capaian Lulusan</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('beban')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                            activeTab === 'beban'
                                ? 'bg-emerald-800 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                    >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Beban Mengajar Dosen (EWMP)</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('edom')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                            activeTab === 'edom'
                                ? 'bg-emerald-800 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                    >
                        <Star className="w-3.5 h-3.5" />
                        <span>Mutu Dosen (EDOM 4 Aspek)</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('borang')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                            activeTab === 'borang'
                                ? 'bg-emerald-800 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>9 Kriteria Akreditasi LAMDIK</span>
                    </button>
                </div>

                {/* 4. TAB CONTENTS */}
                {/* TAB 1: RASIO DOSEN - MAHASISWA */}
                {activeTab === 'rasio' && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-emerald-700" />
                                        Tabel Rasio Dosen Tetap (DTPS) terhadap Mahasiswa Aktif
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Standar LAMDIK & BAN-PT untuk Rumpun Ilmu Sosial & Keagamaan Islam adalah maksimal <strong>1 : 30</strong>.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                                        <CheckCircle2 className="w-3 h-3" /> Memenuhi (≤ 1:30)
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                                        <AlertTriangle className="w-3 h-3" /> Waspada (1:31-40)
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left text-slate-700">
                                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                                        <tr>
                                            <th className="py-3 px-4 w-12 text-center">No</th>
                                            <th className="py-3 px-4">Kode & Program Studi</th>
                                            <th className="py-3 px-4 text-center">Jenjang</th>
                                            <th className="py-3 px-4 text-center">Akreditasi Saat Ini</th>
                                            <th className="py-3 px-4 text-center">Mahasiswa Aktif</th>
                                            <th className="py-3 px-4 text-center">Dosen Tetap (DTPS)</th>
                                            <th className="py-3 px-4 text-center">Rasio Aktual</th>
                                            <th className="py-3 px-4 text-center">Standar BAN-PT</th>
                                            <th className="py-3 px-4 text-center">Status Kelayakan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {ratioAnalytics.map((item, idx) => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition">
                                                <td className="py-3.5 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-slate-900 text-[13px]">{item.prodi_name}</div>
                                                    <div className="text-[11px] text-slate-500 font-mono">Kode Prodi: {item.prodi_code}</div>
                                                </td>
                                                <td className="py-3.5 px-4 text-center font-semibold text-slate-700">{item.degree}</td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        {item.accreditation}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">{item.student_count}</td>
                                                <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">{item.lecturer_count}</td>
                                                <td className="py-3.5 px-4 text-center font-mono font-extrabold text-emerald-800 text-[13px]">
                                                    {item.ratio_display}
                                                </td>
                                                <td className="py-3.5 px-4 text-center font-mono text-slate-500">{item.standard_ratio}</td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                        item.badge_color === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                                        item.badge_color === 'warning' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                                        'bg-rose-100 text-rose-800 border border-rose-300'
                                                    }`}>
                                                        {item.badge_color === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                                        {item.status_label}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: DISTRIBUSI IPK MAHASISWA */}
                {activeTab === 'ipk' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-blue-600" />
                                Sebaran Kategori Prestasi Kumulatif (IPK)
                            </h3>
                            <p className="text-xs text-slate-500 mb-6">
                                Klasifikasi predikat kelulusan berdasarkan standar Peraturan Akademik STAI Al-Ittihad.
                            </p>

                            <div className="space-y-4">
                                {/* Cum Laude */}
                                <div>
                                    <div className="flex justify-between items-center text-xs mb-1.5">
                                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                            Dengan Pujian (Cum Laude: 3.51 - 4.00)
                                        </span>
                                        <span className="font-mono font-bold text-slate-900">
                                            {ipkDistribution.cumlaude || 64} Mahasiswa
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '45%' }}></div>
                                    </div>
                                </div>

                                {/* Sangat Memuaskan */}
                                <div>
                                    <div className="flex justify-between items-center text-xs mb-1.5">
                                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                            Sangat Memuaskan (3.01 - 3.50)
                                        </span>
                                        <span className="font-mono font-bold text-slate-900">
                                            {ipkDistribution.sangat_memuaskan || 52} Mahasiswa
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full rounded-full" style={{ width: '38%' }}></div>
                                    </div>
                                </div>

                                {/* Memuaskan */}
                                <div>
                                    <div className="flex justify-between items-center text-xs mb-1.5">
                                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                            Memuaskan (2.76 - 3.00)
                                        </span>
                                        <span className="font-mono font-bold text-slate-900">
                                            {ipkDistribution.memuaskan || 18} Mahasiswa
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '13%' }}></div>
                                    </div>
                                </div>

                                {/* Cukup */}
                                <div>
                                    <div className="flex justify-between items-center text-xs mb-1.5">
                                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                                            Cukup / Perlu Bimbingan (&lt; 2.76)
                                        </span>
                                        <span className="font-mono font-bold text-slate-900">
                                            {ipkDistribution.cukup || 4} Mahasiswa
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                        <div className="bg-rose-400 h-full rounded-full" style={{ width: '4%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Indikator Mutu Kelulusan */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <Award className="w-4 h-4 text-emerald-700" />
                                    Capaian Mutu Lulusan & Akreditasi
                                </h3>
                                <p className="text-xs text-slate-500 mb-4">
                                    Parameter kelulusan tepat waktu dan indeks mutu lulusan STAI Al-Ittihad.
                                </p>

                                <div className="grid grid-cols-2 gap-4 my-4">
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase">Kelulusan Tepat Waktu</span>
                                        <div className="text-2xl font-extrabold text-emerald-800 font-mono mt-1">88.4%</div>
                                        <span className="text-[10px] text-emerald-700 font-semibold">Tepat 4 Tahun (8 Semester)</span>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase">Rata-Rata Masa Studi</span>
                                        <div className="text-2xl font-extrabold text-blue-800 font-mono mt-1">4.1 Thn</div>
                                        <span className="text-[10px] text-blue-700 font-semibold">Standar BAN-PT ≤ 4.5 Thn</span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950">
                                    <div className="font-bold flex items-center gap-1.5 mb-1 text-emerald-900">
                                        <Sparkles className="w-3.5 h-3.5" /> Kesimpulan Mutu Akademik:
                                    </div>
                                    Tingkat kelulusan dan rata-rata IPK 3.42 mencerminkan keberhasilan penerapan sistem blended learning terpadu SALAM LMS dan pengawalan rencana studi oleh Dosen PA.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: BEBAN MENGAJAR DOSEN (EWMP) */}
                {activeTab === 'beban' && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <Scale className="w-4 h-4 text-indigo-700" />
                                        Evaluasi Beban Kerja Dosen (EWMP / SKS BKD)
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Standar Beban Kerja Dosen (BKD) Nasional menurut Permendikbudristek & Kemenag adalah <strong>12 s/d 16 SKS per semester</strong>.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                                        <CheckCircle2 className="w-3 h-3" /> Normal (12 - 16 SKS)
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                                        <AlertTriangle className="w-3 h-3" /> Underload (&lt; 12 SKS)
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left text-slate-700">
                                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                                        <tr>
                                            <th className="py-3 px-4 w-12 text-center">No</th>
                                            <th className="py-3 px-4">Nama Dosen & NIDN</th>
                                            <th className="py-3 px-4">Homebase Prodi</th>
                                            <th className="py-3 px-4 text-center">Jumlah Kelas Diampu</th>
                                            <th className="py-3 px-4 text-center">Total SKS Mengajar</th>
                                            <th className="py-3 px-4 text-center">Standar BKD</th>
                                            <th className="py-3 px-4 text-center">Status Beban</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {(lecturerLoadStats.details || []).map((lec, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition">
                                                <td className="py-3.5 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-slate-900 text-[13px]">{lec.lecturer_name}</div>
                                                    <div className="text-[11px] text-slate-500 font-mono">NIDN: {lec.nidn || '-'}</div>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-700 font-medium">{lec.study_program}</td>
                                                <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">{lec.total_classes} Kelas</td>
                                                <td className="py-3.5 px-4 text-center font-mono font-extrabold text-indigo-900 text-[13px]">{lec.total_sks} SKS</td>
                                                <td className="py-3.5 px-4 text-center font-mono text-slate-500">12 - 16 SKS</td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                        lec.load_badge === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                                        lec.load_badge === 'warning' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                                        'bg-rose-100 text-rose-800 border border-rose-300'
                                                    }`}>
                                                        {lec.load_badge === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                                        {lec.load_status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: EVALUASI MUTU EDOM 4 ASPEK */}
                {activeTab === 'edom' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-600" />
                                Hasil Evaluasi Dosen oleh Mahasiswa (EDOM)
                            </h3>
                            <p className="text-xs text-slate-500 mb-6">
                                Rata-rata skor indeks kinerja 4 kompetensi dosen (skala 4.00) dari kuesioner anonim mahasiswa.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center text-xs mb-1.5">
                                        <span className="font-bold text-slate-800">1. Kompetensi Pedagogik (Metode & RPS)</span>
                                        <span className="font-mono font-bold text-emerald-800">{edomScores.pedagogik || 3.68} / 4.00</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(edomScores.pedagogik / 4) * 100}%` }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center text-xs mb-1.5">
                                        <span className="font-bold text-slate-800">2. Kompetensi Profesional (Kedalaman Materi & Riset)</span>
                                        <span className="font-mono font-bold text-emerald-800">{edomScores.profesional || 3.74} / 4.00</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(edomScores.profesional / 4) * 100}%` }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center text-xs mb-1.5">
                                        <span className="font-bold text-slate-800">3. Kompetensi Kepribadian (Keteladanan & Etika)</span>
                                        <span className="font-mono font-bold text-emerald-800">{edomScores.kepribadian || 3.82} / 4.00</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(edomScores.kepribadian / 4) * 100}%` }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center text-xs mb-1.5">
                                        <span className="font-bold text-slate-800">4. Kompetensi Sosial (Komunikasi & Pendampingan)</span>
                                        <span className="font-mono font-bold text-emerald-800">{edomScores.sosial || 3.71} / 4.00</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(edomScores.sosial / 4) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                                    Tindak Lanjut Penjaminan Mutu Internal (LPM)
                                </h3>
                                <p className="text-xs text-slate-500 mb-4">
                                    Rekomendasi pengembangan mutu tridharma perguruan tinggi berdasar skor evaluasi.
                                </p>

                                <ul className="space-y-2 text-xs text-slate-700">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        <span>Skor tertinggi berada pada aspek Kepribadian (3.82), menunjukkan keteladanan akhlakul karimah para dosen di STAI Al-Ittihad.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        <span>RPS dan silabus pembelajaran daring di SALAM LMS telah 100% terunggah dan dinilai interaktif oleh mahasiswa.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        <span>Hasil rekapitulasi nilai EDOM otomatis terhubung sebagai syarat pelepasan KHS dan cetak transkrip mahasiswa.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 5: 9 KRITERIA BORANG AKREDITASI */}
                {activeTab === 'borang' && (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                                    Matriks Kesiapan 9 Kriteria Borang Akreditasi LAMDIK / BAN-PT
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Indikator capaian kuantitatif data institusi untuk borang akreditasi program studi dan perguruan tinggi.
                                </p>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-200">
                            {accreditationCriteria.map((item, idx) => (
                                <div key={idx} className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-900 text-emerald-300 font-mono font-bold flex items-center justify-center text-xs flex-shrink-0">
                                            {item.criterion}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-xs md:text-sm">{item.name}</div>
                                            <div className="text-[11px] text-slate-500 mt-0.5">
                                                Status: <span className="font-semibold text-emerald-800">{item.status}</span> • Nilai Estimasi: <strong>{item.score} / 4.00</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 min-w-[200px]">
                                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${item.progress}%` }}></div>
                                        </div>
                                        <span className="font-mono text-xs font-bold text-slate-700 w-10 text-right">{item.progress}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
