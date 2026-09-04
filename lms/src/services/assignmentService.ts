import { 
  Assignment, 
  AssignmentSubmission, 
  RubricEvaluationItem,
  CreateAssignmentInput,
  AssignmentRubric
} from '../types/assignment';
import { auditService } from './auditService';
import { apiClient } from '../api/client';

const ASSIGNMENTS_STORAGE_KEY = 'salam_assignments';
const SUBMISSIONS_STORAGE_KEY = 'salam_assignment_submissions';

// PRESET RUBRIK STANDAR STAI AL-ITTIHAD CIANJUR
export const RUBRIC_PRESETS: { id: string; name: string; description: string; rubric: AssignmentRubric }[] = [
  {
    id: 'preset-makalah-ushul',
    name: 'Makalah Analisis Kaidah Ushul Fiqih & Hukum Islam',
    description: 'Cocok untuk tugas analisis dalil, istinbath hukum, dan kajian turats.',
    rubric: {
      id: 'rbk-ushul-preset',
      title: 'Rubrik Penilaian Analisis Makalah Ushul Fiqih',
      criteria: [
        {
          id: 'crit-1',
          title: 'Ketepatan Penerapan Kaidah Ushuliyah',
          description: 'Menganalisis penggunaan kaidah \'am/khas, amar/nahyi, mafhum, atau qiyas.',
          weightPercentage: 40,
          maxPoints: 100,
          levels: [
            { id: 'lvl-1a', title: 'Sangat Baik (100)', points: 100, description: 'Analisis kaidah sangat tajam, runtut, dan sesuai metodologi ushul madzhab.' },
            { id: 'lvl-1b', title: 'Baik (80)', points: 80, description: 'Analisis kaidah tepat namun terdapat sedikit kekurangan pada argumentasi.' },
            { id: 'lvl-1c', title: 'Cukup (60)', points: 60, description: 'Analisis kaidah bersifat umum dan belum mendalam.' },
            { id: 'lvl-1d', title: 'Kurang (40)', points: 40, description: 'Penerapan kaidah keliru atau tidak relevan dengan kasus.' }
          ]
        },
        {
          id: 'crit-2',
          title: 'Kelengkapan & Otoritas Kepustakaan',
          description: 'Rujukan primer dari kitab turats mu\'tabarah dan jurnal bereputasi.',
          weightPercentage: 30,
          maxPoints: 100,
          levels: [
            { id: 'lvl-2a', title: 'Sangat Lengkap (100)', points: 100, description: 'Memuat ≥ 3 kitab turats primer dan ≥ 2 jurnal ilmiah terakreditasi.' },
            { id: 'lvl-2b', title: 'Lengkap (80)', points: 80, description: 'Memuat 2 kitab turats dan jurnal ilmiah.' },
            { id: 'lvl-2c', title: 'Cukup (60)', points: 60, description: 'Hanya menggunakan buku sekunder / artikel internet non-akademik.' },
            { id: 'lvl-2d', title: 'Kurang (40)', points: 40, description: 'Daftar pustaka minim atau tidak valid.' }
          ]
        },
        {
          id: 'crit-3',
          title: 'Sistematika Penulisan & Kaidah Akademik',
          description: 'Tata tulis ilmiah, kerapian bahasa, dan bebas plagiarisme.',
          weightPercentage: 30,
          maxPoints: 100,
          levels: [
            { id: 'lvl-3a', title: 'Sangat Rapi (100)', points: 100, description: 'Format standar sempurna, bahasa baku, sitasi konsisten (APA/Turabian).' },
            { id: 'lvl-3b', title: 'Rapi (80)', points: 80, description: 'Format baik dengan sedikit kesalahan tipografi minor.' },
            { id: 'lvl-3c', title: 'Cukup (60)', points: 60, description: 'Banyak kesalahan ejaan dan format penulisan tidak konsisten.' },
            { id: 'lvl-3d', title: 'Kurang (40)', points: 40, description: 'Tidak mengikuti template yang diinstruksikan.' }
          ]
        }
      ]
    }
  },
  {
    id: 'preset-takhrij-hadits',
    name: 'Takhrij & Studi Sanad-Matan Hadits Tarbawi',
    description: 'Cocok untuk penugasan kritik sanad, derajat hadits, dan kontekstualisasi nilai pendidikan.',
    rubric: {
      id: 'rbk-hadits-preset',
      title: 'Rubrik Evaluasi Takhrij & Kritik Hadits',
      criteria: [
        {
          id: 'crit-21',
          title: 'Ketelitian Metode Takhrij Hadits',
          description: 'Kelengkapan mukharrij hadits dan jalur periwayatan sanad.',
          weightPercentage: 50,
          maxPoints: 100,
          levels: [
            { id: 'lvl-21a', title: 'Sangat Baik (100)', points: 100, description: 'Takhrij komprehensif dari Kutubus Sittah dengan skema sanad jelas.' },
            { id: 'lvl-21b', title: 'Baik (80)', points: 80, description: 'Takhrij mencakup kitab hadits primer dengan skema sanad cukup baik.' },
            { id: 'lvl-21c', title: 'Cukup (60)', points: 60, description: 'Takhrij hanya menyebutkan 1 sumber tanpa skema sanad mendalam.' },
            { id: 'lvl-21d', title: 'Kurang (40)', points: 40, description: 'Sumber takhrij tidak terverifikasi atau keliru.' }
          ]
        },
        {
          id: 'crit-22',
          title: 'Analisis Implikasi Tarbawi (Nilai Edukatif)',
          description: 'Relevansi pesan hadits dengan realitas pendidikan Islam modern.',
          weightPercentage: 50,
          maxPoints: 100,
          levels: [
            { id: 'lvl-22a', title: 'Sangat Relevan (100)', points: 100, description: 'Analisis mendalam, kontekstual, dan solutif terhadap isu pendidikan era digital.' },
            { id: 'lvl-22b', title: 'Relevan (80)', points: 80, description: 'Analisis baik dan terstruktur namun kurang contoh aplikatif.' },
            { id: 'lvl-22c', title: 'Cukup (60)', points: 60, description: 'Analisis tekstual tanpa kontekstualisasi zaman.' },
            { id: 'lvl-22d', title: 'Kurang (40)', points: 40, description: 'Tidak menguraikan implikasi tarbawi hadits.' }
          ]
        }
      ]
    }
  },
  {
    id: 'preset-modul-ajar-pai',
    name: 'Perancangan Modul Ajar / RPP Kurikulum Merdeka PAI',
    description: 'Cocok untuk penugasan pedagogik, penyusunan LKPD, dan asesmen pembelajaran.',
    rubric: {
      id: 'rbk-modul-preset',
      title: 'Rubrik Penilaian Modul Ajar Kurikulum Merdeka',
      criteria: [
        {
          id: 'crit-31',
          title: 'Kesesuaian Capaian Pembelajaran (CP) & Tujuan Pembelajaran (TP)',
          description: 'Perumusan TP berbasis taksonomi Bloom revisi dan dimensi Profil Pelajar Rahmatan lil Alamin.',
          weightPercentage: 35,
          maxPoints: 100,
          levels: [
            { id: 'lvl-31a', title: 'Sangat Tepat (100)', points: 100, description: 'Tujuan pembelajaran sangat spesifik, terukur, dan mengintegrasikan nilai moderasi beragama.' },
            { id: 'lvl-31b', title: 'Tepat (80)', points: 80, description: 'Tujuan pembelajaran sesuai CP dengan indikator cukup jelas.' },
            { id: 'lvl-31c', title: 'Cukup (60)', points: 60, description: 'Tujuan pembelajaran terlalu luas atau belum berorientasi HOTS.' },
            { id: 'lvl-31d', title: 'Kurang (40)', points: 40, description: 'Tujuan tidak selaras dengan capaian fase pembelajaran.' }
          ]
        },
        {
          id: 'crit-32',
          title: 'Desain Aktivitas Belajar & LKPD Berdiferensiasi',
          description: 'Variasi metode active learning dan lembar kerja peserta didik yang kontekstual.',
          weightPercentage: 35,
          maxPoints: 100,
          levels: [
            { id: 'lvl-32a', title: 'Sangat Inovatif (100)', points: 100, description: 'Langkah pembelajaran berpusat pada siswa, kreatif, dan LKPD sangat interaktif.' },
            { id: 'lvl-32b', title: 'Baik (80)', points: 80, description: 'Aktivitas belajar terstruktur dengan LKPD yang fungsional.' },
            { id: 'lvl-32c', title: 'Cukup (60)', points: 60, description: 'Metode cenderung konvensional / ceramah dominan.' },
            { id: 'lvl-32d', title: 'Kurang (40)', points: 40, description: 'Tidak menyertakan skenario aktivitas dan LKPD.' }
          ]
        },
        {
          id: 'crit-33',
          title: 'Instrumen Asesmen Diagnostik, Formatif & Sumatif',
          description: 'Kelengkapan rubrik penilaian otentik dan kisi-kisi soal evaluasi.',
          weightPercentage: 30,
          maxPoints: 100,
          levels: [
            { id: 'lvl-33a', title: 'Sangat Lengkap (100)', points: 100, description: 'Mencakup 3 jenis asesmen dengan rubrik penilaian kinerja yang jelas.' },
            { id: 'lvl-33b', title: 'Lengkap (80)', points: 80, description: 'Memuat asesmen formatif dan sumatif dengan instrumen evaluasi.' },
            { id: 'lvl-33c', title: 'Cukup (60)', points: 60, description: 'Asesmen hanya berupa tes tertulis tanpa rubrik kriteria.' },
            { id: 'lvl-33d', title: 'Kurang (40)', points: 40, description: 'Instrumen evaluasi tidak disertakan.' }
          ]
        }
      ]
    }
  },
  {
    id: 'preset-analitik-umum',
    name: 'Rubrik Analitik Umum (Ketepatan Isi, Orisinalitas, Kerapian)',
    description: 'Rubrik standar multi-guna untuk penugasan ringkasan, resume, dan telaah pustaka.',
    rubric: {
      id: 'rbk-umum-preset',
      title: 'Rubrik Penilaian Tugas Perkuliahan Umum',
      criteria: [
        {
          id: 'crit-41',
          title: 'Kedalaman & Ketepatan Pembahasan Materi',
          description: 'Penguasaan konsep dan ketepatan menjawab seluruh pertanyaan tugas.',
          weightPercentage: 40,
          maxPoints: 100,
          levels: [
            { id: 'lvl-41a', title: 'Sangat Baik (100)', points: 100, description: 'Penguasaan konsep sempurna dan seluruh butir tugas terjawab komprehensif.' },
            { id: 'lvl-41b', title: 'Baik (80)', points: 80, description: 'Pembahasan materi tepat dengan penjelasan yang memadai.' },
            { id: 'lvl-41c', title: 'Cukup (60)', points: 60, description: 'Pembahasan materi bersifat ringkas dan kurang elaborasi.' },
            { id: 'lvl-41d', title: 'Kurang (40)', points: 40, description: 'Banyak materi keliru atau tidak menjawab instruksi tugas.' }
          ]
        },
        {
          id: 'crit-42',
          title: 'Orisinalitas Ide & Kualitas Rujukan',
          description: 'Keaslian gagasan analisis dan validitas sumber pustaka rujukan.',
          weightPercentage: 30,
          maxPoints: 100,
          levels: [
            { id: 'lvl-42a', title: 'Sangat Baik (100)', points: 100, description: 'Gagasan segar, orisinal, dan rujukan mutakhir serta terpercaya.' },
            { id: 'lvl-42b', title: 'Baik (80)', points: 80, description: 'Analisis baik dengan rujukan kepustakaan yang cukup.' },
            { id: 'lvl-42c', title: 'Cukup (60)', points: 60, description: 'Terlalu banyak menyalin kutipan tanpa sintesis mandiri.' },
            { id: 'lvl-42d', title: 'Kurang (40)', points: 40, description: 'Daftar rujukan tidak valid atau terindikasi plagiat.' }
          ]
        },
        {
          id: 'crit-43',
          title: 'Sistematika, Tata Bahasa & Format Berkas',
          description: 'Kerapian tata letak dokumen, kepatuhan format berkas, dan bahasa baku.',
          weightPercentage: 30,
          maxPoints: 100,
          levels: [
            { id: 'lvl-43a', title: 'Sangat Rapi (100)', points: 100, description: 'Format standar sempurna, tipografi bersih, dan bahasa Indonesia baku.' },
            { id: 'lvl-43b', title: 'Rapi (80)', points: 80, description: 'Format rapi dengan sedikit kekeliruan ejaan minor.' },
            { id: 'lvl-43c', title: 'Cukup (60)', points: 60, description: 'Format berantakan dan banyak kesalahan penulisan.' },
            { id: 'lvl-43d', title: 'Kurang (40)', points: 40, description: 'Tidak mengikuti petunjuk teknis format berkas.' }
          ]
        }
      ]
    }
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-pai301-01',
    classId: 'cls-pai301-a',
    meetingId: 'mtg-pai301a-03',
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    className: 'PAI-3A (Reguler Pagi)',
    meetingNumber: 3,
    title: 'Tugas Analisis Literatur: Studi Kasus Istinbath Hukum Kontemporer',
    description: 'Menyusun makalah analisis penerapan kaidah Ushul Fiqih dalam menyelesaikan problematika fatwa Dewan Syariah Nasional (DSN-MUI).',
    instructions: '1. Makalah ditulis dalam format ilmiah (minimal 5 halaman, maksimal 12 halaman).\n2. Format berkas wajib berupa PDF (.pdf) atau Word Document (.docx).\n3. Sertakan minimal 3 rujukan kitab turats ushul fiqih dan 2 jurnal ilmiah terakreditasi.\n4. Pengumpulan melewati batas waktu akan dikenakan pemotongan nilai 10%.',
    attachmentName: 'Panduan_Format_Makalah_PAI301.pdf',
    attachmentUrl: '/api/v1/storage/files/templates/Panduan_Format_Makalah_PAI301.pdf',
    openDate: '2026-09-01T00:00:00Z',
    dueDate: '2026-10-15T23:59:59Z',
    maxScore: 100,
    allowLateSubmission: true,
    latePenaltyPercentage: 10,
    allowResubmission: true,
    maxResubmissions: 2,
    submissionType: 'BERKAS_UNGGAHAN',
    allowedFileExtensions: ['.pdf', '.docx', '.zip'],
    maxFileSizeBytes: 10485760, // 10MB
    status: 'DITERBITKAN',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z',
    rubric: RUBRIC_PRESETS[0].rubric
  },
  {
    id: 'asg-pai302-01',
    classId: 'cls-pai302-a',
    meetingId: 'mtg-pai302a-04',
    courseName: 'Hadits Tarbawi',
    className: 'PAI-3B (Reguler Pagi)',
    meetingNumber: 4,
    title: 'Tugas Takhrij & Studi Sanad: Hadits Keutamaan Menuntut Ilmu',
    description: 'Melakukan takhrij hadits riwayat Abu Dawud dan Ibnu Majah mengenai kewajiban thalabul ilmi serta implikasi pedagogisnya.',
    instructions: '1. Tuliskan matan hadits lengkap beserta harakat dan artinya.\n2. Buat skema sanad dan kesimpulan derajat keshahihan hadits.\n3. Jelaskan 3 implikasi nilai edukatif hadits dalam konteks pendidikan era digital.\n4. Unggah berkas dokumen PDF/Word.',
    attachmentName: 'Format_Lembar_Kerja_Takhrij_Hadits.docx',
    attachmentUrl: '/api/v1/storage/files/templates/Format_Lembar_Kerja_Takhrij_Hadits.docx',
    openDate: '2026-09-05T00:00:00Z',
    dueDate: '2026-10-25T23:59:59Z',
    maxScore: 100,
    allowLateSubmission: true,
    latePenaltyPercentage: 10,
    allowResubmission: true,
    maxResubmissions: 2,
    submissionType: 'BERKAS_UNGGAHAN',
    allowedFileExtensions: ['.pdf', '.docx'],
    maxFileSizeBytes: 10485760, // 10MB
    status: 'DITERBITKAN',
    createdAt: '2026-09-05T08:00:00Z',
    updatedAt: '2026-09-05T08:00:00Z',
    rubric: RUBRIC_PRESETS[1].rubric
  },
  {
    id: 'asg-pai303-01',
    classId: 'cls-pai303-a',
    meetingId: 'mtg-pai303a-05',
    courseName: 'Pengembangan Kurikulum PAI',
    className: 'PAI-5A (Reguler Siang)',
    meetingNumber: 5,
    title: 'Tugas Perancangan Modul Ajar Kurikulum Merdeka PAI',
    description: 'Menyusun perangkat modul ajar PAI fase D/E dengan mengintegrasikan Profil Pelajar Pancasila dan Rahmatan lil Alamin.',
    instructions: '1. Pilih salah satu capaian pembelajaran (CP) materi PAI tingkat SMP atau SMA.\n2. Rancang tujuan pembelajaran, asesmen diagnostik, formatif, dan sumatif.\n3. Sertakan lembar kerja peserta didik (LKPD) yang menarik.\n4. Format berkas PDF atau Word.',
    attachmentName: 'Template_Modul_Ajar_PAI_Kemendikbud.pdf',
    attachmentUrl: '/api/v1/storage/files/templates/Template_Modul_Ajar_PAI_Kemendikbud.pdf',
    openDate: '2026-09-10T00:00:00Z',
    dueDate: '2026-11-05T23:59:59Z',
    maxScore: 100,
    allowLateSubmission: false,
    latePenaltyPercentage: 0,
    allowResubmission: true,
    maxResubmissions: 1,
    submissionType: 'BERKAS_UNGGAHAN',
    allowedFileExtensions: ['.pdf', '.docx', '.zip'],
    maxFileSizeBytes: 10485760,
    status: 'DITERBITKAN',
    createdAt: '2026-09-10T08:00:00Z',
    updatedAt: '2026-09-10T08:00:00Z',
    rubric: RUBRIC_PRESETS[2].rubric
  }
];

