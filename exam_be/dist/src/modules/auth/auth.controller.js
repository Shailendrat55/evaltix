"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginHandler = loginHandler;
exports.refreshHandler = refreshHandler;
exports.logoutHandler = logoutHandler;
exports.meHandler = meHandler;
const authService = __importStar(require("./auth.service"));
const auth_validation_1 = require("./auth.validation");
const security_1 = require("../../config/security");
const AppError_1 = require("../../errors/AppError");
function getClientMetadata(req) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const deviceFingerprint = req.headers["x-device-fingerprint"] || req.headers["user-agent"] || "unknown";
    return { ipAddress, deviceFingerprint };
}
async function loginHandler(req, res, next) {
    try {
        const input = auth_validation_1.loginSchema.parse(req.body);
        const { ipAddress, deviceFingerprint } = getClientMetadata(req);
        console.log("Login attempt from IP:", ipAddress, "Device Fingerprint:", deviceFingerprint);
        const { accessToken, refreshToken, user } = await authService.login(input.email, input.credential, ipAddress, deviceFingerprint);
        res.cookie(security_1.REFRESH_COOKIE_NAME, refreshToken, security_1.REFRESH_COOKIE_OPTIONS);
        res.cookie(security_1.ACCESS_COOKIE_NAME, accessToken, security_1.ACCESS_COOKIE_OPTIONS);
        res.json({ user, accessToken });
    }
    catch (err) {
        next(err);
    }
}
async function refreshHandler(req, res, next) {
    try {
        const oldToken = req.cookies?.[security_1.REFRESH_COOKIE_NAME];
        if (!oldToken) {
            throw new AppError_1.UnauthorizedError("No refresh token provided", "NO_REFRESH_TOKEN");
        }
        const { ipAddress, deviceFingerprint } = getClientMetadata(req);
        try {
            const { accessToken, refreshToken } = await authService.refresh(oldToken, ipAddress, deviceFingerprint);
            res.cookie(security_1.REFRESH_COOKIE_NAME, refreshToken, security_1.REFRESH_COOKIE_OPTIONS);
            res.cookie(security_1.ACCESS_COOKIE_NAME, accessToken, security_1.ACCESS_COOKIE_OPTIONS);
            res.json({ accessToken });
        }
        catch (err) {
            res.clearCookie(security_1.REFRESH_COOKIE_NAME, { ...security_1.REFRESH_COOKIE_OPTIONS, maxAge: 0 });
            throw err;
        }
    }
    catch (err) {
        next(err);
    }
}
async function logoutHandler(req, res, next) {
    try {
        const token = req.cookies?.[security_1.REFRESH_COOKIE_NAME];
        const { ipAddress } = getClientMetadata(req);
        const userId = req.user?.sub;
        if (token) {
            await authService.logout(token, userId, ipAddress);
        }
        res.clearCookie(security_1.REFRESH_COOKIE_NAME, { ...security_1.REFRESH_COOKIE_OPTIONS, maxAge: 0 });
        res.clearCookie(security_1.ACCESS_COOKIE_NAME, { ...security_1.ACCESS_COOKIE_OPTIONS, maxAge: 0 });
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
}
async function meHandler(req, res, next) {
    try {
        if (!req.user?.sub) {
            throw new AppError_1.UnauthorizedError("Unauthenticated", "UNAUTHENTICATED");
        }
        const user = await authService.getCurrentUser(req.user.sub);
        res.json({ user });
    }
    catch (err) {
        next(err);
    }
}
