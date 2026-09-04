<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Kartu Rencana Studi (KRS) — {{ $submission->student_name }}</title>
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
        <h4>KARTU RENCANA STUDI (KRS)</h4>
        <p style="margin: 3px 0 0 0; font-size: 11px;">Periode Akademik: <strong>{{ $submission->period_name }} ({{ $submission->year_name }})</strong></p>
    </div>

    <table class="info-table">
        <tr>
            <td style="width: 15%;"><strong>NIM</strong></td>
            <td style="width: 35%;">: {{ $submission->student_nim }}</td>
            <td style="width: 20%;"><strong>Program Studi</strong></td>
            <td style="width: 30%;">: {{ $submission->study_program }}</td>
        </tr>
        <tr>
            <td><strong>Nama Lengkap</strong></td>
            <td>: {{ $submission->student_name }}</td>
            <td><strong>Dosen Wali (PA)</strong></td>
            <td>: {{ $submission->advisor_name ?? '-' }}</td>
        </tr>
        <tr>
            <td><strong>Status KRS</strong></td>
            <td>: <span style="font-weight: bold; color: {{ $submission->status === 'DISETUJUI' ? 'green' : 'orange' }};">{{ $submission->status }}</span></td>
            <td><strong>Total Beban SKS</strong></td>
            <td>: <strong>{{ (float)$submission->total_credits }} SKS</strong></td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%;">No.</th>
                <th style="width: 15%;">Kode MK</th>
                <th style="width: 35%;">Nama Mata Kuliah</th>
                <th style="width: 8%;">SKS</th>
                <th style="width: 8%;">Kelas</th>
                <th style="width: 29%;">Dosen Pengampu / Jadwal</th>
            </tr>
        </thead>
        <tbody>
            @forelse($items as $index => $item)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="text-center font-mono"><strong>{{ $item->course_code }}</strong></td>
                    <td>{{ $item->course_name }}</td>
                    <td class="text-center">{{ (float)$item->credits }}</td>
                    <td class="text-center">{{ $item->class_name ?? 'A' }}</td>
                    <td>
                        {{ $item->lecturer_name ?? 'Dosen Pengampu' }}<br>
                        <small style="color: #555;">{{ $item->day_of_week ? "{$item->day_of_week}, {$item->start_time}-{$item->end_time} ({$item->room_name})" : 'Jadwal Reguler' }}</small>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="text-center" style="padding: 20px;">Tidak ada mata kuliah yang terdaftar pada KRS ini.</td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr style="font-weight: bold; background-color: #fafafa;">
                <td colspan="3" class="text-right">TOTAL SKS DIAMBIL:</td>
                <td class="text-center">{{ (float)$submission->total_credits }}</td>
                <td colspan="2"></td>
            </tr>
        </tfoot>
    </table>

    <table class="sign-table">
        <tr>
            <td>
                Mahasiswa Yang Bersangkutan,
                <div class="sign-space"></div>
                <strong>{{ $submission->student_name }}</strong><br>
                NIM. {{ $submission->student_nim }}
            </td>
            <td>
                Mengetahui,<br>
                Dosen Pembimbing Akademik (PA),
                <div class="sign-space"></div>
                <strong>{{ $submission->advisor_name ?? '( ........................................ )' }}</strong><br>
                NIDN/NIP. -
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
