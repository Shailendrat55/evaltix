"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const tokens_1 = require("../utils/tokens");
const AppError_1 = require("../errors/AppError");
const security_1 = require("../config/security");
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.[security_1.ACCESS_COOKIE_NAME];
    console.log("Authentication attempt. Cookie token:", cookieToken, "Header token:", authHeader);
    const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    const token = cookieToken || headerToken;
    if (!token) {
        return next(new AppError_1.UnauthorizedError("Missing or invalid authentication token", "UNAUTHENTICATED"));
    }
    try {
        const payload = (0, tokens_1.verifyAccessToken)(token);
        console.log("payload", payload);
        req.user = payload;
        next();
    }
    catch {
        return next(new AppError_1.UnauthorizedError("Access token expired or invalid", "INVALID_OR_EXPIRED_TOKEN"));
    }
}
