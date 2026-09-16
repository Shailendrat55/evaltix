"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const users_routes_1 = __importDefault(require("../modules/admin/users.routes"));
const authenticate_1 = require("../middleware/authenticate");
const requireRole_1 = require("../middleware/requireRole");
const apiRouter = (0, express_1.Router)();
apiRouter.use("/auth", auth_routes_1.default);
apiRouter.use("/admin/users", authenticate_1.authenticate, (0, requireRole_1.requireRole)("ADMIN"), users_routes_1.default);
exports.default = apiRouter;
