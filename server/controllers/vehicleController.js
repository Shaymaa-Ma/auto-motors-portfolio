const db = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

// =========================================================
// GET ALL ACTIVE VEHICLES
// =========================================================

const getVehicles = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT *
       FROM vehicles
       WHERE is_active = 1
       ORDER BY display_order ASC, id ASC`
    );

    return sendSuccess(
      res,
      rows,
      "Vehicles retrieved successfully"
    );
  } catch (error) {
    console.error("Get vehicles error:", error);
    return sendError(res, "Failed to retrieve vehicles");
  }
};

// =========================================================
// GET SINGLE ACTIVE VEHICLE
// =========================================================

const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT *
       FROM vehicles
       WHERE id = ?
       AND is_active = 1
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, "Vehicle not found", 404);
    }

    return sendSuccess(
      res,
      rows[0],
      "Vehicle retrieved successfully"
    );
  } catch (error) {
    console.error("Get vehicle error:", error);
    return sendError(res, "Failed to retrieve vehicle");
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
};