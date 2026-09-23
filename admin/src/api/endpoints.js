import axiosClient from "./axiosClient";

// =========================================================
// AUTH API
// =========================================================
export const authApi = {
  // Login administrator
  login: async (email, password) => {
    const response = await axiosClient.post("/auth/login", { email, password });
    return response.data;
  },

  // Initial administrator registration
  register: async (name, email, password, confirmPassword, setupKey) => {
    const response = await axiosClient.post("/auth/register", {
      name,
      email,
      password,
      confirmPassword,
      setupKey,
    });
    return response.data;
  },

  // Check whether initial registration is available
  registrationStatus: async () => {
    const response = await axiosClient.get("/auth/registration-status");
    return response.data;
  },

  // Get current administrator
  me: async () => {
    const response = await axiosClient.get("/auth/me");
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await axiosClient.post("/auth/logout");
    return response.data;
  },
};






// =========================================================
// USERS API (Administrator management)
// =========================================================
export const usersApi = {
  // Get all administrators
  getAll: async () => {
    const response = await axiosClient.get("/users");
    return response.data;
  },

  // Create administrator
  create: async (userData) => {
    const response = await axiosClient.post("/users", userData);
    return response.data;
  },

  // Activate / deactivate administrator
  updateStatus: async (id, is_active) => {
    const response = await axiosClient.patch(`/users/${id}/status`, { is_active });
    return response.data;
  },

  // Delete administrator
  delete: async (id) => {
    const response = await axiosClient.delete(`/users/${id}`);
    return response.data;
  },
};





// =========================================================
// DASHBOARD API
// =========================================================
export const dashboardApi = {
  getStats: async () => {
    const response = await axiosClient.get("/dashboard/stats");
    return response.data;
  },
};





