const db = require("../config/db");
const path = require("path");
const fs = require("fs");

const {
  clearCache,
} = require("../middleware/cache");

// =========================================================
// CONSTANTS
// =========================================================

const MAX_VEHICLE_TYPE_LENGTH = 100;
const MAX_VEHICLE_NAME_LENGTH = 255;
const DEFAULT_VEHICLE_ICON = "bi-truck";


// =========================================================
// HELPERS
// =========================================================

const cleanRequiredText = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const cleanOptionalText = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const cleaned = String(value).trim();

  return cleaned === "" ? null : cleaned;
};


// =========================================================
// VEHICLE IMAGE HELPERS
// =========================================================

const getVehicleImagePath = (image) => {
  if (!image) {
    return null;
  }

  const normalized = String(image)
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  // Only allow files inside the vehicles upload folder.
  if (!normalized.startsWith("vehicles/")) {
    return null;
  }

  const filename = path.basename(normalized);

  if (
    !filename ||
    filename === "." ||
    filename === ".."
  ) {
    return null;
  }

  return path.join(
    __dirname,
    "../uploads/vehicles",
    filename
  );
};

const deleteVehicleImage = (image) => {
  const imagePath = getVehicleImagePath(image);

  if (!imagePath) {
    return;
  }

  try {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  } catch (error) {
    console.error(
      "Could not delete vehicle image:",
      error
    );
  }
};


// =========================================================
// VALIDATION
// =========================================================

const validateVehicleType = (
  value,
  fieldName
) => {
  if (!value) {
    return `${fieldName} is required.`;
  }

  if (
    value.length >
    MAX_VEHICLE_TYPE_LENGTH
  ) {
    return `${fieldName} must not exceed ${MAX_VEHICLE_TYPE_LENGTH} characters.`;
  }

  return null;
};

const validateVehicleName = (
  value,
  fieldName
) => {
  if (!value) {
    return `${fieldName} is required.`;
  }

  if (
    value.length >
    MAX_VEHICLE_NAME_LENGTH
  ) {
    return `${fieldName} must not exceed ${MAX_VEHICLE_NAME_LENGTH} characters.`;
  }

  return null;
};


// =========================================================
// GET PUBLIC VEHICLES
// =========================================================

const getVehicles = async (
  req,
  res
) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        section_title_fr,
        section_title_en,
        section_subtitle_fr,
        section_subtitle_en,
        type_fr,
        type_en,
        name_fr,
        name_en,
        description_fr,
        description_en,
        image,
        display_order,
        is_active,
        icon
      FROM vehicles
      WHERE is_active = 1
      ORDER BY
        display_order ASC,
        id ASC
    `);

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(
      "Get vehicles error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch vehicles.",
    });
  }
};


// =========================================================
// GET PUBLIC VEHICLE BY ID
// =========================================================

const getVehicleById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle ID is required.",
      });
    }

    const [rows] =
      await db.query(
        `
        SELECT
          id,
          section_title_fr,
          section_title_en,
          section_subtitle_fr,
          section_subtitle_en,
          type_fr,
          type_en,
          name_fr,
          name_en,
          description_fr,
          description_en,
          image,
          display_order,
          is_active,
          icon
        FROM vehicles
        WHERE id = ?
          AND is_active = 1
        LIMIT 1
        `,
        [id]
      );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message:
          "Vehicle not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error(
      "Get vehicle by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch vehicle.",
    });
  }
};


// =========================================================
// GET ADMIN VEHICLES - PAGINATED
// =========================================================

const getAdminVehicles = async (
  req,
  res
) => {
  try {
    let page = parseInt(
      req.query.page,
      10
    );

    let limit = parseInt(
      req.query.limit,
      10
    );

    if (
      !Number.isFinite(page) ||
      page < 1
    ) {
      page = 1;
    }

    if (
      !Number.isFinite(limit) ||
      limit < 1
    ) {
      limit = 10;
    }

    if (limit > 100) {
      limit = 100;
    }

    const offset =
      (page - 1) * limit;

    const [countRows] =
      await db.query(`
        SELECT COUNT(*) AS total
        FROM vehicles
      `);

    const totalItems =
      Number(
        countRows[0]?.total || 0
      );

    const totalPages =
      totalItems > 0
        ? Math.ceil(
            totalItems / limit
          )
        : 1;

    const [rows] =
      await db.query(
        `
        SELECT
          id,
          section_title_fr,
          section_title_en,
          section_subtitle_fr,
          section_subtitle_en,
          type_fr,
          type_en,
          name_fr,
          name_en,
          description_fr,
          description_en,
          image,
          display_order,
          is_active,
          created_at,
          updated_at,
          icon
        FROM vehicles
        ORDER BY
          display_order ASC,
          id ASC
        LIMIT ? OFFSET ?
        `,
        [limit, offset]
      );

    return res.status(200).json({
      success: true,
      data: {
        items: rows,
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error(
      "Get admin vehicles error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch admin vehicles.",
    });
  }
};


// =========================================================
// GET ADMIN VEHICLE BY ID
// =========================================================

const getAdminVehicleById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle ID is required.",
      });
    }

    const [rows] =
      await db.query(
        `
        SELECT
          id,
          section_title_fr,
          section_title_en,
          section_subtitle_fr,
          section_subtitle_en,
          type_fr,
          type_en,
          name_fr,
          name_en,
          description_fr,
          description_en,
          image,
          display_order,
          is_active,
          created_at,
          updated_at,
          icon
        FROM vehicles
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message:
          "Vehicle not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error(
      "Get admin vehicle error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch vehicle.",
    });
  }
};


