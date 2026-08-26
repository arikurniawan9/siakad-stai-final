import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    GraduationCap, Sparkles, CreditCard, ShieldCheck, 
    CheckCircle2, ChevronRight, ChevronLeft, School, 
    ArrowRight, User, Phone, Mail, MapPin, Calendar, 
    Award, BookOpen, Building2, Check, AlertCircle, Info
} from 'lucide-react';

export default function PmbRegister({ pmbPeriod, studyPrograms }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [stepErrors, setStepErrors] = useState({});
    const [agreed, setAgreed] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        pmb_period_id: pmbPeriod?.id || 1,
        pathway: 'REGULER',
        first_choice_program_id: studyPrograms[0]?.id || 1,
        second_choice_program_id: '',
        full_name: '',
        mother_name: '',
        nik: '',
        gender: 'L',
        birth_place: '',
        birth_date: '',
        phone_number: '',
        email: '',
        address: '',
        previous_school: '',
        nisn: '',
    });

    const pathways = [
        { id: 'REGULER', name: 'Jalur Reguler (Mandiri)', desc: 'Seleksi umum tes potensi akademik & wawancara', icon: GraduationCap, color: 'emerald' },
        { id: 'BEASISWA_PRESTASI', name: 'Jalur Prestasi', desc: 'Bebas tes bagi ranking 1-5 atau juara lomba', icon: Award, color: 'blue' },
        { id: 'TAHFIDZ', name: 'Jalur Tahfidz Qur\'an', desc: 'Beasiswa khusus hafidz/hafidzah min. 3 Juz', icon: BookOpen, color: 'purple' },
        { id: 'KIP_KULIAH', name: 'Jalur KIP Kuliah / Beasiswa', desc: 'Bantuan biaya pendidikan pemerintah & yayasan', icon: Building2, color: 'amber' },
        { id: 'PINDAHAN', name: 'Jalur Transfer / Pindahan', desc: 'Konversi SKS dari kampus perguruan tinggi lain', icon: Sparkles, color: 'indigo' },
    ];

    const steps = [
        { num: 1, title: 'Program Studi', subtitle: 'Pilih jalur & jurusan', icon: GraduationCap },
        { num: 2, title: 'Data Diri', subtitle: 'Identitas calon mhs', icon: User },
        { num: 3, title: 'Kontak & Alamat', subtitle: 'Domisili & WhatsApp', icon: Phone },
        { num: 4, title: 'Asal Sekolah & Review', subtitle: 'Konfirmasi pendaftaran', icon: School },
    ];

    // Validasi per step sebelum melanjutkan
    const validateStep = (step) => {
        const errs = {};
        if (step === 1) {
            if (!data.first_choice_program_id) errs.first_choice_program_id = 'Pilihan Program Studi 1 wajib dipilih';
            if (!data.pathway) errs.pathway = 'Jalur pendaftaran wajib dipilih';
        } else if (step === 2) {
            if (!data.full_name.trim()) errs.full_name = 'Nama lengkap wajib diisi sesuai ijazah';
            if (!data.mother_name.trim()) errs.mother_name = 'Nama ibu kandung wajib diisi sesuai KK/Akta';
            if (!data.nik.trim()) {
                errs.nik = 'NIK KTP wajib diisi';
            } else if (data.nik.trim().length !== 16 || !/^\d+$/.test(data.nik.trim())) {
                errs.nik = 'NIK harus tepat 16 digit angka';
            }
            if (!data.birth_place.trim()) errs.birth_place = 'Tempat lahir wajib diisi';
            if (!data.birth_date) errs.birth_date = 'Tanggal lahir wajib diisi';
        } else if (step === 3) {
            if (!data.phone_number.trim()) {
                errs.phone_number = 'Nomor WhatsApp wajib diisi';
            } else if (data.phone_number.trim().length < 9) {
                errs.phone_number = 'Nomor WhatsApp tidak valid (min. 9 digit)';
            }
            if (!data.email.trim()) {
                errs.email = 'Alamat email aktif wajib diisi';
            } else if (!/\S+@\S+\.\S+/.test(data.email)) {
                errs.email = 'Format email tidak valid';
            }
            if (!data.address.trim()) errs.address = 'Alamat domisili lengkap wajib diisi';
        } else if (step === 4) {
            if (!data.previous_school.trim()) errs.previous_school = 'Nama sekolah / madrasah asal wajib diisi';
            if (!data.nisn.trim()) {
                errs.nisn = 'Nomor Induk Siswa Nasional (NISN) wajib diisi';
            } else if (data.nisn.trim().length !== 10 || !/^\d+$/.test(data.nisn.trim())) {
                errs.nisn = 'NISN harus tepat 10 digit angka';
            }
            if (!agreed) errs.agreed = 'Anda harus menyetujui pernyataan kebenaran data';
        }

        setStepErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 4));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrev = () => {
        setStepErrors({});
        setCurrentStep(prev => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateStep(4)) {
            post('/pmb/register');
        }
    };

    // Helper data prodi terpilih
    const selectedProdi1 = studyPrograms.find(p => String(p.id) === String(data.first_choice_program_id));
    const selectedProdi2 = studyPrograms.find(p => String(p.id) === String(data.second_choice_program_id));
    const selectedPathwayObj = pathways.find(p => p.id === data.pathway);

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-800 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex flex-col justify-between">
            <Head title="Penerimaan Mahasiswa Baru (PMB) Online — STAI Al-Ittihad" />

            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-3xl mx-auto z-10 w-full">
                {/* Header Brand */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold mb-3 shadow-inner">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <span>PORTAL PENERIMAAN MAHASISWA BARU (PMB) TA 2026/2027</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        FORMULIR PENDAFTARAN ONLINE
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur
                    </p>
                </div>

                {/* Info Biaya & Auto VA BSI Header Banner */}
                <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white p-4 sm:p-5 rounded-3xl border border-emerald-500/30 shadow-2xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                        <div className="p-3 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-2xl shrink-0">
                            <CreditCard className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                                Biaya Registrasi Calon Mahasiswa Baru
                            </span>
                            <div className="flex items-baseline space-x-2">
                                <h3 className="text-xl sm:text-2xl font-black text-white">Rp 250.000,-</h3>
                                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-bold">
                                    Sekali Bayar
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-300">
                                Otomatis terhubung ke <strong>Virtual Account Bank BSI (Prefix 9928) & Winpay</strong>
                            </p>
                        </div>
                    </div>
                    <div className="self-start sm:self-auto">
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-emerald-300 rounded-xl text-xs font-bold border border-white/10">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Gelombang 1 Aktif</span>
                        </span>
                    </div>
                </div>

                {/* STEP WIZARD PROGRESS BAR */}
                <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-3xl border border-slate-800 shadow-xl mb-6">
                    <div className="grid grid-cols-4 gap-2">
                        {steps.map((s) => {
                            const IconComponent = s.icon;
                            const isCompleted = currentStep > s.num;
                            const isActive = currentStep === s.num;

                            return (
                                <button
                                    key={s.num}
                                    type="button"
                                    onClick={() => {
                                        if (s.num < currentStep) setCurrentStep(s.num);
                                    }}
                                    className={`text-left p-2.5 rounded-2xl transition flex flex-col sm:flex-row items-center sm:items-start space-y-1.5 sm:space-y-0 sm:space-x-2.5 cursor-pointer ${
                                        isActive 
                                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                                            : isCompleted 
                                                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' 
                                                : 'bg-slate-800/40 text-slate-400 border border-slate-800/60'
                                    }`}
                                >
                                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                                        isActive 
                                            ? 'bg-white text-emerald-700' 
                                            : isCompleted 
                                                ? 'bg-emerald-500 text-slate-950 font-black' 
                                                : 'bg-slate-800 text-slate-400'
                                    }`}>
                                        {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                                    </div>
                                    <div className="hidden sm:block min-w-0">
                                        <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : isCompleted ? 'text-emerald-200' : 'text-slate-300'}`}>
                                            {s.title}
                                        </p>
                                        <p className={`text-[10px] truncate ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                                            {s.subtitle}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* MAIN FORM CARD */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100">
                    <form onSubmit={handleSubmit}>
                        
                        {/* ========================================================================= */}
                        {/* STEP 1: PILIHAN PROGRAM STUDI & JALUR PENDAFTARAN */}
                        {/* ========================================================================= */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-fade-in text-xs">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                                            <GraduationCap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-slate-900">
                                                Langkah 1: Pilihan Program Studi & Jalur Masuk
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Tentukan jurusan yang diminati dan jalur pendaftaran Anda di STAI Al-Ittihad.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Pilihan Program Studi Utama (1) */}
                                <div className="space-y-2">
                                    <label className="font-bold text-slate-800 text-xs block">
                                        Pilihan Program Studi 1 (Prioritas Utama) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {studyPrograms.map((p) => {
                                            const isSelected = String(data.first_choice_program_id) === String(p.id);
                                            return (
                                                <div
                                                    key={p.id}
                                                    onClick={() => setData('first_choice_program_id', p.id)}
                                                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-start space-x-3 ${
                                                        isSelected
                                                            ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                                                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                                        <GraduationCap className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-mono text-[10px] font-black px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded">
                                                                {p.code}
                                                            </span>
                                                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full">
                                                                Jenjang {p.degree || 'S1'}
                                                            </span>
                                                        </div>
                                                        <p className="font-black text-slate-900 text-xs mt-1 leading-snug">
                                                            {p.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {stepErrors.first_choice_program_id && (
                                        <p className="text-rose-600 font-bold text-[11px] mt-1">{stepErrors.first_choice_program_id}</p>
                                    )}
                                </div>

                                {/* Pilihan Program Studi Cadangan (2) */}
                                <div className="space-y-1.5 pt-2">
                                    <label className="font-bold text-slate-800 text-xs block">
                                        Pilihan Program Studi 2 (Cadangan / Alternatif - Opsional)
                                    </label>
                                    <select
                                        value={data.second_choice_program_id}
                                        onChange={(e) => setData('second_choice_program_id', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="">-- Tanpa Pilihan Kedua --</option>
                                        {studyPrograms.filter(p => String(p.id) !== String(data.first_choice_program_id)).map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.code} - {p.name} ({p.degree || 'S1'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Pilihan Jalur Masuk */}
                                <div className="space-y-2 pt-2">
                                    <label className="font-bold text-slate-800 text-xs block">
                                        Pilih Jalur Pendaftaran <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {pathways.map((item) => {
                                            const isSelected = data.pathway === item.id;
                                            const IconComp = item.icon;
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => setData('pathway', item.id)}
                                                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-start space-x-2.5 ${
                                                        isSelected
                                                            ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                                                            : 'border-slate-200 bg-white hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                        <IconComp className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 text-xs">{item.name}</p>
                                                        <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{item.desc}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {stepErrors.pathway && (
                                        <p className="text-rose-600 font-bold text-[11px] mt-1">{stepErrors.pathway}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ========================================================================= */}
                        {/* STEP 2: IDENTITAS DIRI CALON MAHASISWA */}
                        {/* ========================================================================= */}
                        {currentStep === 2 && (
                            <div className="space-y-5 animate-fade-in text-xs">
                                <div className="flex items-center space-x-2">
                                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900">
                                            Langkah 2: Data Pribadi Calon Mahasiswa
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Pastikan nama dan NIK sesuai dengan KTP / Kartu Keluarga / Ijazah terakhir.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3.5">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">
                                            Nama Lengkap (Sesuai Ijazah/KTP) <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.full_name}
                                            onChange={(e) => setData('full_name', e.target.value)}
                                            placeholder="Contoh: Muhammad Rizky Pratama"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 uppercase"
                                            required
                                        />
                                        {stepErrors.full_name && (
                                            <p className="text-rose-600 font-bold text-[11px] mt-1">{stepErrors.full_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">
                                            Nama Ibu Kandung (Sesuai Kartu Keluarga / Akta) <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.mother_name}
                                            onChange={(e) => setData('mother_name', e.target.value)}
                                            placeholder="Contoh: Siti Aminah"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 uppercase"
                                            required
                                        />
                                        {stepErrors.mother_name && (
                                            <p className="text-rose-600 font-bold text-[11px] mt-1">{stepErrors.mother_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="font-bold text-slate-700">
                                                Nomor Induk Kependudukan (NIK KTP / KK) <span className="text-rose-500">*</span>
                                            </label>
                                            <span className={`text-[10px] font-mono font-bold ${data.nik.length === 16 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {data.nik.length}/16 Digit
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            maxLength={16}
                                            value={data.nik}
                                            onChange={(e) => setData('nik', e.target.value.replace(/\D/g, ''))}
                                            placeholder="16 Digit NIK KTP / KK"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                            required
                                        />
                                        {stepErrors.nik && (
                                            <p className="text-rose-600 font-bold text-[11px] mt-1">{stepErrors.nik}</p>
                                        )}
                                    </div>

                                    {/* Jenis Kelamin Toggle */}
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">
                                            Jenis Kelamin <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setData('gender', 'L')}
                                                className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer ${
                                                    data.gender === 'L'
                                                        ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                                                        : 'bg-slate-50 border-slate-200 text-slate-600'
                                                }`}
                                            >
                                                <span>👨 Laki-Laki (Ikhwan)</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData('gender', 'P')}
                                                className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer ${
                                                    data.gender === 'P'
                                                        ? 'bg-pink-50 border-pink-600 text-pink-900 shadow-xs'
                                                        : 'bg-slate-50 border-slate-200 text-slate-600'
                                                }`}
                                            >
                                                <span>🧕 Perempuan (Akhwat)</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tempat & Tanggal Lahir */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="font-bold text-slate-700 block mb-1">
                                                Tempat Lahir <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.birth_place}
                                                onChange={(e) => setData('birth_place', e.target.value)}
                                                placeholder="Contoh: Cianjur"
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                                                required
                                            />
                                            {stepErrors.birth_place && (
                                                <p className="text-rose-600 font-bold text-[11px] mt-1">{stepErrors.birth_place}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="font-bold text-slate-700 block mb-1">
                                                Tanggal Lahir <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={data.birth_date}
                                                onChange={(e) => setData('birth_date', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                                                required
                                            />
                                            {stepErrors.birth_date && (
                                                <p className="text-rose-600 font-bold text-[11px] mt-1">{stepErrors.birth_date}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ========================================================================= */}
                        {/* STEP 3: KONTAK & ALAMAT DOMISILI */}
                        {/* ========================================================================= */}
                        {currentStep === 3 && (
                            <div className="space-y-5 animate-fade-in text-xs">
                                <div className="flex items-center space-x-2">
                                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900">
                                            Langkah 3: Kontak & Alamat Domisili
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Nomor WhatsApp akan digunakan untuk pengiriman nomor VA dan notifikasi seleksi.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3.5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="font-bold text-slate-700 block mb-1">
                                                Nomor WhatsApp / HP Aktif <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                                                <input
                                                    type="tel"
                                                    value={data.phone_number}
                                                    onChange={(e) => setData('phone_number', e.target.value)}
                                                    placeholder="Contoh: 081234567890"
                                                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                                                    required
                                                />
                                            </div>
                                            {stepErrors.phone_number && (
                                                <p className="text-rose-600 font-bold text-[11px] mt-1">{stepErrors.phone_number}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="font-bold text-slate-700 block mb-1">
                                                Alamat Email Aktif <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    placeholder="nama.kamu@gmail.com"
                                                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                                                    required
                                                />
                                            </div>
                                            {stepErrors.email && (
                                                <p className="text-rose-600 font-bold text-[11px] mt-1">{stepErrors.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">
                                            Alamat Domisili Lengkap <span className="text-rose-500">*</span>
                                        </label>
                                        <textarea
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            rows={3}
                                            placeholder="Nama Jalan, RT/RW, Dusun, Desa/Kelurahan, Kecamatan, Kabupaten/Kota, Provinsi"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 leading-relaxed"
                                            required
                                        />
                                        {stepErrors.address && (
                                            <p className="text-rose-600 font-bold text-[11px] mt-1">{stepErrors.address}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ========================================================================= */}
                        {/* STEP 4: ASAL SEKOLAH & REVIEW KONFIRMASI PENDAFTARAN */}
                        {/* ========================================================================= */}
                        {currentStep === 4 && (
                            <div className="space-y-5 animate-fade-in text-xs">
                                <div className="flex items-center space-x-2">
                                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                                        <School className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900">
                                            Langkah 4: Asal Sekolah & Konfirmasi Pendaftaran
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Periksa kembali rincian data Anda sebelum menerbitkan Virtual Account pendaftaran.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">
                                            Nama Asal Sekolah / Madrasah / Pesantren <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.previous_school}
                                            onChange={(e) => setData('previous_school', e.target.value)}
                                            placeholder="Contoh: MAN 1 Cianjur / SMA Negeri 1 Cianjur / Ponpes Al-Ittihad"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                                            required
                                        />
                                        {stepErrors.previous_school && (
                                            <p className="text-rose-600 font-bold text-[11px] mt-1">{stepErrors.previous_school}</p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="font-bold text-slate-700">
                                                Nomor Induk Siswa Nasional (NISN) <span className="text-rose-500">*</span>
                                            </label>
                                            <span className={`text-[10px] font-mono font-bold ${data.nisn.length === 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {data.nisn.length}/10 Digit
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            maxLength={10}
                                            value={data.nisn}
                                            onChange={(e) => setData('nisn', e.target.value.replace(/\D/g, ''))}
                                            placeholder="10 Digit NISN (Contoh: 0041234567)"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                            required
                                        />
                                        {stepErrors.nisn && (
                                            <p className="text-rose-600 font-bold text-[11px] mt-1">{stepErrors.nisn}</p>
                                        )}
                                    </div>
                                </div>

                                {/* RINGKASAN DATA KARTU REVIEW */}
                                <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                        <span className="font-black text-slate-900 uppercase text-[11px]">
                                            📋 Ringkasan Formulir PMB
                                        </span>
                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                                            {selectedPathwayObj?.name || data.pathway}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                                        <div>
                                            <p className="text-slate-400">Nama Lengkap:</p>
                                            <p className="font-black text-slate-900">{data.full_name || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400">Nama Ibu Kandung:</p>
                                            <p className="font-black text-slate-900">{data.mother_name || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400">NIK KTP / KK:</p>
                                            <p className="font-mono font-bold text-slate-900">{data.nik || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400">Nomor NISN:</p>
                                            <p className="font-mono font-bold text-slate-900">{data.nisn || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400">Asal Sekolah / Madrasah:</p>
                                            <p className="font-bold text-slate-900">{data.previous_school || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400">Program Studi Pilihan 1:</p>
                                            <p className="font-black text-emerald-700">{selectedProdi1 ? `${selectedProdi1.code} - ${selectedProdi1.name}` : '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400">No. WhatsApp & Email:</p>
                                            <p className="font-bold text-slate-800">{data.phone_number} / {data.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400">Jenis Kelamin / Tgl Lahir:</p>
                                            <p className="font-bold text-slate-800">{data.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}, {data.birth_place} ({data.birth_date})</p>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <p className="text-slate-400">Alamat Domisili:</p>
                                            <p className="font-medium text-slate-700">{data.address || '-'}</p>
                                        </div>
                                    </div>

                                    {/* Preview VA & Nominal */}
                                    <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between bg-emerald-950 text-white p-3 rounded-xl">
                                        <div>
                                            <p className="text-[10px] text-emerald-400 font-bold">Biaya Registrasi Pendaftaran:</p>
                                            <p className="text-sm font-black text-white">Rp 250.000,-</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md font-bold">
                                                Auto Virtual Account BSI
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Pakta Pernyataan */}
                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start space-x-2.5">
                                    <input
                                        type="checkbox"
                                        id="agreeCheckbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="w-4 h-4 mt-0.5 text-emerald-600 rounded cursor-pointer"
                                    />
                                    <label htmlFor="agreeCheckbox" className="text-[11px] text-amber-900 font-medium cursor-pointer">
                                        Saya menyatakan dengan sesungguhnya bahwa data yang saya isikan pada formulir pendaftaran ini adalah benar dan valid. Saya bersedia mematuhi segala tata tertib PMB STAI Al-Ittihad.
                                    </label>
                                </div>
                                {stepErrors.agreed && (
                                    <p className="text-rose-600 font-bold text-[11px]">{stepErrors.agreed}</p>
                                )}
                            </div>
                        )}

                        {/* ========================================================================= */}
                        {/* NAVIGATION BUTTONS */}
                        {/* ========================================================================= */}
                        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={handlePrev}
                                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span>Sebelumnya</span>
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/30 flex items-center space-x-1.5 cursor-pointer"
                                >
                                    <span>Lanjut ke Tahap {currentStep + 1}</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={processing || !agreed}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white rounded-xl text-xs font-black transition shadow-xl shadow-emerald-600/30 flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ShieldCheck className="w-4 h-4 text-emerald-200" />
                                    <span>{processing ? 'Menerbitkan VA...' : 'Kirim Pendaftaran & Buat Kode VA BSI'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer Link */}
                <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center space-x-4">
                    <span>Sudah mendaftar sebelumnya?</span>
                    <Link href="/pmb/status" className="font-bold text-emerald-400 hover:text-emerald-300 transition underline">
                        Cek Status & Tagihan VA Anda di Sini →
                    </Link>
                </div>
            </div>

            {/* Bottom copyright */}
            <div className="text-center text-[10px] text-slate-500 mt-8">
                &copy; {new Date().getFullYear()} STAI Al-Ittihad Cianjur. Sistem Penerimaan Mahasiswa Baru Terintegrasi Host-to-Host.
            </div>
        </div>
    );
}
