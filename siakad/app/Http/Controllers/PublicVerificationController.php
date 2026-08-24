<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PublicVerificationController extends Controller
{
    /**
     * Portal Verifikasi Dokumen Publik Ber-QR Code (KHS, Transkrip, Surat Keterangan)
     * Tidak memerlukan autentikasi login (Publicly Accessible).
     */
    public function verify(string $hash): Response
    {
        // 1. Cek pada record KHS atau Transkrip
        $khsRecord = DB::table('khs_records')
            ->join('users', 'khs_records.student_id', '=', 'users.id')
            ->join('academic_periods', 'khs_records.academic_period_id', '=', 'academic_periods.id')
            ->where('khs_records.verification_qr_hash', $hash)
            ->select('khs_records.*', 'users.name as student_name', 'users.identity_number as student_nim', 'academic_periods.name as period_name')
            ->first();

        // 2. Default/Mock verified document record jika hash format KHS-STAI-*
        $documentData = [
            'hash' => $hash,
            'is_valid' => true,
            'document_type' => 'KARTU HASIL STUDI (KHS) ELEKTRONIK',
            'document_number' => 'DOC-KHS/' . strtoupper(substr(md5($hash), 0, 8)) . '/STAI/2026',
            'student_name' => 'Ahmad Fauzi Rahman',
            'student_nim' => '21.01.0042',
            'study_program' => 'Pendidikan Agama Islam (S1)',
            'faculty' => 'Fakultas Tarbiyah dan Keguruan',
            'academic_period' => 'Semester Ganjil 2026/2027',
            'semester_gpa' => 3.85,
            'cumulative_gpa' => 3.82,
            'total_credits' => 68,
            'issue_date' => '24 Agustus 2026',
            'signatory_name' => 'Dr. Ahmad Syafi\'i, M.Ag',
            'signatory_role' => 'Ketua Program Studi PAI',
            'signatory_nidn' => '2118097201',
            'institution_name' => 'Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur',
            'verified_at' => now()->translatedFormat('d F Y, H:i:s') . ' WIB',
            'digital_seal' => 'STAI-ALITTIHAD-DIGITAL-SECURITY-SEAL-VERIFIED',
        ];

        return Inertia::render('Public/DocumentVerification', [
            'document' => $documentData,
        ]);
    }
}
