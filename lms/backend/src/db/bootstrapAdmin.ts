import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from './pool.js';
import { logger } from '../config/logger.js';

/**
 * SALAM LMS - SECURE ADMINISTRATOR BOOTSTRAP CLI
 * 
 * Digunakan oleh Sysadmin / DevOps untuk menginisialisasi atau mereset akun administrator_sistem
 * pada saat server pertama kali di-deploy tanpa password bawaan (hardcoded default).
 */
export async function bootstrapAdmin(
  username = 'admin',
  email = 'admin.lms@stai-alittihad.ac.id',
  customPassword?: string
): Promise<{ username: string; email: string; generatedPassword?: string }> {
  logger.info('Menjalankan Bootstrap Akun Administrator Sistem SALAM...');

  const password = customPassword || crypto.randomBytes(16).toString('hex') + '!Aa1';
  const passwordHash = await bcrypt.hash(password, 10);
  const adminId = 'usr-admin-sys';

  await db.query(`
    INSERT INTO users (
      id, username, password_hash, name, identity_number, email, role, study_program, is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'administrator_sistem', 'Pusat Teknologi Informasi & Pangkalan Data', TRUE)
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      password_hash = EXCLUDED.password_hash,
      email = EXCLUDED.email,
      is_active = TRUE,
      updated_at = NOW();
  `, [adminId, username, passwordHash, 'Administrator SALAM', '1990010101', email]);

  logger.info(`Akun Administrator Sistem berhasil dikonfigurasi: username='${username}', email='${email}'`);

  return {
    username,
    email,
    generatedPassword: customPassword ? undefined : password
  };
}

if (process.argv[1] && (process.argv[1].endsWith('bootstrapAdmin.ts') || process.argv[1].endsWith('bootstrapAdmin.js'))) {
  const args = process.argv.slice(2);
  let u = 'admin';
  let e = 'admin.lms@stai-alittihad.ac.id';
  let p: string | undefined = undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--username' && args[i + 1]) u = args[i + 1];
    if (args[i] === '--email' && args[i + 1]) e = args[i + 1];
    if (args[i] === '--password' && args[i + 1]) p = args[i + 1];
  }

  bootstrapAdmin(u, e, p)
    .then((res) => {
      console.log('\n======================================================');
      console.log(' SALAM LMS — BOOTSTRAP ADMINISTRATOR BERHASIL');
      console.log('======================================================');
      console.log(`Username : ${res.username}`);
      console.log(`Email    : ${res.email}`);
      if (res.generatedPassword) {
        console.log(`Password : ${res.generatedPassword}`);
        console.log('PERHATIAN: Salin kata sandi acak di atas sekarang.');
      } else {
        console.log('Password : [KATA SANDI KUSTOM DISIMPAN DENGAN BCRYPT]');
      }
      console.log('======================================================\n');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Bootstrap administrator gagal:', err);
      process.exit(1);
    });
}
