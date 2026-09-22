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
  const [categories, setCategories] =
    useState([]);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [totalItems, setTotalItems] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [sectionSaving, setSectionSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [sectionMessage, setSectionMessage] =
    useState("");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [form, setForm] =
    useState(initialForm);

  const [sectionForm, setSectionForm] =
    useState(initialSectionForm);

  const [formError, setFormError] =
    useState("");

  // =========================================================
  // Load Categories - Current Page
  // =========================================================

  const loadCategories = useCallback(
    async (
      page = 1
    ) => {
      try {
        setLoading(true);
        setError("");

        const response =
          await categoriesApi.getAll({
            page,
            limit: ITEMS_PER_PAGE,
          });

        const responseData =
          response?.data ?? {};

        const categoryData =
          responseData?.data ?? [];

        const pagination =
          responseData?.pagination ??
          {};

        const normalizedData =
          Array.isArray(
            categoryData
          )
            ? categoryData
            : [];

        setCategories(
          normalizedData
        );

        setTotalItems(
          Number(
            pagination.totalItems
          ) || 0
        );

        setTotalPages(
          Number(
            pagination.totalPages
          ) || 0
        );

        /*
         * Keep the existing section-content
         * behavior.
         *
         * Section content is stored with the
         * categories, so use the first returned
         * category as the source of the values.
         */
        if (
          normalizedData.length > 0
        ) {
          const firstCategory =
            normalizedData[0];

          setSectionForm({
            section_title_fr:
              firstCategory.section_title_fr ??
              "",

            section_title_en:
              firstCategory.section_title_en ??
              "",

            section_subtitle_fr:
              firstCategory.section_subtitle_fr ??
              "",

            section_subtitle_en:
              firstCategory.section_subtitle_en ??
              "",
          });
        } else if (
          page === 1
        ) {
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
  // Initial / Page Load
  // =========================================================

  useEffect(() => {
    loadCategories(
      currentPage
    );
  }, [
    currentPage,
    loadCategories,
  ]);

  // =========================================================
  // Keep Current Page Valid
  // =========================================================

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
      totalPages === 0 &&
      currentPage !== 1
    ) {
      setCurrentPage(1);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  // =========================================================
  // Update Category Form
  // =========================================================

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
          type ===
          "checkbox"
            ? checked
              ? 1
              : 0
            : value,
      })
    );

    setFormError("");
  };

  // =========================================================
  // Update Section Form
  // =========================================================

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

  // =========================================================
  // Add Category
  // =========================================================

  const handleAdd = () => {
    setEditingCategory(null);

    setForm({
      ...initialForm,

      display_order:
        totalItems + 1,
    });

    setFormError("");
    setError("");
    setSuccess("");

    setIsModalOpen(true);
  };

  // =========================================================
  // Edit Category
  // =========================================================

  const handleEdit = (
    category
  ) => {
    setEditingCategory(
      category
    );

    setForm({
      name_fr:
        category.name_fr ??
        "",

      name_en:
        category.name_en ??
        "",

      description_fr:
        category.description_fr ??
        "",

      description_en:
        category.description_en ??
        "",

      display_order:
        category.display_order ??
        0,

      is_active:
        Number(
          category.is_active
        ),
    });

    setFormError("");
    setError("");
    setSuccess("");

    setIsModalOpen(true);
  };

  // =========================================================
  // Close Category Modal
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
  // Create Category Data
  // =========================================================

  const createCategoryData =
    () => {
      return {
        name_fr:
          form.name_fr.trim(),

        name_en:
          form.name_en.trim(),

        description_fr:
          form.description_fr.trim(),

        description_en:
          form.description_en.trim(),

        display_order:
          Number(
            form.display_order
          ) ||
          totalItems + 1,

        is_active:
          Number(
            form.is_active
          ),
      };
    };

  // =========================================================
  // Save Category
  // =========================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setFormError("");
    setError("");
    setSuccess("");

    if (
      !form.name_fr.trim()
    ) {
      setFormError(
        "French category name is required."
      );

      return;
    }

    if (
      !form.name_en.trim()
    ) {
      setFormError(
        "English category name is required."
      );

      return;
    }

    try {
      setSaving(true);

      const categoryData =
        createCategoryData();

      if (editingCategory) {
        /*
         * Keep the original display order
         * during the normal category update.
         *
         * Backend reorder handles the actual
         * order change.
         */
        const oldOrder =
          Number(
            editingCategory.display_order
          ) || 0;

        const requestedOrder =
          Number(
            categoryData.display_order
          ) || 0;

        await categoriesApi.update(
          editingCategory.id,
          {
            ...categoryData,

            display_order:
              oldOrder,
          }
        );

        if (
          oldOrder !==
          requestedOrder
        ) {
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
          categoryData
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

      await loadCategories(
        currentPage
      );
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
  // Create Section Data
  // =========================================================

  const createSectionData =
    () => {
      return {
        section_title_fr:
          sectionForm.section_title_fr.trim(),

        section_title_en:
          sectionForm.section_title_en.trim(),

        section_subtitle_fr:
          sectionForm.section_subtitle_fr.trim(),

        section_subtitle_en:
          sectionForm.section_subtitle_en.trim(),
      };
    };

  // =========================================================
  // Save Categories Section Content
  // =========================================================

  const handleSaveSection =
    async (
      event
    ) => {
      event.preventDefault();

      setError("");
      setSuccess("");
      setSectionMessage("");

      if (
        totalItems === 0
      ) {
        setError(
          "Add at least one category before editing the Categories section content."
        );

        return;
      }

      try {
        setSectionSaving(true);

        const sectionData =
          createSectionData();

        /*
         * Keep the original behavior:
         * update the categories currently
         * loaded on the page.
         */
        await Promise.all(
          categories.map(
            (category) =>
              categoriesApi.update(
                category.id,
                sectionData
              )
          )
        );

        await loadCategories(
          currentPage
        );

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
  // Toggle Category Status
  // =========================================================

  const handleToggleStatus =
    async (
      category
    ) => {
      try {
        setError("");
        setSuccess("");

        await categoriesApi.update(
          category.id,
          {
            is_active:
              Number(
                category.is_active
              ) === 1
                ? 0
                : 1,
          }
        );

        setSuccess(
          Number(
            category.is_active
          ) === 1
            ? "Category deactivated successfully."
            : "Category activated successfully."
        );

        await loadCategories(
          currentPage
        );
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
    };

  // =========================================================
  // Table Columns
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "name_fr",
        label: "Category",

        render: (
          value,
          row
        ) => (
          <div className="admin-category-name-cell">
            <strong>
              {value}
            </strong>

            <span>
              {row.name_en}
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

  // =========================================================
  // Render
  // =========================================================

  return (
    <div className="admin-page">
      {/* Page header */}

      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">
            Catalog
          </span>

          <h1>
            Categories
          </h1>

          <p>
            Manage the product categories
            displayed on your website.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={handleAdd}
        >
          <i className="bi bi-plus-lg" />
          Add Category
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

      {/* Categories section content */}

      <section className="admin-section-settings">
        <div className="admin-section-settings-header">
          <div>
            <h2>
              Categories Section Content
            </h2>

            <p>
              Edit the title and subtitle
              displayed above the Categories
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
              onChange={
                handleSectionChange
              }
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
              onChange={
                handleSectionChange
              }
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
              onChange={
                handleSectionChange
              }
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

      {/* Categories table */}

      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        emptyMessage="No categories have been added yet."
        onEdit={handleEdit}
        editLabel="Edit"
      />

      {/* Pagination */}

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

      {/* Add/Edit category modal */}

      <FormModal
        isOpen={isModalOpen}
        title={
          editingCategory
            ? "Edit Category"
            : "Add Category"
        }
        onSubmit={
          handleSubmit
        }
        onClose={
          handleCloseModal
        }
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

            <span>
              {formError}
            </span>
          </div>
        )}

        {/* Category information */}

        <div className="admin-form-section">
          <div className="admin-form-section-header">
            <h3>
              Category Information
            </h3>

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
                value={
                  form.name_fr
                }
                onChange={
                  handleChange
                }
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
                value={
                  form.name_en
                }
                onChange={
                  handleChange
                }
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
                value={
                  form.description_fr
                }
                onChange={
                  handleChange
                }
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
                value={
                  form.description_en
                }
                onChange={
                  handleChange
                }
                placeholder="Category description"
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