export interface CreateUserParams {
  email: string;
  name: string;
  role: "CANDIDATE" | "EVALUATOR" | "ADMIN";
  passwordHash?: string;
  accessCodeHash?: string;
  accessCode?: string; // Optional for CANDIDATE role
}

export interface UserSummary {
  id: string;
  email: string;
  name: string;
  role: "CANDIDATE" | "EVALUATOR" | "ADMIN";
  is_active: boolean;
  created_at: Date;
}
