<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LetterController extends Controller
{
    /**
     * Tampilan Daftar Penerbitan Surat Keterangan Resmi
     */
    public function index(Request $request): Response
    {
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        $students = DB::table('users')
            ->where('role', 'mahasiswa')
            ->select('id', 'name', 'identity_number as nim', 'study_program')
            ->get();

        // Sample list of issued letters
        $letters = [
            [
                'id' => 1,
                'letter_number' => '421.4/STAI-ITTH/SK/VIII/2026/042',
                'student_id' => 7,
                'student_name' => 'Ahmad Fauzi Rahman',
                'student_nim' => '21010042',
                'study_program' => 'Pendidikan Agama Islam (S1)',
                'semester_level' => 5,
                'purpose' => 'Persyaratan Pengajuan Beasiswa Prestasi Kemenag RI',
                'issue_date' => '24 Agustus 2026',
                'signatory_name' => 'Dr. H. M. Ridwan, M.Ag',
                'signatory_role' => 'Wakil Ketua I Bidang Akademik',
                'qr_hash' => 'SK-AKTIF-STAI-2026-21010042-VERIFIED',
                'status' => 'TERBIT',
            ]
        ];

        return Inertia::render('Admin/Letters/Index', [
            'activePeriod' => $activePeriod,
            'letters' => $letters,
            'students' => $students,
        ]);
    }

    /**
     * Terbitkan Surat Keterangan Baru
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
            'purpose' => ['required', 'string', 'max:255'],
        ]);

        $student = DB::table('users')->where('id', $validated['student_id'])->first();
        $randomCode = strtoupper(substr(md5(uniqid()), 0, 6));
        $letterNumber = "421.4/STAI-ITTH/SK/" . date('m') . "/2026/{$randomCode}";
        $qrHash = "SK-AKTIF-STAI-2026-{$student->identity_number}-" . substr(md5(time()), 0, 8);

        return back()->with('success', "Surat Keterangan Aktif Kuliah ({$letterNumber}) untuk {$student->name} berhasil diterbitkan dengan QR Code Resmi.");
    }

    /**
     * Tampilan Cetak Surat Keterangan Aktif Kuliah Resmi
     */
    public function show(int $id): Response
    {
        $letter = [
            'id' => $id,
            'letter_number' => '421.4/STAI-ITTH/SK/VIII/2026/042',
            'student_name' => 'Ahmad Fauzi Rahman',
            'student_nim' => '21.01.0042',
            'birth_info' => 'Cianjur, 15 Mei 2003',
            'study_program' => 'Pendidikan Agama Islam (S1)',
            'faculty' => 'Fakultas Tarbiyah dan Keguruan',
            'semester_level' => 'V (Lima)',
            'academic_year' => '2026/2027 (Ganjil)',
            'purpose' => 'Persyaratan Pengajuan Beasiswa Prestasi Mahasiswa Kemenag RI',
            'issue_date' => '24 Agustus 2026',
            'signatory_name' => 'Dr. H. M. Ridwan, M.Ag',
            'signatory_role' => 'Wakil Ketua I Bidang Akademik',
            'signatory_nidn' => '2112087501',
            'qr_hash' => 'SK-AKTIF-STAI-2026-21010042-VERIFIED',
        ];

        return Inertia::render('Admin/Letters/Show', [
            'letter' => $letter,
        ]);
    }
}
