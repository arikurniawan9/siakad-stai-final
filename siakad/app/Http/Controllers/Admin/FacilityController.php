<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FacilityController extends Controller
{
    /**
     * Tampilkan Daftar Gedung & Ruang Kelas
     */
    public function index(): Response
    {
        $buildings = DB::table('buildings')
            ->orderBy('id', 'asc')
            ->get();

        $rooms = DB::table('rooms')
            ->join('buildings', 'rooms.building_id', '=', 'buildings.id')
            ->select(
                'rooms.*',
                'buildings.name as building_name',
                'buildings.code as building_code'
            )
            ->orderBy('rooms.id', 'asc')
            ->get()
            ->map(function ($r) {
                if (is_string($r->facilities)) {
                    $decoded = json_decode($r->facilities, true);
                    $r->facilities = is_array($decoded) ? $decoded : [];
                } elseif (is_array($r->facilities)) {
                    $r->facilities = $r->facilities;
                } else {
                    $r->facilities = [];
                }
                return $r;
            });

        return Inertia::render('Admin/Facilities/Index', [
            'buildings' => $buildings,
            'rooms' => $rooms,
        ]);
    }

    /**
     * Simpan Gedung Baru
     */
    public function storeBuilding(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:32', 'unique:buildings,code'],
            'name' => ['required', 'string', 'max:100'],
            'total_floors' => ['required', 'integer', 'min:1', 'max:20'],
            'address' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
        ]);

        DB::table('buildings')->insert([
            ...$validated,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Gedung {$validated['name']} berhasil ditambahkan.");
    }

    /**
     * Simpan Ruang Kelas Baru
     */
    public function storeRoom(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'building_id' => ['required', 'exists:buildings,id'],
            'code' => ['required', 'string', 'max:32', 'unique:rooms,code'],
            'name' => ['required', 'string', 'max:100'],
            'floor_number' => ['required', 'integer', 'min:1'],
            'capacity' => ['required', 'integer', 'min:5', 'max:500'],
            'exam_capacity' => ['nullable', 'integer', 'min:5', 'max:300'],
            'room_type' => ['required', 'string'],
            'facilities' => ['nullable', 'array'],
        ]);

        DB::table('rooms')->insert([
            'building_id' => $validated['building_id'],
            'code' => $validated['code'],
            'name' => $validated['name'],
            'floor_number' => $validated['floor_number'],
            'capacity' => $validated['capacity'],
            'exam_capacity' => $validated['exam_capacity'] ?? ceil($validated['capacity'] * 0.6),
            'room_type' => $validated['room_type'],
            'facilities' => json_encode($validated['facilities'] ?? []),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Ruang Kelas {$validated['name']} ({$validated['code']}) berhasil ditambahkan.");
    }
}
