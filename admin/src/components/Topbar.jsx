import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Topbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    admin,
    logout,
  } = useAuth();

  // =========================================================
  // Page titles
  // =========================================================

  const pageTitles = {
    "/dashboard": "Dashboard",

    // Website
    "/home": "Home",
    "/about": "About",
    "/services": "Services",
    "/advantages": "Advantages",
    "/gallery": "Gallery",
    "/faqs": "FAQ",

    // Catalog
    "/categories": "Categories",
    "/products": "Products",
    "/vehicles": "Vehicles",

    // Settings
    "/company": "Company Info",
    "/contact": "Contact",
    "/social-links": "Social Links",

    // Administration
    "/profile": "Profile",
  };

  const title =
    pageTitles[location.pathname] ||
    "Administration";

  // =========================================================
  // Open administrator profile
  // =========================================================

  const handleProfileClick = () => {
    navigate("/profile");
  };

  // =========================================================
  // Logout
  // =========================================================

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", {
        replace: true,
      });
    }
  };

  return (
    <header className="admin-topbar">

      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <div className="topbar-left">

        {/* Mobile burger button */}

        <button
          type="button"
          className="topbar-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          aria-controls="admin-sidebar"
        >
          <i
            className="bi bi-list"
            aria-hidden="true"
          ></i>
        </button>

        {/* Page title */}

        <div className="topbar-title">

          <span>
            ADMINISTRATION
          </span>

          <h1>
            {title}
          </h1>

        </div>

      </div>

      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="topbar-right">

        {/* ===================================================
            ADMIN PROFILE
        =================================================== */}

        <button
          type="button"
          className="topbar-admin"
          onClick={handleProfileClick}
          title="View profile"
          aria-label="View administrator profile"
        >

          <div className="topbar-admin-avatar">

            <i
              className="bi bi-person-fill"
              aria-hidden="true"
            ></i>

          </div>

          <div className="topbar-admin-info">

            <strong>
              {admin?.name ||
                "Administrator"}
            </strong>

            <span>
              {admin?.email || ""}
            </span>

          </div>

          <i
            className="bi bi-chevron-down topbar-profile-arrow"
            aria-hidden="true"
          ></i>

        </button>

        {/* Divider */}

        <div
          className="topbar-divider"
          aria-hidden="true"
        ></div>

        {/* ===================================================
            LOGOUT
        =================================================== */}

        <button
          type="button"
          className="topbar-logout"
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
        >

          <i
            className="bi bi-box-arrow-right"
            aria-hidden="true"
          ></i>

          <span>
            Logout
          </span>

        </button>

      </div>

    </header>
  );
};

export default Topbar;