
import React, { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { getAdvantages } from "../../api/api";
import { getIconClass } from "../../utils/icons";
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
        console.error(
          "Advantages data loading error:",
          error
        );
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

  return (
    <section
      id="advantages"
      className="advantages section"
    >
      <div className="container">
        <SectionHeading
          title={sectionTitle}
          subtitle={sectionSubtitle}
        />

        <div className="advantages__grid">
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
              <article
                key={advantage.id}
                className="advantage-card"
              >
                <div className="advantage-card__icon">
                  <i
                    className={`bi ${getIconClass(
                      "advantages",
                      advantage.icon
                    )}`}
                    aria-hidden="true"
                  ></i>
                </div>

                <div className="advantage-card__content">
                  {title && <h3>{title}</h3>}

                  {description && (
                    <p>{description}</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
