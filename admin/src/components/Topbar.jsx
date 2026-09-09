import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Topbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    admin,
    logout,
  } = useAuth();

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/home": "Home",
    "/about": "About",
    "/services": "Services",
    "/advantages": "Advantages",
    "/gallery": "Gallery",
    "/faqs": "FAQ",
    "/categories": "Categories",
    "/products": "Products",
    "/vehicles": "Vehicles",
    "/company": "Company Info",
    "/social-links": "Social Links",
    "/settings": "Site Settings",
  };

  const title =
    pageTitles[location.pathname] ||
    "Administration";

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
          LEFT
      ===================================================== */}

      <div className="topbar-left">

        <button
          type="button"
          className="topbar-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <i className="bi bi-list"></i>
        </button>

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
          RIGHT
      ===================================================== */}

      <div className="topbar-right">

        <div className="topbar-admin">

          <div className="topbar-admin-avatar">
            <i className="bi bi-person-fill"></i>
          </div>

          <div className="topbar-admin-info">

            <strong>
              {admin?.name || "Administrator"}
            </strong>

            <span>
              {admin?.email || ""}
            </span>

          </div>

        </div>

        <div className="topbar-divider"></div>

        <button
          type="button"
          className="topbar-logout"
          onClick={handleLogout}
          title="Logout"
        >
          <i className="bi bi-box-arrow-right"></i>

          <span>
            Logout
          </span>
        </button>

      </div>

    </header>
  );
};

export default Topbar;