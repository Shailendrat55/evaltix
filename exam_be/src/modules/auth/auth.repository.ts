import { pool } from "../../config/db";
import { UserRow, RefreshTokenRow, InsertRefreshTokenParams, RotateRefreshTokenParams } from "./auth.types";

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(
    `SELECT id, email, name, role, password_hash, access_code_hash, is_active, created_at, updated_at
     FROM users WHERE email = $1`,
    [email.toLowerCase().trim()]
  );
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(
    `SELECT id, email, name, role, password_hash, access_code_hash, is_active, created_at, updated_at
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function insertRefreshToken(params: InsertRefreshTokenParams): Promise<void> {
  await pool.query(
    `INSERT INTO refresh_tokens (token_hash, user_id, family_id, expires_at, ip_address, device_fingerprint)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      params.tokenHash,
      params.userId,
      params.familyId,
      params.expiresAt,
      params.ipAddress ?? null,
      params.deviceFingerprint ?? null,
    ]
  );
}

export async function findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenRow | null> {
  const { rows } = await pool.query<RefreshTokenRow>(
    `SELECT id, token_hash, user_id, family_id, is_revoked, expires_at, ip_address, device_fingerprint, created_at
     FROM refresh_tokens WHERE token_hash = $1`,
    [tokenHash]
  );
  return rows[0] ?? null;
}

export async function revokeTokenFamily(familyId: string): Promise<void> {
  await pool.query(`UPDATE refresh_tokens SET is_revoked = TRUE WHERE family_id = $1`, [familyId]);
}

export async function revokeTokenByHash(tokenHash: string): Promise<void> {
  await pool.query(`UPDATE refresh_tokens SET is_revoked = TRUE WHERE token_hash = $1`, [tokenHash]);
}

export async function rotateRefreshToken(params: RotateRefreshTokenParams): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`UPDATE refresh_tokens SET is_revoked = TRUE WHERE id = $1`, [params.oldTokenId]);
    await client.query(
      `INSERT INTO refresh_tokens (token_hash, user_id, family_id, expires_at, ip_address, device_fingerprint)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        params.newTokenHash,
        params.userId,
        params.familyId,
        params.expiresAt,
        params.ipAddress ?? null,
        params.deviceFingerprint ?? null,
      ]
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}