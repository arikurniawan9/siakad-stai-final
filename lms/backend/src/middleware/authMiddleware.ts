import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export interface AuthenticatedUser {
  id: string;
  username: string;
  name: string;
  identityNumber: string;
  email: string;
  role: string;
  studyProgram?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  requestId?: string;
}

const DEMO_USERS_MAP: Record<string, AuthenticatedUser> = {
  mahasiswa: {
    id: 'usr-mhs-01',
    username: '21.01.0042',
    name: 'Ahmad Fauzi',
    identityNumber: '21.01.0042',
    email: 'ahmad.fauzi@mhs.staialittihad.ac.id',
    role: 'mahasiswa',
    studyProgram: 'Pendidikan Agama Islam'
  },
  dosen: {
    id: 'usr-dsn-01',
    username: 'dosen_ridwan',
    name: 'Dr. H. M. Ridwan, M.Ag',
    identityNumber: '2112087501',
    email: 'ridwan@staialittihad.ac.id',
    role: 'dosen',
    studyProgram: 'Pendidikan Agama Islam'
  },
  dosen_pa: {
    id: 'usr-dsn-pa',
    username: 'dosen_pa_maryam',
    name: 'Dra. Hj. Siti Maryam, M.Pd.I',
    identityNumber: '2115047802',
    email: 'maryam@staialittihad.ac.id',
    role: 'dosen_pa',
    studyProgram: 'Pendidikan Agama Islam'
  },
  kaprodi: {
    id: 'usr-kpd-pai',
    username: 'kaprodi_pai',
    name: "Dr. Ahmad Syafi'i, M.Ag",
    identityNumber: '2118097201',
    email: 'kaprodi.pai@staialittihad.ac.id',
    role: 'kaprodi',
    studyProgram: 'Pendidikan Agama Islam'
  },
  admin_akademik: {
    id: 'usr-admin-akd',
    username: 'admin_akademik',
    name: 'Budi Santoso, S.Kom',
    identityNumber: '1988041501',
    email: 'akademik@stai-alittihad.ac.id',
    role: 'admin_akademik',
    studyProgram: 'Biro Administrasi Akademik'
  },
  pimpinan: {
    id: 'usr-pimpinan',
    username: 'ketua_stai',
    name: 'Prof. Dr. KH. Abdul Halim, M.A.',
    identityNumber: '1965031201',
    email: 'ketua@staialittihad.ac.id',
    role: 'pimpinan',
    studyProgram: 'Pimpinan STAI Al-Ittihad'
  },
  administrator_sistem: {
    id: 'usr-admin-sys',
    username: 'superadmin',
    name: 'Administrator Sistem SALAM',
    identityNumber: '1990010101',
    email: 'admin@staialittihad.ac.id',
    role: 'administrator_sistem',
    studyProgram: 'Unit Pengelola Sistem Informasi'
  }
};

function extractToken(req: Request): string | null {
  // 1. Periksa header Authorization Bearer
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  // 2. Periksa cookie salam_token
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)salam_token=([^;]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Akses Ditolak: Anda wajib masuk ke sistem untuk mengakses resource ini.'
      }
    });
    return;
  }

  // 1. Coba verifikasi standar JWT
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    return next();
  } catch {
    res.status(401).json({
      error: {
        code: 'SESSION_EXPIRED',
        message: 'Sesi Anda telah berakhir. Silakan masuk kembali.'
      }
    });
  }
}

void DEMO_USERS_MAP;

/**
 * Autentikasi gateway-ke-gateway untuk push master dari SIAKAD.
 * Endpoint ini tidak memakai JWT pengguna karena dipanggil oleh server SIAKAD.
 */
export function requireSiakadSync(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token || token !== ENV.SIAKAD_SYNC_KEY) {
    res.status(401).json({
      error: {
        code: 'INVALID_SIAKAD_SYNC_KEY',
        message: 'Kunci sinkronisasi SIAKAD tidak valid.'
      }
    });
    return;
  }

  req.user = {
    id: 'siakad-gateway',
    username: 'siakad-gateway',
    name: 'SALAM SIAKAD Gateway',
    identityNumber: '',
    email: '',
    role: 'siakad_gateway'
  };
  next();
}
