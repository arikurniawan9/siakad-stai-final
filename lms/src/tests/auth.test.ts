/**
 * SUITE UJI OTORISASI & RBAC SALAM STAI AL-ITTIHAD
 * 
 * Pengujian kasus positif (kewenangan sah) dan kasus negatif (pencegahan akses ilegal)
 */

import { ROLE_PERMISSIONS } from '../constants/permissions';
import { UserRole } from '../types/roles';
import { Permission } from '../types/auth';

export interface TestCaseResult {
  role: UserRole;
  permission: Permission;
  expectedAllowed: boolean;
  actualAllowed: boolean;
  passed: boolean;
  type: 'POSITIF' | 'NEGATIF';
  description: string;
}

export function runRbacTests(): { results: TestCaseResult[]; totalPassed: number; totalFailed: number } {
  const testCases: { role: UserRole; permission: Permission; expectedAllowed: boolean; description: string }[] = [
    // --- Kasus Positif (Hak Akses Sah) ---
    {
      role: 'mahasiswa',
      permission: 'materials:view',
      expectedAllowed: true,
      description: 'Mahasiswa berhak melihat materi perkuliahan'
    },
    {
      role: 'mahasiswa',
      permission: 'assignments:submit',
      expectedAllowed: true,
      description: 'Mahasiswa berhak mengumpulkan tugas perkuliahan'
    },
    {
      role: 'dosen',
      permission: 'materials:publish',
      expectedAllowed: true,
      description: 'Dosen berhak menerbitkan materi dan RPS'
    },
    {
      role: 'dosen',
      permission: 'assignments:grade',
      expectedAllowed: true,
      description: 'Dosen berhak menilai tugas mahasiswa'
    },
    {
      role: 'admin_akademik',
      permission: 'sync:execute',
      expectedAllowed: true,
      description: 'Admin akademik berhak menjalankan sinkronisasi data kelas'
    },
    {
      role: 'administrator_sistem',
      permission: 'audit:view',
      expectedAllowed: true,
      description: 'Administrator sistem berhak membuka jejak audit sistem'
    },

    // --- Kasus Negatif (Pencegahan Pelanggaran Akses / IDOR Protection) ---
    {
      role: 'mahasiswa',
      permission: 'materials:publish',
      expectedAllowed: false,
      description: 'Mahasiswa TIDAK BOLEH menerbitkan materi perkuliahan'
    },
    {
      role: 'mahasiswa',
      permission: 'assignments:grade',
      expectedAllowed: false,
      description: 'Mahasiswa TIDAK BOLEH menilai tugas mahasiswa lain'
    },
    {
      role: 'mahasiswa',
      permission: 'sync:execute',
      expectedAllowed: false,
      description: 'Mahasiswa TIDAK BOLEH menjalankan sinkronisasi akademik'
    },
    {
      role: 'mahasiswa',
      permission: 'audit:view',
      expectedAllowed: false,
      description: 'Mahasiswa TIDAK BOLEH melihat audit log keamanan'
    },
    {
      role: 'dosen',
      permission: 'system:configure',
      expectedAllowed: false,
      description: 'Dosen biasa TIDAK BOLEH mengubah konfigurasi sistem global'
    },
    {
      role: 'pimpinan',
      permission: 'materials:publish',
      expectedAllowed: false,
      description: 'Pimpinan institusi hanya memiliki visibilitas laporan, tidak mengelola konten kelas langsung'
    }
  ];

  const results: TestCaseResult[] = testCases.map((tc) => {
    const rolePerms = ROLE_PERMISSIONS[tc.role] || [];
    const actualAllowed = rolePerms.includes(tc.permission);
    const passed = actualAllowed === tc.expectedAllowed;

    return {
      role: tc.role,
      permission: tc.permission,
      expectedAllowed: tc.expectedAllowed,
      actualAllowed,
      passed,
      type: tc.expectedAllowed ? 'POSITIF' : 'NEGATIF',
      description: tc.description
    };
  });

  const totalPassed = results.filter((r) => r.passed).length;
  const totalFailed = results.length - totalPassed;

  return { results, totalPassed, totalFailed };
}
