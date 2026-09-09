
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
        console.error(
          "FAQ data loading error:",
          error
        );
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
    setOpenFaq((current) =>
      current === id ? null : id
    );
  };

  // Animation variants
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

  const listVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section id="faq" className="faq section">
      <div className="container">

        {/* Section Heading */}
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

        {/* FAQ List */}
        <motion.div
          className="faq__list"
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.1,
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
                <motion.button
                  type="button"
                  className="faq-item__question"
                  onClick={() =>
                    toggleFaq(faq.id)
                  }
                  aria-expanded={isOpen}
                  whileTap={{
                    scale: 0.99,
                  }}
                >
                  <span>{question}</span>

                  <motion.i
                    className="bi"
                    animate={{
                      rotate: isOpen ? 180 : 0,
                    }}
                    transition={{
                      duration: 0.25,
                      ease: "easeOut",
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

                {/* Animated Answer */}
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
                          duration: 0.3,
                          ease: "easeInOut",
                        },
                        opacity: {
                          duration: 0.2,
                          ease: "easeOut",
                        },
                      }}
                      style={{
                        overflow: "hidden",
                      }}
                    >
                      <motion.p
                        initial={{
                          y: -8,
                        }}
                        animate={{
                          y: 0,
                        }}
                        exit={{
                          y: -8,
                        }}
                        transition={{
                          duration: 0.25,
                          ease: "easeOut",
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
