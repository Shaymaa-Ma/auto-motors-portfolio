
import React, {
  useEffect,
  useState,
} from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  useLanguage,
} from "../../context/LanguageContext";
import {
  getGallery,
  getImageUrl,
} from "../../api/api";
import SectionHeading from "../common/SectionHeading";

const GallerySection = () => {
  const { language } = useLanguage();

  const [
    gallery,
    setGallery,
  ] = useState([]);

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(null);

  /* ============================================================
     LOAD GALLERY
     ============================================================ */

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const data = await getGallery();

        const sortedGallery =
          [...(data || [])].sort(
            (a, b) =>
              Number(a.display_order || 0) -
              Number(b.display_order || 0)
          );

        setGallery(sortedGallery);
      } catch (error) {
        console.error(
          "Gallery data loading error:",
          error
        );
      }
    };

    loadGallery();
  }, []);

  /* ============================================================
     LIGHTBOX KEYBOARD / BODY SCROLL
     ============================================================ */

  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        "";
    };
  }, [selectedImage]);

  if (!gallery.length) {
    return null;
  }

  const firstGallery = gallery[0];

  const sectionTitle =
    language === "fr"
      ? firstGallery.section_title_fr
      : firstGallery.section_title_en;

  const sectionSubtitle =
    language === "fr"
      ? firstGallery.section_subtitle_fr
      : firstGallery.section_subtitle_en;

  /* ============================================================
     GALLERY SLIDER SPEED
     ============================================================ */

  const galleryDuration = Math.max(
    gallery.length * 7,
    35
  );

  /* ============================================================
     ANIMATION VARIANTS
     ============================================================ */

  // Section heading enters from below with a subtle blur.
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
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      },
    },
  };

  // Gallery viewport enters after the heading.
  const galleryVariants = {
    hidden: {
      opacity: 0,
      y: 45,
      scale: 0.98,
      filter: "blur(6px)",
    },

    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",

      transition: {
        duration: 0.9,
        delay: 0.12,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      },
    },
  };

  // Gallery cards appear one after another.
  const galleryGroupVariants = {
    hidden: {
      opacity: 1,
    },

    visible: {
      opacity: 1,

      transition: {
        delayChildren: 0.15,
        staggerChildren: 0.1,
      },
    },
  };

  const galleryCardVariants = {
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
        duration: 0.65,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      },
    },
  };

  /* ============================================================
     LIGHTBOX ANIMATIONS
     ============================================================ */

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

  /* ============================================================
     GALLERY ITEM
     ============================================================ */

  const renderGalleryItem = (
    item,
    copyIndex
  ) => {
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
        key={`${item.id}-${copyIndex}`}
        className="gallery-card"
        variants={
          galleryCardVariants
        }
        onClick={() =>
          setSelectedImage(item)
        }
        whileHover={{
          y: -5,

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
        {/* ======================================================
            GALLERY IMAGE
            ====================================================== */}

        <motion.img
          src={getImageUrl(item.image)}
          alt={
            title ||
            "AUTO MOTORS SARL"
          }
          loading="lazy"
          decoding="async"
          whileHover={{
            scale: 1.05,
          }}
          transition={{
            duration: 0.45,
            ease: "easeOut",
          }}
        />

        {/* ======================================================
            GALLERY INFORMATION
            ====================================================== */}

        {(title || description) && (
          <div className="gallery-card__content">
            {title && (
              <h3>{title}</h3>
            )}

            {description && (
              <p>{description}</p>
            )}
          </div>
        )}
      </motion.button>
    );
  };

  return (
    <>
      <section
        id="gallery"
        className="gallery section"
      >
        <div className="container">

          {/* ====================================================
              SECTION HEADING
              ==================================================== */}

          <motion.div
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.3,
              margin:
                "0px 0px -80px 0px",
            }}
          >
            <SectionHeading
              title={sectionTitle}
              subtitle={sectionSubtitle}
            />
          </motion.div>

          {/* ====================================================
              AUTOMATIC GALLERY SLIDER
              ==================================================== */}

          <motion.div
            className="gallery__viewport"
            variants={galleryVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
              margin:
                "0px 0px -60px 0px",
            }}
          >
            <motion.div
              className="gallery__track"
              style={{
                "--gallery-duration": `${galleryDuration}s`,
              }}
              variants={
                galleryGroupVariants
              }
            >
              {/* ==================================================
                  FIRST COPY
                  ================================================== */}

              <div className="gallery__group">
                {gallery.map((item) =>
                  renderGalleryItem(
                    item,
                    "first"
                  )
                )}
              </div>

              {/* ==================================================
                  SECOND COPY
                  Seamless infinite loop
                  ================================================== */}

              <div
                className="gallery__group"
                aria-hidden="true"
              >
                {gallery.map((item) =>
                  renderGalleryItem(
                    item,
                    "second"
                  )
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================
          LIGHTBOX
          ======================================================== */}

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
            onClick={() =>
              setSelectedImage(null)
            }
          >
            {/* ==================================================
                CLOSE BUTTON
                ================================================== */}

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
              />
            </motion.button>

            {/* ==================================================
                LIGHTBOX IMAGE
                ================================================== */}

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
              variants={
                lightboxImageVariants
              }
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