// =========================================================
// CREATE VEHICLE
// =========================================================

const createVehicle = async (
  req,
  res
) => {
  let uploadedFilePath = null;

  try {
    const {
      type_fr,
      type_en,
      name_fr,
      name_en,
      description_fr,
      description_en,
      display_order,
      is_active,
      section_title_fr,
      section_title_en,
      section_subtitle_fr,
      section_subtitle_en,
    } = req.body;


    // =====================================================
    // CLEAN VALUES
    // =====================================================

    const cleanedTypeFr =
      cleanRequiredText(type_fr);

    const cleanedTypeEn =
      cleanRequiredText(type_en);

    const cleanedNameFr =
      cleanRequiredText(name_fr);

    const cleanedNameEn =
      cleanRequiredText(name_en);

    const cleanedDescriptionFr =
      cleanOptionalText(
        description_fr
      );

    const cleanedDescriptionEn =
      cleanOptionalText(
        description_en
      );


    // =====================================================
    // VALIDATE TYPE
    // =====================================================

    const typeFrError =
      validateVehicleType(
        cleanedTypeFr,
        "French vehicle type"
      );

    if (typeFrError) {
      return res.status(400).json({
        success: false,
        message: typeFrError,
      });
    }

    const typeEnError =
      validateVehicleType(
        cleanedTypeEn,
        "English vehicle type"
      );

    if (typeEnError) {
      return res.status(400).json({
        success: false,
        message: typeEnError,
      });
    }


    // =====================================================
    // VALIDATE NAME
    // =====================================================

    const nameFrError =
      validateVehicleName(
        cleanedNameFr,
        "French vehicle name"
      );

    if (nameFrError) {
      return res.status(400).json({
        success: false,
        message: nameFrError,
      });
    }

    const nameEnError =
      validateVehicleName(
        cleanedNameEn,
        "English vehicle name"
      );

    if (nameEnError) {
      return res.status(400).json({
        success: false,
        message: nameEnError,
      });
    }


    // =====================================================
    // IMAGE
    // =====================================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle image is required.",
      });
    }

    const image =
      `vehicles/${req.file.filename}`;

    uploadedFilePath = path.join(
      __dirname,
      "../uploads/vehicles",
      req.file.filename
    );


    // =====================================================
    // GET CURRENT SHARED SECTION CONTENT
    // =====================================================

    /*
     * The icon is a shared section setting.
     *
     * When a new vehicle is created, it must inherit
     * the currently selected section icon.
     *
     * It must NOT reset to bi-truck.
     */

    const [sectionRows] =
      await db.query(`
        SELECT
          section_title_fr,
          section_title_en,
          section_subtitle_fr,
          section_subtitle_en,
          icon
        FROM vehicles
        ORDER BY id ASC
        LIMIT 1
      `);

    const existingSection =
      sectionRows[0] || {};


    // =====================================================
    // SECTION TEXT
    // =====================================================

    const finalSectionTitleFr =
      cleanOptionalText(
        section_title_fr !== undefined
          ? section_title_fr
          : existingSection.section_title_fr
      );

    const finalSectionTitleEn =
      cleanOptionalText(
        section_title_en !== undefined
          ? section_title_en
          : existingSection.section_title_en
      );

    const finalSectionSubtitleFr =
      cleanOptionalText(
        section_subtitle_fr !== undefined
          ? section_subtitle_fr
          : existingSection.section_subtitle_fr
      );

    const finalSectionSubtitleEn =
      cleanOptionalText(
        section_subtitle_en !== undefined
          ? section_subtitle_en
          : existingSection.section_subtitle_en
      );


    // =====================================================
    // SHARED SECTION ICON
    // =====================================================

    const finalSectionIcon =
      existingSection.icon ||
      DEFAULT_VEHICLE_ICON;


    // =====================================================
    // DISPLAY ORDER
    // =====================================================

    let finalDisplayOrder;

    if (
      display_order !== undefined &&
      display_order !== null &&
      String(
        display_order
      ).trim() !== ""
    ) {
      finalDisplayOrder =
        Number(display_order);
    } else {
      const [countRows] =
        await db.query(`
          SELECT COUNT(*) AS total
          FROM vehicles
        `);

      finalDisplayOrder =
        Number(
          countRows[0]?.total || 0
        ) + 1;
    }

    if (
      !Number.isFinite(
        finalDisplayOrder
      ) ||
      finalDisplayOrder < 1
    ) {
      finalDisplayOrder = 1;
    }


    // =====================================================
    // STATUS
    // =====================================================

    const finalIsActive =
      String(is_active) === "0"
        ? 0
        : 1;


    // =====================================================
    // INSERT
    // =====================================================

    const [result] =
      await db.query(
        `
        INSERT INTO vehicles (
          section_title_fr,
          section_title_en,
          section_subtitle_fr,
          section_subtitle_en,
          type_fr,
          type_en,
          name_fr,
          name_en,
          description_fr,
          description_en,
          image,
          display_order,
          is_active,
          icon
        )
        VALUES (
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?
        )
        `,
        [
          finalSectionTitleFr,
          finalSectionTitleEn,
          finalSectionSubtitleFr,
          finalSectionSubtitleEn,
          cleanedTypeFr,
          cleanedTypeEn,
          cleanedNameFr,
          cleanedNameEn,
          cleanedDescriptionFr,
          cleanedDescriptionEn,
          image,
          finalDisplayOrder,
          finalIsActive,
          finalSectionIcon,
        ]
      );

    clearCache(
      "/api/vehicles"
    );


    // =====================================================
    // GET CREATED VEHICLE
    // =====================================================

    const [rows] =
      await db.query(
        `
        SELECT *
        FROM vehicles
        WHERE id = ?
        LIMIT 1
        `,
        [result.insertId]
      );

    return res.status(201).json({
      success: true,
      message:
        "Vehicle created successfully.",
      data:
        rows[0] || {
          id: result.insertId,
        },
    });

  } catch (error) {
    console.error(
      "Create vehicle error:",
      error
    );


    // =====================================================
    // CLEAN UP UPLOADED IMAGE
    // =====================================================

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
      } catch (cleanupError) {
        console.error(
          "Could not remove uploaded vehicle image after failed creation:",
          cleanupError
        );
      }
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create vehicle.",
    });
  }
};


