import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Star, ArrowLeft, Award, Users, CheckCircle2, 
    MessageSquare, ShieldCheck, Heart, Sparkles, TrendingUp
} from 'lucide-react';

export default function EdomShow({ activePeriod, lecturer, feedbackList = [] }) {
    const scores = lecturer.scores || {};

    const competencies = [
        { label: 'Kompetensi Pedagogik', score: scores.pedagogik || 3.8, desc: 'Perencanaan RPS, Kejelasan Mengajar, & Penggunaan Media Interaktif' },
        { label: 'Kompetensi Profesional', score: scores.profesional || 3.75, desc: 'Penguasaan Materi Kajian & Rujukan Ilmiah Terkini' },
        { label: 'Kompetensi Kepribadian', score: scores.kepribadian || 3.85, desc: 'Kedisiplinan Waktu, Keteladanan Akhlak, & Keadilan Penilaian' },
        { label: 'Kompetensi Sosial', score: scores.sosial || 3.7, desc: 'Komunikasi Ramah, Empati, & Keterbukaan Diskusi Mahasiswa' },
    ];

    return (
        <AppLayout title={`Detail EDOM — ${lecturer.name}`}>
            <Head title={`EDOM ${lecturer.name} — SIAKAD`} />

            <div className="space-y-4 max-w-4xl mx-auto">
                {/* Header Back & Info */}
                <div className="flex items-center space-x-3">
                    <Link
                        href="/admin/edom"
                        className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h2 className="text-sm font-black text-slate-900">{lecturer.name}</h2>
                        <p className="text-[11px] text-slate-500">
                            NIDN: {lecturer.nidn} • {lecturer.study_program} • {activePeriod?.name}
                        </p>
                    </div>
                </div>

                {/* Score Summary Card (Compact Banner) */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-700/50">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-mono font-bold tracking-wider uppercase">
                                EVALUASI MUTU PENGAJARAN (EDOM)
                            </span>
                            <span className="text-[10px] text-slate-300">
                                • {lecturer.respondent_count || 38} Responden Mahasiswa
                            </span>
                        </div>
                        <h1 className="text-base sm:text-lg font-black">{lecturer.name}</h1>
                        <p className="text-[11px] text-slate-300">
                            Evaluasi performa mengajar, penguasaan materi, integritas moral, dan interaksi perkuliahan.
                        </p>
                    </div>

                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-center shrink-0 min-w-36">
                        <span className="text-[9px] font-bold uppercase text-slate-300">Skor Rata-Rata</span>
                        <div className="text-2xl font-black text-amber-400 mt-0.5 flex items-center justify-center space-x-1">
                            <Star className="w-5 h-5 fill-amber-400" />
                            <span>{scores.overall || 3.82}</span>
                            <span className="text-[10px] text-slate-300 font-bold">/ 4.00</span>
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.2 rounded bg-emerald-500/30 text-emerald-200 text-[9px] font-bold border border-emerald-400/30">
                            SANGAT BAIK (A)
                        </span>
                    </div>
                </div>

                {/* 4 Competency Progress Bars (Compact Grid) */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                            Rincian Capaian 4 Aspek Kompetensi Dosen
                        </h3>
                        <span className="text-[10px] text-slate-400 font-bold">Standar Mutu Dikti</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {competencies.map((c, idx) => {
                            const percent = (c.score / 4.00) * 100;
                            return (
                                <div key={idx} className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80 space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-slate-800 text-[11px]">{c.label}</span>
                                        <span className="font-mono font-black text-emerald-700 text-xs">{c.score.toFixed(2)} / 4.00</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500" 
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 truncate">{c.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Anonymous Student Qualitative Feedback (Compact Grid) */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                                Ulasan & Saran Mahasiswa (100% Anonim)
                            </h3>
                            <p className="text-[10px] text-slate-400">Komentar kuesioner mahasiswa untuk perbaikan mutu perkuliahan.</p>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-mono font-bold rounded">
                            🔒 Encrypted Identity
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {feedbackList.map((f, idx) => (
                            <div key={idx} className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80 space-y-1.5">
                                <div className="flex items-center justify-between text-[9px]">
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                                        Aspek: {f.aspect}
                                    </span>
                                    <span className="text-slate-400">{f.date}</span>
                                </div>
                                <p className="text-[11px] text-slate-700 italic font-medium leading-relaxed">
                                    "{f.comment}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
