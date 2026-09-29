import { useEffect, useState } from "react";

import { usersApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";


// =========================================================
// INITIAL FORM
// =========================================================

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  role: "Employee",
};


// =========================================================
// PROFILE COMPONENT
// =========================================================

const Profile = () => {
  const { admin } = useAuth();


  // =========================================================
  // ROLE
  // =========================================================

  const isSuperAdmin =
    admin?.role === "super_admin";


  // =========================================================
  // ROLE DISPLAY
  // =========================================================

  const getRoleLabel = (role) => {
    if (role === "super_admin") {
      return "Super Admin";
    }

    if (!role) {
      return "Employee";
    }

    return role;
  };


  // =========================================================
  // USERS STATE
  // =========================================================

  const [users, setUsers] = useState([]);

  const [loadingUsers, setLoadingUsers] =
    useState(isSuperAdmin);

  const [saving, setSaving] =
    useState(false);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showAddForm, setShowAddForm] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showProfilePassword, setShowProfilePassword] =
    useState(false);

  const [showEditUserPassword, setShowEditUserPassword] =
    useState(false);


  // =========================================================
  // PROFILE EDITING
  // =========================================================

  const [editingProfile, setEditingProfile] =
    useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });


  // =========================================================
  // USER EDITING
  // =========================================================

  const [editingUser, setEditingUser] =
    useState(null);

  const [editUserForm, setEditUserForm] =
    useState(INITIAL_FORM);


  // =========================================================
  // CREATE USER FORM
  // =========================================================

  const [formData, setFormData] =
    useState(INITIAL_FORM);


  // =========================================================
  // LOAD ADMINISTRATORS
  // =========================================================

  const loadUsers = async () => {
    if (!isSuperAdmin) {
      setUsers([]);
      setLoadingUsers(false);

      return;
    }


    try {
      setLoadingUsers(true);
      setError("");


      const response =
        await usersApi.getAll();


      if (!response?.success) {
        setError(
          response?.message ||
            "Unable to load administrators."
        );

        return;
      }


      setUsers(
        Array.isArray(response.users)
          ? response.users
          : []
      );

    } catch (error) {

      console.error(
        "Load administrators error:",
        error
      );


      setError(
        error.response?.data?.message ||
          "Unable to load administrators."
      );

    } finally {
      setLoadingUsers(false);
    }
  };


  // =========================================================
  // LOAD USERS WHEN PROFILE OPENS
  // =========================================================

  useEffect(() => {
    if (isSuperAdmin) {
      loadUsers();
    } else {
      setLoadingUsers(false);
    }
  }, [isSuperAdmin]);


  // =========================================================
  // LOAD CURRENT PROFILE
  // =========================================================

  useEffect(() => {
    if (!admin) {
      return;
    }


    setProfileForm({
      name: admin.name || "",
      email: admin.email || "",
      password: "",
      role: admin.role || "",
    });

  }, [admin]);


  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;


    setFormData((current) => ({
      ...current,
      [name]: value,
    }));


    setError("");
    setSuccess("");
  };


  // =========================================================
  // PROFILE FORM CHANGE
  // =========================================================

  const handleProfileChange = (event) => {
    const {
      name,
      value,
    } = event.target;


    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));


    setError("");
    setSuccess("");
  };


  // =========================================================
  // EDIT USER FORM CHANGE
  // =========================================================

  const handleEditUserChange = (event) => {
    const {
      name,
      value,
    } = event.target;


    setEditUserForm((current) => ({
      ...current,
      [name]: value,
    }));


    setError("");
    setSuccess("");
  };


  // =========================================================
  // START EDIT PROFILE
  // =========================================================

  const handleEditProfile = () => {
    if (!admin) {
      return;
    }


    setError("");
    setSuccess("");


    setProfileForm({
      name: admin.name || "",
      email: admin.email || "",
      password: "",
      role: admin.role || "",
    });


    setShowProfilePassword(false);

    setEditingProfile(true);

    // Close other forms if necessary.
    setShowAddForm(false);
    setEditingUser(null);
  };


  // =========================================================
  // CANCEL EDIT PROFILE
  // =========================================================

  const handleCancelEditProfile = () => {
    if (savingProfile) {
      return;
    }


    setEditingProfile(false);

    setShowProfilePassword(false);

    setError("");


    setProfileForm({
      name: admin?.name || "",
      email: admin?.email || "",
      password: "",
      role: admin?.role || "",
    });
  };


  // =========================================================
  // SAVE MY PROFILE
  // =========================================================

  const handleSaveProfile = async (
    event
  ) => {

    event.preventDefault();


    setError("");
    setSuccess("");


    const name =
      profileForm.name.trim();

    const email =
      profileForm.email
        .trim()
        .toLowerCase();

    const password =
      profileForm.password;


    // =======================================================
    // VALIDATION
    // =======================================================

    if (!name || !email) {
      setError(
        "Name and email are required."
      );

      return;
    }


    if (name.length < 2) {
      setError(
        "Name must contain at least 2 characters."
      );

      return;
    }


    if (
      password &&
      password.length < 8
    ) {
      setError(
        "Password must contain at least 8 characters."
      );

      return;
    }


    // =======================================================
    // UPDATE PROFILE
    // =======================================================

    try {
      setSavingProfile(true);


      /*
       * IMPORTANT:
       *
       * Your backend currently requires the role field.
       *
       * The Super Admin cannot edit their own role,
       * but we send the existing role value exactly as
       * stored in the database.
       *
       * Example:
       *
       * super_admin -> Super Admin in the UI
       * super_admin -> super_admin in the API
       */

      const data = {
        name,
        email,
        role: profileForm.role,
      };


      // -----------------------------------------------------
      // Password is only sent when entered.
      // -----------------------------------------------------

      if (password) {
        data.password = password;
      }


      const response =
        await usersApi.updateMyProfile(
          data
        );


      if (!response?.success) {
        setError(
          response?.message ||
            "Unable to update your profile."
        );

        return;
      }


      setSuccess(
        response.message ||
          "Your profile was updated successfully."
      );


      setEditingProfile(false);

      setShowProfilePassword(false);


      /*
       * Reload the page so AuthContext gets the latest
       * account information from the database.
       */

      window.location.reload();

    } catch (error) {

      console.error(
        "Update profile error:",
        error
      );


      setError(
        error.response?.data?.message ||
          "Unable to update your profile."
      );

    } finally {
      setSavingProfile(false);
    }
  };


  // =========================================================
  // CREATE USER
  // =========================================================

  const handleCreateUser = async (
    event
  ) => {

    event.preventDefault();


    if (!isSuperAdmin) {
      setError(
        "You do not have permission to create administrators."
      );

      return;
    }


    setError("");
    setSuccess("");


    const name =
      formData.name.trim();

    const email =
      formData.email
        .trim()
        .toLowerCase();

    const password =
      formData.password;

    const role =
      formData.role.trim();


    // =======================================================
    // VALIDATION
    // =======================================================

    if (
      !name ||
      !email ||
      !password ||
      !role
    ) {
      setError(
        "Name, email, password, and role are required."
      );

      return;
    }


    if (name.length < 2) {
      setError(
        "Name must contain at least 2 characters."
      );

      return;
    }


    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );

      return;
    }


    // -------------------------------------------------------
    // super_admin is reserved for the main account.
    // -------------------------------------------------------

    if (
      role.toLowerCase() ===
      "super_admin"
    ) {
      setError(
        "The super_admin role is reserved for the Super Admin."
      );

      return;
    }


    // =======================================================
    // CREATE USER
    // =======================================================

    try {
      setSaving(true);


      const response =
        await usersApi.create({
          name,
          email,
          password,
          role,
        });


      if (!response?.success) {
        setError(
          response?.message ||
            "Unable to create administrator."
        );

        return;
      }


      // -----------------------------------------------------
      // Reset form
      // -----------------------------------------------------

      setFormData(INITIAL_FORM);

      setShowPassword(false);

      setShowAddForm(false);


      setSuccess(
        response.message ||
          "Administrator created successfully."
      );


      await loadUsers();

    } catch (error) {

      console.error(
        "Create administrator error:",
        error
      );


      setError(
        error.response?.data?.message ||
          "Unable to create administrator."
      );

    } finally {
      setSaving(false);
    }
  };


  // =========================================================
  // START EDIT USER
  // =========================================================

  const handleEditUser = (user) => {

    if (!isSuperAdmin) {
      setError(
        "You do not have permission to edit administrators."
      );

      return;
    }


    // -------------------------------------------------------
    // The current administrator edits their own account
    // through the profile editor above.
    // -------------------------------------------------------

    if (
      Number(user.id) ===
      Number(admin?.id)
    ) {
      setError(
        "Use the Edit Profile button to edit your own account."
      );

      return;
    }


    // -------------------------------------------------------
    // Do not edit another Super Admin.
    // -------------------------------------------------------

    if (
      user.role === "super_admin"
    ) {
      setError(
        "The Super Admin account cannot be edited from this section."
      );

      return;
    }


    setError("");
    setSuccess("");


    setEditUserForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "Employee",
    });


    setShowEditUserPassword(false);

    setEditingUser(user);

    setShowAddForm(false);
  };


  // =========================================================
  // CANCEL EDIT USER
  // =========================================================

  const handleCancelEditUser = () => {

    if (saving) {
      return;
    }


    setEditingUser(null);

    setShowEditUserPassword(false);

    setEditUserForm(INITIAL_FORM);

    setError("");
  };


  // =========================================================
  // UPDATE USER
  // =========================================================

  const handleUpdateUser = async (
    event
  ) => {

    event.preventDefault();


    if (!isSuperAdmin) {
      setError(
        "You do not have permission to edit administrators."
      );

      return;
    }


    if (!editingUser) {
      return;
    }


    setError("");
    setSuccess("");


    const name =
      editUserForm.name.trim();

    const email =
      editUserForm.email
        .trim()
        .toLowerCase();

    const password =
      editUserForm.password;

    const role =
      editUserForm.role.trim();


    // =======================================================
    // VALIDATION
    // =======================================================

    if (
      !name ||
      !email ||
      !role
    ) {
      setError(
        "Name, email, and role are required."
      );

      return;
    }


    if (name.length < 2) {
      setError(
        "Name must contain at least 2 characters."
      );

      return;
    }


    if (
      password &&
      password.length < 8
    ) {
      setError(
        "Password must contain at least 8 characters."
      );

      return;
    }


    // -------------------------------------------------------
    // super_admin remains reserved.
    // -------------------------------------------------------

    if (
      role.toLowerCase() ===
      "super_admin"
    ) {
      setError(
        "The super_admin role is reserved for the Super Admin."
      );

      return;
    }


    // =======================================================
    // UPDATE USER
    // =======================================================

    try {
      setSaving(true);


      const data = {
        name,
        email,
        role,
      };


      if (password) {
        data.password = password;
      }


      const response =
        await usersApi.update(
          editingUser.id,
          data
        );


      if (!response?.success) {
        setError(
          response?.message ||
            "Unable to update administrator."
        );

        return;
      }


      setSuccess(
        response.message ||
          "Administrator updated successfully."
      );


      setEditingUser(null);

      setShowEditUserPassword(false);

      setEditUserForm(INITIAL_FORM);


      await loadUsers();

    } catch (error) {

      console.error(
        "Update administrator error:",
        error
      );


      setError(
        error.response?.data?.message ||
          "Unable to update administrator."
      );

    } finally {
      setSaving(false);
    }
  };


  // =========================================================
  // ACTIVATE / DEACTIVATE USER
  // =========================================================

  const handleStatusChange = async (
    user
  ) => {

    if (!isSuperAdmin) {
      setError(
        "You do not have permission to manage administrators."
      );

      setSuccess("");

      return;
    }


    // -------------------------------------------------------
    // Prevent current administrator from changing
    // their own status.
    // -------------------------------------------------------

    if (
      Number(user.id) ===
      Number(admin?.id)
    ) {
      setError(
        "You cannot change the status of your own account."
      );

      setSuccess("");

      return;
    }


    // -------------------------------------------------------
    // Super Admin protection.
    // -------------------------------------------------------

    if (
      user.role === "super_admin"
    ) {
      setError(
        "The Super Admin account cannot be deactivated."
      );

      setSuccess("");

      return;
    }


    const isCurrentlyActive =
      Number(user.is_active) === 1;


    const newStatus =
      !isCurrentlyActive;


    // -------------------------------------------------------
    // Confirm before deactivation.
    // -------------------------------------------------------

    if (!newStatus) {

      const confirmed =
        window.confirm(
          `Are you sure you want to deactivate ${user.name}'s account?`
        );


      if (!confirmed) {
        return;
      }
    }


    // =======================================================
    // UPDATE STATUS
    // =======================================================

    try {
      setError("");
      setSuccess("");


      const response =
        await usersApi.updateStatus(
          user.id,
          newStatus
        );


      if (!response?.success) {
        setError(
          response?.message ||
            "Unable to update account status."
        );

        return;
      }


      setSuccess(
        response.message ||
          "Account status updated successfully."
      );


      await loadUsers();

    } catch (error) {

      console.error(
        "Update administrator status error:",
        error
      );


      setError(
        error.response?.data?.message ||
          "Unable to update account status."
      );
    }
  };


  // =========================================================
  // DELETE USER
  // =========================================================

  const handleDelete = async (
    user
  ) => {

    if (!isSuperAdmin) {
      setError(
        "You do not have permission to manage administrators."
      );

      setSuccess("");

      return;
    }


    // -------------------------------------------------------
    // Prevent current administrator from deleting
    // themselves.
    // -------------------------------------------------------

    if (
      Number(user.id) ===
      Number(admin?.id)
    ) {
      setError(
        "You cannot delete your own account."
      );

      setSuccess("");

      return;
    }


    // -------------------------------------------------------
    // Super Admin protection.
    // -------------------------------------------------------

    if (
      user.role === "super_admin"
    ) {
      setError(
        "The Super Admin account cannot be deleted."
      );

      setSuccess("");

      return;
    }


    const confirmed =
      window.confirm(
        `Are you sure you want to permanently delete ${user.name}'s account?`
      );


    if (!confirmed) {
      return;
    }


    // =======================================================
    // DELETE USER
    // =======================================================

    try {
      setError("");
      setSuccess("");


      const response =
        await usersApi.delete(
          user.id
        );


      if (!response?.success) {
        setError(
          response?.message ||
            "Unable to delete administrator."
        );

        return;
      }


      setSuccess(
        response.message ||
          "Administrator deleted successfully."
      );


      await loadUsers();

    } catch (error) {

      console.error(
        "Delete administrator error:",
        error
      );


      setError(
        error.response?.data?.message ||
          "Unable to delete administrator."
      );
    }
  };


  // =========================================================
  // CANCEL ADD FORM
  // =========================================================

  const handleCancelForm = () => {

    if (saving) {
      return;
    }


    setShowAddForm(false);

    setShowPassword(false);

    setFormData(INITIAL_FORM);

    setError("");
  };


  // =========================================================
  // TOGGLE ADD FORM
  // =========================================================

  const handleToggleForm = () => {

    if (!isSuperAdmin) {
      return;
    }


    if (showAddForm) {
      handleCancelForm();

      return;
    }


    // If editing another user, close that form first.
    setEditingUser(null);

    setError("");
    setSuccess("");


    setFormData(INITIAL_FORM);

    setShowPassword(false);

    setShowAddForm(true);
  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="admin-page">


      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="admin-page-header">

        <div>

          <span className="admin-page-eyebrow">
            ADMINISTRATION
          </span>


          <h2>
            My Profile
          </h2>


          <p>
            Manage your administrator account.
          </p>

        </div>

      </div>


      {/* =====================================================
          ERROR ALERT
      ===================================================== */}

      {error && (
        <div
          className="admin-alert admin-alert-error"
          role="alert"
        >

          <i
            className="bi bi-exclamation-circle"
            aria-hidden="true"
          ></i>


          <span>
            {error}
          </span>


          <button
            type="button"
            className="admin-alert-close"
            onClick={() =>
              setError("")
            }
            aria-label="Close error message"
          >

            <i
              className="bi bi-x"
              aria-hidden="true"
            ></i>

          </button>

        </div>
      )}


      {/* =====================================================
          SUCCESS ALERT
      ===================================================== */}

      {success && (
        <div
          className="admin-alert admin-alert-success"
          role="status"
        >

          <i
            className="bi bi-check-circle"
            aria-hidden="true"
          ></i>


          <span>
            {success}
          </span>


          <button
            type="button"
            className="admin-alert-close"
            onClick={() =>
              setSuccess("")
            }
            aria-label="Close success message"
          >

            <i
              className="bi bi-x"
              aria-hidden="true"
            ></i>

          </button>

        </div>
      )}


      {/* =====================================================
          MY PROFILE
      ===================================================== */}

      <section className="profile-card">

        <div className="profile-card-header">

          <div className="profile-avatar">

            <i
              className="bi bi-person-fill"
              aria-hidden="true"
            ></i>

          </div>


          <div className="profile-header-info">

            <h3>
              {admin?.name ||
                "Administrator"}
            </h3>


            <p>
              {getRoleLabel(
                admin?.role
              )}
            </p>

          </div>


          {!editingProfile && (
            <button
              type="button"
              className="admin-primary-button"
              onClick={
                handleEditProfile
              }
            >

              <i
                className="bi bi-pencil"
                aria-hidden="true"
              ></i>

              <span>
                Edit Profile
              </span>

            </button>
          )}

        </div>


        {/* ===================================================
            EDIT PROFILE
            SAME DESIGN AS EDIT Employee
        =================================================== */}

        {editingProfile ? (

          <div className="user-form-card">


            <div className="user-form-header">

              <span className="user-form-eyebrow">
                EDIT ACCOUNT
              </span>


              <h3>
                Edit Profile
              </h3>


              <p>
                Update your administrator account
                information.
              </p>

            </div>


            <form
              onSubmit={
                handleSaveProfile
              }
            >

              <div className="user-form-grid">


                {/* =========================================
                    NAME
                ========================================= */}

                <div className="admin-form-group">

                  <label htmlFor="profile-name">
                    Name
                  </label>


                  <input
                    id="profile-name"
                    name="name"
                    type="text"
                    value={
                      profileForm.name
                    }
                    onChange={
                      handleProfileChange
                    }
                    placeholder="Enter administrator name"
                    disabled={
                      savingProfile
                    }
                    autoComplete="name"
                    maxLength={100}
                    required
                  />

                </div>


                {/* =========================================
                    EMAIL
                ========================================= */}

                <div className="admin-form-group">

                  <label htmlFor="profile-email">
                    Email
                  </label>


                  <input
                    id="profile-email"
                    name="email"
                    type="email"
                    value={
                      profileForm.email
                    }
                    onChange={
                      handleProfileChange
                    }
                    placeholder="Enter administrator email"
                    disabled={
                      savingProfile
                    }
                    autoComplete="email"
                    maxLength={191}
                    required
                  />

                </div>


                {/* =========================================
                    PASSWORD
                ========================================= */}

                <div className="admin-form-group">

                  <label htmlFor="profile-password">
                    New Password
                  </label>


                  <div className="password-input-wrapper">

                    <input
                      id="profile-password"
                      name="password"
                      type={
                        showProfilePassword
                          ? "text"
                          : "password"
                      }
                      value={
                        profileForm.password
                      }
                      onChange={
                        handleProfileChange
                      }
                      placeholder="Leave blank to keep current password"
                      disabled={
                        savingProfile
                      }
                      autoComplete="new-password"
                      minLength={8}
                    />


                    <button
                      type="button"
                      className="password-toggle-button"
                      onClick={() =>
                        setShowProfilePassword(
                          (current) =>
                            !current
                        )
                      }
                      disabled={
                        savingProfile
                      }
                      aria-label={
                        showProfilePassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >

                      <i
                        className={
                          showProfilePassword
                            ? "bi bi-eye-slash"
                            : "bi bi-eye"
                        }
                        aria-hidden="true"
                      ></i>

                    </button>

                  </div>

                </div>


                {/* =========================================
                    ROLE
                    READ ONLY
                    DATABASE VALUE
                ========================================= */}

                <div className="admin-form-group">

                  <label htmlFor="profile-role">
                    Role
                  </label>


                  <input
                    id="profile-role"
                    name="role"
                    type="text"
                    value={
                      getRoleLabel(
                        profileForm.role
                      )
                    }
                    disabled
                    readOnly
                  />

                </div>

              </div>


              {/* =================================================
                  FORM ACTIONS
              ================================================= */}

              <div className="user-form-actions">

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={
                    handleCancelEditProfile
                  }
                  disabled={
                    savingProfile
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={
                    savingProfile
                  }
                >

                  {savingProfile ? (
                    <>

                      <span
                        className="admin-spinner"
                        aria-hidden="true"
                      ></span>

                      Saving...

                    </>
                  ) : (
                    <>

                      <i
                        className="bi bi-check-lg"
                        aria-hidden="true"
                      ></i>

                      Save Changes

                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        ) : (

          <div className="profile-content">


            {/* ===============================================
                NAME
            =============================================== */}

            <div className="profile-field">

              <span className="profile-label">

                <i
                  className="bi bi-person"
                  aria-hidden="true"
                ></i>

                Name

              </span>


              <strong>
                {admin?.name ||
                  "—"}
              </strong>

            </div>


            {/* ===============================================
                EMAIL
            =============================================== */}

            <div className="profile-field">

              <span className="profile-label">

                <i
                  className="bi bi-envelope"
                  aria-hidden="true"
                ></i>

                Email

              </span>


              <strong className="profile-email-value">
                {admin?.email ||
                  "—"}
              </strong>

            </div>


            {/* ===============================================
                ROLE
                FROM DATABASE
            =============================================== */}

            <div className="profile-field">

              <span className="profile-label">

                <i
                  className="bi bi-shield-check"
                  aria-hidden="true"
                ></i>

                Role

              </span>


              <span className="profile-role">

                {getRoleLabel(
                  admin?.role
                )}

              </span>

            </div>


            {/* ===============================================
                STATUS
            =============================================== */}

            {isSuperAdmin && (
              <div className="profile-field">

                <span className="profile-label">

                  <i
                    className="bi bi-check-circle"
                    aria-hidden="true"
                  ></i>

                  Account Status

                </span>


                <span className="profile-status profile-status-active">

                  <span className="profile-status-dot"></span>

                  Active

                </span>

              </div>
            )}

          </div>

        )}

      </section>


      {/* =====================================================
          SECURITY
      ===================================================== */}

      <section className="profile-security-card">

        <div className="profile-security-icon">

          <i
            className="bi bi-shield-lock"
            aria-hidden="true"
          ></i>

        </div>


        <div>

          <h3>
            Account Security
          </h3>


          <p>
            Your password is securely stored and is
            never displayed in the administrator panel.
          </p>

        </div>

      </section>


      {/* =====================================================
          ADMINISTRATOR MANAGEMENT
          SUPER ADMIN ONLY
      ===================================================== */}

      {isSuperAdmin && (
        <section className="users-card">


          {/* =================================================
              MANAGEMENT HEADER
          ================================================= */}

          <div className="users-card-header">

            <div>

              <span className="users-card-eyebrow">
                ADMINISTRATION
              </span>


              <h3>
                Employees Management
              </h3>


              <p>
                Manage employees who have access
                to the admin panel.
              </p>

            </div>


            <button
              type="button"
              className="admin-primary-button"
              onClick={
                handleToggleForm
              }
            >

              <i
                className={
                  showAddForm
                    ? "bi bi-x-lg"
                    : "bi bi-person-plus"
                }
                aria-hidden="true"
              ></i>


              <span>
                {showAddForm
                  ? "Close"
                  : "Add Employee"}
              </span>

            </button>

          </div>


          {/* =================================================
              CREATE USER FORM
          ================================================= */}

          {showAddForm && (
            <div className="user-form-card">


              <div className="user-form-header">

                <span className="user-form-eyebrow">
                  NEW ACCOUNT
                </span>


                <h3>
                  Create Employee
                </h3>


                <p>
                  Create an employee account
                  with access to the admin panel.
                </p>

              </div>


              <form
                onSubmit={
                  handleCreateUser
                }
              >

                <div className="user-form-grid">


                  {/* =========================================
                      NAME
                  ========================================= */}

                  <div className="admin-form-group">

                    <label htmlFor="profile-user-name">
                      Name
                    </label>


                    <input
                      id="profile-user-name"
                      name="name"
                      type="text"
                      value={
                        formData.name
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter administrator name"
                      disabled={saving}
                      autoComplete="name"
                      maxLength={100}
                      required
                    />

                  </div>


                  {/* =========================================
                      EMAIL
                  ========================================= */}

                  <div className="admin-form-group">

                    <label htmlFor="profile-user-email">
                      Email
                    </label>


                    <input
                      id="profile-user-email"
                      name="email"
                      type="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter administrator email"
                      disabled={saving}
                      autoComplete="email"
                      maxLength={191}
                      required
                    />

                  </div>


                  {/* =========================================
                      PASSWORD
                  ========================================= */}

                  <div className="admin-form-group">

                    <label htmlFor="profile-user-password">
                      Password
                    </label>


                    <div className="password-input-wrapper">

                      <input
                        id="profile-user-password"
                        name="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={
                          formData.password
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Minimum 8 characters"
                        disabled={saving}
                        autoComplete="new-password"
                        minLength={8}
                        required
                      />


                      <button
                        type="button"
                        className="password-toggle-button"
                        onClick={() =>
                          setShowPassword(
                            (current) =>
                              !current
                          )
                        }
                        disabled={saving}
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >

                        <i
                          className={
                            showPassword
                              ? "bi bi-eye-slash"
                              : "bi bi-eye"
                          }
                          aria-hidden="true"
                        ></i>

                      </button>

                    </div>

                  </div>


                  {/* =========================================
                      ROLE
                  ========================================= */}

                  <div className="admin-form-group">

                    <label htmlFor="profile-user-role">
                      Role
                    </label>


                    <input
                      id="profile-user-role"
                      name="role"
                      type="text"
                      value={
                        formData.role
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter role"
                      disabled={saving}
                      maxLength={50}
                      required
                    />

                  </div>

                </div>


                {/* =================================================
                    FORM ACTIONS
                ================================================= */}

                <div className="user-form-actions">


                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={
                      handleCancelForm
                    }
                    disabled={saving}
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="admin-primary-button"
                    disabled={saving}
                  >

                    {saving ? (
                      <>

                        <span
                          className="admin-spinner"
                          aria-hidden="true"
                        ></span>

                        Creating...

                      </>
                    ) : (
                      <>

                        <i
                          className="bi bi-person-plus"
                          aria-hidden="true"
                        ></i>

                        Create Administrator

                      </>
                    )}

                  </button>

                </div>

              </form>

            </div>
          )}


          {/* =================================================
              EDIT USER FORM
          ================================================= */}

          {editingUser && (
            <div className="user-form-card">


              <div className="user-form-header">

                <span className="user-form-eyebrow">
                  EDIT ACCOUNT
                </span>


                <h3>
                  Edit Administrator
                </h3>


                <p>
                  Update this administrator's account
                  information.
                </p>

              </div>


              <form
                onSubmit={
                  handleUpdateUser
                }
              >

                <div className="user-form-grid">


                  {/* =========================================
                      NAME
                  ========================================= */}

                  <div className="admin-form-group">

                    <label htmlFor="edit-user-name">
                      Name
                    </label>


                    <input
                      id="edit-user-name"
                      name="name"
                      type="text"
                      value={
                        editUserForm.name
                      }
                      onChange={
                        handleEditUserChange
                      }
                      placeholder="Enter administrator name"
                      disabled={saving}
                      autoComplete="name"
                      maxLength={100}
                      required
                    />

                  </div>


                  {/* =========================================
                      EMAIL
                  ========================================= */}

                  <div className="admin-form-group">

                    <label htmlFor="edit-user-email">
                      Email
                    </label>


                    <input
                      id="edit-user-email"
                      name="email"
                      type="email"
                      value={
                        editUserForm.email
                      }
                      onChange={
                        handleEditUserChange
                      }
                      placeholder="Enter administrator email"
                      disabled={saving}
                      autoComplete="email"
                      maxLength={191}
                      required
                    />

                  </div>


                  {/* =========================================
                      PASSWORD
                  ========================================= */}

                  <div className="admin-form-group">

                    <label htmlFor="edit-user-password">
                      New Password
                    </label>


                    <div className="password-input-wrapper">

                      <input
                        id="edit-user-password"
                        name="password"
                        type={
                          showEditUserPassword
                            ? "text"
                            : "password"
                        }
                        value={
                          editUserForm.password
                        }
                        onChange={
                          handleEditUserChange
                        }
                        placeholder="Leave blank to keep current password"
                        disabled={saving}
                        autoComplete="new-password"
                        minLength={8}
                      />


                      <button
                        type="button"
                        className="password-toggle-button"
                        onClick={() =>
                          setShowEditUserPassword(
                            (current) =>
                              !current
                          )
                        }
                        disabled={saving}
                        aria-label={
                          showEditUserPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >

                        <i
                          className={
                            showEditUserPassword
                              ? "bi bi-eye-slash"
                              : "bi bi-eye"
                          }
                          aria-hidden="true"
                        ></i>

                      </button>

                    </div>

                  </div>


                  {/* =========================================
                      ROLE
                  ========================================= */}

                  <div className="admin-form-group">

                    <label htmlFor="edit-user-role">
                      Role
                    </label>


                    <input
                      id="edit-user-role"
                      name="role"
                      type="text"
                      value={
                        editUserForm.role
                      }
                      onChange={
                        handleEditUserChange
                      }
                      placeholder="Enter role"
                      disabled={saving}
                      maxLength={50}
                      required
                    />

                  </div>

                </div>


                {/* =================================================
                    FORM ACTIONS
                ================================================= */}

                <div className="user-form-actions">

                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={
                      handleCancelEditUser
                    }
                    disabled={saving}
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="admin-primary-button"
                    disabled={saving}
                  >

                    {saving ? (
                      <>

                        <span
                          className="admin-spinner"
                          aria-hidden="true"
                        ></span>

                        Saving...

                      </>
                    ) : (
                      <>

                        <i
                          className="bi bi-check-lg"
                          aria-hidden="true"
                        ></i>

                        Save Changes

                      </>
                    )}

                  </button>

                </div>

              </form>

            </div>
          )}


          {/* =================================================
              ADMINISTRATORS
          ================================================= */}

          {loadingUsers ? (

            <div className="users-loading">

              <span
                className="admin-spinner"
                aria-hidden="true"
              ></span>


              <span>
                Loading administrators...
              </span>

            </div>

          ) : users.length === 0 ? (

            <div className="users-empty">

              <div className="users-empty-icon">

                <i
                  className="bi bi-people"
                  aria-hidden="true"
                ></i>

              </div>


              <h4>
                No administrators found
              </h4>


              <p>
                Create an administrator account to
                get started.
              </p>

            </div>

          ) : (

            <div className="users-table-wrapper">

              <table className="users-table">

                <thead>

                  <tr>

                    <th>
                      Administrator
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Role
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {users.map((user) => {

                    // -------------------------------------------------
                    // Current logged-in administrator
                    // -------------------------------------------------

                    const isCurrentAdmin =
                      Number(user.id) ===
                      Number(admin?.id);


                    // -------------------------------------------------
                    // Super Admin
                    // -------------------------------------------------

                    const isMainAdmin =
                      user.role ===
                      "super_admin";


                    // -------------------------------------------------
                    // MySQL may return "0" / "1" strings.
                    // -------------------------------------------------

                    const isActive =
                      Number(
                        user.is_active
                      ) === 1;


                    return (
                      <tr
                        key={user.id}
                      >


                        {/* =========================================
                            ADMINISTRATOR
                        ========================================= */}

                        <td>

                          <div className="user-table-name">

                            <div className="user-table-avatar">

                              <i
                                className={
                                  isMainAdmin
                                    ? "bi bi-shield-fill-check"
                                    : "bi bi-person-fill"
                                }
                                aria-hidden="true"
                              ></i>

                            </div>


                            <div>

                              <strong>
                                {user.name}
                              </strong>


                              {isCurrentAdmin && (
                                <span className="user-current-label">
                                  You
                                </span>
                              )}

                            </div>

                          </div>

                        </td>


                        {/* =========================================
                            EMAIL
                        ========================================= */}

                        <td>

                          <span className="user-email">
                            {user.email}
                          </span>

                        </td>


                        {/* =========================================
                            ROLE
                        ========================================= */}

                        <td>

                          <span
                            className={
                              isMainAdmin
                                ? "user-role-badge user-role-main-admin"
                                : "user-role-badge"
                            }
                          >

                            <i
                              className={
                                isMainAdmin
                                  ? "bi bi-shield-fill-check"
                                  : "bi bi-shield-check"
                              }
                              aria-hidden="true"
                            ></i>


                            {getRoleLabel(
                              user.role
                            )}

                          </span>

                        </td>


                        {/* =========================================
                            STATUS
                        ========================================= */}

                        <td>

                          <span
                            className={
                              isActive
                                ? "user-status user-status-active"
                                : "user-status user-status-inactive"
                            }
                          >

                            <span></span>


                            {isActive
                              ? "Active"
                              : "Inactive"}

                          </span>

                        </td>


                        {/* =========================================
                            ACTIONS
                        ========================================= */}

                        <td>

                          <div className="user-actions">


                            {/* =====================================
                                EDIT
                            ===================================== */}

                            <button
                              type="button"
                              className="user-action-button"
                              onClick={() =>
                                handleEditUser(
                                  user
                                )
                              }
                              disabled={
                                isCurrentAdmin ||
                                isMainAdmin
                              }
                              title={
                                isCurrentAdmin
                                  ? "Use Edit Profile to edit your account"
                                  : isMainAdmin
                                    ? "The Super Admin cannot be edited here"
                                    : "Edit administrator"
                              }
                              aria-label={
                                isCurrentAdmin
                                  ? "Current administrator"
                                  : isMainAdmin
                                    ? "Super Admin"
                                    : "Edit administrator"
                              }
                            >

                              <i
                                className="bi bi-pencil"
                                aria-hidden="true"
                              ></i>

                            </button>


                            {/* =====================================
                                ACTIVATE / DEACTIVATE
                            ===================================== */}

                            <button
                              type="button"
                              className="user-action-button"
                              onClick={() =>
                                handleStatusChange(
                                  user
                                )
                              }
                              disabled={
                                isCurrentAdmin ||
                                isMainAdmin
                              }
                              title={
                                isCurrentAdmin
                                  ? "You cannot change your own status"
                                  : isMainAdmin
                                    ? "The Super Admin cannot be deactivated"
                                    : isActive
                                      ? "Deactivate administrator"
                                      : "Activate administrator"
                              }
                              aria-label={
                                isCurrentAdmin
                                  ? "Current administrator"
                                  : isMainAdmin
                                    ? "Super Admin"
                                    : isActive
                                      ? "Deactivate administrator"
                                      : "Activate administrator"
                              }
                            >

                              <i
                                className={
                                  isActive
                                    ? "bi bi-person-dash"
                                    : "bi bi-person-check"
                                }
                                aria-hidden="true"
                              ></i>

                            </button>


                            {/* =====================================
                                DELETE
                            ===================================== */}

                            <button
                              type="button"
                              className="user-action-button user-action-delete"
                              onClick={() =>
                                handleDelete(
                                  user
                                )
                              }
                              disabled={
                                isCurrentAdmin ||
                                isMainAdmin
                              }
                              title={
                                isCurrentAdmin
                                  ? "You cannot delete your own account"
                                  : isMainAdmin
                                    ? "The Super Admin cannot be deleted"
                                    : "Delete administrator"
                              }
                              aria-label={
                                isCurrentAdmin
                                  ? "Current administrator"
                                  : isMainAdmin
                                    ? "Super Admin"
                                    : "Delete administrator"
                              }
                            >

                              <i
                                className="bi bi-trash"
                                aria-hidden="true"
                              ></i>

                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </section>
      )}

    </main>
  );
};


export default Profile;