const express = require("express");

const {
  getUsers,
  createUser,
  updateMyProfile,
  updateUser,
  updateUserStatus,
  deleteUser,
} = require("../controllers/userController");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  requireSuperAdmin,
} = require("../middleware/roleMiddleware");


const router = express.Router();


// =========================================================
// AUTHENTICATION
// =========================================================
//
// Every route requires authentication.
//
// =========================================================

router.use(authMiddleware);


// =========================================================
// CURRENT USER PROFILE
// =========================================================
//
// Accessible by:
// - super_admin
// - Employee
// - Manager
// - any other authenticated role
//
// Role/status cannot be changed by regular users.
// =========================================================

router.patch(
  "/me",
  updateMyProfile
);


// =========================================================
// SUPER ADMIN ONLY
// =========================================================
//
// Everything below this point requires:
// role = super_admin
//
// =========================================================

router.use(requireSuperAdmin);


// =========================================================
// GET /api/users
// Get all users
// =========================================================

router.get(
  "/",
  getUsers
);


// =========================================================
// POST /api/users
// Create user
// =========================================================

router.post(
  "/",
  createUser
);


// =========================================================
// PATCH /api/users/:id
// Edit user
//
// Super admin can edit:
// - name
// - email
// - password
// - role
// =========================================================

router.patch(
  "/:id",
  updateUser
);


// =========================================================
// PATCH /api/users/:id/status
// Activate / deactivate user
// =========================================================

router.patch(
  "/:id/status",
  updateUserStatus
);


// =========================================================
// DELETE /api/users/:id
// Delete user
// =========================================================

router.delete(
  "/:id",
  deleteUser
);


module.exports = router;