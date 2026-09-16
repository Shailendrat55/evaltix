import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/authRequest";
import { verifyAccessToken } from "../utils/tokens";
import { UnauthorizedError } from "../errors/AppError";
import { ACCESS_COOKIE_NAME } from "../config/security";

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.[ACCESS_COOKIE_NAME];
  console.log("Authentication attempt. Cookie token:", cookieToken, "Header token:", authHeader);
  const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
  const token = cookieToken || headerToken;

  if (!token) {
    return next(new UnauthorizedError("Missing or invalid authentication token", "UNAUTHENTICATED"));
  }
  try {
    const payload = verifyAccessToken(token);
    console.log("payload", payload);
    req.user = payload;
    next();
  } catch {
    return next(new UnauthorizedError("Access token expired or invalid", "INVALID_OR_EXPIRED_TOKEN"));
  }
}