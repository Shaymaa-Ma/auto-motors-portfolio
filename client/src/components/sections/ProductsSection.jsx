
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import {
  getCategories,
  getProducts,
  getImageUrl,
} from "../../api/api";
import SectionHeading from "../common/SectionHeading";

const ProductsSection = () => {
  const { language } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadProductsData = async () => {
      try {
        const [categoryData, productData] = await Promise.all([
          getCategories(),
          getProducts(),
        ]);

        if (!isMounted) return;

        setCategories(categoryData || []);
        setProducts(productData || []);
      } catch (error) {
        console.error("Products data loading error:", error);
      }
    };

    loadProductsData();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
   * Filter products by selected category.
   */
  const filteredProducts = useMemo(() => {
    if (activeCategory === null) {
      return products;
    }

    return products.filter(
      (product) =>
        Number(product.category_id) === Number(activeCategory)
    );
  }, [products, activeCategory]);

  /*
   * Get the appropriate language field.
   */
  const getLocalizedValue = (item, field) => {
    if (!item) return "";

    return language === "fr"
      ? item[`${field}_fr`] || ""
      : item[`${field}_en`] || "";
  };

  /*
   * Display the price exactly as entered by the admin.
   *
   * Examples:
   * 70 $
   * 45,000 XOF
   * 75 €
   *
   * No conversion or currency formatting is performed.
   */
  const displayPrice = (product) => {
    const price = product?.price;

    if (
      price === null ||
      price === undefined ||
      String(price).trim() === ""
    ) {
      return language === "fr"
        ? "Nous consulter"
        : "Contact us";
    }

    return String(price).trim();
  };

  /*
   * Don't render the section when there is no data.
   */
  if (!categories.length && !products.length) {
    return null;
  }

  const firstCategory = categories[0];

  const sectionTitle = getLocalizedValue(
    firstCategory,
    "section_title"
  );

  const sectionSubtitle = getLocalizedValue(
    firstCategory,
    "section_subtitle"
  );

  /*
   * Animation variants
   */
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
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const gridVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
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
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
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
        {/* Section Heading */}
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
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <SectionHeading
            title={sectionTitle}
            subtitle={sectionSubtitle}
            id="products-heading"
          />
        </motion.div>

        {/* Category Filters */}
        {categories.length > 0 && (
          <motion.div
            className="products__filters"
            role="group"
            aria-label={
              language === "fr"
                ? "Filtrer les produits"
                : "Filter products"
            }
            variants={filtersVariants}
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
                activeCategory === null ? "active" : ""
              }
              aria-pressed={activeCategory === null}
              onClick={() => setActiveCategory(null)}
              whileHover={{
                y: -2,
              }}
              whileTap={{
                scale: 0.96,
              }}
            >
              {language === "fr" ? "Tous" : "All"}
            </motion.button>

            {categories.map((category) => {
              const name = getLocalizedValue(
                category,
                "name"
              );

              const isActive =
                Number(activeCategory) === Number(category.id);

              return (
                <motion.button
                  key={category.id}
                  type="button"
                  className={isActive ? "active" : ""}
                  aria-pressed={isActive}
                  onClick={() =>
                    setActiveCategory(category.id)
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
            })}
          </motion.div>
        )}

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory ?? "all"}
              className="products__grid"
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {filteredProducts.map((product) => {
                const name = getLocalizedValue(
                  product,
                  "name"
                );

                const description = getLocalizedValue(
                  product,
                  "description"
                );

                const price = displayPrice(product);

                return (
                  <motion.article
                    key={product.id}
                    className="product-card"
                    variants={cardVariants}
                    whileHover={{
                      y: -7,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                  >
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
                          src={getImageUrl(product.image)}
                          alt={name || "Product"}
                          loading="lazy"
                          decoding="async"
                        />
                      </motion.div>
                    )}

                    <div className="product-card__content">
                      {name && <h3>{name}</h3>}

                      {description && (
                        <p>{description}</p>
                      )}

                      <div className="product-card__footer">
                        <span className="product-card__price">
                          {price}
                        </span>

                        <motion.a
                          href="#contact"
                          className="product-card__link"
                          aria-label={
                            language === "fr"
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
                          {language === "fr"
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
              })}
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
              ease: [0.22, 1, 0.36, 1],
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
              {language === "fr"
                ? "Aucun produit disponible dans cette catégorie."
                : "No products available in this category."}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
