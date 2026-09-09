
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  // Animation variants
  const headingVariants = {
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

  const gridVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 35,
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

  const lightboxVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.25,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  const lightboxImageVariants = {
    hidden: {
      opacity: 0,
      scale: 0.88,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.92,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  return (
    <>
      <section
        id="gallery"
        className="gallery section"
      >
        <div className="container">

          {/* Section Heading */}
          <motion.div
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
          >
            <SectionHeading
              title={sectionTitle}
              subtitle={sectionSubtitle}
            />
          </motion.div>

          {/* Gallery Grid */}
          <motion.div
            className="gallery__grid"
            variants={gridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.1,
            }}
          >
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
                <motion.button
                  type="button"
                  key={item.id}
                  className="gallery-card"
                  variants={cardVariants}
                  onClick={() =>
                    setSelectedImage(item)
                  }
                  whileHover={{
                    y: -6,
                    transition: {
                      duration: 0.2,
                      ease: "easeOut",
                    },
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  aria-label={
                    language === "fr"
                      ? "Agrandir l'image"
                      : "Enlarge image"
                  }
                >
                  {/* Image */}
                  <motion.img
                    src={getImageUrl(item.image)}
                    alt={
                      title ||
                      "AUTO MOTORS SARL"
                    }
                    loading="lazy"
                    decoding="async"
                    whileHover={{
                      scale: 1.04,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: "easeOut",
                    }}
                  />

                  {(title || description) && (
                    <div className="gallery-card__content">
                      {title && <h3>{title}</h3>}

                      {description && (
                        <p>{description}</p>
                      )}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="gallery-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={
              language === "fr"
                ? "Aperçu de l'image"
                : "Image preview"
            }
            variants={lightboxVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close Button */}
            <motion.button
              type="button"
              className="gallery-lightbox__close"
              onClick={() =>
                setSelectedImage(null)
              }
              aria-label={
                language === "fr"
                  ? "Fermer"
                  : "Close"
              }
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.25,
                delay: 0.1,
              }}
              whileHover={{
                scale: 1.1,
                rotate: 90,
              }}
              whileTap={{
                scale: 0.9,
              }}
            >
              <i
                className="bi bi-x-lg"
                aria-hidden="true"
              ></i>
            </motion.button>

            {/* Lightbox Image */}
            <motion.img
              src={getImageUrl(
                selectedImage.image
              )}
              alt={
                language === "fr"
                  ? selectedImage.title_fr ||
                    "AUTO MOTORS SARL"
                  : selectedImage.title_en ||
                    "AUTO MOTORS SARL"
              }
              variants={lightboxImageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(event) =>
                event.stopPropagation()
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GallerySection;
