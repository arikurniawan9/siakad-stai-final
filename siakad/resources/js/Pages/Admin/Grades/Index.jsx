import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Award, Lock, Unlock, Users, ChevronRight, 
    FileSpreadsheet, CheckCircle2, Search, Filter, BookOpen
} from 'lucide-react';

export default function GradesIndex({ activePeriod, classes = [] }) {
    const [search, setSearch] = useState('');

    const filteredClasses = classes.filter((c) => 
        c.course_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.course_code?.toLowerCase().includes(search.toLowerCase()) ||
        c.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AppLayout title="Gradebook & Kunci Nilai Akademik">
            <Head title="Gradebook Admin — SIAKAD" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Gradebook & Manajemen Nilai Perkuliahan</h2>
                        <p className="text-xs text-slate-500">
                            Monitoring entri nilai dosen, evaluasi kelulusan kelas, kontrol Grade Lock, & cetak lembar DPNA ({activePeriod?.name || 'Periode Aktif'}).
                        </p>
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
                            placeholder="Cari nama mata kuliah, kode, atau nama kelas..."
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                        Total {classes.length} Kelas Perkuliahan
                    </span>
                </div>

                {/* Classes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredClasses.map((cls) => (
                        <div key={cls.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono font-bold text-[10px]">
                                        {cls.course_code} • {cls.credits} SKS
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center space-x-1 ${
                                        cls.is_locked ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                        {cls.is_locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                        <span>{cls.is_locked ? 'TERKUNCI' : 'TERBUKA'}</span>
                                    </span>
                                </div>
                                <h3 className="text-sm font-black text-slate-900 leading-snug">{cls.course_name}</h3>
                                <p className="text-xs text-slate-500 font-bold">{cls.name} (Semester {cls.semester_level})</p>
                                <p className="text-[11px] text-slate-600 truncate">👨‍🏫 {cls.lecturer_name || 'Dosen Pengampu'}</p>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] text-slate-400 font-bold block">Mahasiswa & Rata-rata</span>
                                    <p className="text-xs font-black text-slate-800">
                                        {cls.enrolled_count} Mhs • <span className="text-emerald-700">{cls.avg_score} Rata-rata</span>
                                    </p>
                                </div>

                                <Link
                                    href={`/admin/grades/${cls.id}`}
                                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-2xs"
                                >
                                    <span>Lembar Nilai</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
