
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


  /* ==========================================================================
     LOAD SERVICES
     ========================================================================== */

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


  /* ==========================================================================
     PAGINATION
     ========================================================================== */

  const totalPages =
    Math.ceil(
      services.length /
        SERVICES_PER_PAGE
    );


  /*
   * Keep the current page valid
   * if the number of services changes.
   */

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


  /*
   * Get exactly three services
   * for the current page.
   */

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


  /* ==========================================================================
     SAFETY
     ========================================================================== */

  if (!services.length) {
    return null;
  }


  /* ==========================================================================
     SECTION HEADING CONTENT
     ========================================================================== */

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


  /* ==========================================================================
     SCROLL REVEAL — SECTION HEADING
     ========================================================================== */

  /*
   * The heading rises gently into view.
   *
   * Blur is intentionally subtle so the animation
   * stays professional and does not feel excessive.
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

        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      },
    },
  };


  /* ==========================================================================
     SERVICES GRID REVEAL
     ========================================================================== */

  /*
   * The grid controls the stagger.
   *
   * Card 1 → Card 2 → Card 3
   */

  const gridVariants = {
    hidden: {
      opacity: 1,
    },

    visible: {
      opacity: 1,

      transition: {
        delayChildren: 0.08,
        staggerChildren: 0.14,
      },
    },
  };


  /* ==========================================================================
     SERVICE CARD REVEAL
     ========================================================================== */

  /*
   * Cards rise from below with a very small scale effect.
   *
   * This gives the Services section a different feeling
   * from the About section.
   */

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 55,
      scale: 0.96,
      filter: "blur(6px)",
    },

    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",

      transition: {
        duration: 0.75,

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
      y: -25,
      scale: 0.98,

      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };


  /* ==========================================================================
     SERVICE ICON REVEAL
     ========================================================================== */

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
        delay: 0.15,
        duration: 0.5,

        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      },
    },
  };


  /* ==========================================================================
     PAGE CHANGE
     ========================================================================== */

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


  /* ==========================================================================
     RENDER
     ========================================================================== */

  return (
    <section
      id="services"
      className="services section"
    >

      <div className="container">


        {/* ================================================================
            SECTION HEADING
            ================================================================ */}

        <motion.div

          variants={
            headingVariants
          }

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
            title={
              sectionTitle
            }

            subtitle={
              sectionSubtitle
            }
          />

        </motion.div>


        {/* ================================================================
            SERVICES
            ================================================================ */}

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

            whileInView="visible"

            viewport={{
              once: true,
              amount: 0.2,
              margin:
                "0px 0px -60px 0px",
            }}
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


                    /* ==================================================
                       CARD HOVER
                       ================================================== */

                    whileHover={{
                      y: -7,

                      transition: {
                        duration: 0.25,
                        ease: "easeOut",
                      },
                    }}


                    whileTap={{
                      scale: 0.98,
                    }}
                  >


                    {/* ==================================================
                        SERVICE ICON
                        ================================================== */}

                    <motion.div

                      className="service-card__icon"

                      variants={
                        iconVariants
                      }


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


                    {/* ==================================================
                        SERVICE CONTENT
                        ================================================== */}

                    <motion.div
                      className="service-card__content"
                    >

                      {name && (
                        <h3>
                          {name}
                        </h3>
                      )}


                      {description && (
                        <p>
                          {description}
                        </p>
                      )}

                    </motion.div>


                  </motion.article>

                );
              }
            )}

          </motion.div>

        </AnimatePresence>


        {/* ================================================================
            SERVICE PAGINATION
            ================================================================ */}

        {totalPages > 1 && (

          <motion.div

            className="services__pagination"

            initial={{
              opacity: 0,
              y: 15,
            }}

            whileInView={{
              opacity: 1,
              y: 0,
            }}

            viewport={{
              once: true,
              amount: 0.2,
            }}

            transition={{
              duration: 0.6,
              delay: 0.35,
              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}

            aria-label="Services pages"
          >

            {Array.from(
              {
                length:
                  totalPages,
              },

              (_, index) => (

                <motion.button

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


                  whileHover={{
                    y: -2,
                  }}

                  whileTap={{
                    scale: 0.92,
                  }}

                  transition={{
                    duration: 0.2,
                  }}
                >

                  {index + 1}

                </motion.button>

              )
            )}

          </motion.div>

        )}

      </div>

    </section>
  );
};


export default ServicesSection;
