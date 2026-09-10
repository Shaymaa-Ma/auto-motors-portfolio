const express = require("express");

const {
  getSocialLinks,
  getSocialLinkById,
  getAdminSocialLinks,
  getAdminSocialLinkById,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} = require("../controllers/socialController");

const authenticateAdmin = require(
  "../middleware/authMiddleware"
);

const router =
  express.Router();

// Get active social links for the client
router.get(
  "/",
  getSocialLinks
);

// Get all social links for Admin
router.get(
  "/admin",
  authenticateAdmin,
  getAdminSocialLinks
);

// Get one social link for Admin
router.get(
  "/admin/:id",
  authenticateAdmin,
  getAdminSocialLinkById
);

// Get one active social link
router.get(
  "/:id",
  getSocialLinkById
);

// Create a social link
router.post(
  "/",
  authenticateAdmin,
  createSocialLink
);

// Update a social link
router.put(
  "/:id",
  authenticateAdmin,
  updateSocialLink
);

// Delete a social link
router.delete(
  "/:id",
  authenticateAdmin,
  deleteSocialLink
);

module.exports = router;