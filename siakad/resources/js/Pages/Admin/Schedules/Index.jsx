import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Calendar, Clock, AlertTriangle, CheckCircle2, Plus, 
    Trash2, Edit2, Building2, User, Users, BookOpen, Layers, ShieldAlert,
    Filter, ChevronRight, Video, MapPin, Sparkles, X, Save,
    ChevronDown, Check, Lock, ChevronLeft, LayoutGrid, ListFilter,
    GraduationCap, RefreshCw, School, Search, FileText, ClipboardList,
    FolderOpen, AlertCircle, UserCheck, BarChart2, Printer
} from 'lucide-react';

const DAYS = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
const MEETINGS = Array.from({ length: 16 }, (_, i) => i + 1);

export default function SchedulesIndex({ 
    academicPeriods = [],
    activePeriod, 
    selectedPeriodId, 
    studyPrograms = [],
    curricula = [],
    courses = [],
    lecturers = [],
    buildings = [], 
    rooms = [], 
    classes = [], 
    schedules = [], 
    examSchedules = [],
    attendanceClasses = [],
    selectedClassId: initialSelectedClassId = null,
    selectedClass: initialSelectedClass = null,
    attendanceStudents = [],
    attendanceMatrix = {},
    conflicts = [] 
}) {
    // Active Main Tab: 'classes' | 'exams' | 'attendance' (Mirip Fasilitas / Gedung & Ruang)
    const [activeTab, setActiveTab] = useState('classes');
    
    // Exam Sub-tab: 'UTS' | 'UAS'
    const [examType, setExamType] = useState('UTS');

    // Filters
    const [periodId, setPeriodId] = useState(selectedPeriodId ? Number(selectedPeriodId) : (activePeriod?.id || 1));
    const [selectedProdiId, setSelectedProdiId] = useState('ALL');
    const [selectedCurriculumId, setSelectedCurriculumId] = useState('ALL');
    const [selectedDayFilter, setSelectedDayFilter] = useState('ALL');
    const [selectedRoomFilter, setSelectedRoomFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // View Mode for Regular Schedules: 'table' (Tabel Data Terperinci) | 'grid' (Matriks Visual Mingguan)
    const [viewMode, setViewMode] = useState('table');

    // Pagination for Table View
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // =========================================================================
    // STATE TAB 3: PRESENSI KELAS (SESUAI REFERENSI jadwal-presensikelas.png)
    // =========================================================================
    const [attendanceClassId, setAttendanceClassId] = useState(
        initialSelectedClassId || attendanceClasses[0]?.course_class_id || ''
    );
    const [matrixData, setMatrixData] = useState(attendanceMatrix || {});
    const [isSavingMatrix, setIsSavingMatrix] = useState(false);
    const [matrixSaveStatus, setMatrixSaveStatus] = useState(null);
    const [batchMeetingFill, setBatchMeetingFill] = useState(1);

    // Sync matrixData when props change
    useEffect(() => {
        setMatrixData(attendanceMatrix || {});
    }, [attendanceMatrix]);

    // Quick Inline Form State (Jadwal Kelas - sesuai jadwalkelas.png)
    const [quickCourseId, setQuickCourseId] = useState(courses[0]?.id || '');
    const [quickClassCode, setQuickClassCode] = useState('');
    const [quickCapacity, setQuickCapacity] = useState(35);
    const [quickRoomId, setQuickRoomId] = useState(rooms[0]?.id || '');
    const [quickDay, setQuickDay] = useState('SENIN');
    const [quickStartTime, setQuickStartTime] = useState('08:00');
    const [quickEndTime, setQuickEndTime] = useState('09:40');
    const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);

    // Modal State - Full Plotting / Edit Jadwal Kuliah
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [clashCheckResult, setClashCheckResult] = useState(null);
    const [isCheckingClash, setIsCheckingClash] = useState(false);

    // Modal State - Jadwal Ujian (UTS / UAS - sesuai jadwalujian.png)
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [editingExamClass, setEditingExamClass] = useState(null);
    const [examFormDate, setExamFormDate] = useState('');
    const [examFormStartTime, setExamFormStartTime] = useState('08:00');
    const [examFormEndTime, setExamFormEndTime] = useState('09:30');
    const [examFormRoomId, setExamFormRoomId] = useState('');
    const [examFormInvigilatorId, setExamFormInvigilatorId] = useState('');
    const [examFormNotes, setExamFormNotes] = useState('');
    const [isSubmittingExam, setIsSubmittingExam] = useState(false);

    // Modal State - Detail Peserta Kelas
    const [enrolledClassDetail, setEnrolledClassDetail] = useState(null);

    // Modal State - Konfirmasi Hapus Jadwal Kuliah
    const [scheduleToDelete, setScheduleToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Modal State - Konfirmasi Hapus Jadwal Ujian
    const [examToDelete, setExamToDelete] = useState(null);
    const [isDeletingExam, setIsDeletingExam] = useState(false);

    // Dropdown popovers
    const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
    const [isProdiDropdownOpen, setIsProdiDropdownOpen] = useState(false);
    const periodDropdownRef = useRef(null);
    const prodiDropdownRef = useRef(null);

    // Current Academic Period Object
    const currentPeriodObj = useMemo(() => {
        return academicPeriods.find(p => Number(p.id) === Number(periodId)) || activePeriod || null;
    }, [academicPeriods, periodId, activePeriod]);

    // Full Form Jadwal Kuliah (Modal)
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

    // Close any open modal on ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
                if (scheduleToDelete) {
                    setScheduleToDelete(null);
                } else if (examToDelete) {
                    setExamToDelete(null);
                } else if (enrolledClassDetail) {
                    setEnrolledClassDetail(null);
                } else if (isExamModalOpen) {
                    setIsExamModalOpen(false);
                } else if (isModalOpen) {
                    setIsModalOpen(false);
                } else if (isPeriodDropdownOpen) {
                    setIsPeriodDropdownOpen(false);
                } else if (isProdiDropdownOpen) {
                    setIsProdiDropdownOpen(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, isExamModalOpen, enrolledClassDetail, scheduleToDelete, examToDelete, isPeriodDropdownOpen, isProdiDropdownOpen]);

    // Close dropdowns on outside click
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
        router.get('/admin/schedules', { 
            period_id: newPeriodId,
            class_id: attendanceClassId 
        }, { preserveState: true, preserveScroll: true });
    };

    // Trigger Tampilkan Presensi Kelas (sesuai tombol 'Tampilkan' di jadwal-presensikelas.png)
    const handleShowAttendanceClass = (targetClassId = attendanceClassId) => {
        if (!targetClassId) return;
        router.get('/admin/schedules', {
            period_id: periodId,
            class_id: targetClassId,
        }, {
            preserveState: true,
            preserveScroll: true,
            only: ['selectedClassId', 'selectedClass', 'attendanceStudents', 'attendanceMatrix'],
        });
    };

    // Ubah status satu cell presensi pada matriks
    const handleMatrixCellChange = (studentId, meetingNum, newStatus) => {
        setMatrixData(prev => ({
            ...prev,
            [studentId]: {
                ...(prev[studentId] || {}),
                [meetingNum]: newStatus,
            },
        }));
        setMatrixSaveStatus(null);
    };

    // Set Semua Hadir (H) untuk pertemuan tertentu
    const handleBatchFillMeeting = (meetingNum) => {
        setMatrixData(prev => {
            const next = { ...prev };
            attendanceStudents.forEach(st => {
                if (!next[st.student_id]) next[st.student_id] = {};
                next[st.student_id][meetingNum] = 'H';
            });
            return next;
        });
        setMatrixSaveStatus(null);
    };

    // Simpan seluruh matriks presensi 16 pertemuan
    const handleSaveAttendanceMatrix = async () => {
        if (!attendanceClassId) return;
        setIsSavingMatrix(true);
        setMatrixSaveStatus(null);

        try {
            const res = await fetch('/admin/schedules/attendance/matrix', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    course_class_id: attendanceClassId,
                    matrix: matrixData,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setMatrixSaveStatus({ type: 'success', text: data.message });
                router.reload({ only: ['attendanceClasses', 'attendanceMatrix'], preserveScroll: true });
            }
        } catch (e) {
            setMatrixSaveStatus({ type: 'error', text: 'Gagal menyimpan perubahan presensi.' });
        } finally {
            setIsSavingMatrix(false);
        }
    };

    // Cetak Lembar Presensi (Window Print)
    const handlePrintAttendanceSheet = () => {
        window.print();
    };

    // Realtime Conflict Checker API for Modal
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

    // Open Plotting / Edit Regular Schedule Modal
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

    // Eksekusi Hapus Jadwal Kuliah
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

    // Eksekusi Form Input Cepat (sesuai referensi jadwalkelas.png)
    const handleQuickAddSchedule = (e) => {
        e.preventDefault();
        if (!quickCourseId || !quickClassCode.trim() || !quickRoomId) {
            alert('Mohon lengkapi pilihan Matakuliah, Kode Kelas, dan Ruangan.');
            return;
        }

        setIsSubmittingQuick(true);
        router.post('/admin/schedules/quick', {
            academic_period_id: periodId,
            course_id: quickCourseId,
            class_code: quickClassCode.trim(),
            capacity: Number(quickCapacity) || 35,
            room_id: quickRoomId,
            day_of_week: quickDay,
            start_time: quickStartTime,
            end_time: quickEndTime,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setQuickClassCode('');
            },
            onFinish: () => {
                setIsSubmittingQuick(false);
            }
        });
    };

    // Open Modal Plotting Jadwal Ujian (sesuai referensi jadwalujian.png)
    const openExamModal = (item) => {
        setEditingExamClass(item);
        setExamFormDate(item.exam_date || '');
        setExamFormStartTime(item.exam_start_time ? item.exam_start_time.substring(0, 5) : '08:00');
        setExamFormEndTime(item.exam_end_time ? item.exam_end_time.substring(0, 5) : '09:30');
        setExamFormRoomId(item.room_id || rooms[0]?.id || '');
        setExamFormInvigilatorId(item.invigilator_id || '');
        setExamFormNotes(item.exam_notes || '');
        setIsExamModalOpen(true);
    };

    // Submit Jadwal Ujian
    const handleSubmitExam = (e) => {
        e.preventDefault();
        if (!editingExamClass || !examFormDate) {
            alert('Mohon pilih tanggal pelaksanaan ujian.');
            return;
        }

        setIsSubmittingExam(true);
        router.post('/admin/schedules/exams', {
            academic_period_id: periodId,
            course_class_id: editingExamClass.course_class_id,
            exam_type: examType,
            exam_date: examFormDate,
            start_time: examFormStartTime,
            end_time: examFormEndTime,
            room_id: examFormRoomId || null,
            invigilator_id: examFormInvigilatorId || null,
            notes: examFormNotes || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsExamModalOpen(false);
                setEditingExamClass(null);
            },
            onFinish: () => {
                setIsSubmittingExam(false);
            }
        });
    };

    // Eksekusi Hapus Jadwal Ujian
    const confirmDeleteExam = () => {
        if (!examToDelete) return;
        setIsDeletingExam(true);
        router.delete(`/admin/schedules/exams/${examToDelete.exam_schedule_id}`, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeletingExam(false);
                setExamToDelete(null);
            },
        });
    };

    // Helper format jam
    const formatTimeRange = (startTime, endTime) => {
        const s = startTime ? String(startTime).substring(0, 5) : '';
        const e = endTime ? String(endTime).substring(0, 5) : '';
        return s && e ? `${s} - ${e}` : (s || e || '-');
    };

    // Filter Regular Schedules
    const filteredSchedules = useMemo(() => {
        if (!Array.isArray(schedules)) return [];
        return schedules.filter((s) => {
            if (!s) return false;
            if (selectedDayFilter !== 'ALL' && s.day_of_week !== selectedDayFilter) return false;
            if (selectedRoomFilter !== 'ALL' && String(s.room_id) !== String(selectedRoomFilter)) return false;
            if (selectedProdiId !== 'ALL' && String(s.study_program_id) !== String(selectedProdiId)) return false;
            const q = searchTerm.toLowerCase().trim();
            if (!q) return true;
            return (
                s.course_name?.toLowerCase().includes(q) ||
                s.course_code?.toLowerCase().includes(q) ||
                s.class_name?.toLowerCase().includes(q) ||
                s.class_code?.toLowerCase().includes(q) ||
                s.room_name?.toLowerCase().includes(q) ||
                s.room_code?.toLowerCase().includes(q) ||
                s.lecturer_name?.toLowerCase().includes(q) ||
                s.lecturer_nidn?.toLowerCase().includes(q) ||
                s.day_of_week?.toLowerCase().includes(q)
            );
        });
    }, [schedules, selectedDayFilter, selectedRoomFilter, selectedProdiId, searchTerm]);

    // Filter Exam Schedules
    const filteredExamSchedules = useMemo(() => {
        if (!Array.isArray(examSchedules)) return [];
        return examSchedules.filter((item) => {
            if (item.exam_type && item.exam_type !== examType) return false;
            if (selectedProdiId !== 'ALL' && String(item.study_program_id) !== String(selectedProdiId)) return false;
            const q = searchTerm.toLowerCase().trim();
            if (!q) return true;
            return (
                item.course_name?.toLowerCase().includes(q) ||
                item.course_code?.toLowerCase().includes(q) ||
                item.class_name?.toLowerCase().includes(q) ||
                item.class_code?.toLowerCase().includes(q) ||
                item.room_name?.toLowerCase().includes(q) ||
                item.room_code?.toLowerCase().includes(q) ||
                item.invigilator_name?.toLowerCase().includes(q)
            );
        });
    }, [examSchedules, examType, selectedProdiId, searchTerm]);

    // Pagination for Regular Schedules Table
    const totalFiltered = filteredSchedules.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / perPage));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    const paginatedSchedules = useMemo(() => {
        const start = (safeCurrentPage - 1) * perPage;
        return filteredSchedules.slice(start, start + perPage);
    }, [filteredSchedules, safeCurrentPage, perPage]);

    const fromIndex = totalFiltered === 0 ? 0 : (safeCurrentPage - 1) * perPage + 1;
    const toIndex = Math.min(safeCurrentPage * perPage, totalFiltered);

    // Pagination for Exam Schedules Table
    const totalFilteredExams = filteredExamSchedules.length;
    const totalExamPages = Math.max(1, Math.ceil(totalFilteredExams / perPage));
    const safeCurrentExamPage = Math.min(Math.max(1, currentPage), totalExamPages);

    const paginatedExams = useMemo(() => {
        const start = (safeCurrentExamPage - 1) * perPage;
        return filteredExamSchedules.slice(start, start + perPage);
    }, [filteredExamSchedules, safeCurrentExamPage, perPage]);

    const examFromIndex = totalFilteredExams === 0 ? 0 : (safeCurrentExamPage - 1) * perPage + 1;
    const examToIndex = Math.min(safeCurrentExamPage * perPage, totalFilteredExams);

    // Selected Class Object for Attendance Tab
    const currentAttendanceClass = initialSelectedClass || attendanceClasses.find(c => String(c.course_class_id) === String(attendanceClassId)) || null;

    return (
        <AppLayout title="Penjadwalan Kuliah & Presensi">
            <Head title="Penjadwalan Kuliah & Presensi" />

            <div className="space-y-4">
                {/* 1. COMPACT HERO HEADER DENGAN TEMA DARK-EMERALD RESMI (HIDE SAAT PRINT) */}
                <div className="print:hidden bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative border border-slate-700/50 z-10">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black mb-1">
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                <span>MANAJEMEN WAKTU, RUANG KELAS & PRESENSI</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center space-x-2">
                                <span>Penjadwalan Perkuliahan, Ujian & Presensi Kelas</span>
                            </h2>
                            <p className="text-xs text-slate-300 mt-0.5">
                                Plotting jadwal kelas kuliah mingguan, jadwal ujian (UTS & UAS), serta pencatatan presensi mahasiswa dan BAP 16 pertemuan.
                            </p>
                        </div>

                        {/* Status Anti-Clash & Counter */}
                        <div className="flex flex-wrap items-center gap-2">
                            {conflicts.length > 0 ? (
                                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold animate-pulse">
                                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                                    <span>{conflicts.length} Jadwal Bentrok Terdeteksi!</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span>Anti-Clash: <strong>100% Bebas Bentrok</strong></span>
                                </div>
                            )}

                            <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-300">
                                <strong className="text-white font-mono">{schedules.length}</strong> Jadwal Kuliah • <strong className="text-white font-mono">{classes.length}</strong> Kelas
                            </div>
                        </div>
                    </div>

                    {/* Integrated Sub-bar: Pemilih Tahun Akademik, Program Studi & Kurikulum */}
                    <div className="relative z-20 mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* 1. Pemilih Periode Akademik */}
                        <div ref={periodDropdownRef} className="relative">
                            <div className="flex items-center justify-between mb-1 text-[11px]">
                                <span className="text-slate-300 font-bold flex items-center space-x-1">
                                    <School className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Semester / Tahun Akademik:</span>
                                </span>
                                {currentPeriodObj?.is_active && (
                                    <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                        <span>Aktif</span>
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsPeriodDropdownOpen(prev => !prev)}
                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition shadow-2xs cursor-pointer text-left border ${
                                    isPeriodDropdownOpen 
                                        ? 'border-emerald-400 ring-2 ring-emerald-500/30 bg-slate-800 text-white' 
                                        : 'border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-100 font-bold'
                                }`}
                            >
                                <div className="flex items-center space-x-2 truncate">
                                    <School className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span className="truncate">
                                        {currentPeriodObj ? currentPeriodObj.name : 'Pilih Periode Akademik...'}
                                    </span>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${
                                    isPeriodDropdownOpen ? 'rotate-180 text-emerald-400' : ''
                                }`} />
                            </button>

                            {isPeriodDropdownOpen && (
                                <div className="absolute left-0 top-full mt-1.5 w-full sm:w-80 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn">
                                    <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                                            <School className="w-3.5 h-3.5 text-emerald-600" />
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
                                                            ? 'bg-emerald-50 border border-emerald-300 shadow-2xs'
                                                            : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                                    }`}
                                                >
                                                    <div className="min-w-0">
                                                        <div className="flex items-center space-x-1.5">
                                                            <h4 className={`text-xs truncate ${
                                                                isSelected ? 'text-emerald-950 font-black' : 'text-slate-900 font-bold group-hover:text-emerald-700'
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
                                                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0 ml-2">
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
                                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Program Studi:</span>
                                </span>
                                {selectedProdiId !== 'ALL' && (
                                    <span 
                                        onClick={() => setSelectedProdiId('ALL')}
                                        className="text-[10px] text-emerald-300 hover:text-white cursor-pointer underline"
                                    >
                                        Semua Prodi
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsProdiDropdownOpen(prev => !prev)}
                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition shadow-2xs cursor-pointer text-left border ${
                                    isProdiDropdownOpen 
                                        ? 'border-emerald-400 ring-2 ring-emerald-500/30 bg-slate-800 text-white' 
                                        : selectedProdiId !== 'ALL'
                                            ? 'border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-100 font-bold'
                                            : 'border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 font-medium'
                                }`}
                            >
                                <div className="flex items-center space-x-2 truncate">
                                    <GraduationCap className={`w-3.5 h-3.5 shrink-0 ${selectedProdiId !== 'ALL' ? 'text-emerald-400' : 'text-slate-400'}`} />
                                    <span className="truncate">
                                        {selectedProdiId === 'ALL' 
                                            ? 'Semua Program Studi' 
                                            : studyPrograms.find(p => String(p.id) === String(selectedProdiId))?.name || 'Pilih Prodi'}
                                    </span>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${
                                    isProdiDropdownOpen ? 'rotate-180 text-emerald-400' : ''
                                }`} />
                            </button>

                            {isProdiDropdownOpen && (
                                <div className="absolute left-0 top-full mt-1.5 w-full sm:w-80 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn">
                                    <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                                            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
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
                                                    ? 'bg-emerald-50 border border-emerald-300 font-black text-emerald-950'
                                                    : 'hover:bg-slate-50 text-slate-700'
                                            }`}
                                        >
                                            <span className="text-xs">Semua Program Studi (Seluruh Kampus)</span>
                                            {selectedProdiId === 'ALL' && <Check className="w-3 h-3 text-emerald-600" />}
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
                                                            ? 'bg-emerald-50 border border-emerald-300 shadow-2xs'
                                                            : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                                    }`}
                                                >
                                                    <div className="min-w-0">
                                                        <h4 className={`text-xs truncate ${
                                                            isSelected ? 'text-emerald-950 font-black' : 'text-slate-900 font-bold group-hover:text-emerald-700'
                                                        }`}>
                                                            {p.name}
                                                        </h4>
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            {p.code} • Jenjang {p.degree || 'S1'}
                                                        </span>
                                                    </div>

                                                    {isSelected && (
                                                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0 ml-2">
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

                        {/* 3. Filter Kurikulum */}
                        <div>
                            <div className="flex items-center justify-between mb-1 text-[11px]">
                                <span className="text-slate-300 font-bold flex items-center space-x-1">
                                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Kurikulum:</span>
                                </span>
                            </div>
                            <select
                                value={selectedCurriculumId}
                                onChange={(e) => setSelectedCurriculumId(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 bg-slate-800/90 text-slate-200 focus:outline-emerald-500 cursor-pointer"
                            >
                                <option value="ALL">Semua Kurikulum</option>
                                {curricula.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. TAB NAVIGASI MENU (PERSIS GAYA FASILITAS: GEDUNG & RUANG) (HIDE SAAT PRINT) */}
                <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-1">
                    <div className="flex space-x-6">
                        {/* Tab 1: Jadwal Perkuliahan */}
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab('classes');
                                setCurrentPage(1);
                            }}
                            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                                activeTab === 'classes'
                                    ? 'border-emerald-600 text-emerald-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <Calendar className="w-4 h-4" />
                            <span>Jadwal Perkuliahan</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                activeTab === 'classes' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                                {filteredSchedules.length} Sesi
                            </span>
                        </button>

                        {/* Tab 2: Jadwal Ujian (UTS & UAS) */}
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab('exams');
                                setCurrentPage(1);
                            }}
                            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                                activeTab === 'exams'
                                    ? 'border-emerald-600 text-emerald-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <ClipboardList className="w-4 h-4" />
                            <span>Jadwal Ujian (UTS & UAS)</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                activeTab === 'exams' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                                {filteredExamSchedules.length} Kelas
                            </span>
                        </button>

                        {/* Tab 3: Presensi Siswa / Presensi Kelas */}
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab('attendance');
                                setCurrentPage(1);
                            }}
                            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                                activeTab === 'attendance'
                                    ? 'border-emerald-600 text-emerald-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <UserCheck className="w-4 h-4" />
                            <span>Presensi Kelas</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                activeTab === 'attendance' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                                {attendanceClasses.length} Kelas
                            </span>
                        </button>
                    </div>

                    {/* Sub-controls based on active tab */}
                    <div className="flex items-center space-x-2 self-end sm:self-auto mb-2 sm:mb-0">
                        {activeTab === 'classes' && (
                            <>
                                {/* View Mode Toggle */}
                                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('table')}
                                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                                            viewMode === 'table'
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        <ListFilter className="w-3.5 h-3.5" />
                                        <span>Tabel Rinci</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('grid')}
                                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                                            viewMode === 'grid'
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        <LayoutGrid className="w-3.5 h-3.5" />
                                        <span>Matriks Mingguan</span>
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => openModal(null)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Plot Manual</span>
                                </button>
                            </>
                        )}

                        {activeTab === 'exams' && (
                            /* Sub-toggle UTS / UAS */
                            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                                <button
                                    type="button"
                                    onClick={() => setExamType('UTS')}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                                        examType === 'UTS'
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    UTS (Tengah Semester)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setExamType('UAS')}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                                        examType === 'UAS'
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    UAS (Akhir Semester)
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. ALERT BENTROK JIKA DITEMUKAN */}
                {conflicts.length > 0 && activeTab === 'classes' && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-rose-900 animate-fadeIn shadow-2xs print:hidden">
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

                {/* ========================================================================= */}
                {/* TAB 1: JADWAL KULIAH (KELAS MINGGUAN)                                      */}
                {/* ========================================================================= */}
                {activeTab === 'classes' && (
                    <div className="space-y-4 animate-fadeIn">
                        {/* A. FORM INPUT CEPAT KELAS & JADWAL (PERSIS SEPERTI REFERENSI jadwalkelas.png) */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4">
                            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                                <div className="flex items-center space-x-2">
                                    <Plus className="w-4 h-4 text-emerald-600" />
                                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                                        Tambah Cepat Data Kelas & Jadwal Perkuliahan
                                    </h3>
                                </div>
                                <span className="text-[11px] text-slate-400">
                                    Input langsung matakuliah, ruang, kuota dan jam kuliah
                                </span>
                            </div>

                            <form onSubmit={handleQuickAddSchedule} className="space-y-3">
                                {/* Baris 1: Matakuliah Dropdown */}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                        Matakuliah <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={quickCourseId}
                                        onChange={(e) => setQuickCourseId(e.target.value)}
                                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-emerald-500 cursor-pointer"
                                        required
                                    >
                                        <option value="">-- Pilih Matakuliah --</option>
                                        {courses.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.code} - {c.name} [SKS: {Number(c.credits).toFixed(2)} | Semester: {c.semester_level}]
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Baris 2: Detail Kelas, Kuota, Ruangan, Hari & Waktu */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 items-end">
                                    {/* Kode Kelas */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                            Kode Kelas <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={quickClassCode}
                                            onChange={(e) => setQuickClassCode(e.target.value)}
                                            placeholder="e.g. ES22 / PAI-1A"
                                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-emerald-500"
                                            required
                                        />
                                    </div>

                                    {/* Kuota */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                            Kuota Kelas <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={quickCapacity}
                                            onChange={(e) => setQuickCapacity(e.target.value)}
                                            min={1}
                                            max={200}
                                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-emerald-500"
                                            required
                                        />
                                    </div>

                                    {/* Ruangan */}
                                    <div className="lg:col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                            Ruangan Perkuliahan <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={quickRoomId}
                                            onChange={(e) => setQuickRoomId(e.target.value)}
                                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-emerald-500 cursor-pointer"
                                            required
                                        >
                                            <option value="">-- Pilih Ruang --</option>
                                            {rooms.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.code} - {r.name} [{r.building_name}: Lantai {r.floor_number || 1}]
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Hari */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                            Hari Kuliah <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={quickDay}
                                            onChange={(e) => setQuickDay(e.target.value)}
                                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-emerald-500 cursor-pointer"
                                            required
                                        >
                                            {DAYS.map((d) => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Jam Mulai - Selesai & Tombol Submit */}
                                    <div className="flex items-center space-x-1.5">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-slate-600 mb-1">Mulai</label>
                                            <input
                                                type="time"
                                                value={quickStartTime}
                                                onChange={(e) => setQuickStartTime(e.target.value)}
                                                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-emerald-500"
                                                required
                                            />
                                        </div>
                                        <span className="text-slate-400 font-bold mt-5">-</span>
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-slate-600 mb-1">Selesai</label>
                                            <input
                                                type="time"
                                                value={quickEndTime}
                                                onChange={(e) => setQuickEndTime(e.target.value)}
                                                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-emerald-500"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmittingQuick}
                                            className="mt-5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black flex items-center space-x-1 shadow-xs transition cursor-pointer shrink-0 disabled:opacity-50"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Tambah</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* B. TOOLBAR PENCARIAN & FILTER TABEL */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Filter Hari */}
                                <div className="flex items-center space-x-1">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedDayFilter('ALL')}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                                            selectedDayFilter === 'ALL'
                                                ? 'bg-emerald-600 text-white shadow-2xs'
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
                                            className={`px-2 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                                                selectedDayFilter === d
                                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>

                                {/* Filter Ruangan */}
                                <div className="flex items-center space-x-1 pl-2 border-l border-slate-200">
                                    <span className="text-slate-500 text-[11px] font-bold">Ruang:</span>
                                    <select
                                        value={selectedRoomFilter}
                                        onChange={(e) => setSelectedRoomFilter(e.target.value)}
                                        className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 shadow-2xs focus:outline-emerald-500 cursor-pointer"
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
                                            className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 shadow-2xs focus:outline-emerald-500 cursor-pointer"
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Search Box */}
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Cari matakuliah, dosen, ruang, kelas..."
                                    className="pl-8 pr-7 py-1 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-emerald-500 w-60 shadow-2xs"
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
                        </div>

                        {/* C. VIEW MODE 1: TABEL RINCI DATA KELAS (PERSIS SEPERTI jadwalkelas.png) */}
                        {viewMode === 'table' ? (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-slate-800 text-white font-bold uppercase tracking-wider text-[11px]">
                                                <th rowSpan={2} className="px-3 py-2 text-center w-12 border-b border-slate-700">No.</th>
                                                <th rowSpan={2} className="px-3 py-2 text-center w-28 border-b border-slate-700">Action</th>
                                                <th colSpan={2} className="px-3 py-1 text-center border-b border-r border-slate-700">Matakuliah</th>
                                                <th rowSpan={2} className="px-2.5 py-2 text-center w-14 border-b border-slate-700">SMT</th>
                                                <th rowSpan={2} className="px-2.5 py-2 text-center w-20 border-b border-slate-700">Kelas</th>
                                                <th colSpan={2} className="px-3 py-1 text-center border-b border-r border-slate-700">Peserta</th>
                                                <th rowSpan={2} className="px-3 py-2 text-left border-b border-slate-700">Jadwal</th>
                                                <th rowSpan={2} className="px-3 py-2 text-left border-b border-slate-700">Ruang</th>
                                                <th rowSpan={2} className="px-3 py-2 text-left border-b border-slate-700">Pengajar</th>
                                            </tr>
                                            <tr className="bg-slate-900 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                                                <th className="px-3 py-1 text-left w-24 border-b border-slate-800">Kode</th>
                                                <th className="px-3 py-1 text-left border-b border-r border-slate-800">Nama</th>
                                                <th className="px-2 py-1 text-center w-16 border-b border-slate-800">Kuota</th>
                                                <th className="px-2 py-1 text-center w-16 border-b border-r border-slate-800">Jumlah</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {paginatedSchedules.length > 0 ? (
                                                paginatedSchedules.map((s, idx) => {
                                                    const rowNo = fromIndex + idx;
                                                    const isFull = Number(s.enrolled_count || 0) >= Number(s.class_capacity || 0);

                                                    return (
                                                        <tr key={s.id} className="hover:bg-slate-50/80 transition group">
                                                            {/* No. */}
                                                            <td className="px-3 py-2.5 text-center text-slate-500 font-mono">
                                                                {rowNo}
                                                            </td>

                                                            {/* Action Icons */}
                                                            <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                                                <div className="inline-flex items-center space-x-1.5">
                                                                    {/* Edit Jadwal */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openModal(s)}
                                                                        title="Edit Jadwal Kuliah"
                                                                        className="p-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition cursor-pointer shadow-2xs"
                                                                    >
                                                                        <Edit2 className="w-3.5 h-3.5" />
                                                                    </button>

                                                                    {/* Detail Peserta Kelas */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setEnrolledClassDetail(s)}
                                                                        title="Lihat Peserta Kelas"
                                                                        className="p-1 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition cursor-pointer shadow-2xs"
                                                                    >
                                                                        <Users className="w-3.5 h-3.5" />
                                                                    </button>

                                                                    {/* Hapus Jadwal */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setScheduleToDelete(s)}
                                                                        title="Hapus Jadwal Kuliah"
                                                                        className="p-1 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition cursor-pointer shadow-2xs"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </td>

                                                            {/* Matakuliah: Kode */}
                                                            <td className="px-3 py-2.5 font-mono font-bold text-slate-700 whitespace-nowrap">
                                                                {s.course_code}
                                                            </td>

                                                            {/* Matakuliah: Nama [SKS] */}
                                                            <td className="px-3 py-2.5 font-bold text-slate-900 border-r border-slate-100">
                                                                {s.course_name} <span className="text-slate-400 font-mono text-[11px]">[{Number(s.credits).toFixed(2)} sks]</span>
                                                            </td>

                                                            {/* SMT */}
                                                            <td className="px-2.5 py-2.5 text-center font-mono font-bold text-slate-700">
                                                                {s.semester_level || '-'}
                                                            </td>

                                                            {/* Kelas */}
                                                            <td className="px-2.5 py-2.5 text-center font-black text-emerald-800 bg-emerald-50/40 rounded">
                                                                {s.class_code || s.class_name}
                                                            </td>

                                                            {/* Peserta: Kuota */}
                                                            <td className="px-2 py-2.5 text-center font-mono font-bold text-slate-700">
                                                                {s.class_capacity}
                                                            </td>

                                                            {/* Peserta: Jumlah */}
                                                            <td className="px-2 py-2.5 text-center font-mono font-black border-r border-slate-100">
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                                                    isFull 
                                                                        ? 'bg-amber-100 text-amber-800 font-black' 
                                                                        : 'bg-slate-100 text-slate-700'
                                                                }`}>
                                                                    {s.enrolled_count || 0}
                                                                </span>
                                                            </td>

                                                            {/* Jadwal: Hari [Jam Mulai - Selesai] */}
                                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                                <div className="font-bold text-slate-900">
                                                                    {s.day_of_week} <span className="font-mono text-slate-600">[{formatTimeRange(s.start_time, s.end_time)}]</span>
                                                                </div>
                                                                {s.is_online && (
                                                                    <span className="text-[10px] text-indigo-600 font-bold flex items-center space-x-1 mt-0.5">
                                                                        <Video className="w-3 h-3" />
                                                                        <span>Daring (Online)</span>
                                                                    </span>
                                                                )}
                                                            </td>

                                                            {/* Ruang: Kode - Nama [Gedung: Lantai X] */}
                                                            <td className="px-3 py-2.5 text-slate-700">
                                                                <div className="font-bold text-slate-900">
                                                                    {s.room_code} - {s.room_name}
                                                                </div>
                                                                <div className="text-[10px] text-slate-400">
                                                                    [{s.building_name}: Lantai {s.room_floor || 1}]
                                                                </div>
                                                            </td>

                                                            {/* Pengajar: NIDN - Nama */}
                                                            <td className="px-3 py-2.5">
                                                                {s.lecturer_name ? (
                                                                    <div>
                                                                        <span className="font-mono text-[10px] text-slate-400 block">
                                                                            {s.lecturer_nidn || 'NIDN/NIP: -'}
                                                                        </span>
                                                                        <span className="font-bold text-slate-900">
                                                                            {s.lecturer_name}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-slate-400 italic text-[11px]">
                                                                        Belum Ditugaskan
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                                                        <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2 opacity-60" />
                                                        <p className="font-bold">Tidak ada jadwal perkuliahan yang cocok dengan filter yang dipilih.</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Footer */}
                                <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                                    <div>
                                        Menampilkan <strong>{fromIndex}</strong> sampai <strong>{toIndex}</strong> dari <strong>{totalFiltered}</strong> jadwal perkuliahan
                                    </div>
                                    <div className="flex items-center space-x-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={safeCurrentPage <= 1}
                                            className="px-2.5 py-1 rounded bg-white border border-slate-300 font-bold disabled:opacity-40 cursor-pointer"
                                        >
                                            Sebelumnya
                                        </button>
                                        <span className="px-2 font-mono font-bold">
                                            Halaman {safeCurrentPage} dari {totalPages}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={safeCurrentPage >= totalPages}
                                            className="px-2.5 py-1 rounded bg-white border border-slate-300 font-bold disabled:opacity-40 cursor-pointer"
                                        >
                                            Selanjutnya
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* C. VIEW MODE 2: MATRIKS MINGGUAN (GRID VISUAL) */
                            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden p-4">
                                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                                    {DAYS.map((day) => {
                                        const daySchedules = filteredSchedules.filter(s => s.day_of_week === day);
                                        return (
                                            <div key={day} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col">
                                                <div className="bg-slate-800 text-white p-2.5 text-center font-black text-xs uppercase tracking-wider">
                                                    {day} ({daySchedules.length})
                                                </div>
                                                <div className="p-2 space-y-2 flex-1 max-h-120 overflow-y-auto">
                                                    {daySchedules.length > 0 ? (
                                                        daySchedules.map((s) => (
                                                            <div
                                                                key={s.id}
                                                                onClick={() => openModal(s)}
                                                                className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-emerald-500 hover:shadow-xs transition cursor-pointer text-xs space-y-1 group"
                                                            >
                                                                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500">
                                                                    <span className="text-emerald-700 font-black">{formatTimeRange(s.start_time, s.end_time)}</span>
                                                                    <span className="bg-slate-100 px-1.5 py-0.2 rounded">{s.class_code}</span>
                                                                </div>
                                                                <h4 className="font-black text-slate-900 group-hover:text-emerald-700 leading-snug line-clamp-2">
                                                                    {s.course_name}
                                                                </h4>
                                                                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                                                                    <span>{s.room_code}</span>
                                                                    <span>{s.credits} SKS</span>
                                                                </div>
                                                                {s.lecturer_name && (
                                                                    <div className="text-[10px] text-slate-600 truncate font-medium">
                                                                        {s.lecturer_name}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-4 text-center text-slate-400 text-xs italic">
                                                            Tidak ada jadwal
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 2: JADWAL UJIAN (UTS & UAS - PERSIS SEPERTI jadwalujian.png)           */}
                {/* ========================================================================= */}
                {activeTab === 'exams' && (
                    <div className="space-y-4 animate-fadeIn">
                        {/* Toolbar Jadwal Ujian */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-700">Tipe Pelaksanaan Ujian:</span>
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs">
                                    {examType === 'UTS' ? 'Ujian Tengah Semester (UTS)' : 'Ujian Akhir Semester (UAS)'}
                                </span>
                            </div>

                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Cari matakuliah, kelas, ruang ujian..."
                                    className="pl-8 pr-7 py-1 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-emerald-500 w-60 shadow-2xs"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Tabel Jadwal Ujian */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-800 text-white font-bold uppercase tracking-wider text-[11px]">
                                            <th rowSpan={2} className="px-3 py-2 text-center w-12 border-b border-slate-700">No.</th>
                                            <th rowSpan={2} className="px-3 py-2 text-center w-28 border-b border-slate-700">Action</th>
                                            <th colSpan={2} className="px-3 py-1 text-center border-b border-r border-slate-700">Matakuliah</th>
                                            <th rowSpan={2} className="px-2.5 py-2 text-center w-14 border-b border-slate-700">SMT</th>
                                            <th rowSpan={2} className="px-2.5 py-2 text-center w-20 border-b border-slate-700">Kelas</th>
                                            <th colSpan={2} className="px-3 py-1 text-center border-b border-r border-slate-700">Peserta</th>
                                            <th rowSpan={2} className="px-3 py-2 text-left border-b border-slate-700">Waktu Pelaksanaan</th>
                                            <th rowSpan={2} className="px-3 py-2 text-left border-b border-slate-700">Ruang Ujian</th>
                                            <th rowSpan={2} className="px-3 py-2 text-left border-b border-slate-700">Pengawas</th>
                                        </tr>
                                        <tr className="bg-slate-900 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                                            <th className="px-3 py-1 text-left w-24 border-b border-slate-800">Kode</th>
                                            <th className="px-3 py-1 text-left border-b border-r border-slate-800">Nama</th>
                                            <th className="px-2 py-1 text-center w-16 border-b border-slate-800">Kuota</th>
                                            <th className="px-2 py-1 text-center w-16 border-b border-r border-slate-800">Jumlah</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {paginatedExams.length > 0 ? (
                                            paginatedExams.map((item, idx) => {
                                                const rowNo = examFromIndex + idx;
                                                const isScheduled = Boolean(item.exam_date);

                                                return (
                                                    <tr key={item.course_class_id} className="hover:bg-slate-50/80 transition group">
                                                        {/* No. */}
                                                        <td className="px-3 py-2.5 text-center text-slate-500 font-mono">
                                                            {rowNo}
                                                        </td>

                                                        {/* Action (Folder / Atur Ujian & Hapus) */}
                                                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                                            <div className="inline-flex items-center space-x-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openExamModal(item)}
                                                                    title={isScheduled ? 'Ubah Jadwal Ujian' : 'Plot / Atur Jadwal Ujian'}
                                                                    className={`p-1.5 rounded-md transition cursor-pointer shadow-2xs ${
                                                                        isScheduled
                                                                            ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                                                                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold'
                                                                    }`}
                                                                >
                                                                    <FolderOpen className="w-3.5 h-3.5" />
                                                                </button>

                                                                {isScheduled && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setExamToDelete(item)}
                                                                        title="Hapus Jadwal Ujian"
                                                                        className="p-1.5 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition cursor-pointer shadow-2xs"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Matakuliah: Kode */}
                                                        <td className="px-3 py-2.5 font-mono font-bold text-slate-700 whitespace-nowrap">
                                                            {item.course_code}
                                                        </td>

                                                        {/* Matakuliah: Nama [SKS] */}
                                                        <td className="px-3 py-2.5 font-bold text-slate-900 border-r border-slate-100">
                                                            {item.course_name} <span className="text-slate-400 font-mono text-[11px]">[{Number(item.credits).toFixed(2)} sks]</span>
                                                        </td>

                                                        {/* SMT */}
                                                        <td className="px-2.5 py-2.5 text-center font-mono font-bold text-slate-700">
                                                            {item.semester_level || '-'}
                                                        </td>

                                                        {/* Kelas */}
                                                        <td className="px-2.5 py-2.5 text-center font-black text-emerald-800 bg-emerald-50/40 rounded">
                                                            {item.class_code || item.class_name}
                                                        </td>

                                                        {/* Peserta: Kuota */}
                                                        <td className="px-2 py-2.5 text-center font-mono font-bold text-slate-700">
                                                            {item.class_capacity}
                                                        </td>

                                                        {/* Peserta: Jumlah */}
                                                        <td className="px-2 py-2.5 text-center font-mono font-bold border-r border-slate-100">
                                                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                                                                {item.enrolled_count || 0}
                                                            </span>
                                                        </td>

                                                        {/* Waktu Pelaksanaan */}
                                                        <td className="px-3 py-2.5 whitespace-nowrap font-mono">
                                                            {isScheduled ? (
                                                                <div>
                                                                    <span className="font-bold text-slate-900 block">
                                                                        {item.exam_date}
                                                                    </span>
                                                                    <span className="text-emerald-700 text-[11px] font-bold">
                                                                        [{formatTimeRange(item.exam_start_time, item.exam_end_time)}]
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 font-bold text-[10px]">
                                                                    [-] Belum Diatur
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Ruang Ujian */}
                                                        <td className="px-3 py-2.5">
                                                            {item.room_name ? (
                                                                <div>
                                                                    <span className="font-bold text-slate-900 block">
                                                                        {item.room_code} - {item.room_name}
                                                                    </span>
                                                                    <span className="text-slate-400 text-[10px]">
                                                                        [{item.building_name}: Lt.{item.room_floor || 1}]
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-400 text-[10px]">
                                                                    [- : Lantai -]
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Pengawas */}
                                                        <td className="px-3 py-2.5">
                                                            {item.invigilator_name ? (
                                                                <span className="font-bold text-slate-800">
                                                                    {item.invigilator_name}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400 text-[11px] italic">
                                                                    Belum Ditugaskan
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                                                    <ClipboardList className="w-8 h-8 mx-auto text-slate-300 mb-2 opacity-60" />
                                                    <p className="font-bold">Tidak ada kelas kuliah yang dapat dijadwalkan ujian.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                                <div>
                                    Menampilkan <strong>{examFromIndex}</strong> sampai <strong>{examToIndex}</strong> dari <strong>{totalFilteredExams}</strong> matakuliah ujian
                                </div>
                                <div className="flex items-center space-x-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={safeCurrentExamPage <= 1}
                                        className="px-2.5 py-1 rounded bg-white border border-slate-300 font-bold disabled:opacity-40 cursor-pointer"
                                    >
                                        Sebelumnya
                                    </button>
                                    <span className="px-2 font-mono font-bold">
                                        Halaman {safeCurrentExamPage} dari {totalExamPages}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(prev => Math.min(totalExamPages, prev + 1))}
                                        disabled={safeCurrentExamPage >= totalExamPages}
                                        className="px-2.5 py-1 rounded bg-white border border-slate-300 font-bold disabled:opacity-40 cursor-pointer"
                                    >
                                        Selanjutnya
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 3: DATA PRESENSI KELAS (PERSIS SEPERTI REFERENSI jadwal-presensikelas.png)*/}
                {/* ========================================================================= */}
                {activeTab === 'attendance' && (
                    <div className="space-y-4 animate-fadeIn">
                        {/* PRINT ONLY HEADER */}
                        <div className="hidden print:flex items-center border-b-2 border-slate-900 pb-3 mb-4 space-x-4">
                            <img src="/logostai.png" alt="Logo STAI Al-Ittihad" className="w-14 h-14 object-contain shrink-0" />
                            <div className="text-center flex-1">
                                <h2 className="text-base font-black uppercase tracking-wider">SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD</h2>
                                <p className="text-xs text-slate-600 font-bold">LEMBAR PRESENSI PERKULIAHAN & BERITA ACARA (16 PERTEMUAN)</p>
                                <p className="text-[10px] text-slate-500 font-mono">Tahun Akademik: {currentPeriodObj?.name}</p>
                            </div>
                            <div className="w-14 shrink-0"></div>
                        </div>

                        {/* SECTION 1: FILTER ATAS (PERSIS SEPERTI DI jadwal-presensikelas.png) */}
                        <div className="print:hidden bg-white rounded-xl border border-slate-200 shadow-2xs p-4">
                            <h3 className="text-sm font-black text-slate-800 mb-3 border-b border-slate-100 pb-2">
                                Data Presensi Kelas
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                {/* Program Studi */}
                                <div className="md:col-span-5">
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                        Program Studi
                                    </label>
                                    <select
                                        value={selectedProdiId}
                                        onChange={(e) => setSelectedProdiId(e.target.value)}
                                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-emerald-500 cursor-pointer"
                                    >
                                        <option value="ALL">Semua Program Studi</option>
                                        {studyPrograms.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.code} - {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Semester */}
                                <div className="md:col-span-3">
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                        Semester
                                    </label>
                                    <select
                                        value={periodId}
                                        onChange={(e) => handlePeriodChange(Number(e.target.value))}
                                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-emerald-500 cursor-pointer"
                                    >
                                        {academicPeriods.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Kelas */}
                                <div className="md:col-span-4">
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                        Kelas Mata Kuliah
                                    </label>
                                    <select
                                        value={attendanceClassId}
                                        onChange={(e) => setAttendanceClassId(e.target.value)}
                                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-emerald-500 cursor-pointer"
                                    >
                                        <option value="">-- Pilih Kelas --</option>
                                        {attendanceClasses.map((c) => (
                                            <option key={c.course_class_id} value={c.course_class_id}>
                                                {c.course_name} [{c.class_code || c.class_name}] {Number(c.credits).toFixed(2)} SKS
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tombol Tampilkan */}
                                <div className="md:col-span-12 flex items-center justify-start pt-1">
                                    <button
                                        type="button"
                                        onClick={() => handleShowAttendanceClass(attendanceClassId)}
                                        disabled={!attendanceClassId}
                                        className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                                    >
                                        Tampilkan
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: METADATA KARTU KELAS (PERSIS SEPERTI DI jadwal-presensikelas.png) */}
                        {currentAttendanceClass && (
                            <div className="bg-slate-100/90 rounded-xl border border-slate-200/90 p-4 space-y-1.5 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 text-slate-800">
                                    <span className="sm:col-span-2 font-bold text-slate-600">Mata Kuliah</span>
                                    <span className="sm:col-span-10 font-bold">: {currentAttendanceClass.course_code} - {currentAttendanceClass.course_name}</span>

                                    <span className="sm:col-span-2 font-bold text-slate-600">Kelas</span>
                                    <span className="sm:col-span-10 font-bold">: {currentAttendanceClass.class_code || currentAttendanceClass.class_name}</span>

                                    <span className="sm:col-span-2 font-bold text-slate-600">Semester</span>
                                    <span className="sm:col-span-10 font-bold">: {currentPeriodObj?.name || '2025/2026 Genap'}</span>

                                    <span className="sm:col-span-2 font-bold text-slate-600">Waktu dan Tempat</span>
                                    <span className="sm:col-span-10 font-bold">
                                        : {currentAttendanceClass.day_of_week || 'Sabtu'} [{formatTimeRange(currentAttendanceClass.start_time, currentAttendanceClass.end_time)}]
                                        {currentAttendanceClass.room_name && (
                                            <span className="block sm:inline sm:ml-2">
                                                {currentAttendanceClass.room_code || '02'} - {currentAttendanceClass.room_name || 'Ruang 2'} [{currentAttendanceClass.building_name || 'Gedung A'}: Lantai {currentAttendanceClass.room_floor || 1}]
                                            </span>
                                        )}
                                    </span>

                                    <span className="sm:col-span-2 font-bold text-slate-600">Keterangan</span>
                                    <span className="sm:col-span-10 font-bold text-slate-700">
                                        : <strong className="text-emerald-700">H</strong> [Hadir] | <strong className="text-rose-700">A</strong> [Alpha] | <strong className="text-amber-700">I</strong> [Izin] | <strong className="text-blue-700">S</strong> [Sakit]
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* SECTION 3: TOMBOL AKSI CETAK & TOOLS CEPAT */}
                        <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center space-x-2">
                                {/* Tombol Hijau Cetak sesuai jadwal-presensikelas.png */}
                                <button
                                    type="button"
                                    onClick={handlePrintAttendanceSheet}
                                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Cetak</span>
                                </button>

                                {/* Tombol Simpan Perubahan Matriks */}
                                <button
                                    type="button"
                                    onClick={handleSaveAttendanceMatrix}
                                    disabled={isSavingMatrix || !attendanceStudents.length}
                                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center space-x-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{isSavingMatrix ? 'Menyimpan...' : 'Simpan Presensi'}</span>
                                </button>

                                {matrixSaveStatus && (
                                    <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 ${
                                        matrixSaveStatus.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                    }`}>
                                        {matrixSaveStatus.type === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                        <span>{matrixSaveStatus.text}</span>
                                    </div>
                                )}
                            </div>

                            {/* Batch Fill Helper */}
                            <div className="flex items-center space-x-1.5 text-xs">
                                <span className="text-slate-500 font-bold">Isi Semua Hadir:</span>
                                <select
                                    value={batchMeetingFill}
                                    onChange={(e) => setBatchMeetingFill(Number(e.target.value))}
                                    className="px-2 py-1 bg-white border border-slate-300 rounded-md text-xs font-bold text-slate-800 cursor-pointer"
                                >
                                    {MEETINGS.map(m => (
                                        <option key={m} value={m}>Pertemuan {m}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => handleBatchFillMeeting(batchMeetingFill)}
                                    className="px-2.5 py-1 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold transition cursor-pointer"
                                >
                                    Set Hadir (H)
                                </button>
                            </div>
                        </div>

                        {/* SECTION 4: TABEL MATRIKS PRESENSI LENGKAP 16 PERTEMUAN (PERSIS SEPERTI jadwal-presensikelas.png) */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden print:border-slate-800 print:shadow-none">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-800 text-white font-bold uppercase tracking-wider text-[11px] print:bg-slate-100 print:text-black">
                                            <th rowSpan={2} className="px-2 py-2 text-center w-8 border-b border-slate-700 print:border-slate-400">No.</th>
                                            <th rowSpan={2} className="px-3 py-2 text-left w-24 border-b border-slate-700 print:border-slate-400">NIM</th>
                                            <th rowSpan={2} className="px-3 py-2 text-left w-48 border-b border-slate-700 print:border-slate-400">Nama</th>
                                            <th rowSpan={2} className="px-3 py-2 text-left w-44 border-b border-r border-slate-700 print:border-slate-400">Program Studi</th>
                                            <th colSpan={16} className="px-2 py-1 text-center border-b border-slate-700 print:border-slate-400">
                                                Pertemuan
                                            </th>
                                        </tr>
                                        <tr className="bg-slate-900 text-slate-300 text-[10px] font-bold text-center uppercase tracking-wider print:bg-slate-50 print:text-black">
                                            {MEETINGS.map(m => (
                                                <th key={m} className="px-1 py-1 w-9 border-b border-r border-slate-800 print:border-slate-400">
                                                    {m}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 print:divide-slate-400">
                                        {attendanceStudents.length > 0 ? (
                                            attendanceStudents.map((st, idx) => {
                                                return (
                                                    <tr key={st.student_id} className="hover:bg-slate-50/80 transition">
                                                        {/* No. */}
                                                        <td className="px-2 py-2 text-center text-slate-500 font-mono print:text-black">
                                                            {idx + 1}
                                                        </td>

                                                        {/* NIM */}
                                                        <td className="px-3 py-2 font-mono font-bold text-slate-800 whitespace-nowrap print:text-black">
                                                            {st.nim || '-'}
                                                        </td>

                                                        {/* Nama */}
                                                        <td className="px-3 py-2 font-bold text-slate-900 whitespace-nowrap print:text-black">
                                                            {st.student_name}
                                                        </td>

                                                        {/* Program Studi */}
                                                        <td className="px-3 py-2 text-slate-600 whitespace-nowrap border-r border-slate-100 print:border-slate-400 print:text-black">
                                                            {st.study_program_name || 'Pendidikan Islam Anak Usia Dini'}
                                                        </td>

                                                        {/* Kolom Pertemuan 1 s/d 16 dengan select box persis screenshot */}
                                                        {MEETINGS.map(m => {
                                                            const currentVal = matrixData[st.student_id]?.[m] || '-';

                                                            return (
                                                                <td key={m} className="px-0.5 py-1 text-center border-r border-slate-100 print:border-slate-400">
                                                                    <select
                                                                        value={currentVal}
                                                                        onChange={(e) => handleMatrixCellChange(st.student_id, m, e.target.value)}
                                                                        className={`w-8 h-7 text-center rounded border font-mono font-bold text-xs cursor-pointer focus:outline-emerald-500 print:border-none print:appearance-none ${
                                                                            currentVal === 'H' 
                                                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                                                                : currentVal === 'A'
                                                                                    ? 'bg-rose-50 text-rose-800 border-rose-300 font-black'
                                                                                    : currentVal === 'I'
                                                                                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                                                                                        : currentVal === 'S'
                                                                                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                                                                                            : 'bg-white text-slate-400 border-slate-200'
                                                                        }`}
                                                                    >
                                                                        <option value="-">-</option>
                                                                        <option value="H">H</option>
                                                                        <option value="A">A</option>
                                                                        <option value="I">I</option>
                                                                        <option value="S">S</option>
                                                                    </select>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={20} className="px-4 py-8 text-center text-slate-400">
                                                    <UserCheck className="w-8 h-8 mx-auto text-slate-300 mb-2 opacity-60" />
                                                    <p className="font-bold">
                                                        {attendanceClassId ? 'Belum ada mahasiswa yang terdaftar di kelas ini.' : 'Silakan pilih kelas dan klik "Tampilkan".'}
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* PRINT ONLY SIGNATURE SECTION */}
                            <div className="hidden print:grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-slate-400 text-xs">
                                <div className="text-center">
                                    <p>Mengetahui,</p>
                                    <p className="font-bold">Ketua Program Studi</p>
                                    <div className="h-16"></div>
                                    <p className="font-bold underline">( ............................................ )</p>
                                    <p className="font-mono text-[10px]">NIDN. ....................................</p>
                                </div>
                                <div className="text-center">
                                    <p>Cianjur, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    <p className="font-bold">Dosen Pengampu Matakuliah</p>
                                    <div className="h-16"></div>
                                    <p className="font-bold underline">({currentAttendanceClass?.lecturer_name || '............................................'})</p>
                                    <p className="font-mono text-[10px]">NIDN. {currentAttendanceClass?.lecturer_nidn || '....................................'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* MODAL 1: PLOTTING / EDIT JADWAL KULIAH LENGKAP                             */}
                {/* ========================================================================= */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-scaleUp">
                            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 text-white flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-5 h-5 text-emerald-400" />
                                    <div>
                                        <h3 className="text-sm font-black tracking-tight">
                                            {editingSchedule ? 'Edit Jadwal Kuliah' : 'Plotting Jadwal Perkuliahan'}
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
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-emerald-500"
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
                                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-emerald-500"
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
                                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-emerald-500"
                                            required
                                        >
                                            {DAYS.map((d) => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Waktu Mulai & Selesai */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                            Jam Mulai (WIB) <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            value={form.data.start_time}
                                            onChange={(e) => handleFormChange('start_time', e.target.value)}
                                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-emerald-500"
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
                                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-emerald-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Status Bentrok Realtime */}
                                {isCheckingClash ? (
                                    <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600 text-xs flex items-center space-x-2">
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Memeriksa ketersediaan ruangan & dosen...</span>
                                    </div>
                                ) : clashCheckResult && (
                                    <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                                        clashCheckResult.has_conflict
                                            ? 'bg-rose-50 border-rose-300 text-rose-900'
                                            : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                    }`}>
                                        <div className="flex items-center space-x-1.5 font-black">
                                            {clashCheckResult.has_conflict ? (
                                                <AlertTriangle className="w-4 h-4 text-rose-600" />
                                            ) : (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            )}
                                            <span>{clashCheckResult.message}</span>
                                        </div>
                                        {clashCheckResult.has_conflict && (
                                            <div className="pt-1.5 border-t border-rose-200 flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="allow_clash_override"
                                                    checked={form.data.allow_clash_override}
                                                    onChange={(e) => form.setData('allow_clash_override', e.target.checked)}
                                                    className="rounded border-rose-400 text-rose-600 focus:ring-rose-500 cursor-pointer"
                                                />
                                                <label htmlFor="allow_clash_override" className="text-[11px] font-bold text-rose-800 cursor-pointer">
                                                    Paksa simpan meskipun ada peringatan bentrok (Override)
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tombol Aksi Modal */}
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={form.processing || (clashCheckResult?.has_conflict && !form.data.allow_clash_override)}
                                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center space-x-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>{editingSchedule ? 'Simpan Perubahan' : 'Plot Jadwal'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* MODAL 2: PLOTTING JADWAL UJIAN (UTS / UAS - SESUAI jadwalujian.png)       */}
                {/* ========================================================================= */}
                {isExamModalOpen && editingExamClass && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-scaleUp">
                            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 text-white flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <ClipboardList className="w-5 h-5 text-emerald-400" />
                                    <div>
                                        <h3 className="text-sm font-black tracking-tight">
                                            Plotting Jadwal Ujian {examType}
                                        </h3>
                                        <p className="text-[10px] text-slate-300 truncate max-w-xs">
                                            {editingExamClass.course_code} - {editingExamClass.course_name} ({editingExamClass.class_code})
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                    <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                                        ESC
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsExamModalOpen(false)} 
                                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmitExam} className="p-5 space-y-3.5 text-xs">
                                {/* Info Kelas Ringkas */}
                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                                    <div className="flex justify-between font-bold text-slate-800">
                                        <span>Kelas: {editingExamClass.class_code || editingExamClass.class_name}</span>
                                        <span>{editingExamClass.credits} SKS • SMT {editingExamClass.semester_level}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        Peserta: {editingExamClass.enrolled_count || 0} / Kuota {editingExamClass.class_capacity} Mahasiswa
                                    </div>
                                </div>

                                {/* Tanggal Ujian */}
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                        Tanggal Ujian <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={examFormDate}
                                        onChange={(e) => setExamFormDate(e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-emerald-500"
                                        required
                                    />
                                </div>

                                {/* Jam Mulai & Selesai */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                            Jam Mulai <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            value={examFormStartTime}
                                            onChange={(e) => setExamFormStartTime(e.target.value)}
                                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-emerald-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                            Jam Selesai <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            value={examFormEndTime}
                                            onChange={(e) => setExamFormEndTime(e.target.value)}
                                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-emerald-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Ruang Ujian */}
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                        Ruangan Ujian
                                    </label>
                                    <select
                                        value={examFormRoomId}
                                        onChange={(e) => setExamFormRoomId(e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-emerald-500 cursor-pointer"
                                    >
                                        <option value="">-- Pilih Ruang Ujian --</option>
                                        {rooms.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.code} - {r.name} [{r.building_name}: Lt.{r.floor_number || 1}] (Kapasitas: {r.exam_capacity || r.capacity} kursi)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Dosen Pengawas Ujian */}
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                        Dosen Pengawas Ujian
                                    </label>
                                    <select
                                        value={examFormInvigilatorId}
                                        onChange={(e) => setExamFormInvigilatorId(e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-emerald-500 cursor-pointer"
                                    >
                                        <option value="">-- Pilih Dosen Pengawas --</option>
                                        {lecturers.map((l) => (
                                            <option key={l.id} value={l.id}>
                                                {l.name} {l.identity_number ? `(${l.identity_number})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Catatan Ujian */}
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                        Catatan / Instruksi Khusus (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={examFormNotes}
                                        onChange={(e) => setExamFormNotes(e.target.value)}
                                        placeholder="e.g. Open book / Bawa kalkulator"
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-emerald-500"
                                    />
                                </div>

                                {/* Tombol Aksi */}
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsExamModalOpen(false)}
                                        className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingExam}
                                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center space-x-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Simpan Jadwal Ujian</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* MODAL 3: DETAIL PESERTA KELAS                                              */}
                {/* ========================================================================= */}
                {enrolledClassDetail && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-scaleUp">
                            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 text-white flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Users className="w-5 h-5 text-emerald-400" />
                                    <div>
                                        <h3 className="text-sm font-black tracking-tight">
                                            Informasi Peserta Kelas
                                        </h3>
                                        <p className="text-[10px] text-slate-300">
                                            {enrolledClassDetail.course_name} ({enrolledClassDetail.class_code || enrolledClassDetail.class_name})
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                    <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                                        ESC
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={() => setEnrolledClassDetail(null)} 
                                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <div>
                                        <span className="text-slate-500 text-[10px] block">Kode Matakuliah:</span>
                                        <strong className="text-slate-900">{enrolledClassDetail.course_code}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 text-[10px] block">Bobot SKS:</span>
                                        <strong className="text-slate-900">{enrolledClassDetail.credits} SKS</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 text-[10px] block">Kapasitas Kuota:</span>
                                        <strong className="text-slate-900">{enrolledClassDetail.class_capacity} Mahasiswa</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 text-[10px] block">Jumlah Terdaftar:</span>
                                        <strong className="text-emerald-700">{enrolledClassDetail.enrolled_count || 0} Mahasiswa</strong>
                                    </div>
                                </div>

                                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                                    <h4 className="font-black text-xs flex items-center space-x-1">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>Status Pendaftaran Mahasiswa (KRS)</span>
                                    </h4>
                                    <p className="text-[11px] leading-relaxed">
                                        Data peserta kelas otomatis tersinkronisasi saat mahasiswa mengisi KRS dan disetujui oleh Dosen Pembimbing Akademik (PA).
                                    </p>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setEnrolledClassDetail(null)}
                                        className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* MODAL 4: KONFIRMASI HAPUS JADWAL KULIAH                                   */}
                {/* ========================================================================= */}
                {scheduleToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-scaleUp">
                            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 p-4 text-white flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Trash2 className="w-5 h-5 text-rose-400" />
                                    <div>
                                        <h3 className="text-sm font-black tracking-tight">Hapus Jadwal Kuliah</h3>
                                        <p className="text-[10px] text-slate-300">Konfirmasi pembatalan plotting jadwal</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                    <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                                        ESC
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={() => setScheduleToDelete(null)} 
                                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 space-y-4 text-xs">
                                <p className="text-slate-700">
                                    Apakah Anda yakin ingin menghapus jadwal perkuliahan{' '}
                                    <strong className="text-slate-900">
                                        {scheduleToDelete.course_name} ({scheduleToDelete.class_code || scheduleToDelete.class_name})
                                    </strong>{' '}
                                    pada hari <strong className="text-slate-900">{scheduleToDelete.day_of_week} ({formatTimeRange(scheduleToDelete.start_time, scheduleToDelete.end_time)})</strong>?
                                </p>

                                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setScheduleToDelete(null)}
                                        className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={confirmDeleteSchedule}
                                        disabled={isDeleting}
                                        className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-black flex items-center space-x-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Jadwal'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* MODAL 5: KONFIRMASI HAPUS JADWAL UJIAN                                    */}
                {/* ========================================================================= */}
                {examToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-scaleUp">
                            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 p-4 text-white flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Trash2 className="w-5 h-5 text-rose-400" />
                                    <div>
                                        <h3 className="text-sm font-black tracking-tight">Hapus Jadwal Ujian</h3>
                                        <p className="text-[10px] text-slate-300">Konfirmasi pembatalan plotting jadwal ujian</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                    <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                                        ESC
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={() => setExamToDelete(null)} 
                                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 space-y-4 text-xs">
                                <p className="text-slate-700">
                                    Apakah Anda yakin ingin menghapus jadwal ujian {examType} untuk matakuliah{' '}
                                    <strong className="text-slate-900">
                                        {examToDelete.course_name} ({examToDelete.class_code || examToDelete.class_name})
                                    </strong>?
                                </p>

                                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setExamToDelete(null)}
                                        className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={confirmDeleteExam}
                                        disabled={isDeletingExam}
                                        className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-black flex items-center space-x-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>{isDeletingExam ? 'Menghapus...' : 'Ya, Hapus Ujian'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
