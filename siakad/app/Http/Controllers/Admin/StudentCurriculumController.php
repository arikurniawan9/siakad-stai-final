<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StudentCurriculumController extends Controller
{
    public function index(Request $request)
    {
        return redirect()->route('admin.students.index', array_merge($request->query(), ['tab' => 'curricula']));
    }

    public function assignCurriculum(Request $request)
    {
        $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:users,id',
            'curriculum_id' => 'required|exists:curricula,id',
        ]);

        $curriculum = DB::table('curricula')->where('id', $request->curriculum_id)->first();

        User::whereIn('id', $request->student_ids)
            ->where('role', 'mahasiswa')
            ->update([
                'curriculum_id' => $request->curriculum_id,
                'updated_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => count($request->student_ids) . " mahasiswa berhasil ditetapkan ke " . $curriculum->name . " (" . $curriculum->code . ").",
        ]);
    }
}
