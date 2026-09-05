
/*
authController.js will handle
We'll eventually have:
authController.js
│
├── register
├── login
├── logout
└── getCurrentAdmin


const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

// =========================================================
// REGISTER FIRST ADMIN
// =========================================================

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // -----------------------------------------------------
    // Validate input
    // -----------------------------------------------------

    if (!name || !email || !password) {
      return sendError(
        res,
        "Name, email and password are required",
        400
      );
    }

    if (password.length < 6) {
      return sendError(
        res,
        "Password must contain at least 6 characters",
        400
      );
    }

    // -----------------------------------------------------
    // Check whether an admin already exists
    // -----------------------------------------------------

    const [adminCount] = await db.query(
      "SELECT COUNT(*) AS count FROM admins"
    );

    if (adminCount[0].count > 0) {
      return sendError(
        res,
        "Admin account already exists",
        403
      );
    }

    // -----------------------------------------------------
    // Check email
    // -----------------------------------------------------

    const [existingAdmin] = await db.query(
      "SELECT id FROM admins WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingAdmin.length > 0) {
      return sendError(
        res,
        "Email is already registered",
        409
      );
    }

    // -----------------------------------------------------
    // Hash password
    // -----------------------------------------------------

    const hashedPassword = await bcrypt.hash(password, 12);

    // -----------------------------------------------------
    // Create admin
    // -----------------------------------------------------

    const [result] = await db.query(
      `INSERT INTO admins
        (name, email, password)
       VALUES (?, ?, ?)`,
      [name, email, hashedPassword]
    );

    return sendSuccess(
      res,
      {
        id: result.insertId,
        name,
        email,
      },
      "Admin account created successfully",
      201
    );
  } catch (error) {
    console.error("Register error:", error);

    return sendError(
      res,
      "Failed to create admin account"
    );
  }
};

// =========================================================
// LOGIN
// =========================================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // -----------------------------------------------------
    // Validate input
    // -----------------------------------------------------

    if (!email || !password) {
      return sendError(
        res,
        "Email and password are required",
        400
      );
    }

    // -----------------------------------------------------
    // Find admin
    // -----------------------------------------------------

    const [admins] = await db.query(
      `SELECT id, name, email, password
       FROM admins
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    if (admins.length === 0) {
      return sendError(
        res,
        "Invalid email or password",
        401
      );
    }

    const admin = admins[0];

    // -----------------------------------------------------
    // Compare password
    // -----------------------------------------------------

    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatch) {
      return sendError(
        res,
        "Invalid email or password",
        401
      );
    }

    // -----------------------------------------------------
    // Create JWT
    // -----------------------------------------------------

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // -----------------------------------------------------
    // Response
    // -----------------------------------------------------

    return sendSuccess(
      res,
      {
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
        },
      },
      "Login successful"
    );
  } catch (error) {
    console.error("Login error:", error);

    return sendError(
      res,
      "Failed to login"
    );
  }
};

// =========================================================
// GET CURRENT ADMIN
// =========================================================

const me = async (req, res) => {
  try {
    const [admins] = await db.query(
      `SELECT id, name, email, created_at
       FROM admins
       WHERE id = ?
       LIMIT 1`,
      [req.admin.id]
    );

    if (admins.length === 0) {
      return sendError(
        res,
        "Admin not found",
        404
      );
    }

    return sendSuccess(
      res,
      admins[0],
      "Admin retrieved successfully"
    );
  } catch (error) {
    console.error("Get admin error:", error);

    return sendError(
      res,
      "Failed to retrieve admin"
    );
  }
};

// =========================================================
// LOGOUT
// =========================================================

const logout = async (req, res) => {
  return sendSuccess(
    res,
    null,
    "Logout successful"
  );
};

module.exports = {
  register,
  login,
  me,
  logout,
};
*/