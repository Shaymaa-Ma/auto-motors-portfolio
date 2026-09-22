import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { vehiclesApi } from "../api/endpoints";

import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import ImageUploader from "../components/ImageUploader";

import AdminPagination from "../components/AdminPagination";

const initialForm = {
    type_fr: "",
    type_en: "",
    name_fr: "",
    name_en: "",
    description_fr: "",
    description_en: "",
    icon: "bi-truck",
    image: null,
    display_order: 1,
    is_active: 1,
};

const initialSectionForm = {
    section_title_fr: "",
    section_title_en: "",
    section_subtitle_fr: "",
    section_subtitle_en: "",
};

// Maximum allowed image size: 1 MB
const MAX_IMAGE_SIZE = 1 * 1024 * 1024;

const ITEMS_PER_PAGE = 10;

const vehicleIcons = [
    {
        value: "bi-truck",
        label: "Truck",
    },
    {
        value: "bi-car-front",
        label: "Car",
    },
    {
        value: "bi-bus-front",
        label: "Bus",
    },
    {
        value: "bi-truck-front",
        label: "Truck Front",
    },
    {
        value: "bi-speedometer2",
        label: "Performance",
    },
    {
        value: "bi-gear",
        label: "Automotive",
    },
    {
        value: "bi-tools",
        label: "Maintenance",
    },
    {
        value: "bi-wrench-adjustable",
        label: "Service",
    },
    {
        value: "bi-box-seam",
        label: "Parts",
    },
    {
        value: "bi-boxes",
        label: "Transport / Distribution",
    },
    {
        value: "bi-shield-check",
        label: "Reliability",
    },
    {
        value: "bi-fuel-pump",
        label: "Fuel",
    },
];

// Build vehicle image URL
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

