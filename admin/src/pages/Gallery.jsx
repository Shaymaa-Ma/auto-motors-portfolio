import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { galleryApi } from "../api/endpoints";

import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";
import ImageUploader from "../components/ImageUploader";
import ConfirmDialog from "../components/ConfirmDialog";

// =========================================================
// INITIAL FORMS
// =========================================================

const initialForm = {
  title_fr: "",
  title_en: "",
  description_fr: "",
  description_en: "",
  image: null,
  display_order: 0,
  is_active: 1,
};

const initialSectionForm = {
  section_title_fr: "",
  section_title_en: "",
  section_subtitle_fr: "",
  section_subtitle_en: "",
};

const Gallery = () => {

  // =======================================================
  // STATE
  // =======================================================

  const [gallery, setGallery] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [sectionSaving, setSectionSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [sectionMessage, setSectionMessage] =
    useState("");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [editingItem, setEditingItem] =
    useState(null);

  const [deletingItem, setDeletingItem] =
    useState(null);

  const [form, setForm] =
    useState(initialForm);

  const [sectionForm, setSectionForm] =
    useState(initialSectionForm);

  const [formError, setFormError] =
    useState("");

  // =======================================================
  // LOAD GALLERY
  // =======================================================

  const loadGallery = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await galleryApi.getAll();

        const galleryData =
          Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
            ? response
            : [];

        setGallery(
          galleryData
        );

        // -------------------------------------------------
        // Load section content from first gallery record
        // -------------------------------------------------

        if (
          galleryData.length > 0
        ) {
          const firstItem =
            galleryData[0];

          setSectionForm({
            section_title_fr:
              firstItem.section_title_fr ??
              "",

            section_title_en:
              firstItem.section_title_en ??
              "",

            section_subtitle_fr:
              firstItem.section_subtitle_fr ??
              "",

            section_subtitle_en:
              firstItem.section_subtitle_en ??
              "",
          });
        } else {
          setSectionForm({
            ...initialSectionForm,
          });
        }
      } catch (err) {
        console.error(
          "Load gallery error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to load gallery."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  // =======================================================
  // GENERAL FORM CHANGE
  // =======================================================

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

  // =======================================================
  // SECTION FORM CHANGE
  // =======================================================

  const handleSectionChange = (
    event
  ) => {
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

    setSectionMessage("");
    setError("");
    setSuccess("");
  };

  // =======================================================
  // ADD GALLERY ITEM
  // =======================================================

  const handleAdd = () => {
    setEditingItem(null);

    setForm({
      ...initialForm,
      display_order:
        gallery.length + 1,
    });

    setFormError("");
    setError("");
    setSuccess("");

    setIsModalOpen(true);
  };

  // =======================================================
  // EDIT GALLERY ITEM
  // =======================================================

  const handleEdit = (
    item
  ) => {
    if (!item?.id) {
      console.error(
        "Cannot edit gallery item: missing ID",
        item
      );

      setError(
        "Unable to edit this gallery item."
      );

      return;
    }

    setEditingItem(item);

    setForm({
      title_fr:
        item.title_fr ?? "",

      title_en:
        item.title_en ?? "",

      description_fr:
        item.description_fr ?? "",

      description_en:
        item.description_en ?? "",

      image: null,

      display_order:
        item.display_order ?? 0,

      is_active:
        Number(item.is_active) === 1
          ? 1
          : 0,
    });

    setFormError("");
    setError("");
    setSuccess("");

    setIsModalOpen(true);
  };

  // =======================================================
  // IMAGE CHANGE
  // =======================================================

  const handleImageChange = (
    file
  ) => {
    setForm(
      (current) => ({
        ...current,
        image: file || null,
      })
    );

    setFormError("");
  };

  // =======================================================
  // CLOSE FORM MODAL
  // =======================================================

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setEditingItem(null);

    setForm({
      ...initialForm,
    });

    setFormError("");
  };

  // =======================================================
  // SAVE GALLERY SECTION
  // =======================================================

  const handleSaveSection = async (
    event
  ) => {
    event.preventDefault();

    if (sectionSaving) {
      return;
    }

    setError("");
    setSuccess("");
    setSectionMessage("");

    if (
      gallery.length === 0
    ) {
      setError(
        "Add at least one gallery item before editing the Gallery section content."
      );

      return;
    }

    try {
      setSectionSaving(true);

      // ---------------------------------------------------
      // Create FormData
      // ---------------------------------------------------

      const formData =
        new FormData();

      formData.append(
        "section_title_fr",
        sectionForm.section_title_fr.trim()
      );

      formData.append(
        "section_title_en",
        sectionForm.section_title_en.trim()
      );

      formData.append(
        "section_subtitle_fr",
        sectionForm.section_subtitle_fr.trim()
      );

      formData.append(
        "section_subtitle_en",
        sectionForm.section_subtitle_en.trim()
      );

      // ---------------------------------------------------
      // ONE request only
      // ---------------------------------------------------

      await galleryApi.updateSection(
        formData
      );

      // ---------------------------------------------------
      // Reload from database
      // ---------------------------------------------------

      await loadGallery();

      setSectionMessage(
        "Gallery section content saved successfully."
      );
    } catch (err) {
      console.error(
        "Save gallery section error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to save Gallery section content."
      );
    } finally {
      setSectionSaving(false);
    }
  };

  // =======================================================
  // SAVE GALLERY ITEM
  // =======================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    setFormError("");
    setError("");
    setSuccess("");

    // -----------------------------------------------------
    // Validate French title
    // -----------------------------------------------------

    if (
      !form.title_fr.trim()
    ) {
      setFormError(
        "French gallery title is required."
      );

      return;
    }

    // -----------------------------------------------------
    // Validate English title
    // -----------------------------------------------------

    if (
      !form.title_en.trim()
    ) {
      setFormError(
        "English gallery title is required."
      );

      return;
    }

    // -----------------------------------------------------
    // Image required only when creating
    // -----------------------------------------------------

    if (
      !editingItem &&
      !form.image
    ) {
      setFormError(
        "Please select an image."
      );

      return;
    }

    // -----------------------------------------------------
    // Validate edit ID
    // -----------------------------------------------------

    if (
      editingItem &&
      !editingItem.id
    ) {
      setFormError(
        "Unable to update this gallery item because its ID is missing."
      );

      return;
    }

    try {
      setSaving(true);

      const formData =
        new FormData();

      formData.append(
        "title_fr",
        form.title_fr.trim()
      );

      formData.append(
        "title_en",
        form.title_en.trim()
      );

      formData.append(
        "description_fr",
        form.description_fr.trim()
      );

      formData.append(
        "description_en",
        form.description_en.trim()
      );

      formData.append(
        "display_order",
        String(
          Number(
            form.display_order
          ) || 0
        )
      );

      formData.append(
        "is_active",
        String(
          Number(
            form.is_active
          ) === 1
            ? 1
            : 0
        )
      );

      // ---------------------------------------------------
      // Add image only if selected
      // ---------------------------------------------------

      if (
        form.image
      ) {
        formData.append(
          "image",
          form.image
        );
      }

      // ---------------------------------------------------
      // UPDATE
      // ---------------------------------------------------

      if (
        editingItem
      ) {
        await galleryApi.update(
          editingItem.id,
          formData
        );

        setSuccess(
          "Gallery item updated successfully."
        );
      }

      // ---------------------------------------------------
      // CREATE
      // ---------------------------------------------------

      else {
        await galleryApi.create(
          formData
        );

        setSuccess(
          "Gallery item created successfully."
        );
      }

      // ---------------------------------------------------
      // Close modal
      // ---------------------------------------------------

      setIsModalOpen(false);
      setEditingItem(null);

      setForm({
        ...initialForm,
      });

      setFormError("");

      // ---------------------------------------------------
      // Reload
      // ---------------------------------------------------

      await loadGallery();
    } catch (err) {
      console.error(
        "Save gallery item error:",
        err
      );

      setFormError(
        err?.response?.data?.message ||
          "Failed to save gallery item."
      );
    } finally {
      setSaving(false);
    }
  };

  // =======================================================
  // TOGGLE STATUS
  // =======================================================

  const handleToggleStatus = async (
    item
  ) => {
    if (!item?.id) {
      setError(
        "Unable to update gallery status because the item ID is missing."
      );

      return;
    }

    try {
      setError("");
      setSuccess("");

      const formData =
        new FormData();

      const nextStatus =
        Number(
          item.is_active
        ) === 1
          ? 0
          : 1;

      formData.append(
        "is_active",
        String(
          nextStatus
        )
      );

      await galleryApi.update(
        item.id,
        formData
      );

      setSuccess(
        nextStatus === 1
          ? "Gallery item activated successfully."
          : "Gallery item deactivated successfully."
      );

      await loadGallery();
    } catch (err) {
      console.error(
        "Toggle gallery status error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to update gallery status."
      );
    }
  };

  // =======================================================
  // OPEN DELETE DIALOG
  // =======================================================

  const handleDeleteClick = (
    item
  ) => {
    if (!item?.id) {
      setError(
        "Unable to delete this gallery item because its ID is missing."
      );

      return;
    }

    setDeletingItem(item);
    setDeleteDialogOpen(true);

    setError("");
    setSuccess("");
  };

  // =======================================================
  // CLOSE DELETE DIALOG
  // =======================================================

  const handleCloseDeleteDialog = () => {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(false);
    setDeletingItem(null);
  };

  // =======================================================
  // DELETE GALLERY ITEM
  // =======================================================

  const handleDelete = async () => {
    if (deleting) {
      return;
    }

    if (!deletingItem?.id) {
      setDeleteDialogOpen(false);
      setDeletingItem(null);

      setError(
        "Unable to delete the gallery item because its ID is missing."
      );

      return;
    }

    try {
      setDeleting(true);

      setError("");
      setSuccess("");

      const itemId =
        deletingItem.id;

      await galleryApi.remove(
        itemId
      );

      setSuccess(
        "Gallery item deleted successfully."
      );

      setDeleteDialogOpen(false);
      setDeletingItem(null);

      await loadGallery();
    } catch (err) {
      console.error(
        "Delete gallery item error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete gallery item."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =======================================================
  // IMAGE URL
  // =======================================================

  const getImageUrl = (
    image
  ) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith(
        "http://"
      ) ||
      image.startsWith(
        "https://"
      )
    ) {
      return image;
    }

    const uploadsUrl =
      process.env.REACT_APP_UPLOADS_URL ||
      "http://localhost:5000/uploads";

    return `${uploadsUrl}/${image.replace(
      /^[/\\]+/,
      ""
    )}`;
  };

  // =======================================================
  // TABLE COLUMNS
  // =======================================================

  const columns = [
    {
      key: "image",
      label: "Image",

      render: (
        value
      ) => (
        <div className="admin-gallery-table-image">
          {value ? (
            <img
              src={getImageUrl(value)}
              alt="Gallery"
            />
          ) : (
            <div className="admin-gallery-table-image-empty">
              <i
                className="bi bi-image"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      ),
    },

    {
      key: "title_fr",
      label: "Gallery Item",

      render: (
        value,
        row
      ) => (
        <div className="admin-gallery-name-cell">
          <strong>
            {value ||
              "Untitled"}
          </strong>

          <span>
            {row.title_en ||
              "—"}
          </span>
        </div>
      ),
    },

    {
      key: "description_fr",
      label: "Description",

      render: (
        value
      ) => (
        <span className="admin-table-description">
          {value ||
            "—"}
        </span>
      ),
    },

    {
      key: "display_order",
      label: "Order",
      className:
        "admin-table-order",

      render: (
        value
      ) => (
        <span>
          {Number(
            value
          ) || 0}
        </span>
      ),
    },

    {
      key: "is_active",
      label: "Status",

      render: (
        value,
        row
      ) => (
        <button
          type="button"
          className={`admin-status-button ${
            Number(
              value
            ) === 1
              ? "active"
              : "inactive"
          }`}
          onClick={() =>
            handleToggleStatus(
              row
            )
          }
        >
          <span className="admin-status-dot" />

          {Number(
            value
          ) === 1
            ? "Active"
            : "Inactive"}
        </button>
      ),
    },
  ];

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="admin-page">

      {/* ===================================================
          PAGE HEADER
          =================================================== */}

      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">
            Website
          </span>

          <h1>
            Gallery
          </h1>

          <p>
            Manage the gallery section and
            the images displayed on your
            website.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={
            handleAdd
          }
          disabled={
            loading
          }
        >
          <i
            className="bi bi-plus-lg"
            aria-hidden="true"
          />

          Add Gallery Item
        </button>
      </div>

      {/* ===================================================
          SUCCESS
          =================================================== */}

      {success && (
        <div className="admin-alert admin-alert-success">
          <i
            className="bi bi-check-circle"
            aria-hidden="true"
          />

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

      {/* ===================================================
          ERROR
          =================================================== */}

      {error && (
        <div className="admin-alert admin-alert-error">
          <i
            className="bi bi-exclamation-circle"
            aria-hidden="true"
          />

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

      {/* ===================================================
          GALLERY SECTION CONTENT
          =================================================== */}

      <form
        className="admin-section-settings"
        onSubmit={
          handleSaveSection
        }
      >
        <div className="admin-section-settings-header">
          <div>
            <h2>
              Gallery Section Content
            </h2>

            <p>
              Edit the title and subtitle
              displayed above the gallery
              section on your website.
            </p>
          </div>

          <button
            type="submit"
            className="admin-primary-button"
            disabled={
              sectionSaving ||
              gallery.length === 0
            }
          >
            {sectionSaving ? (
              <>
                <span className="admin-button-spinner" />

                Saving...
              </>
            ) : (
              <>
                <i
                  className="bi bi-check-lg"
                  aria-hidden="true"
                />

                Save Section
              </>
            )}
          </button>
        </div>

        <div className="admin-form-grid">

          {/* French title */}

          <div className="admin-form-group">
            <label htmlFor="gallery_section_title_fr">
              Section Title (French)
            </label>

            <input
              id="gallery_section_title_fr"
              name="section_title_fr"
              type="text"
              value={
                sectionForm.section_title_fr
              }
              onChange={
                handleSectionChange
              }
              placeholder="Notre galerie"
              disabled={
                gallery.length === 0 ||
                sectionSaving
              }
            />
          </div>

          {/* English title */}

          <div className="admin-form-group">
            <label htmlFor="gallery_section_title_en">
              Section Title (English)
            </label>

            <input
              id="gallery_section_title_en"
              name="section_title_en"
              type="text"
              value={
                sectionForm.section_title_en
              }
              onChange={
                handleSectionChange
              }
              placeholder="Our Gallery"
              disabled={
                gallery.length === 0 ||
                sectionSaving
              }
            />
          </div>

          {/* French subtitle */}

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="gallery_section_subtitle_fr">
              Section Subtitle (French)
            </label>

            <textarea
              id="gallery_section_subtitle_fr"
              name="section_subtitle_fr"
              value={
                sectionForm.section_subtitle_fr
              }
              onChange={
                handleSectionChange
              }
              placeholder="Découvrez notre entreprise, nos produits et notre activité..."
              rows="3"
              disabled={
                gallery.length === 0 ||
                sectionSaving
              }
            />
          </div>

          {/* English subtitle */}

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="gallery_section_subtitle_en">
              Section Subtitle (English)
            </label>

            <textarea
              id="gallery_section_subtitle_en"
              name="section_subtitle_en"
              value={
                sectionForm.section_subtitle_en
              }
              onChange={
                handleSectionChange
              }
              placeholder="Discover our company, products and activities..."
              rows="3"
              disabled={
                gallery.length === 0 ||
                sectionSaving
              }
            />
          </div>

        </div>

        {sectionMessage && (
          <div className="admin-section-settings-message">
            <i
              className="bi bi-check-circle"
              aria-hidden="true"
            />

            <span>
              {sectionMessage}
            </span>
          </div>
        )}
      </form>

      {/* ===================================================
          GALLERY TABLE
          =================================================== */}

      <DataTable
        columns={columns}
        data={gallery}
        loading={loading}
        emptyMessage="No gallery items have been added yet."
        onEdit={
          handleEdit
        }
        onDelete={
          handleDeleteClick
        }
        editLabel="Edit"
        deleteLabel="Delete"
      />

      {/* ===================================================
          ADD / EDIT MODAL
          =================================================== */}

      <FormModal
        isOpen={
          isModalOpen
        }
        title={
          editingItem
            ? "Edit Gallery Item"
            : "Add Gallery Item"
        }
        onSubmit={
          handleSubmit
        }
        onClose={
          handleCloseModal
        }
        submitText={
          editingItem
            ? "Update Gallery"
            : "Add Gallery"
        }
        cancelText="Cancel"
        loading={
          saving
        }
        size="large"
      >

        {/* Form error */}

        {formError && (
          <div className="admin-form-error-box">
            <i
              className="bi bi-exclamation-circle"
              aria-hidden="true"
            />

            <span>
              {formError}
            </span>
          </div>
        )}

        {/* =================================================
            IMAGE
            ================================================= */}

        <div className="admin-form-section">

          <div className="admin-form-section-header">
            <h3>
              Gallery Image
            </h3>

            <p>
              Upload the image that will be
              displayed in the gallery.
            </p>
          </div>

          <ImageUploader
            currentImage={
              editingItem?.image
            }
            selectedImage={
              form.image
            }
            onChange={
              handleImageChange
            }
            label="Gallery Image"
          />

        </div>

        {/* =================================================
            INFORMATION
            ================================================= */}

        <div className="admin-form-section">

          <div className="admin-form-section-header">
            <h3>
              Gallery Information
            </h3>

            <p>
              Enter the gallery item content
              in both languages.
            </p>
          </div>

          <div className="admin-form-grid">

            {/* French title */}

            <div className="admin-form-group">
              <label htmlFor="title_fr">
                French Title
              </label>

              <input
                id="title_fr"
                name="title_fr"
                type="text"
                value={
                  form.title_fr
                }
                onChange={
                  handleChange
                }
                placeholder="Titre de l'image"
                disabled={
                  saving
                }
              />
            </div>

            {/* English title */}

            <div className="admin-form-group">
              <label htmlFor="title_en">
                English Title
              </label>

              <input
                id="title_en"
                name="title_en"
                type="text"
                value={
                  form.title_en
                }
                onChange={
                  handleChange
                }
                placeholder="Image title"
                disabled={
                  saving
                }
              />
            </div>

            {/* French description */}

            <div className="admin-form-group">
              <label htmlFor="description_fr">
                French Description
              </label>

              <textarea
                id="description_fr"
                name="description_fr"
                value={
                  form.description_fr
                }
                onChange={
                  handleChange
                }
                placeholder="Description de l'image"
                rows="4"
                disabled={
                  saving
                }
              />
            </div>

            {/* English description */}

            <div className="admin-form-group">
              <label htmlFor="description_en">
                English Description
              </label>

              <textarea
                id="description_en"
                name="description_en"
                value={
                  form.description_en
                }
                onChange={
                  handleChange
                }
                placeholder="Image description"
                rows="4"
                disabled={
                  saving
                }
              />
            </div>

          </div>
        </div>

        {/* =================================================
            DISPLAY SETTINGS
            ================================================= */}

        <div className="admin-form-section">

          <div className="admin-form-section-header">
            <h3>
              Display Settings
            </h3>

            <p>
              Control the order and visibility
              of this gallery item.
            </p>
          </div>

          <div className="admin-form-grid">

            {/* Display order */}

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
                disabled={
                  saving
                }
              />
            </div>

            {/* Active status */}

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
                  disabled={
                    saving
                  }
                />

                <span>
                  Gallery item is active
                </span>

              </label>

              <small className="admin-form-help">
                Inactive gallery items will not
                appear on the public website.
              </small>

            </div>

          </div>
        </div>

      </FormModal>

      {/* ===================================================
          DELETE CONFIRMATION
          =================================================== */}

      <ConfirmDialog
        isOpen={
          deleteDialogOpen
        }
        title="Delete Gallery Item"
        message={
          deletingItem
            ? `Are you sure you want to delete "${
                deletingItem.title_en ||
                deletingItem.title_fr ||
                "this gallery item"
              }"? This action cannot be undone.`
            : "Are you sure you want to delete this gallery item?"
        }
        confirmText="Delete Gallery"
        cancelText="Cancel"
        onConfirm={
          handleDelete
        }
        onClose={
          handleCloseDeleteDialog
        }
        loading={
          deleting
        }
        danger
      />

    </div>
  );
};

export default Gallery;