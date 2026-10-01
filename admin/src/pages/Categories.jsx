import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { categoriesApi } from "../api/endpoints";

import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";
import AdminPagination from "../components/AdminPagination";

import Swal from "sweetalert2";

const ITEMS_PER_PAGE = 10;

const initialForm = {
  name_fr: "",
  name_en: "",
  description_fr: "",
  description_en: "",
  display_order: 0,
  is_active: 1,
};

const initialSectionForm = {
  section_title_fr: "",
  section_title_en: "",
  section_subtitle_fr: "",
  section_subtitle_en: "",
};

const Categories = () => {
  const [categories, setCategories] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [totalItems, setTotalItems] = useState(0);

  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [sectionSaving, setSectionSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [sectionMessage, setSectionMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [sectionForm, setSectionForm] = useState(initialSectionForm);

  const [formError, setFormError] = useState("");

  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  const loadCategories = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");

        const response = await categoriesApi.getAll({
          page,
          limit: ITEMS_PER_PAGE,
        });

        const responseData =
          response?.data ??
          response ??
          {};

        const categoryData = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
          ? responseData.data
          : [];

        const pagination = !Array.isArray(responseData)
          ? responseData?.pagination ?? {}
          : {};

        setCategories(categoryData);

        setTotalItems(
          Number(pagination.totalItems) || 0
        );

        setTotalPages(
          Number(pagination.totalPages) || 0
        );

        /*
         * All categories contain the same
         * section values.
         *
         * Therefore the first category on
         * the current page can populate the
         * global section form.
         */
        if (categoryData.length > 0) {
          const firstCategory = categoryData[0];

          setSectionForm({
            section_title_fr:
              firstCategory.section_title_fr ?? "",

            section_title_en:
              firstCategory.section_title_en ?? "",

            section_subtitle_fr:
              firstCategory.section_subtitle_fr ?? "",

            section_subtitle_en:
              firstCategory.section_subtitle_en ?? "",
          });
        } else if (page === 1) {
          setSectionForm({
            ...initialSectionForm,
          });
        }
      } catch (err) {
        console.error(
          "Load categories error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to load categories."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // =========================================================
  // INITIAL LOAD / PAGINATION
  // =========================================================

  useEffect(() => {
    loadCategories(currentPage);
  }, [currentPage, loadCategories]);

  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }

    if (
      totalPages === 0 &&
      currentPage !== 1
    ) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // =========================================================
  // CATEGORY FORM CHANGE
  // =========================================================

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

  // =========================================================
  // SECTION FORM CHANGE
  // =========================================================

  const handleSectionChange = (event) => {
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

  // =========================================================
  // ADD
  // =========================================================

  const handleAdd = () => {
    setEditingCategory(null);

    setForm({
      ...initialForm,
      display_order: totalItems + 1,
    });

    setFormError("");
    setError("");
    setSuccess("");

    setIsModalOpen(true);
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (category) => {
    setEditingCategory(category);

    setForm({
      name_fr: category.name_fr ?? "",

      name_en: category.name_en ?? "",

      description_fr:
        category.description_fr ?? "",

      description_en:
        category.description_en ?? "",

      display_order:
        category.display_order ?? 0,

      is_active:
        Number(category.is_active),
    });

    setFormError("");
    setError("");
    setSuccess("");

    setIsModalOpen(true);
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (category) => {
    if (!category?.id) {
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Deletion",
      text: `Are you sure you want to delete "${
        category.name_en || category.name_fr
      }"? If this category is assigned to any products, it cannot be deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      focusCancel: true,
      width: "400px",
      padding: "1.25rem",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await categoriesApi.remove(category.id);

      setSuccess(
        "Category deleted successfully."
      );

      if (
        categories.length === 1 &&
        currentPage > 1
      ) {
        setCurrentPage(currentPage - 1);
      } else {
        await loadCategories(currentPage);
      }
    } catch (err) {
      console.error(
        "Delete category error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete category."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setEditingCategory(null);
    setFormError("");
  };

  // =========================================================
  // CATEGORY DATA
  // =========================================================

  const createCategoryData = () => {
    const formData = new FormData();

    formData.append(
      "name_fr",
      form.name_fr.trim()
    );

    formData.append(
      "name_en",
      form.name_en.trim()
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
        Number(form.display_order) ||
          totalItems + 1
      )
    );

    formData.append(
      "is_active",
      String(Number(form.is_active))
    );

    return formData;
  };

  // =========================================================
  // SECTION DATA
  // =========================================================

  const createSectionData = () => {
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

  // =========================================================
  // SAVE CATEGORY
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setError("");
    setSuccess("");

    if (!form.name_fr.trim()) {
      setFormError(
        "French category name is required."
      );

      return;
    }

    if (!form.name_en.trim()) {
      setFormError(
        "English category name is required."
      );

      return;
    }

    try {
      setSaving(true);

      if (editingCategory) {
        const oldOrder =
          Number(
            editingCategory.display_order
          ) || 0;

        const requestedOrder =
          Number(form.display_order) ||
          oldOrder;

        const updateData = new FormData();

        updateData.append(
          "name_fr",
          form.name_fr.trim()
        );

        updateData.append(
          "name_en",
          form.name_en.trim()
        );

        updateData.append(
          "description_fr",
          form.description_fr.trim()
        );

        updateData.append(
          "description_en",
          form.description_en.trim()
        );

        /*
         * Normal category update does not
         * modify global section fields.
         */
        updateData.append(
          "display_order",
          String(oldOrder)
        );

        updateData.append(
          "is_active",
          String(Number(form.is_active))
        );

        await categoriesApi.update(
          editingCategory.id,
          updateData
        );

        if (oldOrder !== requestedOrder) {
          await categoriesApi.reorder(
            editingCategory.id,
            requestedOrder
          );
        }

        setSuccess(
          "Category updated successfully."
        );
      } else {
        await categoriesApi.create(
          createCategoryData()
        );

        setSuccess(
          "Category created successfully."
        );
      }

      setIsModalOpen(false);
      setEditingCategory(null);

      setForm({
        ...initialForm,
      });

      await loadCategories(currentPage);
    } catch (err) {
      console.error(
        "Save category error:",
        err
      );

      setFormError(
        err?.response?.data?.message ||
          "Failed to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // SAVE GLOBAL SECTION
  // =========================================================

  const handleSaveSection = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSectionMessage("");

    if (totalItems === 0) {
      setError(
        "Add at least one category before editing the Categories section content."
      );

      return;
    }

    try {
      setSectionSaving(true);

      /*
       * IMPORTANT:
       *
       * This updates ALL categories through
       * one backend query.
       *
       * It does NOT loop through the current
       * pagination page.
       */
      await categoriesApi.updateSection(
        createSectionData()
      );

      await loadCategories(currentPage);

      setSectionMessage(
        "Categories section content saved successfully."
      );
    } catch (err) {
      console.error(
        "Save categories section error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to save Categories section content."
      );
    } finally {
      setSectionSaving(false);
    }
  };

  // =========================================================
  // TOGGLE STATUS
  // =========================================================

  const handleToggleStatus = useCallback(
    async (category) => {
      try {
        setError("");
        setSuccess("");

        const updateData = new FormData();

        updateData.append(
          "is_active",
          String(
            Number(category.is_active) === 1
              ? 0
              : 1
          )
        );

        await categoriesApi.update(
          category.id,
          updateData
        );

        setSuccess(
          Number(category.is_active) === 1
            ? "Category deactivated successfully."
            : "Category activated successfully."
        );

        await loadCategories(currentPage);
      } catch (err) {
        console.error(
          "Toggle category status error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to update category status."
        );
      }
    },
    [currentPage, loadCategories]
  );

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "name_fr",
        label: "Category",

        render: (value, row) => (
          <div className="admin-category-name-cell">
            <strong>{value}</strong>

            <span>{row.name_en}</span>
          </div>
        ),
      },

      {
        key: "description_fr",
        label: "Description",

        render: (value) => (
          <span className="admin-table-description">
            {value || "—"}
          </span>
        ),
      },

      {
        key: "display_order",
        label: "Order",

        className: "admin-table-order",
      },

      {
        key: "is_active",
        label: "Status",

        render: (value, row) => (
          <button
            type="button"
            className={`admin-status-button ${
              Number(value) === 1
                ? "active"
                : "inactive"
            }`}
            onClick={() =>
              handleToggleStatus(row)
            }
            disabled={deleting}
          >
            <span className="admin-status-dot" />

            {Number(value) === 1
              ? "Active"
              : "Inactive"}
          </button>
        ),
      },
    ],
    [deleting, handleToggleStatus]
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="admin-page">
      {/* PAGE HEADER */}

      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">
            Catalog
          </span>

          <h1>Categories</h1>

          <p>
            Manage the product categories
            displayed on your website.
          </p>
        </div>
      </div>

      {/* SUCCESS ALERT */}

      {success && (
        <div className="admin-alert admin-alert-success">
          <i className="bi bi-check-circle" />

          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      {/* ERROR ALERT */}

      {error && (
        <div className="admin-alert admin-alert-error">
          <i className="bi bi-exclamation-circle" />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      {/* GLOBAL SECTION CONTENT */}

      <section className="admin-section-settings">
        <div className="admin-section-settings-header">
          <div>
            <h2>
              Categories Section Content
            </h2>

            <p>
              Edit the title and subtitle
              displayed above the Categories
              section on your website.
            </p>
          </div>

          <button
            type="button"
            className="admin-primary-button"
            onClick={handleSaveSection}
            disabled={
              sectionSaving ||
              totalItems === 0
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

            <span>{sectionMessage}</span>
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
              onChange={handleSectionChange}
              placeholder="Nos catégories"
              disabled={
                totalItems === 0 ||
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
              onChange={handleSectionChange}
              placeholder="Our Categories"
              disabled={
                totalItems === 0 ||
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
              onChange={handleSectionChange}
              placeholder="Sous-titre de la section"
              rows="3"
              disabled={
                totalItems === 0 ||
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
              onChange={handleSectionChange}
              placeholder="Section subtitle"
              rows="3"
              disabled={
                totalItems === 0 ||
                sectionSaving
              }
            />
          </div>
        </div>
      </section>

      {/* ADD CATEGORY BUTTON */}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "24px",
          marginBottom: "16px",
        }}
      >
        <button
          type="button"
          className="admin-primary-button"
          onClick={handleAdd}
          disabled={deleting}
        >
          <i className="bi bi-plus-lg" />

          Add Category
        </button>
      </div>

      {/* TABLE */}

      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        emptyMessage="No categories have been added yet."
        onEdit={handleEdit}
        onDelete={handleDelete}
        editLabel="Edit"
        deleteLabel="Delete"
      />

      {/* PAGINATION */}

      <AdminPagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      {/* ADD / EDIT MODAL */}

      <FormModal
        isOpen={isModalOpen}
        title={
          editingCategory
            ? "Edit Category"
            : "Add Category"
        }
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
        submitText={
          editingCategory
            ? "Update Category"
            : "Add Category"
        }
        loading={saving}
        size="large"
      >
        {formError && (
          <div className="admin-form-error-box">
            <i className="bi bi-exclamation-circle" />

            <span>{formError}</span>
          </div>
        )}

        {/* CATEGORY INFORMATION */}

        <div className="admin-form-section">
          <div className="admin-form-section-header">
            <h3>Category Information</h3>

            <p>
              Enter the category content
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
                value={form.name_fr}
                onChange={handleChange}
                placeholder="Nom de la catégorie"
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
                value={form.name_en}
                onChange={handleChange}
                placeholder="Category name"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="description_fr">
                French Description
              </label>

              <textarea
                id="description_fr"
                name="description_fr"
                value={form.description_fr}
                onChange={handleChange}
                placeholder="Description de la catégorie"
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
                value={form.description_en}
                onChange={handleChange}
                placeholder="Category description"
                rows="4"
              />
            </div>
          </div>
        </div>

        {/* DISPLAY SETTINGS */}

        <div className="admin-form-section">
          <div className="admin-form-section-header">
            <h3>Display Settings</h3>

            <p>
              Set the display order and
              control category visibility.
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
                value={form.display_order}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group admin-form-group-full">
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={
                    Number(form.is_active) === 1
                  }
                  onChange={handleChange}
                />

                <span>
                  Category is active
                </span>
              </label>

              <small className="admin-form-help">
                Inactive categories will not
                appear on the public website.
              </small>
            </div>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default Categories;
