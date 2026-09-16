"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.listUsers = listUsers;
exports.findUserById = findUserById;
exports.setActiveStatus = setActiveStatus;
exports.getallCandidates = getallCandidates;
exports.revokeAllTokensForUser = revokeAllTokensForUser;
const db_1 = require("../../config/db");
const email_service_1 = require("../../services/email.service");
async function createUser(params) {
    const { rows } = await db_1.pool.query(`INSERT INTO users (email, name, role, password_hash, access_code_hash)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, name, role, is_active, created_at`, [
        params.email.toLowerCase().trim(),
        params.name.trim(),
        params.role,
        params.passwordHash ?? null,
        params.accessCodeHash ?? null,
    ]);
    const user = rows[0];
    // Send welcome email if role is CANDIDATE
    if (params.role === "CANDIDATE") {
        try {
            await (0, email_service_1.sendCandidateWelcomeEmail)({
                email: user.email,
                name: user.name,
                accessCode: params.accessCode,
            });
        }
        catch (error) {
            console.error(`Failed to send welcome email to candidate ${user.email}:`, error);
            // Don't throw - user is created successfully, email is best-effort
        }
    }
    return user;
}
async function listUsers(limit, offset) {
    const countRes = await db_1.pool.query(`SELECT COUNT(*) FROM users`);
    const total = parseInt(countRes.rows[0]?.count || "0", 10);
    const { rows } = await db_1.pool.query(`SELECT id, email, name, role, is_active, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`, [limit, offset]);
    return { users: rows, total };
}
async function findUserById(id) {
    const { rows } = await db_1.pool.query(`SELECT id, email, name, role, is_active, created_at
     FROM users WHERE id = $1`, [id]);
    return rows[0] ?? null;
}
async function setActiveStatus(id, isActive) {
    const { rows } = await db_1.pool.query(`UPDATE users
     SET is_active = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, email, name, role, is_active, created_at`, [isActive, id]);
    return rows[0] ?? null;
}
async function getallCandidates() {
    const { rows } = await db_1.pool.query(`SELECT id, email, name, role, is_active, created_at
     FROM users WHERE role = 'CANDIDATE'`);
    return rows;
}
async function revokeAllTokensForUser(userId) {
    await db_1.pool.query(`UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1`, [userId]);
}
