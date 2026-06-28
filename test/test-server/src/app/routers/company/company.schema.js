const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El usuario es obligatorio."],
    },
    slug: {
      type: String,
      required: [true, "El slug es obligatorio."],
    },
    document: String,
    number: String,
    names: String,
    phone: String,
    email: String,
    schedule: {
      monday: {
        isOpen: { type: Boolean, default: true },
        start: { type: String, default: "09:00" },
        end: { type: String, default: "18:00" },
      },
      tuesday: {
        isOpen: { type: Boolean, default: true },
        start: { type: String, default: "09:00" },
        end: { type: String, default: "18:00" },
      },
      wednesday: {
        isOpen: { type: Boolean, default: true },
        start: { type: String, default: "09:00" },
        end: { type: String, default: "18:00" },
      },
      thursday: {
        isOpen: { type: Boolean, default: true },
        start: { type: String, default: "09:00" },
        end: { type: String, default: "18:00" },
      },
      friday: {
        isOpen: { type: Boolean, default: true },
        start: { type: String, default: "09:00" },
        end: { type: String, default: "18:00" },
      },
      saturday: {
        isOpen: { type: Boolean, default: true },
        start: { type: String, default: "09:00" },
        end: { type: String, default: "18:00" },
      },
      sunday: {
        isOpen: { type: Boolean, default: true },
        start: { type: String, default: "09:00" },
        end: { type: String, default: "18:00" },
      },
    },
    closedDates: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "customers",
    strict: "throw",
  },
);

CompanySchema.index({ company: 1, number: 1 }, { unique: true, sparse: true });
CompanySchema.index({ company: 1, phone: 1 }, { unique: true, sparse: true });
CompanySchema.index({ company: 1, email: 1 }, { unique: true, sparse: true });
CompanySchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model("Customer", CompanySchema);
