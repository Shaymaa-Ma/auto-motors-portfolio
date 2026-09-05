const express = require("express");
const router = express.Router();

const {
  getSocialLinks,
  getSocialLinkById,
} = require("../controllers/socialController");

router.get("/", getSocialLinks);
router.get("/:id", getSocialLinkById);

module.exports = router;