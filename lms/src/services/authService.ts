import { UserAuthProfile, UserSession } from '../types/auth';
import { UserRole } from '../types/roles';
import { ROLE_PERMISSIONS, ROLE_LABELS } from '../constants/permissions';
import { auditService } from './auditService';

export const REGISTERED_USERS: UserAuthProfile[] = [
  {
    id: 'usr-mhs-01',
    username: '21010042',
    name: 'Ahmad Fauzi Rahman',
    identityNumber: '21.01.0042',
    email: 'ahmad.fauzi@staialittihad.ac.id',
    role: 'mahasiswa',
    roleLabel: ROLE_LABELS.mahasiswa,
    studyProgram: 'Pendidikan Agama Islam (S1)',
    permissions: ROLE_PERMISSIONS.mahasiswa,
  },
  {
    id: 'usr-dsn-01',
    username: '2112087501',
    name: 'Dr. H. M. Ridwan, M.Ag',
    identityNumber: '2112087501',
    email: 'm.ridwan@staialittihad.ac.id',
    role: 'dosen',
    roleLabel: ROLE_LABELS.dosen,
    studyProgram: 'Fakultas Tarbiyah / PAI',
    permissions: ROLE_PERMISSIONS.dosen,
  },
  {
    id: 'usr-dsn-pa',
    username: '2115047802',
    name: 'Dra. Hj. Siti Maryam, M.Pd.I',
    identityNumber: '2115047802',
    email: 'siti.maryam.pa@staialittihad.ac.id',
    role: 'dosen_pa',
    roleLabel: ROLE_LABELS.dosen_pa,
    studyProgram: 'Fakultas Tarbiyah (Dosen Wali PA)',
    permissions: ROLE_PERMISSIONS.dosen_pa,
  },
  {
    id: 'usr-kpr-01',
    username: '2118097201',
    name: "Dr. Ahmad Syafi'i, M.Ag",
    identityNumber: '2118097201',
    email: 'kaprodi.pai@staialittihad.ac.id',
    role: 'kaprodi',
    roleLabel: ROLE_LABELS.kaprodi,
    studyProgram: 'Program Studi S1 PAI',
    permissions: ROLE_PERMISSIONS.kaprodi,
  },
  {
    id: 'usr-adm-01',
    username: 'adminakademik',
    name: 'Budi Santoso, S.Kom',
    identityNumber: '198504122010011002',
    email: 'budi.santoso@staialittihad.ac.id',
    role: 'admin_akademik',
    roleLabel: ROLE_LABELS.admin_akademik,
    studyProgram: 'Biro Administrasi Akademik (BAAK)',
    permissions: ROLE_PERMISSIONS.admin_akademik,
  },
  {
    id: 'usr-pim-01',
    username: 'pimpinan',
    name: 'Prof. Dr. KH. Abdul Halim, M.A.',
    identityNumber: '196503121992031001',
    email: 'ketua@staialittihad.ac.id',
    role: 'pimpinan',
    roleLabel: ROLE_LABELS.pimpinan,
    studyProgram: 'Pimpinan STAI Al-Ittihad Cianjur',
    permissions: ROLE_PERMISSIONS.pimpinan,
  },
  {
    id: 'usr-sys-01',
    username: 'sysadmin',
    name: 'Super Administrator IT',
    identityNumber: 'SYS-ADMIN-01',
    email: 'it-center@staialittihad.ac.id',
    role: 'administrator_sistem',
    roleLabel: ROLE_LABELS.administrator_sistem,
    studyProgram: 'Pusat Data & Server IT',
    permissions: ROLE_PERMISSIONS.administrator_sistem,
  }
];

const AUTH_STORAGE_KEY = 'salam_auth_session';

