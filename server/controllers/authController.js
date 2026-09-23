const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// =========================================================
// LOGIN SECURITY SETTINGS
// =========================================================

const MAX_LOGIN_ATTEMPTS =
  Number(process.env.LOGIN_MAX_ATTEMPTS) || 5;

const LOGIN_BLOCK_MINUTES =
  Number(process.env.LOGIN_BLOCK_MINUTES) || 10;

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


// =========================================================
// TIMING-SAFETY DUMMY HASH
// =========================================================
//
// bcrypt is still executed when the email does not exist.
// This helps prevent timing-based email enumeration.
//

const DUMMY_HASH = bcrypt.hashSync(
  "timing-safety-dummy-password",
  12
);


// =========================================================
// GENERATE JWT
// =========================================================

const generateToken = (admin) => {
  return jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || "8h",
    }
  );
};


// =========================================================
// COOKIE OPTIONS
// =========================================================

const getCookieOptions = () => ({
  httpOnly: true,

  secure:
    process.env.NODE_ENV === "production",

  sameSite:
    process.env.NODE_ENV === "production"
      ? "none"
      : "lax",

  maxAge: 8 * 60 * 60 * 1000,

  path: "/",
});


// =========================================================
// GET CLIENT IP
// =========================================================
//
// The rate limiter stores the IP in req.loginClientIp.
//
// This fallback is useful if the controller is called
// without the limiter for some reason.
//

const getClientIp = (req) => {
  if (req.loginClientIp) {
    return req.loginClientIp;
  }

  return (
    req.ip ||
    req.socket?.remoteAddress ||
    "unknown"
  );
};


// =========================================================
// POST /api/auth/login
// =========================================================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;


    // =======================================================
    // VALIDATE INPUT
    // =======================================================

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


    const cleanEmail =
      email.trim().toLowerCase();


    // =======================================================
    // EMAIL FORMAT
    // =======================================================

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }


    // =======================================================
    // FIND ADMIN
    // =======================================================

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


    // =======================================================
    // UNKNOWN EMAIL
    // =======================================================
    //
    // IMPORTANT:
    //
    // There is NO account-level attempt counter anymore.
    //
    // The login security system is handled globally by
    // the IP-based login limiter.
    //
    // bcrypt is still executed for timing safety.
    // =======================================================

    if (admins.length === 0) {

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


    // =======================================================
    // CHECK ACCOUNT STATUS
    // =======================================================

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message:
          "This administrator account is disabled.",
      });
    }


    // =======================================================
    // CHECK PASSWORD
    // =======================================================

    const passwordMatches =
      await bcrypt.compare(
        password,
        admin.password_hash
      );


    // =======================================================
    // WRONG PASSWORD
    // =======================================================

    if (!passwordMatches) {

      // -----------------------------------------------------
      // IMPORTANT:
      //
      // Do NOT increment any database field here.
      //
      // The IP-based login limiter handles the failed
      // attempt counter.
      // -----------------------------------------------------

      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }


    // =======================================================
    // SUCCESSFUL LOGIN
    // =======================================================
    //
    // The successful response is intentionally 200.
    //
    // The IP login limiter uses successful login to reset
    // the failed-attempt counter for this IP.
    // =======================================================

    const token =
      generateToken(admin);


    // =======================================================
    // HTTP-ONLY COOKIE
    // =======================================================

    res.cookie(
      "admin_token",
      token,
      getCookieOptions()
    );


    // =======================================================
    // SUCCESS RESPONSE
    // =======================================================

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


// =========================================================
// GET /api/auth/me
// =========================================================

const me = async (req, res) => {
  try {

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


    // =======================================================
    // ADMIN DOES NOT EXIST
    // =======================================================

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          "Administrator account not found.",
      });
    }


    const admin =
      admins[0];


    // =======================================================
    // ACCOUNT DISABLED
    // =======================================================

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message:
          "This administrator account is disabled.",
      });
    }


    // =======================================================
    // SUCCESS
    // =======================================================

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


// =========================================================
// POST /api/auth/logout
// =========================================================

const logout = (req, res) => {
  try {

    res.clearCookie(
      "admin_token",
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
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


// =========================================================
// EXPORT
// =========================================================

module.exports = {
  login,
  me,
  logout,
};