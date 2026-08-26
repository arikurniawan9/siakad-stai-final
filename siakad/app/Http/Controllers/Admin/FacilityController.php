<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FacilityController extends Controller
{
    /**
     * Tampilkan Daftar Gedung & Ruang Kelas dengan KPI & Pencarian
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $buildingId = $request->input('building_id');
        $roomType = $request->input('room_type');
        $floor = $request->input('floor');
        $status = $request->input('status'); // 'active', 'inactive', or null

        // Daftar Gedung beserta agregasi jumlah ruangan & kapasitas
        $buildings = DB::table('buildings')
            ->leftJoin('rooms', 'buildings.id', '=', 'rooms.building_id')
            ->select(
                'buildings.*',
                DB::raw('COUNT(rooms.id) as total_rooms'),
                DB::raw('COALESCE(SUM(rooms.capacity), 0) as total_capacity')
            )
            ->groupBy('buildings.id')
            ->orderBy('buildings.id', 'asc')
            ->get();

        // Query Ruang Kelas
        $roomsQuery = DB::table('rooms')
            ->join('buildings', 'rooms.building_id', '=', 'buildings.id')
            ->select(
                'rooms.*',
                'buildings.name as building_name',
                'buildings.code as building_code'
            );

        if ($search) {
            $roomsQuery->where(function ($q) use ($search) {
                $q->where('rooms.name', 'ilike', "%{$search}%")
                  ->orWhere('rooms.code', 'ilike', "%{$search}%")
                  ->orWhere('buildings.name', 'ilike', "%{$search}%")
                  ->orWhere('buildings.code', 'ilike', "%{$search}%");
            });
        }

        if ($buildingId) {
            $roomsQuery->where('rooms.building_id', $buildingId);
        }

        if ($roomType) {
            $roomsQuery->where('rooms.room_type', $roomType);
        }

        if ($floor) {
            $roomsQuery->where('rooms.floor_number', $floor);
        }

        if ($status !== null && $status !== '') {
            $roomsQuery->where('rooms.is_active', $status === 'active');
        }

        $rooms = $roomsQuery
            ->orderBy('buildings.name', 'asc')
            ->orderBy('rooms.floor_number', 'asc')
            ->orderBy('rooms.code', 'asc')
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

        // KPI Ringkasan Fasilitas Kampus
        $totalBuildings = DB::table('buildings')->count();
        $totalRooms = DB::table('rooms')->count();
        $activeRooms = DB::table('rooms')->where('is_active', true)->count();
        $totalCapacity = DB::table('rooms')->where('is_active', true)->sum('capacity') ?? 0;
        $totalExamCapacity = DB::table('rooms')->where('is_active', true)->sum('exam_capacity') ?? 0;

        return Inertia::render('Admin/Facilities/Index', [
            'buildings' => $buildings,
            'rooms' => $rooms,
            'stats' => [
                'total_buildings' => $totalBuildings,
                'total_rooms' => $totalRooms,
                'active_rooms' => $activeRooms,
                'total_capacity' => (int) $totalCapacity,
                'total_exam_capacity' => (int) $totalExamCapacity,
            ],
            'filters' => [
                'search' => $search,
                'building_id' => $buildingId,
                'room_type' => $roomType,
                'floor' => $floor,
                'status' => $status,
            ],
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
            'address' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        DB::table('buildings')->insert([
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'total_floors' => $validated['total_floors'],
            'address' => $validated['address'] ?? 'Kampus Terpadu STAI Al-Ittihad Cianjur',
            'description' => $validated['description'] ?? null,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Gedung {$validated['name']} ({$validated['code']}) berhasil ditambahkan.");
    }

    /**
     * Perbarui Data Gedung
     */
    public function updateBuilding(Request $request, $id): RedirectResponse
    {
        $building = DB::table('buildings')->where('id', $id)->first();
        if (!$building) {
            return back()->with('error', 'Gedung tidak ditemukan.');
        }

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:32', 'unique:buildings,code,' . $id],
            'name' => ['required', 'string', 'max:100'],
            'total_floors' => ['required', 'integer', 'min:1', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        DB::table('buildings')->where('id', $id)->update([
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'total_floors' => $validated['total_floors'],
            'address' => $validated['address'] ?? $building->address,
            'description' => $validated['description'] ?? null,
            'is_active' => $request->has('is_active') ? (bool) $request->input('is_active') : $building->is_active,
            'updated_at' => now(),
        ]);

        return back()->with('success', "Data Gedung {$validated['name']} berhasil diperbarui.");
    }

    /**
     * Hapus Gedung Kampus
     */
    public function destroyBuilding($id): RedirectResponse
    {
        $building = DB::table('buildings')->where('id', $id)->first();
        if (!$building) {
            return back()->with('error', 'Gedung tidak ditemukan.');
        }

        $roomCount = DB::table('rooms')->where('building_id', $id)->count();
        if ($roomCount > 0) {
            return back()->with('error', "Gedung {$building->name} tidak dapat dihapus karena masih memiliki {$roomCount} ruang kelas di dalamnya. Pindahkan atau hapus ruangan terlebih dahulu.");
        }

        DB::table('buildings')->where('id', $id)->delete();

        return back()->with('success', "Gedung {$building->name} berhasil dihapus.");
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
            'floor_number' => ['required', 'integer', 'min:1', 'max:20'],
            'capacity' => ['required', 'integer', 'min:5', 'max:500'],
            'exam_capacity' => ['nullable', 'integer', 'min:5', 'max:300'],
            'room_type' => ['required', 'string'],
            'facilities' => ['nullable', 'array'],
        ]);

        DB::table('rooms')->insert([
            'building_id' => $validated['building_id'],
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'floor_number' => $validated['floor_number'],
            'capacity' => $validated['capacity'],
            'exam_capacity' => $validated['exam_capacity'] ?? (int) ceil($validated['capacity'] * 0.6),
            'room_type' => $validated['room_type'],
            'facilities' => json_encode($validated['facilities'] ?? []),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Ruang Kelas {$validated['name']} ({$validated['code']}) berhasil ditambahkan.");
    }

    /**
     * Perbarui Data Ruang Kelas
     */
    public function updateRoom(Request $request, $id): RedirectResponse
    {
        $room = DB::table('rooms')->where('id', $id)->first();
        if (!$room) {
            return back()->with('error', 'Ruang kelas tidak ditemukan.');
        }

        $validated = $request->validate([
            'building_id' => ['required', 'exists:buildings,id'],
            'code' => ['required', 'string', 'max:32', 'unique:rooms,code,' . $id],
            'name' => ['required', 'string', 'max:100'],
            'floor_number' => ['required', 'integer', 'min:1', 'max:20'],
            'capacity' => ['required', 'integer', 'min:5', 'max:500'],
            'exam_capacity' => ['nullable', 'integer', 'min:5', 'max:300'],
            'room_type' => ['required', 'string'],
            'facilities' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        DB::table('rooms')->where('id', $id)->update([
            'building_id' => $validated['building_id'],
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'floor_number' => $validated['floor_number'],
            'capacity' => $validated['capacity'],
            'exam_capacity' => $validated['exam_capacity'] ?? (int) ceil($validated['capacity'] * 0.6),
            'room_type' => $validated['room_type'],
            'facilities' => json_encode($validated['facilities'] ?? []),
            'is_active' => $request->has('is_active') ? (bool) $request->input('is_active') : $room->is_active,
            'updated_at' => now(),
        ]);

        return back()->with('success', "Ruang Kelas {$validated['name']} berhasil diperbarui.");
    }

    /**
     * Hapus Ruang Kelas
     */
    public function destroyRoom($id): RedirectResponse
    {
        $room = DB::table('rooms')->where('id', $id)->first();
        if (!$room) {
            return back()->with('error', 'Ruang kelas tidak ditemukan.');
        }

        // Cek apakah ada jadwal perkuliahan aktif menggunakan ruang ini
        try {
            $scheduleCount = DB::table('class_schedules')->where('room_id', $id)->count();
            if ($scheduleCount > 0) {
                return back()->with('error', "Ruang {$room->name} tidak dapat dihapus karena telah terplot pada {$scheduleCount} jadwal perkuliahan. Anda dapat menonaktifkan ruangan ini.");
            }
        } catch (\Throwable $e) {}

        DB::table('rooms')->where('id', $id)->delete();

        return back()->with('success', "Ruang Kelas {$room->name} ({$room->code}) berhasil dihapus.");
    }

    /**
     * Toggle Status Aktif / Nonaktif Ruang Kelas
     */
    public function toggleRoomStatus($id): RedirectResponse
    {
        $room = DB::table('rooms')->where('id', $id)->first();
        if (!$room) {
            return back()->with('error', 'Ruang kelas tidak ditemukan.');
        }

        $newStatus = !$room->is_active;
        DB::table('rooms')->where('id', $id)->update([
            'is_active' => $newStatus,
            'updated_at' => now(),
        ]);

        $statusText = $newStatus ? 'diaktifkan (Siap Pakai)' : 'dinonaktifkan (Dalam Pemeliharaan)';
        return back()->with('success', "Status Ruang {$room->name} berhasil diubah menjadi {$statusText}.");
    }

    /**
     * Cetak Dokumen PDF Resmi Berkop Surat Denah & Fasilitas Ruang
     */
    public function printPdf(Request $request): Response
    {
        $buildingId = $request->input('building_id');
        $roomType = $request->input('room_type');
        $status = $request->input('status');

        $buildings = DB::table('buildings')->orderBy('name', 'asc')->get();

        $roomsQuery = DB::table('rooms')
            ->join('buildings', 'rooms.building_id', '=', 'buildings.id')
            ->select(
                'rooms.*',
                'buildings.name as building_name',
                'buildings.code as building_code'
            );

        if ($buildingId) {
            $roomsQuery->where('rooms.building_id', $buildingId);
        }
        if ($roomType) {
            $roomsQuery->where('rooms.room_type', $roomType);
        }
        if ($status !== null && $status !== '') {
            $roomsQuery->where('rooms.is_active', $status === 'active');
        }

        $rooms = $roomsQuery
            ->orderBy('buildings.name', 'asc')
            ->orderBy('rooms.floor_number', 'asc')
            ->orderBy('rooms.code', 'asc')
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

        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        return Inertia::render('Admin/Facilities/Print', [
            'rooms' => $rooms,
            'buildings' => $buildings,
            'activePeriod' => $activePeriod,
            'filters' => [
                'building_id' => $buildingId,
                'room_type' => $roomType,
                'status' => $status,
            ],
            'signatory' => [
                'title' => 'Kepala Bagian Sarana & Prasarana Kampus',
                'name' => 'H. Ahmad Fauzi, S.Ag., M.Pd.I.',
                'nip' => '19790514 200501 1 003',
                'city' => 'Cianjur',
                'date' => now()->translatedFormat('d F Y'),
            ],
        ]);
    }

    /**
     * Ekspor Data Inventaris Ruang Kelas & Gedung ke Format Excel Mewah (.xls)
     */
    public function exportExcel(Request $request): StreamedResponse
    {
        $buildingId = $request->input('building_id');
        $roomType = $request->input('room_type');
        $status = $request->input('status');

        $roomsQuery = DB::table('rooms')
            ->join('buildings', 'rooms.building_id', '=', 'buildings.id')
            ->select(
                'rooms.*',
                'buildings.name as building_name',
                'buildings.code as building_code'
            );

        if ($buildingId) {
            $roomsQuery->where('rooms.building_id', $buildingId);
        }
        if ($roomType) {
            $roomsQuery->where('rooms.room_type', $roomType);
        }
        if ($status !== null && $status !== '') {
            $roomsQuery->where('rooms.is_active', $status === 'active');
        }

        $rooms = $roomsQuery
            ->orderBy('buildings.name', 'asc')
            ->orderBy('rooms.floor_number', 'asc')
            ->orderBy('rooms.code', 'asc')
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

        $filename = 'INVENTARIS_GEDUNG_RUANG_' . date('Ymd_His') . '.xls';

        $response = new StreamedResponse(function () use ($rooms) {
            $out = fopen('php://output', 'w');

            echo '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
            echo '<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8">';
            echo '<style>
                body { font-family: "Segoe UI", Arial, sans-serif; font-size: 11px; }
                table { border-collapse: collapse; width: 100%; }
                th { background-color: #065f46; color: #ffffff; font-weight: bold; border: 1px solid #047857; padding: 9px 8px; text-align: center; }
                td { border: 1px solid #d1d5db; padding: 7px 8px; vertical-align: middle; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .font-mono { font-family: "Consolas", monospace; mso-number-format:"\@"; }
                .zebra { background-color: #f9fafb; }
                .header-title { font-size: 16px; font-weight: 900; color: #065f46; }
                .badge-active { background-color: #d1fae5; color: #065f46; font-weight: bold; }
                .badge-inactive { background-color: #fee2e2; color: #991b1b; }
            </style></head><body>';

            // Kop Surat Excel
            echo '<table>';
            echo '<tr><td colspan="10" class="header-title" style="border:none; text-align:center;">SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR</td></tr>';
            echo '<tr><td colspan="10" style="border:none; text-align:center; font-weight:bold; font-size:13px;">INVENTARIS SARANA PRASARANA: GEDUNG & RUANG KELAS PERKULIAHAN</td></tr>';
            echo '<tr><td colspan="10" style="border:none; text-align:center; font-size:10px; color:#6b7280;">Dicetak pada: ' . date('d F Y, H:i') . ' WIB • Status Sistem: Terverifikasi</td></tr>';
            echo '<tr><td colspan="10" style="border:none; height:15px;"></td></tr>';

            // Table Header
            echo '<tr>';
            echo '<th style="width:35px;">No</th>';
            echo '<th style="width:110px;">Kode Ruang</th>';
            echo '<th style="width:200px;">Nama Ruang Kelas</th>';
            echo '<th style="width:160px;">Gedung Kampus</th>';
            echo '<th style="width:70px;">Lantai</th>';
            echo '<th style="width:130px;">Tipe Ruang</th>';
            echo '<th style="width:100px;">Kapasitas Kuliah</th>';
            echo '<th style="width:100px;">Kapasitas Ujian</th>';
            echo '<th style="width:250px;">Fasilitas Ruang</th>';
            echo '<th style="width:110px;">Status Operasional</th>';
            echo '</tr>';

            // Data Rows
            $no = 1;
            foreach ($rooms as $r) {
                $isZebra = ($no % 2 === 0) ? 'class="zebra"' : '';
                $facilitiesList = !empty($r->facilities) ? implode(', ', $r->facilities) : '-';
                $statusText = $r->is_active ? 'Siap Pakai (Aktif)' : 'Perawatan (Nonaktif)';
                $statusClass = $r->is_active ? 'badge-active' : 'badge-inactive';

                echo "<tr {$isZebra}>";
                echo "<td class='text-center'>{$no}</td>";
                echo "<td class='font-mono text-center'>{$r->code}</td>";
                echo "<td><strong>{$r->name}</strong></td>";
                echo "<td>{$r->building_name} ({$r->building_code})</td>";
                echo "<td class='text-center'>Lantai {$r->floor_number}</td>";
                echo "<td class='text-center'>{$r->room_type}</td>";
                echo "<td class='text-center'>{$r->capacity} Kursi</td>";
                echo "<td class='text-center'>{$r->exam_capacity} Kursi</td>";
                echo "<td>{$facilitiesList}</td>";
                echo "<td class='text-center {$statusClass}'>{$statusText}</td>";
                echo '</tr>';
                $no++;
            }

            echo '</table></body></html>';
            fclose($out);
        });

        $response->headers->set('Content-Type', 'application/vnd.ms-excel; charset=UTF-8');
        $response->headers->set('Content-Disposition', "attachment; filename=\"{$filename}\"");
        $response->headers->set('Cache-Control', 'max-age=0');
        $response->headers->set('Pragma', 'public');

        return $response;
    }
}
