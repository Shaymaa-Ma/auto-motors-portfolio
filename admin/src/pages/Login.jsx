import { useState } from "react";

import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import companyLogo from "../assets/company-logo.jpg";

// =========================================================
// LOGIN
// =========================================================
//
// The backend is responsible for all login security:
//
// 1. Browser ID throttling
// 2. IP-based throttling
// 3. Account/email throttling
// 4. Password verification
//
// The frontend only displays the server response and
// temporarily disables the form when the backend reports
// that login has been blocked.
//
// =========================================================

const Login = () => {

  const navigate =
    useNavigate();


  const {
    login,
    isAuthenticated,
  } = useAuth();


  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });


  // =========================================================
  // PASSWORD VISIBILITY
  // =========================================================

  const [showPassword, setShowPassword] =
    useState(false);


  // =========================================================
  // ERROR MESSAGE
  // =========================================================

  const [error, setError] =
    useState("");


  // =========================================================
  // LOADING STATE
  // =========================================================

  const [loading, setLoading] =
    useState(false);


  // =========================================================
  // LOGIN BLOCK STATE
  // =========================================================
  //
  // This is controlled by the backend.
  //
  // We do NOT maintain a frontend failed-attempt counter
  // anymore because the backend now has independent limits
  // for browser, IP address, and account.
  //
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
    // Do not allow changes while login is blocked.
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


    // -------------------------------------------------------
    // Remove the previous error as soon as the user starts
    // editing the form again.
    // -------------------------------------------------------

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


    // =======================================================
    // CLIENT-SIDE VALIDATION
    // =======================================================
    //
    // This is only a usability check.
    //
    // The backend remains responsible for the real
    // authentication and security checks.
    //
    // =======================================================

    if (
      !formData.email.trim() ||
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
      // SUCCESSFUL LOGIN
      // =====================================================

      if (response?.success) {

        // The backend has authenticated the user and
        // created the HttpOnly authentication cookie.

        setLoginBlocked(false);
        setError("");


        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );


        return;
      }


      // =====================================================
      // BACKEND LOGIN BLOCK
      // =====================================================
      //
      // The backend can block the request because of:
      //
      // - Browser ID limit
      // - IP limit
      // - Account/email limit
      //
      // The frontend does not need to know which layer
      // caused the block.
      //
      // =====================================================

      if (
        response?.loginBlocked === true
      ) {

        setLoginBlocked(true);


        setError(
          response.message ||
          "Too many failed login attempts. Login is temporarily blocked."
        );


        return;
      }


      // =====================================================
      // NORMAL LOGIN FAILURE
      // =====================================================

      setError(
        response?.message ||
        "Invalid email or password."
      );

    } catch (error) {

      const responseData =
        error.response?.data;


      // =====================================================
      // BACKEND LOGIN BLOCK
      // =====================================================
      //
      // Depending on the API helper, a 429 response may be
      // delivered through the catch block instead of being
      // returned normally.
      //
      // =====================================================

      if (
        responseData?.loginBlocked === true
      ) {

        setLoginBlocked(true);


        setError(
          responseData.message ||
          "Too many failed login attempts. Login is temporarily blocked."
        );


        return;
      }


      // =====================================================
      // NORMAL SERVER ERROR
      // =====================================================

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

        

        {/* Logo Image*/}

        <div className="login-logo">

          <img
            src={companyLogo}
            alt="AUTO MOTORS SARL"
          />

        </div>


        {/* Header */}

        <div className="login-header">

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