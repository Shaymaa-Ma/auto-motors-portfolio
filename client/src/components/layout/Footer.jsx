
import React, { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import {
  getCompany,
  getSocialLinks,
  getImageUrl,
} from "../../api/api";

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

  /* ==========================================================================
     FOOTER NAVIGATION

     Follows the main website structure while keeping the footer concise.
     ========================================================================== */

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
      href: "#advantages",
      label:
        language === "fr"
          ? "Avantages"
          : "Advantages",
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

        {/* ====================================================================
           MAIN FOOTER CONTENT
           ==================================================================== */}

        <motion.div
          className="footer__grid"
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
        >

          {/* ==================================================================
             BRAND
             ================================================================== */}

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

          {/* ==================================================================
             NAVIGATION
             ================================================================== */}

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

          {/* ==================================================================
             SOCIAL
             ================================================================== */}

          <div className="footer__social-column">

            <h3>{socialLabel}</h3>

            {activeSocialLinks.length > 0 && (
              <div className="footer__social">
                {activeSocialLinks.map(
                  (social, index) => (
                    <motion.a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={social.id}
                      aria-label={social.platform}
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      whileHover={{
                        y: -3,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.08,
                      }}
                    >
                      {social.icon && (
                        <i
                          className={`bi ${social.icon}`}
                          aria-hidden="true"
                        ></i>
                      )}
                    </motion.a>
                  )
                )}
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

        </motion.div>

        {/* ====================================================================
           BOTTOM
           ==================================================================== */}

        <motion.div
          className="footer__bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            delay: 0.2,
          }}
        >

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

        </motion.div>

      </div>
    </footer>
  );
};

export default Footer;