class AuthService {
  public async login(identifier: string, kataSandi: string): Promise<{ user: UserAuthProfile; session: UserSession }> {
    // 1. Coba otentikasi riil ke backend database SIAKAD
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ username: identifier.trim(), password: kataSandi.trim() })
      });

      if (res.ok) {
        const json = await res.json();
        const apiUser = json.data?.user;
        const apiToken = json.data?.token;

        if (apiUser) {
          let mappedRole: UserRole = apiUser.role;
          if (apiUser.role === 'superadmin' || apiUser.role === 'administrator_sistem') {
            mappedRole = 'administrator_sistem';
          }

          const authUser: UserAuthProfile = {
            id: String(apiUser.id),
            username: apiUser.username,
            name: apiUser.name,
            identityNumber: apiUser.identityNumber || apiUser.identity_number || apiUser.username,
            email: apiUser.email,
            role: mappedRole,
            roleLabel: ROLE_LABELS[mappedRole] || mappedRole,
            studyProgram: apiUser.studyProgram || apiUser.study_program || 'Pendidikan Agama Islam (S1)',
            permissions: ROLE_PERMISSIONS[mappedRole] || ROLE_PERMISSIONS.mahasiswa
          };

          const now = Date.now();
          const session: UserSession = {
            token: apiToken || `salam_jwt_${authUser.role}_${authUser.id}_${now}`,
            createdAt: now,
            expiresAt: now + 7 * 24 * 60 * 60 * 1000,
            ipAddress: '127.0.0.1',
            userAgent: navigator.userAgent
          };

          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: authUser, session }));
          auditService.record(
            authUser.id,
            authUser.name,
            authUser.role,
            'LOGIN_BERHASIL',
            'AUTENTIKASI',
            `Login berhasil ke LMS menggunakan data akun riil SIAKAD (${authUser.name})`,
            'SUKSES'
          );

          return { user: authUser, session };
        }
      }
    } catch {
      // Fallback ke simulasi lokal jika backend offline
    }

    // 2. Simulasi penundaan jaringan / async verification fallback
    await new Promise((res) => setTimeout(res, 200));

    // Mencari user berdasarkan username/NIM/NIDN atau email
    const trimmed = identifier.trim().toLowerCase();
    const user = REGISTERED_USERS.find(
      (u) => u.username.toLowerCase() === trimmed || 
             u.identityNumber.toLowerCase() === trimmed || 
             u.email.toLowerCase() === trimmed
    );

    if (!user) {
      auditService.record(
        'unknown',
        identifier,
        'mahasiswa',
        'LOGIN_GAGAL',
        'AUTENTIKASI',
        `Upaya login gagal untuk identitas: ${identifier} (Pengguna tidak ditemukan)`,
        'GAGAL'
      );
      throw new Error('Identitas pengguna atau kata sandi tidak cocok.');
    }

    // Default password untuk demo: "salam123" atau apapun minimal 4 karakter
    if (kataSandi.trim().length < 4) {
      auditService.record(
        user.id,
        user.name,
        user.role,
        'LOGIN_GAGAL',
        'AUTENTIKASI',
        `Upaya login gagal untuk ${user.name}: Kata sandi tidak valid`,
        'GAGAL'
      );
      throw new Error('Kata sandi harus diisi dengan benar.');
    }

    // Buat sesi
    const now = Date.now();
    const session: UserSession = {
      token: `salam_jwt_${user.role}_${user.id}_${Date.now()}`,
      createdAt: now,
      expiresAt: now + 4 * 60 * 60 * 1000, // 4 jam masa aktif sesi
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent
    };

    // Simpan ke storage
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, session }));

    // Audit log login sukses
    auditService.record(
      user.id,
      user.name,
      user.role,
      'LOGIN_BERHASIL',
      'AUTENTIKASI',
      `Login berhasil sebagai ${user.roleLabel}`,
      'SUKSES'
    );

    return { user, session };
  }

  public getStoredSession(): { user: UserAuthProfile; session: UserSession } | null {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);

      // Cek apakah expired
      if (Date.now() > data.session.expiresAt) {
        this.logout(data.user);
        return null;
      }

      // Pastikan hak akses selalu mutakhir dengan ROLE_PERMISSIONS
      if (data.user && data.user.role && ROLE_PERMISSIONS[data.user.role as UserRole]) {
        data.user.permissions = ROLE_PERMISSIONS[data.user.role as UserRole];
      }

      return data;
    } catch {
      return null;
    }
  }

  public logout(currentUser?: UserAuthProfile | null): void {
    if (currentUser) {
      auditService.record(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'LOGOUT',
        'AUTENTIKASI',
        `Pengguna keluar dari sesi`,
        'SUKSES'
      );
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  public switchRoleDemo(role: UserRole): { user: UserAuthProfile; session: UserSession } {
    const user = REGISTERED_USERS.find((u) => u.role === role) || {
      id: `usr-${role}-demo`,
      username: `user_${role}`,
      name: `Pengguna ${ROLE_LABELS[role]}`,
      identityNumber: `ID-${role.toUpperCase()}`,
      email: `${role}@staialittihad.ac.id`,
      role,
      roleLabel: ROLE_LABELS[role],
      studyProgram: 'STAI Al-Ittihad',
      permissions: ROLE_PERMISSIONS[role],
    };

    const now = Date.now();
    const session: UserSession = {
      token: `salam_jwt_${user.role}_${user.id}_${Date.now()}`,
      createdAt: now,
      expiresAt: now + 4 * 60 * 60 * 1000,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, session }));

    auditService.record(
      user.id,
      user.name,
      user.role,
      'PERUBAHAN_PERAN_DEMO',
      'AUTENTIKASI',
      `Beralih ke peran ${ROLE_LABELS[role]}`,
      'SUKSES'
    );

    return { user, session };
  }

  public async loginWithSiakadSso(code: string): Promise<{ user: UserAuthProfile; session: UserSession }> {
    const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
    const baseUrl = apiBase.endsWith('/api') ? `${apiBase}/v1` : apiBase;

    const res = await fetch(`${baseUrl}/auth/siakad/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ code })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Verifikasi Single Sign-On (SSO) SIAKAD gagal.');
    }

    const json = await res.json();
    const ssoUser = json.data.user;
    const token = json.data.token;

    let mappedRole: UserRole = ssoUser.role;
    if (ssoUser.role === 'superadmin' || ssoUser.role === 'administrator_sistem') {
      mappedRole = 'administrator_sistem';
    }

    const userProfile: UserAuthProfile = {
      id: String(ssoUser.id),
      username: ssoUser.username,
      name: ssoUser.name,
      identityNumber: ssoUser.identityNumber || ssoUser.identity_number || '-',
      email: ssoUser.email,
      role: mappedRole,
      roleLabel: ROLE_LABELS[mappedRole] || ssoUser.role,
      studyProgram: ssoUser.studyProgram || ssoUser.study_program || 'STAI Al-Ittihad',
      permissions: ROLE_PERMISSIONS[mappedRole] || ROLE_PERMISSIONS.mahasiswa,
    };

    const now = Date.now();
    const session: UserSession = {
      token: token || `salam_sso_${userProfile.id}_${now}`,
      createdAt: now,
      expiresAt: now + 7 * 24 * 60 * 60 * 1000,
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: userProfile, session }));

    auditService.record(
      userProfile.id,
      userProfile.name,
      userProfile.role,
      'SSO_LOGIN_SUCCESS',
      'AUTENTIKASI',
      `Login berhasil via SSO SIAKAD sebagai ${userProfile.roleLabel}`,
      'SUKSES'
    );

    return { user: userProfile, session };
  }
}

export const authService = new AuthService();
