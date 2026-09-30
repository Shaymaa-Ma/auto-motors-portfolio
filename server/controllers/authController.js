const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool =
  require("../config/db");


// ============================================================
// LOGIN SECURITY SETTINGS
// ============================================================

const JWT_EXPIRES_IN =
  process.env.JWT_EXPIRES_IN || "8h";


// ============================================================
// EMAIL VALIDATION
// ============================================================

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


// ============================================================
// TIMING-SAFETY DUMMY HASH
// ============================================================
//
// If an attacker submits an email that does not exist,
// we still perform bcrypt.compare().
//
// Why?
//
// Without this, the following two situations can have
// noticeably different processing times:
//
// Existing email:
//     database lookup
//     bcrypt comparison
//
// Non-existing email:
//     database lookup
//     NO bcrypt comparison
//
// An attacker could potentially use timing differences to
// discover which email addresses exist.
//
// The dummy bcrypt hash makes the two paths more similar.
//
// This hash does NOT belong to any real account.
// ============================================================

const DUMMY_HASH =
  bcrypt.hashSync(
    "timing-safety-dummy-password",
    12
  );


// ============================================================
// GENERATE JWT
// ============================================================
//
// The JWT contains only information needed to identify the
// authenticated administrator.
//
// IMPORTANT:
//
// We still query MySQL inside authMiddleware.
//
// Therefore the JWT is NOT treated as the permanent source
// of truth for role/account status.
//
// If another administrator disables an account or changes
// the user's role, the next protected request sees the
// current database value.
// ============================================================

const generateToken = (admin) => {
  return jwt.sign(
    {
      id: admin.id,
    },

    process.env.JWT_SECRET,

    {
      expiresIn:
        JWT_EXPIRES_IN,
    }
  );
};


// ============================================================
// AUTH COOKIE OPTIONS
// ============================================================
//
// The JWT is stored in an HttpOnly cookie.
//
// JavaScript cannot read an HttpOnly cookie:
//
//     document.cookie
//
// will NOT expose admin_token.
//
// This reduces the ability of client-side JavaScript to steal
// the authentication token directly.
//
// In production:
//     Secure = true
//     HTTPS is required.
//
// SameSite=None is used because your admin frontend and API
// may be hosted on different sites/domains.
// ============================================================

const getCookieOptions = () => {
  const isProduction =
    process.env.NODE_ENV ===
    "production";


  return {
    httpOnly: true,

    secure:
      isProduction,

    sameSite:
      isProduction
        ? "none"
        : "lax",

    maxAge:
      8 *
      60 *
      60 *
      1000,

    path: "/",
  };
};


// ============================================================
// GET CLIENT IP
// ============================================================
//
// The IP is already captured by the IP login limiter.
//
// This helper is useful if you later want security logging.
//
// Do not expose the IP to the frontend.
// ============================================================

const getClientIp = (req) => {
  return (
    req.loginClientIp ||
    req.ip ||
    req.socket?.remoteAddress ||
    "unknown"
  );
};


// ============================================================
// POST /api/auth/login
// ============================================================

