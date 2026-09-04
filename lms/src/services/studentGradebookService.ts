import { 
  CourseGradebookSummary, 
  AssessmentItemDetail, 
  GradeInquiryRequest, 
  TargetGradeSimulation 
} from '../types/studentGradebook';
import { LetterGrade } from '../types/khs';

// Dataset Mock Buku Nilai Mata Kuliah 1: Ushul Fiqih & Qawaid Fiqhiyyah (PAI-301)
const PAI_301_ITEMS: AssessmentItemDetail[] = [
  {
    id: 'asg-01',
    title: 'Makalah Analisis Kaidah Al-Amru wa An-Nahyu',
    componentType: 'TUGAS',
    meetingNumber: 3,
    weightPercentage: 10,
    maxScore: 100,
    earnedScore: 92.0,
    rawScore: 92.0,
    penaltyDeduction: 0,
    dueDate: '2026-09-10T23:59:00Z',
    submittedAt: '2026-09-09T14:30:00Z',
    gradedAt: '2026-09-12T10:00:00Z',
    lecturerFeedback: 'Sangat baik. Analisis dalil Al-Quran dan contoh kaidah ushuliyyah dipaparkan dengan lugas dan referensi muktabar.',
    rubricSummary: [
      { criterionTitle: 'Kedalaman Analisis Kaidah', levelTitle: 'Sangat Baik', points: 40, maxPoints: 40 },
      { criterionTitle: 'Kelengkapan Rujukan Kitab', levelTitle: 'Sangat Baik', points: 30, maxPoints: 30 },
      { criterionTitle: 'Sistematika & Tata Tulis', levelTitle: 'Baik', points: 22, maxPoints: 30 }
    ],
    isGraded: true
  },
  {
    id: 'asg-02',
    title: 'Studi Kasus Fatwa Kontemporer berbasis Qawaid Fiqhiyyah',
    componentType: 'TUGAS',
    meetingNumber: 7,
    weightPercentage: 10,
    maxScore: 100,
    earnedScore: 88.0,
    rawScore: 88.0,
    penaltyDeduction: 0,
    dueDate: '2026-10-15T23:59:00Z',
    submittedAt: '2026-10-14T20:15:00Z',
    gradedAt: '2026-10-18T09:00:00Z',
    lecturerFeedback: 'Penerapan kaidah Ad-Dhararu Yuzal pada transaksi digital sudah tepat, perdalam argumentasi maqashid syariah.',
    rubricSummary: [
      { criterionTitle: 'Ketepatan Pemilihan Kaidah', levelTitle: 'Sangat Baik', points: 40, maxPoints: 40 },
      { criterionTitle: 'Argumentasi Hukum Islam', levelTitle: 'Baik', points: 26, maxPoints: 30 },
      { criterionTitle: 'Refleksi & Kesimpulan', levelTitle: 'Baik', points: 22, maxPoints: 30 }
    ],
    isGraded: true
  },
  {
    id: 'qz-01',
    title: 'Kuis 1: Pengantar Sumber Hukum Islam Muttafaq & Mukhtalaf',
    componentType: 'KUIS',
    meetingNumber: 4,
    weightPercentage: 7.5,
    maxScore: 100,
    earnedScore: 90.0,
    rawScore: 90.0,
    submittedAt: '2026-09-20T11:30:00Z',
    gradedAt: '2026-09-20T12:00:00Z',
    lecturerFeedback: 'Penguasaan konsep ijma dan qiyas sangat memuaskan.',
    isGraded: true
  },
  {
    id: 'qz-02',
    title: 'Kuis 2: Ushul Fiqih & Teori Ijtihad',
    componentType: 'KUIS',
    meetingNumber: 6,
    weightPercentage: 7.5,
    maxScore: 100,
    earnedScore: 86.0,
    rawScore: 86.0,
    submittedAt: '2026-10-05T10:45:00Z',
    gradedAt: '2026-10-05T11:00:00Z',
    lecturerFeedback: 'Perlu sedikit ketelitian pada syarat mujtahid fil madzhab.',
    isGraded: true
  },
  {
    id: 'uts-01',
    title: 'Ujian Tengah Semester (UTS) Teori & Analisis Fikih',
    componentType: 'UTS',
    meetingNumber: 8,
    weightPercentage: 25,
    maxScore: 100,
    earnedScore: 92.0,
    rawScore: 92.0,
    submittedAt: '2026-10-25T09:45:00Z',
    gradedAt: '2026-10-29T14:00:00Z',
    lecturerFeedback: 'Lembar jawaban UTS komprehensif, penyelesaian istihsan dan mashlahah mursalah dijelaskan dengan dalil yang kuat.',
    isGraded: true
  },
  {
    id: 'uas-01',
    title: 'Ujian Akhir Semester (UAS) Praktik Takhrij Kaidah & Bahtsul Masail',
    componentType: 'UAS',
    meetingNumber: 16,
    weightPercentage: 30,
    maxScore: 100,
    earnedScore: 94.0,
    rawScore: 94.0,
    submittedAt: '2026-12-18T11:00:00Z',
    gradedAt: '2026-12-22T16:00:00Z',
    lecturerFeedback: 'Hasil akhir luar biasa. Mahasiswa mampu mensintesis kaidah ushuliyah dan fikhiyah pada persoalan kontemporer secara solutif.',
    isGraded: true
  },
  {
    id: 'frm-01',
    title: 'Partisipasi & Interaksi Forum Bahtsul Masail Daring',
    componentType: 'PARTISIPASI_FORUM',
    weightPercentage: 0, // Bagian dari nilai keaktifan presensi
    maxScore: 100,
    earnedScore: 95.0,
    isGraded: true,
    lecturerFeedback: 'Sangat aktif memberikan tanggapan ilmiah dan rujukan kitab pada forum diskusi kelas.'
  }
];

