import React, {
  useEffect,
  useMemo,
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
  getCategories,
  getProducts,
  getImageUrl,
} from "../../api/api";
import SectionHeading from "../common/SectionHeading";

const PRODUCTS_PER_PAGE_DESKTOP = 8;
const PRODUCTS_PER_PAGE_CATEGORY_DESKTOP = 4;

const ProductsSection = () => {
  const { language } =
    useLanguage();

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    activeCategory,
    setActiveCategory,
  ] = useState(null);

  const [
    currentPage,
    setCurrentPage,
  ] = useState(0);

  const [
    productsPerPage,
    setProductsPerPage,
  ] = useState(
    PRODUCTS_PER_PAGE_DESKTOP
  );

  // Load categories and products
  useEffect(() => {
    let isMounted = true;

    const loadProductsData =
      async () => {
        try {
          const [
            categoryData,
            productData,
          ] = await Promise.all([
            getCategories(),
            getProducts(),
          ]);

          if (!isMounted) {
            return;
          }

          const sortedCategories =
            [...(categoryData || [])].sort(
              (a, b) =>
                Number(
                  a.display_order || 0
                ) -
                Number(
                  b.display_order || 0
                )
            );

          const sortedProducts =
            [...(productData || [])].sort(
              (a, b) =>
                Number(
                  a.display_order || 0
                ) -
                Number(
                  b.display_order || 0
                )
            );

          setCategories(
            sortedCategories
          );

          setProducts(
            sortedProducts
          );
        } catch (error) {
          console.error(
            "Products data loading error:",
            error
          );
        }
      };

    loadProductsData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Adjust products per page based on screen size
  useEffect(() => {
    const updateProductsPerPage =
      () => {
        if (
          window.innerWidth <=
          575
        ) {
          /*
           * Keep mobile exactly as before.
           */
          setProductsPerPage(4);
          return;
        }

        if (
          window.innerWidth <=
          991
        ) {
          /*
           * Keep tablet behavior exactly as before.
           */
          setProductsPerPage(6);
          return;
        }

        /*
         * Desktop:
         *
         * All products = 8 per page.
         * Specific category = 4 per page.
         */
        setProductsPerPage(
          activeCategory === null
            ? PRODUCTS_PER_PAGE_DESKTOP
            : PRODUCTS_PER_PAGE_CATEGORY_DESKTOP
        );
      };

    updateProductsPerPage();

    window.addEventListener(
      "resize",
      updateProductsPerPage
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateProductsPerPage
      );
    };
  }, [
    activeCategory,
  ]);

  // Filter products by selected category
  const filteredProducts =
    useMemo(() => {
      if (
        activeCategory === null
      ) {
        return products;
      }

      return products.filter(
        (product) =>
          Number(
            product.category_id
          ) ===
          Number(activeCategory)
      );
    }, [
      products,
      activeCategory,
    ]);

  // Calculate the number of product pages
  const totalPages =
    Math.ceil(
      filteredProducts.length /
        productsPerPage
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

  // Get products for the current page
  const currentProducts =
    useMemo(() => {
      const startIndex =
        currentPage *
        productsPerPage;

      return filteredProducts.slice(
        startIndex,
        startIndex +
          productsPerPage
      );
    }, [
      filteredProducts,
      currentPage,
      productsPerPage,
    ]);

  // Get the appropriate language field
  const getLocalizedValue = (
    item,
    field
  ) => {
    if (!item) {
      return "";
    }

    return language === "fr"
      ? item[
          `${field}_fr`
        ] || ""
      : item[
          `${field}_en`
        ] || "";
  };

  // Display the price exactly as entered by the admin
  const displayPrice = (
    product
  ) => {
    const price =
      product?.price;

    if (
      price === null ||
      price === undefined ||
      String(price).trim() ===
        ""
    ) {
      return language === "fr"
        ? "Nous consulter"
        : "Contact us";
    }

    return String(price).trim();
  };

  // Change category and return to the first page
  const handleCategoryChange = (
    categoryId
  ) => {
    setActiveCategory(
      categoryId
    );

    setCurrentPage(0);
  };

  // Change product page
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

    // Bring the products section back into view
    const productsSection =
      document.getElementById(
        "products"
      );

    if (
      productsSection
    ) {
      productsSection.scrollIntoView(
        {
          behavior: "smooth",
          block: "start",
        }
      );
    }
  };

  // Do not render the section when there is no data
  if (
    !categories.length &&
    !products.length
  ) {
    return null;
  }

  const firstCategory =
    categories[0];

  const sectionTitle =
    getLocalizedValue(
      firstCategory,
      "section_title"
    );

  const sectionSubtitle =
    getLocalizedValue(
      firstCategory,
      "section_subtitle"
    );

  // Section heading animation
  const filtersVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },

    visible: {
      opacity: 1,
      y: 0,

      transition: {
        duration: 0.6,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      },
    },
  };

  // Product grid animation
  const gridVariants = {
    hidden: {},

    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  // Product card animation
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
      y: 20,
      scale: 0.97,

      transition: {
        duration: 0.25,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section
      id="products"
      className="products section"
      aria-labelledby="products-heading"
    >
      <div className="container">

        {/* Section heading */}
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.7,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
        >
          <SectionHeading
            title={
              sectionTitle
            }
            subtitle={
              sectionSubtitle
            }
            id="products-heading"
          />
        </motion.div>

        {/* Category filters */}
        {categories.length >
          0 && (
          <motion.div
            className="products__filters"
            role="group"
            aria-label={
              language === "fr"
                ? "Filtrer les produits"
                : "Filter products"
            }
            variants={
              filtersVariants
            }
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
          >
            <motion.button
              type="button"
              className={
                activeCategory ===
                null
                  ? "active"
                  : ""
              }
              aria-pressed={
                activeCategory ===
                null
              }
              onClick={() =>
                handleCategoryChange(
                  null
                )
              }
              whileHover={{
                y: -2,
              }}
              whileTap={{
                scale: 0.96,
              }}
            >
              {language === "fr"
                ? "Tous"
                : "All"}
            </motion.button>

            {categories.map(
              (category) => {
                const name =
                  getLocalizedValue(
                    category,
                    "name"
                  );

                const isActive =
                  Number(
                    activeCategory
                  ) ===
                  Number(
                    category.id
                  );

                return (
                  <motion.button
                    key={
                      category.id
                    }
                    type="button"
                    className={
                      isActive
                        ? "active"
                        : ""
                    }
                    aria-pressed={
                      isActive
                    }
                    onClick={() =>
                      handleCategoryChange(
                        category.id
                      )
                    }
                    whileHover={{
                      y: -2,
                    }}
                    whileTap={{
                      scale: 0.96,
                    }}
                  >
                    {name}
                  </motion.button>
                );
              }
            )}
          </motion.div>
        )}

        {/* Product results information */}
        {filteredProducts.length >
          0 && (
          <div className="products__results-info">
            <span>
              {language === "fr"
                ? `Affichage de ${
                    currentPage *
                      productsPerPage +
                    1
                  }–${Math.min(
                    (currentPage +
                      1) *
                      productsPerPage,
                    filteredProducts.length
                  )} sur ${
                    filteredProducts.length
                  } produits`
                : `Showing ${
                    currentPage *
                      productsPerPage +
                    1
                  }–${Math.min(
                    (currentPage +
                      1) *
                      productsPerPage,
                    filteredProducts.length
                  )} of ${
                    filteredProducts.length
                  } products`}
            </span>
          </div>
        )}

        {/* Product grid */}
        {filteredProducts.length >
        0 ? (
          <AnimatePresence
            mode="wait"
          >
            <motion.div
              key={`${activeCategory ?? "all"}-${currentPage}-${productsPerPage}`}
              className="products__grid"
              variants={
                gridVariants
              }
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {currentProducts.map(
                (product) => {
                  const name =
                    getLocalizedValue(
                      product,
                      "name"
                    );

                  const description =
                    getLocalizedValue(
                      product,
                      "description"
                    );

                  const price =
                    displayPrice(
                      product
                    );

                  return (
                    <motion.article
                      key={
                        product.id
                      }
                      className="product-card"
                      variants={
                        cardVariants
                      }
                      whileHover={{
                        y: -7,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                    >
                      {/* Product image */}
                      {product.image && (
                        <motion.div
                          className="product-card__image"
                          whileHover={{
                            scale: 1.02,
                          }}
                          transition={{
                            duration: 0.35,
                            ease: "easeOut",
                          }}
                        >
                          <img
                            src={getImageUrl(
                              product.image
                            )}
                            alt={
                              name ||
                              "Product"
                            }
                            loading="lazy"
                            decoding="async"
                          />
                        </motion.div>
                      )}

                      {/* Product content */}
                      <div className="product-card__content">
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

                        {/* Product footer */}
                        <div className="product-card__footer">
                          <span className="product-card__price">
                            {
                              price
                            }
                          </span>

                          <motion.a
                            href="#contact"
                            className="product-card__link"
                            aria-label={
                              language ===
                              "fr"
                                ? `Demander des informations sur ${name}`
                                : `Inquire about ${name}`
                            }
                            whileHover={{
                              x: 3,
                            }}
                            whileTap={{
                              scale: 0.96,
                            }}
                          >
                            {language ===
                            "fr"
                              ? "Demander"
                              : "Inquire"}

                            <motion.i
                              className="bi bi-arrow-right"
                              aria-hidden="true"
                              whileHover={{
                                x: 4,
                              }}
                              transition={{
                                duration: 0.2,
                              }}
                            />
                          </motion.a>
                        </div>
                      </div>
                    </motion.article>
                  );
                }
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            className="products__empty"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
          >
            <motion.i
              className="bi bi-box-seam"
              aria-hidden="true"
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.5,
                delay: 0.1,
              }}
            />

            <p>
              {language ===
              "fr"
                ? "Aucun produit disponible dans cette catégorie."
                : "No products available in this category."}
            </p>
          </motion.div>
        )}

        {/* Product pagination */}
        {totalPages > 1 && (
          <nav
            className="products__pagination"
            aria-label={
              language === "fr"
                ? "Pages des produits"
                : "Product pages"
            }
          >
            <button
              type="button"
              className="products__pagination-button products__pagination-prev"
              onClick={() =>
                handlePageChange(
                  currentPage - 1
                )
              }
              disabled={
                currentPage === 0
              }
              aria-label={
                language === "fr"
                  ? "Page précédente"
                  : "Previous page"
              }
            >
              <i
                className="bi bi-chevron-left"
                aria-hidden="true"
              />
            </button>

            <div className="products__pagination-pages">
              {Array.from(
                {
                  length:
                    totalPages,
                },
                (_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`products__page-button ${
                      currentPage ===
                      index
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handlePageChange(
                        index
                      )
                    }
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

            <button
              type="button"
              className="products__pagination-button products__pagination-next"
              onClick={() =>
                handlePageChange(
                  currentPage + 1
                )
              }
              disabled={
                currentPage ===
                totalPages - 1
              }
              aria-label={
                language === "fr"
                  ? "Page suivante"
                  : "Next page"
              }
            >
              <i
                className="bi bi-chevron-right"
                aria-hidden="true"
              />
            </button>
          </nav>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;