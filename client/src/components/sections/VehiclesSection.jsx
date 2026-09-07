
import React, { useEffect, useMemo, useState } from "react";
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

  return (
    <section id="vehicles" className="vehicles section">
      <div className="container">
        <SectionHeading
          title={sectionTitle}
          subtitle={sectionSubtitle}
        />

        <div className="vehicles__groups">
          {Object.entries(groupedVehicles).map(
            ([type, items]) => (
              <div
                className="vehicles__group"
                key={type}
              >
                <div className="vehicles__group-heading">
                  <div className="vehicles__group-icon">
                    <i
                      className="bi bi-truck"
                      aria-hidden="true"
                    ></i>
                  </div>

                  <h3>{type}</h3>
                </div>

                <div className="vehicles__grid">
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
                      <article
                        className="vehicle-card"
                        key={vehicle.id}
                      >
                        {vehicle.image && (
                          <div className="vehicle-card__image">
                            <img
                              src={getImageUrl(
                                vehicle.image
                              )}
                              alt={name}
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        )}

                        <div className="vehicle-card__content">
                          {name && <h4>{name}</h4>}

                          {description && (
                            <p>{description}</p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default VehiclesSection;
