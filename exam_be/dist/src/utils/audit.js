"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAuditLog = writeAuditLog;
const db_1 = require("../config/db");
async function writeAuditLog(entry) {
    try {
        await db_1.pool.query(`INSERT INTO audit_logs (user_id, action, metadata, ip_address)
       VALUES ($1, $2, $3, $4)`, [
            entry.userId ?? null,
            entry.action,
            entry.metadata ? JSON.stringify(entry.metadata) : null,
            entry.ipAddress ?? null,
        ]);
    }
    catch (err) {
        console.error("Failed to write audit log entry:", err);
    }
}
