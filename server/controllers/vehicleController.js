const db = require("../config/db");
const path = require("path");
const fs = require("fs");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

// ==========================================================================
// HELPERS
// ==========================================================================

// Get the absolute path of a vehicle image stored in /uploads/vehicles
const getVehicleImagePath = (image) => {
  if (!image) {
    return null;
  }

  // Never try to delete remote images
  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return null;
  }

  const normalizedImage =
    String(image)
      .replace(/\\/g, "/")
      .replace(/^[/]+/, "");

  // Only allow files belonging to the vehicles upload folder
  if (
    !normalizedImage.startsWith(
      "vehicles/"
    )
  ) {
    return null;
  }

  const filename =
    path.basename(
      normalizedImage
    );

  if (!filename) {
    return null;
  }

  return path.join(
    __dirname,
    "../uploads/vehicles",
    filename
  );
};

// Delete a vehicle image safely
const deleteVehicleImage = (
  image
) => {
  const imagePath =
    getVehicleImagePath(image);

  if (
    !imagePath ||
    !fs.existsSync(imagePath)
  ) {
    return;
  }

  try {
    fs.unlinkSync(imagePath);

    console.log(
      `Vehicle image deleted: ${imagePath}`
    );
  } catch (error) {
    console.error(
      "Failed to delete vehicle image:",
      error
    );
  }
};

// ==========================================================================
// PUBLIC
// ==========================================================================

// Get all active vehicles
// GET /api/vehicles
// Public
const getVehicles = async (
  req,
  res
) => {
  try {
    const [rows] =
      await db.query(
        `
          SELECT *
          FROM vehicles
          WHERE is_active = 1
          ORDER BY
            display_order ASC,
            id ASC
        `
      );

    return sendSuccess(
      res,
      rows,
      "Vehicles retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get vehicles error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve vehicles"
    );
  }
};

// Get one active vehicle
// GET /api/vehicles/:id
// Public
const getVehicleById = async (
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
          FROM vehicles
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
        "Vehicle not found",
        404
      );
    }

    return sendSuccess(
      res,
      rows[0],
      "Vehicle retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get vehicle error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve vehicle"
    );
  }
};

// ==========================================================================
// ADMIN - READ
// ==========================================================================

// Get all vehicles for Admin
// GET /api/vehicles/admin
// Protected
const getAdminVehicles = async (
  req,
  res
) => {
  try {
    const [rows] =
      await db.query(
        `
          SELECT *
          FROM vehicles
          ORDER BY
            display_order ASC,
            id ASC
        `
      );

    return sendSuccess(
      res,
      rows,
      "Vehicles retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get admin vehicles error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve vehicles"
    );
  }
};

// Get one vehicle for Admin
// GET /api/vehicles/admin/:id
// Protected
const getAdminVehicleById =
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
            FROM vehicles
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
          "Vehicle not found",
          404
        );
      }

      return sendSuccess(
        res,
        rows[0],
        "Vehicle retrieved successfully"
      );
    } catch (error) {
      console.error(
        "Get admin vehicle error:",
        error
      );

      return sendError(
        res,
        "Failed to retrieve vehicle"
      );
    }
  };

// ==========================================================================
// ADMIN - CREATE
// ==========================================================================

