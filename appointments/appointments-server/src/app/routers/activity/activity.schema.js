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
      required: [true, "El usuario es obligatorio."],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    summary: {
      type: String,
      required: [true, "El resumen es obligatorio."],
    },
    description: String,
    total: {
      type: Number,
      required: [true, "El total es obligatorio."],
      min: [0, "El total debe ser mayor o igual a 0."],
    },
  },
  {
    timestamps: true,
    collection: "activities",
    strict: "throw",
  },
);

module.exports = mongoose.model("Activity", ActivitySchema);
