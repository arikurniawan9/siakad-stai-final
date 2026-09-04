/**
 * STANDARD EXPORT & IMPORT SCHEMAS ACROSS SALAM LMS
 * STAI AL-ITTIHAD CIANJUR
 */

import { ImportSchema } from '../types/exportImport';
import { CreateStudentInput } from '../types/studentAdmin';
import { CreateLecturerInput } from '../types/lecturerAdmin';
import { CreateCourseInput } from '../types/courseAdmin';
import { CreateScheduleInput } from '../types/scheduleAdmin';
import { StudyProgram } from '../types/studyProgram';
import { ImportQuestionInput } from '../types/quiz';

/**
 * 1. MAHASISWA IMPORT SCHEMA
 */
export const STUDENT_IMPORT_SCHEMA: ImportSchema<CreateStudentInput> = {
  entityName: 'Mahasiswa',
  instructions: [
    'Pastikan format NIM unik (contoh: 22.01.0015).',
    'Kolom Program Studi dapat diisi kode prodi (PAI, MPI, HES, PGMI, ESY) atau nama prodi.',
    'Status akademik default adalah AKTIF jika dikosongkan.'
  ],
  fields: [
    {
      key: 'nim',
      label: 'Nomor Induk Mahasiswa (NIM)',
      type: 'string',
      required: true,
      aliases: ['nim', 'nomor_induk', 'student_id', 'no_induk'],
      sampleValue: '24.01.0099',
      validate: (v) => (String(v).trim().length >= 4 ? true : 'NIM minimal 4 karakter')
    },
    {
      key: 'name',
      label: 'Nama Lengkap Mahasiswa',
      type: 'string',
      required: true,
      aliases: ['nama', 'nama_lengkap', 'full_name', 'student_name'],
      sampleValue: 'Muhammad Farhan Azhari'
    },
    {
      key: 'email',
      label: 'Alamat Email Resmi',
      type: 'email',
      required: true,
      aliases: ['email', 'surel', 'student_email', 'mail'],
      sampleValue: 'm.farhan@student.stai-alittihad.ac.id'
    },
    {
      key: 'studyProgramId',
      label: 'Program Studi / Homebase',
      type: 'string',
      required: true,
      aliases: ['prodi', 'program_studi', 'kode_prodi', 'study_program'],
      sampleValue: 'prodi-pai',
      transform: (v) => {
        const val = String(v).toLowerCase();
        if (val.includes('pai') || val.includes('agama')) return 'prodi-pai';
        if (val.includes('mpi') || val.includes('manajemen')) return 'prodi-mpi';
        if (val.includes('hes') || val.includes('hukum') || val.includes('muamalah')) return 'prodi-hes';
        if (val.includes('pgmi') || val.includes('madrasah') || val.includes('guru')) return 'prodi-pgmi';
        if (val.includes('esy') || val.includes('ekonomi')) return 'prodi-esy';
        return v;
      }
    },
    {
      key: 'entryYear',
      label: 'Tahun Angkatan',
      type: 'number',
      required: false,
      defaultValue: 2024,
      aliases: ['angkatan', 'tahun_masuk', 'entry_year'],
      sampleValue: 2024
    },
    {
      key: 'entrySemester',
      label: 'Semester Masuk',
      type: 'enum',
      allowedValues: ['Ganjil', 'Genap'],
      defaultValue: 'Ganjil',
      aliases: ['semester_masuk', 'entry_semester']
    },
    {
      key: 'currentSemester',
      label: 'Semester Saat Ini',
      type: 'number',
      required: false,
      defaultValue: 1,
      aliases: ['semester', 'smt', 'current_semester'],
      sampleValue: 1
    },
    {
      key: 'gender',
      label: 'Jenis Kelamin',
      type: 'enum',
      allowedValues: ['Laki-laki', 'Perempuan'],
      defaultValue: 'Laki-laki',
      aliases: ['jk', 'gender', 'jenis_kelamin', 'sex'],
      sampleValue: 'Laki-laki'
    },
    {
      key: 'phoneNumber',
      label: 'Nomor Telepon / WhatsApp',
      type: 'string',
      required: false,
      aliases: ['telepon', 'no_hp', 'phone', 'whatsapp', 'wa'],
      sampleValue: '081234567890'
    },
    {
      key: 'birthPlace',
      label: 'Tempat Lahir',
      type: 'string',
      required: false,
      defaultValue: 'Cianjur',
      aliases: ['tempat_lahir', 'birth_place', 'kota_lahir'],
      sampleValue: 'Cianjur'
    },
    {
      key: 'birthDate',
      label: 'Tanggal Lahir (YYYY-MM-DD)',
      type: 'date',
      required: false,
      defaultValue: '2005-01-01',
      aliases: ['tgl_lahir', 'tanggal_lahir', 'birth_date'],
      sampleValue: '2005-06-15'
    },
    {
      key: 'address',
      label: 'Alamat Domisili',
      type: 'string',
      required: false,
      defaultValue: 'Cianjur, Jawa Barat',
      aliases: ['alamat', 'domisili', 'address'],
      sampleValue: 'Jl. Raya Cipanas No. 45, Cianjur'
    },
    {
      key: 'guardianName',
      label: 'Nama Orang Tua / Wali',
      type: 'string',
      required: false,
      defaultValue: 'Orang Tua / Wali',
      aliases: ['nama_ortu', 'wali', 'orang_tua', 'guardian'],
      sampleValue: 'H. Abdul Rahman'
    }
  ],
  sampleRows: [
    {
      nim: '24.01.0101',
      name: 'Muhammad Farhan Azhari',
      email: 'farhan.azhari@student.stai-alittihad.ac.id',
      studyProgramId: 'prodi-pai',
      entryYear: 2024,
      entrySemester: 'Ganjil',
      currentSemester: 1,
      gender: 'Laki-laki',
      phoneNumber: '081234567810',
      birthPlace: 'Cianjur',
      birthDate: '2005-04-12',
      address: 'Jl. Raya Bandung Km 04, Sukaluyu, Cianjur',
      guardianName: 'Drs. H. Mamat Slamet'
    },
    {
      nim: '24.02.0102',
      name: 'Zulfa Nurul Hikmah',
      email: 'zulfa.nurul@student.stai-alittihad.ac.id',
      studyProgramId: 'prodi-mpi',
      entryYear: 2024,
      entrySemester: 'Ganjil',
      currentSemester: 1,
      gender: 'Perempuan',
      phoneNumber: '081234567811',
      birthPlace: 'Sukabumi',
      birthDate: '2005-09-24',
      address: 'Jl. KH. Abdullah Bin Nuh, Cianjur',
      guardianName: 'H. Ahmad Sobari'
    }
  ]
};

