
import React, { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import {
  getCompany,
  getSocialLinks,
} from "../../api/api";
import { getImageUrl } from "../../api/api";
import { getIconClass } from "../../utils/icons";

const Footer = () => {
  const { language } = useLanguage();

  const [company, setCompany] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    const loadFooterData = async () => {
      try {
        const [companyData, socialData] =
          await Promise.all([
            getCompany(),
            getSocialLinks(),
          ]);

        setCompany(companyData || null);
        setSocialLinks(socialData || []);
      } catch (error) {
        console.error(
          "Footer data loading error:",
          error
        );
      }
    };

    loadFooterData();
  }, []);

  if (!company) return null;

  const logo = company.logo
    ? getImageUrl(company.logo)
    : "";

  const tagline =
    language === "fr"
      ? company.tagline_fr
      : company.tagline_en;

  const navigation = [
    {
      href: "#home",
      label:
        language === "fr"
          ? "Accueil"
          : "Home",
    },
    {
      href: "#about",
      label:
        language === "fr"
          ? "À propos"
          : "About",
    },
    {
      href: "#services",
      label: "Services",
    },
    {
      href: "#products",
      label:
        language === "fr"
          ? "Produits"
          : "Products",
    },
    {
      href: "#vehicles",
      label:
        language === "fr"
          ? "Véhicules"
          : "Vehicles",
    },
    {
      href: "#contact",
      label: "Contact",
    },
  ];

  const navigationLabel =
    language === "fr"
      ? "Navigation"
      : "Navigation";

  const socialLabel =
    language === "fr"
      ? "Suivez-nous"
      : "Follow us";

  const copyright =
    language === "fr"
      ? "Tous droits réservés."
      : "All rights reserved.";

  const backToTop =
    language === "fr"
      ? "Retour en haut"
      : "Back to top";

  const activeSocialLinks = socialLinks.filter(
    (social) => Number(social.is_active) === 1
  );

  return (
    <footer className="footer">
      <div className="container">

        <div className="footer__grid">

          {/* BRAND */}
          <div className="footer__brand">

            <a
              href="#home"
              className="footer__brand-link"
              aria-label={
                company.company_name ||
                "AUTO MOTORS SARL"
              }
            >
              {logo ? (
                <img
                  src={logo}
                  alt={
                    company.company_name ||
                    "AUTO MOTORS SARL"
                  }
                  className="footer__logo"
                />
              ) : (
                <span className="footer__company-name">
                  {company.company_name}
                </span>
              )}
            </a>

            {tagline && (
              <p className="footer__tagline">
                {tagline}
              </p>
            )}

            <span className="footer__business-line">
              {language === "fr"
                ? "Pièces automobiles • Importation • Distribution"
                : "Automotive parts • Importation • Distribution"}
            </span>

          </div>


          {/* NAVIGATION */}
          <div className="footer__navigation">

            <h3>{navigationLabel}</h3>

            <nav aria-label={navigationLabel}>
              {navigation.map((item) => (
                <a
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </a>
              ))}
            </nav>

          </div>


          {/* SOCIAL */}
          <div className="footer__social-column">

            <h3>{socialLabel}</h3>

            {activeSocialLinks.length > 0 && (
              <div className="footer__social">
                {activeSocialLinks.map((social) => (
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={social.id}
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

            <a
              href="#contact"
              className="footer__contact-link"
            >
              <span>
                {language === "fr"
                  ? "Besoin d'informations ?"
                  : "Need information?"}
              </span>

              <i
                className="bi bi-arrow-right"
                aria-hidden="true"
              ></i>
            </a>

          </div>

        </div>


        {/* BOTTOM */}
        <div className="footer__bottom">

          <p>
            © {new Date().getFullYear()}{" "}
            {company.company_name}.{" "}
            {copyright}
          </p>

          <a href="#home">
            <span>{backToTop}</span>

            <i
              className="bi bi-arrow-up"
              aria-hidden="true"
            ></i>
          </a>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
