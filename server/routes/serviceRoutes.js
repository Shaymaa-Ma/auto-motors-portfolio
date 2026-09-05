//Service routes

const express = require("express");
const router = express.Router();

const {
  getServices,
} = require("../controllers/serviceController");

router.get("/", getServices);

module.exports = router;