const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

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
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    }
  );
};

// =========================================================
// Cookie options
// =========================================================

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 8 * 60 * 60 * 1000, // 8 hours
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

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // -----------------------------------------------------
    // Find admin
    // -----------------------------------------------------

    const [admins] = await pool.execute(
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
      [email.trim().toLowerCase()]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const admin = admins[0];

    // -----------------------------------------------------
    // Check if account is active
    // -----------------------------------------------------

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: "This administrator account is disabled.",
      });
    }

    // -----------------------------------------------------
    // Compare password
    // -----------------------------------------------------

    const passwordMatches = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // -----------------------------------------------------
    // Generate JWT
    // -----------------------------------------------------

    const token = generateToken(admin);

    // -----------------------------------------------------
    // Store JWT in HttpOnly cookie
    // -----------------------------------------------------

    res.cookie("admin_token", token, getCookieOptions());

    // -----------------------------------------------------
    // Never send password/password_hash to frontend
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
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while logging in.",
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
        message: "Administrator account not found.",
      });
    }

    const admin = admins[0];

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: "This administrator account is disabled.",
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
    console.error("Get current admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve administrator information.",
    });
  }
};

// =========================================================
// POST /api/auth/logout
// =========================================================

const logout = (req, res) => {
  try {
    res.clearCookie("admin_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to logout.",
    });
  }
};

module.exports = {
  login,
  me,
  logout,
};