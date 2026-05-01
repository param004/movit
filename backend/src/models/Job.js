const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromCity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    fromAddress: {
      type: String,
      required: true,
    },
    toCity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    toAddress: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    transportDate: {
      type: Date,
      required: true,
    },
    isCanceled: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);

