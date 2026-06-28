const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: [true, "El subscription es obligatorio."],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El usuario es obligatorio."],
    },
    amount: {
      type: Number,
      required: [true, "El importe es obligatorio."],
    },
    method: {
      type: String,
      required: [true, "El method es obligatorio."],
    },
    status: {
      type: String,
      required: [true, "El estado es obligatorio."],
      enum: {
        values: ["pending", "completed", "failed", "refunded"],
        message: "El estado no es válido.",
      },
      default: "pending",
    },
    transaction: {
      type: String,
      required: [true, "El transaction es obligatorio."],
      unique: true,
    },
    evidence: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evidence",
      required: [true, "El subscription es obligatorio."],
    },
  },
  {
    timestamps: true,
    collection: "payments",
    strict: "throw",
  },
);

module.exports = mongoose.model("Payment", PaymentSchema);
