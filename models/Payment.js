const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
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

    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rental",
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    month: {
      type: Number,
      required: true
    },

    year: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["paid", "pending"],
      default: "paid"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);