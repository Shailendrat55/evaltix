"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashSecret = hashSecret;
exports.compareSecret = compareSecret;
exports.generateAccessCode = generateAccessCode;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const security_1 = require("../config/security");
async function hashSecret(plain) {
    return bcrypt_1.default.hash(plain, security_1.BCRYPT_SALT_ROUNDS);
}
async function compareSecret(plain, hash) {
    return bcrypt_1.default.compare(plain, hash);
}
/**
 * Generates an 8-character random access code excluding visually ambiguous characters (0, O, 1, I, l).
 */
function generateAccessCode() {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    const bytes = crypto_1.default.randomBytes(8);
    let code = "";
    for (let i = 0; i < 8; i++) {
        code += chars[bytes[i] % chars.length];
    }
    return code;
}
