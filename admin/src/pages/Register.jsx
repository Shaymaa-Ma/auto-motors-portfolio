import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/endpoints";

const Register = () => {
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();

  const [registrationOpen, setRegistrationOpen] =
    useState(false);

  const [checkingStatus, setCheckingStatus] =
    useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    setupKey: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [showSetupKey, setShowSetupKey] =
    useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] =
    useState(false);

  /* -------------------------------------------------------
     Check registration status
  ------------------------------------------------------- */

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const response =
          await authApi.registrationStatus();

        if (response.success) {
          setRegistrationOpen(
            response.registrationOpen
          );
        }
      } catch (error) {
        console.error(
          "Registration status error:",
          error
        );

        setRegistrationOpen(false);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkRegistrationStatus();
  }, []);

  /* -------------------------------------------------------
     Redirect authenticated admin
  ------------------------------------------------------- */

  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  /* -------------------------------------------------------
     Loading state
  ------------------------------------------------------- */

  if (checkingStatus) {
    return (
      <main className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <i
              className="bi bi-shield-lock"
              aria-hidden="true"
            ></i>
          </div>

          <div className="login-header">
            <span className="login-eyebrow">
              AUTO MOTORS SARL
            </span>

            <h1>Administrator Setup</h1>

            <p>
              Checking registration availability...
            </p>
          </div>

          <div className="login-loading">
            <span className="login-spinner"></span>
          </div>
        </div>
      </main>
    );
  }

  /* -------------------------------------------------------
     Registration closed
  ------------------------------------------------------- */

  if (!registrationOpen) {
    return (
      <main className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <i
              className="bi bi-lock"
              aria-hidden="true"
            ></i>
          </div>

          <div className="login-header">
            <span className="login-eyebrow">
              AUTO MOTORS SARL
            </span>

            <h1>Registration Closed</h1>

            <p>
              Administrator registration has already
              been completed.
            </p>
          </div>

          <div className="login-error">
            <i
              className="bi bi-info-circle"
              aria-hidden="true"
            ></i>

            <span>
              Only the authorized administrator can
              access this panel.
            </span>
          </div>

          <button
            type="button"
            className="login-submit"
            onClick={() => navigate("/login")}
          >
            Back to Login
            <i
              className="bi bi-arrow-right"
              aria-hidden="true"
            ></i>
          </button>

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
  }

  /* -------------------------------------------------------
     Handle input
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     Submit
  ------------------------------------------------------- */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const {
      name,
      email,
      password,
      confirmPassword,
      setupKey,
    } = formData;

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !setupKey
    ) {
      setError(
        "Please complete all fields."
      );

      return;
    }

    if (name.trim().length < 2) {
      setError(
        "Please enter a valid full name."
      );

      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );

      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await authApi.register(
          name,
          email,
          password,
          confirmPassword,
          setupKey
        );

      if (response.success) {
        navigate("/login", {
          replace: true,
          state: {
            registrationSuccess:
              "Administrator account created successfully. You can now sign in.",
          },
        });

        return;
      }

      setError(
        response.message ||
          "Unable to create administrator account."
      );
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
        {/* Logo */}
        <div className="login-logo">
          <i
            className="bi bi-person-plus"
            aria-hidden="true"
          ></i>
        </div>

        {/* Header */}
        <div className="login-header">
          <span className="login-eyebrow">
            AUTO MOTORS SARL
          </span>

          <h1>Create Admin Account</h1>

          <p>
            Set up the administrator account
            for your website
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="login-form-group">
            <label htmlFor="name">
              Full Name
            </label>

            <div className="login-input-wrapper">
              <i
                className="bi bi-person"
                aria-hidden="true"
              ></i>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                disabled={loading}
              />
            </div>
          </div>

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
                placeholder="Create a password"
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="login-form-group">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <div className="login-input-wrapper">
              <i
                className="bi bi-lock-fill"
                aria-hidden="true"
              ></i>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={
                  formData.confirmPassword
                }
                onChange={handleChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
                disabled={loading}
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    (current) => !current
                  )
                }
                disabled={loading}
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <i
                  className={
                    showConfirmPassword
                      ? "bi bi-eye-slash"
                      : "bi bi-eye"
                  }
                  aria-hidden="true"
                ></i>
              </button>
            </div>
          </div>

          {/* Setup Key */}
          <div className="login-form-group">
            <label htmlFor="setupKey">
              Administrator Setup Key
            </label>

            <div className="login-input-wrapper">
              <i
                className="bi bi-key"
                aria-hidden="true"
              ></i>

              <input
                id="setupKey"
                name="setupKey"
                type={
                  showSetupKey
                    ? "text"
                    : "password"
                }
                value={formData.setupKey}
                onChange={handleChange}
                placeholder="Enter the setup key"
                autoComplete="off"
                disabled={loading}
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() =>
                  setShowSetupKey(
                    (current) => !current
                  )
                }
                disabled={loading}
                aria-label={
                  showSetupKey
                    ? "Hide setup key"
                    : "Show setup key"
                }
              >
                <i
                  className={
                    showSetupKey
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

              <span>{error}</span>
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
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <i
                  className="bi bi-arrow-right"
                  aria-hidden="true"
                ></i>
              </>
            )}
          </button>
        </form>

        {/* Back to Login */}
        <button
          type="button"
          className="login-back-button"
          onClick={() => navigate("/login")}
          disabled={loading}
        >
          <i
            className="bi bi-arrow-left"
            aria-hidden="true"
          ></i>

          Back to Login
        </button>

        {/* Footer */}
        <div className="login-footer">
          <i
            className="bi bi-shield-lock"
            aria-hidden="true"
          ></i>

          One-time administrator setup
        </div>
      </div>
    </main>
  );
};

export default Register;