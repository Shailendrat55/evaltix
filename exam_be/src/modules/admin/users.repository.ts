import { pool } from "../../config/db";
import { CreateUserParams, UserSummary } from "./users.types";
import { sendCandidateWelcomeEmail } from "../../services/email.service";

export async function createUser(params: CreateUserParams): Promise<UserSummary> {
  const { rows } = await pool.query<UserSummary>(
    `INSERT INTO users (email, name, role, password_hash, access_code_hash)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, name, role, is_active, created_at`,
    [
      params.email.toLowerCase().trim(),
      params.name.trim(),
      params.role,
      params.passwordHash ?? null,
      params.accessCodeHash ?? null,
    ]
  );
  
  const user = rows[0];

  // Send welcome email if role is CANDIDATE
  if (params.role === "CANDIDATE") {
    try {
      await sendCandidateWelcomeEmail({
        email: user.email,
        name: user.name,
        accessCode: params.accessCode,
      });
    } catch (error) {
      console.error(`Failed to send welcome email to candidate ${user.email}:`, error);
      // Don't throw - user is created successfully, email is best-effort
    }
  }

  return user;
}

export async function listUsers(limit: number, offset: number): Promise<{ users: UserSummary[]; total: number }> {
  const countRes = await pool.query<{ count: string }>(`SELECT COUNT(*) FROM users`);
  const total = parseInt(countRes.rows[0]?.count || "0", 10);

  const { rows } = await pool.query<UserSummary>(
    `SELECT id, email, name, role, is_active, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return { users: rows, total };
}

export async function findUserById(id: string): Promise<UserSummary | null> {
  const { rows } = await pool.query<UserSummary>(
    `SELECT id, email, name, role, is_active, created_at
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function setActiveStatus(id: string, isActive: boolean): Promise<UserSummary | null> {
  const { rows } = await pool.query<UserSummary>(
    `UPDATE users
     SET is_active = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, email, name, role, is_active, created_at`,
    [isActive, id]
  );
  return rows[0] ?? null;
}

export async function getallCandidates(): Promise<UserSummary[]> {
  const { rows } = await pool.query<UserSummary>(
    `SELECT id, email, name, role, is_active, created_at
     FROM users WHERE role = 'CANDIDATE'`
  );
  return rows;
}

export async function revokeAllTokensForUser(userId: string): Promise<void> {
  await pool.query(`UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1`, [userId]);
}