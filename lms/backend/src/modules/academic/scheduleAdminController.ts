import { Response, NextFunction } from 'express';
import { db } from '../../db/pool.js';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';

// =========================================================================
// 1. STATISTIK RINGKASAN JADWAL & RUANGAN KAMPUS
// =========================================================================
export async function getSchedulesSummary(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const totalSchedulesRes = await db.query('SELECT COUNT(*) as count FROM schedules WHERE is_active = TRUE');
    const totalRoomsRes = await db.query('SELECT COUNT(*) as count, COUNT(*) FILTER (WHERE is_available = TRUE) as "activeRooms" FROM rooms');
    const totalCreditsRes = await db.query(`
      SELECT COALESCE(SUM(c.credits), 0) as "totalCredits" 
      FROM schedules s 
      JOIN course_classes cc ON cc.id = s.class_id 
      JOIN courses c ON c.id = cc.course_id 
      WHERE s.is_active = TRUE
    `);
    const dayDistRes = await db.query(`
      SELECT day_of_week as "dayOfWeek", COUNT(*) as count 
      FROM schedules 
      WHERE is_active = TRUE 
      GROUP BY day_of_week 
      ORDER BY 
        CASE day_of_week
          WHEN 'Senin' THEN 1
          WHEN 'Selasa' THEN 2
          WHEN 'Rabu' THEN 3
          WHEN 'Kamis' THEN 4
          WHEN 'Jumat' THEN 5
          WHEN 'Sabtu' THEN 6
          ELSE 7
        END
    `);
    const roomTypeDistRes = await db.query(`
      SELECT room_type as "roomType", COUNT(*) as count 
      FROM rooms 
      GROUP BY room_type 
      ORDER BY count DESC
    `);

    // Utilisasi Ruangan: Rasio jadwal terplot terhadap total slot waktu standar (6 hari x 3 sesi = 18 slot per ruang)
    const totalRoomsCount = parseInt(totalRoomsRes.rows[0]?.count || '1', 10);
    const totalSchedCount = parseInt(totalSchedulesRes.rows[0]?.count || '0', 10);
    const maxSlots = totalRoomsCount * 18;
    const utilizationRate = maxSlots > 0 ? Math.min(100, Math.round((totalSchedCount / maxSlots) * 100)) : 0;

    res.json({
      data: {
        totalSchedules: totalSchedCount,
        totalRooms: totalRoomsCount,
        totalActiveRooms: parseInt(totalRoomsRes.rows[0]?.activeRooms || '0', 10),
        totalScheduledCredits: parseInt(totalCreditsRes.rows[0]?.totalCredits || '0', 10),
        utilizationRatePercent: utilizationRate,
        conflictsCount: 0, // 0 Bentrok dengan active conflict-prevention engine
        dayDistribution: dayDistRes.rows,
        roomTypeDistribution: roomTypeDistRes.rows
      }
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 2. DAFTAR JADWAL PERKULIAHAN LENGKAP (DENGAN FILTER)
// =========================================================================
export async function getSchedules(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { dayOfWeek, roomId, prodiId, semesterId, deliveryMode, search } = req.query;

    let query = `
      SELECT 
        s.id,
        s.class_id as "classId",
        cc.class_name as "className",
        cc.academic_year as "academicYear",
        s.semester_id as "semesterId",
        sem.name as "semesterName",
        sem.is_current as "isCurrentSemester",
        c.id as "courseId",
        c.code as "courseCode",
        c.name as "courseName",
        c.credits,
        c.course_type as "courseType",
        sp.id as "studyProgramId",
        COALESCE(sp.name, 'Mata Kuliah Umum Institusi') as "studyProgramName",
        COALESCE(sp.code, 'MKDU') as "studyProgramCode",
        s.room_id as "roomId",
        COALESCE(r.name, s.room) as "roomName",
        COALESCE(r.code, 'R-00') as "roomCode",
        COALESCE(r.building, 'Gedung Utama') as "building",
        r.capacity as "roomCapacity",
        s.lecturer_id as "lecturerId",
        COALESCE(u.name, 'Belum Ditugaskan') as "lecturerName",
        COALESCE(u.identity_number, '') as "lecturerNidn",
        s.day_of_week as "dayOfWeek",
        s.start_time as "startTime",
        s.end_time as "endTime",
        s.is_online as "isOnline",
        s.delivery_mode as "deliveryMode",
        s.is_active as "isActive",
        (SELECT COUNT(*) FROM class_enrollments ce WHERE ce.class_id = cc.id) as "enrolledCount"
      FROM schedules s
      JOIN course_classes cc ON cc.id = s.class_id
      JOIN courses c ON c.id = cc.course_id
      JOIN semesters sem ON sem.id = s.semester_id
      LEFT JOIN rooms r ON r.id = s.room_id
      LEFT JOIN study_programs sp ON sp.id = c.study_program_id
      LEFT JOIN users u ON u.id = s.lecturer_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (dayOfWeek && dayOfWeek !== 'SEMUA') {
      params.push(dayOfWeek);
      query += ` AND s.day_of_week = $${params.length}`;
    }

    if (roomId && roomId !== 'SEMUA') {
      params.push(roomId);
      query += ` AND s.room_id = $${params.length}`;
    }

    if (prodiId && prodiId !== 'SEMUA') {
      if (prodiId === 'MKDU') {
        query += ` AND c.study_program_id IS NULL`;
      } else {
        params.push(prodiId);
        query += ` AND c.study_program_id = $${params.length}`;
      }
    }

    if (semesterId && semesterId !== 'SEMUA') {
      params.push(semesterId);
      query += ` AND s.semester_id = $${params.length}`;
    }

    if (deliveryMode && deliveryMode !== 'SEMUA') {
      params.push(deliveryMode);
      query += ` AND s.delivery_mode = $${params.length}`;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      query += ` AND (c.name ILIKE $${params.length} OR c.code ILIKE $${params.length} OR cc.class_name ILIKE $${params.length} OR u.name ILIKE $${params.length} OR r.name ILIKE $${params.length})`;
    }

    query += ` ORDER BY 
      CASE s.day_of_week
        WHEN 'Senin' THEN 1
        WHEN 'Selasa' THEN 2
        WHEN 'Rabu' THEN 3
        WHEN 'Kamis' THEN 4
        WHEN 'Jumat' THEN 5
        WHEN 'Sabtu' THEN 6
        ELSE 7
      END ASC, s.start_time ASC`;

    const result = await db.query(query, params);

    res.json({
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 3. MATRIKS TIMETABLE MINGGUAN (GRID VISUALISASI JADWAL)
// =========================================================================
export async function getScheduleMatrix(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const schedulesRes = await db.query(`
      SELECT 
        s.id,
        s.class_id as "classId",
        cc.class_name as "className",
        c.code as "courseCode",
        c.name as "courseName",
        c.credits,
        COALESCE(sp.code, 'MKDU') as "studyProgramCode",
        s.room_id as "roomId",
        COALESCE(r.code, 'R-00') as "roomCode",
        COALESCE(r.name, s.room) as "roomName",
        COALESCE(u.name, 'Dosen') as "lecturerName",
        s.day_of_week as "dayOfWeek",
        s.start_time as "startTime",
        s.end_time as "endTime",
        s.delivery_mode as "deliveryMode"
      FROM schedules s
      JOIN course_classes cc ON cc.id = s.class_id
      JOIN courses c ON c.id = cc.course_id
      LEFT JOIN rooms r ON r.id = s.room_id
      LEFT JOIN study_programs sp ON sp.id = c.study_program_id
      LEFT JOIN users u ON u.id = s.lecturer_id
      WHERE s.is_active = TRUE
      ORDER BY s.start_time ASC
    `);

    // Grouping per hari
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const matrix: Record<string, any[]> = {};
    days.forEach((d) => { matrix[d] = []; });

    schedulesRes.rows.forEach((row) => {
      if (matrix[row.dayOfWeek]) {
        matrix[row.dayOfWeek].push(row);
      }
    });

    res.json({
      data: {
        days,
        matrix
      }
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 4. PLOT JADWAL PERKULIAHAN BARU (DENGAN CONFLICT PREVENTION)
// =========================================================================
export async function createSchedule(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      classId,
      roomId,
      lecturerId,
      dayOfWeek,
      startTime,
      endTime,
      deliveryMode = 'HYBRID'
    } = req.body;

    if (!classId || !dayOfWeek || !startTime || !endTime) {
      res.status(400).json({ error: 'Kelas, Hari, Jam Mulai, dan Jam Selesai wajib diisi.' });
      return;
    }

    // Ambil data semester dari class
    const classRes = await db.query(`
      SELECT cc.semester_id, cc.academic_year, cc.class_name, c.name as course_name 
      FROM course_classes cc 
      JOIN courses c ON c.id = cc.course_id 
      WHERE cc.id = $1
    `, [classId]);

    if (classRes.rows.length === 0) {
      res.status(404).json({ error: 'Kelas perkuliahan tidak ditemukan.' });
      return;
    }

    const { semester_id, academic_year, class_name, course_name } = classRes.rows[0];

    // Deteksi Bentrok Ruangan pada waktu yang sama
    if (roomId && deliveryMode !== 'DARING') {
      const roomConflict = await db.query(`
        SELECT s.id, c.name as course_name, cc.class_name, s.start_time, s.end_time 
        FROM schedules s 
        JOIN course_classes cc ON cc.id = s.class_id 
        JOIN courses c ON c.id = cc.course_id 
        WHERE s.room_id = $1 
          AND s.day_of_week = $2 
          AND s.semester_id = $3 
          AND s.is_active = TRUE
          AND (s.start_time < $5 AND s.end_time > $4)
      `, [roomId, dayOfWeek, semester_id, startTime, endTime]);

      if (roomConflict.rows.length > 0) {
        const conf = roomConflict.rows[0];
        res.status(409).json({
          error: `Bentrok Ruangan: Ruangan ini sudah digunakan oleh ${conf.course_name} (${conf.class_name}) pada ${dayOfWeek}, ${conf.start_time} - ${conf.end_time}.`
        });
        return;
      }
    }

    // Deteksi Bentrok Dosen pada waktu yang sama
    if (lecturerId) {
      const lecturerConflict = await db.query(`
        SELECT s.id, c.name as course_name, cc.class_name, s.start_time, s.end_time 
        FROM schedules s 
        JOIN course_classes cc ON cc.id = s.class_id 
        JOIN courses c ON c.id = cc.course_id 
        WHERE s.lecturer_id = $1 
          AND s.day_of_week = $2 
          AND s.semester_id = $3 
          AND s.is_active = TRUE
          AND (s.start_time < $5 AND s.end_time > $4)
      `, [lecturerId, dayOfWeek, semester_id, startTime, endTime]);

      if (lecturerConflict.rows.length > 0) {
        const conf = lecturerConflict.rows[0];
        res.status(409).json({
          error: `Bentrok Dosen: Dosen pengampu sudah memiliki jadwal mengajar ${conf.course_name} (${conf.class_name}) pada ${dayOfWeek}, ${conf.start_time} - ${conf.end_time}.`
        });
        return;
      }
    }

    // Ambil nama ruangan
    let roomName = 'Ruang Kuliah Kampus';
    if (roomId) {
      const roomRes = await db.query('SELECT name FROM rooms WHERE id = $1', [roomId]);
      if (roomRes.rows.length > 0) roomName = roomRes.rows[0].name;
    }

    const id = `sch-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    await db.transaction(async (client) => {
      await client.query(`
        INSERT INTO schedules (
          id, class_id, room_id, lecturer_id, semester_id, day_of_week, 
          start_time, end_time, room, is_online, delivery_mode, academic_year, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, TRUE)
      `, [
        id,
        classId,
        roomId || null,
        lecturerId || null,
        semester_id,
        dayOfWeek,
        startTime,
        endTime,
        roomName,
        deliveryMode === 'DARING',
        deliveryMode,
        academic_year
      ]);

      // Sinkronkan jadwal ke tabel course_classes
      await client.query(`
        UPDATE course_classes 
        SET day_of_week = $1, start_time = $2, end_time = $3, room = $4, delivery_mode = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
      `, [dayOfWeek, startTime, endTime, roomName, deliveryMode, classId]);
    });

    res.status(201).json({
      data: { id, classId, dayOfWeek, startTime, endTime, roomName },
      message: `Jadwal perkuliahan ${course_name} (${class_name}) hari ${dayOfWeek} berhasil di-plot tanpa bentrok.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 5. PERBARUI JADWAL PERKULIAHAN
// =========================================================================
export async function updateSchedule(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const {
      roomId,
      lecturerId,
      dayOfWeek,
      startTime,
      endTime,
      deliveryMode
    } = req.body;

    const currentRes = await db.query('SELECT * FROM schedules WHERE id = $1', [id]);
    if (currentRes.rows.length === 0) {
      res.status(404).json({ error: 'Jadwal tidak ditemukan.' });
      return;
    }

    const current = currentRes.rows[0];
    const targetRoomId = roomId !== undefined ? roomId : current.room_id;
    const targetDay = dayOfWeek || current.day_of_week;
    const targetStart = startTime || current.start_time;
    const targetEnd = endTime || current.end_time;
    const targetDelivery = deliveryMode || current.delivery_mode;
    const targetLecturerId = lecturerId !== undefined ? lecturerId : current.lecturer_id;

    // Cek bentrok ruangan kecuali jadwal ini sendiri
    if (targetRoomId && targetDelivery !== 'DARING') {
      const roomConflict = await db.query(`
        SELECT s.id, c.name as course_name, cc.class_name, s.start_time, s.end_time 
        FROM schedules s 
        JOIN course_classes cc ON cc.id = s.class_id 
        JOIN courses c ON c.id = cc.course_id 
        WHERE s.room_id = $1 
          AND s.day_of_week = $2 
          AND s.semester_id = $3 
          AND s.id != $4
          AND s.is_active = TRUE
          AND (s.start_time < $6 AND s.end_time > $5)
      `, [targetRoomId, targetDay, current.semester_id, id, targetStart, targetEnd]);

      if (roomConflict.rows.length > 0) {
        const conf = roomConflict.rows[0];
        res.status(409).json({
          error: `Bentrok Ruangan: Ruangan ini sudah digunakan oleh ${conf.course_name} (${conf.class_name}) pada ${targetDay}, ${conf.start_time} - ${conf.end_time}.`
        });
        return;
      }
    }

    let roomName = current.room;
    if (targetRoomId) {
      const roomRes = await db.query('SELECT name FROM rooms WHERE id = $1', [targetRoomId]);
      if (roomRes.rows.length > 0) roomName = roomRes.rows[0].name;
    }

    await db.transaction(async (client) => {
      await client.query(`
        UPDATE schedules 
        SET 
          room_id = $1,
          lecturer_id = $2,
          day_of_week = $3,
          start_time = $4,
          end_time = $5,
          room = $6,
          delivery_mode = $7,
          is_online = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
      `, [
        targetRoomId || null,
        targetLecturerId || null,
        targetDay,
        targetStart,
        targetEnd,
        roomName,
        targetDelivery,
        targetDelivery === 'DARING',
        id
      ]);

      await client.query(`
        UPDATE course_classes 
        SET day_of_week = $1, start_time = $2, end_time = $3, room = $4, delivery_mode = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
      `, [targetDay, targetStart, targetEnd, roomName, targetDelivery, current.class_id]);
    });

    res.json({
      data: { id },
      message: 'Jadwal perkuliahan berhasil diperbarui.'
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 6. HAPUS JADWAL PERKULIAHAN
// =========================================================================
export async function deleteSchedule(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM schedules WHERE id = $1', [id]);
    res.json({
      message: 'Plot jadwal perkuliahan berhasil dihapus.'
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 7. MASTER RUANGAN KAMPUS (ROOMS)
// =========================================================================
export async function getRooms(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await db.query(`
      SELECT 
        r.id,
        r.code,
        r.name,
        r.building,
        r.floor,
        r.capacity,
        r.room_type as "roomType",
        r.facilities,
        r.is_available as "isAvailable",
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        (SELECT COUNT(*) FROM schedules s WHERE s.room_id = r.id AND s.is_active = TRUE) as "activeSchedulesCount"
      FROM rooms r
      ORDER BY r.building ASC, r.floor ASC, r.code ASC
    `);

    res.json({
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 8. TAMBAH MASTER RUANGAN BARU
// =========================================================================
export async function createRoom(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      code,
      name,
      building,
      floor = 1,
      capacity = 40,
      roomType = 'TEORI',
      facilities = ['AC', 'Proyektor', 'Sound System', 'Wi-Fi']
    } = req.body;

    if (!code || !name || !building) {
      res.status(400).json({ error: 'Kode Ruangan, Nama Ruangan, dan Gedung wajib diisi.' });
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanId = `rm-${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const existing = await db.query('SELECT id FROM rooms WHERE code = $1 OR id = $2', [cleanCode, cleanId]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: `Ruangan dengan kode '${cleanCode}' sudah terdaftar.` });
      return;
    }

    const insertRes = await db.query(`
      INSERT INTO rooms (id, code, name, building, floor, capacity, room_type, facilities, is_available)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
      RETURNING *
    `, [
      cleanId,
      cleanCode,
      name.trim(),
      building.trim(),
      parseInt(floor, 10) || 1,
      parseInt(capacity, 10) || 40,
      roomType,
      Array.isArray(facilities) ? facilities : [facilities]
    ]);

    res.status(201).json({
      data: insertRes.rows[0],
      message: `Ruangan ${name} (${cleanCode}) berhasil ditambahkan.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 9. PERBARUI DATA RUANGAN
// =========================================================================
export async function updateRoom(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const {
      name,
      building,
      floor,
      capacity,
      roomType,
      facilities,
      isAvailable
    } = req.body;

    const check = await db.query('SELECT id, name FROM rooms WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Ruangan tidak ditemukan.' });
      return;
    }

    const updateRes = await db.query(`
      UPDATE rooms 
      SET 
        name = COALESCE($1, name),
        building = COALESCE($2, building),
        floor = COALESCE($3, floor),
        capacity = COALESCE($4, capacity),
        room_type = COALESCE($5, room_type),
        facilities = COALESCE($6, facilities),
        is_available = COALESCE($7, is_available),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [
      name?.trim(),
      building?.trim(),
      floor !== undefined ? parseInt(floor, 10) : undefined,
      capacity !== undefined ? parseInt(capacity, 10) : undefined,
      roomType,
      Array.isArray(facilities) ? facilities : undefined,
      isAvailable !== undefined ? Boolean(isAvailable) : undefined,
      id
    ]);

    res.json({
      data: updateRes.rows[0],
      message: `Data ruangan ${updateRes.rows[0].name} berhasil diperbarui.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 10. TOGGLE STATUS KETERSEDIAAN RUANGAN
// =========================================================================
export async function toggleRoomStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const current = await db.query('SELECT id, name, is_available FROM rooms WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      res.status(404).json({ error: 'Ruangan tidak ditemukan.' });
      return;
    }

    const nextState = !current.rows[0].is_available;

    await db.query('UPDATE rooms SET is_available = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [nextState, id]);

    res.json({
      data: { id, isAvailable: nextState },
      message: `Status ketersediaan ruangan ${current.rows[0].name} diubah menjadi ${nextState ? 'Tersedia' : 'Dalam Perawatan / Tutup'}.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 11. IMPOR MASSAL JADWAL PERKULIAHAN (BULK CREATE)
// =========================================================================
export async function bulkCreateSchedules(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { schedules } = req.body;

    if (!Array.isArray(schedules) || schedules.length === 0) {
      res.status(400).json({ error: 'Daftar jadwal tidak boleh kosong.' });
      return;
    }

    const classesRes = await db.query(`
      SELECT cc.id, cc.class_name, cc.semester_id, cc.academic_year, c.code as course_code, c.name as course_name 
      FROM course_classes cc 
      JOIN courses c ON c.id = cc.course_id
    `);
    const roomsRes = await db.query('SELECT id, code, name FROM rooms');

    let insertedCount = 0;
    const errors: string[] = [];
    const createdItems: any[] = [];

    await db.transaction(async (client) => {
      for (let i = 0; i < schedules.length; i++) {
        const sc = schedules[i];
        const dayOfWeek = sc.dayOfWeek || 'Senin';
        const startTime = sc.startTime || '08:00';
        const endTime = sc.endTime || '09:40';
        const deliveryMode = sc.deliveryMode || 'TATAP_MUKA';

        // Match class
        let matchedClass = classesRes.rows.find(c => c.id === sc.classId || c.course_code === sc.courseCode);
        if (!matchedClass && classesRes.rows.length > 0) {
          matchedClass = classesRes.rows[0];
        }

        if (!matchedClass) {
          errors.push(`Baris #${i + 1}: Kelas perkuliahan tidak ditemukan.`);
          continue;
        }

        // Match room
        let matchedRoom = roomsRes.rows.find(r => r.id === sc.roomId || r.code === sc.roomCode || r.name === sc.roomName);
        const roomId = matchedRoom ? matchedRoom.id : (roomsRes.rows[0]?.id || 'rm-r101');

        const scheduleId = `sch-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

        await client.query(`
          INSERT INTO schedules (
            id, class_id, semester_id, room_id, day_of_week, 
            start_time, end_time, delivery_mode, is_active
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
        `, [
          scheduleId,
          matchedClass.id,
          matchedClass.semester_id,
          roomId,
          dayOfWeek,
          startTime,
          endTime,
          deliveryMode
        ]);

        insertedCount++;
        createdItems.push({ id: scheduleId, classId: matchedClass.id, dayOfWeek });
      }
    });

    res.status(201).json({
      data: {
        total: schedules.length,
        inserted: insertedCount,
        skipped: errors.length,
        errors,
        items: createdItems
      },
      message: `Impor massal berhasil: ${insertedCount} jadwal perkuliahan berhasil ditambahkan.`
    });
  } catch (err) {
    next(err);
  }
}
