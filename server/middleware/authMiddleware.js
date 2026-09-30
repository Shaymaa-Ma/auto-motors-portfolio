// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================
//
// This middleware protects private API routes.
//
// It performs several checks:
//
// 1. Does the request contain the admin JWT cookie?
// 2. Is the JWT cryptographically valid?
// 3. Has the JWT expired?
// 4. Does the administrator still exist?
// 5. Is the administrator still active?
//
// IMPORTANT:
//
// The JWT identifies the administrator.
//
// MySQL remains the source of truth for:
//
// - email
// - role
// - active/disabled status
//
// This means disabling an account or changing its role takes
// effect without waiting for the old JWT to expire.
// ============================================================

const jwt =
  require("jsonwebtoken");

const pool =
  require("../config/db");


// ============================================================
// AUTH MIDDLEWARE
// ============================================================

const authMiddleware =
  async (req, res, next) => {

    try {

      // ======================================================
      // GET JWT FROM HTTP-ONLY COOKIE
      // ======================================================

      const token =
        req.cookies?.admin_token;


      // No cookie means there is no authenticated session.
      if (!token) {
        return res.status(401).json({
          success: false,

          message:
            "Authentication required.",
        });
      }


      // ======================================================
      // VERIFY JWT
      // ======================================================
      //
      // jwt.verify() checks:
      //
      // - signature
      // - expiration
      // - token integrity
      //
      // If someone modifies the token, verification fails.
      // ======================================================

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );


      // ======================================================
      // VALIDATE JWT PAYLOAD
      // ======================================================
      //
      // We only expect an administrator ID.
      //
      // Never blindly trust arbitrary values from a JWT.
      // ======================================================

      if (
        !decoded ||
        !Number.isInteger(decoded.id)
      ) {

        res.clearCookie(
          "admin_token",
          {
            path: "/",
          }
        );


        return res.status(401).json({
          success: false,

          message:
            "Invalid or expired authentication.",
        });
      }


      // ======================================================
      // LOAD CURRENT ADMIN FROM DATABASE
      // ======================================================
      //
      // This is extremely important.
      //
      // We do NOT trust an old role stored in the JWT.
      //
      // Instead:
      //
      // JWT
      //   ↓
      // admin ID
      //   ↓
      // MySQL
      //   ↓
      // current account state
      // ======================================================

      const [admins] =
        await pool.execute(
          `
            SELECT
              id,
              email,
              role,
              is_active
            FROM admins
            WHERE id = ?
            LIMIT 1
          `,
          [decoded.id]
        );


      // ======================================================
      // ADMIN NO LONGER EXISTS
      // ======================================================

      if (
        admins.length === 0
      ) {

        res.clearCookie(
          "admin_token",
          {
            path: "/",
          }
        );


        return res.status(401).json({
          success: false,

          message:
            "Invalid or expired authentication.",
        });
      }


      const admin =
        admins[0];


      // ======================================================
      // ADMIN ACCOUNT DISABLED
      // ======================================================

      if (!admin.is_active) {

        res.clearCookie(
          "admin_token",
          {
            path: "/",
          }
        );


        return res.status(403).json({
          success: false,

          message:
            "This administrator account is disabled.",
        });
      }


      // ======================================================
      // STORE CURRENT ADMIN ON REQUEST
      // ======================================================
      //
      // Every protected controller can now use:
      //
      // req.admin.id
      // req.admin.email
      // req.admin.role
      //
      // These values come from the CURRENT database record,
      // not from an old JWT payload.
      // ======================================================

      req.admin = {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      };


      // ======================================================
      // AUTHENTICATION SUCCESSFUL
      // ======================================================

      next();

    } catch (error) {

      // ======================================================
      // JWT ERRORS
      // ======================================================
      //
      // Examples:
      //
      // TokenExpiredError
      // JsonWebTokenError
      // NotBeforeError
      //
      // We intentionally return one generic response so we
      // don't reveal unnecessary information.
      // ======================================================

      console.error(
        "Authentication error:",
        error.message
      );


      res.clearCookie(
        "admin_token",
        {
          path: "/",
        }
      );


      return res.status(401).json({
        success: false,

        message:
          "Invalid or expired authentication.",
      });
    }
  };


module.exports =
  authMiddleware;