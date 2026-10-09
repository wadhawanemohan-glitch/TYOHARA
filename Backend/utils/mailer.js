// =====================================================
// SEND EMAIL (Brevo REST API, no extra packages)
//
// Needs BREVO_API_KEY and MAIL_FROM_EMAIL (a sender
// address verified inside your Brevo account).
// =====================================================

const config = require("../config/env");

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");


// Throws if the email could not be sent.
const sendEmail = async ({ to, subject, html, text }) => {

  if (!config.BREVO_API_KEY || !config.MAIL_FROM_EMAIL) {
    throw new Error("Email is not configured");
  }

  const response = await fetch(BREVO_URL, {
    method: "POST",
    headers: {
      "api-key": config.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json"
    },
    body: JSON.stringify({
      sender: {
        name: config.MAIL_FROM_NAME,
        email: config.MAIL_FROM_EMAIL
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text
    }),
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`Email provider returned ${response.status}`);
  }
};


const sendVerificationEmail = async (to, name, code) => {

  const safeName = escapeHtml(name || "there");

  await sendEmail({
    to,
    subject: `${code} is your TYOHARA verification code`,
    text:
      `Hi ${name || "there"},\n\n` +
      `Your TYOHARA verification code is ${code}.\n` +
      `It is valid for 10 minutes. If you did not sign up, ignore this email.\n\n` +
      `TYOHARA`,
    html:
      `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#302722">` +
      `<h2 style="margin:0 0 12px">TYOHARA</h2>` +
      `<p>Hi ${safeName},</p>` +
      `<p>Use this code to verify your email address:</p>` +
      `<p style="font-size:32px;letter-spacing:8px;font-weight:bold;margin:20px 0">${escapeHtml(code)}</p>` +
      `<p style="color:#6b5d52">The code is valid for 10 minutes. If you did not sign up, you can ignore this email.</p>` +
      `</div>`
  });
};


module.exports = {
  sendEmail,
  sendVerificationEmail
};
