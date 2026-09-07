import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Award, Lock, Unlock, Users, ChevronRight, 
    FileSpreadsheet, CheckCircle2, Search, Filter, 
    BookOpen, Sparkles, Sliders, Layers, UserCheck, Eye,
    Printer, Download, Clock, School, AlertCircle
} from 'lucide-react';

export default function GradesIndex({ 
    activePeriod, 
    classes = [],
    gradeWeights = [],
    studentsList = [],
    studyPrograms = [],
    batchYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'],
    allLecturers = [],
    stats = {},
    currentTab = 'class',
    userRole = 'dosen',
    lecturerInfo = {},
    filters = {}
}) {
    const isLecturer = userRole === 'dosen' || userRole === 'dosen_pa';
    const isKaprodi = userRole === 'kaprodi';

    const [activeTab, setActiveTab] = useState(currentTab || 'class');
    const [search, setSearch] = useState(filters.search || '');
    const [prodi, setProdi] = useState(filters.study_program || '');
    const [year, setYear] = useState(filters.academic_year || '');
    const [lecturerId, setLecturerId] = useState(filters.lecturer_id || '');
    const [onlyMyClasses, setOnlyMyClasses] = useState(filters.only_my_classes === '1');

    const filteredClasses = classes.filter((c) => 
        c.course_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.course_code?.toLowerCase().includes(search.toLowerCase()) ||
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.lecturer_name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleFilterSubmit = (e) => {
        if (e) e.preventDefault();
        router.get('/admin/grades', {
            tab: activeTab,
            search,
            study_program: prodi,
            academic_year: year,
            lecturer_id: lecturerId,
            only_my_classes: onlyMyClasses ? '1' : '0',
        }, { preserveState: true });
    };

    const handleToggleMyClasses = () => {
        const nextVal = !onlyMyClasses;
        setOnlyMyClasses(nextVal);
        router.get('/admin/grades', {
            tab: activeTab,
            search,
            study_program: prodi,
            academic_year: year,
            lecturer_id: lecturerId,
            only_my_classes: nextVal ? '1' : '0',
        }, { preserveState: true });
    };

    const handleSearchStudents = (e) => {
        e.preventDefault();
        router.get('/admin/grades', { 
            tab: 'student', 
            study_program: prodi, 
            academic_year: year, 
            search 
        }, { preserveState: true });
    };

    return (
        <AppLayout title={isLecturer ? "Penilaian DPNA Dosen" : "Penilaian Akademik"}>
            <Head title={isLecturer ? "Penilaian DPNA — Dosen Pengampu" : "Penilaian & Gradebook"} />

            <div className="space-y-4">
                {/* 1. HERO HEADER */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative border border-slate-700/50 z-20">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-black mb-1">
                                <Sparkles className="w-3 h-3 text-teal-400" />
                                <span>{isLecturer ? `PORTAL DOSEN PENGAMPU (${userRole.toUpperCase()})` : 'AKADEMIK & PENILAIAN'}</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                                {isLecturer 
                                    ? `Lembar Nilai DPNA — ${lecturerInfo.name || 'Dosen Pengampu'}` 
                                    : 'Penilaian Akademik & Manajemen Nilai DPNA'}
                            </h2>
                            <p className="text-xs text-slate-300 mt-0.5">
                                {isLecturer 
                                    ? `NIDN: ${lecturerInfo.identity_number || '-'} • Menampilkan seluruh mata kuliah yang Anda ampu pada ${activePeriod?.name || 'semester aktif'}.`
                                    : `Sistem Pengelolaan Nilai Terpusat & Sinkronisasi KHS • ${activePeriod?.name || 'Semester Aktif'}`}
                            </p>
                        </div>

                        {/* Kaprodi / Admin Quick Switcher */}
                        {isKaprodi && (
                            <button
                                onClick={handleToggleMyClasses}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
                                    onlyMyClasses 
                                        ? 'bg-teal-500 text-slate-950 shadow-md font-black' 
                                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                                }`}
                            >
                                <Award className="w-4 h-4" />
                                <span>{onlyMyClasses ? '✓ Hanya Kelas yang Saya Ampu' : 'Tampilkan Kelas yang Saya Ampu'}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. STATS CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {isLecturer ? 'Kelas yang Diampu' : 'Total Kelas Kuliah'}
                        </span>
                        <p className="text-base sm:text-lg font-black text-slate-900 mt-1">{stats.total_classes || 0} Kelas</p>
                        <p className="text-[10px] text-slate-500 font-semibold">{stats.total_students || 0} Mahasiswa Terdaftar</p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Nilai Lengkap (Selesai)</span>
                        <p className="text-base sm:text-lg font-black text-emerald-700 mt-1">{stats.completed_classes || 0} Kelas</p>
                        <p className="text-[10px] text-emerald-600 font-semibold">100% Peserta Ternilai</p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-amber-600 uppercase">Belum Lengkap / Draft</span>
                        <p className="text-base sm:text-lg font-black text-amber-700 mt-1">{stats.open_classes || 0} Kelas</p>
                        <p className="text-[10px] text-amber-600 font-semibold">Perlu Input / Review</p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-purple-600 uppercase">Nilai Terkunci (Lock)</span>
                        <p className="text-base sm:text-lg font-black text-purple-700 mt-1">{stats.locked_classes || 0} Kelas</p>
                        <p className="text-[10px] text-purple-600 font-semibold">Grade Lock Aktif</p>
                    </div>
                </div>

                {/* 3. TABS SWITCHER PENILAIAN */}
                <div className="flex border-b border-slate-200 space-x-2 sm:space-x-6 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('class')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                            activeTab === 'class' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>{isLecturer ? 'Mata Kuliah & Kelas Saya' : 'Daftar Kelas Perkuliahan'}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 font-bold">{classes.length}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('percentage')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                            activeTab === 'percentage' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Sliders className="w-4 h-4" />
                        <span>Bobot Nilai Standar</span>
                    </button>

                    {!isLecturer && (
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
                    )}
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
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{w.component_code}</span>
                                        <h4 className="text-xs font-black text-slate-900 mt-0.5">{w.component_name}</h4>
                                        <p className="text-[10px] text-slate-500 mt-1">{w.description}</p>
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-baseline space-x-1">
                                        <span className="text-2xl font-black text-teal-700">{Number(w.weight_percentage)}</span>
                                        <span className="text-xs font-bold text-teal-600">%</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs font-medium flex items-center space-x-2">
                            <span className="text-base">💡</span>
                            <span>
                                Rumus Nilai Akhir = (Presensi × 10%) + (Tugas × 20%) + (Kuis × 15%) + (UTS × 25%) + (UAS × 30%). 
                                Skala Penilaian: A (≥85), A- (≥80), B+ (≥75), B (≥70), B- (≥65), C+ (≥60), C (≥55), D (≥45), E (&lt;45).
                            </span>
                        </div>
                    </div>
                )}

                {/* TAB 2: PER KELAS */}
                {activeTab === 'class' && (
                    <div className="space-y-3">
                        {/* Filter Bar */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <div className="relative flex-1 max-w-md">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={isLecturer ? "Cari mata kuliah atau kelas saya..." : "Cari mata kuliah, kode, atau dosen pengampu..."}
                                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                />
                            </div>

                            {/* Dropdown Filter untuk Admin / Superadmin */}
                            {!isLecturer && allLecturers.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <select
                                        value={lecturerId}
                                        onChange={(e) => {
                                            setLecturerId(e.target.value);
                                            router.get('/admin/grades', {
                                                tab: 'class',
                                                search,
                                                lecturer_id: e.target.value,
                                                study_program: prodi
                                            }, { preserveState: true });
                                        }}
                                        className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                                    >
                                        <option value="">-- Semua Dosen --</option>
                                        {allLecturers.map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <span className="text-xs font-bold text-slate-500 shrink-0">
                                Menampilkan {filteredClasses.length} Kelas
                            </span>
                        </div>

                        {/* Classes Grid */}
                        {filteredClasses.length === 0 ? (
                            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <h4 className="text-xs font-bold text-slate-700">Tidak ada kelas yang sesuai kriteria pencarian.</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    {isLecturer 
                                        ? "Pastikan Anda telah ditugaskan sebagai dosen pengampu pada kelas perkuliahan di semester ini." 
                                        : "Coba ubah kata kunci pencarian atau filter yang dipilih."}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                {filteredClasses.map((cls) => (
                                    <div 
                                        key={cls.id} 
                                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between hover:border-teal-300 hover:shadow-xs transition space-y-3"
                                    >
                                        <div className="space-y-2">
                                            {/* Header Card: Badges */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center space-x-1.5">
                                                    <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-mono font-bold text-[10px] border border-teal-200/60">
                                                        {cls.course_code}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                                                        Kelas {cls.name}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                                                        {cls.credits} SKS
                                                    </span>
                                                </div>

                                                <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-black flex items-center space-x-1 shrink-0 ${
                                                    cls.is_locked ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                                }`}>
                                                    {cls.is_locked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                                                    <span>{cls.is_locked ? 'TERKUNCI' : 'TERBUKA'}</span>
                                                </span>
                                            </div>

                                            {/* Course Title & Lecturer */}
                                            <div>
                                                <h3 className="text-sm font-black text-slate-900 leading-snug">
                                                    {cls.course_name}
                                                </h3>
                                                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                                    Semester {cls.semester_level || 1} • {cls.course_study_program || 'STAI Al-Ittihad'}
                                                </p>
                                                <p className="text-[11px] text-slate-600 truncate mt-1">
                                                    👨‍🏫 {cls.lecturer_name || 'Dosen Pengampu'} {cls.lecturer_nidn ? `(${cls.lecturer_nidn})` : ''}
                                                </p>
                                            </div>

                                            {/* Progress / Enrollment Summary */}
                                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                                                <div>
                                                    <span className="text-slate-400 font-bold">Peserta: </span>
                                                    <strong className="text-slate-900">{cls.enrolled_count} Mhs</strong>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 font-bold">Rata2: </span>
                                                    <strong className="text-teal-700">{cls.avg_score}</strong>
                                                </div>
                                                <div>
                                                    {cls.is_completed ? (
                                                        <span className="text-emerald-700 font-bold flex items-center space-x-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            <span>Lengkap</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-amber-700 font-bold">
                                                            {cls.graded_count}/{cls.enrolled_count} Dinilai
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons: Input Nilai, Export Excel, Cetak PDF */}
                                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                                            <Link
                                                href={`/admin/grades/${cls.id}`}
                                                className="flex-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 shadow-xs"
                                            >
                                                <Award className="w-3.5 h-3.5" />
                                                <span>Input Nilai DPNA</span>
                                            </Link>

                                            <a
                                                href={`/admin/grades/${cls.id}/export-excel`}
                                                download
                                                title="Ekspor DPNA ke Excel (.xls)"
                                                className="p-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-lg transition"
                                            >
                                                <FileSpreadsheet className="w-4 h-4" />
                                            </a>

                                            <a
                                                href={`/admin/grades/${cls.id}/export-pdf`}
                                                target="_blank"
                                                rel="noreferrer"
                                                title="Cetak DPNA Resmi (PDF)"
                                                className="p-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition"
                                            >
                                                <Printer className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: PER MAHASISWA (Hanya Admin / Kaprodi) */}
                {activeTab === 'student' && !isLecturer && (
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
