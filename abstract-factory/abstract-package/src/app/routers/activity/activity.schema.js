const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [false, "La empresa es obligatoria."],
    },
    type: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    summary: String,
    description: String,
  },
  {
    timestamps: true,
    collection: "activities",
    strict: "throw",
  },
);

module.exports = mongoose.model("Activity", ActivitySchema);
