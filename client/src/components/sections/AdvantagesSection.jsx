import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { getAdvantages } from "../../api/api";
import SectionHeading from "../common/SectionHeading";

const AdvantagesSection = () => {
  const { language } = useLanguage();

  const [advantages, setAdvantages] = useState([]);

  useEffect(() => {
    const loadAdvantages = async () => {
      try {
        const data = await getAdvantages();
        setAdvantages(data || []);
      } catch (error) {
        console.error("Advantages data loading error:", error);
      }
    };

    loadAdvantages();
  }, []);

  if (!advantages.length) return null;

  const firstAdvantage = advantages[0];

  const sectionTitle =
    language === "fr"
      ? firstAdvantage.section_title_fr
      : firstAdvantage.section_title_en;

  const sectionSubtitle =
    language === "fr"
      ? firstAdvantage.section_subtitle_fr
      : firstAdvantage.section_subtitle_en;

  const headingVariants = {
    hidden: {
      opacity: 0,
      y: 35,
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
      y: 35,
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
    <section id="advantages" className="advantages section">
      <div className="container">

        <motion.div
          variants={headingVariants}
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

        <motion.div
          className="advantages__grid"
          variants={cardsContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.1,
          }}
        >
          {advantages.map((advantage) => {
            const title =
              language === "fr"
                ? advantage.title_fr
                : advantage.title_en;

            const description =
              language === "fr"
                ? advantage.description_fr
                : advantage.description_en;

            return (
              <motion.article
                key={advantage.id}
                className="advantage-card"
                variants={cardVariants}
                whileHover={{
                  y: -7,
                  transition: {
                    duration: 0.2,
                    ease: "easeOut",
                  },
                }}
              >
                <motion.div
                  className="advantage-card__icon"
                  whileHover={{
                    scale: 1.1,
                    rotate: -4,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeOut",
                  }}
                >
                  {advantage.icon && (
                    <i
                      className={`bi ${advantage.icon}`}
                      aria-hidden="true"
                    ></i>
                  )}
                </motion.div>

                <div className="advantage-card__content">
                  {title && <h3>{title}</h3>}

                  {description && <p>{description}</p>}
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default AdvantagesSection;