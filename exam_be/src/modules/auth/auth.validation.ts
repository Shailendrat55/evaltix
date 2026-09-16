import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  credential: z.string().min(1, "Credential (password or access code) is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
