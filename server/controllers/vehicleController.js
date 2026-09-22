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

  const normalizedImage = String(image)
    .replace(/\\/g, "/")
    .replace(/^[/]+/, "");

  // Only allow files belonging to the vehicles upload folder
  if (!normalizedImage.startsWith("vehicles/")) {
    return null;
  }

  const filename = path.basename(normalizedImage);

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
const deleteVehicleImage = (image) => {
  const imagePath = getVehicleImagePath(image);

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
const getVehicles = async (req, res) => {
  try {
    const [rows] = await db.query(
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
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
        SELECT *
        FROM vehicles
        WHERE id = ?
          AND is_active = 1
        LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
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
// ADMIN - READ + PAGINATION
// ==========================================================================

// Get vehicles for Admin with pagination
// GET /api/vehicles/admin?page=1&limit=10
// Protected
const getAdminVehicles = async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;

    page = Math.max(1, Math.floor(page));
    limit = Math.max(1, Math.min(100, Math.floor(limit)));

    const offset = (page - 1) * limit;

    // Count all vehicles
    const [countRows] = await db.query(
      `
        SELECT COUNT(*) AS totalItems
        FROM vehicles
      `
    );

    const totalItems =
      Number(countRows[0]?.totalItems) || 0;

    const totalPages =
      totalItems > 0
        ? Math.ceil(totalItems / limit)
        : 0;

    // Prevent requesting a page beyond the last page
    if (
      totalPages > 0 &&
      page > totalPages
    ) {
      page = totalPages;
    }

    const finalOffset =
      (page - 1) * limit;

    // Get current page
    const [rows] = await db.query(
      `
        SELECT *
        FROM vehicles
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
const getAdminVehicleById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
        SELECT *
        FROM vehicles
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
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
// ADMIN - SECTION CONTENT
// ==========================================================================

// Update shared Vehicles section content
// PUT /api/vehicles/section
// Protected
const updateVehicleSection = async (
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

    const sectionTitleFr =
      section_title_fr !== undefined
        ? String(section_title_fr).trim() || null
        : null;

    const sectionTitleEn =
      section_title_en !== undefined
        ? String(section_title_en).trim() || null
        : null;

    const sectionSubtitleFr =
      section_subtitle_fr !== undefined
        ? String(section_subtitle_fr).trim() || null
        : null;

    const sectionSubtitleEn =
      section_subtitle_en !== undefined
        ? String(section_subtitle_en).trim() || null
        : null;

    await db.query(
      `
        UPDATE vehicles
        SET
          section_title_fr = ?,
          section_title_en = ?,
          section_subtitle_fr = ?,
          section_subtitle_en = ?
      `,
      [
        sectionTitleFr,
        sectionTitleEn,
        sectionSubtitleFr,
        sectionSubtitleEn,
      ]
    );

    return sendSuccess(
      res,
      null,
      "Vehicles section content updated successfully"
    );
  } catch (error) {
    console.error(
      "Update vehicle section error:",
      error
    );

    return sendError(
      res,
      "Failed to update vehicles section content"
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
  let uploadedFilePath = null;

  try {
    const { id } = req.params;

    // Get existing vehicle
    const [existingRows] = await db.query(
      `
        SELECT *
        FROM vehicles
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );

    if (existingRows.length === 0) {
      return sendError(
        res,
        "Vehicle not found",
        404
      );
    }

    const existing = existingRows[0];

    const {
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

    // ----------------------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------------------

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

    // ----------------------------------------------------------------------
    // IMAGE
    // ----------------------------------------------------------------------

    let image = existing.image;

    if (req.file) {
      image = `vehicles/${req.file.filename}`;

      uploadedFilePath = path.join(
        __dirname,
        "../uploads",
        image
      );
    }

    // ----------------------------------------------------------------------
    // UPDATE
    // ----------------------------------------------------------------------

    await db.query(
      `
        UPDATE vehicles
        SET
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
        type_fr !== undefined
          ? String(type_fr).trim()
          : existing.type_fr,

        type_en !== undefined
          ? String(type_en).trim()
          : existing.type_en,

        name_fr !== undefined
          ? String(name_fr).trim()
          : existing.name_fr,

        name_en !== undefined
          ? String(name_en).trim()
          : existing.name_en,

        description_fr !== undefined
          ? String(description_fr).trim() || null
          : existing.description_fr,

        description_en !== undefined
          ? String(description_en).trim() || null
          : existing.description_en,

        image,

        display_order !== undefined
          ? Number(display_order) || existing.display_order
          : existing.display_order,

        is_active !== undefined
          ? Number(is_active) === 1
            ? 1
            : 0
          : existing.is_active,

        icon !== undefined
          ? String(icon).trim() || "bi-truck"
          : existing.icon || "bi-truck",

        id,
      ]
    );

    // ----------------------------------------------------------------------
    // DELETE OLD IMAGE ONLY AFTER SUCCESSFUL UPDATE
    // ----------------------------------------------------------------------

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
    const [rows] = await db.query(
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

    // Delete only newly uploaded image
    // if database update failed
    if (
      uploadedFilePath &&
      fs.existsSync(uploadedFilePath)
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
// ADMIN - REORDER
// ==========================================================================

// Reorder one vehicle
// PUT /api/vehicles/:id/order
// Body: { display_order: number }
// Protected
const reorderVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    let desiredOrder = Number(req.body.display_order);

    if (!Number.isFinite(desiredOrder)) {
      return sendError(
        res,
        "A valid display order is required.",
        400
      );
    }

    desiredOrder = Math.floor(desiredOrder);

    // Get all vehicles in their current order
    const [rows] = await db.query(
      `
        SELECT
          id,
          display_order
        FROM vehicles
        ORDER BY
          display_order ASC,
          id ASC
      `
    );

    if (rows.length === 0) {
      return sendError(
        res,
        "No vehicles found.",
        404
      );
    }

    // Find the selected vehicle
    const currentIndex = rows.findIndex(
      (vehicle) =>
        Number(vehicle.id) === Number(id)
    );

    if (currentIndex === -1) {
      return sendError(
        res,
        "Vehicle not found.",
        404
      );
    }

    // Orders are 1-based
    desiredOrder = Math.max(
      1,
      Math.min(desiredOrder, rows.length)
    );

    const currentOrder = currentIndex + 1;

    // Nothing to change
    if (currentOrder === desiredOrder) {
      const [vehicleRows] = await db.query(
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
        vehicleRows[0],
        "Vehicle order unchanged"
      );
    }

    // Remove the selected vehicle from the list
    // IMPORTANT: do NOT destructure this result.
    const remaining = rows.filter(
      (vehicle) =>
        Number(vehicle.id) !== Number(id)
    );

    // Insert the selected vehicle
    // into the requested position.
    remaining.splice(
      desiredOrder - 1,
      0,
      rows[currentIndex]
    );

    // Temporarily move the selected vehicle
    // outside the normal order range.
    await db.query(
      `
        UPDATE vehicles
        SET display_order = ?
        WHERE id = ?
      `,
      [
        rows.length + 1000,
        id,
      ]
    );

    // Rewrite all vehicle orders as:
    // 1, 2, 3, 4, ...
    for (
      let index = 0;
      index < remaining.length;
      index++
    ) {
      await db.query(
        `
          UPDATE vehicles
          SET display_order = ?
          WHERE id = ?
        `,
        [
          index + 1,
          remaining[index].id,
        ]
      );
    }

    // Return the updated vehicle
    const [updatedRows] = await db.query(
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
      updatedRows[0],
      "Vehicle order updated successfully"
    );
  } catch (error) {
    console.error(
      "Reorder vehicle error:",
      error
    );

    return sendError(
      res,
      "Failed to reorder vehicle"
    );
  }
};

// ==========================================================================
// ADMIN - NORMALIZE
// ==========================================================================

// Normalize all vehicle orders
// POST /api/vehicles/normalize-orders
// Protected
const normalizeVehicleOrders = async (
  req,
  res
) => {
  try {
    const [rows] = await db.query(
      `
        SELECT id
        FROM vehicles
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
          UPDATE vehicles
          SET display_order = ?
          WHERE id = ?
        `,
        [
          index + 1,
          rows[index].id,
        ]
      );
    }

    return sendSuccess(
      res,
      null,
      "Vehicle orders normalized successfully"
    );
  } catch (error) {
    console.error(
      "Normalize vehicle orders error:",
      error
    );

    return sendError(
      res,
      "Failed to normalize vehicle orders"
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
    const { id } = req.params;

    // Get vehicle including image
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

    if (existingRows.length === 0) {
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
    if (existing.image) {
      deleteVehicleImage(
        existing.image
      );
    }

    // Normalize remaining orders
    const [remainingRows] =
      await db.query(
        `
          SELECT id
          FROM vehicles
          ORDER BY
            display_order ASC,
            id ASC
        `
      );

    for (
      let index = 0;
      index < remainingRows.length;
      index++
    ) {
      await db.query(
        `
          UPDATE vehicles
          SET display_order = ?
          WHERE id = ?
        `,
        [
          index + 1,
          remainingRows[index].id,
        ]
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

// ==========================================================================
// EXPORTS
// ==========================================================================

module.exports = {
  getVehicles,
  getVehicleById,

  getAdminVehicles,
  getAdminVehicleById,

  updateVehicle,
  updateVehicleSection,

  reorderVehicle,
  normalizeVehicleOrders,

  deleteVehicle,
};