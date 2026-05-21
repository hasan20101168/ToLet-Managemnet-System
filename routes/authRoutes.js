const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");

// 🔐 Middleware
const { isLoggedIn, redirectIfLoggedIn } = require("../middleware/auth");


// ================= VIEWS =================

// Landing page
router.get("/", (req, res) => {
  res.render("auth/landing");
});

// Auth pages (block if already logged in)
router.get("/register", redirectIfLoggedIn, (req, res) => {
  res.render("auth/register");
});

router.get("/login", redirectIfLoggedIn, (req, res) => {
  res.render("auth/login");
});

router.get("/admin/login", redirectIfLoggedIn, (req, res) => {
  res.render("auth/adminLogin");
});


// ================= ACTIONS =================

// Register
router.post("/register", auth.register);

// Login
router.post("/login", auth.login);

// Admin login
router.post("/admin/login", auth.adminLogin);

// Logout (POST - correct)
router.post("/logout", isLoggedIn, auth.logout);


module.exports = router;