
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

  // Animation settings
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

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
      {/* Background animation */}
      <motion.div
        className="hero__animated-bg"
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 2,
          ease: "easeOut",
        }}
      />

      <div className="hero__overlay"></div>

      <div className="container hero__container">
        <motion.div
          className="hero__content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Company */}
          {company?.company_name && (
            <motion.span
              className="hero__eyebrow"
              variants={itemVariants}
            >
              {company.company_name}
            </motion.span>
          )}

          {/* Main title */}
          {title && (
            <motion.h1
              className="hero__title"
              variants={itemVariants}
            >
              {title}
            </motion.h1>
          )}

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              className="hero__subtitle"
              variants={itemVariants}
            >
              {subtitle}
            </motion.p>
          )}

          {/* Description */}
          {description && (
            <motion.p
              className="hero__description"
              variants={itemVariants}
            >
              {description}
            </motion.p>
          )}

          {/* Buttons */}
          {(primaryButton || secondaryButton) && (
            <motion.div
              className="hero__actions"
              variants={itemVariants}
            >
              {primaryButton && (
                <motion.a
                  href="#products"
                  className="hero__button hero__button--primary"
                  whileHover={{
                    y: -3,
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                >
                  <span>{primaryButton}</span>

                  <motion.i
                    className="bi bi-arrow-right"
                    aria-hidden="true"
                    whileHover={{
                      x: 5,
                    }}
                  ></motion.i>
                </motion.a>
              )}

              {secondaryButton && (
                <motion.a
                  href="#contact"
                  className="hero__button hero__button--secondary"
                  whileHover={{
                    y: -3,
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                >
                  {secondaryButton}
                </motion.a>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#about"
        className="hero__scroll"
        aria-label={
          language === "fr"
            ? "Découvrir la section À propos"
            : "Discover the About section"
        }
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 1.4,
          duration: 0.8,
        }}
      >
        <span>
          {language === "fr" ? "Découvrir" : "Discover"}
        </span>

        <motion.i
          className="bi bi-arrow-down"
          aria-hidden="true"
          animate={{
            y: [0, 6, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        ></motion.i>
      </motion.a>
    </section>
  );
};

export default HeroSection;
