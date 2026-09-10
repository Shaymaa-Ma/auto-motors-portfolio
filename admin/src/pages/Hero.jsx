import { useEffect, useState } from "react";
import { heroApi } from "../api/endpoints";
import ImageUploader from "../components/ImageUploader";

const Hero = () => {
  const [hero, setHero] = useState(null);

  const [formData, setFormData] = useState({
    title_fr: "",
    title_en: "",
    subtitle_fr: "",
    subtitle_en: "",
    description_fr: "",
    description_en: "",
    primary_button_fr: "",
    primary_button_en: "",
    secondary_button_fr: "",
    secondary_button_en: "",
  });

  // Separate image states
  const [selectedDesktopImage, setSelectedDesktopImage] =
    useState(null);

  const [selectedMobileImage, setSelectedMobileImage] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  // Load Hero information
  useEffect(() => {
    loadHero();
  }, []);

  const loadHero = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await heroApi.get();

      const heroData = response?.data;

      if (!heroData) {
        throw new Error(
          "Hero information could not be loaded."
        );
      }

      setHero(heroData);

      setFormData({
        title_fr: heroData.title_fr || "",
        title_en: heroData.title_en || "",

        subtitle_fr: heroData.subtitle_fr || "",
        subtitle_en: heroData.subtitle_en || "",

        description_fr:
          heroData.description_fr || "",

        description_en:
          heroData.description_en || "",

        primary_button_fr:
          heroData.primary_button_fr || "",

        primary_button_en:
          heroData.primary_button_en || "",

        secondary_button_fr:
          heroData.secondary_button_fr || "",

        secondary_button_en:
          heroData.secondary_button_en || "",
      });

      setSelectedDesktopImage(null);
      setSelectedMobileImage(null);
    } catch (error) {
      console.error("Load Hero error:", error);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load Hero information."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle text field changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  };

  // Handle desktop image selection
  const handleDesktopImageChange = (file) => {
    setSelectedDesktopImage(file);

    setSuccessMessage("");
    setErrorMessage("");
  };

  // Handle mobile image selection
  const handleMobileImageChange = (file) => {
    setSelectedMobileImage(file);

    setSuccessMessage("");
    setErrorMessage("");
  };

  // Save Hero information
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setSuccessMessage("");
      setErrorMessage("");

      const data = new FormData();

      // Append text fields
      Object.entries(formData).forEach(
        ([key, value]) => {
          data.append(key, value);
        }
      );

      // Desktop image
      if (selectedDesktopImage) {
        data.append(
          "background_image_desktop",
          selectedDesktopImage
        );
      }

      // Mobile image
      if (selectedMobileImage) {
        data.append(
          "background_image_mobile",
          selectedMobileImage
        );
      }

      const response =
        await heroApi.update(data);

      const updatedHero =
        response?.data;

      if (updatedHero) {
        setHero(updatedHero);

        setFormData({
          title_fr:
            updatedHero.title_fr || "",

          title_en:
            updatedHero.title_en || "",

          subtitle_fr:
            updatedHero.subtitle_fr || "",

          subtitle_en:
            updatedHero.subtitle_en || "",

          description_fr:
            updatedHero.description_fr || "",

          description_en:
            updatedHero.description_en || "",

          primary_button_fr:
            updatedHero.primary_button_fr || "",

          primary_button_en:
            updatedHero.primary_button_en || "",

          secondary_button_fr:
            updatedHero.secondary_button_fr || "",

          secondary_button_en:
            updatedHero.secondary_button_en || "",
        });
      }

      // Clear selected images after successful save
      setSelectedDesktopImage(null);
      setSelectedMobileImage(null);

      setSuccessMessage(
        "Hero information updated successfully."
      );
    } catch (error) {
      console.error(
        "Update Hero error:",
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to update Hero information."
      );
    } finally {
      setSaving(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner"></div>

          <p>
            Loading Hero information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page hero-page">

      {/* Page header */}
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">
            WEBSITE
          </span>

          <h1>
            Hero Section
          </h1>

          <p>
            Manage the main content and responsive
            background images displayed on your
            homepage Hero section.
          </p>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="admin-alert admin-alert-success">
          <span className="admin-alert-icon">
            ✓
          </span>

          <span>
            {successMessage}
          </span>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="admin-alert admin-alert-error">
          <span className="admin-alert-icon">
            !
          </span>

          <span>
            {errorMessage}
          </span>
        </div>
      )}

      <form
        className="hero-form"
        onSubmit={handleSubmit}
      >

        {/* ============================================================
            HERO BACKGROUND IMAGES
            ============================================================ */}
        <section className="admin-card hero-image-card">

          <div className="admin-card-header">
            <div>
              <h2>
                Hero Background Images
              </h2>

              <p>
                Upload separate images for desktop
                and mobile screens.
              </p>
            </div>
          </div>

          {/* Image size notes */}
          <div className="hero-image-notes">

            <div className="hero-image-note">
              <div className="hero-image-note-icon">
                DESKTOP
              </div>

              <div className="hero-image-note-content">
                <strong>
                  Recommended size: 1365 × 768 px
                </strong>

                <span>
                  Aspect ratio: 16:9 ·
                  Orientation: Landscape
                </span>

                <small>
                  Use this size when uploading or
                  replacing the desktop Hero image.
                </small>
              </div>
            </div>

            <div className="hero-image-note">
              <div className="hero-image-note-icon">
                MOBILE
              </div>

              <div className="hero-image-note-content">
                <strong>
                  Recommended size: 884 × 1779 px
                </strong>

                <span>
                  Aspect ratio: approximately 1:2.01 ·
                  Orientation: Portrait / Mobile
                </span>

                <small>
                  Use this size when uploading or
                  replacing the mobile Hero image.
                </small>
              </div>
            </div>

          </div>

          {/* Image uploaders */}
          <div className="hero-images-grid">

            {/* Desktop */}
            <div className="hero-image-upload-item">

              <div className="hero-image-upload-heading">
                <h3>
                  Desktop Hero Image
                </h3>

                <p>
                  Displayed on desktop and larger
                  screens.
                </p>
              </div>

              <ImageUploader
                currentImage={
                  hero?.background_image_desktop
                }
                selectedImage={
                  selectedDesktopImage
                }
                onChange={
                  handleDesktopImageChange
                }
                label="Desktop Background"
              />

            </div>

            {/* Mobile */}
            <div className="hero-image-upload-item">

              <div className="hero-image-upload-heading">
                <h3>
                  Mobile Hero Image
                </h3>

                <p>
                  Displayed on phones and small
                  screens.
                </p>
              </div>

              <ImageUploader
                currentImage={
                  hero?.background_image_mobile
                }
                selectedImage={
                  selectedMobileImage
                }
                onChange={
                  handleMobileImageChange
                }
                label="Mobile Background"
              />

            </div>

          </div>
        </section>

        {/* ============================================================
            FRENCH CONTENT
            ============================================================ */}
        <section className="admin-card">

          <div className="admin-card-header">
            <div>
              <span className="admin-language-label">
                FR
              </span>

              <div>
                <h2>
                  French Content
                </h2>

                <p>
                  Content displayed when French is
                  selected.
                </p>
              </div>
            </div>
          </div>

          <div className="hero-form-grid">

            <div className="admin-form-group">
              <label htmlFor="title_fr">
                Title
              </label>

              <input
                id="title_fr"
                type="text"
                name="title_fr"
                value={formData.title_fr}
                onChange={handleChange}
                placeholder="Enter French title"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="subtitle_fr">
                Subtitle
              </label>

              <input
                id="subtitle_fr"
                type="text"
                name="subtitle_fr"
                value={formData.subtitle_fr}
                onChange={handleChange}
                placeholder="Enter French subtitle"
              />
            </div>

            <div className="admin-form-group hero-form-full">
              <label htmlFor="description_fr">
                Description
              </label>

              <textarea
                id="description_fr"
                name="description_fr"
                value={
                  formData.description_fr
                }
                onChange={handleChange}
                placeholder="Enter French description"
                rows="5"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="primary_button_fr">
                Primary Button
              </label>

              <input
                id="primary_button_fr"
                type="text"
                name="primary_button_fr"
                value={
                  formData.primary_button_fr
                }
                onChange={handleChange}
                placeholder="Enter primary button text"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="secondary_button_fr">
                Secondary Button
              </label>

              <input
                id="secondary_button_fr"
                type="text"
                name="secondary_button_fr"
                value={
                  formData.secondary_button_fr
                }
                onChange={handleChange}
                placeholder="Enter secondary button text"
              />
            </div>

          </div>
        </section>

        {/* ============================================================
            ENGLISH CONTENT
            ============================================================ */}
        <section className="admin-card">

          <div className="admin-card-header">
            <div>
              <span className="admin-language-label">
                EN
              </span>

              <div>
                <h2>
                  English Content
                </h2>

                <p>
                  Content displayed when English is
                  selected.
                </p>
              </div>
            </div>
          </div>

          <div className="hero-form-grid">

            <div className="admin-form-group">
              <label htmlFor="title_en">
                Title
              </label>

              <input
                id="title_en"
                type="text"
                name="title_en"
                value={formData.title_en}
                onChange={handleChange}
                placeholder="Enter English title"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="subtitle_en">
                Subtitle
              </label>

              <input
                id="subtitle_en"
                type="text"
                name="subtitle_en"
                value={formData.subtitle_en}
                onChange={handleChange}
                placeholder="Enter English subtitle"
              />
            </div>

            <div className="admin-form-group hero-form-full">
              <label htmlFor="description_en">
                Description
              </label>

              <textarea
                id="description_en"
                name="description_en"
                value={
                  formData.description_en
                }
                onChange={handleChange}
                placeholder="Enter English description"
                rows="5"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="primary_button_en">
                Primary Button
              </label>

              <input
                id="primary_button_en"
                type="text"
                name="primary_button_en"
                value={
                  formData.primary_button_en
                }
                onChange={handleChange}
                placeholder="Enter primary button text"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="secondary_button_en">
                Secondary Button
              </label>

              <input
                id="secondary_button_en"
                type="text"
                name="secondary_button_en"
                value={
                  formData.secondary_button_en
                }
                onChange={handleChange}
                placeholder="Enter secondary button text"
              />
            </div>

          </div>
        </section>

        {/* Save button */}
        <div className="hero-form-actions">

          <button
            type="submit"
            className="admin-primary-button"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="button-spinner"></span>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>

        </div>

      </form>
    </div>
  );
};

export default Hero;
