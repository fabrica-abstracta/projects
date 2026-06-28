const mongoose = require("mongoose");

const RecoverySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    expires: {
      type: Date,
      required: true,
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
