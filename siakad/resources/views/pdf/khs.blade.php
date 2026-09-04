<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Kartu Hasil Studi (KHS) — {{ $student->name }}</title>
    <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 12px; color: #111; margin: 20px; line-height: 1.4; }
        .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 15px; }
        .header h2 { margin: 0; font-size: 16px; text-transform: uppercase; }
        .header h3 { margin: 2px 0; font-size: 14px; text-transform: uppercase; }
        .header p { margin: 2px 0; font-size: 11px; font-style: italic; }
        .doc-title { text-align: center; margin: 15px 0; }
        .doc-title h4 { margin: 0; font-size: 14px; text-decoration: underline; text-transform: uppercase; }
        .info-table { width: 100%; margin-bottom: 15px; font-size: 12px; }
        .info-table td { padding: 3px 0; vertical-align: top; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
        .data-table th, .data-table td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
        .data-table th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .sign-table { width: 100%; margin-top: 30px; font-size: 12px; }
        .sign-table td { width: 33.33%; text-align: center; vertical-align: top; }
        .sign-space { height: 60px; }
        @media print {
            body { margin: 0; }
            @page { margin: 15mm; }
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
        <h4>KARTU HASIL STUDI (KHS)</h4>
        <p style="margin: 3px 0 0 0; font-size: 11px;">Periode Akademik: <strong>{{ $period->name }} ({{ $period->year_name }})</strong></p>
    </div>

    <table class="info-table">
        <tr>
            <td style="width: 15%;"><strong>NIM</strong></td>
            <td style="width: 35%;">: {{ $student->identity_number }}</td>
            <td style="width: 20%;"><strong>Program Studi</strong></td>
            <td style="width: 30%;">: {{ $student->study_program }}</td>
        </tr>
        <tr>
            <td><strong>Nama Lengkap</strong></td>
            <td>: {{ $student->name }}</td>
            <td><strong>Dosen Pembimbing</strong></td>
            <td>: {{ $advisor->name ?? '-' }}</td>
        </tr>
        <tr>
            <td><strong>Indeks Prestasi (IPS)</strong></td>
            <td>: <strong style="font-size: 13px; color: #047857;">{{ number_format($ips, 2) }}</strong></td>
            <td><strong>Total SKS Semester</strong></td>
            <td>: <strong>{{ (float)$totalCredits }} SKS</strong></td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%;">No.</th>
                <th style="width: 15%;">Kode MK</th>
                <th style="width: 35%;">Nama Mata Kuliah</th>
                <th style="width: 8%;">SKS (K)</th>
                <th style="width: 8%;">Nilai Huruf</th>
                <th style="width: 8%;">Bobot (N)</th>
                <th style="width: 10%;">Mutu (K x N)</th>
                <th style="width: 11%;">Dosen Pengampu</th>
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
                    <td class="text-center font-bold" style="color: {{ in_array($g->grade_letter, ['A', 'A-', 'B+']) ? 'green' : (in_array($g->grade_letter, ['B', 'B-', 'C']) ? '#2563eb' : 'red') }};">
                        {{ $g->grade_letter ?? '-' }}
                    </td>
                    <td class="text-center font-mono">{{ number_format((float)$g->grade_point, 2) }}</td>
                    <td class="text-center font-mono font-bold">{{ number_format($mutu, 2) }}</td>
                    <td><small>{{ $g->lecturer_name ?? '-' }}</small></td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" class="text-center" style="padding: 20px;">Belum ada data nilai yang diterbitkan pada semester ini.</td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr style="font-weight: bold; background-color: #fafafa;">
                <td colspan="3" class="text-right">TOTAL:</td>
                <td class="text-center">{{ (float)$totalCredits }}</td>
                <td colspan="2" class="text-right">TOTAL MUTU:</td>
                <td class="text-center">{{ number_format($totalPoints, 2) }}</td>
                <td></td>
            </tr>
        </tfoot>
    </table>

    <table class="sign-table">
        <tr>
            <td>
                Mahasiswa,
                <div class="sign-space"></div>
                <strong>{{ $student->name }}</strong><br>
                NIM. {{ $student->identity_number }}
            </td>
            <td>
                Dosen Pembimbing Akademik,
                <div class="sign-space"></div>
                <strong>{{ $advisor->name ?? '( ........................................ )' }}</strong><br>
                NIDN. -
            </td>
            <td>
                Cianjur, {{ $printDate }}<br>
                Ketua Program Studi,
                <div class="sign-space"></div>
                <strong>{{ $signatory->name ?? 'Dr. H. Mulyadi, M.Pd.I.' }}</strong><br>
                NIP. {{ $signatory->nip ?? '197508122003121002' }}
            </td>
        </tr>
    </table>
</body>
</html>
