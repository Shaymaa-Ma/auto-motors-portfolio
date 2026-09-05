
//Company route

const express = require("express");
const router = express.Router();

const { getCompany } = require("../controllers/companyController");

router.get("/", getCompany);

module.exports = router;