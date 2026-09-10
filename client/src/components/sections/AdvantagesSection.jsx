import {
  useEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { getAdvantages } from "../../api/api";
import SectionHeading from "../common/SectionHeading";

const AdvantagesSection = () => {
  const { language } = useLanguage();

  const [advantages, setAdvantages] = useState([]);

  const advantagesScrollerRef =
    useRef(null);

  useEffect(() => {
    const loadAdvantages = async () => {
      try {
        const data = await getAdvantages();

        const sortedAdvantages =
          [...(data || [])].sort(
            (a, b) =>
              Number(a.display_order || 0) -
              Number(b.display_order || 0)
          );

        setAdvantages(sortedAdvantages);
      } catch (error) {
        console.error(
          "Advantages data loading error:",
          error
        );
      }
    };

    loadAdvantages();
  }, []);

  if (!advantages.length) {
    return null;
  }

  const firstAdvantage =
    advantages[0];

  const sectionTitle =
    language === "fr"
      ? firstAdvantage.section_title_fr
      : firstAdvantage.section_title_en;

  const sectionSubtitle =
    language === "fr"
      ? firstAdvantage.section_subtitle_fr
      : firstAdvantage.section_subtitle_en;

  // Convert mouse wheel movement into horizontal scrolling
  const handleWheel = (event) => {
    const element =
      advantagesScrollerRef.current;

    if (!element) {
      return;
    }

    if (
      element.scrollWidth <=
      element.clientWidth
    ) {
      return;
    }

    if (
      Math.abs(event.deltaY) >
      Math.abs(event.deltaX)
    ) {
      event.preventDefault();

      element.scrollBy({
        left: event.deltaY,
        behavior: "smooth",
      });
    }
  };

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

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: 20,
    },

    visible: {
      opacity: 1,
      x: 0,

      transition: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section
      id="advantages"
      className="advantages section"
    >
      <div className="container">

        {/* Section heading */}
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

        {/* Horizontal advantages */}
        <div
          ref={advantagesScrollerRef}
          className="advantages__scroll"
          onWheel={handleWheel}
        >
          <motion.div
            className="advantages__track"
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.05,
            }}
          >
            {advantages.map(
              (advantage, index) => {
                const title =
                  language === "fr"
                    ? advantage.title_fr
                    : advantage.title_en;

                const description =
                  language === "fr"
                    ? advantage.description_fr
                    : advantage.description_en;

                return (
                  <motion.div
                    key={advantage.id}
                    className="advantage-item"
                    variants={itemVariants}
                  >
                    {/* Advantage icon */}
                    <div className="advantage-item__icon">
                      {advantage.icon && (
                        <i
                          className={`bi ${advantage.icon}`}
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    {/* Advantage text */}
                    <div className="advantage-item__content">
                      {title && (
                        <h3>{title}</h3>
                      )}

                      {description && (
                        <p>{description}</p>
                      )}
                    </div>

                    {/* Separator */}
                    {index <
                      advantages.length -
                        1 && (
                      <span
                        className="advantage-item__separator"
                        aria-hidden="true"
                      />
                    )}
                  </motion.div>
                );
              }
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;