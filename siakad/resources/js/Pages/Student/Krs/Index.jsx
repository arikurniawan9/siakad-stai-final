import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    BookOpen, CheckCircle2, Clock, AlertTriangle, 
    ShieldAlert, CreditCard, ChevronRight, Check, Send 
} from 'lucide-react';

export default function KrsIndex({ activePeriod, isFinancialLocked, krsSubmission, selectedClassIds, offeredClasses, maxCreditsAllowed }) {
    const [selected, setSelected] = useState(selectedClassIds || []);
    const [processing, setProcessing] = useState(false);

    const toggleClass = (classId) => {
        if (krsSubmission?.status === 'DISETUJUI_PA') return;
        if (selected.includes(classId)) {
            setSelected(selected.filter((id) => id !== classId));
        } else {
            setSelected([...selected, classId]);
        }
    };

    // Kalkulasi total SKS terpilih
    const currentCredits = offeredClasses
        .filter((c) => selected.includes(c.id))
        .reduce((sum, c) => sum + (c.course_credits || 0), 0);

    const handleSubmitKrs = () => {
        if (selected.length === 0) {
            alert('Silakan centang minimal 1 mata kuliah.');
            return;
        }
        if (confirm(`Ajukan KRS dengan total ${currentCredits} SKS ke Dosen Pembimbing Akademik (PA)?`)) {
            setProcessing(true);
            router.post('/student/krs/submit', { class_ids: selected }, {
                onFinish: () => setProcessing(false),
            });
        }
    };

    return (
        <AppLayout title="Kartu Rencana Studi (KRS)">
            <Head title="KRS Online" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Kartu Rencana Studi (KRS Online)</h2>
                        <p className="text-xs text-slate-500">Pilih mata kuliah yang akan ditempuh pada {activePeriod?.name}.</p>
                    </div>
                </div>

                {/* 1. FINANCIAL LOCK ALERT IF UNPAID */}
                {isFinancialLocked && (
                    <div className="bg-rose-50 border border-rose-300 rounded-2xl p-5 text-rose-900 shadow-xs flex items-start space-x-4">
                        <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-2">
                            <h4 className="text-sm font-black text-rose-950">Akses Pengisian KRS Terkunci (Financial Lock Guard)</h4>
                            <p className="text-xs text-rose-800">
                                Anda memiliki tagihan SPP semester aktif yang belum terlunasi. Silakan selesaikan pembayaran melalui <strong>Virtual Account BSI</strong> untuk membuka akses pengisian KRS dan ujian.
                            </p>
                            <Link
                                href="/student/bills"
                                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow"
                            >
                                <CreditCard className="w-4 h-4" />
                                <span>Bayar Tagihan SPP via VA BSI →</span>
                            </Link>
                        </div>
                    </div>
                )}

                {/* 2. SKS PROGRESS & SUBMISSION STATUS BANNER */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 max-w-md">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-700">Beban SKS Terpilih:</span>
                            <span className="text-emerald-700">{currentCredits} / {maxCreditsAllowed} SKS</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    currentCredits > maxCreditsAllowed ? 'bg-rose-500' : 'bg-emerald-600'
                                }`}
                                style={{ width: `${Math.min((currentCredits / maxCreditsAllowed) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Status Pengajuan:</p>
                            <p className="text-xs font-black text-slate-900">
                                {krsSubmission?.status === 'DISETUJUI_PA' ? (
                                    <span className="text-emerald-600 font-extrabold flex items-center space-x-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>DISETUJUI DOSEN PA</span>
                                    </span>
                                ) : krsSubmission?.status === 'DIAJUKAN' ? (
                                    <span className="text-blue-600 font-bold flex items-center space-x-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>MENUNGGU APPROVAL PA</span>
                                    </span>
                                ) : (
                                    <span className="text-amber-600 font-bold">DRAFT BELUM DIAJUKAN</span>
                                )}
                            </p>
                        </div>

                        {!isFinancialLocked && krsSubmission?.status !== 'DISETUJUI_PA' && (
                            <button
                                type="button"
                                disabled={processing || selected.length === 0}
                                onClick={handleSubmitKrs}
                                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow flex items-center space-x-1.5 disabled:opacity-50"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{processing ? 'Menyimpan...' : 'Ajukan KRS ke Dosen PA'}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* 3. OFFERED CLASSES TABLE */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Daftar Mata Kuliah Ditawarkan</h3>
                        <span className="text-xs text-slate-500 font-medium">Centang untuk memasukkan ke kartu rencana studi</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-3 px-4 text-center w-12">Pilih</th>
                                    <th className="py-3 px-4">Mata Kuliah</th>
                                    <th className="py-3 px-4">Kelas</th>
                                    <th className="py-3 px-4 text-center">SKS</th>
                                    <th className="py-3 px-4">Dosen Pengampu</th>
                                    <th className="py-3 px-4">Jadwal & Ruangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {offeredClasses.map((cls) => {
                                    const isChecked = selected.includes(cls.id);
                                    return (
                                        <tr
                                            key={cls.id}
                                            onClick={() => !isFinancialLocked && toggleClass(cls.id)}
                                            className={`cursor-pointer transition ${
                                                isChecked ? 'bg-emerald-50/70 hover:bg-emerald-50' : 'hover:bg-slate-50'
                                            }`}
                                        >
                                            <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    disabled={isFinancialLocked || krsSubmission?.status === 'DISETUJUI_PA'}
                                                    checked={isChecked}
                                                    onChange={() => toggleClass(cls.id)}
                                                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-bold text-slate-900">{cls.course_name}</p>
                                                <p className="text-[11px] font-mono text-slate-500">{cls.course_code} • Semester {cls.semester_level}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-800 text-[11px]">
                                                    {cls.name}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center font-black text-emerald-800">
                                                {cls.course_credits} SKS
                                            </td>
                                            <td className="py-3 px-4 text-slate-700 font-medium">
                                                {cls.lecturer_name || 'Dr. H. M. Ridwan, M.Ag'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-bold text-slate-800">{cls.day_of_week || 'SENIN'}, {cls.start_time?.slice(0, 5)} - {cls.end_time?.slice(0, 5)} WIB</p>
                                                <p className="text-[11px] text-slate-500">{cls.room_name || 'Ruang Kuliah 101'}</p>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
