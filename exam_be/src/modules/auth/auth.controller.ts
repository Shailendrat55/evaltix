import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";
import { loginSchema } from "./auth.validation";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_OPTIONS,
} from "../../config/security";
import { AuthenticatedRequest } from "../../types/authRequest";
import { UnauthorizedError } from "../../errors/AppError";

function getClientMetadata(req: Request) {
  const ipAddress = req.ip || req.socket.remoteAddress;
  const deviceFingerprint = (req.headers["x-device-fingerprint"] as string) || req.headers["user-agent"] || "unknown";
  return { ipAddress, deviceFingerprint };
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const { ipAddress, deviceFingerprint } = getClientMetadata(req);
    console.log("Login attempt from IP:", ipAddress, "Device Fingerprint:", deviceFingerprint);

    const { accessToken, refreshToken, user } = await authService.login(
      input.email,
      input.credential,
      ipAddress,
      deviceFingerprint
    );

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
    res.cookie(ACCESS_COOKIE_NAME, accessToken, ACCESS_COOKIE_OPTIONS);
    res.json({ user, accessToken });
  } catch (err) {
    next(err);
  }
}

export async function refreshHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const oldToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!oldToken) {
      throw new UnauthorizedError("No refresh token provided", "NO_REFRESH_TOKEN");
    }

    const { ipAddress, deviceFingerprint } = getClientMetadata(req);

    try {
      const { accessToken, refreshToken } = await authService.refresh(oldToken, ipAddress, deviceFingerprint);
      res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
      res.cookie(ACCESS_COOKIE_NAME, accessToken, ACCESS_COOKIE_OPTIONS);
      res.json({ accessToken });
    } catch (err) {
      res.clearCookie(REFRESH_COOKIE_NAME, { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
      throw err;
    }
  } catch (err) {
    next(err);
  }
}

export async function logoutHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    const { ipAddress } = getClientMetadata(req);
    const userId = req.user?.sub;

    if (token) {
      await authService.logout(token, userId, ipAddress);
    }

    res.clearCookie(REFRESH_COOKIE_NAME, { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
    res.clearCookie(ACCESS_COOKIE_NAME, { ...ACCESS_COOKIE_OPTIONS, maxAge: 0 });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function meHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user?.sub) {
      throw new UnauthorizedError("Unauthenticated", "UNAUTHENTICATED");
    }
    const user = await authService.getCurrentUser(req.user.sub);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}