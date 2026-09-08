import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    GraduationCap, Sparkles, CreditCard, ShieldCheck, 
    CheckCircle2, ChevronRight, ChevronLeft, School, 
    ArrowRight, User, UserCheck, Phone, Mail, MapPin, Calendar, 
    Award, BookOpen, Building2, Check, AlertCircle, Info, Lock
} from 'lucide-react';
import PremiumProdiSelect from '@/Components/PremiumProdiSelect';

export default function PmbRegister({ pmbPeriod, studyPrograms = [] }) {
    // Dua tahapan sederhana & elegan
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
        { id: 'REGULER', name: 'Jalur Reguler (Mandiri)', desc: 'Seleksi umum tes potensi akademik & wawancara', icon: GraduationCap, badge: 'Umum' },
        { id: 'BEASISWA_PRESTASI', name: 'Jalur Prestasi', desc: 'Bebas tes bagi ranking 1-5 atau juara lomba', icon: Award, badge: 'Bebas Tes' },
        { id: 'TAHFIDZ', name: 'Jalur Tahfidz Qur\'an', desc: 'Beasiswa khusus hafidz/hafidzah min. 3 Juz', icon: BookOpen, badge: 'Beasiswa' },
        { id: 'KIP_KULIAH', name: 'Jalur KIP Kuliah / Yayasan', desc: 'Bantuan biaya pendidikan pemerintah & yayasan', icon: Building2, badge: 'Subsidi' },
        { id: 'PINDAHAN', name: 'Jalur Transfer / Pindahan', desc: 'Konversi SKS dari perguruan tinggi lain', icon: Sparkles, badge: 'Konversi SKS' },
    ];

    const steps = [
        { num: 1, title: 'Program Studi & Jalur', subtitle: 'Pilih jurusan & jalur seleksi', icon: GraduationCap },
        { num: 2, title: 'Biodata & Konfirmasi', subtitle: 'Identitas, kontak, asal sekolah & VA', icon: UserCheck },
    ];

    // Validasi per tahap sebelum beralih
    const validateStep = (step) => {
        const errs = {};
        if (step === 1) {
            if (!data.first_choice_program_id) errs.first_choice_program_id = 'Pilihan Program Studi 1 wajib dipilih';
            if (!data.pathway) errs.pathway = 'Jalur pendaftaran wajib dipilih';
        } else if (step === 2) {
            // Validasi Identitas Pribadi
            if (!data.full_name.trim()) errs.full_name = 'Nama lengkap wajib diisi sesuai ijazah';
            if (!data.mother_name.trim()) errs.mother_name = 'Nama ibu kandung wajib diisi sesuai KK/Akta';
            if (!data.nik.trim()) {
                errs.nik = 'NIK KTP wajib diisi';
            } else if (data.nik.trim().length !== 16 || !/^\d+$/.test(data.nik.trim())) {
                errs.nik = 'NIK harus tepat 16 digit angka';
            }
            if (!data.birth_place.trim()) errs.birth_place = 'Tempat lahir wajib diisi';
            if (!data.birth_date) errs.birth_date = 'Tanggal lahir wajib diisi';

            // Validasi Kontak & Alamat
            if (!data.phone_number.trim()) {
                errs.phone_number = 'Nomor WhatsApp wajib diisi';
            } else if (data.phone_number.trim().length < 9) {
                errs.phone_number = 'Nomor WhatsApp minimal 9 digit';
            }
            if (!data.email.trim()) {
                errs.email = 'Alamat email aktif wajib diisi';
            } else if (!/\S+@\S+\.\S+/.test(data.email)) {
                errs.email = 'Format email tidak valid';
            }
            if (!data.address.trim()) errs.address = 'Alamat domisili lengkap wajib diisi';

            // Validasi Asal Sekolah
            if (!data.previous_school.trim()) errs.previous_school = 'Nama sekolah / madrasah asal wajib diisi';
            if (!data.nisn.trim()) {
                errs.nisn = 'Nomor NISN wajib diisi';
            } else if (data.nisn.trim().length !== 10 || !/^\d+$/.test(data.nisn.trim())) {
                errs.nisn = 'NISN harus tepat 10 digit angka';
            }

            // Validasi Pakta Persetujuan
            if (!agreed) errs.agreed = 'Anda wajib menyetujui pernyataan kebenaran data untuk melanjutkan';
        }

        setStepErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrev = () => {
        setStepErrors({});
        setCurrentStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateStep(2)) {
            post('/pmb/register');
        }
    };

    // Helper data prodi terpilih
    const selectedProdi1 = studyPrograms.find(p => String(p.id) === String(data.first_choice_program_id));
    const selectedProdi2 = studyPrograms.find(p => String(p.id) === String(data.second_choice_program_id));
    const selectedPathwayObj = pathways.find(p => p.id === data.pathway);

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-800 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex flex-col justify-between">
            <Head title="Pendaftaran PMB Online - STAI Al-Ittihad" />

            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-3xl mx-auto z-10 w-full">
                {/* Header Brand */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold mb-3 shadow-inner">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <span>PENERIMAAN MAHASISWA BARU (PMB) TA 2026/2027</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        FORMULIR PENDAFTARAN ONLINE
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur • Terakreditasi BAN-PT
                    </p>
                </div>

                {/* Banner Info Biaya & Host-to-Host BSI */}
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
                                Otomatis terbit <strong>Virtual Account Bank BSI (Prefix 9928)</strong> & Winpay
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

                {/* STEPPER WIZARD: HANYA 2 TAHAP SIMPEL */}
                <div className="bg-slate-900/90 backdrop-blur-md p-3.5 rounded-3xl border border-slate-800 shadow-xl mb-6">
                    <div className="grid grid-cols-2 gap-3">
                        {steps.map((s) => {
                            const IconComp = s.icon;
                            const isCompleted = currentStep > s.num;
                            const isActive = currentStep === s.num;

                            return (
                                <button
                                    key={s.num}
                                    type="button"
                                    onClick={() => {
                                        if (s.num < currentStep) setCurrentStep(s.num);
                                    }}
                                    className={`text-left p-3 rounded-2xl transition flex items-center space-x-3 cursor-pointer ${
                                        isActive 
                                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                                            : isCompleted 
                                                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' 
                                                : 'bg-slate-800/40 text-slate-400 border border-slate-800/60'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                                        isActive 
                                            ? 'bg-white text-emerald-700' 
                                            : isCompleted 
                                                ? 'bg-emerald-500 text-slate-950 font-black' 
                                                : 'bg-slate-800 text-slate-400'
                                    }`}>
                                        {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center space-x-1.5">
                                            <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : isCompleted ? 'text-emerald-200' : 'text-slate-300'}`}>
                                                {s.title}
                                            </p>
                                        </div>
                                        <p className={`text-[10px] truncate ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                                            {s.subtitle}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* MAIN FORM CONTAINER */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100">
                    <form onSubmit={handleSubmit}>

                        {/* ========================================================================= */}
                        {/* TAHAP 1: PILIHAN PROGRAM STUDI & JALUR PENDAFTARAN */}
                        {/* ========================================================================= */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-fade-in text-xs">
                                <div>
                                    <div className="flex items-center space-x-2.5">
                                        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
                                            <GraduationCap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-slate-900">
                                                Tahap 1: Pilihan Program Studi & Jalur Masuk
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Tentukan jurusan prioritas utama, jurusan cadangan (opsional), dan jalur masuk.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Pilihan Program Studi 1 (Prioritas Utama) */}
                                <div className="space-y-4">
                                    <PremiumProdiSelect
                                        label="Pilihan Program Studi 1 (Prioritas Utama)"
                                        badge="Prioritas Utama • Wajib"
                                        value={data.first_choice_program_id}
                                        onChange={(val) => {
                                            setData('first_choice_program_id', val);
                                            // Otomatis reset pilihan 2 jika sama dengan pilihan 1
                                            if (String(data.second_choice_program_id) === String(val)) {
                                                setData('second_choice_program_id', '');
                                            }
                                        }}
                                        options={studyPrograms}
                                        placeholder="-- Pilih Program Studi Utama --"
                                        required={true}
                                        error={stepErrors.first_choice_program_id}
                                        helperText="Jurusan utama yang menjadi prioritas utama seleksi kelulusan Anda di STAI Al-Ittihad."
                                        icon={GraduationCap}
                                    />

                                    {/* Pilihan Program Studi 2 (Cadangan / Alternatif - Opsional) */}
                                    <PremiumProdiSelect
                                        label="Pilihan Program Studi 2 (Cadangan / Alternatif)"
                                        badge="Pilihan Alternatif • Opsional"
                                        value={data.second_choice_program_id}
                                        onChange={(val) => setData('second_choice_program_id', val)}
                                        options={studyPrograms}
                                        isOptional={true}
                                        disabledIds={[data.first_choice_program_id]}
                                        placeholder="-- Tanpa Pilihan Kedua (Hanya 1 Pilihan) --"
                                        helperText="Pilihan alternatif jika kuota daya tampung jurusan prioritas utama telah penuh."
                                        icon={BookOpen}
                                    />
                                </div>

                                {/* Pilihan Jalur Pendaftaran */}
                                <div className="space-y-2.5 pt-2">
                                    <div className="flex items-center justify-between">
                                        <label className="font-bold text-slate-800 text-xs block">
                                            Pilih Jalur Pendaftaran <span className="text-rose-500">*</span>
                                        </label>
                                        <span className="text-[10px] text-slate-400">Pilih salah satu</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {pathways.map((item) => {
                                            const isSelected = data.pathway === item.id;
                                            const IconComp = item.icon;
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => setData('pathway', item.id)}
                                                    className={`p-3 rounded-2xl border-2 transition cursor-pointer flex items-start space-x-3 ${
                                                        isSelected
                                                            ? 'border-emerald-600 bg-emerald-50/60 shadow-sm ring-2 ring-emerald-500/20'
                                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'}`}>
                                                        <IconComp className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-black text-slate-900 text-xs truncate">{item.name}</p>
                                                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                                                isSelected ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-600'
                                                            }`}>
                                                                {item.badge}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{item.desc}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {stepErrors.pathway && (
                                        <p className="text-rose-600 font-bold text-[11px] mt-1 flex items-center space-x-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            <span>{stepErrors.pathway}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ========================================================================= */}
                        {/* TAHAP 2: PENGGABUNGAN DATA DIRI, KONTAK & ALAMAT, SERTA ASAL SEKOLAH */}
                        {/* ========================================================================= */}
                        {currentStep === 2 && (
                            <div className="space-y-7 animate-fade-in text-xs">
                                <div>
                                    <div className="flex items-center space-x-2.5">
                                        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
                                            <UserCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-slate-900">
                                                Tahap 2: Formulir Biodata Calon Mahasiswa & Konfirmasi
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Lengkapi data pribadi, kontak WhatsApp, alamat domisili, dan riwayat sekolah asal Anda.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* SEKSI 1: IDENTITAS PRIBADI */}
                                <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200">
                                    <div className="flex items-center space-x-2 pb-2 border-b border-slate-200">
                                        <User className="w-4 h-4 text-emerald-600" />
                                        <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                                            1. Identitas Pribadi Calon Mahasiswa
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        <div>
                                            <label className="font-bold text-slate-700 block mb-1">
                                                Nama Lengkap (Sesuai Ijazah) <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.full_name}
                                                onChange={(e) => setData('full_name', e.target.value)}
                                                placeholder="Contoh: Muhammad Rizky Pratama"
                                                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 uppercase shadow-xs"
                                                required
                                            />
                                            {stepErrors.full_name && (
                                                <p className="text-rose-600 font-bold text-[11px] mt-1">{stepErrors.full_name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="font-bold text-slate-700 block mb-1">
                                                Nama Ibu Kandung (Sesuai KK/Akta) <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.mother_name}
                                                onChange={(e) => setData('mother_name', e.target.value)}
                                                placeholder="Contoh: Siti Aminah"
                                                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 uppercase shadow-xs"
                                                required
                                            />
                                            {stepErrors.mother_name && (
                                                <p className="text-rose-600 font-bold text-[11px] mt-1">{stepErrors.mother_name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="font-bold text-slate-700">
                                                    Nomor Induk Kependudukan (NIK KTP/KK) <span className="text-rose-500">*</span>
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
                                                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-xs"
                                                required
                                            />
                                            {stepErrors.nik && (
                                                <p className="text-rose-600 font-bold text-[11px] mt-1">{stepErrors.nik}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="font-bold text-slate-700 block mb-1">
                                                Jenis Kelamin <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setData('gender', 'L')}
                                                    className={`p-2.5 rounded-xl border-2 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                                                        data.gender === 'L'
                                                            ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <span>👨 Laki-Laki (Ikhwan)</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setData('gender', 'P')}
                                                    className={`p-2.5 rounded-xl border-2 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                                                        data.gender === 'P'
                                                            ? 'bg-pink-50 border-pink-600 text-pink-900 shadow-xs'
                                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <span>🧕 Perempuan (Akhwat)</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="font-bold text-slate-700 block mb-1">
                                                Tempat Lahir <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.birth_place}
                                                onChange={(e) => setData('birth_place', e.target.value)}
                                                placeholder="Contoh: Cianjur"
                                                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-xs"
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
                                                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-xs"
                                                required
                                            />
                                            {stepErrors.birth_date && (
                                                <p className="text-rose-600 font-bold text-[11px] mt-1">{stepErrors.birth_date}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* SEKSI 2: KONTAK & ALAMAT DOMISILI */}
                                <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200">
                                    <div className="flex items-center space-x-2 pb-2 border-b border-slate-200">
                                        <Phone className="w-4 h-4 text-emerald-600" />
                                        <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                                            2. Kontak & Alamat Domisili
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="font-bold text-slate-700">
                                                    Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                                                </label>
                                                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                                                    Untuk Notifikasi VA
                                                </span>
                                            </div>
                                            <div className="relative">
                                                <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-3 pointer-events-none" />
                                                <input
                                                    type="tel"
                                                    value={data.phone_number}
                                                    onChange={(e) => setData('phone_number', e.target.value)}
                                                    placeholder="Contoh: 081234567890"
                                                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-xs"
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
                                                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    placeholder="nama.anda@gmail.com"
                                                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-xs"
                                                    required
                                                />
                                            </div>
                                            {stepErrors.email && (
                                                <p className="text-rose-600 font-bold text-[11px] mt-1">{stepErrors.email}</p>
                                            )}
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="font-bold text-slate-700 block mb-1">
                                                Alamat Domisili Lengkap <span className="text-rose-500">*</span>
                                            </label>
                                            <textarea
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                rows={2}
                                                placeholder="Nama Jalan, RT/RW, Dusun, Desa/Kelurahan, Kecamatan, Kabupaten/Kota, Provinsi"
                                                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 leading-relaxed focus:ring-2 focus:ring-emerald-500 shadow-xs"
                                                required
                                            />
                                            {stepErrors.address && (
                                                <p className="text-rose-600 font-bold text-[11px] mt-1">{stepErrors.address}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* SEKSI 3: RIWAYAT ASAL SEKOLAH */}
                                <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200">
                                    <div className="flex items-center space-x-2 pb-2 border-b border-slate-200">
                                        <School className="w-4 h-4 text-emerald-600" />
                                        <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                                            3. Riwayat Asal Sekolah / Madrasah
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        <div>
                                            <label className="font-bold text-slate-700 block mb-1">
                                                Nama Sekolah / Madrasah / Pesantren <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.previous_school}
                                                onChange={(e) => setData('previous_school', e.target.value)}
                                                placeholder="Contoh: MAN 1 Cianjur / SMA Negeri 1 Cianjur"
                                                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-xs"
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
                                                placeholder="10 Digit Angka NISN"
                                                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-xs"
                                                required
                                            />
                                            {stepErrors.nisn && (
                                                <p className="text-rose-600 font-bold text-[11px] mt-1">{stepErrors.nisn}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* SEKSI 4: RINGKASAN PENDAFTARAN & KARTU TAGIHAN VA BSI */}
                                <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3.5 shadow-xl">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                        <div className="flex items-center space-x-2">
                                            <Sparkles className="w-4 h-4 text-emerald-400" />
                                            <span className="font-black text-white uppercase text-xs">
                                                Ringkasan Data Pendaftaran
                                            </span>
                                        </div>
                                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-bold text-[10px] border border-emerald-500/30">
                                            {selectedPathwayObj?.name || data.pathway}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                                        <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                                            <p className="text-slate-400 text-[10px]">Program Studi Pilihan 1 (Utama):</p>
                                            <p className="font-black text-emerald-400 text-xs mt-0.5">
                                                {selectedProdi1 ? `[${selectedProdi1.degree || 'S1'}] ${selectedProdi1.code} - ${selectedProdi1.name}` : '-'}
                                            </p>
                                            {selectedProdi1?.faculty_name && (
                                                <p className="text-[10px] text-slate-400 mt-0.5">{selectedProdi1.faculty_name}</p>
                                            )}
                                        </div>

                                        <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                                            <p className="text-slate-400 text-[10px]">Program Studi Pilihan 2 (Cadangan):</p>
                                            <p className="font-bold text-slate-200 text-xs mt-0.5">
                                                {selectedProdi2 ? `[${selectedProdi2.degree || 'S1'}] ${selectedProdi2.code} - ${selectedProdi2.name}` : 'Tanpa Pilihan Kedua'}
                                            </p>
                                            {selectedProdi2?.faculty_name && (
                                                <p className="text-[10px] text-slate-400 mt-0.5">{selectedProdi2.faculty_name}</p>
                                            )}
                                        </div>

                                        <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                                            <p className="text-slate-400 text-[10px]">Calon Mahasiswa / NIK:</p>
                                            <p className="font-black text-white text-xs mt-0.5 truncate">{data.full_name || '-'}</p>
                                            <p className="font-mono text-[10px] text-slate-400">{data.nik || '-'}</p>
                                        </div>

                                        <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                                            <p className="text-slate-400 text-[10px]">Kontak WhatsApp & Email:</p>
                                            <p className="font-bold text-white text-xs mt-0.5">{data.phone_number || '-'}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{data.email || '-'}</p>
                                        </div>
                                    </div>

                                    {/* Preview Nominal Tagihan & VA BSI */}
                                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between bg-emerald-950/80 p-3 rounded-xl border border-emerald-500/30">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-lg">
                                                <CreditCard className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-emerald-300 font-bold">Biaya Registrasi Pendaftaran:</p>
                                                <p className="text-base font-black text-white">Rp 250.000,-</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] px-2.5 py-1 bg-emerald-500/30 text-emerald-200 rounded-lg font-bold border border-emerald-400/40">
                                                Auto Virtual Account BSI
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Pakta Pernyataan Checkbox */}
                                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        id="agreeCheckbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="w-4 h-4 mt-0.5 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                                    />
                                    <label htmlFor="agreeCheckbox" className="text-[11px] text-amber-900 font-medium cursor-pointer leading-relaxed">
                                        Saya menyatakan dengan sesungguhnya bahwa seluruh data yang diisikan pada formulir ini adalah benar, sah, dan dapat dipertanggungjawabkan. Saya bersedia mematuhi segala tata tertib PMB STAI Al-Ittihad Cianjur.
                                    </label>
                                </div>
                                {stepErrors.agreed && (
                                    <p className="text-rose-600 font-bold text-[11px] flex items-center space-x-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span>{stepErrors.agreed}</span>
                                    </p>
                                )}
                            </div>
                        )}

                        {/* ========================================================================= */}
                        {/* NAVIGATION BUTTONS */}
                        {/* ========================================================================= */}
                        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
                            {currentStep === 2 ? (
                                <button
                                    type="button"
                                    onClick={handlePrev}
                                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span>Kembali ke Pilihan Prodi</span>
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {currentStep === 1 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black transition shadow-lg shadow-emerald-600/30 flex items-center space-x-2 cursor-pointer"
                                >
                                    <span>Lanjut ke Pengisian Biodata Calon Mhs</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={processing || !agreed}
                                    className="px-7 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white rounded-xl text-xs font-black transition shadow-xl shadow-emerald-600/30 flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ShieldCheck className="w-4 h-4 text-emerald-200" />
                                    <span>{processing ? 'Menerbitkan Nomor VA BSI...' : 'Kirim Pendaftaran & Buat Kode VA BSI'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer Link: Cek Status PMB */}
                <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center space-x-3">
                    <span>Sudah mendaftar sebelumnya?</span>
                    <Link href="/pmb/status" className="font-bold text-emerald-400 hover:text-emerald-300 transition underline">
                        Cek Status & Tagihan VA Anda di Sini →
                    </Link>
                </div>
            </div>

            {/* Bottom copyright */}
            <div className="text-center text-[10px] text-slate-500 mt-8">
                &copy; {new Date().getFullYear()} STAI Al-Ittihad Cianjur. Sistem Penerimaan Mahasiswa Baru Terintegrasi Host-to-Host Bank BSI.
            </div>
        </div>
    );
}
