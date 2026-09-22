const express = require("express");

const {
  getServices,
  getAdminServices,
  getService,
  createService,
  updateService,
  deleteService,
  reorderService,
  normalizeServiceOrders,
} = require("../controllers/serviceController");

const authMiddleware = require("../middleware/authMiddleware");

const router =
  express.Router();

/* =========================================================
   PUBLIC
========================================================= */

// Get active services for client
router.get(
  "/",
  getServices
);

/* =========================================================
   ADMIN
========================================================= */

// Get paginated services for Admin
router.get(
  "/admin",
  authMiddleware,
  getAdminServices
);

/* =========================================================
   ADMIN ORDERING
   IMPORTANT: before "/:id"
========================================================= */

router.post(
  "/normalize-orders",
  authMiddleware,
  normalizeServiceOrders
);

router.put(
  "/:id/order",
  authMiddleware,
  reorderService
);

/* =========================================================
   ADMIN SINGLE SERVICE
========================================================= */

router.get(
  "/:id",
  authMiddleware,
  getService
);

/* =========================================================
   ADMIN CRUD
========================================================= */

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