import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Building2, DoorOpen, Plus, CheckCircle2, ShieldCheck, 
    Layers, Users, Tv, Check, Search, Filter, X, 
    Printer, FileSpreadsheet, Edit2, Trash2, MoreVertical,
    AlertCircle, RefreshCw, LayoutGrid, List, CheckSquare,
    Eye, Power, Sparkles, MapPin, Armchair, GraduationCap,
    ChevronDown, Lock
} from 'lucide-react';

export const ROOM_TYPE_GROUPS = [
    {
        category: 'Perkuliahan & Pembelajaran',
        types: [
            { value: '1', label: 'Kuliah' },
            { value: '7', label: 'Seminar' },
            { value: '38', label: 'Rapat' },
            { value: '39', label: 'Ujian Skripsi/Tesis/Disertasi' },
            { value: '40', label: 'Konseling' },
            { value: '41', label: 'Micro Teaching' },
        ],
    },
    {
        category: 'Laboratorium & Praktikum',
        types: [
            { value: '2', label: 'Laboratorium' },
            { value: '3', label: 'Studio' },
            { value: '20', label: 'Komputer' },
            { value: '24', label: 'Praktikum' },
            { value: '14', label: 'Bengkel/Workshop/Reparasi' },
        ],
    },
    {
        category: 'Perpustakaan & Literatur',
        types: [
            { value: '4', label: 'Perpustakaan' },
            { value: '25', label: 'Referensi/Buku/Literatur' },
        ],
    },
    {
        category: 'Pimpinan, Dosen & Kantor',
        types: [
            { value: '5', label: 'Dosen' },
            { value: '6', label: 'Administrasi/Kantor' },
            { value: '12', label: 'Senat' },
            { value: '16', label: 'Pengelola/Resepsionis' },
            { value: '23', label: 'Asisten' },
            { value: '26', label: 'Ketua/Kepala' },
            { value: '27', label: 'Wakil' },
            { value: '28', label: 'Sekretaris' },
            { value: '32', label: 'Ahli' },
        ],
    },
    {
        category: 'Kemahasiswaan & Fasilitas Umum',
        types: [
            { value: '9', label: 'Kantin' },
            { value: '10', label: 'Ibadah' },
            { value: '11', label: 'Parkir' },
            { value: '13', label: 'Hall/Lobby' },
            { value: '15', label: 'Dapur/Pantry' },
            { value: '17', label: 'Koridor/Selasar/Teras' },
            { value: '18', label: 'Tangga' },
            { value: '19', label: 'Tamu' },
            { value: '21', label: 'Panggung/Stage' },
            { value: '22', label: 'Toilet/Lavatory' },
            { value: '29', label: 'Security/Keamanan/Satpam/Penjaga' },
            { value: '30', label: 'Garasi' },
            { value: '31', label: 'Istirahat/Tidur/Ganti' },
            { value: '33', label: 'Lift' },
            { value: '34', label: 'Koperasi' },
            { value: '35', label: 'Klinik/Kesehatan' },
            { value: '37', label: 'Di Luar Ruang' },
            { value: '42', label: 'Unit Kegiatan Mahasiswa' },
        ],
    },
    {
        category: 'Lainnya',
        types: [
            { value: '36', label: 'Ruang tak terdefinisi' },
        ],
    },
];

export const ROOM_TYPES = [
    { value: '1', label: 'Kuliah' },
    { value: '2', label: 'Laboratorium' },
    { value: '3', label: 'Studio' },
    { value: '4', label: 'Perpustakaan' },
    { value: '5', label: 'Dosen' },
    { value: '6', label: 'Administrasi/Kantor' },
    { value: '7', label: 'Seminar' },
    { value: '8', label: 'Gudang/Alat' },
    { value: '9', label: 'Kantin' },
    { value: '10', label: 'Ibadah' },
    { value: '11', label: 'Parkir' },
    { value: '12', label: 'Senat' },
    { value: '13', label: 'Hall/Lobby' },
    { value: '14', label: 'Bengkel/Workshop/Reparasi' },
    { value: '15', label: 'Dapur/Pantry' },
    { value: '16', label: 'Pengelola/Resepsionis' },
    { value: '17', label: 'Koridor/Selasar/Teras' },
    { value: '18', label: 'Tangga' },
    { value: '19', label: 'Tamu' },
    { value: '20', label: 'Komputer' },
    { value: '21', label: 'Panggung/Stage' },
    { value: '22', label: 'Toilet/Lavatory' },
    { value: '23', label: 'Asisten' },
    { value: '24', label: 'Praktikum' },
    { value: '25', label: 'Referensi/Buku/Literatur' },
    { value: '26', label: 'Ketua/Kepala' },
    { value: '27', label: 'Wakil' },
    { value: '28', label: 'Sekretaris' },
    { value: '29', label: 'Security/Kemanan/Satpam/Penjaga' },
    { value: '30', label: 'Garasi' },
    { value: '31', label: 'Istirahat/Tidur/Ganti' },
    { value: '32', label: 'Ahli' },
    { value: '33', label: 'Lift' },
    { value: '34', label: 'Koperasi' },
    { value: '35', label: 'Klinik/Kesehatan' },
    { value: '36', label: 'Ruang tak terdefinisi' },
    { value: '37', label: 'Di Luar Ruang' },
    { value: '38', label: 'Rapat' },
    { value: '39', label: 'Ujian Skripsi/Tesis/Disertasi' },
    { value: '40', label: 'Konseling' },
    { value: '41', label: 'Micro Teaching' },
    { value: '42', label: 'Unit Kegiatan Mahasiswa' },
];

