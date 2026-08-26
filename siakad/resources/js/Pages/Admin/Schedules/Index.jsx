import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Calendar, Clock, AlertTriangle, CheckCircle2, Plus, 
    Trash2, Edit2, Building2, User, BookOpen, Layers, ShieldAlert,
    Filter, ChevronRight, Video, MapPin, Sparkles, X, Save,
    ChevronDown, Check, Lock, ChevronLeft, LayoutGrid, ListFilter,
    GraduationCap, RefreshCw, School
} from 'lucide-react';

const DAYS = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];

export default function SchedulesIndex({ 
    academicPeriods = [],
    activePeriod, 
    selectedPeriodId, 
    studyPrograms = [],
    buildings = [], 
    rooms = [], 
    classes = [], 
    schedules = [], 
    conflicts = [] 
}) {
    const [periodId, setPeriodId] = useState(selectedPeriodId ? Number(selectedPeriodId) : (activePeriod?.id || 1));
    const [selectedProdiId, setSelectedProdiId] = useState('ALL');
    const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
    const [isProdiDropdownOpen, setIsProdiDropdownOpen] = useState(false);
    const periodDropdownRef = useRef(null);
    const prodiDropdownRef = useRef(null);

    // View Mode: 'grid' (Weekly Grid) | 'table' (Tabular List)
    const [viewMode, setViewMode] = useState('grid');
    const [selectedDayFilter, setSelectedDayFilter] = useState('ALL');
    const [selectedRoomFilter, setSelectedRoomFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Table Pagination
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Modal State - Plotting / Edit Jadwal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [clashCheckResult, setClashCheckResult] = useState(null);
    const [isCheckingClash, setIsCheckingClash] = useState(false);

    // Modal State - Konfirmasi Hapus
    const [scheduleToDelete, setScheduleToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Current Academic Period Object
    const currentPeriodObj = useMemo(() => {
        return academicPeriods.find(p => Number(p.id) === Number(periodId)) || activePeriod || null;
    }, [academicPeriods, periodId, activePeriod]);

    // Form Jadwal
    const form = useForm({
        course_class_id: '',
        room_id: '',
        day_of_week: 'SENIN',
        start_time: '08:00',
        end_time: '09:40',
        is_online: false,
        online_meeting_url: '',
        allow_clash_override: false,
    });

    // Close active modal or dropdown on ESC key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
                if (scheduleToDelete) {
                    setScheduleToDelete(null);
                } else if (isPeriodDropdownOpen) {
                    setIsPeriodDropdownOpen(false);
                } else if (isProdiDropdownOpen) {
                    setIsProdiDropdownOpen(false);
                } else if (isModalOpen) {
                    setIsModalOpen(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, isPeriodDropdownOpen, isProdiDropdownOpen, scheduleToDelete]);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (periodDropdownRef.current && !periodDropdownRef.current.contains(event.target)) {
                setIsPeriodDropdownOpen(false);
            }
            if (prodiDropdownRef.current && !prodiDropdownRef.current.contains(event.target)) {
                setIsProdiDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Switch Academic Period
    const handlePeriodChange = (newPeriodId) => {
        setPeriodId(newPeriodId);
        setCurrentPage(1);
        router.get('/admin/schedules', { period_id: newPeriodId }, { preserveState: true, preserveScroll: true });
    };

    // Realtime Conflict Checker API
    const handleRealtimeClashCheck = async (formValues, excludeId = null) => {
        if (!formValues.room_id || !formValues.course_class_id) return;
        setIsCheckingClash(true);
        try {
            const payload = {
                ...formValues,
                exclude_schedule_id: excludeId,
            };
            const res = await fetch('/admin/schedules/check-conflict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            setClashCheckResult(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsCheckingClash(false);
        }
    };

    const handleFormChange = (key, value) => {
        const updated = { ...form.data, [key]: value };
        form.setData(key, value);
        handleRealtimeClashCheck(updated, editingSchedule?.id || null);
    };

    const openModal = (schedule = null) => {
        setEditingSchedule(schedule);
        if (schedule) {
            const initialData = {
                course_class_id: schedule.course_class_id,
                room_id: schedule.room_id,
                day_of_week: schedule.day_of_week,
                start_time: schedule.start_time ? schedule.start_time.substring(0, 5) : '08:00',
                end_time: schedule.end_time ? schedule.end_time.substring(0, 5) : '09:40',
                is_online: Boolean(schedule.is_online),
                online_meeting_url: schedule.online_meeting_url || '',
                allow_clash_override: false,
            };
            form.setData(initialData);
            handleRealtimeClashCheck(initialData, schedule.id);
        } else {
            const initialData = {
                course_class_id: classes[0]?.id || '',
                room_id: rooms[0]?.id || '',
                day_of_week: 'SENIN',
                start_time: '08:00',
                end_time: '09:40',
                is_online: false,
                online_meeting_url: '',
                allow_clash_override: false,
            };
            form.setData(initialData);
            handleRealtimeClashCheck(initialData, null);
        }
        setIsModalOpen(true);
    };

    const handleSubmitSchedule = (e) => {
        e.preventDefault();
        if (editingSchedule) {
            form.put(`/admin/schedules/${editingSchedule.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                    setClashCheckResult(null);
                },
            });
        } else {
            form.post('/admin/schedules', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                    setClashCheckResult(null);
                },
            });
        }
    };

    // Eksekusi Hapus Jadwal
    const confirmDeleteSchedule = () => {
        if (!scheduleToDelete) return;
        setIsDeleting(true);
        router.delete(`/admin/schedules/${scheduleToDelete.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setScheduleToDelete(null);
            },
        });
    };

    // Helper format jam
    const formatTimeRange = (startTime, endTime) => {
        const s = startTime ? String(startTime).substring(0, 5) : '';
        const e = endTime ? String(endTime).substring(0, 5) : '';
        return s && e ? `${s} - ${e}` : (s || e || '-');
    };

    // Filter schedules
    const filteredSchedules = useMemo(() => {
        if (!Array.isArray(schedules)) return [];
        return schedules.filter((s) => {
            if (!s) return false;
            // Filter Hari
            if (selectedDayFilter !== 'ALL' && s.day_of_week !== selectedDayFilter) return false;
            // Filter Ruangan
            if (selectedRoomFilter !== 'ALL' && String(s.room_id) !== String(selectedRoomFilter)) return false;
            // Filter Prodi
            if (selectedProdiId !== 'ALL' && String(s.study_program_id) !== String(selectedProdiId)) return false;
            // Filter Search
            const q = searchTerm.toLowerCase().trim();
            if (!q) return true;
            return (
                s.course_name?.toLowerCase().includes(q) ||
                s.course_code?.toLowerCase().includes(q) ||
                s.class_name?.toLowerCase().includes(q) ||
                s.room_name?.toLowerCase().includes(q) ||
                s.room_code?.toLowerCase().includes(q) ||
                s.lecturer_name?.toLowerCase().includes(q) ||
                s.day_of_week?.toLowerCase().includes(q)
            );
        });
    }, [schedules, selectedDayFilter, selectedRoomFilter, selectedProdiId, searchTerm]);

    // Pagination for Table View
    const totalFiltered = filteredSchedules.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / perPage));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    const paginatedSchedules = useMemo(() => {
        const start = (safeCurrentPage - 1) * perPage;
        return filteredSchedules.slice(start, start + perPage);
    }, [filteredSchedules, safeCurrentPage, perPage]);

    const fromIndex = totalFiltered === 0 ? 0 : (safeCurrentPage - 1) * perPage + 1;
    const toIndex = Math.min(safeCurrentPage * perPage, totalFiltered);

    return (
        <AppLayout title="Penjadwalan Kuliah">
            <Head title="Penjadwalan Kuliah — SIAKAD" />

            <div className="space-y-3.5">
                {/* 1. COMPACT HERO HEADER DENGAN INTEGRATED PERIOD & PRODI PICKER */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-fuchsia-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative border border-slate-700/50 z-10">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 text-[10px] font-black mb-1">
                                <Sparkles className="w-3 h-3 text-fuchsia-400" />
                                <span>MANAJEMEN WAKTU & RUANG KELAS</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center space-x-2">
                                <span>Penjadwalan Kuliah</span>
                            </h2>
                        </div>

                        {/* Status Anti-Clash & Total Sesi */}
                        <div className="flex flex-wrap items-center gap-2">
                            {conflicts.length > 0 ? (
                                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold animate-pulse">
                                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                                    <span>{conflicts.length} Jadwal Bentrok Terdeteksi!</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-fuchsia-950/60 border border-fuchsia-500/30 text-fuchsia-200 text-xs">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span>Anti-Clash: <strong>100% Bebas Bentrok</strong></span>
                                </div>
                            )}

                            <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-300">
                                <strong className="text-white font-mono">{schedules.length}</strong> Sesi Terjadwal
                            </div>
                        </div>
                    </div>

                    {/* Integrated Sub-bar: Pemilih Tahun Akademik & Program Studi */}
                    <div className="relative z-20 mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* 1. Pemilih Periode Akademik */}
                        <div ref={periodDropdownRef} className="relative">
                            <div className="flex items-center justify-between mb-1 text-[11px]">
                                <span className="text-slate-300 font-bold flex items-center space-x-1">
                                    <School className="w-3.5 h-3.5 text-fuchsia-400" />
                                    <span>Tahun & Periode Akademik:</span>
                                </span>
                                {currentPeriodObj?.is_active && (
                                    <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                        <span>Semester Aktif</span>
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsPeriodDropdownOpen(prev => !prev)}
                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition shadow-2xs cursor-pointer text-left border ${
                                    isPeriodDropdownOpen 
                                        ? 'border-fuchsia-400 ring-2 ring-fuchsia-500/30 bg-slate-800 text-white' 
                                        : 'border-fuchsia-500/40 bg-fuchsia-950/40 hover:bg-fuchsia-900/40 text-fuchsia-100 font-bold'
                                }`}
                            >
                                <div className="flex items-center space-x-2 truncate">
                                    <School className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                                    <span className="truncate">
                                        {currentPeriodObj ? currentPeriodObj.name : 'Pilih Periode Akademik...'}
                                    </span>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${
                                    isPeriodDropdownOpen ? 'rotate-180 text-fuchsia-400' : ''
                                }`} />
                            </button>

                            {/* Popover Periode Akademik */}
                            {isPeriodDropdownOpen && (
                                <div className="absolute left-0 top-full mt-1.5 w-full sm:w-88 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn">
                                    <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                                            <School className="w-3.5 h-3.5 text-fuchsia-600" />
                                            <span>PILIH PERIODE AKADEMIK ({academicPeriods.length})</span>
                                        </span>
                                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                                            ESC
                                        </span>
                                    </div>

                                    <div className="p-2 space-y-1 max-h-64 overflow-y-auto divide-y divide-slate-100/70">
                                        {academicPeriods.map((p) => {
                                            const isSelected = Number(p.id) === Number(periodId);
                                            return (
                                                <div
                                                    key={p.id}
                                                    onClick={() => {
                                                        handlePeriodChange(p.id);
                                                        setIsPeriodDropdownOpen(false);
                                                    }}
                                                    className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between group ${
                                                        isSelected
                                                            ? 'bg-fuchsia-50 border border-fuchsia-300 shadow-2xs'
                                                            : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                                    }`}
                                                >
                                                    <div className="min-w-0">
                                                        <div className="flex items-center space-x-1.5">
                                                            <h4 className={`text-xs truncate ${
                                                                isSelected ? 'text-fuchsia-950 font-black' : 'text-slate-900 font-bold group-hover:text-fuchsia-700'
                                                            }`}>
                                                                {p.name}
                                                            </h4>
                                                            {p.is_active && (
                                                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                                    Aktif
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            Semester {p.semester_type || 'Reguler'} • {p.academic_year}
                                                        </span>
                                                    </div>

                                                    {isSelected && (
                                                        <div className="w-4 h-4 rounded-full bg-fuchsia-600 text-white flex items-center justify-center shadow-xs shrink-0 ml-2">
                                                            <Check className="w-2.5 h-2.5" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Filter Program Studi */}
                        <div ref={prodiDropdownRef} className="relative">
                            <div className="flex items-center justify-between mb-1 text-[11px]">
                                <span className="text-slate-300 font-bold flex items-center space-x-1">
                                    <GraduationCap className="w-3.5 h-3.5 text-fuchsia-400" />
                                    <span>Filter Program Studi:</span>
                                </span>
                                {selectedProdiId !== 'ALL' && (
                                    <span 
                                        onClick={() => setSelectedProdiId('ALL')}
                                        className="text-[10px] text-fuchsia-300 hover:text-white cursor-pointer underline"
                                    >
                                        Tampilkan Semua
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsProdiDropdownOpen(prev => !prev)}
                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition shadow-2xs cursor-pointer text-left border ${
                                    isProdiDropdownOpen 
                                        ? 'border-fuchsia-400 ring-2 ring-fuchsia-500/30 bg-slate-800 text-white' 
                                        : selectedProdiId !== 'ALL'
                                            ? 'border-fuchsia-500/40 bg-fuchsia-950/40 hover:bg-fuchsia-900/40 text-fuchsia-100 font-bold'
                                            : 'border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 font-medium'
                                }`}
                            >
                                <div className="flex items-center space-x-2 truncate">
                                    <GraduationCap className={`w-3.5 h-3.5 shrink-0 ${selectedProdiId !== 'ALL' ? 'text-fuchsia-400' : 'text-slate-400'}`} />
                                    <span className="truncate">
                                        {selectedProdiId === 'ALL' 
                                            ? 'Semua Program Studi (Seluruh Kampus)' 
                                            : studyPrograms.find(p => String(p.id) === String(selectedProdiId))?.name || 'Pilih Prodi'}
                                    </span>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${
                                    isProdiDropdownOpen ? 'rotate-180 text-fuchsia-400' : ''
                                }`} />
                            </button>

                            {/* Popover Program Studi */}
                            {isProdiDropdownOpen && (
                                <div className="absolute right-0 top-full mt-1.5 w-full sm:w-88 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn">
                                    <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                                            <GraduationCap className="w-3.5 h-3.5 text-fuchsia-600" />
                                            <span>FILTER PROGRAM STUDI</span>
                                        </span>
                                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                                            ESC
                                        </span>
                                    </div>

                                    <div className="p-2 space-y-1 max-h-64 overflow-y-auto divide-y divide-slate-100/70">
                                        <div
                                            onClick={() => {
                                                setSelectedProdiId('ALL');
                                                setIsProdiDropdownOpen(false);
                                            }}
                                            className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between ${
                                                selectedProdiId === 'ALL'
                                                    ? 'bg-fuchsia-50 border border-fuchsia-300 font-black text-fuchsia-950'
                                                    : 'hover:bg-slate-50 text-slate-700'
                                            }`}
                                        >
                                            <span className="text-xs">Semua Program Studi (Seluruh Kampus)</span>
                                            {selectedProdiId === 'ALL' && <Check className="w-3 h-3 text-fuchsia-600" />}
                                        </div>

                                        {studyPrograms.map((p) => {
                                            const isSelected = String(p.id) === String(selectedProdiId);
                                            return (
                                                <div
                                                    key={p.id}
                                                    onClick={() => {
                                                        setSelectedProdiId(String(p.id));
                                                        setIsProdiDropdownOpen(false);
                                                    }}
                                                    className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between group ${
                                                        isSelected
                                                            ? 'bg-fuchsia-50 border border-fuchsia-300 shadow-2xs'
                                                            : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                                    }`}
                                                >
                                                    <div className="min-w-0">
                                                        <h4 className={`text-xs truncate ${
                                                            isSelected ? 'text-fuchsia-950 font-black' : 'text-slate-900 font-bold group-hover:text-fuchsia-700'
                                                        }`}>
                                                            {p.name}
                                                        </h4>
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            {p.code} • Jenjang {p.degree || 'S1'}
                                                        </span>
                                                    </div>

                                                    {isSelected && (
                                                        <div className="w-4 h-4 rounded-full bg-fuchsia-600 text-white flex items-center justify-center shadow-xs shrink-0 ml-2">
                                                            <Check className="w-2.5 h-2.5" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. PERINGATAN BENTROK JIKA DITEMUKAN */}
                {conflicts.length > 0 && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-rose-900 animate-fadeIn shadow-2xs">
                        <div className="flex items-center space-x-2 font-black text-xs uppercase tracking-wide text-rose-700">
                            <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
                            <span>PERINGATAN: TERDETEKSI {conflicts.length} JADWAL BENTROK PADA PERIODE INI!</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {conflicts.map((c, idx) => (
                                <div key={idx} className="p-3 bg-white rounded-xl border border-rose-200 text-xs shadow-2xs space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px]">
                                            {c.type === 'ROOM_CLASH' ? 'Bentrok Ruang' : 'Bentrok Dosen'} • {c.day}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono">{c.time_a}</span>
                                    </div>
                                    <p className="font-bold text-slate-900 leading-snug">{c.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. TOOLBAR KONTROL FILTER, VIEW MODE & PENCARIAN */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden animate-fadeIn">
                    <div className="p-3 bg-slate-50/70 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs relative z-20">
                        {/* Hari Pills & View Mode */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Mode Toggle (Grid vs Table) */}
                            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('grid')}
                                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                                        viewMode === 'grid'
                                            ? 'bg-fuchsia-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                    <span>Matriks Mingguan</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('table')}
                                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                                        viewMode === 'table'
                                            ? 'bg-fuchsia-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <ListFilter className="w-3.5 h-3.5" />
                                    <span>Tabel Daftar</span>
                                </button>
                            </div>

                            {/* Day Quick Filters */}
                            <div className="flex items-center space-x-1 pl-2 border-l border-slate-200 overflow-x-auto">
                                <button
                                    type="button"
                                    onClick={() => setSelectedDayFilter('ALL')}
                                    className={`px-2 py-0.8 rounded-lg text-[10px] font-black transition cursor-pointer ${
                                        selectedDayFilter === 'ALL'
                                            ? 'bg-fuchsia-600 text-white shadow-2xs'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    Semua Hari
                                </button>
                                {DAYS.map((d) => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setSelectedDayFilter(d)}
                                        className={`px-2 py-0.8 rounded-lg text-[10px] font-black transition cursor-pointer ${
                                            selectedDayFilter === d
                                                ? 'bg-fuchsia-600 text-white shadow-2xs'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>

                            {/* Ruangan Filter */}
                            <div className="flex items-center space-x-1 pl-2 border-l border-slate-200">
                                <span className="text-slate-500 text-[11px] font-bold">Ruang:</span>
                                <select
                                    value={selectedRoomFilter}
                                    onChange={(e) => setSelectedRoomFilter(e.target.value)}
                                    className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 shadow-2xs focus:outline-fuchsia-500 cursor-pointer"
                                >
                                    <option value="ALL">Semua Ruangan</option>
                                    {rooms.map((r) => (
                                        <option key={r.id} value={r.id}>{r.code} - {r.name}</option>
                                    ))}
                                </select>
                            </div>

                            {viewMode === 'table' && (
                                <div className="flex items-center space-x-1 pl-2 border-l border-slate-200">
                                    <span className="text-slate-500 text-[11px] font-bold">Baris:</span>
                                    <select
                                        value={perPage}
                                        onChange={(e) => {
                                            setPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 shadow-2xs focus:outline-fuchsia-500 cursor-pointer"
                                    >
                                        <option value={5}>5 baris</option>
                                        <option value={10}>10 baris</option>
                                        <option value={25}>25 baris</option>
                                        <option value={50}>50 baris</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Search Box & Tombol Tambah (Icon + Tooltip) */}
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Cari matakuliah, dosen, ruang..."
                                    className="pl-8 pr-7 py-1 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-fuchsia-500 w-52 sm:w-60 shadow-2xs"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setCurrentPage(1);
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            {/* Tombol Tambah Jadwal (Icon + Tooltip Muncul ke Bawah) */}
                            <div className="relative group">
                                <button
                                    type="button"
                                    onClick={() => openModal()}
                                    title="Plotting Jadwal Baru"
                                    aria-label="Plotting Jadwal Baru"
                                    className="p-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 active:scale-95 text-white rounded-lg transition flex items-center justify-center shadow-xs cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                                {/* Floating Tooltip (Muncul ke bawah agar tidak tertutup header) */}
                                <div className="absolute right-0 top-full mt-2 hidden group-hover:flex flex-col items-end pointer-events-none z-50">
                                    <div className="w-2 h-2 mr-2.5 -mb-1 bg-slate-900 rotate-45 border-l border-t border-slate-700 z-10"></div>
                                    <span className="whitespace-nowrap px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-xl border border-slate-700">
                                        Plotting Jadwal Baru
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. CONTENT VIEW: GRID MINGGUAN ATAU TABEL DAFTAR */}
                    {viewMode === 'grid' ? (
                        /* MODE MATRIKS MINGGUAN */
                        <div className="p-4 bg-slate-100/60">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                {DAYS.filter(d => selectedDayFilter === 'ALL' || selectedDayFilter === d).map((day) => {
                                    const daySchedules = filteredSchedules.filter((s) => s.day_of_week === day);
                                    return (
                                        <div key={day} className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
                                            {/* Header Hari */}
                                            <div className="px-3.5 py-2.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                                                <span className="font-black text-xs uppercase tracking-wider flex items-center space-x-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-fuchsia-400" />
                                                    <span>{day}</span>
                                                </span>
                                                <span className="px-2 py-0.5 bg-slate-800 text-fuchsia-300 rounded text-[10px] font-mono font-bold border border-slate-700">
                                                    {daySchedules.length} Sesi
                                                </span>
                                            </div>

                                            {/* Daftar Jadwal Hari Ini */}
                                            <div className="p-3 space-y-2.5 flex-1 bg-slate-50/40">
                                                {daySchedules.length === 0 ? (
                                                    <div className="py-8 text-center text-slate-400 text-xs italic">
                                                        Tidak ada perkuliahan pada hari ini
                                                    </div>
                                                ) : (
                                                    daySchedules.map((sch) => (
                                                        <div 
                                                            key={sch.id} 
                                                            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-fuchsia-300 shadow-2xs space-y-2 transition group"
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="min-w-0 pr-2">
                                                                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                                                                        <span className="px-1.5 py-0.5 bg-fuchsia-50 text-fuchsia-900 border border-fuchsia-200 rounded font-mono font-black text-[10px]">
                                                                            {sch.course_code}
                                                                        </span>
                                                                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-bold text-[10px]">
                                                                            {sch.credits} SKS
                                                                        </span>
                                                                        <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-800 rounded font-bold text-[10px]">
                                                                            {sch.class_name}
                                                                        </span>
                                                                    </div>
                                                                    <h4 className="text-xs font-black text-slate-900 mt-1 leading-snug truncate" title={sch.course_name}>
                                                                        {sch.course_name}
                                                                    </h4>
                                                                </div>

                                                                <div className="flex items-center space-x-1 shrink-0">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openModal(sch)}
                                                                        className="p-1 text-slate-400 hover:text-fuchsia-700 hover:bg-fuchsia-50 rounded-md transition cursor-pointer"
                                                                        title="Edit Jadwal"
                                                                    >
                                                                        <Edit2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setScheduleToDelete(sch)}
                                                                        className="p-1 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-md transition cursor-pointer"
                                                                        title="Hapus Jadwal"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Waktu & Ruangan */}
                                                            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                                                                <div className="flex items-center space-x-1 font-bold text-slate-800">
                                                                    <Clock className="w-3 h-3 text-fuchsia-600 shrink-0" />
                                                                    <span>{formatTimeRange(sch.start_time, sch.end_time)}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-1 text-slate-600 truncate">
                                                                    <MapPin className="w-3 h-3 text-indigo-600 shrink-0" />
                                                                    <span className="truncate font-bold text-slate-700">{sch.room_code}</span>
                                                                </div>
                                                            </div>

                                                            {/* Dosen & Kapasitas */}
                                                            <div className="flex items-center justify-between text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                                                                <span className="font-bold truncate flex items-center space-x-1">
                                                                    <User className="w-3 h-3 text-slate-400 shrink-0" />
                                                                    <span className="truncate">{sch.lecturer_name || 'Dosen Pengampu'}</span>
                                                                </span>
                                                                <span className="font-bold text-slate-700 shrink-0 ml-1.5">{sch.class_capacity} Mhs</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        /* MODE TABEL DAFTAR JADWAL */
                        <div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-[11px]">
                                    <thead>
                                        <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                                            <th className="py-3 px-3 text-center w-10 border-r border-slate-800">No.</th>
                                            <th className="py-3 px-3 w-20 border-r border-slate-800">Hari</th>
                                            <th className="py-3 px-3 w-28 border-r border-slate-800">Jam Kuliah</th>
                                            <th className="py-3 px-4 border-r border-slate-800">Mata Kuliah & SKS</th>
                                            <th className="py-3 px-3 w-24 border-r border-slate-800">Kelas</th>
                                            <th className="py-3 px-3 w-36 border-r border-slate-800">Ruangan & Gedung</th>
                                            <th className="py-3 px-4 border-r border-slate-800">Dosen Pengampu</th>
                                            <th className="py-3 px-3 text-center w-20">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium">
                                        {paginatedSchedules.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="py-8 text-center text-slate-500">
                                                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                    <p className="font-bold text-xs">Tidak ada jadwal perkuliahan yang sesuai filter.</p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">Klik tombol "+" di atas untuk membuat jadwal baru.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedSchedules.map((sch, idx) => (
                                                <tr key={sch.id} className="hover:bg-fuchsia-50/40 transition">
                                                    <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                                                        {(safeCurrentPage - 1) * perPage + idx + 1}
                                                    </td>

                                                    <td className="py-2.5 px-3">
                                                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-black text-[10px]">
                                                            {sch.day_of_week}
                                                        </span>
                                                    </td>

                                                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                                                        {formatTimeRange(sch.start_time, sch.end_time)}
                                                    </td>

                                                    <td className="py-2.5 px-4 font-bold text-slate-900">
                                                        <div className="flex items-center space-x-1.5">
                                                            <span className="font-mono text-[10px] font-black text-fuchsia-950 px-1.5 py-0.2 bg-fuchsia-50 border border-fuchsia-200 rounded">
                                                                {sch.course_code}
                                                            </span>
                                                            <span>{sch.course_name}</span>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                                            {sch.credits} SKS • Semester {sch.semester_level || 1}
                                                        </span>
                                                    </td>

                                                    <td className="py-2.5 px-3">
                                                        <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold text-[10px]">
                                                            {sch.class_name}
                                                        </span>
                                                    </td>

                                                    <td className="py-2.5 px-3">
                                                        <strong className="text-slate-900 block">{sch.room_code}</strong>
                                                        <span className="text-[10px] text-slate-500 block">{sch.building_name} ({sch.room_capacity} kursi)</span>
                                                    </td>

                                                    <td className="py-2.5 px-4 text-slate-700">
                                                        <span className="font-bold text-slate-900 block">{sch.lecturer_name || 'Belum Ditentukan'}</span>
                                                        <span className="text-[10px] text-slate-400">Kapasitas: {sch.class_capacity} Mhs</span>
                                                    </td>

                                                    <td className="py-2.5 px-3 text-center">
                                                        <div className="flex items-center justify-center space-x-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => openModal(sch)}
                                                                className="p-1 text-slate-500 hover:text-fuchsia-700 hover:bg-fuchsia-50 rounded-md transition cursor-pointer"
                                                                title="Edit Jadwal"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setScheduleToDelete(sch)}
                                                                className="p-1 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition cursor-pointer"
                                                                title="Hapus Jadwal"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Bar */}
                            <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                                <div className="text-slate-500 text-[11px]">
                                    Menampilkan <strong className="text-slate-800 font-bold">{fromIndex}</strong> - <strong className="text-slate-800 font-bold">{toIndex}</strong> dari <strong className="text-slate-800 font-bold">{totalFiltered}</strong> jadwal perkuliahan
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center space-x-1">
                                        <button
                                            type="button"
                                            disabled={safeCurrentPage === 1}
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            className={`px-2 py-1 rounded-lg border text-xs font-bold transition flex items-center space-x-1 ${
                                                safeCurrentPage === 1
                                                    ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-white'
                                                    : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100 cursor-pointer shadow-2xs'
                                            }`}
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline text-[11px]">Sebelumnya</span>
                                        </button>

                                        <div className="flex items-center space-x-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                                <button
                                                    key={pageNum}
                                                    type="button"
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                                                        pageNum === safeCurrentPage
                                                            ? 'bg-fuchsia-600 text-white shadow-xs'
                                                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            disabled={safeCurrentPage === totalPages}
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            className={`px-2 py-1 rounded-lg border text-xs font-bold transition flex items-center space-x-1 ${
                                                safeCurrentPage === totalPages
                                                    ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-white'
                                                    : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100 cursor-pointer shadow-2xs'
                                            }`}
                                        >
                                            <span className="hidden sm:inline text-[11px]">Berikutnya</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* MODAL PLOTTING / EDIT JADWAL PERKULIAHAN */}
            {/* ========================================================================= */}
            {isModalOpen && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsModalOpen(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-2xs animate-fadeIn"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
                        {/* Header Dark Fuchsia Gradient */}
                        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-fuchsia-950 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="p-1.5 bg-fuchsia-500/20 text-fuchsia-300 rounded-lg border border-fuchsia-500/30">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xs text-white">
                                        {editingSchedule ? 'Edit Jadwal Perkuliahan' : 'Plotting Jadwal Kuliah Baru'}
                                    </h3>
                                    <p className="text-[10px] text-slate-300">
                                        Periode {currentPeriodObj?.name}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                                    ESC
                                </span>
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitSchedule} className="p-5 space-y-3.5 text-xs">
                            {/* Pilihan Kelas Mata Kuliah */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                    Kelas Mata Kuliah <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={form.data.course_class_id}
                                    onChange={(e) => handleFormChange('course_class_id', e.target.value)}
                                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-fuchsia-500"
                                    required
                                >
                                    <option value="">-- Pilih Kelas Mata Kuliah --</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.course_code} - {c.course_name} ({c.name}) • {c.credits} SKS [{c.lecturer_name || 'Tanpa Dosen'}]
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Ruangan Kelas & Hari */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                        Ruangan Kelas <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={form.data.room_id}
                                        onChange={(e) => handleFormChange('room_id', e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-fuchsia-500"
                                        required
                                    >
                                        <option value="">-- Pilih Ruang --</option>
                                        {rooms.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.code} - {r.name} ({r.capacity} kursi)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                        Hari Perkuliahan <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={form.data.day_of_week}
                                        onChange={(e) => handleFormChange('day_of_week', e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-fuchsia-500"
                                        required
                                    >
                                        {DAYS.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Waktu Mulai & Waktu Selesai */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                        Jam Mulai (WIB) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={form.data.start_time}
                                        onChange={(e) => handleFormChange('start_time', e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-fuchsia-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                        Jam Selesai (WIB) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={form.data.end_time}
                                        onChange={(e) => handleFormChange('end_time', e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-fuchsia-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Realtime Anti-Clash Alert in Modal */}
                            {clashCheckResult && (
                                <div className={`p-3 rounded-xl border text-xs transition-all ${
                                    clashCheckResult.has_conflict
                                        ? 'bg-rose-50 border-rose-300 text-rose-900'
                                        : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                }`}>
                                    <div className="flex items-center space-x-2 font-bold">
                                        {clashCheckResult.has_conflict ? (
                                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                        ) : (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        )}
                                        <span>{clashCheckResult.message}</span>
                                    </div>
                                    {clashCheckResult.has_conflict && (
                                        <div className="mt-2 pt-2 border-t border-rose-200 flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="override_clash"
                                                checked={form.data.allow_clash_override}
                                                onChange={(e) => form.setData('allow_clash_override', e.target.checked)}
                                                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                                            />
                                            <label htmlFor="override_clash" className="font-bold text-rose-800 text-[11px] cursor-pointer">
                                                Izinkan bentrok darurat (Override Jadwal)
                                            </label>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tombol Aksi */}
                            <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={form.processing || (clashCheckResult?.has_conflict && !form.data.allow_clash_override)} 
                                    className="px-4 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-lg shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{form.processing ? 'Menyimpan...' : (editingSchedule ? 'Perbarui Jadwal' : 'Simpan Jadwal Kuliah')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL KONFIRMASI HAPUS (PREMIUM ROSE / RED DESIGN) */}
            {/* ========================================================================= */}
            {scheduleToDelete && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !isDeleting) setScheduleToDelete(null);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-2xs animate-fadeIn"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-rose-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
                        {/* Header Dark Rose Gradient */}
                        <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-rose-950 to-slate-950 text-white flex items-center justify-between border-b border-rose-900/40">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                                    <Trash2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xs text-white">Hapus Jadwal Perkuliahan</h3>
                                    <p className="text-[10px] text-rose-300">Sesi perkuliahan ini akan dihapus dari sistem</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                                    ESC
                                </span>
                                <button 
                                    type="button" 
                                    disabled={isDeleting}
                                    onClick={() => setScheduleToDelete(null)} 
                                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-4">
                            {/* Item Details Box */}
                            <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-3.5 space-y-1.5">
                                <div className="flex items-center space-x-2">
                                    <span className="font-mono text-[10px] font-black px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded">
                                        {scheduleToDelete.course_code}
                                    </span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-rose-200 rounded text-slate-700">
                                        {scheduleToDelete.day_of_week} ({formatTimeRange(scheduleToDelete.start_time, scheduleToDelete.end_time)})
                                    </span>
                                </div>
                                <p className="text-xs font-black text-slate-900 leading-snug">
                                    {scheduleToDelete.course_name} ({scheduleToDelete.class_name})
                                </p>
                                <p className="text-[10px] text-slate-500">
                                    Ruang: <strong className="text-slate-700">{scheduleToDelete.room_code} - {scheduleToDelete.room_name}</strong> • Dosen: <strong className="text-slate-700">{scheduleToDelete.lecturer_name || '-'}</strong>
                                </p>
                            </div>

                            {/* Warning Alert */}
                            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-[11px] leading-relaxed">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <span>
                                    Menghapus jadwal ini akan membebaskan slot ruangan dan jam mengajar dosen pada waktu terkait, serta menghilangkan jadwal dari presensi dan kalender mahasiswa.
                                </span>
                            </div>

                            {/* Footer Buttons */}
                            <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    disabled={isDeleting}
                                    onClick={() => setScheduleToDelete(null)} 
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="button" 
                                    disabled={isDeleting}
                                    onClick={confirmDeleteSchedule}
                                    className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/30 transition flex items-center space-x-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Jadwal'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
