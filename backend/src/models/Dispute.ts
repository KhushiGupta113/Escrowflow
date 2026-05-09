import mongoose, { Schema } from "mongoose";

const disputeSchema = new Schema(
  {
    milestoneId: { type: Schema.Types.ObjectId, ref: "Milestone", required: true, index: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    evidenceUrls: { type: [String], default: [] },
    status: { 
      type: String, 
      default: "open", 
      enum: ["open", "under_review", "resolved", "dismissed"],
      index: true 
    },
    resolution: { type: String, required: false },
    notes: { type: String, required: false }
  },
  { timestamps: true }
);

export const Dispute = mongoose.model("Dispute", disputeSchema);
