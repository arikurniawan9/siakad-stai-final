<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Transkrip Akademik — {{ $student->name }}</title>
    <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 11px; color: #111; margin: 15px; line-height: 1.3; }
        .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 12px; }
        .header h2 { margin: 0; font-size: 15px; text-transform: uppercase; }
        .header h3 { margin: 2px 0; font-size: 13px; text-transform: uppercase; }
        .header p { margin: 2px 0; font-size: 10px; font-style: italic; }
        .doc-title { text-align: center; margin: 10px 0; }
        .doc-title h4 { margin: 0; font-size: 13px; text-decoration: underline; text-transform: uppercase; }
        .info-table { width: 100%; margin-bottom: 12px; font-size: 11px; }
        .info-table td { padding: 2px 0; vertical-align: top; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10px; }
        .data-table th, .data-table td { border: 1px solid #333; padding: 4px 6px; text-align: left; }
        .data-table th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .summary-box { width: 100%; border: 1px solid #333; padding: 6px 10px; margin-bottom: 15px; font-size: 11px; background-color: #fafafa; }
        .sign-table { width: 100%; margin-top: 20px; font-size: 11px; }
        .sign-table td { width: 50%; text-align: center; vertical-align: top; }
        .sign-space { height: 50px; }
        @media print {
            body { margin: 0; }
            @page { margin: 12mm; }
        }
    </style>
</head>
<body onload="window.print()">
    <div class="header">
        <table style="width: 100%; border: none; margin-bottom: 0;">
            <tr>
                <td style="width: 80px; text-align: center; vertical-align: middle; border: none; padding: 0;">
                    <img src="{{ asset('logostai.png') }}" alt="Logo STAI Al-Ittihad" style="width: 70px; height: auto; max-height: 75px;">
                </td>
                <td style="text-align: center; vertical-align: middle; border: none; padding: 0 10px;">
                    <h2 style="margin: 0; font-size: 15px; text-transform: uppercase;">SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR</h2>
                    <h3 style="margin: 2px 0; font-size: 13px; text-transform: uppercase;">PUSAT TATA KELOLA AKADEMIK & SISTEM INFORMASI</h3>
                    <p style="margin: 2px 0; font-size: 10.5px; font-style: italic;">Kampus Terpadu: Jl. Raya Bandung Km. 03, Rawabango, Bojong, Karangtengah, Cianjur, Jawa Barat 43281</p>
                    <p style="margin: 1px 0; font-size: 9.5px;">Laman: https://staialittihad.ac.id • Email: akademik@staialittihad.ac.id • Telp: (0263) 228192</p>
                </td>
                <td style="width: 80px; border: none; padding: 0;"></td>
            </tr>
        </table>
    </div>

    <div class="doc-title">
        <h4>TRANSKRIP AKADEMIK SEMENTARA / LULUS</h4>
        <p style="margin: 2px 0 0 0; font-size: 10px;">Nomor Dokumen: STAI/AKD/TRA/{{ date('Y') }}/{{ str_pad($student->id, 5, '0', STR_PAD_LEFT) }}</p>
    </div>

    <table class="info-table">
        <tr>
            <td style="width: 15%;"><strong>NIM</strong></td>
            <td style="width: 35%;">: {{ $student->identity_number }}</td>
            <td style="width: 20%;"><strong>Program Studi</strong></td>
            <td style="width: 30%;">: {{ $studyProgram->name ?? $student->study_program }}</td>
        </tr>
        <tr>
            <td><strong>Nama Lengkap</strong></td>
            <td>: {{ $student->name }}</td>
            <td><strong>Jenjang Pendidikan</strong></td>
            <td>: Sarjana (S1)</td>
        </tr>
        <tr>
            <td><strong>Tempat, Tgl Lahir</strong></td>
            <td>: Cianjur, 15 Juli 2002</td>
            <td><strong>Gelar Akademik</strong></td>
            <td>: {{ $degree->degree_title ?? 'Sarjana Pendidikan (S.Pd.)' }}</td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%;">No.</th>
                <th style="width: 15%;">Kode MK</th>
                <th style="width: 45%;">Nama Mata Kuliah</th>
                <th style="width: 8%;">SKS (K)</th>
                <th style="width: 8%;">Nilai Huruf</th>
                <th style="width: 9%;">Bobot (N)</th>
                <th style="width: 10%;">Mutu (K x N)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($grades as $index => $g)
                @php
                    $mutu = (float)$g->credits * (float)$g->grade_point;
                @endphp
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="text-center font-mono"><strong>{{ $g->course_code }}</strong></td>
                    <td>{{ $g->course_name }}</td>
                    <td class="text-center">{{ (float)$g->credits }}</td>
                    <td class="text-center font-bold">{{ $g->grade_letter ?? '-' }}</td>
                    <td class="text-center font-mono">{{ number_format((float)$g->grade_point, 2) }}</td>
                    <td class="text-center font-mono font-bold">{{ number_format($mutu, 2) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="text-center" style="padding: 20px;">Belum ada data matakuliah yang terinput.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="summary-box">
        <table style="width: 100%;">
            <tr>
                <td style="width: 33%;">Total Kredit Kumulatif (SKS): <strong>{{ (float)$totalCredits }} SKS</strong></td>
                <td style="width: 33%;">Indeks Prestasi Kumulatif (IPK): <strong style="font-size: 13px; color: #047857;">{{ number_format($gpa, 2) }}</strong></td>
                <td style="width: 34%;">Predikat Kelulusan: <strong style="text-transform: uppercase;">{{ $predicate }}</strong></td>
            </tr>
        </table>
    </div>

    <table class="sign-table">
        <tr>
            <td>
                Mengetahui,<br>
                Ketua STAI Al-Ittihad Cianjur,
                <div class="sign-space"></div>
                <strong>{{ $signatory->name ?? 'Prof. Dr. KH. Abdul Halim, M.Ag.' }}</strong><br>
                NIP. {{ $signatory->nip ?? '196803151994031003' }}
            </td>
            <td>
                Cianjur, {{ $printDate }}<br>
                Ketua Program Studi,
                <div class="sign-space"></div>
                <strong>Dr. H. Mulyadi, M.Pd.I.</strong><br>
                NIP. 197508122003121002
            </td>
        </tr>
    </table>
</body>
</html>
