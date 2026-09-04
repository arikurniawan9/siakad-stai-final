import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../../db/pool.js';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';

// =========================================================================
// 1. STATISTIK RINGKASAN DATA DOSEN
// =========================================================================
export async function getLecturersSummary(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const totalLecturersRes = await db.query('SELECT COUNT(*) as count FROM lecturer_profiles');
    const totalPermanentRes = await db.query('SELECT COUNT(*) as count FROM lecturer_profiles WHERE employment_status = \'TETAP\'');
    const totalAdvisorsRes = await db.query('SELECT COUNT(*) as count FROM lecturer_profiles WHERE is_academic_advisor = TRUE');
    const totalDoctoratesRes = await db.query('SELECT COUNT(*) as count FROM lecturer_profiles WHERE highest_education = \'S3\'');

    const rankBreakdownRes = await db.query(`
      SELECT 
        academic_rank as "rank", 
        COUNT(*) as count 
      FROM lecturer_profiles 
      GROUP BY academic_rank 
      ORDER BY count DESC
    `);

    const prodiBreakdownRes = await db.query(`
      SELECT 
        COALESCE(pr.name, 'Belum Ditentukan') as "prodiName", 
        COALESCE(pr.code, '-') as "prodiCode",
        COUNT(lp.id) as count 
      FROM lecturer_profiles lp 
      LEFT JOIN study_programs pr ON pr.id = lp.homebase_prodi_id 
      GROUP BY pr.name, pr.code 
      ORDER BY count DESC
    `);

    res.json({
      data: {
        totalLecturers: parseInt(totalLecturersRes.rows[0]?.count || '0', 10),
        totalPermanent: parseInt(totalPermanentRes.rows[0]?.count || '0', 10),
        totalAdvisors: parseInt(totalAdvisorsRes.rows[0]?.count || '0', 10),
        totalDoctorates: parseInt(totalDoctoratesRes.rows[0]?.count || '0', 10),
        rankBreakdown: rankBreakdownRes.rows,
        prodiBreakdown: prodiBreakdownRes.rows
      }
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 2. DAFTAR DOSEN LENGKAP (DENGAN FILTER & SEARCH)
// =========================================================================
export async function getLecturers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { homebaseProdiId, academicRank, highestEducation, isAdvisor, employmentStatus, search } = req.query;

    let query = `
      SELECT 
        lp.id as "profileId",
        u.id as "userId",
        lp.nidn,
        lp.nuptk,
        lp.title_prefix as "titlePrefix",
        lp.title_suffix as "titleSuffix",
        u.name,
        u.username,
        u.email,
        u.role,
        u.is_active as "isUserActive",
        lp.academic_rank as "academicRank",
        lp.highest_education as "highestEducation",
        lp.employment_status as "employmentStatus",
        lp.homebase_prodi_id as "homebaseProdiId",
        COALESCE(pr.name, 'Belum Ditentukan') as "homebaseProdiName",
        COALESCE(pr.code, '-') as "homebaseProdiCode",
        lp.is_academic_advisor as "isAcademicAdvisor",
        lp.max_advisory_quota as "maxAdvisoryQuota",
        lp.specialization,
        lp.phone_number as "phoneNumber",
        lp.address,
        lp.created_at as "createdAt",
        (
          SELECT COUNT(DISTINCT cl.class_id) 
          FROM class_lecturers cl 
          WHERE cl.lecturer_id = u.id
        ) as "teachingClassesCount",
        (
          SELECT COALESCE(SUM(c.credits), 0)
          FROM class_lecturers cl
          JOIN course_classes cc ON cc.id = cl.class_id
          JOIN courses c ON c.id = cc.course_id
          WHERE cl.lecturer_id = u.id
        ) as "teachingCredits",
        (
          SELECT COUNT(*) 
          FROM student_profiles sp 
          WHERE sp.academic_advisor_id = u.id
        ) as "adviseesCount"
      FROM lecturer_profiles lp
      JOIN users u ON u.id = lp.user_id
      LEFT JOIN study_programs pr ON pr.id = lp.homebase_prodi_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (homebaseProdiId && homebaseProdiId !== 'SEMUA') {
      params.push(homebaseProdiId);
      query += ` AND lp.homebase_prodi_id = $${params.length}`;
    }

    if (academicRank && academicRank !== 'SEMUA') {
      params.push(academicRank);
      query += ` AND lp.academic_rank = $${params.length}`;
    }

    if (highestEducation && highestEducation !== 'SEMUA') {
      params.push(highestEducation);
      query += ` AND lp.highest_education = $${params.length}`;
    }

    if (isAdvisor !== undefined && isAdvisor !== 'SEMUA') {
      params.push(isAdvisor === 'true' || isAdvisor === '1');
      query += ` AND lp.is_academic_advisor = $${params.length}`;
    }

    if (employmentStatus && employmentStatus !== 'SEMUA') {
      params.push(employmentStatus);
      query += ` AND lp.employment_status = $${params.length}`;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      query += ` AND (lp.nidn ILIKE $${params.length} OR u.name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR lp.specialization ILIKE $${params.length})`;
    }

    query += ` ORDER BY lp.academic_rank DESC, u.name ASC`;

    const result = await db.query(query, params);

    res.json({
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 3. DETAIL LENGKAP DOSEN, KELAS AMPUAN & MAHASISWA BIMBINGAN PA
// =========================================================================
export async function getLecturerById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const lecturerRes = await db.query(`
      SELECT 
        lp.id as "profileId",
        u.id as "userId",
        lp.nidn,
        lp.nuptk,
        lp.title_prefix as "titlePrefix",
        lp.title_suffix as "titleSuffix",
        u.name,
        u.username,
        u.email,
        u.role,
        u.is_active as "isUserActive",
        lp.academic_rank as "academicRank",
        lp.highest_education as "highestEducation",
        lp.employment_status as "employmentStatus",
        lp.homebase_prodi_id as "homebaseProdiId",
        COALESCE(pr.name, 'Belum Ditentukan') as "homebaseProdiName",
        COALESCE(pr.code, '-') as "homebaseProdiCode",
        lp.is_academic_advisor as "isAcademicAdvisor",
        lp.max_advisory_quota as "maxAdvisoryQuota",
        lp.specialization,
        lp.phone_number as "phoneNumber",
        lp.address,
        lp.created_at as "createdAt",
        lp.updated_at as "updatedAt"
      FROM lecturer_profiles lp
      JOIN users u ON u.id = lp.user_id
      LEFT JOIN study_programs pr ON pr.id = lp.homebase_prodi_id
      WHERE lp.id = $1 OR lp.user_id = $1 OR lp.nidn = $1
    `, [id]);

    if (lecturerRes.rows.length === 0) {
      res.status(404).json({ error: 'Data dosen tidak ditemukan.' });
      return;
    }

    const lecturer = lecturerRes.rows[0];

    // Kelas yang diampu
    const teachingClassesRes = await db.query(`
      SELECT 
        cc.id as "classId",
        cc.class_name as "className",
        cc.academic_year as "academicYear",
        c.code as "courseCode",
        c.name as "courseName",
        c.credits,
        s.day_of_week as "dayOfWeek",
        s.start_time as "startTime",
        s.end_time as "endTime",
        r.name as "roomName",
        (SELECT COUNT(*) FROM class_enrollments ce WHERE ce.class_id = cc.id) as "enrolledStudentsCount"
      FROM class_lecturers cl
      JOIN course_classes cc ON cc.id = cl.class_id
      JOIN courses c ON c.id = cc.course_id
      LEFT JOIN schedules s ON s.class_id = cc.id
      LEFT JOIN rooms r ON r.id = s.room_id
      WHERE cl.lecturer_id = $1
      ORDER BY c.code ASC
    `, [lecturer.userId]);

    // Mahasiswa Bimbingan PA
    const adviseesRes = await db.query(`
      SELECT 
        sp.id as "profileId",
        sp.nim,
        u.name,
        u.email,
        COALESCE(pr.code, '-') as "studyProgramCode",
        sp.entry_year as "entryYear",
        sp.current_semester as "currentSemester",
        sp.academic_status as "academicStatus",
        sp.gpa,
        sp.total_credits_earned as "totalCreditsEarned"
      FROM student_profiles sp
      JOIN users u ON u.id = sp.user_id
      LEFT JOIN study_programs pr ON pr.id = sp.study_program_id
      WHERE sp.academic_advisor_id = $1
      ORDER BY sp.entry_year DESC, sp.nim ASC
    `, [lecturer.userId]);

    res.json({
      data: {
        ...lecturer,
        teachingClasses: teachingClassesRes.rows,
        advisees: adviseesRes.rows
      }
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 4. REGISTRASI DOSEN BARU (USER + LECTURER PROFILE)
// =========================================================================
export async function createLecturer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      nidn,
      nuptk,
      titlePrefix,
      titleSuffix,
      name,
      email,
      username,
      password = 'salam2026!',
      role = 'dosen', // 'dosen', 'dosen_pa', 'kaprodi'
      academicRank = 'Lektor',
      highestEducation = 'S2',
      employmentStatus = 'TETAP',
      homebaseProdiId,
      isAcademicAdvisor = true,
      maxAdvisoryQuota = 30,
      specialization,
      phoneNumber,
      address
    } = req.body;

    if (!nidn || !name || !email) {
      res.status(400).json({ error: 'NIDN, Nama Lengkap, dan Email resmi dosen wajib diisi.' });
      return;
    }

    const cleanNidn = nidn.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (username || `dsn.${cleanNidn}`).toLowerCase();

    // Cek duplikasi NIDN, Email, Username
    const existing = await db.query(`
      SELECT u.id FROM users u 
      LEFT JOIN lecturer_profiles lp ON lp.user_id = u.id 
      WHERE u.email = $1 OR u.username = $2 OR lp.nidn = $3
    `, [cleanEmail, cleanUsername, cleanNidn]);

    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'NIDN, Username, atau Email dosen sudah terdaftar di sistem.' });
      return;
    }

    const userId = `usr-dsn-${Date.now().toString(36)}`;
    const profileId = `prof-${userId}`;
    const passwordHash = await bcrypt.hash(password, 10);

    // Ambil nama prodi
    let prodiName = 'Pendidikan Agama Islam (PAI)';
    if (homebaseProdiId) {
      const pRes = await db.query('SELECT name FROM study_programs WHERE id = $1', [homebaseProdiId]);
      if (pRes.rows.length > 0) prodiName = pRes.rows[0].name;
    }

    // Nama lengkap dengan gelar
    let fullName = name.trim();
    if (titlePrefix && !fullName.startsWith(titlePrefix.trim())) {
      fullName = `${titlePrefix.trim()} ${fullName}`;
    }
    if (titleSuffix && !fullName.endsWith(titleSuffix.trim())) {
      fullName = `${fullName}, ${titleSuffix.trim()}`;
    }

    await db.transaction(async (client) => {
      // 1. Buat User Row
      await client.query(`
        INSERT INTO users (
          id, username, password_hash, name, identity_number, email, role, study_program, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
      `, [
        userId,
        cleanUsername,
        passwordHash,
        fullName,
        cleanNidn,
        cleanEmail,
        role,
        prodiName
      ]);

      // 2. Buat Lecturer Profile Row
      await client.query(`
        INSERT INTO lecturer_profiles (
          id, user_id, nidn, nuptk, title_prefix, title_suffix, academic_rank,
          highest_education, employment_status, homebase_prodi_id, is_academic_advisor,
          max_advisory_quota, specialization, phone_number, address
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        profileId,
        userId,
        cleanNidn,
        nuptk || null,
        titlePrefix || null,
        titleSuffix || null,
        academicRank,
        highestEducation,
        employmentStatus,
        homebaseProdiId || null,
        Boolean(isAcademicAdvisor),
        parseInt(maxAdvisoryQuota, 10) || 30,
        specialization || 'Ilmu Pendidikan & Keislaman',
        phoneNumber || null,
        address || null
      ]);
    });

    res.status(201).json({
      data: { userId, profileId, nidn: cleanNidn, name: fullName },
      message: `Dosen ${fullName} (${cleanNidn}) berhasil didaftarkan.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 5. PERBARUI DATA DOSEN
// =========================================================================
export async function updateLecturer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      role,
      titlePrefix,
      titleSuffix,
      academicRank,
      highestEducation,
      employmentStatus,
      homebaseProdiId,
      isAcademicAdvisor,
      maxAdvisoryQuota,
      specialization,
      phoneNumber,
      address,
      isUserActive
    } = req.body;

    const currentRes = await db.query(`
      SELECT lp.id, lp.user_id, u.name 
      FROM lecturer_profiles lp 
      JOIN users u ON u.id = lp.user_id 
      WHERE lp.id = $1 OR lp.user_id = $1
    `, [id]);

    if (currentRes.rows.length === 0) {
      res.status(404).json({ error: 'Data dosen tidak ditemukan.' });
      return;
    }

    const { user_id, id: profile_id } = currentRes.rows[0];

    await db.transaction(async (client) => {
      // 1. Update Users Table
      if (name || email || role || isUserActive !== undefined) {
        await client.query(`
          UPDATE users 
          SET 
            name = COALESCE($1, name),
            email = COALESCE($2, email),
            role = COALESCE($3, role),
            is_active = COALESCE($4, is_active),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $5
        `, [
          name?.trim(),
          email?.trim().toLowerCase(),
          role,
          isUserActive !== undefined ? Boolean(isUserActive) : undefined,
          user_id
        ]);
      }

      // 2. Update Lecturer Profile Table
      await client.query(`
        UPDATE lecturer_profiles
        SET 
          title_prefix = COALESCE($1, title_prefix),
          title_suffix = COALESCE($2, title_suffix),
          academic_rank = COALESCE($3, academic_rank),
          highest_education = COALESCE($4, highest_education),
          employment_status = COALESCE($5, employment_status),
          homebase_prodi_id = $6,
          is_academic_advisor = COALESCE($7, is_academic_advisor),
          max_advisory_quota = COALESCE($8, max_advisory_quota),
          specialization = COALESCE($9, specialization),
          phone_number = COALESCE($10, phone_number),
          address = COALESCE($11, address),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $12
      `, [
        titlePrefix,
        titleSuffix,
        academicRank,
        highestEducation,
        employmentStatus,
        homebaseProdiId || null,
        isAcademicAdvisor !== undefined ? Boolean(isAcademicAdvisor) : undefined,
        maxAdvisoryQuota !== undefined ? parseInt(maxAdvisoryQuota, 10) : undefined,
        specialization,
        phoneNumber,
        address,
        profile_id
      ]);
    });

    res.json({
      data: { profileId: profile_id },
      message: 'Data dosen berhasil diperbarui.'
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 6. TOGGLE HAK AKSES DOSEN PEMBIMBING AKADEMIK (PA)
// =========================================================================
export async function toggleAcademicAdvisor(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const current = await db.query(`
      SELECT lp.id, lp.user_id, u.name, lp.is_academic_advisor 
      FROM lecturer_profiles lp 
      JOIN users u ON u.id = lp.user_id 
      WHERE lp.id = $1 OR lp.user_id = $1
    `, [id]);

    if (current.rows.length === 0) {
      res.status(404).json({ error: 'Data dosen tidak ditemukan.' });
      return;
    }

    const { id: profile_id, is_academic_advisor, name } = current.rows[0];
    const newStatus = !is_academic_advisor;

    await db.query(`
      UPDATE lecturer_profiles 
      SET is_academic_advisor = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [newStatus, profile_id]);

    res.json({
      data: { profileId: profile_id, isAcademicAdvisor: newStatus },
      message: `Status Dosen Pembimbing Akademik untuk ${name} berhasil diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 7. RESET KATA SANDI DOSEN
// =========================================================================
export async function resetLecturerPassword(
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
      LEFT JOIN lecturer_profiles lp ON lp.user_id = u.id 
      WHERE u.id = $1 OR lp.id = $1 OR lp.nidn = $1
    `, [id]);

    if (userRes.rows.length === 0) {
      res.status(404).json({ error: 'Dosen tidak ditemukan.' });
      return;
    }

    const { id: user_id, name } = userRes.rows[0];

    await db.query(`
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [passwordHash, user_id]);

    res.json({
      message: `Kata sandi akun dosen ${name} berhasil di-reset menjadi default '${defaultPassword}'.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 8. HAPUS / NONAKTIFKAN AKUN DOSEN
// =========================================================================
export async function deleteLecturer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const current = await db.query(`
      SELECT lp.id, lp.user_id, u.name 
      FROM lecturer_profiles lp 
      JOIN users u ON u.id = lp.user_id 
      WHERE lp.id = $1 OR lp.user_id = $1
    `, [id]);

    if (current.rows.length === 0) {
      res.status(404).json({ error: 'Dosen tidak ditemukan.' });
      return;
    }

    const { user_id, id: profile_id, name } = current.rows[0];

    await db.transaction(async (client) => {
      // 1. Unlink Dosen PA dari mahasiswa bimbingan
      await client.query('UPDATE student_profiles SET academic_advisor_id = NULL WHERE academic_advisor_id = $1', [user_id]);
      // 2. Unlink penugasan mengajar kelas
      await client.query('DELETE FROM class_lecturers WHERE lecturer_id = $1', [user_id]);
      // 3. Unlink Kaprodi dari study_programs jika ada
      await client.query('UPDATE study_programs SET head_of_program = NULL, head_nidn = NULL WHERE head_nidn = (SELECT nidn FROM lecturer_profiles WHERE id = $1)', [profile_id]);
      // 4. Hapus profile & user
      await client.query('DELETE FROM lecturer_profiles WHERE id = $1 OR user_id = $2', [profile_id, user_id]);
      await client.query('DELETE FROM users WHERE id = $1', [user_id]);
    });

    res.json({
      message: `Akun dosen ${name} berhasil dihapus dari sistem.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 8. IMPOR MASSAL DATA DOSEN (BULK CREATE)
// =========================================================================
export async function bulkCreateLecturers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { lecturers } = req.body;

    if (!Array.isArray(lecturers) || lecturers.length === 0) {
      res.status(400).json({ error: 'Daftar data dosen tidak boleh kosong.' });
      return;
    }

    const prodiRes = await db.query('SELECT id, code, name FROM study_programs');
    const prodis = prodiRes.rows;

    let insertedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];
    const createdItems: any[] = [];

    await db.transaction(async (client) => {
      for (let i = 0; i < lecturers.length; i++) {
        const l = lecturers[i];
        if (!l.name || !l.email) {
          errors.push(`Baris #${i + 1}: Nama Lengkap dan Email wajib diisi.`);
          continue;
        }

        const cleanNidn = String(l.nidn || l.nip || '').trim();
        const cleanName = String(l.name).trim();
        const cleanEmail = String(l.email).trim().toLowerCase();
        const cleanUsername = (l.username || (cleanNidn ? `dsn.${cleanNidn}` : cleanEmail.split('@')[0])).toLowerCase();

        let matchedProdi = prodis.find(p => p.id === l.homebaseProdiId || p.code?.toLowerCase() === String(l.homebaseProdiId).toLowerCase());
        if (!matchedProdi) {
          const prodiQuery = String(l.homebaseProdiId || l.studyProgram || '').toLowerCase();
          matchedProdi = prodis.find(p => p.name?.toLowerCase().includes(prodiQuery) || p.code?.toLowerCase().includes(prodiQuery));
        }
        const homebaseProdiId = matchedProdi ? matchedProdi.id : (prodis[0]?.id || 'prodi-pai');
        const prodiName = matchedProdi ? matchedProdi.name : (prodis[0]?.name || 'Pendidikan Agama Islam');

        const existing = await client.query(`
          SELECT u.id as user_id, lp.id as profile_id 
          FROM users u
          LEFT JOIN lecturer_profiles lp ON lp.user_id = u.id
          WHERE u.email = $1 OR u.username = $2 OR (lp.nidn = $3 AND $3 != '')
        `, [cleanEmail, cleanUsername, cleanNidn]);

        const password = l.password || 'salam2026!';
        const passwordHash = await bcrypt.hash(password, 10);

        if (existing.rows.length > 0) {
          const userId = existing.rows[0].user_id;
          const profileId = existing.rows[0].profile_id;

          await client.query(`
            UPDATE users
            SET name = $1, email = $2, identity_number = $3, study_program = $4, updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
          `, [cleanName, cleanEmail, cleanNidn, prodiName, userId]);

          if (profileId) {
            await client.query(`
              UPDATE lecturer_profiles
              SET 
                nidn = $1,
                homebase_prodi_id = $2,
                academic_rank = COALESCE($3, academic_rank),
                highest_education = COALESCE($4, highest_education),
                employment_status = COALESCE($5, employment_status),
                expertise = COALESCE($6, expertise),
                phone_number = COALESCE($7, phone_number),
                updated_at = CURRENT_TIMESTAMP
              WHERE id = $8
            `, [
              cleanNidn,
              homebaseProdiId,
              l.academicRank || 'Tenaga Pengajar',
              l.highestEducation || 'S2',
              l.employmentStatus || 'TETAP',
              l.expertise || 'Pendidikan Islam',
              l.phoneNumber || null,
              profileId
            ]);
          }
          updatedCount++;
          createdItems.push({ userId, profileId, nidn: cleanNidn, name: cleanName });
        } else {
          const userId = `usr-dsn-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
          const profileId = `prof-${userId}`;

          await client.query(`
            INSERT INTO users (
              id, username, password_hash, name, identity_number, email, role, study_program, is_active
            )
            VALUES ($1, $2, $3, $4, $5, $6, 'dosen', $7, TRUE)
          `, [
            userId,
            cleanUsername,
            passwordHash,
            cleanName,
            cleanNidn,
            cleanEmail,
            prodiName
          ]);

          await client.query(`
            INSERT INTO lecturer_profiles (
              id, user_id, nidn, nip, homebase_prodi_id, academic_rank, highest_education,
              employment_status, is_academic_advisor, max_supervision_quota, expertise,
              phone_number, address
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          `, [
            profileId,
            userId,
            cleanNidn,
            l.nip || cleanNidn,
            homebaseProdiId,
            l.academicRank || 'Tenaga Pengajar',
            l.highestEducation || 'S2',
            l.employmentStatus || 'TETAP',
            l.isAcademicAdvisor !== undefined ? Boolean(l.isAcademicAdvisor) : true,
            parseInt(l.maxSupervisionQuota, 10) || 20,
            l.expertise || 'Pendidikan Islam',
            l.phoneNumber || null,
            l.address || null
          ]);

          insertedCount++;
          createdItems.push({ userId, profileId, nidn: cleanNidn, name: cleanName });
        }
      }
    });

    res.status(201).json({
      data: {
        total: lecturers.length,
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
