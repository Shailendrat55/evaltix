import rateLimit from "express-rate-limit";
import { BadRequestError } from "../errors/AppError";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // 10 attempts
  keyGenerator: (req) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    return `${req.ip}_${email}`;
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new BadRequestError("Too many login attempts. Please try again in 15 minutes.", "RATE_LIMIT_EXCEEDED"));
  },
});