// In-Memory Storage for Inquiries
let INQUIRIES_DATA: GradeInquiryRequest[] = [
  {
    id: 'inq-01',
    classId: 'cls-pai301-a',
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    assessmentItemId: 'asg-02',
    assessmentTitle: 'Studi Kasus Fatwa Kontemporer berbasis Qawaid Fiqhiyyah',
    studentId: 'usr-mhs-01',
    studentName: 'Ahmad Fauzi',
    studentNim: '21.01.0042',
    currentScore: 88.0,
    reasonCategory: 'KETIDAKSESUAIAN_RUBRIK',
    inquiryMessage: 'Assalamu alaikum Bapak Dosen, izin memohon klarifikasi rubrik poin argumentasi hukum pada tugas 2. Pada lembar lampiran halaman 4 telah dicantumkan rujukan kitab Al-Mustashfa Imam Al-Ghazali. Mohon berkenan mengecek kembali.',
    lecturerResponse: 'Waalaikumussalam. Terima kasih Fauzi, berkas lampiran halaman 4 telah diverifikasi kembali dan nilainya disesuaikan dari 84 ke 88.',
    revisedScore: 88.0,
    status: 'DISETUJUI_REVISI',
    createdAt: '2026-10-16T10:00:00Z',
    resolvedAt: '2026-10-18T09:00:00Z'
  }
];

