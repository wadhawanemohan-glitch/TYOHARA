import { useEffect, useRef } from "react";

import { TURNSTILE_SITE_KEY } from "../captchaConfig";

import "./Turnstile.css";

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise = null;

const loadScript = () => {
  if (window.turnstile) {
    return Promise.resolve();
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");

      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Captcha could not be loaded"));
      };

      document.head.appendChild(script);
    });
  }

  return scriptPromise;
};


// Shows the Cloudflare captcha. Calls onToken with the token when the
// visitor passes it (and with "" when it expires or fails).
// Change resetKey to show a fresh captcha (tokens work only once).
// Renders nothing when no site key is configured.
function Turnstile({ onToken, resetKey }) {
  const boxRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) {
      return undefined;
    }

    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !boxRef.current || !window.turnstile) {
          return;
        }

        widgetIdRef.current = window.turnstile.render(
          boxRef.current,
          {
            sitekey: TURNSTILE_SITE_KEY,
            callback: (token) => onTokenRef.current(token),
            "expired-callback": () => onTokenRef.current(""),
            "error-callback": () => onTokenRef.current("")
          }
        );
      })
      .catch(() => onTokenRef.current(""));

    return () => {
      cancelled = true;

      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // already removed
        }
      }

      widgetIdRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (
      resetKey !== undefined &&
      widgetIdRef.current !== null &&
      window.turnstile
    ) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {
        // widget not ready yet
      }
    }
  }, [resetKey]);

  if (!TURNSTILE_SITE_KEY) {
    return null;
  }

  return <div ref={boxRef} className="captcha-box" />;
}

export default Turnstile;
