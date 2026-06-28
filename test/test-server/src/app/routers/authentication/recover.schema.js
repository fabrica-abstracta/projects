const mongoose = require("mongoose");

const RecoverySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El usuario es obligatorio."],
    },
    code: {
      type: String,
      required: [true, "El código es obligatorio."],
    },
    expires: {
      type: Date,
      required: [true, "El expiración es obligatorio."],
      default: () => new Date(Date.now() + 15 * 60 * 1000),
    },
  },
  {
    timestamps: true,
    collection: "recoveries",
    strict: "throw",
  },
);

RecoverySchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Recovery", RecoverySchema);