export class StudentGradebookService {
  /**
   * Mengambil buku nilai seluruh mata kuliah yang diambil mahasiswa pada semester aktif
   */
  getStudentGradebook(_studentId: string = 'usr-mhs-01'): CourseGradebookSummary[] {
    return [
      {
        classId: 'cls-pai301-a',
        courseId: 'crs-pai301',
        courseCode: 'PAI-301',
        courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
        credits: 3,
        className: 'Kelas A',
        lecturerName: 'Dr. H. M. Ridwan, M.Ag',
        lecturerNidn: '2112087501',
        academicYear: '2026/2027 Ganjil',
        presenceScore: 95.0,
        presenceDetails: {
          totalMeetings: 16,
          attendedCount: 15,
          excusedCount: 1,
          sickCount: 0,
          absentCount: 0,
          attendancePercentage: 93.75
        },
        assignmentScore: 90.0,
        quizScore: 88.0,
        midtermScore: 92.0,
        finalExamScore: 94.0,
        forumParticipationScore: 95.0,
        currentCalculatedScore: 92.20,
        projectedLetterGrade: 'A',
        projectedGradePoint: 4.00,
        gradedComponentsCount: 7,
        totalComponentsCount: 7,
        isFinalized: true,
        items: PAI_301_ITEMS,
        lecturerGeneralNotes: 'Pemahaman konsep kaidah fikih sangat tajam dan partisipasi di kelas selalu aktif.'
      },
      {
        classId: 'cls-pai204-a',
        courseId: 'crs-pai204',
        courseCode: 'PAI-204',
        courseName: "Ulumul Qur'an & Studi Tafsir Tematik",
        credits: 3,
        className: 'Kelas A',
        lecturerName: 'Dra. Hj. Siti Aminah, M.Pd.I',
        lecturerNidn: '2115047802',
        academicYear: '2026/2027 Ganjil',
        presenceScore: 100.0,
        presenceDetails: {
          totalMeetings: 16,
          attendedCount: 16,
          excusedCount: 0,
          sickCount: 0,
          absentCount: 0,
          attendancePercentage: 100.0
        },
        assignmentScore: 92.0,
        quizScore: 90.0,
        midtermScore: 88.0,
        finalExamScore: 90.0,
        forumParticipationScore: 92.0,
        currentCalculatedScore: 91.10,
        projectedLetterGrade: 'A',
        projectedGradePoint: 4.00,
        gradedComponentsCount: 6,
        totalComponentsCount: 6,
        isFinalized: true,
        items: [
          {
            id: 'asg-tfs-01',
            title: 'Makalah Analisis Ayat Tarbawi Surah Luqman',
            componentType: 'TUGAS',
            meetingNumber: 4,
            weightPercentage: 20,
            maxScore: 100,
            earnedScore: 92.0,
            isGraded: true,
            lecturerFeedback: 'Rujukan Tafsir Al-Misbah dan Ibnu Katsir sangat relevan dan mendalam.'
          },
          {
            id: 'qz-tfs-01',
            title: 'Kuis Asbabun Nuzul & Makkiyah-Madaniyyah',
            componentType: 'KUIS',
            meetingNumber: 6,
            weightPercentage: 15,
            maxScore: 100,
            earnedScore: 90.0,
            isGraded: true
          },
          {
            id: 'uts-tfs-01',
            title: 'UTS Teori Penafsiran Tematik',
            componentType: 'UTS',
            meetingNumber: 8,
            weightPercentage: 25,
            maxScore: 100,
            earnedScore: 88.0,
            isGraded: true
          },
          {
            id: 'uas-tfs-01',
            title: 'UAS Karya Tulis Tafsir Ayat Pendidikan',
            componentType: 'UAS',
            meetingNumber: 16,
            weightPercentage: 30,
            maxScore: 100,
            earnedScore: 90.0,
            isGraded: true
          }
        ],
        lecturerGeneralNotes: 'Kehadiran sempurna 100% dan analisis ayat Al-Quran sangat baik.'
      },
      {
        classId: 'cls-pai205-a',
        courseId: 'crs-pai205',
        courseCode: 'PAI-205',
        courseName: 'Ulumul Hadits & Studi Sanad Matan',
        credits: 3,
        className: 'Kelas A',
        lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I',
        lecturerNidn: '2105088201',
        academicYear: '2026/2027 Ganjil',
        presenceScore: 90.0,
        presenceDetails: {
          totalMeetings: 16,
          attendedCount: 14,
          excusedCount: 2,
          sickCount: 0,
          absentCount: 0,
          attendancePercentage: 87.5
        },
        assignmentScore: 85.0,
        quizScore: 86.0,
        midtermScore: 88.0,
        finalExamScore: 89.0,
        currentCalculatedScore: 87.60,
        projectedLetterGrade: 'A-',
        projectedGradePoint: 3.75,
        gradedComponentsCount: 5,
        totalComponentsCount: 5,
        isFinalized: true,
        items: [
          {
            id: 'asg-hds-01',
            title: 'Praktik Takhrij Hadits Kitab Kutubut Tisah',
            componentType: 'TUGAS',
            meetingNumber: 5,
            weightPercentage: 20,
            maxScore: 100,
            earnedScore: 85.0,
            isGraded: true,
            lecturerFeedback: 'Metode takhrij baik, tingkatkan ketelitian skema sanad.'
          },
          {
            id: 'qz-hds-01',
            title: 'Kuis Kaidah Jarh wa Tadil',
            componentType: 'KUIS',
            meetingNumber: 6,
            weightPercentage: 15,
            maxScore: 100,
            earnedScore: 86.0,
            isGraded: true
          },
          {
            id: 'uts-hds-01',
            title: 'UTS Studi Matan & Kritik Hadits',
            componentType: 'UTS',
            meetingNumber: 8,
            weightPercentage: 25,
            maxScore: 100,
            earnedScore: 88.0,
            isGraded: true
          },
          {
            id: 'uas-hds-01',
            title: 'UAS Ujian Komprehensif Ulumul Hadits',
            componentType: 'UAS',
            meetingNumber: 16,
            weightPercentage: 30,
            maxScore: 100,
            earnedScore: 89.0,
            isGraded: true
          }
        ]
      },
      {
        classId: 'cls-pai302-a',
        courseId: 'crs-pai302',
        courseCode: 'PAI-302',
        courseName: 'Pengembangan Kurikulum PAI Berbasis Karakter',
        credits: 3,
        className: 'Kelas A',
        lecturerName: 'Dr. H. M. Ridwan, M.Ag',
        lecturerNidn: '2112087501',
        academicYear: '2026/2027 Ganjil',
        presenceScore: 95.0,
        presenceDetails: {
          totalMeetings: 16,
          attendedCount: 15,
          excusedCount: 1,
          sickCount: 0,
          absentCount: 0,
          attendancePercentage: 93.75
        },
        assignmentScore: 94.0,
        quizScore: 90.0,
        midtermScore: 92.0,
        finalExamScore: 95.0,
        currentCalculatedScore: 93.80,
        projectedLetterGrade: 'A',
        projectedGradePoint: 4.00,
        gradedComponentsCount: 5,
        totalComponentsCount: 5,
        isFinalized: true,
        items: []
      },
      {
        classId: 'cls-pai303-a',
        courseId: 'crs-pai303',
        courseCode: 'PAI-303',
        courseName: 'Metodologi Pembelajaran PAI Abad 21',
        credits: 3,
        className: 'Kelas A',
        lecturerName: 'Dr. Hj. Nurul Hidayati, M.Pd',
        lecturerNidn: '2108117901',
        academicYear: '2026/2027 Ganjil',
        presenceScore: 90.0,
        presenceDetails: {
          totalMeetings: 16,
          attendedCount: 14,
          excusedCount: 2,
          sickCount: 0,
          absentCount: 0,
          attendancePercentage: 87.5
        },
        assignmentScore: 88.0,
        quizScore: 85.0,
        midtermScore: 86.0,
        finalExamScore: 88.0,
        currentCalculatedScore: 87.25,
        projectedLetterGrade: 'A-',
        projectedGradePoint: 3.75,
        gradedComponentsCount: 5,
        totalComponentsCount: 5,
        isFinalized: true,
        items: []
      },
      {
        classId: 'cls-pai304-a',
        courseId: 'crs-pai304',
        courseCode: 'PAI-304',
        courseName: 'Evaluasi & Asesmen Pembelajaran PAI',
        credits: 3,
        className: 'Kelas A',
        lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I',
        lecturerNidn: '2105088201',
        academicYear: '2026/2027 Ganjil',
        presenceScore: 95.0,
        presenceDetails: {
          totalMeetings: 16,
          attendedCount: 15,
          excusedCount: 1,
          sickCount: 0,
          absentCount: 0,
          attendancePercentage: 93.75
        },
        assignmentScore: 89.0,
        quizScore: 88.0,
        midtermScore: 90.0,
        finalExamScore: 91.0,
        currentCalculatedScore: 90.30,
        projectedLetterGrade: 'A',
        projectedGradePoint: 4.00,
        gradedComponentsCount: 5,
        totalComponentsCount: 5,
        isFinalized: true,
        items: []
      },
      {
        classId: 'cls-mku201-a',
        courseId: 'crs-mku201',
        courseCode: 'MKU-201',
        courseName: 'Metodologi Penelitian Kualitatif & Kuantitatif',
        credits: 3,
        className: 'Kelas A',
        lecturerName: 'Prof. Dr. H. Maksum, M.A',
        lecturerNidn: '2101016501',
        academicYear: '2026/2027 Ganjil',
        presenceScore: 90.0,
        presenceDetails: {
          totalMeetings: 16,
          attendedCount: 14,
          excusedCount: 2,
          sickCount: 0,
          absentCount: 0,
          attendancePercentage: 87.5
        },
        assignmentScore: 86.0,
        quizScore: 84.0,
        midtermScore: 85.0,
        finalExamScore: 88.0,
        currentCalculatedScore: 86.45,
        projectedLetterGrade: 'A-',
        projectedGradePoint: 3.75,
        gradedComponentsCount: 5,
        totalComponentsCount: 5,
        isFinalized: true,
        items: []
      }
    ];
  }

