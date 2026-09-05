const db = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

// =========================================================
// GET ALL ACTIVE PRODUCTS
// =========================================================

const getProducts = async (req, res) => {
  try {
    const { category } = req.query;

    let sql = `
      SELECT
        p.*,
        c.name_fr AS category_name_fr,
        c.name_en AS category_name_en
      FROM products p
      LEFT JOIN product_categories c
        ON p.category_id = c.id
      WHERE p.is_active = 1
    `;

    const params = [];

    // Optional category filter
    if (category) {
      sql += ` AND p.category_id = ?`;
      params.push(category);
    }

    sql += ` ORDER BY p.display_order ASC, p.id ASC`;

    const [rows] = await db.query(sql, params);

    return sendSuccess(
      res,
      rows,
      "Products retrieved successfully"
    );
  } catch (error) {
    console.error("Get products error:", error);
    return sendError(res, "Failed to retrieve products");
  }
};

// =========================================================
// GET SINGLE ACTIVE PRODUCT
// =========================================================

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT
         p.*,
         c.name_fr AS category_name_fr,
         c.name_en AS category_name_en
       FROM products p
       LEFT JOIN product_categories c
         ON p.category_id = c.id
       WHERE p.id = ?
       AND p.is_active = 1
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, "Product not found", 404);
    }

    return sendSuccess(
      res,
      rows[0],
      "Product retrieved successfully"
    );
  } catch (error) {
    console.error("Get product error:", error);
    return sendError(res, "Failed to retrieve product");
  }
};

module.exports = {
  getProducts,
  getProductById,
};