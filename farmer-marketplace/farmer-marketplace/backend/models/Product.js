const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    unit: { type: String, required: true, default: "kg" },
    pricePerUnit: { type: Number, required: true, min: 0 },
    quantityAvailable: { type: Number, required: true, min: 0 },
    location: { type: String, trim: true },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "sold_out"],
      default: "pending",
    },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text", category: "text" });

module.exports = mongoose.model("Product", productSchema);
