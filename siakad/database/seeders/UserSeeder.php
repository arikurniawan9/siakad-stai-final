<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    /**
     * Seed atau Reset Akun Pengguna SIAKAD & LMS STAI Al-Ittihad.
     * Menggunakan updateOrCreate sehingga dapat dijalankan berulang kali
     * untuk memulihkan akun dan mereset kata sandi ke 'salam123'.
     */
    public function run(): void
    {
        $defaultPassword = Hash::make('salam123');
        $now = Carbon::now();

        $users = [
            // 1. SUPERADMINISTRATOR
            [
                'username' => 'superadmin',
                'name' => 'Super Administrator',
                'identity_number' => 'SA-001',
                'email' => 'superadmin@staialittihad.ac.id',
                'role' => 'superadmin',
                'roles' => ['superadmin'],
                'phone_number' => '081234567890',
                'study_program' => 'Pusat Komputer & Sistem Informasi',
                'gender' => 'L',
                'is_active' => true,
            ],

            // 2. ADMIN AKADEMIK (BAAK)
            [
                'username' => 'adminakademik',
                'name' => 'Budi Santoso, S.Kom',
                'identity_number' => '198504122010011002',
                'email' => 'budi.santoso@staialittihad.ac.id',
                'role' => 'admin_akademik',
                'roles' => ['admin_akademik'],
                'phone_number' => '081234567891',
                'study_program' => 'Biro Administrasi Akademik (BAAK)',
                'gender' => 'L',
                'is_active' => true,
            ],

            // 3. BIRO KEUANGAN
            [
                'username' => 'keuangan',
                'name' => 'H. Ridwan Kamil, S.E.',
                'identity_number' => '198203152008011003',
                'email' => 'keuangan@staialittihad.ac.id',
                'role' => 'keuangan',
                'roles' => ['keuangan'],
                'phone_number' => '081234567892',
                'study_program' => 'Biro Keuangan & Perbankan BSI',
                'gender' => 'L',
                'is_active' => true,
            ],

            // 4. KETUA PROGRAM STUDI (KAPRODI PIAUD)
            [
                'username' => '2118097201',
                'name' => "Dr. Ahmad Syafi'i, M.Ag",
                'identity_number' => '2118097201',
                'email' => 'kaprodi.piaud@staialittihad.ac.id',
                'role' => 'kaprodi',
                'roles' => ['kaprodi', 'dosen'],
                'phone_number' => '081234567893',
                'study_program' => 'Pendidikan Islam Anak Usia Dini (S1)',
                'gender' => 'L',
                'is_active' => true,
            ],

            // 5. DOSEN PEMBIMBING AKADEMIK (DOSEN PA)
            [
                'username' => '2115047802',
                'name' => 'Dra. Hj. Siti Maryam, M.Pd.I',
                'identity_number' => '2115047802',
                'email' => 'siti.maryam.pa@staialittihad.ac.id',
                'role' => 'dosen_pa',
                'roles' => ['dosen_pa', 'dosen'],
                'phone_number' => '081234567894',
                'study_program' => 'Fakultas Tarbiyah dan Keguruan (Dosen Wali PA)',
                'gender' => 'P',
                'is_active' => true,
            ],

            // 6. DOSEN PENGAJAR
            [
                'username' => '2112087501',
                'name' => 'Dr. H. M. Ridwan, M.Ag',
                'identity_number' => '2112087501',
                'email' => 'm.ridwan@staialittihad.ac.id',
                'role' => 'dosen',
                'roles' => ['dosen'],
                'phone_number' => '081234567895',
                'study_program' => 'Fakultas Tarbiyah dan Keguruan / PIAUD',
                'gender' => 'L',
                'is_active' => true,
            ],
            [
                'username' => '3203040910960002',
                'name' => 'MUHAMMAD RIZAL ZAENULLOH, M.Pd.',
                'identity_number' => '3203040910960002',
                'email' => 'rizal.zaenulloh@staialittihad.ac.id',
                'role' => 'dosen',
                'roles' => ['dosen'],
                'phone_number' => '081234567801',
                'study_program' => 'Pendidikan Islam Anak Usia Dini (S1)',
                'gender' => 'L',
                'is_active' => true,
            ],
            [
                'username' => '3203072705890003',
                'name' => 'WAHYUDIN, M.Pd.',
                'identity_number' => '3203072705890003',
                'email' => 'wahyudin@staialittihad.ac.id',
                'role' => 'dosen',
                'roles' => ['dosen'],
                'phone_number' => '081234567802',
                'study_program' => 'Pendidikan Islam Anak Usia Dini (S1)',
                'gender' => 'L',
                'is_active' => true,
            ],
            [
                'username' => '2118097202',
                'name' => 'DEDE SULAEMAN, M.Pd.',
                'identity_number' => '2118097202',
                'email' => 'dede.sulaeman@staialittihad.ac.id',
                'role' => 'dosen',
                'roles' => ['dosen'],
                'phone_number' => '081234567803',
                'study_program' => 'Pendidikan Islam Anak Usia Dini (S1)',
                'gender' => 'L',
                'is_active' => true,
            ],
            [
                'username' => '2115047803',
                'name' => 'SITI RODIAH, M.Pd.',
                'identity_number' => '2115047803',
                'email' => 'siti.rodiah@staialittihad.ac.id',
                'role' => 'dosen_pa',
                'roles' => ['dosen_pa', 'dosen'],
                'phone_number' => '081234567804',
                'study_program' => 'Pendidikan Islam Anak Usia Dini (S1)',
                'gender' => 'P',
                'is_active' => true,
            ],

            // 7. MAHASISWA
            [
                'username' => '21010042',
                'name' => 'Ahmad Fauzi Rahman',
                'identity_number' => '21010042',
                'email' => 'ahmad.fauzi@staialittihad.ac.id',
                'role' => 'mahasiswa',
                'roles' => ['mahasiswa'],
                'phone_number' => '081234567896',
                'study_program' => 'Pendidikan Islam Anak Usia Dini (S1)',
                'gender' => 'L',
                'is_active' => true,
            ],
            [
                'username' => '25893601',
                'name' => 'Alleisya Hani Pasyala',
                'identity_number' => '25893601',
                'email' => 'alleisya.hani@staialittihad.ac.id',
                'role' => 'mahasiswa',
                'roles' => ['mahasiswa'],
                'phone_number' => '081234567892',
                'study_program' => 'Pendidikan Islam Anak Usia Dini (S1)',
                'gender' => 'P',
                'is_active' => true,
            ],
            [
                'username' => '25893604',
                'name' => 'Cantika Siti Samsiah',
                'identity_number' => '25893604',
                'email' => 'cantika.siti@staialittihad.ac.id',
                'role' => 'mahasiswa',
                'roles' => ['mahasiswa'],
                'phone_number' => '081234567891',
                'study_program' => 'Pendidikan Islam Anak Usia Dini (S1)',
                'gender' => 'P',
                'is_active' => true,
            ],
        ];

        $hasRolesCol = DB::getSchemaBuilder()->hasColumn('users', 'roles');

        foreach ($users as $userData) {
            $username = $userData['username'];
            $roles = $userData['roles'];
            unset($userData['roles']);

            $userData['password'] = $defaultPassword;
            $userData['updated_at'] = $now;

            if ($hasRolesCol) {
                $userData['roles'] = $roles;
            }

            $user = User::where('username', $username)->first();
            if ($user) {
                $user->update($userData);
            } else {
                $userData['created_at'] = $now;
                User::create($userData);
            }
        }

        // Resync PostgreSQL users sequence
        try {
            DB::statement("SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id), 1)) FROM users;");
        } catch (\Throwable $e) {}

        $this->command->info("✅ Berhasil menyemai dan mereset seluruh akun pengguna dengan kata sandi: salam123");
    }
}
