// Categories controller
const db = require("../config/db");
const path = require("path");
const fs = require("fs");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

// Get all active categories
// GET /api/categories
// Public
const getCategories = async (
  req,
  res
) => {
  try {
    const [rows] =
      await db.query(
        `
          SELECT *
          FROM product_categories
          WHERE is_active = 1
          ORDER BY
            display_order ASC,
            id ASC
        `
      );

    return sendSuccess(
      res,
      rows,
      "Categories retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get categories error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve categories"
    );
  }
};

// Get one active category
// GET /api/categories/:id
// Public
const getCategoryById =
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
            FROM product_categories
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
        "Get category error:",
        error
      );

      return sendError(
        res,
        "Failed to retrieve category"
      );
    }
  };

// Get all categories for Admin
// GET /api/categories/admin
// Protected
const getAdminCategories =
  async (
    req,
    res
  ) => {
    try {
      const [rows] =
        await db.query(
          `
            SELECT *
            FROM product_categories
            ORDER BY
              display_order ASC,
              id ASC
          `
        );

      return sendSuccess(
        res,
        rows,
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

// Get one category for Admin
// GET /api/categories/admin/:id
// Protected
const getAdminCategoryById =
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
            FROM product_categories
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

// Create a category
// POST /api/categories
// Protected
const createCategory =
  async (
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
        name_fr,
        name_en,
        description_fr,
        description_en,
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
          "French and English category names are required.",
          400
        );
      }

      // Handle uploaded image
      let image = null;

      if (req.file) {
        image =
          `categories/${req.file.filename}`;

        uploadedFilePath =
          path.join(
            __dirname,
            "../uploads",
            image
          );
      }

      // Create the category
      const [result] =
        await db.query(
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
              image,
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

            image,

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

      // Get the newly created category
      const [rows] =
        await db.query(
          `
            SELECT *
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

      // Remove only the new image if creation failed
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
            "Failed to remove uploaded category image:",
            fileError
          );
        }
      }

      return sendError(
        res,
        "Failed to create category"
      );
    }
  };

// Update a category
// PUT /api/categories/:id
// Protected
const updateCategory =
  async (
    req,
    res
  ) => {
    let uploadedFilePath =
      null;

    try {
      const {
        id,
      } = req.params;

      // Get the existing category
      const [existingRows] =
        await db.query(
          `
            SELECT *
            FROM product_categories
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
          "Category not found",
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
        display_order,
        is_active,
      } = req.body;

      // Keep the current image when no new image is uploaded
      let image =
        existing.image;

      // Handle the new uploaded image
      if (req.file) {
        image =
          `categories/${req.file.filename}`;

        uploadedFilePath =
          path.join(
            __dirname,
            "../uploads",
            image
          );
      }

      // Update category information
      await db.query(
        `
          UPDATE product_categories
          SET
            section_title_fr = ?,
            section_title_en = ?,
            section_subtitle_fr = ?,
            section_subtitle_en = ?,
            name_fr = ?,
            name_en = ?,
            description_fr = ?,
            description_en = ?,
            image = ?,
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

          image,

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

      // Get the updated category
      const [rows] =
        await db.query(
          `
            SELECT *
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

      // Remove only the new image if the database update failed
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
            "Failed to remove uploaded category image:",
            fileError
          );
        }
      }

      return sendError(
        res,
        "Failed to update category"
      );
    }
  };

module.exports = {
  getCategories,
  getCategoryById,
  getAdminCategories,
  getAdminCategoryById,
  createCategory,
  updateCategory,
};