
import React, { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import {
  getCompany,
  getHero,
  getImageUrl,
} from "../../api/api";

const HeroSection = () => {
  const { language } = useLanguage();

  const [hero, setHero] = useState(null);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [heroData, companyData] = await Promise.all([
          getHero(),
          getCompany(),
        ]);

        setHero(heroData || null);
        setCompany(companyData || null);
      } catch (error) {
        console.error("Hero data loading error:", error);
      }
    };

    loadData();
  }, []);

  if (!hero) return null;

  const title =
    language === "fr" ? hero.title_fr : hero.title_en;

  const subtitle =
    language === "fr"
      ? hero.subtitle_fr
      : hero.subtitle_en;

  const description =
    language === "fr"
      ? hero.description_fr
      : hero.description_en;

  const primaryButton =
    language === "fr"
      ? hero.primary_button_fr
      : hero.primary_button_en;

  const secondaryButton =
    language === "fr"
      ? hero.secondary_button_fr
      : hero.secondary_button_en;

  const backgroundImage = hero.background_image
    ? getImageUrl(hero.background_image)
    : "";

  return (
    <section
      id="home"
      className="hero"
      style={
        backgroundImage
          ? {
              backgroundImage: `url("${backgroundImage}")`,
            }
          : undefined
      }
    >
      <div className="hero__overlay"></div>

      <div className="container hero__container">
        <div className="hero__content">
          {company?.company_name && (
            <span className="hero__eyebrow">
              {company.company_name}
            </span>
          )}

          {title && (
            <h1 className="hero__title">{title}</h1>
          )}

          {subtitle && (
            <p className="hero__subtitle">{subtitle}</p>
          )}

          {description && (
            <p className="hero__description">
              {description}
            </p>
          )}

          {(primaryButton || secondaryButton) && (
            <div className="hero__actions">
              {primaryButton && (
                <a
                  href="#products"
                  className="hero__button hero__button--primary"
                >
                  <span>{primaryButton}</span>
                  <i
                    className="bi bi-arrow-right"
                    aria-hidden="true"
                  ></i>
                </a>
              )}

              {secondaryButton && (
                <a
                  href="#contact"
                  className="hero__button hero__button--secondary"
                >
                  {secondaryButton}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <a
        href="#about"
        className="hero__scroll"
        aria-label={
          language === "fr"
            ? "Découvrir la section À propos"
            : "Discover the About section"
        }
      >
        <span>
          {language === "fr" ? "Découvrir" : "Discover"}
        </span>

        <i
          className="bi bi-arrow-down"
          aria-hidden="true"
        ></i>
      </a>
    </section>
  );
};

export default HeroSection;