/**
 * 2. DOSEN IMPORT SCHEMA
 */
export const LECTURER_IMPORT_SCHEMA: ImportSchema<CreateLecturerInput> = {
  entityName: 'Dosen',
  instructions: [
    'Pastikan NIDN terdiri dari 10 digit angka unik.',
    'Pangkat Fungsional: Asisten Ahli, Lektor, Lektor Kepala, atau Guru Besar.',
    'Status Kepegawaian: TETAP atau TIDAK_TETAP.'
  ],
  fields: [
    {
      key: 'nidn',
      label: 'NIDN (10 Digit)',
      type: 'string',
      required: true,
      aliases: ['nidn', 'nomor_induk_dosen', 'nidk', 'lecturer_id'],
      sampleValue: '2105128001',
      validate: (v) => (String(v).trim().length >= 8 ? true : 'NIDN minimal 8-10 karakter')
    },
    {
      key: 'name',
      label: 'Nama Lengkap (Tanpa Gelar)',
      type: 'string',
      required: true,
      aliases: ['nama', 'nama_lengkap', 'lecturer_name'],
      sampleValue: 'Muhammad Ridwan'
    },
    {
      key: 'titlePrefix',
      label: 'Gelar Depan',
      type: 'string',
      required: false,
      defaultValue: '',
      aliases: ['gelar_depan', 'prefix', 'title_prefix'],
      sampleValue: 'Dr. H.'
    },
    {
      key: 'titleSuffix',
      label: 'Gelar Belakang',
      type: 'string',
      required: false,
      defaultValue: 'M.Pd.I',
      aliases: ['gelar_belakang', 'suffix', 'title_suffix', 'gelar'],
      sampleValue: 'M.Ag'
    },
    {
      key: 'email',
      label: 'Email Institusi Dosen',
      type: 'email',
      required: true,
      aliases: ['email', 'surel', 'lecturer_email'],
      sampleValue: 'm.ridwan@stai-alittihad.ac.id'
    },
    {
      key: 'academicRank',
      label: 'Jabatan Fungsional',
      type: 'enum',
      allowedValues: ['Tenaga Pengajar', 'Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Guru Besar'],
      defaultValue: 'Lektor',
      aliases: ['jabatan', 'fungsional', 'pangkat', 'academic_rank'],
      sampleValue: 'Lektor'
    },
    {
      key: 'highestEducation',
      label: 'Jenjang Pendidikan Terakhir',
      type: 'enum',
      allowedValues: ['S2', 'S3', 'Profesor'],
      defaultValue: 'S2',
      aliases: ['pendidikan', 'ijazah', 'highest_education'],
      sampleValue: 'S3'
    },
    {
      key: 'employmentStatus',
      label: 'Status Kepegawaian',
      type: 'enum',
      allowedValues: ['TETAP', 'TIDAK_TETAP', 'KONTRAK', 'DOSEN_LB'],
      defaultValue: 'TETAP',
      aliases: ['status_kerja', 'status_pegawai', 'employment_status'],
      sampleValue: 'TETAP'
    },
    {
      key: 'homebaseProdiId',
      label: 'Homebase Program Studi',
      type: 'string',
      required: true,
      aliases: ['prodi', 'homebase', 'kode_prodi'],
      sampleValue: 'prodi-pai',
      transform: (v) => {
        const val = String(v).toLowerCase();
        if (val.includes('pai')) return 'prodi-pai';
        if (val.includes('mpi')) return 'prodi-mpi';
        if (val.includes('hes')) return 'prodi-hes';
        if (val.includes('pgmi')) return 'prodi-pgmi';
        if (val.includes('esy')) return 'prodi-esy';
        return v;
      }
    },
    {
      key: 'isAcademicAdvisor',
      label: 'Dosen Pembimbing Akademik (PA)',
      type: 'boolean',
      defaultValue: true,
      aliases: ['dosen_pa', 'is_advisor', 'pembimbing_akademik'],
      sampleValue: 'Ya'
    },
    {
      key: 'specialization',
      label: 'Bidang Keahlian / Kepakaran',
      type: 'string',
      required: false,
      defaultValue: 'Pendidikan Islam Terpadu',
      aliases: ['keahlian', 'spesialisasi', 'specialization'],
      sampleValue: 'Tafsir & Ushul Fiqih Kontemporer'
    },
    {
      key: 'phoneNumber',
      label: 'Nomor Telepon / WhatsApp',
      type: 'string',
      required: false,
      aliases: ['telepon', 'no_hp', 'phone', 'whatsapp'],
      sampleValue: '081234567010'
    }
  ],
  sampleRows: [
    {
      nidn: '2105128001',
      titlePrefix: 'Dr. H.',
      name: 'Muhammad Ridwan',
      titleSuffix: 'M.Ag',
      email: 'm.ridwan@stai-alittihad.ac.id',
      academicRank: 'Lektor Kepala',
      highestEducation: 'S3',
      employmentStatus: 'TETAP',
      homebaseProdiId: 'prodi-pai',
      isAcademicAdvisor: true,
      specialization: 'Studi Al-Qur\'an & Tafsir Tarbawi',
      phoneNumber: '081234567010'
    },
    {
      nidn: '2112198002',
      titlePrefix: 'Dr.',
      name: 'Siti Maryam',
      titleSuffix: 'M.Pd.I',
      email: 'siti.maryam@stai-alittihad.ac.id',
      academicRank: 'Lektor',
      highestEducation: 'S3',
      employmentStatus: 'TETAP',
      homebaseProdiId: 'prodi-mpi',
      isAcademicAdvisor: true,
      specialization: 'Manajemen Mutu Pendidikan Islam',
      phoneNumber: '081234567011'
    }
  ]
};

