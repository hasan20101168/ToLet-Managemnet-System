const mongoose = require("mongoose");

const maintenanceRequestSchema = new mongoose.Schema(
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

    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "MaintenanceRequest",
  maintenanceRequestSchema
);