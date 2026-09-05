//Hero API

const db = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

// =========================================================
// GET HERO
// =========================================================

const getHero = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM hero ORDER BY id ASC LIMIT 1"
    );

    if (rows.length === 0) {
      return sendError(res, "Hero information not found", 404);
    }

    return sendSuccess(
      res,
      rows[0],
      "Hero information retrieved successfully"
    );
  } catch (error) {
    console.error("Get hero error:", error);
    return sendError(res, "Failed to retrieve hero information");
  }
};

module.exports = {
  getHero,
};