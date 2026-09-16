"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAccessCodeEmail = sendAccessCodeEmail;
/**
 * Email service abstraction for sending access codes to candidates.
 */
async function sendAccessCodeEmail(to, code) {
    // In production, integrate SES, SendGrid, or Nodemailer.
    console.log(`[EMAIL DISPATCH] Destination: ${to} | Access Code: ${code}`);
}
