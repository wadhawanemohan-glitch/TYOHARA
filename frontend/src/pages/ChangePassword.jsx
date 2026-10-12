import { useState } from "react";
import { Link } from "react-router-dom";

import { fetchWithTimeout } from "../utils/api";

import "./Customize.css";

function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  let savedUser = null;

  try {
    savedUser = JSON.parse(
      localStorage.getItem("tyohara-user") || "null"
    );
  } catch {
    // ignore unreadable saved data
  }

  const isAdmin = savedUser?.role === "admin";
  const minLength = isAdmin ? 12 : 8;

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (form.newPassword.length < minLength) {
      setError(
        `New password must be at least ${minLength} characters.`
      );
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("tyohara-token");

      if (!token) {
        throw new Error("Please log in first.");
      }

      const response = await fetchWithTimeout(
        `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: form.currentPassword,
            newPassword: form.newPassword
          })
        },
        40000
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Could not change password."
        );
      }

      setDone(true);

    } catch (err) {
      setError(
        err.name === "AbortError"
          ? "The server is taking too long to respond. Please try again in a minute."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const backTo = isAdmin ? "/admin/dashboard" : "/";

  if (done) {
    return (
      <div className="customize-page">
        <div className="customize-card customize-done">
          <p className="customize-small-title">DONE</p>
          <h1>Password changed</h1>
          <p>
            Use your new password the next time you log in.
          </p>
          <Link to={backTo} className="customize-link">
            Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="customize-page">
      <div className="customize-card">

        <p className="customize-small-title">ACCOUNT</p>

        <h1>Change Password</h1>

        <form
          onSubmit={handleSubmit}
          className="customize-form"
        >

          <label>
            Current password
            <input
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>

          <label>
            New password (at least {minLength} characters)
            <input
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={minLength}
              maxLength={72}
              required
            />
          </label>

          <label>
            Confirm new password
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </label>

          {error && (
            <div className="customize-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="customize-submit"
            disabled={loading}
          >
            {loading ? "Saving..." : "Change password"}
          </button>

          <Link to={backTo} className="customize-link">
            Cancel
          </Link>

        </form>

      </div>
    </div>
  );
}

export default ChangePassword;
