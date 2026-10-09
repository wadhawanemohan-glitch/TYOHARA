// The captcha shows only when a Cloudflare Turnstile site key is set
// (VITE_TURNSTILE_SITE_KEY). The backend must have the matching
// TURNSTILE_SECRET_KEY, otherwise leave both empty.
export const TURNSTILE_SITE_KEY =
  import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

export const captchaEnabled = Boolean(TURNSTILE_SITE_KEY);
