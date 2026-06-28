const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [false, "La empresa es obligatoria."],
    },
    name: {
      type: String,
      required: [true, "El nombre del servicio es obligatorio."],
      trim: true,
    },
    description: String,
    price: {
      type: Number,
      required: [true, "El precio es obligatorio."],
      min: [0, "El precio no puede ser negativo."],
    },
    duration: {
      type: Number,
      default: 30,
      min: [1, "La duración debe ser de al menos 1 minuto."],
    },
    icon: String,
    color: String,
  },
  {
    timestamps: true,
    collection: "services",
    strict: "throw",
  },
);

ServiceSchema.index({ company: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Service", ServiceSchema);
