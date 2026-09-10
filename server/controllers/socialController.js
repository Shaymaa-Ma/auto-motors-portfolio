const db = require("../config/db");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

// Get all active social links
// GET /api/social-links
// Public
const getSocialLinks = async (
  req,
  res
) => {
  try {
    const [rows] =
      await db.query(
        `
          SELECT *
          FROM social_links
          WHERE is_active = 1
          ORDER BY
            display_order ASC,
            id ASC
        `
      );

    return sendSuccess(
      res,
      rows,
      "Social links retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get social links error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve social links"
    );
  }
};

// Get one active social link
// GET /api/social-links/:id
// Public
const getSocialLinkById =
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      const [rows] =
        await db.query(
          `
            SELECT *
            FROM social_links
            WHERE id = ?
              AND is_active = 1
            LIMIT 1
          `,
          [id]
        );

      if (
        rows.length === 0
      ) {
        return sendError(
          res,
          "Social link not found",
          404
        );
      }

      return sendSuccess(
        res,
        rows[0],
        "Social link retrieved successfully"
      );
    } catch (error) {
      console.error(
        "Get social link error:",
        error
      );

      return sendError(
        res,
        "Failed to retrieve social link"
      );
    }
  };

// Get all social links for Admin
// GET /api/social-links/admin
// Protected
const getAdminSocialLinks =
  async (
    req,
    res
  ) => {
    try {
      const [rows] =
        await db.query(
          `
            SELECT *
            FROM social_links
            ORDER BY
              display_order ASC,
              id ASC
          `
        );

      return sendSuccess(
        res,
        rows,
        "Social links retrieved successfully"
      );
    } catch (error) {
      console.error(
        "Get admin social links error:",
        error
      );

      return sendError(
        res,
        "Failed to retrieve social links"
      );
    }
  };

// Get one social link for Admin
// GET /api/social-links/admin/:id
// Protected
const getAdminSocialLinkById =
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      const [rows] =
        await db.query(
          `
            SELECT *
            FROM social_links
            WHERE id = ?
            LIMIT 1
          `,
          [id]
        );

      if (
        rows.length === 0
      ) {
        return sendError(
          res,
          "Social link not found",
          404
        );
      }

      return sendSuccess(
        res,
        rows[0],
        "Social link retrieved successfully"
      );
    } catch (error) {
      console.error(
        "Get admin social link error:",
        error
      );

      return sendError(
        res,
        "Failed to retrieve social link"
      );
    }
  };

