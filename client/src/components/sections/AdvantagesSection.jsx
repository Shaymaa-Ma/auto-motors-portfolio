
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

  const advantagesScrollerRef = useRef(null);

  useEffect(() => {
    const loadAdvantages = async () => {
      try {
        const data = await getAdvantages();

        const sortedAdvantages = [...(data || [])].sort(
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

  const firstAdvantage = advantages[0];

  const sectionTitle =
    language === "fr"
      ? firstAdvantage.section_title_fr
      : firstAdvantage.section_title_en;

  const sectionSubtitle =
    language === "fr"
      ? firstAdvantage.section_subtitle_fr
      : firstAdvantage.section_subtitle_en;

  /* ============================================================
     HORIZONTAL WHEEL SCROLL
     ============================================================ */

  const handleWheel = (event) => {
    const element = advantagesScrollerRef.current;

    if (!element) {
      return;
    }

    if (element.scrollWidth <= element.clientWidth) {
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

  /* ============================================================
     ANIMATION VARIANTS
     ============================================================ */

  // Heading enters from below with a subtle blur.
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
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Advantages enter from the right one after another.
  const trackVariants = {
    hidden: {
      opacity: 1,
    },

    visible: {
      opacity: 1,

      transition: {
        delayChildren: 0.12,
        staggerChildren: 0.16,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: 55,
      filter: "blur(6px)",
    },

    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",

      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Icon has its own small entrance for a more polished effect.
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
        ease: [0.22, 1, 0.36, 1],
        delay: 0.15,
      },
    },
  };

  return (
    <section
      id="advantages"
      className="advantages section"
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
            margin: "0px 0px -80px 0px",
          }}
        >
          <SectionHeading
            title={sectionTitle}
            subtitle={sectionSubtitle}
          />
        </motion.div>

        {/* ======================================================
            HORIZONTAL ADVANTAGES
            ====================================================== */}

        <div
          ref={advantagesScrollerRef}
          className="advantages__scroll"
          onWheel={handleWheel}
        >
          <motion.div
            className="advantages__track"
            variants={trackVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
              margin: "0px 0px -60px 0px",
            }}
          >
            {advantages.map((advantage, index) => {
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
                  {/* ==================================================
                      ADVANTAGE ICON
                      ================================================== */}

                  <motion.div
                    className="advantage-item__icon"
                    variants={iconVariants}
                    whileHover={{
                      scale: 1.08,
                      rotate: 4,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                  >
                    {advantage.icon && (
                      <i
                        className={`bi ${advantage.icon}`}
                        aria-hidden="true"
                      />
                    )}
                  </motion.div>

                  {/* ==================================================
                      ADVANTAGE TEXT
                      ================================================== */}

                  <div className="advantage-item__content">
                    {title && <h3>{title}</h3>}

                    {description && (
                      <p>{description}</p>
                    )}
                  </div>

                  {/* ==================================================
                      SEPARATOR
                      ================================================== */}

                  {index <
                    advantages.length - 1 && (
                    <motion.span
                      className="advantage-item__separator"
                      aria-hidden="true"
                      initial={{
                        opacity: 0,
                        scaleY: 0,
                      }}
                      whileInView={{
                        opacity: 1,
                        scaleY: 1,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        duration: 0.5,
                        delay:
                          0.35 + index * 0.16,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
