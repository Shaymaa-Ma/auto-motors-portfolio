
import React, { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import {
  getGallery,
  getImageUrl,
} from "../../api/api";
import SectionHeading from "../common/SectionHeading";

const GallerySection = () => {
  const { language } = useLanguage();

  const [gallery, setGallery] = useState([]);
  const [selectedImage, setSelectedImage] =
    useState(null);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const data = await getGallery();
        setGallery(data || []);
      } catch (error) {
        console.error(
          "Gallery data loading error:",
          error
        );
      }
    };

    loadGallery();
  }, []);

  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [selectedImage]);

  if (!gallery.length) return null;

  const firstGallery = gallery[0];

  const sectionTitle =
    language === "fr"
      ? firstGallery.section_title_fr
      : firstGallery.section_title_en;

  const sectionSubtitle =
    language === "fr"
      ? firstGallery.section_subtitle_fr
      : firstGallery.section_subtitle_en;

  return (
    <>
      <section id="gallery" className="gallery section">
        <div className="container">
          <SectionHeading
            title={sectionTitle}
            subtitle={sectionSubtitle}
          />

          <div className="gallery__grid">
            {gallery.map((item) => {
              const title =
                language === "fr"
                  ? item.title_fr
                  : item.title_en;

              const description =
                language === "fr"
                  ? item.description_fr
                  : item.description_en;

              return (
                <button
                  type="button"
                  key={item.id}
                  className="gallery-card"
                  onClick={() =>
                    setSelectedImage(item)
                  }
                  aria-label={
                    language === "fr"
                      ? "Agrandir l'image"
                      : "Enlarge image"
                  }
                >
                  <img
                    src={getImageUrl(item.image)}
                    alt={
                      title ||
                      "AUTO MOTORS SARL"
                    }
                    loading="lazy"
                    decoding="async"
                  />

                  {(title || description) && (
                    <div className="gallery-card__content">
                      {title && <h3>{title}</h3>}

                      {description && (
                        <p>{description}</p>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {selectedImage && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={
            language === "fr"
              ? "Aperçu de l'image"
              : "Image preview"
          }
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            className="gallery-lightbox__close"
            onClick={() => setSelectedImage(null)}
            aria-label={
              language === "fr"
                ? "Fermer"
                : "Close"
            }
          >
            <i
              className="bi bi-x-lg"
              aria-hidden="true"
            ></i>
          </button>

          <img
            src={getImageUrl(selectedImage.image)}
            alt={
              language === "fr"
                ? selectedImage.title_fr ||
                  "AUTO MOTORS SARL"
                : selectedImage.title_en ||
                  "AUTO MOTORS SARL"
            }
            onClick={(event) =>
              event.stopPropagation()
            }
          />
        </div>
      )}
    </>
  );
};

export default GallerySection;
