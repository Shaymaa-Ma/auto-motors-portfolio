const express = require("express");
const router = express.Router();

const {
  getFaqs,
  getFaqById,
} = require("../controllers/faqController");

router.get("/", getFaqs);
router.get("/:id", getFaqById);

module.exports = router;