// =========================================================
// HERO API
// =========================================================
export const heroApi = {
  get: async () => {
    const response = await axiosClient.get("/hero");
    return response.data;
  },

  update: async (formData) => {
    const response = await axiosClient.put("/hero", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};





// =========================================================
// ABOUT API
// =========================================================
export const aboutApi = {
  get: async () => {
    const response = await axiosClient.get("/about");
    return response.data;
  },

  update: async (formData) => {
    const response = await axiosClient.put("/about", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};





// =========================================================
// SERVICES API
// =========================================================
export const servicesApi = {
  // Get active services for the client
  get: async () => {
    const response = await axiosClient.get("/services");
    return response.data;
  },

  // Get paginated services for Admin
  getAll: async (params) => {
    const response = await axiosClient.get("/services/admin", { params });
    return response.data;
  },

  // Get one service
  getOne: async (id) => {
    const response = await axiosClient.get(`/services/${id}`);
    return response.data;
  },

  // Create a service
  create: async (data) => {
    const response = await axiosClient.post("/services", data);
    return response.data;
  },

  // Update a service
  update: async (id, data) => {
    const response = await axiosClient.put(`/services/${id}`, data);
    return response.data;
  },

  // Delete a service
  remove: async (id) => {
    const response = await axiosClient.delete(`/services/${id}`);
    return response.data;
  },

  // Reorder a service
  reorder: async (id, display_order) => {
    const response = await axiosClient.put(`/services/${id}/order`, { display_order });
    return response.data;
  },

  // Normalize service orders
  normalizeOrders: async () => {
    const response = await axiosClient.post("/services/normalize-orders");
    return response.data;
  },
};





// =========================================================
// PRODUCTS API
// =========================================================
export const productsApi = {
  get: async (params) => {
    const response = await axiosClient.get("/products", { params });
    return response.data;
  },

  getOne: async (id) => {
    const response = await axiosClient.get(`/products/${id}`);
    return response.data;
  },

  getAll: async (params) => {
    const response = await axiosClient.get("/products/admin", { params });
    return response.data;
  },

  getAdminOne: async (id) => {
    const response = await axiosClient.get(`/products/admin/${id}`);
    return response.data;
  },

  // Create product with image
  create: async (formData) => {
    const response = await axiosClient.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Update product with optional new image
  update: async (id, formData) => {
    const response = await axiosClient.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Reorder product
  reorder: async (id, display_order) => {
    const response = await axiosClient.put(`/products/${id}/order`, { display_order });
    return response.data;
  },

  // Normalize all product orders
  normalizeOrders: async () => {
    const response = await axiosClient.post("/products/normalize-orders");
    return response.data;
  },

  remove: async (id) => {
    const response = await axiosClient.delete(`/products/${id}`);
    return response.data;
  },
};





// =========================================================
// VEHICLES API
// =========================================================
export const vehiclesApi = {
  // ---------------------------------------------------------
  // PUBLIC
  // ---------------------------------------------------------
  get: async () => {
    const response = await axiosClient.get("/vehicles");
    return response.data;
  },

  getOne: async (id) => {
    if (!id) {
      throw new Error("Vehicle ID is required.");
    }
    const response = await axiosClient.get(`/vehicles/${id}`);
    return response.data;
  },

  // ---------------------------------------------------------
  // ADMIN
  // ---------------------------------------------------------
  getAll: async (page = 1, limit = 10) => {
    const response = await axiosClient.get("/vehicles/admin", {
      params: { page, limit },
    });
    return response.data;
  },

  getAdminOne: async (id) => {
    if (!id) {
      throw new Error("Vehicle ID is required.");
    }
    const response = await axiosClient.get(`/vehicles/admin/${id}`);
    return response.data;
  },

  // Update vehicle
  update: async (id, formData) => {
    if (!id) {
      throw new Error("Vehicle ID is required.");
    }
    if (!(formData instanceof FormData)) {
      throw new Error("Vehicle update data must be FormData.");
    }

    // IMPORTANT:
    // Do NOT manually set Content-Type.
    // Axios/browser automatically creates: multipart/form-data; boundary=...
    const response = await axiosClient.put(`/vehicles/${id}`, formData);
    return response.data;
  },

  // Update section
  updateSection: async (sectionData) => {
    const response = await axiosClient.put("/vehicles/section", sectionData);
    return response.data;
  },

  // Reorder
  reorder: async (id, display_order) => {
    if (!id) {
      throw new Error("Vehicle ID is required.");
    }

    const order = Number(display_order);
    if (!Number.isFinite(order)) {
      throw new Error("A valid display order is required.");
    }

    const response = await axiosClient.put(`/vehicles/${id}/order`, {
      display_order: order,
    });
    return response.data;
  },

  // Normalize orders
  normalizeOrders: async () => {
    const response = await axiosClient.post("/vehicles/normalize-orders");
    return response.data;
  },

  // Delete
  remove: async (id) => {
    if (!id) {
      throw new Error("Vehicle ID is required.");
    }
    const response = await axiosClient.delete(`/vehicles/${id}`);
    return response.data;
  },
};





// =========================================================
// GALLERY API
// =========================================================
export const galleryApi = {
  // PUBLIC - get active gallery
  get: async () => {
    const response = await axiosClient.get("/gallery");
    return response.data;
  },

  // PUBLIC - get one active gallery item
  getOne: async (id) => {
    if (!id) {
      throw new Error("Gallery item ID is required.");
    }
    const response = await axiosClient.get(`/gallery/${id}`);
    return response.data;
  },

  // ADMIN - get paginated gallery
  getAll: async (page = 1, limit = 10) => {
    const response = await axiosClient.get("/gallery/admin", {
      params: { page, limit },
    });
    return response.data;
  },

  // ADMIN - get one gallery item
  getAdminOne: async (id) => {
    if (!id) {
      throw new Error("Gallery item ID is required.");
    }
    const response = await axiosClient.get(`/gallery/admin/${id}`);
    return response.data;
  },

  // ADMIN - update section content
  updateSection: async (formData) => {
    const response = await axiosClient.put("/gallery/section", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // ADMIN - create gallery item
  create: async (formData) => {
    const response = await axiosClient.post("/gallery", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // ADMIN - update gallery item
  update: async (id, formData) => {
    if (!id) {
      throw new Error("Gallery item ID is required.");
    }
    const response = await axiosClient.put(`/gallery/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // ADMIN - reorder gallery item
  reorder: async (id, display_order) => {
    if (!id) {
      throw new Error("Gallery item ID is required.");
    }
    const response = await axiosClient.put(`/gallery/${id}/order`, { display_order });
    return response.data;
  },

  // ADMIN - normalize orders
  normalizeOrders: async () => {
    const response = await axiosClient.post("/gallery/normalize-orders");
    return response.data;
  },

  // ADMIN - delete gallery item
  remove: async (id) => {
    if (!id) {
      throw new Error("Gallery item ID is required.");
    }
    const response = await axiosClient.delete(`/gallery/${id}`);
    return response.data;
  },
};






// =========================================================
// ADVANTAGES API
// =========================================================
export const advantagesApi = {
  // Get advantages for the client
  get: async () => {
    const response = await axiosClient.get("/advantages");
    return response.data;
  },

  // Get paginated advantages for Admin
  getAll: async (page = 1, limit = 10) => {
    const response = await axiosClient.get("/advantages/admin", {
      params: { page, limit },
    });
    return response.data;
  },

  // Get one advantage for Admin
  getAdminOne: async (id) => {
    if (!id) {
      throw new Error("Advantage ID is required.");
    }
    const response = await axiosClient.get(`/advantages/admin/${id}`);
    return response.data;
  },

  // Create an advantage
  create: async (formData) => {
    const response = await axiosClient.post("/advantages", formData);
    return response.data;
  },

  // Update an advantage
  update: async (id, data) => {
    if (!id) {
      throw new Error("Advantage ID is required.");
    }
    const response = await axiosClient.put(`/advantages/${id}`, data);
    return response.data;
  },

  // Reorder an advantage
  reorder: async (id, display_order) => {
    if (!id) {
      throw new Error("Advantage ID is required.");
    }
    const response = await axiosClient.put(`/advantages/${id}/order`, { display_order });
    return response.data;
  },

  // Normalize all advantage orders
  normalizeOrders: async () => {
    const response = await axiosClient.post("/advantages/normalize-orders");
    return response.data;
  },

  // Delete an advantage
  remove: async (id) => {
    if (!id) {
      throw new Error("Advantage ID is required.");
    }
    const response = await axiosClient.delete(`/advantages/${id}`);
    return response.data;
  },
};






// =========================================================
// FAQS API
// =========================================================
export const faqsApi = {
  // ---------------------------------------------------------
  // PUBLIC
  // ---------------------------------------------------------

  // Get active FAQs for the client
  get: async () => {
    const response = await axiosClient.get("/faqs");
    return response.data;
  },

  // Get one active FAQ
  getOne: async (id) => {
    if (!id) {
      throw new Error("FAQ ID is required.");
    }
    const response = await axiosClient.get(`/faqs/${id}`);
    return response.data;
  },

  // ---------------------------------------------------------
  // ADMIN
  // ---------------------------------------------------------

  // Get paginated FAQs for Admin
  getAll: async (page = 1, limit = 10) => {
    const response = await axiosClient.get("/faqs/admin", {
      params: { page, limit },
    });
    return response.data;
  },

  // Get one FAQ for Admin
  getAdminOne: async (id) => {
    if (!id) {
      throw new Error("FAQ ID is required.");
    }
    const response = await axiosClient.get(`/faqs/admin/${id}`);
    return response.data;
  },

  // Create an FAQ
  create: async (data) => {
    const response = await axiosClient.post("/faqs", data);
    return response.data;
  },

  // Update an FAQ
  update: async (id, data) => {
    if (!id) {
      throw new Error("FAQ ID is required.");
    }
    const response = await axiosClient.put(`/faqs/${id}`, data);
    return response.data;
  },

  // Reorder FAQ
  reorder: async (id, display_order) => {
    if (!id) {
      throw new Error("FAQ ID is required.");
    }
    const response = await axiosClient.put(`/faqs/${id}/order`, { display_order });
    return response.data;
  },

  // Normalize all FAQ orders
  normalizeOrders: async () => {
    const response = await axiosClient.post("/faqs/normalize-orders");
    return response.data;
  },

  // Delete FAQ
  remove: async (id) => {
    if (!id) {
      throw new Error("FAQ ID is required.");
    }
    const response = await axiosClient.delete(`/faqs/${id}`);
    return response.data;
  },
};







// =========================================================
// COMPANY API
// =========================================================
export const companyApi = {
  // Get company information
  get: async () => {
    const response = await axiosClient.get("/company");
    return response.data;
  },

  // Update company information
  update: async (formData) => {
    const response = await axiosClient.put("/company", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};






// =========================================================
// CONTACT API
// =========================================================
export const contactApi = {
  // Get contact section content
  get: async () => {
    const response = await axiosClient.get("/contact");
    return response.data;
  },

  // Update contact section content
  update: async (data) => {
    const response = await axiosClient.put("/contact", data);
    return response.data;
  },
};





// =========================================================
// CATEGORIES API
// =========================================================
export const categoriesApi = {
  // Get active categories for the client
  get: async () => {
    const response = await axiosClient.get("/categories");
    return response.data;
  },

  // Get one active category
  getOne: async (id) => {
    const response = await axiosClient.get(`/categories/${id}`);
    return response.data;
  },

  // Get categories for Admin (supports backend pagination)
  getAll: async (params) => {
    const response = await axiosClient.get("/categories/admin", { params });
    return response.data;
  },

  // Get one category for Admin
  getAdminOne: async (id) => {
    const response = await axiosClient.get(`/categories/admin/${id}`);
    return response.data;
  },

  // Create a category
  create: async (formData) => {
    const response = await axiosClient.post("/categories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Update a category
  update: async (id, formData) => {
    const response = await axiosClient.put(`/categories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Reorder category
  reorder: async (id, display_order) => {
    const response = await axiosClient.put(`/categories/${id}/order`, { display_order });
    return response.data;
  },

  // Normalize all category orders
  normalizeOrders: async () => {
    const response = await axiosClient.post("/categories/normalize-orders");
    return response.data;
  },
};






// =========================================================
// SOCIAL LINKS API
// =========================================================
export const socialLinksApi = {
  // ---------------------------------------------------------
  // PUBLIC
  // ---------------------------------------------------------

  // Get active social links for the client
  get: async () => {
    const response = await axiosClient.get("/social-links");
    return response.data;
  },

  // Get one active social link
  getOne: async (id) => {
    if (!id) {
      throw new Error("Social link ID is required.");
    }
    const response = await axiosClient.get(`/social-links/${id}`);
    return response.data;
  },

  // ---------------------------------------------------------
  // ADMIN
  // ---------------------------------------------------------

  // Get paginated social links
  getAll: async (page = 1, limit = 10) => {
    const response = await axiosClient.get("/social-links/admin", {
      params: { page, limit },
    });
    return response.data;
  },

  // Get one social link for Admin
  getAdminOne: async (id) => {
    if (!id) {
      throw new Error("Social link ID is required.");
    }
    const response = await axiosClient.get(`/social-links/admin/${id}`);
    return response.data;
  },

  // Create a social link
  create: async (data) => {
    const response = await axiosClient.post("/social-links", data);
    return response.data;
  },

  // Update a social link
  update: async (id, data) => {
    if (!id) {
      throw new Error("Social link ID is required.");
    }
    const response = await axiosClient.put(`/social-links/${id}`, data);
    return response.data;
  },

  // Update shared section content
  updateSection: async (sectionData) => {
    const response = await axiosClient.put("/social-links/section", sectionData);
    return response.data;
  },

  // Reorder a social link
  reorder: async (id, display_order) => {
    if (!id) {
      throw new Error("Social link ID is required.");
    }

    const order = Number(display_order);
    if (!Number.isFinite(order) || order < 1) {
      throw new Error("A valid display order is required.");
    }

    const response = await axiosClient.put(`/social-links/${id}/order`, {
      display_order: order,
    });
    return response.data;
  },

  // Normalize all social link orders
  normalizeOrders: async () => {
    const response = await axiosClient.post("/social-links/normalize-orders");
    return response.data;
  },

  // Delete a social link
  remove: async (id) => {
    if (!id) {
      throw new Error("Social link ID is required.");
    }
    const response = await axiosClient.delete(`/social-links/${id}`);
    return response.data;
  },
};