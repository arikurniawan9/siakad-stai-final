import React, { useState, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import * as XLSX from 'xlsx';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Award, Lock, Unlock, Printer, Save, ArrowLeft, 
    CheckCircle2, AlertCircle, FileText, ChevronRight, BarChart2,
    FileSpreadsheet, Download, Upload, X, RefreshCw, Sparkles, Check
} from 'lucide-react';

export default function GradeShow({ 
    courseClass, 
    students = [], 
    distribution = {}, 
    isLocked = false,
    avgScore = 0,
    userRole = 'dosen'
}) {
    // Helper standard STAI Al-Ittihad grading calculation
    const calculateGrade = (att, asg, qz, mid, fin) => {
        const finalScore = Math.round(((att * 0.10) + (asg * 0.20) + (qz * 0.15) + (mid * 0.25) + (fin * 0.30)) * 100) / 100;
        let letter = 'E';
        let point = 0.00;
        if (finalScore >= 85) { letter = 'A'; point = 4.00; }
        else if (finalScore >= 80) { letter = 'A-'; point = 3.75; }
        else if (finalScore >= 75) { letter = 'B+'; point = 3.50; }
        else if (finalScore >= 70) { letter = 'B'; point = 3.00; }
        else if (finalScore >= 65) { letter = 'B-'; point = 2.75; }
        else if (finalScore >= 60) { letter = 'C+'; point = 2.50; }
        else if (finalScore >= 55) { letter = 'C'; point = 2.00; }
        else if (finalScore >= 45) { letter = 'D'; point = 1.00; }
        return { finalScore, letter, point };
    };

    const [gradesData, setGradesData] = useState(
        students.map((s) => {
            const att = Number(s.attendance_score) || 0;
            const asg = Number(s.assignment_score) || 0;
            const qz = Number(s.quiz_score) || 0;
            const mid = Number(s.mid_exam_score) || 0;
            const fin = Number(s.final_exam_score) || 0;
            const { finalScore, letter, point } = calculateGrade(att, asg, qz, mid, fin);

            return {
                krs_item_id: s.krs_item_id,
                student_id: s.student_id,
                student_name: s.student_name,
                student_nim: s.student_nim,
                attendance_score: att,
                assignment_score: asg,
                quiz_score: qz,
                mid_exam_score: mid,
                final_exam_score: fin,
                final_score: s.final_score > 0 ? Number(s.final_score) : finalScore,
                grade_letter: s.grade_letter && s.grade_letter !== '-' ? s.grade_letter : letter,
                grade_point: s.grade_point ? Number(s.grade_point) : point,
            };
        })
    );

    const [isSaving, setIsSaving] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [parsedImportRows, setParsedImportRows] = useState(null);
    const [importStats, setImportStats] = useState({ matched: 0, unmatched: 0 });
    const [importFileName, setImportFileName] = useState('');
    const fileInputRef = useRef(null);

    // Recalculate distribution dynamically from current state
    const currentDistribution = {
        'A': 0, 'A-': 0, 'B+': 0, 'B': 0,
        'B-': 0, 'C+': 0, 'C': 0, 'D': 0, 'E': 0
    };
    let totalScoreSum = 0;
    gradesData.forEach((g) => {
        if (currentDistribution[g.grade_letter] !== undefined) {
            currentDistribution[g.grade_letter]++;
        }
        totalScoreSum += g.final_score;
    });
    const currentAvgScore = gradesData.length > 0 ? (totalScoreSum / gradesData.length).toFixed(2) : 0;

    const handleScoreChange = (idx, field, val) => {
        const updated = [...gradesData];
        let numVal = parseFloat(val);
        if (isNaN(numVal)) numVal = 0;
        if (numVal < 0) numVal = 0;
        if (numVal > 100) numVal = 100;

        updated[idx][field] = numVal;

        const att = field === 'attendance_score' ? numVal : updated[idx].attendance_score;
        const asg = field === 'assignment_score' ? numVal : updated[idx].assignment_score;
        const qz = field === 'quiz_score' ? numVal : updated[idx].quiz_score;
        const mid = field === 'mid_exam_score' ? numVal : updated[idx].mid_exam_score;
        const fin = field === 'final_exam_score' ? numVal : updated[idx].final_exam_score;

        const { finalScore, letter, point } = calculateGrade(att, asg, qz, mid, fin);
        updated[idx].final_score = finalScore;
        updated[idx].grade_letter = letter;
        updated[idx].grade_point = point;

        setGradesData(updated);
    };

    const handleSaveGrades = (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        router.post(`/admin/grades/${courseClass.id}/update`, { grades: gradesData }, {
            onFinish: () => setIsSaving(false),
        });
    };

    const handleToggleLock = () => {
        const action = isLocked ? 'MEMBUKA KUNCI' : 'MENGUNCI (GRADE LOCK)';
        if (confirm(`Apakah Anda yakin ingin melakukan ${action} pada lembar nilai kelas ini?`)) {
            router.post(`/admin/grades/${courseClass.id}/toggle-lock`);
        }
    };

    // Process file upload (XLSX, XLS, CSV) using SheetJS
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImportFileName(file.name);
        const reader = new FileReader();

        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rawRows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

                const matched = [];
                let matchedCount = 0;
                let unmatchedCount = 0;

                rawRows.forEach((row) => {
                    const cleanRow = {};
                    Object.keys(row).forEach((k) => {
                        cleanRow[k.trim().toLowerCase().replace(/[\s\/-]/g, '_')] = row[k];
                    });

                    // Search for NIM key
                    const nimVal = String(
                        cleanRow.nim || 
                        cleanRow.student_nim || 
                        cleanRow.nomor_induk || 
                        cleanRow.identity_number || 
                        ''
                    ).trim();

                    const target = gradesData.find((s) => s.student_nim === nimVal);
                    if (target) {
                        matchedCount++;
                        const att = parseFloat(cleanRow.presensi_10 ?? cleanRow.presensi ?? cleanRow.kehadiran ?? cleanRow.attendance_score) || 0;
                        const asg = parseFloat(cleanRow.tugas_20 ?? cleanRow.tugas ?? cleanRow.assignment_score) || 0;
                        const qz = parseFloat(cleanRow.kuis_15 ?? cleanRow.kuis ?? cleanRow.quiz_score) || 0;
                        const mid = parseFloat(cleanRow.uts_25 ?? cleanRow.uts ?? cleanRow.mid_exam_score) || 0;
                        const fin = parseFloat(cleanRow.uas_30 ?? cleanRow.uas ?? cleanRow.final_exam_score) || 0;
                        const { finalScore, letter, point } = calculateGrade(att, asg, qz, mid, fin);

                        matched.push({
                            student_id: target.student_id,
                            student_name: target.student_name,
                            student_nim: target.student_nim,
                            attendance_score: att,
                            assignment_score: asg,
                            quiz_score: qz,
                            mid_exam_score: mid,
                            final_exam_score: fin,
                            final_score: finalScore,
                            grade_letter: letter,
                            grade_point: point,
                        });
                    } else if (nimVal) {
                        unmatchedCount++;
                    }
                });

                if (matched.length > 0) {
                    setParsedImportRows(matched);
                    setImportStats({ matched: matchedCount, unmatched: unmatchedCount });
                } else {
                    alert('Tidak ada mahasiswa di file Excel yang cocok dengan NIM kelas ini. Pastikan kolom NIM terisi dengan benar.');
                }
            } catch (err) {
                console.error(err);
                alert('Gagal membaca file Excel. Pastikan format file .xlsx, .xls, atau .csv valid.');
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleApplyImport = (saveImmediately = false) => {
        if (!parsedImportRows) return;

        const updated = gradesData.map((curr) => {
            const imported = parsedImportRows.find((p) => p.student_id === curr.student_id);
            return imported || curr;
        });

        setGradesData(updated);
        setImportModalOpen(false);
        setParsedImportRows(null);

        if (saveImmediately) {
            setIsSaving(true);
            router.post(`/admin/grades/${courseClass.id}/update`, { grades: updated }, {
                onFinish: () => setIsSaving(false),
            });
        } else {
            alert(`✅ Berhasil menerapkan ${parsedImportRows.length} nilai mahasiswa ke tabel. Silakan periksa dan klik "Simpan Nilai" untuk menyimpan permanen.`);
        }
    };

    return (
        <AppLayout title={`Lembar Nilai DPNA — ${courseClass.course_code}`}>
            <Head title={`DPNA ${courseClass.course_code} - ${courseClass.course_name}`} />

            <div className="space-y-5 max-w-6xl mx-auto">
                {/* 1. HEADER ACTIONS NAVBAR (Hidden on Print) */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/admin/grades"
                            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                                    {courseClass.course_code}
                                </span>
                                <h2 className="text-base sm:text-lg font-black text-slate-900">
                                    {courseClass.course_name} ({courseClass.name})
                                </h2>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Dosen: <strong>{courseClass.lecturer_name || 'Dr. H. M. Ridwan, M.Ag'}</strong> • {courseClass.credits} SKS • {courseClass.period_name} • {courseClass.room_name || 'Ruang Teori'}
                            </p>
                        </div>
                    </div>

                    {/* ACTION BUTTON GROUP */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Lock / Unlock Toggle */}
                        <button
                            onClick={handleToggleLock}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer ${
                                isLocked ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'
                            }`}
                        >
                            {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            <span>{isLocked ? 'Buka Kunci' : 'Kunci DPNA (Grade Lock)'}</span>
                        </button>

                        {/* Export Excel (.xls) */}
                        <a
                            href={`/admin/grades/${courseClass.id}/export-excel`}
                            download
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>Export Excel (.xls)</span>
                        </a>

                        {/* Import Excel Modal Trigger */}
                        {!isLocked && (
                            <button
                                onClick={() => setImportModalOpen(true)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Import Excel</span>
                            </button>
                        )}

                        {/* Cetak PDF Resmi DPNA */}
                        <a
                            href={`/admin/grades/${courseClass.id}/export-pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak DPNA (PDF)</span>
                        </a>

                        {/* Save Button */}
                        {!isLocked && (
                            <button
                                onClick={handleSaveGrades}
                                disabled={isSaving}
                                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
                            >
                                <Save className="w-3.5 h-3.5" />
                                <span>{isSaving ? 'Menyimpan...' : 'Simpan Nilai'}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. GRADE DISTRIBUTION BAR (Print Hidden) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs print:hidden space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center space-x-2">
                            <BarChart2 className="w-4 h-4 text-teal-600" />
                            <h4 className="text-xs font-black text-slate-900 uppercase">Distribusi Mutu Nilai Kelas</h4>
                        </div>
                        <div className="text-xs text-slate-600">
                            Total: <strong>{gradesData.length} Mahasiswa</strong> &bull; Rata-rata Nilai: <strong className="text-teal-700 font-mono">{currentAvgScore}</strong>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs">
                        {['A', 'A-', 'B+', 'B', 'C+', 'C', 'D', 'E'].map((letter) => (
                            <div key={letter} className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                                <span className="text-[10px] font-black text-slate-500 uppercase">{letter}</span>
                                <p className="text-base font-black text-slate-900 mt-0.5">{currentDistribution[letter] || 0}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. OFFICIAL DPNA DOCUMENT SHEET */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6 text-xs text-slate-800">
                    {/* Header Institusi */}
                    <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <img 
                                src="/logostai.png" 
                                alt="Logo STAI Al-Ittihad" 
                                className="w-12 h-12 object-contain shrink-0" 
                            />
                            <div>
                                <h1 className="text-sm sm:text-base font-black uppercase text-slate-900">
                                    SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR
                                </h1>
                                <p className="text-xs font-bold text-teal-800">DAFTAR PESERTA & NILAI AKHIR (DPNA)</p>
                                <p className="text-[10px] text-slate-500">Tahun Akademik: {courseClass.period_name ?? '2026/2027 Ganjil'}</p>
                            </div>
                        </div>
                        <div className="text-right text-[11px] space-y-0.5">
                            <p><span className="font-bold">Mata Kuliah:</span> {courseClass.course_name} ({courseClass.course_code})</p>
                            <p><span className="font-bold">Bobot SKS:</span> {courseClass.credits} SKS • <span className="font-bold">Kelas:</span> {courseClass.name}</p>
                            <p><span className="font-bold">Dosen Pengampu:</span> {courseClass.lecturer_name || 'Dr. H. M. Ridwan, M.Ag'}</p>
                        </div>
                    </div>

                    {/* Table DPNA */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                            <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                                <tr>
                                    <th className="border border-slate-300 py-2.5 px-2 text-center w-8">No</th>
                                    <th className="border border-slate-300 py-2.5 px-3">NIM</th>
                                    <th className="border border-slate-300 py-2.5 px-3">Nama Mahasiswa</th>
                                    <th className="border border-slate-300 py-2.5 px-2 text-center w-20">Presensi (10%)</th>
                                    <th className="border border-slate-300 py-2.5 px-2 text-center w-20">Tugas (20%)</th>
                                    <th className="border border-slate-300 py-2.5 px-2 text-center w-20">Kuis (15%)</th>
                                    <th className="border border-slate-300 py-2.5 px-2 text-center w-20">UTS (25%)</th>
                                    <th className="border border-slate-300 py-2.5 px-2 text-center w-20">UAS (30%)</th>
                                    <th className="border border-slate-300 py-2.5 px-2 text-center w-20">Nilai Akhir</th>
                                    <th className="border border-slate-300 py-2.5 px-2 text-center w-14">Huruf</th>
                                    <th className="border border-slate-300 py-2.5 px-2 text-center w-14">Bobot</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {gradesData.length === 0 ? (
                                    <tr>
                                        <td colSpan="11" className="py-8 text-center text-slate-400">
                                            Belum ada mahasiswa terdaftar pada kelas ini.
                                        </td>
                                    </tr>
                                ) : (
                                    gradesData.map((g, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="border border-slate-300 py-2 px-2 text-center font-bold">{idx + 1}</td>
                                            <td className="border border-slate-300 py-2 px-3 font-mono font-bold text-slate-700">{g.student_nim}</td>
                                            <td className="border border-slate-300 py-2 px-3 font-bold text-slate-900">{g.student_name}</td>
                                            <td className="border border-slate-300 p-1 text-center">
                                                <input
                                                    type="number"
                                                    disabled={isLocked}
                                                    value={g.attendance_score}
                                                    onChange={(e) => handleScoreChange(idx, 'attendance_score', e.target.value)}
                                                    className="w-14 text-center font-mono text-xs border border-slate-200 rounded p-1 disabled:bg-transparent disabled:border-transparent font-bold"
                                                    min={0} max={100}
                                                />
                                            </td>
                                            <td className="border border-slate-300 p-1 text-center">
                                                <input
                                                    type="number"
                                                    disabled={isLocked}
                                                    value={g.assignment_score}
                                                    onChange={(e) => handleScoreChange(idx, 'assignment_score', e.target.value)}
                                                    className="w-14 text-center font-mono text-xs border border-slate-200 rounded p-1 disabled:bg-transparent disabled:border-transparent font-bold"
                                                    min={0} max={100}
                                                />
                                            </td>
                                            <td className="border border-slate-300 p-1 text-center">
                                                <input
                                                    type="number"
                                                    disabled={isLocked}
                                                    value={g.quiz_score}
                                                    onChange={(e) => handleScoreChange(idx, 'quiz_score', e.target.value)}
                                                    className="w-14 text-center font-mono text-xs border border-slate-200 rounded p-1 disabled:bg-transparent disabled:border-transparent font-bold"
                                                    min={0} max={100}
                                                />
                                            </td>
                                            <td className="border border-slate-300 p-1 text-center">
                                                <input
                                                    type="number"
                                                    disabled={isLocked}
                                                    value={g.mid_exam_score}
                                                    onChange={(e) => handleScoreChange(idx, 'mid_exam_score', e.target.value)}
                                                    className="w-14 text-center font-mono text-xs border border-slate-200 rounded p-1 disabled:bg-transparent disabled:border-transparent font-bold"
                                                    min={0} max={100}
                                                />
                                            </td>
                                            <td className="border border-slate-300 p-1 text-center">
                                                <input
                                                    type="number"
                                                    disabled={isLocked}
                                                    value={g.final_exam_score}
                                                    onChange={(e) => handleScoreChange(idx, 'final_exam_score', e.target.value)}
                                                    className="w-14 text-center font-mono text-xs border border-slate-200 rounded p-1 disabled:bg-transparent disabled:border-transparent font-bold"
                                                    min={0} max={100}
                                                />
                                            </td>
                                            <td className="border border-slate-300 py-2 px-2 text-center font-black text-slate-900 bg-slate-50 font-mono">
                                                {g.final_score.toFixed(1)}
                                            </td>
                                            <td className={`border border-slate-300 py-2 px-2 text-center font-black bg-slate-50 ${
                                                ['A', 'A-', 'B+'].includes(g.grade_letter) ? 'text-teal-800' :
                                                ['B', 'B-', 'C+', 'C'].includes(g.grade_letter) ? 'text-blue-700' : 'text-rose-700'
                                            }`}>
                                                {g.grade_letter}
                                            </td>
                                            <td className="border border-slate-300 py-2 px-2 text-center font-bold text-slate-700 bg-slate-50 font-mono">
                                                {g.grade_point?.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Signatures for DPNA */}
                    <div className="pt-6 border-t border-slate-200 grid grid-cols-2 text-center text-xs">
                        <div className="space-y-12">
                            <div>
                                <p className="text-slate-600">Mengetahui,</p>
                                <p className="font-bold text-slate-800">Ketua Program Studi {courseClass.study_program || 'PAI'}</p>
                            </div>
                            <div>
                                <p className="font-black text-slate-900 underline">Dr. Ahmad Syafi'i, M.Ag</p>
                                <p className="text-[10px] font-mono text-slate-500">NIDN: 2118097201</p>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <div>
                                <p className="text-slate-600">Cianjur, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="font-bold text-slate-800">Dosen Pengampu Mata Kuliah</p>
                            </div>
                            <div>
                                <p className="font-black text-slate-900 underline">{courseClass.lecturer_name || 'Dr. H. M. Ridwan, M.Ag'}</p>
                                <p className="text-[10px] font-mono text-slate-500">NIDN: {courseClass.lecturer_nidn || '2112087501'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. MODAL IMPORT EXCEL */}
            {importModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center space-x-2">
                                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                                <h3 className="text-sm font-black text-slate-900">Import Nilai dari File Excel (.xlsx / .csv)</h3>
                            </div>
                            <button
                                onClick={() => {
                                    setImportModalOpen(false);
                                    setParsedImportRows(null);
                                }}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Step 1: Download Template */}
                        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                            <div>
                                <h4 className="font-bold text-emerald-950">Unduh Format Template Kelas Ini</h4>
                                <p className="text-[11px] text-emerald-800 mt-0.5">
                                    Template sudah berisi daftar seluruh NIM dan Nama mahasiswa kelas ini. Anda cukup mengisi kolom nilai.
                                </p>
                            </div>
                            <a
                                href={`/admin/grades/${courseClass.id}/template-excel`}
                                download
                                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shrink-0 shadow-xs"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Unduh Template</span>
                            </a>
                        </div>

                        {/* Step 2: Upload File Picker */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-700">Pilih File Excel yang Telah Diisi</label>
                            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center transition cursor-pointer bg-slate-50/50"
                                 onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-700">
                                    {importFileName ? importFileName : "Klik untuk memilih file Excel (.xlsx, .xls, .csv)"}
                                </p>
                                <p className="text-[10.5px] text-slate-400 mt-1">Sistem akan mencocokkan nilai berdasarkan kolom NIM mahasiswa.</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        {/* Step 3: Preview Hasil Parsing */}
                        {parsedImportRows && (
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                                        <Check className="w-4 h-4 text-emerald-600" />
                                        <span>Terdeteksi <strong>{importStats.matched}</strong> Mahasiswa Cocok</span>
                                    </span>
                                    {importStats.unmatched > 0 && (
                                        <span className="text-amber-600 font-semibold text-[11px]">
                                            ⚠️ {importStats.unmatched} baris dilewati (NIM tidak ada di kelas ini)
                                        </span>
                                    )}
                                </div>

                                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl text-xs">
                                    <table className="w-full text-left border-collapse text-[11px]">
                                        <thead className="bg-slate-100 text-slate-700 font-bold uppercase sticky top-0">
                                            <tr>
                                                <th className="p-2">NIM</th>
                                                <th className="p-2">Nama</th>
                                                <th className="p-2 text-center">Presensi</th>
                                                <th className="p-2 text-center">Tugas</th>
                                                <th className="p-2 text-center">Kuis</th>
                                                <th className="p-2 text-center">UTS</th>
                                                <th className="p-2 text-center">UAS</th>
                                                <th className="p-2 text-center">Akhir</th>
                                                <th className="p-2 text-center">Huruf</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {parsedImportRows.map((r, i) => (
                                                <tr key={i} className="hover:bg-slate-50">
                                                    <td className="p-2 font-mono font-bold text-slate-800">{r.student_nim}</td>
                                                    <td className="p-2 font-medium">{r.student_name}</td>
                                                    <td className="p-2 text-center font-mono">{r.attendance_score}</td>
                                                    <td className="p-2 text-center font-mono">{r.assignment_score}</td>
                                                    <td className="p-2 text-center font-mono">{r.quiz_score}</td>
                                                    <td className="p-2 text-center font-mono">{r.mid_exam_score}</td>
                                                    <td className="p-2 text-center font-mono">{r.final_exam_score}</td>
                                                    <td className="p-2 text-center font-mono font-bold text-emerald-800">{r.final_score}</td>
                                                    <td className="p-2 text-center font-bold text-slate-900">{r.grade_letter}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => handleApplyImport(false)}
                                        className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition"
                                    >
                                        Terapkan ke Tabel Saja
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleApplyImport(true)}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center space-x-1.5 shadow-xs"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        <span>Terapkan & Simpan Langsung</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
