/*
Main Administrator / super_admin:

Name       → editable
Email      → editable
Password   → editable
Role       → permanently super_admin
Status     → cannot deactivate
Account    → cannot delete

Users created by the Super Admin:

Name       → editable
Email      → editable
Password   → editable
Role       → permanently Employee
Status     → editable
Account    → deletable

IMPORTANT SECURITY RULE:

The backend NEVER trusts the frontend to decide who is a
super_admin.

Even if somebody manually sends:

{
  "role": "super_admin"
}

the backend rejects it.

The database remains the source of truth for the current
administrator role and account status.
*/


const bcrypt = require("bcryptjs");

const pool =
  require("../config/db");

const {
  validatePassword,
} = require("../utils/passwordPolicy");


// =========================================================
// EMAIL VALIDATION
// =========================================================

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


// =========================================================
// CHECK AUTHENTICATION
// =========================================================

const ensureAuthenticated = (req, res) => {

  if (!req.admin) {
    res.status(401).json({
      success: false,
      message:
        "Authentication required.",
    });

    return false;
  }

  return true;
};


// =========================================================
// SUPER ADMIN CHECK
// =========================================================

const ensureSuperAdmin = (req, res) => {

  if (!ensureAuthenticated(req, res)) {
    return false;
  }


  if (
    req.admin.role !== "super_admin"
  ) {
    res.status(403).json({
      success: false,
      message:
        "You do not have permission to manage administrators.",
    });

    return false;
  }


  return true;
};


// =========================================================
// VALIDATE USER ROLE
// =========================================================
//
// Kept for protection against the reserved super_admin role.
// Regular users created/managed by this controller are always
// assigned Employee.
// =========================================================

const validateUserRole = (role) => {

  if (typeof role !== "string") {
    return {
      valid: false,
      message:
        "Role is required.",
    };
  }


  const cleanRole =
    role.trim();


  if (!cleanRole) {
    return {
      valid: false,
      message:
        "Role is required.",
    };
  }


  if (cleanRole.length > 50) {
    return {
      valid: false,
      message:
        "Role must not exceed 50 characters.",
    };
  }


  if (
    cleanRole.toLowerCase() ===
    "super_admin"
  ) {
    return {
      valid: false,
      message:
        "The Super Admin role is reserved for the Main Administrator.",
    };
  }


  return {
    valid: true,
    role: cleanRole,
  };
};


// =========================================================
// GET ALL USERS
// =========================================================

const getUsers = async (req, res) => {

  try {

    if (!ensureSuperAdmin(req, res)) {
      return;
    }


    const [users] =
      await pool.execute(
        `
          SELECT
            id,
            name,
            email,
            role,
            is_active,
            created_at,
            updated_at
          FROM admins
          ORDER BY
            CASE
              WHEN role = 'super_admin' THEN 0
              ELSE 1
            END,
            id DESC
        `
      );


    return res.status(200).json({
      success: true,
      users,
    });

  } catch (error) {

    console.error(
      "Get users error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve administrators.",
    });
  }
};


// =========================================================
// CREATE USER
// =========================================================
//
// Only the Super Admin can create users.
//
// IMPORTANT:
// The role is NOT accepted from req.body.
//
// Every newly created regular account is ALWAYS Employee.
// =========================================================

const createUser = async (req, res) => {

  try {

    if (!ensureSuperAdmin(req, res)) {
      return;
    }


    const {
      name,
      email,
      password,
    } = req.body;


    // =======================================================
    // REQUIRED FIELDS
    // =======================================================

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, and password are required.",
      });
    }


    const cleanName =
      name.trim();

    const cleanEmail =
      email.trim().toLowerCase();


    // =======================================================
    // VALIDATE NAME
    // =======================================================

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Name must contain at least 2 characters.",
      });
    }


    if (cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message:
          "Name must not exceed 100 characters.",
      });
    }


    // =======================================================
    // VALIDATE EMAIL
    // =======================================================

    if (
      cleanEmail.length === 0 ||
      cleanEmail.length > 191 ||
      !EMAIL_REGEX.test(cleanEmail)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid email address is required.",
      });
    }


    // =======================================================
    // VALIDATE PASSWORD
    // =======================================================

    const passwordValidation =
      validatePassword(password);


    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message:
          passwordValidation.message,
      });
    }


    // =======================================================
    // FIXED EMPLOYEE ROLE
    // =======================================================
    //
    // Do NOT read role from req.body.
    //
    // This guarantees that even if somebody sends:
    //
    // {
    //   "role": "super_admin"
    // }
    //
    // the backend still creates Employee.
    // =======================================================

    const userRole =
      "Employee";


    // =======================================================
    // CHECK DUPLICATE EMAIL
    // =======================================================

    const [existingUsers] =
      await pool.execute(
        `
          SELECT id
          FROM admins
          WHERE email = ?
          LIMIT 1
        `,
        [cleanEmail]
      );


    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "An administrator with this email already exists.",
      });
    }


    // =======================================================
    // HASH PASSWORD
    // =======================================================

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );


    // =======================================================
    // CREATE USER
    // =======================================================

    const [result] =
      await pool.execute(
        `
          INSERT INTO admins
          (
            name,
            email,
            password_hash,
            role,
            is_active
          )
          VALUES (?, ?, ?, ?, 1)
        `,
        [
          cleanName,
          cleanEmail,
          passwordHash,
          userRole,
        ]
      );


    return res.status(201).json({
      success: true,

      message:
        "User created successfully.",

      user: {
        id:
          result.insertId,

        name:
          cleanName,

        email:
          cleanEmail,

        role:
          userRole,

        is_active:
          1,
      },
    });

  } catch (error) {

    console.error(
      "Create user error:",
      error
    );


    if (
      error.code ===
      "ER_DUP_ENTRY"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "An administrator with this email already exists.",
      });
    }


    return res.status(500).json({
      success: false,
      message:
        "Unable to create user.",
    });
  }
};


