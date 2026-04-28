const express = require("express");
const router = express.Router();
const rentalController = require("../controllers/rentalController");

const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });

// 🔐 Auth middleware
const { isLoggedIn, isOwner } = require("../middleware/auth");


// ========== API ROUTES ==========
router.post("/api", upload.single("image"), rentalController.createRental);
router.get("/api", rentalController.getAllRentals);
router.get("/api/:id", rentalController.getRentalById);
router.put("/api/:id", upload.single("image"), rentalController.updateRental);
router.delete("/api/:id", rentalController.deleteRental);


// ========== VIEW ROUTES ==========

// Public
router.get("/", rentalController.renderAllRentals);
router.get("/:id", rentalController.renderSingleRental);

// Protected (Owner only)
router.get("/new", isLoggedIn, isOwner, rentalController.renderCreateForm);

router.post(
  "/", 
  isLoggedIn, 
  isOwner, 
  upload.single("image"), 
  rentalController.createRentalView
);

router.get("/:id/edit", isLoggedIn, isOwner, rentalController.renderEditForm);

router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.single("image"),
  rentalController.updateRentalView
);

router.delete("/:id", isLoggedIn, isOwner, rentalController.deleteRentalView);

module.exports = router;