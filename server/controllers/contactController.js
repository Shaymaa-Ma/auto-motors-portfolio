
const db = require("../config/db");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

/*
|--------------------------------------------------------------------------
| CONTACT FIELDS
|--------------------------------------------------------------------------
| These are the only fields that can be updated through the Contact API.
*/

const CONTACT_FIELDS = [
  "title_fr",
  "title_en",

  "subtitle_fr",
  "subtitle_en",

  "intro_title_fr",
  "intro_title_en",

  "intro_description_fr",
  "intro_description_en",

  "call_button_fr",
  "call_button_en",

  "info_title_fr",
  "info_title_en",

  "info_description_fr",
  "info_description_en",

  "phone_label_fr",
  "phone_label_en",

  "email_label_fr",
  "email_label_en",

  "address_label_fr",
  "address_label_en",

  "delivery_available",

  "delivery_title_fr",
  "delivery_title_en",

  "delivery_description_fr",
  "delivery_description_en",

  "follow_title_fr",
  "follow_title_en",
];

/*
|--------------------------------------------------------------------------
| CONTACT SELECT
|--------------------------------------------------------------------------
*/

const CONTACT_SELECT = `
  SELECT
    id,

    title_fr,
    title_en,

    subtitle_fr,
    subtitle_en,

    intro_title_fr,
    intro_title_en,

    intro_description_fr,
    intro_description_en,

    call_button_fr,
    call_button_en,

    info_title_fr,
    info_title_en,

    info_description_fr,
    info_description_en,

    phone_label_fr,
    phone_label_en,

    email_label_fr,
    email_label_en,

    address_label_fr,
    address_label_en,

    delivery_available,

    delivery_title_fr,
    delivery_title_en,

    delivery_description_fr,
    delivery_description_en,

    follow_title_fr,
    follow_title_en,

    created_at,
    updated_at

  FROM contact
`;

/*
|--------------------------------------------------------------------------
| GET CONTACT
|--------------------------------------------------------------------------
| GET /api/contact
| Public
*/

const getContact = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
        ${CONTACT_SELECT}
        ORDER BY id ASC
        LIMIT 1
      `
    );

    if (rows.length === 0) {
      return sendError(
        res,
        "Contact information not found.",
        404
      );
    }

    return sendSuccess(
      res,
      rows[0],
      "Contact information retrieved successfully."
    );

  } catch (error) {
    console.error(
      "Get contact error:",
      error
    );

    return sendError(
      res,
      "Failed to retrieve contact information."
    );
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE CONTACT
|--------------------------------------------------------------------------
| PUT /api/contact
| Protected
*/

const updateContact = async (req, res) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | GET SINGLE CONTACT RECORD
    |--------------------------------------------------------------------------
    */

    const [existingRows] = await db.query(
      `
        SELECT id
        FROM contact
        ORDER BY id ASC
        LIMIT 1
      `
    );

    if (existingRows.length === 0) {
      return sendError(
        res,
        "Contact information not found.",
        404
      );
    }

    const contactId =
      existingRows[0].id;

    /*
    |--------------------------------------------------------------------------
    | BUILD DYNAMIC UPDATE
    |--------------------------------------------------------------------------
    */

    const updates = [];
    const values = [];

    CONTACT_FIELDS.forEach((field) => {
      if (
        req.body[field] !== undefined &&
        req.body[field] !== null
      ) {
        let value =
          req.body[field];

        /*
        |--------------------------------------------------------------------------
        | DELIVERY AVAILABILITY
        |--------------------------------------------------------------------------
        */

        if (
          field ===
          "delivery_available"
        ) {
          value =
            Number(value) === 1 ||
            value === true ||
            value === "1"
              ? 1
              : 0;
        } else {
          value =
            String(value).trim();
        }

        updates.push(
          `\`${field}\` = ?`
        );

        values.push(value);
      }
    });

    /*
    |--------------------------------------------------------------------------
    | NO FIELDS
    |--------------------------------------------------------------------------
    */

    if (updates.length === 0) {
      return sendError(
        res,
        "No contact fields were provided.",
        400
      );
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    values.push(contactId);

    await db.query(
      `
        UPDATE contact
        SET ${updates.join(", ")}
        WHERE id = ?
      `,
      values
    );

    /*
    |--------------------------------------------------------------------------
    | RETURN UPDATED RECORD
    |--------------------------------------------------------------------------
    */

    const [rows] = await db.query(
      `
        ${CONTACT_SELECT}
        WHERE id = ?
        LIMIT 1
      `,
      [contactId]
    );

    return sendSuccess(
      res,
      rows[0],
      "Contact information updated successfully."
    );

  } catch (error) {
    console.error(
      "Update contact error:",
      error
    );

    return sendError(
      res,
      "Failed to update contact information."
    );
  }
};

module.exports = {
  getContact,
  updateContact,
};
