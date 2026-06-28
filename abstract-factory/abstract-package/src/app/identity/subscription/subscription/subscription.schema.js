const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [false, "El usuario es obligatorio."],
    },
    plan: {
      name: {
        type: String,
        required: [true, "El plan es obligatorio."],
      },
      description: String,
      price: {
        type: Number,
        required: [true, "El plan es obligatorio."],
      },
      features: [String],
      limits: {
        type: Map,
        of: new mongoose.Schema({
          limit: {
            type: Number,
            required: [true, "El plan es obligatorio."],
          },
          usage: {
            type: Number,
            default: 0,
          },
        }),
        default: {},
      },
    },
    end: {
      type: Date,
      required: [true, "El fin es obligatorio."],
    },
  },
  {
    timestamps: true,
    collection: "subscriptions",
    strict: "throw",
  },
);

module.exports = mongoose.model("Subscription", SubscriptionSchema);
