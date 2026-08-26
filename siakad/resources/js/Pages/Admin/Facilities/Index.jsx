import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Building2, DoorOpen, Plus, CheckCircle2, ShieldCheck, 
    Layers, Users, Tv, Check, Search, Filter, X, 
    Printer, FileSpreadsheet, Edit2, Trash2, MoreVertical,
    AlertCircle, RefreshCw, LayoutGrid, List, CheckSquare,
    Eye, Power, Sparkles, MapPin, Armchair, GraduationCap
} from 'lucide-react';

export default function FacilitiesIndex({ 
    buildings = [], 
    rooms = [], 
    stats = {}, 
    filters = {} 
}) {
    const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' | 'buildings'
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
    const [search, setSearch] = useState(filters.search || '');
    const [buildingId, setBuildingId] = useState(filters.building_id || '');
    const [roomType, setRoomType] = useState(filters.room_type || '');
    const [floor, setFloor] = useState(filters.floor || '');
    const [status, setStatus] = useState(filters.status || '');
    const [showFilters, setShowFilters] = useState(Boolean(filters.building_id || filters.room_type || filters.floor || filters.status));
    const [isMobileFabOpen, setIsMobileFabOpen] = useState(false);
    const isFirstRender = useRef(true);

    // Modals
    const [showBuildingModal, setShowBuildingModal] = useState(false);
    const [isEditingBuilding, setIsEditingBuilding] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [showDeleteBuildingModal, setShowDeleteBuildingModal] = useState(false);

    const [showRoomModal, setShowRoomModal] = useState(false);
    const [isEditingRoom, setIsEditingRoom] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showDeleteRoomModal, setShowDeleteRoomModal] = useState(false);

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

    // Form Ruang
    const roomForm = useForm({
        id: null,
        building_id: buildings && buildings.length > 0 ? buildings[0].id : '',
        code: '',
        name: '',
        floor_number: 1,
        capacity: 35,
        exam_capacity: 20,
        room_type: 'TEORI',
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
                search,
                building_id: buildingId,
                room_type: roomType,
                floor,
                status,
            }, { preserveState: true, replace: true, preserveScroll: true });
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    const handleFilterChange = (newBId, newType, newFloor, newStatus) => {
        router.get('/admin/facilities', {
            search,
            building_id: newBId,
            room_type: newType,
            floor: newFloor,
            status: newStatus,
        }, { preserveState: true, replace: true, preserveScroll: true });
    };

    const handleResetFilter = () => {
        setSearch('');
        setBuildingId('');
        setRoomType('');
        setFloor('');
        setStatus('');
        router.get('/admin/facilities', {}, { preserveState: true });
    };

    const activeFilterCount = [buildingId, roomType, floor, status].filter(Boolean).length;

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
        setSelectedBuilding(b);
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
        if (!selectedBuilding) return;
        router.delete(`/admin/facilities/buildings/${selectedBuilding.id}`, {
            onSuccess: () => {
                setShowDeleteBuildingModal(false);
                setSelectedBuilding(null);
            },
        });
    };

    // Actions: Ruang Kelas
    const handleOpenCreateRoom = () => {
        setIsEditingRoom(false);
        roomForm.reset();
        roomForm.setData({
            id: null,
            building_id: buildings && buildings.length > 0 ? buildings[0].id : '',
            code: '',
            name: '',
            floor_number: 1,
            capacity: 35,
            exam_capacity: 20,
            room_type: 'TEORI',
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
            building_id: r.building_id,
            code: r.code,
            name: r.name,
            floor_number: r.floor_number,
            capacity: r.capacity,
            exam_capacity: r.exam_capacity || Math.floor(r.capacity * 0.6),
            room_type: r.room_type,
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

            <div className="space-y-5">
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
                                Tambah Ruang Kelas
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. KPI Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Gedung</p>
                            <p className="text-lg font-black text-slate-900">{stats.total_buildings || buildings.length}</p>
                            <span className="text-[10px] text-slate-500">Unit Infrastruktur</span>
                        </div>
                    </div>

                    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
                        <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
                            <DoorOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ruang Kelas</p>
                            <p className="text-lg font-black text-slate-900">{stats.total_rooms || rooms.length}</p>
                            <span className="text-[10px] text-emerald-600 font-bold">● {stats.active_rooms || rooms.length} Siap Pakai</span>
                        </div>
                    </div>

                    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                            <Armchair className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kapasitas Kuliah</p>
                            <p className="text-lg font-black text-slate-900">{stats.total_capacity || 0}</p>
                            <span className="text-[10px] text-slate-500">Kursi Mahasiswa</span>
                        </div>
                    </div>

                    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
                        <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kapasitas Ujian</p>
                            <p className="text-lg font-black text-slate-900">{stats.total_exam_capacity || 0}</p>
                            <span className="text-[10px] text-slate-500">Format Jarak Ujian</span>
                        </div>
                    </div>
                </div>

                {/* 3. Filter & Live Search Controls */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-2.5">
                        {/* Auto Live Search Bar */}
                        <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Ketik nama ruang, kode ruang, atau gedung..."
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
                            title="Tampilkan / Sembunyikan Filter Ruang"
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
                                title="Reset Semua Filter & Pencarian"
                            >
                                Reset
                            </button>
                        )}
                    </div>

                    {/* Panel Dropdown Filter Data (Collapsible) */}
                    {showFilters && (
                        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 animate-fadeIn">
                            {/* Filter Gedung */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Gedung Kampus:</label>
                                <select
                                    value={buildingId}
                                    onChange={(e) => {
                                        setBuildingId(e.target.value);
                                        handleFilterChange(e.target.value, roomType, floor, status);
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                >
                                    <option value="">Semua Gedung</option>
                                    {buildings.map((b) => (
                                        <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter Tipe Ruangan */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tipe Ruangan:</label>
                                <select
                                    value={roomType}
                                    onChange={(e) => {
                                        setRoomType(e.target.value);
                                        handleFilterChange(buildingId, e.target.value, floor, status);
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                >
                                    <option value="">Semua Tipe Ruang</option>
                                    <option value="TEORI">Teori Reguler</option>
                                    <option value="LAB_KOMPUTER">Lab Komputer / CBT</option>
                                    <option value="MICROTEACHING">Microteaching</option>
                                    <option value="AUDITORIUM">Auditorium / Aula</option>
                                </select>
                            </div>

                            {/* Filter Lantai */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nomor Lantai:</label>
                                <select
                                    value={floor}
                                    onChange={(e) => {
                                        setFloor(e.target.value);
                                        handleFilterChange(buildingId, roomType, e.target.value, status);
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                >
                                    <option value="">Semua Lantai</option>
                                    <option value="1">Lantai 1</option>
                                    <option value="2">Lantai 2</option>
                                    <option value="3">Lantai 3</option>
                                    <option value="4">Lantai 4</option>
                                </select>
                            </div>

                            {/* Filter Status Operasional */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Status Operasional:</label>
                                <select
                                    value={status}
                                    onChange={(e) => {
                                        setStatus(e.target.value);
                                        handleFilterChange(buildingId, roomType, floor, e.target.value);
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="active">● Siap Pakai (Aktif)</option>
                                    <option value="inactive">○ Perawatan (Nonaktif)</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

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
                                {rooms.length}
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

                    {/* View Switcher for Rooms Tab */}
                    {activeTab === 'rooms' && (
                        <div className="flex items-center space-x-1.5 self-end sm:self-auto mb-2 sm:mb-0">
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
                        {viewMode === 'grid' ? (
                            /* GRID CARD VIEW */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                                        r.room_type === 'LAB_KOMPUTER' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                        r.room_type === 'AUDITORIUM' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                                        r.room_type === 'MICROTEACHING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    }`}>
                                                        {r.room_type}
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
                                                    className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center space-x-1 transition cursor-pointer ${
                                                        r.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                                    }`}
                                                    title="Klik untuk mengubah status operasional"
                                                >
                                                    <Power className="w-3 h-3" />
                                                    <span>{r.is_active ? 'Siap Pakai' : 'Perbaikan'}</span>
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
                                        <h3 className="text-sm font-black text-slate-900">Tidak ada data ruang kelas</h3>
                                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                            Tidak ditemukan ruang kelas yang sesuai dengan kata kunci atau kriteria filter yang aktif.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* TABLE VIEW */
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                                                <th className="py-3 px-4">Kode Ruang</th>
                                                <th className="py-3 px-4">Nama Ruangan</th>
                                                <th className="py-3 px-4">Gedung Kampus</th>
                                                <th className="py-3 px-3 text-center">Lantai</th>
                                                <th className="py-3 px-3 text-center">Tipe</th>
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
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                                {r.room_type}
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
                                                        Tidak ada ruang kelas yang ditemukan.
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                setBuildingId(b.id);
                                                setActiveTab('rooms');
                                                handleFilterChange(b.id, roomType, floor, status);
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
                                                    setSelectedBuilding(b);
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
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
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
                                        Batal
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
                {showDeleteBuildingModal && selectedBuilding && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
                            <div className="flex items-center space-x-3 text-rose-600">
                                <div className="p-2.5 bg-rose-100 rounded-xl">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-black text-slate-900">Konfirmasi Hapus Gedung</h3>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Apakah Anda yakin ingin menghapus gedung <strong>{selectedBuilding.name}</strong> ({selectedBuilding.code})?
                            </p>
                            {selectedBuilding.total_rooms > 0 && (
                                <div className="p-3 bg-amber-50 rounded-xl text-amber-800 text-[11px] border border-amber-200 font-bold">
                                    ⚠️ Gedung ini memiliki {selectedBuilding.total_rooms} ruang kelas di dalamnya. Hapus atau pindahkan semua ruangan terlebih dahulu sebelum menghapus gedung ini.
                                </div>
                            )}
                            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteBuildingModal(false)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                                >
                                    Batal
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
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
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

                            <form onSubmit={handleSubmitRoom} className="space-y-3 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">Pilih Gedung Kampus</label>
                                        <select
                                            value={roomForm.data.building_id}
                                            onChange={(e) => roomForm.setData('building_id', e.target.value)}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                                            required
                                        >
                                            {buildings && buildings.map((b) => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">Nomor Lantai</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={20}
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
                                        <label className="block font-bold text-slate-700 mb-1">Tipe Ruangan</label>
                                        <select
                                            value={roomForm.data.room_type}
                                            onChange={(e) => roomForm.setData('room_type', e.target.value)}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                                        >
                                            <option value="TEORI">Teori Reguler</option>
                                            <option value="LAB_KOMPUTER">Lab Komputer / CBT</option>
                                            <option value="MICROTEACHING">Microteaching</option>
                                            <option value="AUDITORIUM">Auditorium / Aula</option>
                                        </select>
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
                                        Batal
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
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
                            <div className="flex items-center space-x-3 text-rose-600">
                                <div className="p-2.5 bg-rose-100 rounded-xl">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-black text-slate-900">Konfirmasi Hapus Ruang Kelas</h3>
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
                                    Batal
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
