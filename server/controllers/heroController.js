const db = require("../config/db");
const path = require("path");
const fs = require("fs");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

// ============================================================
// GET EXISTING HERO RECORD
// ============================================================

const getHeroRecord = async () => {
  const [rows] = await db.query(
    "SELECT * FROM hero ORDER BY id ASC LIMIT 1"
  );

  return rows.length > 0
    ? rows[0]
    : null;
};

// ============================================================
// GET HERO
// GET /api/hero
// Public
// ============================================================

const getHero = async (req, res) => {
  try {
    const hero = await getHeroRecord();

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

// ============================================================
// UPDATE HERO
// PUT /api/hero
// Protected
// ============================================================

const updateHero = async (req, res) => {
  const uploadedFiles = [];

  try {
    // --------------------------------------------------------
    // Get existing Hero
    // --------------------------------------------------------

    const hero = await getHeroRecord();

    if (!hero) {
      return sendError(
        res,
        "Hero information not found",
        404
      );
    }

    // --------------------------------------------------------
    // Existing images
    // --------------------------------------------------------

    let backgroundImageDesktop =
      hero.background_image_desktop;

    let backgroundImageMobile =
      hero.background_image_mobile;

    // --------------------------------------------------------
    // Handle desktop image
    // --------------------------------------------------------

    if (req.files?.background_image_desktop?.[0]) {
      const file =
        req.files.background_image_desktop[0];

      backgroundImageDesktop =
        `hero/${file.filename}`;

      uploadedFiles.push(
        path.join(
          __dirname,
          "../uploads",
          backgroundImageDesktop
        )
      );
    }

    // --------------------------------------------------------
    // Handle mobile image
    // --------------------------------------------------------

    if (req.files?.background_image_mobile?.[0]) {
      const file =
        req.files.background_image_mobile[0];

      backgroundImageMobile =
        `hero/${file.filename}`;

      uploadedFiles.push(
        path.join(
          __dirname,
          "../uploads",
          backgroundImageMobile
        )
      );
    }

    // --------------------------------------------------------
    // Update database
    // --------------------------------------------------------

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

          background_image_desktop = ?,
          background_image_mobile = ?

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

        backgroundImageDesktop,

        backgroundImageMobile,

        hero.id,
      ]
    );

    // --------------------------------------------------------
    // Get updated Hero
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // Delete newly uploaded files
    // if database update failed
    // --------------------------------------------------------

    for (const filePath of uploadedFiles) {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (fileError) {
          console.error(
            "Failed to remove uploaded hero image:",
            fileError
          );
        }
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