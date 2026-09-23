const jwt = require("jsonwebtoken");
const pool = require("../config/db");


const authMiddleware = async (
  req,
  res,
  next
) => {

  try {

    // =======================================================
    // GET TOKEN
    // =======================================================

    const token =
      req.cookies?.admin_token;


    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }


    // =======================================================
    // VERIFY JWT
    // =======================================================

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );


    // =======================================================
    // RE-CHECK ADMIN IN DATABASE
    // =======================================================

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


    // =======================================================
    // ADMIN DOES NOT EXIST
    // =======================================================

    if (admins.length === 0) {

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


    // =======================================================
    // ACCOUNT DISABLED
    // =======================================================

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


    // =======================================================
    // CURRENT DATABASE VALUES
    // =======================================================
    //
    // Do not trust stale role/email values from the JWT.
    //
    // =======================================================

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
      message:
        "Invalid or expired authentication.",
    });
  }
};


module.exports =
  authMiddleware;