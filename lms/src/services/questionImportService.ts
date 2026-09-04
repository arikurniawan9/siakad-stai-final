/**
 * Layanan Parser & Impor Bank Soal Kurikulum
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

import { BankQuestion, QuestionType, QuestionDifficulty, QuizOption } from '../types/quiz';
import { quizService } from './quizService';

export interface ParseResult {
  questions: Omit<BankQuestion, 'id' | 'createdAt'>[];
  errors: string[];
  totalParsed: number;
  totalValid: number;
}

export const SAMPLE_AIKEN_TEMPLATE = `Lafadz yang mencakup seluruh satuan yang tidak terbatas dalam satu ketetapan hukum tanpa batasan bilangan tertentu disebut:
A. Lafadz 'Am (Umum)
B. Lafadz Khas (Khusus)
C. Lafadz Mujmal
D. Lafadz Mutlaq
E. Lafadz Muqayyad
ANSWER: A

Perhatikan kaidah fiqhiyyah berikut:
[ARABIC] الأَصْلُ فِي الأَشْيَاءِ الإِبَاحَةُ حَتَّى يَدُلَّ الدَّلِيلُ عَلَى التَّحْرِيمِ
Makna dari kaidah ushuliyah di atas adalah:
A. Segala sesuatu pada dasarnya haram sampai ada dalil yang membolehkan
B. Hukum asal segala sesuatu adalah boleh hingga ada dalil yang mengharamkannya
C. Keyakinan tidak dapat dihilangkan dengan keraguan
D. Kemudharatan harus dihilangkan
E. Adat kebiasaan dapat dijadikan sebagai rujukan hukum
ANSWER: B

Kaidah ushuliyah menetapkan bahwa Al-Ashlu fin-Nahyi lid-Dalalati 'alat-Tahrim bermakna asal larangan menunjukkan hukum makruh.
A. Benar
B. Salah
ANSWER: B

Kesepakatan seluruh mujtahid dari umat Nabi Muhammad SAW pada suatu masa setelah wafatnya beliau atas suatu hukum syar'i disebut:
A. Qiyas
B. Istihsan
C. Maslahah Mursalah
D. 'Urf
E. Ijma'
ANSWER: E`;

export const SAMPLE_CSV_TEMPLATE = `tipe,topik,soal,teks_arab,gambar_url,opsi_a,opsi_b,opsi_c,opsi_d,opsi_e,kunci,poin,kesulitan,penjelasan
PILIHAN_GANDA,Kaidah Lughawiyah,Apa definisi lafadz 'Am dalam ushul fiqih?,,,Lafadz bermakna tunggal,Lafadz mencakup seluruh satuan,Lafadz yang belum jelas,Lafadz yang dibatasi sifat,Lafadz mutasyabihat,B,20,SEDANG,Lafadz 'Am menghabiskan seluruh satuan yang sesuai.
PILIHAN_GANDA,Kaidah Fiqhiyyah,Terjemahkan dan tentukan makna kaidah berikut:,الضَّرَرُ يُزَالُ,,Kemudharatan harus dihilangkan,Adat menjadi hukum,Keyakinan mengalahkan ragu,Kesulitan mendatangkan kemudahan,Niat menentukan amal,A,20,MUDAH,Kaidah Ad-Dhararu Yuzal merupakan salah satu dari 5 kaidah asasiyah.
BENAR_SALAH,Kaidah Amar,Kaidah Al-Amru bil-Amri Syai'un bermakna perintah melahirkan kewajiban mutlak.,,,,Benar,Salah,,,,A,20,MUDAH,Kaidah dasar amar menunjukkan wujub.
JAWABAN_SINGKAT,Sumber Hukum,Sumber hukum Islam primer ketiga setelah Al-Quran dan Sunnah adalah:,,,,,,,ijma,20,SEDANG,Ijma adalah kesepakatan mujtahidin.
ESAI,Metode Ijtihad,Jelaskan perbedaan mendasar antara Qiyas dan Istihsan!,,,,,,,Rubrik: Definisi Qiyas (40%) & Istihsan (60%),40,SULIT,Qiyas mencari kesamaan 'illat sedangkan istihsan mengecualikan demi maslahat.`;

export const SAMPLE_JSON_TEMPLATE = JSON.stringify([
  {
    courseCode: "PAI-301",
    topic: "Kaidah Ushul Fiqih",
    type: "PILIHAN_GANDA",
    difficulty: "SEDANG",
    questionText: "Perhatikan kaidah ushuliyah berikut dan tentukan kedudukan hukumnya:",
    arabicText: "الأَمْرُ بِالشَّيْءِ نَهْيٌ عَنْ ضِدِّهِ",
    imageUrl: "",
    options: [
      { text: "Perintah atas sesuatu berarti larangan atas kebalikannya", isCorrect: true },
      { text: "Larangan atas sesuatu berarti anjuran atas kebalikannya", isCorrect: false },
      { text: "Perintah menghendaki pengulangan secara terus menerus", isCorrect: false },
      { text: "Perintah tidak mengikat kecuali disertai qarinah", isCorrect: false },
      { text: "Perintah hanya berlaku bagi orang yang hadir saat khitab turun", isCorrect: false }
    ],
    defaultPoints: 20,
    explanation: "Kaidah al-amru bisy-syai'i nahyun 'an dhiddihi merupakan kaidah dalalah amr dalam ushul fiqih.",
    tags: ["Kaidah Amar", "Dalalah", "Ushul Fiqih"]
  }
], null, 2);

class QuestionImportService {
  /**
   * Parse Teks Berformat Aiken / Standar Moodle
   */
  public parseAiken(
    text: string, 
    courseCode: string = 'PAI-301', 
    defaultTopic: string = 'Ushul Fiqih'
  ): ParseResult {
    const rawBlocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
    const questions: Omit<BankQuestion, 'id' | 'createdAt'>[] = [];
    const errors: string[] = [];

    rawBlocks.forEach((block, blockIndex) => {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length < 3) {
        errors.push(`Blok #${blockIndex + 1}: Format tidak lengkap (harus memiliki teks soal, minimal 2 opsi, dan baris ANSWER).`);
        return;
      }

      // Baris terakhir biasanya ANSWER: X atau JAWABAN: X
      const lastLine = lines[lines.length - 1];
      const answerMatch = lastLine.match(/^(?:ANSWER|JAWABAN|KUNCI)\s*:\s*([A-Z])/i);

      if (!answerMatch) {
        errors.push(`Blok #${blockIndex + 1}: Tidak ditemukan kunci jawaban berformat "ANSWER: X" di baris akhir.`);
        return;
      }

      const correctLetter = answerMatch[1].toUpperCase();
      
      // Deteksi Teks Arab [ARABIC] atau [IMAGE] pada bagian pertanyaan
      let questionText = '';
      let arabicText: string | undefined;
      let imageUrl: string | undefined;
      const optionLines: string[] = [];

      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i];
        if (line.startsWith('[ARABIC]')) {
          arabicText = line.replace('[ARABIC]', '').trim();
        } else if (line.startsWith('[IMAGE]') || line.startsWith('[GAMBAR]')) {
          imageUrl = line.replace(/\[(?:IMAGE|GAMBAR)\]/, '').trim();
        } else if (/^[A-Z][\.\)]/i.test(line)) {
          optionLines.push(line);
        } else {
          questionText = questionText ? `${questionText} ${line}` : line;
        }
      }

      const options: QuizOption[] = [];
      let foundCorrect = false;

      optionLines.forEach((optLine, optIdx) => {
        const optMatch = optLine.match(/^([A-Z])[\.\)]\s*(.*)$/i);
        if (optMatch) {
          const letter = optMatch[1].toUpperCase();
          const optText = optMatch[2].trim();
          const isCorrect = letter === correctLetter;
          if (isCorrect) foundCorrect = true;
          options.push({
            id: `opt-imp-${blockIndex}-${optIdx}`,
            text: optText,
            isCorrect
          });
        }
      });

      if (options.length < 2) {
        errors.push(`Blok #${blockIndex + 1} ("${questionText.substring(0, 30)}..."): Opsi jawaban terdeteksi kurang dari 2.`);
        return;
      }

      if (!foundCorrect) {
        errors.push(`Blok #${blockIndex + 1}: Kunci jawaban "${correctLetter}" tidak cocok dengan opsi yang tersedia.`);
        return;
      }

      // Deteksi Benar / Salah vs Pilihan Ganda
      const isTrueFalse = options.length === 2 && 
        options.some((o) => o.text.toLowerCase() === 'benar' || o.text.toLowerCase() === 'true') &&
        options.some((o) => o.text.toLowerCase() === 'salah' || o.text.toLowerCase() === 'false');

      questions.push({
        courseCode,
        topic: defaultTopic,
        type: isTrueFalse ? 'BENAR_SALAH' : 'PILIHAN_GANDA',
        difficulty: 'SEDANG',
        questionText: questionText || 'Pertanyaan Pilihan Ganda',
        arabicText,
        imageUrl,
        options,
        defaultPoints: 20,
        tags: ['Impor Aiken', defaultTopic]
      });
    });

    return {
      questions,
      errors,
      totalParsed: rawBlocks.length,
      totalValid: questions.length
    };
  }

  /**
   * Parse CSV / Excel Spreadsheet (Mendukung 5 Opsi A-E, Teks Arab, & Gambar)
   */
  public parseCsv(
    csvText: string,
    courseCode: string = 'PAI-301',
    defaultTopic: string = 'Ushul Fiqih'
  ): ParseResult {
    const lines = csvText.split('\n').map((l) => l.trim()).filter(Boolean);
    const questions: Omit<BankQuestion, 'id' | 'createdAt'>[] = [];
    const errors: string[] = [];

    if (lines.length <= 1) {
      return {
        questions: [],
        errors: ['Berkas CSV kosong atau hanya berisi baris header.'],
        totalParsed: 0,
        totalValid: 0
      };
    }

    // Header line analysis
    const headerCols = lines[0].toLowerCase().split(/[,;]/).map((c) => c.replace(/^"|"$/g, '').trim());
    const hasArabicCol = headerCols.includes('teks_arab') || headerCols.includes('arabic');
    const hasImageCol = headerCols.includes('gambar_url') || headerCols.includes('image_url') || headerCols.includes('image');
    const hasOptE = headerCols.includes('opsi_e') || headerCols.includes('opt_e') || headerCols.includes('option_e');

    const dataLines = lines.slice(1);

    dataLines.forEach((line, idx) => {
      const delimiter = line.includes(';') ? ';' : ',';
      const cols = line.split(delimiter).map((c) => c.replace(/^"|"$/g, '').trim());

      if (cols.length < 3) {
        errors.push(`Baris CSV #${idx + 2}: Kolom tidak mencukupi.`);
        return;
      }

      const rawType = cols[0]?.toUpperCase() || 'PILIHAN_GANDA';
      const topic = cols[1] || defaultTopic;
      const questionText = cols[2];

      if (!questionText) {
        errors.push(`Baris CSV #${idx + 2}: Teks pertanyaan tidak boleh kosong.`);
        return;
      }

      let arabicText: string | undefined;
      let imageUrl: string | undefined;
      let optA = '';
      let optB = '';
      let optC = '';
      let optD = '';
      let optE = '';
      let kunci = '';
      let points = 20;
      let difficulty: QuestionDifficulty = 'SEDANG';
      let explanation = '';

      // Parsing dynamic layout depending on header format
      if (hasArabicCol || hasImageCol || hasOptE) {
        arabicText = cols[3] || undefined;
        imageUrl = cols[4] || undefined;
        optA = cols[5] || '';
        optB = cols[6] || '';
        optC = cols[7] || '';
        optD = cols[8] || '';
        optE = cols[9] || '';
        kunci = (cols[10] || '').toUpperCase();
        points = parseInt(cols[11], 10) || 20;
        difficulty = (cols[12]?.toUpperCase() as QuestionDifficulty) || 'SEDANG';
        explanation = cols[13] || '';
      } else {
        // Fallback 4-option legacy CSV format
        optA = cols[3] || '';
        optB = cols[4] || '';
        optC = cols[5] || '';
        optD = cols[6] || '';
        kunci = (cols[7] || '').toUpperCase();
        points = parseInt(cols[8], 10) || 20;
        difficulty = (cols[9]?.toUpperCase() as QuestionDifficulty) || 'SEDANG';
        explanation = cols[10] || '';
      }

      let finalType: QuestionType = 'PILIHAN_GANDA';
      let options: QuizOption[] | undefined;
      let shortAnswer: string | undefined;
      let essayRubric: string | undefined;

      if (rawType.includes('BENAR') || rawType === 'BENAR_SALAH' || rawType === 'TF') {
        finalType = 'BENAR_SALAH';
        options = [
          { id: `opt-csv-${idx}-1`, text: 'Benar', isCorrect: kunci === 'A' || kunci === 'BENAR' || kunci === 'TRUE' },
          { id: `opt-csv-${idx}-2`, text: 'Salah', isCorrect: kunci === 'B' || kunci === 'SALAH' || kunci === 'FALSE' },
        ];
      } else if (rawType.includes('SINGKAT') || rawType === 'JAWABAN_SINGKAT') {
        finalType = 'JAWABAN_SINGKAT';
        shortAnswer = kunci || optA || '';
      } else if (rawType.includes('ESAI') || rawType === 'ESSAY') {
        finalType = 'ESAI';
        essayRubric = kunci || explanation || 'Rubrik penilaian esai terstandar.';
      } else {
        finalType = 'PILIHAN_GANDA';
        const rawOpts = [optA, optB, optC, optD, optE].filter(Boolean);
        if (rawOpts.length < 2) {
          errors.push(`Baris CSV #${idx + 2}: Soal pilihan ganda butuh minimal 2 opsi.`);
          return;
        }
        options = rawOpts.map((text, oIdx) => ({
          id: `opt-csv-${idx}-${oIdx}`,
          text,
          isCorrect: String.fromCharCode(65 + oIdx) === kunci || kunci === text.toUpperCase()
        }));
      }

      questions.push({
        courseCode,
        topic,
        type: finalType,
        difficulty,
        questionText,
        arabicText,
        imageUrl,
        options,
        correctShortAnswer: shortAnswer,
        essayRubric,
        defaultPoints: points,
        explanation,
        tags: ['Impor CSV', topic]
      });
    });

    return {
      questions,
      errors,
      totalParsed: dataLines.length,
      totalValid: questions.length
    };
  }

  /**
   * Parse JSON Format
   */
  public parseJson(
    jsonText: string,
    courseCode: string = 'PAI-301'
  ): ParseResult {
    const errors: string[] = [];
    try {
      const parsed = JSON.parse(jsonText);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      const validQuestions: Omit<BankQuestion, 'id' | 'createdAt'>[] = [];

      items.forEach((item: any, idx: number) => {
        if (!item.questionText) {
          errors.push(`Item JSON #${idx + 1}: Tidak memiliki field questionText.`);
          return;
        }

        validQuestions.push({
          courseCode: item.courseCode || courseCode,
          topic: item.topic || 'Ushul Fiqih',
          type: item.type || 'PILIHAN_GANDA',
          difficulty: item.difficulty || 'SEDANG',
          questionText: item.questionText,
          arabicText: item.arabicText,
          imageUrl: item.imageUrl,
          options: item.options,
          correctShortAnswer: item.correctShortAnswer,
          essayRubric: item.essayRubric,
          defaultPoints: item.defaultPoints || 20,
          explanation: item.explanation,
          tags: item.tags || ['Impor JSON']
        });
      });

      return {
        questions: validQuestions,
        errors,
        totalParsed: items.length,
        totalValid: validQuestions.length
      };
    } catch (err: any) {
      return {
        questions: [],
        errors: [`Format JSON tidak valid: ${err.message}`],
        totalParsed: 0,
        totalValid: 0
      };
    }
  }

  /**
   * Mengeksekusi penyimpanan massal ke Bank Soal
   */
  public executeBulkImport(questions: Omit<BankQuestion, 'id' | 'createdAt'>[]): { count: number } {
    let count = 0;
    questions.forEach((q) => {
      quizService.addBankQuestion(q);
      count += 1;
    });
    return { count };
  }
}

export const questionImportService = new QuestionImportService();
