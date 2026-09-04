import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Star, Award, Users, TrendingUp, ChevronRight, 
    Search, ShieldCheck, CheckCircle2, MessageSquare, BookOpen
} from 'lucide-react';

export default function EdomIndex({ activePeriod, lecturers = [], stats = {} }) {
    const [search, setSearch] = useState('');

    const filteredLecturers = lecturers.filter((l) =>
        l.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.nidn?.toLowerCase().includes(search.toLowerCase()) ||
        l.study_program?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AppLayout title="Evaluasi Dosen oleh Mahasiswa (EDOM)">
            <Head title="Evaluasi Dosen (EDOM)" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Evaluasi Dosen oleh Mahasiswa (EDOM)</h2>
                        <p className="text-xs text-slate-500">
                            Analitik mutu pembelajaran & kepuasan perkuliahan 4 kompetensi dosen ({activePeriod?.name || 'Periode Aktif'}).
                        </p>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
                        <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                            <Star className="w-6 h-6 fill-amber-500" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-500">Indeks Kepuasan Rata-Rata</span>
                            <p className="text-2xl font-black text-slate-900 mt-0.5">
                                {stats.overall_average} <span className="text-xs text-emerald-600 font-bold">/ 4.00</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-500">Total Dosen Dievaluasi</span>
                            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.total_lecturers} Dosen</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-500">Total Kuesioner Masuk</span>
                            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.total_respondents} Responden</p>
                        </div>
                    </div>
                </div>

                {/* Filter / Search Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama dosen atau NIDN..."
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                        Peringkat Mutu Dosen
                    </span>
                </div>

                {/* Lecturers Ranking Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                                    <th className="py-3 px-4">Dosen Pengampu</th>
                                    <th className="py-3 px-4 text-center">Pedagogik</th>
                                    <th className="py-3 px-4 text-center">Profesional</th>
                                    <th className="py-3 px-4 text-center">Kepribadian</th>
                                    <th className="py-3 px-4 text-center">Sosial</th>
                                    <th className="py-3 px-4 text-center">Skor Akhir</th>
                                    <th className="py-3 px-4 text-center">Predikat Mutu</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLecturers.map((lec, idx) => (
                                    <tr key={lec.id} className="hover:bg-slate-50 transition">
                                        <td className="py-3 px-4 text-center font-black text-slate-700">
                                            {idx + 1 <= 3 ? (
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-[11px] font-black ${
                                                    idx === 0 ? 'bg-amber-400 text-slate-950 shadow' :
                                                    idx === 1 ? 'bg-slate-300 text-slate-900' :
                                                    'bg-amber-700/60 text-white'
                                                }`}>
                                                    {idx + 1}
                                                </span>
                                            ) : (
                                                <span>{idx + 1}</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-black text-slate-900">{lec.name}</p>
                                            <p className="text-[11px] text-slate-400 font-mono">NIDN: {lec.nidn || '-'}</p>
                                        </td>
                                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">{lec.score_pedagogik}</td>
                                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">{lec.score_profesional}</td>
                                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">{lec.score_kepribadian}</td>
                                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">{lec.score_sosial}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg font-black text-xs">
                                                {lec.overall_score}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                                {lec.predicate}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Link
                                                href={`/admin/edom/${lec.id}`}
                                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold transition inline-flex items-center space-x-1"
                                            >
                                                <span>Detail Radar</span>
                                                <ChevronRight className="w-3 h-3" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
