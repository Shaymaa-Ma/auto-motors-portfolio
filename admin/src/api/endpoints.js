import axiosClient from "./axiosClient";

// Authentication API
export const authApi = {
  login: async (email, password) => {
    const response = await axiosClient.post(
      "/auth/login",
      {
        email,
        password,
      }
    );

    return response.data;
  },

  me: async () => {
    const response = await axiosClient.get(
      "/auth/me"
    );

    return response.data;
  },

  logout: async () => {
    const response = await axiosClient.post(
      "/auth/logout"
    );

    return response.data;
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async () => {
    const response = await axiosClient.get(
      "/dashboard/stats"
    );

    return response.data;
  },
};

// Hero API
export const heroApi = {
  get: async () => {
    const response = await axiosClient.get(
      "/hero"
    );

    return response.data;
  },

  update: async (formData) => {
    const response = await axiosClient.put(
      "/hero",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    return response.data;
  },
};


// About API
export const aboutApi = {
  get: async () => {
    const response = await axiosClient.get(
      "/about"
    );

    return response.data;
  },

  update: async (formData) => {
    const response = await axiosClient.put(
      "/about",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    return response.data;
  },
};

// Services API
export const servicesApi = {
  // Get active services for the client
  get: async () => {
    const response = await axiosClient.get(
      "/services"
    );

    return response.data;
  },

  // Get all services for Admin
  getAll: async () => {
    const response = await axiosClient.get(
      "/services/admin"
    );

    return response.data;
  },

  // Get one service
  getOne: async (id) => {
    const response = await axiosClient.get(
      `/services/${id}`
    );

    return response.data;
  },

  // Create a service
  create: async (data) => {
    const response = await axiosClient.post(
      "/services",
      data
    );

    return response.data;
  },

  // Update a service
  update: async (id, data) => {
    const response = await axiosClient.put(
      `/services/${id}`,
      data
    );

    return response.data;
  },

  // Delete a service
  remove: async (id) => {
    const response = await axiosClient.delete(
      `/services/${id}`
    );

    return response.data;
  },
};



export const productsApi = {
  get: async (params) => {
    const response = await axiosClient.get(
      "/products",
      { params }
    );

    return response.data;
  },

  getOne: async (id) => {
    const response = await axiosClient.get(
      `/products/${id}`
    );

    return response.data;
  },

  getAll: async (params) => {
    const response = await axiosClient.get(
      "/products/admin",
      { params }
    );

    return response.data;
  },

  getAdminOne: async (id) => {
    const response = await axiosClient.get(
      `/products/admin/${id}`
    );

    return response.data;
  },

  // Create product with image
  create: async (formData) => {
    const response = await axiosClient.post(
      "/products",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  // Update product with optional new image
  update: async (id, formData) => {
    const response = await axiosClient.put(
      `/products/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  remove: async (id) => {
    const response = await axiosClient.delete(
      `/products/${id}`
    );

    return response.data;
  },
};



// Vehicles API
export const vehiclesApi = {
  // Get active vehicles for the client
  get: async () => {
    const response =
      await axiosClient.get(
        "/vehicles"
      );

    return response.data;
  },

  // Get one active vehicle
  getOne: async (
    id
  ) => {
    const response =
      await axiosClient.get(
        `/vehicles/${id}`
      );

    return response.data;
  },

  // Get all vehicles for Admin
  getAll: async () => {
    const response =
      await axiosClient.get(
        "/vehicles/admin"
      );

    return response.data;
  },

  // Get one vehicle for Admin
  getAdminOne: async (
    id
  ) => {
    const response =
      await axiosClient.get(
        `/vehicles/admin/${id}`
      );

    return response.data;
  },

  // Update a vehicle
  update: async (
    id,
    formData
  ) => {
    if (!id) {
      throw new Error(
        "Vehicle ID is required."
      );
    }

    const response =
      await axiosClient.put(
        `/vehicles/${id}`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
  },

  // Delete a vehicle
  remove: async (
    id
  ) => {
    if (!id) {
      throw new Error(
        "Vehicle ID is required."
      );
    }

    const response =
      await axiosClient.delete(
        `/vehicles/${id}`
      );

    return response.data;
  },
};



// =========================================================
// GALLERY API
// =========================================================

export const galleryApi = {

  // -------------------------------------------------------
  // PUBLIC - GET ACTIVE GALLERY
  // -------------------------------------------------------

  get: async () => {
    const response =
      await axiosClient.get(
        "/gallery"
      );

    return response.data;
  },

  // -------------------------------------------------------
  // PUBLIC - GET ONE ACTIVE GALLERY ITEM
  // -------------------------------------------------------

  getOne: async (id) => {
    const response =
      await axiosClient.get(
        `/gallery/${id}`
      );

    return response.data;
  },

  // -------------------------------------------------------
  // ADMIN - GET ALL GALLERY ITEMS
  // Includes active + inactive
  // -------------------------------------------------------

  getAll: async () => {
    const response =
      await axiosClient.get(
        "/gallery/admin"
      );

    return response.data;
  },

  // -------------------------------------------------------
  // ADMIN - GET ONE GALLERY ITEM
  // -------------------------------------------------------

  getAdminOne: async (id) => {
    const response =
      await axiosClient.get(
        `/gallery/admin/${id}`
      );

    return response.data;
  },

  // -------------------------------------------------------
  // ADMIN - UPDATE SECTION CONTENT
  // -------------------------------------------------------

  updateSection: async (
    formData
  ) => {
    const response =
      await axiosClient.put(
        "/gallery/section",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
  },

  // -------------------------------------------------------
  // ADMIN - CREATE GALLERY ITEM
  // -------------------------------------------------------

  create: async (
    formData
  ) => {
    const response =
      await axiosClient.post(
        "/gallery",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
  },

  // -------------------------------------------------------
  // ADMIN - UPDATE GALLERY ITEM
  // -------------------------------------------------------

  update: async (
    id,
    formData
  ) => {
    const response =
      await axiosClient.put(
        `/gallery/${id}`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
  },

  // -------------------------------------------------------
  // ADMIN - DELETE GALLERY ITEM
  // -------------------------------------------------------

  remove: async (
    id
  ) => {
    const response =
      await axiosClient.delete(
        `/gallery/${id}`
      );

    return response.data;
  },
};

// Advantages API
export const advantagesApi = {
  // Get advantages for the client
  get: async () => {
    const response =
      await axiosClient.get(
        "/advantages"
      );

    return response.data;
  },

  // Get all advantages for Admin
  getAll: async () => {
    const response =
      await axiosClient.get(
        "/advantages/admin"
      );

    return response.data;
  },

  // Get one advantage for Admin
  getAdminOne: async (
    id
  ) => {
    if (!id) {
      throw new Error(
        "Advantage ID is required."
      );
    }

    const response =
      await axiosClient.get(
        `/advantages/admin/${id}`
      );

    return response.data;
  },

  // Create an advantage
  create: async (
    formData
  ) => {
    const response =
      await axiosClient.post(
        "/advantages",
        formData
      );

    return response.data;
  },

  // Update an advantage
  update: async (
    id,
    data
  ) => {
    if (!id) {
      throw new Error(
        "Advantage ID is required."
      );
    }

    const response =
      await axiosClient.put(
        `/advantages/${id}`,
        data
      );

    return response.data;
  },

  // Delete an advantage
  remove: async (
    id
  ) => {
    if (!id) {
      throw new Error(
        "Advantage ID is required."
      );
    }

    const response =
      await axiosClient.delete(
        `/advantages/${id}`
      );

    return response.data;
  },
};




// FAQs API
export const faqsApi = {
  // Get active FAQs for the client
  get: async () => {
    const response =
      await axiosClient.get(
        "/faqs"
      );

    return response.data;
  },
    

  // Get one active FAQ
  getOne: async (
    id
  ) => {
    const response =
      await axiosClient.get(
        `/faqs/${id}`
      );

    return response.data;
  },

  // Get all FAQs for Admin
  getAll: async () => {
    const response =
      await axiosClient.get(
        "/faqs/admin"
      );

    return response.data;
  },

  // Get one FAQ for Admin
  getAdminOne: async (
    id
  ) => {
    const response =
      await axiosClient.get(
        `/faqs/admin/${id}`
      );

    return response.data;
  },

  // Create an FAQ
  create: async (
    data
  ) => {
    const response =
      await axiosClient.post(
        "/faqs",
        data
      );

    return response.data;
  },

  // Update an FAQ
  update: async (
    id,
    data
  ) => {
    const response =
      await axiosClient.put(
        `/faqs/${id}`,
        data
      );

    return response.data;
  },
};


// Company API
export const companyApi = {
  // Get Company information
  get: async () => {
    const response =
      await axiosClient.get(
        "/company"
      );

    return response.data;
  },

  // Update Company information
  update: async (
    formData
  ) => {
    const response =
      await axiosClient.put(
        "/company",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
  },
};




// Site settings API
export const siteSettingsApi = {
  // Get all site settings
  get: async () => {
    const response =
      await axiosClient.get(
        "/site-settings"
      );

    return response.data;
  },

  // Get one site setting
  getOne: async (
    key
  ) => {
    const response =
      await axiosClient.get(
        `/site-settings/${key}`
      );

    return response.data;
  },

  // Create a site setting
  create: async (
    data
  ) => {
    const response =
      await axiosClient.post(
        "/site-settings",
        data
      );

    return response.data;
  },

  // Update a site setting
  update: async (
    key,
    data
  ) => {
    const response =
      await axiosClient.put(
        `/site-settings/${key}`,
        data
      );

    return response.data;
  },

  // Delete a site setting
  remove: async (
    key
  ) => {
    const response =
      await axiosClient.delete(
        `/site-settings/${key}`
      );

    return response.data;
  },
};



// Categories API
export const categoriesApi = {
  // Get active categories for the client
  get: async () => {
    const response =
      await axiosClient.get(
        "/categories"
      );

    return response.data;
  },

  // Get one active category
  getOne: async (
    id
  ) => {
    const response =
      await axiosClient.get(
        `/categories/${id}`
      );

    return response.data;
  },

  // Get all categories for Admin
  getAll: async () => {
    const response =
      await axiosClient.get(
        "/categories/admin"
      );

    return response.data;
  },

  // Get one category for Admin
  getAdminOne: async (
    id
  ) => {
    const response =
      await axiosClient.get(
        `/categories/admin/${id}`
      );

    return response.data;
  },

  // Create a category
  create: async (
    formData
  ) => {
    const response =
      await axiosClient.post(
        "/categories",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
  },

  // Update a category
  update: async (
    id,
    formData
  ) => {
    const response =
      await axiosClient.put(
        `/categories/${id}`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
  },
};


// Social links API
export const socialLinksApi = {
  // Get active social links for the client
  get: async () => {
    const response =
      await axiosClient.get(
        "/social-links"
      );

    return response.data;
  },

  // Get one active social link
  getOne: async (
    id
  ) => {
    const response =
      await axiosClient.get(
        `/social-links/${id}`
      );

    return response.data;
  },

  // Get all social links for Admin
  getAll: async () => {
    const response =
      await axiosClient.get(
        "/social-links/admin"
      );

    return response.data;
  },

  // Get one social link for Admin
  getAdminOne: async (
    id
  ) => {
    const response =
      await axiosClient.get(
        `/social-links/admin/${id}`
      );

    return response.data;
  },

  // Create a social link
  create: async (
    data
  ) => {
    const response =
      await axiosClient.post(
        "/social-links",
        data
      );

    return response.data;
  },

  // Update a social link
  update: async (
    id,
    data
  ) => {
    const response =
      await axiosClient.put(
        `/social-links/${id}`,
        data
      );

    return response.data;
  },

  // Delete a social link
  remove: async (
    id
  ) => {
    const response =
      await axiosClient.delete(
        `/social-links/${id}`
      );

    return response.data;
  },
};


