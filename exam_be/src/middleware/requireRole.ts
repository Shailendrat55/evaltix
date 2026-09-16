import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/authRequest";
import { ForbiddenError, UnauthorizedError } from "../errors/AppError";

export function requireRole(...roles: ("CANDIDATE" | "EVALUATOR" | "ADMIN")[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required", "UNAUTHENTICATED"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError("Insufficient permissions for this resource", "FORBIDDEN"));
    }

    next();
  };
}