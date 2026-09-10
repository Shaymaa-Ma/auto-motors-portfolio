import { useEffect, useState } from "react";

import {
  faqsApi,
} from "../api/endpoints";

import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";
import ConfirmDialog from "../components/ConfirmDialog";

// Default FAQ form values
const initialForm = {
  question_fr: "",
  question_en: "",
  answer_fr: "",
  answer_en: "",
  display_order: 0,
  is_active: 1,
};

// Default FAQ section values
const initialSectionForm = {
  section_title_fr: "",
  section_title_en: "",
  section_subtitle_fr: "",
  section_subtitle_en: "",
};

const Faqs = () => {
  const [faqs, setFaqs] =
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

  const [sectionMessage, setSectionMessage] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [editingFaq, setEditingFaq] =
    useState(null);

  const [deletingFaq, setDeletingFaq] =
    useState(null);

  const [form, setForm] =
    useState(initialForm);

  const [sectionForm, setSectionForm] =
    useState(initialSectionForm);

  // Load all FAQs for Admin
  const loadFaqs = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await faqsApi.getAll();

      const faqData =
        response?.data ??
        response ??
        [];

      setFaqs(faqData);

      // Load section content from the first FAQ
      if (faqData.length > 0) {
        const firstFaq =
          faqData[0];

        setSectionForm({
          section_title_fr:
            firstFaq.section_title_fr ??
            "",

          section_title_en:
            firstFaq.section_title_en ??
            "",

          section_subtitle_fr:
            firstFaq.section_subtitle_fr ??
            "",

          section_subtitle_en:
            firstFaq.section_subtitle_en ??
            "",
        });
      } else {
        setSectionForm({
          ...initialSectionForm,
        });
      }
    } catch (err) {
      console.error(
        "Load FAQs error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load FAQs."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load FAQs when the page opens
  useEffect(() => {
    loadFaqs();
  }, []);

  // Handle FAQ form field changes
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
  };

  // Handle FAQ section field changes
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
  };

  // Save FAQ section title and subtitle
  const handleSaveSection = async (
    event
  ) => {
    event.preventDefault();

    if (faqs.length === 0) {
      setError(
        "Add at least one FAQ before editing the FAQ section content."
      );

      return;
    }

    try {
      setSectionSaving(true);
      setError("");
      setSuccess("");
      setSectionMessage("");

      // Update the section content on all FAQ records
      await Promise.all(
        faqs.map((faq) =>
          faqsApi.update(
            faq.id,
            {
              section_title_fr:
                sectionForm.section_title_fr.trim(),

              section_title_en:
                sectionForm.section_title_en.trim(),

              section_subtitle_fr:
                sectionForm.section_subtitle_fr.trim(),

              section_subtitle_en:
                sectionForm.section_subtitle_en.trim(),
            }
          )
        )
      );

      await loadFaqs();

      setSectionMessage(
        "FAQ section content saved successfully."
      );
    } catch (err) {
      console.error(
        "Save FAQ section error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to save FAQ section content."
      );
    } finally {
      setSectionSaving(false);
    }
  };

  // Open the Add modal
  const handleAdd = () => {
    setEditingFaq(null);

    setForm({
      ...initialForm,
      display_order:
        faqs.length,
    });

    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  // Open the Edit modal
  const handleEdit = (
    faq
  ) => {
    setEditingFaq(faq);

    setForm({
      question_fr:
        faq.question_fr ||
        "",

      question_en:
        faq.question_en ||
        "",

      answer_fr:
        faq.answer_fr ||
        "",

      answer_en:
        faq.answer_en ||
        "",

      display_order:
        faq.display_order ?? 0,

      is_active:
        Number(
          faq.is_active
        ) === 1
          ? 1
          : 0,
    });

    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  // Close the Add/Edit modal
  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setEditingFaq(null);
    setForm({
      ...initialForm,
    });
    setError("");
  };

  // Save the FAQ
  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.question_fr.trim()) {
        setError(
          "French question is required."
        );
        setSaving(false);
        return;
      }

      if (!form.question_en.trim()) {
        setError(
          "English question is required."
        );
        setSaving(false);
        return;
      }

      if (!form.answer_fr.trim()) {
        setError(
          "French answer is required."
        );
        setSaving(false);
        return;
      }

      if (!form.answer_en.trim()) {
        setError(
          "English answer is required."
        );
        setSaving(false);
        return;
      }

      const data = {
        question_fr:
          form.question_fr.trim(),

        question_en:
          form.question_en.trim(),

        answer_fr:
          form.answer_fr.trim(),

        answer_en:
          form.answer_en.trim(),

        display_order:
          Number(
            form.display_order
          ) || 0,

        is_active:
          Number(
            form.is_active
          ),
      };

      if (editingFaq) {
        await faqsApi.update(
          editingFaq.id,
          data
        );

        setSuccess(
          "FAQ updated successfully."
        );
      } else {
        await faqsApi.create(
          data
        );

        setSuccess(
          "FAQ created successfully."
        );
      }

      await loadFaqs();

      setIsModalOpen(false);
      setEditingFaq(null);
      setForm({
        ...initialForm,
      });
    } catch (err) {
      console.error(
        "Save FAQ error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to save FAQ."
      );
    } finally {
      setSaving(false);
    }
  };

  // Toggle FAQ status
  const handleToggleStatus =
    async (
      faq
    ) => {
      try {
        setError("");
        setSuccess("");

        const nextStatus =
          Number(
            faq.is_active
          ) === 1
            ? 0
            : 1;

        await faqsApi.update(
          faq.id,
          {
            is_active:
              nextStatus,
          }
        );

        setSuccess(
          nextStatus === 1
            ? "FAQ activated successfully."
            : "FAQ deactivated successfully."
        );

        await loadFaqs();
      } catch (err) {
        console.error(
          "Toggle FAQ status error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to update FAQ status."
        );
      }
    };

  // Open the delete confirmation dialog
  const handleDeleteClick = (
    faq
  ) => {
    setDeletingFaq(faq);
    setDeleteDialogOpen(true);
  };

  // Close the delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(false);
    setDeletingFaq(null);
  };

  // Delete the selected FAQ
  const handleDelete = async () => {
    if (!deletingFaq) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      // Delete the FAQ
      await faqsApi.delete(
        deletingFaq.id
      );

      setSuccess(
        "FAQ deleted successfully."
      );

      setDeleteDialogOpen(false);
      setDeletingFaq(null);

      await loadFaqs();
    } catch (err) {
      console.error(
        "Delete FAQ error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete FAQ."
      );
    } finally {
      setDeleting(false);
    }
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
      key: "question_en",
      label: "Question",

      render: (
        value,
        faq
      ) => (
        <div className="admin-faq-question">
          <strong>
            {value ||
              "—"}
          </strong>

          <span>
            {faq.question_fr ||
              "—"}
          </span>
        </div>
      ),
    },

    {
      key: "answer_en",
      label: "Answer",

      render: (
        value,
        faq
      ) => (
        <div className="admin-faq-answer">
          {value ||
            faq.answer_fr ||
            "—"}
        </div>
      ),
    },

    {
      key: "is_active",
      label: "Status",

      render: (
        value,
        faq
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
              faq
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
          <h1>
            FAQs
          </h1>

          <p>
            Manage frequently asked
            questions displayed on
            your website.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={handleAdd}
        >
          <i className="bi bi-plus-lg" />
          Add FAQ
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

      {/* FAQ section content */}
      <form
        className="admin-section-settings"
        onSubmit={
          handleSaveSection
        }
      >
        <div className="admin-section-settings-header">
          <div>
            <h2>
              FAQ Section Content
            </h2>

            <p>
              Edit the title and subtitle
              displayed above the FAQ
              section on your website.
            </p>
          </div>

          <button
            type="submit"
            className="admin-primary-button"
            disabled={
              sectionSaving ||
              faqs.length === 0
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
              Section Title (French)
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
              placeholder="Questions fréquentes"
              disabled={
                faqs.length === 0 ||
                sectionSaving
              }
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="section_title_en">
              Section Title (English)
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
              placeholder="Frequently Asked Questions"
              disabled={
                faqs.length === 0 ||
                sectionSaving
              }
            />
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="section_subtitle_fr">
              Section Subtitle (French)
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
              placeholder="Trouvez les réponses aux questions les plus fréquentes..."
              disabled={
                faqs.length === 0 ||
                sectionSaving
              }
            />
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="section_subtitle_en">
              Section Subtitle (English)
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
              placeholder="Find answers to the most frequently asked questions..."
              disabled={
                faqs.length === 0 ||
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

      {/* FAQ table */}
      <DataTable
        columns={columns}
        data={faqs}
        loading={loading}
        emptyMessage="No FAQs found."
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        editLabel="Edit"
        deleteLabel="Delete"
      />

      {/* Add/Edit FAQ modal */}
      <FormModal
        isOpen={isModalOpen}
        title={
          editingFaq
            ? "Edit FAQ"
            : "Add FAQ"
        }
        onSubmit={
          handleSubmit
        }
        onClose={
          handleCloseModal
        }
        submitText={
          editingFaq
            ? "Save Changes"
            : "Add FAQ"
        }
        cancelText="Cancel"
        loading={saving}
        size="large"
      >
        <div className="admin-form-section">
          <div className="admin-form-section-header">
            <h3>
              Question
            </h3>

            <p>
              Add the question in
              both languages.
            </p>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="question_fr">
                Question (French)
                <span className="required">
                  *
                </span>
              </label>

              <input
                id="question_fr"
                name="question_fr"
                type="text"
                value={
                  form.question_fr
                }
                onChange={
                  handleChange
                }
                placeholder="Quels types de pièces automobiles proposez-vous ?"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="question_en">
                Question (English)
                <span className="required">
                  *
                </span>
              </label>

              <input
                id="question_en"
                name="question_en"
                type="text"
                value={
                  form.question_en
                }
                onChange={
                  handleChange
                }
                placeholder="What types of automotive parts do you offer?"
                required
              />
            </div>
          </div>
        </div>

        <div className="admin-form-section">
          <div className="admin-form-section-header">
            <h3>
              Answer
            </h3>

            <p>
              Add the answer in
              both languages.
            </p>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group admin-form-group-full">
              <label htmlFor="answer_fr">
                Answer (French)
                <span className="required">
                  *
                </span>
              </label>

              <textarea
                id="answer_fr"
                name="answer_fr"
                value={
                  form.answer_fr
                }
                onChange={
                  handleChange
                }
                rows="5"
                placeholder="Écrivez la réponse en français..."
                required
              />
            </div>

            <div className="admin-form-group admin-form-group-full">
              <label htmlFor="answer_en">
                Answer (English)
                <span className="required">
                  *
                </span>
              </label>

              <textarea
                id="answer_en"
                name="answer_en"
                value={
                  form.answer_en
                }
                onChange={
                  handleChange
                }
                rows="5"
                placeholder="Write the answer in English..."
                required
              />
            </div>
          </div>
        </div>

        <div className="admin-form-section">
          <div className="admin-form-section-header">
            <h3>
              Display Settings
            </h3>

            <p>
              Control the order and
              visibility of this FAQ.
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

            <div className="admin-form-group">
              <label>
                Status
              </label>

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
                  Active FAQs are
                  displayed on the
                  public website.
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
        title="Delete FAQ"
        message={
          deletingFaq
            ? `Are you sure you want to delete "${deletingFaq.question_en}"? This action cannot be undone.`
            : "Are you sure you want to delete this FAQ?"
        }
        confirmText="Delete FAQ"
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

export default Faqs;