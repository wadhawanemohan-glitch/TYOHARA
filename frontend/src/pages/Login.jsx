import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Login.css";

function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleChange = (event) => {

    setFormData({
      ...formData,
      [event.target.name]:
        event.target.value
    });

  };


  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");
    setLoading(true);

    try {

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify(formData)
        }
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
          "Login failed"
        );
      }


      // Save login information

      localStorage.setItem(
        "giftwala-token",
        data.token
      );

      localStorage.setItem(
        "giftwala-user",
        JSON.stringify(data.user)
      );


      // Go to Home

      navigate("/");

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      setError(
        error.message ||
        "Unable to login"
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">
          
        </div>

        <p className="login-small-title">
          WELCOME TO TYOHARA
        </p>

        <h1>
          Login
        </h1>

        <p className="login-description">
          Login to manage your orders
          and continue shopping.
        </p>


        {error && (
          <div className="login-error">
            {error}
          </div>
        )}


        <form
          onSubmit={handleSubmit}
          className="login-form"
        >

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
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />


          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>


        <div className="login-divider">
          <span>OR</span>
        </div>


        <p className="create-account">
          Don't have an account?
          <Link to="/register">
            Create Account
          </Link>
        </p>


        <Link
          to="/"
          className="back-home"
        >
           Back to Home
        </Link>

      </div>

    </div>
  );
}

export default Login;