/**
 * 3. MATA KULIAH IMPORT SCHEMA
 */
export const COURSE_IMPORT_SCHEMA: ImportSchema<CreateCourseInput> = {
  entityName: 'Mata Kuliah',
  instructions: [
    'Kode mata kuliah harus unik (contoh: PAI-301, MPI-204).',
    'Total SKS adalah penjumlahan SKS Teori dan SKS Praktik.',
    'Jenis Mata Kuliah: Wajib Program Studi, Wajib Nasional, Wajib Institusi, atau Pilihan.'
  ],
  fields: [
    {
      key: 'code',
      label: 'Kode Mata Kuliah',
      type: 'string',
      required: true,
      aliases: ['kode', 'kode_mk', 'course_code', 'mk_code'],
      sampleValue: 'PAI-402',
      validate: (v) => (String(v).trim().length >= 3 ? true : 'Kode MK minimal 3 karakter')
    },
    {
      key: 'name',
      label: 'Nama Mata Kuliah',
      type: 'string',
      required: true,
      aliases: ['nama_mk', 'nama_matakuliah', 'course_name', 'subject'],
      sampleValue: 'Metodologi Penelitian Pendidikan Agama Islam'
    },
    {
      key: 'credits',
      label: 'Bobot SKS Total',
      type: 'number',
      required: true,
      defaultValue: 3,
      aliases: ['sks', 'bobot_sks', 'credits', 'total_sks'],
      sampleValue: 3
    },
    {
      key: 'theoryCredits',
      label: 'SKS Teori',
      type: 'number',
      required: false,
      defaultValue: 2,
      aliases: ['sks_teori', 'theory_credits'],
      sampleValue: 2
    },
    {
      key: 'practicalCredits',
      label: 'SKS Praktik',
      type: 'number',
      required: false,
      defaultValue: 1,
      aliases: ['sks_praktik', 'practical_credits'],
      sampleValue: 1
    },
    {
      key: 'semester',
      label: 'Semester Paket',
      type: 'number',
      required: true,
      defaultValue: 4,
      aliases: ['semester', 'smt', 'semester_paket'],
      sampleValue: 4
    },
    {
      key: 'studyProgramId',
      label: 'Program Studi Pengampu',
      type: 'string',
      required: true,
      aliases: ['prodi', 'kode_prodi', 'study_program'],
      sampleValue: 'prodi-pai',
      transform: (v) => {
        const val = String(v).toLowerCase();
        if (val.includes('pai')) return 'prodi-pai';
        if (val.includes('mpi')) return 'prodi-mpi';
        if (val.includes('hes')) return 'prodi-hes';
        if (val.includes('pgmi')) return 'prodi-pgmi';
        if (val.includes('esy')) return 'prodi-esy';
        return v;
      }
    },
    {
      key: 'type',
      label: 'Kelompok / Jenis MK',
      type: 'enum',
      allowedValues: ['WAJIB_PRODI', 'WAJIB_INSTITUSI', 'WAJIB_NASIONAL', 'PILIHAN'],
      defaultValue: 'WAJIB_PRODI',
      aliases: ['jenis_mk', 'kelompok_mk', 'type', 'status_mk'],
      sampleValue: 'WAJIB_PRODI'
    }
  ],
  sampleRows: [
    {
      code: 'PAI-402',
      name: 'Metodologi Penelitian Pendidikan Islam',
      credits: 3,
      theoryCredits: 2,
      practicalCredits: 1,
      semester: 4,
      studyProgramId: 'prodi-pai',
      type: 'WAJIB_PRODI'
    },
    {
      code: 'INS-101',
      name: 'Pendidikan Pancasila & Kewarganegaraan',
      credits: 2,
      theoryCredits: 2,
      practicalCredits: 0,
      semester: 1,
      studyProgramId: 'prodi-pai',
      type: 'WAJIB_NASIONAL'
    }
  ]
};

