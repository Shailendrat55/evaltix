import { z } from "zod";

export const createUserSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    role: z.enum(["CANDIDATE", "EVALUATOR", "ADMIN"]),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
    accessCode: z.string().optional(), // Optional for CANDIDATE role
  })
  .refine(
    (data) => {
      if ((data.role === "ADMIN" || data.role === "EVALUATOR") && !data.password) {
        return false;
      }
      return true;
    },
    {
      message: "Password is required for ADMIN and EVALUATOR roles",
      path: ["password"],
    }
  );

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const patchUserSchema = z.object({
  isActive: z.boolean({ required_error: "isActive boolean is required" }),
});

export type PatchUserInput = z.infer<typeof patchUserSchema>;

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});


export const getallCandidates = z.object({});

