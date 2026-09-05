const db = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

// =========================================================
// GET ALL ACTIVE FAQS
// =========================================================

const getFaqs = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT *
       FROM faqs
       WHERE is_active = 1
       ORDER BY display_order ASC, id ASC`
    );

    return sendSuccess(
      res,
      rows,
      "FAQs retrieved successfully"
    );
  } catch (error) {
    console.error("Get FAQs error:", error);
    return sendError(res, "Failed to retrieve FAQs");
  }
};

// =========================================================
// GET SINGLE ACTIVE FAQ
// =========================================================

const getFaqById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT *
       FROM faqs
       WHERE id = ?
       AND is_active = 1
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, "FAQ not found", 404);
    }

    return sendSuccess(
      res,
      rows[0],
      "FAQ retrieved successfully"
    );
  } catch (error) {
    console.error("Get FAQ error:", error);
    return sendError(res, "Failed to retrieve FAQ");
  }
};

module.exports = {
  getFaqs,
  getFaqById,
};