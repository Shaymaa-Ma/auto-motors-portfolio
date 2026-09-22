// =========================================================
// ROLE MIDDLEWARE
// =========================================================
//
// Restricts specific routes to specific administrator roles.
//
// Roles:
// - super_admin → Main Administrator
// - admin       → Regular Administrator
//
// This middleware must be used AFTER authMiddleware.
//
// =========================================================


const requireSuperAdmin = (req, res, next) => {
  // -------------------------------------------------------
  // Make sure authentication middleware has identified
  // the current administrator.
  // -------------------------------------------------------

  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }


  // -------------------------------------------------------
  // Only the Main Administrator can continue.
  // -------------------------------------------------------

  if (req.admin.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message:
        "You do not have permission to manage administrators.",
    });
  }


  next();
};


module.exports = {
  requireSuperAdmin,
};