const db = require("../config/db");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

// ==========================================================================
// PUBLIC
// ==========================================================================

// Get all active social links
// GET /api/social-links
// Public
const getSocialLinks = async (req, res) => {
  try {
    const [rows] = await db.query(
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
const getSocialLinkById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
        SELECT *
        FROM social_links
        WHERE id = ?
          AND is_active = 1
        LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
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

// ==========================================================================
// ADMIN - PAGINATION
// ==========================================================================

// Get paginated social links for Admin
// GET /api/social-links/admin?page=1&limit=10
// Protected
const getAdminSocialLinks = async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;

    page = Math.max(1, Math.floor(page));
    limit = Math.max(1, Math.floor(limit));

    // Optional safety limit
    limit = Math.min(limit, 100);

    const offset = (page - 1) * limit;

    // Get total number of social links
    const [countRows] = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM social_links
      `
    );

    const totalItems =
      Number(countRows[0]?.total) || 0;

    const totalPages =
      totalItems > 0
        ? Math.ceil(totalItems / limit)
        : 1;

    // Keep requested page inside valid range
    if (page > totalPages) {
      page = totalPages;
    }

    const finalOffset =
      (page - 1) * limit;

    // Get only current page
    const [rows] = await db.query(
      `
        SELECT *
        FROM social_links
        ORDER BY
          display_order ASC,
          id ASC
        LIMIT ? OFFSET ?
      `,
      [limit, finalOffset]
    );

    return sendSuccess(
      res,
      {
        items: rows,
        page,
        limit,
        offset: finalOffset,
        totalItems,
        totalPages,
      },
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
const getAdminSocialLinkById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
        SELECT *
        FROM social_links
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
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

// ==========================================================================
// ADMIN - CREATE
// ==========================================================================

// Create a social link
// POST /api/social-links
// Protected
const createSocialLink = async (req, res) => {
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
    if (!platform?.trim()) {
      return sendError(
        res,
        "Platform is required.",
        400
      );
    }

    if (!url?.trim()) {
      return sendError(
        res,
        "URL is required.",
        400
      );
    }

    // Get current number of social links
    const [countRows] = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM social_links
      `
    );

    const totalItems =
      Number(countRows[0]?.total) || 0;

    let newOrder;

    if (display_order !== undefined) {
      newOrder = Number(display_order);

      if (
        !Number.isFinite(newOrder)
      ) {
        newOrder = totalItems + 1;
      }
    } else {
      newOrder = totalItems + 1;
    }

    newOrder = Math.floor(newOrder);

    // Orders are 1-based
    newOrder = Math.max(
      1,
      Math.min(
        newOrder,
        totalItems + 1
      )
    );

    // Shift existing records down
    if (totalItems > 0) {
      await db.query(
        `
          UPDATE social_links
          SET display_order = display_order + 1
          WHERE display_order >= ?
        `,
        [newOrder]
      );
    }

    const [result] = await db.query(
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
        section_title_fr?.trim() || null,
        section_title_en?.trim() || null,
        section_subtitle_fr?.trim() || null,
        section_subtitle_en?.trim() || null,
        platform.trim(),
        url.trim(),
        icon?.trim() || null,
        newOrder,
        is_active !== undefined
          ? Number(is_active) === 1
            ? 1
            : 0
          : 1,
      ]
    );

    // Normalize after insertion
    await normalizeSocialLinkOrdersInternal();

    // Get newly created social link
    const [rows] = await db.query(
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

// ==========================================================================
// ADMIN - UPDATE
// ==========================================================================

// Update a social link
// PUT /api/social-links/:id
// Protected
const updateSocialLink = async (req, res) => {
  try {
    const { id } = req.params;

    // Get existing social link
    const [existingRows] = await db.query(
      `
        SELECT *
        FROM social_links
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );

    if (existingRows.length === 0) {
      return sendError(
        res,
        "Social link not found",
        404
      );
    }

    const existing = existingRows[0];

    const {
      platform,
      url,
      icon,
      is_active,
    } = req.body;

    // Validate required fields when provided
    if (
      platform !== undefined &&
      !String(platform).trim()
    ) {
      return sendError(
        res,
        "Platform is required.",
        400
      );
    }

    if (
      url !== undefined &&
      !String(url).trim()
    ) {
      return sendError(
        res,
        "URL is required.",
        400
      );
    }

    await db.query(
      `
        UPDATE social_links
        SET
          platform = ?,
          url = ?,
          icon = ?,
          is_active = ?
        WHERE id = ?
      `,
      [
        platform !== undefined
          ? String(platform).trim()
          : existing.platform,

        url !== undefined
          ? String(url).trim()
          : existing.url,

        icon !== undefined
          ? String(icon).trim() || null
          : existing.icon,

        is_active !== undefined
          ? Number(is_active) === 1
            ? 1
            : 0
          : existing.is_active,

        id,
      ]
    );

    const [rows] = await db.query(
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

// ==========================================================================
// ADMIN - SECTION CONTENT
// ==========================================================================

// Update shared Social Links section content
// PUT /api/social-links/section
// Protected
const updateSocialLinksSection = async (
  req,
  res
) => {
  try {
    const {
      section_title_fr,
      section_title_en,
      section_subtitle_fr,
      section_subtitle_en,
    } = req.body;

    const [countRows] = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM social_links
      `
    );

    const totalItems =
      Number(countRows[0]?.total) || 0;

    if (totalItems === 0) {
      return sendError(
        res,
        "Add at least one social link before saving the section content.",
        400
      );
    }

    await db.query(
      `
        UPDATE social_links
        SET
          section_title_fr = ?,
          section_title_en = ?,
          section_subtitle_fr = ?,
          section_subtitle_en = ?
      `,
      [
        section_title_fr?.trim() || null,
        section_title_en?.trim() || null,
        section_subtitle_fr?.trim() || null,
        section_subtitle_en?.trim() || null,
      ]
    );

    return sendSuccess(
      res,
      null,
      "Social links section content updated successfully"
    );
  } catch (error) {
    console.error(
      "Update social links section error:",
      error
    );

    return sendError(
      res,
      "Failed to update social links section content"
    );
  }
};

// ==========================================================================
// ADMIN - REORDER
// ==========================================================================

// Internal normalize helper
const normalizeSocialLinkOrdersInternal =
  async () => {
    const [rows] = await db.query(
      `
        SELECT id
        FROM social_links
        ORDER BY
          display_order ASC,
          id ASC
      `
    );

    for (
      let index = 0;
      index < rows.length;
      index++
    ) {
      await db.query(
        `
          UPDATE social_links
          SET display_order = ?
          WHERE id = ?
        `,
        [
          index + 1,
          rows[index].id,
        ]
      );
    }
  };

// Reorder one social link
// PUT /api/social-links/:id/order
// Body: { display_order: number }
// Protected
const reorderSocialLink = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    let desiredOrder = Number(
      req.body.display_order
    );

    if (
      !Number.isFinite(desiredOrder)
    ) {
      return sendError(
        res,
        "A valid display order is required.",
        400
      );
    }

    desiredOrder = Math.floor(
      desiredOrder
    );

    const [rows] = await db.query(
      `
        SELECT
          id,
          display_order
        FROM social_links
        ORDER BY
          display_order ASC,
          id ASC
      `
    );

    if (rows.length === 0) {
      return sendError(
        res,
        "No social links found.",
        404
      );
    }

    const currentIndex =
      rows.findIndex(
        (socialLink) =>
          Number(socialLink.id) ===
          Number(id)
      );

    if (currentIndex === -1) {
      return sendError(
        res,
        "Social link not found.",
        404
      );
    }

    // Orders are 1-based
    desiredOrder = Math.max(
      1,
      Math.min(
        desiredOrder,
        rows.length
      )
    );

    const currentOrder =
      currentIndex + 1;

    // Nothing to change
    if (
      currentOrder ===
      desiredOrder
    ) {
      const [socialRows] =
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
        socialRows[0],
        "Social link order unchanged"
      );
    }

    // Remove selected item
    const remaining =
      rows.filter(
        (socialLink) =>
          Number(socialLink.id) !==
          Number(id)
      );

    // Insert into requested position
    remaining.splice(
      desiredOrder - 1,
      0,
      rows[currentIndex]
    );

    // Temporarily move selected item
    // outside normal order range
    await db.query(
      `
        UPDATE social_links
        SET display_order = ?
        WHERE id = ?
      `,
      [
        rows.length + 1000,
        id,
      ]
    );

    // Rewrite all orders
    for (
      let index = 0;
      index < remaining.length;
      index++
    ) {
      await db.query(
        `
          UPDATE social_links
          SET display_order = ?
          WHERE id = ?
        `,
        [
          index + 1,
          remaining[index].id,
        ]
      );
    }

    const [updatedRows] =
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
      updatedRows[0],
      "Social link order updated successfully"
    );
  } catch (error) {
    console.error(
      "Reorder social link error:",
      error
    );

    return sendError(
      res,
      "Failed to reorder social link"
    );
  }
};

