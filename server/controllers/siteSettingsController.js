const db = require("../config/db");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

// Get all site settings
// GET /api/site-settings
// Public
const getSiteSettings = async (
  req,
  res
) => {
  try {
    const [rows] = await db.query(
      `
        SELECT
          id,
          setting_key,
          setting_value,
          created_at,
          updated_at
        FROM site_settings
        ORDER BY id ASC
      `
    );

    return sendSuccess(
      res,
      rows,
      "Site settings retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get site settings error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve site settings"
    );
  }
};

// Get one site setting by key
// GET /api/site-settings/:key
// Public
const getSiteSettingByKey = async (
  req,
  res
) => {
  try {
    const {
      key,
    } = req.params;

    const [rows] = await db.query(
      `
        SELECT
          id,
          setting_key,
          setting_value,
          created_at,
          updated_at
        FROM site_settings
        WHERE setting_key = ?
        LIMIT 1
      `,
      [key]
    );

    if (
      rows.length === 0
    ) {
      return sendError(
        res,
        "Site setting not found",
        404
      );
    }

    return sendSuccess(
      res,
      rows[0],
      "Site setting retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get site setting error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve site setting"
    );
  }
};

// Update a site setting
// PUT /api/site-settings/:key
// Protected
const updateSiteSetting = async (
  req,
  res
) => {
  try {
    const {
      key,
    } = req.params;

    const {
      setting_value,
    } = req.body;

    // Validate the value
    if (
      setting_value === undefined ||
      setting_value === null
    ) {
      return sendError(
        res,
        "Setting value is required.",
        400
      );
    }

    // Check that the setting exists
    const [existingRows] =
      await db.query(
        `
          SELECT id
          FROM site_settings
          WHERE setting_key = ?
          LIMIT 1
        `,
        [key]
      );

    if (
      existingRows.length === 0
    ) {
      return sendError(
        res,
        "Site setting not found",
        404
      );
    }

    // Update the site setting
    await db.query(
      `
        UPDATE site_settings
        SET setting_value = ?
        WHERE setting_key = ?
      `,
      [
        String(setting_value).trim(),
        key,
      ]
    );

    // Get the updated setting
    const [rows] =
      await db.query(
        `
          SELECT
            id,
            setting_key,
            setting_value,
            created_at,
            updated_at
          FROM site_settings
          WHERE setting_key = ?
          LIMIT 1
        `,
        [key]
      );

    return sendSuccess(
      res,
      rows[0],
      "Site setting updated successfully"
    );
  } catch (error) {
    console.error(
      "Update site setting error:",
      error
    );

    return sendError(
      res,
      "Failed to update site setting"
    );
  }
};

// Delete a site setting
// DELETE /api/site-settings/:key
// Protected
const deleteSiteSetting = async (
  req,
  res
) => {
  try {
    const {
      key,
    } = req.params;

    // Check that the setting exists
    const [existingRows] =
      await db.query(
        `
          SELECT
            id,
            setting_key
          FROM site_settings
          WHERE setting_key = ?
          LIMIT 1
        `,
        [key]
      );

    if (
      existingRows.length === 0
    ) {
      return sendError(
        res,
        "Site setting not found",
        404
      );
    }

    // Delete only the database record
    await db.query(
      `
        DELETE FROM site_settings
        WHERE setting_key = ?
      `,
      [key]
    );

    return sendSuccess(
      res,
      null,
      "Site setting deleted successfully"
    );
  } catch (error) {
    console.error(
      "Delete site setting error:",
      error
    );

    return sendError(
      res,
      "Failed to delete site setting"
    );
  }
};

module.exports = {
  getSiteSettings,
  getSiteSettingByKey,
  updateSiteSetting,
  deleteSiteSetting,
};