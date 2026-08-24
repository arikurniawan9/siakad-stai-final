import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Calendar, Clock, AlertTriangle, CheckCircle2, Plus, 
    Trash2, Building2, User, BookOpen, Layers, ShieldAlert,
    Filter, ChevronRight, Video, MapPin
} from 'lucide-react';

const DAYS = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];

export default function SchedulesIndex({ activePeriod, selectedPeriodId, buildings = [], rooms = [], classes = [], schedules = [], conflicts = [] }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDayFilter, setSelectedDayFilter] = useState('ALL');
    const [selectedRoomFilter, setSelectedRoomFilter] = useState('ALL');
    const [clashCheckResult, setClashCheckResult] = useState(null);
    const [isCheckingClash, setIsCheckingClash] = useState(false);

    const form = useForm({
        course_class_id: classes[0]?.id || '',
        room_id: rooms[0]?.id || '',
        day_of_week: 'SENIN',
        start_time: '08:00',
        end_time: '09:40',
        is_online: false,
        online_meeting_url: '',
        allow_clash_override: false,
    });

    const handleRealtimeClashCheck = async (formValues) => {
        setIsCheckingClash(true);
        try {
            const res = await fetch('/admin/schedules/check-conflict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(formValues),
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
        handleRealtimeClashCheck(updated);
    };

    const handleSubmitSchedule = (e) => {
        e.preventDefault();
        form.post('/admin/schedules', {
            onSuccess: () => {
                setShowAddModal(false);
                form.reset();
                setClashCheckResult(null);
            },
        });
    };

    const handleDeleteSchedule = (id) => {
        if (confirm('Hapus jadwal perkuliahan ini?')) {
            router.delete(`/admin/schedules/${id}`);
        }
    };

    const filteredSchedules = schedules.filter((s) => {
        if (selectedDayFilter !== 'ALL' && s.day_of_week !== selectedDayFilter) return false;
        if (selectedRoomFilter !== 'ALL' && String(s.room_id) !== String(selectedRoomFilter)) return false;
        return true;
    });

    return (
        <AppLayout title="Penjadwalan Kuliah & Anti-Clash Scheduler">
            <Head title="Jadwal & Anti-Clash — SIAKAD" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Penjadwalan Kuliah & Anti-Clash Matrix</h2>
                        <p className="text-xs text-slate-500">
                            Matriks plotting jadwal ruang & dosen otomatis dengan deteksi bentrok real-time ({activePeriod?.name || 'Periode Aktif'}).
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => {
                                setShowAddModal(true);
                                handleRealtimeClashCheck(form.data);
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Plotting Jadwal Baru</span>
                        </button>
                    </div>
                </div>

                {/* Conflict Alert Banner if any clash exists */}
                {conflicts.length > 0 ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2 text-red-900">
                        <div className="flex items-center space-x-2 font-black text-xs uppercase tracking-wide text-red-700">
                            <AlertTriangle className="w-4 h-4 animate-bounce" />
                            <span>PERINGATAN: DITEMUKAN {conflicts.length} JADWAL BENTROK PADA PERIODE INI!</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {conflicts.map((c, idx) => (
                                <div key={idx} className="p-2.5 bg-white rounded-lg border border-red-200 text-xs shadow-2xs">
                                    <span className="font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px]">
                                        {c.type === 'ROOM_CLASH' ? 'Bentrok Ruang' : 'Bentrok Dosen'} • {c.day}
                                    </span>
                                    <p className="font-bold text-slate-800 mt-1">{c.message}</p>
                                    <p className="text-[11px] text-slate-500">{c.time_a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-900 text-xs">
                        <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="font-bold">Anti-Clash Engine: 100% Jadwal Bersih Tanpa Bentrok Ruangan & Dosen!</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">
                            {schedules.length} Sesi Terjadwal
                        </span>
                    </div>
                )}

                {/* Filter Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 flex items-center space-x-1">
                            <Filter className="w-3.5 h-3.5" />
                            <span>Hari:</span>
                        </span>
                        <button
                            onClick={() => setSelectedDayFilter('ALL')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                selectedDayFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Semua
                        </button>
                        {DAYS.map((d) => (
                            <button
                                key={d}
                                onClick={() => setSelectedDayFilter(d)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                    selectedDayFilter === d ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-500">Ruangan:</span>
                        <select
                            value={selectedRoomFilter}
                            onChange={(e) => setSelectedRoomFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="ALL">Semua Ruang Kelas</option>
                            {rooms.map((r) => (
                                <option key={r.id} value={r.id}>{r.code} - {r.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Weekly Matrix Schedule View */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {DAYS.filter(d => selectedDayFilter === 'ALL' || selectedDayFilter === d).map((day) => {
                        const daySchedules = filteredSchedules.filter((s) => s.day_of_week === day);
                        return (
                            <div key={day} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                                <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                                    <span className="font-black text-xs uppercase tracking-wider">{day}</span>
                                    <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold">
                                        {daySchedules.length} Mata Kuliah
                                    </span>
                                </div>
                                <div className="p-3 space-y-3 flex-1 bg-slate-50/50">
                                    {daySchedules.length === 0 ? (
                                        <div className="py-8 text-center text-slate-400 text-xs italic">
                                            Tidak ada perkuliahan dijadwalkan
                                        </div>
                                    ) : (
                                        daySchedules.map((sch) => (
                                            <div key={sch.id} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 hover:border-emerald-300 transition">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded font-mono font-bold text-[10px]">
                                                            {sch.course_code} • {sch.credits} SKS
                                                        </span>
                                                        <h4 className="text-xs font-black text-slate-900 mt-1 leading-snug">{sch.course_name}</h4>
                                                        <p className="text-[11px] text-slate-500 font-bold">{sch.class_name}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteSchedule(sch.id)}
                                                        className="text-slate-300 hover:text-red-600 p-1 transition"
                                                        title="Hapus Jadwal"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                                                    <div className="flex items-center space-x-1 font-bold text-slate-700">
                                                        <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                                                        <span>{sch.start_time.substring(0, 5)} - {sch.end_time.substring(0, 5)}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                                                        <span className="truncate">{sch.room_code}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded-lg">
                                                    <span className="font-bold truncate flex items-center space-x-1">
                                                        <User className="w-3 h-3 text-slate-400" />
                                                        <span>{sch.lecturer_name || 'Dosen Pengampu'}</span>
                                                    </span>
                                                    <span className="font-bold text-slate-700 shrink-0">{sch.class_capacity} Mhs</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Modal Plotting Jadwal Baru */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                                    Plotting Jadwal Kelas Kuliah
                                </h3>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
                                    Batal
                                </button>
                            </div>

                            <form onSubmit={handleSubmitSchedule} className="space-y-4 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Pilih Kelas Mata Kuliah:</label>
                                    <select
                                        value={form.data.course_class_id}
                                        onChange={(e) => handleFormChange('course_class_id', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                                        required
                                    >
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.course_code} - {c.course_name} ({c.name}) • {c.credits} SKS
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Ruangan Kelas:</label>
                                        <select
                                            value={form.data.room_id}
                                            onChange={(e) => handleFormChange('room_id', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                                            required
                                        >
                                            {rooms.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.code} - {r.name} ({r.capacity} kursi)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Hari Kuliah:</label>
                                        <select
                                            value={form.data.day_of_week}
                                            onChange={(e) => handleFormChange('day_of_week', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                                            required
                                        >
                                            {DAYS.map((d) => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Jam Mulai (WIB):</label>
                                        <input
                                            type="time"
                                            value={form.data.start_time}
                                            onChange={(e) => handleFormChange('start_time', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Jam Selesai (WIB):</label>
                                        <input
                                            type="time"
                                            value={form.data.end_time}
                                            onChange={(e) => handleFormChange('end_time', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Realtime Anti-Clash Alert in Modal */}
                                {clashCheckResult && (
                                    <div className={`p-3 rounded-xl border text-xs ${
                                        clashCheckResult.has_conflict
                                            ? 'bg-red-50 border-red-300 text-red-900'
                                            : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                    }`}>
                                        <div className="flex items-center space-x-2 font-bold">
                                            {clashCheckResult.has_conflict ? (
                                                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                                            ) : (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            )}
                                            <span>{clashCheckResult.message}</span>
                                        </div>
                                        {clashCheckResult.has_conflict && (
                                            <div className="mt-2 pt-2 border-t border-red-200 flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="override_clash"
                                                    checked={form.data.allow_clash_override}
                                                    onChange={(e) => form.setData('allow_clash_override', e.target.checked)}
                                                    className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                                                />
                                                <label htmlFor="override_clash" className="font-bold text-red-800 cursor-pointer">
                                                    Paksa simpan meskipun terdeteksi bentrok (Override)
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={form.processing || (clashCheckResult?.has_conflict && !form.data.allow_clash_override)}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs disabled:opacity-50"
                                    >
                                        {form.processing ? 'Menyimpan...' : 'Simpan Jadwal Kuliah'}
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
