import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import {
  getCategories,
  getProducts,
  getSiteSettings,
  getImageUrl,
} from "../../api/api";
import SectionHeading from "../common/SectionHeading";

const ProductsSection = () => {
  const { language } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(565);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadProductsData = async () => {
      try {
        const [categoryData, productData, settingsData] =
          await Promise.all([
            getCategories(),
            getProducts(),
            getSiteSettings(),
          ]);

        if (!isMounted) return;

        setCategories(categoryData || []);
        setProducts(productData || []);

        const usdRate = (settingsData || []).find(
          (setting) =>
            setting.setting_key === "usd_exchange_rate"
        );

        const parsedRate = Number(usdRate?.setting_value);

        if (Number.isFinite(parsedRate) && parsedRate > 0) {
          setExchangeRate(parsedRate);
        }
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
   * Format price according to the selected language.
   *
   * Database stores the base price in XOF.
   *
   * French:
   * 45 000 XOF
   *
   * English:
   * $79.65
   */
  const formatPrice = (product) => {
    const rawPrice = product?.price;

    if (
      rawPrice === null ||
      rawPrice === undefined ||
      rawPrice === ""
    ) {
      return language === "fr"
        ? "Nous consulter"
        : "Contact us";
    }

    const priceInXof = Number(rawPrice);

    if (!Number.isFinite(priceInXof) || priceInXof < 0) {
      return language === "fr"
        ? "Nous consulter"
        : "Contact us";
    }

    /*
     * French → XOF
     */
    if (language === "fr") {
      return `${new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 0,
      }).format(priceInXof)} XOF`;
    }

    /*
     * English → USD
     */
    if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
      return "Contact us";
    }

    const priceInUsd = priceInXof / exchangeRate;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(priceInUsd);
  };

  /*
   * Get localized category/product content.
   */
  const getLocalizedValue = (item, field) => {
    return language === "fr"
      ? item?.[`${field}_fr`]
      : item?.[`${field}_en`];
  };

  /*
   * No data → don't render the section.
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

  return (
    <section
      id="products"
      className="products section"
      aria-labelledby="products-heading"
    >
      <div className="container">
        <SectionHeading
          title={sectionTitle}
          subtitle={sectionSubtitle}
          id="products-heading"
        />

        {/* Category Filters */}
        {categories.length > 0 && (
          <div
            className="products__filters"
            role="group"
            aria-label={
              language === "fr"
                ? "Filtrer les produits"
                : "Filter products"
            }
          >
            <button
              type="button"
              className={
                activeCategory === null ? "active" : ""
              }
              aria-pressed={activeCategory === null}
              onClick={() => setActiveCategory(null)}
            >
              {language === "fr" ? "Tous" : "All"}
            </button>

            {categories.map((category) => {
              const name = getLocalizedValue(
                category,
                "name"
              );

              const isActive =
                Number(activeCategory) === Number(category.id);

              return (
                <button
                  key={category.id}
                  type="button"
                  className={isActive ? "active" : ""}
                  aria-pressed={isActive}
                  onClick={() =>
                    setActiveCategory(category.id)
                  }
                >
                  {name}
                </button>
              );
            })}
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="products__grid">
            {filteredProducts.map((product) => {
              const name = getLocalizedValue(
                product,
                "name"
              );

              const description = getLocalizedValue(
                product,
                "description"
              );

              return (
                <article
                  key={product.id}
                  className="product-card"
                >
                  {product.image && (
                    <div className="product-card__image">
                      <img
                        src={getImageUrl(product.image)}
                        alt={name || "Product"}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}

                  <div className="product-card__content">
                    {name && <h3>{name}</h3>}

                    {description && (
                      <p>{description}</p>
                    )}

                    <div className="product-card__footer">
                      <span className="product-card__price">
                        {formatPrice(product)}
                      </span>

                      <a
                        href="#contact"
                        className="product-card__link"
                        aria-label={
                          language === "fr"
                            ? `Demander des informations sur ${name}`
                            : `Inquire about ${name}`
                        }
                      >
                        {language === "fr"
                          ? "Demander"
                          : "Inquire"}

                        <i
                          className="bi bi-arrow-right"
                          aria-hidden="true"
                        />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="products__empty">
            <i
              className="bi bi-box-seam"
              aria-hidden="true"
            />

            <p>
              {language === "fr"
                ? "Aucun produit disponible dans cette catégorie."
                : "No products available in this category."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;