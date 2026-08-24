import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { GraduationCap, Sparkles, CreditCard, ShieldCheck, CheckCircle2, ChevronRight, School, ArrowRight } from 'lucide-react';

export default function PmbRegister({ pmbPeriod, studyPrograms }) {
    const { data, setData, post, processing, errors } = useForm({
        pmb_period_id: pmbPeriod?.id || 1,
        full_name: '',
        nik: '',
        phone_number: '',
        email: '',
        gender: 'L',
        birth_place: '',
        birth_date: '',
        address: '',
        previous_school: '',
        first_choice_program_id: studyPrograms[0]?.id || 1,
        second_choice_program_id: studyPrograms[1]?.id || '',
        pathway: 'REGULER',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/pmb/register');
    };

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-800 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <Head title="Pendaftaran Mahasiswa Baru — STAI Al-Ittihad" />

            {/* Background Gradient Blurs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-3xl mx-auto z-10 relative">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold mb-3">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>Penerimaan Mahasiswa Baru (PMB) Online TA 2026/2027</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">FORMULIR PENDAFTARAN MAHASISWA BARU</h1>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-10 border border-slate-100 space-y-6">
                    {/* Info Biaya & VA BSI Banner */}
                    <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Biaya Registrasi Pendaftaran PMB</p>
                            <p className="text-xl font-black text-white">Rp 250.000,-</p>
                            <p className="text-[11px] text-slate-300">Otomatis terhubung ke Virtual Account Bank Syariah Indonesia (BSI)</p>
                        </div>
                        <div className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-emerald-300 flex items-center space-x-1.5 self-start sm:self-auto">
                            <CreditCard className="w-4 h-4" />
                            <span>Auto VA BSI Host-to-Host</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
                            1. Data Pribadi Calon Mahasiswa
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap (Sesuai Ijazah/KTP) *</label>
                                <input
                                    type="text"
                                    value={data.full_name}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                    placeholder="Contoh: Muhammad Rizky Pratama"
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    required
                                />
                                {errors.full_name && <p className="text-rose-600 text-[10px] font-bold mt-0.5">{errors.full_name}</p>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Nomor Induk Kependudukan (NIK) *</label>
                                <input
                                    type="text"
                                    maxLength={16}
                                    value={data.nik}
                                    onChange={(e) => setData('nik', e.target.value)}
                                    placeholder="16 Digit NIK KTP/KK"
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    required
                                />
                                {errors.nik && <p className="text-rose-600 text-[10px] font-bold mt-0.5">{errors.nik}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin *</label>
                                <select
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                                >
                                    <option value="L">Laki-Laki (Ikhwan)</option>
                                    <option value="P">Perempuan (Akhwat)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Tempat Lahir *</label>
                                <input
                                    type="text"
                                    value={data.birth_place}
                                    onChange={(e) => setData('birth_place', e.target.value)}
                                    placeholder="Contoh: Cianjur"
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Tanggal Lahir *</label>
                                <input
                                    type="date"
                                    value={data.birth_date}
                                    onChange={(e) => setData('birth_date', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp / HP Aktif *</label>
                                <input
                                    type="tel"
                                    value={data.phone_number}
                                    onChange={(e) => setData('phone_number', e.target.value)}
                                    placeholder="081234567890"
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Email Aktif *</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="nama@email.com"
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1">Alamat Domisili Lengkap *</label>
                            <textarea
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                rows={2}
                                placeholder="Jalan, RT/RW, Desa/Kelurahan, Kecamatan, Kabupaten/Kota"
                                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                                required
                            />
                        </div>

                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1 pt-2">
                            2. Asal Sekolah & Pilihan Program Studi
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Asal Sekolah / Madrasah / Pesantren *</label>
                                <input
                                    type="text"
                                    value={data.previous_school}
                                    onChange={(e) => setData('previous_school', e.target.value)}
                                    placeholder="Contoh: MAN 1 Cianjur / Ponpes Al-Ittihad"
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Jalur Pendaftaran *</label>
                                <select
                                    value={data.pathway}
                                    onChange={(e) => setData('pathway', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                                >
                                    <option value="REGULER">Jalur Reguler (Tes)</option>
                                    <option value="BEASISWA_PRESTASI">Jalur Beasiswa Prestasi Akademik</option>
                                    <option value="TAHFIDZ">Jalur Beasiswa Tahfidz Qur'an</option>
                                    <option value="PINDAHAN">Jalur Transfer / Mahasiswa Pindahan</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Pilihan Program Studi 1 (Utama) *</label>
                                <select
                                    value={data.first_choice_program_id}
                                    onChange={(e) => setData('first_choice_program_id', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-emerald-800"
                                >
                                    {studyPrograms.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.degree})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Pilihan Program Studi 2 (Cadangan)</label>
                                <select
                                    value={data.second_choice_program_id}
                                    onChange={(e) => setData('second_choice_program_id', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                                >
                                    <option value="">-- Tanpa Pilihan Kedua --</option>
                                    {studyPrograms.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.degree})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                <span>Kirim Pendaftaran & Buat Kode VA BSI</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer Link */}
                <div className="mt-6 text-center text-xs text-slate-400">
                    Sudah pernah mendaftar?{' '}
                    <Link href="/pmb/status" className="font-bold text-emerald-400 hover:underline">
                        Cek Status & Nomor VA BSI di Sini
                    </Link>
                </div>
            </div>
        </div>
    );
}
