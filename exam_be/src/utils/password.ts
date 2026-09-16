import bcrypt from "bcrypt";
import crypto from "crypto";
import { BCRYPT_SALT_ROUNDS } from "../config/security";

export async function hashSecret(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_SALT_ROUNDS);
}

export async function compareSecret(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Generates an 8-character random access code excluding visually ambiguous characters (0, O, 1, I, l).
 */
export function generateAccessCode(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}