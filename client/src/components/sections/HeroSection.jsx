
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

  // ==========================================================
  // LOAD HERO + COMPANY
  // ==========================================================

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

  // ==========================================================
  // LOADING
  // ==========================================================

  if (!hero) {
    return null;
  }

  // ==========================================================
  // LANGUAGE CONTENT
  // ==========================================================

  const title =
    language === "fr"
      ? hero.title_fr
      : hero.title_en;

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

  // ==========================================================
  // HERO IMAGES
  // ==========================================================

  const desktopImage = hero.background_image_desktop
    ? getImageUrl(hero.background_image_desktop)
    : "";

  const mobileImage = hero.background_image_mobile
    ? getImageUrl(hero.background_image_mobile)
    : desktopImage;

  // ==========================================================
  // ANIMATIONS
  // ==========================================================

  /*
   * Main content container
   *
   * Each child appears one after another instead of
   * everything appearing at exactly the same time.
   */
  const containerVariants = {
    hidden: {
      opacity: 0,
    },

    visible: {
      opacity: 1,

      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.2,
      },
    },
  };

  /*
   * Individual hero elements
   *
   * The blur is subtle and gives the reveal a more
   * premium / modern feeling.
   */
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 45,
      filter: "blur(8px)",
    },

    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",

      transition: {
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <section
      id="home"
      className="hero"
    >

      {/* =====================================================
          RESPONSIVE HERO BACKGROUND
          ===================================================== */}

      {desktopImage && (
        <picture className="hero__background">

          {mobileImage && (
            <source
              media="(max-width: 767.98px)"
              srcSet={mobileImage}
            />
          )}

          <img
            src={desktopImage}
            alt=""
            className="hero__background-image"
            aria-hidden="true"
          />

        </picture>
      )}


      {/* =====================================================
          BACKGROUND ANIMATION
          ===================================================== */}

      <motion.div
        className="hero__animated-bg"
        initial={{
          opacity: 0,
          scale: 1.08,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          opacity: {
            duration: 1.2,
            ease: "easeOut",
          },

          scale: {
            duration: 2,
            ease: [0.22, 1, 0.36, 1],
          },
        }}
      />


      {/* =====================================================
          OVERLAY
          ===================================================== */}

      <div className="hero__overlay"></div>


      {/* =====================================================
          CONTENT
          ===================================================== */}

      <div className="container hero__container">

        <motion.div
          className="hero__content"

          variants={containerVariants}

          initial="hidden"

          animate="visible"
        >

          {/* =================================================
              COMPANY
              ================================================= */}

          {company?.company_name && (
            <motion.span
              className="hero__eyebrow"
              variants={itemVariants}
            >
              {company.company_name}
            </motion.span>
          )}


          {/* =================================================
              TITLE — TYPEWRITER EFFECT
              ================================================= */}

          {title && (
            <TypewriterTitle title={title} />
          )}


          {/* =================================================
              SUBTITLE
              ================================================= */}

          {subtitle && (
            <motion.p
              className="hero__subtitle"
              variants={itemVariants}
            >
              {subtitle}
            </motion.p>
          )}


          {/* =================================================
              DESCRIPTION
              ================================================= */}

          {description && (
            <motion.p
              className="hero__description"
              variants={itemVariants}
            >
              {description}
            </motion.p>
          )}


          {/* =================================================
              BUTTONS
              ================================================= */}

          {(primaryButton || secondaryButton) && (
            <motion.div
              className="hero__actions"
              variants={itemVariants}
            >

              {/* =============================================
                  PRIMARY BUTTON
                  ============================================= */}

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

                  <span>
                    {primaryButton}
                  </span>

                  <motion.i
                    className="bi bi-arrow-right"
                    aria-hidden="true"

                    whileHover={{
                      x: 5,
                    }}
                  />

                </motion.a>
              )}


              {/* =============================================
                  SECONDARY BUTTON
                  ============================================= */}

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


      {/* =====================================================
          SCROLL INDICATOR
          ===================================================== */}

      <motion.div
        className="hero__scroll-indicator"

        initial={{
          opacity: 0,
          y: -10,
        }}

        animate={{
          opacity: 1,
          y: 0,
        }}

        transition={{
          delay: 2,
          duration: 0.8,
          ease: "easeOut",
        }}
      >

        <motion.span
          animate={{
            y: [0, 8, 0],
          }}

          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <i
            className="bi bi-chevron-down"
            aria-hidden="true"
          />
        </motion.span>

      </motion.div>

    </section>
  );
};


// ============================================================
// TYPEWRITER TITLE
// ============================================================

const TypewriterTitle = ({ title }) => {

  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {

    let currentIndex = 0;
    let timeoutId;

    const typeSpeed = 90;
    const deleteSpeed = 55;

    const pauseAfterTyping = 2200;
    const pauseBeforeTyping = 700;


    // ========================================================
    // TYPE
    // ========================================================

    const typeText = () => {

      if (currentIndex < title.length) {

        currentIndex++;

        setDisplayedText(
          title.substring(0, currentIndex)
        );

        timeoutId = setTimeout(
          typeText,
          typeSpeed
        );

        return;
      }


      timeoutId = setTimeout(
        deleteText,
        pauseAfterTyping
      );
    };


    // ========================================================
    // DELETE
    // ========================================================

    const deleteText = () => {

      if (currentIndex > 0) {

        currentIndex--;

        setDisplayedText(
          title.substring(0, currentIndex)
        );

        timeoutId = setTimeout(
          deleteText,
          deleteSpeed
        );

        return;
      }


      timeoutId = setTimeout(
        typeText,
        pauseBeforeTyping
      );
    };


    // ========================================================
    // START
    // ========================================================

    timeoutId = setTimeout(
      typeText,
      pauseBeforeTyping
    );


    // ========================================================
    // CLEANUP
    // ========================================================

    return () => {
      clearTimeout(timeoutId);
    };

  }, [title]);


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <motion.h1
      className="hero__title"

      initial={{
        opacity: 0,
        y: 35,
        filter: "blur(10px)",
      }}

      animate={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}

      transition={{
        duration: 1,
        delay: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
    >

      {displayedText}


      {/* =====================================================
          BLINKING CURSOR
          ===================================================== */}

      <motion.span
        className="hero__title-cursor"
        aria-hidden="true"

        animate={{
          opacity: [1, 0, 1],
        }}

        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        |
      </motion.span>

    </motion.h1>
  );
};


export default HeroSection;
