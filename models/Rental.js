const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema({
  name: String,
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
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
  tenant: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
},

  // 🔥 OWNER LINK
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Rental", rentalSchema);