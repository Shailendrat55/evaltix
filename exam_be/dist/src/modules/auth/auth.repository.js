"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
exports.insertRefreshToken = insertRefreshToken;
exports.findRefreshTokenByHash = findRefreshTokenByHash;
exports.revokeTokenFamily = revokeTokenFamily;
exports.revokeTokenByHash = revokeTokenByHash;
exports.rotateRefreshToken = rotateRefreshToken;
const db_1 = require("../../config/db");
async function findUserByEmail(email) {
    const { rows } = await db_1.pool.query(`SELECT id, email, name, role, password_hash, access_code_hash, is_active, created_at, updated_at
     FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
    return rows[0] ?? null;
}
async function findUserById(id) {
    const { rows } = await db_1.pool.query(`SELECT id, email, name, role, password_hash, access_code_hash, is_active, created_at, updated_at
     FROM users WHERE id = $1`, [id]);
    return rows[0] ?? null;
}
async function insertRefreshToken(params) {
    await db_1.pool.query(`INSERT INTO refresh_tokens (token_hash, user_id, family_id, expires_at, ip_address, device_fingerprint)
     VALUES ($1, $2, $3, $4, $5, $6)`, [
        params.tokenHash,
        params.userId,
        params.familyId,
        params.expiresAt,
        params.ipAddress ?? null,
        params.deviceFingerprint ?? null,
    ]);
}
async function findRefreshTokenByHash(tokenHash) {
    const { rows } = await db_1.pool.query(`SELECT id, token_hash, user_id, family_id, is_revoked, expires_at, ip_address, device_fingerprint, created_at
     FROM refresh_tokens WHERE token_hash = $1`, [tokenHash]);
    return rows[0] ?? null;
}
async function revokeTokenFamily(familyId) {
    await db_1.pool.query(`UPDATE refresh_tokens SET is_revoked = TRUE WHERE family_id = $1`, [familyId]);
}
async function revokeTokenByHash(tokenHash) {
    await db_1.pool.query(`UPDATE refresh_tokens SET is_revoked = TRUE WHERE token_hash = $1`, [tokenHash]);
}
async function rotateRefreshToken(params) {
    const client = await db_1.pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(`UPDATE refresh_tokens SET is_revoked = TRUE WHERE id = $1`, [params.oldTokenId]);
        await client.query(`INSERT INTO refresh_tokens (token_hash, user_id, family_id, expires_at, ip_address, device_fingerprint)
       VALUES ($1, $2, $3, $4, $5, $6)`, [
            params.newTokenHash,
            params.userId,
            params.familyId,
            params.expiresAt,
            params.ipAddress ?? null,
            params.deviceFingerprint ?? null,
        ]);
        await client.query("COMMIT");
    }
    catch (err) {
        await client.query("ROLLBACK");
        throw err;
    }
    finally {
        client.release();
    }
}
