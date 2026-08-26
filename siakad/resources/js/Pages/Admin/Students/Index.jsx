import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import ImpersonationModal from '../../../Components/ImpersonationModal';
import { 
    Users, Search, UserPlus, Upload, Download, Filter, 
    Edit2, KeyRound, Trash2, CheckCircle2, ChevronRight,
    GraduationCap, Calendar, BookOpen, CreditCard, ShieldCheck,
    AlertCircle, X, FileSpreadsheet, Phone, Mail, Copy, Check,
    RefreshCw, Layers, Clock
} from 'lucide-react';

export default function StudentsIndex({ students, academicYears = [], studyPrograms = [], activePeriod, stats = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [year, setYear] = useState(filters.academic_year || '');
    const [prodi, setProdi] = useState(filters.study_program || '');
    const [status, setStatus] = useState(filters.status || '');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isImpersonateOpen, setIsImpersonateOpen] = useState(false);
    const [copiedNim, setCopiedNim] = useState(null);

    // Create Form
    const createForm = useForm({
        name: '',
        identity_number: '',
        email: '',
        study_program: studyPrograms[0]?.name || 'Pendidikan Agama Islam (S1)',
        gender: 'L',
        phone_number: '',
    });

    // Edit Form
    const editForm = useForm({
        name: '',
        identity_number: '',
        email: '',
        study_program: '',
        gender: 'L',
        phone_number: '',
        is_active: true,
    });

    // Import State
    const [importRecords, setImportRecords] = useState([]);
    const [importFileName, setImportFileName] = useState('');
    const [importError, setImportError] = useState('');

    const handleFilterChange = (newYear, newProdi, newStatus) => {
        router.get('/admin/students', { 
            search, 
            academic_year: newYear, 
            study_program: newProdi,
            status: newStatus 
        }, { preserveState: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/students', { 
            search, 
            academic_year: year, 
            study_program: prodi,
            status 
        }, { preserveState: true });
    };

    const handleResetFilter = () => {
        setSearch('');
        setYear('');
        setProdi('');
        setStatus('');
        router.get('/admin/students', {}, { preserveState: true });
    };

    const handleOpenEdit = (stu) => {
        setSelectedStudent(stu);
        editForm.setData({
            name: stu.name,
            identity_number: stu.identity_number || stu.username || '',
            email: stu.email || '',
            study_program: stu.study_program || '',
            gender: stu.gender || 'L',
            phone_number: stu.phone_number || '',
            is_active: Boolean(stu.is_active),
        });
        setIsEditOpen(true);
    };

    const handleOpenDelete = (stu) => {
        setSelectedStudent(stu);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!selectedStudent) return;
        router.delete(`/admin/students/${selectedStudent.id}`, {
            onSuccess: () => setIsDeleteOpen(false),
        });
    };

    const handleOpenImpersonate = (stu) => {
        setSelectedStudent(stu);
        setIsImpersonateOpen(true);
    };

    const handleCopyNim = (nim) => {
        if (!nim) return;
        navigator.clipboard.writeText(nim);
        setCopiedNim(nim);
        setTimeout(() => setCopiedNim(null), 2000);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post('/admin/students', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        editForm.put(`/admin/students/${selectedStudent.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
            },
        });
    };

    const handleResetPassword = (stu) => {
        if (confirm(`Reset kata sandi mahasiswa ${stu.name} (${stu.identity_number}) ke password default 'salam123'?`)) {
            router.post(`/admin/users/${stu.id}/reset-password`);
        }
    };

    const handleToggleStatus = (stu) => {
        router.post(`/admin/users/${stu.id}/toggle-status`);
    };

    // CSV File Reader for Real Batch Import
    const handleFileUpload = (e) => {
        setImportError('');
        const file = e.target.files[0];
        if (!file) return;

        setImportFileName(file.name);
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
                if (lines.length <= 1) {
                    setImportError('Berkas CSV kosong atau tidak memiliki baris data.');
                    return;
                }

                // Ambil header
                const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
                const records = [];

                for (let i = 1; i < lines.length; i++) {
                    const row = lines[i].split(',').map(item => item.trim().replace(/"/g, ''));
                    if (row.length < 2) continue;

                    // Mapping fleksibel
                    const name = row[0] || '';
                    const identity_number = row[1] || '';
                    const email = row[2] || `${identity_number}@staialittihad.ac.id`;
                    const study_program = row[3] || 'Pendidikan Agama Islam (S1)';
                    const gender = (row[4] && row[4].toUpperCase() === 'P') ? 'P' : 'L';
                    const phone_number = row[5] || '';

                    if (name && identity_number) {
                        records.push({ name, identity_number, email, study_program, gender, phone_number });
                    }
                }

                if (records.length === 0) {
                    setImportError('Tidak ada baris data valid yang terbaca. Pastikan format kolom: Nama, NIM, Email, Prodi, Gender(L/P), NoHP');
                } else {
                    setImportRecords(records);
                }
            } catch (err) {
                setImportError('Gagal memproses berkas CSV: ' + err.message);
            }
        };

        reader.readAsText(file);
    };

    const handleDownloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,\uFEFFNama Lengkap,NIM,Email,Program Studi,Jenis Kelamin (L/P),Nomor Telepon\nMuhammad Rizky Pratama,26010001,rizky.pratama@staialittihad.ac.id,Pendidikan Agama Islam (S1),L,081234567890\nNabila Nur Azizah,26010002,nabila.azizah@staialittihad.ac.id,Pendidikan Agama Islam (S1),P,081234567891\nSiti Sarah Rahmawati,26020001,siti.sarah@staialittihad.ac.id,Pendidikan Islam Anak Usia Dini (S1),P,081234567892";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "template_impor_mahasiswa_siakad.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleGenerateMockImport = () => {
        const mockData = [
            { name: 'Muhammad Farhan Al-Ghifari', identity_number: '26010011', email: 'farhan.ghifari@staialittihad.ac.id', study_program: 'Pendidikan Agama Islam (S1)', gender: 'L', phone_number: '085712345678' },
            { name: 'Aisyah Putri Humaira', identity_number: '26010012', email: 'aisyah.humaira@staialittihad.ac.id', study_program: 'Pendidikan Agama Islam (S1)', gender: 'P', phone_number: '085712345679' },
            { name: 'Bilal Ahmad Zulfikar', identity_number: '26020015', email: 'bilal.zulfikar@staialittihad.ac.id', study_program: 'Pendidikan Islam Anak Usia Dini (S1)', gender: 'L', phone_number: '085712345680' },
        ];
        setImportRecords(mockData);
        setImportFileName('contoh_data_mahasiswa_angkatan2026.csv');
    };

    const handleImportSubmit = () => {
        router.post('/admin/students/import-batch', { records: importRecords }, {
            onSuccess: () => {
                setIsImportOpen(false);
                setImportRecords([]);
                setImportFileName('');
            },
        });
    };

    // Angkatan cepat
    const batchList = ['2026', '2025', '2024', '2023', '2022', '2021'];

    return (
        <AppLayout title="Direktori Data Mahasiswa">
            <Head title="Data Mahasiswa — SIAKAD STAI Al-Ittihad" />

            {/* Impersonation Modal */}
            <ImpersonationModal
                isOpen={isImpersonateOpen}
                onClose={() => setIsImpersonateOpen(false)}
                targetUser={selectedStudent}
            />

            <div className="space-y-4">
                {/* 1. Header Banner & Quick Actions */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black mb-1">
                            <GraduationCap className="w-3 h-3 text-emerald-600" />
                            <span>DIREKTORI CIVITAS AKADEMIKA</span>
                        </div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">
                            Direktori & Data Induk Mahasiswa
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                            Kelola data mahasiswa seluruh angkatan, filter program studi, pemantauan status persetujuan KRS, pelunasan SPP BSI, dan mode akses menyamar.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={`/admin/students/export?search=${encodeURIComponent(search)}&academic_year=${encodeURIComponent(year)}&study_program=${encodeURIComponent(prodi)}&status=${encodeURIComponent(status)}`}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-slate-200 cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5 text-slate-600" />
                            <span>Ekspor CSV</span>
                        </a>

                        <button
                            type="button"
                            onClick={() => {
                                setImportRecords([]);
                                setImportFileName('');
                                setImportError('');
                                setIsImportOpen(true);
                            }}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                        >
                            <Upload className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Impor Excel / CSV</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                createForm.reset();
                                setIsCreateOpen(true);
                            }}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                        >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Tambah Mahasiswa</span>
                        </button>
                    </div>
                </div>

                {/* 2. KPI Summary Cards (4 Cards) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[10px] font-bold">Total Terdaftar</span>
                            <span className="p-1 rounded-lg bg-teal-50 text-teal-700"><Users className="w-3.5 h-3.5" /></span>
                        </div>
                        <p className="text-xl font-black text-slate-900 mt-1">{stats.total ?? 0}</p>
                        <p className="text-[10px] text-teal-600 font-semibold mt-0.5">Semua Angkatan & Prodi</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[10px] font-bold">Akun Aktif</span>
                            <span className="p-1 rounded-lg bg-emerald-50 text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                        </div>
                        <p className="text-xl font-black text-emerald-600 mt-1">{stats.active ?? 0}</p>
                        <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Dapat Login ke Portal</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[10px] font-bold">KRS Disetujui</span>
                            <span className="p-1 rounded-lg bg-indigo-50 text-indigo-700"><BookOpen className="w-3.5 h-3.5" /></span>
                        </div>
                        <p className="text-xl font-black text-indigo-600 mt-1">{stats.krs_completed ?? 0}</p>
                        <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">Periode Akademik Aktif</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[10px] font-bold">VA SPP Lunas</span>
                            <span className="p-1 rounded-lg bg-cyan-50 text-cyan-700"><CreditCard className="w-3.5 h-3.5" /></span>
                        </div>
                        <p className="text-xl font-black text-cyan-600 mt-1">{stats.paid_invoices ?? 0}</p>
                        <p className="text-[10px] text-cyan-600 font-semibold mt-0.5">Terverifikasi BSI H2H</p>
                    </div>
                </div>

                {/* 3. Filter Controls & Search Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    {/* Quick Angkatan Pills */}
                    <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
                        <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center space-x-1 shrink-0">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Angkatan:</span>
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                setYear('');
                                handleFilterChange('', prodi, status);
                            }}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition shrink-0 cursor-pointer ${
                                year === ''
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Semua
                        </button>
                        {batchList.map((b) => (
                            <button
                                key={b}
                                type="button"
                                onClick={() => {
                                    setYear(b);
                                    handleFilterChange(b, prodi, status);
                                }}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition shrink-0 cursor-pointer ${
                                    year === b
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {b} {b === '2026' ? '(Baru)' : ''}
                            </button>
                        ))}
                    </div>

                    {/* Filter Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 pt-1">
                        {/* Prodi Selector */}
                        <div className="lg:col-span-4">
                            <select
                                value={prodi}
                                onChange={(e) => {
                                    setProdi(e.target.value);
                                    handleFilterChange(year, e.target.value, status);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Semua Program Studi</option>
                                {studyPrograms.map((p) => (
                                    <option key={p.id} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Akun Selector */}
                        <div className="lg:col-span-2">
                            <select
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    handleFilterChange(year, prodi, e.target.value);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Semua Status</option>
                                <option value="active">● Aktif Saja</option>
                                <option value="inactive">○ Nonaktif Saja</option>
                            </select>
                        </div>

                        {/* Search Input Form */}
                        <form onSubmit={handleSearch} className="lg:col-span-6 flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama, NIM, email, atau no. telepon..."
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            router.get('/admin/students', { academic_year: year, study_program: prodi, status }, { preserveState: true });
                                        }}
                                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
                            >
                                Cari
                            </button>
                            {(search || year || prodi || status) && (
                                <button
                                    type="button"
                                    onClick={handleResetFilter}
                                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
                                    title="Reset Semua Filter"
                                >
                                    Reset
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                {/* 4. Main Students Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-4">Mahasiswa</th>
                                    <th className="py-3 px-4">NIM & Angkatan</th>
                                    <th className="py-3 px-4">Program Studi</th>
                                    <th className="py-3 px-4 text-center">KRS Semester</th>
                                    <th className="py-3 px-4 text-center">Status BSI VA</th>
                                    <th className="py-3 px-4 text-center">Status Akun</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <Users className="w-8 h-8 text-slate-300" />
                                                <p className="font-bold text-slate-600 text-xs">Tidak ada data mahasiswa ditemukan</p>
                                                <p className="text-[11px] text-slate-400">Cobalah mengubah kata kunci pencarian atau reset filter angkatan/prodi.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    students.data.map((stu) => (
                                        <tr key={stu.id} className="hover:bg-slate-50/70 transition">
                                            {/* Info Mahasiswa */}
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-800 to-teal-600 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                                                        {stu.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 text-xs">{stu.name}</p>
                                                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                                                            <span className="font-mono">{stu.email}</span>
                                                            {stu.phone_number && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>{stu.phone_number}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* NIM & Angkatan */}
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-1.5">
                                                    <span className="font-mono font-bold text-slate-900 text-xs">
                                                        {stu.identity_number || stu.username}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyNim(stu.identity_number || stu.username)}
                                                        className="text-slate-400 hover:text-emerald-600 transition p-0.5 rounded cursor-pointer"
                                                        title="Salin NIM"
                                                    >
                                                        {copiedNim === (stu.identity_number || stu.username) ? (
                                                            <Check className="w-3 h-3 text-emerald-600" />
                                                        ) : (
                                                            <Copy className="w-3 h-3" />
                                                        )}
                                                    </button>
                                                </div>
                                                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold text-[9px]">
                                                    Angkatan {stu.batch_year}
                                                </span>
                                            </td>

                                            {/* Program Studi */}
                                            <td className="py-3 px-4">
                                                <p className="text-slate-800 font-bold text-xs">{stu.study_program || 'Pendidikan Agama Islam (S1)'}</p>
                                                <span className="text-[10px] text-slate-400">
                                                    {stu.gender === 'P' ? 'Perempuan (Akhwat)' : 'Laki-laki (Ikhwan)'}
                                                </span>
                                            </td>

                                            {/* Status KRS */}
                                            <td className="py-3 px-4 text-center">
                                                {stu.krs_status === 'DISETUJUI' ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                                        <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                                                        DISETUJUI
                                                    </span>
                                                ) : stu.krs_status === 'DIAJUKAN' ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                                                        <Clock className="w-2.5 h-2.5 mr-1" />
                                                        DIAJUKAN
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                                                        BELUM KRS
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status Tagihan VA SPP */}
                                            <td className="py-3 px-4 text-center">
                                                {stu.invoice_status === 'LUNAS' ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                                        LUNAS
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                                                        BELUM LUNAS
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status Akun (Toggle) */}
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(stu)}
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-black transition cursor-pointer ${
                                                        stu.is_active 
                                                            ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200' 
                                                            : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                                                    }`}
                                                    title="Klik untuk mengubah status aktif/nonaktif akun"
                                                >
                                                    {stu.is_active ? '● AKTIF' : '○ NONAKTIF'}
                                                </button>
                                            </td>

                                            {/* Action Buttons */}
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end space-x-1">
                                                    {/* Impersonate Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenImpersonate(stu)}
                                                        title="Masuk sebagai mahasiswa ini (Mode Menyamar)"
                                                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[10px] font-black transition flex items-center space-x-1 cursor-pointer"
                                                    >
                                                        <span>🎭</span>
                                                        <span className="hidden sm:inline">Menyamar</span>
                                                    </button>

                                                    {/* Edit Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(stu)}
                                                        title="Edit Data Mahasiswa"
                                                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Reset Password Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleResetPassword(stu)}
                                                        title="Reset Password ke default (salam123)"
                                                        className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 rounded-lg transition cursor-pointer"
                                                    >
                                                        <KeyRound className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Delete Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenDelete(stu)}
                                                        title="Hapus Mahasiswa"
                                                        className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 rounded-lg transition cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <span className="text-slate-500">
                            Menampilkan <strong className="text-slate-800">{students.from || 0}</strong> - <strong className="text-slate-800">{students.to || 0}</strong> dari <strong className="text-slate-800">{students.total}</strong> mahasiswa
                        </span>
                        <div className="flex items-center space-x-1">
                            {students.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                        link.active
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : link.url
                                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            : 'text-slate-300 pointer-events-none'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* MODAL 1: TAMBAH MAHASISWA BARU */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center space-x-2">
                                    <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                                        <UserPlus className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase">Tambah Mahasiswa Baru</h3>
                                </div>
                                <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Mahasiswa:</label>
                                    <input
                                        type="text"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="Contoh: Muhammad Farhan Al-Ghifari"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Nomor Induk Mahasiswa (NIM):</label>
                                        <input
                                            type="text"
                                            value={createForm.data.identity_number}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                createForm.setData({
                                                    ...createForm.data,
                                                    identity_number: val,
                                                    email: val ? `${val}@staialittihad.ac.id` : createForm.data.email
                                                });
                                            }}
                                            placeholder="Contoh: 26010001"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin:</label>
                                        <select
                                            value={createForm.data.gender}
                                            onChange={(e) => createForm.setData('gender', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            <option value="L">Laki-laki (Ikhwan)</option>
                                            <option value="P">Perempuan (Akhwat)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Email Resmi:</label>
                                        <input
                                            type="email"
                                            value={createForm.data.email}
                                            onChange={(e) => createForm.setData('email', e.target.value)}
                                            placeholder="farhan@staialittihad.ac.id"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Nomor Telepon / WA:</label>
                                        <input
                                            type="text"
                                            value={createForm.data.phone_number}
                                            onChange={(e) => createForm.setData('phone_number', e.target.value)}
                                            placeholder="08123456789"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Program Studi:</label>
                                    <select
                                        value={createForm.data.study_program}
                                        onChange={(e) => createForm.setData('study_program', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {studyPrograms.map((p) => (
                                            <option key={p.id} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 text-[11px] font-medium border border-emerald-100 flex items-center space-x-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>Akun otomatis aktif dengan password awal default: <strong className="font-mono">salam123</strong>.</span>
                                </div>

                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition">Batal</button>
                                    <button type="submit" disabled={createForm.processing} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition">Simpan Mahasiswa</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 2: EDIT MAHASISWA */}
                {isEditOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center space-x-2">
                                    <div className="p-1.5 bg-indigo-100 text-indigo-800 rounded-lg">
                                        <Edit2 className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase">Edit Data Mahasiswa</h3>
                                </div>
                                <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Mahasiswa:</label>
                                    <input
                                        type="text"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">NIM:</label>
                                        <input
                                            type="text"
                                            value={editForm.data.identity_number}
                                            onChange={(e) => editForm.setData('identity_number', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin:</label>
                                        <select
                                            value={editForm.data.gender}
                                            onChange={(e) => editForm.setData('gender', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            <option value="L">Laki-laki (Ikhwan)</option>
                                            <option value="P">Perempuan (Akhwat)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Email:</label>
                                        <input
                                            type="email"
                                            value={editForm.data.email}
                                            onChange={(e) => editForm.setData('email', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Nomor Telepon / WA:</label>
                                        <input
                                            type="text"
                                            value={editForm.data.phone_number}
                                            onChange={(e) => editForm.setData('phone_number', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Program Studi:</label>
                                    <select
                                        value={editForm.data.study_program}
                                        onChange={(e) => editForm.setData('study_program', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {studyPrograms.map((p) => (
                                            <option key={p.id} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center space-x-2 pt-1">
                                    <input
                                        type="checkbox"
                                        id="edit_is_active"
                                        checked={editForm.data.is_active}
                                        onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                        className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                    />
                                    <label htmlFor="edit_is_active" className="font-bold text-slate-800">
                                        Akun Aktif (Dapat Login & Isi KRS)
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition">Batal</button>
                                    <button type="submit" disabled={editForm.processing} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition">Simpan Perubahan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 3: IMPOR MASSAL EXCEL / CSV */}
                {isImportOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center space-x-2">
                                    <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                                        <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase">Impor Massal Mahasiswa Baru</h3>
                                </div>
                                <button onClick={() => setIsImportOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3.5 text-xs">
                                {/* Template download & Mock button */}
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <p className="font-bold text-slate-800">Format Template Berkas CSV</p>
                                        <p className="text-[11px] text-slate-500">Kolom: Nama, NIM, Email, Prodi, Gender (L/P), NoHP</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={handleDownloadTemplate}
                                            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-bold transition flex items-center space-x-1 cursor-pointer"
                                        >
                                            <Download className="w-3 h-3 text-slate-500" />
                                            <span>Unduh Template</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleGenerateMockImport}
                                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg font-bold transition cursor-pointer"
                                        >
                                            Muat Contoh Data
                                        </button>
                                    </div>
                                </div>

                                {/* Real File Input */}
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Unggah Berkas CSV:</label>
                                    <input
                                        type="file"
                                        accept=".csv,.txt"
                                        onChange={handleFileUpload}
                                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 border border-slate-200 rounded-xl p-1 bg-slate-50 cursor-pointer"
                                    />
                                    {importFileName && (
                                        <p className="text-[11px] text-emerald-600 font-bold mt-1">
                                            ✓ Berkas terpilih: {importFileName}
                                        </p>
                                    )}
                                    {importError && (
                                        <p className="text-[11px] text-rose-600 font-bold mt-1">
                                            ⚠️ {importError}
                                        </p>
                                    )}
                                </div>

                                {/* Preview Data */}
                                {importRecords.length > 0 && (
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="p-2.5 bg-slate-100 font-black text-[10px] uppercase text-slate-700 flex items-center justify-between">
                                            <span>Pratinjau Data ({importRecords.length} Mahasiswa)</span>
                                            <span className="text-emerald-700 font-bold">Siap Diproses</span>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                                            {importRecords.map((r, idx) => (
                                                <div key={idx} className="p-2.5 flex items-center justify-between text-[11px] hover:bg-slate-50">
                                                    <div>
                                                        <span className="font-bold text-slate-900">{r.name}</span>
                                                        <span className="text-slate-400 font-mono ml-2 font-bold">({r.identity_number})</span>
                                                    </div>
                                                    <span className="text-slate-600 text-[10px]">{r.study_program}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsImportOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition">Batal</button>
                                    <button
                                        type="button"
                                        onClick={handleImportSubmit}
                                        disabled={importRecords.length === 0}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
                                    >
                                        Proses Impor {importRecords.length > 0 ? `(${importRecords.length})` : ''} Mahasiswa
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL 4: KONFIRMASI HAPUS MAHASISWA */}
                {isDeleteOpen && selectedStudent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center space-x-3 text-rose-600">
                                <div className="p-2 bg-rose-100 rounded-xl">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-black text-slate-900 uppercase">Konfirmasi Hapus Mahasiswa</h3>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed">
                                Apakah Anda yakin ingin menghapus data mahasiswa <strong className="text-slate-900">{selectedStudent.name}</strong> (NIM: <strong className="font-mono text-slate-900">{selectedStudent.identity_number || selectedStudent.username}</strong>)?
                            </p>

                            <div className="p-3 bg-amber-50 rounded-xl text-amber-800 text-[11px] border border-amber-200">
                                ⚠️ Jika mahasiswa sudah memiliki riwayat KRS atau transaksi SPP, sistem akan secara aman mengubah status akun menjadi <strong>NONAKTIF</strong> untuk menjaga integritas data akademik.
                            </div>

                            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsDeleteOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition text-xs cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition text-xs cursor-pointer shadow-xs"
                                >
                                    Ya, Hapus Mahasiswa
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
