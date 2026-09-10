import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  useLanguage,
} from "../../context/LanguageContext";
import {
  getServices,
} from "../../api/api";
import SectionHeading from "../common/SectionHeading";

const SERVICES_PER_PAGE = 3;

const ServicesSection = () => {
  const { language } =
    useLanguage();

  const [
    services,
    setServices,
  ] = useState([]);

  const [
    currentPage,
    setCurrentPage,
  ] = useState(0);

  useEffect(() => {
    const loadServices =
      async () => {
        try {
          const data =
            await getServices();

          const sortedServices =
            [...(data || [])].sort(
              (a, b) =>
                Number(
                  a.display_order || 0
                ) -
                Number(
                  b.display_order || 0
                )
            );

          setServices(
            sortedServices
          );
        } catch (error) {
          console.error(
            "Services data loading error:",
            error
          );
        }
      };

    loadServices();
  }, []);

  // Calculate the number of pages
  const totalPages =
    Math.ceil(
      services.length /
        SERVICES_PER_PAGE
    );

  // Keep the current page valid
  useEffect(() => {
    if (
      currentPage >=
      totalPages
    ) {
      setCurrentPage(
        Math.max(
          totalPages - 1,
          0
        )
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  // Get exactly three services for the current page
  const currentServices =
    useMemo(() => {
      const startIndex =
        currentPage *
        SERVICES_PER_PAGE;

      return services.slice(
        startIndex,
        startIndex +
          SERVICES_PER_PAGE
      );
    }, [
      services,
      currentPage,
    ]);

  if (!services.length) {
    return null;
  }

  const firstService =
    services[0];

  const sectionTitle =
    language === "fr"
      ? firstService.section_title_fr
      : firstService.section_title_en;

  const sectionSubtitle =
    language === "fr"
      ? firstService.section_subtitle_fr
      : firstService.section_subtitle_en;

  // Section heading animation
  const headingVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },

    visible: {
      opacity: 1,
      y: 0,

      transition: {
        duration: 0.7,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      },
    },
  };

  // Services container animation
  const gridVariants = {
    hidden: {},

    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Individual service animation
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.97,
    },

    visible: {
      opacity: 1,
      y: 0,
      scale: 1,

      transition: {
        duration: 0.55,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      },
    },

    exit: {
      opacity: 0,
      y: -20,
      scale: 0.98,

      transition: {
        duration: 0.25,
        ease: "easeIn",
      },
    },
  };

  // Change the visible service page
  const handlePageChange = (
    pageIndex
  ) => {
    if (
      pageIndex ===
      currentPage
    ) {
      return;
    }

    setCurrentPage(
      pageIndex
    );
  };

  return (
    <section
      id="services"
      className="services section"
    >
      <div className="container">

        {/* Section heading */}
        <motion.div
          variants={
            headingVariants
          }
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.3,
          }}
        >
          <SectionHeading
            title={
              sectionTitle
            }
            subtitle={
              sectionSubtitle
            }
          />
        </motion.div>

        {/* Services */}
        <AnimatePresence
          mode="wait"
        >
          <motion.div
            key={currentPage}
            className="services__grid"
            variants={
              gridVariants
            }
            initial="hidden"
            animate="visible"
          >
            {currentServices.map(
              (service) => {
                const name =
                  language === "fr"
                    ? service.name_fr
                    : service.name_en;

                const description =
                  language === "fr"
                    ? service.description_fr
                    : service.description_en;

                return (
                  <motion.article
                    key={
                      service.id
                    }
                    className="service-card"
                    variants={
                      cardVariants
                    }
                    whileHover={{
                      y: -6,

                      transition: {
                        duration: 0.25,
                        ease: "easeOut",
                      },
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                  >
                    {/* Service icon */}
                    <motion.div
                      className="service-card__icon"
                      whileHover={{
                        scale: 1.08,
                        rotate: 4,
                      }}
                      transition={{
                        duration: 0.25,
                        ease: "easeOut",
                      }}
                    >
                      {service.icon && (
                        <i
                          className={`bi ${service.icon}`}
                          aria-hidden="true"
                        />
                      )}
                    </motion.div>

                    {/* Service content */}
                    <div className="service-card__content">
                      {name && (
                        <h3>
                          {name}
                        </h3>
                      )}

                      {description && (
                        <p>
                          {
                            description
                          }
                        </p>
                      )}
                    </div>
                  </motion.article>
                );
              }
            )}
          </motion.div>
        </AnimatePresence>

        {/* Service page navigation */}
        {totalPages > 1 && (
          <div
            className="services__pagination"
            aria-label="Services pages"
          >
            {Array.from(
              {
                length:
                  totalPages,
              },
              (_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`services__page-button ${
                    currentPage ===
                    index
                      ? "is-active"
                      : ""
                  }`}
                  onClick={() =>
                    handlePageChange(
                      index
                    )
                  }
                  aria-label={`Show services page ${
                    index + 1
                  }`}
                  aria-current={
                    currentPage ===
                    index
                      ? "page"
                      : undefined
                  }
                >
                  {index + 1}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;