require("dotenv").config(); // 🔥 MUST be at top

const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");

const rentalRoutes = require("./routes/rentalRoutes");

const app = express();

// ================= MIDDLEWARE =================

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Parse JSON
app.use(express.json());

// Method override (PUT, DELETE)
app.use(methodOverride("_method"));

// Static files (CSS, images later)
app.use(express.static(path.join(__dirname, "public")));

// ================= VIEW ENGINE =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ================= DATABASE =================
mongoose.connect("mongodb://127.0.0.1:27017/toletDB")
.then(() => {
  console.log("MongoDB connected");
})
.catch((err) => {
  console.log("DB Error:", err);
});

// ================= ROUTES =================
app.use("/rentals", rentalRoutes);

// Root redirect
app.get("/", (req, res) => {
  res.redirect("/rentals");
});

// ================= SERVER =================
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});