// Create a vehicle
// POST /api/vehicles
// Protected
const createVehicle = async (
  req,
  res
) => {
  let uploadedFilePath =
    null;

  try {
    const {
      section_title_fr,
      section_title_en,
      section_subtitle_fr,
      section_subtitle_en,
      type_fr,
      type_en,
      name_fr,
      name_en,
      description_fr,
      description_en,
      display_order,
      is_active,
      icon,
    } = req.body;

    // Validate required fields
    if (
      !type_fr?.trim() ||
      !type_en?.trim() ||
      !name_fr?.trim() ||
      !name_en?.trim()
    ) {
      return sendError(
        res,
        "French and English vehicle type and name are required.",
        400
      );
    }

    // Image is required when creating
    if (!req.file) {
      return sendError(
        res,
        "Vehicle image is required.",
        400
      );
    }

    // Build stored image path
    const image =
      `vehicles/${req.file.filename}`;

    uploadedFilePath =
      path.join(
        __dirname,
        "../uploads",
        image
      );

    // Create vehicle
    const [result] =
      await db.query(
        `
          INSERT INTO vehicles (
            section_title_fr,
            section_title_en,
            section_subtitle_fr,
            section_subtitle_en,
            type_fr,
            type_en,
            name_fr,
            name_en,
            description_fr,
            description_en,
            image,
            display_order,
            is_active,
            icon
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

          type_fr.trim(),

          type_en.trim(),

          name_fr.trim(),

          name_en.trim(),

          description_fr?.trim() ||
            null,

          description_en?.trim() ||
            null,

          image,

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

          icon ||
            "bi-truck",
        ]
      );

    // Get newly created vehicle
    const [rows] =
      await db.query(
        `
          SELECT *
          FROM vehicles
          WHERE id = ?
          LIMIT 1
        `,
        [result.insertId]
      );

    return sendSuccess(
      res,
      rows[0],
      "Vehicle created successfully",
      201
    );
  } catch (error) {
    console.error(
      "Create vehicle error:",
      error
    );

    // If database creation fails,
    // remove only the newly uploaded image.
    if (
      uploadedFilePath &&
      fs.existsSync(
        uploadedFilePath
      )
    ) {
      try {
        fs.unlinkSync(
          uploadedFilePath
        );
      } catch (fileError) {
        console.error(
          "Failed to remove uploaded vehicle image:",
          fileError
        );
      }
    }

    return sendError(
      res,
      "Failed to create vehicle"
    );
  }
};

// ==========================================================================
// ADMIN - UPDATE
// ==========================================================================

// Update a vehicle
// PUT /api/vehicles/:id
// Protected
const updateVehicle = async (
  req,
  res
) => {
  let uploadedFilePath =
    null;

  try {
    const {
      id,
    } = req.params;

    // Get existing vehicle
    const [existingRows] =
      await db.query(
        `
          SELECT *
          FROM vehicles
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
        "Vehicle not found",
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
      type_fr,
      type_en,
      name_fr,
      name_en,
      description_fr,
      description_en,
      display_order,
      is_active,
      icon,
    } = req.body;

    // Validate fields BEFORE processing the new image
    if (
      type_fr !== undefined &&
      !String(type_fr).trim()
    ) {
      return sendError(
        res,
        "French vehicle type is required.",
        400
      );
    }

    if (
      type_en !== undefined &&
      !String(type_en).trim()
    ) {
      return sendError(
        res,
        "English vehicle type is required.",
        400
      );
    }

    if (
      name_fr !== undefined &&
      !String(name_fr).trim()
    ) {
      return sendError(
        res,
        "French vehicle name is required.",
        400
      );
    }

    if (
      name_en !== undefined &&
      !String(name_en).trim()
    ) {
      return sendError(
        res,
        "English vehicle name is required.",
        400
      );
    }

    // Keep existing image by default
    let image =
      existing.image;

    // If a new image was uploaded,
    // use the new image.
    if (req.file) {
      image =
        `vehicles/${req.file.filename}`;

      uploadedFilePath =
        path.join(
          __dirname,
          "../uploads",
          image
        );
    }

    // Update vehicle
    await db.query(
      `
        UPDATE vehicles
        SET
          section_title_fr = ?,
          section_title_en = ?,
          section_subtitle_fr = ?,
          section_subtitle_en = ?,
          type_fr = ?,
          type_en = ?,
          name_fr = ?,
          name_en = ?,
          description_fr = ?,
          description_en = ?,
          image = ?,
          display_order = ?,
          is_active = ?,
          icon = ?
        WHERE id = ?
      `,
      [
        section_title_fr !==
        undefined
          ? String(
              section_title_fr
            ).trim() ||
            null
          : existing.section_title_fr,

        section_title_en !==
        undefined
          ? String(
              section_title_en
            ).trim() ||
            null
          : existing.section_title_en,

        section_subtitle_fr !==
        undefined
          ? String(
              section_subtitle_fr
            ).trim() ||
            null
          : existing.section_subtitle_fr,

        section_subtitle_en !==
        undefined
          ? String(
              section_subtitle_en
            ).trim() ||
            null
          : existing.section_subtitle_en,

        type_fr !==
        undefined
          ? String(
              type_fr
            ).trim()
          : existing.type_fr,

        type_en !==
        undefined
          ? String(
              type_en
            ).trim()
          : existing.type_en,

        name_fr !==
        undefined
          ? String(
              name_fr
            ).trim()
          : existing.name_fr,

        name_en !==
        undefined
          ? String(
              name_en
            ).trim()
          : existing.name_en,

        description_fr !==
        undefined
          ? String(
              description_fr
            ).trim() ||
            null
          : existing.description_fr,

        description_en !==
        undefined
          ? String(
              description_en
            ).trim() ||
            null
          : existing.description_en,

        image,

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

        icon !==
        undefined
          ? icon ||
            "bi-truck"
          : existing.icon ||
            "bi-truck",

        id,
      ]
    );

    // If a new image replaced the old one,
    // delete the OLD image only AFTER
    // the database update succeeded.
    if (
      req.file &&
      existing.image &&
      existing.image !== image
    ) {
      deleteVehicleImage(
        existing.image
      );
    }

    // Get updated vehicle
    const [rows] =
      await db.query(
        `
          SELECT *
          FROM vehicles
          WHERE id = ?
          LIMIT 1
        `,
        [id]
      );

    return sendSuccess(
      res,
      rows[0],
      "Vehicle updated successfully"
    );
  } catch (error) {
    console.error(
      "Update vehicle error:",
      error
    );

    // If update failed,
    // remove ONLY the newly uploaded image.
    if (
      uploadedFilePath &&
      fs.existsSync(
        uploadedFilePath
      )
    ) {
      try {
        fs.unlinkSync(
          uploadedFilePath
        );
      } catch (fileError) {
        console.error(
          "Failed to remove uploaded vehicle image:",
          fileError
        );
      }
    }

    return sendError(
      res,
      "Failed to update vehicle"
    );
  }
};

// ==========================================================================
// ADMIN - DELETE
// ==========================================================================

// Delete a vehicle
// DELETE /api/vehicles/:id
// Protected
const deleteVehicle = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    // Get vehicle including its image
    const [existingRows] =
      await db.query(
        `
          SELECT
            id,
            name_fr,
            name_en,
            image
          FROM vehicles
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
        "Vehicle not found",
        404
      );
    }

    const existing =
      existingRows[0];

    // Delete database record first
    const [deleteResult] =
      await db.query(
        `
          DELETE FROM vehicles
          WHERE id = ?
        `,
        [id]
      );

    if (
      deleteResult.affectedRows === 0
    ) {
      return sendError(
        res,
        "Vehicle not found",
        404
      );
    }

    // Delete associated image
    // after successful database deletion.
    if (existing.image) {
      deleteVehicleImage(
        existing.image
      );
    }

    return sendSuccess(
      res,
      null,
      "Vehicle deleted successfully"
    );
  } catch (error) {
    console.error(
      "Delete vehicle error:",
      error
    );

    return sendError(
      res,
      "Failed to delete vehicle"
    );
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  getAdminVehicles,
  getAdminVehicleById,
  updateVehicle,
  deleteVehicle,
};