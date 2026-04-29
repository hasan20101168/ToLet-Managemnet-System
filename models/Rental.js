const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema({
  name: String,
  address: String,
  rentPrice: Number,
  beds: Number,
  baths: Number,
  dining: Number,
  drawing: Number,
  porch: Number,
  squareFeet: Number,
  description: String,
  availableFrom: Date,

  image: {
    url: String,
    filename: String
  },

  // 🔥 OWNER LINK
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Rental", rentalSchema);