import mongoose, { Schema } from "mongoose";

const escrowSchema = new Schema(
  {
    milestoneId: { type: Schema.Types.ObjectId, ref: "Milestone", required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    payerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    payeeId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    razorpayOrderId: { type: String, required: false, index: true },
    razorpayPaymentId: { type: String, required: false, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    status: { 
      type: String, 
      required: true, 
      enum: ["initiated", "verified", "failed", "released", "refunded", "withdrawn"],
      index: true 
    }
  },
  { timestamps: true }
);

export const Escrow = mongoose.model("Escrow", escrowSchema);
// Also export Payment pointing to Escrow for backwards compatibility during refactor if needed
export const Payment = Escrow;
