const db = require("../config/db");
const path = require("path");
const fs = require("fs");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

// Get all active products
// GET /api/products
// Public
const getProducts = async (
  req,
  res
) => {
  try {
    const {
      category,
    } = req.query;

    let sql = `
      SELECT
        p.*,
        c.name_fr AS category_name_fr,
        c.name_en AS category_name_en
      FROM products p
      INNER JOIN product_categories c
        ON p.category_id = c.id
      WHERE p.is_active = 1
        AND c.is_active = 1
    `;

    const params = [];

    // Filter products by category
    if (category) {
      sql += `
        AND p.category_id = ?
      `;

      params.push(category);
    }

    sql += `
      ORDER BY
        p.display_order ASC,
        p.id ASC
    `;

    const [rows] =
      await db.query(
        sql,
        params
      );

    return sendSuccess(
      res,
      rows,
      "Products retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get products error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve products"
    );
  }
};

// Get one active product
// GET /api/products/:id
// Public
const getProductById = async (
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
      SELECT
        p.*,
        c.name_fr AS category_name_fr,
        c.name_en AS category_name_en
      FROM products p
      INNER JOIN product_categories c
        ON p.category_id = c.id
      WHERE p.id = ?
        AND p.is_active = 1
        AND c.is_active = 1
      LIMIT 1
    `,
        [id]
      );

    if (
      rows.length === 0
    ) {
      return sendError(
        res,
        "Product not found",
        404
      );
    }

    return sendSuccess(
      res,
      rows[0],
      "Product retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get product error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve product"
    );
  }
};

// Get all products for Admin
// GET /api/products/admin
// Protected
const getAdminProducts = async (
  req,
  res
) => {
  try {
    const {
      category,
    } = req.query;

    let sql = `
      SELECT
        p.*,
        c.name_fr AS category_name_fr,
        c.name_en AS category_name_en
      FROM products p
      LEFT JOIN product_categories c
        ON p.category_id = c.id
    `;

    const params = [];

    // Filter Admin products by category
    if (category) {
      sql += `
        WHERE p.category_id = ?
      `;

      params.push(category);
    }

    sql += `
      ORDER BY
        p.display_order ASC,
        p.id ASC
    `;

    const [rows] =
      await db.query(
        sql,
        params
      );

    return sendSuccess(
      res,
      rows,
      "Products retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get admin products error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve products"
    );
  }
};

// Get one product for Admin
// GET /api/products/admin/:id
// Protected
const getAdminProductById =
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
            SELECT
              p.*,
              c.name_fr AS category_name_fr,
              c.name_en AS category_name_en
            FROM products p
            LEFT JOIN product_categories c
              ON p.category_id = c.id
            WHERE p.id = ?
            LIMIT 1
          `,
          [id]
        );

      if (
        rows.length === 0
      ) {
        return sendError(
          res,
          "Product not found",
          404
        );
      }

      return sendSuccess(
        res,
        rows[0],
        "Product retrieved successfully"
      );
    } catch (error) {
      console.error(
        "Get admin product error:",
        error
      );

      return sendError(
        res,
        "Failed to retrieve product"
      );
    }
  };

