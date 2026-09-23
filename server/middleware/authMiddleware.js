
// Protect admin-only routes by checking the login token,
// verifying the admin's identity, and making sure the account
// still exists and is active before allowing the request to continue.

const jwt = require("jsonwebtoken");
const pool = require("../config/db");


// Check whether the current request comes from a valid admin
const authMiddleware = async (req, res, next) => {
  try {

    // Get the JWT that was saved in the admin's cookie after login
    const token = req.cookies?.admin_token;

    // If there is no token, the user is not logged in
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }


    // Verify that the token was created by our server
    // and that it has not expired or been modified
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );


    // Don't rely only on the information inside the JWT.
    // Check the admin in the database as well, so changes
    // such as disabling an account take effect immediately.
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


    // The admin may have been deleted after the token was created
    if (admins.length === 0) {

      // Remove the old cookie because it is no longer valid
      res.clearCookie("admin_token", {
        path: "/",
      });

      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication.",
      });
    }


    const admin = admins[0];


    // An admin can be disabled without deleting the account.
    // In that case, immediately stop access and remove the cookie.
    if (!admin.is_active) {

      res.clearCookie("admin_token", {
        path: "/",
      });

      return res.status(403).json({
        success: false,
        message: "This administrator account is disabled.",
      });
    }


    // Use the current values from the database instead of
    // trusting old role/email information stored in the JWT.
    // This means changes made by another admin take effect
    // without requiring the user to log in again.
    req.admin = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };


    // Everything looks good, so let the request continue
    next();

  } catch (error) {

    // JWT errors can happen when the token is invalid,
    // expired, or has been changed.
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