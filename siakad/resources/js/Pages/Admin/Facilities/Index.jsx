import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { Building2, DoorOpen, Plus, CheckCircle2, ShieldCheck, Layers, Users, Tv, Check } from 'lucide-react';

export default function FacilitiesIndex({ buildings = [], rooms = [] }) {
    const [activeTab, setActiveTab] = useState('rooms'); // 'buildings' | 'rooms'
    const [showBuildingModal, setShowBuildingModal] = useState(false);
    const [showRoomModal, setShowRoomModal] = useState(false);

    // Form Gedung
    const buildingForm = useForm({
        code: '',
        name: '',
        total_floors: 1,
        address: '',
        description: '',
    });

    // Form Ruang
    const roomForm = useForm({
        building_id: buildings && buildings.length > 0 ? buildings[0].id : '',
        code: '',
        name: '',
        floor_number: 1,
        capacity: 35,
        exam_capacity: 20,
        room_type: 'TEORI',
        facilities: ['AC', 'Proyektor LCD', 'Whiteboard'],
    });

    const submitBuilding = (e) => {
        e.preventDefault();
        buildingForm.post('/admin/facilities/buildings', {
            onSuccess: () => {
                setShowBuildingModal(false);
                buildingForm.reset();
            },
        });
    };

    const submitRoom = (e) => {
        e.preventDefault();
        roomForm.post('/admin/facilities/rooms', {
            onSuccess: () => {
                setShowRoomModal(false);
                roomForm.reset();
            },
        });
    };

    const availableFacilities = ['AC', 'Proyektor LCD', 'Sound System', 'CCTV', 'Whiteboard', 'Smart TV / Display', 'PC Komputer'];

    const toggleFacility = (facility) => {
        const current = Array.isArray(roomForm.data.facilities) ? roomForm.data.facilities : [];
        if (current.includes(facility)) {
            roomForm.setData('facilities', current.filter((f) => f !== facility));
        } else {
            roomForm.setData('facilities', [...current, facility]);
        }
    };

    return (
        <AppLayout title="Infrastruktur: Gedung & Ruang Kelas">
            <Head title="Gedung & Ruang Kelas — SIAKAD" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Master Infrastruktur Kampus</h2>
                        <p className="text-xs text-slate-500">Kelola master gedung, denah lantai, dan inventaris fasilitas ruang kelas perkuliahan.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowBuildingModal(true)}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Gedung</span>
                        </button>
                        <button
                            onClick={() => setShowRoomModal(true)}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Ruang Kelas</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 space-x-4">
                    <button
                        onClick={() => setActiveTab('rooms')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
                            activeTab === 'rooms' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <DoorOpen className="w-4 h-4" />
                        <span>Daftar Ruang Kelas ({rooms.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('buildings')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
                            activeTab === 'buildings' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Building2 className="w-4 h-4" />
                        <span>Daftar Gedung Kampus ({buildings.length})</span>
                    </button>
                </div>

                {/* TAB 1: DAFTAR RUANG KELAS */}
                {activeTab === 'rooms' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rooms && rooms.length > 0 ? (
                            rooms.map((r) => (
                                <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition group flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold text-[11px] border border-slate-200">
                                                    {r.code}
                                                </span>
                                                <h3 className="text-sm font-black text-slate-900 mt-2 leading-snug">{r.name}</h3>
                                                <p className="text-xs text-slate-500">{r.building_name} • Lantai {r.floor_number}</p>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                {r.room_type}
                                            </span>
                                        </div>

                                        {/* Kapasitas */}
                                        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                                            <div className="p-2 bg-slate-50 rounded-lg">
                                                <p className="text-[10px] text-slate-500 font-semibold">Kuliah Reguler</p>
                                                <p className="text-sm font-black text-slate-900">{r.capacity} Kursi</p>
                                            </div>
                                            <div className="p-2 bg-slate-50 rounded-lg">
                                                <p className="text-[10px] text-slate-500 font-semibold">Ujian Tertulis</p>
                                                <p className="text-sm font-black text-emerald-700">{r.exam_capacity || Math.floor(r.capacity * 0.6)} Kursi</p>
                                            </div>
                                        </div>

                                        {/* Fasilitas */}
                                        <div className="mt-3">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fasilitas Ruang:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {Array.isArray(r.facilities) && r.facilities.map((f, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                                                        ✓ {f}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-600 font-bold">
                                        <span>🟢 Status Aktif (Siap Pakai)</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
                                Belum ada ruang kelas yang terdaftar.
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: DAFTAR GEDUNG */}
                {activeTab === 'buildings' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {buildings && buildings.length > 0 ? (
                            buildings.map((b) => (
                                <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="font-mono font-bold text-xs text-slate-500">{b.code}</span>
                                            <h3 className="text-base font-black text-slate-900 leading-tight">{b.name}</h3>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-600 mb-3">{b.description || 'Tidak ada keterangan tambahan.'}</p>
                                    <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                                        <p><span className="font-bold text-slate-700">Total Lantai:</span> {b.total_floors} Lantai</p>
                                        <p><span className="font-bold text-slate-700">Alamat:</span> {b.address || 'Kampus STAI Al-Ittihad Cianjur'}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
                                Belum ada gedung kampus yang terdaftar.
                            </div>
                        )}
                    </div>
                )}

                {/* MODAL TAMBAH GEDUNG */}
                {showBuildingModal && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
                            <h3 className="text-base font-black text-slate-900">Tambah Gedung Kampus Baru</h3>
                            <form onSubmit={submitBuilding} className="space-y-3 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Kode Gedung</label>
                                    <input
                                        type="text"
                                        value={buildingForm.data.code}
                                        onChange={(e) => buildingForm.setData('code', e.target.value.toUpperCase())}
                                        placeholder="Contoh: G-SYARIAH"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg uppercase font-mono font-bold"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Nama Gedung</label>
                                    <input
                                        type="text"
                                        value={buildingForm.data.name}
                                        onChange={(e) => buildingForm.setData('name', e.target.value)}
                                        placeholder="Contoh: Gedung Fakultas Syariah"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Jumlah Lantai</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={buildingForm.data.total_floors}
                                        onChange={(e) => buildingForm.setData('total_floors', parseInt(e.target.value))}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Keterangan / Fungsi Gedung</label>
                                    <textarea
                                        value={buildingForm.data.description}
                                        onChange={(e) => buildingForm.setData('description', e.target.value)}
                                        placeholder="Deskripsi peruntukan gedung..."
                                        rows={2}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                                    />
                                </div>
                                <div className="flex justify-end space-x-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowBuildingModal(false)}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={buildingForm.processing}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                                    >
                                        Simpan Gedung
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL TAMBAH RUANG KELAS */}
                {showRoomModal && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-base font-black text-slate-900">Tambah Ruang Kelas Perkuliahan</h3>
                            <form onSubmit={submitRoom} className="space-y-3 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">Pilih Gedung</label>
                                        <select
                                            value={roomForm.data.building_id}
                                            onChange={(e) => roomForm.setData('building_id', e.target.value)}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
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
                                            value={roomForm.data.floor_number}
                                            onChange={(e) => roomForm.setData('floor_number', parseInt(e.target.value))}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
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
                                            placeholder="Contoh: R-201"
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">Tipe Ruang</label>
                                        <select
                                            value={roomForm.data.room_type}
                                            onChange={(e) => roomForm.setData('room_type', e.target.value)}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                                        >
                                            <option value="TEORI">Teori Reguler</option>
                                            <option value="LAB_KOMPUTER">Lab Komputer / CBT</option>
                                            <option value="MICROTEACHING">Microteaching</option>
                                            <option value="AUDITORIUM">Auditorium / Seminar</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Nama Ruang</label>
                                    <input
                                        type="text"
                                        value={roomForm.data.name}
                                        onChange={(e) => roomForm.setData('name', e.target.value)}
                                        placeholder="Contoh: Ruang Kuliah 201 (Tarbiyah)"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">Kapasitas Kuliah (Kursi)</label>
                                        <input
                                            type="number"
                                            min={5}
                                            value={roomForm.data.capacity}
                                            onChange={(e) => roomForm.setData('capacity', parseInt(e.target.value))}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">Kapasitas Ujian (Kursi)</label>
                                        <input
                                            type="number"
                                            min={5}
                                            value={roomForm.data.exam_capacity}
                                            onChange={(e) => roomForm.setData('exam_capacity', parseInt(e.target.value))}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Checklist Fasilitas Ruang:</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {availableFacilities.map((fac, idx) => {
                                            const isSelected = Array.isArray(roomForm.data.facilities) && roomForm.data.facilities.includes(fac);
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => toggleFacility(fac)}
                                                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition ${
                                                        isSelected ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                                                    }`}
                                                >
                                                    <span>{fac}</span>
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowRoomModal(false)}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={roomForm.processing}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                                    >
                                        Simpan Ruang Kelas
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
