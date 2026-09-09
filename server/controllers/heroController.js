const db = require("../config/db");
const path = require("path");
const fs = require("fs");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

// Get the existing Hero record
const getHeroRecord = async () => {
  const [rows] = await db.query(
    "SELECT * FROM hero ORDER BY id ASC LIMIT 1"
  );

  return rows.length > 0
    ? rows[0]
    : null;
};

// Get Hero information
// GET /api/hero
// Public
const getHero = async (
  req,
  res
) => {
  try {
    const hero =
      await getHeroRecord();

    if (!hero) {
      return sendError(
        res,
        "Hero information not found",
        404
      );
    }

    return sendSuccess(
      res,
      hero,
      "Hero information retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get hero error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve hero information"
    );
  }
};

// Update Hero information
// PUT /api/hero
// Protected
const updateHero = async (
  req,
  res
) => {
  let uploadedFilePath = null;

  try {
    // Get existing Hero information
    const hero =
      await getHeroRecord();

    if (!hero) {
      return sendError(
        res,
        "Hero information not found",
        404
      );
    }

    // Keep the current image when no new image is uploaded
    let backgroundImage =
      hero.background_image;

    // Handle the new uploaded image
    if (req.file) {
      backgroundImage =
        `hero/${req.file.filename}`;

      uploadedFilePath =
        path.join(
          __dirname,
          "../uploads",
          backgroundImage
        );
    }

    // Update Hero information
    await db.query(
      `
        UPDATE hero
        SET
          title_fr = ?,
          title_en = ?,
          subtitle_fr = ?,
          subtitle_en = ?,
          description_fr = ?,
          description_en = ?,
          primary_button_fr = ?,
          primary_button_en = ?,
          secondary_button_fr = ?,
          secondary_button_en = ?,
          background_image = ?
        WHERE id = ?
      `,
      [
        req.body.title_fr ??
          hero.title_fr,

        req.body.title_en ??
          hero.title_en,

        req.body.subtitle_fr ??
          hero.subtitle_fr,

        req.body.subtitle_en ??
          hero.subtitle_en,

        req.body.description_fr ??
          hero.description_fr,

        req.body.description_en ??
          hero.description_en,

        req.body.primary_button_fr ??
          hero.primary_button_fr,

        req.body.primary_button_en ??
          hero.primary_button_en,

        req.body.secondary_button_fr ??
          hero.secondary_button_fr,

        req.body.secondary_button_en ??
          hero.secondary_button_en,

        backgroundImage,

        hero.id,
      ]
    );

    // Get the updated Hero information
    const updatedHero =
      await getHeroRecord();

    return sendSuccess(
      res,
      updatedHero,
      "Hero information updated successfully"
    );
  } catch (error) {
    console.error(
      "Update hero error:",
      error
    );

    // Remove the new image if the database update failed
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
          "Failed to remove uploaded hero image:",
          fileError
        );
      }
    }

    return sendError(
      res,
      "Failed to update hero information"
    );
  }
};

module.exports = {
  getHero,
  updateHero,
};