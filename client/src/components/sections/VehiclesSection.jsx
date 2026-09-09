import React, { useEffect, useMemo, useState } from "react";
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

  const groupedVehicles = useMemo(() => {
    return vehicles.reduce((groups, vehicle) => {
      const type =
        language === "fr"
          ? vehicle.type_fr
          : vehicle.type_en;

      if (!groups[type]) {
        groups[type] = [];
      }

      groups[type].push(vehicle);

      return groups;
    }, {});
  }, [vehicles, language]);

  if (!vehicles.length) return null;

  const firstVehicle = vehicles[0];

  const sectionTitle =
    language === "fr"
      ? firstVehicle.section_title_fr
      : firstVehicle.section_title_en;

  const sectionSubtitle =
    language === "fr"
      ? firstVehicle.section_subtitle_fr
      : firstVehicle.section_subtitle_en;

  /* --------------------------------------------------------------------------
     ANIMATION VARIANTS
     -------------------------------------------------------------------------- */

  const sectionVariants = {
    hidden: {
      opacity: 0,
      y: 40,
    },

    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  const groupVariants = {
    hidden: {
      opacity: 0,
      y: 35,
    },

    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const headingVariants = {
    hidden: {
      opacity: 0,
      x: -25,
    },

    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const cardsContainerVariants = {
    hidden: {},

    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.97,
    },

    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      id="vehicles"
      className="vehicles section"
    >
      <div className="container">

        {/* ------------------------------------------------------------------
            SECTION HEADING
            ------------------------------------------------------------------ */}

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.2,
          }}
        >
          <SectionHeading
            title={sectionTitle}
            subtitle={sectionSubtitle}
          />
        </motion.div>

        {/* ------------------------------------------------------------------
            VEHICLE GROUPS
            ------------------------------------------------------------------ */}

        <div className="vehicles__groups">
          {Object.entries(groupedVehicles).map(
            ([type, items]) => {

              /*
               * Use the icon stored in the database.
               *
               * We take the first vehicle in the group because all
               * vehicles belonging to the same type/group can share
               * the same icon.
               *
               * Example DB value:
               * bi-car-front
               * bi-truck
               * bi-bicycle
               */
              const groupIcon =
                items[0]?.icon || "bi-truck";

              return (
                <motion.div
                  className="vehicles__group"
                  key={type}
                  variants={groupVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{
                    once: true,
                    amount: 0.15,
                  }}
                >

                  {/* --------------------------------------------------------
                      GROUP HEADING
                      -------------------------------------------------------- */}

                  <motion.div
                    className="vehicles__group-heading"
                    variants={headingVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{
                      once: true,
                      amount: 0.3,
                    }}
                  >
                    <motion.div
                      className="vehicles__group-icon"
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
                        ></i>
                      )}
                    </motion.div>

                    <h3>{type}</h3>
                  </motion.div>

                  {/* --------------------------------------------------------
                      VEHICLES GRID
                      -------------------------------------------------------- */}

                  <motion.div
                    className="vehicles__grid"
                    variants={cardsContainerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{
                      once: true,
                      amount: 0.1,
                    }}
                  >
                    {items.map((vehicle) => {

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
                          variants={cardVariants}
                          whileHover={{
                            y: -6,
                            transition: {
                              duration: 0.2,
                            },
                          }}
                        >

                          {/* ------------------------------------------------
                              VEHICLE IMAGE
                              ------------------------------------------------ */}

                          {vehicle.image && (
                            <motion.div
                              className="vehicle-card__image"
                              initial={{
                                opacity: 0,
                                scale: 1.04,
                              }}
                              whileInView={{
                                opacity: 1,
                                scale: 1,
                              }}
                              viewport={{
                                once: true,
                                amount: 0.2,
                              }}
                              transition={{
                                duration: 0.6,
                                ease: "easeOut",
                              }}
                            >
                              <img
                                src={getImageUrl(
                                  vehicle.image
                                )}
                                alt={name}
                                loading="lazy"
                                decoding="async"
                              />
                            </motion.div>
                          )}

                          {/* ------------------------------------------------
                              VEHICLE CONTENT
                              ------------------------------------------------ */}

                          <div className="vehicle-card__content">

                            {name && (
                              <h4>{name}</h4>
                            )}

                            {description && (
                              <p>{description}</p>
                            )}

                          </div>
                        </motion.article>
                      );
                    })}
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