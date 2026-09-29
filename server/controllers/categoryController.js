const db = require("../config/db");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

// =========================================================
// HELPERS
// =========================================================

const nullableText = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = String(value).trim();

  return trimmed === "" ? null : trimmed;
};

const requiredText = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const safeNumber = (value, fallback = 0) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const safeActiveValue = (value, fallback = 1) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  return Number(value) === 1 ? 1 : 0;
};

// =========================================================
// GET ALL ACTIVE CATEGORIES
// GET /api/categories
// =========================================================

const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        section_title_fr,
        section_title_en,
        section_subtitle_fr,
        section_subtitle_en,
        name_fr,
        name_en,
        description_fr,
        description_en,
        display_order,
        is_active,
        created_at,
        updated_at
      FROM product_categories
      WHERE is_active = 1
      ORDER BY
        display_order ASC,
        id ASC
    `);

    return sendSuccess(
      res,
      rows,
      "Categories retrieved successfully"
    );
  } catch (error) {
    console.error("Get categories error:", error);

    return sendError(
      res,
      "Failed to retrieve categories"
    );
  }
};

// =========================================================
// GET ONE ACTIVE CATEGORY
// GET /api/categories/:id
// =========================================================

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
        SELECT
          id,
          section_title_fr,
          section_title_en,
          section_subtitle_fr,
          section_subtitle_en,
          name_fr,
          name_en,
          description_fr,
          description_en,
          display_order,
          is_active,
          created_at,
          updated_at
        FROM product_categories
        WHERE id = ?
          AND is_active = 1
        LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return sendError(
        res,
        "Category not found",
        404
      );
    }

    return sendSuccess(
      res,
      rows[0],
      "Category retrieved successfully"
    );
  } catch (error) {
    console.error("Get category error:", error);

    return sendError(
      res,
      "Failed to retrieve category"
    );
  }
};

// =========================================================
// GET ADMIN CATEGORIES
// GET /api/categories/admin?page=1&limit=10
// =========================================================

const getAdminCategories = async (req, res) => {
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

    const offset = (page - 1) * limit;

    const [countRows] = await db.query(`
      SELECT COUNT(*) AS total
      FROM product_categories
    `);

    const totalItems =
      Number(countRows[0]?.total) || 0;

    const totalPages =
      Math.ceil(totalItems / limit);

    const [rows] = await db.query(
      `
        SELECT
          id,
          section_title_fr,
          section_title_en,
          section_subtitle_fr,
          section_subtitle_en,
          name_fr,
          name_en,
          description_fr,
          description_en,
          display_order,
          is_active,
          created_at,
          updated_at
        FROM product_categories
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
        data: rows,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems,
          totalPages,
          hasPreviousPage: page > 1,
          hasNextPage: page < totalPages,
        },
      },
      "Categories retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get admin categories error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve categories"
    );
  }
};

// =========================================================
// GET ONE ADMIN CATEGORY
// GET /api/categories/admin/:id
// =========================================================

const getAdminCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
        SELECT
          id,
          section_title_fr,
          section_title_en,
          section_subtitle_fr,
          section_subtitle_en,
          name_fr,
          name_en,
          description_fr,
          description_en,
          display_order,
          is_active,
          created_at,
          updated_at
        FROM product_categories
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return sendError(
        res,
        "Category not found",
        404
      );
    }

    return sendSuccess(
      res,
      rows[0],
      "Category retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get admin category error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve category"
    );
  }
};

// =========================================================
// CREATE CATEGORY
// POST /api/categories
// =========================================================

