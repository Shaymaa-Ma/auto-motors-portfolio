import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  socialLinksApi,
} from "../api/endpoints";

import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";
import ConfirmDialog from "../components/ConfirmDialog";

const initialForm = {
  platform: "",
  url: "",
  icon: "bi-link-45deg",
  display_order: 0,
  is_active: 1,
};

const initialSectionForm = {
  section_title_fr: "",
  section_title_en: "",
  section_subtitle_fr: "",
  section_subtitle_en: "",
};

const socialIcons = [
  {
    value: "bi-facebook",
    label: "Facebook",
  },
  {
    value: "bi-instagram",
    label: "Instagram",
  },
  {
    value: "bi-linkedin",
    label: "LinkedIn",
  },
  {
    value: "bi-youtube",
    label: "YouTube",
  },
  {
    value: "bi-tiktok",
    label: "TikTok",
  },
  {
    value: "bi-whatsapp",
    label: "WhatsApp",
  },
  {
    value: "bi-twitter-x",
    label: "X / Twitter",
  },
  {
    value: "bi-telegram",
    label: "Telegram",
  },
  {
    value: "bi-globe",
    label: "Website",
  },
  {
    value: "bi-envelope",
    label: "Email",
  },
  {
    value: "bi-link-45deg",
    label: "Other Link",
  },
];

