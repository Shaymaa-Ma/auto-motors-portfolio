import {
  useEffect,
  useState,
} from "react";

import {
  faqsApi,
} from "../api/endpoints";

import AdminPagination from "../components/AdminPagination";
import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";
import ConfirmDialog from "../components/ConfirmDialog";

// =========================================================
// PAGINATION
// =========================================================

const ITEMS_PER_PAGE = 10;

// =========================================================
// DEFAULT FAQ FORM VALUES
// =========================================================

const initialForm = {
  question_fr: "",
  question_en: "",
  answer_fr: "",
  answer_en: "",
  display_order: 0,
  is_active: 1,
};

// =========================================================
// DEFAULT FAQ SECTION VALUES
// =========================================================

const initialSectionForm = {
  section_title_fr: "",
  section_title_en: "",
  section_subtitle_fr: "",
  section_subtitle_en: "",
};

const Faqs = () => {
  // =======================================================
  // STATE
  // =======================================================

  // Only the current page is kept in state.
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

  // =======================================================
  // BACKEND PAGINATION STATE
  // =======================================================

  const [currentPage, setCurrentPage] =
    useState(1);

  const [totalItems, setTotalItems] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  // =======================================================
  // LOAD FAQS
  // =======================================================

  const loadFaqs = async (
    page = currentPage
  ) => {
    try {
      setLoading(true);
      setError("");

      const response =
        await faqsApi.getAll(
          page,
          ITEMS_PER_PAGE
        );

      /*
       * Backend response:
       *
       * {
       *   items,
       *   page,
       *   limit,
       *   offset,
       *   totalItems,
       *   totalPages
       * }
       *
       * Depending on sendSuccess(), this may be
       * inside response.data.
       */

      const payload =
        response?.data ??
        response ??
        {};

      const faqData =
        Array.isArray(
          payload?.items
        )
          ? payload.items
          : Array.isArray(
            payload
          )
            ? payload
            : [];

      // -----------------------------------------------------
      // Store only current page
      // -----------------------------------------------------

      setFaqs(
        faqData
      );

      // -----------------------------------------------------
      // Store pagination metadata
      // -----------------------------------------------------

      setTotalItems(
        Number(
          payload?.totalItems
        ) || 0
      );

      setTotalPages(
        Number(
          payload?.totalPages
        ) || 0
      );

      // -----------------------------------------------------
      // Load section content
      //
      // Section fields are duplicated across FAQ rows,
      // so any current-page FAQ contains the same values.
      // -----------------------------------------------------

      if (
        faqData.length > 0
      ) {
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
      } else if (
        totalItems === 0
      ) {
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

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    loadFaqs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =======================================================
  // LOAD WHEN PAGE CHANGES
  // =======================================================

  useEffect(() => {
    if (
      currentPage !== 1
    ) {
      loadFaqs(
        currentPage
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
  ]);

  // =======================================================
  // KEEP CURRENT PAGE VALID
  // =======================================================

  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }

    if (
      totalItems === 0 &&
      currentPage !== 1
    ) {
      setCurrentPage(1);
    }
  }, [
    totalPages,
    totalItems,
    currentPage,
  ]);

  // =======================================================
  // HANDLE FAQ FORM FIELD CHANGES
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

    setError("");
  };

  // =======================================================
  // HANDLE FAQ SECTION FIELD CHANGES
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
  // SAVE FAQ SECTION
  // =======================================================

  const handleSaveSection =
    async (
      event
    ) => {
      event.preventDefault();

      if (sectionSaving) {
        return;
      }

      if (
        totalItems === 0
      ) {
        setError(
          "Add at least one FAQ before editing the FAQ section content."
        );

        return;
      }

      try {
        setSectionSaving(
          true
        );

        setError("");
        setSuccess("");
        setSectionMessage("");

        /*
         * Keep the existing FAQ section behavior.
         *
         * Section fields are updated on every FAQ record.
         *
         * Since pagination now loads only one page,
         * we cannot loop through the local `faqs` array.
         *
         * Therefore we retrieve all FAQ records through
         * the admin endpoint page by page only for this
         * section-save operation.
         */

        const allFaqs = [];

        for (
          let page = 1;
          page <= totalPages;
          page++
        ) {
          const response =
            await faqsApi.getAll(
              page,
              ITEMS_PER_PAGE
            );

          const payload =
            response?.data ??
            response ??
            {};

          const pageItems =
            Array.isArray(
              payload?.items
            )
              ? payload.items
              : [];

          allFaqs.push(
            ...pageItems
          );
        }

        await Promise.all(
          allFaqs.map(
            (faq) =>
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

        await loadFaqs(
          currentPage
        );

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
        setSectionSaving(
          false
        );
      }
    };

  // =======================================================
  // OPEN ADD MODAL
  // =======================================================

  const handleAdd = () => {
    setEditingFaq(null);

    setForm({
      ...initialForm,

      // New FAQ initially goes after existing FAQs.
      display_order:
        totalItems + 1,
    });

    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  // =======================================================
  // OPEN EDIT MODAL
  // =======================================================

  const handleEdit = (
    faq
  ) => {
    if (!faq?.id) {
      setError(
        "Unable to edit this FAQ because its ID is missing."
      );

      return;
    }

    setEditingFaq(
      faq
    );

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
        faq.display_order ??
        0,

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

  // =======================================================
  // CLOSE ADD / EDIT MODAL
  // =======================================================

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

  // =======================================================
  // SAVE FAQ
  // =======================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // ---------------------------------------------------
      // Validation
      // ---------------------------------------------------

      if (
        !form.question_fr.trim()
      ) {
        setError(
          "French question is required."
        );

        setSaving(false);
        return;
      }

      if (
        !form.question_en.trim()
      ) {
        setError(
          "English question is required."
        );

        setSaving(false);
        return;
      }

      if (
        !form.answer_fr.trim()
      ) {
        setError(
          "French answer is required."
        );

        setSaving(false);
        return;
      }

      if (
        !form.answer_en.trim()
      ) {
        setError(
          "English answer is required."
        );

        setSaving(false);
        return;
      }

      // ---------------------------------------------------
      // Calculate desired order
      // ---------------------------------------------------

      const maximumOrder =
        editingFaq
          ? Math.max(
            totalItems,
            1
          )
          : totalItems + 1;

      const desiredOrder =
        Math.min(
          Math.max(
            Number(
              form.display_order
            ) || 1,
            1
          ),
          maximumOrder
        );

      // ---------------------------------------------------
      // Prepare data
      // ---------------------------------------------------

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
          desiredOrder,

        is_active:
          Number(
            form.is_active
          ),
      };

      // ===================================================
      // UPDATE
      // ===================================================

      if (editingFaq) {
        const oldOrder =
          Number(
            editingFaq.display_order
          ) || 0;

        // -------------------------------------------------
        // Update FAQ content/status
        // -------------------------------------------------

        await faqsApi.update(
          editingFaq.id,
          data
        );

        // -------------------------------------------------
        // Reorder through backend
        // -------------------------------------------------

        if (
          oldOrder !==
          desiredOrder
        ) {
          await faqsApi.reorder(
            editingFaq.id,
            desiredOrder
          );
        }

        setSuccess(
          "FAQ updated successfully."
        );
      }

      // ===================================================
      // CREATE
      // ===================================================

      else {
        const response =
          await faqsApi.create(
            data
          );

        /*
         * The create endpoint returns the newly created FAQ.
         */
        const createdFaq =
          response?.data ??
          response;

        const createdId =
          createdFaq?.id;

        // -------------------------------------------------
        // Reorder through backend
        // -------------------------------------------------

        if (
          createdId
        ) {
          await faqsApi.reorder(
            createdId,
            desiredOrder
          );
        }

        setSuccess(
          "FAQ created successfully."
        );
      }

      // ---------------------------------------------------
      // Reload current page
      // ---------------------------------------------------

      await loadFaqs(
        currentPage
      );

      // ---------------------------------------------------
      // Close modal
      // ---------------------------------------------------

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

  // =======================================================
  // TOGGLE FAQ STATUS
  // =======================================================

  const handleToggleStatus =
    async (
      faq
    ) => {
      if (!faq?.id) {
        setError(
          "Unable to update FAQ status because the item ID is missing."
        );

        return;
      }

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

        await loadFaqs(
          currentPage
        );
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

  // =======================================================
  // OPEN DELETE CONFIRMATION
  // =======================================================

  const handleDeleteClick = (
    faq
  ) => {
    if (!faq?.id) {
      setError(
        "Unable to delete this FAQ because its ID is missing."
      );

      return;
    }

    setDeletingFaq(
      faq
    );

    setDeleteDialogOpen(
      true
    );

    setError("");
    setSuccess("");
  };

  // =======================================================
  // CLOSE DELETE CONFIRMATION
  // =======================================================

  const handleCloseDeleteDialog =
    () => {
      if (deleting) {
        return;
      }

      setDeleteDialogOpen(
        false
      );

      setDeletingFaq(
        null
      );
    };

  // =======================================================
  // DELETE FAQ
  // =======================================================

  const handleDelete =
    async () => {
      if (deleting) {
        return;
      }

      if (!deletingFaq?.id) {
        setDeleteDialogOpen(
          false
        );

        setDeletingFaq(
          null
        );

        setError(
          "Unable to delete the FAQ because its ID is missing."
        );

        return;
      }

      try {
        setDeleting(true);
        setError("");
        setSuccess("");

        const itemId =
          deletingFaq.id;

        // -------------------------------------------------
        // Delete FAQ
        // -------------------------------------------------

        await faqsApi.remove(
          itemId
        );

        // -------------------------------------------------
        // Normalize remaining orders
        // -------------------------------------------------

        await faqsApi.normalizeOrders();

        setSuccess(
          "FAQ deleted successfully."
        );

        setDeleteDialogOpen(
          false
        );

        setDeletingFaq(
          null
        );

        // -------------------------------------------------
        // If this was the only item on the current page
        // and we are not on page 1, go back one page.
        // -------------------------------------------------

        if (
          faqs.length === 1 &&
          currentPage > 1
        ) {
          setCurrentPage(
            (page) =>
              page - 1
          );
        } else {
          await loadFaqs(
            currentPage
          );
        }
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

  // =======================================================
  // TABLE COLUMNS
  // =======================================================

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
          className={`admin-status-button ${Number(value) === 1
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
          disabled={loading}
        >
          <i className="bi bi-plus-lg" />

          Add FAQ
        </button>
      </div>

      {/* ===================================================
          SUCCESS MESSAGE
          =================================================== */}

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

      {/* ===================================================
          ERROR MESSAGE
          =================================================== */}

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

      {/* ===================================================
          FAQ SECTION CONTENT
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
              totalItems === 0
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
                totalItems === 0 ||
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
                totalItems === 0 ||
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
                totalItems === 0 ||
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
                totalItems === 0 ||
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

      {/* ===================================================
          FAQ TABLE
          =================================================== */}

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

      {/* ===================================================
          PAGINATION
          =================================================== */}

      <AdminPagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={
          ITEMS_PER_PAGE
        }
        onPageChange={
          setCurrentPage
        }
      />

      {/* ===================================================
          ADD / EDIT FAQ MODAL
          =================================================== */}

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

        {/* =================================================
            ANSWER
            ================================================= */}

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

        {/* =================================================
            DISPLAY SETTINGS
            ================================================= */}

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
                min="1"
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

      {/* ===================================================
          DELETE CONFIRMATION
          =================================================== */}

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete FAQ"
        message={
          deletingFaq
            ? `Are you sure you want to delete "${deletingFaq.question_en || deletingFaq.question_fr}"? This action cannot be undone.`
            : "Are you sure you want to delete this FAQ?"
        }
        confirmText="Delete FAQ"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={handleCloseDeleteDialog}
        loading={deleting}
        danger
      />

    </div>
  );
};

export default Faqs;