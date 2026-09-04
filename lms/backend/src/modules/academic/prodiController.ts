import { Response, NextFunction } from 'express';
import { db } from '../../db/pool.js';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';

// =========================================================================
// 1. STATISTIK RINGKASAN PROGRAM STUDI & KURIKULUM
// =========================================================================
export async function getStudyProgramsSummary(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const totalProdiRes = await db.query('SELECT COUNT(*) as count FROM study_programs WHERE is_active = TRUE');
    const totalAllProdiRes = await db.query('SELECT COUNT(*) as count FROM study_programs');
    const totalStudentsRes = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'mahasiswa' AND is_active = TRUE");
    const totalLecturersRes = await db.query("SELECT COUNT(*) as count FROM users WHERE role IN ('dosen', 'dosen_pa', 'kaprodi') AND is_active = TRUE");
    const totalCurriculumsRes = await db.query("SELECT COUNT(*) as count FROM curriculums WHERE is_active = TRUE");
    const totalCoursesRes = await db.query('SELECT COUNT(*) as count FROM courses');
    const accreditationRes = await db.query(`
      SELECT accreditation, COUNT(*) as count 
      FROM study_programs 
      GROUP BY accreditation 
      ORDER BY count DESC
    `);

    res.json({
      data: {
        totalActivePrograms: parseInt(totalProdiRes.rows[0]?.count || '0', 10),
        totalAllPrograms: parseInt(totalAllProdiRes.rows[0]?.count || '0', 10),
        totalStudents: parseInt(totalStudentsRes.rows[0]?.count || '0', 10),
        totalLecturers: parseInt(totalLecturersRes.rows[0]?.count || '0', 10),
        totalCurriculums: parseInt(totalCurriculumsRes.rows[0]?.count || '0', 10),
        totalCourses: parseInt(totalCoursesRes.rows[0]?.count || '0', 10),
        accreditationBreakdown: accreditationRes.rows
      }
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 2. DAFTAR SEMUA PROGRAM STUDI
// =========================================================================
export async function getStudyPrograms(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { degree, status, search } = req.query;

    let query = `
      SELECT 
        sp.id,
        sp.code,
        sp.name,
        sp.degree,
        sp.head_of_program as "headOfProgram",
        sp.head_nidn as "headNidn",
        sp.accreditation,
        sp.sk_number as "skNumber",
        sp.sk_date as "skDate",
        sp.degree_title as "degreeTitle",
        sp.total_credits_required as "totalCreditsRequired",
        sp.is_active as "isActive",
        sp.description,
        sp.email,
        sp.created_at as "createdAt",
        sp.updated_at as "updatedAt",
        (SELECT COUNT(*) FROM courses c WHERE c.study_program_id = sp.id) as "totalCourses",
        (SELECT COUNT(*) FROM users u WHERE u.role = 'mahasiswa' AND (u.study_program ILIKE '%' || sp.name || '%' OR u.study_program ILIKE '%' || sp.code || '%')) as "totalStudents",
        (SELECT COUNT(*) FROM users u WHERE u.role IN ('dosen', 'dosen_pa', 'kaprodi') AND (u.study_program ILIKE '%' || sp.name || '%' OR u.study_program ILIKE '%' || sp.code || '%')) as "totalLecturers",
        (SELECT c.name FROM curriculums c WHERE c.study_program_id = sp.id AND c.is_active = TRUE LIMIT 1) as "activeCurriculumName"
      FROM study_programs sp
      WHERE 1=1
    `;

    const params: any[] = [];

    if (degree && degree !== 'SEMUA') {
      params.push(degree);
      query += ` AND sp.degree = $${params.length}`;
    }

    if (status === 'AKTIF') {
      query += ` AND sp.is_active = TRUE`;
    } else if (status === 'NONAKTIF') {
      query += ` AND sp.is_active = FALSE`;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      query += ` AND (sp.name ILIKE $${params.length} OR sp.code ILIKE $${params.length} OR sp.head_of_program ILIKE $${params.length})`;
    }

    query += ` ORDER BY sp.code ASC`;

    const result = await db.query(query, params);

    res.json({
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 3. DETAIL PROGRAM STUDI BESERTA KURIKULUM & CPL
// =========================================================================
export async function getStudyProgramById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const prodiRes = await db.query(`
      SELECT 
        sp.id,
        sp.code,
        sp.name,
        sp.degree,
        sp.head_of_program as "headOfProgram",
        sp.head_nidn as "headNidn",
        sp.accreditation,
        sp.sk_number as "skNumber",
        sp.sk_date as "skDate",
        sp.degree_title as "degreeTitle",
        sp.total_credits_required as "totalCreditsRequired",
        sp.is_active as "isActive",
        sp.description,
        sp.email,
        sp.created_at as "createdAt",
        sp.updated_at as "updatedAt"
      FROM study_programs sp
      WHERE sp.id = $1
    `, [id]);

    if (prodiRes.rows.length === 0) {
      res.status(404).json({ error: 'Program Studi tidak ditemukan.' });
      return;
    }

    const prodi = prodiRes.rows[0];

    // Ambil kurikulum
    const curriculumsRes = await db.query(`
      SELECT 
        id,
        code,
        name,
        year,
        total_credits as "totalCredits",
        mandatory_credits as "mandatoryCredits",
        elective_credits as "electiveCredits",
        is_active as "isActive",
        status,
        description,
        created_at as "createdAt"
      FROM curriculums
      WHERE study_program_id = $1
      ORDER BY year DESC, is_active DESC
    `, [id]);

    // Ambil CPL
    const cplRes = await db.query(`
      SELECT 
        id,
        curriculum_id as "curriculumId",
        code,
        category,
        description,
        created_at as "createdAt"
      FROM program_learning_outcomes
      WHERE study_program_id = $1
      ORDER BY category ASC, code ASC
    `, [id]);

    // Ambil mata kuliah
    const coursesRes = await db.query(`
      SELECT 
        c.id,
        c.code,
        c.name,
        c.credits,
        COALESCE(c.semester_recommended, 1) as semester,
        c.created_at as "createdAt"
      FROM courses c
      WHERE c.study_program_id = $1
      ORDER BY COALESCE(c.semester_recommended, 1) ASC, c.code ASC
    `, [id]);

    res.json({
      data: {
        ...prodi,
        curriculums: curriculumsRes.rows,
        learningOutcomes: cplRes.rows,
        courses: coursesRes.rows
      }
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 4. TAMBAH PROGRAM STUDI BARU
// =========================================================================
export async function createStudyProgram(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      code,
      name,
      degree = 'S1',
      headOfProgram,
      headNidn,
      accreditation = 'Baik',
      skNumber,
      skDate,
      degreeTitle = 'Sarjana Pendidikan (S.Pd.)',
      totalCreditsRequired = 144,
      description,
      email
    } = req.body;

    if (!code || !name) {
      res.status(400).json({ error: 'Kode Program Studi dan Nama Program Studi wajib diisi.' });
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanId = `prodi-${cleanCode.toLowerCase()}`;

    // Cek duplikasi kode
    const existing = await db.query('SELECT id FROM study_programs WHERE code = $1 OR id = $2', [cleanCode, cleanId]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: `Program Studi dengan kode '${cleanCode}' sudah terdaftar.` });
      return;
    }

    const insertRes = await db.query(`
      INSERT INTO study_programs (
        id, code, name, degree, head_of_program, head_nidn, accreditation, 
        sk_number, sk_date, degree_title, total_credits_required, is_active, description, email
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE, $12, $13)
      RETURNING *
    `, [
      cleanId,
      cleanCode,
      name.trim(),
      degree,
      headOfProgram?.trim() || null,
      headNidn?.trim() || null,
      accreditation,
      skNumber?.trim() || null,
      skDate || null,
      degreeTitle?.trim() || 'Sarjana Pendidikan (S.Pd.)',
      parseInt(totalCreditsRequired, 10) || 144,
      description?.trim() || null,
      email?.trim() || null
    ]);

    // Otomatis buat kurikulum draf default
    await db.query(`
      INSERT INTO curriculums (
        id, study_program_id, code, name, year, total_credits, mandatory_credits, elective_credits, is_active, status, description
      )
      VALUES ($1, $2, $3, $4, $5, 144, 130, 14, TRUE, 'AKTIF', $6)
    `, [
      `cur-${cleanCode.toLowerCase()}-2024`,
      cleanId,
      `KUR-${cleanCode}-2024`,
      `Kurikulum OBE ${name.trim()} 2024`,
      new Date().getFullYear(),
      `Kurikulum dasar program studi ${name.trim()}.`
    ]);

    res.status(201).json({
      data: insertRes.rows[0],
      message: `Program Studi ${name} (${cleanCode}) berhasil ditambahkan.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 5. PERBARUI PROGRAM STUDI
// =========================================================================
export async function updateStudyProgram(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const {
      name,
      degree,
      headOfProgram,
      headNidn,
      accreditation,
      skNumber,
      skDate,
      degreeTitle,
      totalCreditsRequired,
      description,
      email,
      isActive
    } = req.body;

    const check = await db.query('SELECT id, name FROM study_programs WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Program Studi tidak ditemukan.' });
      return;
    }

    const updateRes = await db.query(`
      UPDATE study_programs
      SET 
        name = COALESCE($1, name),
        degree = COALESCE($2, degree),
        head_of_program = COALESCE($3, head_of_program),
        head_nidn = COALESCE($4, head_nidn),
        accreditation = COALESCE($5, accreditation),
        sk_number = COALESCE($6, sk_number),
        sk_date = COALESCE($7, sk_date),
        degree_title = COALESCE($8, degree_title),
        total_credits_required = COALESCE($9, total_credits_required),
        description = COALESCE($10, description),
        email = COALESCE($11, email),
        is_active = COALESCE($12, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *
    `, [
      name?.trim(),
      degree,
      headOfProgram?.trim(),
      headNidn?.trim(),
      accreditation,
      skNumber?.trim(),
      skDate || null,
      degreeTitle?.trim(),
      totalCreditsRequired ? parseInt(totalCreditsRequired, 10) : undefined,
      description?.trim(),
      email?.trim(),
      isActive !== undefined ? Boolean(isActive) : undefined,
      id
    ]);

    res.json({
      data: updateRes.rows[0],
      message: `Data Program Studi ${updateRes.rows[0].name} berhasil diperbarui.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 6. TOGGLE STATUS PROGRAM STUDI (AKTIF/NONAKTIF)
// =========================================================================
export async function toggleStudyProgramStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const current = await db.query('SELECT id, name, is_active FROM study_programs WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      res.status(404).json({ error: 'Program Studi tidak ditemukan.' });
      return;
    }

    const nextState = !current.rows[0].is_active;

    await db.query(`
      UPDATE study_programs
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [nextState, id]);

    res.json({
      data: {
        id,
        isActive: nextState
      },
      message: `Status Program Studi ${current.rows[0].name} berhasil diubah menjadi ${nextState ? 'Aktif' : 'Nonaktif'}.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 7. DAFTAR KURIKULUM
// =========================================================================
export async function getCurriculums(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { prodiId } = req.query;

    let query = `
      SELECT 
        c.id,
        c.study_program_id as "studyProgramId",
        sp.name as "studyProgramName",
        sp.code as "studyProgramCode",
        c.code,
        c.name,
        c.year,
        c.total_credits as "totalCredits",
        c.mandatory_credits as "mandatoryCredits",
        c.elective_credits as "electiveCredits",
        c.is_active as "isActive",
        c.status,
        c.description,
        c.created_at as "createdAt",
        (SELECT COUNT(*) FROM program_learning_outcomes cpl WHERE cpl.curriculum_id = c.id) as "cplCount"
      FROM curriculums c
      JOIN study_programs sp ON sp.id = c.study_program_id
      WHERE 1=1
    `;

    const params: any[] = [];
    if (prodiId) {
      params.push(prodiId);
      query += ` AND c.study_program_id = $${params.length}`;
    }

    query += ` ORDER BY c.year DESC, c.is_active DESC`;

    const result = await db.query(query, params);

    res.json({
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 8. TAMBAH KURIKULUM BARU
// =========================================================================
export async function createCurriculum(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      studyProgramId,
      code,
      name,
      year = new Date().getFullYear(),
      totalCredits = 144,
      mandatoryCredits = 130,
      electiveCredits = 14,
      description
    } = req.body;

    if (!studyProgramId || !code || !name) {
      res.status(400).json({ error: 'Program Studi, Kode Kurikulum, dan Nama Kurikulum wajib diisi.' });
      return;
    }

    const id = `cur-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const result = await db.query(`
      INSERT INTO curriculums (
        id, study_program_id, code, name, year, total_credits, mandatory_credits, elective_credits, is_active, status, description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, 'AKTIF', $9)
      RETURNING *
    `, [
      id,
      studyProgramId,
      code.trim().toUpperCase(),
      name.trim(),
      parseInt(year, 10) || new Date().getFullYear(),
      parseInt(totalCredits, 10) || 144,
      parseInt(mandatoryCredits, 10) || 130,
      parseInt(electiveCredits, 10) || 14,
      description?.trim() || null
    ]);

    res.status(201).json({
      data: result.rows[0],
      message: `Kurikulum ${name} berhasil ditambahkan.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 9. DAFTAR CAPAIAN PEMBELAJARAN LULUSAN (CPL)
// =========================================================================
export async function getCPLList(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { prodiId, curriculumId } = req.query;

    let query = `
      SELECT 
        cpl.id,
        cpl.study_program_id as "studyProgramId",
        sp.name as "studyProgramName",
        cpl.curriculum_id as "curriculumId",
        c.name as "curriculumName",
        cpl.code,
        cpl.category,
        cpl.description,
        cpl.created_at as "createdAt"
      FROM program_learning_outcomes cpl
      JOIN study_programs sp ON sp.id = cpl.study_program_id
      LEFT JOIN curriculums c ON c.id = cpl.curriculum_id
      WHERE 1=1
    `;

    const params: any[] = [];
    if (prodiId) {
      params.push(prodiId);
      query += ` AND cpl.study_program_id = $${params.length}`;
    }
    if (curriculumId) {
      params.push(curriculumId);
      query += ` AND cpl.curriculum_id = $${params.length}`;
    }

    query += ` ORDER BY cpl.category ASC, cpl.code ASC`;

    const result = await db.query(query, params);

    res.json({
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 10. TAMBAH CPL BARU
// =========================================================================
export async function createCPL(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { studyProgramId, curriculumId, code, category, description } = req.body;

    if (!studyProgramId || !code || !category || !description) {
      res.status(400).json({ error: 'Program Studi, Kode CPL, Kategori, dan Deskripsi CPL wajib diisi.' });
      return;
    }

    const id = `cpl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const result = await db.query(`
      INSERT INTO program_learning_outcomes (id, study_program_id, curriculum_id, code, category, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      id,
      studyProgramId,
      curriculumId || null,
      code.trim().toUpperCase(),
      category,
      description.trim()
    ]);

    res.status(201).json({
      data: result.rows[0],
      message: `Capaian Pembelajaran ${code} berhasil ditambahkan.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 11. HAPUS PROGRAM STUDI PERMANEN
// =========================================================================
export async function deleteStudyProgram(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const check = await db.query('SELECT id, name FROM study_programs WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Program Studi tidak ditemukan.' });
      return;
    }

    // 1. Lepaskan relasi mata kuliah tanpa merusak histori kelas/transkrip
    await db.query('UPDATE courses SET study_program_id = NULL WHERE study_program_id = $1', [id]);

    // 2. Bersihkan CPL dan kurikulum terkait
    await db.query('DELETE FROM program_learning_outcomes WHERE study_program_id = $1', [id]);
    await db.query('DELETE FROM curriculums WHERE study_program_id = $1', [id]);

    // 3. Hapus data program studi
    await db.query('DELETE FROM study_programs WHERE id = $1', [id]);

    res.json({
      message: `Program Studi ${check.rows[0].name} berhasil dihapus.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 12. IMPOR MASSAL PROGRAM STUDI
// =========================================================================
export async function bulkCreateStudyPrograms(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { programs } = req.body;
    if (!Array.isArray(programs) || programs.length === 0) {
      res.status(400).json({ error: 'Daftar program studi tidak valid.' });
      return;
    }

    const inserted: any[] = [];
    for (const p of programs) {
      if (!p.code || !p.name) continue;
      const cleanCode = p.code.trim().toUpperCase();
      const cleanId = `prodi-${cleanCode.toLowerCase()}`;

      const resInsert = await db.query(`
        INSERT INTO study_programs (
          id, code, name, degree, head_of_program, head_nidn, accreditation,
          sk_number, degree_title, total_credits_required, is_active, description, email
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          degree = EXCLUDED.degree,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        cleanId,
        cleanCode,
        p.name.trim(),
        p.degree || 'S1',
        p.headOfProgram || null,
        p.headNidn || null,
        p.accreditation || 'Baik',
        p.skNumber || null,
        p.degreeTitle || 'Sarjana Pendidikan (S.Pd.)',
        parseInt(p.totalCreditsRequired, 10) || 144,
        p.description || null,
        p.email || null
      ]);

      inserted.push(resInsert.rows[0]);
    }

    res.status(201).json({
      data: {
        count: inserted.length,
        items: inserted
      },
      message: `Sebanyak ${inserted.length} Program Studi berhasil diproses.`
    });
  } catch (err) {
    next(err);
  }
}
