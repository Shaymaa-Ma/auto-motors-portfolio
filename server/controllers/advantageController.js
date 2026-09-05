const db = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

// =========================================================
// GET ALL ACTIVE ADVANTAGES
// =========================================================

const getAdvantages = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT *
       FROM advantages
       WHERE is_active = 1
       ORDER BY display_order ASC, id ASC`
    );

    return sendSuccess(
      res,
      rows,
      "Advantages retrieved successfully"
    );
  } catch (error) {
    console.error("Get advantages error:", error);
    return sendError(res, "Failed to retrieve advantages");
  }
};

// =========================================================
// GET SINGLE ACTIVE ADVANTAGE
// =========================================================

const getAdvantageById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT *
       FROM advantages
       WHERE id = ?
       AND is_active = 1
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, "Advantage not found", 404);
    }

    return sendSuccess(
      res,
      rows[0],
      "Advantage retrieved successfully"
    );
  } catch (error) {
    console.error("Get advantage error:", error);
    return sendError(res, "Failed to retrieve advantage");
  }
};

module.exports = {
  getAdvantages,
  getAdvantageById,
};