// Normalize all social link orders
// POST /api/social-links/normalize-orders
// Protected
const normalizeSocialLinkOrders =
  async (req, res) => {
    try {
      await normalizeSocialLinkOrdersInternal();

      return sendSuccess(
        res,
        null,
        "Social link orders normalized successfully"
      );
    } catch (error) {
      console.error(
        "Normalize social link orders error:",
        error
      );

      return sendError(
        res,
        "Failed to normalize social link orders"
      );
    }
  };

// ==========================================================================
// ADMIN - DELETE
// ==========================================================================

// Delete a social link
// DELETE /api/social-links/:id
// Protected
const deleteSocialLink = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    // Check that social link exists
    const [existingRows] = await db.query(
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

    if (existingRows.length === 0) {
      return sendError(
        res,
        "Social link not found",
        404
      );
    }

    // Delete record
    await db.query(
      `
        DELETE FROM social_links
        WHERE id = ?
      `,
      [id]
    );

    // Normalize remaining orders
    await normalizeSocialLinkOrdersInternal();

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

// ==========================================================================
// EXPORTS
// ==========================================================================

module.exports = {
  getSocialLinks,
  getSocialLinkById,

  getAdminSocialLinks,
  getAdminSocialLinkById,

  createSocialLink,
  updateSocialLink,

  updateSocialLinksSection,

  reorderSocialLink,
  normalizeSocialLinkOrders,

  deleteSocialLink,
};