// =========================================================
// UPDATE VEHICLE SECTION
// =========================================================

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
      icon,
    } = req.body || {};


    // =====================================================
    // CLEAN SECTION VALUES
    // =====================================================

    const titleFr =
      cleanOptionalText(
        section_title_fr
      );

    const titleEn =
      cleanOptionalText(
        section_title_en
      );

    const subtitleFr =
      cleanOptionalText(
        section_subtitle_fr
      );

    const subtitleEn =
      cleanOptionalText(
        section_subtitle_en
      );


    // =====================================================
    // VALIDATE / CLEAN SHARED ICON
    // =====================================================

    const sectionIcon =
      cleanOptionalText(icon) ||
      DEFAULT_VEHICLE_ICON;


    // =====================================================
    // CHECK VEHICLES
    // =====================================================

    const [existingRows] =
      await db.query(
        `
        SELECT id
        FROM vehicles
        LIMIT 1
        `
      );

    if (!existingRows.length) {
      return res.status(404).json({
        success: false,
        message:
          "No vehicles found.",
      });
    }


    // =====================================================
    // UPDATE SHARED SECTION
    // =====================================================

    /*
     * IMPORTANT:
     *
     * The icon is a shared section setting.
     * Therefore update ALL vehicle rows.
     */

    await db.query(
      `
      UPDATE vehicles
      SET
        section_title_fr = ?,
        section_title_en = ?,
        section_subtitle_fr = ?,
        section_subtitle_en = ?,
        icon = ?
      `,
      [
        titleFr,
        titleEn,
        subtitleFr,
        subtitleEn,
        sectionIcon,
      ]
    );

    clearCache(
      "/api/vehicles"
    );


    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,
      message:
        "Vehicles section updated successfully.",
      data: {
        section_title_fr: titleFr,
        section_title_en: titleEn,
        section_subtitle_fr: subtitleFr,
        section_subtitle_en: subtitleEn,
        icon: sectionIcon,
      },
    });

  } catch (error) {
    console.error(
      "Update vehicles section error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update vehicles section.",
    });
  }
};


