const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [false, "La empresa es obligatoria."],
    },
    description: String,
    type: {
      type: String,
      enum: {
        values: ["request", "incident", "query"],
        message: "El tipo no es válido.",
      },
      default: "query",
    },
    archive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Archive",
    },
    response: String,
    support: Date,
    status: {
      type: String,
      enum: {
        values: ["open", "closed"],
        message: "El estado no es válido.",
      },
      default: "open",
    },
  },
  {
    timestamps: true,
    collection: "tickets",
    strict: "throw",
  },
);

module.exports = mongoose.model("Ticket", TicketSchema);
