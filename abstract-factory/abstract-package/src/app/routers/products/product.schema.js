const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [false, "La empresa es obligatoria."],
    },
    sku: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    stock: {
      type: Number,
      min: [0, "El precio debe ser mayor o igual a 0."],
      default: 0,
    },
    alert: {
      type: Number,
      min: [0, "El stock mínimo debe ser mayor o igual a 0."],
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "El precio es obligatorio."],
      min: [0, "El precio debe ser mayor o igual a 0."],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "products",
    strict: "throw",
  },
);

ProductSchema.index({ company: 1, sku: 1 }, { unique: true });
ProductSchema.index({ company: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Product", ProductSchema);
