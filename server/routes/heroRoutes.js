//Hero routes 

const express = require("express");
const router = express.Router();

const { getHero } = require("../controllers/heroController");

router.get("/", getHero);

module.exports = router;