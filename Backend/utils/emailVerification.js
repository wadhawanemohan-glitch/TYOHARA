// =====================================================
// EMAIL VERIFICATION CODES
//
// A 6-digit code is emailed to the customer. Only a hash of
// it is stored, it expires after 10 minutes, allows 5 wrong
// tries, and a new one can be requested once a minute.
// =====================================================

const crypto = require("crypto");

const { JWT_SECRET } = require("../config/env");

const { sendVerificationEmail } = require("./mailer");

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;


const generateCode = () =>
  String(crypto.randomInt(0, 1000000)).padStart(6, "0");


const hashCode = (email, code) =>
  crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${email}|${code}`)
    .digest("hex");


const codeMatches = (email, code, storedHash) => {

  if (typeof code !== "string" || typeof storedHash !== "string") {
    return false;
  }

  const expected = Buffer.from(storedHash, "hex");
  const actual = Buffer.from(hashCode(email, code), "hex");

  return (
    expected.length === actual.length &&
    crypto.timingSafeEqual(expected, actual)
  );
};


// Creates a code, saves its hash on the user and emails it.
// Returns { sent: false } when a code was sent less than a minute ago.
// Throws when the email itself could not be sent.
const issueCode = async (user) => {

  const now = Date.now();

  if (
    user.verifySentAt &&
    now - user.verifySentAt.getTime() < RESEND_COOLDOWN_MS
  ) {
    return { sent: false };
  }

  const code = generateCode();

  user.verifyCodeHash = hashCode(user.email, code);
  user.verifyCodeExpires = new Date(now + CODE_TTL_MS);
  user.verifyAttempts = 0;
  user.verifySentAt = new Date(now);

  await user.save();

  try {

    await sendVerificationEmail(user.email, user.name, code);

  } catch (error) {

    // Let the customer try again straight away
    user.verifySentAt = undefined;
    await user.save();

    throw error;
  }

  return { sent: true };
};


module.exports = {
  MAX_ATTEMPTS,
  generateCode,
  hashCode,
  codeMatches,
  issueCode
};
