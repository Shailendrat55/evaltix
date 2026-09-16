import { Request } from "express";

export interface UserPayload {
  sub: string;
  email: string;
  role: "CANDIDATE" | "EVALUATOR" | "ADMIN";
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}
