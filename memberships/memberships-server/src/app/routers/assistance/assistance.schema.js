const mongoose = require("mongoose");

const AssistanceSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [false, "La empresa es obligatoria."],
    },
    type: {
      type: String,
      enum: {
        values: ["membership", "visit"],
        message: "El tipo no es válido.",
      },
      default: "membership",
    },
    membership: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Membership",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "assistances",
    strict: "throw",
  },
);

module.exports = mongoose.model("Assistance", AssistanceSchema);
