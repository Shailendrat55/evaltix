import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { pool } from "../src/config/db";

async function runSeed() {
  console.log("Initializing database schema...");
  const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
  await pool.query(schemaSql);
  console.log("Schema applied successfully.");

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@exam.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@123456";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await pool.query(
    `INSERT INTO users (email, name, role, password_hash, is_active)
     VALUES ($1, $2, 'ADMIN', $3, TRUE)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [adminEmail, "Default Admin", passwordHash]
  );

  console.log(`Default Admin created/updated: ${adminEmail}`);
  await pool.end();
}

runSeed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