// =========================================================
// UPDATE MY PROFILE
// =========================================================
//
// Role is NEVER accepted from the request.
// =========================================================

const updateMyProfile = async (req, res) => {

  try {

    if (!ensureAuthenticated(req, res)) {
      return;
    }


    const currentAdminId =
      Number(req.admin.id);


    const {
      name,
      email,
      password,
    } = req.body;


    if (
      typeof name !== "string" ||
      name.trim().length < 2
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name must contain at least 2 characters.",
      });
    }


    const cleanName =
      name.trim();


    if (cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message:
          "Name must not exceed 100 characters.",
      });
    }


    if (
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid email address is required.",
      });
    }


    const cleanEmail =
      email
        .trim()
        .toLowerCase();


    if (
      cleanEmail.length > 191 ||
      !EMAIL_REGEX.test(cleanEmail)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid email address is required.",
      });
    }


    const [existingUsers] =
      await pool.execute(
        `
          SELECT id
          FROM admins
          WHERE email = ?
            AND id <> ?
          LIMIT 1
        `,
        [
          cleanEmail,
          currentAdminId,
        ]
      );


    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This email address is already in use.",
      });
    }


    let passwordHash = null;


    if (
      typeof password === "string" &&
      password.length > 0
    ) {

      const passwordValidation =
        validatePassword(password);


      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          message:
            passwordValidation.message,
        });
      }


      passwordHash =
        await bcrypt.hash(
          password,
          12
        );
    }


    if (passwordHash) {

      await pool.execute(
        `
          UPDATE admins
          SET
            name = ?,
            email = ?,
            password_hash = ?
          WHERE id = ?
        `,
        [
          cleanName,
          cleanEmail,
          passwordHash,
          currentAdminId,
        ]
      );

    } else {

      await pool.execute(
        `
          UPDATE admins
          SET
            name = ?,
            email = ?
          WHERE id = ?
        `,
        [
          cleanName,
          cleanEmail,
          currentAdminId,
        ]
      );
    }


    const [updatedUsers] =
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
        [currentAdminId]
      );


    if (
      updatedUsers.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Administrator account not found.",
      });
    }


    const updatedUser =
      updatedUsers[0];


    return res.status(200).json({
      success: true,

      message:
        "Profile updated successfully.",

      user:
        updatedUser,
    });

  } catch (error) {

    console.error(
      "Update own profile error:",
      error
    );


    if (
      error.code ===
      "ER_DUP_ENTRY"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This email address is already in use.",
      });
    }


    return res.status(500).json({
      success: false,
      message:
        "Unable to update your profile.",
    });
  }
};


// =========================================================
// UPDATE USER
// =========================================================
//
// Super Admin can update regular users:
//
// - name
// - email
// - password
//
// Role is permanently Employee.
// =========================================================

