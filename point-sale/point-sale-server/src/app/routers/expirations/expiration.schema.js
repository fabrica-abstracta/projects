const mongoose = require("mongoose");

const ExpirationSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [false, "La empresa es obligatoria."],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    description: String,
    expires: {
      type: Date,
      required: [true, "El fecha de expiración es obligatoria."],
    },
  },
  {
    timestamps: true,
    collection: "products",
    strict: "throw",
  },
);

module.exports = mongoose.model("Product", ExpirationSchema);
