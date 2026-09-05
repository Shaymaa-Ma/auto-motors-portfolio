const db = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

// =========================================================
// GET ALL SITE SETTINGS
// =========================================================

const getSiteSettings = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT *
       FROM site_settings
       ORDER BY id ASC`
    );

    return sendSuccess(
      res,
      rows,
      "Site settings retrieved successfully"
    );
  } catch (error) {
    console.error("Get site settings error:", error);
    return sendError(res, "Failed to retrieve site settings");
  }
};

// =========================================================
// GET SINGLE SITE SETTING BY KEY
// =========================================================

const getSiteSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;

    const [rows] = await db.query(
      `SELECT *
       FROM site_settings
       WHERE setting_key = ?
       LIMIT 1`,
      [key]
    );

    if (rows.length === 0) {
      return sendError(res, "Site setting not found", 404);
    }

    return sendSuccess(
      res,
      rows[0],
      "Site setting retrieved successfully"
    );
  } catch (error) {
    console.error("Get site setting error:", error);
    return sendError(res, "Failed to retrieve site setting");
  }
};

module.exports = {
  getSiteSettings,
  getSiteSettingByKey,
};