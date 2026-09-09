const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

// =========================================================
// Routes
// =========================================================

const authRoutes = require("./routes/authRoutes");

const dashboardRoutes = require("./routes/dashboardRoutes");
const companyRoutes = require("./routes/companyRoutes");
const heroRoutes = require("./routes/heroRoutes");
const aboutRoutes = require("./routes/aboutRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const advantageRoutes = require("./routes/advantageRoutes");
const faqRoutes = require("./routes/faqRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const socialRoutes = require("./routes/socialRoutes");
const siteSettingsRoutes = require("./routes/siteSettingsRoutes");

// =========================================================
// Middleware
// =========================================================

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as Postman/server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Origin not allowed by CORS")
      );
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// =========================================================
// Static uploads
// =========================================================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// =========================================================
// API Routes
// =========================================================

// Authentication
app.use("/api/auth", authRoutes);

// Public + protected content APIs
app.use("/api/company", companyRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/advantages", advantageRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/social-links", socialRoutes);
app.use("/api/site-settings", siteSettingsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// =========================================================
// Test route
// =========================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AUTO MOTORS SARL API is running",
  });
});

// =========================================================
// Start server
// =========================================================

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});