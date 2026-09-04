import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    FileCheck, BookOpen, GraduationCap, FileText, Search, 
    Plus, Eye, CheckCircle2, X, Printer, Sparkles, Award, 
    Calendar, Users, ShieldCheck, Check, Clock, Edit3, Trash2
} from 'lucide-react';

export default function GraduationsIndex({ 
    theses = [], 
    yudisiumPeriods = [], 
    yudisiumApplicants = [], 
    sklLetters = [],
    studyPrograms = [],
    lecturers = [],
    activePeriod,
    stats = {},
    currentTab = 'thesis',
    filters = {}
}) {
    const [activeTab, setActiveTab] = useState(currentTab || 'thesis');
    const [search, setSearch] = useState(filters.search || '');
    const [prodiFilter, setProdiFilter] = useState(filters.study_program || '');

    // Modal Form Thesis
    const [isThesisModalOpen, setIsThesisModalOpen] = useState(false);
    const [selectedThesis, setSelectedThesis] = useState(null);

    const thesisForm = useForm({
        student_id: '',
        title: '',
        abstract: '',
        advisor_1_id: '',
        advisor_2_id: '',
        status: 'PENGAJUAN',
        defense_date: '',
        defense_room: '',
        score: '',
        grade_letter: '',
        sk_number: '',
    });

    const handleOpenCreateThesis = () => {
        thesisForm.reset();
        setSelectedThesis(null);
        setIsThesisModalOpen(true);
    };

    const handleOpenEditThesis = (t) => {
        setSelectedThesis(t);
        thesisForm.setData({
            student_id: t.student_id,
            title: t.title,
            abstract: t.abstract || '',
            advisor_1_id: t.advisor_1_id || '',
            advisor_2_id: t.advisor_2_id || '',
            status: t.status || 'PENGAJUAN',
            defense_date: t.defense_date || '',
            defense_room: t.defense_room || '',
            score: t.score || '',
            grade_letter: t.grade_letter || '',
            sk_number: t.sk_number || '',
        });
        setIsThesisModalOpen(true);
    };

    const handleSaveThesis = (e) => {
        e.preventDefault();
        thesisForm.post('/admin/graduations/thesis', {
            preserveScroll: true,
            onSuccess: () => {
                setIsThesisModalOpen(false);
                thesisForm.reset();
            }
        });
    };

    return (
        <AppLayout title="Kelulusan & Tugas Akhir">
            <Head title="Kelulusan & Tugas Akhir" />

            <div className="space-y-3.5">
                {/* 1. HERO HEADER */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative border border-slate-700/50 z-20">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-black mb-1">
                                <Sparkles className="w-3 h-3 text-teal-400" />
                                <span>AKADEMIK & KELULUSAN</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                                Manajemen Kelulusan & Tugas Akhir
                            </h2>
                        </div>

                        {activeTab === 'thesis' && (
                            <button
                                type="button"
                                onClick={handleOpenCreateThesis}
                                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer self-start md:self-auto"
                            >
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Input Tugas Akhir</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. STATS CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Total Skripsi/TA</span>
                        <p className="text-base font-black text-slate-900 mt-1">{stats.total_thesis || 0} Judul</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Lulus Munaqasyah</span>
                        <p className="text-base font-black text-emerald-700 mt-1">{stats.thesis_passed || 0} Mahasiswa</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-blue-600 uppercase">Peserta Wisuda</span>
                        <p className="text-base font-black text-blue-700 mt-1">{stats.total_yudisium || 0} Wisudawan</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-purple-600 uppercase">SKL Diterbitkan</span>
                        <p className="text-base font-black text-purple-700 mt-1">{stats.total_skl || 0} Lembar</p>
                    </div>
                </div>

                {/* 3. TABS SWITCHER KELULUSAN (3 Sub-tab: Tugas Akhir, Wisuda, SKL) */}
                <div className="flex border-b border-slate-200 space-x-2 sm:space-x-6 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('thesis')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                            activeTab === 'thesis' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Tugas Akhir / Skripsi</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 font-bold">{theses.length}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('graduation')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                            activeTab === 'graduation' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <GraduationCap className="w-4 h-4" />
                        <span>Wisuda & Yudisium</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 font-bold">{yudisiumApplicants.length}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('skl')}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                            activeTab === 'skl' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>Surat Keterangan Lulus (SKL)</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 font-bold">{sklLetters.length}</span>
                    </button>
                </div>

                {/* TAB CONTENT: 1. TUGAS AKHIR */}
                {activeTab === 'thesis' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700">Daftar Judul Skripsi & Pembimbing</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-800 text-white font-bold uppercase tracking-wider text-[11px]">
                                        <th className="py-3 px-3 text-center w-12 border-r border-slate-700">No.</th>
                                        <th className="py-3 px-3 text-center w-20 border-r border-slate-700">Aksi</th>
                                        <th className="py-3 px-3 border-r border-slate-700">NIM & Mahasiswa</th>
                                        <th className="py-3 px-3 border-r border-slate-700">Judul Skripsi / Tugas Akhir</th>
                                        <th className="py-3 px-3 border-r border-slate-700">Dosen Pembimbing</th>
                                        <th className="py-3 px-3 text-center w-28">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {theses.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-12 text-center text-slate-400">
                                                Belum ada data pendaftaran skripsi. Klik "Input Tugas Akhir" untuk menambahkan data.
                                            </td>
                                        </tr>
                                    ) : (
                                        theses.map((t, idx) => (
                                            <tr key={t.id} className="hover:bg-slate-50">
                                                <td className="py-2.5 px-3 text-center font-bold text-slate-400 border-r border-slate-100">{idx + 1}</td>
                                                <td className="py-2.5 px-3 text-center border-r border-slate-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditThesis(t)}
                                                        className="p-1 text-teal-600 hover:bg-teal-50 rounded"
                                                        title="Edit / Update Status Skripsi"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                                <td className="py-2.5 px-3 border-r border-slate-100">
                                                    <span className="font-mono font-bold text-slate-800 block">{t.student_nim}</span>
                                                    <span className="font-bold text-slate-900">{t.student_name}</span>
                                                </td>
                                                <td className="py-2.5 px-3 border-r border-slate-100 font-medium text-slate-800">
                                                    {t.title}
                                                </td>
                                                <td className="py-2.5 px-3 border-r border-slate-100 text-[11px] text-slate-600">
                                                    <div>1. {t.advisor_1_name || '-'}</div>
                                                    <div>2. {t.advisor_2_name || '-'}</div>
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                        t.status === 'LULUS' ? 'bg-emerald-100 text-emerald-800' :
                                                        t.status === 'MUNAQASYAH' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {t.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB CONTENT: 2. WISUDA & YUDISIUM */}
                {activeTab === 'graduation' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700">Daftar Calon Wisudawan & Peserta Yudisium</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-800 text-white font-bold uppercase tracking-wider text-[11px]">
                                        <th className="py-3 px-3 text-center w-12 border-r border-slate-700">No.</th>
                                        <th className="py-3 px-3 border-r border-slate-700">NIM & Mahasiswa</th>
                                        <th className="py-3 px-3 border-r border-slate-700">Program Studi</th>
                                        <th className="py-3 px-3 border-r border-slate-700">Periode Wisuda</th>
                                        <th className="py-3 px-3 text-center w-20 border-r border-slate-700">IPK</th>
                                        <th className="py-3 px-3 text-center w-28">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {yudisiumApplicants.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-12 text-center text-slate-400">
                                                Belum ada pendaftar wisuda / yudisium pada periode ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        yudisiumApplicants.map((app, idx) => (
                                            <tr key={app.id} className="hover:bg-slate-50">
                                                <td className="py-2.5 px-3 text-center font-bold text-slate-400 border-r border-slate-100">{idx + 1}</td>
                                                <td className="py-2.5 px-3 border-r border-slate-100">
                                                    <span className="font-mono font-bold text-slate-800 block">{app.student_nim}</span>
                                                    <span className="font-bold text-slate-900">{app.student_name}</span>
                                                </td>
                                                <td className="py-2.5 px-3 border-r border-slate-100">{app.study_program}</td>
                                                <td className="py-2.5 px-3 border-r border-slate-100 font-medium">{app.period_name}</td>
                                                <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700 border-r border-slate-100">
                                                    {Number(app.final_gpa || 0).toFixed(2)}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                        {app.status || 'TERVERIFIKASI'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB CONTENT: 3. SURAT KETERANGAN LULUS (SKL) */}
                {activeTab === 'skl' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700">Penerbitan Surat Keterangan Lulus (SKL) Resmi</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-800 text-white font-bold uppercase tracking-wider text-[11px]">
                                        <th className="py-3 px-3 text-center w-12 border-r border-slate-700">No.</th>
                                        <th className="py-3 px-3 text-center w-28 border-r border-slate-700">Aksi</th>
                                        <th className="py-3 px-3 border-r border-slate-700">NIM & Mahasiswa</th>
                                        <th className="py-3 px-3 border-r border-slate-700">Program Studi</th>
                                        <th className="py-3 px-3 text-center w-20 border-r border-slate-700">IPK</th>
                                        <th className="py-3 px-3 text-center w-36">Predikat</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {sklLetters.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-12 text-center text-slate-400">
                                                Belum ada data kelulusan yang siap diterbitkan SKL.
                                            </td>
                                        </tr>
                                    ) : (
                                        sklLetters.map((skl, idx) => (
                                            <tr key={skl.id} className="hover:bg-slate-50">
                                                <td className="py-2.5 px-3 text-center font-bold text-slate-400 border-r border-slate-100">{idx + 1}</td>
                                                <td className="py-2.5 px-3 text-center border-r border-slate-100">
                                                    <a
                                                        href={`/admin/graduations/skl/${skl.id}/print-pdf`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold inline-flex items-center space-x-1"
                                                    >
                                                        <Printer className="w-3.5 h-3.5" />
                                                        <span>Cetak SKL</span>
                                                    </a>
                                                </td>
                                                <td className="py-2.5 px-3 border-r border-slate-100">
                                                    <span className="font-mono font-bold text-slate-800 block">{skl.student_nim}</span>
                                                    <span className="font-bold text-slate-900">{skl.student_name}</span>
                                                </td>
                                                <td className="py-2.5 px-3 border-r border-slate-100">{skl.study_program}</td>
                                                <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700 border-r border-slate-100">
                                                    {Number(skl.final_gpa || 0).toFixed(2)}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900">
                                                        {skl.predicate || 'Sangat Memuaskan'}
                                                    </span>
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

            {/* MODAL INPUT / EDIT TUGAS AKHIR */}
            {isThesisModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp">
                        <div className="bg-gradient-to-r from-slate-900 to-teal-950 p-4 text-white flex justify-between items-center">
                            <h3 className="text-sm font-black">Input / Perbarui Data Tugas Akhir (Skripsi)</h3>
                            <button onClick={() => setIsThesisModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveThesis} className="p-4 space-y-3">
                            <div>
                                <label className="text-[11px] font-bold text-slate-700">User ID Mahasiswa *</label>
                                <input
                                    type="number"
                                    value={thesisForm.data.student_id}
                                    onChange={(e) => thesisForm.setData('student_id', e.target.value)}
                                    placeholder="Contoh: 15"
                                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-700">Judul Skripsi / Penelitian *</label>
                                <textarea
                                    value={thesisForm.data.title}
                                    onChange={(e) => thesisForm.setData('title', e.target.value)}
                                    rows="3"
                                    placeholder="Tuliskan judul skripsi lengkap..."
                                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700">Dosen Pembimbing 1</label>
                                    <select
                                        value={thesisForm.data.advisor_1_id}
                                        onChange={(e) => thesisForm.setData('advisor_1_id', e.target.value)}
                                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                    >
                                        <option value="">-- Pilih Dosen --</option>
                                        {lecturers.map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700">Dosen Pembimbing 2</label>
                                    <select
                                        value={thesisForm.data.advisor_2_id}
                                        onChange={(e) => thesisForm.setData('advisor_2_id', e.target.value)}
                                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                    >
                                        <option value="">-- Pilih Dosen --</option>
                                        {lecturers.map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700">Status Skripsi</label>
                                    <select
                                        value={thesisForm.data.status}
                                        onChange={(e) => thesisForm.setData('status', e.target.value)}
                                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                    >
                                        <option value="PENGAJUAN">PENGAJUAN</option>
                                        <option value="PROPOSAL">SEMINAR PROPOSAL</option>
                                        <option value="PENELITIAN">PENELITIAN</option>
                                        <option value="MUNAQASYAH">SIDANG MUNAQASYAH</option>
                                        <option value="LULUS">LULUS</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700">Nilai Akhir (Skor)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={thesisForm.data.score}
                                        onChange={(e) => thesisForm.setData('score', e.target.value)}
                                        placeholder="Contoh: 88.50"
                                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsThesisModalOpen(false)}
                                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={thesisForm.processing}
                                    className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold"
                                >
                                    Simpan Data Skripsi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
