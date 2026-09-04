/**
 * EXCEL (.XLSX / .CSV) UTILITIES & PROFESSIONAL WORKBOOK BUILDER
 * Powered by XLSX (SheetJS) and PapaParse
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { ExportConfig } from '../types/exportImport';
import { formatCellValue, downloadFile, sanitizeFilename } from './exportUtils';
import { MeetingAttendanceData, ClassAttendanceSummaryData } from '../types/attendance';

/**
 * Download standard .xlsx workbook using XLSX library with professional layout
 */
export function exportToXlsxWorkbook<T = any>(config: ExportConfig<T>): void {
  const activeCols = config.columns.filter((c) => !c.hidden && !c.excludeFromExport);
  const wb = XLSX.utils.book_new();

  // 1. Prepare main data sheet rows
  const rows: any[][] = [];

  // Institutional Header
  rows.push(['SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR']);
  rows.push([config.title ? config.title.toUpperCase() : 'LAPORAN AKADEMIK SISTEM SALAM LMS']);
  if (config.subtitle) {
    rows.push([config.subtitle]);
  }
  rows.push(['Tahun Akademik: 2026/2027 • Waktu Ekspor: ' + new Date().toLocaleString('id-ID')]);

  if (config.metadata) {
    rows.push([]);
    Object.entries(config.metadata).forEach(([key, val]) => {
      rows.push([`${key}:`, String(val)]);
    });
  }
  rows.push([]); // Spacing row

  // Table Column Headers
  const headerRow = ['No', ...activeCols.map((c) => c.header)];
  rows.push(headerRow);

  // Table Data Rows
  config.data.forEach((item, idx) => {
    const rowValues = [
      idx + 1,
      ...activeCols.map((col) => {
        return formatCellValue(col, item);
      })
    ];
    rows.push(rowValues);
  });

  // Footer spacing & summary
  rows.push([]);
  rows.push(['Total Rekord:', config.data.length, 'Data diekspor secara resmi dari SALAM LMS STAI Al-Ittihad']);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Calculate auto column widths
  const colWidths = [
    { wch: 6 }, // 'No' column
    ...activeCols.map((col) => {
      const maxLen = Math.max(
        col.header.length,
        ...config.data.slice(0, 100).map((row) => {
          const val = String(formatCellValue(col, row) || '');
          return val.length;
        })
      );
      return { wch: Math.min(Math.max(maxLen + 4, 14), 50) };
    })
  ];

  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, (config.title || 'Laporan').slice(0, 31));

  // Generate and download file safely via Blob
  const baseName = config.filename || config.title || 'SALAM_Ekspor_Data';
  const filename = sanitizeFilename(baseName, 'xlsx');
  
  try {
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadFile(blob, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  } catch {
    XLSX.writeFile(wb, filename);
  }
}

/**
 * Professional Excel (.xlsx) Export for Sesi Pertemuan Presensi & BAP
 */
