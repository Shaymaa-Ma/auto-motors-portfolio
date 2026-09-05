const db = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

// =========================================================
// GET ALL ACTIVE GALLERY ITEMS
// =========================================================

const getGallery = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT *
       FROM gallery
       WHERE is_active = 1
       ORDER BY display_order ASC, id ASC`
    );

    return sendSuccess(
      res,
      rows,
      "Gallery retrieved successfully"
    );
  } catch (error) {
    console.error("Get gallery error:", error);
    return sendError(res, "Failed to retrieve gallery");
  }
};

// =========================================================
// GET SINGLE ACTIVE GALLERY ITEM
// =========================================================

const getGalleryItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT *
       FROM gallery
       WHERE id = ?
       AND is_active = 1
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, "Gallery item not found", 404);
    }

    return sendSuccess(
      res,
      rows[0],
      "Gallery item retrieved successfully"
    );
  } catch (error) {
    console.error("Get gallery item error:", error);
    return sendError(res, "Failed to retrieve gallery item");
  }
};

module.exports = {
  getGallery,
  getGalleryItemById,
};