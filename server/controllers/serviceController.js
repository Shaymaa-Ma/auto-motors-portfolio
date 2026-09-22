const db = require("../config/db");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

/* =========================================================
   PUBLIC
========================================================= */

// Get all active services
// GET /api/services
// Public
const getServices = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
        SELECT *
        FROM services
        WHERE is_active = 1
        ORDER BY display_order ASC, id ASC
      `
    );

    return sendSuccess(
      res,
      rows,
      "Services retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get services error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve services"
    );
  }
};

/* =========================================================
   ADMIN - PAGINATED
========================================================= */

// Get paginated services for Admin
// GET /api/services/admin?page=1&limit=10
// Protected
const getAdminServices = async (req, res) => {
  try {
    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit, 10) || 10,
        1
      ),
      100
    );

    const offset =
      (page - 1) * limit;

    // Total number of services
    const [countRows] = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM services
      `
    );

    const total =
      Number(countRows[0]?.total) || 0;

    const totalPages =
      Math.ceil(total / limit);

    // Paginated services
    const [rows] = await db.query(
      `
        SELECT *
        FROM services
        ORDER BY display_order ASC, id ASC
        LIMIT ? OFFSET ?
      `,
      [
        limit,
        offset,
      ]
    );

    return sendSuccess(
      res,
      {
        data: rows,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: total,
          totalPages,
          hasPreviousPage:
            page > 1,
          hasNextPage:
            page < totalPages,
        },
      },
      "Services retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get admin services error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve services"
    );
  }
};

/* =========================================================
   ADMIN - ONE SERVICE
========================================================= */

// Get one service
// GET /api/services/:id
// Protected
const getService = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
        SELECT *
        FROM services
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return sendError(
        res,
        "Service not found",
        404
      );
    }

    return sendSuccess(
      res,
      rows[0],
      "Service retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get service error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve service"
    );
  }
};

/* =========================================================
   CREATE
========================================================= */

// Create a service
// POST /api/services
// Protected
const createService = async (
  req,
  res
) => {
  try {
    const {
      section_title_fr,
      section_title_en,
      section_subtitle_fr,
      section_subtitle_en,
      name_fr,
      name_en,
      description_fr,
      description_en,
      icon,
      display_order,
      is_active,
    } = req.body;

    if (!name_fr || !name_en) {
      return sendError(
        res,
        "French and English service names are required.",
        400
      );
    }

    const [result] =
      await db.query(
        `
          INSERT INTO services (
            section_title_fr,
            section_title_en,
            section_subtitle_fr,
            section_subtitle_en,
            name_fr,
            name_en,
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
          name_fr,
          name_en,
          description_fr || null,
          description_en || null,
          icon || null,
          display_order !== undefined
            ? Number(display_order)
            : 0,
          is_active !== undefined
            ? Number(is_active)
            : 1,
        ]
      );

    const [rows] =
      await db.query(
        `
          SELECT *
          FROM services
          WHERE id = ?
          LIMIT 1
        `,
        [result.insertId]
      );

    return sendSuccess(
      res,
      rows[0],
      "Service created successfully",
      201
    );
  } catch (error) {
    console.error(
      "Create service error:",
      error
    );

    return sendError(
      res,
      "Failed to create service"
    );
  }
};

/* =========================================================
   UPDATE
========================================================= */

// Update a service
// PUT /api/services/:id
// Protected
const updateService = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const [existingRows] =
      await db.query(
        `
          SELECT *
          FROM services
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
        "Service not found",
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
      name_fr,
      name_en,
      description_fr,
      description_en,
      icon,
      display_order,
      is_active,
    } = req.body;

    if (
      !name_fr &&
      !existing.name_fr
    ) {
      return sendError(
        res,
        "French service name is required.",
        400
      );
    }

    if (
      !name_en &&
      !existing.name_en
    ) {
      return sendError(
        res,
        "English service name is required.",
        400
      );
    }

    await db.query(
      `
        UPDATE services
        SET
          section_title_fr = ?,
          section_title_en = ?,
          section_subtitle_fr = ?,
          section_subtitle_en = ?,
          name_fr = ?,
          name_en = ?,
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

        name_fr ??
          existing.name_fr,

        name_en ??
          existing.name_en,

        description_fr ??
          existing.description_fr,

        description_en ??
          existing.description_en,

        icon ?? existing.icon,

        display_order !== undefined
          ? Number(display_order)
          : existing.display_order,

        is_active !== undefined
          ? Number(is_active)
          : existing.is_active,

        id,
      ]
    );

    const [rows] =
      await db.query(
        `
          SELECT *
          FROM services
          WHERE id = ?
          LIMIT 1
        `,
        [id]
      );

    return sendSuccess(
      res,
      rows[0],
      "Service updated successfully"
    );
  } catch (error) {
    console.error(
      "Update service error:",
      error
    );

    return sendError(
      res,
      "Failed to update service"
    );
  }
};

/* =========================================================
   DELETE
========================================================= */

// Delete a service
// DELETE /api/services/:id
// Protected
const deleteService = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const [existingRows] =
      await db.query(
        `
          SELECT id
          FROM services
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
        "Service not found",
        404
      );
    }

    await db.query(
      `
        DELETE FROM services
        WHERE id = ?
      `,
      [id]
    );

    return sendSuccess(
      res,
      null,
      "Service deleted successfully"
    );
  } catch (error) {
    console.error(
      "Delete service error:",
      error
    );

    return sendError(
      res,
      "Failed to delete service"
    );
  }
};

