import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Award, Lock, Unlock, Users, ChevronRight, 
    FileSpreadsheet, CheckCircle2, Search, Filter, 
    BookOpen, Sparkles, Sliders, Layers, UserCheck, Eye
} from 'lucide-react';

export default function GradesIndex({ 
    activePeriod, 
    classes = [],
    gradeWeights = [],
    studentsList = [],
    studyPrograms = [],
    batchYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'],
    stats = {},
    currentTab = 'class',
    filters = {}
}) {
    const [activeTab, setActiveTab] = useState(currentTab || 'class');
    const [search, setSearch] = useState(filters.search || '');
    const [prodi, setProdi] = useState(filters.study_program || '');
    const [year, setYear] = useState(filters.academic_year || '');

    const filteredClasses = classes.filter((c) => 
        c.course_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.course_code?.toLowerCase().includes(search.toLowerCase()) ||
        c.name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleSearchStudents = (e) => {
        e.preventDefault();
        router.get('/admin/grades', { tab: 'student', study_program: prodi, academic_year: year, search }, { preserveState: true });
    };

    return (
        <AppLayout title="Penilaian Akademik">
            <Head title="Penilaian & Gradebook" />

            <div className="space-y-3.5">
                {/* 1. HERO HEADER */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative border border-slate-700/50 z-20">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-black mb-1">
                                <Sparkles className="w-3 h-3 text-teal-400" />
                                <span>AKADEMIK & PENILAIAN</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                                Penilaian Akademik & Manajemen Nilai DPNA
                            </h2>
                        </div>
                    </div>
                </div>

                {/* 2. STATS CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Total Kelas Kuliah</span>
                        <p className="text-base font-black text-slate-900 mt-1">{stats.total_classes || 0} Kelas</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Nilai Terkunci (Lock)</span>
                        <p className="text-base font-black text-emerald-700 mt-1">{stats.locked_classes || 0} Kelas</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-amber-600 uppercase">Dalam Proses Input</span>
                        <p className="text-base font-black text-amber-700 mt-1">{stats.open_classes || 0} Kelas</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-purple-600 uppercase">Komponen Penilaian</span>
                        <p className="text-base font-black text-purple-700 mt-1">{stats.total_components || 5} Komponen</p>
                    </div>
                </div>

                {/* 3. TABS SWITCHER PENILAIAN (3 Sub-tab: Persentase Nilai, Per Kelas, Per Mahasiswa) */}
                <div className="flex border-b border-slate-200 space-x-2 sm:space-x-6 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('percentage')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                            activeTab === 'percentage' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Sliders className="w-4 h-4" />
                        <span>Persentase Nilai</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('class')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                            activeTab === 'class' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Per Kelas</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 font-bold">{classes.length}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('student')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                            activeTab === 'student' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Per Mahasiswa</span>
                    </button>
                </div>

                {/* TAB 1: PERSENTASE NILAI */}
                {activeTab === 'percentage' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-4 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="text-sm font-black text-slate-800">Komposisi Bobot & Persentase Nilai Akhir</h3>
                                <p className="text-xs text-slate-500">Standar bobot evaluasi nilai perkuliahan STAI Al-Ittihad Cianjur (Total 100%).</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            {gradeWeights.map((w) => (
                                <div key={w.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{w.code}</span>
                                        <h4 className="text-xs font-black text-slate-900 mt-0.5">{w.name}</h4>
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-baseline space-x-1">
                                        <span className="text-2xl font-black text-teal-700">{Number(w.weight_percentage)}</span>
                                        <span className="text-xs font-bold text-teal-600">%</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs font-medium">
                            💡 Rumus Nilai Akhir = (Kehadiran × 10%) + (Tugas × 20%) + (Kuis × 10%) + (UTS × 30%) + (UAS × 30%). Pengaturan lebih lanjut dapat diubah di menu Kebijakan Akademik.
                        </div>
                    </div>
                )}

                {/* TAB 2: PER KELAS */}
                {activeTab === 'class' && (
                    <div className="space-y-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
                            <div className="relative flex-1 max-w-md">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari mata kuliah, kode, atau nama kelas..."
                                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                />
                            </div>
                            <span className="text-xs font-bold text-slate-500">
                                {filteredClasses.length} Kelas Perkuliahan
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredClasses.map((cls) => (
                                <div key={cls.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between hover:border-teal-300 transition space-y-3">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-mono font-bold text-[10px]">
                                                {cls.course_code} • {cls.credits} SKS
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center space-x-1 ${
                                                cls.is_locked ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                            }`}>
                                                {cls.is_locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                                <span>{cls.is_locked ? 'TERKUNCI' : 'TERBUKA'}</span>
                                            </span>
                                        </div>
                                        <h3 className="text-xs font-black text-slate-900 leading-snug">{cls.course_name}</h3>
                                        <p className="text-[11px] text-slate-500 font-bold">{cls.name} (Semester {cls.semester_level})</p>
                                        <p className="text-[10.5px] text-slate-600 truncate">👨‍🏫 {cls.lecturer_name || 'Dosen Pengampu'}</p>
                                    </div>

                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                        <div className="text-[10.5px]">
                                            <span className="text-slate-400 font-bold">Peserta: </span>
                                            <strong className="text-slate-800">{cls.enrolled_count} Mhs</strong> • <span className="text-teal-700 font-bold">Rata2: {cls.avg_score}</span>
                                        </div>

                                        <Link
                                            href={`/admin/grades/${cls.id}`}
                                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                                        >
                                            <span>Input Nilai</span>
                                            <ChevronRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 3: PER MAHASISWA */}
                {activeTab === 'student' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-4 space-y-3">
                        <form onSubmit={handleSearchStudents} className="flex items-center gap-2 flex-wrap">
                            <select
                                value={prodi}
                                onChange={(e) => setProdi(e.target.value)}
                                className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                            >
                                <option value="">-- Pilih Program Studi --</option>
                                {studyPrograms.map(p => (
                                    <option key={p.id} value={p.name}>{p.name}</option>
                                ))}
                            </select>

                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                            >
                                <option value="">-- Pilih Angkatan --</option>
                                {batchYears.map(y => (
                                    <option key={y} value={y}>Angkatan {y}</option>
                                ))}
                            </select>

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari Nama / NIM..."
                                className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg flex-1 min-w-[150px]"
                            />

                            <button
                                type="submit"
                                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                            >
                                Tampilkan
                            </button>
                        </form>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-800 text-white font-bold uppercase tracking-wider text-[11px]">
                                        <th className="py-2.5 px-3 text-center w-12 border-r border-slate-700">No.</th>
                                        <th className="py-2.5 px-3 border-r border-slate-700">NIM</th>
                                        <th className="py-2.5 px-3 border-r border-slate-700">Nama Mahasiswa</th>
                                        <th className="py-2.5 px-3 border-r border-slate-700">Program Studi</th>
                                        <th className="py-2.5 px-3 text-center w-28 border-r border-slate-700">Jumlah MK Dinilai</th>
                                        <th className="py-2.5 px-3 text-center w-28">Rata-Rata Nilai</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {studentsList.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-12 text-center text-slate-400">
                                                Pilih Program Studi & Angkatan di atas untuk melihat nilai per mahasiswa.
                                            </td>
                                        </tr>
                                    ) : (
                                        studentsList.map((stu, idx) => (
                                            <tr key={stu.id} className="hover:bg-slate-50">
                                                <td className="py-2.5 px-3 text-center text-slate-400 font-bold border-r border-slate-100">{idx + 1}</td>
                                                <td className="py-2.5 px-3 font-mono font-bold text-slate-800 border-r border-slate-100">{stu.nim}</td>
                                                <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-100">{stu.name}</td>
                                                <td className="py-2.5 px-3 border-r border-slate-100">{stu.study_program}</td>
                                                <td className="py-2.5 px-3 text-center font-mono font-bold text-teal-700 border-r border-slate-100">{stu.grades_count} MK</td>
                                                <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">{stu.avg_final_score}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
