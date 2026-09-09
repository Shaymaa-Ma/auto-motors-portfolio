import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { getServices } from "../../api/api";
import SectionHeading from "../common/SectionHeading";

const ServicesSection = () => {
  const { language } = useLanguage();

  const [services, setServices] = useState([]);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await getServices();
        setServices(data || []);
      } catch (error) {
        console.error("Services data loading error:", error);
      }
    };

    loadServices();
  }, []);

  if (!services.length) return null;

  const firstService = services[0];

  const sectionTitle =
    language === "fr"
      ? firstService.section_title_fr
      : firstService.section_title_en;

  const sectionSubtitle =
    language === "fr"
      ? firstService.section_subtitle_fr
      : firstService.section_subtitle_en;

  // Section heading animation
  const headingVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Card container animation
  const gridVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  // Individual card animation
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 45,
      scale: 0.97,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section id="services" className="services section">
      <div className="container">

        {/* Section heading */}
        <motion.div
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.3,
          }}
        >
          <SectionHeading
            title={sectionTitle}
            subtitle={sectionSubtitle}
          />
        </motion.div>

        {/* Services */}
        <motion.div
          className="services__grid"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.15,
          }}
        >
          {services.map((service) => {
            const name =
              language === "fr"
                ? service.name_fr
                : service.name_en;

            const description =
              language === "fr"
                ? service.description_fr
                : service.description_en;

            return (
              <motion.article
                key={service.id}
                className="service-card"
                variants={cardVariants}
                whileHover={{
                  y: -8,
                  transition: {
                    duration: 0.25,
                    ease: "easeOut",
                  },
                }}
                whileTap={{
                  scale: 0.98,
                }}
              >
                {/* Icon loaded directly from database */}
                <motion.div
                  className="service-card__icon"
                  whileHover={{
                    scale: 1.08,
                    rotate: 4,
                  }}
                  transition={{
                    duration: 0.25,
                    ease: "easeOut",
                  }}
                >
                  {service.icon && (
                    <i
                      className={`bi ${service.icon}`}
                      aria-hidden="true"
                    ></i>
                  )}
                </motion.div>

                {/* Content */}
                <div className="service-card__content">
                  {name && <h3>{name}</h3>}

                  {description && (
                    <p>{description}</p>
                  )}
                </div>
              </motion.article>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};

export default ServicesSection;