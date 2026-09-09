import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import {
  getCompany,
  getSocialLinks,
  getSiteSettings,
} from "../../api/api";
import SectionHeading from "../common/SectionHeading";

const ContactSection = () => {
  const { language } = useLanguage();

  const [company, setCompany] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [siteSettings, setSiteSettings] = useState([]);

  useEffect(() => {
    const loadContactData = async () => {
      try {
        const [companyData, socialData, settingsData] =
          await Promise.all([
            getCompany(),
            getSocialLinks(),
            getSiteSettings(),
          ]);

        setCompany(companyData || null);
        setSocialLinks(socialData || []);
        setSiteSettings(settingsData || []);
      } catch (error) {
        console.error("Contact data loading error:", error);
      }
    };

    loadContactData();
  }, []);

  const getSetting = (key) => {
    const setting = siteSettings.find(
      (item) => item.setting_key === key
    );

    return setting?.setting_value || "";
  };

  if (!company) return null;

  const contactTitle =
    getSetting(`contact_title_${language}`) ||
    (language === "fr" ? "Contactez-nous" : "Contact Us");

  const contactSubtitle =
    getSetting(`contact_subtitle_${language}`);

  const introTitle =
    getSetting(`contact_intro_title_${language}`);

  const infoTitle =
    getSetting(`contact_info_title_${language}`);

  const infoDescription =
    getSetting(`contact_info_description_${language}`);

  const callButton =
    getSetting(`contact_call_button_${language}`) ||
    (language === "fr" ? "Nous appeler" : "Call us");

  const deliveryTitle =
    getSetting(`contact_delivery_title_${language}`);

  const deliveryDescription =
    getSetting(`contact_delivery_description_${language}`);

  const followTitle =
    getSetting(`contact_follow_title_${language}`) ||
    (language === "fr" ? "Suivez-nous" : "Follow Us");

  const phoneLabel =
    getSetting(`contact_phone_label_${language}`) ||
    (language === "fr" ? "Téléphone" : "Phone");

  const emailLabel =
    getSetting(`contact_email_label_${language}`) ||
    "Email";

  const addressLabel =
    getSetting(`contact_address_label_${language}`) ||
    (language === "fr" ? "Adresse" : "Address");

  const address =
    language === "fr"
      ? company.address_fr
      : company.address_en;

  const phones = [
    company.phone_1,
    company.phone_2,
    company.phone_3,
  ].filter(Boolean);

  const activeSocialLinks = socialLinks.filter(
    (social) => Number(social.is_active) === 1
  );

  const layoutVariants = {
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

  const introVariants = {
    hidden: {
      opacity: 0,
      x: -35,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  const infoVariants = {
    hidden: {
      opacity: 0,
      x: 35,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  const itemsContainerVariants = {
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
      y: 25,
      scale: 0.97,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.55,
        ease: "easeOut",
      },
    },
  };

  return (
    <section id="contact" className="contact section">
      <div className="container">

        <motion.div
          variants={layoutVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.2,
          }}
        >
          <SectionHeading
            title={contactTitle}
            subtitle={contactSubtitle}
          />
        </motion.div>

        <div className="contact__layout">

          {/* INTRO */}
          <motion.div
            className="contact__intro"
            variants={introVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
            }}
          >
            <span className="contact__label">
              {language === "fr"
                ? "Parlons de vos besoins"
                : "Let's discuss your needs"}
            </span>

            {introTitle && <h3>{introTitle}</h3>}

            {infoDescription && <p>{infoDescription}</p>}

            {company.phone_1 && (
              <motion.a
                href={`tel:${company.phone_1}`}
                className="contact__call"
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <motion.i
                  className="bi bi-telephone"
                  aria-hidden="true"
                  whileHover={{ scale: 1.1 }}
                ></motion.i>

                <span>{callButton}</span>

                <motion.i
                  className="bi bi-arrow-right"
                  aria-hidden="true"
                  whileHover={{ x: 5 }}
                ></motion.i>
              </motion.a>
            )}
          </motion.div>

          {/* INFORMATION */}
          <motion.div
            className="contact__info"
            variants={infoVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
            }}
          >
            {infoTitle && <h3>{infoTitle}</h3>}

            <motion.div
              variants={itemsContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.1,
              }}
            >

              {/* PHONES */}
              {phones.length > 0 && (
                <motion.div
                  className="contact__item"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="contact__item-icon"
                    whileHover={{
                      scale: 1.08,
                      rotate: -3,
                    }}
                  >
                    <i
                      className="bi bi-telephone"
                      aria-hidden="true"
                    ></i>
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

              {/* EMAIL */}
              {company.email && (
                <motion.div
                  className="contact__item"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="contact__item-icon"
                    whileHover={{
                      scale: 1.08,
                      rotate: -3,
                    }}
                  >
                    <i
                      className="bi bi-envelope"
                      aria-hidden="true"
                    ></i>
                  </motion.div>

                  <div className="contact__item-content">
                    <span>{emailLabel}</span>

                    <a href={`mailto:${company.email}`}>
                      {company.email}
                    </a>
                  </div>
                </motion.div>
              )}

              {/* ADDRESS */}
              {address && (
                <motion.div
                  className="contact__item"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="contact__item-icon"
                    whileHover={{
                      scale: 1.08,
                      rotate: -3,
                    }}
                  >
                    <i
                      className="bi bi-geo-alt"
                      aria-hidden="true"
                    ></i>
                  </motion.div>

                  <div className="contact__item-content">
                    <span>{addressLabel}</span>

                    <p>{address}</p>
                  </div>
                </motion.div>
              )}

              {/* DELIVERY */}
              {deliveryDescription && (
                <motion.div
                  className="contact__delivery"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="contact__delivery-icon"
                    whileHover={{
                      scale: 1.1,
                      rotate: -4,
                    }}
                  >
                    <i
                      className="bi bi-truck"
                      aria-hidden="true"
                    ></i>
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

        {/* SOCIAL */}
        {activeSocialLinks.length > 0 && (
          <motion.div
            className="contact__social"
            variants={layoutVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
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
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {social.icon && (
                    <motion.i
                      className={`bi ${social.icon}`}
                      aria-hidden="true"
                      whileHover={{ scale: 1.08 }}
                    ></motion.i>
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