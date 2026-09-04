import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Award, Lock, Unlock, Printer, Save, ArrowLeft, 
    CheckCircle2, AlertCircle, FileText, ChevronRight, BarChart2
} from 'lucide-react';

export default function GradeShow({ courseClass, students = [], distribution = {}, isLocked = false }) {
    const [gradesData, setGradesData] = useState(
        students.map((s) => ({
            krs_item_id: s.krs_item_id,
            student_id: s.student_id,
            student_name: s.student_name,
            student_nim: s.student_nim,
            attendance_score: s.attendance_score ?? 90,
            assignment_score: s.assignment_score ?? 85,
            quiz_score: s.quiz_score ?? 80,
            mid_exam_score: s.mid_exam_score ?? 85,
            final_exam_score: s.final_exam_score ?? 88,
            final_score: s.final_score ?? 86.5,
            grade_letter: s.grade_letter ?? 'A-',
            grade_point: s.grade_point ?? 3.75,
        }))
    );

    const [isSaving, setIsSaving] = useState(false);

    const handleScoreChange = (idx, field, val) => {
        const updated = [...gradesData];
        const numVal = parseFloat(val) || 0;
        updated[idx][field] = numVal;

        // Auto recalculate final score
        const att = field === 'attendance_score' ? numVal : updated[idx].attendance_score;
        const asg = field === 'assignment_score' ? numVal : updated[idx].assignment_score;
        const qz = field === 'quiz_score' ? numVal : updated[idx].quiz_score;
        const mid = field === 'mid_exam_score' ? numVal : updated[idx].mid_exam_score;
        const fin = field === 'final_exam_score' ? numVal : updated[idx].final_exam_score;

        const finalScore = Math.round(((att * 0.10) + (asg * 0.20) + (qz * 0.15) + (mid * 0.25) + (fin * 0.30)) * 100) / 100;
        updated[idx].final_score = finalScore;

        let letter = 'E';
        let point = 0.00;
        if (finalScore >= 90) { letter = 'A'; point = 4.00; }
        else if (finalScore >= 85) { letter = 'A-'; point = 3.75; }
        else if (finalScore >= 80) { letter = 'B+'; point = 3.50; }
        else if (finalScore >= 75) { letter = 'B'; point = 3.00; }
        else if (finalScore >= 70) { letter = 'C+'; point = 2.50; }
        else if (finalScore >= 65) { letter = 'C'; point = 2.00; }
        else if (finalScore >= 60) { letter = 'D'; point = 1.00; }

        updated[idx].grade_letter = letter;
        updated[idx].grade_point = point;

        setGradesData(updated);
    };

    const handleSaveGrades = (e) => {
        e.preventDefault();
        setIsSaving(true);
        router.post(`/admin/grades/${courseClass.id}/update`, { grades: gradesData }, {
            onFinish: () => setIsSaving(false),
        });
    };

    const handleToggleLock = () => {
        const action = isLocked ? 'buka kunci' : 'kunci lembar nilai';
        if (confirm(`Apakah Anda yakin ingin melakukan ${action} pada kelas ini?`)) {
            router.post(`/admin/grades/${courseClass.id}/toggle-lock`);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout title={`Lembar Nilai DPNA — ${courseClass.course_code}`}>
            <Head title={`Lembar Nilai DPNA ${courseClass.course_code}`} />

            <div className="space-y-6 max-w-6xl mx-auto">
                {/* Header Navbar (Hidden on Print) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/admin/grades"
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                                    {courseClass.course_code}
                                </span>
                                <h2 className="text-lg font-black text-slate-900">{courseClass.course_name} ({courseClass.name})</h2>
                            </div>
                            <p className="text-xs text-slate-500">
                                Dosen: {courseClass.lecturer_name || 'Dr. H. M. Ridwan, M.Ag'} • {courseClass.credits} SKS • {courseClass.period_name}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleToggleLock}
                            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs ${
                                isLocked ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'
                            }`}
                        >
                            {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            <span>{isLocked ? 'Buka Kunci Nilai' : 'Kunci Lembar Nilai (Grade Lock)'}</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak DPNA (PDF)</span>
                        </button>
                        {!isLocked && (
                            <button
                                onClick={handleSaveGrades}
                                disabled={isSaving}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
                            >
                                <Save className="w-3.5 h-3.5" />
                                <span>{isSaving ? 'Menyimpan...' : 'Simpan Nilai'}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Grade Distribution Bar (Print Hidden) */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:hidden space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-900 uppercase">Distribusi Mutu Nilai Kelas</h4>
                        <span className="text-[11px] text-slate-500 font-bold">Total {gradesData.length} Mahasiswa Terdaftar</span>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs">
                        {['A', 'A-', 'B+', 'B', 'C+', 'C', 'D', 'E'].map((letter) => (
                            <div key={letter} className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                                <span className="text-[10px] font-black text-slate-500 uppercase">{letter}</span>
                                <p className="text-base font-black text-slate-900">{distribution[letter] || 0}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* OFFICIAL DPNA DOCUMENT CONTAINER (Supports window.print()) */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 text-xs text-slate-800">
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
                                <p className="text-xs font-bold text-emerald-800">DAFTAR PESERTA & NILAI AKHIR (DPNA)</p>
                                <p className="text-[10px] text-slate-500">Tahun Akademik 2026/2027 • Semester Ganjil</p>
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
                                    <th className="border border-slate-300 py-2.5 px-2 text-center w-16">Presensi (10%)</th>
                                    <th className="border border-slate-300 py-2.5 px-2 text-center w-16">Tugas (20%)</th>
                                    <th className="border border-slate-300 py-2.5 px-2 text-center w-16">Kuis (15%)</th>
                                    <th className="border border-slate-300 py-2.5 px-2 text-center w-16">UTS (25%)</th>
                                    <th className="border border-slate-300 py-2.5 px-2 text-center w-16">UAS (30%)</th>
                                    <th className="border border-slate-300 py-2.5 px-2 text-center w-20">Nilai Akhir</th>
                                    <th className="border border-slate-300 py-2.5 px-2 text-center w-14">Huruf</th>
                                    <th className="border border-slate-300 py-2.5 px-2 text-center w-14">Bobot</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {gradesData.map((g, idx) => (
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
                                                className="w-12 text-center font-mono text-xs border border-slate-200 rounded p-1 disabled:bg-transparent disabled:border-transparent font-bold"
                                                min={0} max={100}
                                            />
                                        </td>
                                        <td className="border border-slate-300 p-1 text-center">
                                            <input
                                                type="number"
                                                disabled={isLocked}
                                                value={g.assignment_score}
                                                onChange={(e) => handleScoreChange(idx, 'assignment_score', e.target.value)}
                                                className="w-12 text-center font-mono text-xs border border-slate-200 rounded p-1 disabled:bg-transparent disabled:border-transparent font-bold"
                                                min={0} max={100}
                                            />
                                        </td>
                                        <td className="border border-slate-300 p-1 text-center">
                                            <input
                                                type="number"
                                                disabled={isLocked}
                                                value={g.quiz_score}
                                                onChange={(e) => handleScoreChange(idx, 'quiz_score', e.target.value)}
                                                className="w-12 text-center font-mono text-xs border border-slate-200 rounded p-1 disabled:bg-transparent disabled:border-transparent font-bold"
                                                min={0} max={100}
                                            />
                                        </td>
                                        <td className="border border-slate-300 p-1 text-center">
                                            <input
                                                type="number"
                                                disabled={isLocked}
                                                value={g.mid_exam_score}
                                                onChange={(e) => handleScoreChange(idx, 'mid_exam_score', e.target.value)}
                                                className="w-12 text-center font-mono text-xs border border-slate-200 rounded p-1 disabled:bg-transparent disabled:border-transparent font-bold"
                                                min={0} max={100}
                                            />
                                        </td>
                                        <td className="border border-slate-300 p-1 text-center">
                                            <input
                                                type="number"
                                                disabled={isLocked}
                                                value={g.final_exam_score}
                                                onChange={(e) => handleScoreChange(idx, 'final_exam_score', e.target.value)}
                                                className="w-12 text-center font-mono text-xs border border-slate-200 rounded p-1 disabled:bg-transparent disabled:border-transparent font-bold"
                                                min={0} max={100}
                                            />
                                        </td>
                                        <td className="border border-slate-300 py-2 px-2 text-center font-black text-slate-900 bg-slate-50">
                                            {g.final_score}
                                        </td>
                                        <td className="border border-slate-300 py-2 px-2 text-center font-black text-emerald-800 bg-slate-50">
                                            {g.grade_letter}
                                        </td>
                                        <td className="border border-slate-300 py-2 px-2 text-center font-bold text-slate-700 bg-slate-50">
                                            {g.grade_point?.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Signatures for DPNA */}
                    <div className="pt-6 border-t border-slate-200 grid grid-cols-2 text-center text-xs">
                        <div className="space-y-12">
                            <div>
                                <p className="text-slate-600">Mengetahui,</p>
                                <p className="font-bold text-slate-800">Ketua Program Studi PAI</p>
                            </div>
                            <div>
                                <p className="font-black text-slate-900 underline">Dr. Ahmad Syafi'i, M.Ag</p>
                                <p className="text-[10px] font-mono text-slate-500">NIDN: 2118097201</p>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <div>
                                <p className="text-slate-600">Cianjur, 24 Agustus 2026</p>
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
        </AppLayout>
    );
}
