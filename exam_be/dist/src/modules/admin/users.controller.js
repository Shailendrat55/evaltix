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
exports.createUserHandler = createUserHandler;
exports.listUsersHandler = listUsersHandler;
exports.patchUserHandler = patchUserHandler;
exports.getAllCandidatesHandler = getAllCandidatesHandler;
const usersService = __importStar(require("./users.service"));
const users_validation_1 = require("./users.validation");
async function createUserHandler(req, res, next) {
    try {
        const input = users_validation_1.createUserSchema.parse(req.body);
        const actorId = req.user.sub;
        const ipAddress = req.ip || req.socket.remoteAddress;
        const result = await usersService.createUser(input, actorId, ipAddress);
        res.status(201).json(result);
    }
    catch (err) {
        next(err);
    }
}
async function listUsersHandler(req, res, next) {
    try {
        const query = users_validation_1.listUsersQuerySchema.parse(req.query);
        const result = await usersService.listUsers(query.page, query.limit);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
async function patchUserHandler(req, res, next) {
    try {
        const { id } = req.params;
        const input = users_validation_1.patchUserSchema.parse(req.body);
        const actorId = req.user.sub;
        const ipAddress = req.ip || req.socket.remoteAddress;
        const user = await usersService.updateUserStatus(id, input.isActive, actorId, ipAddress);
        res.json({ user });
    }
    catch (err) {
        next(err);
    }
}
async function getAllCandidatesHandler(req, res, next) {
    try {
        const candidates = await usersService.getallCandidates();
        res.json({ candidates });
    }
    catch (err) {
        next(err);
    }
}
