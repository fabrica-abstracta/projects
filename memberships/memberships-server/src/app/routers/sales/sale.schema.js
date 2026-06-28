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
      enum: {
        values: ["assistance", "membership", "sale"],
        message: "El tipo de venta no es válido.",
      },
      default: "assistance",
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
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        description: String,
        category: String,
        brand: String,
        price: {
          type: Number,
          required: [true, "El precio es obligatorio."],
          min: [0, "El precio debe ser mayor o igual a 0."],
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
      min: [0, "El total debe ser mayor o igual a 0."],
    },
    currency: {
      type: String,
      default: "PEN",
    },
    method: {
      type: String,
      enum: {
        values: ["cash", "card", "transfer", "wallet"],
        message: "El método de pago no es válido.",
      },
      default: "cash",
    },
    reference: {
      type: String,
      required: [true, "La referencia es obligatoria."],
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
