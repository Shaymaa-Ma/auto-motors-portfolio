const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.admin_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // -----------------------------------------------------
    // Re-check the account in the database on every request.
    //
    // The JWT is only proof of WHO logged in and WHEN — it is
    // not proof that the account is still active or still
    // holds the role it had at login time. Without this
    // check, deactivating or deleting an administrator (see
    // userController.js) would not take effect until their
    // existing token naturally expired, up to
    // JWT_EXPIRES_IN (8h) later.
    // -----------------------------------------------------

    const [admins] = await pool.execute(
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

    if (admins.length === 0) {
      res.clearCookie("admin_token", { path: "/" });

      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication.",
      });
    }

    const admin = admins[0];

    if (!admin.is_active) {
      res.clearCookie("admin_token", { path: "/" });

      return res.status(403).json({
        success: false,
        message:
          "This administrator account is disabled.",
      });
    }

    // -----------------------------------------------------
    // Use the CURRENT email/role from the database, not the
    // (possibly stale) values baked into the token.
    // -----------------------------------------------------

    req.admin = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication.",
    });
  }
};

module.exports = authMiddleware;