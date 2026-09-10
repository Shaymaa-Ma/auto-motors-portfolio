import { useCallback, useEffect, useState } from "react";
import { servicesApi } from "../api/endpoints";

import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";
import ConfirmDialog from "../components/ConfirmDialog";

// Available Bootstrap Icons for services
const serviceIcons = [
  {
    value: "bi-car-front",
    label: "Car",
  },
  {
    value: "bi-truck",
    label: "Truck",
  },
  {
    value: "bi-battery-full",
    label: "Battery",
  },
  {
    value: "bi-circle",
    label: "Tires",
  },
  {
    value: "bi-droplet",
    label: "Oil / Lubricants",
  },
  {
    value: "bi-box-seam",
    label: "Products / Wholesale",
  },
  {
    value: "bi-tools",
    label: "Tools / Maintenance",
  },
  {
    value: "bi-gear",
    label: "Automotive Parts",
  },
  {
    value: "bi-boxes",
    label: "Distribution",
  },
  {
    value: "bi-globe",
    label: "Import / Export",
  },
  {
    value: "bi-shop",
    label: "Sales",
  },
  {
    value: "bi-wrench-adjustable",
    label: "Repair / Service",
  },
  {
    value: "bi-building",
    label: "Business",
  },
  {
    value: "bi-box-arrow-in-down",
    label: "Import",
  },
  {
    value: "bi-box-arrow-up",
    label: "Export",
  },
  {
    value: "bi-speedometer2",
    label: "Performance",
  },
  {
    value: "bi-fuel-pump",
    label: "Fuel",
  },
  {
    value: "bi-shield-check",
    label: "Protection",
  },
  {
    value: "bi-award",
    label: "Quality",
  },
];

const initialForm = {
  name_fr: "",
  name_en: "",
  description_fr: "",
  description_en: "",
  icon: "",
  display_order: 0,
  is_active: 1,
};

const initialSectionForm = {
  section_title_fr: "",
  section_title_en: "",
  section_subtitle_fr: "",
  section_subtitle_en: "",
};

