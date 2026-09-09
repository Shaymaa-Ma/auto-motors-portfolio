const db = require("../config/db");
const path = require("path");
const fs = require("fs");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

// Get the existing About record
const getAboutRecord = async () => {
  const [rows] = await db.query(
    "SELECT * FROM about ORDER BY id ASC LIMIT 1"
  );

  return rows.length > 0
    ? rows[0]
    : null;
};

// Get About information
// GET /api/about
// Public
const getAbout = async (
  req,
  res
) => {
  try {
    const about =
      await getAboutRecord();

    if (!about) {
      return sendError(
        res,
        "About content not found",
        404
      );
    }

    return sendSuccess(
      res,
      about,
      "About content retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get About Error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve About content"
    );
  }
};

// Update About information
// PUT /api/about
// Protected
const updateAbout = async (
  req,
  res
) => {
  let uploadedFilePath =
    null;

  try {
    // Get existing About information
    const about =
      await getAboutRecord();

    if (!about) {
      return sendError(
        res,
        "About content not found",
        404
      );
    }

    // Keep the current image when no new image is uploaded
    let image =
      about.image;

    // Handle the new uploaded image
    if (req.file) {
      image =
        `about/${req.file.filename}`;

      uploadedFilePath =
        path.join(
          __dirname,
          "../uploads",
          image
        );
    }

    // Update About information
    await db.query(
      `
        UPDATE about
        SET
          title_fr = ?,
          title_en = ?,
          subtitle_fr = ?,
          subtitle_en = ?,
          description_fr = ?,
          description_en = ?,
          mission_title_fr = ?,
          mission_title_en = ?,
          mission_fr = ?,
          mission_en = ?,
          image = ?,
          primary_button_fr = ?,
          primary_button_en = ?,
          primary_button_link = ?,
          secondary_button_fr = ?,
          secondary_button_en = ?,
          secondary_button_link = ?
        WHERE id = ?
      `,
      [
        req.body.title_fr ??
          about.title_fr,

        req.body.title_en ??
          about.title_en,

        req.body.subtitle_fr ??
          about.subtitle_fr,

        req.body.subtitle_en ??
          about.subtitle_en,

        req.body.description_fr ??
          about.description_fr,

        req.body.description_en ??
          about.description_en,

        req.body.mission_title_fr ??
          about.mission_title_fr,

        req.body.mission_title_en ??
          about.mission_title_en,

        req.body.mission_fr ??
          about.mission_fr,

        req.body.mission_en ??
          about.mission_en,

        image,

        req.body.primary_button_fr ??
          about.primary_button_fr,

        req.body.primary_button_en ??
          about.primary_button_en,

        req.body.primary_button_link ??
          about.primary_button_link,

        req.body.secondary_button_fr ??
          about.secondary_button_fr,

        req.body.secondary_button_en ??
          about.secondary_button_en,

        req.body.secondary_button_link ??
          about.secondary_button_link,

        about.id,
      ]
    );

    // Get the updated About information
    const updatedAbout =
      await getAboutRecord();

    return sendSuccess(
      res,
      updatedAbout,
      "About content updated successfully"
    );
  } catch (error) {
    console.error(
      "Update About Error:",
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
          "Failed to remove uploaded About image:",
          fileError
        );
      }
    }

    return sendError(
      res,
      "Failed to update About content"
    );
  }
};

module.exports = {
  getAbout,
  updateAbout,
};