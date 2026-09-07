<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DPNA — {{ $class->course_code }} - {{ $class->course_name }} ({{ $class->name }})</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11px;
            color: #111;
            margin: 15px;
            line-height: 1.35;
        }
        .header {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .header h2 {
            margin: 0;
            font-size: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .header h3 {
            margin: 2px 0;
            font-size: 13px;
            text-transform: uppercase;
        }
        .header p {
            margin: 1px 0;
            font-size: 10px;
            font-style: italic;
        }
        .doc-title {
            text-align: center;
            margin: 12px 0;
        }
        .doc-title h4 {
            margin: 0;
            font-size: 13px;
            text-decoration: underline;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .doc-title p {
            margin: 2px 0 0 0;
            font-size: 11px;
            font-weight: bold;
        }
        .info-box {
            width: 100%;
            margin-bottom: 12px;
            font-size: 11px;
            border-collapse: collapse;
        }
        .info-box td {
            padding: 2px 4px;
            vertical-align: top;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 10.5px;
        }
        .data-table th, .data-table td {
            border: 1px solid #333;
            padding: 4px 6px;
            text-align: left;
        }
        .data-table th {
            background-color: #f2f2f2;
            text-align: center;
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-mono { font-family: 'Consolas', 'Courier New', monospace; }
        .stats-container {
            width: 100%;
            margin-top: 10px;
            margin-bottom: 15px;
            border-collapse: collapse;
        }
        .stats-table {
            width: 60%;
            border-collapse: collapse;
            font-size: 10px;
        }
        .stats-table th, .stats-table td {
            border: 1px solid #666;
            padding: 3px 5px;
            text-align: center;
        }
        .stats-table th {
            background-color: #f7f7f7;
        }
        .sign-table {
            width: 100%;
            margin-top: 20px;
            font-size: 11px;
            page-break-inside: avoid;
        }
        .sign-table td {
            width: 50%;
            text-align: center;
            vertical-align: top;
        }
        .sign-space {
            height: 55px;
        }
        .qr-box {
            display: inline-block;
            border: 1px solid #999;
            padding: 4px 8px;
            font-size: 9px;
            text-align: center;
            border-radius: 4px;
            background: #fafafa;
        }
        @media print {
            body { margin: 0; }
            @page {
                size: A4 portrait;
                margin: 12mm 15mm;
            }
        }
    </style>
</head>
<body onload="window.print()">

    <!-- 1. KOP SURAT RESMI INSTITUSI -->
    <div class="header">
        <table style="width: 100%; border: none; margin-bottom: 0;">
            <tr>
                <td style="width: 75px; text-align: center; vertical-align: middle; border: none; padding: 0;">
                    <img src="{{ asset('logostai.png') }}" alt="Logo STAI Al-Ittihad" style="width: 65px; height: auto; max-height: 70px;">
                </td>
                <td style="text-align: center; vertical-align: middle; border: none; padding: 0 10px;">
                    <h2 style="margin: 0; font-size: 14.5px; text-transform: uppercase;">SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR</h2>
                    <h3 style="margin: 2px 0; font-size: 12.5px; text-transform: uppercase;">LEMBAGA PENJAMINAN MUTU & PUSAT ADMINISTRASI AKADEMIK</h3>
                    <p style="margin: 2px 0; font-size: 10px; font-style: italic;">Kampus Terpadu: Jl. Raya Bandung Km. 03, Rawabango, Bojong, Karangtengah, Cianjur, Jawa Barat 43281</p>
                    <p style="margin: 1px 0; font-size: 9px;">Laman: https://staialittihad.ac.id • Pos-el: akademik@staialittihad.ac.id • Telp: (0263) 228192</p>
                </td>
                <td style="width: 75px; border: none; padding: 0;"></td>
            </tr>
        </table>
    </div>

    <!-- 2. JUDUL DOKUMEN -->
    <div class="doc-title">
        <h4>DAFTAR PESERTA DAN NILAI AKHIR (DPNA)</h4>
        <p>Periode Akademik: {{ $class->period_name ?? 'Semester Ganjil 2026/2027' }}</p>
    </div>

    <!-- 3. IDENTITAS KELAS & MATA KULIAH -->
    <table class="info-box">
        <tr>
            <td style="width: 16%;"><strong>Mata Kuliah</strong></td>
            <td style="width: 44%;">: <strong>{{ $class->course_name }}</strong> ({{ $class->course_code }})</td>
            <td style="width: 16%;"><strong>Program Studi</strong></td>
            <td style="width: 24%;">: {{ $class->study_program ?? 'Semua Prodi' }}</td>
        </tr>
        <tr>
            <td><strong>Bobot SKS</strong></td>
            <td>: {{ (float)$class->credits }} SKS &bull; Kelas: <strong>{{ $class->name }}</strong></td>
            <td><strong>Dosen Pengampu</strong></td>
            <td>: <strong>{{ $class->lecturer_name ?? '-' }}</strong></td>
        </tr>
        <tr>
            <td><strong>Semester</strong></td>
            <td>: Semester {{ $class->semester_level ?? 1 }}</td>
            <td><strong>NIDN / NIP</strong></td>
            <td>: {{ $class->lecturer_nidn ?? '-' }}</td>
        </tr>
        <tr>
            <td><strong>Status Lembar</strong></td>
            <td>: <span style="font-weight: bold; color: {{ $isLocked ? '#047857' : '#b45309' }};">{{ $isLocked ? 'FINAL & TERKUNCI (GRADE LOCK RESMI)' : 'DRAFT PENILAIAN' }}</span></td>
            <td><strong>Tanggal Cetak</strong></td>
            <td>: {{ $printDate }}</td>
        </tr>
    </table>

    <!-- 4. TABEL NILAI MAHASISWA -->
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 4%;">No</th>
                <th style="width: 14%;">NIM</th>
                <th style="width: 28%;">Nama Mahasiswa</th>
                <th style="width: 7%;">Presensi<br><span style="font-size: 8px; font-weight: normal;">(10%)</span></th>
                <th style="width: 7%;">Tugas<br><span style="font-size: 8px; font-weight: normal;">(20%)</span></th>
                <th style="width: 7%;">Kuis<br><span style="font-size: 8px; font-weight: normal;">(15%)</span></th>
                <th style="width: 7%;">UTS<br><span style="font-size: 8px; font-weight: normal;">(25%)</span></th>
                <th style="width: 7%;">UAS<br><span style="font-size: 8px; font-weight: normal;">(30%)</span></th>
                <th style="width: 7%;">Nilai<br>Akhir</th>
                <th style="width: 6%;">Huruf<br>Mutu</th>
                <th style="width: 6%;">Angka<br>Mutu</th>
            </tr>
        </thead>
        <tbody>
            @forelse($students as $idx => $s)
                <tr>
                    <td class="text-center">{{ $idx + 1 }}</td>
                    <td class="text-center font-mono font-bold">{{ $s->student_nim }}</td>
                    <td><strong>{{ $s->student_name }}</strong></td>
                    <td class="text-center font-mono">{{ number_format((float)$s->attendance_score, 0) }}</td>
                    <td class="text-center font-mono">{{ number_format((float)$s->assignment_score, 0) }}</td>
                    <td class="text-center font-mono">{{ number_format((float)$s->quiz_score, 0) }}</td>
                    <td class="text-center font-mono">{{ number_format((float)$s->mid_exam_score, 0) }}</td>
                    <td class="text-center font-mono">{{ number_format((float)$s->final_exam_score, 0) }}</td>
                    <td class="text-center font-mono font-bold" style="background-color: #fbfbfb;">
                        {{ number_format((float)$s->final_score, 1) }}
                    </td>
                    <td class="text-center font-bold" style="background-color: #fbfbfb; color: {{ in_array($s->grade_letter, ['A', 'A-', 'B+']) ? '#047857' : (in_array($s->grade_letter, ['B', 'B-', 'C+', 'C']) ? '#1d4ed8' : '#b91c1c') }};">
                        {{ $s->grade_letter ?? '-' }}
                    </td>
                    <td class="text-center font-mono" style="background-color: #fbfbfb;">
                        {{ number_format((float)$s->grade_point, 2) }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="11" class="text-center" style="padding: 20px;">Belum ada data mahasiswa terdaftar pada kelas perkuliahan ini.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- 5. STATISTIK SEBARAN NILAI KELAS -->
    <table class="stats-container">
        <tr>
            <td style="width: 62%; vertical-align: top; border: none; padding: 0;">
                <p style="margin: 0 0 4px 0; font-weight: bold; font-size: 10.5px;">Statistik & Distribusi Mutu Nilai Kelas:</p>
                <table class="stats-table">
                    <thead>
                        <tr>
                            <th>Grade</th>
                            <th>A</th>
                            <th>A-</th>
                            <th>B+</th>
                            <th>B</th>
                            <th>B-</th>
                            <th>C+</th>
                            <th>C</th>
                            <th>D</th>
                            <th>E</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Jumlah</strong></td>
                            <td>{{ $distribution['A'] ?? 0 }}</td>
                            <td>{{ $distribution['A-'] ?? 0 }}</td>
                            <td>{{ $distribution['B+'] ?? 0 }}</td>
                            <td>{{ $distribution['B'] ?? 0 }}</td>
                            <td>{{ $distribution['B-'] ?? 0 }}</td>
                            <td>{{ $distribution['C+'] ?? 0 }}</td>
                            <td>{{ $distribution['C'] ?? 0 }}</td>
                            <td>{{ $distribution['D'] ?? 0 }}</td>
                            <td>{{ $distribution['E'] ?? 0 }}</td>
                            <td><strong>{{ count($students) }}</strong></td>
                        </tr>
                        <tr>
                            <td><strong>%</strong></td>
                            @php
                                $totalStu = max(1, count($students));
                            @endphp
                            <td>{{ round((($distribution['A'] ?? 0) / $totalStu) * 100) }}%</td>
                            <td>{{ round((($distribution['A-'] ?? 0) / $totalStu) * 100) }}%</td>
                            <td>{{ round((($distribution['B+'] ?? 0) / $totalStu) * 100) }}%</td>
                            <td>{{ round((($distribution['B'] ?? 0) / $totalStu) * 100) }}%</td>
                            <td>{{ round((($distribution['B-'] ?? 0) / $totalStu) * 100) }}%</td>
                            <td>{{ round((($distribution['C+'] ?? 0) / $totalStu) * 100) }}%</td>
                            <td>{{ round((($distribution['C'] ?? 0) / $totalStu) * 100) }}%</td>
                            <td>{{ round((($distribution['D'] ?? 0) / $totalStu) * 100) }}%</td>
                            <td>{{ round((($distribution['E'] ?? 0) / $totalStu) * 100) }}%</td>
                            <td>100%</td>
                        </tr>
                    </tbody>
                </table>
                <p style="margin: 4px 0 0 0; font-size: 10px; color: #444;">
                    Rata-rata Nilai Kelas: <strong>{{ number_format($avgScore, 2) }}</strong> &bull; 
                    Tingkat Kelulusan: <strong>{{ $passPercentage }}%</strong>
                </p>
            </td>
            <td style="width: 38%; vertical-align: middle; text-align: right; border: none; padding: 0;">
                <div class="qr-box">
                    <div style="font-weight: bold; font-size: 8.5px; color: #047857; margin-bottom: 2px;">VERIFIKASI DOKUMEN DIGITAL</div>
                    <div style="font-family: monospace; font-size: 8px; color: #555;">ID: {{ strtoupper(substr(md5('DPNA-' . $class->id . '-' . $class->course_code), 0, 16)) }}</div>
                    <div style="font-size: 8px; color: #777; margin-top: 2px;">Sah terverifikasi melalui Sistem SALAM SIAKAD</div>
                </div>
            </td>
        </tr>
    </table>

    <!-- 6. LEMBAR PENGESAHAN / TANDA TANGAN -->
    <table class="sign-table">
        <tr>
            <td>
                Mengetahui,<br>
                <strong>Ketua Program Studi {{ $class->study_program ?? 'PAI' }}</strong>
                <div class="sign-space"></div>
                <strong><u>{{ $signatory->name ?? "Dr. Ahmad Syafi'i, M.Ag" }}</u></strong><br>
                NIDN / NIP. {{ $signatory->identity_number ?? '2118097201' }}
            </td>
            <td>
                Cianjur, {{ $printDate }}<br>
                <strong>Dosen Pengampu Mata Kuliah</strong>
                <div class="sign-space"></div>
                <strong><u>{{ $class->lecturer_name ?? 'Dr. H. M. Ridwan, M.Ag' }}</u></strong><br>
                NIDN / NIP. {{ $class->lecturer_nidn ?? '2112087501' }}
            </td>
        </tr>
    </table>

</body>
</html>
