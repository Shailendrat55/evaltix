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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.listUsers = listUsers;
exports.updateUserStatus = updateUserStatus;
exports.getallCandidates = getallCandidates;
const password_1 = require("../../utils/password");
const mailer_1 = require("../../utils/mailer");
const audit_1 = require("../../utils/audit");
const AppError_1 = require("../../errors/AppError");
const repo = __importStar(require("./users.repository"));
async function createUser(input, actorId, ipAddress) {
    try {
        if (input.role === "CANDIDATE") {
            const accessCode = (0, password_1.generateAccessCode)();
            const accessCodeHash = await (0, password_1.hashSecret)(accessCode);
            const user = await repo.createUser({
                email: input.email,
                name: input.name,
                role: "CANDIDATE",
                accessCodeHash,
                accessCode, // Store the plain access code temporarily for email sending
            });
            await (0, mailer_1.sendAccessCodeEmail)(user.email, accessCode);
            await (0, audit_1.writeAuditLog)({
                userId: actorId,
                action: "CANDIDATE_CREATED",
                metadata: { targetUserId: user.id, email: user.email },
                ipAddress,
            });
            return { user, generatedAccessCode: accessCode };
        }
        else {
            const passwordHash = await (0, password_1.hashSecret)(input.password);
            const user = await repo.createUser({
                email: input.email,
                name: input.name,
                role: input.role,
                passwordHash,
            });
            await (0, audit_1.writeAuditLog)({
                userId: actorId,
                action: "STAFF_CREATED",
                metadata: { targetUserId: user.id, role: user.role, email: user.email },
                ipAddress,
            });
            return { user };
        }
    }
    catch (err) {
        if (err.code === "23505") {
            throw new AppError_1.ConflictError(`User with email '${input.email}' already exists`, "EMAIL_ALREADY_EXISTS");
        }
        throw err;
    }
}
async function listUsers(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { users, total } = await repo.listUsers(limit, offset);
    return {
        users,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}
async function updateUserStatus(targetUserId, isActive, actorId, ipAddress) {
    const existing = await repo.findUserById(targetUserId);
    if (!existing) {
        throw new AppError_1.NotFoundError("User not found", "USER_NOT_FOUND");
    }
    const updatedUser = await repo.setActiveStatus(targetUserId, isActive);
    if (!isActive) {
        // AUTH-FR-09: Revoke all refresh tokens immediately upon deactivation
        await repo.revokeAllTokensForUser(targetUserId);
        await (0, audit_1.writeAuditLog)({
            userId: actorId,
            action: "USER_DEACTIVATED",
            metadata: { targetUserId },
            ipAddress,
        });
    }
    else {
        await (0, audit_1.writeAuditLog)({
            userId: actorId,
            action: "USER_REACTIVATED",
            metadata: { targetUserId },
            ipAddress,
        });
    }
    return updatedUser;
}
async function getallCandidates() {
    return await repo.getallCandidates();
}
