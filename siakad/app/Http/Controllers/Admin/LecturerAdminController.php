<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LecturerAdminController extends Controller
{
    /**
     * Tampilan Data Dosen berdasarkan Tahun Akademik & Homebase
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $prodiFilter = $request->input('study_program');
        $roleFilter = $request->input('role');

        $academicYears = DB::table('academic_years')->orderBy('code', 'desc')->get();
        $studyPrograms = DB::table('study_programs')->get();
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        $lecturersQuery = User::whereIn('role', ['dosen', 'dosen_pa', 'kaprodi'])
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('name', 'ilike', "%{$search}%")
                        ->orWhere('identity_number', 'ilike', "%{$search}%")
                        ->orWhere('username', 'ilike', "%{$search}%")
                        ->orWhere('email', 'ilike', "%{$search}%");
                });
            })
            ->when($prodiFilter, function ($q) use ($prodiFilter) {
                $q->where('study_program', $prodiFilter);
            })
            ->when($roleFilter, function ($q) use ($roleFilter) {
                $q->where('role', $roleFilter);
            });

        $lecturers = $lecturersQuery->orderBy('name', 'asc')->paginate(15)->withQueryString();

        // Hitung beban kelas mengajar per dosen di periode ini
        $lecturerIds = $lecturers->pluck('id')->toArray();
        $classCountMap = DB::table('class_lecturers')
            ->join('course_classes', 'class_lecturers.course_class_id', '=', 'course_classes.id')
            ->whereIn('class_lecturers.lecturer_id', $lecturerIds)
            ->where('course_classes.academic_period_id', $activePeriod?->id ?? 1)
            ->groupBy('class_lecturers.lecturer_id')
            ->select('class_lecturers.lecturer_id', DB::raw('count(*) as count'))
            ->pluck('count', 'class_lecturers.lecturer_id');

        $lecturers->getCollection()->transform(function ($lec) use ($classCountMap) {
            $lec->teaching_classes_count = $classCountMap[$lec->id] ?? 0;
            return $lec;
        });

        $totalLecturers = User::whereIn('role', ['dosen', 'dosen_pa', 'kaprodi'])->count();
        $paCount = User::where('role', 'dosen_pa')->count();

        return Inertia::render('Admin/Lecturers/Index', [
            'lecturers' => $lecturers,
            'academicYears' => $academicYears,
            'studyPrograms' => $studyPrograms,
            'activePeriod' => $activePeriod,
            'stats' => [
                'total' => $totalLecturers,
                'advisors' => $paCount,
            ],
            'filters' => [
                'search' => $search,
                'study_program' => $prodiFilter,
                'role' => $roleFilter,
            ],
        ]);
    }

    /**
     * Tambah Dosen Baru
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'identity_number' => ['required', 'string', 'max:32', 'unique:users,identity_number'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'in:dosen,dosen_pa,kaprodi'],
            'study_program' => ['required', 'string', 'max:100'],
            'gender' => ['nullable', 'in:L,P'],
            'phone_number' => ['nullable', 'string', 'max:24'],
        ]);

        User::create([
            'name' => $validated['name'],
            'username' => $validated['identity_number'],
            'identity_number' => $validated['identity_number'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'study_program' => $validated['study_program'],
            'gender' => $validated['gender'] ?: 'L',
            'phone_number' => $validated['phone_number'] ?: null,
            'password' => Hash::make('salam123'),
            'is_active' => true,
        ]);

        return back()->with('success', "Dosen {$validated['name']} (NIDN: {$validated['identity_number']}) berhasil didaftarkan.");
    }

    /**
     * Perbarui Data Dosen
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $lecturer = User::whereIn('role', ['dosen', 'dosen_pa', 'kaprodi'])->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'identity_number' => ['required', 'string', 'max:32', Rule::unique('users')->ignore($lecturer->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($lecturer->id)],
            'role' => ['required', 'in:dosen,dosen_pa,kaprodi'],
            'study_program' => ['required', 'string', 'max:100'],
            'gender' => ['nullable', 'in:L,P'],
            'phone_number' => ['nullable', 'string', 'max:24'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $lecturer->update($validated);

        return back()->with('success', "Data dosen {$lecturer->name} berhasil diperbarui.");
    }

    /**
     * Impor Massal Dosen via Excel / Batch
     */
    public function importBatch(Request $request): RedirectResponse
    {
        $records = $request->input('records', []);
        if (empty($records)) {
            return back()->with('error', 'Tidak ada data dosen yang diunggah.');
        }

        $created = 0;
        $now = now();

        DB::transaction(function () use ($records, &$created, $now) {
            foreach ($records as $r) {
                if (empty($r['name']) || empty($r['identity_number'])) continue;

                if (User::where('identity_number', $r['identity_number'])->orWhere('email', $r['email'])->exists()) {
                    continue;
                }

                User::create([
                    'name' => $r['name'],
                    'username' => $r['identity_number'],
                    'identity_number' => $r['identity_number'],
                    'email' => $r['email'],
                    'role' => $r['role'] ?? 'dosen',
                    'study_program' => $r['study_program'] ?? 'Pendidikan Agama Islam (S1)',
                    'gender' => $r['gender'] ?? 'L',
                    'phone_number' => $r['phone_number'] ?? null,
                    'password' => Hash::make('salam123'),
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                $created++;
            }
        });

        return back()->with('success', "Berhasil mengimpor {$created} dosen baru dengan password default 'salam123'.");
    }
}
