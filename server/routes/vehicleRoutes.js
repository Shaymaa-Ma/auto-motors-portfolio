const express = require("express");

const {
  getVehicles,
  getVehicleById,

  getAdminVehicles,
  getAdminVehicleById,

  updateVehicle,
  updateVehicleSection,

  reorderVehicle,
  normalizeVehicleOrders,

  deleteVehicle,
} = require("../controllers/vehicleController");

const authenticateAdmin = require(
  "../middleware/authMiddleware"
);

const {
  createImageUpload,
} = require(
  "../middleware/uploadMiddleware"
);

const router = express.Router();

// ==========================================================================
// UPLOAD
// ==========================================================================

const vehicleUpload =
  createImageUpload(
    "vehicles",
    "vehicle"
  );

// ==========================================================================
// ADMIN ROUTES
// IMPORTANT: Keep these BEFORE /:id
// ==========================================================================

// Get paginated vehicles for Admin
// GET /api/vehicles/admin?page=1&limit=10
router.get(
  "/admin",
  authenticateAdmin,
  getAdminVehicles
);

// Get one vehicle for Admin
// GET /api/vehicles/admin/:id
router.get(
  "/admin/:id",
  authenticateAdmin,
  getAdminVehicleById
);

// Update shared Vehicles section content
// PUT /api/vehicles/section
router.put(
  "/section",
  authenticateAdmin,
  updateVehicleSection
);

// Reorder vehicle
// PUT /api/vehicles/:id/order
router.put(
  "/:id/order",
  authenticateAdmin,
  reorderVehicle
);

// Normalize all vehicle orders
// POST /api/vehicles/normalize-orders
router.post(
  "/normalize-orders",
  authenticateAdmin,
  normalizeVehicleOrders
);

// ==========================================================================
// PUBLIC ROUTES
// ==========================================================================

// Get active vehicles
// GET /api/vehicles
router.get(
  "/",
  getVehicles
);

// Get one active vehicle
// GET /api/vehicles/:id
router.get(
  "/:id",
  getVehicleById
);

// ==========================================================================
// ADMIN UPDATE / DELETE
// ==========================================================================

// Update vehicle
// PUT /api/vehicles/:id
router.put(
  "/:id",
  authenticateAdmin,
  vehicleUpload.single("image"),
  updateVehicle
);

// Delete vehicle
// DELETE /api/vehicles/:id
router.delete(
  "/:id",
  authenticateAdmin,
  deleteVehicle
);

module.exports = router;