const createCategory = async (req, res) => {
  try {
    const nameFr = requiredText(
      req.body?.name_fr
    );

    const nameEn = requiredText(
      req.body?.name_en
    );

    if (!nameFr || !nameEn) {
      return sendError(
        res,
        "French and English category names are required.",
        400
      );
    }

    /*
     * Section content is global.
     *
     * New categories automatically inherit
     * the current section values.
     */
    const [sectionRows] = await db.query(`
      SELECT
        section_title_fr,
        section_title_en,
        section_subtitle_fr,
        section_subtitle_en
      FROM product_categories
      ORDER BY id ASC
      LIMIT 1
    `);

    const section = sectionRows[0] || {};

    const descriptionFr = nullableText(
      req.body?.description_fr
    );

    const descriptionEn = nullableText(
      req.body?.description_en
    );

    const displayOrder = safeNumber(
      req.body?.display_order,
      0
    );

    const isActive = safeActiveValue(
      req.body?.is_active,
      1
    );

    const [result] = await db.query(
      `
        INSERT INTO product_categories (
          section_title_fr,
          section_title_en,
          section_subtitle_fr,
          section_subtitle_en,
          name_fr,
          name_en,
          description_fr,
          description_en,
          display_order,
          is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        section.section_title_fr ?? null,
        section.section_title_en ?? null,
        section.section_subtitle_fr ?? null,
        section.section_subtitle_en ?? null,
        nameFr,
        nameEn,
        descriptionFr,
        descriptionEn,
        displayOrder,
        isActive,
      ]
    );

    const [rows] = await db.query(
      `
        SELECT
          id,
          section_title_fr,
          section_title_en,
          section_subtitle_fr,
          section_subtitle_en,
          name_fr,
          name_en,
          description_fr,
          description_en,
          display_order,
          is_active,
          created_at,
          updated_at
        FROM product_categories
        WHERE id = ?
        LIMIT 1
      `,
      [result.insertId]
    );

    return sendSuccess(
      res,
      rows[0],
      "Category created successfully",
      201
    );
  } catch (error) {
    console.error(
      "Create category error:",
      error
    );

    return sendError(
      res,
      "Failed to create category"
    );
  }
};

// =========================================================
// UPDATE CATEGORY
// PUT /api/categories/:id
// =========================================================

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingRows] = await db.query(
      `
        SELECT
          id,
          name_fr,
          name_en,
          description_fr,
          description_en,
          display_order,
          is_active
        FROM product_categories
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );

    if (existingRows.length === 0) {
      return sendError(
        res,
        "Category not found",
        404
      );
    }

    const existing = existingRows[0];

    /*
     * Section fields are intentionally NOT
     * updated here.
     *
     * They are controlled only by:
     * PUT /api/categories/section
     */

    const nameFr =
      req.body?.name_fr !== undefined
        ? requiredText(req.body.name_fr)
        : existing.name_fr;

    const nameEn =
      req.body?.name_en !== undefined
        ? requiredText(req.body.name_en)
        : existing.name_en;

    if (!nameFr || !nameEn) {
      return sendError(
        res,
        "French and English category names are required.",
        400
      );
    }

    const descriptionFr =
      req.body?.description_fr !== undefined
        ? nullableText(
            req.body.description_fr
          )
        : existing.description_fr ?? null;

    const descriptionEn =
      req.body?.description_en !== undefined
        ? nullableText(
            req.body.description_en
          )
        : existing.description_en ?? null;

    const displayOrder =
      req.body?.display_order !== undefined
        ? safeNumber(
            req.body.display_order,
            existing.display_order ?? 0
          )
        : existing.display_order ?? 0;

    const isActive =
      req.body?.is_active !== undefined
        ? safeActiveValue(
            req.body.is_active,
            existing.is_active ?? 1
          )
        : Number(existing.is_active ?? 1) === 1
        ? 1
        : 0;

    await db.query(
      `
        UPDATE product_categories
        SET
          name_fr = ?,
          name_en = ?,
          description_fr = ?,
          description_en = ?,
          display_order = ?,
          is_active = ?
        WHERE id = ?
      `,
      [
        nameFr,
        nameEn,
        descriptionFr,
        descriptionEn,
        displayOrder,
        isActive,
        id,
      ]
    );

    const [rows] = await db.query(
      `
        SELECT
          id,
          section_title_fr,
          section_title_en,
          section_subtitle_fr,
          section_subtitle_en,
          name_fr,
          name_en,
          description_fr,
          description_en,
          display_order,
          is_active,
          created_at,
          updated_at
        FROM product_categories
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );

    return sendSuccess(
      res,
      rows[0],
      "Category updated successfully"
    );
  } catch (error) {
    console.error(
      "Update category error:",
      error
    );

    return sendError(
      res,
      "Failed to update category"
    );
  }
};

// =========================================================
// UPDATE GLOBAL CATEGORY SECTION
// PUT /api/categories/section
// =========================================================

const updateCategorySection = async (
  req,
  res
) => {
  try {
    const sectionTitleFr = nullableText(
      req.body?.section_title_fr
    );

    const sectionTitleEn = nullableText(
      req.body?.section_title_en
    );

    const sectionSubtitleFr = nullableText(
      req.body?.section_subtitle_fr
    );

    const sectionSubtitleEn = nullableText(
      req.body?.section_subtitle_en
    );

    const [countRows] = await db.query(`
      SELECT COUNT(*) AS total
      FROM product_categories
    `);

    const total =
      Number(countRows[0]?.total) || 0;

    if (total === 0) {
      return sendError(
        res,
        "Add at least one category before editing the Categories section content.",
        400
      );
    }

    /*
     * Update ALL category rows.
     *
     * This is intentionally one query so
     * pagination cannot cause only the
     * current page to be updated.
     */
    await db.query(
      `
        UPDATE product_categories
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
      {
        section_title_fr: sectionTitleFr,
        section_title_en: sectionTitleEn,
        section_subtitle_fr: sectionSubtitleFr,
        section_subtitle_en: sectionSubtitleEn,
      },
      "Categories section content saved successfully"
    );
  } catch (error) {
    console.error(
      "Update categories section error:",
      error
    );

    return sendError(
      res,
      "Failed to save Categories section content"
    );
  }
};

// =========================================================
// REORDER CATEGORY
// PUT /api/categories/:id/order
// =========================================================

