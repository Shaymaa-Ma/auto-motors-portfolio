import { useEffect, useState } from "react";

import { usersApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";


// =========================================================
// INITIAL FORM
// =========================================================
//
// New accounts created from the Main Administrator panel
// are always regular "admin" accounts.
//
// The role is intentionally NOT included here because the
// backend decides the role and never accepts a role from
// the client.
//
// =========================================================

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
};


const Profile = () => {
  const { admin } = useAuth();


  // =========================================================
  // ROLE
  // =========================================================
  //
  // Only the Main Administrator can manage administrator
  // accounts.
  //
  // Regular administrators can only manage website content.
  //
  // =========================================================

  const isSuperAdmin =
    admin?.role === "super_admin";


  // =========================================================
  // USERS STATE
  // =========================================================

  const [users, setUsers] = useState([]);

  const [loadingUsers, setLoadingUsers] =
    useState(isSuperAdmin);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [showAddForm, setShowAddForm] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);


  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] =
    useState(INITIAL_FORM);


  // =========================================================
  // LOAD ADMINISTRATORS
  // =========================================================
  //
  // This function is only called by the Main Administrator.
  //
  // The backend also protects this endpoint, so even if a
  // regular administrator manually calls the API, access
  // will be denied.
  //
  // =========================================================

  const loadUsers = async () => {
    // -------------------------------------------------------
    // Frontend permission check
    // -------------------------------------------------------

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
  //
  // Regular administrators do not call the administrator
  // management endpoint at all.
  //
  // =========================================================

  useEffect(() => {
    if (isSuperAdmin) {
      loadUsers();
    } else {
      setLoadingUsers(false);
    }
  }, [isSuperAdmin]);


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
  // CREATE ADMINISTRATOR
  // =========================================================
  //
  // Only the Main Administrator can reach this function.
  //
  // The backend ALWAYS creates:
  //
  // role = "admin"
  //
  // The frontend does not send a role value.
  //
  // =========================================================

  const handleCreateUser = async (
    event
  ) => {

    event.preventDefault();


    // -------------------------------------------------------
    // Permission protection
    // -------------------------------------------------------

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


    // =======================================================
    // CLIENT-SIDE VALIDATION
    // =======================================================

    if (
      !name ||
      !email ||
      !password
    ) {
      setError(
        "Name, email, and password are required."
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


    // =======================================================
    // CREATE ADMINISTRATOR
    // =======================================================

    try {
      setSaving(true);


      const response =
        await usersApi.create({
          name,
          email,
          password,
        });


      if (!response?.success) {
        setError(
          response?.message ||
            "Unable to create administrator."
        );

        return;
      }


      // -----------------------------------------------------
      // Reset form after successful creation
      // -----------------------------------------------------

      setFormData(INITIAL_FORM);

      setShowPassword(false);

      setShowAddForm(false);


      setSuccess(
        response.message ||
          "Administrator created successfully."
      );


      // -----------------------------------------------------
      // Refresh administrator list
      // -----------------------------------------------------

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
  // ACTIVATE / DEACTIVATE ADMINISTRATOR
  // =========================================================

  const handleStatusChange = async (
    user
  ) => {

    // -------------------------------------------------------
    // Permission protection
    // -------------------------------------------------------

    if (!isSuperAdmin) {
      setError(
        "You do not have permission to manage administrators."
      );

      setSuccess("");

      return;
    }


    // -------------------------------------------------------
    // Prevent current administrator from changing
    // their own status
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
    // Main Administrator protection
    // -------------------------------------------------------
    //
    // The Main Administrator account must never be
    // deactivated through this management page.
    //
    // The backend also enforces this protection.
    //
    // -------------------------------------------------------

    if (
      user.role === "super_admin"
    ) {
      setError(
        "The Main Administrator account cannot be deactivated."
      );

      setSuccess("");

      return;
    }


    // -------------------------------------------------------
    // Important:
    //
    // MySQL may return is_active as:
    //
    // "0"
    // "1"
    //
    // Therefore Number() is used instead of Boolean().
    // -------------------------------------------------------

    const isCurrentlyActive =
      Number(user.is_active) === 1;


    const newStatus =
      !isCurrentlyActive;


    // -------------------------------------------------------
    // Confirm before deactivation
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
  // DELETE ADMINISTRATOR
  // =========================================================

  const handleDelete = async (
    user
  ) => {

    // -------------------------------------------------------
    // Permission protection
    // -------------------------------------------------------

    if (!isSuperAdmin) {
      setError(
        "You do not have permission to manage administrators."
      );

      setSuccess("");

      return;
    }


    // -------------------------------------------------------
    // Prevent current administrator from deleting
    // themselves
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
    // Main Administrator protection
    // -------------------------------------------------------

    if (
      user.role === "super_admin"
    ) {
      setError(
        "The Main Administrator account cannot be deleted."
      );

      setSuccess("");

      return;
    }


    // -------------------------------------------------------
    // Confirmation
    // -------------------------------------------------------

    const confirmed =
      window.confirm(
        `Are you sure you want to permanently delete ${user.name}'s account?`
      );


    if (!confirmed) {
      return;
    }


    // =======================================================
    // DELETE ADMINISTRATOR
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

    // -------------------------------------------------------
    // Only Main Administrator can open this form.
    // -------------------------------------------------------

    if (!isSuperAdmin) {
      return;
    }


    if (showAddForm) {
      handleCancelForm();

      return;
    }


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
              {admin?.role ===
              "super_admin"
                ? "Main Administrator Account"
                : "Administrator Account"}
            </p>

          </div>

        </div>


        <div className="profile-content">


          {/* =================================================
              NAME
          ================================================= */}

          <div className="profile-field">

            <span className="profile-label">

              <i
                className="bi bi-person"
                aria-hidden="true"
              ></i>

              Name

            </span>


            <strong>
              {admin?.name || "—"}
            </strong>

          </div>


          {/* =================================================
              EMAIL
          ================================================= */}

          <div className="profile-field">

            <span className="profile-label">

              <i
                className="bi bi-envelope"
                aria-hidden="true"
              ></i>

              Email

            </span>


            <strong className="profile-email-value">
              {admin?.email || "—"}
            </strong>

          </div>


          {/* =================================================
              ROLE
          ================================================= */}

          <div className="profile-field">

            <span className="profile-label">

              <i
                className="bi bi-shield-check"
                aria-hidden="true"
              ></i>

              Role

            </span>


            <span className="profile-role">

              {admin?.role ===
              "super_admin"
                ? "Main Administrator"
                : "Administrator"}

            </span>

          </div>


          {/* =================================================
              STATUS
          ================================================= */}

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

        </div>

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
          MAIN ADMINISTRATOR ONLY
      =====================================================
      
      Regular administrators will not even render this
      section.
      
      Backend protection still exists separately in:
      
      - authMiddleware
      - requireSuperAdmin
      - userController
      
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
                Administrator Management
              </h3>


              <p>
                Manage administrators who have access
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
                  : "Add Administrator"}
              </span>

            </button>

          </div>


          {/* =================================================
              CREATE ADMINISTRATOR FORM
          ================================================= */}

          {showAddForm && (
            <div className="user-form-card">


              <div className="user-form-header">

                <span className="user-form-eyebrow">
                  NEW ACCOUNT
                </span>


                <h3>
                  Create Administrator
                </h3>


                <p>
                  Create a regular administrator account
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
                      ROLE INFORMATION
                  ========================================= */}

                  <div className="admin-form-group">

                    <label>
                      Role
                    </label>


                    <div className="profile-role">

                      <i
                        className="bi bi-shield-check"
                        aria-hidden="true"
                      ></i>

                      Administrator

                    </div>

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
                    // Main Administrator
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


                            {isMainAdmin
                              ? "Main Administrator"
                              : "Administrator"}

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
                                    ? "The Main Administrator cannot be deactivated"
                                    : isActive
                                      ? "Deactivate administrator"
                                      : "Activate administrator"
                              }
                              aria-label={
                                isCurrentAdmin
                                  ? "Current administrator"
                                  : isMainAdmin
                                    ? "Main Administrator"
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
                                    ? "The Main Administrator cannot be deleted"
                                    : "Delete administrator"
                              }
                              aria-label={
                                isCurrentAdmin
                                  ? "Current administrator"
                                  : isMainAdmin
                                    ? "Main Administrator"
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