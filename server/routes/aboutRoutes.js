const express = require("express");
const router = express.Router();

const { getAbout } = require("../controllers/aboutController");

router.get("/", getAbout);

module.exports = router;