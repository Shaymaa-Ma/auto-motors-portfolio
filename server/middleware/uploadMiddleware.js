const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure reusable image upload
const createImageUpload = (
  folder,
  prefix = folder
) => {
  // Define the upload directory
  const uploadDirectory = path.join(
    __dirname,
    "../uploads",
    folder
  );

  // Create the directory if it does not exist
  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(
      uploadDirectory,
      {
        recursive: true,
      }
    );
  }

  // Configure file storage
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

      // Generate a clean unique filename
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

        // Clean the original filename
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

        // Use the prefix when the filename is empty
        const baseName =
          cleanName ||
          prefix;

        let filename =
          `${baseName}${extension}`;

        let counter = 1;

        // Add a small counter when the filename already exists
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

  // Allow supported image formats
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

  // Configure image upload limits
  return multer({
    storage,
    fileFilter:
      imageFilter,
    limits: {
      fileSize:
        5 * 1024 * 1024,
    },
  });
};

module.exports = {
  createImageUpload,
};