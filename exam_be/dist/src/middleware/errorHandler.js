"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const AppError_1 = require("../errors/AppError");
const zod_1 = require("zod");
function errorHandler(err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) {
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({
            error: err.errorCode,
            message: err.message,
            ...(err.details ? { details: err.details } : {}),
        });
    }
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: "VALIDATION_ERROR",
            message: "Invalid input payload",
            issues: err.errors.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
    }
    console.error("Unhandled Exception:", err);
    return res.status(500).json({
        error: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
    });
}
