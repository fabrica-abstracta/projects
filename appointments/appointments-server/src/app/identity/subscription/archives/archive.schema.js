const mongoose = require("mongoose");

const ArchiveSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [false, "La empresa es obligatoria."],
    },
    bucket: {
      type: String,
      required: [true, "El bucket es obligatorio."],
    },
    object: {
      type: String,
      required: [true, "El object es obligatorio."],
    },
    name: {
      type: String,
      required: [true, "El nombre es obligatorio."],
    },
    mime: {
      type: String,
      required: [true, "El mime es obligatorio."],
    },
    size: {
      type: Number,
      required: [true, "El size es obligatorio."],
    },
  },
  {
    timestamps: true,
    collection: "archives",
    strict: "throw",
  },
);

module.exports = mongoose.model("Archive", ArchiveSchema);
