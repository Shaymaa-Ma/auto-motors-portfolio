const db = require("../config/db");
const fs = require("fs");
const path = require("path");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

// =========================================================
// GET ALL ACTIVE GALLERY ITEMS
// GET /api/gallery
// Public
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
    console.error(
      "Get gallery error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve gallery"
    );
  }
};

// =========================================================
// GET SINGLE ACTIVE GALLERY ITEM
// GET /api/gallery/:id
// Public
// =========================================================

const getGalleryItemById = async (
  req,
  res
) => {
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
      return sendError(
        res,
        "Gallery item not found",
        404
      );
    }

    return sendSuccess(
      res,
      rows[0],
      "Gallery item retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get gallery item error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve gallery item"
    );
  }
};

// =========================================================
// GET GALLERY ITEMS FOR ADMIN
// GET /api/gallery/admin?page=1&limit=10
// Protected
//
// Backend pagination
// =========================================================

const getAdminGallery = async (
  req,
  res
) => {
  try {
    let page =
      Number(req.query.page) || 1;

    let limit =
      Number(req.query.limit) || 10;

    page =
      Math.max(
        1,
        Math.floor(page)
      );

    limit =
      Math.min(
        100,
        Math.max(
          1,
          Math.floor(limit)
        )
      );

    const offset =
      (page - 1) * limit;

    // -------------------------------------------------------
    // Total items
    // -------------------------------------------------------

    const [countRows] =
      await db.query(
        `SELECT COUNT(*) AS totalItems
         FROM gallery`
      );

    const totalItems =
      Number(
        countRows[0]?.totalItems
      ) || 0;

    const totalPages =
      totalItems > 0
        ? Math.ceil(
            totalItems / limit
          )
        : 0;

    // -------------------------------------------------------
    // Current page
    // -------------------------------------------------------

    const [rows] =
      await db.query(
        `SELECT *
         FROM gallery
         ORDER BY display_order ASC, id ASC
         LIMIT ? OFFSET ?`,
        [
          limit,
          offset,
        ]
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
      "Admin gallery retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get admin gallery error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve admin gallery"
    );
  }
};

// =========================================================
// GET SINGLE GALLERY ITEM FOR ADMIN
// GET /api/gallery/admin/:id
// Protected
// =========================================================

const getAdminGalleryItemById =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const [rows] =
        await db.query(
          `SELECT *
           FROM gallery
           WHERE id = ?
           LIMIT 1`,
          [id]
        );

      if (
        rows.length === 0
      ) {
        return sendError(
          res,
          "Gallery item not found",
          404
        );
      }

      return sendSuccess(
        res,
        rows[0],
        "Gallery item retrieved successfully"
      );
    } catch (error) {
      console.error(
        "Get admin gallery item error:",
        error
      );

      return sendError(
        res,
        "Failed to retrieve admin gallery item"
      );
    }
  };

// =========================================================
// CREATE GALLERY ITEM
// POST /api/gallery
// Protected
// =========================================================

