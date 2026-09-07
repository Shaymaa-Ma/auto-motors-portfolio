
import React, { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import {
    getAbout,
    getImageUrl,
} from "../../api/api";

const AboutSection = () => {
    const { language } = useLanguage();

    const [about, setAbout] = useState(null);

    useEffect(() => {
        const loadAbout = async () => {
            try {
                const data = await getAbout();
                setAbout(data || null);
            } catch (error) {
                console.error("About data loading error:", error);
            }
        };

        loadAbout();
    }, []);

    if (!about) return null;

    const title =
        language === "fr"
            ? about.title_fr
            : about.title_en;

    const subtitle =
        language === "fr"
            ? about.subtitle_fr
            : about.subtitle_en;

    const description =
        language === "fr"
            ? about.description_fr
            : about.description_en;

    const missionTitle =
        language === "fr"
            ? about.mission_title_fr
            : about.mission_title_en;

    const mission =
        language === "fr"
            ? about.mission_fr
            : about.mission_en;

    const primaryButton =
        language === "fr"
            ? about.primary_button_fr
            : about.primary_button_en;

    const secondaryButton =
        language === "fr"
            ? about.secondary_button_fr
            : about.secondary_button_en;

    return (
        <section id="about" className="about section">
            <div className="container">
                <div className="about__grid">
                    <div className="about__content">
                        {title && (
                            <h2 className="about__title">
                                {title}
                            </h2>
                        )}

                        {subtitle && (
                            <p className="about__subtitle">
                                {subtitle}
                            </p>
                        )}

                        {description && (
                            <p className="about__description">
                                {description}
                            </p>
                        )}

                        {mission && (
                            <div className="about__mission">
                                <div className="about__mission-icon">
                                    <i
                                        className="bi bi-bullseye"
                                        aria-hidden="true"
                                    ></i>
                                </div>

                                <div>
                                    {missionTitle && (
                                        <h3>{missionTitle}</h3>
                                    )}

                                    <p>{mission}</p>
                                </div>
                            </div>
                        )}

                        {(primaryButton || secondaryButton) && (
                            <div className="about__actions">
                                {primaryButton && (
                                    <a
                                        href={
                                            about.primary_button_link ||
                                            "#products"
                                        }
                                        className="button button--primary"
                                    >
                                        {primaryButton}
                                        <i
                                            className="bi bi-arrow-right"
                                            aria-hidden="true"
                                        ></i>
                                    </a>
                                )}

                                {secondaryButton && (
                                    <a
                                        href={
                                            about.secondary_button_link ||
                                            "#contact"
                                        }
                                        className="button button--secondary"
                                    >
                                        {secondaryButton}
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {about.image && (
                        <div className="about__image">
                            <img
                                src={getImageUrl(about.image)}
                                alt="AUTO MOTORS SARL automotive products and facilities"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
