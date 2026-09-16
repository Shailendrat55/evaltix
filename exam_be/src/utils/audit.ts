import { pool } from "../config/db";

export interface AuditEntry {
  userId?: string | null;
  action: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, metadata, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [
        entry.userId ?? null,
        entry.action,
        entry.metadata ? JSON.stringify(entry.metadata) : null,
        entry.ipAddress ?? null,
      ]
    );
  } catch (err) {
    console.error("Failed to write audit log entry:", err);
  }
}