export const INITIAL_SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: 'sub-pai301-01-mhs01',
    assignmentId: 'asg-pai301-01',
    classId: 'cls-pai301-a',
    studentId: 'usr-mhs-01',
    studentNim: '21.01.0042',
    studentName: 'Ahmad Fauzi',
    version: 1,
    submittedAt: '2026-09-12T14:30:00Z',
    isLate: false,
    status: 'SUDAH_DINILAI',
    fileName: 'Makalah_Ushul_Fiqih_AhmadFauzi.pdf',
    fileSizeBytes: 1024 * 750,
    fileMimeType: 'application/pdf',
    fileUrl: '/api/v1/storage/files/submissions/Makalah_Ushul_Fiqih_AhmadFauzi.pdf',
    studentNotes: 'Bismillah, tugas analisis penerapan kaidah Ushul Fiqih pada fatwa DSN-MUI tentang Fintech Syariah.',
    finalScore: 92,
    rawScore: 92,
    penaltyDeduction: 0,
    feedbackNotes: 'Analisis kaidah istinbath hukum sangat tajam dan komprehensif. Pertahankan kualitas argumentasi akademiknya.',
    lecturerFeedback: 'Analisis kaidah istinbath hukum sangat tajam dan komprehensif. Pertahankan kualitas argumentasi akademiknya.',
    rubricEvaluations: [
      { criterionId: 'crit-1', selectedLevelId: 'lvl-1a', awardedScore: 95 },
      { criterionId: 'crit-2', selectedLevelId: 'lvl-2a', awardedScore: 90 },
      { criterionId: 'crit-3', selectedLevelId: 'lvl-3a', awardedScore: 90 }
    ],
    history: [
      {
        version: 1,
        submittedAt: '2026-09-12T14:30:00Z',
        fileName: 'Makalah_Ushul_Fiqih_AhmadFauzi.pdf',
        fileSizeBytes: 1024 * 750,
        fileMimeType: 'application/pdf',
        fileUrl: '/api/v1/storage/files/submissions/Makalah_Ushul_Fiqih_AhmadFauzi.pdf',
        studentNotes: 'Bismillah, tugas analisis penerapan kaidah Ushul Fiqih pada fatwa DSN-MUI tentang Fintech Syariah.'
      }
    ]
  },
  {
    id: 'sub-pai301-01-mhs02',
    assignmentId: 'asg-pai301-01',
    classId: 'cls-pai301-a',
    studentId: 'usr-mhs-02',
    studentNim: '21.01.0043',
    studentName: 'Siti Fatimah Zahra',
    version: 1,
    submittedAt: '2026-09-14T09:15:00Z',
    isLate: false,
    status: 'SUDAH_DIKUMPULKAN',
    fileName: 'Tugas_Istinbath_Siti_Nurhaliza.pdf',
    fileSizeBytes: 1024 * 512,
    fileMimeType: 'application/pdf',
    fileUrl: '/api/v1/storage/files/submissions/Tugas_Istinbath_Siti_Nurhaliza.pdf',
    studentNotes: 'Pengumpulan berkas tugas telaah fatwa DSN-MUI nomor 114/DSN-MUI/IX/2017.',
    history: [
      {
        version: 1,
        submittedAt: '2026-09-14T09:15:00Z',
        fileName: 'Tugas_Istinbath_Siti_Nurhaliza.pdf',
        fileSizeBytes: 1024 * 512,
        fileMimeType: 'application/pdf',
        fileUrl: '/api/v1/storage/files/submissions/Tugas_Istinbath_Siti_Nurhaliza.pdf',
        studentNotes: 'Pengumpulan berkas tugas telaah fatwa DSN-MUI nomor 114/DSN-MUI/IX/2017.'
      }
    ]
  }
];

