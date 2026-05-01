const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema(
  {
    user: {
      // transporter
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bid", bidSchema);

