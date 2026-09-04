import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../db/pool.js';
import { ENV } from '../../config/env.js';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nama pengguna dan kata sandi wajib diisi.'
        }
      });
      return;
    }

    const userResult = await db.query(
      `SELECT id, username, password as password_hash, name, identity_number, email, role, study_program 
       FROM users 
       WHERE username = $1 
          OR identity_number = $1 
          OR REPLACE(identity_number, '.', '') = $1 
          OR email = $1 
       LIMIT 1`,
      [username.trim()]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Nama pengguna atau kata sandi tidak valid.'
        }
      });
      return;
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Nama pengguna atau kata sandi tidak valid.'
        }
      });
      return;
    }

    let userRole = user.role;
    if (userRole === 'superadmin') userRole = 'administrator_sistem';

    const payload = {
      id: String(user.id),
      username: user.username,
      name: user.name,
      identityNumber: user.identity_number,
      email: user.email,
      role: userRole,
      studyProgram: user.study_program
    };

    const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '7d' });

    // Pasang HttpOnly Cookie yang aman
    const isProd = ENV.NODE_ENV === 'production';
    const cookieFlags = [
      `salam_token=${token}`,
      'HttpOnly',
      'Path=/',
      'Max-Age=604800', // 7 hari
      'SameSite=Lax',
      ...(isProd ? ['Secure'] : [])
    ].join('; ');

    res.setHeader('Set-Cookie', cookieFlags);

    res.json({
      data: {
        token,
        user: payload
      },
      meta: {
        serverTime: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;

    // Bersihkan cookie sesi
    const clearCookieFlags = [
      'salam_token=',
      'HttpOnly',
      'Path=/',
      'Max-Age=0',
      'SameSite=Lax'
    ].join('; ');

    res.setHeader('Set-Cookie', clearCookieFlags);

    if (user) {
      // Catat jejak audit keluar sistem
      await db.query(`
        INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, resource, details, ip_address, status)
        VALUES ($1, $2, $3, $4, 'LOGOUT', 'USER_SESSION', $5, $6, 'SUKSES')
      `, [
        `aud-${Date.now()}`,
        user.id,
        user.name,
        user.role,
        `Pengguna ${user.name} (${user.role}) keluar dari sistem.`,
        req.ip || '127.0.0.1'
      ]);
    }

    res.json({
      data: {
        message: 'Anda berhasil keluar dari sistem SALAM.'
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Sesi tidak ditemukan.' } });
      return;
    }

    const userResult = await db.query(
      'SELECT id, username, name, identity_number, email, role, study_program, avatar as avatar_url FROM users WHERE id = $1 LIMIT 1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'Pengguna tidak ditemukan.' } });
      return;
    }

    const u = userResult.rows[0];
    if (u.role === 'superadmin') u.role = 'administrator_sistem';

    res.json({
      data: u
    });
  } catch (err) {
    next(err);
  }
}

export async function switchRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { targetRole } = req.body;

    const userResult = await db.query(
      'SELECT id, username, name, identity_number, email, role, study_program FROM users WHERE role = $1 LIMIT 1',
      [targetRole]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: { code: 'ROLE_USER_NOT_FOUND', message: `Tidak ada pengguna dengan peran ${targetRole}` } });
      return;
    }

    const targetUser = userResult.rows[0];
    const payload = {
      id: targetUser.id,
      username: targetUser.username,
      name: targetUser.name,
      identityNumber: targetUser.identity_number,
      email: targetUser.email,
      role: targetUser.role,
      studyProgram: targetUser.study_program
    };

    const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '7d' });

    const isProd = ENV.NODE_ENV === 'production';
    const cookieFlags = [
      `salam_token=${token}`,
      'HttpOnly',
      'Path=/',
      'Max-Age=604800',
      'SameSite=Lax',
      ...(isProd ? ['Secure'] : [])
    ].join('; ');

    res.setHeader('Set-Cookie', cookieFlags);

    res.json({
      data: {
        token,
        user: payload
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * SINGLE SIGN-ON (SSO) OAUTH2 EXCHANGE: SIAKAD STAI AL-ITTIHAD
 * Endpoint: POST /api/v1/auth/siakad/exchange
 */
export async function siakadSsoExchange(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Authorization code SSO wajib disertakan.'
        }
      });
      return;
    }

    // Panggil SIAKAD SSO Token Endpoint
    const siakadUrl = process.env.SIAKAD_API_URL || 'http://localhost:8000/api/v1';
    const tokenResponse = await fetch(`${siakadUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: 'salam_lms',
        client_secret: 'salam_lms_secret_2026',
        code: code
      })
    });

    if (!tokenResponse.ok) {
      const errData = await tokenResponse.json().catch(() => ({}));
      res.status(401).json({
        error: {
          code: 'SSO_EXCHANGE_FAILED',
          message: (errData as any).message || 'Gagal memverifikasi kredensial SSO dari SIAKAD.'
        }
      });
      return;
    }

    const siakadData: any = await tokenResponse.json();
    const siakadUser = siakadData.user;

    if (!siakadUser) {
      res.status(401).json({
        error: {
          code: 'SSO_USER_NOT_FOUND',
          message: 'Data profil pengguna tidak ditemukan dalam respon SIAKAD.'
        }
      });
      return;
    }

    // Role mapping: superadmin -> administrator_sistem
    let mappedRole = siakadUser.role;
    if (mappedRole === 'superadmin') mappedRole = 'administrator_sistem';

    // Cari user di database LMS
    let localUserResult = await db.query(
      'SELECT id, username, name, identity_number, email, role, study_program FROM users WHERE username = $1 OR email = $2 OR identity_number = $3 LIMIT 1',
      [siakadUser.username, siakadUser.email, siakadUser.identity_number]
    ).catch(() => ({ rows: [] as any[] }));

    let localUser = localUserResult.rows[0];

    if (!localUser) {
      // Buat akun baru di LMS
      const newId = `usr-${Date.now()}`;
      const defaultHash = await bcrypt.hash('salam123', 10);
      try {
        const insertRes = await db.query(`
          INSERT INTO users (id, username, password_hash, name, identity_number, email, role, study_program)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id, username, name, identity_number, email, role, study_program
        `, [
          newId,
          siakadUser.username,
          defaultHash,
          siakadUser.name,
          siakadUser.identity_number || null,
          siakadUser.email,
          mappedRole,
          siakadUser.study_program || null
        ]);
        localUser = insertRes.rows[0];
      } catch {
        // Fallback jika query gagal
        localUser = {
          id: String(siakadUser.id),
          username: siakadUser.username,
          name: siakadUser.name,
          identityNumber: siakadUser.identity_number,
          email: siakadUser.email,
          role: mappedRole,
          studyProgram: siakadUser.study_program
        };
      }
    }

    const payload = {
      id: localUser.id,
      username: localUser.username,
      name: localUser.name,
      identityNumber: localUser.identity_number || localUser.identityNumber,
      email: localUser.email,
      role: mappedRole,
      studyProgram: localUser.study_program || localUser.studyProgram
    };

    const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '7d' });

    // Pasang HttpOnly Cookie yang aman
    const isProd = ENV.NODE_ENV === 'production';
    const cookieFlags = [
      `salam_token=${token}`,
      'HttpOnly',
      'Path=/',
      'Max-Age=604800',
      'SameSite=Lax',
      ...(isProd ? ['Secure'] : [])
    ].join('; ');

    res.setHeader('Set-Cookie', cookieFlags);

    // Audit log
    await db.query(`
      INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, resource, details, ip_address, status)
      VALUES ($1, $2, $3, $4, 'SSO_LOGIN', 'OAUTH2_SESSION', $5, $6, 'SUKSES')
    `, [
      `aud-${Date.now()}`,
      payload.id,
      payload.name,
      payload.role,
      `Pengguna ${payload.name} (${payload.role}) berhasil masuk melalui SSO SIAKAD.`,
      req.ip || '127.0.0.1'
    ]).catch(() => {});

    res.json({
      data: {
        token,
        user: payload,
        sso: true
      },
      meta: {
        serverTime: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
}