const createGalleryItem = async (
  req,
  res
) => {
  try {
    const {
      title_fr,
      title_en,
      description_fr,
      description_en,
      display_order,
      is_active,
    } = req.body;

    // -------------------------------------------------------
    // Image is required
    // -------------------------------------------------------

    if (!req.file) {
      return sendError(
        res,
        "Gallery image is required.",
        400
      );
    }

    const imagePath =
      `gallery/${req.file.filename}`;

    const order =
      display_order !== undefined &&
      display_order !== ""
        ? Number(display_order)
        : 0;

    const active =
      is_active !== undefined &&
      is_active !== ""
        ? Number(is_active)
        : 1;

    // -------------------------------------------------------
    // Get existing section content
    // -------------------------------------------------------

    const [sectionRows] =
      await db.query(
        `SELECT
           section_title_fr,
           section_title_en,
           section_subtitle_fr,
           section_subtitle_en
         FROM gallery
         ORDER BY id ASC
         LIMIT 1`
      );

    const section =
      sectionRows[0] || {};

    // -------------------------------------------------------
    // Insert gallery item
    // -------------------------------------------------------

    const [result] =
      await db.query(
        `INSERT INTO gallery (
          section_title_fr,
          section_title_en,
          section_subtitle_fr,
          section_subtitle_en,
          title_fr,
          title_en,
          description_fr,
          description_en,
          image,
          display_order,
          is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          section.section_title_fr ||
            null,

          section.section_title_en ||
            null,

          section.section_subtitle_fr ||
            null,

          section.section_subtitle_en ||
            null,

          title_fr || null,
          title_en || null,

          description_fr || null,
          description_en || null,

          imagePath,
          order,
          active,
        ]
      );

    // -------------------------------------------------------
    // Get created item
    // -------------------------------------------------------

    const [rows] =
      await db.query(
        `SELECT *
         FROM gallery
         WHERE id = ?
         LIMIT 1`,
        [result.insertId]
      );

    return sendSuccess(
      res,
      rows[0],
      "Gallery item created successfully"
    );
  } catch (error) {
    console.error(
      "Create gallery item error:",
      error
    );

    // -------------------------------------------------------
    // Remove uploaded image if database operation failed
    // -------------------------------------------------------

    if (req.file) {
      const uploadedImagePath =
        path.join(
          __dirname,
          "../uploads/gallery",
          req.file.filename
        );

      if (
        fs.existsSync(
          uploadedImagePath
        )
      ) {
        try {
          fs.unlinkSync(
            uploadedImagePath
          );
        } catch (fileError) {
          console.error(
            "Failed to remove uploaded gallery image:",
            fileError
          );
        }
      }
    }

    return sendError(
      res,
      "Failed to create gallery item"
    );
  }
};

// =========================================================
// UPDATE GALLERY SECTION CONTENT
// PUT /api/gallery/section
// Protected
//
// Section content is stored on every gallery record.
// This endpoint updates ALL records with ONE SQL query.
// =========================================================

const updateGallerySection = async (
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

    // -------------------------------------------------------
    // Make sure at least one gallery item exists
    // -------------------------------------------------------

    const [existingRows] =
      await db.query(
        `SELECT id
         FROM gallery
         LIMIT 1`
      );

    if (
      existingRows.length === 0
    ) {
      return sendError(
        res,
        "Add at least one gallery item before editing the Gallery section content.",
        400
      );
    }

    // -------------------------------------------------------
    // Update section content on ALL records
    // -------------------------------------------------------

    await db.query(
      `UPDATE gallery
       SET
         section_title_fr = ?,
         section_title_en = ?,
         section_subtitle_fr = ?,
         section_subtitle_en = ?`,
      [
        section_title_fr?.trim() ||
          null,

        section_title_en?.trim() ||
          null,

        section_subtitle_fr?.trim() ||
          null,

        section_subtitle_en?.trim() ||
          null,
      ]
    );

    // -------------------------------------------------------
    // Return saved section content
    // -------------------------------------------------------

    const [rows] =
      await db.query(
        `SELECT
           section_title_fr,
           section_title_en,
           section_subtitle_fr,
           section_subtitle_en
         FROM gallery
         ORDER BY id ASC
         LIMIT 1`
      );

    return sendSuccess(
      res,
      rows[0] || null,
      "Gallery section content updated successfully"
    );
  } catch (error) {
    console.error(
      "Update gallery section error:",
      error
    );

    return sendError(
      res,
      "Failed to update Gallery section content"
    );
  }
};

// =========================================================
// UPDATE GALLERY ITEM
// PUT /api/gallery/:id
// Protected
// =========================================================

const updateGalleryItem = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const {
      title_fr,
      title_en,
      description_fr,
      description_en,
      display_order,
      is_active,
    } = req.body;

    // -------------------------------------------------------
    // Find existing item
    // -------------------------------------------------------

    const [existingRows] =
      await db.query(
        `SELECT *
         FROM gallery
         WHERE id = ?
         LIMIT 1`,
        [id]
      );

    if (
      existingRows.length === 0
    ) {
      // Remove newly uploaded image
      if (req.file) {
        const uploadedImagePath =
          path.join(
            __dirname,
            "../uploads/gallery",
            req.file.filename
          );

        if (
          fs.existsSync(
            uploadedImagePath
          )
        ) {
          try {
            fs.unlinkSync(
              uploadedImagePath
            );
          } catch (fileError) {
            console.error(
              "Failed to remove uploaded gallery image:",
              fileError
            );
          }
        }
      }

      return sendError(
        res,
        "Gallery item not found",
        404
      );
    }

    const existingItem =
      existingRows[0];

    // -------------------------------------------------------
    // Keep existing image unless new image uploaded
    // -------------------------------------------------------

    let imagePath =
      existingItem.image;

    if (req.file) {
      imagePath =
        `gallery/${req.file.filename}`;
    }

    // -------------------------------------------------------
    // Display order
    //
    // Normal editing keeps the current order.
    // Reordering is handled by /order.
    // -------------------------------------------------------

    const order =
      display_order !== undefined &&
      display_order !== ""
        ? Number(display_order)
        : existingItem.display_order ||
          0;

    // -------------------------------------------------------
    // Active status
    // -------------------------------------------------------

    const active =
      is_active !== undefined &&
      is_active !== ""
        ? Number(is_active)
        : existingItem.is_active ??
          1;

    // -------------------------------------------------------
    // Update normal item fields
    //
    // Section content is NOT modified here.
    // -------------------------------------------------------

    await db.query(
      `UPDATE gallery
       SET
         title_fr = ?,
         title_en = ?,
         description_fr = ?,
         description_en = ?,
         image = ?,
         display_order = ?,
         is_active = ?
       WHERE id = ?`,
      [
        title_fr !== undefined
          ? title_fr || null
          : existingItem.title_fr,

        title_en !== undefined
          ? title_en || null
          : existingItem.title_en,

        description_fr !== undefined
          ? description_fr || null
          : existingItem.description_fr,

        description_en !== undefined
          ? description_en || null
          : existingItem.description_en,

        imagePath,
        order,
        active,
        id,
      ]
    );

    // -------------------------------------------------------
    // Delete old image after successful update
    // -------------------------------------------------------

    if (
      req.file &&
      existingItem.image &&
      existingItem.image !== imagePath
    ) {
      const oldImageFilename =
        path.basename(
          existingItem.image
        );

      const oldImagePath =
        path.join(
          __dirname,
          "../uploads/gallery",
          oldImageFilename
        );

      if (
        fs.existsSync(
          oldImagePath
        )
      ) {
        try {
          fs.unlinkSync(
            oldImagePath
          );
        } catch (fileError) {
          console.error(
            "Failed to delete old gallery image:",
            fileError
          );
        }
      }
    }

    // -------------------------------------------------------
    // Return updated item
    // -------------------------------------------------------

    const [updatedRows] =
      await db.query(
        `SELECT *
         FROM gallery
         WHERE id = ?
         LIMIT 1`,
        [id]
      );

    return sendSuccess(
      res,
      updatedRows[0],
      "Gallery item updated successfully"
    );
  } catch (error) {
    console.error(
      "Update gallery item error:",
      error
    );

    // -------------------------------------------------------
    // Remove newly uploaded image if update failed
    // -------------------------------------------------------

    if (req.file) {
      const uploadedImagePath =
        path.join(
          __dirname,
          "../uploads/gallery",
          req.file.filename
        );

      if (
        fs.existsSync(
          uploadedImagePath
        )
      ) {
        try {
          fs.unlinkSync(
            uploadedImagePath
          );
        } catch (fileError) {
          console.error(
            "Failed to remove uploaded gallery image:",
            fileError
          );
        }
      }
    }

    return sendError(
      res,
      "Failed to update gallery item"
    );
  }
};

// =========================================================
// REORDER GALLERY ITEM
// PUT /api/gallery/:id/order
// Protected
//
// Body:
// {
//   "display_order": 3
// }
// =========================================================

const reorderGalleryItem = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const requestedOrder =
      Number(
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

    // -------------------------------------------------------
    // Get all items in current order
    // -------------------------------------------------------

    const [items] =
      await db.query(
        `SELECT
           id,
           display_order
         FROM gallery
         ORDER BY display_order ASC, id ASC`
      );

    if (
      items.length === 0
    ) {
      return sendError(
        res,
        "No gallery items found.",
        404
      );
    }

    const currentIndex =
      items.findIndex(
        (item) =>
          Number(item.id) ===
          Number(id)
      );

    if (
      currentIndex === -1
    ) {
      return sendError(
        res,
        "Gallery item not found",
        404
      );
    }

    // -------------------------------------------------------
    // Clamp requested order
    // -------------------------------------------------------

    const targetIndex =
      Math.min(
        Math.max(
          Math.floor(
            requestedOrder
          ) - 1,
          0
        ),
        items.length - 1
      );

    // -------------------------------------------------------
    // Move item
    // -------------------------------------------------------

    const reorderedItems =
      [...items];

    const [
      movedItem,
    ] =
      reorderedItems.splice(
        currentIndex,
        1
      );

    reorderedItems.splice(
      targetIndex,
      0,
      movedItem
    );

    // -------------------------------------------------------
    // Temporary order values
    //
    // Prevent transient duplicate ordering while
    // the final order is being written.
    // -------------------------------------------------------

    const temporaryOffset =
      items.length + 1000;

    for (
      let index = 0;
      index <
      reorderedItems.length;
      index++
    ) {
      await db.query(
        `UPDATE gallery
         SET display_order = ?
         WHERE id = ?`,
        [
          temporaryOffset +
            index +
            1,

          reorderedItems[index].id,
        ]
      );
    }

    // -------------------------------------------------------
    // Final normalized order
    // -------------------------------------------------------

    for (
      let index = 0;
      index <
      reorderedItems.length;
      index++
    ) {
      await db.query(
        `UPDATE gallery
         SET display_order = ?
         WHERE id = ?`,
        [
          index + 1,
          reorderedItems[index].id,
        ]
      );
    }

    // -------------------------------------------------------
    // Return reordered gallery
    // -------------------------------------------------------

    const [rows] =
      await db.query(
        `SELECT *
         FROM gallery
         ORDER BY display_order ASC, id ASC`
      );

    return sendSuccess(
      res,
      rows,
      "Gallery reordered successfully"
    );
  } catch (error) {
    console.error(
      "Reorder gallery error:",
      error
    );

    return sendError(
      res,
      "Failed to reorder gallery"
    );
  }
};

// =========================================================
// NORMALIZE GALLERY ORDERS
// POST /api/gallery/normalize-orders
// Protected
// =========================================================

const normalizeGalleryOrders = async (
  req,
  res
) => {
  try {
    const [items] =
      await db.query(
        `SELECT id
         FROM gallery
         ORDER BY display_order ASC, id ASC`
      );

    for (
      let index = 0;
      index < items.length;
      index++
    ) {
      await db.query(
        `UPDATE gallery
         SET display_order = ?
         WHERE id = ?`,
        [
          index + 1,
          items[index].id,
        ]
      );
    }

    return sendSuccess(
      res,
      null,
      "Gallery orders normalized successfully"
    );
  } catch (error) {
    console.error(
      "Normalize gallery orders error:",
      error
    );

    return sendError(
      res,
      "Failed to normalize gallery orders"
    );
  }
};

// =========================================================
// DELETE GALLERY ITEM
// DELETE /api/gallery/:id
// Protected
// =========================================================

const deleteGalleryItem = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    // -------------------------------------------------------
    // Find existing gallery item
    // -------------------------------------------------------

    const [rows] =
      await db.query(
        `SELECT image
         FROM gallery
         WHERE id = ?
         LIMIT 1`,
        [id]
      );

    if (
      rows.length === 0
    ) {
      return sendError(
        res,
        "Gallery item not found",
        404
      );
    }

    const existingImage =
      rows[0].image;

    // -------------------------------------------------------
    // Delete database record
    // -------------------------------------------------------

    await db.query(
      `DELETE FROM gallery
       WHERE id = ?`,
      [id]
    );

    // -------------------------------------------------------
    // Delete associated image
    // -------------------------------------------------------

    if (existingImage) {
      const imageFilename =
        path.basename(
          existingImage
        );

      const imagePath =
        path.join(
          __dirname,
          "../uploads/gallery",
          imageFilename
        );

      if (
        fs.existsSync(
          imagePath
        )
      ) {
        try {
          fs.unlinkSync(
            imagePath
          );
        } catch (fileError) {
          console.error(
            "Failed to delete gallery image:",
            fileError
          );
        }
      }
    }

    return sendSuccess(
      res,
      null,
      "Gallery item deleted successfully"
    );
  } catch (error) {
    console.error(
      "Delete gallery item error:",
      error
    );

    return sendError(
      res,
      "Failed to delete gallery item"
    );
  }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  getGallery,
  getGalleryItemById,
  getAdminGallery,
  getAdminGalleryItemById,
  createGalleryItem,
  updateGallerySection,
  updateGalleryItem,
  reorderGalleryItem,
  normalizeGalleryOrders,
  deleteGalleryItem,
};