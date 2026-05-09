import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema(
  {
    email: { type: String, required: true, index: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    type: { type: String, enum: ["signup", "forgot_password"], required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }
  },
  { timestamps: true }
);

export const Otp = mongoose.model("Otp", otpSchema);
