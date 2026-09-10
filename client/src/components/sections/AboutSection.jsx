
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { useLanguage } from "../../context/LanguageContext";
import { getAbout, getImageUrl } from "../../api/api";

const AboutSection = () => {
  const { language } = useLanguage();

  const [about, setAbout] = useState(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  /* ==========================================================================
     LOAD ABOUT DATA
     ========================================================================== */

  useEffect(() => {
    const loadAbout = async () => {
      try {
        const data = await getAbout();
        setAbout(data || null);
      } catch (error) {
        console.error("Failed to load About section:", error);
      }
    };

    loadAbout();
  }, []);

  /* ==========================================================================
     WAIT FOR THE USER TO ACTUALLY START SCROLLING
     ========================================================================== */

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setHasScrolled(true);

        window.removeEventListener(
          "scroll",
          handleScroll
        );
      }
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  /* ==========================================================================
     LOADING
     ========================================================================== */

  if (!about) {
    return null;
  }

  /* ==========================================================================
     LOCALIZED CONTENT
     ========================================================================== */

  const title =
    language === "fr"
      ? about.title_fr
      : about.title_en;

  const subtitle =
    language === "fr"
      ? about.subtitle_fr
      : about.subtitle_en;

  const description =
    language === "fr"
      ? about.description_fr
      : about.description_en;

  const missionTitle =
    language === "fr"
      ? about.mission_title_fr
      : about.mission_title_en;

  const mission =
    language === "fr"
      ? about.mission_fr
      : about.mission_en;

  const primaryButton =
    language === "fr"
      ? about.primary_button_fr
      : about.primary_button_en;

  const secondaryButton =
    language === "fr"
      ? about.secondary_button_fr
      : about.secondary_button_en;

  /* ==========================================================================
     ABOUT TITLE
     ========================================================================== */

  const titleVariants = {
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
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        delay: 0,
      },
    },
  };

  /* ==========================================================================
     SUBTITLE
     ========================================================================== */

  const subtitleVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      filter: "blur(6px)",
    },

    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",

      transition: {
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.12,
      },
    },
  };

  /* ==========================================================================
     DESCRIPTION
     ========================================================================== */

  const descriptionVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      filter: "blur(6px)",
    },

    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",

      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.22,
      },
    },
  };

  /* ==========================================================================
     MISSION
     ========================================================================== */

  const missionVariants = {
    hidden: {
      opacity: 0,
      y: 35,
      scale: 0.97,
      filter: "blur(7px)",
    },

    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",

      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.34,
      },
    },
  };

  /* ==========================================================================
     MISSION ICON
     ========================================================================== */

  const missionIconVariants = {
    hidden: {
      opacity: 0,
      scale: 0.7,
      rotate: -8,
    },

    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,

      transition: {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.48,
      },
    },
  };

  /* ==========================================================================
     IMAGE
     ========================================================================== */

  const imageVariants = {
    hidden: {
      opacity: 0,
      x: 70,
      scale: 0.92,
      filter: "blur(10px)",
    },

    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: "blur(0px)",

      transition: {
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.18,
      },
    },
  };

  /* ==========================================================================
     IMAGE DECORATION
     ========================================================================== */

  const decorationVariants = {
    hidden: {
      opacity: 0,
      x: 35,
      y: -20,
      scale: 0.85,
      rotate: -3,
    },

    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,

      transition: {
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.65,
      },
    },
  };

  /* ==========================================================================
     IMAGE CORNER
     ========================================================================== */

  const cornerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.6,
      x: 18,
      y: 18,
    },

    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,

      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.78,
      },
    },
  };

  /* ==========================================================================
     BUTTONS
     ========================================================================== */

  const buttonsVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      filter: "blur(6px)",
    },

    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",

      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.5,
      },
    },
  };

  /* ==========================================================================
     BUTTON HOVER
     ========================================================================== */

  const buttonHover = {
    y: -4,
  };

  /* ==========================================================================
     RENDER
     ========================================================================== */

  return (
    <section
      id="about"
      className="about section"
    >
      <div className="container">

        {/* ==================================================================
            ABOUT GRID

            This is ONLY the trigger.

            It does not move the complete section.

            Each child below has its own animation.
            ================================================================== */}

        <motion.div
          className="about__grid"

          initial="hidden"

          /*
           * Important:
           *
           * Before the user scrolls, About has no whileInView.
           *
           * Therefore refreshing at the Hero does not start
           * the About animations.
           */
          {...(hasScrolled
            ? {
                whileInView: "visible",

                viewport: {
                  once: true,

                  /*
                   * About starts when a meaningful part of the
                   * section reaches the viewport.
                   */
                  amount: 0.25,

                  /*
                   * Delays the trigger slightly so it does not
                   * start while the Hero is still being viewed.
                   */
                  margin: "0px 0px -120px 0px",
                },
              }
            : {})}
        >

          {/* ================================================================
              LEFT CONTENT
              ================================================================ */}

          <div className="about__content">

            {/* --------------------------------------------------------------
                TITLE
                -------------------------------------------------------------- */}

            {title && (
              <motion.h2
                className="about__title"

                variants={titleVariants}
              >
                {title}
              </motion.h2>
            )}

            {/* --------------------------------------------------------------
                SUBTITLE
                -------------------------------------------------------------- */}

            {subtitle && (
              <motion.p
                className="about__subtitle"

                variants={subtitleVariants}
              >
                {subtitle}
              </motion.p>
            )}

            {/* --------------------------------------------------------------
                DESCRIPTION
                -------------------------------------------------------------- */}

            {description && (
              <motion.p
                className="about__description"

                variants={descriptionVariants}
              >
                {description}
              </motion.p>
            )}

            {/* ==============================================================
                MISSION
                ============================================================== */}

            {mission && (
              <motion.div
                className="about__mission"

                variants={missionVariants}

                whileHover={{
                  y: -5,
                }}

                transition={{
                  duration: 0.25,
                  ease: "easeOut",
                }}
              >

                {/* ----------------------------------------------------------
                    ICON
                    ---------------------------------------------------------- */}

                <motion.div
                  className="about__mission-icon"

                  variants={
                    missionIconVariants
                  }

                  whileHover={{
                    scale: 1.1,
                    rotate: 5,
                  }}

                  transition={{
                    duration: 0.25,
                    ease: "easeOut",
                  }}
                >
                  <i
                    className="bi bi-bullseye"
                    aria-hidden="true"
                  />
                </motion.div>

                {/* ----------------------------------------------------------
                    MISSION CONTENT
                    ---------------------------------------------------------- */}

                <div className="about__mission-content">

                  {missionTitle && (
                    <h3>
                      {missionTitle}
                    </h3>
                  )}

                  <p>
                    {mission}
                  </p>

                </div>

              </motion.div>
            )}

            {/* ==============================================================
                BUTTONS
                ============================================================== */}

            {(primaryButton ||
              secondaryButton) && (

              <motion.div
                className="about__actions"

                variants={
                  buttonsVariants
                }
              >

                {/* ----------------------------------------------------------
                    PRIMARY BUTTON
                    ---------------------------------------------------------- */}

                {primaryButton && (
                  <motion.a
                    href={
                      about.primary_button_link ||
                      "#products"
                    }

                    className="button button--primary"

                    whileHover={
                      buttonHover
                    }

                    whileTap={{
                      scale: 0.97,
                    }}

                    transition={{
                      duration: 0.22,
                      ease: "easeOut",
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

                      transition={{
                        duration: 0.2,
                        ease: "easeOut",
                      }}
                    />
                  </motion.a>
                )}

                {/* ----------------------------------------------------------
                    SECONDARY BUTTON
                    ---------------------------------------------------------- */}

                {secondaryButton && (
                  <motion.a
                    href={
                      about.secondary_button_link ||
                      "#contact"
                    }

                    className="button button--secondary"

                    whileHover={
                      buttonHover
                    }

                    whileTap={{
                      scale: 0.97,
                    }}

                    transition={{
                      duration: 0.22,
                      ease: "easeOut",
                    }}
                  >
                    {secondaryButton}
                  </motion.a>
                )}

              </motion.div>
            )}

          </div>


          {/* ================================================================
              RIGHT IMAGE
              ================================================================ */}

          {about.image && (
            <motion.div
              className="about__image"

              variants={imageVariants}
            >

              {/* ------------------------------------------------------------
                  DECORATIVE SHAPE
                  ------------------------------------------------------------ */}

              <motion.span
                className="about__image-decoration"

                aria-hidden="true"

                variants={
                  decorationVariants
                }
              />

              {/* ------------------------------------------------------------
                  MAIN IMAGE
                  ------------------------------------------------------------ */}

              <motion.img
                src={getImageUrl(about.image)}

                alt={
                  language === "fr"
                    ? "À propos de AUTO MOTORS SARL"
                    : "About AUTO MOTORS SARL"
                }

                loading="lazy"

                decoding="async"

                whileHover={{
                  scale: 1.025,
                }}

                transition={{
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />

              {/* ------------------------------------------------------------
                  CORNER ACCENT
                  ------------------------------------------------------------ */}

              <motion.span
                className="about__image-corner"

                aria-hidden="true"

                variants={
                  cornerVariants
                }
              />

            </motion.div>
          )}

        </motion.div>

      </div>
    </section>
  );
};

export default AboutSection;
