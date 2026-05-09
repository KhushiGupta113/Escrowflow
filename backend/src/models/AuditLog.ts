import mongoose, { Schema } from "mongoose";

const auditLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    entity: { type: String, required: true },
    entityId: { type: String, required: true },
    action: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, required: false }
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
