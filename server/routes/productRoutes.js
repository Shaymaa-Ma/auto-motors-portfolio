const express = require("express");

const {
  getProducts,
  getProductById,
  getAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const authenticateAdmin = require(
  "../middleware/authMiddleware"
);

const {
  createImageUpload,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

// Reusable product image upload
const uploadProductImage =
  createImageUpload(
    "products",
    "product"
  );

// Get active products
router.get(
  "/",
  getProducts
);

// Get all products for Admin
router.get(
  "/admin",
  authenticateAdmin,
  getAdminProducts
);

// Get one product for Admin
router.get(
  "/admin/:id",
  authenticateAdmin,
  getAdminProductById
);

// Get one active product
router.get(
  "/:id",
  getProductById
);

// Create a product
router.post(
  "/",
  authenticateAdmin,
  uploadProductImage.single("image"),
  createProduct
);

// Update a product
router.put(
  "/:id",
  authenticateAdmin,
  uploadProductImage.single("image"),
  updateProduct
);

// Delete a product
router.delete(
  "/:id",
  authenticateAdmin,
  deleteProduct
);

module.exports = router;