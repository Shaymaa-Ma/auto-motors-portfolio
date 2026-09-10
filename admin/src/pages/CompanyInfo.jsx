import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  companyApi,
} from "../api/endpoints";

import ImageUploader from "../components/ImageUploader";

const initialForm = {
  company_name: "",
  tagline_fr: "",
  tagline_en: "",
  about_fr: "",
  about_en: "",
  mission_fr: "",
  mission_en: "",
  address_fr: "",
  address_en: "",
  email: "",
  phone_1: "",
  phone_2: "",
  phone_3: "",
  logo: null,
};

const CompanyInfo = () => {
  const [
    form,
    setForm,
  ] = useState(
    initialForm
  );

  const [
    currentLogo,
    setCurrentLogo,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    formError,
    setFormError,
  ] = useState("");

  // Load company information
  const loadCompany =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await companyApi.get();

          const company =
            response?.data ??
            response ??
            null;

          if (!company) {
            setError(
              "Company information could not be found."
            );

            return;
          }

          setForm({
            company_name:
              company.company_name ??
              "",

            tagline_fr:
              company.tagline_fr ??
              "",

            tagline_en:
              company.tagline_en ??
              "",

            about_fr:
              company.about_fr ??
              "",

            about_en:
              company.about_en ??
              "",

            mission_fr:
              company.mission_fr ??
              "",

            mission_en:
              company.mission_en ??
              "",

            address_fr:
              company.address_fr ??
              "",

            address_en:
              company.address_en ??
              "",

            email:
              company.email ??
              "",

            phone_1:
              company.phone_1 ??
              "",

            phone_2:
              company.phone_2 ??
              "",

            phone_3:
              company.phone_3 ??
              "",

            logo: null,
          });

          setCurrentLogo(
            company.logo ??
              ""
          );
        } catch (err) {
          console.error(
            "Load company information error:",
            err
          );

          setError(
            err?.response?.data?.message ||
              "Failed to load company information."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  // Load company information when the page opens
  useEffect(() => {
    loadCompany();
  }, [
    loadCompany,
  ]);

  // Update form field
  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );

    setFormError("");
    setSuccess("");
  };

  // Handle logo selection
  const handleLogoChange =
    (file) => {
      setForm(
        (current) => ({
          ...current,
          logo: file,
        })
      );

      setFormError("");
      setSuccess("");
    };

  // Save company information
  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      setFormError("");
      setError("");
      setSuccess("");

      // Validate company name
      if (
        !form.company_name.trim()
      ) {
        setFormError(
          "Company name is required."
        );

        return;
      }

      try {
        setSaving(true);

        const formData =
          new FormData();

        formData.append(
          "company_name",
          form.company_name.trim()
        );

        formData.append(
          "tagline_fr",
          form.tagline_fr.trim()
        );

        formData.append(
          "tagline_en",
          form.tagline_en.trim()
        );

        formData.append(
          "about_fr",
          form.about_fr.trim()
        );

        formData.append(
          "about_en",
          form.about_en.trim()
        );

        formData.append(
          "mission_fr",
          form.mission_fr.trim()
        );

        formData.append(
          "mission_en",
          form.mission_en.trim()
        );

        formData.append(
          "address_fr",
          form.address_fr.trim()
        );

        formData.append(
          "address_en",
          form.address_en.trim()
        );

        formData.append(
          "email",
          form.email.trim()
        );

        formData.append(
          "phone_1",
          form.phone_1.trim()
        );

        formData.append(
          "phone_2",
          form.phone_2.trim()
        );

        formData.append(
          "phone_3",
          form.phone_3.trim()
        );

        // Upload a new logo only when selected
        if (form.logo) {
          formData.append(
            "logo",
            form.logo
          );
        }

        const response =
          await companyApi.update(
            formData
          );

        const updatedCompany =
          response?.data ??
          response ??
          null;

        if (updatedCompany) {
          setCurrentLogo(
            updatedCompany.logo ??
              currentLogo
          );

          setForm(
            (current) => ({
              ...current,
              logo: null,
            })
          );
        }

        setSuccess(
          "Company information updated successfully."
        );
      } catch (err) {
        console.error(
          "Save company information error:",
          err
        );

        setFormError(
          err?.response?.data?.message ||
            "Failed to update company information."
        );
      } finally {
        setSaving(false);
      }
    };

  // Show loading state
  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-loading">
          <div className="admin-loading-spinner" />

          <span>
            Loading company
            information...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page header */}
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">
            Settings
          </span>

          <h1>
            Company Info
          </h1>

          <p>
            Manage the company
            information displayed
            across your website.
          </p>
        </div>
      </div>

      {/* Success message */}
      {success && (
        <div className="admin-alert admin-alert-success">
          <i className="bi bi-check-circle" />

          <span>
            {success}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="admin-alert admin-alert-error">
          <i className="bi bi-exclamation-circle" />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      {/* Company form */}
      <form
        className="admin-company-form"
        onSubmit={
          handleSubmit
        }
      >
        {formError && (
          <div className="admin-form-error-box">
            <i className="bi bi-exclamation-circle" />

            <span>
              {formError}
            </span>
          </div>
        )}

        {/* Company identity */}
        <div className="admin-company-section">
          <div className="admin-company-section-header">
            <div>
              <span className="admin-company-section-number">
                01
              </span>

              <div>
                <h2>
                  Company Identity
                </h2>

                <p>
                  Manage the company
                  name, logo and
                  taglines.
                </p>
              </div>
            </div>
          </div>

          <div className="admin-company-logo">
            <ImageUploader
              currentImage={
                currentLogo
              }
              selectedImage={
                form.logo
              }
              onChange={
                handleLogoChange
              }
              label="Company Logo"
            />
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group admin-form-group-full">
              <label htmlFor="company_name">
                Company Name
                <span className="required">
                  *
                </span>
              </label>

              <input
                id="company_name"
                name="company_name"
                type="text"
                value={
                  form.company_name
                }
                onChange={
                  handleChange
                }
                placeholder="AUTO MOTORS SARL"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="tagline_fr">
                Tagline (French)
              </label>

              <input
                id="tagline_fr"
                name="tagline_fr"
                type="text"
                value={
                  form.tagline_fr
                }
                onChange={
                  handleChange
                }
                placeholder="Votre partenaire automobile"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="tagline_en">
                Tagline (English)
              </label>

              <input
                id="tagline_en"
                name="tagline_en"
                type="text"
                value={
                  form.tagline_en
                }
                onChange={
                  handleChange
                }
                placeholder="Your Automotive Partner"
              />
            </div>
          </div>
        </div>

        {/* About information */}
        <div className="admin-company-section">
          <div className="admin-company-section-header">
            <div>
              <span className="admin-company-section-number">
                02
              </span>

              <div>
                <h2>
                  About Company
                </h2>

                <p>
                  Describe the company
                  in both languages.
                </p>
              </div>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="about_fr">
                About (French)
              </label>

              <textarea
                id="about_fr"
                name="about_fr"
                value={
                  form.about_fr
                }
                onChange={
                  handleChange
                }
                rows="6"
                placeholder="Présentez votre entreprise..."
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="about_en">
                About (English)
              </label>

              <textarea
                id="about_en"
                name="about_en"
                value={
                  form.about_en
                }
                onChange={
                  handleChange
                }
                rows="6"
                placeholder="Describe your company..."
              />
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="admin-company-section">
          <div className="admin-company-section-header">
            <div>
              <span className="admin-company-section-number">
                03
              </span>

              <div>
                <h2>
                  Mission
                </h2>

                <p>
                  Manage the company
                  mission in both
                  languages.
                </p>
              </div>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="mission_fr">
                Mission (French)
              </label>

              <textarea
                id="mission_fr"
                name="mission_fr"
                value={
                  form.mission_fr
                }
                onChange={
                  handleChange
                }
                rows="5"
                placeholder="Notre mission..."
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="mission_en">
                Mission (English)
              </label>

              <textarea
                id="mission_en"
                name="mission_en"
                value={
                  form.mission_en
                }
                onChange={
                  handleChange
                }
                rows="5"
                placeholder="Our mission..."
              />
            </div>
          </div>
        </div>

        {/* Contact information */}
        <div className="admin-company-section">
          <div className="admin-company-section-header">
            <div>
              <span className="admin-company-section-number">
                04
              </span>

              <div>
                <h2>
                  Contact Information
                </h2>

                <p>
                  Manage the contact
                  details displayed
                  throughout the
                  website.
                </p>
              </div>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="address_fr">
                Address (French)
              </label>

              <textarea
                id="address_fr"
                name="address_fr"
                value={
                  form.address_fr
                }
                onChange={
                  handleChange
                }
                rows="3"
                placeholder="Adresse de l'entreprise..."
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="address_en">
                Address (English)
              </label>

              <textarea
                id="address_en"
                name="address_en"
                value={
                  form.address_en
                }
                onChange={
                  handleChange
                }
                rows="3"
                placeholder="Company address..."
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={
                  form.email
                }
                onChange={
                  handleChange
                }
                placeholder="info@example.com"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="phone_1">
                Phone 1
              </label>

              <input
                id="phone_1"
                name="phone_1"
                type="tel"
                value={
                  form.phone_1
                }
                onChange={
                  handleChange
                }
                placeholder="+225 XX XX XX XX XX"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="phone_2">
                Phone 2
              </label>

              <input
                id="phone_2"
                name="phone_2"
                type="tel"
                value={
                  form.phone_2
                }
                onChange={
                  handleChange
                }
                placeholder="+225 XX XX XX XX XX"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="phone_3">
                Phone 3
              </label>

              <input
                id="phone_3"
                name="phone_3"
                type="tel"
                value={
                  form.phone_3
                }
                onChange={
                  handleChange
                }
                placeholder="+225 XX XX XX XX XX"
              />
            </div>
          </div>
        </div>

        {/* Save changes */}
        <div className="admin-company-form-footer">
          <div>
            <i className="bi bi-info-circle" />

            <span>
              Changes are applied
              to the public website
              after saving.
            </span>
          </div>

          <button
            type="submit"
            className="admin-primary-button"
            disabled={saving}
          >
            <i
              className={
                saving
                  ? "bi bi-arrow-repeat admin-spin"
                  : "bi bi-check-lg"
              }
            />

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyInfo;