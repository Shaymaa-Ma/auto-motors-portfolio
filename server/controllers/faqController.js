const db = require("../config/db");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

// Get all active FAQs
// GET /api/faqs
// Public
const getFaqs = async (
  req,
  res
) => {
  try {
    const [rows] =
      await db.query(
        `
          SELECT *
          FROM faqs
          WHERE is_active = 1
          ORDER BY
            display_order ASC,
            id ASC
        `
      );

    return sendSuccess(
      res,
      rows,
      "FAQs retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get FAQs error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve FAQs"
    );
  }
};

// Get one active FAQ
// GET /api/faqs/:id
// Public
const getFaqById =
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
            FROM faqs
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
          "FAQ not found",
          404
        );
      }

      return sendSuccess(
        res,
        rows[0],
        "FAQ retrieved successfully"
      );
    } catch (error) {
      console.error(
        "Get FAQ error:",
        error
      );

      return sendError(
        res,
        "Failed to retrieve FAQ"
      );
    }
  };

// Get all FAQs for Admin
// GET /api/faqs/admin
// Protected
const getAdminFaqs =
  async (
    req,
    res
  ) => {
    try {
      const [rows] =
        await db.query(
          `
            SELECT *
            FROM faqs
            ORDER BY
              display_order ASC,
              id ASC
          `
        );

      return sendSuccess(
        res,
        rows,
        "FAQs retrieved successfully"
      );
    } catch (error) {
      console.error(
        "Get admin FAQs error:",
        error
      );

      return sendError(
        res,
        "Failed to retrieve FAQs"
      );
    }
  };

// Get one FAQ for Admin
// GET /api/faqs/admin/:id
// Protected
const getAdminFaqById =
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
            FROM faqs
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
          "FAQ not found",
          404
        );
      }

      return sendSuccess(
        res,
        rows[0],
        "FAQ retrieved successfully"
      );
    } catch (error) {
      console.error(
        "Get admin FAQ error:",
        error
      );

      return sendError(
        res,
        "Failed to retrieve FAQ"
      );
    }
  };

// Create an FAQ
// POST /api/faqs
// Protected
const createFaq =
  async (
    req,
    res
  ) => {
    try {
      const {
        section_title_fr,
        section_title_en,
        section_subtitle_fr,
        section_subtitle_en,
        question_fr,
        question_en,
        answer_fr,
        answer_en,
        display_order,
        is_active,
      } = req.body;

      // Validate required fields
      if (
        !question_fr ||
        !question_en ||
        !answer_fr ||
        !answer_en
      ) {
        return sendError(
          res,
          "French and English questions and answers are required.",
          400
        );
      }

      // Create the FAQ
      const [result] =
        await db.query(
          `
            INSERT INTO faqs (
              section_title_fr,
              section_title_en,
              section_subtitle_fr,
              section_subtitle_en,
              question_fr,
              question_en,
              answer_fr,
              answer_en,
              display_order,
              is_active
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

            question_fr,

            question_en,

            answer_fr,

            answer_en,

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

      // Get the newly created FAQ
      const [rows] =
        await db.query(
          `
            SELECT *
            FROM faqs
            WHERE id = ?
            LIMIT 1
          `,
          [result.insertId]
        );

      return sendSuccess(
        res,
        rows[0],
        "FAQ created successfully",
        201
      );
    } catch (error) {
      console.error(
        "Create FAQ error:",
        error
      );

      return sendError(
        res,
        "Failed to create FAQ"
      );
    }
  };

// Update an FAQ
// PUT /api/faqs/:id
// Protected
const updateFaq =
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      // Get the existing FAQ
      const [existingRows] =
        await db.query(
          `
            SELECT *
            FROM faqs
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
          "FAQ not found",
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
        question_fr,
        question_en,
        answer_fr,
        answer_en,
        display_order,
        is_active,
      } = req.body;

      // Update FAQ information
      await db.query(
        `
          UPDATE faqs
          SET
            section_title_fr = ?,
            section_title_en = ?,
            section_subtitle_fr = ?,
            section_subtitle_en = ?,
            question_fr = ?,
            question_en = ?,
            answer_fr = ?,
            answer_en = ?,
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

          question_fr ??
            existing.question_fr,

          question_en ??
            existing.question_en,

          answer_fr ??
            existing.answer_fr,

          answer_en ??
            existing.answer_en,

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

      // Get the updated FAQ
      const [rows] =
        await db.query(
          `
            SELECT *
            FROM faqs
            WHERE id = ?
            LIMIT 1
          `,
          [id]
        );

      return sendSuccess(
        res,
        rows[0],
        "FAQ updated successfully"
      );
    } catch (error) {
      console.error(
        "Update FAQ error:",
        error
      );

      return sendError(
        res,
        "Failed to update FAQ"
      );
    }
  };

// Delete an FAQ
// DELETE /api/faqs/:id
// Protected
const deleteFaq =
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      // Check if FAQ exists
      const [existingRows] =
        await db.query(
          `
            SELECT id
            FROM faqs
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
          "FAQ not found",
          404
        );
      }

      // Delete the FAQ
      await db.query(
        `
          DELETE FROM faqs
          WHERE id = ?
        `,
        [id]
      );

      return sendSuccess(
        res,
        null,
        "FAQ deleted successfully"
      );
    } catch (error) {
      console.error(
        "Delete FAQ error:",
        error
      );

      return sendError(
        res,
        "Failed to delete FAQ"
      );
    }
  };

module.exports = {
  getFaqs,
  getFaqById,
  getAdminFaqs,
  getAdminFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
};