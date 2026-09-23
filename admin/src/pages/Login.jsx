import { useState } from "react";

import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";


const MAX_LOGIN_ATTEMPTS = 5;


const Login = () => {

  const navigate =
    useNavigate();


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


  // =========================================================
  // GLOBAL LOGIN FAILURE COUNT
  // =========================================================
  //
  // This is only for the current browser UI.
  //
  // The backend remains the real security layer.
  //
  // Email does NOT matter here.
  //
  // =========================================================

  const [
    failedAttempts,
    setFailedAttempts,
  ] = useState(0);


  // =========================================================
  // FORM LOCK
  // =========================================================

  const [
    loginBlocked,
    setLoginBlocked,
  ] = useState(false);


  // =========================================================
  // ALREADY AUTHENTICATED
  // =========================================================

  if (isAuthenticated) {

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }


  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (
    event
  ) => {

    // -------------------------------------------------------
    // Never allow changes while the form is blocked.
    // -------------------------------------------------------

    if (loginBlocked) {
      return;
    }


    const {
      name,
      value,
    } = event.target;


    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );


    if (error) {
      setError("");
    }
  };


  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();


    // -------------------------------------------------------
    // Do absolutely nothing while blocked.
    // -------------------------------------------------------

    if (loginBlocked) {
      return;
    }


    setError("");


    // -------------------------------------------------------
    // CLIENT-SIDE VALIDATION
    // -------------------------------------------------------

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


      const response =
        await login(
          formData.email,
          formData.password
        );


      // =====================================================
      // SUCCESS
      // =====================================================

      if (response.success) {

        // Reset the UI counter.

        setFailedAttempts(0);

        setLoginBlocked(false);


        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );


        return;
      }


      // =====================================================
      // SERVER HAS ALREADY BLOCKED THE IP
      // =====================================================

      if (
        response.loginBlocked === true
      ) {

        setLoginBlocked(true);


        setError(
          response.message ||
          "Too many failed login attempts. Login is temporarily blocked."
        );


        return;
      }


      // =====================================================
      // FAILED LOGIN
      // =====================================================

      const newFailedAttempts =
        failedAttempts + 1;


      setFailedAttempts(
        newFailedAttempts
      );


      // -----------------------------------------------------
      // FIFTH FAILED ATTEMPT
      // -----------------------------------------------------
      //
      // The fifth attempt itself is still reported as:
      //
      // "Invalid email or password."
      //
      // Then the form is immediately disabled.
      //
      // -----------------------------------------------------

      if (
        newFailedAttempts >=
        MAX_LOGIN_ATTEMPTS
      ) {

        setLoginBlocked(true);


        setError(
          "Invalid email or password. Login has been temporarily blocked. Please try again in 10 minutes."
        );


        return;
      }


      // =====================================================
      // ATTEMPTS 1–4
      // =====================================================

      setError(
        response.message ||
        "Invalid email or password."
      );

    } catch (error) {

      const responseData =
        error.response?.data;


      // -----------------------------------------------------
      // BACKEND IP BLOCK
      // -----------------------------------------------------

      if (
        responseData?.loginBlocked ===
        true
      ) {

        setLoginBlocked(true);


        setError(
          responseData.message ||
          "Too many failed login attempts. Login is temporarily blocked."
        );


        return;
      }


      // -----------------------------------------------------
      // NORMAL SERVER ERROR
      // -----------------------------------------------------

      setError(
        responseData?.message ||
        "Unable to connect to the server."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // FORM DISABLED STATE
  // =========================================================

  const formDisabled =
    loading ||
    loginBlocked;


  // =========================================================
  // RENDER
  // =========================================================

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


        {/* Header */}

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


        {/* =================================================
            LOGIN FORM
            ================================================= */}

        <form
          onSubmit={handleSubmit}
        >

          {/* =================================================
              EMAIL
              ================================================= */}

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
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                placeholder="Enter your email"
                autoComplete="email"
                disabled={
                  formDisabled
                }
              />

            </div>

          </div>


          {/* =================================================
              PASSWORD
              ================================================= */}

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
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={
                  formDisabled
                }
              />


              <button
                type="button"
                className="login-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
                disabled={
                  formDisabled
                }
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


          {/* =================================================
              ERROR
              ================================================= */}

          {error && (

            <div
              className={
                loginBlocked
                  ? "login-error login-error-blocked"
                  : "login-error"
              }
            >

              <i
                className={
                  loginBlocked
                    ? "bi bi-shield-lock"
                    : "bi bi-exclamation-circle"
                }
                aria-hidden="true"
              ></i>


              <span>
                {error}
              </span>

            </div>

          )}


          {/* =================================================
              SUBMIT
              ================================================= */}

          <button
            type="submit"
            className="login-submit"
            disabled={
              formDisabled
            }
          >

            {loading ? (

              <>

                <span className="login-spinner"></span>

                Signing in...

              </>

            ) : loginBlocked ? (

              <>

                Login Temporarily Blocked

                <i
                  className="bi bi-lock-fill"
                  aria-hidden="true"
                ></i>

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


        {/* =================================================
            FOOTER
            ================================================= */}

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