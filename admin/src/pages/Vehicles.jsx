import {
  useEffect,
  useState,
} from "react";

import { vehiclesApi } from "../api/endpoints";

import AdminPagination from "../components/AdminPagination";
import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";
import ImageUploader from "../components/ImageUploader";
import ConfirmDialog from "../components/ConfirmDialog";

// =========================================================
// INITIAL FORMS
// =========================================================

const initialForm = {
  type_fr: "",
  type_en: "",
  name_fr: "",
  name_en: "",
  description_fr: "",
  description_en: "",
  image: null,
  display_order: 1,
  is_active: 1,
};

const initialSectionForm = {
  section_title_fr: "",
  section_title_en: "",
  section_subtitle_fr: "",
  section_subtitle_en: "",
  icon: "bi-truck",
};

// =========================================================
// PAGINATION
// =========================================================

const ITEMS_PER_PAGE = 10;

// Maximum allowed image size: 1 MB.
const MAX_IMAGE_SIZE =
  1 * 1024 * 1024;

// =========================================================
// VEHICLE TYPES
// =========================================================

const vehicleTypes = [
  {
    value: "light-truck",
    labelFr: "Camionnette",
    labelEn: "Light Truck",
    typeFr: "Camionnette",
    typeEn: "Light Truck",
  },
  {
    value: "heavy-truck",
    labelFr: "Poids lourds",
    labelEn: "Heavy Truck",
    typeFr: "Poids lourds",
    typeEn: "Heavy Truck",
  },
];

// =========================================================
// VEHICLE ICONS
// =========================================================

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

// =========================================================
// COMPONENT
// =========================================================

