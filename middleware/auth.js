// ================= MUST BE LOGGED IN =================
exports.isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};


// ================= ROLE CHECKS =================
exports.isOwner = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "owner") {
    return res.status(403).send("Access denied (Owner only)");
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).send("Admin only");
  }
  next();
};


// ================= OWNER OF RENTAL =================
exports.isOwnerOfRental = async (req, res, next) => {
  try {
    const Rental = require("../models/Rental");
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).send("Rental not found");
    }

    if (!req.session.user || !rental.owner.equals(req.session.user._id)) {
      return res.status(403).send("You do not own this post");
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};


// ================= REDIRECT IF ALREADY LOGGED IN =================
exports.redirectIfLoggedIn = (req, res, next) => {
  if (req.session.user) {
    const role = req.session.user.role;

    // 🔥 Role-based redirect (IMPORTANT FIX)
    if (role === "owner") {
      return res.redirect("/rentals/owner/dashboard");
    }

    if (role === "tenant") {
      return res.redirect("/rentals");
    }

    if (role === "admin") {
      return res.redirect("/admin/dashboard");
    }

    return res.redirect("/rentals");
  }

  next();
};