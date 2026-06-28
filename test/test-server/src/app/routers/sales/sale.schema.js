const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [false, "La empresa es obligatoria."],
    },
    type: {
      type: String,
      required: [true, "El tipo es obligatorio."],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    description: String,
    products: [
      {
        sku: {
          type: String,
          required: [true, "El products es obligatorio."],
        },
        name: {
          type: String,
          required: [true, "El products es obligatorio."],
        },
        description: String,
        category: String,
        brand: String,
        price: {
          type: Number,
          required: [true, "El precio es obligatorio."],
          min: [0, "El products no puede ser negativo."],
        },
        quantity: {
          type: Number,
          required: [true, "La cantidad es obligatorio."],
          min: [0, "La cantidad debe ser mayor o igual a 0."],
        },
        subtotal: {
          type: Number,
          required: [true, "El subtotal es obligatorio."],
          min: [0, "El subtotal debe ser mayor o igual a 0."],
        },
      },
    ],
    total: {
      type: Number,
      required: [true, "El total es obligatorio."],
      min: [0, "El total no puede ser negativo."],
    },
    method: String,
    reference: {
      type: String,
      required: [true, "La referencia es obligatoria."],
    },
    evidence: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evidence",
      required: [true, "El evidencia es obligatorio."],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "sales",
    strict: "throw",
  },
);

module.exports = mongoose.model("Sale", SaleSchema);
