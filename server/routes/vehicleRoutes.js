const express = require("express");
const router = express.Router();

const {
  getVehicles,
  getVehicleById,
} = require("../controllers/vehicleController");

router.get("/", getVehicles);
router.get("/:id", getVehicleById);

module.exports = router;