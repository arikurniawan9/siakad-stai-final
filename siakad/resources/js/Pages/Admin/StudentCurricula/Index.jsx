import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    BookOpen, Search, Filter, Layers, Calendar, GraduationCap,
    Check, ChevronDown, RefreshCw, Sparkles, CheckCircle2,
    AlertCircle, X, Loader2, Play, Settings2, Edit3, ArrowRight,
    Users, BookMarked
} from 'lucide-react';

export default function StudentCurriculaIndex({
    students = null,
    studyPrograms = [],
    batchYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'],
    curricula = [],
    isSelectionComplete = false,
    selectedProdiObj = null,
    filters = {}
}) {
    const [prodi, setProdi] = useState(filters.study_program || '');
    const [year, setYear] = useState(filters.academic_year || '');
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || 15);

    const [studentsData, setStudentsData] = useState(students);
    const [isSelectionActive, setIsSelectionActive] = useState(isSelectionComplete);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Dropdown Popovers
    const [isProdiDropdownOpen, setIsProdiDropdownOpen] = useState(false);
    const [prodiSearch, setProdiSearch] = useState('');
    const prodiDropdownRef = useRef(null);

    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const yearDropdownRef = useRef(null);

    // Multi Selection
    const [selectedIds, setSelectedIds] = useState([]);

    // Modal Assign Curriculum
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [targetCurriculumId, setTargetCurriculumId] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignSuccessMsg, setAssignSuccessMsg] = useState('');

    const isFirstRender = useRef(true);

    const buildCleanQuery = (overrides = {}) => {
        const raw = {
            study_program: prodi,
            academic_year: year,
            search,
            per_page: Number(perPage) !== 15 ? perPage : undefined,
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

    const fetchStudentsData = async (newProdi = prodi, newYear = year, newSearch = search, page = 1) => {
        if (!newProdi || !newYear) {
            setIsSelectionActive(false);
            setStudentsData(null);
            return;
        }

        setIsLoadingData(true);
        setSelectedIds([]);

        const cleanParams = buildCleanQuery({
            study_program: newProdi,
            academic_year: newYear,
            search: newSearch,
            page: page > 1 ? page : undefined,
            format: 'json'
        });

        const queryString = new URLSearchParams(cleanParams).toString();

        try {
            const res = await fetch(`/admin/student-curricula?${queryString}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                }
            });
            const data = await res.json();
            if (data.success) {
                setStudentsData(data.students);
                setIsSelectionActive(data.isSelectionComplete);
            }
        } catch (err) {
            console.error('Error fetching student curricula:', err);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            if (prodi && year) {
                fetchStudentsData(prodi, year, search);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

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

    const filteredStudyPrograms = useMemo(() => {
        if (!prodiSearch) return studyPrograms;
        const q = prodiSearch.toLowerCase();
        return studyPrograms.filter(p => 
            p.name?.toLowerCase().includes(q) ||
            p.code?.toLowerCase().includes(q) ||
            p.national_code?.toLowerCase().includes(q) ||
            p.degree?.toLowerCase().includes(q)
        );
    }, [studyPrograms, prodiSearch]);

    const currentProdi = useMemo(() => {
        if (!prodi) return null;
        return studyPrograms.find(p => String(p.id) === String(prodi) || p.code === prodi || p.name === prodi) || selectedProdiObj;
    }, [prodi, studyPrograms, selectedProdiObj]);

    const handleTriggerFilter = (newProdi = prodi, newYear = year) => {
        fetchStudentsData(newProdi, newYear, search);
    };

    const handleResetFilter = () => {
        setSearch('');
        setProdi('');
        setYear('');
        setSelectedIds([]);
        setIsSelectionActive(false);
        setStudentsData(null);
    };

    const studentList = studentsData?.data || [];
    const allPageIds = useMemo(() => studentList.map(s => s.id), [studentList]);
    const isAllSelected = allPageIds.length > 0 && allPageIds.every(id => selectedIds.includes(id));

    const handleToggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(prev => prev.filter(id => !allPageIds.includes(id)));
        } else {
            setSelectedIds(prev => Array.from(new Set([...prev, ...allPageIds])));
        }
    };

    const handleToggleSelectOne = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handlePaginationClick = (e, url) => {
        e.preventDefault();
        if (!url) return;
        try {
            const parsedUrl = new URL(url, window.location.origin);
            const page = parsedUrl.searchParams.get('page') || 1;
            fetchStudentsData(prodi, year, search, page);
        } catch (err) {}
    };

    const handleOpenAssignModal = (singleStudent = null) => {
        if (singleStudent) {
            setSelectedIds([singleStudent.id]);
            setTargetCurriculumId(singleStudent.curriculum_id ? String(singleStudent.curriculum_id) : (curricula[0]?.id ? String(curricula[0].id) : ''));
        } else {
            setTargetCurriculumId(curricula[0]?.id ? String(curricula[0].id) : '');
        }
        setAssignSuccessMsg('');
        setIsAssignModalOpen(true);
    };

    const handleExecuteAssign = async (e) => {
        e.preventDefault();
        if (selectedIds.length === 0 || !targetCurriculumId) return;

        setIsAssigning(true);
        try {
            const res = await fetch('/admin/student-curricula/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    student_ids: selectedIds,
                    curriculum_id: targetCurriculumId,
                })
            });

            const data = await res.json();
            if (data.success) {
                setAssignSuccessMsg(data.message);
                fetchStudentsData();
                setTimeout(() => {
                    setIsAssignModalOpen(false);
                    setSelectedIds([]);
                }, 1200);
            }
        } catch (err) {
            console.error('Error assigning curriculum:', err);
        } finally {
            setIsAssigning(false);
        }
    };

    return (
        <AppLayout title="Kurikulum Mahasiswa">
            <Head title="Kurikulum Mahasiswa" />

            <div className="space-y-3.5">
                {/* 1. COMPACT HERO HEADER DENGAN INTEGRATED SUB-BAR PILIH PRODI & ANGKATAN (Gaya /admin/study-programs) */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-purple-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative border border-slate-700/50 z-20">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black mb-1">
                                <Sparkles className="w-3 h-3 text-purple-400" />
                                <span>KEMAHASISWAAN & AKADEMIK</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                                Kurikulum Mahasiswa
                            </h2>
                        </div>

                        {/* Action Buttons (Hanya Tampil Saat Prodi & Angkatan Terpilih, Berupa Icon + Tooltip Menarik) */}
                        {isSelectionActive ? (
                            <div className="flex items-center gap-1.5 self-start md:self-auto animate-fadeIn">
                                <div className="relative group">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenAssignModal()}
                                        disabled={selectedIds.length === 0}
                                        className="w-9 h-9 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center justify-center transition shadow-sm hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                        aria-label="Set Kurikulum Massal"
                                    >
                                        <Settings2 className="w-4 h-4" />
                                    </button>
                                    <div className="absolute top-full right-0 mt-2 hidden group-hover:flex flex-col items-end pointer-events-none z-50 animate-fadeIn">
                                        <div className="bg-slate-900 text-white text-[10.5px] font-bold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap border border-slate-700 flex items-center space-x-1.5">
                                            <Settings2 className="w-3 h-3 text-purple-400" />
                                            <span>Set Kurikulum Massal ({selectedIds.length} Mahasiswa Terpilih)</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700">
                                    {curricula.length} Paket Kurikulum
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2 text-xs">
                                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700">
                                    {curricula.length} Paket Kurikulum Terdaftar
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Integrated Sub-bar: Pilih Program Studi & Angkatan */}
                    <div className="relative z-30 mt-3 pt-3 border-t border-slate-700/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="flex items-center space-x-2.5">
                            <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30 shrink-0">
                                <BookOpen className="w-4 h-4" />
                            </div>
                            <div className="flex items-center space-x-2 flex-wrap text-xs">
                                <span className="font-bold text-slate-300">Filter Kurikulum:</span>
                                {currentProdi ? (
                                    <div className="inline-flex items-center space-x-1.5">
                                        <span className="font-black text-white">{currentProdi.name}</span>
                                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300 border border-purple-500/40">
                                            {currentProdi.national_code || currentProdi.code}
                                        </span>
                                        {year && (
                                            <span className="text-[11px] font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-600/40">
                                                Angkatan {year}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-slate-400 italic">Pilih Program Studi & Angkatan di samping</span>
                                )}
                            </div>
                        </div>

                        {/* Dropdown Selectors on Header (Auto-triggers data fetch upon selection) */}
                        <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 w-full lg:w-auto">
                            {/* Dropdown Prodi */}
                            <div ref={prodiDropdownRef} className="relative w-full sm:w-64">
                                <button
                                    type="button"
                                    onClick={() => setIsProdiDropdownOpen(prev => !prev)}
                                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition shadow-2xs cursor-pointer text-left border ${
                                        isProdiDropdownOpen 
                                            ? 'border-purple-400 ring-2 ring-purple-500/30 bg-slate-800 text-white' 
                                            : currentProdi 
                                                ? 'border-purple-500/50 bg-purple-950/50 hover:bg-purple-900/50 text-purple-200 font-bold' 
                                                : 'border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2 truncate">
                                        <GraduationCap className={`w-3.5 h-3.5 shrink-0 ${currentProdi ? 'text-purple-400' : 'text-slate-400'}`} />
                                        <span className="truncate">
                                            {currentProdi ? currentProdi.name : 'Pilih Program Studi...'}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-1 shrink-0 ml-1.5">
                                        {prodi && (
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setProdi('');
                                                    setIsProdiDropdownOpen(false);
                                                    handleTriggerFilter('', year);
                                                }}
                                                className="p-0.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
                                                title="Reset Prodi"
                                            >
                                                <X className="w-3 h-3" />
                                            </span>
                                        )}
                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                            isProdiDropdownOpen ? 'rotate-180 text-purple-400' : ''
                                        }`} />
                                    </div>
                                </button>

                                {isProdiDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-1.5 w-full sm:w-80 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn p-2 space-y-1.5">
                                        <div className="relative">
                                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                                            <input
                                                type="text"
                                                value={prodiSearch}
                                                onChange={(e) => setProdiSearch(e.target.value)}
                                                placeholder="Cari kode atau nama prodi..."
                                                className="w-full text-[11px] pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="max-h-56 overflow-y-auto space-y-1 divide-y divide-slate-100">
                                            <div
                                                onClick={() => {
                                                    setProdi('');
                                                    setIsProdiDropdownOpen(false);
                                                    handleTriggerFilter('', year);
                                                }}
                                                className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between text-[11px] ${
                                                    !prodi ? 'bg-purple-50 text-purple-950 font-bold' : 'hover:bg-slate-50 text-slate-600'
                                                }`}
                                            >
                                                <span>-- Semua / Belum Dipilih --</span>
                                                {!prodi && <Check className="w-3.5 h-3.5 text-purple-600" />}
                                            </div>

                                            {filteredStudyPrograms.map((p) => {
                                                const isSelected = String(p.id) === String(prodi) || p.code === prodi || p.name === prodi;
                                                return (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => {
                                                            setProdi(String(p.id));
                                                            setIsProdiDropdownOpen(false);
                                                            handleTriggerFilter(String(p.id), year);
                                                        }}
                                                        className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between ${
                                                            isSelected ? 'bg-purple-50 font-bold text-purple-950' : 'hover:bg-slate-50 text-slate-700'
                                                        }`}
                                                    >
                                                        <span className="text-[11px] truncate">{p.national_code ? `${p.national_code} - ` : ''}{p.name} ({p.degree || 'S1'})</span>
                                                        {isSelected && <Check className="w-3.5 h-3.5 text-purple-600" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Dropdown Angkatan */}
                            <div ref={yearDropdownRef} className="relative w-full sm:w-44">
                                <button
                                    type="button"
                                    onClick={() => setIsYearDropdownOpen(prev => !prev)}
                                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition shadow-2xs cursor-pointer text-left border ${
                                        isYearDropdownOpen 
                                            ? 'border-purple-400 ring-2 ring-purple-500/30 bg-slate-800 text-white' 
                                            : year 
                                                ? 'border-purple-500/50 bg-purple-950/50 hover:bg-purple-900/50 text-purple-200 font-bold' 
                                                : 'border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2 truncate">
                                        <Calendar className={`w-3.5 h-3.5 shrink-0 ${year ? 'text-purple-400' : 'text-slate-400'}`} />
                                        <span className="truncate">
                                            {year ? `Angkatan ${year}` : 'Pilih Angkatan...'}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-1 shrink-0 ml-1.5">
                                        {year && (
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setYear('');
                                                    setIsYearDropdownOpen(false);
                                                    handleTriggerFilter(prodi, '');
                                                }}
                                                className="p-0.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
                                                title="Reset Angkatan"
                                            >
                                                <X className="w-3 h-3" />
                                            </span>
                                        )}
                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                            isYearDropdownOpen ? 'rotate-180 text-purple-400' : ''
                                        }`} />
                                    </div>
                                </button>

                                {isYearDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-1.5 w-full sm:w-48 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn p-2 space-y-1">
                                        <div
                                            onClick={() => {
                                                setYear('');
                                                setIsYearDropdownOpen(false);
                                                handleTriggerFilter(prodi, '');
                                            }}
                                            className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between text-[11px] ${
                                                !year ? 'bg-purple-50 text-purple-950 font-bold' : 'hover:bg-slate-50 text-slate-600'
                                            }`}
                                        >
                                            <span>-- Semua --</span>
                                            {!year && <Check className="w-3.5 h-3.5 text-purple-600" />}
                                        </div>

                                        {batchYears.map((y) => {
                                            const isSelected = String(y) === String(year);
                                            return (
                                                <div
                                                    key={y}
                                                    onClick={() => {
                                                        setYear(String(y));
                                                        setIsYearDropdownOpen(false);
                                                        handleTriggerFilter(prodi, String(y));
                                                    }}
                                                    className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between text-[11px] ${
                                                        isSelected ? 'bg-purple-50 font-bold text-purple-950' : 'hover:bg-slate-50 text-slate-700'
                                                    }`}
                                                >
                                                    <span className="font-bold">{y}</span>
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-purple-600" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Tombol Reset */}
                            {(prodi || year) && (
                                <button
                                    type="button"
                                    onClick={handleResetFilter}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer shrink-0"
                                    title="Reset Pilihan"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. COMPACT STATS CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Mahasiswa Terfilter</span>
                            <span className="p-1 bg-purple-100 text-purple-800 rounded-md"><Users className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-slate-900">{studentsData?.total || studentList.length} Orang</p>
                            <p className="text-[10px] text-slate-500">Pada Kelas Terpilih</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-purple-600 font-bold">
                            Target Penugasan
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Kurikulum Terpetakan</span>
                            <span className="p-1 bg-emerald-100 text-emerald-800 rounded-md"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-slate-900">{studentList.filter(s => s.curriculum_id).length} Mahasiswa</p>
                            <p className="text-[10px] text-slate-500">Sudah Ditetapkan</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-emerald-600 font-bold">
                            Status Terpetakan
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Belum Ditentukan</span>
                            <span className="p-1 bg-amber-100 text-amber-800 rounded-md"><AlertCircle className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-slate-900">{studentList.filter(s => !s.curriculum_id).length} Mahasiswa</p>
                            <p className="text-[10px] text-slate-500">Perlu Penugasan</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-amber-600 font-bold">
                            Belum Ada Kurikulum
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Paket Kurikulum</span>
                            <span className="p-1 bg-indigo-100 text-indigo-800 rounded-md"><Layers className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-slate-900">{curricula.length} Paket</p>
                            <p className="text-[10px] text-slate-500">Siap Diterapkan</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-indigo-600 font-bold">
                            Pilihan Kurikulum
                        </div>
                    </div>
                </div>

                {/* 3. TABS SWITCHER KEMAHASISWAAN (Gaya /admin/study-programs) */}
                <div className="flex border-b border-slate-200 space-x-2 sm:space-x-6 overflow-x-auto">
                    <Link
                        href="/admin/students"
                        className="pb-3 text-xs font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer"
                    >
                        <GraduationCap className="w-4 h-4" />
                        <span>Data Mahasiswa</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            Data Induk
                        </span>
                    </Link>

                    <Link
                        href="/admin/student-curricula"
                        className="pb-3 text-xs font-bold border-b-2 border-purple-600 text-purple-700 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer"
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Kurikulum Mahasiswa</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                            {currentProdi && year ? `${studentsData?.total || 0} Mhs` : 'Plotting'}
                        </span>
                    </Link>

                    <Link
                        href="/admin/academic-advising"
                        className="pb-3 text-xs font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer"
                    >
                        <UserCheck className="w-4 h-4" />
                        <span>Bimbingan Akademik</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            Dosen PA
                        </span>
                    </Link>

                    <Link
                        href="/admin/student-portal"
                        className="pb-3 text-xs font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer"
                    >
                        <KeyRound className="w-4 h-4" />
                        <span>User Portal Mahasiswa</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            Akun Portal
                        </span>
                    </Link>
                </div>

                {/* CONTENT AREA */}
                {!isSelectionActive ? (
                    <div className="bg-white rounded-3xl border border-slate-200/90 p-10 text-center shadow-xs">
                        <div className="max-w-md mx-auto space-y-3">
                            <div className="w-14 h-14 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                                <BookOpen className="w-7 h-7 stroke-[1.8]" />
                            </div>
                            <h3 className="text-base font-black text-slate-900">
                                Pilih Program Studi & Angkatan
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Tentukan Program Studi dan Tahun Angkatan pada form di atas untuk melihat dan menetapkan paket kurikulum mahasiswa.
                            </p>

                            {/* Quick Select Pills */}
                            <div className="pt-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                                    Pilih Cepat Program Studi:
                                </span>
                                <div className="flex flex-wrap items-center justify-center gap-1.5">
                                    {studyPrograms.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => {
                                                setProdi(String(p.id));
                                                if (year) handleTriggerFilter(String(p.id), year);
                                            }}
                                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition border cursor-pointer ${
                                                String(prodi) === String(p.id)
                                                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                            }`}
                                        >
                                            {p.national_code ? `${p.national_code} - ` : ''}{p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden relative animate-fadeIn">
                        {isLoadingData && (
                            <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-2xs flex items-center justify-center">
                                <div className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold">
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                                    <span>Memuat kurikulum mahasiswa...</span>
                                </div>
                            </div>
                        )}

                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama mahasiswa atau NIM..."
                                    className="w-full text-[11px] pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 font-medium"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* TABLE */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-3 w-10 text-center">
                                            <input
                                                type="checkbox"
                                                checked={isAllSelected}
                                                onChange={handleToggleSelectAll}
                                                className="w-3.5 h-3.5 rounded border-slate-400 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                            />
                                        </th>
                                        <th className="py-3 px-2 w-10 text-center">No.</th>
                                        <th className="py-3 px-3 w-20 text-center">Aksi</th>
                                        <th className="py-3 px-4 w-32 font-mono">NIM</th>
                                        <th className="py-3 px-4">Nama Mahasiswa</th>
                                        <th className="py-3 px-3 text-center">Angkatan</th>
                                        <th className="py-3 px-4">Kurikulum yang Diikuti</th>
                                        <th className="py-3 px-3 text-center">Beban SKS</th>
                                        <th className="py-3 px-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-[11px]">
                                    {studentList.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="py-10 text-center text-slate-400 italic">
                                                Tidak ada data mahasiswa yang sesuai dengan filter pencarian ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        studentList.map((stu, idx) => (
                                            <tr key={stu.id} className="hover:bg-slate-50 transition">
                                                <td className="py-3 px-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(stu.id)}
                                                        onChange={() => handleToggleSelectOne(stu.id)}
                                                        className="w-3.5 h-3.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="py-3 px-2 text-center font-bold text-slate-400 text-[10px]">
                                                    {(studentsData?.from || 1) + idx}
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenAssignModal(stu)}
                                                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white rounded-lg text-[10px] font-bold transition flex items-center space-x-1 mx-auto cursor-pointer shadow-2xs"
                                                    >
                                                        <Edit3 className="w-3 h-3" />
                                                        <span>Ubah</span>
                                                    </button>
                                                </td>
                                                <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                                    {stu.identity_number || stu.username}
                                                </td>
                                                <td className="py-3 px-4 font-bold text-slate-900">
                                                    {stu.name}
                                                </td>
                                                <td className="py-3 px-3 text-center font-bold text-slate-700">
                                                    {stu.batch_year || year}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {stu.curriculum ? (
                                                        <span className="px-2.5 py-1 rounded-xl text-[10.5px] font-bold bg-purple-50 text-purple-900 border border-purple-200 inline-block">
                                                            {stu.curriculum.name} ({stu.curriculum.code})
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-[10px]">
                                                            Belum Ditetapkan
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3 text-center font-bold text-slate-700">
                                                    {stu.curriculum ? `${stu.curriculum.total_credits_required} SKS` : '-'}
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                                        stu.curriculum_id ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {stu.curriculum_id ? 'Terpetakan' : 'Belum Plot'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION FOOTER */}
                        {studentsData && studentsData.total > 0 && (
                            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50/50">
                                <div className="text-slate-500 text-[11px]">
                                    Menampilkan <strong className="text-slate-800">{studentsData.from || 0}</strong> - <strong className="text-slate-800">{studentsData.to || 0}</strong> dari <strong className="text-slate-800">{studentsData.total}</strong> mahasiswa
                                </div>

                                <div className="flex items-center space-x-1">
                                    {studentsData.links?.map((link, index) => {
                                        if (!link.url && link.label.includes('Previous')) return null;
                                        if (!link.url && link.label.includes('Next')) return null;

                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={(e) => handlePaginationClick(e, link.url)}
                                                disabled={!link.url || link.active}
                                                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                                                    link.active 
                                                        ? 'bg-purple-600 text-white shadow-xs cursor-default' 
                                                        : link.url 
                                                        ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200' 
                                                        : 'text-slate-400 cursor-not-allowed opacity-50'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL ASSIGN KURIKULUM */}
            {isAssignModalOpen && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsAssignModalOpen(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
                >
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
                        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-purple-950 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-purple-400">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-white">Penetapan Kurikulum</h3>
                                    <p className="text-[11px] text-slate-300">Terapkan ke {selectedIds.length} mahasiswa terpilih</p>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setIsAssignModalOpen(false)} 
                                className="p-1.5 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleExecuteAssign} className="p-6 space-y-4 text-xs">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                    Pilih Paket Kurikulum:
                                </label>
                                <select
                                    value={targetCurriculumId}
                                    onChange={(e) => setTargetCurriculumId(e.target.value)}
                                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 font-bold"
                                    required
                                >
                                    <option value="">-- Pilih Kurikulum --</option>
                                    {curricula.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.code}) — {c.total_credits_required} SKS
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {assignSuccessMsg && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold text-[11px] flex items-center space-x-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>{assignSuccessMsg}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAssignModalOpen(false)}
                                    className="px-3.5 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAssigning || !targetCurriculumId}
                                    className="px-4.5 py-2 text-[11px] font-black bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md shadow-purple-600/20 transition cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                                >
                                    {isAssigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                    <span>Terapkan Kurikulum</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
