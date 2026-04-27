const Rental = require("../models/Rental");
const { cloudinary } = require("../config/cloudinary");


// ================= API METHODS =================

// CREATE (API)
exports.createRental = async (req, res) => {
  try {
    const rental = new Rental(req.body);

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
    const rentals = await Rental.find();
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ ONE (API)
exports.getRentalById = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    res.json(rental);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE (API)
exports.updateRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    Object.assign(rental, req.body);

    if (req.file) {
      // 🔥 delete old image
      if (rental.image && rental.image.filename) {
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
    const rental = await Rental.findById(req.params.id);

    // 🔥 delete image from cloudinary
    if (rental.image && rental.image.filename) {
      await cloudinary.uploader.destroy(rental.image.filename);
    }

    await Rental.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ================= VIEW METHODS =================

// Show all rentals
exports.renderAllRentals = async (req, res) => {
  try {
    const { search, minPrice, maxPrice, beds, availableFrom, page = 1 } = req.query;

    let query = {};

    // 🔍 Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    // 💰 Price
    if (minPrice || maxPrice) {
      query.rentPrice = {};
      if (minPrice) query.rentPrice.$gte = Number(minPrice);
      if (maxPrice) query.rentPrice.$lte = Number(maxPrice);
    }

    // 🛏 Beds
    if (beds) {
      query.beds = { $gte: Number(beds) };
    }

    // 📅 Available
    if (availableFrom) {
      query.availableFrom = { $gte: new Date(availableFrom) };
    }

    // 🔢 Pagination
    const limit = 8; // items per page
    const skip = (page - 1) * limit;

    const total = await Rental.countDocuments(query);

    const rentals = await Rental.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

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

// Show create form
exports.renderCreateForm = (req, res) => {
  res.render("rentPost/create");
};

// CREATE (VIEW)
exports.createRentalView = async (req, res) => {
  const rental = new Rental(req.body);

  if (req.file) {
    rental.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await rental.save();
  res.redirect("/rentals");
};

// Show single rental
exports.renderSingleRental = async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  res.render("rentPost/show", { rental });
};

// Show edit form
exports.renderEditForm = async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  res.render("rentPost/edit", { rental });
};

// UPDATE (VIEW)
exports.updateRentalView = async (req, res) => {
  const rental = await Rental.findById(req.params.id);

  Object.assign(rental, req.body);

  if (req.file) {
    // 🔥 delete old image
    if (rental.image && rental.image.filename) {
      await cloudinary.uploader.destroy(rental.image.filename);
    }

    rental.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await rental.save();
  res.redirect(`/rentals/${rental._id}`);
};

// DELETE (VIEW)
exports.deleteRentalView = async (req, res) => {
  const rental = await Rental.findById(req.params.id);

  // 🔥 delete image
  if (rental.image && rental.image.filename) {
    await cloudinary.uploader.destroy(rental.image.filename);
  }

  await Rental.findByIdAndDelete(req.params.id);

  res.redirect("/rentals");
};