export const getRoomTypeName = (val) => {
    if (!val) return 'Kuliah';
    const match = ROOM_TYPES.find(t => String(t.value) === String(val) || t.label.toLowerCase() === String(val).toLowerCase());
    if (match) return match.label;
    if (val === 'TEORI') return 'Kuliah';
    if (val === 'LAB_KOMPUTER') return 'Laboratorium';
    if (val === 'MICROTEACHING') return 'Micro Teaching';
    if (val === 'AUDITORIUM') return 'Seminar';
    return val;
};

export const getRoomTypeBadgeClass = (val) => {
    const str = String(val);
    if (['1', 'Kuliah', 'TEORI'].includes(str)) return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    if (['2', '3', '20', '24', 'Laboratorium', 'Studio', 'Komputer', 'Praktikum'].includes(str)) return 'bg-blue-50 text-blue-800 border-blue-300';
    if (['5', '6', '12', '26', '27', '28', '38', 'Dosen', 'Administrasi/Kantor', 'Rapat'].includes(str)) return 'bg-purple-50 text-purple-800 border-purple-300';
    if (['7', '39', '41', 'Seminar', 'Ujian Skripsi/Tesis/Disertasi', 'Micro Teaching'].includes(str)) return 'bg-amber-50 text-amber-800 border-amber-300';
    if (['4', '25', 'Perpustakaan', 'Referensi/Buku/Literatur'].includes(str)) return 'bg-teal-50 text-teal-800 border-teal-300';
    return 'bg-slate-100 text-slate-700 border-slate-300';
};

