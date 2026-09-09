const express = require("express");

const {
  getServices,
  getAdminServices,
  getService,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const authMiddleware = require("../middleware/authMiddleware");

const router =
  express.Router();

// Get active services for the client
router.get(
  "/",
  getServices
);

// Get all services for Admin
router.get(
  "/admin",
  authMiddleware,
  getAdminServices
);

// Get one service for Admin
router.get(
  "/:id",
  authMiddleware,
  getService
);

// Create a service
router.post(
  "/",
  authMiddleware,
  createService
);

// Update a service
router.put(
  "/:id",
  authMiddleware,
  updateService
);

// Delete a service
router.delete(
  "/:id",
  authMiddleware,
  deleteService
);

module.exports = router;