const express = require("express");
const router = express.Router();
const rentalController = require("../controllers/rentalController");

const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });


// ========== API ROUTES ==========
router.post("/api", upload.single("image"), rentalController.createRental);
router.get("/api", rentalController.getAllRentals);
router.get("/api/:id", rentalController.getRentalById);
router.put("/api/:id", upload.single("image"), rentalController.updateRental);
router.delete("/api/:id", rentalController.deleteRental);


// ========== VIEW ROUTES ==========

router.get("/", rentalController.renderAllRentals);

router.get("/new", rentalController.renderCreateForm);

router.post("/", upload.single("image"), rentalController.createRentalView);

router.get("/:id/edit", rentalController.renderEditForm);

router.get("/:id", rentalController.renderSingleRental);

router.put("/:id", upload.single("image"), rentalController.updateRentalView);

router.delete("/:id", rentalController.deleteRentalView);

module.exports = router;