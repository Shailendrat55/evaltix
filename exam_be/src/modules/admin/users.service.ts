import { hashSecret, generateAccessCode } from "../../utils/password";
import { sendAccessCodeEmail } from "../../utils/mailer";
import { writeAuditLog } from "../../utils/audit";
import { ConflictError, NotFoundError } from "../../errors/AppError";
import * as repo from "./users.repository";
import { CreateUserInput } from "./users.validation";

export async function createUser(input: CreateUserInput, actorId: string, ipAddress?: string) {
  try {
    if (input.role === "CANDIDATE") {
      const accessCode = generateAccessCode();
      const accessCodeHash = await hashSecret(accessCode);

      const user = await repo.createUser({
        email: input.email,
        name: input.name,
        role: "CANDIDATE",
        accessCodeHash,
        accessCode, // Store the plain access code temporarily for email sending
      });

      await sendAccessCodeEmail(user.email, accessCode);
      await writeAuditLog({
        userId: actorId,
        action: "CANDIDATE_CREATED",
        metadata: { targetUserId: user.id, email: user.email },
        ipAddress,
      });

      return { user, generatedAccessCode: accessCode };
    } else {
      const passwordHash = await hashSecret(input.password!);
      const user = await repo.createUser({
        email: input.email,
        name: input.name,
        role: input.role,
        passwordHash,
      });

      await writeAuditLog({
        userId: actorId,
        action: "STAFF_CREATED",
        metadata: { targetUserId: user.id, role: user.role, email: user.email },
        ipAddress,
      });

      return { user };
    }
  } catch (err: any) {
    if (err.code === "23505") {
      throw new ConflictError(`User with email '${input.email}' already exists`, "EMAIL_ALREADY_EXISTS");
    }
    throw err;
  }
}

export async function listUsers(page = 1, limit = 20) {
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

export async function updateUserStatus(targetUserId: string, isActive: boolean, actorId: string, ipAddress?: string) {
  const existing = await repo.findUserById(targetUserId);
  if (!existing) {
    throw new NotFoundError("User not found", "USER_NOT_FOUND");
  }

  const updatedUser = await repo.setActiveStatus(targetUserId, isActive);

  if (!isActive) {
    // AUTH-FR-09: Revoke all refresh tokens immediately upon deactivation
    await repo.revokeAllTokensForUser(targetUserId);
    await writeAuditLog({
      userId: actorId,
      action: "USER_DEACTIVATED",
      metadata: { targetUserId },
      ipAddress,
    });
  } else {
    await writeAuditLog({
      userId: actorId,
      action: "USER_REACTIVATED",
      metadata: { targetUserId },
      ipAddress,
    });
  }

  return updatedUser;
}

export async function getallCandidates() {
  return await repo.getallCandidates();
}