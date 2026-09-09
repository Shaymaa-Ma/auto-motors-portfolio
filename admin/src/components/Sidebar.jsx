import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { companyApi } from "../api/endpoints";

const Sidebar = ({ isOpen, onClose }) => {
  const { admin } = useAuth();

  const [companyLogo, setCompanyLogo] = useState("");

  const navGroups = [
    {
      title: "MAIN",
      items: [
        {
          label: "Dashboard",
          path: "/dashboard",
          icon: "bi-speedometer2",
        },
      ],
    },

    {
      title: "WEBSITE",
      items: [
        {
          label: "Home",
          path: "/home",
          icon: "bi-house-door",
        },
        {
          label: "About",
          path: "/about",
          icon: "bi-building",
        },
        {
          label: "Services",
          path: "/services",
          icon: "bi-tools",
        },
        {
          label: "Advantages",
          path: "/advantages",
          icon: "bi-stars",
        },
        {
          label: "Gallery",
          path: "/gallery",
          icon: "bi-images",
        },
        {
          label: "FAQ",
          path: "/faqs",
          icon: "bi-question-circle",
        },
      ],
    },

    {
      title: "CATALOG",
      items: [
        {
          label: "Categories",
          path: "/categories",
          icon: "bi-grid",
        },
        {
          label: "Products",
          path: "/products",
          icon: "bi-box-seam",
        },
        {
          label: "Vehicles",
          path: "/vehicles",
          icon: "bi-car-front",
        },
      ],
    },

    {
      title: "SETTINGS",
      items: [
        {
          label: "Company Info",
          path: "/company",
          icon: "bi-building-gear",
        },
        {
          label: "Social Links",
          path: "/social-links",
          icon: "bi-share",
        },
        {
          label: "Site Settings",
          path: "/settings",
          icon: "bi-gear",
        },
      ],
    },
  ];

  /* =========================================================
     LOAD COMPANY LOGO
  ========================================================= */

  useEffect(() => {
    const loadCompanyLogo = async () => {
      try {
        const response = await companyApi.get();

        console.log(
          "Company API response:",
          response
        );

        if (!response?.success) {
          return;
        }

        /*
         * Your API returns:
         *
         * response.data.logo
         *
         * Example:
         *
         * "logo/company-logo.jpg"
         */

        const logo = response.data?.logo;

        if (!logo) {
          return;
        }

        const uploadsUrl =
          process.env.REACT_APP_UPLOADS_URL ||
          "http://localhost:5000/uploads";

        const cleanLogoPath = logo.replace(
          /^\/+/,
          ""
        );

        setCompanyLogo(
          `${uploadsUrl}/${cleanLogoPath}`
        );

      } catch (error) {
        console.error(
          "Unable to load company logo:",
          error
        );
      }
    };

    loadCompanyLogo();
  }, []);

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      <div
        className={`sidebar-overlay ${
          isOpen
            ? "sidebar-overlay-visible"
            : ""
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`admin-sidebar ${
          isOpen
            ? "admin-sidebar-open"
            : ""
        }`}
      >

        {/* ===================================================
            HEADER / BRAND
        =================================================== */}

        <div className="sidebar-header">

          <div className="sidebar-brand">

            {companyLogo ? (
              <img
                src={companyLogo}
                alt="AUTO MOTORS SARL"
                className="sidebar-logo"
              />
            ) : (
              <div className="sidebar-brand-icon">
                <i
                  className="bi bi-car-front-fill"
                  aria-hidden="true"
                ></i>
              </div>
            )}

            <div className="sidebar-brand-text">

              <strong>
                AUTO MOTORS
              </strong>

              <span>
                ADMINISTRATION
              </span>

            </div>

          </div>

          {/* Mobile close button */}

          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <i className="bi bi-x-lg"></i>
          </button>

        </div>


        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav
          className="sidebar-nav"
          aria-label="Admin navigation"
        >

          {navGroups.map((group) => (
            <div
              className="sidebar-nav-group"
              key={group.title}
            >

              <span className="sidebar-group-title">
                {group.title}
              </span>

              <div className="sidebar-nav-items">

                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `sidebar-nav-link ${
                        isActive
                          ? "sidebar-nav-link-active"
                          : ""
                      }`
                    }
                  >

                    <i
                      className={`bi ${item.icon}`}
                      aria-hidden="true"
                    />

                    <span>
                      {item.label}
                    </span>

                  </NavLink>
                ))}

              </div>

            </div>
          ))}

        </nav>


        {/* ===================================================
    VIEW WEBSITE
=================================================== */}

<div className="sidebar-footer">

  <a
    href="http://localhost:3000"
    target="_blank"
    rel="noopener noreferrer"
    className="sidebar-website-link"
  >
    <div className="sidebar-website-icon">
      <i
        className="bi bi-globe2"
        aria-hidden="true"
      ></i>
    </div>

    <div className="sidebar-website-info">
      <strong>
        View Website
      </strong>

      <span>
        Open public site
      </span>
    </div>

    <i
      className="bi bi-box-arrow-up-right sidebar-website-arrow"
      aria-hidden="true"
    ></i>

  </a>

</div>

      </aside>
    </>
  );
};

export default Sidebar;