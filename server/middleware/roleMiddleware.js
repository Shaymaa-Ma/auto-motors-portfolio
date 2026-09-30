/*
JWT
 ↓
authMiddleware
 ↓
req.admin
 ↓
requireSuperAdmin
 ↓
role === super_admin
*/

// Allow only authenticated Main Administrators (super_admin)
// to access routes that manage administrator accounts or
// other actions reserved for the highest admin role.

const requireSuperAdmin = (req, res, next) => {

  // Authentication middleware should always run before this
  // middleware. If req.admin does not exist, the user is not
  // authenticated.

  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }


  // Only the Main Administrator can manage administrator
  // accounts and other super-admin-only operations.

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