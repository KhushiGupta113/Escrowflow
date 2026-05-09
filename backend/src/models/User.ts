import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
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

export const User = mongoose.model("User", userSchema);
