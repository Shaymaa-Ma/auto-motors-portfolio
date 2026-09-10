import {
  useEffect,
  useState,
} from "react";

import {
  advantagesApi,
} from "../api/endpoints";

import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";
import ConfirmDialog from "../components/ConfirmDialog";

// Available Bootstrap icons for advantages
const advantageIcons = [
  {
    value: "bi-award",
    label: "Quality",
  },
  {
    value: "bi-tags",
    label: "Competitive Prices",
  },
  {
    value: "bi-box-seam",
    label: "Products",
  },
  {
    value: "bi-grid-3x3-gap",
    label: "Wide Range",
  },
  {
    value: "bi-truck",
    label: "Distribution",
  },
  {
    value: "bi-car-front",
    label: "Automotive",
  },
  {
    value: "bi-tools",
    label: "Tools / Maintenance",
  },
  {
    value: "bi-gear",
    label: "Parts / Equipment",
  },
  {
    value: "bi-boxes",
    label: "Distribution / Stock",
  },
  {
    value: "bi-globe",
    label: "International",
  },
  {
    value: "bi-shield-check",
    label: "Protection / Reliability",
  },
  {
    value: "bi-check-circle",
    label: "Reliability",
  },
  {
    value: "bi-star",
    label: "Premium",
  },
  {
    value: "bi-clock",
    label: "Fast Service",
  },
  {
    value: "bi-headset",
    label: "Customer Support",
  },
  {
    value: "bi-hand-thumbs-up",
    label: "Customer Satisfaction",
  },
  {
    value: "bi-graph-up-arrow",
    label: "Performance",
  },
  {
    value: "bi-lightning-charge",
    label: "Fast / Efficient",
  },
  {
    value: "bi-building",
    label: "Business",
  },
  {
    value: "bi-shop",
    label: "Sales",
  },
];

const initialForm = {
  title_fr: "",
  title_en: "",
  description_fr: "",
  description_en: "",
  icon: "bi-award",
  display_order: 0,
  is_active: 1,
};

const initialSectionForm = {
  section_title_fr: "",
  section_title_en: "",
  section_subtitle_fr: "",
  section_subtitle_en: "",
};

