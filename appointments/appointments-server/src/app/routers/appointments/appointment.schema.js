const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [false, "La empresa es obligatoria."],
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
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "El service es obligatorio."],
    },
    start: {
      type: Date,
      required: [true, "El fecha de inicio es obligatorio."],
      default: Date.now,
    },
    end: Date,
    price: {
      type: Number,
      required: [true, "El precio es obligatorio."],
      min: [0, "El precio no puede ser negativo."],
    },
    status: {
      type: String,
      enum: {
        values: [
          "pending",
          "confirmed",
          "in-progress",
          "completed",
          "cancelled",
          "no-show",
        ],
        message: "El estado no es válido.",
      },
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "appointments",
    strict: "throw",
  },
);

module.exports = mongoose.model("Appointment", AppointmentSchema);