const Vehicles = () => {
    // =========================================
    // DATA
    // =========================================

    const [vehicles, setVehicles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [sectionSaving, setSectionSaving] =
        useState(false);

    // =========================================
    // MESSAGES
    // =========================================

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formError, setFormError] = useState("");

    // =========================================
    // EDIT MODAL
    // =========================================

    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [editingVehicle, setEditingVehicle] =
        useState(null);

    const [form, setForm] = useState(
        initialForm
    );

    // =========================================
    // DELETE
    // =========================================

    const [deleteDialogOpen, setDeleteDialogOpen] =
        useState(false);

    const [deletingVehicle, setDeletingVehicle] =
        useState(null);

    // =========================================
    // SECTION
    // =========================================

    const [sectionForm, setSectionForm] =
        useState(initialSectionForm);

    // =========================================
    // PAGINATION
    // =========================================

    const [currentPage, setCurrentPage] =
        useState(1);

    const [totalItems, setTotalItems] =
        useState(0);

    const [totalPages, setTotalPages] =
        useState(1);

    // =========================================
    // LOAD VEHICLES
    // =========================================

    const loadVehicles = useCallback(
        async (page = 1) => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await vehiclesApi.getAll(
                        page,
                        ITEMS_PER_PAGE
                    );

                const responseData =
                    response?.data ??
                    response ??
                    {};

                const vehicleList =
                    Array.isArray(
                        responseData?.items
                    )
                        ? responseData.items
                        : [];

                setVehicles(vehicleList);

                setCurrentPage(
                    Number(
                        responseData?.page ??
                            page
                    )
                );

                setTotalItems(
                    Number(
                        responseData?.totalItems ??
                            0
                    )
                );

                setTotalPages(
                    Math.max(
                        1,
                        Number(
                            responseData?.totalPages ??
                                1
                        )
                    )
                );

                // ---------------------------------
                // Section content
                // ---------------------------------

                if (vehicleList.length > 0) {
                    const firstVehicle =
                        vehicleList[0];

                    setSectionForm({
                        section_title_fr:
                            firstVehicle.section_title_fr ??
                            "",

                        section_title_en:
                            firstVehicle.section_title_en ??
                            "",

                        section_subtitle_fr:
                            firstVehicle.section_subtitle_fr ??
                            "",

                        section_subtitle_en:
                            firstVehicle.section_subtitle_en ??
                            "",
                    });
                }
            } catch (err) {
                console.error(
                    "Load vehicles error:",
                    err
                );

                console.error(
                    "Server response:",
                    err?.response?.data
                );

                setError(
                    err?.response?.data?.message ||
                        "Failed to load vehicles."
                );
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // =========================================
    // INITIAL LOAD
    // =========================================

    useEffect(() => {
        loadVehicles(1);
    }, [loadVehicles]);

    // =========================================
    // PAGE CHANGE
    // =========================================

    const handlePageChange = (page) => {
        if (
            page < 1 ||
            page > totalPages ||
            page === currentPage
        ) {
            return;
        }

        loadVehicles(page);
    };

    // =========================================
    // VEHICLE FORM CHANGE
    // =========================================

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

    // =========================================
    // SECTION FORM CHANGE
    // =========================================

    const handleSectionChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setSectionForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    // =========================================
    // IMAGE CHANGE
    // =========================================

    const handleImageChange = (file) => {
        const selectedFile =
            file?.target?.files?.[0] ||
            file;

        setFormError("");

        if (!selectedFile) {
            setForm((current) => ({
                ...current,
                image: null,
            }));

            return;
        }

        if (
            selectedFile.size >
            MAX_IMAGE_SIZE
        ) {
            setFormError(
                "Vehicle image size must not exceed 1 MB."
            );

            return;
        }

        setForm((current) => ({
            ...current,

            image:
                selectedFile instanceof File
                    ? selectedFile
                    : null,
        }));
    };

    // =========================================
    // EDIT VEHICLE
    // =========================================

    const handleEdit = (vehicle) => {
        if (!vehicle?.id) {
            setError(
                "Vehicle ID is missing."
            );

            return;
        }

        setEditingVehicle(vehicle);

        setForm({
            type_fr:
                vehicle.type_fr ?? "",

            type_en:
                vehicle.type_en ?? "",

            name_fr:
                vehicle.name_fr ?? "",

            name_en:
                vehicle.name_en ?? "",

            description_fr:
                vehicle.description_fr ??
                "",

            description_en:
                vehicle.description_en ??
                "",

            icon:
                vehicle.icon ||
                "bi-truck",

            // Existing image is handled by
            // ImageUploader currentImage.
            image: null,

            display_order:
                Number(
                    vehicle.display_order
                ) || 1,

            is_active:
                Number(
                    vehicle.is_active
                ) === 1
                    ? 1
                    : 0,
        });

        setFormError("");
        setError("");
        setSuccess("");

        setIsModalOpen(true);
    };

    // =========================================
    // CLOSE EDIT MODAL
    // =========================================

    const handleCloseModal = () => {
        if (saving) {
            return;
        }

        setIsModalOpen(false);
        setEditingVehicle(null);

        setForm({
            ...initialForm,
            image: null,
        });

        setFormError("");
    };

    // =========================================
    // SAVE VEHICLE
    // =========================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setFormError("");
        setError("");
        setSuccess("");

        // --------------------------------------
        // Validation
        // --------------------------------------

        if (!form.type_fr.trim()) {
            setFormError(
                "French vehicle type is required."
            );

            return;
        }

        if (!form.type_en.trim()) {
            setFormError(
                "English vehicle type is required."
            );

            return;
        }

        if (!form.name_fr.trim()) {
            setFormError(
                "French vehicle name is required."
            );

            return;
        }

        if (!form.name_en.trim()) {
            setFormError(
                "English vehicle name is required."
            );

            return;
        }

        if (!editingVehicle) {
            setFormError(
                "No vehicle selected for editing."
            );

            return;
        }

        try {
            setSaving(true);

            const oldOrder =
                Number(
                    editingVehicle.display_order
                ) || 1;

            const requestedOrder =
                Number(
                    form.display_order
                ) || oldOrder;

            // =================================
            // BUILD FORM DATA
            // =================================

            const formData =
                new FormData();

            formData.append(
                "type_fr",
                form.type_fr.trim()
            );

            formData.append(
                "type_en",
                form.type_en.trim()
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
                "icon",
                form.icon ||
                    "bi-truck"
            );

            /*
             * Keep the existing order during
             * the normal update.
             *
             * The dedicated reorder endpoint
             * handles position changes.
             */
            formData.append(
                "display_order",
                String(oldOrder)
            );

            formData.append(
                "is_active",
                Number(form.is_active) ===
                    1
                    ? "1"
                    : "0"
            );

            // ---------------------------------
            // New image
            // ---------------------------------

            if (
                form.image instanceof File
            ) {
                formData.append(
                    "image",
                    form.image
                );
            }

            // =================================
            // UPDATE VEHICLE
            // =================================

            await vehiclesApi.update(
                editingVehicle.id,
                formData
            );

            // =================================
            // REORDER
            // =================================

            if (
                requestedOrder !==
                    oldOrder &&
                requestedOrder > 0
            ) {
                await vehiclesApi.reorder(
                    editingVehicle.id,
                    requestedOrder
                );
            }

            setSuccess(
                "Vehicle updated successfully."
            );

            setIsModalOpen(false);
            setEditingVehicle(null);

            setForm({
                ...initialForm,
                image: null,
            });

            await loadVehicles(
                currentPage
            );
        } catch (err) {
            console.error(
                "Save vehicle error:",
                err
            );

            console.error(
                "Server response:",
                err?.response?.data
            );

            setFormError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to save vehicle."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================
    // SAVE SECTION
    // =========================================

    const handleSaveSection =
        async () => {
            try {
                setSectionSaving(true);
                setError("");
                setSuccess("");

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

                await vehiclesApi.updateSection(
                    sectionData
                );

                setSuccess(
                    "Vehicles section content saved successfully."
                );

                await loadVehicles(
                    currentPage
                );
            } catch (err) {
                console.error(
                    "Save vehicle section error:",
                    err
                );

                console.error(
                    "Server response:",
                    err?.response?.data
                );

                setError(
                    err?.response?.data?.message ||
                        "Failed to save section content."
                );
            } finally {
                setSectionSaving(false);
            }
        };

    // =========================================
    // TOGGLE STATUS
    // =========================================

    const handleToggleStatus =
        async (vehicle) => {
            try {
                setError("");
                setSuccess("");

                const nextStatus =
                    Number(
                        vehicle.is_active
                    ) === 1
                        ? 0
                        : 1;

                const formData =
                    new FormData();

                formData.append(
                    "is_active",
                    String(nextStatus)
                );

                await vehiclesApi.update(
                    vehicle.id,
                    formData
                );

                setSuccess(
                    nextStatus === 1
                        ? "Vehicle activated successfully."
                        : "Vehicle deactivated successfully."
                );

                await loadVehicles(
                    currentPage
                );
            } catch (err) {
                console.error(
                    "Toggle vehicle status error:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                        "Failed to update vehicle status."
                );
            }
        };

    // =========================================
    // DELETE
    // =========================================

    const handleDeleteClick = (
        vehicle
    ) => {
        if (!vehicle?.id) {
            setError(
                "Vehicle ID is missing."
            );

            return;
        }

        setDeletingVehicle(vehicle);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog =
        () => {
            if (deleting) {
                return;
            }

            setDeleteDialogOpen(false);
            setDeletingVehicle(null);
        };

    const handleDelete = async () => {
        if (!deletingVehicle?.id) {
            return;
        }

        try {
            setDeleting(true);
            setError("");
            setSuccess("");

            await vehiclesApi.remove(
                deletingVehicle.id
            );

            setDeleteDialogOpen(false);
            setDeletingVehicle(null);

            setSuccess(
                "Vehicle deleted successfully."
            );

            /*
             * If the deleted vehicle was the
             * only item on the current page,
             * move back one page.
             */
            const pageToLoad =
                vehicles.length === 1 &&
                currentPage > 1
                    ? currentPage - 1
                    : currentPage;

            await loadVehicles(
                pageToLoad
            );
        } catch (err) {
            console.error(
                "Delete vehicle error:",
                err
            );

            console.error(
                "Server response:",
                err?.response?.data
            );

            setError(
                err?.response?.data?.message ||
                    "Failed to delete vehicle."
            );
        } finally {
            setDeleting(false);
        }
    };

    // =========================================
    // TABLE COLUMNS
    // =========================================

    const columns = useMemo(
        () => [
            {
                key: "image",
                label: "Image",

                render: (
                    value,
                    vehicle
                ) => {
                    const imageUrl =
                        getImageUrl(
                            value
                        );

                    return (
                        <div className="admin-vehicle-table-image">
                            {imageUrl ? (
                                <img
                                    src={
                                        imageUrl
                                    }
                                    alt={
                                        vehicle?.name_en ||
                                        "Vehicle"
                                    }
                                    loading="lazy"
                                    decoding="async"
                                />
                            ) : (
                                <div className="admin-vehicle-table-image-empty">
                                    <i className="bi bi-truck" />
                                </div>
                            )}
                        </div>
                    );
                },
            },

            {
                key: "name_fr",
                label: "Vehicle",

                render: (
                    value,
                    vehicle
                ) => (
                    <div className="admin-vehicle-name-cell">
                        <strong>
                            {value ||
                                "Untitled"}
                        </strong>

                        <span>
                            {vehicle?.name_en ||
                                "—"}
                        </span>
                    </div>
                ),
            },

            {
                key: "type_fr",
                label: "Type",

                render: (
                    value,
                    vehicle
                ) => (
                    <div className="admin-vehicle-type-cell">
                        <strong>
                            {value ||
                                "—"}
                        </strong>

                        <span>
                            {vehicle?.type_en ||
                                "—"}
                        </span>
                    </div>
                ),
            },

            {
                key: "icon",
                label: "Icon",

                render: (
                    value
                ) => (
                    <div className="admin-vehicle-icon-cell">
                        <i
                            className={`bi ${
                                value ||
                                "bi-truck"
                            }`}
                        />
                    </div>
                ),
            },

            {
                key: "display_order",
                label: "Order",

                render: (
                    value
                ) => (
                    <span className="admin-order-number">
                        {value ??
                            "—"}
                    </span>
                ),
            },

            {
                key: "is_active",
                label: "Status",

                render: (
                    value,
                    vehicle
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
                                vehicle
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

    // =========================================
    // RENDER
    // =========================================

    return (
        <div className="admin-page">

            {/* =====================================
                PAGE HEADER
            ====================================== */}

            <div className="admin-page-header">
                <div>
                    <span className="admin-page-eyebrow">
                        Catalog
                    </span>

                    <h1>
                        Vehicles
                    </h1>

                    <p>
                        Manage the vehicles
                        displayed on your
                        website.
                    </p>
                </div>
            </div>

            {/* =====================================
                SUCCESS MESSAGE
            ====================================== */}

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

            {/* =====================================
                ERROR MESSAGE
            ====================================== */}

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

            {/* =====================================
                SECTION CONTENT
            ====================================== */}

            <div className="admin-section-settings">
                <div className="admin-section-settings-header">
                    <div>
                        <h2>
                            Vehicles Section
                            Content
                        </h2>

                        <p>
                            Manage the title and
                            subtitle displayed
                            above the vehicles
                            section.
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

                    {/* French title */}

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
                            placeholder="Nos véhicules"
                        />
                    </div>

                    {/* English title */}

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
                            placeholder="Our Vehicles"
                        />
                    </div>

                    {/* French subtitle */}

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
                            placeholder="Découvrez notre gamme de véhicules..."
                        />
                    </div>

                    {/* English subtitle */}

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
                            placeholder="Discover our range of vehicles..."
                        />
                    </div>
                </div>
            </div>

            {/* =====================================
                VEHICLES TABLE
            ====================================== */}

            <div className="admin-vehicles-section">

                <div className="admin-vehicles-section-header">
                    <div>
                        <h2>
                            Vehicle Catalog
                        </h2>

                        <p>
                            {loading
                                ? "Loading vehicles..."
                                : `${totalItems} ${
                                      totalItems ===
                                      1
                                          ? "vehicle"
                                          : "vehicles"
                                  } in the catalog`}
                        </p>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={vehicles}
                    loading={loading}
                    emptyMessage="No vehicles have been added yet."
                    onEdit={
                        handleEdit
                    }
                    onDelete={
                        handleDeleteClick
                    }
                    editLabel="Edit"
                    deleteLabel="Delete"
                />

                {/* =================================
                    PAGINATION
                ================================== */}

                {totalPages > 1 && (
                    <div className="px-3 px-md-4 py-3 border-top">
                        <AdminPagination
                            currentPage={
                                currentPage
                            }
                            totalPages={
                                totalPages
                            }
                            totalItems={
                                totalItems
                            }
                            itemsPerPage={
                                ITEMS_PER_PAGE
                            }
                            onPageChange={
                                handlePageChange
                            }
                        />
                    </div>
                )}
            </div>

            {/* =====================================
                EDIT VEHICLE MODAL
            ====================================== */}

            <FormModal
                isOpen={
                    isModalOpen
                }
                title="Edit Vehicle"
                onSubmit={
                    handleSubmit
                }
                onClose={
                    handleCloseModal
                }
                submitText="Save Changes"
                cancelText="Cancel"
                loading={saving}
                size="large"
            >
                {/* Form error */}

                {formError && (
                    <div className="admin-form-error-box">
                        <i className="bi bi-exclamation-circle" />

                        <span>
                            {formError}
                        </span>
                    </div>
                )}

                {/* =================================
                    IMAGE
                ================================== */}

                <div className="admin-form-section">
                    <div className="admin-form-section-header">
                        <h3>
                            Vehicle Image
                        </h3>

                        <p>
                            Upload the image that
                            will be displayed for
                            this vehicle.
                        </p>
                    </div>

                    <div className="hero-image-notes">
                        <div className="hero-image-note">
                            <div className="hero-image-note-icon">
                                IMAGE
                            </div>

                            <div className="hero-image-note-content">
                                <strong>
                                    Recommended size:
                                    1365 × 768 px
                                </strong>

                                <span>
                                    Aspect ratio: 16:9 ·
                                    Orientation:
                                    Landscape
                                </span>

                                <small>
                                    Use a high-quality
                                    vehicle image that
                                    clearly presents
                                    the vehicle.
                                    Maximum file size:
                                    1 MB.
                                </small>
                            </div>
                        </div>
                    </div>

                    <ImageUploader
                        currentImage={
                            editingVehicle?.image
                        }
                        selectedImage={
                            form.image
                        }
                        onChange={
                            handleImageChange
                        }
                        label="Vehicle Image"
                    />
                </div>

                {/* =================================
                    VEHICLE INFORMATION
                ================================== */}

                <div className="admin-form-section">
                    <div className="admin-form-section-header">
                        <h3>
                            Vehicle Information
                        </h3>

                        <p>
                            Enter the vehicle
                            information in both
                            languages.
                        </p>
                    </div>

                    <div className="admin-form-grid">

                        {/* Type FR */}

                        <div className="admin-form-group">
                            <label htmlFor="type_fr">
                                Vehicle Type
                                (French)
                                <span className="required">
                                    *
                                </span>
                            </label>

                            <input
                                id="type_fr"
                                name="type_fr"
                                type="text"
                                value={
                                    form.type_fr
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Camionnette"
                                required
                            />
                        </div>

                        {/* Type EN */}

                        <div className="admin-form-group">
                            <label htmlFor="type_en">
                                Vehicle Type
                                (English)
                                <span className="required">
                                    *
                                </span>
                            </label>

                            <input
                                id="type_en"
                                name="type_en"
                                type="text"
                                value={
                                    form.type_en
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Light Truck"
                                required
                            />
                        </div>

                        {/* Name FR */}

                        <div className="admin-form-group">
                            <label htmlFor="name_fr">
                                Vehicle Name
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
                                placeholder="Kia"
                                required
                            />
                        </div>

                        {/* Name EN */}

                        <div className="admin-form-group">
                            <label htmlFor="name_en">
                                Vehicle Name
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
                                placeholder="Kia"
                                required
                            />
                        </div>

                        {/* Description FR */}

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
                                placeholder="Description du véhicule..."
                            />
                        </div>

                        {/* Description EN */}

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
                                placeholder="Vehicle description..."
                            />
                        </div>
                    </div>
                </div>

                {/* =================================
                    DISPLAY SETTINGS
                ================================== */}

                <div className="admin-form-section">
                    <div className="admin-form-section-header">
                        <h3>
                            Display Settings
                        </h3>

                        <p>
                            Control the vehicle
                            icon, order and
                            visibility.
                        </p>
                    </div>

                    <div className="admin-form-grid">

                        {/* Icon */}

                        <div className="admin-form-group">
                            <label htmlFor="icon">
                                Vehicle Icon
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
                                {vehicleIcons.map(
                                    (
                                        item
                                    ) => (
                                        <option
                                            key={
                                                item.value
                                            }
                                            value={
                                                item.value
                                            }
                                        >
                                            {
                                                item.label
                                            }
                                        </option>
                                    )
                                )}
                            </select>

                            <small className="admin-form-help">
                                Choose the icon that
                                best represents this
                                vehicle.
                            </small>
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
                                min="1"
                                value={
                                    form.display_order
                                }
                                onChange={
                                    handleChange
                                }
                            />

                            <small className="admin-form-help">
                                Changing the order
                                automatically shifts
                                the other vehicles.
                            </small>
                        </div>

                        {/* Active */}

                        <div className="admin-form-group admin-form-group-full">
                            <label className="admin-checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={
                                        Number(
                                            form.is_active
                                        ) ===
                                        1
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                                <span>
                                    Vehicle is active
                                </span>
                            </label>

                            <small className="admin-form-help">
                                Inactive vehicles
                                will not appear on
                                the public website.
                            </small>
                        </div>
                    </div>
                </div>
            </FormModal>

            {/* =====================================
                DELETE CONFIRMATION
            ====================================== */}

            <ConfirmDialog
                isOpen={
                    deleteDialogOpen
                }
                title="Delete Vehicle"
                message={
                    deletingVehicle
                        ? `Are you sure you want to delete "${deletingVehicle.name_en}"? This action cannot be undone.`
                        : "Are you sure you want to delete this vehicle?"
                }
                confirmText="Delete Vehicle"
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

export default Vehicles;