import crypto from "crypto";
import { compareSecret } from "../../utils/password";
import { signAccessToken, generateRefreshToken, hashToken } from "../../utils/tokens";
import { writeAuditLog } from "../../utils/audit";
import { UnauthorizedError } from "../../errors/AppError";
import { REFRESH_TOKEN_TTL_MS } from "../../config/security";
import * as repo from "./auth.repository";

export async function login(
  email: string,
  credential: string,
  ipAddress?: string,
  deviceFingerprint?: string
) {
  const user = await repo.findUserByEmail(email);
  
  if (!user || !user.is_active) {
    if (user) {
      await writeAuditLog({ userId: user.id, action: "LOGIN_FAILED", metadata: { reason: "INACTIVE_USER" }, ipAddress });
    }
    throw new UnauthorizedError("Invalid email or credential", "INVALID_CREDENTIALS");
  }

  const targetHash = user.role === "CANDIDATE" ? user.access_code_hash : user.password_hash;
  const isValid = targetHash ? await compareSecret(credential, targetHash) : false;

  if (!isValid) {
    await writeAuditLog({ userId: user.id, action: "LOGIN_FAILED", metadata: { reason: "INVALID_CREDENTIAL" }, ipAddress });
    throw new UnauthorizedError("Invalid email or credential", "INVALID_CREDENTIALS");
  }

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken();
  const familyId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await repo.insertRefreshToken({
    tokenHash: hashToken(refreshToken),
    userId: user.id,
    familyId,
    expiresAt,
    ipAddress,
    deviceFingerprint,
  });

  await writeAuditLog({
    userId: user.id,
    action: "LOGIN_SUCCESS",
    metadata: { role: user.role, deviceFingerprint },
    ipAddress,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function refresh(oldRefreshToken: string, ipAddress?: string, deviceFingerprint?: string) {
  const oldHash = hashToken(oldRefreshToken);
  const record = await repo.findRefreshTokenByHash(oldHash);

  if (!record || record.expires_at.getTime() < Date.now()) {
    throw new UnauthorizedError("Session expired or invalid token", "SESSION_EXPIRED");
  }

  if (record.is_revoked) {
    // AUTH-FR-04: Presenting an already-rotated/revoked token -> revoke whole token family!
    await repo.revokeTokenFamily(record.family_id);
    await writeAuditLog({
      userId: record.user_id,
      action: "REFRESH_REUSE_DETECTED",
      metadata: { familyId: record.family_id, ipAddress },
      ipAddress,
    });
    throw new UnauthorizedError("Session revoked due to security violation", "SESSION_REVOKED");
  }

  const user = await repo.findUserById(record.user_id);
  if (!user || !user.is_active) {
    await repo.revokeTokenFamily(record.family_id);
    throw new UnauthorizedError("Account is inactive or disabled", "SESSION_REVOKED");
  }

  const newRefreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await repo.rotateRefreshToken({
    oldTokenId: record.id,
    newTokenHash: hashToken(newRefreshToken),
    userId: user.id,
    familyId: record.family_id,
    expiresAt,
    ipAddress,
    deviceFingerprint,
  });

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logout(refreshToken: string, userId?: string, ipAddress?: string): Promise<void> {
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await repo.revokeTokenByHash(tokenHash);
  }
  if (userId) {
    await writeAuditLog({ userId, action: "LOGOUT", ipAddress });
  }
}

export async function getCurrentUser(userId: string) {
  const user = await repo.findUserById(userId);
  if (!user || !user.is_active) {
    throw new UnauthorizedError("User not found or inactive", "USER_NOT_FOUND");
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}