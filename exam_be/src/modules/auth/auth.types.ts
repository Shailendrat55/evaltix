export interface UserRow {
  id: string;
  email: string;
  name: string;
  role: "CANDIDATE" | "EVALUATOR" | "ADMIN";
  password_hash: string | null;
  access_code_hash: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RefreshTokenRow {
  id: string;
  token_hash: string;
  user_id: string;
  family_id: string;
  is_revoked: boolean;
  expires_at: Date;
  ip_address: string | null;
  device_fingerprint: string | null;
  created_at: Date;
}

export interface InsertRefreshTokenParams {
  tokenHash: string;
  userId: string;
  familyId: string;
  expiresAt: Date;
  ipAddress?: string;
  deviceFingerprint?: string;
}

export interface RotateRefreshTokenParams {
  oldTokenId: string;
  newTokenHash: string;
  userId: string;
  familyId: string;
  expiresAt: Date;
  ipAddress?: string;
  deviceFingerprint?: string;
}
