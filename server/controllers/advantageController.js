const db = require("../config/db");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

// ============================================================
// Get all active advantages
// GET /api/advantages
// Public
// ============================================================
const getAdvantages = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
        SELECT *
        FROM advantages
        WHERE is_active = 1
        ORDER BY
          display_order ASC,
          id ASC
      `
    );

    return sendSuccess(
      res,
      rows,
      "Advantages retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get advantages error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve advantages"
    );
  }
};

// ============================================================
// Get one active advantage
// GET /api/advantages/:id
// Public
// ============================================================
const getAdvantageById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
        SELECT *
        FROM advantages
        WHERE id = ?
          AND is_active = 1
        LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return sendError(
        res,
        "Advantage not found",
        404
      );
    }

    return sendSuccess(
      res,
      rows[0],
      "Advantage retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get advantage error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve advantage"
    );
  }
};

// ============================================================
// Get paginated advantages for Admin
// GET /api/advantages/admin?page=1&limit=10
// Protected
// ============================================================
const getAdminAdvantages = async (req, res) => {
  try {
    const page = Math.max(
      Number.parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(req.query.limit, 10) || 10,
        1
      ),
      100
    );

    const offset = (page - 1) * limit;

    // Get total number of advantages
    const [countRows] = await db.query(
      `
        SELECT COUNT(*) AS totalItems
        FROM advantages
      `
    );

    const totalItems =
      Number(countRows[0]?.totalItems) || 0;

    const totalPages =
      Math.ceil(totalItems / limit);

    // If requested page is beyond the last page,
    // return an empty page instead of causing an error.
    if (
      totalItems > 0 &&
      offset >= totalItems
    ) {
      return sendSuccess(
        res,
        {
          items: [],
          page,
          limit,
          offset,
          totalItems,
          totalPages,
        },
        "Advantages retrieved successfully"
      );
    }

    // Get only the current page
    const [rows] = await db.query(
      `
        SELECT *
        FROM advantages
        ORDER BY
          display_order ASC,
          id ASC
        LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    return sendSuccess(
      res,
      {
        items: rows,
        page,
        limit,
        offset,
        totalItems,
        totalPages,
      },
      "Advantages retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get admin advantages error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve advantages"
    );
  }
};

// ============================================================
// Get one advantage for Admin
// GET /api/advantages/admin/:id
// Protected
// ============================================================
const getAdminAdvantageById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
        SELECT *
        FROM advantages
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return sendError(
        res,
        "Advantage not found",
        404
      );
    }

    return sendSuccess(
      res,
      rows[0],
      "Advantage retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get admin advantage error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve advantage"
    );
  }
};