// =========================================================
// UPDATE VEHICLE
// =========================================================

const updateVehicle = async (
  req,
  res
) => {
  let uploadedFilePath = null;

  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle ID is required.",
      });
    }


    // =====================================================
    // GET EXISTING VEHICLE
    // =====================================================

    const [existingRows] =
      await db.query(
        `
        SELECT *
        FROM vehicles
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    if (!existingRows.length) {

      if (req.file) {
        const uploadedImagePath =
          path.join(
            __dirname,
            "../uploads/vehicles",
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
              "Failed to remove uploaded vehicle image:",
              fileError
            );
          }
        }
      }

      return res.status(404).json({
        success: false,
        message:
          "Vehicle not found.",
      });
    }

    const existingVehicle =
      existingRows[0];


    // =====================================================
    // BODY VALUES
    // =====================================================

    const typeFr =
      req.body.type_fr !== undefined
        ? cleanRequiredText(
            req.body.type_fr
          )
        : existingVehicle.type_fr;

    const typeEn =
      req.body.type_en !== undefined
        ? cleanRequiredText(
            req.body.type_en
          )
        : existingVehicle.type_en;

    const nameFr =
      req.body.name_fr !== undefined
        ? cleanRequiredText(
            req.body.name_fr
          )
        : existingVehicle.name_fr;

    const nameEn =
      req.body.name_en !== undefined
        ? cleanRequiredText(
            req.body.name_en
          )
        : existingVehicle.name_en;

    const descriptionFr =
      req.body.description_fr !== undefined
        ? cleanOptionalText(
            req.body.description_fr
          )
        : existingVehicle.description_fr;

    const descriptionEn =
      req.body.description_en !== undefined
        ? cleanOptionalText(
            req.body.description_en
          )
        : existingVehicle.description_en;


    // =====================================================
    // VALIDATION
    // =====================================================

    const typeFrError =
      validateVehicleType(
        typeFr,
        "French vehicle type"
      );

    if (typeFrError) {
      return res.status(400).json({
        success: false,
        message: typeFrError,
      });
    }

    const typeEnError =
      validateVehicleType(
        typeEn,
        "English vehicle type"
      );

    if (typeEnError) {
      return res.status(400).json({
        success: false,
        message: typeEnError,
      });
    }

    const nameFrError =
      validateVehicleName(
        nameFr,
        "French vehicle name"
      );

    if (nameFrError) {
      return res.status(400).json({
        success: false,
        message: nameFrError,
      });
    }

    const nameEnError =
      validateVehicleName(
        nameEn,
        "English vehicle name"
      );

    if (nameEnError) {
      return res.status(400).json({
        success: false,
        message: nameEnError,
      });
    }


    // =====================================================
    // DISPLAY ORDER
    // =====================================================

    let finalDisplayOrder =
      existingVehicle.display_order;

    if (
      req.body.display_order !==
        undefined &&
      req.body.display_order !==
        null &&
      String(
        req.body.display_order
      ).trim() !== ""
    ) {
      const requestedOrder =
        Number(
          req.body.display_order
        );

      if (
        Number.isFinite(
          requestedOrder
        ) &&
        requestedOrder >= 1
      ) {
        finalDisplayOrder =
          requestedOrder;
      }
    }


    // =====================================================
    // STATUS
    // =====================================================

    let finalIsActive =
      existingVehicle.is_active;

    if (
      req.body.is_active !==
        undefined &&
      req.body.is_active !==
        null
    ) {
      finalIsActive =
        String(
          req.body.is_active
        ) === "0"
          ? 0
          : 1;
    }


    // =====================================================
    // IMAGE
    // =====================================================

    /*
     * No icon is handled here.
     *
     * The icon belongs to the shared Vehicles section.
     * It can only be changed through updateVehicleSection().
     */

    let finalImage =
      existingVehicle.image;

    if (req.file) {
      finalImage =
        `vehicles/${req.file.filename}`;

      uploadedFilePath = path.join(
        __dirname,
        "../uploads/vehicles",
        req.file.filename
      );
    }


    // =====================================================
    // UPDATE DATABASE
    // =====================================================

    /*
     * IMPORTANT:
     *
     * Do NOT update icon here.
     * The existing shared icon remains untouched.
     */

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
        is_active = ?
      WHERE id = ?
      `,
      [
        typeFr,
        typeEn,
        nameFr,
        nameEn,
        descriptionFr,
        descriptionEn,
        finalImage,
        finalDisplayOrder,
        finalIsActive,
        id,
      ]
    );

    clearCache(
      "/api/vehicles"
    );


    // =====================================================
    // DELETE OLD IMAGE AFTER SUCCESSFUL UPDATE
    // =====================================================

    if (
      req.file &&
      existingVehicle.image &&
      existingVehicle.image !==
        finalImage
    ) {
      deleteVehicleImage(
        existingVehicle.image
      );
    }


    // =====================================================
    // GET UPDATED VEHICLE
    // =====================================================

    const [updatedRows] =
      await db.query(
        `
        SELECT *
        FROM vehicles
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    return res.status(200).json({
      success: true,
      message:
        "Vehicle updated successfully.",
      data:
        updatedRows[0] || null,
    });

  } catch (error) {
    console.error(
      "Update vehicle error:",
      error
    );


    // =====================================================
    // CLEAN UP NEW IMAGE AFTER FAILED UPDATE
    // =====================================================

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
      } catch (cleanupError) {
        console.error(
          "Could not remove uploaded vehicle image after failed update:",
          cleanupError
        );
      }
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to update vehicle.",
    });
  }
};


// =========================================================
// REORDER VEHICLE
// =========================================================

const reorderVehicle = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const displayOrder =
      Number(
        req.body.display_order
      );

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle ID is required.",
      });
    }

    if (
      !Number.isFinite(
        displayOrder
      ) ||
      displayOrder < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid display order is required.",
      });
    }

    const [existingRows] =
      await db.query(
        `
        SELECT
          id,
          display_order
        FROM vehicles
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    if (!existingRows.length) {
      return res.status(404).json({
        success: false,
        message:
          "Vehicle not found.",
      });
    }

    const oldOrder =
      Number(
        existingRows[0].display_order
      );

    if (
      oldOrder ===
      displayOrder
    ) {
      return res.status(200).json({
        success: true,
        message:
          "Vehicle order unchanged.",
      });
    }


    // =====================================================
    // MOVING DOWN
    // =====================================================

    if (
      displayOrder >
      oldOrder
    ) {
      await db.query(
        `
        UPDATE vehicles
        SET
          display_order =
            display_order - 1
        WHERE
          display_order > ?
          AND display_order <= ?
          AND id <> ?
        `,
        [
          oldOrder,
          displayOrder,
          id,
        ]
      );
    }


    // =====================================================
    // MOVING UP
    // =====================================================

    else {
      await db.query(
        `
        UPDATE vehicles
        SET
          display_order =
            display_order + 1
        WHERE
          display_order >= ?
          AND display_order < ?
          AND id <> ?
        `,
        [
          displayOrder,
          oldOrder,
          id,
        ]
      );
    }


    // =====================================================
    // SET NEW ORDER
    // =====================================================

    await db.query(
      `
      UPDATE vehicles
      SET display_order = ?
      WHERE id = ?
      `,
      [
        displayOrder,
        id,
      ]
    );

    clearCache(
      "/api/vehicles"
    );

    return res.status(200).json({
      success: true,
      message:
        "Vehicle order updated successfully.",
    });

  } catch (error) {
    console.error(
      "Reorder vehicle error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to reorder vehicle.",
    });
  }
};


