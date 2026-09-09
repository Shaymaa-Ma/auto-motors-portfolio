const db = require("../config/db");
const {
  sendSuccess,
  sendError,
} = require("../utils/response");

// Get all active services
// GET /api/services
// Public
const getServices = async (
  req,
  res
) => {
  try {
    const [rows] =
      await db.query(
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

// Get all services for Admin
// GET /api/services/admin
// Protected
const getAdminServices =
  async (req, res) => {
    try {
      const [rows] =
        await db.query(
          `
            SELECT *
            FROM services
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
        "Get admin services error:",
        error
      );

      return sendError(
        res,
        "Failed to retrieve services"
      );
    }
  };

// Get one service
// GET /api/services/:id
// Protected
const getService = async (
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

// Create a service
// POST /api/services
// Protected
const createService =
  async (req, res) => {
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

      // Validate required fields
      if (
        !name_fr ||
        !name_en
      ) {
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
            section_title_fr ||
              null,

            section_title_en ||
              null,

            section_subtitle_fr ||
              null,

            section_subtitle_en ||
              null,

            name_fr,

            name_en,

            description_fr ||
              null,

            description_en ||
              null,

            icon ||
              null,

            display_order !==
            undefined
              ? Number(
                  display_order
                )
              : 0,

            is_active !==
            undefined
              ? Number(
                  is_active
                )
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

// Update a service
// PUT /api/services/:id
// Protected
const updateService =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      // Get the existing service
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

      // Validate required fields
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

          icon ??
            existing.icon,

          display_order !==
          undefined
            ? Number(
                display_order
              )
            : existing.display_order,

          is_active !==
          undefined
            ? Number(
                is_active
              )
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

// Delete a service
// DELETE /api/services/:id
// Protected
const deleteService =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      // Check if the service exists
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

module.exports = {
  getServices,
  getAdminServices,
  getService,
  createService,
  updateService,
  deleteService,
};