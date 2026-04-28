// Check login
exports.isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

// Owner only
exports.isOwner = (req, res, next) => {
  if (req.session.user.role !== "owner") {
    return res.send("Access denied");
  }
  next();
};

// Admin only
exports.isAdmin = (req, res, next) => {
  if (req.session.user.role !== "admin") {
    return res.send("Admin only");
  }
  next();
};