// =========================================================
// NORMALIZE VEHICLE ORDERS
// =========================================================

const normalizeVehicleOrders =
  async (
    req,
    res
  ) => {
    try {
      const [rows] =
        await db.query(`
          SELECT id
          FROM vehicles
          ORDER BY
            display_order ASC,
            id ASC
        `);

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

      clearCache(
        "/api/vehicles"
      );

      return res.status(200).json({
        success: true,
        message:
          "Vehicle orders normalized successfully.",
      });

    } catch (error) {
      console.error(
        "Normalize vehicle orders error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to normalize vehicle orders.",
      });
    }
  };


// =========================================================
// DELETE VEHICLE
// =========================================================

const deleteVehicle = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle ID is required.",
      });
    }

    const [rows] =
      await db.query(
        `
        SELECT image
        FROM vehicles
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message:
          "Vehicle not found.",
      });
    }

    const oldImage =
      rows[0].image;


    // =====================================================
    // DELETE DATABASE ROW
    // =====================================================

    await db.query(
      `
      DELETE FROM vehicles
      WHERE id = ?
      `,
      [id]
    );


    // =====================================================
    // DELETE IMAGE
    // =====================================================

    if (oldImage) {
      deleteVehicleImage(
        oldImage
      );
    }


    // =====================================================
    // NORMALIZE REMAINING ORDERS
    // =====================================================

    const [remainingRows] =
      await db.query(`
        SELECT id
        FROM vehicles
        ORDER BY
          display_order ASC,
          id ASC
      `);

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

    clearCache(
      "/api/vehicles"
    );

    return res.status(200).json({
      success: true,
      message:
        "Vehicle deleted successfully.",
    });

  } catch (error) {
    console.error(
      "Delete vehicle error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete vehicle.",
    });
  }
};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  getAdminVehicles,
  getAdminVehicleById,
  updateVehicle,
  updateVehicleSection,
  reorderVehicle,
  normalizeVehicleOrders,
  deleteVehicle,
};