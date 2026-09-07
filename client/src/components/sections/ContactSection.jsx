
import React, { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import {
  getCompany,
  getSocialLinks,
  getSiteSettings,
} from "../../api/api";
import { getIconClass } from "../../utils/icons";
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

  return (
    <section id="contact" className="contact section">
      <div className="container">

        <SectionHeading
          title={contactTitle}
          subtitle={contactSubtitle}
        />

        <div className="contact__layout">

          {/* INTRO */}
          <div className="contact__intro">
            <span className="contact__label">
              {language === "fr"
                ? "Parlons de vos besoins"
                : "Let's discuss your needs"}
            </span>

            {introTitle && (
              <h3>{introTitle}</h3>
            )}

            {infoDescription && (
              <p>{infoDescription}</p>
            )}

            {company.phone_1 && (
              <a
                href={`tel:${company.phone_1}`}
                className="contact__call"
              >
                <i
                  className="bi bi-telephone"
                  aria-hidden="true"
                ></i>

                <span>{callButton}</span>

                <i
                  className="bi bi-arrow-right"
                  aria-hidden="true"
                ></i>
              </a>
            )}
          </div>

          {/* INFORMATION */}
          <div className="contact__info">

            {infoTitle && (
              <h3>{infoTitle}</h3>
            )}

            {/* PHONES */}
            {phones.length > 0 && (
              <div className="contact__item">
                <div className="contact__item-icon">
                  <i
                    className="bi bi-telephone"
                    aria-hidden="true"
                  ></i>
                </div>

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
              </div>
            )}

            {/* EMAIL */}
            {company.email && (
              <div className="contact__item">
                <div className="contact__item-icon">
                  <i
                    className="bi bi-envelope"
                    aria-hidden="true"
                  ></i>
                </div>

                <div className="contact__item-content">
                  <span>{emailLabel}</span>

                  <a
                    href={`mailto:${company.email}`}
                  >
                    {company.email}
                  </a>
                </div>
              </div>
            )}

            {/* ADDRESS */}
            {address && (
              <div className="contact__item">
                <div className="contact__item-icon">
                  <i
                    className="bi bi-geo-alt"
                    aria-hidden="true"
                  ></i>
                </div>

                <div className="contact__item-content">
                  <span>{addressLabel}</span>

                  <p>{address}</p>
                </div>
              </div>
            )}

            {/* DELIVERY */}
            {deliveryDescription && (
              <div className="contact__delivery">
                <div className="contact__delivery-icon">
                  <i
                    className="bi bi-truck"
                    aria-hidden="true"
                  ></i>
                </div>

                <div>
                  {deliveryTitle && (
                    <h4>{deliveryTitle}</h4>
                  )}

                  <p>{deliveryDescription}</p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* SOCIAL */}
        {activeSocialLinks.length > 0 && (
          <div className="contact__social">

            <span className="contact__social-label">
              {followTitle}
            </span>

            <div className="contact__social-links">
              {activeSocialLinks.map((social) => (
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={social.id}
                  aria-label={social.platform}
                >
                  <i
                    className={`bi ${getIconClass(
                      "social",
                      social.icon
                    )}`}
                    aria-hidden="true"
                  ></i>
                </a>
              ))}
            </div>

          </div>
        )}

      </div>
    </section>
  );
};

export default ContactSection;
