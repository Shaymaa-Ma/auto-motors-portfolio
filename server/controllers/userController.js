const bcrypt = require("bcryptjs");
const pool = require("../config/db");

// =========================================================
// HELPERS
// =========================================================

const ensureAuthenticated = (req, res) => {
  if (!req.admin) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
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
// VALIDATE ROLE
// =========================================================
//
// Custom roles are allowed.
//
// IMPORTANT:
// A newly created account cannot be given super_admin
// privileges through the management form.
//
// =========================================================

const validateUserRole = (role) => {
  if (typeof role !== "string") {
    return {
      valid: false,
      message: "Role is required.",
    };
  }

  const cleanRole = role.trim();

  if (!cleanRole) {
    return {
      valid: false,
      message: "Role is required.",
    };
  }

  if (cleanRole.length > 50) {
    return {
      valid: false,
      message: "Role must not exceed 50 characters.",
    };
  }

  if (cleanRole.toLowerCase() === "super_admin") {
    return {
      valid: false,
      message:
        "The super administrator role cannot be assigned to another account.",
    };
  }

  return {
    valid: true,
    role: cleanRole,
  };
};


// =========================================================
// GET /api/users
// Get all administrators
//
// ONLY SUPER ADMIN
// =========================================================

const getUsers = async (req, res) => {
  try {
    if (!ensureSuperAdmin(req, res)) {
      return;
    }

    const [users] = await pool.execute(`
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
    `);

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve administrators.",
    });
  }
};


