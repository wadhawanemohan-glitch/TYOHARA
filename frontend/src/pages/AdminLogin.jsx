import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Turnstile from "../components/Turnstile";
import { captchaEnabled } from "../captchaConfig";

import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
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

    if (captchaEnabled && !captchaToken) {
      setError("Please complete the captcha.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            captchaToken
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Login failed."
        );
      }

      // Only admin accounts can use this page
      if (data.user.role !== "admin") {
        throw new Error(
          "Access denied. Admin account required."
        );
      }

      // Save admin login information
      localStorage.setItem(
        "tyohara-token",
        data.token
      );

      localStorage.setItem(
        "tyohara-user",
        JSON.stringify(data.user)
      );

      // Go to Admin Orders
      navigate("/admin/orders");

    } catch (error) {
      console.error(
        "Admin login error:",
        error
      );

      setError(
        error.message ||
        "Unable to login."
      );

      // A captcha token works only once
      setCaptchaToken("");
      setCaptchaReset((count) => count + 1);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      <div className="admin-login-card">

        <div className="admin-login-icon">
          
        </div>

        <p className="admin-small-title">
          TYOHARA ADMIN
        </p>

        <h1>
          Admin Login
        </h1>

        <p className="admin-description">
          Login to manage orders and
          TYOHARA operations.
        </p>

        {error && (
          <div className="admin-login-error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="admin-login-form"
        >

          <label>
            Email Address
          </label>

          <input
            type="email"
            name="email"
            placeholder="Enter admin email"
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
            placeholder="Enter admin password"
            value={formData.password}
            onChange={handleChange}
            required
          />


          <Turnstile
            onToken={setCaptchaToken}
            resetKey={captchaReset}
          />

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Admin Login"}
          </button>

        </form>


        <div className="admin-login-divider">
          <span>SECURE ACCESS</span>
        </div>


        <Link
          to="/"
          className="admin-back-home"
        >
           Back to TYOHARA
        </Link>

      </div>

    </div>
  );
}

export default AdminLogin;



