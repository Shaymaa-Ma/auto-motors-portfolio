import React, { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { getServices } from "../../api/api";
import { getIconClass } from "../../utils/icons";
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

  return (
    <section id="services" className="services section">
      <div className="container">
        <SectionHeading
          title={sectionTitle}
          subtitle={sectionSubtitle}
        />

        <div className="services__grid">
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
              <article
                key={service.id}
                className="service-card"
              >
                <div className="service-card__icon">
                  <i
                    className={`bi ${getIconClass(
                      "services",
                      service.icon
                    )}`}
                    aria-hidden="true"
                  ></i>
                </div>

                <div className="service-card__content">
                  {name && <h3>{name}</h3>}

                  {description && (
                    <p>{description}</p>
                  )}
                </div>

                <div className="service-card__arrow">
                  <i className="bi bi-arrow-up-right"></i>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;