"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_COOKIE_OPTIONS = exports.ACCESS_COOKIE_OPTIONS = exports.REFRESH_COOKIE_NAME = exports.ACCESS_COOKIE_NAME = exports.REFRESH_TOKEN_TTL_MS = exports.ACCESS_TOKEN_TTL = exports.BCRYPT_SALT_ROUNDS = void 0;
const env_1 = require("./env");
exports.BCRYPT_SALT_ROUNDS = 12;
exports.ACCESS_TOKEN_TTL = `${env_1.env.ACCESS_TOKEN_EXPIRES_MINUTES}m`;
exports.REFRESH_TOKEN_TTL_MS = env_1.env.REFRESH_TOKEN_EXPIRES_HOURS * 60 * 60 * 1000;
exports.ACCESS_COOKIE_NAME = "accessToken";
exports.REFRESH_COOKIE_NAME = "refreshToken";
const BASE_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env_1.env.NODE_ENV === "production",
    sameSite: "none",
};
exports.ACCESS_COOKIE_OPTIONS = {
    ...BASE_COOKIE_OPTIONS,
    maxAge: env_1.env.ACCESS_TOKEN_EXPIRES_MINUTES * 60 * 1000,
    path: "/",
};
exports.REFRESH_COOKIE_OPTIONS = {
    ...BASE_COOKIE_OPTIONS,
    maxAge: exports.REFRESH_TOKEN_TTL_MS,
    path: "/api/v1/auth",
};
