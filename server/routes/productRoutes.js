const express = require("express");

const {
  getProducts,
  getProductById,
  getAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createImageUpload,
} = require("../middleware/uploadMiddleware");

const router =
  express.Router();

// Configure Product image upload
const productUpload =
  createImageUpload(
    "products",
    "product"
  );

// Get active products for the client
router.get(
  "/",
  getProducts
);

// Get all products for Admin
router.get(
  "/admin",
  authMiddleware,
  getAdminProducts
);

// Get one product for Admin
router.get(
  "/admin/:id",
  authMiddleware,
  getAdminProductById
);

// Get one active product for the client
router.get(
  "/:id",
  getProductById
);

// Create a product
router.post(
  "/",
  authMiddleware,
  productUpload.single(
    "image"
  ),
  createProduct
);

// Update a product
router.put(
  "/:id",
  authMiddleware,
  productUpload.single(
    "image"
  ),
  updateProduct
);

module.exports = router;