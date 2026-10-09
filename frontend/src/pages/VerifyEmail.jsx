import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import "./Login.css";

const RESEND_SECONDS = 60;

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  // Countdown until a new code may be requested
  useEffect(() => {
    if (secondsLeft <= 0) {
      return undefined;
    }

    const timer = setTimeout(
      () => setSecondsLeft((seconds) => seconds - 1),
      1000
    );

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  // Opened directly (no email known): start from signup
  if (!email) {
    return <Navigate to="/register" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setInfo("");

    if (!/^\d{6}$/.test(code)) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/verify-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, code })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Verification failed."
        );
      }

      // Already verified earlier: just log in
      if (!data.token) {
        navigate("/login");
        return;
      }

      localStorage.setItem("tyohara-token", data.token);

      localStorage.setItem(
        "tyohara-user",
        JSON.stringify(data.user)
      );

      navigate("/");

    } catch (error) {
      setError(
        error.message || "Unable to verify the code."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/resend-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Could not send a new code."
        );
      }

      setInfo("A new code has been sent. Please check your inbox and spam folder.");
      setSecondsLeft(RESEND_SECONDS);

    } catch (error) {
      setError(
        error.message || "Could not send a new code."
      );
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <p className="login-small-title">
          ONE LAST STEP
        </p>

        <h1>
          Verify your email
        </h1>

        <p className="login-description">
          We sent a 6-digit code to <strong>{email}</strong>.
          Enter it below. The code is valid for 10 minutes.
        </p>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {info && (
          <p className="login-description">
            {info}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="login-form"
        >

          <label>
            Verification code
          </label>

          <input
            type="text"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="6-digit code"
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, ""))
            }
            required
          />

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify and continue"}
          </button>

        </form>

        <p className="create-account">
          Did not get the code?{" "}
          {secondsLeft > 0 ? (
            <span>Send again in {secondsLeft}s</span>
          ) : (
            <a
              href="#resend"
              onClick={(event) => {
                event.preventDefault();
                handleResend();
              }}
            >
              Send a new code
            </a>
          )}
        </p>

        <Link
          to="/login"
          className="back-home"
        >
          Back to Login
        </Link>

      </div>

    </div>
  );
}

export default VerifyEmail;
