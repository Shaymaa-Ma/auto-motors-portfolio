const express = require("express");

const {
  getUsers,
  createUser,
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
// The administrator must first be authenticated.
//
// =========================================================

router.use(authMiddleware);


// =========================================================
// MAIN ADMIN ONLY
// =========================================================
//
// Everything below this point is restricted to:
//
// role = "super_admin"
//
// Regular administrators receive HTTP 403.
//
// =========================================================

router.use(requireSuperAdmin);


// =========================================================
// GET /api/users
// Get all administrators
// =========================================================

router.get(
  "/",
  getUsers
);


// =========================================================
// POST /api/users
// Create regular administrator
// =========================================================

router.post(
  "/",
  createUser
);


// =========================================================
// PATCH /api/users/:id/status
// Activate / deactivate regular administrator
// =========================================================

router.patch(
  "/:id/status",
  updateUserStatus
);


// =========================================================
// DELETE /api/users/:id
// Delete regular administrator
// =========================================================

router.delete(
  "/:id",
  deleteUser
);


module.exports = router;