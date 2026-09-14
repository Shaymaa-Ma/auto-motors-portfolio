import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/endpoints";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    isAuthenticated,
  } = useAuth();

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [registrationOpen, setRegistrationOpen] =
    useState(false);

  const [
    registrationSuccess,
    setRegistrationSuccess,
  ] = useState("");

  /* -------------------------------------------------------
     Check registration availability
  ------------------------------------------------------- */

  useEffect(() => {
    const checkRegistrationStatus =
      async () => {
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
        }
      };

    checkRegistrationStatus();
  }, []);

  /* -------------------------------------------------------
     Registration success message
  ------------------------------------------------------- */

  useEffect(() => {
    if (
      location.state?.registrationSuccess
    ) {
      setRegistrationSuccess(
        location.state.registrationSuccess
      );

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    }
  }, [location]);

  /* -------------------------------------------------------
     Redirect authenticated users
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
    setRegistrationSuccess("");

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
        {/* Logo */}
        <div className="login-logo">
          <i
            className="bi bi-speedometer2"
            aria-hidden="true"
          ></i>
        </div>

        {/* Header */}
        <div className="login-header">
          <span className="login-eyebrow">
            AUTO MOTORS SARL
          </span>

          <h1>Admin Login</h1>

          <p>
            Sign in to manage your website
          </p>
        </div>

        {/* Registration success */}
        {registrationSuccess && (
          <div className="login-success">
            <i
              className="bi bi-check-circle"
              aria-hidden="true"
            ></i>

            <span>
              {registrationSuccess}
            </span>
          </div>
        )}

        {/* Login form */}
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

        {/* One-time registration */}
        {registrationOpen && (
          <div className="login-register-area">
            <span>
              First-time administrator?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/register")
              }
            >
              Create your account
              <i
                className="bi bi-arrow-up-right"
                aria-hidden="true"
              ></i>
            </button>
          </div>
        )}

        {/* Footer */}
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