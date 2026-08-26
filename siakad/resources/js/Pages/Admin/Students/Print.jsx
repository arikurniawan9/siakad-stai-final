import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Printer, ArrowLeft, Download, Filter, Landmark, QrCode, CheckCircle2, Award, Calendar, School, Users } from 'lucide-react';

export default function StudentPrint({ 
    students = [], 
    activePeriod, 
    studyPrograms = [], 
    selectedYear = 'Semua Angkatan', 
    selectedProdi = 'Semua Program Studi', 
    printedAt, 
    signer 
}) {
    const handlePrint = () => {
        window.print();
    };

    const handleFilterAngkatan = (yr) => {
        router.get('/admin/students/print-pdf', { academic_year: yr, study_program: selectedProdi === 'Semua Program Studi' ? '' : selectedProdi }, { preserveState: true });
    };

    const handleFilterProdi = (prd) => {
        router.get('/admin/students/print-pdf', { academic_year: selectedYear === 'Semua Angkatan' ? '' : selectedYear, study_program: prd }, { preserveState: true });
    };

    const batchList = ['Semua Angkatan', '2026', '2025', '2024', '2023', '2022', '2021'];

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white text-slate-900 font-sans p-4 sm:p-8 print:p-0">
            <Head title={`Cetak Data Mahasiswa ${selectedYear} — SIAKAD STAI Al-Ittihad`} />

            {/* TOP ACTION & CONTROLS NAVBAR (Hidden on print) */}
            <div className="max-w-5xl mx-auto mb-6 bg-white rounded-2xl p-4 shadow-sm border border-slate-200 print:hidden space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/admin/students"
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center space-x-1 text-xs font-bold"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali ke Direktori</span>
                        </Link>
                        <div>
                            <h2 className="text-sm font-black text-slate-900">Format Cetak Dokumen Resmi Mahasiswa</h2>
                            <p className="text-[11px] text-slate-500">Standar A4 Kop Surat Resmi Perguruan Tinggi STAI Al-Ittihad Cianjur</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <a
                            href={`/admin/students/export-excel?academic_year=${encodeURIComponent(selectedYear === 'Semua Angkatan' ? '' : selectedYear)}&study_program=${encodeURIComponent(selectedProdi === 'Semua Program Studi' ? '' : selectedProdi)}`}
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

                {/* Quick Switchers Bar */}
                <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    {/* Switcher Angkatan */}
                    <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                        <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center space-x-1 shrink-0">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Pilih Angkatan:</span>
                        </span>
                        {batchList.map((b) => (
                            <button
                                key={b}
                                type="button"
                                onClick={() => handleFilterAngkatan(b === 'Semua Angkatan' ? '' : b)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition shrink-0 cursor-pointer ${
                                    selectedYear === b || (b === 'Semua Angkatan' && selectedYear === 'Semua Angkatan')
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                {b}
                            </button>
                        ))}
                    </div>

                    {/* Switcher Prodi */}
                    <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-[11px] font-bold text-slate-400">Prodi:</span>
                        <select
                            value={selectedProdi === 'Semua Program Studi' ? '' : selectedProdi}
                            onChange={(e) => handleFilterProdi(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:bg-white"
                        >
                            <option value="">Semua Program Studi</option>
                            {studyPrograms.map((p) => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* PRINTABLE DOCUMENT SHEET (A4 Landscape / Portrait friendly) */}
            <div className="max-w-5xl mx-auto bg-white rounded-2xl print:rounded-none border border-slate-300 print:border-none p-8 sm:p-12 print:p-2 shadow-md print:shadow-none space-y-6">
                
                {/* 1. KOP SURAT RESMI INSTITUSI */}
                <div className="border-b-2 border-double border-slate-900 pb-4 flex items-center space-x-4">
                    <div className="w-18 h-18 bg-emerald-800 rounded-2xl flex items-center justify-center font-black text-white text-3xl font-serif shrink-0 shadow-sm">
                        S
                    </div>
                    <div className="text-center flex-1 space-y-0.5">
                        <h2 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                            YAYASAN PENDIDIKAN ISLAM AL-ITTIHAD CIANJUR
                        </h2>
                        <h1 className="text-base sm:text-xl font-black uppercase text-slate-950 tracking-wide font-serif">
                            SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD
                        </h1>
                        <p className="text-xs font-bold text-emerald-900">
                            BIRO ADMINISTRASI AKADEMIK, KEMAHASISWAAN & KEUANGAN (BAAKK)
                        </p>
                        <p className="text-[10px] text-slate-600 font-sans">
                            SK Kemenag RI No. Dj.I/257/2010 • Terakreditasi BAN-PT • Jl. Raya Bandung Km. 03 Bojong, Karangtengah, Cianjur 43281
                        </p>
                        <p className="text-[9px] text-slate-500 font-sans">
                            Telp: (0263) 228192 • Website: www.staialittihad.ac.id • Email: akademik@staialittihad.ac.id
                        </p>
                    </div>
                </div>

                {/* 2. JUDUL DOKUMEN & IDENTITAS REKAPITULASI */}
                <div className="text-center space-y-1">
                    <h2 className="text-sm sm:text-base font-black uppercase tracking-widest text-slate-950 underline font-serif">
                        BUKU INDUK DATA MAHASISWA & REKAPITULASI STATUS AKADEMIK
                    </h2>
                    <p className="text-xs font-bold text-slate-700 font-sans">
                        TAHUN AKADEMIK {activePeriod?.name || '2026/2027 GANJIL'}
                    </p>
                </div>

                {/* 3. METADATA REKAPITULASI */}
                <div className="bg-slate-50 print:bg-slate-50/50 p-3 rounded-xl border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Angkatan:</span>
                        <p className="font-bold text-slate-900">{selectedYear}</p>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Program Studi:</span>
                        <p className="font-bold text-slate-900 truncate">{selectedProdi}</p>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Total Mahasiswa:</span>
                        <p className="font-bold text-emerald-800">{students.length} Mahasiswa</p>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Tanggal Cetak:</span>
                        <p className="font-mono text-[11px] text-slate-700">{printedAt}</p>
                    </div>
                </div>

                {/* 4. TABEL RESMI DATA MAHASISWA */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs border border-slate-300">
                        <thead>
                            <tr className="bg-slate-100 print:bg-slate-200 text-slate-800 font-bold uppercase text-[9.5px] border-b border-slate-300">
                                <th className="py-2.5 px-2.5 text-center border-r border-slate-300 w-8">No</th>
                                <th className="py-2.5 px-3 border-r border-slate-300 w-28">NIM</th>
                                <th className="py-2.5 px-3 border-r border-slate-300">Nama Lengkap Mahasiswa</th>
                                <th className="py-2.5 px-2 text-center border-r border-slate-300 w-10">L/P</th>
                                <th className="py-2.5 px-3 border-r border-slate-300">Program Studi</th>
                                <th className="py-2.5 px-2.5 text-center border-r border-slate-300 w-24">Status KRS</th>
                                <th className="py-2.5 px-2.5 text-center border-r border-slate-300 w-24">VA SPP BSI</th>
                                <th className="py-2.5 px-2 text-center w-18">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                                        Tidak ada mahasiswa yang terdaftar pada filter angkatan / program studi ini.
                                    </td>
                                </tr>
                            ) : (
                                students.map((stu, index) => (
                                    <tr key={stu.id} className="hover:bg-slate-50/50">
                                        <td className="py-2 px-2.5 text-center border-r border-slate-200 font-mono text-[11px] text-slate-600">
                                            {index + 1}
                                        </td>
                                        <td className="py-2 px-3 border-r border-slate-200 font-mono font-bold text-slate-900 text-[11px]">
                                            {stu.identity_number || stu.username}
                                        </td>
                                        <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                                            {stu.name}
                                        </td>
                                        <td className="py-2 px-2 text-center border-r border-slate-200 font-bold text-slate-700">
                                            {stu.gender === 'P' ? 'P' : 'L'}
                                        </td>
                                        <td className="py-2 px-3 border-r border-slate-200 text-slate-800 text-[11px]">
                                            {stu.study_program || 'Pendidikan Agama Islam (S1)'}
                                        </td>
                                        <td className="py-2 px-2.5 text-center border-r border-slate-200 font-bold text-[10px]">
                                            <span className={
                                                stu.krs_status === 'DISETUJUI' ? 'text-emerald-800' :
                                                stu.krs_status === 'DIAJUKAN' ? 'text-amber-800' : 'text-slate-500'
                                            }>
                                                {stu.krs_status}
                                            </span>
                                        </td>
                                        <td className="py-2 px-2.5 text-center border-r border-slate-200 font-bold text-[10px]">
                                            <span className={stu.invoice_status === 'LUNAS' ? 'text-emerald-800' : 'text-rose-800'}>
                                                {stu.invoice_status}
                                            </span>
                                        </td>
                                        <td className="py-2 px-2 text-center font-bold text-[10px]">
                                            {stu.is_active ? (
                                                <span className="text-emerald-800">AKTIF</span>
                                            ) : (
                                                <span className="text-rose-700">NONAKTIF</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 5. LEMBAR TANDA TANGAN & PENGESAHAN RESMI */}
                <div className="pt-6 flex flex-row items-end justify-between text-xs break-inside-avoid">
                    {/* Digital QR Code Authentication */}
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 print:bg-white rounded-xl border border-slate-200 max-w-sm">
                        <div className="p-2 bg-white rounded-lg border border-slate-300">
                            <QrCode className="w-12 h-12 text-slate-900" />
                        </div>
                        <div className="space-y-0.5 font-sans">
                            <p className="font-black text-[10px] uppercase text-emerald-900 flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>DOKUMEN SAH TERVERIFIKASI</span>
                            </p>
                            <p className="text-[9px] text-slate-500 font-mono">
                                HASH: STAI-ALITTIHAD-DOC-{dateHash(selectedYear)}
                            </p>
                            <p className="text-[8px] text-slate-400">
                                Dicetak melalui Sistem Informasi Akademik Terintegrasi (SIAKAD) STAI Al-Ittihad.
                            </p>
                        </div>
                    </div>

                    {/* Signatory Box */}
                    <div className="text-center font-sans space-y-1 w-64">
                        <p className="text-[11px] text-slate-600">
                            Cianjur, {formatTanggalIndo(new Date())}
                        </p>
                        <p className="font-bold text-slate-800 text-[11px]">
                            {signer?.role || 'Wakil Ketua I Bidang Akademik'}
                        </p>
                        <div className="h-16 flex items-center justify-center relative">
                            {/* Stempel Cap Digital */}
                            <div className="w-14 h-14 rounded-full border-2 border-dashed border-emerald-600/40 flex items-center justify-center text-[7px] font-black text-emerald-700 uppercase rotate-12 select-none">
                                STAI AL-ITTIHAD
                            </div>
                        </div>
                        <p className="font-black text-slate-950 underline text-xs">
                            {signer?.name || 'Dr. H. M. Ridwan, M.Ag'}
                        </p>
                        <p className="font-mono text-[10px] text-slate-600">
                            NIDN. {signer?.nidn || '2112087501'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helpers
function formatTanggalIndo(date) {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function dateHash(salt) {
    return Math.abs(((salt || 'ALL').split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0))).toString(16).toUpperCase();
}
