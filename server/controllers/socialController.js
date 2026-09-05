const db = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

// =========================================================
// GET ALL ACTIVE SOCIAL LINKS
// =========================================================

const getSocialLinks = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT *
       FROM social_links
       WHERE is_active = 1
       ORDER BY display_order ASC, id ASC`
    );

    return sendSuccess(
      res,
      rows,
      "Social links retrieved successfully"
    );
  } catch (error) {
    console.error("Get social links error:", error);
    return sendError(res, "Failed to retrieve social links");
  }
};

// =========================================================
// GET SINGLE ACTIVE SOCIAL LINK
// =========================================================

const getSocialLinkById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT *
       FROM social_links
       WHERE id = ?
       AND is_active = 1
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, "Social link not found", 404);
    }

    return sendSuccess(
      res,
      rows[0],
      "Social link retrieved successfully"
    );
  } catch (error) {
    console.error("Get social link error:", error);
    return sendError(res, "Failed to retrieve social link");
  }
};

module.exports = {
  getSocialLinks,
  getSocialLinkById,
};