const Advantages = () => {
  const [
    advantages,
    setAdvantages,
  ] = useState([]);

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
    sectionMessage,
    setSectionMessage,
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
    editingAdvantage,
    setEditingAdvantage,
  ] = useState(null);

  const [
    deletingAdvantage,
    setDeletingAdvantage,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState(initialForm);

  const [
    sectionForm,
    setSectionForm,
  ] = useState(initialSectionForm);

  // Load all advantages for Admin
  const loadAdvantages = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await advantagesApi.getAll();

      const advantageData =
        response?.data ??
        response ??
        [];

      setAdvantages(
        advantageData
      );

      // Load section content from the first advantage
      if (
        advantageData.length > 0
      ) {
        const firstAdvantage =
          advantageData[0];

        setSectionForm({
          section_title_fr:
            firstAdvantage.section_title_fr ??
            "",

          section_title_en:
            firstAdvantage.section_title_en ??
            "",

          section_subtitle_fr:
            firstAdvantage.section_subtitle_fr ??
            "",

          section_subtitle_en:
            firstAdvantage.section_subtitle_en ??
            "",
        });
      } else {
        setSectionForm({
          ...initialSectionForm,
        });
      }
    } catch (err) {
      console.error(
        "Load advantages error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load advantages."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load advantages when the page opens
  useEffect(() => {
    loadAdvantages();
  }, []);

  // Handle advantage form field changes
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

    setError("");
  };

  // Handle section content changes
  const handleSectionChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setSectionForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSectionMessage("");
    setError("");
  };

  // Open the Add modal
  const handleAdd = () => {
    setEditingAdvantage(null);

    setForm({
      ...initialForm,
      display_order:
        advantages.length,
    });

    setError("");
    setIsModalOpen(true);
  };

  // Open the Edit modal
  const handleEdit = (
    advantage
  ) => {
    setEditingAdvantage(
      advantage
    );

    setForm({
      title_fr:
        advantage.title_fr ||
        "",

      title_en:
        advantage.title_en ||
        "",

      description_fr:
        advantage.description_fr ||
        "",

      description_en:
        advantage.description_en ||
        "",

      icon:
        advantage.icon ||
        "bi-award",

      display_order:
        advantage.display_order ??
        0,

      is_active:
        Number(
          advantage.is_active
        ) === 1
          ? 1
          : 0,
    });

    setError("");
    setIsModalOpen(true);
  };

  // Close the Add/Edit modal
  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setEditingAdvantage(null);

    setForm({
      ...initialForm,
    });

    setError("");
  };

  // Create section FormData
  const createSectionFormData = () => {
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

    return formData;
  };

  // Save the Advantages section content
  const handleSaveSection = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSectionMessage("");

    if (
      advantages.length === 0
    ) {
      setError(
        "Add at least one advantage before editing the Advantages section content."
      );
      return;
    }

    try {
      setSectionSaving(true);

      await Promise.all(
        advantages.map(
          (advantage) =>
            advantagesApi.update(
              advantage.id,
              createSectionFormData()
            )
        )
      );

      await loadAdvantages();

      setSectionMessage(
        "Advantages section content saved successfully."
      );
    } catch (err) {
      console.error(
        "Save advantages section error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to save Advantages section content."
      );
    } finally {
      setSectionSaving(false);
    }
  };

  // Save the advantage
  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.title_fr.trim()) {
        setError(
          "French title is required."
        );
        return;
      }

      if (!form.title_en.trim()) {
        setError(
          "English title is required."
        );
        return;
      }

      const data = {
        title_fr:
          form.title_fr.trim(),

        title_en:
          form.title_en.trim(),

        description_fr:
          form.description_fr.trim(),

        description_en:
          form.description_en.trim(),

        icon:
          form.icon,

        display_order:
          Number(
            form.display_order
          ) || 0,

        is_active:
          Number(
            form.is_active
          ),
      };

      if (editingAdvantage) {
        await advantagesApi.update(
          editingAdvantage.id,
          data
        );

        setSuccess(
          "Advantage updated successfully."
        );
      } else {
        await advantagesApi.create(
          data
        );

        setSuccess(
          "Advantage created successfully."
        );
      }

      await loadAdvantages();

      setIsModalOpen(false);
      setEditingAdvantage(null);

      setForm({
        ...initialForm,
      });
    } catch (err) {
      console.error(
        "Save advantage error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to save advantage."
      );
    } finally {
      setSaving(false);
    }
  };

  // Toggle advantage status
  const handleToggleStatus =
    async (
      advantage
    ) => {
      try {
        setError("");
        setSuccess("");

        await advantagesApi.update(
          advantage.id,
          {
            is_active:
              Number(
                advantage.is_active
              ) === 1
                ? 0
                : 1,
          }
        );

        setSuccess(
          Number(
            advantage.is_active
          ) === 1
            ? "Advantage deactivated successfully."
            : "Advantage activated successfully."
        );

        await loadAdvantages();
      } catch (err) {
        console.error(
          "Toggle advantage status error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to update advantage status."
        );
      }
    };

  // Open the delete confirmation dialog
  const handleDeleteClick = (
    advantage
  ) => {
    setDeletingAdvantage(
      advantage
    );

    setDeleteDialogOpen(true);
  };

  // Close the delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(false);
    setDeletingAdvantage(null);
  };

  // Delete the selected advantage
  const handleDelete = async () => {
    if (!deletingAdvantage) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await advantagesApi.remove(
        deletingAdvantage.id
      );

      setSuccess(
        "Advantage deleted successfully."
      );

      setDeleteDialogOpen(false);
      setDeletingAdvantage(null);

      await loadAdvantages();
    } catch (err) {
      console.error(
        "Delete advantage error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete advantage."
      );
    } finally {
      setDeleting(false);
    }
  };

  // Get the readable icon label
  const getIconLabel = (
    icon
  ) => {
    const selectedIcon =
      advantageIcons.find(
        (item) =>
          item.value === icon
      );

    return (
      selectedIcon?.label ||
      icon ||
      "Not selected"
    );
  };

  // Table columns
  const columns = [
    {
      key: "display_order",
      label: "Order",
      render: (
        value
      ) => (
        <span className="admin-order-number">
          {value}
        </span>
      ),
    },

    {
      key: "icon",
      label: "Icon",
      render: (
        value
      ) => (
        <div className="admin-icon-preview">
          <i
            className={`bi ${
              value ||
              "bi-award"
            }`}
          />
        </div>
      ),
    },

    {
      key: "title_en",
      label: "Advantage",
      render: (
        value,
        advantage
      ) => (
        <div className="admin-table-main">
          <strong>
            {value ||
              "—"}
          </strong>

          <span>
            {advantage.title_fr ||
              "—"}
          </span>
        </div>
      ),
    },

    {
      key: "description_en",
      label: "Description",
      render: (
        value,
        advantage
      ) => (
        <div className="admin-table-description">
          {value ||
            advantage.description_fr ||
            "—"}
        </div>
      ),
    },

    {
      key: "is_active",
      label: "Status",
      render: (
        value,
        advantage
      ) => (
        <button
          type="button"
          className={`admin-status-button ${
            Number(value) === 1
              ? "active"
              : "inactive"
          }`}
          onClick={() =>
            handleToggleStatus(
              advantage
            )
          }
          title={
            Number(value) === 1
              ? "Deactivate"
              : "Activate"
          }
        >
          <span className="admin-status-dot" />

          {Number(value) === 1
            ? "Active"
            : "Inactive"}
        </button>
      ),
    },
  ];

  return (
    <div className="admin-page">
      {/* Page header */}
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">
            Website
          </span>

          <h1>
            Advantages
          </h1>

          <p>
            Manage the Advantages
            section and the benefits
            displayed on your website.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={handleAdd}
        >
          <i className="bi bi-plus-lg" />
          Add Advantage
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

      {/* Advantages section content */}
      <form
        className="admin-section-settings"
        onSubmit={
          handleSaveSection
        }
      >
        <div className="admin-section-settings-header">
          <div>
            <h2>
              Advantages Section Content
            </h2>

            <p>
              Edit the title and
              subtitle displayed above
              the Advantages section
              on your website.
            </p>
          </div>

          <button
            type="submit"
            className="admin-primary-button"
            disabled={
              sectionSaving ||
              advantages.length === 0
            }
          >
            {sectionSaving ? (
              <>
                <span className="admin-button-spinner" />
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg" />
                Save Section
              </>
            )}
          </button>
        </div>

        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label htmlFor="advantages_section_title_fr">
              Section Title (French)
            </label>

            <input
              id="advantages_section_title_fr"
              name="section_title_fr"
              type="text"
              value={
                sectionForm.section_title_fr
              }
              onChange={
                handleSectionChange
              }
              placeholder="Nos avantages"
              disabled={
                advantages.length === 0 ||
                sectionSaving
              }
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="advantages_section_title_en">
              Section Title (English)
            </label>

            <input
              id="advantages_section_title_en"
              name="section_title_en"
              type="text"
              value={
                sectionForm.section_title_en
              }
              onChange={
                handleSectionChange
              }
              placeholder="Our Advantages"
              disabled={
                advantages.length === 0 ||
                sectionSaving
              }
            />
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="advantages_section_subtitle_fr">
              Section Subtitle (French)
            </label>

            <textarea
              id="advantages_section_subtitle_fr"
              name="section_subtitle_fr"
              value={
                sectionForm.section_subtitle_fr
              }
              onChange={
                handleSectionChange
              }
              rows="3"
              placeholder="Pourquoi choisir AUTO MOTORS SARL..."
              disabled={
                advantages.length === 0 ||
                sectionSaving
              }
            />
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="advantages_section_subtitle_en">
              Section Subtitle (English)
            </label>

            <textarea
              id="advantages_section_subtitle_en"
              name="section_subtitle_en"
              value={
                sectionForm.section_subtitle_en
              }
              onChange={
                handleSectionChange
              }
              rows="3"
              placeholder="Why choose AUTO MOTORS SARL..."
              disabled={
                advantages.length === 0 ||
                sectionSaving
              }
            />
          </div>
        </div>

        {sectionMessage && (
          <div className="admin-section-settings-message">
            <i className="bi bi-check-circle" />

            <span>
              {sectionMessage}
            </span>
          </div>
        )}
      </form>

      {/* Advantages table */}
      <DataTable
        columns={columns}
        data={advantages}
        loading={loading}
        emptyMessage="No advantages found."
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        editLabel="Edit"
        deleteLabel="Delete"
      />

      {/* Add/Edit advantage modal */}
      <FormModal
        isOpen={isModalOpen}
        title={
          editingAdvantage
            ? "Edit Advantage"
            : "Add Advantage"
        }
        onSubmit={
          handleSubmit
        }
        onClose={
          handleCloseModal
        }
        submitText={
          editingAdvantage
            ? "Save Changes"
            : "Add Advantage"
        }
        cancelText="Cancel"
        loading={saving}
        size="large"
      >
        {/* Advantage information */}
        <div className="admin-form-section">
          <div className="admin-form-section-header">
            <h3>
              Advantage Information
            </h3>

            <p>
              Add the bilingual content
              for this advantage.
            </p>
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
                value={
                  form.title_fr
                }
                onChange={
                  handleChange
                }
                placeholder="Produits de qualité"
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
                value={
                  form.title_en
                }
                onChange={
                  handleChange
                }
                placeholder="Quality Products"
                required
              />
            </div>

            <div className="admin-form-group admin-form-group-full">
              <label htmlFor="description_fr">
                Description (French)
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
                rows="4"
                placeholder="Décrivez cet avantage..."
              />
            </div>

            <div className="admin-form-group admin-form-group-full">
              <label htmlFor="description_en">
                Description (English)
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
                rows="4"
                placeholder="Describe this advantage..."
              />
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
              Choose an icon and
              control how this
              advantage appears.
            </p>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="icon">
                Icon
                <span className="required">
                  *
                </span>
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
                required
              >
                {advantageIcons.map(
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

              <div className="admin-selected-icon">
                <div className="admin-selected-icon-symbol">
                  <i
                    className={`bi ${
                      form.icon
                    }`}
                  />
                </div>

                <div>
                  <strong>
                    {getIconLabel(
                      form.icon
                    )}
                  </strong>

                  <span>
                    {form.icon}
                  </span>
                </div>
              </div>
            </div>

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
                  Active
                </span>

                <small>
                  Active advantages
                  are displayed on
                  the public website.
                </small>
              </label>
            </div>
          </div>
        </div>
      </FormModal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={
          deleteDialogOpen
        }
        title="Delete Advantage"
        message={
          deletingAdvantage
            ? `Are you sure you want to delete "${deletingAdvantage.title_en}"? This action cannot be undone.`
            : "Are you sure you want to delete this advantage?"
        }
        confirmText="Delete Advantage"
        cancelText="Cancel"
        onConfirm={
          handleDelete
        }
        onClose={
          handleCloseDeleteDialog
        }
        loading={deleting}
        danger
      />
    </div>
  );
};

export default Advantages;