class AssignmentService {
  /**
   * Mengambil daftar tugas (Sinkron / LocalStorage Fallback)
   */
  public getAssignments(classId?: string, isStudent = false): Assignment[] {
    try {
      const raw = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
      let list: Assignment[] = raw ? JSON.parse(raw) : [];
      
      if (!list || list.length === 0) {
        list = [...INITIAL_ASSIGNMENTS];
        this.saveAssignments(list);
      } else {
        let hasNew = false;
        for (const init of INITIAL_ASSIGNMENTS) {
          if (!list.some(a => a.id === init.id)) {
            list.push(init);
            hasNew = true;
          }
        }
        if (hasNew) {
          this.saveAssignments(list);
        }
      }

      if (classId) {
        list = list.filter((a) => a.classId === classId);
      }
      if (isStudent) {
        list = list.filter((a) => a.status === 'DITERBITKAN');
      }
      return list;
    } catch {
      return INITIAL_ASSIGNMENTS;
    }
  }

  /**
   * Mengambil daftar tugas dari REST API Backend
   */
  public async fetchAssignments(classId?: string, meetingId?: string): Promise<Assignment[]> {
    try {
      const params = new URLSearchParams();
      if (classId) params.append('classId', classId);
      if (meetingId) params.append('meetingId', meetingId);
      const qs = params.toString();

      const res = await apiClient.get<Assignment[]>(`/assignments${qs ? `?${qs}` : ''}`);
      if (Array.isArray(res)) {
        this.saveAssignments(res);
        return res;
      }
      return this.getAssignments(classId);
    } catch (err) {
      console.warn('Fallback to local assignments cache:', err);
      return this.getAssignments(classId);
    }
  }

