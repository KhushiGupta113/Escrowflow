import mongoose, { Schema } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    token: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
