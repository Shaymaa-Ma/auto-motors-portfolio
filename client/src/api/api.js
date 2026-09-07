// =========================================================
// AUTO MOTORS SARL — API
// Centralized API communication
// =========================================================

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const UPLOADS_URL =
  process.env.REACT_APP_UPLOADS_URL || "http://localhost:5000/uploads";

// =========================================================
// IMAGE URL
// Converts database image paths into usable frontend URLs
// =========================================================

export const getImageUrl = (path) => {
  if (!path) return "";

  // Already a complete URL
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Remove leading slashes
  const cleanPath = path.replace(/^\/+/, "");

  return `${UPLOADS_URL}/${cleanPath}`;
};

// =========================================================
// GENERIC GET REQUEST
// =========================================================

const get = async (endpoint) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`);

    const result = await response.json();

    if (!response.ok || result.success === false) {
      throw new Error(
        result.message || "Failed to retrieve data"
      );
    }

    return result.data;
  } catch (error) {
    console.error(`API GET ${endpoint}:`, error);
    throw error;
  }
};

// =========================================================
// COMPANY
// =========================================================

export const getCompany = () => {
  return get("/company");
};

// =========================================================
// HERO
// =========================================================

export const getHero = () => {
  return get("/hero");
};

// =========================================================
// ABOUT
// =========================================================

export const getAbout = () => {
  return get("/about");
};

// =========================================================
// SERVICES
// =========================================================

export const getServices = () => {
  return get("/services");
};

// =========================================================
// PRODUCT CATEGORIES
// =========================================================

export const getCategories = () => {
  return get("/categories");
};

// =========================================================
// PRODUCTS
// =========================================================

export const getProducts = (categoryId = null) => {
  const endpoint = categoryId
    ? `/products?category=${encodeURIComponent(categoryId)}`
    : "/products";

  return get(endpoint);
};

// =========================================================
// VEHICLES
// =========================================================

export const getVehicles = () => {
  return get("/vehicles");
};

// =========================================================
// ADVANTAGES
// =========================================================

export const getAdvantages = () => {
  return get("/advantages");
};

// =========================================================
// FAQ
// =========================================================

export const getFaqs = () => {
  return get("/faqs");
};

// =========================================================
// GALLERY
// =========================================================

export const getGallery = () => {
  return get("/gallery");
};

// =========================================================
// SOCIAL LINKS
// =========================================================

export const getSocialLinks = () => {
  return get("/social-links");
};

// =========================================================
// SITE SETTINGS
// =========================================================

export const getSiteSettings = () => {
  return get("/site-settings");
};