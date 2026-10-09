import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Turnstile from "../components/Turnstile";
import { captchaEnabled } from "../captchaConfig";

import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (captchaEnabled && !captchaToken) {
      setError("Please complete the captcha.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            captchaToken
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Registration failed."
        );
      }

      // Email verification is on: confirm the email with a code
      if (data.verificationRequired) {
        navigate("/verify-email", {
          state: { email: data.email || formData.email }
        });
        return;
      }

      alert(
        "Account created successfully! Please login."
      );

      navigate("/login");

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        error.message ||
          "Unable to create account."
      );

      // A captcha token works only once
      setCaptchaToken("");
      setCaptchaReset((count) => count + 1);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="register-card">

        <div className="register-logo">
          
        </div>

        <p className="register-small-title">
          JOIN TYOHARA
        </p>

        <h1>
          Create Account
        </h1>

        <p className="register-description">
          Create your account and start
          shopping for beautiful gifts.
        </p>

        {error && (
          <div className="register-error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="register-form"
        >

          <label>
            Full Name
          </label>

          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>
            Email Address
          </label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>
            Password
          </label>

          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label>
            Confirm Password
          </label>

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <Turnstile
            onToken={setCaptchaToken}
            resetKey={captchaReset}
          />

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <div className="register-divider">
          <span>OR</span>
        </div>

        <p className="login-link">
          Already have an account?

          <Link to="/login">
            Login
          </Link>
        </p>

        <Link
          to="/"
          className="register-back-home"
        >
           Back to Home
        </Link>

      </div>

    </div>
  );
}

export default Register;



