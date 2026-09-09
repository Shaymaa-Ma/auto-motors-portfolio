//Hero, About, Products, Categories, Vehicles, Gallery, Company logo, etc.

import { useEffect, useRef, useState } from "react";

const ImageUploader = ({
  currentImage,
  selectedImage,
  onChange,
  label = "Image",
}) => {
  const inputRef =
    useRef(null);

  const [
    preview,
    setPreview,
  ] = useState(null);

  // Build the current image URL
  const getCurrentImageUrl = () => {
    if (!currentImage) {
      return null;
    }

    if (
      currentImage.startsWith(
        "http://"
      ) ||
      currentImage.startsWith(
        "https://"
      )
    ) {
      return currentImage;
    }

    const uploadsUrl =
      process.env.REACT_APP_UPLOADS_URL ||
      "http://localhost:5000/uploads";

    return `${uploadsUrl}/${currentImage.replace(
      /^[/\\]+/,
      ""
    )}`;
  };

  // Create a preview when a new image is selected
  useEffect(() => {
    if (!selectedImage) {
      setPreview(null);
      return;
    }

    const objectUrl =
      URL.createObjectURL(
        selectedImage
      );

    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(
        objectUrl
      );
    };
  }, [selectedImage]);

  // Open the file selector
  const handleSelectClick = () => {
    inputRef.current?.click();
  };

  // Handle selected image
  const handleFileChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    onChange(file);

    event.target.value = "";
  };

  const imageToDisplay =
    preview ||
    getCurrentImageUrl();

  return (
    <div className="image-uploader">

      {/* Image preview */}
      <div className="image-uploader-preview">
        {imageToDisplay ? (
          <img
            src={imageToDisplay}
            alt={label}
          />
        ) : (
          <div className="image-uploader-empty">
            <span className="image-uploader-empty-icon">
              ↑
            </span>

            <span>
              No image selected
            </span>
          </div>
        )}
      </div>

      {/* Upload information */}
      <div className="image-uploader-content">

        <div className="image-uploader-info">
          <h3>
            {label}
          </h3>

          <p>
            JPG, JPEG, PNG or WEBP
          </p>

          <span>
            Maximum file size: 5 MB
          </span>
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={
            handleSelectClick
          }
        >
          {selectedImage
            ? "Change Image"
            : "Choose Image"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={
            handleFileChange
          }
          hidden
        />

      </div>

      {/* Selected image information */}
      {selectedImage && (
        <div className="image-uploader-selected">
          <span>
            New image selected:
          </span>

          <strong>
            {selectedImage.name}
          </strong>
        </div>
      )}

    </div>
  );
};

export default ImageUploader;