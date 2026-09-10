const express = require("express");

const {
  getVehicles,
  getVehicleById,
  getAdminVehicles,
  getAdminVehicleById,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicleController");

const authenticateAdmin = require(
  "../middleware/authMiddleware"
);

const {
  createImageUpload,
} = require("../middleware/uploadMiddleware");

const router =
  express.Router();

// Configure Vehicle image upload
const vehicleUpload =
  createImageUpload(
    "vehicles",
    "vehicle"
  );

// Get active vehicles for the client
router.get(
  "/",
  getVehicles
);

// Get all vehicles for Admin
router.get(
  "/admin",
  authenticateAdmin,
  getAdminVehicles
);

// Get one vehicle for Admin
router.get(
  "/admin/:id",
  authenticateAdmin,
  getAdminVehicleById
);

// Get one active vehicle for the client
router.get(
  "/:id",
  getVehicleById
);

// Update a vehicle
router.put(
  "/:id",
  authenticateAdmin,
  vehicleUpload.single(
    "image"
  ),
  updateVehicle
);

// Delete a vehicle
router.delete(
  "/:id",
  authenticateAdmin,
  deleteVehicle
);

module.exports = router;