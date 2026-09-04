import React, { useState, useRef, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    GraduationCap, Search, Filter, RefreshCw, Printer, Eye, X, 
    ChevronDown, Sparkles, Calendar, Users, Award, ShieldCheck, 
    CheckCircle2, Loader2, Check, ArrowRight, BookOpen, AlertCircle
} from 'lucide-react';

export default function TranscriptsIndex({ 
    students = null, 
    studyPrograms = [], 
    batchYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'],
    selectedProdiObj = null,
    isSelectionComplete = false,
    stats = {}, 
    filters = {} 
}) {
    const [prodi, setProdi] = useState(filters.study_program || '');
    const [year, setYear] = useState(filters.academic_year || '');
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || 20);

    const [studentsData, setStudentsData] = useState(students);
    const [currentStats, setCurrentStats] = useState(stats);
    const [isSelectionActive, setIsSelectionActive] = useState(isSelectionComplete);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Dropdown Popovers
    const [isProdiDropdownOpen, setIsProdiDropdownOpen] = useState(false);
    const [prodiSearch, setProdiSearch] = useState('');
    const prodiDropdownRef = useRef(null);

    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const yearDropdownRef = useRef(null);

    const buildCleanQuery = (overrides = {}) => {
        const raw = {
            study_program: prodi,
            academic_year: year,
            search,
            per_page: Number(perPage) !== 20 ? perPage : undefined,
            ...overrides,
        };
        const clean = {};
        for (const [k, v] of Object.entries(raw)) {
            if (v !== undefined && v !== null && v !== '') {
                clean[k] = v;
            }
        }
        return clean;
    };

    const fetchTranscriptData = async (newProdi = prodi, newYear = year, newSearch = search, page = 1) => {
        if (!newProdi || !newYear) {
            setIsSelectionActive(false);
            setStudentsData(null);
            return;
        }

        setIsLoadingData(true);
        const cleanParams = buildCleanQuery({
            study_program: newProdi,
            academic_year: newYear,
            search: newSearch,
            page: page > 1 ? page : undefined,
        });

        const queryString = new URLSearchParams(cleanParams).toString();

        try {
            const res = await fetch(`/admin/transcripts?${queryString}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            const result = await res.json();
            if (result.success) {
                setStudentsData(result.students);
                setCurrentStats(result.stats);
                setIsSelectionActive(result.isSelectionComplete);
            }
        } catch (error) {
            console.error('Error fetching transcript data:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleTriggerFilter = (newProdi = prodi, newYear = year) => {
        setProdi(newProdi);
        setYear(newYear);
        fetchTranscriptData(newProdi, newYear, search, 1);
    };

    const handleResetFilter = () => {
        setProdi('');
        setYear('');
        setSearch('');
        setIsSelectionActive(false);
        setStudentsData(null);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (prodiDropdownRef.current && !prodiDropdownRef.current.contains(e.target)) {
                setIsProdiDropdownOpen(false);
            }
            if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target)) {
                setIsYearDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredStudyPrograms = studyPrograms.filter(p => 
        p.name.toLowerCase().includes(prodiSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(prodiSearch.toLowerCase())
    );

    const currentProdi = selectedProdiObj || studyPrograms.find(p => 
        String(p.id) === String(prodi) || p.code === prodi || p.name === prodi
    );

    const studentList = studentsData?.data || [];

    return (
        <AppLayout title="Transkrip Akademik">
            <Head title="Transkrip Akademik" />

            <div className="space-y-3.5">
                {/* 1. HERO HEADER */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative border border-slate-700/50 z-20">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-black mb-1">
                                <Sparkles className="w-3 h-3 text-teal-400" />
                                <span>AKADEMIK & TRANSKRIP NILAI</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                                Transkrip Nilai Akademik Kumulatif
                            </h2>
                        </div>
                    </div>

                    {/* Integrated Sub-bar */}
                    <div className="relative z-30 mt-3 pt-3 border-t border-slate-700/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="flex items-center space-x-2.5">
                            <div className="p-1.5 bg-teal-500/20 text-teal-400 rounded-lg border border-teal-500/30 shrink-0">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                            <div className="flex items-center space-x-2 flex-wrap text-xs">
                                <span className="font-bold text-slate-300">Filter Transkrip:</span>
                                {currentProdi && year ? (
                                    <div className="inline-flex items-center space-x-1.5 flex-wrap">
                                        <span className="font-black text-white">{currentProdi.name}</span>
                                        <span className="text-[11px] font-bold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-md border border-teal-600/40">
                                            Angkatan {year}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-slate-400 italic">Pilih Program Studi & Angkatan di samping</span>
                                )}
                            </div>
                        </div>

                        {/* Dropdown Selectors */}
                        <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 w-full lg:w-auto">
                            {/* Dropdown Prodi */}
                            <div ref={prodiDropdownRef} className="relative w-full sm:w-64">
                                <button
                                    type="button"
                                    onClick={() => setIsProdiDropdownOpen(prev => !prev)}
                                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs border border-slate-700 bg-slate-800/90 text-slate-300 font-medium"
                                >
                                    <span className="truncate">{currentProdi ? currentProdi.name : 'Pilih Prodi...'}</span>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                                {isProdiDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-1.5 w-full sm:w-80 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 p-2 space-y-1.5">
                                        <input
                                            type="text"
                                            value={prodiSearch}
                                            onChange={(e) => setProdiSearch(e.target.value)}
                                            placeholder="Cari program studi..."
                                            className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                                        />
                                        <div className="max-h-52 overflow-y-auto space-y-1">
                                            {filteredStudyPrograms.map((p) => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => {
                                                        setProdi(String(p.id));
                                                        setIsProdiDropdownOpen(false);
                                                        handleTriggerFilter(String(p.id), year);
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-teal-50 cursor-pointer text-xs flex justify-between"
                                                >
                                                    <span>{p.name}</span>
                                                    {String(p.id) === String(prodi) && <Check className="w-3.5 h-3.5 text-teal-600" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Dropdown Angkatan */}
                            <div ref={yearDropdownRef} className="relative w-full sm:w-36">
                                <button
                                    type="button"
                                    onClick={() => setIsYearDropdownOpen(prev => !prev)}
                                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs border border-slate-700 bg-slate-800/90 text-slate-300 font-medium"
                                >
                                    <span>{year ? `Angk. ${year}` : 'Angkatan...'}</span>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                                {isYearDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-1.5 w-full sm:w-44 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 p-1 space-y-1">
                                        {batchYears.map((y) => (
                                            <div
                                                key={y}
                                                onClick={() => {
                                                    setYear(String(y));
                                                    setIsYearDropdownOpen(false);
                                                    handleTriggerFilter(prodi, String(y));
                                                }}
                                                className="p-2 rounded-lg hover:bg-teal-50 cursor-pointer text-xs flex justify-between"
                                            >
                                                <span>Angkatan {y}</span>
                                                {String(y) === String(year) && <Check className="w-3.5 h-3.5 text-teal-600" />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {(prodi || year) && (
                                <button
                                    type="button"
                                    onClick={handleResetFilter}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 cursor-pointer"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. STATS CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Total Mahasiswa</span>
                        <p className="text-base font-black text-slate-900 mt-1">{currentStats.total_students || 0} Orang</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Memenuhi Syarat Lulus</span>
                        <p className="text-base font-black text-emerald-700 mt-1">{currentStats.eligible_grad || 0} Mahasiswa</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-blue-600 uppercase">Rata-Rata IPK</span>
                        <p className="text-base font-black text-blue-700 mt-1 font-mono">{Number(currentStats.avg_gpa || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-purple-600 uppercase">IPK Tertinggi</span>
                        <p className="text-base font-black text-purple-700 mt-1 font-mono">{Number(currentStats.highest_gpa || 0).toFixed(2)}</p>
                    </div>
                </div>

                {/* 3. TABEL DATA TRANSKRIP */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Daftar Transkrip Akademik Mahasiswa</span>
                        <div className="relative w-64">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    fetchTranscriptData(prodi, year, e.target.value, 1);
                                }}
                                placeholder="Cari Nama / NIM..."
                                className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-800 text-white font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-3 px-3.5 text-center w-12 border-r border-slate-700">No.</th>
                                    <th className="py-3 px-3.5 text-center w-24 border-r border-slate-700">Aksi</th>
                                    <th className="py-3 px-3.5 border-r border-slate-700">NIM</th>
                                    <th className="py-3 px-3.5 border-r border-slate-700">Nama Lengkap</th>
                                    <th className="py-3 px-3.5 text-center w-24 border-r border-slate-700">Angkatan</th>
                                    <th className="py-3 px-3.5 text-center w-24 border-r border-slate-700">SKS Diambil</th>
                                    <th className="py-3 px-3.5 text-center w-24 border-r border-slate-700">SKS Lulus</th>
                                    <th className="py-3 px-3.5 text-center w-20 border-r border-slate-700">IPK</th>
                                    <th className="py-3 px-3.5 text-center w-36">Predikat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {!isSelectionActive ? (
                                    <tr>
                                        <td colSpan="9" className="py-16 text-center text-slate-500">
                                            Pilih Program Studi & Angkatan di atas untuk menampilkan Transkrip Nilai.
                                        </td>
                                    </tr>
                                ) : isLoadingData ? (
                                    <tr>
                                        <td colSpan="9" className="py-16 text-center text-slate-500">
                                            <Loader2 className="w-5 h-5 animate-spin mx-auto text-teal-600" />
                                            <span className="font-bold block mt-2">Memuat Transkrip...</span>
                                        </td>
                                    </tr>
                                ) : studentList.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="py-12 text-center text-slate-400">
                                            Tidak ada data transkrip mahasiswa yang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    studentList.map((stu, index) => (
                                        <tr key={stu.id} className="hover:bg-slate-50">
                                            <td className="py-2.5 px-3.5 text-center font-bold text-slate-500 border-r border-slate-100">
                                                {index + 1}
                                            </td>
                                            <td className="py-2.5 px-3 text-center border-r border-slate-100">
                                                <a
                                                    href={`/admin/transcripts/${stu.id}/print-pdf`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg inline-flex items-center space-x-1"
                                                    title="Cetak Transkrip Nilai Resmi"
                                                >
                                                    <Printer className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-bold">Cetak</span>
                                                </a>
                                            </td>
                                            <td className="py-2.5 px-3.5 font-mono font-bold text-slate-800 border-r border-slate-100">{stu.nim}</td>
                                            <td className="py-2.5 px-3.5 font-bold text-slate-900 border-r border-slate-100">{stu.name}</td>
                                            <td className="py-2.5 px-3.5 text-center font-bold text-slate-700 border-r border-slate-100">{stu.batch_year}</td>
                                            <td className="py-2.5 px-3.5 text-center font-mono font-bold text-slate-800 border-r border-slate-100">{stu.total_credits_taken}</td>
                                            <td className="py-2.5 px-3.5 text-center font-mono font-bold text-emerald-600 border-r border-slate-100">{stu.total_credits_passed}</td>
                                            <td className="py-2.5 px-3.5 text-center font-mono font-black text-blue-700 border-r border-slate-100">
                                                {Number(stu.gpa).toFixed(2)}
                                            </td>
                                            <td className="py-2.5 px-3.5 text-center">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                    stu.predicate === 'Dengan Pujian (Cumlaude)' ? 'bg-amber-100 text-amber-900' :
                                                    stu.predicate === 'Sangat Memuaskan' ? 'bg-emerald-100 text-emerald-900' : 'bg-blue-100 text-blue-900'
                                                }`}>
                                                    {stu.predicate}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
