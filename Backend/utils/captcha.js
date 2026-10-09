// =====================================================
// CAPTCHA CHECK (Cloudflare Turnstile, no extra packages)
//
// Off unless TURNSTILE_SECRET_KEY is set. When it is set,
// signup and login need a valid token from the website.
// =====================================================

const config = require("../config/env");

const VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const captchaEnabled = Boolean(config.TURNSTILE_SECRET_KEY);

// Returns true when the captcha is off or the token is valid.
const verifyCaptcha = async (token, ip) => {

  if (!captchaEnabled) {
    return true;
  }

  if (typeof token !== "string" || !token || token.length > 4096) {
    return false;
  }

  try {

    const body = new URLSearchParams({
      secret: config.TURNSTILE_SECRET_KEY,
      response: token
    });

    if (ip) {
      body.set("remoteip", ip);
    }

    const response = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8000)
    });

    const data = await response.json();

    return data.success === true;

  } catch (error) {

    console.error("Captcha check failed:", error.message);

    return false;
  }
};

module.exports = {
  captchaEnabled,
  verifyCaptcha
};
