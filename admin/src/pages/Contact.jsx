import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { contactApi } from "../api/endpoints";

const initialForm = {
  title_fr: "",
  title_en: "",

  subtitle_fr: "",
  subtitle_en: "",

  intro_title_fr: "",
  intro_title_en: "",

  intro_description_fr: "",
  intro_description_en: "",

  call_button_fr: "",
  call_button_en: "",

  info_title_fr: "",
  info_title_en: "",

  info_description_fr: "",
  info_description_en: "",

  phone_label_fr: "",
  phone_label_en: "",

  email_label_fr: "",
  email_label_en: "",

  address_label_fr: "",
  address_label_en: "",

  delivery_available: 1,

  delivery_title_fr: "",
  delivery_title_en: "",

  delivery_description_fr: "",
  delivery_description_en: "",

  follow_title_fr: "",
  follow_title_en: "",
};

const Contact = () => {
  const [form, setForm] = useState(
    initialForm
  );

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [formError, setFormError] = useState("");

  // Load contact content
  const loadContact = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await contactApi.get();

        const contact =
          response?.data ??
          response ??
          null;

        if (!contact) {
          throw new Error(
            "Contact content was not found."
          );
        }

        setForm({
          title_fr:
            contact.title_fr ?? "",

          title_en:
            contact.title_en ?? "",

          subtitle_fr:
            contact.subtitle_fr ?? "",

          subtitle_en:
            contact.subtitle_en ?? "",

          intro_title_fr:
            contact.intro_title_fr ?? "",

          intro_title_en:
            contact.intro_title_en ?? "",

          intro_description_fr:
            contact.intro_description_fr ??
            "",

          intro_description_en:
            contact.intro_description_en ??
            "",

          call_button_fr:
            contact.call_button_fr ?? "",

          call_button_en:
            contact.call_button_en ?? "",

          info_title_fr:
            contact.info_title_fr ?? "",

          info_title_en:
            contact.info_title_en ?? "",

          info_description_fr:
            contact.info_description_fr ??
            "",

          info_description_en:
            contact.info_description_en ??
            "",

          phone_label_fr:
            contact.phone_label_fr ?? "",

          phone_label_en:
            contact.phone_label_en ?? "",

          email_label_fr:
            contact.email_label_fr ?? "",

          email_label_en:
            contact.email_label_en ?? "",

          address_label_fr:
            contact.address_label_fr ?? "",

          address_label_en:
            contact.address_label_en ?? "",

          delivery_available:
            Number(
              contact.delivery_available
            ) === 1
              ? 1
              : 0,

          delivery_title_fr:
            contact.delivery_title_fr ?? "",

          delivery_title_en:
            contact.delivery_title_en ?? "",

          delivery_description_fr:
            contact.delivery_description_fr ??
            "",

          delivery_description_en:
            contact.delivery_description_en ??
            "",

          follow_title_fr:
            contact.follow_title_fr ?? "",

          follow_title_en:
            contact.follow_title_en ?? "",
        });
      } catch (err) {
        console.error(
          "Load contact error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load contact content."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load contact when page opens
  useEffect(() => {
    loadContact();
  }, [loadContact]);

  // Handle form changes
  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,

      [name]:
        type === "checkbox"
          ? checked
            ? 1
            : 0
          : value,
    }));

    setFormError("");
    setSuccess("");
  };

  // Save contact content
  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setFormError("");
      setError("");
      setSuccess("");

      if (!form.title_fr.trim()) {
        setFormError(
          "French contact title is required."
        );

        return;
      }

      if (!form.title_en.trim()) {
        setFormError(
          "English contact title is required."
        );

        return;
      }

      try {
        setSaving(true);

        const data = {
          title_fr:
            form.title_fr.trim(),

          title_en:
            form.title_en.trim(),

          subtitle_fr:
            form.subtitle_fr.trim(),

          subtitle_en:
            form.subtitle_en.trim(),

          intro_title_fr:
            form.intro_title_fr.trim(),

          intro_title_en:
            form.intro_title_en.trim(),

          intro_description_fr:
            form.intro_description_fr.trim(),

          intro_description_en:
            form.intro_description_en.trim(),

          call_button_fr:
            form.call_button_fr.trim(),

          call_button_en:
            form.call_button_en.trim(),

          info_title_fr:
            form.info_title_fr.trim(),

          info_title_en:
            form.info_title_en.trim(),

          info_description_fr:
            form.info_description_fr.trim(),

          info_description_en:
            form.info_description_en.trim(),

          phone_label_fr:
            form.phone_label_fr.trim(),

          phone_label_en:
            form.phone_label_en.trim(),

          email_label_fr:
            form.email_label_fr.trim(),

          email_label_en:
            form.email_label_en.trim(),

          address_label_fr:
            form.address_label_fr.trim(),

          address_label_en:
            form.address_label_en.trim(),

          delivery_available:
            Number(
              form.delivery_available
            ) === 1
              ? 1
              : 0,

          delivery_title_fr:
            form.delivery_title_fr.trim(),

          delivery_title_en:
            form.delivery_title_en.trim(),

          delivery_description_fr:
            form.delivery_description_fr.trim(),

          delivery_description_en:
            form.delivery_description_en.trim(),

          follow_title_fr:
            form.follow_title_fr.trim(),

          follow_title_en:
            form.follow_title_en.trim(),
        };

        await contactApi.update(data);

        setSuccess(
          "Contact content updated successfully."
        );

        await loadContact();
      } catch (err) {
        console.error(
          "Save contact error:",
          err
        );

        setFormError(
          err?.response?.data?.message ||
            "Failed to save contact content."
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-loading">
          <div className="admin-loading-spinner" />

          <span>
            Loading contact information...
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
            Content
          </span>

          <h1>
            Contact
          </h1>

          <p>
            Manage the contact section
            content displayed on your
            website.
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

      {/* Form error */}
      {formError && (
        <div className="admin-alert admin-alert-error">
          <i className="bi bi-exclamation-circle" />

          <span>
            {formError}
          </span>

          <button
            type="button"
            onClick={() =>
              setFormError("")
            }
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
      >
        {/* ============================================================
            01 — Contact Header
        ============================================================ */}
        <div className="admin-company-section">
          <div className="admin-company-section-header">
            <div className="admin-company-section-number">
              01
            </div>

            <div>
              <h2>
                Contact Header
              </h2>

              <p>
                Manage the main title and
                subtitle displayed at the
                top of the contact section.
              </p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="title_fr">
                Title (French)
                <span className="required">
                  *
                </span>
              </label>

              <input
                id="title_fr"
                name="title_fr"
                type="text"
                value={form.title_fr}
                onChange={handleChange}
                placeholder="Contactez-nous"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="title_en">
                Title (English)
                <span className="required">
                  *
                </span>
              </label>

              <input
                id="title_en"
                name="title_en"
                type="text"
                value={form.title_en}
                onChange={handleChange}
                placeholder="Contact Us"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="subtitle_fr">
                Subtitle (French)
              </label>

              <textarea
                id="subtitle_fr"
                name="subtitle_fr"
                value={form.subtitle_fr}
                onChange={handleChange}
                rows="3"
                placeholder="Une question ? Notre équipe est à votre écoute."
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="subtitle_en">
                Subtitle (English)
              </label>

              <textarea
                id="subtitle_en"
                name="subtitle_en"
                value={form.subtitle_en}
                onChange={handleChange}
                rows="3"
                placeholder="Have a question? Our team is here to help."
              />
            </div>
          </div>
        </div>

        {/* ============================================================
            02 — Introduction
        ============================================================ */}
        <div className="admin-company-section">
          <div className="admin-company-section-header">
            <div className="admin-company-section-number">
              02
            </div>

            <div>
              <h2>
                Introduction
              </h2>

              <p>
                Manage the introductory
                content shown in the contact
                section.
              </p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="intro_title_fr">
                Introduction Title (French)
              </label>

              <input
                id="intro_title_fr"
                name="intro_title_fr"
                type="text"
                value={
                  form.intro_title_fr
                }
                onChange={handleChange}
                placeholder="Parlons de votre besoin"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="intro_title_en">
                Introduction Title (English)
              </label>

              <input
                id="intro_title_en"
                name="intro_title_en"
                type="text"
                value={
                  form.intro_title_en
                }
                onChange={handleChange}
                placeholder="Let's discuss your needs"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="intro_description_fr">
                Introduction Description (French)
              </label>

              <textarea
                id="intro_description_fr"
                name="intro_description_fr"
                value={
                  form.intro_description_fr
                }
                onChange={handleChange}
                rows="4"
                placeholder="Décrivez votre besoin..."
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="intro_description_en">
                Introduction Description (English)
              </label>

              <textarea
                id="intro_description_en"
                name="intro_description_en"
                value={
                  form.intro_description_en
                }
                onChange={handleChange}
                rows="4"
                placeholder="Tell us about your needs..."
              />
            </div>
          </div>
        </div>

        {/* ============================================================
            03 — Call to Action
        ============================================================ */}
        <div className="admin-company-section">
          <div className="admin-company-section-header">
            <div className="admin-company-section-number">
              03
            </div>

            <div>
              <h2>
                Call to Action
              </h2>

              <p>
                Manage the text displayed on
                the main contact action button.
              </p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="call_button_fr">
                Button Text (French)
              </label>

              <input
                id="call_button_fr"
                name="call_button_fr"
                type="text"
                value={
                  form.call_button_fr
                }
                onChange={handleChange}
                placeholder="Appelez-nous"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="call_button_en">
                Button Text (English)
              </label>

              <input
                id="call_button_en"
                name="call_button_en"
                type="text"
                value={
                  form.call_button_en
                }
                onChange={handleChange}
                placeholder="Call Us"
              />
            </div>
          </div>
        </div>

        {/* ============================================================
            04 — Contact Information
        ============================================================ */}
        <div className="admin-company-section">
          <div className="admin-company-section-header">
            <div className="admin-company-section-number">
              04
            </div>

            <div>
              <h2>
                Contact Information
              </h2>

              <p>
                Manage the headings and labels
                used for the company contact
                information.
              </p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="info_title_fr">
                Information Title (French)
              </label>

              <input
                id="info_title_fr"
                name="info_title_fr"
                type="text"
                value={
                  form.info_title_fr
                }
                onChange={handleChange}
                placeholder="Nos coordonnées"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="info_title_en">
                Information Title (English)
              </label>

              <input
                id="info_title_en"
                name="info_title_en"
                type="text"
                value={
                  form.info_title_en
                }
                onChange={handleChange}
                placeholder="Our Contact Information"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="info_description_fr">
                Information Description (French)
              </label>

              <textarea
                id="info_description_fr"
                name="info_description_fr"
                value={
                  form.info_description_fr
                }
                onChange={handleChange}
                rows="3"
                placeholder="Retrouvez nos coordonnées..."
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="info_description_en">
                Information Description (English)
              </label>

              <textarea
                id="info_description_en"
                name="info_description_en"
                value={
                  form.info_description_en
                }
                onChange={handleChange}
                rows="3"
                placeholder="Find our contact details..."
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="phone_label_fr">
                Phone Label (French)
              </label>

              <input
                id="phone_label_fr"
                name="phone_label_fr"
                type="text"
                value={
                  form.phone_label_fr
                }
                onChange={handleChange}
                placeholder="Téléphone"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="phone_label_en">
                Phone Label (English)
              </label>

              <input
                id="phone_label_en"
                name="phone_label_en"
                type="text"
                value={
                  form.phone_label_en
                }
                onChange={handleChange}
                placeholder="Phone"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="email_label_fr">
                Email Label (French)
              </label>

              <input
                id="email_label_fr"
                name="email_label_fr"
                type="text"
                value={
                  form.email_label_fr
                }
                onChange={handleChange}
                placeholder="E-mail"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="email_label_en">
                Email Label (English)
              </label>

              <input
                id="email_label_en"
                name="email_label_en"
                type="text"
                value={
                  form.email_label_en
                }
                onChange={handleChange}
                placeholder="Email"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="address_label_fr">
                Address Label (French)
              </label>

              <input
                id="address_label_fr"
                name="address_label_fr"
                type="text"
                value={
                  form.address_label_fr
                }
                onChange={handleChange}
                placeholder="Adresse"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="address_label_en">
                Address Label (English)
              </label>

              <input
                id="address_label_en"
                name="address_label_en"
                type="text"
                value={
                  form.address_label_en
                }
                onChange={handleChange}
                placeholder="Address"
              />
            </div>
          </div>
        </div>

        {/* ============================================================
            05 — Delivery
        ============================================================ */}
        <div className="admin-company-section">
          <div className="admin-company-section-header">
            <div className="admin-company-section-number">
              05
            </div>

            <div>
              <h2>
                Delivery
              </h2>

              <p>
                Manage the delivery
                availability and content
                displayed in the contact
                section.
              </p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group admin-form-group-full">
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  name="delivery_available"
                  checked={
                    Number(
                      form.delivery_available
                    ) === 1
                  }
                  onChange={handleChange}
                />

                <span>
                  Delivery service is available
                </span>
              </label>

              <small className="admin-form-help">
                Disable this option if the
                company does not currently
                offer delivery.
              </small>
            </div>

            <div className="admin-form-group">
              <label htmlFor="delivery_title_fr">
                Delivery Title (French)
              </label>

              <input
                id="delivery_title_fr"
                name="delivery_title_fr"
                type="text"
                value={
                  form.delivery_title_fr
                }
                onChange={handleChange}
                placeholder="Service de livraison"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="delivery_title_en">
                Delivery Title (English)
              </label>

              <input
                id="delivery_title_en"
                name="delivery_title_en"
                type="text"
                value={
                  form.delivery_title_en
                }
                onChange={handleChange}
                placeholder="Delivery Service"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="delivery_description_fr">
                Delivery Description (French)
              </label>

              <textarea
                id="delivery_description_fr"
                name="delivery_description_fr"
                value={
                  form.delivery_description_fr
                }
                onChange={handleChange}
                rows="4"
                placeholder="Nous assurons la livraison selon vos besoins."
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="delivery_description_en">
                Delivery Description (English)
              </label>

              <textarea
                id="delivery_description_en"
                name="delivery_description_en"
                value={
                  form.delivery_description_en
                }
                onChange={handleChange}
                rows="4"
                placeholder="We provide delivery according to your needs."
              />
            </div>
          </div>
        </div>

        {/* ============================================================
            06 — Social
        ============================================================ */}
        <div className="admin-company-section">
          <div className="admin-company-section-header">
            <div className="admin-company-section-number">
              06
            </div>

            <div>
              <h2>
                Social
              </h2>

              <p>
                Manage the title displayed
                above the social media links.
              </p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="follow_title_fr">
                Follow Title (French)
              </label>

              <input
                id="follow_title_fr"
                name="follow_title_fr"
                type="text"
                value={
                  form.follow_title_fr
                }
                onChange={handleChange}
                placeholder="Suivez-nous"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="follow_title_en">
                Follow Title (English)
              </label>

              <input
                id="follow_title_en"
                name="follow_title_en"
                type="text"
                value={
                  form.follow_title_en
                }
                onChange={handleChange}
                placeholder="Follow Us"
              />
            </div>
          </div>
        </div>

        {/* ============================================================
            Save Footer
        ============================================================ */}
        <div className="admin-company-form-footer">
          <div>
            <i className="bi bi-info-circle" />

            <span>
              Changes are applied to the
              public website after saving.
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

export default Contact;