const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [false, "La empresa es obligatoria."],
    },
    type: {
      type: String,
      enum: {
        values: [
          "visit",
          "membership-assistance",
          "product-sale",
          "membership-sale",
        ],
        message: "El tipo de venta no es válido.",
      },
      default: "visit",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    summary: {
      type: String,
      required: true,
    },
    description: String,
    total: {
      type: Number,
      required: [true, "El total es obligatorio."],
      min: [0, "El total debe ser mayor o igual a 0."],
    },
    currency: {
      type: String,
      default: "PEN",
    },
  },
  {
    timestamps: true,
    collection: "activities",
    strict: "throw",
  },
);

module.exports = mongoose.model("Activity", ActivitySchema);
