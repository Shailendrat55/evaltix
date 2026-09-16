"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCandidateWelcomeEmail = sendCandidateWelcomeEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});
async function sendCandidateWelcomeEmail(params) {
    const { email, name, accessCode } = params;
    const accessCodeSection = accessCode
        ? `<p><strong>Your Access Code:</strong> <code>${accessCode}</code></p>`
        : "";
    await transporter.sendMail({
        from: process.env.EMAIL_FROM || "noreply@yourapp.com",
        to: email,
        subject: "Your Candidate Account Has Been Created",
        html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Candidate Account</title>
      </head>

      <body style="
        margin: 0;
        padding: 0;
        background-color: #f4f7fb;
        font-family: Arial, Helvetica, sans-serif;
        color: #1f2937;
      ">

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="padding: 40px 15px;"
        >
          <tr>
            <td align="center">

              <table
                width="600"
                cellpadding="0"
                cellspacing="0"
                style="
                  max-width: 600px;
                  width: 100%;
                  background: #ffffff;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                "
              >

                <!-- Header -->
                <tr>
                  <td style="
                    background: #2563eb;
                    padding: 30px;
                    text-align: center;
                  ">
                    <h1 style="
                      margin: 0;
                      color: #ffffff;
                      font-size: 26px;
                    ">
                      Welcome to Our Platform
                    </h1>

                    <p style="
                      margin: 8px 0 0;
                      color: #dbeafe;
                      font-size: 14px;
                    ">
                      Your candidate account is ready
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 35px;">

                    <h2 style="
                      margin-top: 0;
                      font-size: 22px;
                      color: #111827;
                    ">
                      Hello ${name},
                    </h2>

                    <p style="
                      font-size: 15px;
                      line-height: 1.7;
                      color: #4b5563;
                    ">
                      Your candidate account has been successfully created.
                      You can now access the platform and participate in your
                      assigned assessments.
                    </p>

                    <!-- Account Details -->
                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      style="
                        margin: 25px 0;
                        background: #f8fafc;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                      "
                    >
                      <tr>
                        <td style="padding: 20px;">

                          <h3 style="
                            margin: 0 0 15px;
                            color: #111827;
                            font-size: 16px;
                          ">
                            Account Details
                          </h3>

                          <p style="
                            margin: 8px 0;
                            font-size: 14px;
                            color: #4b5563;
                          ">
                            <strong>Email:</strong> ${email}
                          </p>

                          <p style="
                            margin: 8px 0;
                            font-size: 14px;
                            color: #4b5563;
                          ">
                            <strong>Name:</strong> ${name}
                          </p>

                        </td>
                      </tr>
                    </table>

                    <!-- Access Code -->
                    ${accessCodeSection}

                    <!-- Login Button -->
                    <div style="
                      text-align: center;
                      margin: 30px 0;
                    ">
                      <a
                        href="${process.env.APP_URL}/login"
                        style="
                          display: inline-block;
                          background: #2563eb;
                          color: #ffffff;
                          text-decoration: none;
                          padding: 14px 30px;
                          border-radius: 8px;
                          font-size: 15px;
                          font-weight: bold;
                        "
                      >
                        Access Candidate Portal
                      </a>
                    </div>

                    <p style="
                      font-size: 13px;
                      line-height: 1.6;
                      color: #6b7280;
                    ">
                      Please keep your access code confidential and do not
                      share it with anyone.
                    </p>

                    <p style="
                      font-size: 13px;
                      line-height: 1.6;
                      color: #6b7280;
                    ">
                      If you did not expect this account to be created,
                      please contact your administrator.
                    </p>

                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="
                    background: #f8fafc;
                    padding: 20px 30px;
                    text-align: center;
                    border-top: 1px solid #e5e7eb;
                  ">
                    <p style="
                      margin: 0;
                      font-size: 12px;
                      color: #9ca3af;
                    ">
                      This is an automated email. Please do not reply to this message.
                    </p>
                    <p style="
                      margin: 8px 0 0;
                      font-size: 12px;
                      color: #9ca3af;
                    ">
                      © ${new Date().getFullYear()} Our Platform. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>

      </body>
    </html>
  `,
    });
}
