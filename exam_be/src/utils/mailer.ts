/**
 * Email service abstraction for sending access codes to candidates.
 */
export async function sendAccessCodeEmail(to: string, code: string): Promise<void> {
  // In production, integrate SES, SendGrid, or Nodemailer.
  console.log(`[EMAIL DISPATCH] Destination: ${to} | Access Code: ${code}`);
}