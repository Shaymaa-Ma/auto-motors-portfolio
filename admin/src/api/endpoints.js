import axiosClient from "./axiosClient";


// =========================================================
// TABLE OF CONTENTS
// =========================================================
//
// ACCOUNTS & DASHBOARD
//   1. authApi
//   2. usersApi
//   3. dashboardApi
//
// SINGLE-RECORD CONTENT
//   4. companyApi
//   5. heroApi
//   6. aboutApi
//   7. contactApi
//
// LIST CONTENT
//   8.  servicesApi
//   9.  categoriesApi
//   10. productsApi
//   11. vehiclesApi
//   12. advantagesApi
//   13. faqsApi
//   14. galleryApi
//   15. socialLinksApi
//
// =========================================================





// #########################################################
// ACCOUNTS & DASHBOARD
// #########################################################


// =========================================================
// 1. AUTH API
// =========================================================
export const authApi = {
  // Login administrator
  login: async (email, password) => {
    const response = await axiosClient.post("/auth/login", {
      email,
      password,
    });
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
// 2. USERS API (administrator management)
// =========================================================
export const usersApi = {
  // Get all administrators
  getAll: async () => {
    const response = await axiosClient.get("/users");
    return response.data;
  },

  // Create administrator
  create: async (data) => {
    const response = await axiosClient.post("/users", data);
    return response.data;
  },

  // Update current administrator profile
  // The frontend should NOT send the role here.
  // The backend keeps the existing role.
  updateMyProfile: async (data) => {
    const response = await axiosClient.patch("/users/me", data);
    return response.data;
  },

  // Update another administrator
  update: async (id, data) => {
    const response = await axiosClient.patch(`/users/${id}`, data);
    return response.data;
  },

  // Activate / deactivate administrator
  updateStatus: async (id, isActive) => {
    const response = await axiosClient.patch(`/users/${id}/status`, {
      is_active: isActive,
    });
    return response.data;
  },

  // Delete administrator
  delete: async (id) => {
    const response = await axiosClient.delete(`/users/${id}`);
    return response.data;
  },
};


// =========================================================
// 3. DASHBOARD API
// =========================================================
export const dashboardApi = {
  getStats: async () => {
    const response = await axiosClient.get("/dashboard/stats");
    return response.data;
  },
};





// #########################################################
// SINGLE-RECORD CONTENT
// #########################################################


// =========================================================
// 4. COMPANY API
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
// 5. HERO API
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
// 6. ABOUT API
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
// 7. CONTACT API
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





// #########################################################
// LIST CONTENT
// #########################################################


// =========================================================
// 8. SERVICES API
// =========================================================
export const servicesApi = {
  // ---------------------------------------------------------
  // PUBLIC
  // ---------------------------------------------------------

  // Get active services for the client
  get: async () => {
    const response = await axiosClient.get("/services");
    return response.data;
  },

  // Get one service
  getOne: async (id) => {
    const response = await axiosClient.get(`/services/${id}`);
    return response.data;
  },

  // ---------------------------------------------------------
  // ADMIN
  // ---------------------------------------------------------

  // Get paginated services for Admin
  getAll: async (params) => {
    const response = await axiosClient.get("/services/admin", { params });
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

  // Delete a service
  remove: async (id) => {
    const response = await axiosClient.delete(`/services/${id}`);
    return response.data;
  },
};


// =========================================================
// 9. CATEGORIES API
// =========================================================
export const categoriesApi = {
  // ---------------------------------------------------------
  // PUBLIC
  // ---------------------------------------------------------

  get: async () => {
    const response = await axiosClient.get("/categories");
    return response.data;
  },

  getOne: async (id) => {
    const response = await axiosClient.get(`/categories/${id}`);
    return response.data;
  },

  // ---------------------------------------------------------
  // ADMIN
  // ---------------------------------------------------------

  getAll: async (params) => {
    const response = await axiosClient.get("/categories/admin", { params });
    return response.data;
  },

  getAdminOne: async (id) => {
    const response = await axiosClient.get(`/categories/admin/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosClient.post("/categories", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosClient.put(`/categories/${id}`, data);
    return response.data;
  },

  // Update shared section content
  updateSection: async (data) => {
    const response = await axiosClient.put("/categories/section", data);
    return response.data;
  },

  reorder: async (id, display_order) => {
    const response = await axiosClient.put(`/categories/${id}/order`, {
      display_order,
    });
    return response.data;
  },

  normalizeOrders: async () => {
    const response = await axiosClient.post("/categories/normalize-orders");
    return response.data;
  },

  remove: async (id) => {
    const response = await axiosClient.delete(`/categories/${id}`);
    return response.data;
  },
};


// =========================================================
// 10. PRODUCTS API
// =========================================================
export const productsApi = {
  // ---------------------------------------------------------
  // PUBLIC
  // ---------------------------------------------------------

  get: async (params) => {
    const response = await axiosClient.get("/products", { params });
    return response.data;
  },

  getOne: async (id) => {
    const response = await axiosClient.get(`/products/${id}`);
    return response.data;
  },

  // ---------------------------------------------------------
  // ADMIN
  // ---------------------------------------------------------

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
// 11. VEHICLES API
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
  // ADMIN - READ
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

  // ---------------------------------------------------------
  // ADMIN - CREATE / UPDATE
  // ---------------------------------------------------------

  create: async (formData) => {
    if (!(formData instanceof FormData)) {
      throw new Error("Vehicle creation data must be FormData.");
    }

    const response = await axiosClient.post("/vehicles", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  update: async (id, formData) => {
    if (!id) {
      throw new Error("Vehicle ID is required.");
    }

    if (!(formData instanceof FormData)) {
      throw new Error("Vehicle update data must be FormData.");
    }

    const response = await axiosClient.put(`/vehicles/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Update shared section content
  updateSection: async (sectionData) => {
    if (!(sectionData instanceof FormData)) {
      throw new Error("Vehicles section data must be FormData.");
    }

    const response = await axiosClient.put("/vehicles/section", sectionData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // ---------------------------------------------------------
  // ADMIN - ORDER
  // ---------------------------------------------------------

  reorder: async (id, display_order) => {
    if (!id) {
      throw new Error("Vehicle ID is required.");
    }

    const order = Number(display_order);

    if (!Number.isFinite(order) || order < 1) {
      throw new Error("A valid display order is required.");
    }

    const response = await axiosClient.put(`/vehicles/${id}/order`, {
      display_order: order,
    });
    return response.data;
  },

  normalizeOrders: async () => {
    const response = await axiosClient.post("/vehicles/normalize-orders");
    return response.data;
  },

  // ---------------------------------------------------------
  // ADMIN - DELETE
  // ---------------------------------------------------------

  remove: async (id) => {
    if (!id) {
      throw new Error("Vehicle ID is required.");
    }

    const response = await axiosClient.delete(`/vehicles/${id}`);
    return response.data;
  },
};


// =========================================================
// 12. ADVANTAGES API
// =========================================================
export const advantagesApi = {
  // ---------------------------------------------------------
  // PUBLIC
  // ---------------------------------------------------------

  // Get advantages for the client
  get: async () => {
    const response = await axiosClient.get("/advantages");
    return response.data;
  },

  // ---------------------------------------------------------
  // ADMIN
  // ---------------------------------------------------------

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
// 13. FAQS API
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
// 14. GALLERY API
// =========================================================
export const galleryApi = {
  // ---------------------------------------------------------
  // PUBLIC
  // ---------------------------------------------------------

  // Get active gallery
  get: async () => {
    const response = await axiosClient.get("/gallery");
    return response.data;
  },

  // Get one active gallery item
  getOne: async (id) => {
    if (!id) {
      throw new Error("Gallery item ID is required.");
    }
    const response = await axiosClient.get(`/gallery/${id}`);
    return response.data;
  },

  // ---------------------------------------------------------
  // ADMIN
  // ---------------------------------------------------------

  // Get paginated gallery
  getAll: async (page = 1, limit = 10) => {
    const response = await axiosClient.get("/gallery/admin", {
      params: { page, limit },
    });
    return response.data;
  },

  // Get one gallery item
  getAdminOne: async (id) => {
    if (!id) {
      throw new Error("Gallery item ID is required.");
    }
    const response = await axiosClient.get(`/gallery/admin/${id}`);
    return response.data;
  },

  // Create gallery item
  create: async (formData) => {
    const response = await axiosClient.post("/gallery", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Update gallery item
  update: async (id, formData) => {
    if (!id) {
      throw new Error("Gallery item ID is required.");
    }
    const response = await axiosClient.put(`/gallery/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Update section content
  updateSection: async (formData) => {
    const response = await axiosClient.put("/gallery/section", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Reorder gallery item
  reorder: async (id, display_order) => {
    if (!id) {
      throw new Error("Gallery item ID is required.");
    }
    const response = await axiosClient.put(`/gallery/${id}/order`, { display_order });
    return response.data;
  },

  // Normalize orders
  normalizeOrders: async () => {
    const response = await axiosClient.post("/gallery/normalize-orders");
    return response.data;
  },

  // Delete gallery item
  remove: async (id) => {
    if (!id) {
      throw new Error("Gallery item ID is required.");
    }
    const response = await axiosClient.delete(`/gallery/${id}`);
    return response.data;
  },
};


// =========================================================
// 15. SOCIAL LINKS API
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