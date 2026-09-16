"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
const AppError_1 = require("../errors/AppError");
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError_1.UnauthorizedError("Authentication required", "UNAUTHENTICATED"));
        }
        if (!roles.includes(req.user.role)) {
            return next(new AppError_1.ForbiddenError("Insufficient permissions for this resource", "FORBIDDEN"));
        }
        next();
    };
}
