import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Award, BookOpen, CheckCircle2, ChevronRight, 
    Clock, Printer, Sparkles, TrendingUp
} from 'lucide-react';

export default function GradesIndex({ 
    academicPeriods = [], 
    selectedPeriodId, 
    selectedPeriod, 
    grades = [], 
    summary = {} 
}) {
    const handlePeriodChange = (e) => {
        router.get('/student/grades', { period_id: e.target.value }, { preserveState: true });
    };

    return (
        <AppLayout title="Nilai Mata Kuliah">
            <Head title="Nilai Mata Kuliah" />

            <div className="space-y-5 max-w-6xl mx-auto">
                {/* 1. Header Banner */}
                <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-blue-800/40">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-black mb-1">
                                <Award className="w-3 h-3 text-blue-400" />
                                <span>PORTAL EVALUASI & NILAI MAHASISWA</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                                Nilai Mata Kuliah & Komponen Asesmen
                            </h2>
                            <p className="text-xs text-blue-200/80 mt-1 max-w-xl">
                                Transparansi rincian penilaian perkuliahan mencakup presensi, tugas, kuis, UTS, dan UAS berbasis kurikulum OBE.
                            </p>
                        </div>

                        {/* Period Filter & IPS Badge */}
                        <div className="flex items-center space-x-3 shrink-0">
                            <div className="bg-white/10 rounded-xl p-2.5 border border-white/10 text-right">
                                <p className="text-[10px] text-blue-300 uppercase font-bold">IPS Semester</p>
                                <p className="text-xl font-mono font-black text-amber-400">{summary.ips ?? '0.00'}</p>
                            </div>
                            <select
                                value={selectedPeriodId}
                                onChange={handlePeriodChange}
                                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                {academicPeriods.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. Grades Detail Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                                <BookOpen className="w-4 h-4" />
                            </div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                                Rekapitulasi Nilai Semester: {selectedPeriod?.name || 'Aktif'}
                            </h3>
                        </div>
                        <span className="text-xs font-bold text-slate-500">
                            Total Beban: <span className="font-mono text-slate-900">{summary.total_sks} SKS</span> ({summary.total_courses} Mata Kuliah)
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">Mata Kuliah</th>
                                    <th className="px-3 py-3 text-center">SKS</th>
                                    <th className="px-3 py-3 text-center">Presensi (10%)</th>
                                    <th className="px-3 py-3 text-center">Tugas (25%)</th>
                                    <th className="px-3 py-3 text-center">Kuis (15%)</th>
                                    <th className="px-3 py-3 text-center">UTS (25%)</th>
                                    <th className="px-3 py-3 text-center">UAS (25%)</th>
                                    <th className="px-3 py-3 text-center">Skor Akhir</th>
                                    <th className="px-3 py-3 text-center">Huruf</th>
                                    <th className="px-3 py-3 text-center">Bobot</th>
                                    <th className="px-3 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                {grades.length > 0 ? (
                                    grades.map((g, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/80 transition">
                                            <td className="px-4 py-3.5">
                                                <p className="font-bold text-slate-900">{g.name}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">{g.code} • {g.lecturer}</p>
                                            </td>
                                            <td className="px-3 py-3.5 text-center font-mono font-bold text-slate-700">{g.credits}</td>
                                            <td className="px-3 py-3.5 text-center font-mono text-slate-600">{g.attendance_score}</td>
                                            <td className="px-3 py-3.5 text-center font-mono text-slate-600">{g.assignment_score}</td>
                                            <td className="px-3 py-3.5 text-center font-mono text-slate-600">{g.quiz_score}</td>
                                            <td className="px-3 py-3.5 text-center font-mono text-slate-600">{g.mid_score}</td>
                                            <td className="px-3 py-3.5 text-center font-mono text-slate-600">{g.final_score}</td>
                                            <td className="px-3 py-3.5 text-center font-mono font-black text-indigo-700">{g.total_score}</td>
                                            <td className="px-3 py-3.5 text-center font-bold text-emerald-700">
                                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    {g.grade_letter}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3.5 text-center font-mono text-slate-700">{g.grade_point.toFixed(2)}</td>
                                            <td className="px-3 py-3.5 text-center">
                                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                    <span>{g.status}</span>
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={11} className="px-4 py-8 text-center text-slate-400 italic">
                                            Belum ada nilai yang diterbitkan untuk periode ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