/* =========================================================
   REORDER
========================================================= */

// Reorder one service
// PUT /api/services/:id/order
// Protected
const reorderService = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const requestedOrder = Number(
      req.body.display_order
    );

    if (
      !Number.isFinite(
        requestedOrder
      )
    ) {
      return sendError(
        res,
        "A valid display order is required.",
        400
      );
    }

    const [serviceRows] =
      await db.query(
        `
          SELECT id
          FROM services
          WHERE id = ?
          LIMIT 1
        `,
        [id]
      );

    if (
      serviceRows.length === 0
    ) {
      return sendError(
        res,
        "Service not found",
        404
      );
    }

    const [rows] =
      await db.query(
        `
          SELECT id
          FROM services
          ORDER BY display_order ASC, id ASC
        `
      );

    const total =
      rows.length;

    if (total === 0) {
      return sendError(
        res,
        "No services found.",
        404
      );
    }

    const currentIndex =
      rows.findIndex(
        (row) =>
          Number(row.id) ===
          Number(id)
      );

    if (currentIndex === -1) {
      return sendError(
        res,
        "Service not found",
        404
      );
    }

    const targetOrder = Math.min(
      Math.max(
        Math.round(
          requestedOrder
        ),
        1
      ),
      total
    );

    const reordered = [
      ...rows,
    ];

    const [
      movedService,
    ] = reordered.splice(
      currentIndex,
      1
    );

    reordered.splice(
      targetOrder - 1,
      0,
      movedService
    );

    /*
     * First use temporary values so
     * duplicate display_order values
     * are avoided while reordering.
     */
    for (
      let index = 0;
      index < reordered.length;
      index += 1
    ) {
      await db.query(
        `
          UPDATE services
          SET display_order = ?
          WHERE id = ?
        `,
        [
          1000000 + index,
          reordered[index].id,
        ]
      );
    }

    /*
     * Assign final sequential order.
     */
    for (
      let index = 0;
      index < reordered.length;
      index += 1
    ) {
      await db.query(
        `
          UPDATE services
          SET display_order = ?
          WHERE id = ?
        `,
        [
          index + 1,
          reordered[index].id,
        ]
      );
    }

    const [updatedRows] =
      await db.query(
        `
          SELECT *
          FROM services
          WHERE id = ?
          LIMIT 1
        `,
        [id]
      );

    return sendSuccess(
      res,
      updatedRows[0],
      "Service order updated successfully"
    );
  } catch (error) {
    console.error(
      "Reorder service error:",
      error
    );

    return sendError(
      res,
      "Failed to reorder service"
    );
  }
};

/* =========================================================
   NORMALIZE
========================================================= */

// Normalize all service orders
// POST /api/services/normalize-orders
// Protected
const normalizeServiceOrders =
  async (req, res) => {
    try {
      const [rows] =
        await db.query(
          `
            SELECT id
            FROM services
            ORDER BY display_order ASC, id ASC
          `
        );

      /*
       * Temporary values first.
       */
      for (
        let index = 0;
        index < rows.length;
        index += 1
      ) {
        await db.query(
          `
            UPDATE services
            SET display_order = ?
            WHERE id = ?
          `,
          [
            1000000 + index,
            rows[index].id,
          ]
        );
      }

      /*
       * Final sequential values.
       */
      for (
        let index = 0;
        index < rows.length;
        index += 1
      ) {
        await db.query(
          `
            UPDATE services
            SET display_order = ?
            WHERE id = ?
          `,
          [
            index + 1,
            rows[index].id,
          ]
        );
      }

      const [updatedRows] =
        await db.query(
          `
            SELECT *
            FROM services
            ORDER BY display_order ASC, id ASC
          `
        );

      return sendSuccess(
        res,
        updatedRows,
        "Service orders normalized successfully"
      );
    } catch (error) {
      console.error(
        "Normalize service orders error:",
        error
      );

      return sendError(
        res,
        "Failed to normalize service orders"
      );
    }
  };

module.exports = {
  getServices,
  getAdminServices,
  getService,
  createService,
  updateService,
  deleteService,
  reorderService,
  normalizeServiceOrders,
};