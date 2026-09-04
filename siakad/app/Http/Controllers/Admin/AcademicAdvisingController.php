<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AcademicAdvisingController extends Controller
{
    public function index(Request $request)
    {
        return redirect()->route('admin.students.index', array_merge($request->query(), ['tab' => 'advising']));
    }

    public function assignAdvisor(Request $request)
    {
        $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:users,id',
            'advisor_id' => 'required|exists:users,id',
        ]);

        $advisor = User::findOrFail($request->advisor_id);

        User::whereIn('id', $request->student_ids)
            ->where('role', 'mahasiswa')
            ->update([
                'academic_advisor_id' => $advisor->id,
                'updated_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => count($request->student_ids) . " mahasiswa berhasil diplot ke Dosen PA: " . $advisor->name . ".",
        ]);
    }

    public function storeNote(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'advisor_id' => 'required|exists:users,id',
            'topic' => 'required|string|max:255',
            'discussion_notes' => 'nullable|string',
            'recommendations' => 'nullable|string',
        ]);

        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        DB::table('academic_advising_logs')->insert([
            'student_id' => $request->student_id,
            'advisor_id' => $request->advisor_id,
            'academic_period_id' => $activePeriod?->id ?? 1,
            'advising_date' => now()->toDateString(),
            'topic' => $request->topic,
            'discussion_notes' => $request->discussion_notes,
            'recommendations' => $request->recommendations,
            'status' => 'SELESAI',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Catatan bimbingan akademik berhasil disimpan.',
        ]);
    }
}