  /**
   * Mengambil detail buku nilai kelas tertentu
   */
  getCourseGradebookDetail(studentId: string = 'usr-mhs-01', classId: string): CourseGradebookSummary | null {
    const list = this.getStudentGradebook(studentId);
    return list.find((c) => c.classId === classId) || list[0] || null;
  }

  /**
   * Simulasi / Kalkulator Prediksi Target Nilai Akhir (What-If Simulator)
   */
  simulateTargetGrade(
    course: CourseGradebookSummary,
    targetGrade: LetterGrade,
    simulatedScores: {
      presence?: number;
      assignment?: number;
      quiz?: number;
      midterm?: number;
    } = {}
  ): TargetGradeSimulation {
    const targetMinScores: Record<LetterGrade, number> = {
      'A': 88.0,
      'A-': 84.0,
      'B+': 80.0,
      'B': 75.0,
      'B-': 70.0,
      'C+': 65.0,
      'C': 60.0,
      'D': 50.0,
      'E': 0.0
    };

    const targetScore = targetMinScores[targetGrade];
    const pres = simulatedScores.presence ?? course.presenceScore;
    const asg = simulatedScores.assignment ?? course.assignmentScore;
    const qz = simulatedScores.quiz ?? course.quizScore;
    const mid = simulatedScores.midterm ?? course.midtermScore;

    // Bobot: Presensi 10% + Tugas 20% + Kuis 15% + UTS 25% + UAS 30%
    const currentContribution = (pres * 0.10) + (asg * 0.20) + (qz * 0.15) + (mid * 0.25);
    const neededUasContribution = targetScore - currentContribution;
    const requiredFinalExamScore = parseFloat((neededUasContribution / 0.30).toFixed(2));

    const isAchievable = requiredFinalExamScore <= 100;

    let notes = '';
    if (requiredFinalExamScore <= 0) {
      notes = `Selamat! Akumulasi nilai Anda saat ini sudah melampaui batas minimal Huruf Mutu ${targetGrade}.`;
    } else if (isAchievable) {
      notes = `Anda membutuhkan skor minimal ${requiredFinalExamScore} pada Ujian Akhir Semester (UAS) untuk mendapatkan nilai akhir ${targetGrade}.`;
    } else {
      notes = `Nilai akhir ${targetGrade} membutuhkan skor UAS sebesar ${requiredFinalExamScore} (di atas batas 100). Pertimbangkan target Huruf Mutu di bawahnya.`;
    }

    return {
      classId: course.classId,
      targetLetterGrade: targetGrade,
      targetScore,
      requiredFinalExamScore: Math.max(0, requiredFinalExamScore),
      isAchievable,
      notes
    };
  }

