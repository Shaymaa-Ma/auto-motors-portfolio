const express = require("express");

const {
  getVehicles,
  getVehicleById,
  createVehicle,
  getAdminVehicles,
  getAdminVehicleById,
  updateVehicle,
  updateVehicleSection,
  reorderVehicle,
  normalizeVehicleOrders,
  deleteVehicle,
} = require("../controllers/vehicleController");

const authenticateAdmin = require("../middleware/authMiddleware");

const {
  createImageUpload,
} = require("../middleware/uploadMiddleware");

const {
  cacheMiddleware,
} = require("../middleware/cache");

const router = express.Router();


// =========================================================
// VEHICLE IMAGE UPLOAD
// =========================================================

const vehicleUpload =
  createImageUpload(
    "vehicles",
    "vehicle"
  );


// =========================================================
// ADMIN ROUTES
// =========================================================

// Get paginated vehicles
router.get(
  "/admin",
  authenticateAdmin,
  getAdminVehicles
);

// Get one vehicle for admin
router.get(
  "/admin/:id",
  authenticateAdmin,
  getAdminVehicleById
);


// =========================================================
// ADMIN - SHARED VEHICLES SECTION
// =========================================================

// Update shared Vehicles section
// No image is uploaded here.
// Multer parses the multipart/form-data fields.
router.put(
  "/section",
  authenticateAdmin,
  vehicleUpload.none(),
  updateVehicleSection
);


// =========================================================
// ADMIN - CREATE
// =========================================================

// Create vehicle
router.post(
  "/",
  authenticateAdmin,
  vehicleUpload.single("image"),
  createVehicle
);


// =========================================================
// ADMIN - REORDER
// =========================================================

// Reorder vehicle
router.put(
  "/:id/order",
  authenticateAdmin,
  reorderVehicle
);

// Normalize vehicle orders
router.post(
  "/normalize-orders",
  authenticateAdmin,
  normalizeVehicleOrders
);


// =========================================================
// PUBLIC ROUTES
// =========================================================

// Get active vehicles
router.get(
  "/",
  cacheMiddleware(),
  getVehicles
);

// Get one active vehicle
router.get(
  "/:id",
  cacheMiddleware(),
  getVehicleById
);


// =========================================================
// ADMIN - UPDATE / DELETE
// =========================================================

// Update vehicle
router.put(
  "/:id",
  authenticateAdmin,
  vehicleUpload.single("image"),
  updateVehicle
);

// Delete vehicle
router.delete(
  "/:id",
  authenticateAdmin,
  deleteVehicle
);


module.exports = router;