/**
 * 4. JADWAL KULIAH IMPORT SCHEMA
 */
export const SCHEDULE_IMPORT_SCHEMA: ImportSchema<CreateScheduleInput> = {
  entityName: 'Jadwal Kuliah',
  instructions: [
    'Hari: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu.',
    'Format Waktu: HH:mm (contoh: 08:00 - 10:30).',
    'Pastikan kode mata kuliah dan nama kelas (A/B/C) telah terdaftar.'
  ],
  fields: [
    {
      key: 'courseId',
      label: 'Kode / ID Mata Kuliah',
      type: 'string',
      required: true,
      aliases: ['kode_mk', 'course_code', 'id_mk'],
      sampleValue: 'PAI-301'
    },
    {
      key: 'className',
      label: 'Nama / Kode Kelas',
      type: 'string',
      required: true,
      aliases: ['kelas', 'nama_kelas', 'class_name'],
      sampleValue: 'PAI-A'
    },
    {
      key: 'lecturerId',
      label: 'Dosen Pengampu / NIDN',
      type: 'string',
      required: true,
      aliases: ['dosen', 'nidn_dosen', 'lecturer_id', 'pengampu'],
      sampleValue: 'usr-dsn-01'
    },
    {
      key: 'dayOfWeek',
      label: 'Hari Perkuliahan',
      type: 'enum',
      allowedValues: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
      required: true,
      aliases: ['hari', 'day', 'day_of_week'],
      sampleValue: 'Senin'
    },
    {
      key: 'startTime',
      label: 'Jam Mulai (HH:mm)',
      type: 'string',
      required: true,
      aliases: ['jam_mulai', 'start_time', 'mulai'],
      sampleValue: '08:00'
    },
    {
      key: 'endTime',
      label: 'Jam Selesai (HH:mm)',
      type: 'string',
      required: true,
      aliases: ['jam_selesai', 'end_time', 'selesai'],
      sampleValue: '10:30'
    },
    {
      key: 'roomId',
      label: 'Ruangan / Gedung',
      type: 'string',
      required: true,
      aliases: ['ruangan', 'ruang', 'room', 'room_id'],
      sampleValue: 'Ruang A.101 (Gedung Tarbiyah Lt. 1)'
    },
    {
      key: 'quota',
      label: 'Kapasitas Kuota Mahasiswa',
      type: 'number',
      required: false,
      defaultValue: 40,
      aliases: ['kuota', 'kapasitas', 'quota', 'max_students'],
      sampleValue: 40
    }
  ],
  sampleRows: [
    {
      courseId: 'PAI-301',
      className: 'PAI 3-A',
      lecturerId: 'usr-dsn-01',
      dayOfWeek: 'Senin',
      startTime: '08:00',
      endTime: '10:30',
      roomId: 'Ruang A.101 (Gedung Tarbiyah Lt. 1)',
      quota: 40
    },
    {
      courseId: 'MPI-204',
      className: 'MPI 3-B',
      lecturerId: 'usr-dsn-02',
      dayOfWeek: 'Selasa',
      startTime: '13:00',
      endTime: '15:30',
      roomId: 'Ruang B.202 (Gedung Pascasarjana Lt. 2)',
      quota: 35
    }
  ]
};

