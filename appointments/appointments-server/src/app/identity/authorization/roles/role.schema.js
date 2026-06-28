const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [false, "La empresa es obligatoria."],
    },
    name: {
      type: String,
      required: [true, "El nombre es obligatorio."],
      unique: true,
    },
    description: String,
    permissions: {
      type: Map,
      of: [String],
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "roles",
    strict: "throw",
  },
);

module.exports = mongoose.model("Role", RoleSchema);
