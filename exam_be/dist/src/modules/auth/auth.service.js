"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
exports.getCurrentUser = getCurrentUser;
const crypto_1 = __importDefault(require("crypto"));
const password_1 = require("../../utils/password");
const tokens_1 = require("../../utils/tokens");
const audit_1 = require("../../utils/audit");
const AppError_1 = require("../../errors/AppError");
const security_1 = require("../../config/security");
const repo = __importStar(require("./auth.repository"));
async function login(email, credential, ipAddress, deviceFingerprint) {
    const user = await repo.findUserByEmail(email);
    if (!user || !user.is_active) {
        if (user) {
            await (0, audit_1.writeAuditLog)({ userId: user.id, action: "LOGIN_FAILED", metadata: { reason: "INACTIVE_USER" }, ipAddress });
        }
        throw new AppError_1.UnauthorizedError("Invalid email or credential", "INVALID_CREDENTIALS");
    }
    const targetHash = user.role === "CANDIDATE" ? user.access_code_hash : user.password_hash;
    const isValid = targetHash ? await (0, password_1.compareSecret)(credential, targetHash) : false;
    if (!isValid) {
        await (0, audit_1.writeAuditLog)({ userId: user.id, action: "LOGIN_FAILED", metadata: { reason: "INVALID_CREDENTIAL" }, ipAddress });
        throw new AppError_1.UnauthorizedError("Invalid email or credential", "INVALID_CREDENTIALS");
    }
    const accessToken = (0, tokens_1.signAccessToken)({
        sub: user.id,
        email: user.email,
        role: user.role,
    });
    const refreshToken = (0, tokens_1.generateRefreshToken)();
    const familyId = crypto_1.default.randomUUID();
    const expiresAt = new Date(Date.now() + security_1.REFRESH_TOKEN_TTL_MS);
    await repo.insertRefreshToken({
        tokenHash: (0, tokens_1.hashToken)(refreshToken),
        userId: user.id,
        familyId,
        expiresAt,
        ipAddress,
        deviceFingerprint,
    });
    await (0, audit_1.writeAuditLog)({
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
async function refresh(oldRefreshToken, ipAddress, deviceFingerprint) {
    const oldHash = (0, tokens_1.hashToken)(oldRefreshToken);
    const record = await repo.findRefreshTokenByHash(oldHash);
    if (!record || record.expires_at.getTime() < Date.now()) {
        throw new AppError_1.UnauthorizedError("Session expired or invalid token", "SESSION_EXPIRED");
    }
    if (record.is_revoked) {
        // AUTH-FR-04: Presenting an already-rotated/revoked token -> revoke whole token family!
        await repo.revokeTokenFamily(record.family_id);
        await (0, audit_1.writeAuditLog)({
            userId: record.user_id,
            action: "REFRESH_REUSE_DETECTED",
            metadata: { familyId: record.family_id, ipAddress },
            ipAddress,
        });
        throw new AppError_1.UnauthorizedError("Session revoked due to security violation", "SESSION_REVOKED");
    }
    const user = await repo.findUserById(record.user_id);
    if (!user || !user.is_active) {
        await repo.revokeTokenFamily(record.family_id);
        throw new AppError_1.UnauthorizedError("Account is inactive or disabled", "SESSION_REVOKED");
    }
    const newRefreshToken = (0, tokens_1.generateRefreshToken)();
    const expiresAt = new Date(Date.now() + security_1.REFRESH_TOKEN_TTL_MS);
    await repo.rotateRefreshToken({
        oldTokenId: record.id,
        newTokenHash: (0, tokens_1.hashToken)(newRefreshToken),
        userId: user.id,
        familyId: record.family_id,
        expiresAt,
        ipAddress,
        deviceFingerprint,
    });
    const accessToken = (0, tokens_1.signAccessToken)({
        sub: user.id,
        email: user.email,
        role: user.role,
    });
    return {
        accessToken,
        refreshToken: newRefreshToken,
    };
}
async function logout(refreshToken, userId, ipAddress) {
    if (refreshToken) {
        const tokenHash = (0, tokens_1.hashToken)(refreshToken);
        await repo.revokeTokenByHash(tokenHash);
    }
    if (userId) {
        await (0, audit_1.writeAuditLog)({ userId, action: "LOGOUT", ipAddress });
    }
}
async function getCurrentUser(userId) {
    const user = await repo.findUserById(userId);
    if (!user || !user.is_active) {
        throw new AppError_1.UnauthorizedError("User not found or inactive", "USER_NOT_FOUND");
    }
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
}
