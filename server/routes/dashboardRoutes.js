const express = require("express");

const {
  getDashboardStats,
} = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   DASHBOARD STATISTICS
========================================================= */

router.get(
  "/stats",
  authMiddleware,
  getDashboardStats
);

module.exports = router;