// Create a social link
// POST /api/social-links
// Protected
const createSocialLink =
  async (
    req,
    res
  ) => {
    try {
      const {
        section_title_fr,
        section_title_en,
        section_subtitle_fr,
        section_subtitle_en,
        platform,
        url,
        icon,
        display_order,
        is_active,
      } = req.body;

      // Validate required fields
      if (
        !platform?.trim() ||
        !url?.trim()
      ) {
        return sendError(
          res,
          "Platform and URL are required.",
          400
        );
      }

      // Create the social link
      const [result] =
        await db.query(
          `
            INSERT INTO social_links (
              section_title_fr,
              section_title_en,
              section_subtitle_fr,
              section_subtitle_en,
              platform,
              url,
              icon,
              display_order,
              is_active
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            section_title_fr?.trim() ||
              null,

            section_title_en?.trim() ||
              null,

            section_subtitle_fr?.trim() ||
              null,

            section_subtitle_en?.trim() ||
              null,

            platform.trim(),

            url.trim(),

            icon?.trim() ||
              null,

            display_order !==
            undefined
              ? Number(
                  display_order
                ) || 0
              : 0,

            is_active !==
            undefined
              ? Number(
                  is_active
                ) === 1
                ? 1
                : 0
              : 1,
          ]
        );

      // Get the newly created social link
      const [rows] =
        await db.query(
          `
            SELECT *
            FROM social_links
            WHERE id = ?
            LIMIT 1
          `,
          [result.insertId]
        );

      return sendSuccess(
        res,
        rows[0],
        "Social link created successfully",
        201
      );
    } catch (error) {
      console.error(
        "Create social link error:",
        error
      );

      return sendError(
        res,
        "Failed to create social link"
      );
    }
  };

// Update a social link
// PUT /api/social-links/:id
// Protected
const updateSocialLink =
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      // Get the existing social link
      const [existingRows] =
        await db.query(
          `
            SELECT *
            FROM social_links
            WHERE id = ?
            LIMIT 1
          `,
          [id]
        );

      if (
        existingRows.length === 0
      ) {
        return sendError(
          res,
          "Social link not found",
          404
        );
      }

      const existing =
        existingRows[0];

      const {
        section_title_fr,
        section_title_en,
        section_subtitle_fr,
        section_subtitle_en,
        platform,
        url,
        icon,
        display_order,
        is_active,
      } = req.body;

      // Validate required fields when provided
      if (
        platform !==
          undefined &&
        !platform.trim()
      ) {
        return sendError(
          res,
          "Platform is required.",
          400
        );
      }

      if (
        url !== undefined &&
        !url.trim()
      ) {
        return sendError(
          res,
          "URL is required.",
          400
        );
      }

      // Update social link information
      await db.query(
        `
          UPDATE social_links
          SET
            section_title_fr = ?,
            section_title_en = ?,
            section_subtitle_fr = ?,
            section_subtitle_en = ?,
            platform = ?,
            url = ?,
            icon = ?,
            display_order = ?,
            is_active = ?
          WHERE id = ?
        `,
        [
          section_title_fr !==
          undefined
            ? section_title_fr.trim() ||
              null
            : existing.section_title_fr,

          section_title_en !==
          undefined
            ? section_title_en.trim() ||
              null
            : existing.section_title_en,

          section_subtitle_fr !==
          undefined
            ? section_subtitle_fr.trim() ||
              null
            : existing.section_subtitle_fr,

          section_subtitle_en !==
          undefined
            ? section_subtitle_en.trim() ||
              null
            : existing.section_subtitle_en,

          platform !==
          undefined
            ? platform.trim()
            : existing.platform,

          url !==
          undefined
            ? url.trim()
            : existing.url,

          icon !==
          undefined
            ? icon.trim() ||
              null
            : existing.icon,

          display_order !==
          undefined
            ? Number(
                display_order
              ) || 0
            : existing.display_order,

          is_active !==
          undefined
            ? Number(
                is_active
              ) === 1
              ? 1
              : 0
            : existing.is_active,

          id,
        ]
      );

      // Get the updated social link
      const [rows] =
        await db.query(
          `
            SELECT *
            FROM social_links
            WHERE id = ?
            LIMIT 1
          `,
          [id]
        );

      return sendSuccess(
        res,
        rows[0],
        "Social link updated successfully"
      );
    } catch (error) {
      console.error(
        "Update social link error:",
        error
      );

      return sendError(
        res,
        "Failed to update social link"
      );
    }
  };

// Delete a social link
// DELETE /api/social-links/:id
// Protected
const deleteSocialLink =
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      // Check that the social link exists
      const [existingRows] =
        await db.query(
          `
            SELECT
              id,
              platform
            FROM social_links
            WHERE id = ?
            LIMIT 1
          `,
          [id]
        );

      if (
        existingRows.length === 0
      ) {
        return sendError(
          res,
          "Social link not found",
          404
        );
      }

      // Delete only the database record
      await db.query(
        `
          DELETE FROM social_links
          WHERE id = ?
        `,
        [id]
      );

      return sendSuccess(
        res,
        null,
        "Social link deleted successfully"
      );
    } catch (error) {
      console.error(
        "Delete social link error:",
        error
      );

      return sendError(
        res,
        "Failed to delete social link"
      );
    }
  };

module.exports = {
  getSocialLinks,
  getSocialLinkById,
  getAdminSocialLinks,
  getAdminSocialLinkById,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
};