const Vehicles = () => {
  // =======================================================
  // STATE
  // =======================================================

  const [
    vehicles,
    setVehicles,
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

  // =======================================================
  // MODALS
  // =======================================================

  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState(false);

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    editingVehicle,
    setEditingVehicle,
  ] = useState(null);

  const [
    deletingVehicle,
    setDeletingVehicle,
  ] = useState(null);

  // =======================================================
  // FORMS
  // =======================================================

  const [
    form,
    setForm,
  ] = useState(initialForm);

  const [
    sectionForm,
    setSectionForm,
  ] = useState(
    initialSectionForm
  );

  const [
    formError,
    setFormError,
  ] = useState("");

  // =======================================================
  // PAGINATION
  // =======================================================

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    totalItems,
    setTotalItems,
  ] = useState(0);

  const [
    totalPages,
    setTotalPages,
  ] = useState(0);

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
      process.env
        .REACT_APP_UPLOADS_URL ||
      "http://localhost:5000/uploads";

    return `${uploadsUrl}/${image.replace(
      /^[/\\]+/,
      ""
    )}`;
  };

  // =======================================================
  // FIND VEHICLE TYPE
  // =======================================================

  const getVehicleTypeValue = (
    typeFr,
    typeEn
  ) => {
    const normalizedFr =
      String(typeFr || "")
        .trim()
        .toLowerCase();

    const normalizedEn =
      String(typeEn || "")
        .trim()
        .toLowerCase();

    const matchedType =
      vehicleTypes.find(
        (type) =>
          type.typeFr
            .trim()
            .toLowerCase() ===
            normalizedFr ||
          type.typeEn
            .trim()
            .toLowerCase() ===
            normalizedEn
      );

    return (
      matchedType?.value ||
      ""
    );
  };

  // =======================================================
  // APPLY VEHICLE TYPE
  // =======================================================

  const handleVehicleTypeChange = (
    event
  ) => {
    const selectedValue =
      event.target.value;

    const selectedType =
      vehicleTypes.find(
        (type) =>
          type.value ===
          selectedValue
      );

    if (!selectedType) {
      setForm(
        (current) => ({
          ...current,
          type_fr: "",
          type_en: "",
        })
      );

      setFormError("");

      return;
    }

    setForm(
      (current) => ({
        ...current,
        type_fr:
          selectedType.typeFr,
        type_en:
          selectedType.typeEn,
      })
    );

    setFormError("");
  };

  // =======================================================
  // LOAD CURRENT PAGE
  // =======================================================

  const loadVehicles = async (
    page = currentPage
  ) => {
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

      const vehicleData =
        responseData?.items ??
        [];

      setVehicles(
        Array.isArray(vehicleData)
          ? vehicleData
          : []
      );

      const returnedTotalItems =
        Number(
          responseData?.totalItems
        ) || 0;

      const returnedTotalPages =
        Number(
          responseData?.totalPages
        ) || 0;

      setTotalItems(
        returnedTotalItems
      );

      setTotalPages(
        returnedTotalPages
      );

      // -----------------------------------------------------
      // Keep current page valid
      // -----------------------------------------------------

      if (
        returnedTotalPages > 0 &&
        page > returnedTotalPages
      ) {
        setCurrentPage(
          returnedTotalPages
        );
      }

      if (
        returnedTotalPages === 0
      ) {
        setCurrentPage(1);
      }

      // -----------------------------------------------------
      // Load section content from first page
      // -----------------------------------------------------

      if (
        page === 1 &&
        vehicleData.length > 0
      ) {
        const firstVehicle =
          vehicleData[0];

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

          icon:
            firstVehicle.icon ||
            "bi-truck",
        });
      }

      return {
        items:
          vehicleData,

        totalItems:
          returnedTotalItems,

        totalPages:
          returnedTotalPages,
      };
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

      return {
        items: [],
        totalItems: 0,
        totalPages: 0,
      };
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // INITIAL LOAD / PAGE CHANGE
  // =======================================================

  useEffect(() => {
    loadVehicles(
      currentPage
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

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
  // ADD VEHICLE
  // =======================================================

  const handleAdd = () => {
    setEditingVehicle(null);

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

  // =======================================================
  // EDIT VEHICLE
  // =======================================================

  const handleEdit = (
    vehicle
  ) => {
    if (!vehicle?.id) {
      console.error(
        "Cannot edit vehicle: missing ID",
        vehicle
      );

      setError(
        "Unable to edit this vehicle."
      );

      return;
    }

    setEditingVehicle(
      vehicle
    );

    /*
     * Keep image as null while editing.
     *
     * ImageUploader receives the existing
     * image separately through currentImage.
     *
     * A new File is only placed into form.image
     * when the user selects a new image.
     */

    setForm({
      type_fr:
        vehicle.type_fr ??
        "",

      type_en:
        vehicle.type_en ??
        "",

      name_fr:
        vehicle.name_fr ??
        "",

      name_en:
        vehicle.name_en ??
        "",

      description_fr:
        vehicle.description_fr ??
        "",

      description_en:
        vehicle.description_en ??
        "",

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

  // =======================================================
  // IMAGE CHANGE
  // =======================================================

  const handleImageChange = (
    file
  ) => {
    setFormError("");

    // User removed / cleared the selected image.
    if (!file) {
      setForm(
        (current) => ({
          ...current,
          image: null,
        })
      );

      return;
    }

    // -----------------------------------------------------
    // Validate file size
    // -----------------------------------------------------

    if (
      file.size >
      MAX_IMAGE_SIZE
    ) {
      setFormError(
        "Vehicle image size must not exceed 1 MB."
      );

      setForm(
        (current) => ({
          ...current,
          image: null,
        })
      );

      return;
    }

    // -----------------------------------------------------
    // Store the actual File object
    // -----------------------------------------------------

    setForm(
      (current) => ({
        ...current,
        image: file,
      })
    );
  };

  // =======================================================
  // CLOSE FORM MODAL
  // =======================================================

  const handleCloseModal =
    () => {
      if (saving) {
        return;
      }

      setIsModalOpen(false);
      setEditingVehicle(null);

      setForm({
        ...initialForm,
      });

      setFormError("");
    };

  // =======================================================
  // SAVE VEHICLE SECTION
  // =======================================================

  const handleSaveSection =
    async (event) => {
      event.preventDefault();

      if (sectionSaving) {
        return;
      }

      setError("");
      setSuccess("");
      setSectionMessage("");

      if (
        totalItems === 0
      ) {
        setError(
          "Add at least one vehicle before editing the Vehicles section content."
        );

        return;
      }

      try {
        setSectionSaving(
          true
        );

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
        // One shared icon for both vehicle types
        // ---------------------------------------------------

        formData.append(
          "icon",
          sectionForm.icon ||
            "bi-truck"
        );

        await vehiclesApi.updateSection(
          formData
        );

        await loadVehicles(
          currentPage
        );

        setSectionMessage(
          "Vehicles section content saved successfully."
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
          "Failed to save Vehicles section content."
        );
      } finally {
        setSectionSaving(
          false
        );
      }
    };

  // =======================================================
  // SAVE VEHICLE
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
    // Validate vehicle type
    // -----------------------------------------------------

    /*
     * IMPORTANT:
     *
     * Do not compare form.type_fr / form.type_en
     * directly with === here.
     *
     * Older database records may contain differences
     * in capitalization or whitespace.
     *
     * getVehicleTypeValue() normalizes both values
     * before matching them.
     */

    const selectedVehicleTypeValue =
      getVehicleTypeValue(
        form.type_fr,
        form.type_en
      );

    const selectedVehicleType =
      vehicleTypes.find(
        (type) =>
          type.value ===
          selectedVehicleTypeValue
      );

    if (
      !selectedVehicleType
    ) {
      setFormError(
        "Please select a valid vehicle type."
      );

      return;
    }

    // -----------------------------------------------------
    // Validate French name
    // -----------------------------------------------------

    if (
      !form.name_fr.trim()
    ) {
      setFormError(
        "French vehicle name is required."
      );

      return;
    }

    // -----------------------------------------------------
    // Validate English name
    // -----------------------------------------------------

    if (
      !form.name_en.trim()
    ) {
      setFormError(
        "English vehicle name is required."
      );

      return;
    }

    // -----------------------------------------------------
    // Image required on create
    // -----------------------------------------------------

    if (
      !editingVehicle &&
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
      editingVehicle &&
      !editingVehicle.id
    ) {
      setFormError(
        "Unable to update this vehicle because its ID is missing."
      );

      return;
    }

    try {
      setSaving(true);

      // ---------------------------------------------------
      // Calculate requested order
      // ---------------------------------------------------

      const requestedOrder =
        Math.min(
          Math.max(
            Number(
              form.display_order
            ) || 1,
            1
          ),

          editingVehicle
            ? Math.max(
                totalItems,
                1
              )
            : totalItems + 1
        );

      // ---------------------------------------------------
      // Build FormData
      // ---------------------------------------------------

      const formData =
        new FormData();

      /*
       * Always send the canonical values from
       * vehicleTypes instead of sending potentially
       * inconsistent old database values.
       *
       * This fixes editing older vehicles while
       * keeping the same two vehicle types.
       */

      formData.append(
        "type_fr",
        selectedVehicleType.typeFr
      );

      formData.append(
        "type_en",
        selectedVehicleType.typeEn
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

      /*
       * The vehicle icon is intentionally NOT
       * included here.
       *
       * The icon is a shared Vehicles Section
       * setting and is saved separately above.
       */

      /*
       * Keep the existing order during the normal
       * create/update request.
       *
       * Reordering is handled separately using
       * vehiclesApi.reorder().
       */

      formData.append(
        "display_order",
        String(
          editingVehicle
            ? Number(
                editingVehicle.display_order
              ) || 1
            : totalItems + 1
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
      // IMAGE
      // ---------------------------------------------------

      if (form.image) {
        formData.append(
          "image",
          form.image
        );
      }

      let savedVehicleId =
        null;

      // ===================================================
      // UPDATE
      // ===================================================

      if (
        editingVehicle
      ) {
        savedVehicleId =
          editingVehicle.id;

        await vehiclesApi.update(
          editingVehicle.id,
          formData
        );

        const oldOrder =
          Number(
            editingVehicle.display_order
          ) || 1;

        if (
          oldOrder !==
          requestedOrder
        ) {
          await vehiclesApi.reorder(
            editingVehicle.id,
            requestedOrder
          );
        }

        setSuccess(
          "Vehicle updated successfully."
        );
      }

      // ===================================================
      // CREATE
      // ===================================================

      else {
        const response =
          await vehiclesApi.create(
            formData
          );

        savedVehicleId =
          response?.data?.id ??
          response?.data?.data?.id ??
          response?.data?.insertId ??
          null;

        /*
         * The create endpoint should return
         * the newly created vehicle ID.
         *
         * Reordering is performed only when
         * the ID is available.
         */

        if (
          savedVehicleId
        ) {
          await vehiclesApi.reorder(
            savedVehicleId,
            requestedOrder
          );
        }

        setSuccess(
          "Vehicle created successfully."
        );
      }

      // ---------------------------------------------------
      // Close modal
      // ---------------------------------------------------

      setIsModalOpen(false);
      setEditingVehicle(null);

      setForm({
        ...initialForm,
      });

      setFormError("");

      // ---------------------------------------------------
      // Reload current page
      // ---------------------------------------------------

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

  // =======================================================
  // TOGGLE STATUS
  // =======================================================

  const handleToggleStatus =
    async (vehicle) => {
      if (!vehicle?.id) {
        setError(
          "Unable to update vehicle status because the vehicle ID is missing."
        );

        return;
      }

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

        console.error(
          "Server response:",
          err?.response?.data
        );

        setError(
          err?.response?.data?.message ||
          "Failed to update vehicle status."
        );
      }
    };

  // =======================================================
  // OPEN DELETE DIALOG
  // =======================================================

  const handleDeleteClick =
    (vehicle) => {
      if (!vehicle?.id) {
        setError(
          "Unable to delete this vehicle because the vehicle ID is missing."
        );

        return;
      }

      setDeletingVehicle(
        vehicle
      );

      setDeleteDialogOpen(
        true
      );

      setError("");
      setSuccess("");
    };

  // =======================================================
  // CLOSE DELETE DIALOG
  // =======================================================

  const handleCloseDeleteDialog =
    () => {
      if (deleting) {
        return;
      }

      setDeleteDialogOpen(
        false
      );

      setDeletingVehicle(
        null
      );
    };

  // =======================================================
  // DELETE VEHICLE
  // =======================================================

  const handleDelete =
    async () => {
      if (deleting) {
        return;
      }

      if (
        !deletingVehicle?.id
      ) {
        setDeleteDialogOpen(
          false
        );

        setDeletingVehicle(
          null
        );

        setError(
          "Unable to delete the vehicle because its ID is missing."
        );

        return;
      }

      try {
        setDeleting(true);

        setError("");
        setSuccess("");

        await vehiclesApi.remove(
          deletingVehicle.id
        );

        // ---------------------------------------------------
        // Normalize orders on backend
        // ---------------------------------------------------

        await vehiclesApi.normalizeOrders();

        // ---------------------------------------------------
        // Determine next page
        // ---------------------------------------------------

        let nextPage =
          currentPage;

        if (
          currentPage > 1 &&
          vehicles.length === 1
        ) {
          nextPage =
            currentPage - 1;
        }

        setDeleteDialogOpen(
          false
        );

        setDeletingVehicle(
          null
        );

        // ---------------------------------------------------
        // Reload
        // ---------------------------------------------------

        if (
          nextPage !==
          currentPage
        ) {
          setCurrentPage(
            nextPage
          );
        } else {
          await loadVehicles(
            currentPage
          );
        }

        setSuccess(
          "Vehicle deleted successfully."
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

  // =======================================================
  // TABLE COLUMNS
  // =======================================================

  const columns = [
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
                src={imageUrl}
                alt={
                  vehicle?.name_en ||
                  "Vehicle"
                }
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="admin-vehicle-table-image-empty">
                <i
                  className="bi bi-truck"
                  aria-hidden="true"
                />
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
        row
      ) => (
        <div className="admin-vehicle-name-cell">
          <strong>
            {value ||
              "Untitled"}
          </strong>

          <span>
            {row.name_en ||
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
        row
      ) => (
        <div className="admin-vehicle-type-cell">
          <strong>
            {value ||
              "—"}
          </strong>

          <span>
            {row.type_en ||
              "—"}
          </span>
        </div>
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
          {Number(value) ||
            0}
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
            Number(value) === 1
              ? "active"
              : "inactive"
          }`}
          onClick={() =>
            handleToggleStatus(
              row
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
          <span className="admin-page-eyebrow">
            Website
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
          VEHICLES SECTION CONTENT
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
              Vehicles Section Content
            </h2>

            <p>
              Edit the title,
              subtitle and icon
              displayed above the
              vehicles section on
              your website.
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

          <div className="admin-form-group">
            <label htmlFor="vehicles_section_title_fr">
              Section Title (French)
            </label>

            <input
              id="vehicles_section_title_fr"
              name="section_title_fr"
              type="text"
              value={
                sectionForm.section_title_fr
              }
              onChange={
                handleSectionChange
              }
              placeholder="Nos véhicules"
              disabled={
                totalItems === 0 ||
                sectionSaving
              }
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="vehicles_section_title_en">
              Section Title (English)
            </label>

            <input
              id="vehicles_section_title_en"
              name="section_title_en"
              type="text"
              value={
                sectionForm.section_title_en
              }
              onChange={
                handleSectionChange
              }
              placeholder="Our Vehicles"
              disabled={
                totalItems === 0 ||
                sectionSaving
              }
            />
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="vehicles_section_subtitle_fr">
              Section Subtitle (French)
            </label>

            <textarea
              id="vehicles_section_subtitle_fr"
              name="section_subtitle_fr"
              value={
                sectionForm.section_subtitle_fr
              }
              onChange={
                handleSectionChange
              }
              placeholder="Découvrez notre gamme de véhicules..."
              rows="3"
              disabled={
                totalItems === 0 ||
                sectionSaving
              }
            />
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="vehicles_section_subtitle_en">
              Section Subtitle (English)
            </label>

            <textarea
              id="vehicles_section_subtitle_en"
              name="section_subtitle_en"
              value={
                sectionForm.section_subtitle_en
              }
              onChange={
                handleSectionChange
              }
              placeholder="Discover our range of vehicles..."
              rows="3"
              disabled={
                totalItems === 0 ||
                sectionSaving
              }
            />
          </div>

          {/* =================================================
              SHARED VEHICLE ICON
              ================================================= */}

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="vehicles_section_icon">
              Vehicle Section Icon
            </label>

            <select
              id="vehicles_section_icon"
              name="icon"
              value={
                sectionForm.icon ||
                "bi-truck"
              }
              onChange={
                handleSectionChange
              }
              disabled={
                totalItems === 0 ||
                sectionSaving
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
                    {item.label}
                  </option>
                )
              )}
            </select>

            <small className="admin-form-help">
              This icon is shared by both
              Camionnette and Poids lourds
              vehicle types.
            </small>
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
          ADD VEHICLE BUTTON
          =================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "flex-end",
          marginTop: "24px",
          marginBottom: "16px",
        }}
      >
        <button
          type="button"
          className="admin-primary-button"
          onClick={
            handleAdd
          }
        >
          <i className="bi bi-plus-lg" />
          Add Vehicle
        </button>
      </div>

      {/* ===================================================
          VEHICLE TABLE
          =================================================== */}

      <DataTable
        columns={
          columns
        }
        data={
          vehicles
        }
        loading={
          loading
        }
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

      {/* ===================================================
          BACKEND PAGINATION
          =================================================== */}

      <AdminPagination
        currentPage={
          currentPage
        }
        totalItems={
          totalItems
        }
        itemsPerPage={
          ITEMS_PER_PAGE
        }
        onPageChange={
          setCurrentPage
        }
      />

      {/* ===================================================
          ADD / EDIT VEHICLE MODAL
          =================================================== */}

      <FormModal
        isOpen={
          isModalOpen
        }
        title={
          editingVehicle
            ? "Edit Vehicle"
            : "Add Vehicle"
        }
        onSubmit={
          handleSubmit
        }
        onClose={
          handleCloseModal
        }
        submitText={
          editingVehicle
            ? "Update Vehicle"
            : "Add Vehicle"
        }
        cancelText="Cancel"
        loading={
          saving
        }
        size="large"
      >

        {/* =================================================
            FORM ERROR
            ================================================= */}

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
                  Orientation: Landscape
                </span>

                <small>
                  Use a high-quality
                  vehicle image that
                  clearly presents the
                  vehicle. Maximum file
                  size: 1 MB.
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

        {/* =================================================
            VEHICLE INFORMATION
            ================================================= */}

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

            <div className="admin-form-group admin-form-group-full">

              <label htmlFor="vehicle_type">
                Vehicle Type

                <span className="required">
                  *
                </span>
              </label>

              <select
                id="vehicle_type"
                name="vehicle_type"
                value={getVehicleTypeValue(
                  form.type_fr,
                  form.type_en
                )}
                onChange={
                  handleVehicleTypeChange
                }
                required
                disabled={
                  saving
                }
              >
                <option value="">
                  Select vehicle type
                </option>

                {vehicleTypes.map(
                  (
                    type
                  ) => (
                    <option
                      key={
                        type.value
                      }
                      value={
                        type.value
                      }
                    >
                      {type.labelFr} /{" "}
                      {type.labelEn}
                    </option>
                  )
                )}
              </select>

              <small className="admin-form-help">
                Select one of the two
                available vehicle types.
              </small>

            </div>

            <div className="admin-form-group">
              <label htmlFor="name_fr">
                Vehicle Name (French)

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
                disabled={
                  saving
                }
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="name_en">
                Vehicle Name (English)

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
                disabled={
                  saving
                }
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
                placeholder="Description du véhicule..."
                rows="4"
                disabled={
                  saving
                }
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
                placeholder="Vehicle description..."
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
              Control the vehicle
              order and visibility.
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
                max={
                  editingVehicle
                    ? Math.max(
                        totalItems,
                        1
                      )
                    : totalItems + 1
                }
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

              <small className="admin-form-help">
                Changing the order
                automatically shifts
                the other vehicles.
              </small>

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
                  disabled={
                    saving
                  }
                />

                <span>
                  Vehicle is active
                </span>

              </label>

              <small className="admin-form-help">
                Inactive vehicles will
                not appear on the
                public website.
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
        title="Delete Vehicle"
        message={
          deletingVehicle
            ? `Are you sure you want to delete "${
                deletingVehicle.name_en ||
                deletingVehicle.name_fr ||
                "this vehicle"
              }"? This action cannot be undone.`
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
        loading={
          deleting
        }
        danger
      />

    </div>
  );
};

export default Vehicles;