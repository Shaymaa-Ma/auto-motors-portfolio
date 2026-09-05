const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

// =========================================================
// Routes
// =========================================================
//const authRoutes = require("./routes/authRoutes");

const companyRoutes = require("./routes/companyRoutes");
const heroRoutes = require("./routes/heroRoutes");
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

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
//app.use("/api/auth", authRoutes);

app.use("/api/company", companyRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/advantages", advantageRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/social-links", socialRoutes);
app.use("/api/site-settings", siteSettingsRoutes);



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
  console.log(`Server running on http://localhost:${PORT}`);
});

