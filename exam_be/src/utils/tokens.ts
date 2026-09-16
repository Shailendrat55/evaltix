import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";
import { ACCESS_TOKEN_TTL } from "../config/security";
import { UserPayload } from "../types/authRequest";

export function signAccessToken(payload: UserPayload): string {
  const expiresInSeconds = env.ACCESS_TOKEN_EXPIRES_MINUTES * 60;
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: expiresInSeconds });
}

export function verifyAccessToken(token: string): UserPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as UserPayload;
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}