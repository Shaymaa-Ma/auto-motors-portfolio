
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import {
  getCompany,
  getSocialLinks,
  getContact,
} from "../../api/api";
import SectionHeading from "../common/SectionHeading";

const ContactSection = () => {
  const { language } = useLanguage();

  const [company, setCompany] = useState(null);
  const [contact, setContact] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);

  /*
  |--------------------------------------------------------------------------
  | LOAD CONTACT DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadContactData = async () => {
      try {
        const [companyData, contactData, socialData] =
          await Promise.all([
            getCompany(),
            getContact(),
            getSocialLinks(),
          ]);

        setCompany(companyData || null);
        setContact(contactData || null);
        setSocialLinks(socialData || []);
      } catch (error) {
        console.error("Contact data loading error:", error);
      }
    };

    loadContactData();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOCALIZED CONTACT CONTENT
  |--------------------------------------------------------------------------
  */

  const getLocalizedValue = (field) => {
    if (!contact) return "";

    return contact[`${field}_${language}`] || "";
  };

  /*
  |--------------------------------------------------------------------------
  | FALLBACK CONTENT
  |--------------------------------------------------------------------------
  */

  const contactTitle =
    getLocalizedValue("title") ||
    (language === "fr" ? "Contactez-nous" : "Contact Us");

  const callButton =
    getLocalizedValue("call_button") ||
    (language === "fr" ? "Nous appeler" : "Call us");

  const followTitle =
    getLocalizedValue("follow_title") ||
    (language === "fr" ? "Suivez-nous" : "Follow Us");

  const phoneLabel =
    getLocalizedValue("phone_label") ||
    (language === "fr" ? "Téléphone" : "Phone");

  const emailLabel =
    getLocalizedValue("email_label") || "Email";

  const addressLabel =
    getLocalizedValue("address_label") ||
    (language === "fr" ? "Adresse" : "Address");

  /*
  |--------------------------------------------------------------------------
  | CONTACT CONTENT
  |--------------------------------------------------------------------------
  */

  const contactSubtitle = getLocalizedValue("subtitle");

  const introTitle = getLocalizedValue("intro_title");

  const introDescription =
    getLocalizedValue("intro_description");

  const infoTitle = getLocalizedValue("info_title");

  const infoDescription =
    getLocalizedValue("info_description");

  const deliveryTitle =
    getLocalizedValue("delivery_title");

  const deliveryDescription =
    getLocalizedValue("delivery_description");

  /*
  |--------------------------------------------------------------------------
  | COMPANY CONTACT INFORMATION
  |--------------------------------------------------------------------------
  */

  if (!company || !contact) {
    return null;
  }

  const address =
    language === "fr"
      ? company.address_fr
      : company.address_en;

  const phones = [
    company.phone_1,
    company.phone_2,
    company.phone_3,
  ].filter(Boolean);

  const deliveryAvailable =
    Number(contact.delivery_available) === 1;

  /*
  |--------------------------------------------------------------------------
  | ACTIVE SOCIAL LINKS
  |--------------------------------------------------------------------------
  */

  const activeSocialLinks = socialLinks.filter(
    (social) => Number(social.is_active) === 1
  );

  /*
  |--------------------------------------------------------------------------
  | ANIMATION VARIANTS
  |--------------------------------------------------------------------------
  */

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

  const introVariants = {
    hidden: {
      opacity: 0,
      x: -45,
      filter: "blur(7px)",
    },

    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const infoVariants = {
    hidden: {
      opacity: 0,
      x: 45,
      filter: "blur(7px)",
    },

    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const itemsContainerVariants = {
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

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.97,
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
        duration: 0.5,
        delay: 0.12,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const socialVariants = {
    hidden: {
      opacity: 0,
      y: 25,
      filter: "blur(5px)",
    },

    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <section id="contact" className="contact section">
      <div className="container">

        {/* ================================================================
            SECTION HEADING
            ================================================================ */}

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
            title={contactTitle}
            subtitle={contactSubtitle}
          />
        </motion.div>

        {/* ================================================================
            CONTACT LAYOUT
            ================================================================ */}

        <div className="contact__layout">

          {/* ==============================================================
              INTRODUCTION
              ============================================================== */}

          <motion.div
            className="contact__intro"
            variants={introVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
              margin: "0px 0px -70px 0px",
            }}
          >
            {introTitle && <h3>{introTitle}</h3>}

            {introDescription && (
              <p>{introDescription}</p>
            )}

            {/* Call button */}

            {company.phone_1 && (
              <motion.a
                href={`tel:${company.phone_1}`}
                className="contact__call"
                whileHover={{
                  x: 5,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                }}
              >
                <motion.i
                  className="bi bi-telephone"
                  aria-hidden="true"
                  whileHover={{
                    scale: 1.1,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                />

                <span>{callButton}</span>

                <motion.i
                  className="bi bi-arrow-right"
                  aria-hidden="true"
                  whileHover={{
                    x: 5,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                />
              </motion.a>
            )}
          </motion.div>

          {/* ==============================================================
              CONTACT INFORMATION
              ============================================================== */}

          <motion.div
            className="contact__info"
            variants={infoVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
              margin: "0px 0px -70px 0px",
            }}
          >
            {infoTitle && <h3>{infoTitle}</h3>}

            {infoDescription && (
              <p className="contact__info-description">
                {infoDescription}
              </p>
            )}

            <motion.div
              variants={itemsContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.15,
                margin: "0px 0px -60px 0px",
              }}
            >

              {/* ========================================================
                  PHONES
                  ======================================================== */}

              {phones.length > 0 && (
                <motion.div
                  className="contact__item"
                  variants={itemVariants}
                  whileHover={{
                    y: -5,
                  }}
                  transition={{
                    duration: 0.25,
                    ease: "easeOut",
                  }}
                >
                  <motion.div
                    className="contact__item-icon"
                    variants={iconVariants}
                  >
                    <motion.i
                      className="bi bi-telephone"
                      aria-hidden="true"
                      whileHover={{
                        scale: 1.08,
                        rotate: -3,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    />
                  </motion.div>

                  <div className="contact__item-content">
                    <span>{phoneLabel}</span>

                    <div className="contact__values">
                      {phones.map((phone) => (
                        <a
                          href={`tel:${phone}`}
                          key={phone}
                        >
                          {phone}
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ========================================================
                  EMAIL
                  ======================================================== */}

              {company.email && (
                <motion.div
                  className="contact__item"
                  variants={itemVariants}
                  whileHover={{
                    y: -5,
                  }}
                  transition={{
                    duration: 0.25,
                    ease: "easeOut",
                  }}
                >
                  <motion.div
                    className="contact__item-icon"
                    variants={iconVariants}
                  >
                    <motion.i
                      className="bi bi-envelope"
                      aria-hidden="true"
                      whileHover={{
                        scale: 1.08,
                        rotate: -3,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    />
                  </motion.div>

                  <div className="contact__item-content">
                    <span>{emailLabel}</span>

                    <a
                      href={`mailto:${company.email}`}
                    >
                      {company.email}
                    </a>
                  </div>
                </motion.div>
              )}

              {/* ========================================================
                  ADDRESS
                  ======================================================== */}

              {address && (
                <motion.div
                  className="contact__item"
                  variants={itemVariants}
                  whileHover={{
                    y: -5,
                  }}
                  transition={{
                    duration: 0.25,
                    ease: "easeOut",
                  }}
                >
                  <motion.div
                    className="contact__item-icon"
                    variants={iconVariants}
                  >
                    <motion.i
                      className="bi bi-geo-alt"
                      aria-hidden="true"
                      whileHover={{
                        scale: 1.08,
                        rotate: -3,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    />
                  </motion.div>

                  <div className="contact__item-content">
                    <span>{addressLabel}</span>

                    <p>{address}</p>
                  </div>
                </motion.div>
              )}

              {/* ========================================================
                  DELIVERY
                  ======================================================== */}

              {deliveryAvailable &&
                deliveryDescription && (
                  <motion.div
                    className="contact__delivery"
                    variants={itemVariants}
                    whileHover={{
                      y: -5,
                    }}
                    transition={{
                      duration: 0.25,
                      ease: "easeOut",
                    }}
                  >
                    <motion.div
                      className="contact__delivery-icon"
                      variants={iconVariants}
                    >
                      <motion.i
                        className="bi bi-truck"
                        aria-hidden="true"
                        whileHover={{
                          scale: 1.1,
                          rotate: -4,
                        }}
                        transition={{
                          duration: 0.2,
                        }}
                      />
                    </motion.div>

                    <div>
                      {deliveryTitle && (
                        <h4>{deliveryTitle}</h4>
                      )}

                      <p>{deliveryDescription}</p>
                    </div>
                  </motion.div>
                )}
            </motion.div>
          </motion.div>
        </div>

        {/* ================================================================
            SOCIAL LINKS
            ================================================================ */}

        {activeSocialLinks.length > 0 && (
          <motion.div
            className="contact__social"
            variants={socialVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
              margin: "0px 0px -70px 0px",
            }}
          >
            <span className="contact__social-label">
              {followTitle}
            </span>

            <motion.div
              className="contact__social-links"
              variants={itemsContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.2,
                margin: "0px 0px -60px 0px",
              }}
            >
              {activeSocialLinks.map((social) => (
                <motion.a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={social.id}
                  aria-label={social.platform}
                  variants={itemVariants}
                  whileHover={{
                    y: -5,
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeOut",
                  }}
                >
                  {social.icon && (
                    <motion.i
                      className={`bi ${social.icon}`}
                      aria-hidden="true"
                      whileHover={{
                        scale: 1.08,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    />
                  )}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        )}

      </div>
    </section>
  );
};

export default ContactSection;
