const db = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

// =========================================================
// GET ALL ACTIVE CATEGORIES
// =========================================================

const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT *
       FROM product_categories
       WHERE is_active = 1
       ORDER BY display_order ASC, id ASC`
    );

    return sendSuccess(
      res,
      rows,
      "Categories retrieved successfully"
    );
  } catch (error) {
    console.error("Get categories error:", error);
    return sendError(res, "Failed to retrieve categories");
  }
};

module.exports = {
  getCategories,
};