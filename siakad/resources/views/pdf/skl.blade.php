<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Surat Keterangan Lulus (SKL) — {{ $applicant->student_name }}</title>
    <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 12px; color: #111; margin: 25px; line-height: 1.5; }
        .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
        .header h2 { margin: 0; font-size: 16px; text-transform: uppercase; }
        .header h3 { margin: 2px 0; font-size: 14px; text-transform: uppercase; }
        .header p { margin: 2px 0; font-size: 11px; font-style: italic; }
        .doc-title { text-align: center; margin: 20px 0; }
        .doc-title h4 { margin: 0; font-size: 14px; text-decoration: underline; text-transform: uppercase; }
        .doc-title p { margin: 3px 0 0 0; font-size: 11px; }
        .content { margin: 20px 0; text-align: justify; }
        .table-data { width: 100%; margin: 15px 0 15px 25px; font-size: 12px; }
        .table-data td { padding: 4px 0; vertical-align: top; }
        .sign-table { width: 100%; margin-top: 40px; font-size: 12px; }
        .sign-table td { width: 50%; vertical-align: top; }
        .sign-space { height: 60px; }
        @media print {
            body { margin: 0; }
            @page { margin: 20mm; }
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
        <h4>SURAT KETERANGAN LULUS (SKL)</h4>
        <p>Nomor: STAI/SKL/{{ date('Y') }}/{{ str_pad($applicant->id, 5, '0', STR_PAD_LEFT) }}</p>
    </div>

    <div class="content">
        <p>Ketua Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur, dengan ini menerangkan dengan sebenarnya bahwa:</p>

        <table class="table-data">
            <tr>
                <td style="width: 25%;"><strong>Nama Lengkap</strong></td>
                <td style="width: 75%;">: <strong>{{ $applicant->student_name }}</strong></td>
            </tr>
            <tr>
                <td><strong>NIM</strong></td>
                <td>: {{ $applicant->student_nim }}</td>
            </tr>
            <tr>
                <td><strong>Program Studi</strong></td>
                <td>: {{ $applicant->study_program }}</td>
            </tr>
            <tr>
                <td><strong>Jenjang Pendidikan</strong></td>
                <td>: Sarjana (S1)</td>
            </tr>
            <tr>
                <td><strong>Indeks Prestasi (IPK)</strong></td>
                <td>: <strong>{{ number_format((float)$applicant->final_gpa, 2) }}</strong></td>
            </tr>
            <tr>
                <td><strong>Predikat Kelulusan</strong></td>
                <td>: <strong>{{ $applicant->predicate ?? 'Sangat Memuaskan' }}</strong></td>
            </tr>
            <tr>
                <td><strong>Tanggal Lulus / Yudisium</strong></td>
                <td>: {{ date('d F Y', strtotime($applicant->verified_at ?? now())) }}</td>
            </tr>
        </table>

        <p>
            Telah dinyatakan <strong>LULUS</strong> dalam Sidang Munaqasyah Skripsi dan telah menyelesaikan seluruh beban studi akademik sesuai dengan kurikulum dan peraturan akademik yang berlaku di STAI Al-Ittihad Cianjur.
        </p>
        <p>
            Surat Keterangan ini berlaku sampai dengan diterbitkannya Ijazah dan Transkrip Nilai Akademik resmi, dan dapat dipergunakan sebagaimana mestinya.
        </p>
    </div>

    <table class="sign-table">
        <tr>
            <td></td>
            <td style="text-align: center;">
                Cianjur, {{ $printDate }}<br>
                Ketua STAI Al-Ittihad Cianjur,
                <div class="sign-space"></div>
                <strong>{{ $signatory->name ?? 'Prof. Dr. KH. Abdul Halim, M.Ag.' }}</strong><br>
                NIP. {{ $signatory->nip ?? '196803151994031003' }}
            </td>
        </tr>
    </table>
</body>
</html>