export function exportAttendanceMeetingExcel(
  sessionData: MeetingAttendanceData,
  filteredStudents?: any[]
): void {
  const wb = XLSX.utils.book_new();
  const rows: any[][] = [];

  const studentsList = filteredStudents || sessionData.students;

  // 1. Institutional Header
  rows.push(['SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR']);
  rows.push(['PUSAT PENJAMINAN MUTU AKADEMIK & PEMBELAJARAN']);
  rows.push(['BERITA ACARA PERKULIAHAN & DAFTAR HADIR MAHASISWA']);
  rows.push(['Tahun Akademik: 2026/2027 — Semester Ganjil']);
  rows.push([]);

  // 2. Meeting Meta Section
  rows.push(['INFORMASI PERKULIAHAN:']);
  rows.push(['Mata Kuliah', `${sessionData.meeting.courseName} (${sessionData.meeting.classCode})`, 'SKS', `${sessionData.meeting.credits} SKS`]);
  rows.push(['Rombel Kelas', `Kelas ${sessionData.meeting.className}`, 'Pertemuan Ke-', `Pertemuan #${sessionData.meeting.meetingNumber}`]);
  rows.push(['Jadwal Kuliah', `${sessionData.meeting.scheduledDate} (${sessionData.meeting.startTime} - ${sessionData.meeting.endTime} WIB)`, 'Moda', sessionData.session.deliveryMode || 'TATAP_MUKA']);
  rows.push(['Dosen Pengampu', sessionData.meeting.lecturerName, 'Status Sesi', sessionData.session.sessionStatus]);
  rows.push(['Realisasi Materi', sessionData.session.teachingJournal || sessionData.meeting.topic || '-', '', '']);
  if (sessionData.session.journalNotes) {
    rows.push(['Catatan Perkuliahan', sessionData.session.journalNotes, '', '']);
  }
  rows.push([]);

  // 3. KPI Attendance Summary
  rows.push(['RINGKASAN KEHADIRAN:']);
  rows.push(['Total Mahasiswa', 'Mahasiswa Hadir', 'Sakit', 'Izin', 'Alpa', '% Kehadiran']);
  rows.push([
    sessionData.summary.totalStudents,
    sessionData.summary.countHadir,
    sessionData.summary.countSakit,
    sessionData.summary.countIzin,
    sessionData.summary.countAlpa,
    `${sessionData.summary.attendancePercentage}%`
  ]);
  rows.push([]);

  // 4. Student Attendance Table
  rows.push(['DAFTAR PRESENSI MAHASISWA:']);
  rows.push(['No', 'NIM', 'Nama Lengkap Mahasiswa', 'Email Mahasiswa', 'Status Kehadiran', 'Metode Presensi', 'Waktu Rekam', 'Catatan / Keterangan']);

  studentsList.forEach((st, idx) => {
    rows.push([
      idx + 1,
      st.studentNim,
      st.studentName,
      st.studentEmail || '-',
      st.status,
      st.method ? st.method.replace('_', ' ') : '-',
      st.recordedAt ? new Date(st.recordedAt).toLocaleString('id-ID') : '-',
      st.notes || '-'
    ]);
  });

  // 5. Signatures Block
  rows.push([]);
  rows.push([]);
  rows.push(['', 'Mengetahui,', '', '', '', 'Cianjur, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })]);
  rows.push(['', 'Ketua Program Studi', '', '', '', 'Dosen Pengampu Perkuliahan']);
  rows.push([]);
  rows.push([]);
  rows.push(['', 'Dr. H. Ahmad Fauzi, M.Pd.I', '', '', '', sessionData.meeting.lecturerName]);
  rows.push(['', 'NIDN: 21098501', '', '', '', 'NIDN: 21107901']);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },   // No
    { wch: 16 },  // NIM
    { wch: 32 },  // Nama
    { wch: 28 },  // Email
    { wch: 18 },  // Status
    { wch: 20 },  // Metode
    { wch: 22 },  // Waktu
    { wch: 35 }   // Catatan
  ];

  XLSX.utils.book_append_sheet(wb, ws, `Presensi_P${sessionData.meeting.meetingNumber}`);

  const filename = sanitizeFilename(`Presensi_P${sessionData.meeting.meetingNumber}_${sessionData.meeting.className.replace(/\s+/g, '_')}`, 'xlsx');
  
  try {
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadFile(blob, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  } catch {
    XLSX.writeFile(wb, filename);
  }
}

/**
 * Professional Excel (.xlsx) Export for Semester Recap Matrix & UAS Eligibility
 */
export function exportSemesterRecapMatrixExcel(
  classSummary: ClassAttendanceSummaryData,
  filteredRecapRows?: any[],
  stats?: {
    totalStudents: number;
    eligibleCount: number;
    dispensationCount: number;
    avgPercentage: number;
    eligibleRate: number;
  }
): void {
  const wb = XLSX.utils.book_new();
  const rows: any[][] = [];

  const dataRows = filteredRecapRows || classSummary.recap;
  const meetingCols = classSummary.meetings;

  // 1. Institutional Header
  rows.push(['SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR']);
  rows.push(['BAGIAN ADMINISTRASI AKADEMIK & KEMAHASISWAAN (BAAK)']);
  rows.push(['MATRIKS REKAPITULASI PRESENSI & KELAYAKAN UJIAN AKHIR SEMESTER (UAS)']);
  rows.push(['Tahun Akademik: 2026/2027 — Semester Ganjil • Ambang Batas Minimal: 75%']);
  rows.push([]);

  // 2. Class Meta Section
  rows.push(['INFORMASI MATA KULIAH & ROMBEL:']);
  rows.push(['Mata Kuliah', `${classSummary.classInfo.courseName} (${classSummary.classInfo.code})`, 'SKS', `${classSummary.classInfo.credits} SKS`]);
  rows.push(['Rombel Kelas', `Kelas ${classSummary.classInfo.name}`, 'Dosen Pengampu', classSummary.classInfo.lecturerName]);
  rows.push(['Total Pertemuan', `${meetingCols.length} Sesi Terjadwal`, 'Waktu Unduh', new Date().toLocaleString('id-ID')]);
  rows.push([]);

  // 3. Executive KPI Statistics
  if (stats) {
    rows.push(['STATISTIK KELAYAKAN UAS:']);
    rows.push(['Total Mahasiswa', 'Layak UAS (≥75%)', 'Perlu Dispensasi (<75%)', 'Rasio Kelayakan', 'Rata-Rata Kehadiran Kelas']);
    rows.push([
      stats.totalStudents,
      stats.eligibleCount,
      stats.dispensationCount,
      `${stats.eligibleRate}%`,
      `${stats.avgPercentage}%`
    ]);
    rows.push([]);
  }

  // 4. Matrix Table Headers
  const meetingHeaderNames = meetingCols.map((m) => `P${m.meetingNumber}`);
  rows.push(['MATRIKS PRESENSI SEMESTER:']);
  rows.push([
    'No',
    'NIM',
    'Nama Lengkap Mahasiswa',
    ...meetingHeaderNames,
    'Total Hadir (H)',
    'Total Sakit (S)',
    'Total Izin (I)',
    'Total Alpa (A)',
    '% Kehadiran',
    'Status Kelayakan UAS'
  ]);

  // 5. Data Rows
  dataRows.forEach((row, idx) => {
    const meetingStatuses = meetingCols.map((m) => {
      const st = row.meetingStatuses[m.meetingNumber];
      return st === 'HADIR' ? 'H' : st === 'SAKIT' ? 'S' : st === 'IZIN' ? 'I' : 'A';
    });

    rows.push([
      idx + 1,
      row.studentNim,
      row.studentName,
      ...meetingStatuses,
      row.hadir,
      row.sakit,
      row.izin,
      row.alpa,
      `${row.percentage}%`,
      row.isEligibleForExam ? 'LAYAK UAS (≥75%)' : 'PERLU DISPENSASI (<75%)'
    ]);
  });

  // 6. Signatures Block
  rows.push([]);
  rows.push([]);
  rows.push([
    'Mengetahui,',
    '',
    'Menyetujui,',
    ...meetingCols.map(() => ''),
    'Cianjur, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  ]);
  rows.push([
    'Kepala BAAK',
    '',
    'Ketua Program Studi',
    ...meetingCols.map(() => ''),
    'Dosen Pengampu Perkuliahan'
  ]);
  rows.push([]);
  rows.push([]);
  rows.push([
    'H. Ridwan Malik, M.M.',
    '',
    'Dr. H. Ahmad Fauzi, M.Pd.I',
    ...meetingCols.map(() => ''),
    classSummary.classInfo.lecturerName
  ]);
  rows.push([
    'NIP: 197805122005011002',
    '',
    'NIDN: 21098501',
    ...meetingCols.map(() => ''),
    'NIDN: 21107901'
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },   // No
    { wch: 16 },  // NIM
    { wch: 32 },  // Nama
    ...meetingCols.map(() => ({ wch: 6 })), // P1..P16
    { wch: 16 },  // H
    { wch: 16 },  // S
    { wch: 16 },  // I
    { wch: 16 },  // A
    { wch: 16 },  // %
    { wch: 26 }   // Kelayakan UAS
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Rekap_Semester_Matriks');

  const filename = sanitizeFilename(`Rekap_Semester_Presensi_${classSummary.classInfo.name.replace(/\s+/g, '_')}_${classSummary.classInfo.code}`, 'xlsx');

  try {
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadFile(blob, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  } catch {
    XLSX.writeFile(wb, filename);
  }
}

/**
 * Parse Excel (.xlsx / .xls) file to 2D Array of raw string records
 */
export async function parseExcelFile(file: File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        if (!worksheet) {
          throw new Error('Lembar kerja kosong atau tidak valid.');
        }

        const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, {
          header: 1,
          defval: '',
          raw: false
        });

        const cleanedRows = jsonData
          .map((row) => row.map((cell: any) => (cell !== undefined && cell !== null ? String(cell).trim() : '')))
          .filter((row) => row.some((cell: string) => cell.length > 0));

        resolve(cleanedRows);
      } catch (err: any) {
        reject(new Error(err.message || 'Gagal membaca berkas Excel.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca berkas dari sistem lokal.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse CSV file or raw text using PapaParse with automatic delimiter detection
 */
export async function parseCsvWithPapa(input: File | string): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    Papa.parse(input as any, {
      skipEmptyLines: 'greedy',
      header: false,
      transform: (val: string) => val.trim(),
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          const fatal = results.errors.find((e) => e.type === 'FieldMismatch' || e.type === 'Quotes');
          if (fatal) {
            console.warn('PapaParse warning:', fatal.message);
          }
        }
        const rows = (results.data as string[][]).filter((row) =>
          row.some((cell) => cell && cell.length > 0)
        );
        resolve(rows);
      },
      error: (error) => {
        reject(new Error(`Gagal memproses berkas: ${error.message}`));
      }
    });
  });
}

/**
 * Professional Multi-Sheet Excel Template Builder for Question Bank (Bank Soal)
 * STAI Al-Ittihad Cianjur — SALAM LMS
 */
export function exportQuestionBankExcelTemplate(): void {
  const wb = XLSX.utils.book_new();

  // =========================================================================
  // SHEET 1: DATA_SOAL (Data Sheet)
  // =========================================================================
  const dataHeaders = [
    'Kode Mata Kuliah *',
    'Topik CPMK *',
    'Tipe Soal *',
    'Tingkat Kesulitan',
    'Teks Pertanyaan Soal *',
    'Teks Arab (Opsional)',
    'URL Gambar (Opsional)',
    'Opsi A',
    'Opsi B',
    'Opsi C',
    'Opsi D',
    'Opsi E',
    'Kunci Jawaban *',
    'Bobot Poin',
    'Pembahasan / Rubrik',
    'Tagar / Kategori'
  ];

  const sampleRows: any[][] = [
    dataHeaders,
    [
      'PAI-301',
      'Kaidah Lughawiyah Ushul Fiqih',
      'PILIHAN_GANDA',
      'SEDANG',
      'Lafadz yang mencakup seluruh satuan yang tidak terbatas dalam satu ketetapan hukum tanpa batasan bilangan tertentu disebut:',
      '',
      '',
      "Lafadz 'Am (Umum)",
      'Lafadz Khas (Khusus)',
      'Lafadz Mujmal',
      'Lafadz Mutlaq',
      'Lafadz Muqayyad',
      'A',
      20,
      "Lafadz 'Am adalah lafadz yang menghabiskan semua apa yang layak baginya menurut satu makna sekaligus.",
      'Ushul Fiqih, Lughawiyah, Am wa Khas'
    ],
    [
      'PAI-301',
      'Kulliyatul Khams & Kaidah Asasiyah',
      'PILIHAN_GANDA',
      'SEDANG',
      'Perhatikan matan kaidah fiqhiyyah asasiyah berikut dan tentukan terjemah serta implikasi hukumnya:',
      'الأَصْلُ فِي الأَشْيَاءِ الإِبَاحَةُ حَتَّى يَدُلَّ الدَّلِيلُ عَلَى التَّحْرِيمِ',
      '',
      'Segala sesuatu pada dasarnya haram sampai ada dalil yang membolehkan',
      'Hukum asal segala sesuatu adalah mubah/boleh hingga ada dalil yang mengharamkannya',
      'Keyakinan tidak dapat dihilangkan hanya dengan keraguan',
      'Kemudharatan harus dihilangkan sedapat mungkin',
      'Adat kebiasaan masyarakat dapat ditetapkan sebagai rujukan hukum',
      'B',
      20,
      "Kaidah al-ashlu fil-asyya'i al-ibahah adalah kaidah fundamental dalam muamalah dan perkara non-ibadah mahdhah.",
      'Kaidah Fiqhiyyah, Teks Arab, Asasiyah'
    ],
    [
      'PAI-301',
      'Kaidah Amar dan Nahyi',
      'BENAR_SALAH',
      'MUDAH',
      'Kaidah ushuliyah menetapkan bahwa asal larangan (nahyi) menunjukkan hukum makruh secara mutlak.',
      'الأَصْلُ فِي النَّهْيِ لِلدَّلَالَةِ عَلَى التَّحْرِيمِ',
      '',
      'Benar',
      'Salah',
      '',
      '',
      '',
      'B',
      20,
      'Salah, karena kaidah asalnya larangan (nahyi) menunjukkan hukum TAHRIIM (Haram), bukan makruh kecuali ada qarinah.',
      'Nahyi, Tahrim, Kaidah Asal'
    ],
    [
      'PAI-301',
      'Sumber Hukum Islam',
      'JAWABAN_SINGKAT',
      'SEDANG',
      "Kesepakatan seluruh mujtahid dari umat Nabi Muhammad SAW pada suatu masa setelah wafatnya beliau atas suatu hukum syar'i disebut:",
      'اتِّفَاقُ مُجْتَهِدِي أُمَّةِ مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ فِي عَصْرٍ عَلَى أَمْرٍ شَرْعِيٍّ',
      '',
      '',
      '',
      '',
      '',
      '',
      'ijma',
      20,
      "Ijma' secara istilah adalah kesepakatan para mujtahid umat Islam dalam satu kurun masa atas hukum syara'.",
      'Ijma, Sumber Hukum'
    ],
    [
      'PAI-301',
      'Metode Ijtihad & Istinbath',
      'ESAI',
      'SULIT',
      'Jelaskan perbedaan mendasar antara metode Qiyas (Analogi Hukum) dan Istihsan, serta berikan 1 contoh penerapan Istihsan dalam transaksi muamalah kontemporer!',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'Rubrik: Definisi Qiyas (bobot 30%), Definisi Istihsan (bobot 30%), Contoh kasus muamalah & ketepatan dalil (bobot 40%).',
      20,
      'Qiyas menggunakan kesamaan illat, sedangkan Istihsan mengecualikan hukum demi maslahat yang lebih kuat.',
      'Qiyas, Istihsan, Esai OBE'
    ]
  ];

  const wsData = XLSX.utils.aoa_to_sheet(sampleRows);

  wsData['!cols'] = [
    { wch: 18 }, // Kode MK
    { wch: 28 }, // Topik CPMK
    { wch: 18 }, // Tipe Soal
    { wch: 16 }, // Kesulitan
    { wch: 45 }, // Teks Soal
    { wch: 35 }, // Teks Arab
    { wch: 25 }, // URL Gambar
    { wch: 22 }, // Opsi A
    { wch: 22 }, // Opsi B
    { wch: 22 }, // Opsi C
    { wch: 22 }, // Opsi D
    { wch: 22 }, // Opsi E
    { wch: 18 }, // Kunci Jawaban
    { wch: 14 }, // Bobot Poin
    { wch: 35 }, // Pembahasan
    { wch: 25 }  // Tagar
  ];

  XLSX.utils.book_append_sheet(wb, wsData, 'Data_Soal');

  // =========================================================================
  // SHEET 2: PETUNJUK_PENGISIAN (Instructions Sheet)
  // =========================================================================
  const instructionRows: any[][] = [
    ['PANDUAN RESMI PENYUSUNAN TEMPLATE BANK SOAL EXCEL'],
    ['SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR'],
    ['Sistem Pembelajaran Daring Terintegrasi (SALAM LMS)'],
    [],
    ['PETUNJUK UMUM PENGISIAN:'],
    ['1.', 'Kolom dengan tanda bintang (*) adalah KOLOM WAJIB DIISI.'],
    ['2.', 'Jangan menghapus atau mengubah nama kolom pada baris pertama di lembar "Data_Soal".'],
    ['3.', 'Tipe Soal yang didukung:', 'PILIHAN_GANDA, BENAR_SALAH, JAWABAN_SINGKAT, ESAI'],
    ['4.', 'Format Kunci Jawaban:', 'Untuk PILIHAN_GANDA isi huruf "A", "B", "C", "D", atau "E". Untuk BENAR_SALAH isi "A" (Benar) atau "B" (Salah). Untuk JAWABAN_SINGKAT isi kata kunci jawaban. Untuk ESAI isi pedoman rubrik.'],
    ['5.', 'Teks Arab / Matan Hadits / Ayat dapat langsung disalin ke kolom "Teks Arab (Opsional)".'],
    ['6.', 'Bobot Poin standar adalah 20 poin per butir soal (rentang valid: 1 s.d. 100 poin).'],
    [],
    ['TABEL SPESIFIKASI KOLOM:'],
    ['No', 'Nama Kolom', 'Wajib', 'Format Nilai Valid', 'Keterangan'],
    [1, 'Kode Mata Kuliah', 'Wajib', 'Teks (e.g. PAI-301, TBI-201)', 'Lihat lembar "Referensi_Kode_MK"'],
    [2, 'Topik CPMK', 'Wajib', 'Teks bebas', 'Pokok bahasan atau Capaian Pembelajaran'],
    [3, 'Tipe Soal', 'Wajib', 'PILIHAN_GANDA | BENAR_SALAH | JAWABAN_SINGKAT | ESAI', 'Jenis instrumen evaluasi'],
    [4, 'Tingkat Kesulitan', 'Opsional', 'MUDAH | SEDANG | SULIT', 'Tingkat taksonomi Bloom (Default: SEDANG)'],
    [5, 'Teks Pertanyaan Soal', 'Wajib', 'Teks lengkap pertanyaan', 'Redaksi soal utama'],
    [6, 'Teks Arab', 'Opsional', 'Teks Arab / Hijaiyah', 'Untuk matan kaidah, ayat, hadits'],
    [7, 'URL Gambar', 'Opsional', 'URL Web gambar (https://...) atau kosong', 'Diagram / ilustrasi soal'],
    [8, 'Opsi A s.d. E', 'Kondisional', 'Teks pilihan jawaban', 'Wajib diisi untuk tipe PILIHAN_GANDA (min. 2 opsi)'],
    [9, 'Kunci Jawaban', 'Wajib', 'Huruf opsi / kata / rubrik', 'A, B, C, D, E atau kata kunci'],
    [10, 'Bobot Poin', 'Opsional', 'Angka 1 - 100', 'Default: 20 poin'],
    [11, 'Pembahasan / Rubrik', 'Opsional', 'Teks penjelasan', 'Umpan balik saat pembahasan hasil ujian'],
    [12, 'Tagar / Kategori', 'Opsional', 'Teks dipisahkan koma', 'Klasifikasi bank soal']
  ];

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionRows);
  wsInstructions['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 14 },
    { wch: 35 },
    { wch: 45 }
  ];

  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Petunjuk_Pengisian');

  // =========================================================================
  // SHEET 3: REFERENSI_KODE_MK (Course Code Reference Sheet)
  // =========================================================================
  const courseRows: any[][] = [
    ['DAFTAR REFERENSI KODE MATA KULIAH AKTIF — STAI AL-ITTIHAD CIANJUR'],
    [],
    ['No', 'Kode MK', 'Nama Mata Kuliah', 'Program Studi', 'SKS'],
    [1, 'PAI-301', 'Ushul Fiqih & Qawaid Fiqhiyyah', 'Pendidikan Agama Islam (PAI)', 3],
    [2, 'TBI-201', "Bahasa Arab Komunikatif & Qira'ah", 'Tadris Bahasa Inggris / PAI', 2],
    [3, 'MPI-101', 'Manajemen Pendidikan Islam', 'Manajemen Pendidikan Islam (MPI)', 3],
    [4, 'PAI-402', 'Metodologi Penelitian PAI', 'Pendidikan Agama Islam (PAI)', 3],
    [5, 'EKS-201', 'Fiqih Muamalah & Ekonomi Syariah', 'Hukum Ekonomi Syariah (HES)', 3]
  ];

  const wsCourses = XLSX.utils.aoa_to_sheet(courseRows);
  wsCourses['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 38 },
    { wch: 35 },
    { wch: 8 }
  ];

  XLSX.utils.book_append_sheet(wb, wsCourses, 'Referensi_Kode_MK');

  // Download template
  const filename = sanitizeFilename('Template_Impor_Bank_Soal_SALAM_LMS_STAI_Al-Ittihad', 'xlsx');

  try {
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadFile(blob, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  } catch {
    XLSX.writeFile(wb, filename);
  }
}
