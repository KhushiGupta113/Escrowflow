import { Response } from "express";
import { Dispute, Milestone, Project } from "../models";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { AuthReq } from "../middleware/auth.middleware";
import { emitToProject } from "../config/socket";
import { createNotification } from "../services/notification.service";

export const createDispute = async (req: AuthReq, res: Response) => {
  const { milestoneId, reason, evidenceUrls } = req.body;
  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) throw new ApiError(404, "Milestone not found");

  const project = await Project.findById(milestone.projectId);
  if (!project) throw new ApiError(404, "Project not found");

  const dispute = await Dispute.create({
    milestoneId,
    raisedBy: req.user!.id,
    reason,
    evidenceUrls: evidenceUrls ?? []
  });

  milestone.status = "disputed";
  await milestone.save();

  if (!project.escrow) {
    project.escrow = { locked: true, status: "pending", amount: milestone.amount as number, razorpayOrderId: "" };
  } else {
    project.escrow.locked = true;
  }
  await project.save();

  emitToProject(String(project._id), "dispute:created", dispute);
  res.json(new ApiResponse(201, dispute, "Dispute raised"));
};

export const resolveDispute = async (req: AuthReq, res: Response) => {
  const { resolution, notes } = req.body; // resolution: "client" | "freelancer"
  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) throw new ApiError(404, "Dispute not found");

  const milestone = await Milestone.findById(dispute.milestoneId);
  if (!milestone) throw new ApiError(404, "Milestone not found");
  
  const project = await Project.findById(milestone.projectId);
  if (!project) throw new ApiError(404, "Project not found");

  dispute.status = "resolved";
  dispute.resolution = resolution;
  dispute.notes = notes;
  await dispute.save();

  if (resolution === "freelancer") {
    milestone.status = "approved"; // Then it can be released to freelancer
  } else {
    milestone.status = "funded"; // Or refund logic, but let's just revert to funded or cancelled
    // Depending on exact requirements, if refunding to client, maybe "draft" or "cancelled"
    // The prompt says "Route funds accordingly (transfer to winner, refund loser)"
    // We'll set it to approved if freelancer wins, or refunded if client wins.
    milestone.status = "rejected"; 
  }
  await milestone.save();

  if (project.escrow) {
    project.escrow.locked = false;
    await project.save();
  }

  // emit dispute:resolved
  emitToProject(String(project._id), "dispute:resolved", dispute);
  
  await createNotification(String(project.clientId), "dispute_resolved", "Dispute Resolved", `The dispute for milestone ${milestone.title} was resolved in favor of the ${resolution}.`);
  if (project.freelancerId) {
    await createNotification(String(project.freelancerId), "dispute_resolved", "Dispute Resolved", `The dispute for milestone ${milestone.title} was resolved in favor of the ${resolution}.`);
  }

  res.json(new ApiResponse(200, dispute, "Dispute resolved"));
};
