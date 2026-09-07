
import React, { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import {
  getCompany,
  getSocialLinks,
  getImageUrl,
} from "../../api/api";
import { getIconClass } from "../../utils/icons";

const Navbar = () => {
  const { language, toggleLanguage } = useLanguage();

  const [company, setCompany] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  /* ==========================================================================
     LOAD NAVBAR DATA
     ========================================================================== */

  useEffect(() => {
    const loadNavbarData = async () => {
      try {
        const [companyData, socialData] = await Promise.all([
          getCompany(),
          getSocialLinks(),
        ]);

        setCompany(companyData || null);
        setSocialLinks(socialData || []);
      } catch (error) {
        console.error("Navbar data loading error:", error);
      }
    };

    loadNavbarData();
  }, []);

  /* ==========================================================================
     SCROLLED NAVBAR
     ========================================================================== */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* ==========================================================================
     ACTIVE SECTION
     
     Detects which section is currently underneath the navbar.
     This works when the user scrolls manually.
     ========================================================================== */

  useEffect(() => {
    const handleActiveSection = () => {
      const sections = document.querySelectorAll("section[id]");

      if (!sections.length) return;

      /*
       * The active point is slightly below the fixed navbar.
       */
      const activationPoint = window.scrollY + 180;

      let currentSection = "home";

      sections.forEach((section) => {
        if (section.offsetTop <= activationPoint) {
          currentSection = section.id;
        }
      });

      setActiveSection(currentSection);
    };

    handleActiveSection();

    window.addEventListener("scroll", handleActiveSection, {
      passive: true,
    });

    window.addEventListener("resize", handleActiveSection);

    return () => {
      window.removeEventListener(
        "scroll",
        handleActiveSection
      );

      window.removeEventListener(
        "resize",
        handleActiveSection
      );
    };
  }, []);

  /* ==========================================================================
     MOBILE MENU BODY LOCK
     ========================================================================== */

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [menuOpen]);

  /* ==========================================================================
     CLOSE MOBILE MENU
     ========================================================================== */

  const closeMenu = () => {
    setMenuOpen(false);
  };

  /* ==========================================================================
     HANDLE NAVIGATION CLICK
     
     Immediately activates the clicked section.
     The scroll listener then keeps it synchronized while scrolling.
     ========================================================================== */

  const handleNavigationClick = (sectionId) => {
    setActiveSection(sectionId);
    closeMenu();
  };

  /* ==========================================================================
     LOGO
     ========================================================================== */

  const logoUrl = company?.logo
    ? getImageUrl(company.logo)
    : "";

  /* ==========================================================================
     NAVIGATION
     ========================================================================== */

  const navigation = [
    {
      href: "#home",
      label: language === "fr" ? "Accueil" : "Home",
    },
    {
      href: "#about",
      label: language === "fr" ? "À propos" : "About",
    },
    {
      href: "#services",
      label: "Services",
    },
    {
      href: "#products",
      label: language === "fr" ? "Produits" : "Products",
    },
    {
      href: "#vehicles",
      label: language === "fr" ? "Véhicules" : "Vehicles",
    },
    {
      href: "#advantages",
      label: language === "fr" ? "Avantages" : "Advantages",
    },
    {
      href: "#gallery",
      label: language === "fr" ? "Galerie" : "Gallery",
    },
    {
      href: "#faq",
      label: "FAQ",
    },
  ];

  /* ==========================================================================
     RENDER
     ========================================================================== */

  return (
    <>
      <header
        className={`navbar ${scrolled ? "navbar--scrolled" : ""
          }`}
      >
        <div className="container navbar__container">

          {/* ==================================================================
             BRAND
             ================================================================== */}

          <a
            href="#home"
            className="navbar__brand"
            onClick={() =>
              handleNavigationClick("home")
            }
            aria-label={
              company?.company_name || "AUTO MOTORS SARL"
            }
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={
                  company?.company_name ||
                  "AUTO MOTORS SARL"
                }
                className="navbar__logo"
              />
            ) : (
              <span className="navbar__company-name">
                {company?.company_name ||
                  "AUTO MOTORS SARL"}
              </span>
            )}
          </a>

          {/* ==================================================================
             DESKTOP NAVIGATION
             ================================================================== */}

          <nav
            className="navbar__desktop-nav"
            aria-label={
              language === "fr"
                ? "Navigation principale"
                : "Main navigation"
            }
          >
            {navigation.map((item) => {
              const sectionId = item.href.substring(1);
              const isActive =
                activeSection === sectionId;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`navbar__link ${isActive
                      ? "navbar__link--active"
                      : ""
                    }`}
                  onClick={() =>
                    handleNavigationClick(sectionId)
                  }
                  aria-current={
                    isActive ? "page" : undefined
                  }
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* ==================================================================
             DESKTOP ACTIONS
             ================================================================== */}

          <div className="navbar__desktop-actions">

            {/* Language */}

            <button
              type="button"
              className="navbar__language"
              onClick={toggleLanguage}
              aria-label={
                language === "fr"
                  ? "Switch to English"
                  : "Passer au français"
              }
            >
              <i
                className="bi bi-translate"
                aria-hidden="true"
              ></i>

              <span>
                {language === "fr" ? "EN" : "FR"}
              </span>
            </button>

            {/* Contact */}

            <a
              href="#contact"
              className="navbar__contact"
              onClick={() =>
                setActiveSection("contact")
              }
            >
              <span>
                {language === "fr"
                  ? "Nous contacter"
                  : "Contact us"}
              </span>

              <i
                className="bi bi-arrow-up-right"
                aria-hidden="true"
              ></i>
            </a>
          </div>

          {/* ==================================================================
             MOBILE MENU BUTTON
             ================================================================== */}

          <button
            type="button"
            className="navbar__toggle"
            onClick={() => setMenuOpen(true)}
            aria-label={
              language === "fr"
                ? "Ouvrir le menu"
                : "Open menu"
            }
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* ======================================================================
         MOBILE OVERLAY
         ====================================================================== */}

      <div
        className={`navbar__overlay ${menuOpen
            ? "navbar__overlay--visible"
            : ""
          }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* ======================================================================
         MOBILE RIGHT DRAWER
         ====================================================================== */}

      <aside
        className={`navbar__drawer ${menuOpen
            ? "navbar__drawer--open"
            : ""
          }`}
        aria-hidden={!menuOpen}
      >
        {/* ====================================================================
           DRAWER HEADER
           ==================================================================== */}

        <div className="navbar__drawer-header">

          {/* Brand */}

          <div className="navbar__drawer-brand">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={
                  company?.company_name ||
                  "AUTO MOTORS SARL"
                }
              />
            ) : (
              <span>
                {company?.company_name ||
                  "AUTO MOTORS SARL"}
              </span>
            )}
          </div>

          {/* Close */}

          <button
            type="button"
            className="navbar__drawer-close"
            onClick={closeMenu}
            aria-label={
              language === "fr"
                ? "Fermer le menu"
                : "Close menu"
            }
          >
            <i
              className="bi bi-x-lg"
              aria-hidden="true"
            ></i>
          </button>
        </div>

        <div className="navbar__drawer-divider"></div>

        {/* ====================================================================
           MOBILE NAVIGATION
           ==================================================================== */}

        <nav
          className="navbar__mobile-nav"
          aria-label={
            language === "fr"
              ? "Navigation mobile"
              : "Mobile navigation"
          }
        >
          {navigation.map((item, index) => {
            const sectionId = item.href.substring(1);
            const isActive =
              activeSection === sectionId;

            return (
              <a
                key={item.href}
                href={item.href}
                className={`navbar__mobile-link ${isActive
                    ? "navbar__mobile-link--active"
                    : ""
                  }`}
                onClick={() =>
                  handleNavigationClick(sectionId)
                }
                aria-current={
                  isActive ? "page" : undefined
                }
              >
                <span className="navbar__mobile-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span>{item.label}</span>

                <i
                  className="bi bi-arrow-right"
                  aria-hidden="true"
                ></i>
              </a>
            );
          })}
        </nav>

        {/* ====================================================================
           DRAWER BOTTOM
           ==================================================================== */}

        <div className="navbar__drawer-bottom">

          {/* Language */}

          <button
            type="button"
            className="navbar__drawer-language"
            onClick={() => {
              toggleLanguage();
              closeMenu();
            }}
          >
            <span>
              <i
                className="bi bi-translate"
                aria-hidden="true"
              ></i>

              {language === "fr"
                ? "English"
                : "Français"}
            </span>

            <i
              className="bi bi-chevron-down"
              aria-hidden="true"
            ></i>
          </button>

          {/* Contact */}

          <a
            href="#contact"
            className="navbar__drawer-contact"
            onClick={() => {
              setActiveSection("contact");
              closeMenu();
            }}
          >
            <span>
              {language === "fr"
                ? "Nous contacter"
                : "Contact us"}
            </span>

            <i
              className="bi bi-arrow-up-right"
              aria-hidden="true"
            ></i>
          </a>

          {/* Social links */}

          {socialLinks.length > 0 && (
            <div className="navbar__drawer-socials">
              {socialLinks
                .filter(
                  (social) =>
                    Number(social.is_active) === 1
                )
                .map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.platform}
                  >
                    <i
                      className={`bi ${getIconClass(
                        "social",
                        social.icon
                      )}`}
                      aria-hidden="true"
                    ></i>
                  </a>
                ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navbar;
