const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  rentPrice: {
    type: Number,
    required: true,
  },
  beds: Number,
  baths: Number,
  dining: Number,
  drawing: Number,
  porch: Number,
  squareFeet: Number,
  description: String,
  image: {
    url: String,
    filename: String,
  },
  availableFrom: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model("Rental", rentalSchema);