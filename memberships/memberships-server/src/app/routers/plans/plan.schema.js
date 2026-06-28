const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [false, "La empresa es obligatoria."],
    },
    name: {
      type: String,
      required: [true, "El nombre es obligatorio."],
    },
    description: String,
    features: [String],
    duration: {
      type: Number,
      default: 1,
      min: [0, "El duration debe ser mayor o igual a 0."],
    },
    price: {
      type: Number,
      required: [true, "El precio es obligatorio."],
      min: [0, "El precio debe ser mayor o igual a 0."],
    },
    currency: {
      type: String,
      default: "PEN",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "plans",
    strict: "throw",
  },
);

PlanSchema.index({ company: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Plan", PlanSchema);
