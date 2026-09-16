"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getallCandidates = exports.listUsersQuerySchema = exports.patchUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z
    .object({
    email: zod_1.z.string().email("Invalid email format"),
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    role: zod_1.z.enum(["CANDIDATE", "EVALUATOR", "ADMIN"]),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters").optional(),
    accessCode: zod_1.z.string().optional(), // Optional for CANDIDATE role
})
    .refine((data) => {
    if ((data.role === "ADMIN" || data.role === "EVALUATOR") && !data.password) {
        return false;
    }
    return true;
}, {
    message: "Password is required for ADMIN and EVALUATOR roles",
    path: ["password"],
});
exports.patchUserSchema = zod_1.z.object({
    isActive: zod_1.z.boolean({ required_error: "isActive boolean is required" }),
});
exports.listUsersQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
exports.getallCandidates = zod_1.z.object({});
