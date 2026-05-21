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
router.get(
  "/owner/dashboard",
  isLoggedIn,
  isOwner,
  rentalController.ownerDashboard
);

router.get(
  "/owner/properties",
  isLoggedIn,
  isOwner,
  rentalController.ownerProperties
);

// ================= TENANT REQUESTS =================

// OWNER REQUEST PAGE
router.get(
  "/owner/tenants",
  isLoggedIn,
  isOwner,
  rentalController.ownerTenantsPage
);

// SEND RENTAL REQUEST
router.post(
  "/requests/send/:id",
  isLoggedIn,
  rentalController.sendRentalRequest
);

// APPROVE REQUEST
router.post(
  "/requests/:id/approve",
  isLoggedIn,
  isOwner,
  rentalController.approveRentalRequest
);

// REJECT REQUEST
router.post(
  "/requests/:id/reject",
  isLoggedIn,
  isOwner,
  rentalController.rejectRentalRequest
);


// ================= PUBLIC VIEW ROUTES =================

// All rentals
router.get("/", rentalController.renderAllRentals);


// ================= OWNER PROTECTED ROUTES =================

// Create
router.get(
  "/new",
  isLoggedIn,
  isOwner,
  rentalController.renderCreateForm
);

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

// TENANT DASHBOARD
router.get(
  "/tenant/dashboard",
  isLoggedIn,
  rentalController.tenantDashboard
);

// SEND MAINTENANCE REQUEST
router.post(
  "/tenant/maintenance/:id",
  isLoggedIn,
  rentalController.sendMaintenanceRequest
);

// PAY RENT
router.post(
  "/tenant/pay/:id",
  isLoggedIn,
  rentalController.payRent
);

// OWNER FINANCE PAGE
router.get(
  "/owner/finance",
  isLoggedIn,
  isOwner,
  rentalController.ownerFinancePage
);

// ================= SINGLE VIEW =================
router.get("/:id", rentalController.renderSingleRental);

module.exports = router;