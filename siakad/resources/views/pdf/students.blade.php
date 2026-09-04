<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Daftar Rekapitulasi Data Induk Mahasiswa — STAI Al-Ittihad Cianjur</title>
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
            page-break-inside: avoid;
        }
        .sign-table td {
            vertical-align: top;
            width: 50%;
            font-size: 11px;
        }
        .action-bar {
            position: fixed;
            top: 15px;
            right: 20px;
            background: #1e293b;
            color: #fff;
            padding: 8px 14px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            gap: 10px;
            align-items: center;
            font-family: sans-serif;
            font-size: 12px;
            z-index: 9999;
        }
        .action-btn {
            background: #059669;
            color: #fff;
            border: none;
            padding: 5px 12px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            text-decoration: none;
        }
        .action-btn:hover { background: #10b981; }
        .close-btn {
            background: #64748b;
            color: #fff;
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
        }
        .close-btn:hover { background: #475569; }

        @media print {
            .action-bar { display: none !important; }
            body { margin: 15mm 15mm; }
            @page {
                size: A4 portrait;
                margin: 10mm 15mm;
            }
        }
    </style>
</head>
<body>

    <!-- Floating Action Toolbar (Hidden during Print) -->
    <div class="action-bar">
        <span>Pratinjau Dokumen Resmi</span>
        <button class="action-btn" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
        <button class="close-btn" onclick="window.close()">Tutup</button>
    </div>

    <!-- Kop Surat Resmi Kampus -->
    <div class="header">
        <table style="width: 100%; border: none;">
            <tr>
                <td style="width: 80px; text-align: center; vertical-align: middle;">
                    <img src="{{ asset('logostai.png') }}" alt="Logo STAI Al-Ittihad" style="width: 68px; height: auto;" onerror="this.style.display='none'">
                </td>
                <td style="text-align: center; vertical-align: middle;">
                    <h2>SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD</h2>
                    <h3>BIRO ADMINISTRASI AKADEMIK & KEMAHASISWAAN (BAAK)</h3>
                    <p>Jl. Raya Bandung No. 01 Bojongpicung, Cianjur, Jawa Barat 43283</p>
                    <p>Website: www.stai-alittihad.ac.id | Email: baak@stai-alittihad.ac.id | Telp: (0263) 2321456</p>
                </td>
                <td style="width: 80px;"></td>
            </tr>
        </table>
    </div>

    <!-- Judul Dokumen -->
    <div class="doc-title">
        <h4>BUKU INDUK & REKAPITULASI DATA MAHASISWA</h4>
        <p>Nomor Dokumen: STAI-AIT/BAAK-MHS/{{ date('Y') }}/{{ str_pad(rand(10, 99), 3, '0', STR_PAD_LEFT) }}</p>
    </div>

    <!-- Meta Informasi -->
    <table class="meta-table">
        <tr>
            <td style="width: 18%;"><strong>Program Studi</strong></td>
            <td style="width: 2%;">:</td>
            <td style="width: 45%;">{{ $studyProgram ?: 'Seluruh Program Studi' }}</td>
            <td style="width: 15%;"><strong>Tahun Angkatan</strong></td>
            <td style="width: 2%;">:</td>
            <td style="width: 18%;">{{ $academicYear ?: 'Semua Angkatan' }}</td>
        </tr>
        <tr>
            <td><strong>Tahun Akademik</strong></td>
            <td>:</td>
            <td>{{ $activePeriod ? $activePeriod->name : date('Y') . '/' . (date('Y') + 1) . ' Ganjil' }}</td>
            <td><strong>Tanggal Cetak</strong></td>
            <td>:</td>
            <td>{{ date('d F Y') }}</td>
        </tr>
        <tr>
            <td><strong>Total Mahasiswa</strong></td>
            <td>:</td>
            <td colspan="4"><strong>{{ $students->count() }} Mahasiswa Terdaftar</strong></td>
        </tr>
    </table>

    <!-- Tabel Data Mahasiswa -->
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 25px;">No</th>
                <th style="width: 85px;">NIM</th>
                <th style="width: 105px;">NIK / No. KTP</th>
                <th>Nama Lengkap Mahasiswa</th>
                <th style="width: 30px;">L/P</th>
                <th style="width: 130px;">Program Studi</th>
                <th style="width: 85px;">No. Telepon / WA</th>
                <th style="width: 60px;">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($students as $index => $stu)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="font-mono text-center font-bold">{{ $stu->identity_number ?: $stu->username }}</td>
                    <td class="font-mono text-center">{{ $stu->nik ?: '-' }}</td>
                    <td><strong>{{ $stu->name }}</strong></td>
                    <td class="text-center">{{ $stu->gender ?: 'L' }}</td>
                    <td>{{ $stu->study_program ?: '-' }}</td>
                    <td class="font-mono text-center">{{ $stu->phone_number ?: '-' }}</td>
                    <td class="text-center">
                        @if($stu->is_active)
                            <span class="badge badge-active">AKTIF</span>
                        @else
                            <span class="badge badge-inactive">NONAKTIF</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" class="text-center" style="padding: 20px; color: #666;">
                        <em>Tidak ada data mahasiswa yang sesuai dengan kriteria filter.</em>
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Kolom Tanda Tangan Resmi -->
    <table class="sign-table">
        <tr>
            <td style="text-align: left; padding-left: 20px;">
                <p>Mengetahui,</p>
                <p><strong>Kepala Bagian Administrasi Akademik (BAAK)</strong></p>
                <br><br><br><br>
                <p><strong><u>Budi Santoso, S.Kom., M.Kom.</u></strong></p>
                <p>NIP. 19850412 201001 1 002</p>
            </td>
            <td style="text-align: right; padding-right: 20px;">
                <p>Cianjur, {{ date('d F Y') }}</p>
                <p><strong>Petugas Pengolah Data Akademik,</strong></p>
                <br><br><br><br>
                <p><strong><u>{{ auth()->user()->name ?? 'Administrator SIAKAD' }}</u></strong></p>
                <p>NIP/NIDN. {{ auth()->user()->identity_number ?? '213042.ADMIN' }}</p>
            </td>
        </tr>
    </table>

    <script>
        // Auto trigger print dialog when opened in print preview tab
        window.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                window.print();
            }, 600);
        });
    </script>
</body>
</html>
