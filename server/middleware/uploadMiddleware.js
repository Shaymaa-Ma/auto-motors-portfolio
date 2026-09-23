
// Reusable image upload setup that validates image types, 
// limits files to 1 MB, and safely stores unique filenames 
// in the selected folder.


const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Reusable image upload setup.
// Each section can choose its own upload folder and filename prefix.
const createImageUpload = (
  folder,
  prefix = folder
) => {

  // Store uploaded images inside the selected folder.
  const uploadDirectory = path.join(
    __dirname,
    "../uploads",
    folder
  );

  // Create the folder automatically if it does not exist yet.
  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(
      uploadDirectory,
      {
        recursive: true,
      }
    );
  }

  // Tell Multer where to save the uploaded image
  // and how the filename should be generated.
  const storage =
    multer.diskStorage({
      destination: (
        req,
        file,
        cb
      ) => {
        cb(
          null,
          uploadDirectory
        );
      },

      // Keep the original filename readable,
      // but clean it and avoid replacing an existing file.
      filename: (
        req,
        file,
        cb
      ) => {
        const originalName =
          path.basename(
            file.originalname,
            path.extname(
              file.originalname
            )
          );

        const extension =
          path.extname(
            file.originalname
          ).toLowerCase();

        // Remove spaces and special characters
        // so the filename is safe to use on the server.
        const cleanName =
          originalName
            .trim()
            .replace(
              /\s+/g,
              "-"
            )
            .replace(
              /[^a-zA-Z0-9-_]/g,
              ""
            )
            .toLowerCase();

        // Use the section prefix if the original
        // filename does not contain a usable name.
        const baseName =
          cleanName ||
          prefix;

        let filename =
          `${baseName}${extension}`;

        let counter = 1;

        // If the same filename already exists,
        // add a number instead of overwriting it.
        while (
          fs.existsSync(
            path.join(
              uploadDirectory,
              filename
            )
          )
        ) {
          filename =
            `${baseName}-${counter}${extension}`;

          counter++;
        }

        cb(
          null,
          filename
        );
      },
    });

  // Only allow the image formats used by the website.
  const imageFilter = (
    req,
    file,
    cb
  ) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      allowedTypes.includes(
        file.mimetype
      )
    ) {
      cb(
        null,
        true
      );
    } else {
      cb(
        new Error(
          "Only JPG, JPEG, PNG and WEBP images are allowed."
        ),
        false
      );
    }
  };

  // Apply the final upload rules.
  // Images larger than 1 MB are rejected by the backend.
  return multer({
    storage,
    fileFilter:
      imageFilter,
    limits: {
      fileSize: 1 * 1024 * 1024, // Maximum 1 MB
    },
  });
};

module.exports = {
  createImageUpload,
};