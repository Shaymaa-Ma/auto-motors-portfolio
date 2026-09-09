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

// Products API
export const productsApi = {
  // Get active products for the client
  get: async (
    category
  ) => {
    const response =
      await axiosClient.get(
        "/products",
        {
          params:
            category
              ? {
                  category,
                }
              : {},
        }
      );

    return response.data;
  },

  // Get one active product
  getOne: async (
    id
  ) => {
    const response =
      await axiosClient.get(
        `/products/${id}`
      );

    return response.data;
  },

  // Get all products for Admin
  getAll: async (
    category
  ) => {
    const response =
      await axiosClient.get(
        "/products/admin",
        {
          params:
            category
              ? {
                  category,
                }
              : {},
        }
      );

    return response.data;
  },

  // Get one product for Admin
  getAdminOne: async (
    id
  ) => {
    const response =
      await axiosClient.get(
        `/products/admin/${id}`
      );

    return response.data;
  },

  // Create a product
  create: async (
    formData
  ) => {
    const response =
      await axiosClient.post(
        "/products",
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

  // Update a product
  update: async (
    id,
    formData
  ) => {
    const response =
      await axiosClient.put(
        `/products/${id}`,
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




// Categories API
export const categoriesApi = {
  getAll: async () => {
    const response = await axiosClient.get(
      "/categories"
    );

    return response.data;
  },

  getOne: async (id) => {
    const response = await axiosClient.get(
      `/categories/${id}`
    );

    return response.data;
  },

  create: async (formData) => {
    const response = await axiosClient.post(
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

  update: async (id, formData) => {
    const response = await axiosClient.put(
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

  remove: async (id) => {
    const response = await axiosClient.delete(
      `/categories/${id}`
    );

    return response.data;
  },
};

// Company API
export const companyApi = {
  get: async () => {
    const response = await axiosClient.get(
      "/company"
    );

    return response.data;
  },
};