require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const path = require("path");

const { burstLimiter, apiLimiter } = require("./middleware/rateLimiter");

const app = express();

// Only enable when the app runs behind a proxy (Render, Railway, Nginx, Cloudflare...).
// Set TRUST_PROXY=1 in production .env (2 if there are two proxy layers).
if (process.env.TRUST_PROXY) {
  app.set("trust proxy", Number(process.env.TRUST_PROXY));
}

const PORT = process.env.PORT || 5000;

// =========================================================
// ROUTES
// =========================================================

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

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
const contactRoutes = require("./routes/contactRoutes");


// =========================================================
// SECURITY HEADERS
// =========================================================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);


// =========================================================
// CORS
// =========================================================

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header.
      // Useful for Postman and server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked CORS origin:", origin);

      return callback(
        new Error("Origin not allowed by CORS")
      );
    },

    credentials: true,
  })
);


// =========================================================
// REQUEST BODY LIMITS
// =========================================================

// Prevent extremely large JSON requests from consuming
// unnecessary server resources.
app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);


// =========================================================
// COOKIE PARSER
// =========================================================

app.use(cookieParser());


// ============================================================
// GLOBAL API RATE LIMITING
// ============================================================
//
// These protect ALL /api routes.
//
// Burst:
//     100 requests / 10 seconds
//
// General:
//     600 requests / 15 minutes
//
// Login has additional, stricter protections inside
// authRoutes.js.
// ============================================================

app.use("/api", burstLimiter);
app.use("/api", apiLimiter);


// =========================================================
// STATIC UPLOADS
// =========================================================

// Public images uploaded by the admin panel are served here.
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);


// =========================================================
// API ROUTES
// =========================================================

// Authentication
app.use(
  "/api/auth",
  authRoutes
);


// User / Employee Management
app.use(
  "/api/users",
  userRoutes
);


// =========================================================
// PUBLIC + PROTECTED CONTENT APIs
// =========================================================

app.use(
  "/api/company",
  companyRoutes
);

app.use(
  "/api/hero",
  heroRoutes
);

app.use(
  "/api/about",
  aboutRoutes
);

app.use(
  "/api/services",
  serviceRoutes
);

app.use(
  "/api/categories",
  categoryRoutes
);

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/vehicles",
  vehicleRoutes
);

app.use(
  "/api/advantages",
  advantageRoutes
);

app.use(
  "/api/faqs",
  faqRoutes
);

app.use(
  "/api/gallery",
  galleryRoutes
);

app.use(
  "/api/social-links",
  socialRoutes
);


// Contact
app.use(
  "/api/contact",
  contactRoutes
);


// Dashboard
app.use(
  "/api/dashboard",
  dashboardRoutes
);


// =========================================================
// API 404 HANDLER
// =========================================================

// If someone requests an API endpoint that doesn't exist,
// return JSON instead of an HTML error page.
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});


// =========================================================
// ROOT TEST ROUTE
// =========================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AUTO MOTORS SARL API is running",
  });
});


// =========================================================
// GLOBAL ERROR HANDLER
// =========================================================

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  // CORS errors
  if (err.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Request origin not allowed.",
    });
  }

  // Rate-limit errors
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  }

  // Do not expose internal error details to clients.
  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});


// =========================================================
// START SERVER
// =========================================================

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});