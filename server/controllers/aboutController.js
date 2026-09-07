const db = require("../config/db");

// GET ABOUT
const getAbout = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM about ORDER BY id ASC LIMIT 1"
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "About content not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Get About Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch about content",
    });
  }
};

module.exports = {
  getAbout,
};