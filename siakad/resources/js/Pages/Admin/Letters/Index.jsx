import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    FileText, Plus, Search, Printer, CheckCircle2, 
    QrCode, ExternalLink, User, Calendar, ShieldCheck
} from 'lucide-react';

export default function LettersIndex({ activePeriod, letters = [], students = [] }) {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');

    const form = useForm({
        student_id: students[0]?.id || '',
        purpose: 'Persyaratan Pengajuan Beasiswa Prestasi Kemenag RI',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post('/admin/letters', {
            onSuccess: () => {
                setShowModal(false);
                form.reset();
            },
        });
    };

    const filteredLetters = letters.filter(l => 
        l.student_name?.toLowerCase().includes(search.toLowerCase()) ||
        l.student_nim?.toLowerCase().includes(search.toLowerCase()) ||
        l.letter_number?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AppLayout title="Surat Keterangan Aktif Kuliah">
            <Head title="Surat Keterangan — SIAKAD" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Penerbitan Surat Keterangan Aktif Kuliah</h2>
                        <p className="text-xs text-slate-500">
                            Layanan penerbitan surat resmi digital dengan tanda tangan elektronik & QR Code verifikasi publik.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Terbitkan Surat Baru</span>
                    </button>
                </div>

                {/* Filter / Search Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nomor surat, nama mahasiswa, atau NIM..."
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                        {letters.length} Dokumen Diterbitkan
                    </span>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-4">Nomor Surat</th>
                                    <th className="py-3 px-4">Mahasiswa</th>
                                    <th className="py-3 px-4">Program Studi</th>
                                    <th className="py-3 px-4">Keperluan Surat</th>
                                    <th className="py-3 px-4">Tanggal Terbit</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLetters.map((l) => (
                                    <tr key={l.id} className="hover:bg-slate-50 transition">
                                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                            {l.letter_number}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-black text-slate-900">{l.student_name}</p>
                                            <p className="text-[11px] font-mono text-slate-500">NIM: {l.student_nim}</p>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 font-medium">
                                            {l.study_program}
                                        </td>
                                        <td className="py-3 px-4 text-slate-700 max-w-xs">
                                            {l.purpose}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                                            {l.issue_date}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end space-x-1.5">
                                                <Link
                                                    href={`/admin/letters/${l.id}`}
                                                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold transition flex items-center space-x-1"
                                                >
                                                    <Printer className="w-3.5 h-3.5" />
                                                    <span>Lihat / Cetak</span>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL TERBITKAN SURAT */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-900 uppercase">Terbitkan Surat Keterangan Aktif</h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Batal</button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Pilih Mahasiswa:</label>
                                    <select
                                        value={form.data.student_id}
                                        onChange={(e) => form.setData('student_id', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                                        required
                                    >
                                        {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.nim}) - {s.study_program}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Keperluan / Tujuan Surat:</label>
                                    <textarea
                                        value={form.data.purpose}
                                        onChange={(e) => form.setData('purpose', e.target.value)}
                                        rows={3}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                                        placeholder="Contoh: Persyaratan Pengajuan Beasiswa / Tunjangan Gaji Orang Tua / Syarat Lamaran Magang"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Batal</button>
                                    <button type="submit" disabled={form.processing} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold">Terbitkan Surat</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