/**
 * 5. INPUT NILAI MASSAL / GRADEBOOK IMPORT SCHEMA
 */
export interface GradeImportRow {
  studentNim: string;
  studentName?: string;
  courseCode?: string;
  attendanceScore: number;
  assignmentScore: number;
  quizScore: number;
  midtermScore: number;
  finalScore: number;
  finalNumericGrade?: number;
  letterGrade?: string;
}

export const GRADE_IMPORT_SCHEMA: ImportSchema<GradeImportRow> = {
  entityName: 'Rekap Nilai Mahasiswa',
  instructions: [
    'Nilai berkisar antara 0 - 100.',
    'Bobot standar STAI Al-Ittihad: Presensi (10%), Tugas (20%), Kuis (15%), UTS (25%), UAS (30%).',
    'Nilai akhir angka dan huruf mutu akan dihitung secara otomatis jika dikosongkan.'
  ],
  fields: [
    {
      key: 'studentNim',
      label: 'NIM Mahasiswa',
      type: 'string',
      required: true,
      aliases: ['nim', 'nomor_induk', 'student_nim'],
      sampleValue: '21.01.0042'
    },
    {
      key: 'studentName',
      label: 'Nama Mahasiswa',
      type: 'string',
      required: false,
      aliases: ['nama', 'nama_mahasiswa', 'student_name'],
      sampleValue: 'Ahmad Fauzi'
    },
    {
      key: 'attendanceScore',
      label: 'Nilai Presensi (0-100)',
      type: 'number',
      required: true,
      defaultValue: 90,
      aliases: ['kehadiran', 'presensi', 'absensi', 'attendance'],
      sampleValue: 95,
      validate: (v) => (Number(v) >= 0 && Number(v) <= 100 ? true : 'Nilai presensi 0-100')
    },
    {
      key: 'assignmentScore',
      label: 'Nilai Tugas (0-100)',
      type: 'number',
      required: true,
      defaultValue: 85,
      aliases: ['tugas', 'assignment', 'nilai_tugas'],
      sampleValue: 88,
      validate: (v) => (Number(v) >= 0 && Number(v) <= 100 ? true : 'Nilai tugas 0-100')
    },
    {
      key: 'quizScore',
      label: 'Nilai Kuis (0-100)',
      type: 'number',
      required: true,
      defaultValue: 85,
      aliases: ['kuis', 'quiz', 'nilai_kuis'],
      sampleValue: 90,
      validate: (v) => (Number(v) >= 0 && Number(v) <= 100 ? true : 'Nilai kuis 0-100')
    },
    {
      key: 'midtermScore',
      label: 'Nilai UTS (0-100)',
      type: 'number',
      required: true,
      defaultValue: 85,
      aliases: ['uts', 'midterm', 'nilai_uts'],
      sampleValue: 86,
      validate: (v) => (Number(v) >= 0 && Number(v) <= 100 ? true : 'Nilai UTS 0-100')
    },
    {
      key: 'finalScore',
      label: 'Nilai UAS (0-100)',
      type: 'number',
      required: true,
      defaultValue: 85,
      aliases: ['uas', 'final', 'nilai_uas'],
      sampleValue: 90,
      validate: (v) => (Number(v) >= 0 && Number(v) <= 100 ? true : 'Nilai UAS 0-100')
    }
  ],
  sampleRows: [
    {
      studentNim: '21.01.0042',
      studentName: 'Ahmad Fauzi',
      attendanceScore: 100,
      assignmentScore: 88,
      quizScore: 90,
      midtermScore: 85,
      finalScore: 92
    },
    {
      studentNim: '22.01.0015',
      studentName: 'Siti Fatimah Zahra',
      attendanceScore: 95,
      assignmentScore: 92,
      quizScore: 95,
      midtermScore: 90,
      finalScore: 94
    }
  ]
};

