<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Daftar Mata Kuliah Struktur Kurikulum — STAI Al-Ittihad Cianjur</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11px;
            color: #111;
            margin: 25px 30px;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 8px;
            margin-bottom: 15px;
            position: relative;
        }
        .header h2 {
            margin: 0;
            font-size: 15px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .header h3 {
            margin: 3px 0;
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .header p {
            margin: 2px 0;
            font-size: 10px;
            font-style: italic;
            color: #333;
        }
        .doc-title {
            text-align: center;
            margin: 15px 0;
        }
        .doc-title h4 {
            margin: 0;
            font-size: 13px;
            font-weight: bold;
            text-decoration: underline;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .doc-title p {
            margin: 3px 0 0 0;
            font-size: 10.5px;
            color: #333;
            font-weight: bold;
        }
        .meta-table {
            width: 100%;
            margin-bottom: 12px;
            font-size: 11px;
        }
        .meta-table td {
            padding: 2.5px 0;
            vertical-align: top;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 10px;
        }
        .data-table th, .data-table td {
            border: 1px solid #333;
            padding: 5px 6px;
            vertical-align: middle;
        }
        .data-table th {
            background-color: #f1f5f9;
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 9px;
            letter-spacing: 0.3px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-mono { font-family: 'Courier New', Courier, monospace; }
        .badge {
            display: inline-block;
            padding: 1px 4px;
            font-size: 8.5px;
            font-weight: bold;
            border-radius: 3px;
            text-transform: uppercase;
        }
        .badge-active { background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .badge-inactive { background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
        .sign-table {
            width: 100%;
            margin-top: 30px;
            font-size: 11px;
            page-break-inside: avoid;
        }
        .sign-table td {
            width: 50%;
            text-align: center;
            vertical-align: top;
        }
        .sign-space {
            height: 65px;
        }
        .no-print-bar {
            background: #047857;
            color: #fff;
            padding: 8px 16px;
            border-radius: 6px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-family: Arial, sans-serif;
            font-size: 12px;
        }
        .btn-print {
            background: #fff;
            color: #047857;
            font-weight: bold;
            padding: 5px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        @media print {
            .no-print-bar { display: none; }
            body { margin: 10mm 15mm; }
            @page {
                size: A4 landscape;
                margin: 10mm;
            }
        }
    </style>
</head>
<body onload="window.print()">
    <!-- No print toolbar helper -->
    <div class="no-print-bar">
        <span>📄 <strong>Pratinjau Cetak / Ekspor PDF Resmi Mata Kuliah</strong> — Silakan pilih "Save as PDF" pada dialog cetak peramban.</span>
        <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
    </div>

    <!-- Kop Surat Resmi Kampus -->
    <div class="header">
        <table style="width: 100%; border: none; margin-bottom: 0;">
            <tr>
                <td style="width: 85px; text-align: center; vertical-align: middle; border: none; padding: 0;">
                    <img src="{{ asset('logostai.png') }}" alt="Logo STAI Al-Ittihad" style="width: 75px; height: auto; max-height: 80px;">
                </td>
                <td style="text-align: center; vertical-align: middle; border: none; padding: 0 10px;">
                    <h2 style="margin: 0; font-size: 15px; font-weight: bold; text-transform: uppercase;">SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR</h2>
                    <h3 style="margin: 2px 0; font-size: 13px; font-weight: bold; text-transform: uppercase;">BIRO ADMINISTRASI AKADEMIK & PENGEMBANGAN KURIKULUM</h3>
                    <p style="margin: 2px 0; font-size: 10.5px; font-style: italic;">Kampus Terpadu: Jl. Raya Bandung Km. 03, Rawabango, Bojong, Kec. Karangtengah, Kabupaten Cianjur, Jawa Barat 43281</p>
                    <p style="margin: 1px 0; font-size: 9.5px;">Laman: https://staialittihad.ac.id • Email: akademik@staialittihad.ac.id • Telepon: (0263) 261123</p>
                </td>
                <td style="width: 85px; border: none; padding: 0;"></td>
            </tr>
        </table>
    </div>

    <!-- Judul Dokumen -->
    <div class="doc-title">
        <h4>DAFTAR MATA KULIAH STRUKTUR KURIKULUM AKADEMIK</h4>
        <p>Tahun Akademik: <strong>{{ $activePeriod?->name ?? 'Tahun Akademik 2026/2027 Ganjil' }}</strong></p>
    </div>

    <!-- Meta Information -->
    <table class="meta-table">
        <tr>
            <td style="width: 18%;"><strong>Program Studi</strong></td>
            <td style="width: 42%;">: {{ $studyProgram ? $studyProgram->name . ' (' . ($studyProgram->degree ?? 'S1') . ')' : 'Seluruh Program Studi (Institut)' }}</td>
            <td style="width: 18%;"><strong>Tanggal Dokumen</strong></td>
            <td style="width: 22%;">: {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</td>
        </tr>
        <tr>
            <td><strong>Kode Program Studi</strong></td>
            <td>: {{ $studyProgram ? ($studyProgram->code . ' / Kode Nasional: ' . ($studyProgram->national_code ?? '-')) : 'Semua Program Studi' }}</td>
            <td><strong>Total Mata Kuliah</strong></td>
            <td>: <strong>{{ $courses->count() }} Mata Kuliah</strong></td>
        </tr>
        <tr>
            <td><strong>Status Kurikulum</strong></td>
            <td>: Kurikulum OBE & Merdeka Belajar (Terakreditasi)</td>
            <td><strong>Total Beban SKS</strong></td>
            <td>: <strong>{{ $totalCredits }} SKS</strong> (Teori: {{ $totalTheory }} | Praktik: {{ $totalPractice }} | Lapangan: {{ $totalField }})</td>
        </tr>
    </table>

    <!-- Tabel Data Mata Kuliah -->
    <table class="data-table">
        <thead>
            <tr>
                <th rowspan="2" style="width: 4%;">No.</th>
                <th rowspan="2" style="width: 11%;">Kode MK</th>
                <th rowspan="2" style="width: 25%;">Nama Mata Kuliah</th>
                <th colspan="4" style="width: 20%;">Bobot SKS</th>
                <th rowspan="2" style="width: 6%;">Smt</th>
                <th rowspan="2" style="width: 10%;">Jenis MK</th>
                <th rowspan="2" style="width: 16%;">Kelompok Mata Kuliah</th>
                <th rowspan="2" style="width: 8%;">Status</th>
            </tr>
            <tr>
                <th style="width: 5%;">Total</th>
                <th style="width: 5%;">Tatap Muka</th>
                <th style="width: 5%;">Praktik</th>
                <th style="width: 5%;">Lapangan</th>
            </tr>
        </thead>
        <tbody>
            @php 
                $no = 1;
                $sumTotal = 0;
                $sumTheory = 0;
                $sumPractice = 0;
                $sumField = 0;
            @endphp
            @forelse($courses as $c)
                @php
                    $cCredits = (float)($c->credits ?? 0);
                    $cTheory = (float)($c->theory_credits ?? $cCredits);
                    $cPractice = (float)($c->practice_credits ?? 0);
                    $cField = (float)($c->field_credits ?? 0);

                    $sumTotal += $cCredits;
                    $sumTheory += $cTheory;
                    $sumPractice += $cPractice;
                    $sumField += $cField;
                @endphp
                <tr>
                    <td class="text-center font-bold">{{ $no++ }}</td>
                    <td class="text-center font-mono font-bold">{{ $c->code }}</td>
                    <td>
                        <strong>{{ $c->name }}</strong>
                        @if(!empty($c->name_en))
                            <div style="font-size: 8.5px; color: #555; font-style: italic;">{{ $c->name_en }}</div>
                        @endif
                    </td>
                    <td class="text-center font-mono font-bold">{{ number_format($cCredits, 0) }}</td>
                    <td class="text-center font-mono">{{ number_format($cTheory, 0) }}</td>
                    <td class="text-center font-mono">{{ number_format($cPractice, 0) }}</td>
                    <td class="text-center font-mono">{{ number_format($cField, 0) }}</td>
                    <td class="text-center font-bold">{{ $c->semester_level ?? 1 }}</td>
                    <td class="text-center">{{ $c->course_type ?? 'Wajib' }}</td>
                    <td><small>{{ $c->course_group ?? 'MKU/MKDU' }}</small></td>
                    <td class="text-center">
                        <span class="badge {{ ($c->is_active ?? true) ? 'badge-active' : 'badge-inactive' }}">
                            {{ ($c->is_active ?? true) ? 'Aktif' : 'Nonaktif' }}
                        </span>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="11" class="text-center" style="padding: 20px;">
                        Tidak ada data mata kuliah yang terdaftar untuk kriteria ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
        @if($courses->count() > 0)
            <tfoot>
                <tr style="background-color: #f8fafc; font-weight: bold;">
                    <td colspan="3" class="text-right" style="padding-right: 12px; font-size: 10px; text-transform: uppercase;">
                        TOTAL KESELURUHAN BOBOT SKS:
                    </td>
                    <td class="text-center font-mono font-bold">{{ number_format($sumTotal, 0) }}</td>
                    <td class="text-center font-mono font-bold">{{ number_format($sumTheory, 0) }}</td>
                    <td class="text-center font-mono font-bold">{{ number_format($sumPractice, 0) }}</td>
                    <td class="text-center font-mono font-bold">{{ number_format($sumField, 0) }}</td>
                    <td colspan="4" class="text-center" style="font-size: 9px; color: #555;">
                        {{ $courses->count() }} Mata Kuliah Terakreditasi
                    </td>
                </tr>
            </tfoot>
        @endif
    </table>

    <!-- Tanda Tangan Pengesahan -->
    <table class="sign-table">
        <tr>
            <td>
                Mengetahui,<br>
                <strong>Ketua Program Studi {{ $studyProgram->name ?? 'Terkait' }}</strong>
                <div class="sign-space"></div>
                <strong><u>{{ $kaprodi->name ?? "Dr. Ahmad Syafi'i, M.Ag." }}</u></strong><br>
                <span>NIDN. {{ $kaprodi->identity_number ?? '2118097201' }}</span>
            </td>
            <td>
                Cianjur, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}<br>
                <strong>Kepala Biro Administrasi Akademik & Kemahasiswaan (BAAK)</strong>
                <div class="sign-space"></div>
                <strong><u>Budi Santoso, S.Kom.</u></strong><br>
                <span>NIP. 198504122010011002</span>
            </td>
        </tr>
    </table>
</body>
</html>
