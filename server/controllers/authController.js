const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// =========================================================
// Login security settings
// =========================================================

const MAX_LOGIN_ATTEMPTS =
  Number(process.env.LOGIN_MAX_ATTEMPTS) || 5;

const LOGIN_BLOCK_MINUTES =
  Number(process.env.LOGIN_BLOCK_MINUTES) || 10;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// =========================================================
// Timing-safety helper
// =========================================================
//
// If the email does not exist in the database, the original
// code returned immediately without ever calling
// bcrypt.compare(). Because bcrypt.compare() is deliberately
// slow, that made "unknown email" responses measurably faster
// than "wrong password" responses. An attacker could time
// responses to find out which emails exist in the system.
//
// To close that gap we always run a bcrypt comparison, even
// when no admin was found, against this precomputed dummy
// hash. The result is discarded — it exists purely to make
// the "email not found" and "wrong password" code paths take
// a similar amount of time.
// =========================================================

const DUMMY_HASH = bcrypt.hashSync(
  "timing-safety-dummy-password",
  12
);

// =========================================================
// Generate JWT
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
// Cookie options
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
// POST /api/auth/login
// =========================================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // -----------------------------------------------------
    // Validate input
    // -----------------------------------------------------

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

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    // -----------------------------------------------------
    // Find administrator
    // -----------------------------------------------------

    const [admins] = await pool.execute(
      `
        SELECT
          id,
          name,
          email,
          password_hash,
          role,
          is_active,
          failed_login_attempts,
          login_blocked_until
        FROM admins
        WHERE email = ?
        LIMIT 1
      `,
      [cleanEmail]
    );

    // -----------------------------------------------------
    // Unknown email
    //
    // Run a dummy bcrypt compare so this branch takes about
    // as long as a real "wrong password" attempt (timing-
    // safety, see DUMMY_HASH above), then respond with the
    // exact same generic message used everywhere else.
    // -----------------------------------------------------

    if (admins.length === 0) {
      await bcrypt.compare(password, DUMMY_HASH);

      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const admin = admins[0];

    // -----------------------------------------------------
    // Check temporary login block
    //
    // This must happen BEFORE the password is checked —
    // that's what actually stops further guessing once an
    // account is blocked. It necessarily means a blocked
    // response confirms the email exists; that's an
    // accepted, standard trade-off of account lockout.
    // -----------------------------------------------------

    if (admin.login_blocked_until) {
      const blockedUntil =
        new Date(admin.login_blocked_until);

      const now = new Date();

      if (blockedUntil > now) {
        const remainingMilliseconds =
          blockedUntil.getTime() -
          now.getTime();

        const remainingMinutes = Math.ceil(
          remainingMilliseconds / 60000
        );

        return res.status(429).json({
          success: false,
          message:
            `Too many failed login attempts. ` +
            `Please try again in ` +
            `${remainingMinutes} ` +
            `${
              remainingMinutes === 1
                ? "minute"
                : "minutes"
            }.`,
          blockedUntil:
            blockedUntil.toISOString(),
        });
      }

      // ---------------------------------------------------
      // Block has expired — reset failed-attempt info
      // ---------------------------------------------------

      await pool.execute(
        `
          UPDATE admins
          SET
            failed_login_attempts = 0,
            login_blocked_until = NULL
          WHERE id = ?
        `,
        [admin.id]
      );

      admin.failed_login_attempts = 0;
      admin.login_blocked_until = null;
    }

    // -----------------------------------------------------
    // Check if account is active
    // -----------------------------------------------------

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message:
          "This administrator account is disabled.",
      });
    }

    // -----------------------------------------------------
    // Compare password
    // -----------------------------------------------------

    const passwordMatches =
      await bcrypt.compare(
        password,
        admin.password_hash
      );

    // -----------------------------------------------------
    // Wrong password
    //
    // The increment now happens as a single atomic UPDATE
    // at the database level (failed_login_attempts =
    // failed_login_attempts + 1) instead of being read into
    // JS, incremented, and written back. The old read-then-
    // write pattern had a race condition: two requests
    // arriving at nearly the same moment could both read the
    // same starting count and both write back the same
    // "+1" value, silently losing an attempt from the count
    // and letting an attacker get more than
    // MAX_LOGIN_ATTEMPTS real tries before being blocked.
    // -----------------------------------------------------

    if (!passwordMatches) {
      await pool.execute(
        `
          UPDATE admins
          SET failed_login_attempts = failed_login_attempts + 1
          WHERE id = ?
        `,
        [admin.id]
      );

      const [updatedRows] = await pool.execute(
        `
          SELECT failed_login_attempts
          FROM admins
          WHERE id = ?
          LIMIT 1
        `,
        [admin.id]
      );

      const newAttempts =
        updatedRows[0].failed_login_attempts;

      // ---------------------------------------------------
      // Maximum attempts reached
      // ---------------------------------------------------

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const blockedUntil =
          new Date(
            Date.now() +
              LOGIN_BLOCK_MINUTES *
                60 *
                1000
          );

        await pool.execute(
          `
            UPDATE admins
            SET login_blocked_until = ?
            WHERE id = ?
          `,
          [blockedUntil, admin.id]
        );

        return res.status(429).json({
          success: false,
          message:
            `Too many failed login attempts. ` +
            `Your account has been temporarily ` +
            `blocked for ` +
            `${LOGIN_BLOCK_MINUTES} minutes.`,
          blockedUntil:
            blockedUntil.toISOString(),
        });
      }

      const attemptsRemaining =
        MAX_LOGIN_ATTEMPTS - newAttempts;

      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
        attemptsRemaining,
      });
    }

    // -----------------------------------------------------
    // Successful login
    //
    // Reset failed attempts and remove any old block.
    // -----------------------------------------------------

    await pool.execute(
      `
        UPDATE admins
        SET
          failed_login_attempts = 0,
          login_blocked_until = NULL
        WHERE id = ?
      `,
      [admin.id]
    );

    // -----------------------------------------------------
    // Generate JWT
    // -----------------------------------------------------

    const token =
      generateToken(admin);

    // -----------------------------------------------------
    // Store JWT in HttpOnly cookie
    // -----------------------------------------------------

    res.cookie(
      "admin_token",
      token,
      getCookieOptions()
    );

    // -----------------------------------------------------
    // Never send password/password_hash
    // -----------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Login successful.",
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
    // authMiddleware already verified the JWT
    const adminId = req.admin.id;

    const [admins] = await pool.execute(
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

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          "Administrator account not found.",
      });
    }

    const admin = admins[0];

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message:
          "This administrator account is disabled.",
      });
    }

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
// Export
// =========================================================

module.exports = {
  login,
  me,
  logout,
};