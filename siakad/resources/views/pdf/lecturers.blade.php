<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Daftar Data Induk Dosen & Tenaga Pendidik — STAI Al-Ittihad Cianjur</title>
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
            font-size: 10px;
            color: #444;
        }
        .meta-table {
            width: 100%;
            margin-bottom: 12px;
            font-size: 11px;
        }
        .meta-table td {
            padding: 2px 0;
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
        <span>📄 <strong>Pratinjau Cetak / Ekspor PDF Resmi Dosen</strong> — Silakan pilih "Save as PDF" pada dialog cetak peramban.</span>
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
                    <h3 style="margin: 2px 0; font-size: 13px; font-weight: bold; text-transform: uppercase;">PUSAT PENJAMINAN MUTU & TATA KELOLA AKADEMIK</h3>
                    <p style="margin: 2px 0; font-size: 10.5px; font-style: italic;">Kampus Terpadu: Jl. Raya Bandung Km. 03, Rawabango, Bojong, Kec. Karangtengah, Kabupaten Cianjur, Jawa Barat 43281</p>
                    <p style="margin: 1px 0; font-size: 9.5px;">Laman: https://staialittihad.ac.id • Email: akademik@staialittihad.ac.id • Telepon: (0263) 261123</p>
                </td>
                <td style="width: 85px; border: none; padding: 0;"></td>
            </tr>
        </table>
    </div>

    <!-- Judul Dokumen -->
    <div class="doc-title">
        <h4>DAFTAR DATA INDUK DOSEN & TENAGA PENDIDIK</h4>
        <p>Tahun Akademik: <strong>{{ $activePeriod?->name ?? '2025/2026 Ganjil' }}</strong></p>
    </div>

    <!-- Meta Information -->
    <table class="meta-table">
        <tr>
            <td style="width: 15%;"><strong>Program Studi</strong></td>
            <td style="width: 45%;">: {{ $studyProgram ? $studyProgram : 'Semua Program Studi (Institut)' }}</td>
            <td style="width: 18%;"><strong>Tanggal Dokumen</strong></td>
            <td style="width: 22%;">: {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</td>
        </tr>
        <tr>
            <td><strong>Filter Jabatan</strong></td>
            <td>: {{ $roleFilter ? ($roleFilter === 'kaprodi' ? 'Ketua Program Studi' : ($roleFilter === 'dosen_pa' ? 'Dosen Pembimbing Akademik (PA)' : 'Dosen Pengampu')) : 'Seluruh Tenaga Pendidik' }}</td>
            <td><strong>Total Tenaga Pendidik</strong></td>
            <td>: <strong>{{ $lecturers->count() }} Orang</strong></td>
        </tr>
    </table>

    <!-- Tabel Data Dosen -->
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 4%;">No.</th>
                <th style="width: 20%;">Nama Lengkap & Gelar</th>
                <th style="width: 11%;">NIDN / NIP</th>
                <th style="width: 14%;">No. KTP / NIK</th>
                <th style="width: 18%;">Homebase Program Studi</th>
                <th style="width: 11%;">Jabatan Akademik</th>
                <th style="width: 14%;">Kontak (Email / No. HP)</th>
                <th style="width: 8%;">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($lecturers as $index => $lec)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td><strong>{{ $lec->name }}</strong></td>
                    <td class="text-center font-mono">{{ $lec->identity_number ?? '-' }}</td>
                    <td class="text-center font-mono">{{ $lec->nik ?? '-' }}</td>
                    <td>{{ $lec->study_program ?? '-' }}</td>
                    <td class="text-center">
                        @if($lec->role === 'kaprodi')
                            Ketua Prodi
                        @elseif($lec->role === 'dosen_pa')
                            Dosen PA (Wali)
                        @else
                            Dosen Pengampu
                        @endif
                    </td>
                    <td>
                        <div><small>{{ $lec->email }}</small></div>
                        @if($lec->phone_number)
                            <div class="font-mono"><small>{{ $lec->phone_number }}</small></div>
                        @endif
                    </td>
                    <td class="text-center">
                        <span class="badge {{ $lec->is_active ? 'badge-active' : 'badge-inactive' }}">
                            {{ $lec->is_active ? 'Aktif' : 'Nonaktif' }}
                        </span>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" class="text-center" style="padding: 20px;">Tidak ada data dosen yang sesuai dengan kriteria filter.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Tanda Tangan Pengesahan -->
    <table class="sign-table">
        <tr>
            <td>
                Mengetahui,<br>
                <strong>Ketua STAI Al-Ittihad Cianjur</strong>
                <div class="sign-space"></div>
                <strong><u>Dr. H. Ahmad Syafi'i, M.Ag.</u></strong><br>
                <span>NIDN. 2118097201</span>
            </td>
            <td>
                Cianjur, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}<br>
                <strong>Kepala Tata Kelola & Administrasi Akademik</strong>
                <div class="sign-space"></div>
                <strong><u>Budi Santoso, S.Kom.</u></strong><br>
                <span>NIP. 198504122010011002</span>
            </td>
        </tr>
    </table>
</body>
</html>
