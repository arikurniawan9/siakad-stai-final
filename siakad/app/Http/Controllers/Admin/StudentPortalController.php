<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class StudentPortalController extends Controller
{
    public function index(Request $request)
    {
        return redirect()->route('admin.students.index', array_merge($request->query(), ['tab' => 'portal']));
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);
        $user->password = Hash::make('salam123');
        $user->save();

        return response()->json([
            'success' => true,
            'message' => "Password akun {$user->name} berhasil di-reset menjadi default 'salam123'.",
        ]);
    }
}
