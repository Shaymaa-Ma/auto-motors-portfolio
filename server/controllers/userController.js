const bcrypt = require("bcryptjs");

const pool = require("../config/db");


// =========================================================
// HELPER
// =========================================================
//
// Only the Main Administrator can manage administrator
// accounts.
//
// The route middleware also checks this, but keeping the
// protection inside the controller provides an additional
// backend security layer.
//
// =========================================================

const ensureSuperAdmin = (req, res) => {
  if (!req.admin) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });

    return false;
  }


  if (req.admin.role !== "super_admin") {
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
// GET /api/users
// Get all administrators
//
// ONLY Main Administrator
// =========================================================

const getUsers = async (req, res) => {
  try {

    // -------------------------------------------------------
    // Permission check
    // -------------------------------------------------------

    if (!ensureSuperAdmin(req, res)) {
      return;
    }


    // -------------------------------------------------------
    // Get administrators
    // -------------------------------------------------------

    const [users] = await pool.execute(
      `
        SELECT
          id,
          name,
          email,
          role,
          is_active
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
// POST /api/users
// Create administrator
//
// ONLY Main Administrator
//
// IMPORTANT:
// The client cannot choose the role.
// Every account created from this page is a regular admin.
//
// =========================================================

const createUser = async (req, res) => {
  try {

    // -------------------------------------------------------
    // Permission check
    // -------------------------------------------------------

    if (!ensureSuperAdmin(req, res)) {
      return;
    }


    const {
      name,
      email,
      password,
    } = req.body;


    // -------------------------------------------------------
    // Validate required fields
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // Clean input
    // -------------------------------------------------------

    const cleanName =
      name.trim();

    const cleanEmail =
      email.trim().toLowerCase();


    // -------------------------------------------------------
    // Validate name
    // -------------------------------------------------------

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Name must contain at least 2 characters.",
      });
    }


    // -------------------------------------------------------
    // Validate email
    // -------------------------------------------------------

    if (cleanEmail.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "A valid email address is required.",
      });
    }


    // -------------------------------------------------------
    // Validate password
    // -------------------------------------------------------

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters.",
      });
    }


    // -------------------------------------------------------
    // Check existing email
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // Hash password
    // -------------------------------------------------------

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );


    // -------------------------------------------------------
    // IMPORTANT
    //
    // Administrator accounts created from the Main Admin
    // dashboard are ALWAYS regular admins.
    //
    // Never accept "role" from req.body.
    //
    // This prevents somebody from sending:
    //
    // {
    //   "role": "super_admin"
    // }
    //
    // through Postman or another client.
    // -------------------------------------------------------

    const userRole = "admin";


    // -------------------------------------------------------
    // Insert administrator
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // Return safe user information
    //
    // NEVER return password_hash.
    // -------------------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Administrator created successfully.",

      user: {
        id: result.insertId,
        name: cleanName,
        email: cleanEmail,
        role: userRole,
        is_active: 1,
      },
    });

  } catch (error) {

    console.error(
      "Create user error:",
      error
    );


    // -------------------------------------------------------
    // Handle MySQL duplicate-email constraint
    // -------------------------------------------------------

    if (
      error.code === "ER_DUP_ENTRY"
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
        "Unable to create administrator.",
    });
  }
};


// =========================================================
// PATCH /api/users/:id/status
// Activate / deactivate administrator
//
// ONLY Main Administrator
// =========================================================

const updateUserStatus = async (
  req,
  res
) => {
  try {

    // -------------------------------------------------------
    // Permission check
    // -------------------------------------------------------

    if (!ensureSuperAdmin(req, res)) {
      return;
    }


    const userId =
      Number(req.params.id);

    const {
      is_active,
    } = req.body;


    // -------------------------------------------------------
    // Validate administrator ID
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // Validate status
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // Prevent self-deactivation
    // -------------------------------------------------------

    if (
      userId === Number(req.admin.id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot disable your own account.",
      });
    }


    // -------------------------------------------------------
    // Get target administrator
    // -------------------------------------------------------

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


    if (targetUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Administrator not found.",
      });
    }


    const targetUser =
      targetUsers[0];


    // -------------------------------------------------------
    // IMPORTANT:
    //
    // A Main Administrator cannot be managed through this
    // regular administrator-management action.
    //
    // This protects the Main Administrator account from
    // accidental or unauthorized deactivation.
    // -------------------------------------------------------

    if (
      targetUser.role === "super_admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "The Main Administrator account cannot be deactivated.",
      });
    }


    // -------------------------------------------------------
    // Normalize status
    // -------------------------------------------------------

    const activeValue =
      is_active === true ||
      is_active === 1
        ? 1
        : 0;


    // -------------------------------------------------------
    // Update account
    // -------------------------------------------------------

    const [result] =
      await pool.execute(
        `
          UPDATE admins
          SET is_active = ?
          WHERE id = ?
            AND role = 'admin'
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
          "Administrator not found.",
      });
    }


    return res.status(200).json({
      success: true,

      message:
        activeValue === 1
          ? "Administrator activated successfully."
          : "Administrator deactivated successfully.",
    });

  } catch (error) {

    console.error(
      "Update user status error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to update administrator status.",
    });
  }
};


// =========================================================
// DELETE /api/users/:id
// Delete administrator
//
// ONLY Main Administrator
// =========================================================

const deleteUser = async (
  req,
  res
) => {
  try {

    // -------------------------------------------------------
    // Permission check
    // -------------------------------------------------------

    if (!ensureSuperAdmin(req, res)) {
      return;
    }


    const userId =
      Number(req.params.id);


    // -------------------------------------------------------
    // Validate administrator ID
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // Prevent self-deletion
    // -------------------------------------------------------

    if (
      userId === Number(req.admin.id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot delete your own account.",
      });
    }


    // -------------------------------------------------------
    // Get target administrator
    // -------------------------------------------------------

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
          "Administrator not found.",
      });
    }


    const targetUser =
      targetUsers[0];


    // -------------------------------------------------------
    // NEVER allow deletion of Main Administrator
    // -------------------------------------------------------

    if (
      targetUser.role === "super_admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "The Main Administrator account cannot be deleted.",
      });
    }


    // -------------------------------------------------------
    // Delete ONLY regular administrators
    // -------------------------------------------------------

    const [result] =
      await pool.execute(
        `
          DELETE FROM admins
          WHERE id = ?
            AND role = 'admin'
        `,
        [userId]
      );


    if (
      result.affectedRows === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Administrator not found.",
      });
    }


    return res.status(200).json({
      success: true,

      message:
        "Administrator deleted successfully.",
    });

  } catch (error) {

    console.error(
      "Delete user error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to delete administrator.",
    });
  }
};


// =========================================================
// EXPORT
// =========================================================

module.exports = {
  getUsers,
  createUser,
  updateUserStatus,
  deleteUser,
};