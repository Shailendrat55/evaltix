import { CookieOptions } from "express";
import { env } from "./env";

export const BCRYPT_SALT_ROUNDS = 12;

export const ACCESS_TOKEN_TTL = `${env.ACCESS_TOKEN_EXPIRES_MINUTES}m`;
export const REFRESH_TOKEN_TTL_MS = env.REFRESH_TOKEN_EXPIRES_HOURS * 60 * 60 * 1000;

export const ACCESS_COOKIE_NAME = "accessToken";
export const REFRESH_COOKIE_NAME = "refreshToken";

const BASE_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "none",
};

export const ACCESS_COOKIE_OPTIONS: CookieOptions = {
  ...BASE_COOKIE_OPTIONS,
  maxAge: env.ACCESS_TOKEN_EXPIRES_MINUTES * 60 * 1000,
  path: "/",
};

export const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  ...BASE_COOKIE_OPTIONS,
  maxAge: REFRESH_TOKEN_TTL_MS,
  path: "/api/v1/auth",
};