// =========================================================
// POST /api/users
// Create user
//
// ONLY SUPER ADMIN
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
      role,
    } = req.body;


    // -------------------------------------------------------
    // Validate required fields
    // -------------------------------------------------------

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof role !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password, and role are required.",
      });
    }


    // -------------------------------------------------------
    // Clean input
    // -------------------------------------------------------

    const cleanName = name.trim();

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

    if (cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message:
          "Name must not exceed 100 characters.",
      });
    }


    // -------------------------------------------------------
    // Validate email
    // -------------------------------------------------------

    if (
      cleanEmail.length === 0 ||
      cleanEmail.length > 191
    ) {
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
    // Validate role
    // -------------------------------------------------------

    const roleValidation =
      validateUserRole(role);

    if (!roleValidation.valid) {
      return res.status(400).json({
        success: false,
        message: roleValidation.message,
      });
    }

    const userRole =
      roleValidation.role;


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
    // Create account
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


    return res.status(201).json({
      success: true,

      message:
        "User created successfully.",

      user: {
        id: result.insertId,
        name: cleanName,
        email: cleanEmail,
        role: userRole,
        is_active: 1,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);

    if (error.code === "ER_DUP_ENTRY") {
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
// PATCH /api/users/me
//
// Edit currently logged-in user's profile.
//
// SUPER ADMIN:
//   name
//   email
//   password
//   role
//
// REGULAR USER:
//   name
//   email
//   password
//
// Regular users cannot modify their role or status.
// =========================================================

const updateMyProfile = async (
  req,
  res
) => {
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
      role,
    } = req.body;


    // -------------------------------------------------------
    // Validate name
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // Validate email
    // -------------------------------------------------------

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
      email.trim().toLowerCase();


    if (cleanEmail.length > 191) {
      return res.status(400).json({
        success: false,
        message:
          "Email address is too long.",
      });
    }


    // -------------------------------------------------------
    // Check email ownership
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // Determine whether password is changing
    // -------------------------------------------------------

    let passwordHash = null;

    if (
      typeof password === "string" &&
      password.length > 0
    ) {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 8 characters.",
        });
      }

      passwordHash =
        await bcrypt.hash(
          password,
          12
        );
    }


    // -------------------------------------------------------
    // SUPER ADMIN
    // Can change own role.
    // -------------------------------------------------------

    if (
      req.admin.role === "super_admin"
    ) {
      if (
        typeof role !== "string" ||
        !role.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Role is required.",
        });
      }

      const cleanRole =
        role.trim();

      if (cleanRole.length > 50) {
        return res.status(400).json({
          success: false,
          message:
            "Role must not exceed 50 characters.",
        });
      }

      // The current super admin may keep
      // or change their own role.
      //
      // However, if they change it away from
      // super_admin, they will lose super-admin
      // access on the next authenticated request.

      const finalRole =
        cleanRole;


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
          `,
          [
            cleanName,
            cleanEmail,
            passwordHash,
            finalRole,
            currentAdminId,
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
          `,
          [
            cleanName,
            cleanEmail,
            finalRole,
            currentAdminId,
          ]
        );
      }
    }

    // -------------------------------------------------------
    // REGULAR USER
    // Role is NEVER changed from their own profile.
    // -------------------------------------------------------

    else {
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
    }


    // -------------------------------------------------------
    // Get updated safe profile
    // -------------------------------------------------------

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


    const updatedUser =
      updatedUsers[0];


    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "Update own profile error:",
      error
    );

    if (error.code === "ER_DUP_ENTRY") {
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
// PATCH /api/users/:id
//
// SUPER ADMIN ONLY
//
// Can edit:
//   name
//   email
//   password
//   role
//
// Status is deliberately handled by its own endpoint.
// =========================================================

const updateUser = async (
  req,
  res
) => {
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
      role,
    } = req.body;


    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof role !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, and role are required.",
      });
    }


    const cleanName =
      name.trim();

    const cleanEmail =
      email.trim().toLowerCase();

    const cleanRole =
      role.trim();


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


    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message:
          "A valid email address is required.",
      });
    }


    if (!cleanRole) {
      return res.status(400).json({
        success: false,
        message:
          "Role is required.",
      });
    }


    if (cleanRole.length > 50) {
      return res.status(400).json({
        success: false,
        message:
          "Role must not exceed 50 characters.",
      });
    }


    // -------------------------------------------------------
    // Find target
    // -------------------------------------------------------

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


    if (targetUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }


    const targetUser =
      targetUsers[0];


    // -------------------------------------------------------
    // Prevent changing the super-admin role of another
    // account through this endpoint.
    //
    // The main super admin can edit their OWN role through
    // /api/users/me.
    // -------------------------------------------------------

    if (
      targetUser.role === "super_admin" &&
      userId !== Number(req.admin.id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "The Main Administrator account can only be edited from its own profile.",
      });
    }


    // -------------------------------------------------------
    // Prevent creating another super_admin
    // through normal user management.
    // -------------------------------------------------------

    if (
      cleanRole.toLowerCase() ===
      "super_admin"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The super administrator role cannot be assigned to another account.",
      });
    }


    // -------------------------------------------------------
    // Check duplicate email
    // -------------------------------------------------------

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


    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This email address is already in use.",
      });
    }


    // -------------------------------------------------------
    // Password
    // -------------------------------------------------------

    let passwordHash = null;

    if (
      typeof password === "string" &&
      password.length > 0
    ) {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 8 characters.",
        });
      }

      passwordHash =
        await bcrypt.hash(
          password,
          12
        );
    }


    // -------------------------------------------------------
    // Update
    // -------------------------------------------------------

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
        `,
        [
          cleanName,
          cleanEmail,
          passwordHash,
          cleanRole,
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
        `,
        [
          cleanName,
          cleanEmail,
          cleanRole,
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

    if (error.code === "ER_DUP_ENTRY") {
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
// PATCH /api/users/:id/status
// Activate / deactivate user
//
// ONLY SUPER ADMIN
// =========================================================

const updateUserStatus = async (
  req,
  res
) => {
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
    // Find target
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
          "User not found.",
      });
    }


    const targetUser =
      targetUsers[0];


    // -------------------------------------------------------
    // Never deactivate super admin
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
// DELETE /api/users/:id
// Delete user
//
// ONLY SUPER ADMIN
// =========================================================

const deleteUser = async (
  req,
  res
) => {
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
    // Find target
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
          "User not found.",
      });
    }


    const targetUser =
      targetUsers[0];


    // -------------------------------------------------------
    // Never delete super admin
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
    // Delete user
    // -------------------------------------------------------

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
// EXPORT
// =========================================================

module.exports = {
  getUsers,
  createUser,
  updateMyProfile,
  updateUser,
  updateUserStatus,
  deleteUser,
};