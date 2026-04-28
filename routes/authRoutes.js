const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");

// Views
router.get("/", (req, res) => {
  res.render("auth/landing");
});
router.get("/register", (req, res) => res.render("auth/register"));
router.get("/login", (req, res) => res.render("auth/login"));
router.get("/admin/login", (req, res) => res.render("auth/adminLogin"));

// Actions
router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/admin/login", auth.adminLogin);
router.get("/logout", auth.logout);

module.exports = router;