const reorderCategory = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const requestedOrder = Number(
      req.body?.display_order
    );

    if (!Number.isFinite(requestedOrder)) {
      return sendError(
        res,
        "A valid display order is required.",
        400
      );
    }

    const [rows] = await db.query(`
      SELECT id
      FROM product_categories
      ORDER BY
        display_order ASC,
        id ASC
    `);

    if (rows.length === 0) {
      return sendError(
        res,
        "No categories found.",
        404
      );
    }

    const ids = rows.map((row) =>
      Number(row.id)
    );

    const itemId = Number(id);

    const currentIndex =
      ids.indexOf(itemId);

    if (currentIndex === -1) {
      return sendError(
        res,
        "Category not found.",
        404
      );
    }

    ids.splice(currentIndex, 1);

    const desiredOrder = Math.min(
      Math.max(
        Math.round(requestedOrder),
        1
      ),
      rows.length
    );

    ids.splice(
      desiredOrder - 1,
      0,
      itemId
    );

    // Temporary values
    for (
      let index = 0;
      index < ids.length;
      index += 1
    ) {
      await db.query(
        `
          UPDATE product_categories
          SET display_order = ?
          WHERE id = ?
        `,
        [
          1000000 + index,
          ids[index],
        ]
      );
    }

    // Final values
    for (
      let index = 0;
      index < ids.length;
      index += 1
    ) {
      await db.query(
        `
          UPDATE product_categories
          SET display_order = ?
          WHERE id = ?
        `,
        [
          index + 1,
          ids[index],
        ]
      );
    }

    return sendSuccess(
      res,
      null,
      "Category order updated successfully"
    );
  } catch (error) {
    console.error(
      "Reorder category error:",
      error
    );

    return sendError(
      res,
      "Failed to reorder category"
    );
  }
};

// =========================================================
// NORMALIZE CATEGORY ORDERS
// POST /api/categories/normalize-orders
// =========================================================

const normalizeCategoryOrders = async (
  req,
  res
) => {
  try {
    const [rows] = await db.query(`
      SELECT id
      FROM product_categories
      ORDER BY
        display_order ASC,
        id ASC
    `);

    // Temporary values
    for (
      let index = 0;
      index < rows.length;
      index += 1
    ) {
      await db.query(
        `
          UPDATE product_categories
          SET display_order = ?
          WHERE id = ?
        `,
        [
          1000000 + index,
          rows[index].id,
        ]
      );
    }

    // Final values
    for (
      let index = 0;
      index < rows.length;
      index += 1
    ) {
      await db.query(
        `
          UPDATE product_categories
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
      "Category orders normalized successfully"
    );
  } catch (error) {
    console.error(
      "Normalize category orders error:",
      error
    );

    return sendError(
      res,
      "Failed to normalize category orders"
    );
  }
};

// =========================================================
// DELETE CATEGORY
// DELETE /api/categories/:id
// =========================================================

const deleteCategory = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const [categoryRows] = await db.query(
      `
        SELECT id
        FROM product_categories
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );

    if (categoryRows.length === 0) {
      return sendError(
        res,
        "Category not found.",
        404
      );
    }

    /*
     * Do not allow deletion while products
     * are assigned to this category.
     */
    const [productRows] = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM products
        WHERE category_id = ?
      `,
      [id]
    );

    const productCount =
      Number(productRows[0]?.total) || 0;

    if (productCount > 0) {
      return sendError(
        res,
        `This category cannot be deleted because it is still assigned to ${productCount} product${
          productCount === 1 ? "" : "s"
        }.`,
        409
      );
    }

    await db.query(
      `
        DELETE FROM product_categories
        WHERE id = ?
      `,
      [id]
    );

    /*
     * Normalize remaining orders.
     */
    const [remainingRows] = await db.query(`
      SELECT id
      FROM product_categories
      ORDER BY
        display_order ASC,
        id ASC
    `);

    // Temporary values
    for (
      let index = 0;
      index < remainingRows.length;
      index += 1
    ) {
      await db.query(
        `
          UPDATE product_categories
          SET display_order = ?
          WHERE id = ?
        `,
        [
          1000000 + index,
          remainingRows[index].id,
        ]
      );
    }

    // Final values
    for (
      let index = 0;
      index < remainingRows.length;
      index += 1
    ) {
      await db.query(
        `
          UPDATE product_categories
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
      "Category deleted successfully"
    );
  } catch (error) {
    console.error(
      "Delete category error:",
      error
    );

    if (
      error.code ===
        "ER_ROW_IS_REFERENCED_2" ||
      error.code ===
        "ER_ROW_IS_REFERENCED"
    ) {
      return sendError(
        res,
        "This category cannot be deleted because it is still assigned to one or more products.",
        409
      );
    }

    return sendError(
      res,
      "Failed to delete category"
    );
  }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  getCategories,
  getCategoryById,
  getAdminCategories,
  getAdminCategoryById,
  createCategory,
  updateCategory,
  updateCategorySection,
  deleteCategory,
  reorderCategory,
  normalizeCategoryOrders,
};