/**
 * 6. PROGRAM STUDI IMPORT SCHEMA
 */
export const STUDY_PROGRAM_IMPORT_SCHEMA: ImportSchema<StudyProgram> = {
  entityName: 'Program Studi',
  instructions: [
    'Kode prodi unik (contoh: PAI, MPI, HES, PGMI, ESY).',
    'Jenjang: S1, S2, atau S3.',
    'Akreditasi: Unggul, Baik Sekali, Baik, A, B, C.'
  ],
  fields: [
    {
      key: 'code',
      label: 'Kode Program Studi',
      type: 'string',
      required: true,
      aliases: ['kode', 'kode_prodi', 'prodi_code'],
      sampleValue: 'PAI'
    },
    {
      key: 'name',
      label: 'Nama Program Studi',
      type: 'string',
      required: true,
      aliases: ['nama_prodi', 'program_studi', 'name'],
      sampleValue: 'Pendidikan Agama Islam'
    },
    {
      key: 'degree',
      label: 'Jenjang Akademik',
      type: 'enum',
      allowedValues: ['S1', 'S2', 'S3', 'D3'],
      defaultValue: 'S1',
      aliases: ['jenjang', 'degree', 'strata'],
      sampleValue: 'S1'
    },
    {
      key: 'accreditation',
      label: 'Peringkat Akreditasi BAN-PT/LAMDIK',
      type: 'string',
      required: false,
      defaultValue: 'Baik Sekali',
      aliases: ['akreditasi', 'accreditation'],
      sampleValue: 'Baik Sekali'
    },
    {
      key: 'headName',
      label: 'Nama Ketua Program Studi (Kaprodi)',
      type: 'string',
      required: false,
      defaultValue: 'Ketua Program Studi',
      aliases: ['kaprodi', 'ketua_prodi', 'head_name'],
      sampleValue: 'Dr. H. M. Ridwan, M.Ag'
    },
    {
      key: 'totalCreditsRequired',
      label: 'Total Beban SKS Lulus',
      type: 'number',
      required: false,
      defaultValue: 144,
      aliases: ['sks_lulus', 'total_sks', 'credits_required'],
      sampleValue: 144
    }
  ]
};

