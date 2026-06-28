const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [false, "La empresa es obligatoria."],
    },
    document: String,
    number: String,
    names: String,
    birthdate: Date,
    gender: String,
    phone: String,
    email: String,
  },
  {
    timestamps: true,
    collection: "customers",
    strict: "throw",
  },
);

CustomerSchema.index({ company: 1, number: 1 }, { unique: true, sparse: true });
CustomerSchema.index({ company: 1, phone: 1 }, { unique: true, sparse: true });
CustomerSchema.index({ company: 1, email: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Customer", CustomerSchema);
