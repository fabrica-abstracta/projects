const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [false, "La empresa es obligatoria."],
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "El paciente es obligatorio."],
    },
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El professional es obligatorio."],
    },
    description: String,
    diagnosis: String,
    treatment: String,
    observations: String,
    archives: [
      {
        archive: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Archive",
          required: [true, "El archives es obligatorio."],
        },
        description: String,
      },
    ],
    status: {
      type: String,
      enum: {
        values: ["draft", "completed", "voided"],
        message: "El estado no es válido.",
      },
      default: "draft",
    },
  },
  {
    timestamps: true,
    collection: "histories",
    strict: "throw",
  },
);

module.exports = mongoose.model("History", HistorySchema);