const login = async (req, res) => {
  try {

    const {
      email,
      password,
    } = req.body;


    // ========================================================
    // BASIC INPUT VALIDATION
    // ========================================================

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Email and password are required.",
      });
    }


    // Normalize the email before using it for the database
    // lookup and account-level rate limiter.
    const cleanEmail =
      email
        .trim()
        .toLowerCase();


    // ========================================================
    // EMAIL FORMAT
    // ========================================================

    if (
      !EMAIL_REGEX.test(cleanEmail)
    ) {
      return res.status(401).json({
        success: false,

        // Keep this generic.
        //
        // Do not tell the attacker whether the problem was
        // the email or password.
        message:
          "Invalid email or password.",
      });
    }


    // ========================================================
    // FIND ADMIN
    // ========================================================

    const [admins] =
      await pool.execute(
        `
          SELECT
            id,
            name,
            email,
            password_hash,
            role,
            is_active
          FROM admins
          WHERE email = ?
          LIMIT 1
        `,
        [cleanEmail]
      );


    // ========================================================
    // UNKNOWN EMAIL
    // ========================================================
    //
    // Still perform bcrypt work.
    //
    // This makes email enumeration harder.
    // ========================================================

    if (
      admins.length === 0
    ) {

      await bcrypt.compare(
        password,
        DUMMY_HASH
      );


      return res.status(401).json({
        success: false,

        message:
          "Invalid email or password.",
      });
    }


    const admin =
      admins[0];


    // ========================================================
    // ACCOUNT STATUS
    // ========================================================
    //
    // Do not reveal sensitive account details.
    //
    // We can safely tell the legitimate user that the account
    // is disabled, while the rate limiters continue protecting
    // the endpoint.
    // ========================================================

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,

        message:
          "This administrator account is disabled.",
      });
    }


    // ========================================================
    // PASSWORD VERIFICATION
    // ========================================================
    //
    // The database contains a bcrypt hash, never the original
    // password.
    // ========================================================

    const passwordMatches =
      await bcrypt.compare(
        password,
        admin.password_hash
      );


    // ========================================================
    // WRONG PASSWORD
    // ========================================================
    //
    // Return the same generic message used for an unknown
    // email.
    //
    // The login rate-limiters count this failed response.
    // ========================================================

    if (!passwordMatches) {

      // This is intentionally not stored in MySQL.
      //
      // The three rate-limit layers handle the failed attempt:
      //
      // Browser
      // IP
      // Account
      //

      return res.status(401).json({
        success: false,

        message:
          "Invalid email or password.",
      });
    }


    // ========================================================
    // SUCCESSFUL LOGIN
    // ========================================================
    //
    // A successful 2xx response is automatically removed from
    // the failed-attempt counters because all login limiters
    // use skipSuccessfulRequests: true.
    // ========================================================


    const token =
      generateToken(admin);


    // ========================================================
    // STORE JWT IN HTTP-ONLY COOKIE
    // ========================================================

    res.cookie(
      "admin_token",
      token,
      getCookieOptions()
    );


    // ========================================================
    // SUCCESS RESPONSE
    // ========================================================
    //
    // Never return:
    //
    // - password
    // - password_hash
    // - JWT
    // - browser ID
    //
    // The browser already stores the JWT securely in its
    // HttpOnly cookie.
    // ========================================================

    return res.status(200).json({
      success: true,

      message:
        "Login successful.",

      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

  } catch (error) {

    console.error(
      "Login error:",
      error
    );


    return res.status(500).json({
      success: false,

      message:
        "An error occurred while logging in.",
    });
  }
};


// ============================================================
// GET /api/auth/me
// ============================================================

const me = async (req, res) => {
  try {

    // authMiddleware already verified the JWT and loaded the
    // current administrator from the database.
    const adminId =
      req.admin.id;


    const [admins] =
      await pool.execute(
        `
          SELECT
            id,
            name,
            email,
            role,
            is_active
          FROM admins
          WHERE id = ?
          LIMIT 1
        `,
        [adminId]
      );


    // ========================================================
    // ACCOUNT DOES NOT EXIST
    // ========================================================

    if (
      admins.length === 0
    ) {
      return res.status(401).json({
        success: false,

        message:
          "Administrator account not found.",
      });
    }


    const admin =
      admins[0];


    // ========================================================
    // ACCOUNT DISABLED
    // ========================================================

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,

        message:
          "This administrator account is disabled.",
      });
    }


    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(200).json({
      success: true,

      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

  } catch (error) {

    console.error(
      "Get current admin error:",
      error
    );


    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve administrator information.",
    });
  }
};


// ============================================================
// POST /api/auth/logout
// ============================================================
//
// Logging out removes the JWT cookie.
//
// The Browser ID is intentionally NOT removed.
//
// Why?
//
// The Browser ID is not an authentication credential.
// Keeping it means the same browser continues to receive the
// same login-rate-limit identity after logout.
// ============================================================

const logout = (req, res) => {
  try {

    const isProduction =
      process.env.NODE_ENV ===
      "production";


    res.clearCookie(
      "admin_token",
      {
        httpOnly: true,

        secure:
          isProduction,

        sameSite:
          isProduction
            ? "none"
            : "lax",

        path: "/",
      }
    );


    return res.status(200).json({
      success: true,

      message:
        "Logout successful.",
    });

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );


    return res.status(500).json({
      success: false,

      message:
        "Unable to logout.",
    });
  }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  login,
  me,
  logout,
};