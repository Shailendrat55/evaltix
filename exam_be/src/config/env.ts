import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("4000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.string().default("5432"),
  DB_USER: z.string().default("postgres"),
  DB_PASSWORD: z.string().default("postgres"),
  DB_NAME: z.string().default("hire"),
  DATABASE_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().default("dev-access-secret-key-12345!"),
  REFRESH_TOKEN_EXPIRES_HOURS: z.coerce.number().default(12),
  ACCESS_TOKEN_EXPIRES_MINUTES: z.coerce.number().default(30),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error("Invalid environment configuration:", parseResult.error.format());
  throw new Error("Invalid environment variables");
}

const parsed = parseResult.data;

const dbUrl =
  parsed.DATABASE_URL ||
  `postgresql://${encodeURIComponent(parsed.DB_USER)}:${encodeURIComponent(parsed.DB_PASSWORD)}@${parsed.DB_HOST}:${parsed.DB_PORT}/${parsed.DB_NAME}`;

export const env = {
  ...parsed,
  DATABASE_URL: dbUrl,
};