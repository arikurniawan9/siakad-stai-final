import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    GraduationCap, Building2, Plus, Edit2, Trash2, Search, 
    Award, Users, X, Save, Sparkles, ChevronLeft, ChevronRight,
    ChevronDown, Check, Lock
} from 'lucide-react';

export default function StudyProgramsIndex({ studyPrograms = [], faculties = [], lecturers = [] }) {
    const [activeTab, setActiveTab] = useState('prodi'); // 'prodi' | 'faculty'
    const [selectedFacultyId, setSelectedFacultyId] = useState('');
    const [isFacultyDropdownOpen, setIsFacultyDropdownOpen] = useState(false);
    const facultyDropdownRef = useRef(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDegreeFilter, setSelectedDegreeFilter] = useState('');

    // Pagination untuk Program Studi
    const [prodiPerPage, setProdiPerPage] = useState(10);
    const [prodiCurrentPage, setProdiCurrentPage] = useState(1);

    // Modal State - Prodi
    const [isProdiModalOpen, setIsProdiModalOpen] = useState(false);
    const [editingProdi, setEditingProdi] = useState(null);

    // Modal State - Faculty
    const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);

    // Form Prodi
    const prodiForm = useForm({
        faculty_id: '',
        code: '',
        name: '',
        degree: 'S1',
        accreditation: 'Baik Sekali',
        sk_number: '',
        head_of_program_id: '',
        secretary_id: '',
        is_active: true,
    });

    // Form Faculty
    const facultyForm = useForm({
        code: '',
        name: '',
        dean_name: '',
        is_active: true,
    });

    // Active Faculty Object
    const activeFacultyObj = useMemo(() => {
        return faculties.find(f => String(f.id) === String(selectedFacultyId)) || null;
    }, [faculties, selectedFacultyId]);

    // Close active modal or dropdown on ESC key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
                if (isFacultyDropdownOpen) {
                    setIsFacultyDropdownOpen(false);
                } else if (isProdiModalOpen) {
                    setIsProdiModalOpen(false);
                } else if (isFacultyModalOpen) {
                    setIsFacultyModalOpen(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isProdiModalOpen, isFacultyModalOpen, isFacultyDropdownOpen]);

    // Close faculty dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (facultyDropdownRef.current && !facultyDropdownRef.current.contains(event.target)) {
                setIsFacultyDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Open Prodi Modal
    const openProdiModal = (prodi = null) => {
        setEditingProdi(prodi);
        if (prodi) {
            prodiForm.setData({
                faculty_id: prodi.faculty_id || '',
                code: prodi.code || '',
                name: prodi.name || '',
                degree: prodi.degree || 'S1',
                accreditation: prodi.accreditation || 'Baik Sekali',
                sk_number: prodi.sk_number || '',
                head_of_program_id: prodi.head_of_program_id || '',
                secretary_id: prodi.secretary_id || '',
                is_active: Boolean(prodi.is_active),
            });
        } else {
            prodiForm.reset();
            prodiForm.setData({
                faculty_id: selectedFacultyId || (faculties[0]?.id ? String(faculties[0].id) : ''),
                code: '',
                name: '',
                degree: 'S1',
                accreditation: 'Baik Sekali',
                sk_number: '',
                head_of_program_id: '',
                secretary_id: '',
                is_active: true,
            });
        }
        setIsProdiModalOpen(true);
    };

    // Open Faculty Modal
    const openFacultyModal = (faculty = null) => {
        setEditingFaculty(faculty);
        if (faculty) {
            facultyForm.setData({
                code: faculty.code || '',
                name: faculty.name || '',
                dean_name: faculty.dean_name || '',
                is_active: Boolean(faculty.is_active),
            });
        } else {
            facultyForm.reset();
            facultyForm.setData({
                code: '',
                name: '',
                dean_name: '',
                is_active: true,
            });
        }
        setIsFacultyModalOpen(true);
    };

    // Submit Prodi
    const handleProdiSubmit = (e) => {
        e.preventDefault();
        if (editingProdi) {
            prodiForm.put(`/admin/study-programs/${editingProdi.id}`, {
                onSuccess: () => {
                    setIsProdiModalOpen(false);
                    prodiForm.reset();
                },
            });
        } else {
            prodiForm.post('/admin/study-programs', {
                onSuccess: () => {
                    setIsProdiModalOpen(false);
                    prodiForm.reset();
                },
            });
        }
    };

    // Submit Faculty
    const handleFacultySubmit = (e) => {
        e.preventDefault();
        if (editingFaculty) {
            facultyForm.put(`/admin/faculties/${editingFaculty.id}`, {
                onSuccess: () => {
                    setIsFacultyModalOpen(false);
                    facultyForm.reset();
                },
            });
        } else {
            facultyForm.post('/admin/faculties', {
                onSuccess: () => {
                    setIsFacultyModalOpen(false);
                    facultyForm.reset();
                },
            });
        }
    };

    // Delete Handlers
    const handleDeleteProdi = (prodi) => {
        if (confirm(`Apakah Anda yakin ingin menghapus Program Studi ${prodi.name} (${prodi.code})?`)) {
            router.delete(`/admin/study-programs/${prodi.id}`);
        }
    };

    const handleDeleteFaculty = (faculty) => {
        if (confirm(`Apakah Anda yakin ingin menghapus Fakultas ${faculty.name}?`)) {
            router.delete(`/admin/faculties/${faculty.id}`);
        }
    };

    // Filter Prodi: Hanya ambil data jika fakultas sudah dipilih!
    const facultyProdis = useMemo(() => {
        if (!selectedFacultyId) return [];
        return studyPrograms.filter(p => String(p.faculty_id) === String(selectedFacultyId));
    }, [studyPrograms, selectedFacultyId]);

    const filteredProdi = useMemo(() => {
        if (!selectedFacultyId) return [];
        return facultyProdis.filter(p => {
            const query = searchTerm.toLowerCase().trim();
            const matchesSearch = !query || 
                p.name?.toLowerCase().includes(query) || 
                p.code?.toLowerCase().includes(query) ||
                (p.national_code && p.national_code.includes(query)) ||
                (p.head_of_program_name && p.head_of_program_name.toLowerCase().includes(query));
            const matchesDegree = !selectedDegreeFilter || p.degree === selectedDegreeFilter;
            return matchesSearch && matchesDegree;
        });
    }, [facultyProdis, selectedFacultyId, searchTerm, selectedDegreeFilter]);

    const totalFilteredProdi = filteredProdi.length;
    const totalProdiPages = Math.max(1, Math.ceil(totalFilteredProdi / prodiPerPage));
    const safeProdiPage = Math.min(Math.max(1, prodiCurrentPage), totalProdiPages);

    const paginatedProdi = useMemo(() => {
        const start = (safeProdiPage - 1) * prodiPerPage;
        return filteredProdi.slice(start, start + prodiPerPage);
    }, [filteredProdi, safeProdiPage, prodiPerPage]);

    const prodiFromIndex = totalFilteredProdi === 0 ? 0 : (safeProdiPage - 1) * prodiPerPage + 1;
    const prodiToIndex = Math.min(safeProdiPage * prodiPerPage, totalFilteredProdi);

    // Stats calculations
    const totalProdi = studyPrograms.length;
    const totalFaculties = faculties.length;
    const totalStudents = studyPrograms.reduce((acc, p) => acc + (p.students_count || 0), 0);
    const unggulCount = studyPrograms.filter(p => p.accreditation === 'Unggul' || p.accreditation === 'A').length;

    return (
        <AppLayout title="Master Program Studi & Fakultas">
            <Head title="Program Studi & Fakultas — SIAKAD" />

            <div className="space-y-3.5">
                {/* 1. COMPACT HERO HEADER DENGAN INTEGRATED SUB-BAR PILIH FAKULTAS */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative border border-slate-700/50 z-30">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black mb-1">
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                <span>STRUKTUR KURIKULUM & JURUSAN</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                                Program Studi & Fakultas
                            </h2>
                            <p className="text-[11px] text-slate-300 mt-0.5 max-w-xl">
                                Kelola data jurusan, jenjang studi (D3/S1/S2), SK akreditasi BAN-PT/LAM, pimpinan Kaprodi, dan fakultas kampus.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                            <button
                                type="button"
                                onClick={() => openFacultyModal()}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold transition flex items-center space-x-1 shadow border border-slate-700 cursor-pointer"
                            >
                                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>+ Fakultas</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => openProdiModal()}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-black transition flex items-center space-x-1 shadow cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Program Studi</span>
                            </button>
                        </div>
                    </div>

                    {/* Integrated Sub-bar Pilih Fakultas Kampus */}
                    <div className="relative z-20 mt-3 pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-2.5">
                            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                                <Building2 className="w-4 h-4" />
                            </div>
                            <div className="flex items-center space-x-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-300">Fakultas Kampus:</span>
                                {activeFacultyObj ? (
                                    <div className="inline-flex items-center space-x-1.5">
                                        <span className="text-xs font-black text-white">{activeFacultyObj.name}</span>
                                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                                            {activeFacultyObj.code}
                                        </span>
                                        <span className="text-[11px] text-slate-300 font-medium">
                                            ({facultyProdis.length} Prodi • Dekan: {activeFacultyObj.dean_name || '-'})
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-400 italic">Belum dipilih</span>
                                )}
                            </div>
                        </div>

                        {/* Custom Dropdown Trigger */}
                        <div ref={facultyDropdownRef} className="relative w-full sm:w-72">
                            <button
                                type="button"
                                onClick={() => setIsFacultyDropdownOpen(prev => !prev)}
                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition shadow-2xs cursor-pointer text-left border ${
                                    isFacultyDropdownOpen 
                                        ? 'border-emerald-400 ring-2 ring-emerald-500/30 bg-slate-800 text-white' 
                                        : activeFacultyObj 
                                            ? 'border-emerald-500/50 bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-200 font-bold' 
                                            : 'border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 font-medium'
                                }`}
                            >
                                <div className="flex items-center space-x-2 truncate">
                                    <Building2 className={`w-3.5 h-3.5 shrink-0 ${activeFacultyObj ? 'text-emerald-400' : 'text-slate-400'}`} />
                                    <span className="truncate">
                                        {activeFacultyObj ? activeFacultyObj.name : 'Pilih Fakultas Kampus...'}
                                    </span>
                                </div>

                                <div className="flex items-center space-x-1 shrink-0 ml-1.5">
                                    {selectedFacultyId && (
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFacultyId('');
                                                setIsFacultyDropdownOpen(false);
                                            }}
                                            className="p-0.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
                                            title="Reset Pilihan"
                                        >
                                            <X className="w-3 h-3" />
                                        </span>
                                    )}
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                        isFacultyDropdownOpen ? 'rotate-180 text-emerald-400' : ''
                                    }`} />
                                </div>
                            </button>

                            {/* Popover Dropdown Menu */}
                            {isFacultyDropdownOpen && (
                                <div className="absolute right-0 top-full mt-1.5 w-full sm:w-84 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn">
                                    {/* Header Popover */}
                                    <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>PILIH FAKULTAS KAMPUS ({faculties.length})</span>
                                        </span>
                                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                                            ESC
                                        </span>
                                    </div>

                                    {/* List Fakultas */}
                                    <div className="p-2 space-y-1.5 max-h-72 overflow-y-auto divide-y divide-slate-100/70">
                                        {faculties.map((f) => {
                                            const isSelected = String(f.id) === String(selectedFacultyId);
                                            const prodiCount = studyPrograms.filter(p => String(p.faculty_id) === String(f.id)).length;
                                            return (
                                                <div
                                                    key={f.id}
                                                    onClick={() => {
                                                        setSelectedFacultyId(String(f.id));
                                                        setProdiCurrentPage(1);
                                                        setIsFacultyDropdownOpen(false);
                                                    }}
                                                    className={`p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between group ${
                                                        isSelected
                                                            ? 'bg-emerald-50 border border-emerald-300 shadow-2xs'
                                                            : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-2.5 min-w-0">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${
                                                            isSelected 
                                                                ? 'bg-emerald-600 text-white shadow-xs' 
                                                                : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800'
                                                        }`}>
                                                            <Building2 className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center space-x-1.5">
                                                                <h4 className={`text-xs truncate ${
                                                                    isSelected ? 'text-emerald-950 font-black' : 'text-slate-900 font-bold group-hover:text-emerald-700'
                                                                }`}>
                                                                    {f.name}
                                                                </h4>
                                                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                                                    isSelected 
                                                                        ? 'bg-emerald-200/80 text-emerald-900' 
                                                                        : 'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                    {f.code}
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                                                                Dekan: {f.dean_name || '-'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                            isSelected
                                                                ? 'bg-emerald-600 text-white font-black'
                                                                : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-800'
                                                        }`}>
                                                            {prodiCount} Prodi
                                                        </span>
                                                        {isSelected && (
                                                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                                                <Check className="w-3 h-3" />
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
                    </div>
                </div>

                {/* 2. COMPACT STATS CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Program Studi</span>
                            <span className="p-1 bg-emerald-100 text-emerald-800 rounded-md"><GraduationCap className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-slate-900">{totalProdi} Prodi</p>
                            <p className="text-[10px] text-slate-500">Jenjang D3, S1 & S2</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-emerald-600 font-bold">
                            Aktif di SIAKAD
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Fakultas Kampus</span>
                            <span className="p-1 bg-blue-100 text-blue-800 rounded-md"><Building2 className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-slate-900">{totalFaculties} Fakultas</p>
                            <p className="text-[10px] text-slate-500">Struktur Naungan Resmi</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-blue-600 font-bold">
                            Terdaftar
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Akreditasi Unggul / A</span>
                            <span className="p-1 bg-purple-100 text-purple-800 rounded-md"><Award className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-slate-900">{unggulCount} Prodi</p>
                            <p className="text-[10px] text-slate-500">Standar Mutu BAN-PT</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-purple-600 font-bold">
                            Akreditasi Tertinggi
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Mahasiswa Terdaftar</span>
                            <span className="p-1 bg-amber-100 text-amber-800 rounded-md"><Users className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-slate-900">{totalStudents.toLocaleString('id-ID')} Orang</p>
                            <p className="text-[10px] text-slate-500">Di Seluruh Prodi</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-amber-600 font-bold">
                            Total Mahasiswa
                        </div>
                    </div>
                </div>

                {/* 3. TABS SWITCHER (Gaya Gedung & Ruang / Tahun & Periode Semester) */}
                <div className="flex border-b border-slate-200 space-x-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab('prodi')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                            activeTab === 'prodi'
                                ? 'border-emerald-600 text-emerald-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <GraduationCap className="w-4 h-4" />
                        <span>Daftar Program Studi</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'prodi' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {selectedFacultyId ? `${facultyProdis.length} Prodi` : 'Pilih Fakultas'}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('faculty')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                            activeTab === 'faculty'
                                ? 'border-emerald-600 text-emerald-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Building2 className="w-4 h-4" />
                        <span>Daftar Fakultas Kampus</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'faculty' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {totalFaculties}
                        </span>
                    </button>
                </div>

                {/* TAB 1: DAFTAR PROGRAM STUDI */}
                {activeTab === 'prodi' && (
                    <>
                        {!selectedFacultyId ? (
                            /* PLACEHOLDER KETIKA BELUM MEMILIH FAKULTAS */
                            <div className="bg-white p-10 sm:p-14 rounded-2xl border border-slate-200 text-center space-y-3 shadow-2xs animate-fadeIn">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
                                    <Building2 className="w-7 h-7" />
                                </div>
                                <h3 className="text-base font-black text-slate-900">Pilih Fakultas Terlebih Dahulu</h3>
                                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                                    Silakan pilih salah satu fakultas kampus pada menu pilihan di atas untuk menampilkan daftar program studi yang bernaung di fakultas tersebut.
                                </p>
                                <div className="pt-2 flex items-center justify-center space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('faculty')}
                                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                                    >
                                        <Building2 className="w-3.5 h-3.5" />
                                        <span>Lihat Daftar Fakultas Kampus ({faculties.length})</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* TABEL PROGRAM STUDI FAKULTAS TERPILIH */
                            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden animate-fadeIn">
                                {/* Filter & Per-Page Controls */}
                                <div className="p-3 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-slate-600 text-[11px] font-bold">Tampilkan:</span>
                                        <select
                                            value={prodiPerPage}
                                            onChange={(e) => {
                                                setProdiPerPage(Number(e.target.value));
                                                setProdiCurrentPage(1);
                                            }}
                                            className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 shadow-2xs focus:outline-emerald-500 cursor-pointer"
                                        >
                                            <option value={5}>5 baris</option>
                                            <option value={10}>10 baris</option>
                                            <option value={25}>25 baris</option>
                                            <option value={50}>50 baris</option>
                                        </select>
                                        <span className="text-slate-500 text-[11px]">per halaman</span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        {/* Filter Jenjang */}
                                        <select
                                            value={selectedDegreeFilter}
                                            onChange={(e) => {
                                                setSelectedDegreeFilter(e.target.value);
                                                setProdiCurrentPage(1);
                                            }}
                                            className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 shadow-2xs focus:outline-emerald-500 cursor-pointer font-medium"
                                        >
                                            <option value="">Semua Jenjang</option>
                                            <option value="S1">S1 (Sarjana)</option>
                                            <option value="S2">S2 (Magister)</option>
                                            <option value="S3">S3 (Doktor)</option>
                                            <option value="D3">D3 (Diploma Tiga)</option>
                                            <option value="D4">D4 (Sarjana Terapan)</option>
                                            <option value="Profesi">Profesi</option>
                                        </select>

                                        {/* Input Pencarian */}
                                        <div className="relative">
                                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    setProdiCurrentPage(1);
                                                }}
                                                placeholder="Cari kode / nama prodi..."
                                                className="pl-8 pr-7 py-1 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-emerald-500 w-44 sm:w-52 shadow-2xs"
                                            />
                                            {searchTerm && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSearchTerm('');
                                                        setProdiCurrentPage(1);
                                                    }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-[11px]">
                                        <thead>
                                            <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                                                <th className="py-2.5 px-3">Kode</th>
                                                <th className="py-2.5 px-3">Nama Program Studi</th>
                                                <th className="py-2.5 px-3 text-center">Jenjang</th>
                                                <th className="py-2.5 px-3">Akreditasi</th>
                                                <th className="py-2.5 px-3">Ketua Prodi (Kaprodi)</th>
                                                <th className="py-2.5 px-3 text-center">Kurikulum</th>
                                                <th className="py-2.5 px-3 text-center">Status</th>
                                                <th className="py-2.5 px-3 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium">
                                            {paginatedProdi.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="py-8 text-center text-slate-500">
                                                        <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                        <p className="font-bold text-xs">Tidak ada program studi yang cocok di fakultas ini.</p>
                                                        <p className="text-[11px] text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau filter jenjang.</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedProdi.map((prodi) => (
                                                    <tr key={prodi.id} className="hover:bg-slate-50/80 transition">
                                                        <td className="py-2.5 px-3">
                                                            <span className="font-mono font-bold text-slate-800 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">
                                                                {prodi.code}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            <p className="font-bold text-slate-900">{prodi.name}</p>
                                                            {prodi.sk_number && (
                                                                <p className="text-[10px] text-slate-400">SK: {prodi.sk_number}</p>
                                                            )}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center">
                                                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-black text-slate-800 text-[10px]">
                                                                {prodi.degree}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                                                prodi.accreditation === 'Unggul' || prodi.accreditation === 'A'
                                                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                                    : prodi.accreditation === 'Baik Sekali' || prodi.accreditation === 'B'
                                                                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                                                                    : 'bg-amber-100 text-amber-800 border-amber-300'
                                                            }`}>
                                                                ★ {prodi.accreditation}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            {prodi.head_of_program_name ? (
                                                                <div>
                                                                    <p className="font-bold text-slate-900">{prodi.head_of_program_name}</p>
                                                                    <p className="text-[10px] text-slate-400 font-mono">NIDN: {prodi.head_of_program_nidn || '-'}</p>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-400 italic text-[10px]">- Belum Diplot -</span>
                                                            )}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center">
                                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold border border-slate-200">
                                                                {prodi.curricula_count || 0} Kurikulum
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                                prodi.is_active 
                                                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                                            }`}>
                                                                {prodi.is_active ? 'Aktif' : 'Nonaktif'}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center">
                                                            <div className="flex items-center justify-center space-x-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openProdiModal(prodi)}
                                                                    className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition cursor-pointer"
                                                                    title="Edit Program Studi"
                                                                >
                                                                    <Edit2 className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteProdi(prodi)}
                                                                    className="p-1 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition cursor-pointer"
                                                                    title="Hapus Program Studi"
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
                                        Menampilkan <strong className="text-slate-800 font-bold">{prodiFromIndex}</strong> - <strong className="text-slate-800 font-bold">{prodiToIndex}</strong> dari <strong className="text-slate-800 font-bold">{totalFilteredProdi}</strong> program studi di <strong className="text-slate-800">{activeFacultyObj?.name}</strong>
                                        {totalFilteredProdi !== facultyProdis.length && (
                                            <span className="text-slate-400 text-[10px] ml-1">(difilter dari total {facultyProdis.length})</span>
                                        )}
                                    </div>

                                    {totalProdiPages > 1 && (
                                        <div className="flex items-center space-x-1">
                                            <button
                                                type="button"
                                                disabled={safeProdiPage === 1}
                                                onClick={() => setProdiCurrentPage((p) => Math.max(1, p - 1))}
                                                className={`px-2 py-1 rounded-lg border text-xs font-bold transition flex items-center space-x-1 ${
                                                    safeProdiPage === 1
                                                        ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-white'
                                                        : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100 cursor-pointer shadow-2xs'
                                                }`}
                                                title="Halaman Sebelumnya"
                                            >
                                                <ChevronLeft className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline text-[11px]">Sebelumnya</span>
                                            </button>

                                            <div className="flex items-center space-x-1">
                                                {Array.from({ length: totalProdiPages }, (_, i) => i + 1).map((pageNum) => {
                                                    if (
                                                        pageNum === 1 ||
                                                        pageNum === totalProdiPages ||
                                                        (pageNum >= safeProdiPage - 1 && pageNum <= safeProdiPage + 1)
                                                    ) {
                                                        const isActive = pageNum === safeProdiPage;
                                                        return (
                                                            <button
                                                                key={pageNum}
                                                                type="button"
                                                                onClick={() => setProdiCurrentPage(pageNum)}
                                                                className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                                                                    isActive
                                                                        ? 'bg-emerald-600 text-white shadow-xs'
                                                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                                                }`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        );
                                                    } else if (
                                                        (pageNum === 2 && safeProdiPage > 3) ||
                                                        (pageNum === totalProdiPages - 1 && safeProdiPage < totalProdiPages - 2)
                                                    ) {
                                                        return <span key={pageNum} className="text-slate-400 px-1">...</span>;
                                                    }
                                                    return null;
                                                })}
                                            </div>

                                            <button
                                                type="button"
                                                disabled={safeProdiPage === totalProdiPages}
                                                onClick={() => setProdiCurrentPage((p) => Math.min(totalProdiPages, p + 1))}
                                                className={`px-2 py-1 rounded-lg border text-xs font-bold transition flex items-center space-x-1 ${
                                                    safeProdiPage === totalProdiPages
                                                        ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-white'
                                                        : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100 cursor-pointer shadow-2xs'
                                                }`}
                                                title="Halaman Berikutnya"
                                            >
                                                <span className="hidden sm:inline text-[11px]">Berikutnya</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* TAB 2: DAFTAR FAKULTAS */}
                {activeTab === 'faculty' && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden animate-fadeIn">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-[11px]">
                                <thead>
                                    <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="py-2.5 px-3">Kode</th>
                                        <th className="py-2.5 px-3">Nama Fakultas</th>
                                        <th className="py-2.5 px-3">Nama Dekan</th>
                                        <th className="py-2.5 px-3 text-center">Jumlah Prodi</th>
                                        <th className="py-2.5 px-3 text-center">Status</th>
                                        <th className="py-2.5 px-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {faculties.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-slate-500">
                                                <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                <p className="font-bold text-xs">Belum ada data fakultas.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        faculties.map((f) => (
                                            <tr key={f.id} className="hover:bg-slate-50/80 transition">
                                                <td className="py-2.5 px-3">
                                                    <span className="font-mono font-bold text-slate-800 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">
                                                        {f.code}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 font-bold text-slate-900">
                                                    {f.name}
                                                </td>
                                                <td className="py-2.5 px-3 text-slate-700">
                                                    {f.dean_name || '-'}
                                                </td>
                                                <td className="py-2.5 px-3 text-center font-bold text-emerald-800">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedFacultyId(String(f.id));
                                                            setActiveTab('prodi');
                                                            setProdiCurrentPage(1);
                                                        }}
                                                        className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                                                        title="Klik untuk melihat Program Studi di Fakultas ini"
                                                    >
                                                        {f.prodi_count} Program Studi →
                                                    </button>
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                        f.is_active 
                                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                                    }`}>
                                                        {f.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openFacultyModal(f)}
                                                            className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition cursor-pointer"
                                                            title="Edit Fakultas"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteFaculty(f)}
                                                            className="p-1 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition cursor-pointer"
                                                            title="Hapus Fakultas"
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
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* MODAL FORM: TAMBAH / EDIT PROGRAM STUDI */}
            {/* ========================================================================= */}
            {isProdiModalOpen && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsProdiModalOpen(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-2xs animate-fadeIn"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
                        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center space-x-2">
                                <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">
                                    <GraduationCap className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xs text-white">
                                        {editingProdi ? 'Edit Data Program Studi' : 'Tambah Program Studi Baru'}
                                    </h3>
                                    <p className="text-[10px] text-slate-300">
                                        {editingProdi ? `Memperbarui rincian prodi ${editingProdi.name}` : 'Lengkapi informasi prodi, fakultas, dan akreditasi'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                                    ESC
                                </span>
                                <button 
                                    type="button" 
                                    onClick={() => setIsProdiModalOpen(false)} 
                                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleProdiSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs flex-1">
                            {/* Fakultas & Jenjang */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div className="sm:col-span-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block font-bold text-slate-700 text-[11px]">
                                            Fakultas Naungan <span className="text-rose-500">*</span>
                                        </label>
                                        {selectedFacultyId && !editingProdi && (
                                            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center space-x-1">
                                                <Lock className="w-2.5 h-2.5 text-emerald-600" />
                                                <span>Terkunci</span>
                                            </span>
                                        )}
                                    </div>
                                    {selectedFacultyId && !editingProdi ? (
                                        <div className="w-full p-2 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-800 text-xs flex items-center justify-between shadow-2xs">
                                            <div className="flex items-center space-x-2 truncate">
                                                <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                                <span className="truncate">
                                                    {activeFacultyObj?.name || 'Fakultas Terpilih'} ({activeFacultyObj?.code})
                                                </span>
                                            </div>
                                            <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                                        </div>
                                    ) : (
                                        <select
                                            value={prodiForm.data.faculty_id}
                                            onChange={(e) => prodiForm.setData('faculty_id', e.target.value)}
                                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-emerald-500"
                                            required
                                        >
                                            <option value="">Pilih Fakultas...</option>
                                            {faculties.map(f => (
                                                <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                        Jenjang <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={prodiForm.data.degree}
                                        onChange={(e) => prodiForm.setData('degree', e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-emerald-500"
                                        required
                                    >
                                        <option value="S1">S1 — Sarjana</option>
                                        <option value="S2">S2 — Magister</option>
                                        <option value="S3">S3 — Doktor</option>
                                        <option value="D3">D3 — Diploma Tiga</option>
                                        <option value="D4">D4 — Sarjana Terapan</option>
                                        <option value="Profesi">Profesi</option>
                                    </select>
                                </div>
                            </div>

                            {/* Kode Prodi & Akreditasi */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                        Kode Singkat Prodi <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: PAI / MPI / HES"
                                        value={prodiForm.data.code}
                                        onChange={(e) => prodiForm.setData('code', e.target.value.toUpperCase())}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold uppercase focus:outline-emerald-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                        Peringkat Akreditasi <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={prodiForm.data.accreditation}
                                        onChange={(e) => prodiForm.setData('accreditation', e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-emerald-500"
                                        required
                                    >
                                        <option value="Unggul">Unggul (BAN-PT / LAM)</option>
                                        <option value="Baik Sekali">Baik Sekali</option>
                                        <option value="Baik">Baik</option>
                                        <option value="A">A (Instrumen Lama)</option>
                                        <option value="B">B (Instrumen Lama)</option>
                                        <option value="C">C (Instrumen Lama)</option>
                                        <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                    Nama Lengkap Program Studi <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Pendidikan Agama Islam"
                                    value={prodiForm.data.name}
                                    onChange={(e) => prodiForm.setData('name', e.target.value)}
                                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold focus:outline-emerald-500"
                                    required
                                />
                            </div>

                            {/* SK Number */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                    Nomor SK Izin Operasional / Akreditasi
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: SK-BAN-PT-PAI-2024 / Keputusan Dirjen Pendis"
                                    value={prodiForm.data.sk_number}
                                    onChange={(e) => prodiForm.setData('sk_number', e.target.value)}
                                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-500 text-xs"
                                />
                            </div>

                            {/* Kaprodi & Sekretaris */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">Ketua Program Studi (Kaprodi)</label>
                                    <select
                                        value={prodiForm.data.head_of_program_id}
                                        onChange={(e) => prodiForm.setData('head_of_program_id', e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium focus:outline-emerald-500"
                                    >
                                        <option value="">-- Pilih Dosen Kaprodi --</option>
                                        {lecturers.map(l => (
                                            <option key={l.id} value={l.id}>{l.name} ({l.identity_number || l.role})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">Sekretaris Program Studi</label>
                                    <select
                                        value={prodiForm.data.secretary_id}
                                        onChange={(e) => prodiForm.setData('secretary_id', e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium focus:outline-emerald-500"
                                    >
                                        <option value="">-- Pilih Dosen Sekretaris --</option>
                                        {lecturers.map(l => (
                                            <option key={l.id} value={l.id}>{l.name} ({l.identity_number || l.role})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Status Aktif */}
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-900 text-xs">Status Operasional Prodi</p>
                                    <p className="text-[10px] text-slate-500">Prodi aktif dapat dipilih mahasiswa untuk KRS dan PMB.</p>
                                </div>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={prodiForm.data.is_active}
                                        onChange={(e) => prodiForm.setData('is_active', e.target.checked)}
                                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <span className="font-bold text-xs">{prodiForm.data.is_active ? 'Aktif' : 'Nonaktif'}</span>
                                </label>
                            </div>

                            <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsProdiModalOpen(false)}
                                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={prodiForm.processing}
                                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-xs flex items-center space-x-1.5 cursor-pointer"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{prodiForm.processing ? 'Menyimpan...' : 'Simpan Program Studi'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL FORM: TAMBAH / EDIT FAKULTAS */}
            {/* ========================================================================= */}
            {isFacultyModalOpen && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsFacultyModalOpen(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-2xs animate-fadeIn"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
                        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-xs text-white">
                                    {editingFaculty ? 'Edit Data Fakultas' : 'Tambah Fakultas Baru'}
                                </h3>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                                    ESC
                                </span>
                                <button 
                                    type="button" 
                                    onClick={() => setIsFacultyModalOpen(false)} 
                                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleFacultySubmit} className="p-5 space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                    Kode Fakultas <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: TARBIYAH / SYARIAH"
                                    value={facultyForm.data.code}
                                    onChange={(e) => facultyForm.setData('code', e.target.value.toUpperCase())}
                                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold uppercase focus:outline-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                                    Nama Fakultas <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Fakultas Tarbiyah dan Keguruan"
                                    value={facultyForm.data.name}
                                    onChange={(e) => facultyForm.setData('name', e.target.value)}
                                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold focus:outline-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1 text-[11px]">Nama Dekan Fakultas</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Prof. Dr. KH. Abdul Halim, M.A."
                                    value={facultyForm.data.dean_name}
                                    onChange={(e) => facultyForm.setData('dean_name', e.target.value)}
                                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-500"
                                />
                            </div>

                            <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsFacultyModalOpen(false)}
                                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={facultyForm.processing}
                                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-xs flex items-center space-x-1.5 cursor-pointer"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{facultyForm.processing ? 'Menyimpan...' : 'Simpan Fakultas'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
