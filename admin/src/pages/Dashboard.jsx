
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { dashboardApi } from "../api/endpoints";

const Dashboard = () => {
  const navigate = useNavigate();
  const { admin } = useAuth();

  const [stats, setStats] = useState({
    products: 0,
    vehicles: 0,
    services: 0,
    gallery: 0,
    categories: 0,
    faqs: 0,
    advantages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     LOAD DASHBOARD STATISTICS
  ========================================================= */

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await dashboardApi.getStats();

      if (response.success) {
        setStats({
          products: Number(response.stats?.products || 0),
          vehicles: Number(response.stats?.vehicles || 0),
          services: Number(response.stats?.services || 0),
          gallery: Number(response.stats?.gallery || 0),
          categories: Number(response.stats?.categories || 0),
          faqs: Number(response.stats?.faqs || 0),
          advantages: Number(response.stats?.advantages || 0),
        });
      } else {
        setError(
          response.message ||
            "Unable to load dashboard statistics."
        );
      }
    } catch (error) {
      console.error("Dashboard stats error:", error);

      const status = error.response?.status;
      const serverMessage = error.response?.data?.message;
      const serverError = error.response?.data?.error;

      if (serverMessage) {
        setError(
          `${serverMessage}${
            serverError ? ` ${serverError}` : ""
          }`
        );
      } else if (status) {
        setError(
          `Unable to load dashboard statistics. HTTP ${status}.`
        );
      } else {
        setError(
          "Unable to connect to the dashboard server."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadStats();
  }, []);

  /* =========================================================
     MAIN STATISTICS
  ========================================================= */

  const statCards = [
    {
      title: "Products",
      value: stats.products,
      icon: "bi-box-seam-fill",
      path: "/products",
      description: "Catalog items",
    },
    {
      title: "Vehicles",
      value: stats.vehicles,
      icon: "bi-car-front-fill",
      path: "/vehicles",
      description: "Listed vehicles",
    },
    {
      title: "Services",
      value: stats.services,
      icon: "bi-tools",
      path: "/services",
      description: "Available services",
    },
    {
      title: "Gallery",
      value: stats.gallery,
      icon: "bi-images",
      path: "/gallery",
      description: "Media items",
    },
  ];

  /* =========================================================
     CONTENT SUMMARY
  ========================================================= */

  const contentSummary = [
    {
      label: "Product categories",
      value: stats.categories,
      icon: "bi-grid",
    },
    {
      label: "FAQs",
      value: stats.faqs,
      icon: "bi-question-circle",
    },
    {
      label: "Advantages",
      value: stats.advantages,
      icon: "bi-stars",
    },
  ];

  /* =========================================================
     QUICK ACTIONS
  ========================================================= */

  const quickActions = [
    {
      title: "Add Product",
      description: "Create a new catalog item",
      icon: "bi-plus-lg",
      path: "/products",
    },
    {
      title: "Add Vehicle",
      description: "Add a vehicle to the website",
      icon: "bi-car-front",
      path: "/vehicles",
    },
    {
      title: "Edit Homepage",
      description: "Update your main website content",
      icon: "bi-house-door",
      path: "/home",
    },
    {
      title: "Company Information",
      description: "Update business details and logo",
      icon: "bi-building-gear",
      path: "/company",
    },
  ];

  return (
    <div className="dashboard-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="dashboard-header">

        <div className="dashboard-header-content">

          <span className="dashboard-eyebrow">
            ADMINISTRATION
          </span>

          <h2>
            Welcome back,{" "}
            {admin?.name || "Administrator"}
          </h2>

          <p>
            Here is an overview of your AUTO MOTORS
            website and its current content.
          </p>

        </div>

        <div className="dashboard-header-status">
          <span className="dashboard-status-dot"></span>

          <span>
            System online
          </span>
        </div>

      </section>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="dashboard-error">

          <div className="dashboard-error-content">

            <i
              className="bi bi-exclamation-circle"
              aria-hidden="true"
            ></i>

            <div>

              <strong>
                Dashboard statistics unavailable
              </strong>

              <span>
                {error}
              </span>

            </div>

          </div>

          <button
            type="button"
            onClick={loadStats}
          >
            <i
              className="bi bi-arrow-clockwise"
              aria-hidden="true"
            ></i>

            Retry
          </button>

        </div>
      )}


      {/* =====================================================
          KEY STATISTICS
      ===================================================== */}

      <section className="dashboard-primary-stats">

        {statCards.map((card) => (
          <button
            type="button"
            key={card.title}
            className="dashboard-stat-card"
            onClick={() => navigate(card.path)}
          >

            <div className="dashboard-stat-top">

              <div className="dashboard-stat-icon">
                <i
                  className={`bi ${card.icon}`}
                  aria-hidden="true"
                ></i>
              </div>

              <i
                className="bi bi-arrow-up-right dashboard-stat-arrow"
                aria-hidden="true"
              ></i>

            </div>

            <div className="dashboard-stat-content">

              <span>
                {card.title}
              </span>

              <strong>
                {loading ? "—" : card.value}
              </strong>

              <small>
                {card.description}
              </small>

            </div>

          </button>
        ))}

      </section>


      {/* =====================================================
          DASHBOARD GRID
      ===================================================== */}

      <div className="dashboard-main-grid">


        {/* ===================================================
            CONTENT SUMMARY
        =================================================== */}

        <section className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <span className="dashboard-panel-eyebrow">
                CONTENT
              </span>

              <h3>
                Website Content
              </h3>

            </div>

            <i
              className="bi bi-bar-chart-line"
              aria-hidden="true"
            ></i>

          </div>


          <div className="dashboard-content-list">

            {contentSummary.map((item) => (
              <div
                className="dashboard-content-row"
                key={item.label}
              >

                <div className="dashboard-content-icon">
                  <i
                    className={`bi ${item.icon}`}
                    aria-hidden="true"
                  ></i>
                </div>

                <span>
                  {item.label}
                </span>

                <strong>
                  {loading ? "—" : item.value}
                </strong>

              </div>
            ))}

          </div>

        </section>


        {/* ===================================================
            QUICK ACTIONS
        =================================================== */}

        <section className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <span className="dashboard-panel-eyebrow">
                ACTIONS
              </span>

              <h3>
                Quick Actions
              </h3>

            </div>

            <i
              className="bi bi-lightning-charge"
              aria-hidden="true"
            ></i>

          </div>


          <div className="dashboard-actions">

            {quickActions.map((action) => (
              <button
                type="button"
                key={action.title}
                className="dashboard-action"
                onClick={() =>
                  navigate(action.path)
                }
              >

                <div className="dashboard-action-icon">
                  <i
                    className={`bi ${action.icon}`}
                    aria-hidden="true"
                  ></i>
                </div>

                <div className="dashboard-action-content">

                  <strong>
                    {action.title}
                  </strong>

                  <span>
                    {action.description}
                  </span>

                </div>

                <i
                  className="bi bi-chevron-right dashboard-action-arrow"
                  aria-hidden="true"
                ></i>

              </button>
            ))}

          </div>

        </section>

      </div>


    </div>
  );
};

export default Dashboard;
