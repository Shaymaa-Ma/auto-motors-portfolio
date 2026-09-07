
import React, { useEffect, useState } from "react";
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

  return (
    <section id="faq" className="faq section">
      <div className="container">
        <SectionHeading
          title={sectionTitle}
          subtitle={sectionSubtitle}
        />

        <div className="faq__list">
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
              <article
                key={faq.id}
                className={`faq-item ${
                  isOpen ? "is-open" : ""
                }`}
              >
                <button
                  type="button"
                  className="faq-item__question"
                  onClick={() =>
                    toggleFaq(faq.id)
                  }
                  aria-expanded={isOpen}
                >
                  <span>{question}</span>

                  <i
                    className={`bi ${
                      isOpen
                        ? "bi-dash"
                        : "bi-plus"
                    }`}
                    aria-hidden="true"
                  ></i>
                </button>

                {isOpen && answer && (
                  <div className="faq-item__answer">
                    <p>{answer}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