  /**
   * Mengambil detail satu tugas dari REST API / Local Fallback
   */
  public async fetchAssignmentById(assignmentId: string): Promise<Assignment | null> {
    try {
      const res = await apiClient.get<Assignment>(`/assignments/${assignmentId}`);
      if (res && res.id) return res;
      return this.getAssignmentById(assignmentId) || null;
    } catch {
      return this.getAssignmentById(assignmentId) || null;
    }
  }

  public getAssignmentById(assignmentId: string): Assignment | undefined {
    return this.getAssignments().find((a) => a.id === assignmentId);
  }

  public saveAssignments(assignments: Assignment[]): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
      }
    } catch {
      // ignore
    }
  }

  /**
   * Membuat Tugas Perkuliahan Baru (REST API & Local Store)
   */
  public async createAssignment(input: CreateAssignmentInput): Promise<Assignment> {
    const id = `asg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newAsg: Assignment = {
      id,
      classId: input.classId,
      meetingId: input.meetingId,
      courseName: 'Mata Kuliah Perkuliahan',
      meetingNumber: 1,
      title: input.title,
      description: input.description || '',
      instructions: input.instructions,
      attachmentName: input.attachmentName,
      attachmentUrl: input.attachmentUrl,
      openDate: input.openDate || new Date().toISOString(),
      dueDate: input.dueDate,
      maxScore: input.maxScore || 100,
      allowLateSubmission: input.allowLateSubmission ?? true,
      latePenaltyPercentage: input.latePenaltyPercentage ?? 10,
      allowResubmission: input.allowResubmission ?? true,
      maxResubmissions: input.maxResubmissions ?? 2,
      submissionType: input.submissionType || 'BERKAS_UNGGAHAN',
      allowedFileExtensions: input.allowedFileExtensions || ['.pdf', '.docx', '.zip'],
      maxFileSizeBytes: input.maxFileSizeBytes || 10485760,
      status: input.status || 'DITERBITKAN',
      rubric: input.rubric,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const list = this.getAssignments();
    list.unshift(newAsg);
    this.saveAssignments(list);

    try {
      const created = await apiClient.post<Assignment>('/assignments', input);
      if (created && created.id) {
        const updatedList = this.getAssignments().map(a => a.id === id ? created : a);
        this.saveAssignments(updatedList);
        return created;
      }
    } catch (err) {
      console.warn('API create assignment background sync notice:', err);
    }

    return newAsg;
  }

  /**
   * Mengubah Tugas Perkuliahan & Rubrik
   */
  public async updateAssignment(assignmentId: string, payload: Partial<Assignment>): Promise<Assignment> {
    const list = this.getAssignments().map(a => a.id === assignmentId ? { ...a, ...payload, updatedAt: new Date().toISOString() } : a);
    this.saveAssignments(list);

    try {
      const updated = await apiClient.put<Assignment>(`/assignments/${assignmentId}`, payload);
      if (updated && updated.id) {
        const synced = this.getAssignments().map(a => a.id === assignmentId ? { ...a, ...updated } : a);
        this.saveAssignments(synced);
        return updated;
      }
    } catch (err) {
      console.warn('API update assignment background sync notice:', err);
    }

    return list.find(a => a.id === assignmentId)!;
  }

  /**
   * Menghapus Tugas Perkuliahan
   */
  public async deleteAssignment(assignmentId: string): Promise<boolean> {
    const list = this.getAssignments().filter(a => a.id !== assignmentId);
    this.saveAssignments(list);

    const subs = this.getSubmissions().filter(s => s.assignmentId !== assignmentId);
    this.saveSubmissions(subs);

    try {
      await apiClient.delete(`/assignments/${assignmentId}`);
    } catch (err) {
      console.warn('API delete assignment background sync notice:', err);
    }

    return true;
  }

  /**
   * Mengambil daftar seluruh submission mahasiswa sekelas untuk Dosen (Grading Studio)
   */
  public async fetchClassSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    try {
      const res = await apiClient.get<AssignmentSubmission[]>(`/assignments/${assignmentId}/submissions`);
      if (Array.isArray(res) && res.length > 0) {
        return res;
      }
      return this.getSubmissions(assignmentId);
    } catch (err) {
      console.warn('Fallback to local submissions list:', err);
      return this.getSubmissions(assignmentId);
    }
  }

  public getSubmissions(assignmentId?: string): AssignmentSubmission[] {
    try {
      if (typeof localStorage === 'undefined') {
        let list = [...INITIAL_SUBMISSIONS];
        if (assignmentId) {
          list = list.filter((s) => s.assignmentId === assignmentId);
        }
        return list;
      }
      const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      let list: AssignmentSubmission[] = raw ? JSON.parse(raw) : [];
      
      if (!list || list.length === 0) {
        list = [...INITIAL_SUBMISSIONS];
        this.saveSubmissions(list);
      } else {
        let hasNew = false;
        for (const init of INITIAL_SUBMISSIONS) {
          if (!list.some(s => s.id === init.id)) {
            list.push(init);
            hasNew = true;
          }
        }
        if (hasNew) {
          this.saveSubmissions(list);
        }
      }

      if (assignmentId) {
        list = list.filter((s) => s.assignmentId === assignmentId);
      }
      return list;
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  }

  public saveSubmissions(submissions: AssignmentSubmission[]): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
      }
    } catch {
      // ignore
    }
  }

  public getStudentSubmission(
    assignmentId: string, 
    studentId: string, 
    requestingUser?: { id: string; role: string }
  ): AssignmentSubmission | null {
    if (requestingUser && requestingUser.role === 'mahasiswa' && requestingUser.id !== studentId) {
      return null;
    }

    return this.getSubmissions().find(
      (s) => s.assignmentId === assignmentId && s.studentId === studentId
    ) || null;
  }

  /**
   * Upload berkas langsung ke backend Storage endpoint (MinIO/Local)
   */
  public async uploadFile(file: File, folderPrefix = 'submissions'): Promise<{ publicUrl: string; originalName: string; sizeBytes: number }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderPrefix', folderPrefix);

      let token = '';
      try {
        const stored = localStorage.getItem('salam_auth_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          token = parsed.session?.token || parsed.token || '';
        }
      } catch {
        // ignore
      }

      const res = await fetch('/api/v1/storage/upload', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.publicUrl) {
          return {
            publicUrl: json.data.publicUrl,
            originalName: json.data.originalName || file.name,
            sizeBytes: json.data.sizeBytes || file.size
          };
        }
      }
    } catch (err) {
      console.warn('Storage API upload failed, using local object URL fallback:', err);
    }

    return {
      publicUrl: URL.createObjectURL(file),
      originalName: file.name,
      sizeBytes: file.size
    };
  }

  public sanitizeFilename(fileName: string): string {
    let clean = fileName.replace(/^.*[\\/]/, '');
    clean = clean.replace(/[\x00-\x1F\x7F<>:"/\\|?*]/g, '_');
    if (clean.length > 80) {
      const extIndex = clean.lastIndexOf('.');
      const ext = extIndex !== -1 ? clean.substring(extIndex) : '';
      clean = clean.substring(0, 70) + ext;
    }
    return clean;
  }

  public validateFileUpload(
    fileName: string,
    fileSizeBytes: number,
    allowedExtensions: string[],
    maxSizeBytes: number
  ): { isValid: boolean; errorMessage?: string; sanitizedName: string } {
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.php', '.phtml', '.js', '.vbs', '.py', '.cgi', '.pl'];
    const sanitizedName = this.sanitizeFilename(fileName);
    const lowerName = sanitizedName.toLowerCase();

    const isDangerous = dangerousExtensions.some((ext) => lowerName.endsWith(ext));
    if (isDangerous) {
      return {
        isValid: false,
        errorMessage: 'Keamanan: Tipe berkas yang diunggah terdeteksi berbahaya dan diblokir oleh sistem.',
        sanitizedName
      };
    }

    const isAllowed = allowedExtensions.some((ext) => {
      const extNorm = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
      return lowerName.endsWith(extNorm);
    });

    if (!isAllowed) {
      return {
        isValid: false,
        errorMessage: `Format berkas tidak diizinkan. Ekstensi yang diterima: ${allowedExtensions.join(', ')}`,
        sanitizedName
      };
    }

    if (fileSizeBytes > maxSizeBytes) {
      const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
      return {
        isValid: false,
        errorMessage: `Ukuran berkas melebihi batas maksimum (${maxMb} MB).`,
        sanitizedName
      };
    }

    return { isValid: true, sanitizedName };
  }

  public formatFileSize(bytes?: number): string {
    if (!bytes || bytes <= 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  /**
   * PENGUMPULAN TUGAS (SUBMIT / RESUBMIT) OLEH MAHASISWA (SYNCHRONOUS COMPATIBLE)
   */
  public submitAssignment(
    assignmentId: string,
    studentId: string,
    studentNim: string,
    studentName: string,
    payload: {
      fileUrl?: string;
      fileName?: string;
      fileSizeBytes?: number;
      fileMimeType?: string;
      fileDataUrl?: string;
      textContent?: string;
      studentNotes?: string;
      note?: string;
    }
  ): AssignmentSubmission {
    const assignment = this.getAssignmentById(assignmentId);
    if (!assignment) throw new Error('Tugas tidak ditemukan.');

    const now = new Date();
    const isLate = now > new Date(assignment.dueDate);

    if (isLate && !assignment.allowLateSubmission) {
      throw new Error('Batas waktu pengumpulan telah berakhir dan tugas ini tidak menerima pengumpulan terlambat.');
    }

    let cleanFileName = payload.fileName;
    if (payload.fileName && payload.fileSizeBytes) {
      const validation = this.validateFileUpload(
        payload.fileName,
        payload.fileSizeBytes,
        assignment.allowedFileExtensions,
        assignment.maxFileSizeBytes
      );
      if (!validation.isValid) {
        throw new Error(validation.errorMessage);
      }
      cleanFileName = validation.sanitizedName;
    }

    const submissions = this.getSubmissions();
    let submission = submissions.find((s) => s.assignmentId === assignmentId && s.studentId === studentId);

    if (!submission) {
      submission = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        assignmentId,
        classId: assignment.classId,
        studentId,
        studentNim,
        studentName,
        version: 1,
        submittedAt: now.toISOString(),
        isLate,
        status: isLate ? 'TERLAMBAT' : 'SUDAH_DIKUMPULKAN',
        fileName: cleanFileName,
        fileSizeBytes: payload.fileSizeBytes,
        fileMimeType: payload.fileMimeType || 'application/pdf',
        fileUrl: payload.fileUrl || (cleanFileName ? '#' : undefined),
        fileDataUrl: payload.fileDataUrl,
        textContent: payload.textContent,
        studentNotes: payload.studentNotes || payload.note,
        history: [
          {
            version: 1,
            submittedAt: now.toISOString(),
            fileName: cleanFileName,
            fileSizeBytes: payload.fileSizeBytes,
            fileMimeType: payload.fileMimeType,
            fileUrl: payload.fileUrl,
            fileDataUrl: payload.fileDataUrl,
            textContent: payload.textContent,
            studentNotes: payload.studentNotes || payload.note,
            status: isLate ? 'TERLAMBAT' : 'SUDAH_DIKUMPULKAN'
          }
        ]
      };
      submissions.push(submission);
    } else {
      if (!assignment.allowResubmission) {
        throw new Error('Tugas ini tidak mengizinkan pengumpulan ulang.');
      }
      if (submission.version >= (assignment.maxResubmissions + 1)) {
        throw new Error(`Anda telah mencapai batas maksimum pengumpulan ulang (${assignment.maxResubmissions}x revisi).`);
      }

      const nextVersion = submission.version + 1;
      submission.history.push({
        version: nextVersion,
        submittedAt: now.toISOString(),
        fileName: cleanFileName,
        fileSizeBytes: payload.fileSizeBytes,
        fileMimeType: payload.fileMimeType || submission.fileMimeType,
        fileUrl: payload.fileUrl || submission.fileUrl,
        fileDataUrl: payload.fileDataUrl || submission.fileDataUrl,
        textContent: payload.textContent,
        studentNotes: payload.studentNotes || payload.note,
        status: isLate ? 'TERLAMBAT' : 'SUDAH_DIKUMPULKAN'
      });

      submission.version = nextVersion;
      submission.submittedAt = now.toISOString();
      submission.isLate = isLate;
      submission.status = isLate ? 'TERLAMBAT' : 'SUDAH_DIKUMPULKAN';
      submission.fileName = cleanFileName;
      submission.fileSizeBytes = payload.fileSizeBytes;
      submission.fileMimeType = payload.fileMimeType || submission.fileMimeType;
      submission.fileUrl = payload.fileUrl || submission.fileUrl;
      submission.fileDataUrl = payload.fileDataUrl || submission.fileDataUrl;
      submission.textContent = payload.textContent;
      submission.studentNotes = payload.studentNotes || payload.note;
      submission.finalScore = undefined;
      submission.rawScore = undefined;
      submission.penaltyDeduction = 0;
      submission.rubricEvaluations = undefined;
    }

    this.saveSubmissions(submissions);

    // Kirim sinkronisasi ke REST API di background
    apiClient.post<AssignmentSubmission>(`/assignments/${assignmentId}/submit`, {
      fileUrl: payload.fileUrl,
      fileName: cleanFileName,
      fileSizeBytes: payload.fileSizeBytes,
      fileMimeType: payload.fileMimeType,
      textContent: payload.textContent,
      studentNotes: payload.studentNotes || payload.note
    }).catch(err => console.warn('Background submit sync notice:', err));

    auditService.record(
      studentId,
      studentName,
      'mahasiswa',
      'PENGUMPULAN_TUGAS',
      'TUGAS_KULIAH',
      `Mahasiswa mengumpulkan tugas ${assignment.title} (Versi ${submission.version}, Status: ${submission.status}).`,
      'SUKSES'
    );

    return submission;
  }

  /**
   * PENILAIAN TUGAS BERBASIS RUBRIK OLEH DOSEN (SYNCHRONOUS COMPATIBLE)
   */
  public gradeSubmissionWithRubric(
    submissionId: string,
    evaluations: RubricEvaluationItem[],
    feedback: string,
    lecturerId: string,
    lecturerName: string,
    isRevisionRequired = false,
    manualRawScore?: number
  ): AssignmentSubmission {
    const submissions = this.getSubmissions();
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) throw new Error('Pengumpulan tugas tidak ditemukan.');

    const assignment = this.getAssignmentById(sub.assignmentId);
    if (!assignment) throw new Error('Data tugas tidak ditemukan.');

    const oldScore = sub.finalScore;

    if (isRevisionRequired) {
      sub.status = 'PERLU_REVISI';
      sub.feedbackNotes = feedback;
      sub.lecturerFeedback = feedback;
      sub.gradedAt = new Date().toISOString();
      sub.gradedByLecturerName = lecturerName;
      this.saveSubmissions(submissions);

      apiClient.post(`/assignments/submissions/${submissionId}/request-revision`, {
        feedbackNotes: feedback
      }).catch(err => console.warn('Background revision sync notice:', err));

      auditService.record(
        lecturerId,
        lecturerName,
        'dosen',
        'PENILAIAN_TUGAS',
        'TUGAS_KULIAH',
        `Dosen meminta revisi tugas ${sub.studentName} pada ${assignment.title}.`,
        'SUKSES'
      );
      return sub;
    }

    let rawScore = 0;
    if (assignment.rubric && Array.isArray(assignment.rubric.criteria)) {
      assignment.rubric.criteria.forEach((crit) => {
        const evalItem = evaluations.find((e) => e.criterionId === crit.id);
        if (evalItem) {
          const weightedPart = (evalItem.awardedScore / (crit.maxPoints || 100)) * (crit.weightPercentage || 0);
          rawScore += weightedPart;
        }
      });
      rawScore = Math.round(rawScore);
    } else if (manualRawScore !== undefined) {
      rawScore = manualRawScore;
    } else {
      rawScore = evaluations[0]?.awardedScore || 0;
    }

    rawScore = Math.min(100, Math.max(0, rawScore));

    let penaltyDeduction = 0;
    if (sub.isLate && assignment.latePenaltyPercentage > 0) {
      penaltyDeduction = Math.round((rawScore * assignment.latePenaltyPercentage) / 100);
    }

    const finalScore = Math.max(0, rawScore - penaltyDeduction);

    sub.rubricEvaluations = evaluations;
    sub.rawScore = rawScore;
    sub.penaltyDeduction = penaltyDeduction;
    sub.finalScore = finalScore;
    sub.feedbackNotes = feedback;
    sub.lecturerFeedback = feedback;
    sub.status = 'SUDAH_DINILAI';
    sub.gradedAt = new Date().toISOString();
    sub.gradedByLecturerName = lecturerName;

    this.saveSubmissions(submissions);

    apiClient.post(`/assignments/submissions/${submissionId}/grade`, {
      rubricEvaluations: evaluations,
      feedbackNotes: feedback,
      manualRawScore
    }).catch(err => console.warn('Background grade sync notice:', err));

    auditService.record(
      lecturerId,
      lecturerName,
      'dosen',
      'PENILAIAN_TUGAS',
      'TUGAS_KULIAH',
      `Penilaian tugas ${sub.studentName} (${sub.studentNim}): Nilai Lama = ${oldScore ?? 'Belum Dinilai'} -> Nilai Baru = ${finalScore} (Skor Murni: ${rawScore}, Potongan Terlambat: ${penaltyDeduction}).`,
      'SUKSES'
    );

    return sub;
  }
}

export const assignmentService = new AssignmentService();
