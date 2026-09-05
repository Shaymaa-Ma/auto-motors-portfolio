//Service API

const db = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

// =========================================================
// GET ALL ACTIVE SERVICES
// =========================================================

const getServices = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT *
       FROM services
       WHERE is_active = 1
       ORDER BY display_order ASC, id ASC`
       //if the admin disables a service, it automatically disappears from the client website
    );

    

    return sendSuccess(
      res,
      rows,
      "Services retrieved successfully"
    );
  } catch (error) {
    console.error("Get services error:", error);
    return sendError(res, "Failed to retrieve services");
  }
};

module.exports = {
  getServices,
};