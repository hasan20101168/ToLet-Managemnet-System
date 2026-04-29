const express = require("express");
const router = express.Router();
const rentalController = require("../controllers/rentalController");

const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });

// 🔐 Auth middleware
const { isLoggedIn, isOwner, isOwnerOfRental } = require("../middleware/auth");


// ================= API ROUTES =================
router.post("/api", upload.single("image"), rentalController.createRental);
router.get("/api", rentalController.getAllRentals);
router.get("/api/:id", rentalController.getRentalById);
router.put("/api/:id", upload.single("image"), rentalController.updateRental);
router.delete("/api/:id", rentalController.deleteRental);


// ================= DASHBOARD =================
router.get("/owner/dashboard", isLoggedIn, isOwner, rentalController.ownerDashboard);


// ================= PUBLIC VIEW ROUTES =================

// All rentals
router.get("/", rentalController.renderAllRentals);


// ================= OWNER PROTECTED ROUTES =================

// 🔥 IMPORTANT: static routes BEFORE dynamic

// Create
router.get("/new", isLoggedIn, isOwner, rentalController.renderCreateForm);

router.post(
  "/",
  isLoggedIn,
  isOwner,
  upload.single("image"),
  rentalController.createRentalView
);

// Edit
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  isOwnerOfRental,
  rentalController.renderEditForm
);

// Update
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  isOwnerOfRental,
  upload.single("image"),
  rentalController.updateRentalView
);

// Delete
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  isOwnerOfRental,
  rentalController.deleteRentalView
);


// ================= SINGLE VIEW (MUST BE LAST) =================
router.get("/:id", rentalController.renderSingleRental);


module.exports = router;