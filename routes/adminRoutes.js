const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isLoggedIn, isAdmin } = require("../middleware/auth");

router.get("/admin/dashboard", isLoggedIn, isAdmin, adminController.adminDashboard);

module.exports = router;