import React, {
  useEffect,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  useLanguage,
} from "../../context/LanguageContext";

import {
  getAbout,
  getImageUrl,
} from "../../api/api";


const AboutSection = () => {
  const {
    language,
  } = useLanguage();

  const [
    about,
    setAbout,
  ] = useState(null);


  /* ==========================================================================
     LOAD ABOUT DATA
     ========================================================================== */

  useEffect(() => {
    const loadAbout = async () => {
      try {
        const data =
          await getAbout();

        setAbout(
          data || null
        );
      } catch (error) {
        console.error(
          "About data loading error:",
          error
        );
      }
    };

    loadAbout();
  }, []);


  /* ==========================================================================
     SAFETY
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
     CONTENT ANIMATION
     ========================================================================== */

  const contentVariants = {
    hidden: {
      opacity: 0,
      x: -35,
    },

    visible: {
      opacity: 1,
      x: 0,

      transition: {
        duration: 0.8,

        ease: [
          0.22,
          1,
          0.36,
          1,
        ],

        staggerChildren: 0.12,
      },
    },
  };


  /* ==========================================================================
     CONTENT ITEM ANIMATION
     ========================================================================== */

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },

    visible: {
      opacity: 1,
      y: 0,

      transition: {
        duration: 0.65,

        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      },
    },
  };


  /* ==========================================================================
     IMAGE ANIMATION
     ========================================================================== */

  const imageVariants = {
    hidden: {
      opacity: 0,
      x: 35,
      scale: 0.965,
    },

    visible: {
      opacity: 1,
      x: 0,
      scale: 1,

      transition: {
        duration: 0.95,

        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      },
    },
  };


  /* ==========================================================================
     IMAGE DECORATION ANIMATION
     ========================================================================== */

  const decorationVariants = {
    hidden: {
      opacity: 0,
      x: 10,
      y: -8,
    },

    visible: {
      opacity: 1,
      x: 0,
      y: 0,

      transition: {
        delay: 0.25,
        duration: 0.75,

        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      },
    },
  };


  /* ==========================================================================
     IMAGE CORNER ANIMATION
     ========================================================================== */

  const cornerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.85,
    },

    visible: {
      opacity: 1,
      scale: 1,

      transition: {
        delay: 0.55,
        duration: 0.5,

        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      },
    },
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

        {/* ================================================================
           ABOUT LAYOUT
           ================================================================ */}

        <div className="about__grid">

          {/* ==============================================================
             ABOUT CONTENT
             ============================================================== */}

          <motion.div
            className="about__content"

            variants={
              contentVariants
            }

            initial="hidden"

            whileInView="visible"

            viewport={{
              once: true,
              amount: 0.2,
            }}
          >

            {/* ----------------------------------------------------------
               TITLE
               ---------------------------------------------------------- */}

            {title && (
              <motion.h2
                className="about__title"

                variants={
                  itemVariants
                }
              >
                {title}
              </motion.h2>
            )}


            {/* ----------------------------------------------------------
               SUBTITLE
               ---------------------------------------------------------- */}

            {subtitle && (
              <motion.p
                className="about__subtitle"

                variants={
                  itemVariants
                }
              >
                {subtitle}
              </motion.p>
            )}


            {/* ----------------------------------------------------------
               DESCRIPTION
               ---------------------------------------------------------- */}

            {description && (
              <motion.p
                className="about__description"

                variants={
                  itemVariants
                }
              >
                {description}
              </motion.p>
            )}


            {/* ----------------------------------------------------------
               MISSION
               ---------------------------------------------------------- */}

            {mission && (
              <motion.div
                className="about__mission"

                variants={
                  itemVariants
                }

                whileHover={{
                  y: -2,
                }}

                transition={{
                  duration: 0.25,

                  ease: "easeOut",
                }}
              >

                {/* Mission icon */}

                <motion.div
                  className="about__mission-icon"

                  whileHover={{
                    scale: 1.04,
                    rotate: 4,
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


                {/* Mission content */}

                <div
                  className="about__mission-content"
                >
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


            {/* ==========================================================
               ABOUT ACTIONS
               ========================================================== */}

            {(primaryButton ||
              secondaryButton) && (
              <motion.div
                className="about__actions"

                variants={
                  itemVariants
                }
              >

                {/* ------------------------------------------------------
                   PRIMARY BUTTON
                   ------------------------------------------------------ */}

                {primaryButton && (
                  <motion.a
                    href={
                      about.primary_button_link ||
                      "#products"
                    }

                    className="button button--primary"

                    whileHover={{
                      y: -2,
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
                        x: 3,
                      }}

                      transition={{
                        duration: 0.2,
                      }}
                    />
                  </motion.a>
                )}


                {/* ------------------------------------------------------
                   SECONDARY BUTTON
                   ------------------------------------------------------ */}

                {secondaryButton && (
                  <motion.a
                    href={
                      about.secondary_button_link ||
                      "#contact"
                    }

                    className="button button--secondary"

                    whileHover={{
                      y: -2,
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


          {/* ==============================================================
             ABOUT IMAGE
             ============================================================== */}

          {about.image && (
            <motion.div
              className="about__image"

              variants={
                imageVariants
              }

              initial="hidden"

              whileInView="visible"

              viewport={{
                once: true,
                amount: 0.2,
              }}
            >

              {/* --------------------------------------------------------
                 DECORATIVE BACKGROUND
                 -------------------------------------------------------- */}

              <motion.span
                className="about__image-decoration"

                aria-hidden="true"

                variants={
                  decorationVariants
                }
              />


              {/* --------------------------------------------------------
                 IMAGE
                 -------------------------------------------------------- */}

              <motion.img
                src={
                  getImageUrl(
                    about.image
                  )
                }

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
                  duration: 0.5,

                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
              />


              {/* --------------------------------------------------------
                 BLUE CORNER ACCENT
                 -------------------------------------------------------- */}

              <motion.span
                className="about__image-corner"

                aria-hidden="true"

                variants={
                  cornerVariants
                }
              />

            </motion.div>
          )}

        </div>

      </div>
    </section>
  );
};


export default AboutSection;