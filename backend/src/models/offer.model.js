import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    offeredPrice: { type: Number, required: true, min: 0.01 },
    quantity: { type: Number, required: true, min: 1 },
    message: { type: String, trim: true, maxlength: 500, default: "" },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    customerSeen: { type: Boolean, default: false },
    vendorSeen: { type: Boolean, default: false },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

offerSchema.index({ vendor: 1, status: 1, createdAt: -1 });
offerSchema.index({ customer: 1, createdAt: -1 });

export const Offer = mongoose.model("Offer", offerSchema);
