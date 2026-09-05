const express = require("express");
const router = express.Router();

const {
  getAdvantages,
  getAdvantageById,
} = require("../controllers/advantageController");

router.get("/", getAdvantages);
router.get("/:id", getAdvantageById);

module.exports = router;