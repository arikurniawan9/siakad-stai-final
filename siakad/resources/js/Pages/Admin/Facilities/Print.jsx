import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Printer, ArrowLeft, Download, Building2, QrCode, CheckCircle2, DoorOpen, ChevronDown } from 'lucide-react';
import { ROOM_TYPES, ROOM_TYPE_GROUPS, getRoomTypeName } from './Index';

export default function FacilityPrint({ 
    rooms = [], 
    buildings = [], 
    activePeriod, 
    filters = {}, 
    signatory = {} 
}) {
    const handlePrint = () => {
        window.print();
    };

    const handleFilterBuilding = (bId) => {
        router.get('/admin/facilities/print-pdf', { 
            building_id: bId, 
            room_type: filters.room_type || '', 
            status: filters.status || '' 
        }, { preserveState: true });
    };

    const handleFilterType = (type) => {
        router.get('/admin/facilities/print-pdf', { 
            building_id: filters.building_id || '', 
            room_type: type, 
            status: filters.status || '' 
        }, { preserveState: true });
    };

    const currentBuilding = buildings.find(b => String(b.id) === String(filters.building_id));
    const totalCapacity = rooms.reduce((sum, r) => sum + (Number(r.capacity) || 0), 0);
    const totalExamCapacity = rooms.reduce((sum, r) => sum + (Number(r.exam_capacity) || 0), 0);

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white text-slate-900 font-sans p-4 sm:p-8 print:p-0">
            <Head title="Cetak Inventaris Gedung & Ruang Kelas" />

            {/* TOP ACTION & CONTROLS NAVBAR (Hidden on print) */}
            <div className="max-w-5xl mx-auto mb-6 bg-white rounded-2xl p-4 shadow-xs border border-slate-200 print:hidden space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/admin/facilities"
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center space-x-1 text-xs font-bold"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali ke Gedung & Ruang</span>
                        </Link>
                        <div>
                            <h2 className="text-sm font-black text-slate-900">Format Cetak Dokumen Inventaris Ruang Kelas</h2>
                            <p className="text-[11px] text-slate-500">Standar Resmi Kop Surat STAI Al-Ittihad Cianjur</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <a
                            href={`/admin/facilities/export-excel?building_id=${encodeURIComponent(filters.building_id || '')}&room_type=${encodeURIComponent(filters.room_type || '')}&status=${encodeURIComponent(filters.status || '')}`}
                            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh Excel</span>
                        </a>

                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-xs cursor-pointer"
                        >
                            <Printer className="w-4 h-4 text-emerald-400" />
                            <span>Cetak Sekarang / Simpan PDF</span>
                        </button>
                    </div>
                </div>

                {/* Filter Switcher Bar */}
                <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    {/* Gedung Filter */}
                    <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                        <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center space-x-1 shrink-0">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>Pilih Gedung:</span>
                        </span>
                        <button
                            type="button"
                            onClick={() => handleFilterBuilding('')}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition shrink-0 cursor-pointer ${
                                !filters.building_id
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            Semua Gedung
                        </button>
                        {buildings.map((b) => (
                            <button
                                key={b.id}
                                type="button"
                                onClick={() => handleFilterBuilding(b.id)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition shrink-0 cursor-pointer ${
                                    String(filters.building_id) === String(b.id)
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                {b.name}
                            </button>
                        ))}
                    </div>

                    {/* Tipe Ruang Filter */}
                    <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-[11px] font-bold text-slate-400">Tipe Ruang:</span>
                        <div className="relative">
                            <select
                                value={filters.room_type || ''}
                                onChange={(e) => handleFilterType(e.target.value)}
                                className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg pl-2.5 pr-7 py-1 text-xs font-bold text-slate-800 focus:bg-white appearance-none cursor-pointer"
                            >
                                <option value="">Semua Tipe Ruang ({ROOM_TYPES.length})</option>
                                {ROOM_TYPE_GROUPS.map((group) => (
                                    <optgroup key={group.category} label={`── ${group.category} ──`} className="font-bold text-slate-900 bg-slate-100">
                                        {group.types.map((t) => (
                                            <option key={t.value} value={t.value} className="bg-white text-slate-800 font-medium">
                                                {t.label}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* PRINTABLE DOCUMENT SHEET */}
            <div className="max-w-5xl mx-auto bg-white rounded-2xl print:rounded-none border border-slate-300 print:border-none p-8 sm:p-12 print:p-2 shadow-md print:shadow-none space-y-6">
                
                {/* 1. KOP SURAT RESMI INSTITUSI */}
                <div className="border-b-2 border-double border-slate-900 pb-4 flex items-center space-x-4">
                    <img 
                        src="/logostai.png" 
                        alt="Logo STAI Al-Ittihad" 
                        className="w-16 h-16 object-contain shrink-0" 
                    />
                    <div className="text-center flex-1 space-y-0.5">
                        <h2 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                            YAYASAN PENDIDIKAN ISLAM AL-ITTIHAD CIANJUR
                        </h2>
                        <h1 className="text-base sm:text-xl font-black uppercase text-slate-950 tracking-wide font-serif">
                            SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD
                        </h1>
                        <p className="text-xs font-bold text-emerald-900">
                            BAGIAN SARANA & PRASARANA INFRASTRUKTUR KAMPUS
                        </p>
                        <p className="text-[10px] text-slate-600 font-sans">
                            SK Kemenag RI No. Dj.I/257/2010 • Terakreditasi BAN-PT • Jl. Raya Bandung Km. 03 Bojong, Karangtengah, Cianjur 43281
                        </p>
                        <p className="text-[9px] text-slate-500 font-sans">
                            Telp: (0263) 228192 • Website: www.staialittihad.ac.id • Email: sarpras@staialittihad.ac.id
                        </p>
                    </div>
                    <div className="w-16 shrink-0 hidden sm:block"></div>
                </div>

                {/* 2. JUDUL DOKUMEN */}
                <div className="text-center space-y-1">
                    <h2 className="text-sm sm:text-base font-black uppercase tracking-widest text-slate-950 underline font-serif">
                        DAFTAR INVENTARIS SARANA GEDUNG & RUANG KELAS PERKULIAHAN
                    </h2>
                    <p className="text-xs font-bold text-slate-700 font-sans">
                        TAHUN AKADEMIK {activePeriod?.name || '2026/2027 GANJIL'}
                    </p>
                </div>

                {/* 3. METADATA SUMMARY */}
                <div className="bg-slate-50 print:bg-slate-50/50 p-3 rounded-xl border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Gedung Kampus:</span>
                        <p className="font-bold text-slate-900 truncate">{currentBuilding ? currentBuilding.name : 'Semua Gedung'}</p>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Tipe Ruangan:</span>
                        <p className="font-bold text-slate-900">{filters.room_type || 'Semua Tipe'}</p>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Total Ruangan / Kapasitas:</span>
                        <p className="font-bold text-emerald-800">{rooms.length} Ruang ({totalCapacity} Kursi)</p>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Tanggal Cetak:</span>
                        <p className="font-mono text-[11px] text-slate-700">{signatory.date || new Date().toLocaleDateString('id-ID')}</p>
                    </div>
                </div>

                {/* 4. TABEL DAFTAR RUANGAN */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs border border-slate-300">
                        <thead>
                            <tr className="bg-slate-100 print:bg-slate-200 text-slate-800 font-bold uppercase text-[9.5px] border-b border-slate-300">
                                <th className="py-2.5 px-2 text-center border-r border-slate-300 w-8">No</th>
                                <th className="py-2.5 px-2.5 text-center border-r border-slate-300 w-24">Kode Ruang</th>
                                <th className="py-2.5 px-3 border-r border-slate-300">Nama Ruang Kelas</th>
                                <th className="py-2.5 px-3 border-r border-slate-300">Gedung Kampus</th>
                                <th className="py-2.5 px-2 text-center border-r border-slate-300 w-16">Lantai</th>
                                <th className="py-2.5 px-2.5 text-center border-r border-slate-300 w-28">Tipe</th>
                                <th className="py-2.5 px-2 text-center border-r border-slate-300 w-20">Kuliah</th>
                                <th className="py-2.5 px-2 text-center border-r border-slate-300 w-20">Ujian</th>
                                <th className="py-2.5 px-3 border-r border-slate-300">Fasilitas Inventaris</th>
                                <th className="py-2.5 px-2 text-center w-22">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {rooms && rooms.length > 0 ? (
                                rooms.map((r, idx) => (
                                    <tr key={r.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70 print:bg-slate-50/40'}>
                                        <td className="py-2 px-2 text-center border-r border-slate-300 font-mono text-[11px]">{idx + 1}</td>
                                        <td className="py-2 px-2.5 text-center border-r border-slate-300 font-mono font-bold text-slate-900">{r.code}</td>
                                        <td className="py-2 px-3 border-r border-slate-300 font-bold text-slate-900">{r.name}</td>
                                        <td className="py-2 px-3 border-r border-slate-300 text-slate-700">{r.building_name}</td>
                                        <td className="py-2 px-2 text-center border-r border-slate-300 font-semibold text-slate-700">Lt. {r.floor_number}</td>
                                        <td className="py-2 px-2.5 text-center border-r border-slate-300">
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                {r.room_type_name || getRoomTypeName(r.room_type)}
                                            </span>
                                        </td>
                                        <td className="py-2 px-2 text-center border-r border-slate-300 font-bold text-slate-900">{r.capacity}</td>
                                        <td className="py-2 px-2 text-center border-r border-slate-300 font-semibold text-emerald-800">{r.exam_capacity || '-'}</td>
                                        <td className="py-2 px-3 border-r border-slate-300 text-[11px] text-slate-600">
                                            {Array.isArray(r.facilities) && r.facilities.length > 0 ? r.facilities.join(', ') : '-'}
                                        </td>
                                        <td className="py-2 px-2 text-center">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                                r.is_active 
                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' 
                                                    : 'bg-rose-50 text-rose-800 border border-rose-300'
                                            }`}>
                                                {r.is_active ? 'Siap Pakai' : 'Perbaikan'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={10} className="py-6 text-center text-slate-400 italic">
                                        Tidak ada data ruangan untuk kriteria filter yang dipilih.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {rooms.length > 0 && (
                            <tfoot>
                                <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300 text-xs">
                                    <td colSpan={6} className="py-2.5 px-3 text-right uppercase border-r border-slate-300">
                                        Total Kapasitas Kursi:
                                    </td>
                                    <td className="py-2.5 px-2 text-center border-r border-slate-300 text-emerald-900 font-black">
                                        {totalCapacity} Kursi
                                    </td>
                                    <td className="py-2.5 px-2 text-center border-r border-slate-300 text-emerald-900 font-black">
                                        {totalExamCapacity} Kursi
                                    </td>
                                    <td colSpan={2} className="py-2.5 px-3 text-slate-600 text-[11px] font-normal">
                                        {rooms.length} unit ruang terverifikasi
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {/* 5. TANDA TANGAN & PENGESAHAN RESMI */}
                <div className="pt-6 grid grid-cols-2 gap-6 text-xs text-slate-800">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                            <QrCode className="w-5 h-5 text-emerald-700" />
                            <span className="text-[11px]">Verifikasi Sistem Validasi Digital</span>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[10px] text-slate-600 font-mono">
                            <p>DOC-ID: STAII-FAC-{Date.now().toString(36).toUpperCase()}</p>
                            <p>VALIDITY: RESMI KAMPUS STAI AL-ITTIHAD</p>
                            <p className="text-emerald-700 font-bold">✓ INTEGRATED SIAKAD INFRASTRUCTURE</p>
                        </div>
                    </div>

                    <div className="text-right space-y-1">
                        <p className="text-[11px] text-slate-600">
                            {signatory.city || 'Cianjur'}, {signatory.date || new Date().toLocaleDateString('id-ID')}
                        </p>
                        <p className="font-bold text-slate-900 uppercase">
                            {signatory.title || 'Kepala Bagian Sarana & Prasarana'}
                        </p>
                        
                        <div className="h-16 flex items-center justify-end pr-4">
                            <div className="w-20 h-10 border border-dashed border-emerald-400 rounded flex items-center justify-center text-[9px] text-emerald-700 font-bold transform -rotate-3 bg-emerald-50/50">
                                [ CAP RESMI ]
                            </div>
                        </div>

                        <p className="font-black text-slate-950 underline tracking-wide">
                            {signatory.name || 'H. Ahmad Fauzi, S.Ag., M.Pd.I.'}
                        </p>
                        <p className="text-[10px] text-slate-600 font-mono">
                            NIP. {signatory.nip || '19790514 200501 1 003'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
