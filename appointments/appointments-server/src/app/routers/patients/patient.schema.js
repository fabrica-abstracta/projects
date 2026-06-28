const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [false, "La empresa es obligatoria."],
    },
    number: {
      type: String,
      required: [true, "El número de documento es obligatorio."],
    },
    names: {
      type: String,
      required: [true, "Los nombres y apellidos son obligatorios."],
    },
    birthdate: Date,
    gender: String,
    phone: String,
    relationship: String,
    healthcare: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    lastVisit: Date,
  },
  {
    timestamps: true,
    collection: "patients",
    strict: "throw",
  },
);

PatientSchema.index({ company: 1, number: 1 }, { unique: true });
PatientSchema.index({ company: 1, phone: 1 }, { unique: true, sparse: true });
PatientSchema.index({ company: 1, email: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Patient", PatientSchema);