// Create a product
// POST /api/products
// Protected
const createProduct = async (
  req,
  res
) => {
  let uploadedFilePath =
    null;

  try {
    const {
      category_id,
      name_fr,
      name_en,
      description_fr,
      description_en,
      price,
      image_number,
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
        "French and English product names are required.",
        400
      );
    }

    // Validate category
    if (!category_id) {
      return sendError(
        res,
        "Product category is required.",
        400
      );
    }

    // Handle uploaded image
    let image = null;

    if (req.file) {
      image =
        `products/${req.file.filename}`;

      uploadedFilePath =
        path.join(
          __dirname,
          "../uploads",
          image
        );
    }

    const [result] =
      await db.query(
        `
          INSERT INTO products (
            category_id,
            name_fr,
            name_en,
            description_fr,
            description_en,
            price,
            image,
            image_number,
            display_order,
            is_active
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          category_id,

          name_fr.trim(),

          name_en.trim(),

          description_fr?.trim() ||
          null,

          description_en?.trim() ||
          null,

          price?.trim() ||
          null,

          image,

          image_number?.trim() ||
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

    // Get the newly created product
    const [rows] =
      await db.query(
        `
          SELECT
            p.*,
            c.name_fr AS category_name_fr,
            c.name_en AS category_name_en
          FROM products p
          LEFT JOIN product_categories c
            ON p.category_id = c.id
          WHERE p.id = ?
          LIMIT 1
        `,
        [result.insertId]
      );

    return sendSuccess(
      res,
      rows[0],
      "Product created successfully",
      201
    );
  } catch (error) {
    console.error(
      "Create product error:",
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
          "Failed to remove uploaded product image:",
          fileError
        );
      }
    }

    return sendError(
      res,
      "Failed to create product"
    );
  }
};

// Update a product
// PUT /api/products/:id
// Protected
const updateProduct = async (
  req,
  res
) => {
  let uploadedFilePath =
    null;

  try {
    const {
      id,
    } = req.params;

    // Get the existing product
    const [existingRows] =
      await db.query(
        `
          SELECT *
          FROM products
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
        "Product not found",
        404
      );
    }

    const existing =
      existingRows[0];

    const {
      category_id,
      name_fr,
      name_en,
      description_fr,
      description_en,
      price,
      image_number,
      display_order,
      is_active,
    } = req.body;

    // Keep the current image when no new image is uploaded
    let image =
      existing.image;

    // Handle the new uploaded image
    if (req.file) {
      image =
        `products/${req.file.filename}`;

      uploadedFilePath =
        path.join(
          __dirname,
          "../uploads",
          image
        );
    }

    // Update product information
    await db.query(
      `
        UPDATE products
        SET
          category_id = ?,
          name_fr = ?,
          name_en = ?,
          description_fr = ?,
          description_en = ?,
          price = ?,
          image = ?,
          image_number = ?,
          display_order = ?,
          is_active = ?
        WHERE id = ?
      `,
      [
        category_id !==
          undefined
          ? (
            category_id ||
            null
          )
          : existing.category_id,

        name_fr ??
        existing.name_fr,

        name_en ??
        existing.name_en,

        description_fr ??
        existing.description_fr,

        description_en ??
        existing.description_en,

        price ??
        existing.price,

        image,

        image_number ??
        existing.image_number,

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

    // Get the updated product
    const [rows] =
      await db.query(
        `
          SELECT
            p.*,
            c.name_fr AS category_name_fr,
            c.name_en AS category_name_en
          FROM products p
          LEFT JOIN product_categories c
            ON p.category_id = c.id
          WHERE p.id = ?
          LIMIT 1
        `,
        [id]
      );

    return sendSuccess(
      res,
      rows[0],
      "Product updated successfully"
    );
  } catch (error) {
    console.error(
      "Update product error:",
      error
    );

    // Remove only the new image if the database update failed
    // The old image is never deleted
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
          "Failed to remove uploaded product image:",
          fileError
        );
      }
    }

    return sendError(
      res,
      "Failed to update product"
    );
  }
};

// Delete a product
// DELETE /api/products/:id
// Protected
const deleteProduct = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    // Check that the product exists
    const [existingRows] =
      await db.query(
        `
          SELECT
            id,
            name_fr,
            name_en
          FROM products
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
        "Product not found",
        404
      );
    }

    // Delete only the database record
    // The uploaded image file is intentionally kept
    await db.query(
      `
        DELETE FROM products
        WHERE id = ?
      `,
      [id]
    );

    return sendSuccess(
      res,
      null,
      "Product deleted successfully"
    );
  } catch (error) {
    console.error(
      "Delete product error:",
      error
    );

    return sendError(
      res,
      "Failed to delete product"
    );
  }
};

module.exports = {
  getProducts,
  getProductById,
  getAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};