import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
  {
    title: { type: String, required: true, index: true, trim: true },
    description: { type: String, required: true },
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    freelancerId: { type: Schema.Types.ObjectId, ref: "User", required: false, index: true },
    status: { 
      type: String, 
      default: "open", 
      enum: ["open", "in_progress", "completed", "cancelled", "disputed"],
      index: true 
    },
    budget: { type: Number, required: true, min: 0 },
    category: { type: String, default: "General" },
    tags: { type: [String], default: [] },
    escrow: {
      razorpayOrderId: { type: String },
      amount: { type: Number },
      status: { type: String, default: "pending" },
      locked: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);