export default function FacilitiesIndex({ 
    buildings = [], 
    selectedBuilding = null,
    rooms = [], 
    filters = {} 
}) {
    const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' | 'buildings'
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
    const [search, setSearch] = useState(filters.search || '');
    const [buildingId, setBuildingId] = useState(filters.building_id || '');
    const [roomType, setRoomType] = useState(filters.room_type || '');
    const [floor, setFloor] = useState(filters.floor || '');
    const [status, setStatus] = useState(filters.status || '');
    const [showFilters, setShowFilters] = useState(Boolean(filters.room_type || filters.floor || filters.status));
    const [isMobileFabOpen, setIsMobileFabOpen] = useState(false);
    const isFirstRender = useRef(true);

    // Modals
    const [showBuildingModal, setShowBuildingModal] = useState(false);
    const [isEditingBuilding, setIsEditingBuilding] = useState(false);
    const [selectedBuildingItem, setSelectedBuildingItem] = useState(null);
    const [showDeleteBuildingModal, setShowDeleteBuildingModal] = useState(false);

    const [showRoomModal, setShowRoomModal] = useState(false);
    const [isEditingRoom, setIsEditingRoom] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showDeleteRoomModal, setShowDeleteRoomModal] = useState(false);

    const activeBuildingObj = buildings.find(b => String(b.id) === String(buildingId)) || selectedBuilding;

    // Form Gedung
    const buildingForm = useForm({
        id: null,
        code: '',
        name: '',
        total_floors: 1,
        address: '',
        description: '',
        is_active: true,
    });

    // Form Ruang (Otomatis terkunci jika buildingId telah dipilih)
    const roomForm = useForm({
        id: null,
        building_id: buildingId ? String(buildingId) : (buildings && buildings.length > 0 ? String(buildings[0].id) : ''),
        code: '',
        name: '',
        floor_number: 1,
        capacity: 35,
        exam_capacity: 20,
        room_type: '1', // Default 1: Kuliah
        facilities: ['AC', 'Proyektor LCD', 'Whiteboard'],
        is_active: true,
    });

    // Auto Live Search Debounce
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get('/admin/facilities', {
                building_id: buildingId,
                search,
                room_type: roomType,
                floor,
                status,
            }, { preserveState: true, replace: true, preserveScroll: true });
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    // Close active modal or FAB on ESC key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
                if (showRoomModal) {
                    setShowRoomModal(false);
                } else if (showBuildingModal) {
                    setShowBuildingModal(false);
                } else if (showDeleteRoomModal) {
                    setShowDeleteRoomModal(false);
                } else if (showDeleteBuildingModal) {
                    setShowDeleteBuildingModal(false);
                } else if (isMobileFabOpen) {
                    setIsMobileFabOpen(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showRoomModal, showBuildingModal, showDeleteRoomModal, showDeleteBuildingModal, isMobileFabOpen]);

    const handleBuildingChange = (newBId) => {
        setBuildingId(newBId);
        router.get('/admin/facilities', {
            building_id: newBId,
            search,
            room_type: roomType,
            floor,
            status,
        }, { preserveState: true, replace: true, preserveScroll: true });
    };

    const handleFilterChange = (newType, newFloor, newStatus) => {
        router.get('/admin/facilities', {
            building_id: buildingId,
            search,
            room_type: newType,
            floor: newFloor,
            status: newStatus,
        }, { preserveState: true, replace: true, preserveScroll: true });
    };

    const handleResetFilter = () => {
        setSearch('');
        setRoomType('');
        setFloor('');
        setStatus('');
        router.get('/admin/facilities', {
            building_id: buildingId,
        }, { preserveState: true, replace: true });
    };

    const activeFilterCount = [roomType, floor, status].filter(Boolean).length;

    // Available facilities checklist
    const availableFacilities = [
        'AC', 'Proyektor LCD', 'Sound System', 'CCTV', 
        'Whiteboard', 'Smart TV / Display', 'PC Komputer / Lab', 
        'Podium Dosen', 'Stopkontak Tiap Meja', 'Akses Difabel'
    ];

    const toggleFacility = (fac) => {
        const current = Array.isArray(roomForm.data.facilities) ? roomForm.data.facilities : [];
        if (current.includes(fac)) {
            roomForm.setData('facilities', current.filter((f) => f !== fac));
        } else {
            roomForm.setData('facilities', [...current, fac]);
        }
    };

    // Actions: Gedung
    const handleOpenCreateBuilding = () => {
        setIsEditingBuilding(false);
        buildingForm.reset();
        buildingForm.setData({
            id: null,
            code: '',
            name: '',
            total_floors: 1,
            address: 'Kampus Terpadu STAI Al-Ittihad Cianjur',
            description: '',
            is_active: true,
        });
        setShowBuildingModal(true);
    };

    const handleOpenEditBuilding = (b) => {
        setIsEditingBuilding(true);
        setSelectedBuildingItem(b);
        buildingForm.setData({
            id: b.id,
            code: b.code,
            name: b.name,
            total_floors: b.total_floors,
            address: b.address || '',
            description: b.description || '',
            is_active: Boolean(b.is_active),
        });
        setShowBuildingModal(true);
    };

    const handleSubmitBuilding = (e) => {
        e.preventDefault();
        if (isEditingBuilding && buildingForm.data.id) {
            buildingForm.put(`/admin/facilities/buildings/${buildingForm.data.id}`, {
                onSuccess: () => {
                    setShowBuildingModal(false);
                    buildingForm.reset();
                },
            });
        } else {
            buildingForm.post('/admin/facilities/buildings', {
                onSuccess: () => {
                    setShowBuildingModal(false);
                    buildingForm.reset();
                },
            });
        }
    };

    const handleConfirmDeleteBuilding = () => {
        if (!selectedBuildingItem) return;
        router.delete(`/admin/facilities/buildings/${selectedBuildingItem.id}`, {
            onSuccess: () => {
                setShowDeleteBuildingModal(false);
                setSelectedBuildingItem(null);
            },
        });
    };

    // Actions: Ruang Kelas (Otomatis mengunci gedung jika buildingId aktif)
    const handleOpenCreateRoom = () => {
        setIsEditingRoom(false);
        roomForm.reset();
        roomForm.setData({
            id: null,
            building_id: buildingId ? String(buildingId) : (buildings && buildings.length > 0 ? String(buildings[0].id) : ''),
            code: '',
            name: '',
            floor_number: 1,
            capacity: 35,
            exam_capacity: 20,
            room_type: '1',
            facilities: ['AC', 'Proyektor LCD', 'Whiteboard'],
            is_active: true,
        });
        setShowRoomModal(true);
    };

    const handleOpenEditRoom = (r) => {
        setIsEditingRoom(true);
        setSelectedRoom(r);
        roomForm.setData({
            id: r.id,
            building_id: String(r.building_id),
            code: r.code,
            name: r.name,
            floor_number: r.floor_number,
            capacity: r.capacity,
            exam_capacity: r.exam_capacity || Math.floor(r.capacity * 0.6),
            room_type: String(r.room_type || '1'),
            facilities: Array.isArray(r.facilities) ? r.facilities : [],
            is_active: Boolean(r.is_active),
        });
        setShowRoomModal(true);
    };

    const handleSubmitRoom = (e) => {
        e.preventDefault();
        if (isEditingRoom && roomForm.data.id) {
            roomForm.put(`/admin/facilities/rooms/${roomForm.data.id}`, {
                onSuccess: () => {
                    setShowRoomModal(false);
                    roomForm.reset();
                },
            });
        } else {
            roomForm.post('/admin/facilities/rooms', {
                onSuccess: () => {
                    setShowRoomModal(false);
                    roomForm.reset();
                },
            });
        }
    };

    const handleToggleRoomStatus = (r) => {
        router.patch(`/admin/facilities/rooms/${r.id}/toggle-status`, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleConfirmDeleteRoom = () => {
        if (!selectedRoom) return;
        router.delete(`/admin/facilities/rooms/${selectedRoom.id}`, {
            onSuccess: () => {
                setShowDeleteRoomModal(false);
                setSelectedRoom(null);
            },
        });
    };

    return (
        <AppLayout title="Infrastruktur: Gedung & Ruang Kelas">
            <Head title="Gedung & Ruang Kelas — SIAKAD STAI Al-Ittihad" />

            <div className="space-y-4">
                {/* 1. Header Banner & Action Center */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black mb-1">
                            <Building2 className="w-3 h-3 text-emerald-600" />
                            <span>INFRASTRUKTUR & INVENTARIS KAMPUS</span>
                        </div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">
                            Master Gedung & Ruang Perkuliahan
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                            Kelola data master gedung, denah lantai, kapasitas perkuliahan & ujian, serta inventaris fasilitas ruang kelas.
                        </p>
                    </div>

                    {/* Desktop Icon Actions with Tooltips */}
                    <div className="hidden sm:flex items-center space-x-2">
                        {/* 1. Tombol Cetak PDF Resmi */}
                        <div className="relative group">
                            <Link
                                href={`/admin/facilities/print-pdf?building_id=${encodeURIComponent(buildingId)}&room_type=${encodeURIComponent(roomType)}&status=${encodeURIComponent(status)}`}
                                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center border border-slate-300 shadow-2xs transition cursor-pointer"
                                aria-label="Cetak PDF Resmi"
                            >
                                <Printer className="w-4 h-4 text-slate-700" />
                            </Link>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-30">
                                Cetak PDF Resmi
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                            </div>
                        </div>

                        {/* 2. Tombol Unduh Excel */}
                        <div className="relative group">
                            <a
                                href={`/admin/facilities/export-excel?building_id=${encodeURIComponent(buildingId)}&room_type=${encodeURIComponent(roomType)}&status=${encodeURIComponent(status)}`}
                                className="w-10 h-10 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center border border-emerald-200 shadow-2xs transition cursor-pointer"
                                aria-label="Unduh Excel (.xls)"
                            >
                                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                            </a>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-30">
                                Unduh Excel (.xls)
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                            </div>
                        </div>

                        {/* 3. Tombol Tambah Gedung */}
                        <div className="relative group">
                            <button
                                type="button"
                                onClick={handleOpenCreateBuilding}
                                className="w-10 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-xs transition cursor-pointer"
                                aria-label="Tambah Gedung Kampus"
                            >
                                <Building2 className="w-4 h-4 text-emerald-400" />
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-30">
                                Tambah Gedung Kampus
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                            </div>
                        </div>

                        {/* 4. Tombol Tambah Ruang Kelas */}
                        <div className="relative group">
                            <button
                                type="button"
                                onClick={handleOpenCreateRoom}
                                className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-xs transition cursor-pointer"
                                aria-label="Tambah Ruang Kelas"
                            >
                                <Plus className="w-5 h-5 text-white" />
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-30">
                                {buildingId ? `Tambah Ruang di ${activeBuildingObj?.name || 'Gedung'}` : 'Tambah Ruang Kelas'}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Selector Pilih Gedung Kampus */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Filter Gedung Kampus
                            </span>
                            <h3 className="text-sm font-black text-slate-900">
                                {activeBuildingObj ? `${activeBuildingObj.name} (${activeBuildingObj.code})` : 'Pilih Gedung untuk Menampilkan Ruangan'}
                            </h3>
                            {activeBuildingObj && (
                                <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
                                    {activeBuildingObj.total_floors} Lantai • {rooms.length} Ruang Terdaftar
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="relative w-full sm:w-80">
                        <select
                            value={buildingId}
                            onChange={(e) => handleBuildingChange(e.target.value)}
                            className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-xl pl-3.5 pr-9 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer transition shadow-2xs"
                        >
                            <option value="">-- Silakan Pilih Gedung --</option>
                            {buildings.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name} ({b.code}) — {b.total_rooms || 0} Ruang
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                {/* 3. Filter & Live Search Controls (Tampil Hanya Ketika Gedung Sudah Dipilih) */}
                {buildingId && (
                    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 animate-fadeIn">
                        <div className="flex flex-col sm:flex-row items-center gap-2.5">
                            {/* Auto Live Search Bar */}
                            <div className="relative flex-1 w-full">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={`Ketik nama atau kode ruang di ${activeBuildingObj?.name || 'gedung ini'}...`}
                                    className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                                        title="Hapus pencarian"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Tombol Tampil Filter Data */}
                            <button
                                type="button"
                                onClick={() => setShowFilters(prev => !prev)}
                                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shrink-0 cursor-pointer ${
                                    showFilters || activeFilterCount > 0
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                                }`}
                                title="Tampilkan / Sembunyikan Filter Tambahan"
                            >
                                <Filter className="w-3.5 h-3.5" />
                                <span>{showFilters ? 'Sembunyikan Filter' : 'Tampil Filter Data'}</span>
                                {activeFilterCount > 0 && (
                                    <span className="px-1.5 py-0.2 bg-white text-emerald-800 text-[10px] font-black rounded-full shadow-2xs">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>

                            {/* Reset Filter Button */}
                            {(search || activeFilterCount > 0) && (
                                <button
                                    type="button"
                                    onClick={handleResetFilter}
                                    className="w-full sm:w-auto px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
                                    title="Reset Pencarian & Filter Ruangan"
                                >
                                    Reset
                                </button>
                            )}
                        </div>

                        {/* Panel Dropdown Filter Data (Collapsible) */}
                        {showFilters && (
                            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5 animate-fadeIn">
                                {/* Filter Tipe Ruangan (42 Standar PDDIKTI dengan Kategori Optgroup) */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center space-x-1 mb-1">
                                        <DoorOpen className="w-3 h-3 text-slate-400" />
                                        <span>Tipe Ruangan:</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={roomType}
                                            onChange={(e) => {
                                                setRoomType(e.target.value);
                                                handleFilterChange(e.target.value, floor, status);
                                            }}
                                            className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer transition shadow-2xs"
                                        >
                                            <option value="">Semua Tipe Ruang ({ROOM_TYPES.length})</option>
                                            {ROOM_TYPE_GROUPS.map((group) => (
                                                <optgroup key={group.category} label={`── ${group.category} ──`} className="font-black text-slate-900 bg-slate-100">
                                                    {group.types.map((t) => (
                                                        <option key={t.value} value={t.value} className="bg-white text-slate-800 font-medium py-1">
                                                            {t.label}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Filter Lantai */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center space-x-1 mb-1">
                                        <Layers className="w-3 h-3 text-slate-400" />
                                        <span>Nomor Lantai:</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={floor}
                                            onChange={(e) => {
                                                setFloor(e.target.value);
                                                handleFilterChange(roomType, e.target.value, status);
                                            }}
                                            className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer transition shadow-2xs"
                                        >
                                            <option value="">Semua Lantai</option>
                                            <option value="1">Lantai 1</option>
                                            <option value="2">Lantai 2</option>
                                            <option value="3">Lantai 3</option>
                                            <option value="4">Lantai 4</option>
                                            <option value="5">Lantai 5</option>
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Filter Status Operasional */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center space-x-1 mb-1">
                                        <ShieldCheck className="w-3 h-3 text-slate-400" />
                                        <span>Status Operasional:</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={status}
                                            onChange={(e) => {
                                                setStatus(e.target.value);
                                                handleFilterChange(roomType, floor, e.target.value);
                                            }}
                                            className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer transition shadow-2xs"
                                        >
                                            <option value="">Semua Status</option>
                                            <option value="active">● Siap Pakai (Aktif)</option>
                                            <option value="inactive">○ Perawatan (Nonaktif)</option>
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 4. Tab Navigation & View Mode Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-1">
                    <div className="flex space-x-6">
                        <button
                            type="button"
                            onClick={() => setActiveTab('rooms')}
                            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                                activeTab === 'rooms'
                                    ? 'border-emerald-600 text-emerald-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <DoorOpen className="w-4 h-4" />
                            <span>Daftar Ruang Kelas</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                activeTab === 'rooms' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                                {buildingId ? rooms.length : 'Pilih Gedung'}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('buildings')}
                            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                                activeTab === 'buildings'
                                    ? 'border-emerald-600 text-emerald-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <Building2 className="w-4 h-4" />
                            <span>Daftar Gedung Kampus</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                activeTab === 'buildings' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                                {buildings.length}
                            </span>
                        </button>
                    </div>

                    {/* View Switcher for Rooms Tab (Hanya tampil bila gedung telah dipilih) */}
                    {activeTab === 'rooms' && buildingId && (
                        <div className="flex items-center space-x-1.5 self-end sm:self-auto mb-2 sm:mb-0 animate-fadeIn">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                    viewMode === 'grid'
                                        ? 'bg-slate-900 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                                title="Tampilan Kartu (Grid)"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                    viewMode === 'table'
                                        ? 'bg-slate-900 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                                title="Tampilan Tabel Rinci"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* TAB 1: DAFTAR RUANG KELAS */}
                {activeTab === 'rooms' && (
                    <>
                        {!buildingId ? (
                            /* PLACEHOLDER KETIKA BELUM MEMILIH GEDUNG */
                            <div className="bg-white p-12 sm:p-16 rounded-2xl border border-slate-200 text-center space-y-3 shadow-2xs animate-fadeIn">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
                                    <Building2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-base font-black text-slate-900">Pilih Gedung Terlebih Dahulu</h3>
                                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                                    Silakan pilih salah satu gedung kampus pada menu pilihan di atas untuk menampilkan seluruh data ruang kelas yang berada di gedung tersebut.
                                </p>
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('buildings')}
                                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                                    >
                                        <Building2 className="w-3.5 h-3.5" />
                                        <span>Lihat Daftar Gedung Kampus ({buildings.length})</span>
                                    </button>
                                </div>
                            </div>
                        ) : viewMode === 'grid' ? (
                            /* GRID CARD VIEW */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
                                {rooms && rooms.length > 0 ? (
                                    rooms.map((r) => (
                                        <div 
                                            key={r.id} 
                                            className={`bg-white p-5 rounded-2xl border transition group flex flex-col justify-between shadow-2xs hover:shadow-md ${
                                                r.is_active ? 'border-slate-200 hover:border-emerald-300' : 'border-rose-200 bg-rose-50/20'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold text-[11px] border border-slate-200">
                                                            {r.code}
                                                        </span>
                                                        <h3 className="text-sm font-black text-slate-900 mt-2 leading-snug">{r.name}</h3>
                                                        <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                                                            <MapPin className="w-3 h-3 text-slate-400" />
                                                            <span>{r.building_name} • Lantai {r.floor_number}</span>
                                                        </p>
                                                    </div>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase shadow-2xs ${getRoomTypeBadgeClass(r.room_type)}`}>
                                                        {r.room_type_name || getRoomTypeName(r.room_type)}
                                                    </span>
                                                </div>

                                                {/* Kapasitas */}
                                                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                                                    <div className="p-2.5 bg-slate-50 rounded-xl">
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Kuliah Reguler</p>
                                                        <p className="text-sm font-black text-slate-900">{r.capacity} Kursi</p>
                                                    </div>
                                                    <div className="p-2.5 bg-slate-50 rounded-xl">
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Ujian Tertulis</p>
                                                        <p className="text-sm font-black text-emerald-700">{r.exam_capacity || Math.floor(r.capacity * 0.6)} Kursi</p>
                                                    </div>
                                                </div>

                                                {/* Fasilitas */}
                                                <div className="mt-3">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fasilitas Ruangan:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {Array.isArray(r.facilities) && r.facilities.length > 0 ? (
                                                            r.facilities.map((f, i) => (
                                                                <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium flex items-center space-x-1">
                                                                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                                                                    <span>{f}</span>
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400 italic">Belum ada rincian fasilitas.</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer Actions */}
                                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleRoomStatus(r)}
                                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center space-x-1 transition cursor-pointer ${
                                                        r.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                                    }`}
                                                    title="Klik untuk mengubah status operasional"
                                                >
                                                    <Power className="w-3 h-3" />
                                                    <span>{r.is_active ? 'Siap Pakai' : 'Perawatan'}</span>
                                                </button>

                                                <div className="flex items-center space-x-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditRoom(r)}
                                                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                                        title="Edit Ruang Kelas"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedRoom(r);
                                                            setShowDeleteRoomModal(true);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                        title="Hapus Ruang Kelas"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                                            <DoorOpen className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-900">Belum ada ruang kelas di {activeBuildingObj?.name}</h3>
                                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                            Gedung ini belum memiliki data ruangan. Klik tombol Tambah Ruang untuk menambahkan ruang kelas ke gedung ini.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleOpenCreateRoom}
                                            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>Tambah Ruang di Gedung Ini</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* TABLE VIEW */
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden animate-fadeIn">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                                                <th className="py-3 px-4">Kode Ruang</th>
                                                <th className="py-3 px-4">Nama Ruangan</th>
                                                <th className="py-3 px-4">Gedung Kampus</th>
                                                <th className="py-3 px-3 text-center">Lantai</th>
                                                <th className="py-3 px-3 text-center">Tipe Ruangan</th>
                                                <th className="py-3 px-3 text-center">Kuliah</th>
                                                <th className="py-3 px-3 text-center">Ujian</th>
                                                <th className="py-3 px-4">Fasilitas Inventaris</th>
                                                <th className="py-3 px-3 text-center">Status</th>
                                                <th className="py-3 px-4 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {rooms && rooms.length > 0 ? (
                                                rooms.map((r) => (
                                                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                                                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.code}</td>
                                                        <td className="py-3 px-4 font-bold text-slate-900">{r.name}</td>
                                                        <td className="py-3 px-4 text-slate-700">{r.building_name}</td>
                                                        <td className="py-3 px-3 text-center font-bold text-slate-700">Lt. {r.floor_number}</td>
                                                        <td className="py-3 px-3 text-center">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRoomTypeBadgeClass(r.room_type)}`}>
                                                                {r.room_type_name || getRoomTypeName(r.room_type)}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-3 text-center font-black text-slate-900">{r.capacity} Kursi</td>
                                                        <td className="py-3 px-3 text-center font-bold text-emerald-800">{r.exam_capacity || '-'} Kursi</td>
                                                        <td className="py-3 px-4 text-[11px] text-slate-600 max-w-xs truncate">
                                                            {Array.isArray(r.facilities) && r.facilities.length > 0 ? r.facilities.join(', ') : '-'}
                                                        </td>
                                                        <td className="py-3 px-3 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleRoomStatus(r)}
                                                                className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer ${
                                                                    r.is_active 
                                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                                }`}
                                                            >
                                                                {r.is_active ? 'Siap Pakai' : 'Perawatan'}
                                                            </button>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <div className="flex items-center justify-center space-x-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenEditRoom(r)}
                                                                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                                                    title="Edit Ruang"
                                                                >
                                                                    <Edit2 className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedRoom(r);
                                                                        setShowDeleteRoomModal(true);
                                                                    }}
                                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                                    title="Hapus Ruang"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={10} className="py-8 text-center text-slate-400 italic">
                                                        Tidak ada ruang kelas yang ditemukan di {activeBuildingObj?.name}.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* TAB 2: DAFTAR GEDUNG KAMPUS */}
                {activeTab === 'buildings' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                        {buildings && buildings.length > 0 ? (
                            buildings.map((b) => (
                                <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-emerald-300 transition">
                                    <div>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                                                    <Building2 className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <span className="font-mono font-bold text-xs text-slate-500">{b.code}</span>
                                                    <h3 className="text-base font-black text-slate-900 leading-tight">{b.name}</h3>
                                                </div>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                Aktif
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-600 mt-3">{b.description || 'Gedung perkuliahan & kegiatan akademik kampus terpadu.'}</p>

                                        <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 mt-3 border border-slate-100">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-slate-600">Total Lantai:</span>
                                                <span className="font-bold text-slate-900">{b.total_floors} Lantai</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-slate-600">Total Ruangan Terdaftar:</span>
                                                <span className="font-bold text-emerald-700">{b.total_rooms || 0} Ruang Kelas</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-slate-600">Alamat / Lokasi:</span>
                                                <span className="text-slate-700 truncate max-w-xs">{b.address || 'Kampus STAI Al-Ittihad'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setBuildingId(String(b.id));
                                                setActiveTab('rooms');
                                                handleBuildingChange(String(b.id));
                                            }}
                                            className="text-emerald-700 hover:text-emerald-800 font-bold text-xs flex items-center space-x-1 cursor-pointer"
                                        >
                                            <DoorOpen className="w-3.5 h-3.5" />
                                            <span>Lihat Ruang di Gedung Ini ({b.total_rooms || 0})</span>
                                        </button>

                                        <div className="flex items-center space-x-1">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEditBuilding(b)}
                                                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                                title="Edit Data Gedung"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedBuildingItem(b);
                                                    setShowDeleteBuildingModal(true);
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                title="Hapus Gedung"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
                                Belum ada gedung kampus yang terdaftar.
                            </div>
                        )}
                    </div>
                )}

                {/* MODAL 1: TAMBAH / EDIT GEDUNG */}
                {showBuildingModal && (
                    <div 
                        onClick={(e) => { if (e.target === e.currentTarget) setShowBuildingModal(false); }}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
                    >
                        <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 text-slate-900">
                                    <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900">
                                            {isEditingBuilding ? 'Edit Data Gedung Kampus' : 'Tambah Gedung Kampus Baru'}
                                        </h3>
                                        <p className="text-[11px] text-slate-500">Kelola master identitas gedung & denah lantai</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowBuildingModal(false)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer flex items-center space-x-1"
                                    title="Tutup Modal (Tekan ESC)"
                                >
                                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 border border-slate-200">ESC</span>
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmitBuilding} className="space-y-3 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Kode Gedung</label>
                                    <input
                                        type="text"
                                        value={buildingForm.data.code}
                                        onChange={(e) => buildingForm.setData('code', e.target.value.toUpperCase())}
                                        placeholder="Contoh: G-TARBIYAH"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl uppercase font-mono font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Nama Gedung</label>
                                    <input
                                        type="text"
                                        value={buildingForm.data.name}
                                        onChange={(e) => buildingForm.setData('name', e.target.value)}
                                        placeholder="Contoh: Gedung Fakultas Tarbiyah"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Jumlah Lantai</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={buildingForm.data.total_floors}
                                        onChange={(e) => buildingForm.setData('total_floors', parseInt(e.target.value))}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Alamat / Lokasi Gedung</label>
                                    <input
                                        type="text"
                                        value={buildingForm.data.address}
                                        onChange={(e) => buildingForm.setData('address', e.target.value)}
                                        placeholder="Contoh: Sayap Barat Kampus STAI Al-Ittihad"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Keterangan / Fungsi Gedung</label>
                                    <textarea
                                        value={buildingForm.data.description}
                                        onChange={(e) => buildingForm.setData('description', e.target.value)}
                                        placeholder="Deskripsi peruntukan gedung perkuliahan..."
                                        rows={2}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowBuildingModal(false)}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                                    >
                                        Batal (ESC)
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={buildingForm.processing}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-xs cursor-pointer"
                                    >
                                        {isEditingBuilding ? 'Perbarui Gedung' : 'Simpan Gedung'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 2: KONFIRMASI HAPUS GEDUNG */}
                {showDeleteBuildingModal && selectedBuildingItem && (
                    <div 
                        onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteBuildingModal(false); }}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
                    >
                        <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 text-rose-600">
                                    <div className="p-2.5 bg-rose-100 rounded-xl">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-black text-slate-900">Konfirmasi Hapus Gedung</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteBuildingModal(false)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer flex items-center space-x-1"
                                    title="Tutup Modal (Tekan ESC)"
                                >
                                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 border border-slate-200">ESC</span>
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Apakah Anda yakin ingin menghapus gedung <strong>{selectedBuildingItem.name}</strong> ({selectedBuildingItem.code})?
                            </p>
                            {selectedBuildingItem.total_rooms > 0 && (
                                <div className="p-3 bg-amber-50 rounded-xl text-amber-800 text-[11px] border border-amber-200 font-bold">
                                    ⚠️ Gedung ini memiliki {selectedBuildingItem.total_rooms} ruang kelas di dalamnya. Hapus atau pindahkan semua ruangan terlebih dahulu sebelum menghapus gedung ini.
                                </div>
                            )}
                            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteBuildingModal(false)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                                >
                                    Batal (ESC)
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDeleteBuilding}
                                    className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-xs cursor-pointer"
                                >
                                    Ya, Hapus Gedung
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL 3: TAMBAH / EDIT RUANG KELAS */}
                {showRoomModal && (
                    <div 
                        onClick={(e) => { if (e.target === e.currentTarget) setShowRoomModal(false); }}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
                    >
                        <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 text-slate-900">
                                    <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                                        <DoorOpen className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900">
                                            {isEditingRoom ? 'Edit Ruang Kelas Perkuliahan' : 'Tambah Ruang Kelas Baru'}
                                        </h3>
                                        <p className="text-[11px] text-slate-500">Tentukan gedung, nomor lantai, kapasitas & fasilitas</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowRoomModal(false)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer flex items-center space-x-1"
                                    title="Tutup Modal (Tekan ESC)"
                                >
                                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 border border-slate-200">ESC</span>
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmitRoom} className="space-y-3 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Gedung Kampus: Otomatis Terkunci Bila Sudah Memilih Gedung di Awal */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block font-bold text-slate-700">Pilih Gedung</label>
                                            {buildingId && !isEditingRoom && (
                                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                                                    <Lock className="w-3 h-3 text-emerald-600" />
                                                    <span>Terkunci</span>
                                                </span>
                                            )}
                                        </div>
                                        {buildingId && !isEditingRoom ? (
                                            <div className="w-full p-2.5 bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-800 text-xs flex items-center justify-between shadow-2xs">
                                                <div className="flex items-center space-x-2 truncate">
                                                    <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                                                    <span className="truncate">
                                                        {activeBuildingObj?.name || 'Gedung Terpilih'} ({activeBuildingObj?.code})
                                                    </span>
                                                </div>
                                                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <select
                                                    value={roomForm.data.building_id}
                                                    onChange={(e) => roomForm.setData('building_id', e.target.value)}
                                                    className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-300 rounded-xl pl-3 pr-8 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer transition shadow-2xs"
                                                    required
                                                >
                                                    <option value="">-- Pilih Gedung --</option>
                                                    {buildings && buildings.map((b) => (
                                                        <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">Nomor Lantai</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={activeBuildingObj?.total_floors || 20}
                                            value={roomForm.data.floor_number}
                                            onChange={(e) => roomForm.setData('floor_number', parseInt(e.target.value))}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">Kode Ruang</label>
                                        <input
                                            type="text"
                                            value={roomForm.data.code}
                                            onChange={(e) => roomForm.setData('code', e.target.value.toUpperCase())}
                                            placeholder="Contoh: R-101"
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold uppercase focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block font-bold text-slate-700">Tipe Ruangan</label>
                                            <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                {getRoomTypeName(roomForm.data.room_type)}
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={roomForm.data.room_type}
                                                onChange={(e) => roomForm.setData('room_type', e.target.value)}
                                                className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-300 rounded-xl pl-3 pr-8 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer transition shadow-2xs"
                                            >
                                                {ROOM_TYPE_GROUPS.map((group) => (
                                                    <optgroup key={group.category} label={`── ${group.category} ──`} className="font-black text-slate-900 bg-slate-100 py-1">
                                                        {group.types.map((t) => (
                                                            <option key={t.value} value={t.value} className="bg-white text-slate-800 font-medium py-1">
                                                                {t.label}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Nama Ruang Kelas</label>
                                    <input
                                        type="text"
                                        value={roomForm.data.name}
                                        onChange={(e) => roomForm.setData('name', e.target.value)}
                                        placeholder="Contoh: Ruang Kuliah 101 (Al-Ghazali)"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">Kapasitas Kuliah (Kursi)</label>
                                        <input
                                            type="number"
                                            min={5}
                                            max={500}
                                            value={roomForm.data.capacity}
                                            onChange={(e) => roomForm.setData('capacity', parseInt(e.target.value))}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">Kapasitas Ujian (Kursi)</label>
                                        <input
                                            type="number"
                                            min={5}
                                            max={300}
                                            value={roomForm.data.exam_capacity}
                                            onChange={(e) => roomForm.setData('exam_capacity', parseInt(e.target.value))}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Checklist Fasilitas Ruangan:</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {availableFacilities.map((fac, idx) => {
                                            const isSelected = Array.isArray(roomForm.data.facilities) && roomForm.data.facilities.includes(fac);
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => toggleFacility(fac)}
                                                    className={`p-2 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                                                        isSelected 
                                                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-2xs' 
                                                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    <span className="truncate">{fac}</span>
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowRoomModal(false)}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                                    >
                                        Batal (ESC)
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={roomForm.processing}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-xs cursor-pointer"
                                    >
                                        {isEditingRoom ? 'Perbarui Ruangan' : 'Simpan Ruang Kelas'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 4: KONFIRMASI HAPUS RUANG KELAS */}
                {showDeleteRoomModal && selectedRoom && (
                    <div 
                        onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteRoomModal(false); }}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
                    >
                        <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 text-rose-600">
                                    <div className="p-2.5 bg-rose-100 rounded-xl">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-black text-slate-900">Konfirmasi Hapus Ruang Kelas</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteRoomModal(false)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer flex items-center space-x-1"
                                    title="Tutup Modal (Tekan ESC)"
                                >
                                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 border border-slate-200">ESC</span>
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Apakah Anda yakin ingin menghapus ruang <strong>{selectedRoom.name}</strong> ({selectedRoom.code}) di <strong>{selectedRoom.building_name}</strong>?
                            </p>
                            <div className="p-3 bg-amber-50 rounded-xl text-amber-800 text-[11px] border border-amber-200">
                                💡 Jika ruangan sedang dalam renovasi atau perbaikan berkala, Anda disarankan cukup <strong>mengubah status menjadi Perawatan</strong> tanpa menghapus master data ruang.
                            </div>
                            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteRoomModal(false)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                                >
                                    Batal (ESC)
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDeleteRoom}
                                    className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-xs cursor-pointer"
                                >
                                    Ya, Hapus Ruangan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MOBILE FLOATING ACTION BUTTON (FAB) & SPEED DIAL MENU */}
                <div className="fixed bottom-6 right-6 z-40 sm:hidden">
                    {/* Backdrop overlay when speed dial is open */}
                    {isMobileFabOpen && (
                        <div 
                            onClick={() => setIsMobileFabOpen(false)}
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-30 transition-opacity"
                        />
                    )}

                    {/* Floating Speed Dial Actions */}
                    {isMobileFabOpen && (
                        <div className="relative z-40 mb-3 space-y-2.5 flex flex-col items-end animate-in fade-in slide-in-from-bottom-5 duration-200">
                            {/* 1. Tambah Ruang Kelas */}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsMobileFabOpen(false);
                                    handleOpenCreateRoom();
                                }}
                                className="flex items-center space-x-2 bg-white text-slate-800 pl-3 pr-2 py-1.5 rounded-full shadow-lg border border-slate-200 text-xs font-bold active:scale-95 transition cursor-pointer"
                            >
                                <span>Tambah Ruang Kelas</span>
                                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                    <DoorOpen className="w-4 h-4" />
                                </div>
                            </button>

                            {/* 2. Tambah Gedung */}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsMobileFabOpen(false);
                                    handleOpenCreateBuilding();
                                }}
                                className="flex items-center space-x-2 bg-white text-slate-800 pl-3 pr-2 py-1.5 rounded-full shadow-lg border border-slate-200 text-xs font-bold active:scale-95 transition cursor-pointer"
                            >
                                <span>Tambah Gedung</span>
                                <div className="w-8 h-8 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center shadow-xs">
                                    <Building2 className="w-4 h-4" />
                                </div>
                            </button>

                            {/* 3. Unduh Excel */}
                            <a
                                href={`/admin/facilities/export-excel?building_id=${encodeURIComponent(buildingId)}&room_type=${encodeURIComponent(roomType)}&status=${encodeURIComponent(status)}`}
                                onClick={() => setIsMobileFabOpen(false)}
                                className="flex items-center space-x-2 bg-white text-slate-800 pl-3 pr-2 py-1.5 rounded-full shadow-lg border border-slate-200 text-xs font-bold active:scale-95 transition cursor-pointer"
                            >
                                <span>Unduh Excel</span>
                                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                                    <FileSpreadsheet className="w-4 h-4" />
                                </div>
                            </a>

                            {/* 4. Cetak PDF Resmi */}
                            <Link
                                href={`/admin/facilities/print-pdf?building_id=${encodeURIComponent(buildingId)}&room_type=${encodeURIComponent(roomType)}&status=${encodeURIComponent(status)}`}
                                onClick={() => setIsMobileFabOpen(false)}
                                className="flex items-center space-x-2 bg-white text-slate-800 pl-3 pr-2 py-1.5 rounded-full shadow-lg border border-slate-200 text-xs font-bold active:scale-95 transition cursor-pointer"
                            >
                                <span>Cetak PDF Resmi</span>
                                <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center shadow-xs">
                                    <Printer className="w-4 h-4" />
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* Main FAB Trigger Button */}
                    <button
                        type="button"
                        onClick={() => setIsMobileFabOpen(!isMobileFabOpen)}
                        className={`relative z-40 w-13 h-13 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-90 cursor-pointer ${
                            isMobileFabOpen 
                                ? 'bg-slate-900 text-white rotate-90 shadow-slate-900/40' 
                                : 'bg-gradient-to-tr from-emerald-700 to-teal-500 text-white shadow-emerald-700/40 hover:shadow-2xl'
                        }`}
                        aria-label="Aksi Cepat Infrastruktur"
                    >
                        {isMobileFabOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Plus className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
