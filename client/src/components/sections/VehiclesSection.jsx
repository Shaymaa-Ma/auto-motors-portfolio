
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import {
  getVehicles,
  getImageUrl,
} from "../../api/api";
import SectionHeading from "../common/SectionHeading";

const VehiclesSection = () => {
  const { language } = useLanguage();

  const [vehicles, setVehicles] = useState([]);

  /* ============================================================
     LOAD VEHICLES
     ============================================================ */

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data = await getVehicles();

        setVehicles(data || []);
      } catch (error) {
        console.error(
          "Vehicles data loading error:",
          error
        );
      }
    };

    loadVehicles();
  }, []);

  /* ============================================================
     GROUP VEHICLES BY TYPE
     ============================================================ */

  const groupedVehicles = useMemo(() => {
    return vehicles.reduce(
      (groups, vehicle) => {
        const type =
          language === "fr"
            ? vehicle.type_fr
            : vehicle.type_en;

        if (!groups[type]) {
          groups[type] = [];
        }

        groups[type].push(vehicle);

        return groups;
      },
      {}
    );
  }, [vehicles, language]);

  if (!vehicles.length) {
    return null;
  }

  const firstVehicle = vehicles[0];

  const sectionTitle =
    language === "fr"
      ? firstVehicle.section_title_fr
      : firstVehicle.section_title_en;

  const sectionSubtitle =
    language === "fr"
      ? firstVehicle.section_subtitle_fr
      : firstVehicle.section_subtitle_en;

  /* ============================================================
     ANIMATION VARIANTS
     ============================================================ */

  // Main section heading.
  const headingVariants = {
    hidden: {
      opacity: 0,
      y: 35,
      filter: "blur(7px)",
    },

    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",

      transition: {
        duration: 0.85,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      },
    },
  };

  // Each vehicle group enters from below.
  const groupVariants = {
    hidden: {
      opacity: 0,
      y: 45,
      filter: "blur(6px)",
    },

    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",

      transition: {
        duration: 0.8,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      },
    },
  };

  // Group title enters from the left.
  const groupHeadingVariants = {
    hidden: {
      opacity: 0,
      x: -35,
      filter: "blur(5px)",
    },

    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",

      transition: {
        duration: 0.7,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      },
    },
  };

  // Controls the stagger of vehicle cards.
  const cardsContainerVariants = {
    hidden: {
      opacity: 1,
    },

    visible: {
      opacity: 1,

      transition: {
        delayChildren: 0.12,
        staggerChildren: 0.12,
      },
    },
  };

  // Vehicle cards rise into position.
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 45,
      scale: 0.96,
      filter: "blur(6px)",
    },

    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",

      transition: {
        duration: 0.7,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      },
    },
  };

  // Vehicle image enters slightly after the card.
  const imageVariants = {
    hidden: {
      opacity: 0,
      scale: 1.04,
    },

    visible: {
      opacity: 1,
      scale: 1,

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

  // Group icon entrance.
  const iconVariants = {
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
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      },
    },
  };

  return (
    <section
      id="vehicles"
      className="vehicles section"
    >
      <div className="container">

        {/* ======================================================
            SECTION HEADING
            ====================================================== */}

        <motion.div
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.3,
            margin:
              "0px 0px -80px 0px",
          }}
        >
          <SectionHeading
            title={sectionTitle}
            subtitle={sectionSubtitle}
          />
        </motion.div>

        {/* ======================================================
            VEHICLE GROUPS
            ====================================================== */}

        <div className="vehicles__groups">
          {Object.entries(
            groupedVehicles
          ).map(
            ([type, items], groupIndex) => {

              /*
               * Use the icon stored in the database.
               *
               * The first vehicle in each group provides
               * the icon for that group.
               */
              const groupIcon =
                items[0]?.icon ||
                "bi-truck";

              return (
                <motion.div
                  className="vehicles__group"
                  key={type}
                  variants={groupVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{
                    once: true,
                    amount: 0.18,
                    margin:
                      "0px 0px -70px 0px",
                  }}
                >

                  {/* ==================================================
                      GROUP HEADING
                      ================================================== */}

                  <motion.div
                    className="vehicles__group-heading"
                    variants={
                      groupHeadingVariants
                    }
                  >
                    <motion.div
                      className="vehicles__group-icon"
                      variants={
                        iconVariants
                      }
                      whileHover={{
                        scale: 1.08,
                        rotate: -3,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    >
                      {groupIcon && (
                        <i
                          className={`bi ${groupIcon}`}
                          aria-hidden="true"
                        />
                      )}
                    </motion.div>

                    <h3>{type}</h3>
                  </motion.div>

                  {/* ==================================================
                      VEHICLE GRID
                      ================================================== */}

                  <motion.div
                    className="vehicles__grid"
                    variants={
                      cardsContainerVariants
                    }
                  >
                    {items.map(
                      (vehicle) => {
                        const name =
                          language === "fr"
                            ? vehicle.name_fr
                            : vehicle.name_en;

                        const description =
                          language === "fr"
                            ? vehicle.description_fr
                            : vehicle.description_en;

                        return (
                          <motion.article
                            className="vehicle-card"
                            key={vehicle.id}
                            variants={
                              cardVariants
                            }
                            whileHover={{
                              y: -7,
                            }}
                            whileTap={{
                              scale: 0.98,
                            }}
                          >

                            {/* ========================================
                                VEHICLE IMAGE
                                ======================================== */}

                            {vehicle.image && (
                              <motion.div
                                className="vehicle-card__image"
                                variants={
                                  imageVariants
                                }
                                whileHover={{
                                  scale: 1.025,
                                }}
                                transition={{
                                  duration: 0.35,
                                  ease: "easeOut",
                                }}
                              >
                                <img
                                  src={getImageUrl(
                                    vehicle.image
                                  )}
                                  alt={
                                    name ||
                                    "Vehicle"
                                  }
                                  loading="lazy"
                                  decoding="async"
                                />
                              </motion.div>
                            )}

                            {/* ========================================
                                VEHICLE CONTENT
                                ======================================== */}

                            <div className="vehicle-card__content">
                              {name && (
                                <h4>
                                  {name}
                                </h4>
                              )}

                              {description && (
                                <p>
                                  {description}
                                </p>
                              )}
                            </div>
                          </motion.article>
                        );
                      }
                    )}
                  </motion.div>
                </motion.div>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
};

export default VehiclesSection;
