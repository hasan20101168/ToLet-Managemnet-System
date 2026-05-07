const Rental = require("../models/Rental");
const { cloudinary } = require("../config/cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const mongoose = require("mongoose");


// ================= HELPER =================
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);


// ================= API METHODS =================

// CREATE (API)
exports.createRental = async (req, res) => {
  try {
    const rental = new Rental(req.body);

    if (req.session.user) {
      rental.owner = req.session.user._id;
    }

    if (req.file) {
      rental.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    const saved = await rental.save();
    res.status(201).json(saved);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// READ ALL (API)
exports.getAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate("owner", "name email")
      .lean();

    res.json(rentals);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// READ ONE (API)
exports.getRentalById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const rental = await Rental.findById(id)
      .populate("owner", "name email");

    if (!rental) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(rental);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// UPDATE (API)
exports.updateRental = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const rental = await Rental.findById(id);
    if (!rental) return res.status(404).json({ message: "Not found" });

    Object.assign(rental, req.body);

    if (req.file) {
      if (rental.image?.filename) {
        await cloudinary.uploader.destroy(rental.image.filename);
      }

      rental.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    await rental.save();
    res.json(rental);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// DELETE (API)
exports.deleteRental = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const rental = await Rental.findById(id);
    if (!rental) return res.status(404).json({ message: "Not found" });

    if (rental.image?.filename) {
      await cloudinary.uploader.destroy(rental.image.filename);
    }

    await rental.deleteOne();

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ================= VIEW METHODS =================

// ALL RENTALS (Tenant view)
exports.renderAllRentals = async (req, res) => {
  try {
    const { search, minPrice, maxPrice, beds, availableFrom, page = 1 } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      query.rentPrice = {};
      if (minPrice) query.rentPrice.$gte = Number(minPrice);
      if (maxPrice) query.rentPrice.$lte = Number(maxPrice);
    }

    if (beds) query.beds = { $gte: Number(beds) };

    if (availableFrom) {
      query.availableFrom = { $gte: new Date(availableFrom) };
    }

    const limit = 8;
    const skip = (page - 1) * limit;

    const total = await Rental.countDocuments(query);

    const rentals = await Rental.find(query)
      .populate("owner", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    res.render("rentPost/index", {
      rentals,
      filters: req.query,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading rentals");
  }
};


// OWNER DASHBOARD
exports.ownerDashboard = async (req, res) => {
  try {

    const { search, sort } = req.query;

    let query = {
      owner: req.session.user._id
    };

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } }
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };

    if (sort === "priceLow") {
      sortOption = { rentPrice: 1 };
    }

    if (sort === "priceHigh") {
      sortOption = { rentPrice: -1 };
    }

    if (sort === "latest") {
      sortOption = { createdAt: -1 };
    }

    const rentals = await Rental.find(query)
      .sort(sortOption)
      .lean();

    // ================= ANALYTICS =================

    const totalProperties = rentals.length;

    const totalRentValue = rentals.reduce(
      (sum, r) => sum + (r.rentPrice || 0),
      0
    );

    const averageRent =
      totalProperties > 0
        ? Math.round(totalRentValue / totalProperties)
        : 0;

    const availableProperties = rentals.filter(
      r => new Date(r.availableFrom) <= new Date()
    ).length;

    res.render("dashboard/owner", {
      rentals,
      analytics: {
        totalProperties,
        totalRentValue,
        averageRent,
        availableProperties
      },
      filters: req.query
    });

  } catch (err) {
    console.error(err);
    res.send("Error loading dashboard");
  }
};


// CREATE FORM
exports.renderCreateForm = (req, res) => {
  res.render("rentPost/create");
};


// CREATE (VIEW)
exports.createRentalView = async (req, res) => {
  try {
    const geoData = await geocoder.forwardGeocode({
      query: req.body.address,
      limit: 1
    }).send()
    const rental = new Rental(req.body);
    rental.geometry = geoData.body.features[0].geometry;

    rental.owner = req.session.user._id;

    if (req.file) {
      rental.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }

    await rental.save();
    // console.log(rental);

    res.redirect("/rentals/owner/dashboard");

  } catch (err) {
    console.error(err);
    res.send("Error creating rental");
  }
};


// SINGLE RENTAL VIEW (🔥 FIXED)
exports.renderSingleRental = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).send("Invalid rental ID");
    }

    const rental = await Rental.findById(id)
      .populate("owner", "name");

    if (!rental) return res.send("Rental not found");

    res.render("rentPost/show", { rental });

  } catch (err) {
    console.error(err);
    res.send("Error loading rental");
  }
};


// EDIT FORM
exports.renderEditForm = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) return res.send("Invalid ID");

  const rental = await Rental.findById(id);
  res.render("rentPost/edit", { rental });
};


// UPDATE (VIEW)
exports.updateRentalView = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) return res.send("Invalid ID");

    const rental = await Rental.findById(id);

    Object.assign(rental, req.body);

    if (req.file) {
      if (rental.image?.filename) {
        await cloudinary.uploader.destroy(rental.image.filename);
      }

      rental.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    await rental.save();

    res.redirect(`/rentals/${rental._id}`);

  } catch (err) {
    console.error(err);
    res.send("Update failed");
  }
};


// DELETE (VIEW)
exports.deleteRentalView = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) return res.send("Invalid ID");

    const rental = await Rental.findById(id);

    if (rental.image?.filename) {
      await cloudinary.uploader.destroy(rental.image.filename);
    }

    await rental.deleteOne();

    res.redirect("/rentals");

  } catch (err) {
    console.error(err);
    res.send("Delete failed");
  }
};