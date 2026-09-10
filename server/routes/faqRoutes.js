const express = require("express");

const {
  getFaqs,
  getFaqById,
  getAdminFaqs,
  getAdminFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
} = require("../controllers/faqController");

const authMiddleware = require("../middleware/authMiddleware");

const router =
  express.Router();

// Get active FAQs for the client
router.get(
  "/",
  getFaqs
);

// Get all FAQs for Admin
router.get(
  "/admin",
  authMiddleware,
  getAdminFaqs
);

// Get one FAQ for Admin
router.get(
  "/admin/:id",
  authMiddleware,
  getAdminFaqById
);

// Get one active FAQ for the client
router.get(
  "/:id",
  getFaqById
);

// Create an FAQ
router.post(
  "/",
  authMiddleware,
  createFaq
);

// Update an FAQ
router.put(
  "/:id",
  authMiddleware,
  updateFaq
);

// Delete an FAQ
router.delete(
  "/:id",
  authMiddleware,
  deleteFaq
);

module.exports = router;