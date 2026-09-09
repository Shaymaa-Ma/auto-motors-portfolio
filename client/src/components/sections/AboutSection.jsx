
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

    // --------------------------------------------------
    // Animation variants
    // --------------------------------------------------

    const contentVariants = {
        hidden: {
            opacity: 0,
            x: -50,
        },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
                staggerChildren: 0.12,
            },
        },
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 25,
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

    const imageVariants = {
        hidden: {
            opacity: 0,
            x: 60,
        },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 1,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    return (
        <section id="about" className="about section">
            <div className="container">
                <div className="about__grid">

                    {/* =========================
                        LEFT CONTENT
                    ========================= */}
                    <motion.div
                        className="about__content"
                        variants={contentVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{
                            once: true,
                            amount: 0.2,
                        }}
                    >
                        {title && (
                            <motion.h2
                                className="about__title"
                                variants={itemVariants}
                            >
                                {title}
                            </motion.h2>
                        )}

                        {subtitle && (
                            <motion.p
                                className="about__subtitle"
                                variants={itemVariants}
                            >
                                {subtitle}
                            </motion.p>
                        )}

                        {description && (
                            <motion.p
                                className="about__description"
                                variants={itemVariants}
                            >
                                {description}
                            </motion.p>
                        )}

                        {/* Mission */}
                        {mission && (
                            <motion.div
                                className="about__mission"
                                variants={itemVariants}
                                whileHover={{
                                    y: -4,
                                    transition: {
                                        duration: 0.25,
                                    },
                                }}
                            >
                                <motion.div
                                    className="about__mission-icon"
                                    whileHover={{
                                        rotate: 8,
                                        scale: 1.08,
                                    }}
                                    transition={{
                                        duration: 0.25,
                                    }}
                                >
                                    <i
                                        className="bi bi-bullseye"
                                        aria-hidden="true"
                                    ></i>
                                </motion.div>

                                <div>
                                    {missionTitle && (
                                        <h3>{missionTitle}</h3>
                                    )}

                                    <p>{mission}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Buttons */}
                        {(primaryButton || secondaryButton) && (
                            <motion.div
                                className="about__actions"
                                variants={itemVariants}
                            >
                                {primaryButton && (
                                    <motion.a
                                        href={
                                            about.primary_button_link ||
                                            "#products"
                                        }
                                        className="button button--primary"
                                        whileHover={{
                                            y: -3,
                                            scale: 1.02,
                                        }}
                                        whileTap={{
                                            scale: 0.97,
                                        }}
                                        transition={{
                                            duration: 0.2,
                                        }}
                                    >
                                        <span>{primaryButton}</span>

                                        <motion.i
                                            className="bi bi-arrow-right"
                                            aria-hidden="true"
                                            whileHover={{
                                                x: 5,
                                            }}
                                        ></motion.i>
                                    </motion.a>
                                )}

                                {secondaryButton && (
                                    <motion.a
                                        href={
                                            about.secondary_button_link ||
                                            "#contact"
                                        }
                                        className="button button--secondary"
                                        whileHover={{
                                            y: -3,
                                            scale: 1.02,
                                        }}
                                        whileTap={{
                                            scale: 0.97,
                                        }}
                                        transition={{
                                            duration: 0.2,
                                        }}
                                    >
                                        {secondaryButton}
                                    </motion.a>
                                )}
                            </motion.div>
                        )}
                    </motion.div>

                    {/* =========================
                        RIGHT IMAGE
                    ========================= */}
                    {about.image && (
                        <motion.div
                            className="about__image"
                            variants={imageVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{
                                once: true,
                                amount: 0.2,
                            }}
                        >
                            <motion.img
                                src={getImageUrl(about.image)}
                                alt="AUTO MOTORS SARL automotive products and facilities"
                                loading="lazy"
                                decoding="async"
                                whileHover={{
                                    scale: 1.03,
                                }}
                                transition={{
                                    duration: 0.5,
                                    ease: "easeOut",
                                }}
                            />
                        </motion.div>
                    )}

                </div>
            </div>
        </section>
    );
};

export default AboutSection;