// ============================================================
// Create an advantage
// POST /api/advantages
// Protected
// ============================================================
const createAdvantage = async (req, res) => {
  try {
    const {
      section_title_fr,
      section_title_en,
      section_subtitle_fr,
      section_subtitle_en,
      title_fr,
      title_en,
      description_fr,
      description_en,
      icon,
      display_order,
      is_active,
    } = req.body;

    // Validate required titles
    if (
      !title_fr?.trim() ||
      !title_en?.trim()
    ) {
      return sendError(
        res,
        "French and English titles are required.",
        400
      );
    }

    // Validate icon
    if (!icon?.trim()) {
      return sendError(
        res,
        "Advantage icon is required.",
        400
      );
    }

    // Create the advantage
    const [result] = await db.query(
      `
        INSERT INTO advantages (
          section_title_fr,
          section_title_en,
          section_subtitle_fr,
          section_subtitle_en,
          title_fr,
          title_en,
          description_fr,
          description_en,
          icon,
          display_order,
          is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        section_title_fr || null,
        section_title_en || null,
        section_subtitle_fr || null,
        section_subtitle_en || null,
        title_fr.trim(),
        title_en.trim(),
        description_fr || null,
        description_en || null,
        icon.trim(),
        display_order !== undefined
          ? Number(display_order)
          : 0,
        is_active !== undefined
          ? Number(is_active)
          : 1,
      ]
    );

    // Get the created advantage
    const [rows] = await db.query(
      `
        SELECT *
        FROM advantages
        WHERE id = ?
        LIMIT 1
      `,
      [result.insertId]
    );

    return sendSuccess(
      res,
      rows[0],
      "Advantage created successfully",
      201
    );
  } catch (error) {
    console.error(
      "Create advantage error:",
      error
    );

    return sendError(
      res,
      "Failed to create advantage"
    );
  }
};

// ============================================================
// Update an advantage
// PUT /api/advantages/:id
// Protected
// ============================================================
const updateAdvantage = async (req, res) => {
  try {
    const { id } = req.params;

    // Get existing advantage
    const [existingRows] = await db.query(
      `
        SELECT *
        FROM advantages
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );

    if (existingRows.length === 0) {
      return sendError(
        res,
        "Advantage not found",
        404
      );
    }

    const existing = existingRows[0];

    const {
      section_title_fr,
      section_title_en,
      section_subtitle_fr,
      section_subtitle_en,
      title_fr,
      title_en,
      description_fr,
      description_en,
      icon,
      display_order,
      is_active,
    } = req.body;

    // Validate French title
    if (
      title_fr !== undefined &&
      !title_fr?.trim()
    ) {
      return sendError(
        res,
        "French title is required.",
        400
      );
    }

    // Validate English title
    if (
      title_en !== undefined &&
      !title_en?.trim()
    ) {
      return sendError(
        res,
        "English title is required.",
        400
      );
    }

    // Validate icon
    if (
      icon !== undefined &&
      !icon?.trim()
    ) {
      return sendError(
        res,
        "Advantage icon is required.",
        400
      );
    }

    // Update the advantage
    //
    // IMPORTANT:
    // display_order is preserved here unless explicitly
    // provided. The React page handles reordering separately
    // through PUT /:id/order.
    await db.query(
      `
        UPDATE advantages
        SET
          section_title_fr = ?,
          section_title_en = ?,
          section_subtitle_fr = ?,
          section_subtitle_en = ?,
          title_fr = ?,
          title_en = ?,
          description_fr = ?,
          description_en = ?,
          icon = ?,
          display_order = ?,
          is_active = ?
        WHERE id = ?
      `,
      [
        section_title_fr ??
          existing.section_title_fr,

        section_title_en ??
          existing.section_title_en,

        section_subtitle_fr ??
          existing.section_subtitle_fr,

        section_subtitle_en ??
          existing.section_subtitle_en,

        title_fr !== undefined
          ? title_fr.trim()
          : existing.title_fr,

        title_en !== undefined
          ? title_en.trim()
          : existing.title_en,

        description_fr ??
          existing.description_fr,

        description_en ??
          existing.description_en,

        icon !== undefined
          ? icon.trim()
          : existing.icon,

        display_order !== undefined
          ? Number(display_order)
          : existing.display_order,

        is_active !== undefined
          ? Number(is_active)
          : existing.is_active,

        id,
      ]
    );

    // Get updated advantage
    const [rows] = await db.query(
      `
        SELECT *
        FROM advantages
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );

    return sendSuccess(
      res,
      rows[0],
      "Advantage updated successfully"
    );
  } catch (error) {
    console.error(
      "Update advantage error:",
      error
    );

    return sendError(
      res,
      "Failed to update advantage"
    );
  }
};

// ============================================================
// Reorder one advantage
// PUT /api/advantages/:id/order
// Protected
//
// Body:
// {
//   "display_order": 3
// }
// ============================================================
const reorderAdvantage = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const requestedOrder = Number(
      req.body.display_order
    );

    if (
      !Number.isInteger(
        requestedOrder
      ) ||
      requestedOrder < 1
    ) {
      return sendError(
        res,
        "A valid display order is required.",
        400
      );
    }

    // Get all advantages in current order
    const [items] = await db.query(
      `
        SELECT id, display_order
        FROM advantages
        ORDER BY
          display_order ASC,
          id ASC
      `
    );

    const currentIndex =
      items.findIndex(
        (item) =>
          Number(item.id) ===
          Number(id)
      );

    if (currentIndex === -1) {
      return sendError(
        res,
        "Advantage not found",
        404
      );
    }

    if (items.length === 0) {
      return sendError(
        res,
        "No advantages found.",
        404
      );
    }

    // Clamp requested order
    const targetIndex = Math.min(
      Math.max(
        requestedOrder - 1,
        0
      ),
      items.length - 1
    );

    // If already in requested position,
    // normalize the whole order just in case.
    if (
      currentIndex === targetIndex
    ) {
      for (
        let index = 0;
        index < items.length;
        index++
      ) {
        const expectedOrder =
          index + 1;

        if (
          Number(
            items[index].display_order
          ) !== expectedOrder
        ) {
          await db.query(
            `
              UPDATE advantages
              SET display_order = ?
              WHERE id = ?
            `,
            [
              expectedOrder,
              items[index].id,
            ]
          );
        }
      }

      return sendSuccess(
        res,
        null,
        "Advantage order updated successfully"
      );
    }

    // Move the selected item to the requested position
    const [movedItem] =
      items.splice(
        currentIndex,
        1
      );

    items.splice(
      targetIndex,
      0,
      movedItem
    );

    /*
     * First move all records to temporary values.
     *
     * This prevents duplicate display_order conflicts
     * while shifting records.
     */
    const temporaryOffset =
      items.length + 1000;

    for (
      let index = 0;
      index < items.length;
      index++
    ) {
      await db.query(
        `
          UPDATE advantages
          SET display_order = ?
          WHERE id = ?
        `,
        [
          temporaryOffset +
            index,
          items[index].id,
        ]
      );
    }

    // Write final normalized 1-based order
    for (
      let index = 0;
      index < items.length;
      index++
    ) {
      await db.query(
        `
          UPDATE advantages
          SET display_order = ?
          WHERE id = ?
        `,
        [
          index + 1,
          items[index].id,
        ]
      );
    }

    return sendSuccess(
      res,
      null,
      "Advantage order updated successfully"
    );
  } catch (error) {
    console.error(
      "Reorder advantage error:",
      error
    );

    return sendError(
      res,
      "Failed to reorder advantage"
    );
  }
};

// ============================================================
// Normalize all advantage orders
// POST /api/advantages/normalize-orders
// Protected
// ============================================================
const normalizeAdvantageOrders =
  async (req, res) => {
    try {
      const [items] =
        await db.query(
          `
            SELECT id
            FROM advantages
            ORDER BY
              display_order ASC,
              id ASC
          `
        );

      // Normalize to 1, 2, 3, 4...
      for (
        let index = 0;
        index < items.length;
        index++
      ) {
        await db.query(
          `
            UPDATE advantages
            SET display_order = ?
            WHERE id = ?
          `,
          [
            index + 1,
            items[index].id,
          ]
        );
      }

      return sendSuccess(
        res,
        null,
        "Advantage orders normalized successfully"
      );
    } catch (error) {
      console.error(
        "Normalize advantage orders error:",
        error
      );

      return sendError(
        res,
        "Failed to normalize advantage orders"
      );
    }
  };

// ============================================================
// Delete an advantage
// DELETE /api/advantages/:id
// Protected
// ============================================================
const deleteAdvantage = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    // Check if advantage exists
    const [existingRows] =
      await db.query(
        `
          SELECT id
          FROM advantages
          WHERE id = ?
          LIMIT 1
        `,
        [id]
      );

    if (existingRows.length === 0) {
      return sendError(
        res,
        "Advantage not found",
        404
      );
    }

    // Delete advantage
    await db.query(
      `
        DELETE FROM advantages
        WHERE id = ?
      `,
      [id]
    );

    return sendSuccess(
      res,
      null,
      "Advantage deleted successfully"
    );
  } catch (error) {
    console.error(
      "Delete advantage error:",
      error
    );

    return sendError(
      res,
      "Failed to delete advantage"
    );
  }
};

module.exports = {
  getAdvantages,
  getAdvantageById,
  getAdminAdvantages,
  getAdminAdvantageById,
  createAdvantage,
  updateAdvantage,
  reorderAdvantage,
  normalizeAdvantageOrders,
  deleteAdvantage,
};