/*const express = require("express");
const router = express.Router();

const {
  register,
  login,
  me,
  logout,
} = require("../controllers/authController");

const {
  authenticateAdmin,
} = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticateAdmin, me);
router.post("/logout", authenticateAdmin, logout);

module.exports = router;
*/