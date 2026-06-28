const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El usuario es obligatorio."],
    },
    device: String,
    ip: String,
    expires: {
      type: Date,
      required: [true, "El expiración es obligatorio."],
      default: () => new Date(Date.now() + 15 * 60 * 1000),
    },
  },
  {
    timestamps: true,
    collection: "sessions",
    strict: "throw",
  },
);

SessionSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Session", SessionSchema);