/**
 * 8. BANK SOAL IMPORT SCHEMA (EXCEL PROFESIONAL TERSTANDAR)
 */
export const QUESTION_BANK_IMPORT_SCHEMA: ImportSchema<ImportQuestionInput> = {
  entityName: 'Bank Soal Kurikulum',
  instructions: [
    'Tipe soal yang didukung: PILIHAN_GANDA (5 Opsi A-E), BENAR_SALAH, JAWABAN_SINGKAT, atau ESAI.',
    'Untuk Pilihan Ganda: Isi Opsi A, B, C, D, E dan tentukan Kunci Jawaban dengan huruf (A, B, C, D, atau E).',
    'Untuk Teks Arab / Matan / Hadits / Ayat: Dapat diisi langsung dengan teks beraksara Arab pada kolom "Teks Arab".',
    'Untuk Gambar Soal: Masukkan tautan URL gambar atau path ilustrasi pada kolom "Gambar URL".',
    'Tingkat kesulitan dapat diisi: MUDAH, SEDANG, atau SULIT.'
  ],
  fields: [
    {
      key: 'courseCode',
      label: 'Kode Mata Kuliah',
      type: 'string',
      required: true,
      aliases: ['kode_mk', 'kode_matakuliah', 'course_code', 'mk'],
      sampleValue: 'PAI-301'
    },
    {
      key: 'topic',
      label: 'Topik / Materi Pokok (CPMK)',
      type: 'string',
      required: true,
      aliases: ['topik', 'materi', 'pokok_bahasan', 'topic', 'cpmk'],
      sampleValue: 'Kaidah Lughawiyah Ushul Fiqih'
    },
    {
      key: 'type',
      label: 'Tipe Butir Soal',
      type: 'enum',
      allowedValues: ['PILIHAN_GANDA', 'BENAR_SALAH', 'JAWABAN_SINGKAT', 'ESAI'],
      required: true,
      defaultValue: 'PILIHAN_GANDA',
      aliases: ['tipe', 'tipe_soal', 'jenis_soal', 'type', 'question_type'],
      transform: (v) => {
        const val = String(v).toUpperCase();
        if (val.includes('GANDA') || val === 'PG' || val === 'MCQ') return 'PILIHAN_GANDA';
        if (val.includes('BENAR') || val.includes('SALAH') || val === 'BS' || val === 'TF') return 'BENAR_SALAH';
        if (val.includes('SINGKAT') || val === 'ISIAN' || val === 'SHORT') return 'JAWABAN_SINGKAT';
        if (val.includes('ESAI') || val.includes('ESSAY') || val === 'URAIAN') return 'ESAI';
        return 'PILIHAN_GANDA';
      }
    },
    {
      key: 'difficulty',
      label: 'Tingkat Kesulitan',
      type: 'enum',
      allowedValues: ['MUDAH', 'SEDANG', 'SULIT'],
      defaultValue: 'SEDANG',
      aliases: ['kesulitan', 'tingkat_kesulitan', 'difficulty', 'level'],
      sampleValue: 'SEDANG'
    },
    {
      key: 'questionText',
      label: 'Teks Pertanyaan Soal',
      type: 'string',
      required: true,
      aliases: ['soal', 'pertanyaan', 'teks_soal', 'question_text', 'question'],
      sampleValue: 'Lafadz yang mencakup seluruh satuan yang tidak terbatas dalam satu ketetapan hukum disebut:'
    },
    {
      key: 'arabicText',
      label: 'Teks Arab / Matan / Ayat (Opsional)',
      type: 'string',
      required: false,
      aliases: ['teks_arab', 'arab', 'matan', 'ayat', 'hadits', 'arabic_text', 'arabic'],
      sampleValue: 'الأَصْلُ فِي الأَشْيَاءِ الإِبَاحَةُ حَتَّى يَدُلَّ الدَّلِيلُ عَلَى التَّحْرِيمِ'
    },
    {
      key: 'imageUrl',
      label: 'URL Gambar / Ilustrasi (Opsional)',
      type: 'string',
      required: false,
      aliases: ['gambar_url', 'gambar', 'image_url', 'image', 'foto'],
      sampleValue: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=600'
    },
    {
      key: 'optA',
      label: 'Opsi Jawaban A',
      type: 'string',
      required: false,
      aliases: ['opsi_a', 'pilihan_a', 'option_a', 'a'],
      sampleValue: "Lafadz 'Am (Umum)"
    },
    {
      key: 'optB',
      label: 'Opsi Jawaban B',
      type: 'string',
      required: false,
      aliases: ['opsi_b', 'pilihan_b', 'option_b', 'b'],
      sampleValue: "Lafadz Khas (Khusus)"
    },
    {
      key: 'optC',
      label: 'Opsi Jawaban C',
      type: 'string',
      required: false,
      aliases: ['opsi_c', 'pilihan_c', 'option_c', 'c'],
      sampleValue: "Lafadz Mujmal"
    },
    {
      key: 'optD',
      label: 'Opsi Jawaban D',
      type: 'string',
      required: false,
      aliases: ['opsi_d', 'pilihan_d', 'option_d', 'd'],
      sampleValue: "Lafadz Mutlaq"
    },
    {
      key: 'optE',
      label: 'Opsi Jawaban E',
      type: 'string',
      required: false,
      aliases: ['opsi_e', 'pilihan_e', 'option_e', 'e'],
      sampleValue: "Lafadz Muqayyad"
    },
    {
      key: 'correctKey',
      label: 'Kunci Jawaban Benar (A/B/C/D/E/Teks)',
      type: 'string',
      required: true,
      aliases: ['kunci', 'kunci_jawaban', 'jawaban_benar', 'answer', 'correct_key', 'key'],
      sampleValue: 'A'
    },
    {
      key: 'defaultPoints',
      label: 'Bobot Poin Soal',
      type: 'number',
      required: false,
      defaultValue: 20,
      min: 1,
      max: 100,
      validate: (val) => {
        const num = Number(val);
        if (num > 100) {
          return `⚠️ Peringatan: Bobot butir soal (${num} poin) melebihi batas maksimal 100 poin!`;
        }
        if (num < 1) {
          return 'Bobot butir soal minimal 1 poin.';
        }
        return true;
      },
      aliases: ['poin', 'bobot', 'points', 'score'],
      sampleValue: 20
    },
    {
      key: 'explanation',
      label: 'Pembahasan & Dalil Rujukan',
      type: 'string',
      required: false,
      aliases: ['penjelasan', 'pembahasan', 'explanation', 'rubrik', 'dalil'],
      sampleValue: "Lafadz 'Am adalah lafadz yang menghabiskan semua apa yang layak baginya menurut satu makna sekaligus."
    },
    {
      key: 'tags',
      label: 'Tagar / Kata Kunci',
      type: 'string',
      required: false,
      aliases: ['tag', 'tagar', 'tags', 'kategori'],
      sampleValue: 'Ushul Fiqih, Lughawiyah, Am wa Khas'
    }
  ]
};
