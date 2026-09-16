"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default("4000"),
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    DB_HOST: zod_1.z.string().default("localhost"),
    DB_PORT: zod_1.z.string().default("5432"),
    DB_USER: zod_1.z.string().default("postgres"),
    DB_PASSWORD: zod_1.z.string().default("postgres"),
    DB_NAME: zod_1.z.string().default("hire"),
    DATABASE_URL: zod_1.z.string().optional(),
    JWT_ACCESS_SECRET: zod_1.z.string().default("dev-access-secret-key-12345!"),
    REFRESH_TOKEN_EXPIRES_HOURS: zod_1.z.coerce.number().default(12),
    ACCESS_TOKEN_EXPIRES_MINUTES: zod_1.z.coerce.number().default(30),
});
const parseResult = envSchema.safeParse(process.env);
if (!parseResult.success) {
    console.error("Invalid environment configuration:", parseResult.error.format());
    throw new Error("Invalid environment variables");
}
const parsed = parseResult.data;
const dbUrl = parsed.DATABASE_URL ||
    `postgresql://${encodeURIComponent(parsed.DB_USER)}:${encodeURIComponent(parsed.DB_PASSWORD)}@${parsed.DB_HOST}:${parsed.DB_PORT}/${parsed.DB_NAME}`;
exports.env = {
    ...parsed,
    DATABASE_URL: dbUrl,
};