const Services = () => {
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [sectionSaving, setSectionSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [sectionMessage, setSectionMessage] =
    useState("");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [editingService, setEditingService] =
    useState(null);

  const [deletingService, setDeletingService] =
    useState(null);

  const [form, setForm] = useState(initialForm);

  const [sectionForm, setSectionForm] =
    useState(initialSectionForm);

  const [formError, setFormError] = useState("");

  // Load all services for Admin
  const loadServices = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await servicesApi.getAll();

        const serviceData =
          response?.data ??
          response ??
          [];

        setServices(serviceData);

        // Load section content from the first service
        if (serviceData.length > 0) {
          const firstService =
            serviceData[0];

          setSectionForm({
            section_title_fr:
              firstService.section_title_fr ??
              "",
            section_title_en:
              firstService.section_title_en ??
              "",
            section_subtitle_fr:
              firstService.section_subtitle_fr ??
              "",
            section_subtitle_en:
              firstService.section_subtitle_en ??
              "",
          });
        } else {
          setSectionForm({
            ...initialSectionForm,
          });
        }
      } catch (err) {
        console.error(
          "Load services error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load services."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Update service form field
  const handleChange = (event) => {
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
  };

  // Update section form field
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

  // Open the Add Service modal
  const handleAdd = () => {
    setEditingService(null);

    setForm({
      ...initialForm,
    });

    setFormError("");
    setIsModalOpen(true);
  };

  // Open the Edit Service modal
  const handleEdit = (service) => {
    setEditingService(service);

    setForm({
      name_fr:
        service.name_fr ?? "",

      name_en:
        service.name_en ?? "",

      description_fr:
        service.description_fr ?? "",

      description_en:
        service.description_en ?? "",

      icon:
        service.icon ?? "",

      display_order:
        service.display_order ?? 0,

      is_active:
        Number(service.is_active),
    });

    setFormError("");
    setIsModalOpen(true);
  };

  // Close the service form
  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setEditingService(null);
    setFormError("");
  };

  // Save the service
  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setFormError("");
    setSuccess("");

    if (!form.name_fr.trim()) {
      setFormError(
        "French service name is required."
      );
      return;
    }

    if (!form.name_en.trim()) {
      setFormError(
        "English service name is required."
      );
      return;
    }

    if (!form.icon) {
      setFormError(
        "Please select a service icon."
      );
      return;
    }

    try {
      setSaving(true);

      const serviceData = {
        ...form,

        name_fr:
          form.name_fr.trim(),

        name_en:
          form.name_en.trim(),

        description_fr:
          form.description_fr.trim(),

        description_en:
          form.description_en.trim(),

        display_order:
          Number(form.display_order),

        is_active:
          Number(form.is_active),
      };

      if (editingService) {
        await servicesApi.update(
          editingService.id,
          serviceData
        );

        setSuccess(
          "Service updated successfully."
        );
      } else {
        await servicesApi.create(
          serviceData
        );

        setSuccess(
          "Service created successfully."
        );
      }

      setIsModalOpen(false);
      setEditingService(null);

      setForm({
        ...initialForm,
      });

      await loadServices();
    } catch (err) {
      console.error(
        "Save service error:",
        err
      );

      setFormError(
        err.response?.data?.message ||
          "Failed to save service."
      );
    } finally {
      setSaving(false);
    }
  };

  // Create section form data
  const createSectionFormData = () => {
    const formData = new FormData();

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

  // Save Services section content
  const handleSaveSection = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSectionMessage("");

    if (services.length === 0) {
      setError(
        "Add at least one service before editing the Services section content."
      );
      return;
    }

    try {
      setSectionSaving(true);

      const sectionData =
        createSectionFormData();

      await Promise.all(
        services.map((service) =>
          servicesApi.update(
            service.id,
            sectionData
          )
        )
      );

      await loadServices();

      setSectionMessage(
        "Services section content saved successfully."
      );
    } catch (err) {
      console.error(
        "Save services section error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to save Services section content."
      );
    } finally {
      setSectionSaving(false);
    }
  };

  // Toggle service status
  const handleToggleStatus = async (
    service
  ) => {
    try {
      setError("");
      setSuccess("");

      await servicesApi.update(
        service.id,
        {
          is_active:
            Number(
              service.is_active
            ) === 1
              ? 0
              : 1,
        }
      );

      setSuccess(
        Number(
          service.is_active
        ) === 1
          ? "Service deactivated successfully."
          : "Service activated successfully."
      );

      await loadServices();
    } catch (err) {
      console.error(
        "Toggle service status error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update service status."
      );
    }
  };

  // Open the delete confirmation dialog
  const handleDeleteClick = (
    service
  ) => {
    setDeletingService(service);
    setDeleteDialogOpen(true);
  };

  // Close the delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(false);
    setDeletingService(null);
  };

  // Delete the selected service
  const handleDelete = async () => {
    if (!deletingService) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await servicesApi.remove(
        deletingService.id
      );

      setSuccess(
        "Service deleted successfully."
      );

      setDeleteDialogOpen(false);
      setDeletingService(null);

      await loadServices();
    } catch (err) {
      console.error(
        "Delete service error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete service."
      );
    } finally {
      setDeleting(false);
    }
  };

  // Get the display label for an icon
  const getIconLabel = (
    iconValue
  ) => {
    const selectedIcon =
      serviceIcons.find(
        (icon) =>
          icon.value === iconValue
      );

    return (
      selectedIcon?.label ||
      iconValue
    );
  };

  // Define table columns
  const columns = [
    {
      key: "name_fr",
      label: "Service",
      render: (
        value,
        row
      ) => (
        <div className="admin-service-name-cell">
          <div className="admin-service-icon">
            {row.icon ? (
              <i
                className={`bi ${row.icon}`}
              />
            ) : (
              <i className="bi bi-tools" />
            )}
          </div>

          <div>
            <strong>
              {value}
            </strong>

            <span>
              {row.name_en}
            </span>
          </div>
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
          {value || "—"}
        </span>
      ),
    },

    {
      key: "display_order",
      label: "Order",
      className:
        "admin-table-order",
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
            Number(value) === 1
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
            Services
          </h1>

          <p>
            Manage the services displayed
            on your website.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={handleAdd}
        >
          <i className="bi bi-plus-lg" />
          Add Service
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

      {/* Services section content */}
      <section className="admin-section-settings">
        <div className="admin-section-settings-header">
          <div>
            <h2>
              Services Section Content
            </h2>

            <p>
              Edit the title and subtitle
              displayed above the Services
              section on the public website.
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
              services.length === 0
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

        {sectionMessage && (
          <div className="admin-inline-success">
            <i className="bi bi-check-circle" />

            <span>
              {sectionMessage}
            </span>
          </div>
        )}

        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label htmlFor="section_title_fr">
              Section Title — French
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
              placeholder="Nos services"
              disabled={
                services.length === 0 ||
                sectionSaving
              }
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="section_title_en">
              Section Title — English
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
              placeholder="Our Services"
              disabled={
                services.length === 0 ||
                sectionSaving
              }
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="section_subtitle_fr">
              Section Subtitle — French
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
              placeholder="Sous-titre de la section"
              rows="3"
              disabled={
                services.length === 0 ||
                sectionSaving
              }
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="section_subtitle_en">
              Section Subtitle — English
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
              placeholder="Section subtitle"
              rows="3"
              disabled={
                services.length === 0 ||
                sectionSaving
              }
            />
          </div>
        </div>
      </section>

      {/* Services table */}
      <DataTable
        columns={columns}
        data={services}
        loading={loading}
        emptyMessage="No services have been added yet."
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        editLabel="Edit"
        deleteLabel="Delete"
      />

      {/* Add/Edit service modal */}
      <FormModal
        isOpen={isModalOpen}
        title={
          editingService
            ? "Edit Service"
            : "Add Service"
        }
        onSubmit={
          handleSubmit
        }
        onClose={
          handleCloseModal
        }
        submitText={
          editingService
            ? "Update Service"
            : "Add Service"
        }
        loading={saving}
        size="large"
      >
        {formError && (
          <div className="admin-form-error-box">
            <i className="bi bi-exclamation-circle" />

            <span>
              {formError}
            </span>
          </div>
        )}

        {/* Service information */}
        <div className="admin-form-section">
          <div className="admin-form-section-header">
            <h3>
              Service Information
            </h3>

            <p>
              Enter the service content
              in both languages.
            </p>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="name_fr">
                French Name
              </label>

              <input
                id="name_fr"
                name="name_fr"
                type="text"
                value={
                  form.name_fr
                }
                onChange={
                  handleChange
                }
                placeholder="Nom du service"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="name_en">
                English Name
              </label>

              <input
                id="name_en"
                name="name_en"
                type="text"
                value={
                  form.name_en
                }
                onChange={
                  handleChange
                }
                placeholder="Service name"
              />
            </div>

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
                placeholder="Description du service"
                rows="4"
              />
            </div>

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
                placeholder="Service description"
                rows="4"
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
              Choose an icon, set the display
              order and control visibility.
            </p>
          </div>

          <div className="admin-form-grid">
            {/* Service icon */}
            <div className="admin-form-group">
              <label htmlFor="icon">
                Service Icon
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
                <option value="">
                  Select a service icon
                </option>

                {serviceIcons.map(
                  (icon) => (
                    <option
                      key={
                        icon.value
                      }
                      value={
                        icon.value
                      }
                    >
                      {icon.label}
                    </option>
                  )
                )}
              </select>

              {/* Selected icon preview */}
              {form.icon && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%",
                    minHeight: "60px",
                    boxSizing: "border-box",
                    marginTop: "10px",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    background: "#f8fafc",
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      flex: "0 0 40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #dbe4ee",
                      borderRadius: "8px",
                      background: "#ffffff",
                      color: "#315d8f",
                      fontSize: "18px",
                    }}
                  >
                    <i
                      className={`bi ${form.icon}`}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Icon information */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      minWidth: 0,
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        margin: 0,
                        color: "#334155",
                        fontSize: "12px",
                        fontWeight: 600,
                        lineHeight: 1.3,
                      }}
                    >
                      {getIconLabel(
                        form.icon
                      )}
                    </strong>

                    <span
                      style={{
                        display: "block",
                        overflow: "hidden",
                        color: "#94a3b8",
                        fontFamily: "monospace",
                        fontSize: "10px",
                        lineHeight: 1.3,
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {form.icon}
                    </span>
                  </div>
                </div>
              )}
            </div>

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
                />

                <span>
                  Service is active
                </span>
              </label>

              <small className="admin-form-help">
                Inactive services will not
                appear on the public website.
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
        title="Delete Service"
        message={
          deletingService
            ? `Are you sure you want to delete "${deletingService.name_en}"? This action cannot be undone.`
            : "Are you sure you want to delete this service?"
        }
        confirmText="Delete Service"
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

export default Services;