const express = require("express");

const {
  getSocialLinks,
  getSocialLinkById,

  getAdminSocialLinks,
  getAdminSocialLinkById,

  createSocialLink,
  updateSocialLink,

  updateSocialLinksSection,

  reorderSocialLink,
  normalizeSocialLinkOrders,

  deleteSocialLink,
} = require("../controllers/socialController");

const authenticateAdmin = require(
  "../middleware/authMiddleware"
);

const router = express.Router();

// ==========================================================================
// ADMIN ROUTES
// IMPORTANT: Keep these BEFORE /:id
// ==========================================================================

// Get paginated social links for Admin
// GET /api/social-links/admin?page=1&limit=10
router.get(
  "/admin",
  authenticateAdmin,
  getAdminSocialLinks
);

// Get one social link for Admin
// GET /api/social-links/admin/:id
router.get(
  "/admin/:id",
  authenticateAdmin,
  getAdminSocialLinkById
);

// Update shared Social Links section content
// PUT /api/social-links/section
router.put(
  "/section",
  authenticateAdmin,
  updateSocialLinksSection
);

// Reorder social link
// PUT /api/social-links/:id/order
router.put(
  "/:id/order",
  authenticateAdmin,
  reorderSocialLink
);

// Normalize all social link orders
// POST /api/social-links/normalize-orders
router.post(
  "/normalize-orders",
  authenticateAdmin,
  normalizeSocialLinkOrders
);

// ==========================================================================
// PUBLIC ROUTES
// ==========================================================================

// Get active social links
// GET /api/social-links
router.get(
  "/",
  getSocialLinks
);

// Get one active social link
// GET /api/social-links/:id
router.get(
  "/:id",
  getSocialLinkById
);

// ==========================================================================
// ADMIN CREATE / UPDATE / DELETE
// ==========================================================================

// Create social link
// POST /api/social-links
router.post(
  "/",
  authenticateAdmin,
  createSocialLink
);

// Update social link
// PUT /api/social-links/:id
router.put(
  "/:id",
  authenticateAdmin,
  updateSocialLink
);

// Delete social link
// DELETE /api/social-links/:id
router.delete(
  "/:id",
  authenticateAdmin,
  deleteSocialLink
);

module.exports = router;