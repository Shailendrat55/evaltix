"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../src/config/db");
async function runSeed() {
    console.log("Initializing database schema...");
    const schemaSql = fs_1.default.readFileSync(path_1.default.join(__dirname, "schema.sql"), "utf-8");
    await db_1.pool.query(schemaSql);
    console.log("Schema applied successfully.");
    const adminEmail = process.env.ADMIN_EMAIL ?? "admin@exam.com";
    const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@123456";
    const passwordHash = await bcrypt_1.default.hash(adminPassword, 12);
    await db_1.pool.query(`INSERT INTO users (email, name, role, password_hash, is_active)
     VALUES ($1, $2, 'ADMIN', $3, TRUE)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`, [adminEmail, "Default Admin", passwordHash]);
    console.log(`Default Admin created/updated: ${adminEmail}`);
    await db_1.pool.end();
}
runSeed().catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
});
