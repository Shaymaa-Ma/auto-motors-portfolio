const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
} = require("../controllers/productController");

// GET all products
router.get("/", getProducts);

// GET one product
router.get("/:id", getProductById);

module.exports = router;