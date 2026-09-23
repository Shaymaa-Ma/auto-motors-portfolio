
// Allow only authenticated Main Administrators (super_admin)
// to access routes that manage administrator accounts or
// other actions reserved for the highest admin role.


const requireSuperAdmin = (req, res, next) => {
 
  // Make sure authentication middleware has identified
  // the current administrator
  
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }



  // Only the Main Administrator can continue
 
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