const SocialLinks = () => {
  const [
    socialLinks,
    setSocialLinks,
  ] = useState([]);

  const [
    sectionForm,
    setSectionForm,
  ] = useState(
    initialSectionForm
  );

  const [
    form,
    setForm,
  ] = useState(
    initialForm
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    sectionSaving,
    setSectionSaving,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
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

  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState(false);

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    editingSocialLink,
    setEditingSocialLink,
  ] = useState(null);

  const [
    deletingSocialLink,
    setDeletingSocialLink,
  ] = useState(null);

  // Load all social links for Admin
  const loadSocialLinks =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await socialLinksApi.getAll();

          const socialData =
            response?.data ??
            response ??
            [];

          const socialList =
            Array.isArray(
              socialData
            )
              ? socialData
              : [];

          setSocialLinks(
            socialList
          );

          // Load section content from the first record
          if (
            socialList.length > 0
          ) {
            const firstLink =
              socialList[0];

            setSectionForm({
              section_title_fr:
                firstLink.section_title_fr ??
                "",

              section_title_en:
                firstLink.section_title_en ??
                "",

              section_subtitle_fr:
                firstLink.section_subtitle_fr ??
                "",

              section_subtitle_en:
                firstLink.section_subtitle_en ??
                "",
            });
          }
        } catch (err) {
          console.error(
            "Load social links error:",
            err
          );

          setError(
            err?.response?.data?.message ||
              "Failed to load social links."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  // Load social links when the page opens
  useEffect(() => {
    loadSocialLinks();
  }, [
    loadSocialLinks,
  ]);

  // Update social link form field
  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]:
          type === "checkbox"
            ? checked
              ? 1
              : 0
            : value,
      })
    );

    setFormError("");
  };

  // Update section field
  const handleSectionChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setSectionForm(
        (current) => ({
          ...current,
          [name]: value,
        })
      );
    };

  // Open Add Social Link modal
  const handleAdd = () => {
    setEditingSocialLink(
      null
    );

    setForm({
      ...initialForm,
      display_order:
        socialLinks.length,
    });

    setFormError("");
    setError("");
    setSuccess("");

    setIsModalOpen(true);
  };

  // Open Edit Social Link modal
  const handleEdit = (
    socialLink
  ) => {
    setEditingSocialLink(
      socialLink
    );

    setForm({
      platform:
        socialLink.platform ??
        "",

      url:
        socialLink.url ??
        "",

      icon:
        socialLink.icon ||
        "bi-link-45deg",

      display_order:
        socialLink.display_order ??
        0,

      is_active:
        Number(
          socialLink.is_active
        ) === 1
          ? 1
          : 0,
    });

    setFormError("");
    setError("");
    setSuccess("");

    setIsModalOpen(true);
  };

  // Close Add/Edit modal
  const handleCloseModal =
    () => {
      if (saving) {
        return;
      }

      setIsModalOpen(false);
      setEditingSocialLink(
        null
      );

      setForm({
        ...initialForm,
      });

      setFormError("");
    };

  // Save social link
  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      setFormError("");
      setError("");
      setSuccess("");

      if (!form.platform.trim()) {
        setFormError(
          "Platform name is required."
        );

        return;
      }

      if (!form.url.trim()) {
        setFormError(
          "Social media URL is required."
        );

        return;
      }

      try {
        setSaving(true);

        const data = {
          platform:
            form.platform.trim(),

          url:
            form.url.trim(),

          icon:
            form.icon ||
            "bi-link-45deg",

          display_order:
            Number(
              form.display_order
            ) || 0,

          is_active:
            Number(
              form.is_active
            ) === 1
              ? 1
              : 0,
        };

        if (
          editingSocialLink
        ) {
          await socialLinksApi.update(
            editingSocialLink.id,
            data
          );

          setSuccess(
            "Social link updated successfully."
          );
        } else {
          await socialLinksApi.create(
            data
          );

          setSuccess(
            "Social link created successfully."
          );
        }

        setIsModalOpen(false);
        setEditingSocialLink(
          null
        );

        setForm({
          ...initialForm,
        });

        await loadSocialLinks();
      } catch (err) {
        console.error(
          "Save social link error:",
          err
        );

        setFormError(
          err?.response?.data?.message ||
            "Failed to save social link."
        );
      } finally {
        setSaving(false);
      }
    };

  // Save section content
  const handleSaveSection =
    async () => {
      try {
        setSectionSaving(true);
        setError("");
        setSuccess("");

        if (
          socialLinks.length === 0
        ) {
          setError(
            "Add at least one social link before saving the section content."
          );

          return;
        }

        const sectionData = {
          section_title_fr:
            sectionForm.section_title_fr.trim(),

          section_title_en:
            sectionForm.section_title_en.trim(),

          section_subtitle_fr:
            sectionForm.section_subtitle_fr.trim(),

          section_subtitle_en:
            sectionForm.section_subtitle_en.trim(),
        };

        await Promise.all(
          socialLinks.map(
            (socialLink) =>
              socialLinksApi.update(
                socialLink.id,
                sectionData
              )
          )
        );

        setSuccess(
          "Social links section content saved successfully."
        );

        await loadSocialLinks();
      } catch (err) {
        console.error(
          "Save social links section error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to save section content."
        );
      } finally {
        setSectionSaving(false);
      }
    };

  // Toggle social link status
  const handleToggleStatus =
    async (
      socialLink
    ) => {
      try {
        setError("");
        setSuccess("");

        const nextStatus =
          Number(
            socialLink.is_active
          ) === 1
            ? 0
            : 1;

        await socialLinksApi.update(
          socialLink.id,
          {
            is_active:
              nextStatus,
          }
        );

        setSuccess(
          nextStatus === 1
            ? "Social link activated successfully."
            : "Social link deactivated successfully."
        );

        await loadSocialLinks();
      } catch (err) {
        console.error(
          "Toggle social link status error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to update social link status."
        );
      }
    };

  // Open delete confirmation
  const handleDeleteClick =
    (
      socialLink
    ) => {
      setDeletingSocialLink(
        socialLink
      );

      setDeleteDialogOpen(
        true
      );
    };

  // Close delete confirmation
  const handleCloseDeleteDialog =
    () => {
      if (deleting) {
        return;
      }

      setDeleteDialogOpen(
        false
      );

      setDeletingSocialLink(
        null
      );
    };

  // Delete the selected social link
  const handleDelete =
    async () => {
      if (
        !deletingSocialLink
      ) {
        return;
      }

      try {
        setDeleting(true);
        setError("");
        setSuccess("");

        await socialLinksApi.remove(
          deletingSocialLink.id
        );

        setSuccess(
          "Social link deleted successfully."
        );

        setDeleteDialogOpen(
          false
        );

        setDeletingSocialLink(
          null
        );

        await loadSocialLinks();
      } catch (err) {
        console.error(
          "Delete social link error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to delete social link."
        );
      } finally {
        setDeleting(false);
      }
    };

  // Social links table columns
  const columns = useMemo(
    () => [
      {
        key: "platform",
        label: "Platform",

        render: (
          value,
          socialLink
        ) => (
          <div className="admin-social-platform-cell">
            <div className="admin-social-icon">
              <i
                className={`bi ${
                  socialLink.icon ||
                  "bi-link-45deg"
                }`}
              />
            </div>

            <div>
              <strong>
                {value ||
                  "Untitled"}
              </strong>

              <span>
                {socialLink.url ||
                  "—"}
              </span>
            </div>
          </div>
        ),
      },

      {
        key: "icon",
        label: "Icon",

        render: (
          value
        ) => (
          <div className="admin-social-icon-preview">
            <i
              className={`bi ${
                value ||
                "bi-link-45deg"
              }`}
            />
          </div>
        ),
      },

      {
        key: "url",
        label: "URL",

        render: (
          value
        ) => (
          <a
            href={
              value || "#"
            }
            target="_blank"
            rel="noreferrer"
            className="admin-social-url"
            onClick={(
              event
            ) => {
              if (!value) {
                event.preventDefault();
              }
            }}
          >
            {value ||
              "—"}
          </a>
        ),
      },

      {
        key: "display_order",
        label: "Order",

        render: (
          value
        ) => (
          <span className="admin-order-number">
            {value ?? 0}
          </span>
        ),
      },

      {
        key: "is_active",
        label: "Status",

        render: (
          value,
          socialLink
        ) => (
          <button
            type="button"
            className={`admin-status-button ${
              Number(value) ===
              1
                ? "active"
                : "inactive"
            }`}
            onClick={() =>
              handleToggleStatus(
                socialLink
              )
            }
            title={
              Number(value) ===
              1
                ? "Deactivate"
                : "Activate"
            }
          >
            <span className="admin-status-dot" />

            {Number(value) ===
            1
              ? "Active"
              : "Inactive"}
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="admin-page">
      {/* Page header */}
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">
            Settings
          </span>

          <h1>
            Social Links
          </h1>

          <p>
            Manage the social media
            links displayed across
            your website.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={handleAdd}
        >
          <i className="bi bi-plus-lg" />

          Add Social Link
        </button>
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

      {/* Social links section content */}
      <div className="admin-section-settings">
        <div className="admin-section-settings-header">
          <div>
            <h2>
              Social Links Section
              Content
            </h2>

            <p>
              Manage the title and
              subtitle displayed with
              the social links section.
            </p>
          </div>

          <button
            type="button"
            className="admin-primary-button"
            onClick={
              handleSaveSection
            }
            disabled={
              sectionSaving ||
              loading
            }
          >
            <i className="bi bi-check-lg" />

            {sectionSaving
              ? "Saving..."
              : "Save Section"}
          </button>
        </div>

        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label htmlFor="section_title_fr">
              Section Title
              (French)
            </label>

            <input
              id="section_title_fr"
              name="section_title_fr"
              type="text"
              value={
                sectionForm.section_title_fr
              }
              onChange={
                handleSectionChange
              }
              placeholder="Suivez-nous"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="section_title_en">
              Section Title
              (English)
            </label>

            <input
              id="section_title_en"
              name="section_title_en"
              type="text"
              value={
                sectionForm.section_title_en
              }
              onChange={
                handleSectionChange
              }
              placeholder="Follow Us"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="section_subtitle_fr">
              Section Subtitle
              (French)
            </label>

            <textarea
              id="section_subtitle_fr"
              name="section_subtitle_fr"
              value={
                sectionForm.section_subtitle_fr
              }
              onChange={
                handleSectionChange
              }
              rows="3"
              placeholder="Retrouvez-nous sur les réseaux sociaux..."
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="section_subtitle_en">
              Section Subtitle
              (English)
            </label>

            <textarea
              id="section_subtitle_en"
              name="section_subtitle_en"
              value={
                sectionForm.section_subtitle_en
              }
              onChange={
                handleSectionChange
              }
              rows="3"
              placeholder="Connect with us on social media..."
            />
          </div>
        </div>
      </div>

      {/* Social links table */}
      <div className="admin-social-links-section">
        <div className="admin-social-links-section-header">
          <div>
            <h2>
              Social Platforms
            </h2>

            <p>
              {loading
                ? "Loading social links..."
                : `${socialLinks.length} ${
                    socialLinks.length ===
                    1
                      ? "social link"
                      : "social links"
                  } configured`}
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={socialLinks}
          loading={loading}
          emptyMessage="No social links have been added yet."
          onEdit={
            handleEdit
          }
          onDelete={
            handleDeleteClick
          }
          editLabel="Edit"
          deleteLabel="Delete"
        />
      </div>

      {/* Add/Edit social link modal */}
      <FormModal
        isOpen={isModalOpen}
        title={
          editingSocialLink
            ? "Edit Social Link"
            : "Add Social Link"
        }
        onSubmit={
          handleSubmit
        }
        onClose={
          handleCloseModal
        }
        submitText={
          editingSocialLink
            ? "Save Changes"
            : "Add Social Link"
        }
        cancelText="Cancel"
        loading={saving}
        size="medium"
      >
        {formError && (
          <div className="admin-form-error-box">
            <i className="bi bi-exclamation-circle" />

            <span>
              {formError}
            </span>
          </div>
        )}

        {/* Social link information */}
        <div className="admin-form-section">
          <div className="admin-form-section-header">
            <h3>
              Social Link
              Information
            </h3>

            <p>
              Add the platform and
              link that visitors can
              use to reach your social
              media.
            </p>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="platform">
                Platform
                <span className="required">
                  *
                </span>
              </label>

              <input
                id="platform"
                name="platform"
                type="text"
                value={
                  form.platform
                }
                onChange={
                  handleChange
                }
                placeholder="Facebook"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="icon">
                Icon
              </label>

              <select
                id="icon"
                name="icon"
                value={
                  form.icon
                }
                onChange={
                  handleChange
                }
              >
                {socialIcons.map(
                  (item) => (
                    <option
                      key={
                        item.value
                      }
                      value={
                        item.value
                      }
                    >
                      {item.label}
                    </option>
                  )
                )}
              </select>

              <small className="admin-form-help">
                Choose the Bootstrap
                icon for this platform.
              </small>
            </div>

            <div className="admin-form-group admin-form-group-full">
              <label htmlFor="url">
                Social Media URL
                <span className="required">
                  *
                </span>
              </label>

              <input
                id="url"
                name="url"
                type="url"
                value={
                  form.url
                }
                onChange={
                  handleChange
                }
                placeholder="https://www.facebook.com/..."
                required
              />

              <small className="admin-form-help">
                Enter the complete URL
                including https://
              </small>
            </div>
          </div>
        </div>

        {/* Display settings */}
        <div className="admin-form-section">
          <div className="admin-form-section-header">
            <h3>
              Display Settings
            </h3>

            <p>
              Control the position and
              visibility of this social
              link.
            </p>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="display_order">
                Display Order
              </label>

              <input
                id="display_order"
                name="display_order"
                type="number"
                min="0"
                value={
                  form.display_order
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="admin-form-group admin-form-group-full">
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={
                    Number(
                      form.is_active
                    ) === 1
                  }
                  onChange={
                    handleChange
                  }
                />

                <span>
                  Social link is active
                </span>
              </label>

              <small className="admin-form-help">
                Inactive social links
                will not appear on the
                public website.
              </small>
            </div>
          </div>
        </div>
      </FormModal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={
          deleteDialogOpen
        }
        title="Delete Social Link"
        message={
          deletingSocialLink
            ? `Are you sure you want to delete "${deletingSocialLink.platform}"? This action cannot be undone.`
            : "Are you sure you want to delete this social link?"
        }
        confirmText="Delete Social Link"
        cancelText="Cancel"
        onConfirm={
          handleDelete
        }
        onCancel={
          handleCloseDeleteDialog
        }
        loading={deleting}
        danger
      />
    </div>
  );
};

export default SocialLinks;