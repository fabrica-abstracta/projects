const mongoose = require("mongoose");

const MembershipSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [false, "La empresa es obligatoria."],
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: [true, "El plan es obligatorio."],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "El cliente es obligatorio."],
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
    start: {
      type: Date,
      default: Date.now,
    },
    end: {
      type: Date,
      required: [true, "La fecha de fin es obligatoria."],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "memberships",
    strict: "throw",
  },
);

module.exports = mongoose.model("Membership", MembershipSchema);
