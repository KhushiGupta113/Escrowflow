import mongoose, { Schema } from "mongoose";
import { UserRole, MilestoneStatus } from "./types";

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  rating?: number;
  isVerified: boolean;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ["client", "freelancer", "admin"] },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    rating: { type: Number, default: 5 },
    isVerified: { type: Boolean, default: false }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        delete ret.passwordHash;
        return ret;
      }
    }
  }
);

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
    tags: { type: [String], default: [] }
  },
  { timestamps: true }
);

const milestoneSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: false },
    status: { 
      type: String, 
      default: "draft", 
      enum: ["draft", "funded", "in_progress", "submitted", "approved", "released", "disputed"],
      index: true 
    },
    submissionUrl: { type: String, required: false },
    feedback: { type: String, required: false }
  },
  { timestamps: true }
);

const paymentSchema = new Schema(
  {
    milestoneId: { type: Schema.Types.ObjectId, ref: "Milestone", required: true, index: true },
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
    resolution: { type: String, required: false }
  },
  { timestamps: true }
);

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: false },
    message: { type: String, required: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const auditSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    entity: { type: String, required: true },
    entityId: { type: String, required: true },
    action: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, required: false }
  },
  { timestamps: true }
);

const otpSchema = new Schema(
  {
    email: { type: String, required: true, index: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    type: { type: String, enum: ["signup", "forgot_password"], required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
export const Project = mongoose.model("Project", projectSchema);
export const Milestone = mongoose.model("Milestone", milestoneSchema);
export const Payment = mongoose.model("Payment", paymentSchema);
export const Dispute = mongoose.model("Dispute", disputeSchema);
export const Notification = mongoose.model("Notification", notificationSchema);
export const AuditLog = mongoose.model("AuditLog", auditSchema);
export const Otp = mongoose.model("Otp", otpSchema);
