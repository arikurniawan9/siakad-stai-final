import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.js';

export const ROLE_PERMISSIONS_MATRIX: Record<string, string[]> = {
  mahasiswa: [
    'materials:view',
    'video:watch',
    'quizzes:attempt',
    'assignments:submit',
    'discussions:view',
    'discussions:post',
    'progress:view_own',
    'academic:view_schedule',
    'academic:view_krs_khs',
  ],
  dosen: [
    'materials:view',
    'materials:manage',
    'materials:publish',
    'video:watch',
    'video:manage',
    'quizzes:attempt',
    'quizzes:manage',
    'assignments:manage',
    'assignments:grade',
    'discussions:view',
    'discussions:post',
    'discussions:moderate',
    'progress:view_own',
    'progress:view_class',
    'progress:export',
    'academic:view_schedule',
    'academic:input_final_grades',
  ],
  dosen_pa: [
    'materials:view',
    'materials:manage',
    'materials:publish',
    'video:watch',
    'video:manage',
    'quizzes:manage',
    'assignments:manage',
    'assignments:grade',
    'discussions:view',
    'discussions:post',
    'discussions:moderate',
    'progress:view_class',
    'academic:view_schedule',
    'academic:input_final_grades',
    'academic:view_krs_khs',
  ],
  kaprodi: [
    'materials:view',
    'materials:manage',
    'video:manage',
    'quizzes:manage',
    'assignments:manage',
    'discussions:view',
    'progress:view_class',
    'progress:export',
    'academic:view_schedule',
    'academic:manage_schedule',
    'academic:view_periods',
    'academic:input_final_grades',
    'audit:view',
  ],
  admin_akademik: [
    'materials:view',
    'materials:manage',
    'academic:view_schedule',
    'academic:manage_schedule',
    'academic:view_periods',
    'academic:manage_periods',
    'sync:execute',
    'sync:view_logs',
    'users:manage',
    'audit:view',
  ],
  pimpinan: [
    'materials:view',
    'academic:view_periods',
    'progress:view_class',
    'progress:export',
    'audit:view',
    'sync:view_logs',
  ],
  administrator_sistem: [
    'materials:view',
    'materials:manage',
    'materials:publish',
    'video:watch',
    'video:manage',
    'quizzes:attempt',
    'quizzes:manage',
    'assignments:submit',
    'assignments:grade',
    'assignments:manage',
    'discussions:view',
    'discussions:post',
    'discussions:moderate',
    'progress:view_own',
    'progress:view_class',
    'progress:export',
    'academic:view_schedule',
    'academic:view_krs_khs',
    'academic:manage_schedule',
    'academic:view_periods',
    'academic:manage_periods',
    'academic:input_final_grades',
    'sync:execute',
    'sync:view_logs',
    'users:manage',
    'roles:manage',
    'audit:view',
    'system:configure',
  ],
};

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Autentikasi diperlukan.'
        }
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Akses Ditolak: Anda tidak memiliki wewenang peran yang sesuai untuk tindakan ini.'
        }
      });
      return;
    }

    next();
  };
}

export function requirePermission(...requiredPermissions: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Autentikasi diperlukan.'
        }
      });
      return;
    }

    const userPermissions = ROLE_PERMISSIONS_MATRIX[req.user.role] || [];
    const hasAll = requiredPermissions.every((p) => userPermissions.includes(p));

    if (!hasAll) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Akses Ditolak: Anda memerlukan hak akses (${requiredPermissions.join(', ')}) untuk melakukan tindakan ini.`
        }
      });
      return;
    }

    next();
  };
}
