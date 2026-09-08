import { db } from './pool.js';

let cachedPasswordColumn: 'password' | 'password_hash' | null = null;

export async function getPasswordColumn(client: any = db): Promise<'password' | 'password_hash'> {
  if (cachedPasswordColumn) return cachedPasswordColumn;
  try {
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('password', 'password_hash')
    `);
    const cols = res.rows.map((r: any) => r.column_name);
    if (cols.includes('password')) {
      cachedPasswordColumn = 'password';
    } else {
      cachedPasswordColumn = 'password_hash';
    }
    return cachedPasswordColumn;
  } catch {
    return 'password';
  }
}

export async function executeUserInsert(client: any, params: {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  identityNumber: string;
  email: string;
  role: string;
  studyProgram: string | null;
  isActive?: boolean;
}) {
  const pwdCol = await getPasswordColumn(client);
  return await client.query(`
    INSERT INTO users (
      id, username, ${pwdCol}, name, identity_number, email, role, study_program, is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [
    params.id,
    params.username,
    params.passwordHash,
    params.name,
    params.identityNumber,
    params.email,
    params.role,
    params.studyProgram,
    params.isActive ?? true
  ]);
}

export async function executeUserPasswordUpdate(client: any, userId: string, passwordHash: string) {
  const pwdCol = await getPasswordColumn(client);
  return await client.query(`
    UPDATE users 
    SET ${pwdCol} = $1, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $2
  `, [passwordHash, userId]);
}
