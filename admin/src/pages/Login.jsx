import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const {
    login,
    isAuthenticated,
  } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !formData.email ||
      !formData.password
    ) {
      setError(
        "Please enter your email and password."
      );

      return;
    }

    try {
      setLoading(true);

      const response = await login(
        formData.email,
        formData.password
      );

      if (response.success) {
        navigate("/dashboard", {
          replace: true,
        });
      } else {
        setError(
          response.message ||
            "Invalid email or password."
        );
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">

      <div className="login-card">

        {/* Logo / Icon */}

        <div className="login-logo">
          <i
            className="bi bi-speedometer2"
            aria-hidden="true"
          ></i>
        </div>

        <div className="login-header">

          <span className="login-eyebrow">
            AUTO MOTORS SARL
          </span>

          <h1>
            Admin Login
          </h1>

          <p>
            Sign in to manage your website
          </p>

        </div>


        <form onSubmit={handleSubmit}>

          {/* Email */}

          <div className="login-form-group">

            <label htmlFor="email">
              Email
            </label>

            <div className="login-input-wrapper">

              <i
                className="bi bi-envelope"
                aria-hidden="true"
              ></i>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
              />

            </div>

          </div>


          {/* Password */}

          <div className="login-form-group">

            <label htmlFor="password">
              Password
            </label>

            <div className="login-input-wrapper">

              <i
                className="bi bi-lock"
                aria-hidden="true"
              ></i>

              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <i
                  className={
                    showPassword
                      ? "bi bi-eye-slash"
                      : "bi bi-eye"
                  }
                  aria-hidden="true"
                ></i>
              </button>

            </div>

          </div>


          {/* Error */}

          {error && (
            <div className="login-error">

              <i
                className="bi bi-exclamation-circle"
                aria-hidden="true"
              ></i>

              <span>
                {error}
              </span>

            </div>
          )}


          {/* Submit */}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="login-spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <i
                  className="bi bi-arrow-right"
                  aria-hidden="true"
                ></i>
              </>
            )}

          </button>

        </form>


        <div className="login-footer">
          <i
            className="bi bi-shield-lock"
            aria-hidden="true"
          ></i>

          Secure administrator access
        </div>

      </div>

    </main>
  );
};

export default Login;