const updateUser = async (req, res) => {

  try {

    if (!ensureSuperAdmin(req, res)) {
      return;
    }


    const userId =
      Number(req.params.id);


    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid administrator ID.",
      });
    }


    const {
      name,
      email,
      password,
    } = req.body;


    if (
      typeof name !== "string" ||
      typeof email !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name and email are required.",
      });
    }


    const cleanName =
      name.trim();

    const cleanEmail =
      email
        .trim()
        .toLowerCase();


    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Name must contain at least 2 characters.",
      });
    }


    if (cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message:
          "Name must not exceed 100 characters.",
      });
    }


    if (
      !cleanEmail ||
      cleanEmail.length > 191 ||
      !EMAIL_REGEX.test(cleanEmail)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid email address is required.",
      });
    }


    // =======================================================
    // GET TARGET USER
    // =======================================================

    const [targetUsers] =
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
        [userId]
      );


    if (
      targetUsers.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }


    const targetUser =
      targetUsers[0];


    // =======================================================
    // PROTECT SUPER ADMIN
    // =======================================================

    if (
      targetUser.role ===
      "super_admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "The Super Admin account can only be edited from its own profile.",
      });
    }


    // =======================================================
    // PREVENT SELF-MANAGEMENT
    // =======================================================

    if (
      userId ===
      Number(req.admin.id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Use your profile to update your own account.",
      });
    }


    // =======================================================
    // CHECK DUPLICATE EMAIL
    // =======================================================

    const [existingUsers] =
      await pool.execute(
        `
          SELECT id
          FROM admins
          WHERE email = ?
            AND id <> ?
          LIMIT 1
        `,
        [
          cleanEmail,
          userId,
        ]
      );


    if (
      existingUsers.length > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This email address is already in use.",
      });
    }


    // =======================================================
    // PASSWORD IS OPTIONAL
    // =======================================================

    let passwordHash = null;


    if (
      typeof password === "string" &&
      password.length > 0
    ) {

      const passwordValidation =
        validatePassword(password);


      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          message:
            passwordValidation.message,
        });
      }


      passwordHash =
        await bcrypt.hash(
          password,
          12
        );
    }


    // =======================================================
    // FIXED EMPLOYEE ROLE
    // =======================================================
    //
    // Existing regular accounts are forced to Employee.
    //
    // req.body.role is completely ignored.
    // =======================================================

    const employeeRole =
      "Employee";


    // =======================================================
    // UPDATE REGULAR USER
    // =======================================================

    if (passwordHash) {

      await pool.execute(
        `
          UPDATE admins
          SET
            name = ?,
            email = ?,
            password_hash = ?,
            role = ?
          WHERE id = ?
            AND role <> 'super_admin'
        `,
        [
          cleanName,
          cleanEmail,
          passwordHash,
          employeeRole,
          userId,
        ]
      );

    } else {

      await pool.execute(
        `
          UPDATE admins
          SET
            name = ?,
            email = ?,
            role = ?
          WHERE id = ?
            AND role <> 'super_admin'
        `,
        [
          cleanName,
          cleanEmail,
          employeeRole,
          userId,
        ]
      );
    }


    return res.status(200).json({
      success: true,

      message:
        "User information updated successfully.",
    });

  } catch (error) {

    console.error(
      "Update user error:",
      error
    );


    if (
      error.code ===
      "ER_DUP_ENTRY"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This email address is already in use.",
      });
    }


    return res.status(500).json({
      success: false,
      message:
        "Unable to update user information.",
    });
  }
};


// =========================================================
// UPDATE USER STATUS
// =========================================================

const updateUserStatus = async (req, res) => {

  try {

    if (!ensureSuperAdmin(req, res)) {
      return;
    }


    const userId =
      Number(req.params.id);


    const {
      is_active,
    } = req.body;


    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user ID.",
      });
    }


    if (
      is_active !== 0 &&
      is_active !== 1 &&
      is_active !== true &&
      is_active !== false
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid account status.",
      });
    }


    if (
      userId ===
      Number(req.admin.id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot disable your own account.",
      });
    }


    const [targetUsers] =
      await pool.execute(
        `
          SELECT
            id,
            role
          FROM admins
          WHERE id = ?
          LIMIT 1
        `,
        [userId]
      );


    if (
      targetUsers.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }


    const targetUser =
      targetUsers[0];


    if (
      targetUser.role ===
      "super_admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "The Super Admin account cannot be deactivated.",
      });
    }


    const activeValue =
      is_active === true ||
      is_active === 1
        ? 1
        : 0;


    const [result] =
      await pool.execute(
        `
          UPDATE admins
          SET is_active = ?
          WHERE id = ?
            AND role <> 'super_admin'
        `,
        [
          activeValue,
          userId,
        ]
      );


    if (
      result.affectedRows === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }


    return res.status(200).json({
      success: true,

      message:
        activeValue === 1
          ? "User activated successfully."
          : "User deactivated successfully.",
    });

  } catch (error) {

    console.error(
      "Update user status error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to update account status.",
    });
  }
};


// =========================================================
// DELETE USER
// =========================================================

const deleteUser = async (req, res) => {

  try {

    if (!ensureSuperAdmin(req, res)) {
      return;
    }


    const userId =
      Number(req.params.id);


    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user ID.",
      });
    }


    if (
      userId ===
      Number(req.admin.id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot delete your own account.",
      });
    }


    const [targetUsers] =
      await pool.execute(
        `
          SELECT
            id,
            role
          FROM admins
          WHERE id = ?
          LIMIT 1
        `,
        [userId]
      );


    if (
      targetUsers.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }


    const targetUser =
      targetUsers[0];


    if (
      targetUser.role ===
      "super_admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "The Super Admin account cannot be deleted.",
      });
    }


    const [result] =
      await pool.execute(
        `
          DELETE FROM admins
          WHERE id = ?
            AND role <> 'super_admin'
        `,
        [userId]
      );


    if (
      result.affectedRows === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }


    return res.status(200).json({
      success: true,

      message:
        "User deleted successfully.",
    });

  } catch (error) {

    console.error(
      "Delete user error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to delete user.",
    });
  }
};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  getUsers,
  createUser,
  updateMyProfile,
  updateUser,
  updateUserStatus,
  deleteUser,
};