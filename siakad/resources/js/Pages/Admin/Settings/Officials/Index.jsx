import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import { 
    Users, ShieldCheck, Plus, Trash2, Edit3, CheckCircle2, 
    Sparkles, FileText, Check, X, Building2, Stamp, 
    Search, UserCheck2, FileSignature, AlertCircle, ShieldAlert,
    GraduationCap, ChevronDown
} from 'lucide-react';

export default function OfficialsIndex({
    officialsList = [],
    signatories = [],
    allUsers = [],
    structuralPositions = [],
    studyPrograms = []
}) {
    const [activeTab, setActiveTab] = useState('data-pejabat'); // 'data-pejabat' | 'pejabat-pengesah'
    const [searchTerm, setSearchTerm] = useState('');

    // Custom dropdown states for Official modal
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const userDropdownRef = useRef(null);

    const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
    const positionDropdownRef = useRef(null);

    const [isProdiDropdownOpen, setIsProdiDropdownOpen] = useState(false);
    const prodiDropdownRef = useRef(null);

    // Custom dropdown state for Signatory modal
    const [isSignatoryUserDropdownOpen, setIsSignatoryUserDropdownOpen] = useState(false);
    const [signatoryUserSearch, setSignatoryUserSearch] = useState('');
    const signatoryUserDropdownRef = useRef(null);

    // Filtered users for dropdown search (Modal 1)
    const filteredUsersInDropdown = useMemo(() => {
        if (!userSearch) return allUsers;
        const q = userSearch.toLowerCase();
        return allUsers.filter(u => 
            u.name?.toLowerCase().includes(q) ||
            u.identity_number?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q)
        );
    }, [allUsers, userSearch]);

    // Filtered users for dropdown search (Modal 2 - Signatory)
    const filteredSignatoryUsersInDropdown = useMemo(() => {
        if (!signatoryUserSearch) return allUsers;
        const q = signatoryUserSearch.toLowerCase();
        return allUsers.filter(u => 
            u.name?.toLowerCase().includes(q) ||
            u.identity_number?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q)
        );
    }, [allUsers, signatoryUserSearch]);

    // Handle ESC & outside click
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
                if (isUserDropdownOpen) setIsUserDropdownOpen(false);
                if (isPositionDropdownOpen) setIsPositionDropdownOpen(false);
                if (isProdiDropdownOpen) setIsProdiDropdownOpen(false);
                if (isSignatoryUserDropdownOpen) setIsSignatoryUserDropdownOpen(false);
            }
        };
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
            if (positionDropdownRef.current && !positionDropdownRef.current.contains(event.target)) {
                setIsPositionDropdownOpen(false);
            }
            if (prodiDropdownRef.current && !prodiDropdownRef.current.contains(event.target)) {
                setIsProdiDropdownOpen(false);
            }
            if (signatoryUserDropdownRef.current && !signatoryUserDropdownRef.current.contains(event.target)) {
                setIsSignatoryUserDropdownOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserDropdownOpen, isPositionDropdownOpen, isProdiDropdownOpen, isSignatoryUserDropdownOpen]);

    // =========================================================================
    // 1. MODAL & STATE: DATA PEJABAT STRUKTURAL KAMPUS
    // =========================================================================
    const [showOfficialModal, setShowOfficialModal] = useState(false);
    const [editingOfficial, setEditingOfficial] = useState(null);
    const [officialForm, setOfficialForm] = useState({
        user_id: '',
        position_id: '',
        study_program_id: '',
        sk_number: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        is_active: true
    });
    const [isSavingOfficial, setIsSavingOfficial] = useState(false);

    const handleOpenCreateOfficial = () => {
        setEditingOfficial(null);
        setOfficialForm({
            user_id: allUsers[0]?.id ? String(allUsers[0].id) : '',
            position_id: structuralPositions[0]?.id ? String(structuralPositions[0].id) : '',
            study_program_id: '',
            sk_number: `SK.${String(officialsList.length + 1).padStart(3, '0')}/STAI-ITTH/KP/2026`,
            start_date: new Date().toISOString().split('T')[0],
            end_date: '',
            is_active: true
        });
        setShowOfficialModal(true);
    };

    const handleOpenEditOfficial = (off) => {
        setEditingOfficial(off);
        setOfficialForm({
            user_id: String(off.user_id),
            position_id: String(off.position_id),
            study_program_id: off.study_program_id ? String(off.study_program_id) : '',
            sk_number: off.sk_number || '',
            start_date: off.start_date || new Date().toISOString().split('T')[0],
            end_date: off.end_date || '',
            is_active: Boolean(off.is_active)
        });
        setShowOfficialModal(true);
    };

    const handleSaveOfficial = (e) => {
        e.preventDefault();
        setIsSavingOfficial(true);

        if (editingOfficial) {
            router.post(`/admin/officials/${editingOfficial.id}`, officialForm, {
                preserveScroll: true,
                onSuccess: () => setShowOfficialModal(false),
                onFinish: () => setIsSavingOfficial(false)
            });
        } else {
            router.post('/admin/officials', officialForm, {
                preserveScroll: true,
                onSuccess: () => setShowOfficialModal(false),
                onFinish: () => setIsSavingOfficial(false)
            });
        }
    };

    // Delete Confirmation Modal State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        id: null,
        type: null, // 'official' | 'signatory'
        name: '',
        isLoading: false
    });

    const handleDeleteOfficial = (id, name) => {
        setDeleteModal({
            isOpen: true,
            id,
            type: 'official',
            name,
            isLoading: false
        });
    };

    const handleDeleteSignatory = (id, name) => {
        setDeleteModal({
            isOpen: true,
            id,
            type: 'signatory',
            name,
            isLoading: false
        });
    };

    const handleConfirmDelete = () => {
        if (!deleteModal.id) return;
        setDeleteModal(prev => ({ ...prev, isLoading: true }));

        const endpoint = deleteModal.type === 'official'
            ? `/admin/officials/${deleteModal.id}`
            : `/admin/officials/signatories/${deleteModal.id}`;

        router.delete(endpoint, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ isOpen: false, id: null, type: null, name: '', isLoading: false });
            },
            onError: () => {
                setDeleteModal(prev => ({ ...prev, isLoading: false }));
            }
        });
    };

    // =========================================================================
    // 2. MODAL & STATE: PEJABAT PENGESAH DOKUMEN RESMI
    // =========================================================================
    const [showSignatoryModal, setShowSignatoryModal] = useState(false);
    const [editingSignatory, setEditingSignatory] = useState(null);
    const [signatoryData, setSignatoryData] = useState({
        document_type: 'SURAT_KETERANGAN',
        document_title: '',
        position_code: 'WAKET_1',
        position_title: '',
        signatory_name: '',
        signatory_nip_nidn: '',
        user_id: '',
        include_qr_seal: true,
        is_active: true
    });
    const [isSavingSignatory, setIsSavingSignatory] = useState(false);

    const handleOpenCreateSignatory = () => {
        setEditingSignatory(null);
        setSignatoryData({
            document_type: 'SURAT_KETERANGAN',
            document_title: 'Surat Keterangan Aktif Kuliah',
            position_code: 'WAKET_1',
            position_title: 'Wakil Ketua I Bidang Akademik & Kelembagaan',
            signatory_name: '',
            signatory_nip_nidn: '',
            user_id: '',
            include_qr_seal: true,
            is_active: true
        });
        setShowSignatoryModal(true);
    };

    const handleOpenEditSignatory = (sig) => {
        setEditingSignatory(sig);
        setSignatoryData({
            document_type: sig.document_type,
            document_title: sig.document_title,
            position_code: sig.position_code,
            position_title: sig.position_title,
            signatory_name: sig.signatory_name,
            signatory_nip_nidn: sig.signatory_nip_nidn || '',
            user_id: sig.user_id || '',
            include_qr_seal: Boolean(sig.include_qr_seal),
            is_active: Boolean(sig.is_active)
        });
        setShowSignatoryModal(true);
    };

    const handleSaveSignatory = (e) => {
        e.preventDefault();
        setIsSavingSignatory(true);

        if (editingSignatory) {
            router.post(`/admin/officials/signatories/${editingSignatory.id}`, signatoryData, {
                preserveScroll: true,
                onSuccess: () => setShowSignatoryModal(false),
                onFinish: () => setIsSavingSignatory(false)
            });
        } else {
            router.post('/admin/officials/signatories', signatoryData, {
                preserveScroll: true,
                onSuccess: () => setShowSignatoryModal(false),
                onFinish: () => setIsSavingSignatory(false)
            });
        }
    };

    // Filtered lists based on search
    const filteredOfficials = useMemo(() => {
        if (!searchTerm) return officialsList;
        const q = searchTerm.toLowerCase();
        return officialsList.filter(o => 
            o.official_name?.toLowerCase().includes(q) ||
            o.position_name?.toLowerCase().includes(q) ||
            o.sk_number?.toLowerCase().includes(q) ||
            o.prodi_name?.toLowerCase().includes(q)
        );
    }, [officialsList, searchTerm]);

    const filteredSignatories = useMemo(() => {
        if (!searchTerm) return signatories;
        const q = searchTerm.toLowerCase();
        return signatories.filter(s => 
            s.signatory_name?.toLowerCase().includes(q) ||
            s.document_title?.toLowerCase().includes(q) ||
            s.position_title?.toLowerCase().includes(q)
        );
    }, [signatories, searchTerm]);

    return (
        <AppLayout title="Pejabat & Penugasan Kampus">
            <Head title="Data Pejabat & Penugasan" />

            <div className="space-y-4">
                {/* 1. HERO HEADER */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative border border-slate-700/50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black mb-1">
                                <ShieldCheck className="w-3 h-3 text-indigo-400" />
                                <span>STRUKTUR & PEJABAT KAMPUS</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                                Pejabat & Penugasan Pengesah
                            </h2>
                            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                                Kelola penugasan pejabat struktural pimpinan institusi dan pembagian hak wewenang pengesahan dokumen digital resmi ber-QR Code.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                            {activeTab === 'data-pejabat' ? (
                                <button
                                    type="button"
                                    onClick={handleOpenCreateOfficial}
                                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition flex items-center space-x-1.5 shadow cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>+ Pejabat Struktural</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleOpenCreateSignatory}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center space-x-1.5 shadow cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>+ Pejabat Pengesah Dokumen</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. STATS SUMMARY CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pejabat Struktural</span>
                            <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg"><Building2 className="w-4 h-4" /></span>
                        </div>
                        <p className="text-lg font-black text-slate-900 mt-1">{officialsList.length} Orang</p>
                        <p className="text-[10px] text-indigo-600 font-bold mt-0.5">Aktif Menjabat</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pengesah Dokumen</span>
                            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg"><Stamp className="w-4 h-4" /></span>
                        </div>
                        <p className="text-lg font-black text-slate-900 mt-1">{signatories.length} Pos Dokumen</p>
                        <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Tervalidasi Digital</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Approval KRS</span>
                            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg"><CheckCircle2 className="w-4 h-4" /></span>
                        </div>
                        <p className="text-lg font-black text-slate-900 mt-1">
                            {officialsList.filter(o => o.can_approve_krs).length} Jabatan
                        </p>
                        <p className="text-[10px] text-blue-600 font-bold mt-0.5">Wewenang KRS</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tanda Tangan Transkrip</span>
                            <span className="p-1.5 bg-purple-50 text-purple-700 rounded-lg"><FileSignature className="w-4 h-4" /></span>
                        </div>
                        <p className="text-lg font-black text-slate-900 mt-1">
                            {officialsList.filter(o => o.can_sign_transcripts).length} Jabatan
                        </p>
                        <p className="text-[10px] text-purple-600 font-bold mt-0.5">Tanda Tangan Ijazah</p>
                    </div>
                </div>

                {/* 3. TABS SWITCHER (GAYA PROGRAM STUDI & FAKULTAS TANPA RELOAD HALAMAN) */}
                <div className="flex border-b border-slate-200 space-x-6">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('data-pejabat');
                            setSearchTerm('');
                        }}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                            activeTab === 'data-pejabat'
                                ? 'border-indigo-600 text-indigo-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Building2 className="w-4 h-4" />
                        <span>Data Pejabat Struktural</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'data-pejabat' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {officialsList.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('pejabat-pengesah');
                            setSearchTerm('');
                        }}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                            activeTab === 'pejabat-pengesah'
                                ? 'border-emerald-600 text-emerald-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Stamp className="w-4 h-4" />
                        <span>Pejabat Pengesah Dokumen</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'pejabat-pengesah' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {signatories.length}
                        </span>
                    </button>
                </div>

                {/* SEARCH BAR */}
                <div className="flex items-center justify-between gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={activeTab === 'data-pejabat' ? "Cari nama pejabat, SK, jabatan..." : "Cari nama pengesah, jenis dokumen..."}
                            className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
                        />
                    </div>
                </div>

                {/* =========================================================================
                    TAB 1: DATA PEJABAT STRUKTURAL
                   ========================================================================= */}
                {activeTab === 'data-pejabat' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50/60 to-white">
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    Daftar Pejabat Struktural & Pimpinan Kampus
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Penugasan personil pimpinan institusi, SK rektorat/yayasan, masa jabatan, dan hak wewenang sistem.
                                </p>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
                                        <tr>
                                            <th className="py-3.5 px-4 w-14 text-center">No.</th>
                                            <th className="py-3.5 px-4 w-20 text-center">Aksi</th>
                                            <th className="py-3.5 px-6">Nama Pejabat & NIP/NIDN</th>
                                            <th className="py-3.5 px-6">Jabatan Struktural</th>
                                            <th className="py-3.5 px-6">Unit / Program Studi</th>
                                            <th className="py-3.5 px-6">Nomor SK & Masa Jabatan</th>
                                            <th className="py-3.5 px-6 text-center">Wewenang Sistem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredOfficials.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                                                    Tidak ada data pejabat struktural yang sesuai.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredOfficials.map((off, idx) => (
                                                <tr key={off.id} className="hover:bg-slate-50/80 transition">
                                                    <td className="py-3.5 px-4 text-center font-bold text-slate-500">{idx + 1}</td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenEditOfficial(off)}
                                                                title="Edit Penugasan"
                                                                className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition cursor-pointer"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteOfficial(off.id, off.official_name)}
                                                                title="Hapus Penugasan"
                                                                className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white flex items-center justify-center transition cursor-pointer"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-6">
                                                        <div className="flex items-center space-x-2.5">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs shrink-0">
                                                                {off.official_name ? off.official_name.charAt(0) : 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900">{off.official_name}</p>
                                                                <p className="text-[10px] text-slate-500 font-mono">{off.official_nip_nidn || '-'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-6">
                                                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-indigo-50 text-indigo-800 border border-indigo-200">
                                                            {off.position_name}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-6 font-semibold text-slate-700">
                                                        {off.prodi_name ? `${off.prodi_code} - ${off.prodi_name}` : 'Institut (Semua Fakultas)'}
                                                    </td>
                                                    <td className="py-3.5 px-6">
                                                        <p className="font-mono text-slate-800 font-bold">{off.sk_number}</p>
                                                        <p className="text-[10px] text-slate-500">Mulai: {off.start_date} {off.end_date ? `s/d ${off.end_date}` : '(Aktif)'}</p>
                                                    </td>
                                                    <td className="py-3.5 px-6 text-center">
                                                        <div className="flex items-center justify-center space-x-1.5 flex-wrap gap-1">
                                                            {off.can_approve_krs && (
                                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[9px] font-black">
                                                                    KRS
                                                                </span>
                                                            )}
                                                            {off.can_sign_transcripts && (
                                                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[9px] font-black">
                                                                    Transkrip
                                                                </span>
                                                            )}
                                                            {off.can_manage_finance && (
                                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[9px] font-black">
                                                                    Keuangan
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* =========================================================================
                    TAB 2: PEJABAT PENGESAH DOKUMEN RESMI
                   ========================================================================= */}
                {activeTab === 'pejabat-pengesah' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50/60 to-white">
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    Pejabat Pengesah Dokumen Digital Resmi
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Konfigurasi nama penandatangan, gelar resmi, dan jabatan yang dicantumkan pada cetak KHS, Transkrip, Surat Keterangan, dan DPNA.
                                </p>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
                                        <tr>
                                            <th className="py-3.5 px-4 w-14 text-center">No.</th>
                                            <th className="py-3.5 px-4 w-20 text-center">Aksi</th>
                                            <th className="py-3.5 px-6">Jenis Dokumen Resmi</th>
                                            <th className="py-3.5 px-6">Nama Pejabat Penandatangan</th>
                                            <th className="py-3.5 px-6">Jabatan Pengesah</th>
                                            <th className="py-3.5 px-6">NIP / NIDN</th>
                                            <th className="py-3.5 px-6 text-center">Stempel QR</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredSignatories.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                                                    Tidak ada data pejabat pengesah dokumen yang sesuai.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredSignatories.map((sig, idx) => (
                                                <tr key={sig.id} className="hover:bg-slate-50/80 transition">
                                                    <td className="py-3.5 px-4 text-center font-bold text-slate-500">{idx + 1}</td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenEditSignatory(sig)}
                                                                title="Edit Pengesah"
                                                                className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition cursor-pointer"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteSignatory(sig.id, sig.document_title)}
                                                                title="Hapus Pengesah"
                                                                className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white flex items-center justify-center transition cursor-pointer"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-6">
                                                        <p className="font-bold text-slate-900">{sig.document_title}</p>
                                                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 text-slate-600">
                                                            {sig.document_type}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-6 font-bold text-slate-800">
                                                        {sig.signatory_name}
                                                    </td>
                                                    <td className="py-3.5 px-6 font-semibold text-slate-700">
                                                        {sig.position_title}
                                                    </td>
                                                    <td className="py-3.5 px-6 font-mono text-slate-600">
                                                        {sig.signatory_nip_nidn || '-'}
                                                    </td>
                                                    <td className="py-3.5 px-6 text-center">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            Aktif
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
                )}
            </div>

            {/* =========================================================================
                MODAL 1: TAMBAH / EDIT PEJABAT STRUKTURAL
               ========================================================================= */}
            {showOfficialModal && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowOfficialModal(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
                >
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-visible animate-in zoom-in-95 duration-150">
                        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-t-3xl flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-white">
                                        {editingOfficial ? 'Edit Penugasan Pejabat' : 'Tambah Pejabat Struktural'}
                                    </h3>
                                    <p className="text-[11px] text-slate-300">Penugasan personil dosen/staf ke posisi struktural</p>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setShowOfficialModal(false)} 
                                className="p-1.5 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveOfficial} className="p-5 space-y-3 text-xs rounded-b-3xl">
                            {/* 1. CUSTOM DROPDOWN: PILIH DOSEN / PERSONIL */}
                            <div className="relative z-30">
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Pilih Dosen / Personil Civitas:</label>
                                <div ref={userDropdownRef} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsUserDropdownOpen(prev => !prev)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition border cursor-pointer text-left ${
                                            isUserDropdownOpen
                                                ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white'
                                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300'
                                        }`}
                                    >
                                        {(() => {
                                            const currentUser = allUsers.find(u => String(u.id) === String(officialForm.user_id));
                                            if (!currentUser) return <span className="text-slate-400 font-medium text-[11px]">-- Pilih Civitas / Dosen --</span>;

                                            return (
                                                <div className="flex items-center space-x-2 min-w-0 truncate">
                                                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-2xs">
                                                        {currentUser.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 truncate text-[11px]">
                                                        <span className="font-black text-slate-900 mr-1.5">{currentUser.name}</span>
                                                        <span className="text-slate-500 font-medium text-[10px]">({currentUser.identity_number || currentUser.email})</span>
                                                        <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800">
                                                            {currentUser.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${
                                            isUserDropdownOpen ? 'rotate-180 text-indigo-600' : ''
                                        }`} />
                                    </button>

                                    {isUserDropdownOpen && (
                                        <div className="absolute left-0 right-0 top-full mt-1 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn p-1.5 space-y-1">
                                            {/* Search in user list */}
                                            <div className="relative mb-1">
                                                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={userSearch}
                                                    onChange={(e) => setUserSearch(e.target.value)}
                                                    placeholder="Cari nama dosen, NIDN, atau email..."
                                                    className="w-full text-[11px] pl-7 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                    autoFocus
                                                />
                                            </div>

                                            <div className="max-h-48 overflow-y-auto space-y-0.5 divide-y divide-slate-100">
                                                {filteredUsersInDropdown.length === 0 ? (
                                                    <div className="py-3 text-center text-[11px] text-slate-400">
                                                        Tidak ditemukan data personil yang sesuai.
                                                    </div>
                                                ) : (
                                                    filteredUsersInDropdown.map((u) => {
                                                        const isSelected = String(u.id) === String(officialForm.user_id);
                                                        return (
                                                            <div
                                                                key={u.id}
                                                                onClick={() => {
                                                                    setOfficialForm({ ...officialForm, user_id: String(u.id) });
                                                                    setIsUserDropdownOpen(false);
                                                                }}
                                                                className={`p-1.5 rounded-lg transition cursor-pointer flex items-center justify-between group ${
                                                                    isSelected
                                                                        ? 'bg-indigo-50 border border-indigo-200 font-bold text-indigo-950'
                                                                        : 'hover:bg-slate-50 text-slate-700 font-medium'
                                                                }`}
                                                            >
                                                                <div className="flex items-center space-x-2 min-w-0">
                                                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                                                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                                                                    }`}>
                                                                        {u.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="flex items-center space-x-1.5">
                                                                            <span className="text-[11px] truncate">{u.name}</span>
                                                                            <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                                                                {u.role}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-[9.5px] text-slate-400 truncate">
                                                                            {u.identity_number ? `NIDN/NIP: ${u.identity_number}` : u.email}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {isSelected && (
                                                                    <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xs shrink-0 ml-1.5">
                                                                        <Check className="w-2.5 h-2.5" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 2. CUSTOM DROPDOWN: JABATAN STRUKTURAL */}
                            <div className="relative z-20">
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Jabatan Struktural:</label>
                                <div ref={positionDropdownRef} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsPositionDropdownOpen(prev => !prev)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition border cursor-pointer text-left ${
                                            isPositionDropdownOpen
                                                ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white'
                                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300'
                                        }`}
                                    >
                                        {(() => {
                                            const currentPos = structuralPositions.find(sp => String(sp.id) === String(officialForm.position_id));
                                            if (!currentPos) return <span className="text-slate-400 font-medium text-[11px]">-- Pilih Posisi Jabatan --</span>;

                                            return (
                                                <div className="flex items-center space-x-2 min-w-0 truncate text-[11px]">
                                                    <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                                                        <ShieldCheck className="w-3 h-3" />
                                                    </div>
                                                    <div className="min-w-0 truncate text-[11px]">
                                                        <span className="font-black text-slate-900 mr-1.5">{currentPos.name}</span>
                                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-100 text-indigo-800">
                                                            Level {currentPos.level}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${
                                            isPositionDropdownOpen ? 'rotate-180 text-indigo-600' : ''
                                        }`} />
                                    </button>

                                    {isPositionDropdownOpen && (
                                        <div className="absolute left-0 right-0 top-full mt-1 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn p-1 space-y-0.5 max-h-48 overflow-y-auto">
                                            {structuralPositions.map((sp) => {
                                                const isSelected = String(sp.id) === String(officialForm.position_id);
                                                return (
                                                    <div
                                                        key={sp.id}
                                                        onClick={() => {
                                                            setOfficialForm({ ...officialForm, position_id: String(sp.id) });
                                                            setIsPositionDropdownOpen(false);
                                                        }}
                                                        className={`p-2 rounded-lg transition cursor-pointer flex items-center justify-between group ${
                                                            isSelected
                                                                ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold'
                                                                : 'hover:bg-slate-50 text-slate-700 font-medium border border-transparent'
                                                        }`}
                                                    >
                                                        <div className="flex items-center space-x-2 min-w-0">
                                                            <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition ${
                                                                isSelected
                                                                    ? 'bg-indigo-600 text-white shadow-2xs'
                                                                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                                                            }`}>
                                                                <ShieldCheck className="w-3 h-3" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center space-x-1.5">
                                                                    <span className="text-[11px] font-bold text-slate-900">{sp.name}</span>
                                                                    <span className={`text-[8.5px] font-mono font-bold px-1 py-0.2 rounded ${
                                                                        isSelected ? 'bg-indigo-200 text-indigo-900' : 'bg-slate-100 text-slate-600'
                                                                    }`}>
                                                                        Level {sp.level}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[9.5px] text-slate-400 truncate">
                                                                    Posisi hierarki level {sp.level}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {isSelected && (
                                                            <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xs shrink-0 ml-1.5">
                                                                <Check className="w-2.5 h-2.5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3. CUSTOM DROPDOWN: UNIT PROGRAM STUDI */}
                            <div className="relative z-10">
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Unit Program Studi (Opsional):</label>
                                <div ref={prodiDropdownRef} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsProdiDropdownOpen(prev => !prev)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition border cursor-pointer text-left ${
                                            isProdiDropdownOpen
                                                ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white'
                                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300'
                                        }`}
                                    >
                                        {(() => {
                                            if (!officialForm.study_program_id) {
                                                return (
                                                    <div className="flex items-center space-x-1.5 text-slate-600 font-medium truncate text-[11px]">
                                                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span className="truncate">-- Berlaku untuk Seluruh Institut / Non-Prodi --</span>
                                                    </div>
                                                );
                                            }

                                            const currentProdi = studyPrograms.find(p => String(p.id) === String(officialForm.study_program_id));
                                            return (
                                                <div className="flex items-center space-x-2 min-w-0 truncate text-[11px]">
                                                    <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                                        <GraduationCap className="w-3 h-3" />
                                                    </div>
                                                    <div className="min-w-0 truncate">
                                                        <span className="font-black text-slate-900 mr-1.5">{currentProdi?.name}</span>
                                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-100 text-blue-800">
                                                            {currentProdi?.code}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${
                                            isProdiDropdownOpen ? 'rotate-180 text-indigo-600' : ''
                                        }`} />
                                    </button>

                                    {isProdiDropdownOpen && (
                                        <div className="absolute left-0 right-0 top-full mt-1 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn p-1 space-y-0.5 max-h-48 overflow-y-auto">
                                            {/* Default option: non-prodi */}
                                            <div
                                                onClick={() => {
                                                    setOfficialForm({ ...officialForm, study_program_id: '' });
                                                    setIsProdiDropdownOpen(false);
                                                }}
                                                className={`p-2 rounded-lg transition cursor-pointer flex items-center justify-between group ${
                                                    !officialForm.study_program_id
                                                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold'
                                                        : 'hover:bg-slate-50 text-slate-700 font-medium'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-2 min-w-0">
                                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                                                        !officialForm.study_program_id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        <Building2 className="w-3 h-3" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="text-[11px] font-bold text-slate-900">Seluruh Institut / Non-Prodi</span>
                                                        <p className="text-[9.5px] text-slate-400">Penugasan tingkat institusi / rektorat</p>
                                                    </div>
                                                </div>
                                                {!officialForm.study_program_id && (
                                                    <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xs shrink-0 ml-1.5">
                                                        <Check className="w-2.5 h-2.5" />
                                                    </div>
                                                )}
                                            </div>

                                            {studyPrograms.map((p) => {
                                                const isSelected = String(p.id) === String(officialForm.study_program_id);
                                                return (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => {
                                                            setOfficialForm({ ...officialForm, study_program_id: String(p.id) });
                                                            setIsProdiDropdownOpen(false);
                                                        }}
                                                        className={`p-2 rounded-lg transition cursor-pointer flex items-center justify-between group ${
                                                            isSelected
                                                                ? 'bg-blue-50 border border-blue-200 text-blue-950 font-bold'
                                                                : 'hover:bg-slate-50 text-slate-700 font-medium'
                                                        }`}
                                                    >
                                                        <div className="flex items-center space-x-2 min-w-0">
                                                            <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                                                                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                                                            }`}>
                                                                <GraduationCap className="w-3 h-3" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center space-x-1.5">
                                                                    <span className="text-[11px] font-bold text-slate-900">{p.name}</span>
                                                                    <span className={`text-[8.5px] font-mono font-bold px-1 py-0.2 rounded ${
                                                                        isSelected ? 'bg-blue-200 text-blue-900' : 'bg-slate-100 text-slate-600'
                                                                    }`}>
                                                                        {p.code}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[9.5px] text-slate-400 truncate">
                                                                    Unit Program Studi
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {isSelected && (
                                                            <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xs shrink-0 ml-1.5">
                                                                <Check className="w-2.5 h-2.5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Surat Keputusan (SK):</label>
                                <input
                                    type="text"
                                    value={officialForm.sk_number}
                                    onChange={(e) => setOfficialForm({ ...officialForm, sk_number: e.target.value })}
                                    placeholder="Contoh: SK.001/STAI-ITTH/KP/2026"
                                    className="w-full font-mono text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Mulai:</label>
                                    <input
                                        type="date"
                                        value={officialForm.start_date}
                                        onChange={(e) => setOfficialForm({ ...officialForm, start_date: e.target.value })}
                                        className="w-full text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Selesai (Opsional):</label>
                                    <input
                                        type="date"
                                        value={officialForm.end_date}
                                        onChange={(e) => setOfficialForm({ ...officialForm, end_date: e.target.value })}
                                        className="w-full text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowOfficialModal(false)}
                                    className="px-3.5 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingOfficial}
                                    className="px-4.5 py-2 text-[11px] font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
                                >
                                    {isSavingOfficial ? 'Menyimpan...' : 'Simpan Penugasan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================================================
                MODAL 2: TAMBAH / EDIT PEJABAT PENGESAH DOKUMEN
               ========================================================================= */}
            {showSignatoryModal && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowSignatoryModal(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
                >
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-visible animate-in zoom-in-95 duration-150">
                        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-t-3xl flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                                    <Stamp className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-white">
                                        {editingSignatory ? 'Edit Pejabat Pengesah' : 'Tambah Pengesah Dokumen'}
                                    </h3>
                                    <p className="text-[11px] text-slate-300">Konfigurasi nama penandatangan dokumen resmi</p>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setShowSignatoryModal(false)} 
                                className="p-1.5 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveSignatory} className="p-5 space-y-3 text-xs rounded-b-3xl">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Judul / Peruntukan Dokumen:</label>
                                <input
                                    type="text"
                                    value={signatoryData.document_title}
                                    onChange={(e) => setSignatoryData({ ...signatoryData, document_title: e.target.value })}
                                    placeholder="Contoh: Transkrip Akademik Digital & Ijazah"
                                    className="w-full text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Lengkap & Gelar Penandatangan:</label>
                                <input
                                    type="text"
                                    value={signatoryData.signatory_name}
                                    onChange={(e) => setSignatoryData({ ...signatoryData, signatory_name: e.target.value })}
                                    placeholder="Contoh: Dr. H. M. Ridwan, M.Ag"
                                    className="w-full font-bold text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Jabatan Resmi:</label>
                                    <input
                                        type="text"
                                        value={signatoryData.position_title}
                                        onChange={(e) => setSignatoryData({ ...signatoryData, position_title: e.target.value })}
                                        placeholder="Contoh: Wakil Ketua I"
                                        className="w-full text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">NIP / NIDN:</label>
                                    <input
                                        type="text"
                                        value={signatoryData.signatory_nip_nidn}
                                        onChange={(e) => setSignatoryData({ ...signatoryData, signatory_nip_nidn: e.target.value })}
                                        placeholder="NIDN: 2112087501"
                                        className="w-full font-mono text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* CUSTOM DROPDOWN: TAUTKAN KE AKUN CIVITAS */}
                            <div className="relative z-30">
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Tautkan ke Akun Civitas (Opsional):</label>
                                <div ref={signatoryUserDropdownRef} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsSignatoryUserDropdownOpen(prev => !prev)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition border cursor-pointer text-left ${
                                            isSignatoryUserDropdownOpen
                                                ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white'
                                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300'
                                        }`}
                                    >
                                        {(() => {
                                            if (!signatoryData.user_id) {
                                                return (
                                                    <div className="flex items-center space-x-1.5 text-slate-500 font-medium truncate text-[11px]">
                                                        <UserCheck2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span className="truncate">-- Tanpa Tautan Akun (Pengesahan Manual/Eksternal) --</span>
                                                    </div>
                                                );
                                            }

                                            const currentUser = allUsers.find(u => String(u.id) === String(signatoryData.user_id));
                                            return (
                                                <div className="flex items-center space-x-2 min-w-0 truncate text-[11px]">
                                                    <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                                        {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                    <div className="min-w-0 truncate">
                                                        <span className="font-black text-slate-900 mr-1.5">{currentUser?.name}</span>
                                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                                            {currentUser?.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${
                                            isSignatoryUserDropdownOpen ? 'rotate-180 text-emerald-600' : ''
                                        }`} />
                                    </button>

                                    {isSignatoryUserDropdownOpen && (
                                        <div className="absolute left-0 right-0 top-full mt-1 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn p-1.5 space-y-1">
                                            {/* Search in user list */}
                                            <div className="relative mb-1">
                                                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={signatoryUserSearch}
                                                    onChange={(e) => setSignatoryUserSearch(e.target.value)}
                                                    placeholder="Cari nama personil civitas..."
                                                    className="w-full text-[11px] pl-7 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                    autoFocus
                                                />
                                            </div>

                                            <div className="max-h-48 overflow-y-auto space-y-0.5 divide-y divide-slate-100">
                                                {/* Default option: No account link */}
                                                <div
                                                    onClick={() => {
                                                        setSignatoryData({ ...signatoryData, user_id: '' });
                                                        setIsSignatoryUserDropdownOpen(false);
                                                    }}
                                                    className={`p-1.5 rounded-lg transition cursor-pointer flex items-center justify-between group ${
                                                        !signatoryData.user_id
                                                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold'
                                                            : 'hover:bg-slate-50 text-slate-700 font-medium'
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-2 min-w-0">
                                                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                                                            !signatoryData.user_id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            <UserCheck2 className="w-3 h-3" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="text-[11px] font-bold text-slate-900">Tanpa Tautan Akun</span>
                                                            <p className="text-[9.5px] text-slate-400">Pengesahan manual / tanpa akun login</p>
                                                        </div>
                                                    </div>
                                                    {!signatoryData.user_id && (
                                                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs shrink-0 ml-1.5">
                                                            <Check className="w-2.5 h-2.5" />
                                                        </div>
                                                    )}
                                                </div>

                                                {filteredSignatoryUsersInDropdown.length === 0 ? (
                                                    <div className="py-3 text-center text-[11px] text-slate-400">
                                                        Tidak ditemukan personil yang sesuai.
                                                    </div>
                                                ) : (
                                                    filteredSignatoryUsersInDropdown.map((u) => {
                                                        const isSelected = String(u.id) === String(signatoryData.user_id);
                                                        return (
                                                            <div
                                                                key={u.id}
                                                                onClick={() => {
                                                                    setSignatoryData({ ...signatoryData, user_id: String(u.id) });
                                                                    setIsSignatoryUserDropdownOpen(false);
                                                                }}
                                                                className={`p-1.5 rounded-lg transition cursor-pointer flex items-center justify-between group ${
                                                                    isSelected
                                                                        ? 'bg-emerald-50 border border-emerald-200 font-bold text-emerald-950'
                                                                        : 'hover:bg-slate-50 text-slate-700 font-medium'
                                                                }`}
                                                            >
                                                                <div className="flex items-center space-x-2 min-w-0">
                                                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                                                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                                                                    }`}>
                                                                        {u.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="flex items-center space-x-1.5">
                                                                            <span className="text-[11px] truncate">{u.name}</span>
                                                                            <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                                                                {u.role}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-[9.5px] text-slate-400 truncate">
                                                                            {u.identity_number ? `NIDN/NIP: ${u.identity_number}` : u.email}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {isSelected && (
                                                                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs shrink-0 ml-1.5">
                                                                        <Check className="w-2.5 h-2.5" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowSignatoryModal(false)}
                                    className="px-3.5 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingSignatory}
                                    className="px-4.5 py-2 text-[11px] font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                                >
                                    {isSavingSignatory ? 'Menyimpan...' : 'Simpan Pengesah'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================================================
                MODAL 3: KONFIRMASI HAPUS DATA (CUSTOM RESPONSIVE MODAL)
               ========================================================================= */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, type: null, name: '', isLoading: false })}
                onConfirm={handleConfirmDelete}
                title={deleteModal.type === 'official' ? 'Hapus Penugasan Pejabat' : 'Hapus Pejabat Pengesah'}
                message={
                    deleteModal.type === 'official'
                        ? 'Apakah Anda yakin ingin menghapus penugasan pejabat struktural ini dari sistem?'
                        : 'Apakah Anda yakin ingin menghapus konfigurasi pejabat penandatangan dokumen ini?'
                }
                itemName={deleteModal.name}
                itemType={deleteModal.type === 'official' ? 'Pejabat Struktural' : 'Pengesah Dokumen'}
                confirmText="Ya, Hapus Data"
                cancelText="Batal"
                isLoading={deleteModal.isLoading}
                variant="danger"
            />
        </AppLayout>
    );
}
