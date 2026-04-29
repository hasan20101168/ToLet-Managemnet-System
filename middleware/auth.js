// Must be logged in
exports.isLoggedIn = (req, res, next) => {
  if (!req.session.user) return res.redirect("/login");
  next();
};

// Owner only
exports.isOwner = (req, res, next) => {
  if (req.session.user.role !== "owner") {
    return res.send("Access denied (Owner only)");
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

// 🔥 Owner can edit ONLY their post
exports.isOwnerOfRental = async (req, res, next) => {
  const rental = await require("../models/Rental").findById(req.params.id);

  if (!rental.owner.equals(req.session.user._id)) {
    return res.send("You do not own this post");
  }

  next();
};

exports.redirectIfLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/rentals");
  }
  next();
};