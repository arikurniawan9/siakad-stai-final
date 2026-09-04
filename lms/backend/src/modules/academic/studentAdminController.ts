import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../../db/pool.js';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';

// =========================================================================
// 1. STATISTIK RINGKASAN DATA MAHASISWA
// =========================================================================
export async function getStudentsSummary(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const totalStudentsRes = await db.query('SELECT COUNT(*) as count FROM student_profiles');
    const statusBreakdownRes = await db.query(`
      SELECT 
        academic_status as "status", 
        COUNT(*) as count 
      FROM student_profiles 
      GROUP BY academic_status
    `);
    const gpaRes = await db.query('SELECT COALESCE(AVG(gpa), 0.00) as "avgGPA" FROM student_profiles WHERE academic_status = \'AKTIF\'');
    const prodiBreakdownRes = await db.query(`
      SELECT 
        COALESCE(pr.name, 'Belum Ditentukan') as "prodiName", 
        COALESCE(pr.code, 'N/A') as "prodiCode",
        COUNT(sp.id) as count 
      FROM student_profiles sp 
      LEFT JOIN study_programs pr ON pr.id = sp.study_program_id 
      GROUP BY pr.name, pr.code 
      ORDER BY count DESC
    `);
    const yearBreakdownRes = await db.query(`
      SELECT 
        entry_year as "entryYear", 
        COUNT(*) as count 
      FROM student_profiles 
      GROUP BY entry_year 
      ORDER BY entry_year DESC
    `);

    let activeCount = 0;
    let leaveCount = 0;
    let gradCount = 0;

    statusBreakdownRes.rows.forEach((r) => {
      if (r.status === 'AKTIF') activeCount = parseInt(r.count, 10);
      if (r.status === 'CUTI') leaveCount = parseInt(r.count, 10);
      if (r.status === 'LULUS') gradCount = parseInt(r.count, 10);
    });

    res.json({
      data: {
        totalStudents: parseInt(totalStudentsRes.rows[0]?.count || '0', 10),
        totalActiveStudents: activeCount,
        totalOnLeave: leaveCount,
        totalGraduated: gradCount,
        averageGPA: parseFloat(parseFloat(gpaRes.rows[0]?.avgGPA || '0').toFixed(2)),
        prodiBreakdown: prodiBreakdownRes.rows,
        entryYearBreakdown: yearBreakdownRes.rows
      }
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 2. DAFTAR MAHASISWA LENGKAP (DENGAN FILTER & SEARCH)
// =========================================================================
export async function getStudents(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { prodiId, entryYear, currentSemester, academicStatus, advisorId, gender, search } = req.query;

    let query = `
      SELECT 
        sp.id as "profileId",
        u.id as "userId",
        sp.nim,
        u.name,
        u.username,
        u.email,
        u.is_active as "isUserActive",
        sp.study_program_id as "studyProgramId",
        COALESCE(pr.name, 'Belum Ditentukan') as "studyProgramName",
        COALESCE(pr.code, '-') as "studyProgramCode",
        sp.academic_advisor_id as "academicAdvisorId",
        COALESCE(adv.name, 'Belum Ditugaskan') as "advisorName",
        COALESCE(adv.identity_number, '') as "advisorNidn",
        sp.entry_year as "entryYear",
        sp.entry_semester as "entrySemester",
        sp.current_semester as "currentSemester",
        sp.academic_status as "academicStatus",
        sp.gpa,
        sp.total_credits_earned as "totalCreditsEarned",
        sp.gender,
        sp.birth_place as "birthPlace",
        sp.birth_date as "birthDate",
        sp.phone_number as "phoneNumber",
        sp.address,
        sp.guardian_name as "guardianName",
        sp.created_at as "createdAt",
        (SELECT COUNT(*) FROM class_enrollments ce WHERE ce.student_id = u.id) as "enrolledClassesCount"
      FROM student_profiles sp
      JOIN users u ON u.id = sp.user_id
      LEFT JOIN study_programs pr ON pr.id = sp.study_program_id
      LEFT JOIN users adv ON adv.id = sp.academic_advisor_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (prodiId && prodiId !== 'SEMUA') {
      params.push(prodiId);
      query += ` AND sp.study_program_id = $${params.length}`;
    }

    if (entryYear && entryYear !== 'SEMUA') {
      params.push(parseInt(entryYear as string, 10));
      query += ` AND sp.entry_year = $${params.length}`;
    }

    if (currentSemester && currentSemester !== 'SEMUA') {
      params.push(parseInt(currentSemester as string, 10));
      query += ` AND sp.current_semester = $${params.length}`;
    }

    if (academicStatus && academicStatus !== 'SEMUA') {
      params.push(academicStatus);
      query += ` AND sp.academic_status = $${params.length}`;
    }

    if (advisorId && advisorId !== 'SEMUA') {
      params.push(advisorId);
      query += ` AND sp.academic_advisor_id = $${params.length}`;
    }

    if (gender && gender !== 'SEMUA') {
      params.push(gender);
      query += ` AND sp.gender = $${params.length}`;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      query += ` AND (sp.nim ILIKE $${params.length} OR u.name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR pr.name ILIKE $${params.length})`;
    }

    query += ` ORDER BY sp.entry_year DESC, sp.nim ASC`;

    const result = await db.query(query, params);

    res.json({
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 3. DETAIL LENGKAP MAHASISWA & RIWAYAT PERKULIAHAN
// =========================================================================
export async function getStudentById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const studentRes = await db.query(`
      SELECT 
        sp.id as "profileId",
        u.id as "userId",
        sp.nim,
        u.name,
        u.username,
        u.email,
        u.is_active as "isUserActive",
        sp.study_program_id as "studyProgramId",
        COALESCE(pr.name, 'Belum Ditentukan') as "studyProgramName",
        COALESCE(pr.code, '-') as "studyProgramCode",
        sp.academic_advisor_id as "academicAdvisorId",
        COALESCE(adv.name, 'Belum Ditugaskan') as "advisorName",
        COALESCE(adv.identity_number, '') as "advisorNidn",
        sp.entry_year as "entryYear",
        sp.entry_semester as "entrySemester",
        sp.current_semester as "currentSemester",
        sp.academic_status as "academicStatus",
        sp.gpa,
        sp.total_credits_earned as "totalCreditsEarned",
        sp.gender,
        sp.birth_place as "birthPlace",
        sp.birth_date as "birthDate",
        sp.phone_number as "phoneNumber",
        sp.address,
        sp.guardian_name as "guardianName",
        sp.created_at as "createdAt",
        sp.updated_at as "updatedAt"
      FROM student_profiles sp
      JOIN users u ON u.id = sp.user_id
      LEFT JOIN study_programs pr ON pr.id = sp.study_program_id
      LEFT JOIN users adv ON adv.id = sp.academic_advisor_id
      WHERE sp.id = $1 OR sp.user_id = $1 OR sp.nim = $1
    `, [id]);

    if (studentRes.rows.length === 0) {
      res.status(404).json({ error: 'Data mahasiswa tidak ditemukan.' });
      return;
    }

    const student = studentRes.rows[0];

    // Riwayat kelas yang diambil
    const enrollmentsRes = await db.query(`
      SELECT 
        ce.id as "enrollmentId",
        cc.class_name as "className",
        cc.academic_year as "academicYear",
        c.code as "courseCode",
        c.name as "courseName",
        c.credits,
        ce.status,
        ce.enrolled_at as "enrolledAt"
      FROM class_enrollments ce
      JOIN course_classes cc ON cc.id = ce.class_id
      JOIN courses c ON c.id = cc.course_id
      WHERE ce.student_id = $1
      ORDER BY ce.enrolled_at DESC
    `, [student.userId]);

    res.json({
      data: {
        ...student,
        enrolledClasses: enrollmentsRes.rows
      }
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 4. REGISTRASI MAHASISWA BARU (USER + PROFILE)
// =========================================================================
export async function createStudent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      nim,
      name,
      email,
      username,
      password = 'salam2026!',
      studyProgramId,
      academicAdvisorId,
      entryYear = new Date().getFullYear(),
      entrySemester = 'Ganjil',
      currentSemester = 1,
      gender = 'Laki-laki',
      birthPlace = 'Cianjur',
      birthDate = '2005-01-01',
      phoneNumber,
      address,
      guardianName
    } = req.body;

    if (!nim || !name || !email) {
      res.status(400).json({ error: 'NIM, Nama Lengkap, dan Email resmi mahasiswa wajib diisi.' });
      return;
    }

    const cleanNim = nim.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (username || cleanNim.replace(/[^a-zA-Z0-9]/g, '')).toLowerCase();

    // Cek duplikasi NIM, Email, Username
    const existing = await db.query(`
      SELECT u.id FROM users u 
      LEFT JOIN student_profiles sp ON sp.user_id = u.id 
      WHERE u.email = $1 OR u.username = $2 OR sp.nim = $3
    `, [cleanEmail, cleanUsername, cleanNim]);

    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'NIM, Username, atau Email sudah terdaftar pada sistem.' });
      return;
    }

    const userId = `usr-mhs-${Date.now().toString(36)}`;
    const profileId = `prof-${userId}`;
    const passwordHash = await bcrypt.hash(password, 10);

    // Ambil nama program studi
    let prodiName = 'Pendidikan Agama Islam';
    if (studyProgramId) {
      const pRes = await db.query('SELECT name FROM study_programs WHERE id = $1', [studyProgramId]);
      if (pRes.rows.length > 0) prodiName = pRes.rows[0].name;
    }

    await db.transaction(async (client) => {
      // 1. Buat User Row
      await client.query(`
        INSERT INTO users (
          id, username, password_hash, name, identity_number, email, role, study_program, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'mahasiswa', $7, TRUE)
      `, [
        userId,
        cleanUsername,
        passwordHash,
        name.trim(),
        cleanNim,
        cleanEmail,
        prodiName
      ]);

      // 2. Buat Student Profile Row
      await client.query(`
        INSERT INTO student_profiles (
          id, user_id, nim, study_program_id, academic_advisor_id, entry_year, 
          entry_semester, current_semester, academic_status, gpa, total_credits_earned, 
          gender, birth_place, birth_date, phone_number, address, guardian_name
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'AKTIF', 0.00, 0, $9, $10, $11, $12, $13, $14)
      `, [
        profileId,
        userId,
        cleanNim,
        studyProgramId || null,
        academicAdvisorId || null,
        parseInt(entryYear, 10) || 2024,
        entrySemester,
        parseInt(currentSemester, 10) || 1,
        gender,
        birthPlace,
        birthDate,
        phoneNumber || null,
        address || null,
        guardianName || null
      ]);
    });

    res.status(201).json({
      data: { userId, profileId, nim: cleanNim, name },
      message: `Mahasiswa ${name} (${cleanNim}) berhasil didaftarkan.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 5. PERBARUI DATA MAHASISWA
// =========================================================================
export async function updateStudent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      studyProgramId,
      academicAdvisorId,
      entryYear,
      currentSemester,
      academicStatus,
      gpa,
      totalCreditsEarned,
      gender,
      birthPlace,
      birthDate,
      phoneNumber,
      address,
      guardianName,
      isUserActive
    } = req.body;

    const currentRes = await db.query(`
      SELECT sp.id, sp.user_id, u.name 
      FROM student_profiles sp 
      JOIN users u ON u.id = sp.user_id 
      WHERE sp.id = $1 OR sp.user_id = $1
    `, [id]);

    if (currentRes.rows.length === 0) {
      res.status(404).json({ error: 'Data mahasiswa tidak ditemukan.' });
      return;
    }

    const { user_id, id: profile_id } = currentRes.rows[0];

    await db.transaction(async (client) => {
      // 1. Update Users Table
      if (name || email || isUserActive !== undefined) {
        await client.query(`
          UPDATE users 
          SET 
            name = COALESCE($1, name),
            email = COALESCE($2, email),
            is_active = COALESCE($3, is_active),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $4
        `, [
          name?.trim(),
          email?.trim().toLowerCase(),
          isUserActive !== undefined ? Boolean(isUserActive) : undefined,
          user_id
        ]);
      }

      // 2. Update Student Profile Table
      await client.query(`
        UPDATE student_profiles
        SET 
          study_program_id = $1,
          academic_advisor_id = $2,
          entry_year = COALESCE($3, entry_year),
          current_semester = COALESCE($4, current_semester),
          academic_status = COALESCE($5, academic_status),
          gpa = COALESCE($6, gpa),
          total_credits_earned = COALESCE($7, total_credits_earned),
          gender = COALESCE($8, gender),
          birth_place = COALESCE($9, birth_place),
          birth_date = COALESCE($10, birth_date),
          phone_number = COALESCE($11, phone_number),
          address = COALESCE($12, address),
          guardian_name = COALESCE($13, guardian_name),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $14
      `, [
        studyProgramId || null,
        academicAdvisorId || null,
        entryYear !== undefined ? parseInt(entryYear, 10) : undefined,
        currentSemester !== undefined ? parseInt(currentSemester, 10) : undefined,
        academicStatus,
        gpa !== undefined ? parseFloat(gpa) : undefined,
        totalCreditsEarned !== undefined ? parseInt(totalCreditsEarned, 10) : undefined,
        gender,
        birthPlace,
        birthDate,
        phoneNumber,
        address,
        guardianName,
        profile_id
      ]);
    });

    res.json({
      data: { profileId: profile_id },
      message: 'Data mahasiswa berhasil diperbarui.'
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 6. UBAH STATUS AKADEMIK MAHASISWA
// =========================================================================
export async function updateStudentStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'AKTIF', 'CUTI', 'LULUS', 'DROP_OUT', 'NONAKTIF'

    if (!status) {
      res.status(400).json({ error: 'Status akademik baru wajib disertakan.' });
      return;
    }

    const current = await db.query(`
      SELECT sp.id, sp.user_id, u.name 
      FROM student_profiles sp 
      JOIN users u ON u.id = sp.user_id 
      WHERE sp.id = $1 OR sp.user_id = $1
    `, [id]);

    if (current.rows.length === 0) {
      res.status(404).json({ error: 'Data mahasiswa tidak ditemukan.' });
      return;
    }

    const { id: profile_id, user_id, name } = current.rows[0];

    await db.transaction(async (client) => {
      await client.query(`
        UPDATE student_profiles 
        SET academic_status = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
      `, [status, profile_id]);

      if (status === 'NONAKTIF' || status === 'DROP_OUT') {
        await client.query('UPDATE users SET is_active = FALSE WHERE id = $1', [user_id]);
      } else if (status === 'AKTIF') {
        await client.query('UPDATE users SET is_active = TRUE WHERE id = $1', [user_id]);
      }
    });

    res.json({
      data: { profileId: profile_id, status },
      message: `Status akademik mahasiswa ${name} berhasil diubah menjadi ${status}.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 7. RESET KATA SANDI MAHASISWA
// =========================================================================
export async function resetStudentPassword(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const defaultPassword = 'salam2026!';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const userRes = await db.query(`
      SELECT u.id, u.name, u.username 
      FROM users u 
      LEFT JOIN student_profiles sp ON sp.user_id = u.id 
      WHERE u.id = $1 OR sp.id = $1 OR sp.nim = $1
    `, [id]);

    if (userRes.rows.length === 0) {
      res.status(404).json({ error: 'Mahasiswa tidak ditemukan.' });
      return;
    }

    const { id: user_id, name } = userRes.rows[0];

    await db.query(`
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [passwordHash, user_id]);

    res.json({
      message: `Kata sandi akun mahasiswa ${name} berhasil di-reset menjadi default '${defaultPassword}'.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 8. HAPUS / NONAKTIFKAN MAHASISWA
// =========================================================================
export async function deleteStudent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const current = await db.query(`
      SELECT sp.id, sp.user_id, u.name 
      FROM student_profiles sp 
      JOIN users u ON u.id = sp.user_id 
      WHERE sp.id = $1 OR sp.user_id = $1
    `, [id]);

    if (current.rows.length === 0) {
      res.status(404).json({ error: 'Mahasiswa tidak ditemukan.' });
      return;
    }

    const { user_id, id: profile_id, name } = current.rows[0];

    await db.transaction(async (client) => {
      // Bersihkan seluruh relasi mahasiswa sesuai skema database
      await client.query('DELETE FROM course_grades WHERE student_id = $1', [user_id]);
      await client.query('DELETE FROM class_enrollments WHERE student_id = $1', [user_id]);
      await client.query('DELETE FROM student_activity_progress WHERE student_id = $1', [user_id]);
      await client.query('DELETE FROM student_video_progress WHERE student_id = $1', [user_id]);
      await client.query('DELETE FROM material_access_logs WHERE student_id = $1', [user_id]);
      await client.query('DELETE FROM assignment_submissions WHERE student_id = $1', [user_id]);
      await client.query('DELETE FROM quiz_attempts WHERE student_id = $1', [user_id]);
      await client.query('DELETE FROM discussion_posts WHERE author_id = $1', [user_id]);
      await client.query('DELETE FROM discussion_threads WHERE author_id = $1', [user_id]);
      await client.query('DELETE FROM notifications WHERE user_id = $1', [user_id]);
      await client.query('DELETE FROM student_profiles WHERE id = $1 OR user_id = $2', [profile_id, user_id]);
      await client.query('DELETE FROM users WHERE id = $1', [user_id]);
    });

    res.json({
      message: `Data mahasiswa ${name} berhasil dihapus dari sistem.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 9. IMPOR MASSAL DATA MAHASISWA (BULK CREATE)
// =========================================================================
export async function bulkCreateStudents(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      res.status(400).json({ error: 'Daftar data mahasiswa tidak boleh kosong.' });
      return;
    }

    // Ambil daftar prodi untuk mapping
    const prodiRes = await db.query('SELECT id, code, name FROM study_programs');
    const prodis = prodiRes.rows;

    let insertedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];
    const createdItems: any[] = [];

    await db.transaction(async (client) => {
      for (let i = 0; i < students.length; i++) {
        const s = students[i];
        if (!s.nim || !s.name || !s.email) {
          errors.push(`Baris #${i + 1}: NIM, Nama, dan Email wajib diisi.`);
          continue;
        }

        const cleanNim = String(s.nim).trim();
        const cleanName = String(s.name).trim();
        const cleanEmail = String(s.email).trim().toLowerCase();
        const cleanUsername = (s.username || cleanNim.replace(/[^a-zA-Z0-9]/g, '')).toLowerCase();

        // Cari prodi id & nama
        let matchedProdi = prodis.find(p => p.id === s.studyProgramId || p.code?.toLowerCase() === String(s.studyProgramId).toLowerCase());
        if (!matchedProdi) {
          const prodiQuery = String(s.studyProgramId || s.studyProgramName || '').toLowerCase();
          matchedProdi = prodis.find(p => p.name?.toLowerCase().includes(prodiQuery) || p.code?.toLowerCase().includes(prodiQuery));
        }
        const studyProgramId = matchedProdi ? matchedProdi.id : (prodis[0]?.id || 'prodi-pai');
        const studyProgramName = matchedProdi ? matchedProdi.name : (prodis[0]?.name || 'Pendidikan Agama Islam');

        // Cek apakah mahasiswa/user sudah ada
        const existing = await client.query(`
          SELECT u.id as user_id, sp.id as profile_id 
          FROM users u
          LEFT JOIN student_profiles sp ON sp.user_id = u.id
          WHERE u.email = $1 OR u.username = $2 OR sp.nim = $3
        `, [cleanEmail, cleanUsername, cleanNim]);

        const password = s.password || 'salam2026!';
        const passwordHash = await bcrypt.hash(password, 10);

        if (existing.rows.length > 0) {
          // Update existing
          const userId = existing.rows[0].user_id;
          const profileId = existing.rows[0].profile_id;

          await client.query(`
            UPDATE users
            SET name = $1, email = $2, study_program = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
          `, [cleanName, cleanEmail, studyProgramName, userId]);

          if (profileId) {
            await client.query(`
              UPDATE student_profiles
              SET 
                nim = $1,
                study_program_id = $2,
                entry_year = COALESCE($3, entry_year),
                entry_semester = COALESCE($4, entry_semester),
                current_semester = COALESCE($5, current_semester),
                gender = COALESCE($6, gender),
                birth_place = COALESCE($7, birth_place),
                birth_date = COALESCE($8, birth_date),
                phone_number = COALESCE($9, phone_number),
                address = COALESCE($10, address),
                guardian_name = COALESCE($11, guardian_name),
                updated_at = CURRENT_TIMESTAMP
              WHERE id = $12
            `, [
              cleanNim,
              studyProgramId,
              parseInt(s.entryYear, 10) || 2024,
              s.entrySemester || 'Ganjil',
              parseInt(s.currentSemester, 10) || 1,
              s.gender || 'Laki-laki',
              s.birthPlace || 'Cianjur',
              s.birthDate || '2005-01-01',
              s.phoneNumber || null,
              s.address || null,
              s.guardianName || null,
              profileId
            ]);
          }
          updatedCount++;
          createdItems.push({ userId, profileId, nim: cleanNim, name: cleanName });
        } else {
          // Insert new user & profile
          const userId = `usr-mhs-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
          const profileId = `prof-${userId}`;

          await client.query(`
            INSERT INTO users (
              id, username, password_hash, name, identity_number, email, role, study_program, is_active
            )
            VALUES ($1, $2, $3, $4, $5, $6, 'mahasiswa', $7, TRUE)
          `, [
            userId,
            cleanUsername,
            passwordHash,
            cleanName,
            cleanNim,
            cleanEmail,
            studyProgramName
          ]);

          await client.query(`
            INSERT INTO student_profiles (
              id, user_id, nim, study_program_id, academic_advisor_id, entry_year, 
              entry_semester, current_semester, academic_status, gpa, total_credits_earned, 
              gender, birth_place, birth_date, phone_number, address, guardian_name
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'AKTIF', 0.00, 0, $9, $10, $11, $12, $13, $14)
          `, [
            profileId,
            userId,
            cleanNim,
            studyProgramId,
            s.academicAdvisorId || null,
            parseInt(s.entryYear, 10) || 2024,
            s.entrySemester || 'Ganjil',
            parseInt(s.currentSemester, 10) || 1,
            s.gender || 'Laki-laki',
            s.birthPlace || 'Cianjur',
            s.birthDate || '2005-01-01',
            s.phoneNumber || null,
            s.address || null,
            s.guardianName || null
          ]);

          insertedCount++;
          createdItems.push({ userId, profileId, nim: cleanNim, name: cleanName });
        }
      }
    });

    res.status(201).json({
      data: {
        total: students.length,
        inserted: insertedCount,
        updated: updatedCount,
        skipped: errors.length,
        errors,
        items: createdItems
      },
      message: `Impor massal berhasil: ${insertedCount} baru ditambahkan, ${updatedCount} diperbarui.`
    });
  } catch (err) {
    next(err);
  }
}
