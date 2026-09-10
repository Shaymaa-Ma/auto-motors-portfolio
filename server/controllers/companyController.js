const db = require("../config/db");
const path = require("path");
const fs = require("fs");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

// Get the existing Company information
const getCompanyRecord = async () => {
  const [rows] = await db.query(
    "SELECT * FROM company_info ORDER BY id ASC LIMIT 1"
  );

  return rows.length > 0
    ? rows[0]
    : null;
};

// Get Company information
// GET /api/company
// Public
const getCompany = async (
  req,
  res
) => {
  try {
    const company =
      await getCompanyRecord();

    if (!company) {
      return sendError(
        res,
        "Company information not found",
        404
      );
    }

    return sendSuccess(
      res,
      company,
      "Company information retrieved successfully"
    );
  } catch (error) {
    console.error(
      "Get company error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve company information"
    );
  }
};

// Update Company information
// PUT /api/company
// Protected
const updateCompany = async (
  req,
  res
) => {
  let uploadedFilePath = null;

  try {
    // Get existing Company information
    const company =
      await getCompanyRecord();

    if (!company) {
      return sendError(
        res,
        "Company information not found",
        404
      );
    }

    const {
      company_name,
      tagline_fr,
      tagline_en,
      about_fr,
      about_en,
      mission_fr,
      mission_en,
      address_fr,
      address_en,
      email,
      phone_1,
      phone_2,
      phone_3,
    } = req.body;

    // Validate required company name
    if (
      req.body.company_name !== undefined &&
      !company_name?.trim()
    ) {
      return sendError(
        res,
        "Company name is required.",
        400
      );
    }

    // Keep the current logo when no new image is uploaded
    let logo =
      company.logo;

    // Handle the new uploaded logo
    if (req.file) {
      logo =
        `logo/${req.file.filename}`;

      uploadedFilePath =
        path.join(
          __dirname,
          "../uploads",
          logo
        );
    }

    // Update Company information
    await db.query(
      `
        UPDATE company_info
        SET
          company_name = ?,
          tagline_fr = ?,
          tagline_en = ?,
          about_fr = ?,
          about_en = ?,
          mission_fr = ?,
          mission_en = ?,
          address_fr = ?,
          address_en = ?,
          email = ?,
          phone_1 = ?,
          phone_2 = ?,
          phone_3 = ?,
          logo = ?
        WHERE id = ?
      `,
      [
        company_name ??
          company.company_name,

        tagline_fr ??
          company.tagline_fr,

        tagline_en ??
          company.tagline_en,

        about_fr ??
          company.about_fr,

        about_en ??
          company.about_en,

        mission_fr ??
          company.mission_fr,

        mission_en ??
          company.mission_en,

        address_fr ??
          company.address_fr,

        address_en ??
          company.address_en,

        email ??
          company.email,

        phone_1 ??
          company.phone_1,

        phone_2 ??
          company.phone_2,

        phone_3 ??
          company.phone_3,

        logo,

        company.id,
      ]
    );

    // Get the updated Company information
    const updatedCompany =
      await getCompanyRecord();

    return sendSuccess(
      res,
      updatedCompany,
      "Company information updated successfully"
    );
  } catch (error) {
    console.error(
      "Update company error:",
      error
    );

    // Remove only the new logo if the database update failed
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
          "Failed to remove uploaded company logo:",
          fileError
        );
      }
    }

    return sendError(
      res,
      "Failed to update company information"
    );
  }
};

module.exports = {
  getCompany,
  updateCompany,
};