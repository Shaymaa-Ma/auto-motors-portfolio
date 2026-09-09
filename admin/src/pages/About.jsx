import { useEffect, useState } from "react";
import { aboutApi } from "../api/endpoints";
import ImageUploader from "../components/ImageUploader";

const About = () => {
  const [about, setAbout] =
    useState(null);

  const [formData, setFormData] =
    useState({
      title_fr: "",
      title_en: "",
      subtitle_fr: "",
      subtitle_en: "",
      description_fr: "",
      description_en: "",
      mission_title_fr: "",
      mission_title_en: "",
      mission_fr: "",
      mission_en: "",
      primary_button_fr: "",
      primary_button_en: "",
      primary_button_link: "",
      secondary_button_fr: "",
      secondary_button_en: "",
      secondary_button_link: "",
    });

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  // Load About information
  useEffect(() => {
    loadAbout();
  }, []);

  const loadAbout =
    async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response =
          await aboutApi.get();

        const aboutData =
          response?.data;

        if (!aboutData) {
          throw new Error(
            "About content could not be loaded."
          );
        }

        setAbout(
          aboutData
        );

        setFormData({
          title_fr:
            aboutData.title_fr ||
            "",

          title_en:
            aboutData.title_en ||
            "",

          subtitle_fr:
            aboutData.subtitle_fr ||
            "",

          subtitle_en:
            aboutData.subtitle_en ||
            "",

          description_fr:
            aboutData.description_fr ||
            "",

          description_en:
            aboutData.description_en ||
            "",

          mission_title_fr:
            aboutData.mission_title_fr ||
            "",

          mission_title_en:
            aboutData.mission_title_en ||
            "",

          mission_fr:
            aboutData.mission_fr ||
            "",

          mission_en:
            aboutData.mission_en ||
            "",

          primary_button_fr:
            aboutData.primary_button_fr ||
            "",

          primary_button_en:
            aboutData.primary_button_en ||
            "",

          primary_button_link:
            aboutData.primary_button_link ||
            "",

          secondary_button_fr:
            aboutData.secondary_button_fr ||
            "",

          secondary_button_en:
            aboutData.secondary_button_en ||
            "",

          secondary_button_link:
            aboutData.secondary_button_link ||
            "",
        });
      } catch (error) {
        console.error(
          "Load About error:",
          error
        );

        setErrorMessage(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Failed to load About content."
        );
      } finally {
        setLoading(false);
      }
    };

  // Handle text field changes
  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );

    setSuccessMessage("");
    setErrorMessage("");
  };

  // Handle image selection
  const handleImageChange = (
    file
  ) => {
    setSelectedImage(file);

    setSuccessMessage("");
    setErrorMessage("");
  };

  // Save About information
  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setSuccessMessage("");
      setErrorMessage("");

      const data =
        new FormData();

      Object.entries(
        formData
      ).forEach(
        ([key, value]) => {
          data.append(
            key,
            value
          );
        }
      );

      if (selectedImage) {
        data.append(
          "image",
          selectedImage
        );
      }

      const response =
        await aboutApi.update(
          data
        );

      const updatedAbout =
        response?.data;

      if (updatedAbout) {
        setAbout(
          updatedAbout
        );

        setFormData({
          title_fr:
            updatedAbout.title_fr ||
            "",

          title_en:
            updatedAbout.title_en ||
            "",

          subtitle_fr:
            updatedAbout.subtitle_fr ||
            "",

          subtitle_en:
            updatedAbout.subtitle_en ||
            "",

          description_fr:
            updatedAbout.description_fr ||
            "",

          description_en:
            updatedAbout.description_en ||
            "",

          mission_title_fr:
            updatedAbout.mission_title_fr ||
            "",

          mission_title_en:
            updatedAbout.mission_title_en ||
            "",

          mission_fr:
            updatedAbout.mission_fr ||
            "",

          mission_en:
            updatedAbout.mission_en ||
            "",

          primary_button_fr:
            updatedAbout.primary_button_fr ||
            "",

          primary_button_en:
            updatedAbout.primary_button_en ||
            "",

          primary_button_link:
            updatedAbout.primary_button_link ||
            "",

          secondary_button_fr:
            updatedAbout.secondary_button_fr ||
            "",

          secondary_button_en:
            updatedAbout.secondary_button_en ||
            "",

          secondary_button_link:
            updatedAbout.secondary_button_link ||
            "",
        });
      }

      setSelectedImage(null);

      setSuccessMessage(
        "About content updated successfully."
      );
    } catch (error) {
      console.error(
        "Update About error:",
        error
      );

      setErrorMessage(
        error?.response?.data
          ?.message ||
          "Failed to update About content."
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
            Loading About content...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page about-page">

      {/* Page header */}
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">
            WEBSITE
          </span>

          <h1>
            About Section
          </h1>

          <p>
            Manage the About section
            displayed on your website.
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
        className="about-form"
        onSubmit={
          handleSubmit
        }
      >

        {/* About image */}
        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2>
                About Image
              </h2>

              <p>
                Manage the image displayed
                in the About section.
              </p>
            </div>
          </div>

          <ImageUploader
            currentImage={
              about?.image
            }
            selectedImage={
              selectedImage
            }
            onChange={
              handleImageChange
            }
            label="About Image"
          />
        </section>

        {/* French content */}
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
                  Content displayed when
                  French is selected.
                </p>
              </div>
            </div>
          </div>

          <div className="hero-form-grid">

            <div className="admin-form-group">
              <label htmlFor="about-title-fr">
                Title
              </label>

              <input
                id="about-title-fr"
                type="text"
                name="title_fr"
                value={
                  formData.title_fr
                }
                onChange={
                  handleChange
                }
                placeholder="Enter French title"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="about-subtitle-fr">
                Subtitle
              </label>

              <input
                id="about-subtitle-fr"
                type="text"
                name="subtitle_fr"
                value={
                  formData.subtitle_fr
                }
                onChange={
                  handleChange
                }
                placeholder="Enter French subtitle"
              />
            </div>

            <div className="admin-form-group hero-form-full">
              <label htmlFor="about-description-fr">
                Description
              </label>

              <textarea
                id="about-description-fr"
                name="description_fr"
                value={
                  formData.description_fr
                }
                onChange={
                  handleChange
                }
                placeholder="Enter French description"
                rows="5"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="mission-title-fr">
                Mission Title
              </label>

              <input
                id="mission-title-fr"
                type="text"
                name="mission_title_fr"
                value={
                  formData.mission_title_fr
                }
                onChange={
                  handleChange
                }
                placeholder="Enter French mission title"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="mission-fr">
                Mission
              </label>

              <textarea
                id="mission-fr"
                name="mission_fr"
                value={
                  formData.mission_fr
                }
                onChange={
                  handleChange
                }
                placeholder="Enter French mission"
                rows="4"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="primary-button-fr">
                Primary Button
              </label>

              <input
                id="primary-button-fr"
                type="text"
                name="primary_button_fr"
                value={
                  formData.primary_button_fr
                }
                onChange={
                  handleChange
                }
                placeholder="Enter primary button text"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="primary-button-link">
                Primary Button Link
              </label>

              <input
                id="primary-button-link"
                type="text"
                name="primary_button_link"
                value={
                  formData.primary_button_link
                }
                onChange={
                  handleChange
                }
                placeholder="Example: #products"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="secondary-button-fr">
                Secondary Button
              </label>

              <input
                id="secondary-button-fr"
                type="text"
                name="secondary_button_fr"
                value={
                  formData.secondary_button_fr
                }
                onChange={
                  handleChange
                }
                placeholder="Enter secondary button text"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="secondary-button-link">
                Secondary Button Link
              </label>

              <input
                id="secondary-button-link"
                type="text"
                name="secondary_button_link"
                value={
                  formData.secondary_button_link
                }
                onChange={
                  handleChange
                }
                placeholder="Example: #contact"
              />
            </div>

          </div>
        </section>

        {/* English content */}
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
                  Content displayed when
                  English is selected.
                </p>
              </div>
            </div>
          </div>

          <div className="hero-form-grid">

            <div className="admin-form-group">
              <label htmlFor="about-title-en">
                Title
              </label>

              <input
                id="about-title-en"
                type="text"
                name="title_en"
                value={
                  formData.title_en
                }
                onChange={
                  handleChange
                }
                placeholder="Enter English title"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="about-subtitle-en">
                Subtitle
              </label>

              <input
                id="about-subtitle-en"
                type="text"
                name="subtitle_en"
                value={
                  formData.subtitle_en
                }
                onChange={
                  handleChange
                }
                placeholder="Enter English subtitle"
              />
            </div>

            <div className="admin-form-group hero-form-full">
              <label htmlFor="about-description-en">
                Description
              </label>

              <textarea
                id="about-description-en"
                name="description_en"
                value={
                  formData.description_en
                }
                onChange={
                  handleChange
                }
                placeholder="Enter English description"
                rows="5"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="mission-title-en">
                Mission Title
              </label>

              <input
                id="mission-title-en"
                type="text"
                name="mission_title_en"
                value={
                  formData.mission_title_en
                }
                onChange={
                  handleChange
                }
                placeholder="Enter English mission title"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="mission-en">
                Mission
              </label>

              <textarea
                id="mission-en"
                name="mission_en"
                value={
                  formData.mission_en
                }
                onChange={
                  handleChange
                }
                placeholder="Enter English mission"
                rows="4"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="primary-button-en">
                Primary Button
              </label>

              <input
                id="primary-button-en"
                type="text"
                name="primary_button_en"
                value={
                  formData.primary_button_en
                }
                onChange={
                  handleChange
                }
                placeholder="Enter primary button text"
              />
            </div>

            <div className="admin-form-group">
              <label>
                Primary Button Link
              </label>

              <div className="admin-readonly-link">
                <span>
                  Shared with French
                </span>

                <strong>
                  {
                    formData.primary_button_link ||
                    "No link"
                  }
                </strong>
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="secondary-button-en">
                Secondary Button
              </label>

              <input
                id="secondary-button-en"
                type="text"
                name="secondary_button_en"
                value={
                  formData.secondary_button_en
                }
                onChange={
                  handleChange
                }
                placeholder="Enter secondary button text"
              />
            </div>

            <div className="admin-form-group">
              <label>
                Secondary Button Link
              </label>

              <div className="admin-readonly-link">
                <span>
                  Shared with French
                </span>

                <strong>
                  {
                    formData.secondary_button_link ||
                    "No link"
                  }
                </strong>
              </div>
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

export default About;