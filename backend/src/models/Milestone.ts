import mongoose, { Schema } from "mongoose";

const milestoneSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: false },
    status: { 
      type: String, 
      default: "draft", 
      enum: ["draft", "funded", "in_progress", "submitted", "approved", "rejected", "released", "disputed"],
      index: true 
    },
    submissionUrl: { type: String, required: false },
    evidenceUrl: { type: String, required: false },
    feedback: { type: String, required: false }
  },
  { timestamps: true }
);

export const Milestone = mongoose.model("Milestone", milestoneSchema);
