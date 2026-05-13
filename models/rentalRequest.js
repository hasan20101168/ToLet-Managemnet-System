const mongoose = require("mongoose");

const rentalRequestSchema = new mongoose.Schema({
  rental: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rental",
    required: true
  },

  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  message: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  "RentalRequest",
  rentalRequestSchema
);