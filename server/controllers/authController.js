const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

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

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 8 * 60 * 60 * 1000,
  path: "/",
});

/* =========================================================
   LOGIN
========================================================= */

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

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
      [normalizedEmail]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const admin = admins[0];

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: "This administrator account is disabled.",
      });
    }

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

    const token = generateToken(admin);

    res.cookie("admin_token", token, getCookieOptions());

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

/* =========================================================
   REGISTRATION STATUS
========================================================= */

const registrationStatus = async (req, res) => {
  try {
    const [settings] = await pool.execute(
      `
        SELECT setting_value
        FROM site_settings
        WHERE setting_key = 'admin_registration_open'
        LIMIT 1
      `
    );

    if (settings.length === 0) {
      return res.status(200).json({
        success: true,
        registrationOpen: false,
      });
    }

    const registrationOpen = settings[0].setting_value === "1";

    return res.status(200).json({
      success: true,
      registrationOpen,
    });
  } catch (error) {
    console.error("Registration status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to check registration status.",
    });
  }
};

/* =========================================================
   REGISTER ADMIN
========================================================= */

const register = async (req, res) => {
  let connection;

  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      setupKey,
    } = req.body;

    /* -----------------------------------------------------
       Basic validation
    ----------------------------------------------------- */

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !setupKey
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must contain at least 2 characters.",
      });
    }

    if (normalizedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must not exceed 100 characters.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    /* -----------------------------------------------------
       Setup key validation
    ----------------------------------------------------- */

    if (
      !process.env.ADMIN_SETUP_KEY ||
      setupKey !== process.env.ADMIN_SETUP_KEY
    ) {
      return res.status(403).json({
        success: false,
        message: "Invalid administrator setup key.",
      });
    }

    /* -----------------------------------------------------
       Start transaction
    ----------------------------------------------------- */

    connection = await pool.getConnection();

    await connection.beginTransaction();

    /* -----------------------------------------------------
       Lock registration setting
    ----------------------------------------------------- */

    const [settings] = await connection.execute(
      `
        SELECT setting_value
        FROM site_settings
        WHERE setting_key = 'admin_registration_open'
        LIMIT 1
        FOR UPDATE
      `
    );

    if (
      settings.length === 0 ||
      settings[0].setting_value !== "1"
    ) {
      await connection.rollback();

      return res.status(403).json({
        success: false,
        message: "Administrator registration is currently closed.",
      });
    }

    /* -----------------------------------------------------
       Check duplicate email
    ----------------------------------------------------- */

    const [existingAdmins] = await connection.execute(
      `
        SELECT id
        FROM admins
        WHERE email = ?
        LIMIT 1
      `,
      [normalizedEmail]
    );

    if (existingAdmins.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: "An administrator account with this email already exists.",
      });
    }

    /* -----------------------------------------------------
       Hash password
    ----------------------------------------------------- */

    const passwordHash = await bcrypt.hash(password, 12);

    /* -----------------------------------------------------
       Create admin account
    ----------------------------------------------------- */

    const [result] = await connection.execute(
      `
        INSERT INTO admins
        (
          name,
          email,
          password_hash,
          role,
          is_active
        )
        VALUES (?, ?, ?, 'admin', 1)
      `,
      [
        normalizedName,
        normalizedEmail,
        passwordHash,
      ]
    );

    /* -----------------------------------------------------
       Close registration permanently
    ----------------------------------------------------- */

    await connection.execute(
      `
        UPDATE site_settings
        SET setting_value = '0'
        WHERE setting_key = 'admin_registration_open'
      `
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Administrator account created successfully.",
      admin: {
        id: result.insertId,
        name: normalizedName,
        email: normalizedEmail,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Register admin error:", error);

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the administrator account.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/* =========================================================
   CURRENT ADMIN
========================================================= */

const me = async (req, res) => {
  try {
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

/* =========================================================
   LOGOUT
========================================================= */

const logout = (req, res) => {
  try {
    res.clearCookie("admin_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",
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
  registrationStatus,
  register,
  me,
  logout,
};