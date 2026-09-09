const pool = require("../config/db");

/* =========================================================
   GET DASHBOARD STATISTICS
========================================================= */

const getDashboardStats = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        (SELECT COUNT(*) FROM products) AS products,
        (SELECT COUNT(*) FROM vehicles) AS vehicles,
        (SELECT COUNT(*) FROM services) AS services,
        (SELECT COUNT(*) FROM gallery) AS gallery,
        (SELECT COUNT(*) FROM product_categories) AS categories,
        (SELECT COUNT(*) FROM faqs) AS faqs,
        (SELECT COUNT(*) FROM advantages) AS advantages
    `);

    const stats = rows[0];

    return res.status(200).json({
      success: true,

      stats: {
        products: Number(stats.products),
        vehicles: Number(stats.vehicles),
        services: Number(stats.services),
        gallery: Number(stats.gallery),
        categories: Number(stats.categories),
        faqs: Number(stats.faqs),
        advantages: Number(stats.advantages),
      },
    });

  } catch (error) {

    console.error(
      "========================================"
    );

    console.error(
      "Dashboard statistics error:"
    );

    console.error(
      error
    );

    console.error(
      "========================================"
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve dashboard statistics.",

      // Development only
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

module.exports = {
  getDashboardStats,
};