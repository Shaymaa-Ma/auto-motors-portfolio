
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { getFaqs } from "../../api/api";
import SectionHeading from "../common/SectionHeading";

const FAQSection = () => {
  const { language } = useLanguage();

  const [faqs, setFaqs] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const data = await getFaqs();
        setFaqs(data || []);
      } catch (error) {
        console.error("FAQ data loading error:", error);
      }
    };

    loadFaqs();
  }, []);

  if (!faqs.length) return null;

  const firstFaq = faqs[0];

  const sectionTitle =
    language === "fr"
      ? firstFaq.section_title_fr
      : firstFaq.section_title_en;

  const sectionSubtitle =
    language === "fr"
      ? firstFaq.section_subtitle_fr
      : firstFaq.section_subtitle_en;

  const toggleFaq = (id) => {
    setOpenFaq((current) => (current === id ? null : id));
  };

  /* ==========================================================================
     ANIMATION VARIANTS
     ========================================================================== */

  // Section heading reveal
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

  // FAQ list controls the stagger sequence
  const listVariants = {
    hidden: {
      opacity: 1,
    },

    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.08,
        staggerChildren: 0.12,
      },
    },
  };

  // Individual FAQ row entrance
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 35,
      scale: 0.98,
      filter: "blur(5px)",
    },

    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section id="faq" className="faq section">
      <div className="container">

        {/* ==================================================================
            SECTION HEADING
            ================================================================== */}

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

        {/* ==================================================================
            FAQ LIST
            ================================================================== */}

        <motion.div
          className="faq__list"
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.15,
            margin: "0px 0px -70px 0px",
          }}
        >
          {faqs.map((faq) => {
            const question =
              language === "fr"
                ? faq.question_fr
                : faq.question_en;

            const answer =
              language === "fr"
                ? faq.answer_fr
                : faq.answer_en;

            const isOpen = openFaq === faq.id;

            return (
              <motion.article
                key={faq.id}
                className={`faq-item ${
                  isOpen ? "is-open" : ""
                }`}
                variants={itemVariants}
              >
                {/* ==========================================================
                    QUESTION
                    ========================================================== */}

                <motion.button
                  type="button"
                  className="faq-item__question"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  whileHover={{
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.99,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeOut",
                  }}
                >
                  <span>{question}</span>

                  {/* Plus / Minus Icon */}
                  <motion.i
                    className="bi"
                    animate={{
                      rotate: isOpen ? 180 : 0,
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    aria-hidden="true"
                  >
                    <i
                      className={
                        isOpen
                          ? "bi-dash"
                          : "bi-plus"
                      }
                    ></i>
                  </motion.i>
                </motion.button>

                {/* ==========================================================
                    ANSWER
                    ========================================================== */}

                <AnimatePresence initial={false}>
                  {isOpen && answer && (
                    <motion.div
                      className="faq-item__answer"
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        height: {
                          duration: 0.35,
                          ease: [0.22, 1, 0.36, 1],
                        },
                        opacity: {
                          duration: 0.22,
                          ease: "easeOut",
                        },
                      }}
                      style={{
                        overflow: "hidden",
                      }}
                    >
                      <motion.p
                        initial={{
                          opacity: 0,
                          y: -8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -8,
                        }}
                        transition={{
                          duration: 0.3,
                          delay: 0.04,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        {answer}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;