import {
  useEffect,
  useState,
} from "react";

import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";
import ConfirmDialog from "../components/ConfirmDialog";

import {
  siteSettingsApi,
} from "../api/endpoints";

const initialForm = {
  setting_key: "",
  setting_value: "",
};

const SiteSettings = () => {
  const [settings, setSettings] =
    useState([]);

  const [form, setForm] =
    useState(initialForm);

  const [editingKey, setEditingKey] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [deletingSetting, setDeletingSetting] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // Load site settings
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await siteSettingsApi.get();

      setSettings(
        response?.data || []
      );
    } catch (err) {
      console.error(
        "Load site settings error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load site settings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Handle form changes
  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Open edit modal
  const handleEdit = (
    setting
  ) => {
    setEditingKey(
      setting.setting_key
    );

    setForm({
      setting_key:
        setting.setting_key || "",
      setting_value:
        setting.setting_value || "",
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  // Close form modal
  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingKey(null);
    setForm(initialForm);
  };

  // Save site setting
  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const key =
      form.setting_key.trim();

    const value =
      form.setting_value.trim();

    if (!key) {
      setError(
        "Setting key is required."
      );
      return;
    }

    if (!value) {
      setError(
        "Setting value is required."
      );
      return;
    }

    // Only editing is allowed
    if (!editingKey) {
      setError(
        "No site setting selected for editing."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await siteSettingsApi.update(
        editingKey,
        {
          setting_value: value,
        }
      );

      setSuccess(
        "Site setting updated successfully."
      );

      setModalOpen(false);
      setEditingKey(null);
      setForm(initialForm);

      await loadSettings();
    } catch (err) {
      console.error(
        "Save site setting error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to save site setting."
      );
    } finally {
      setSaving(false);
    }
  };

  // Open delete confirmation
  const handleDeleteClick = (
    setting
  ) => {
    setDeletingSetting(
      setting
    );

    setDeleteDialogOpen(true);
  };

  // Close delete confirmation
  const handleCloseDeleteDialog = () => {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(false);
    setDeletingSetting(null);
  };

  // Delete site setting
  const handleDelete = async () => {
    if (!deletingSetting) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await siteSettingsApi.remove(
        deletingSetting.setting_key
      );

      setSuccess(
        "Site setting deleted successfully."
      );

      setDeleteDialogOpen(false);
      setDeletingSetting(null);

      await loadSettings();
    } catch (err) {
      console.error(
        "Delete site setting error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete site setting."
      );
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "setting_key",
      label: "Key",
      render: (
        value
      ) => (
        <strong className="admin-setting-key">
          {value}
        </strong>
      ),
    },
    {
      key: "setting_value",
      label: "Value",
      render: (
        value
      ) => (
        <span className="admin-setting-value">
          {value || "—"}
        </span>
      ),
    },
    {
      key: "updated_at",
      label: "Updated",
      render: (
        value
      ) => {
        if (!value) {
          return "—";
        }

        return new Date(
          value
        ).toLocaleString();
      },
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Site Settings</h1>

          <p>
            Manage general website configuration
            and global settings.
          </p>
        </div>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-alert admin-alert-success">
          {success}
        </div>
      )}

      <div className="admin-site-settings-section">
        <div className="admin-site-settings-header">
          <div>
            <h2>
              Website Configuration
            </h2>

            <p>
              Manage values used across the
              website.
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={settings}
          loading={loading}
          emptyMessage="No site settings found."
          onEdit={handleEdit}
          onDelete={
            handleDeleteClick
          }
          editLabel="Edit"
          deleteLabel="Delete"
          getRowKey={(
            row
          ) => row.id}
        />
      </div>

      <FormModal
        isOpen={modalOpen}
        title="Edit Site Setting"
        onSubmit={
          handleSubmit
        }
        onClose={
          handleCloseModal
        }
        submitText="Save Changes"
        loading={saving}
      >
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label htmlFor="setting_key">
              Setting Key
            </label>

            <input
              id="setting_key"
              name="setting_key"
              type="text"
              value={
                form.setting_key
              }
              onChange={
                handleChange
              }
              placeholder="Example: primary_color"
              disabled
            />

            <small>
              Setting keys cannot be changed.
            </small>
          </div>

          <div className="admin-form-group">
            <label htmlFor="setting_value">
              Setting Value
            </label>

            <textarea
              id="setting_value"
              name="setting_value"
              value={
                form.setting_value
              }
              onChange={
                handleChange
              }
              placeholder="Enter the setting value"
              rows={4}
            />
          </div>
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={
          deleteDialogOpen
        }
        title="Delete Site Setting"
        message={
          deletingSetting
            ? `Are you sure you want to delete "${deletingSetting.setting_key}"? This action cannot be undone.`
            : "Are you sure you want to delete this site setting?"
        }
        confirmText="Delete"
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

export default SiteSettings;