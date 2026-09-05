//Company API

const db = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

// =========================================================
// GET COMPANY INFORMATION
// =========================================================

const getCompany = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM company_info ORDER BY id ASC LIMIT 1"
    );

    if (rows.length === 0) {
      return sendError(res, "Company information not found", 404);
    }

    return sendSuccess(
      res,
      rows[0],
      "Company information retrieved successfully"
    );
  } catch (error) {
    console.error("Get company error:", error);
    return sendError(res, "Failed to retrieve company information");
  }
};

module.exports = {
  getCompany,
};