  /**
   * Mengambil daftar permohonan sanggahan/klarifikasi nilai mahasiswa
   */
  getGradeInquiries(_studentId: string = 'usr-mhs-01'): GradeInquiryRequest[] {
    return [...INQUIRIES_DATA];
  }

  /**
   * Mengajukan permohonan sanggah / klarifikasi nilai baru
   */
  submitGradeInquiry(payload: {
    classId: string;
    courseName: string;
    assessmentItemId: string;
    assessmentTitle: string;
    studentId: string;
    studentName: string;
    studentNim: string;
    currentScore: number;
    reasonCategory: 'REVISI_PENILAIAN' | 'KOREKSI_BERKAS' | 'KETIDAKSESUAIAN_RUBRIK' | 'LAINNYA';
    inquiryMessage: string;
  }): GradeInquiryRequest {
    const newInquiry: GradeInquiryRequest = {
      id: `inq-${Date.now().toString(36)}`,
      ...payload,
      status: 'MENUNGGU_TINJAUAN',
      createdAt: new Date().toISOString()
    };

    INQUIRIES_DATA.unshift(newInquiry);
    return newInquiry;
  }

  /**
   * Mengumpulkan semua umpan balik dosen di seluruh mata kuliah
   */
  getAllLecturerFeedback(studentId: string = 'usr-mhs-01'): Array<{
    id: string;
    courseName: string;
    courseCode: string;
    lecturerName: string;
    assessmentTitle: string;
    score: number;
    feedback: string;
    date: string;
  }> {
    const courses = this.getStudentGradebook(studentId);
    const feedbackList: Array<{
      id: string;
      courseName: string;
      courseCode: string;
      lecturerName: string;
      assessmentTitle: string;
      score: number;
      feedback: string;
      date: string;
    }> = [];

    courses.forEach((c) => {
      c.items.forEach((item) => {
        if (item.lecturerFeedback) {
          feedbackList.push({
            id: item.id,
            courseName: c.courseName,
            courseCode: c.courseCode,
            lecturerName: c.lecturerName,
            assessmentTitle: item.title,
            score: item.earnedScore || 0,
            feedback: item.lecturerFeedback,
            date: item.gradedAt || '17 Agustus 2026'
          });
        }
      });

      if (c.lecturerGeneralNotes) {
        feedbackList.push({
          id: `gen-${c.classId}`,
          courseName: c.courseName,
          courseCode: c.courseCode,
          lecturerName: c.lecturerName,
          assessmentTitle: 'Evaluasi Pembelajaran Umum',
          score: c.currentCalculatedScore,
          feedback: c.lecturerGeneralNotes,
          date: '17 Agustus 2026'
        });
      }
    });

    return feedbackList;
  }
}

export const studentGradebookService = new StudentGradebookService();
