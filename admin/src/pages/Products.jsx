import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  productsApi,
  categoriesApi,
} from "../api/endpoints";

import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import ImageUploader from "../components/ImageUploader";

const initialForm = {
  category_id: "",
  name_fr: "",
  name_en: "",
  description_fr: "",
  description_en: "",
  price: "",
  image_number: "",
  image: null,
  display_order: 0,
  is_active: 1,
};

// Build a product image URL
const getImageUrl = (image) => {
  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
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

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [deletingProduct, setDeletingProduct] =
    useState(null);

  const [form, setForm] = useState(initialForm);

  // Load all products for Admin
  const loadProducts = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await productsApi.getAll();

        const productData =
          response?.data ??
          response ??
          [];

        setProducts(
          Array.isArray(productData)
            ? productData
            : []
        );
      } catch (err) {
        console.error(
          "Load products error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to load products."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load all categories
  const loadCategories = useCallback(
    async () => {
      try {
        setCategoriesLoading(true);

        const response =
          await categoriesApi.getAll();

        const categoryData =
          response?.data ??
          response ??
          [];

        setCategories(
          Array.isArray(categoryData)
            ? categoryData
            : []
        );
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
        setCategoriesLoading(false);
      }
    },
    []
  );

  // Load products and categories
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [
    loadProducts,
    loadCategories,
  ]);

  // Update form field
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

  // Handle image selection
  const handleImageChange = (file) => {
    setForm((current) => ({
      ...current,
      image: file,
    }));

    setFormError("");
  };

  // Open Add Product modal
  const handleAdd = () => {
    setEditingProduct(null);

    setForm({
      ...initialForm,
      display_order: products.length,
    });

    setFormError("");
    setError("");
    setSuccess("");

    setIsModalOpen(true);
  };

  // Open Edit Product modal
  const handleEdit = (product) => {
    setEditingProduct(product);

    setForm({
      category_id:
        product.category_id ?? "",

      name_fr:
        product.name_fr ?? "",

      name_en:
        product.name_en ?? "",

      description_fr:
        product.description_fr ?? "",

      description_en:
        product.description_en ?? "",

      price:
        product.price ?? "",

      image_number:
        product.image_number ?? "",

      image: null,

      display_order:
        product.display_order ?? 0,

      is_active:
        Number(product.is_active) === 1
          ? 1
          : 0,
    });

    setFormError("");
    setError("");
    setSuccess("");

    setIsModalOpen(true);
  };

  // Close Add/Edit modal
  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setEditingProduct(null);

    setForm({
      ...initialForm,
    });

    setFormError("");
  };

  // Save product
  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setError("");
    setSuccess("");

    if (!form.category_id) {
      setFormError(
        "Please select a category."
      );

      return;
    }

    if (!form.name_fr.trim()) {
      setFormError(
        "French product name is required."
      );

      return;
    }

    if (!form.name_en.trim()) {
      setFormError(
        "English product name is required."
      );

      return;
    }

    // Image is required when creating a product
    if (
      !editingProduct &&
      !form.image
    ) {
      setFormError(
        "Please select a product image."
      );

      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append(
        "category_id",
        form.category_id
      );

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
        "price",
        form.price.trim()
      );

      formData.append(
        "image_number",
        form.image_number.trim()
      );

      formData.append(
        "display_order",
        Number(
          form.display_order
        ) || 0
      );

      formData.append(
        "is_active",
        Number(
          form.is_active
        ) === 1
          ? 1
          : 0
      );

      // Add image only when a new image is selected
      if (form.image) {
        formData.append(
          "image",
          form.image
        );
      }

      if (editingProduct) {
        await productsApi.update(
          editingProduct.id,
          formData
        );

        setSuccess(
          "Product updated successfully."
        );
      } else {
        await productsApi.create(
          formData
        );

        setSuccess(
          "Product created successfully."
        );
      }

      setIsModalOpen(false);
      setEditingProduct(null);

      setForm({
        ...initialForm,
      });

      await loadProducts();
    } catch (err) {
      console.error(
        "Save product error:",
        err
      );

      setFormError(
        err?.response?.data?.message ||
          "Failed to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  // Toggle product status
  const handleToggleStatus = async (
    product
  ) => {
    try {
      setError("");
      setSuccess("");

      const nextStatus =
        Number(product.is_active) === 1
          ? 0
          : 1;

      const formData = new FormData();

      formData.append(
        "is_active",
        nextStatus
      );

      await productsApi.update(
        product.id,
        formData
      );

      setSuccess(
        nextStatus === 1
          ? "Product activated successfully."
          : "Product deactivated successfully."
      );

      await loadProducts();
    } catch (err) {
      console.error(
        "Toggle product status error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to update product status."
      );
    }
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (
    product
  ) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(false);
    setDeletingProduct(null);
  };

  // Delete the selected product
  const handleDelete = async () => {
    if (!deletingProduct) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await productsApi.remove(
        deletingProduct.id
      );

      setSuccess(
        "Product deleted successfully."
      );

      setDeleteDialogOpen(false);
      setDeletingProduct(null);

      await loadProducts();
    } catch (err) {
      console.error(
        "Delete product error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete product."
      );
    } finally {
      setDeleting(false);
    }
  };

  // Product table columns
  const columns = useMemo(
    () => [
      {
        key: "image",
        label: "Image",

        render: (value, product) => (
          <div className="admin-product-table-image">
            {value ? (
              <img
                src={getImageUrl(value)}
                alt={
                  product.name_en ||
                  "Product"
                }
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="admin-product-table-image-empty">
                <i className="bi bi-image" />
              </div>
            )}
          </div>
        ),
      },

      {
        key: "name_fr",
        label: "Product",

        render: (
          value,
          product
        ) => (
          <div className="admin-product-name-cell">
            <strong>
              {value || "Untitled"}
            </strong>

            <span>
              {product.name_en || "—"}
            </span>
          </div>
        ),
      },

      {
        key: "category_name_en",
        label: "Category",

        render: (
          value,
          product
        ) => (
          <div className="admin-product-category-cell">
            <strong>
              {value || "—"}
            </strong>

            {product.category_name_fr && (
              <span>
                {product.category_name_fr}
              </span>
            )}
          </div>
        ),
      },

      {
        key: "price",
        label: "Price",

        render: (value) => (
          <span className="admin-product-price">
            {value || "—"}
          </span>
        ),
      },

      {
        key: "image_number",
        label: "Image No.",

        render: (value) => (
          <span className="admin-product-image-number">
            {value || "—"}
          </span>
        ),
      },

      {
        key: "display_order",
        label: "Order",

        render: (value) => (
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
          product
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
                product
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
    ],
    []
  );

  return (
    <div className="admin-page">
      {/* Page header */}
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">
            Catalog
          </span>

          <h1>
            Products
          </h1>

          <p>
            Manage the automotive
            products displayed on
            your website.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={handleAdd}
        >
          <i className="bi bi-plus-lg" />

          Add Product
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

      {/* Products section */}
      <div className="admin-products-section">
        <div className="admin-products-section-header">
          <div>
            <h2>
              Product Catalog
            </h2>

            <p>
              {loading
                ? "Loading products..."
                : `${products.length} ${
                    products.length === 1
                      ? "product"
                      : "products"
                  } in the catalog`}
            </p>
          </div>
        </div>

        {/* Products table */}
        <DataTable
          columns={columns}
          data={products}
          loading={
            loading ||
            categoriesLoading
          }
          emptyMessage="No products have been added yet."
          onEdit={handleEdit}
          onDelete={
            handleDeleteClick
          }
          editLabel="Edit"
          deleteLabel="Delete"
        />
      </div>

      {/* Add/Edit product modal */}
      <FormModal
        isOpen={isModalOpen}
        title={
          editingProduct
            ? "Edit Product"
            : "Add Product"
        }
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
        submitText={
          editingProduct
            ? "Save Changes"
            : "Add Product"
        }
        cancelText="Cancel"
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

        {/* Product image */}
        <div className="admin-form-section">
          <div className="admin-form-section-header">
            <h3>
              Product Image
            </h3>

            <p>
              Upload the image that
              will be displayed for
              this product.
            </p>
          </div>

          <ImageUploader
            currentImage={
              editingProduct?.image
            }
            selectedImage={
              form.image
            }
            onChange={
              handleImageChange
            }
            label="Product Image"
          />
        </div>

        {/* Product information */}
        <div className="admin-form-section">
          <div className="admin-form-section-header">
            <h3>
              Product Information
            </h3>

            <p>
              Enter the product
              information in both
              languages.
            </p>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="category_id">
                Category
                <span className="required">
                  *
                </span>
              </label>

              <select
                id="category_id"
                name="category_id"
                value={
                  form.category_id
                }
                onChange={
                  handleChange
                }
                disabled={
                  categoriesLoading
                }
                required
              >
                <option value="">
                  {categoriesLoading
                    ? "Loading categories..."
                    : "Select a category"}
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {category.name_en}

                      {category.name_fr
                        ? ` — ${category.name_fr}`
                        : ""}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="admin-form-group">
              <label htmlFor="price">
                Price
              </label>

              <input
                id="price"
                name="price"
                type="text"
                value={
                  form.price
                }
                onChange={
                  handleChange
                }
                placeholder="70 $"
              />

              <small className="admin-form-help">
                Enter the price
                together with its
                currency.
              </small>
            </div>

            <div className="admin-form-group">
              <label htmlFor="name_fr">
                Product Name
                (French)
                <span className="required">
                  *
                </span>
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
                placeholder="Nom du produit"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="name_en">
                Product Name
                (English)
                <span className="required">
                  *
                </span>
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
                placeholder="Product name"
                required
              />
            </div>

            <div className="admin-form-group admin-form-group-full">
              <label htmlFor="description_fr">
                Description
                (French)
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
                placeholder="Description du produit..."
              />
            </div>

            <div className="admin-form-group admin-form-group-full">
              <label htmlFor="description_en">
                Description
                (English)
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
                placeholder="Product description..."
              />
            </div>
          </div>
        </div>

        {/* Product display settings */}
        <div className="admin-form-section">
          <div className="admin-form-section-header">
            <h3>
              Display Settings
            </h3>

            <p>
              Control the product
              order, image number and
              visibility.
            </p>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="image_number">
                Image Number
              </label>

              <input
                id="image_number"
                name="image_number"
                type="text"
                value={
                  form.image_number
                }
                onChange={
                  handleChange
                }
                placeholder="01"
              />

              <small className="admin-form-help">
                Optional number
                displayed with the
                product image.
              </small>
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
                  Product is active
                </span>
              </label>

              <small className="admin-form-help">
                Inactive products
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
        title="Delete Product"
        message={
          deletingProduct
            ? `Are you sure you want to delete "${deletingProduct.name_en}"? This action cannot be undone.`
            : "Are you sure you want to delete this product?"
        }
        confirmText="Delete Product"
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

export default Products;