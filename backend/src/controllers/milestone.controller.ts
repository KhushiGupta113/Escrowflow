import { Response } from "express";
import { Milestone, Project, User } from "../models";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { AuthReq } from "../middleware/auth.middleware";
import { emitToProject } from "../config/socket";
import { createNotification, sendEmail } from "../services/notification.service";

export const createMilestone = async (req: AuthReq, res: Response) => {
  const milestone = await Milestone.create({ ...req.body });
  emitToProject(req.body.projectId, "milestone:created", milestone);
  res.json(new ApiResponse(201, milestone, "Milestone created"));
};

export const submitMilestone = async (req: AuthReq, res: Response) => {
  const { submissionUrl } = req.body;
  const milestone = await Milestone.findById(req.params.id);
  if (!milestone) throw new ApiError(404, "Milestone not found");
  
  const project = await Project.findById(milestone.projectId);
  if (!project) throw new ApiError(404, "Project not found");
  
  if (!project.freelancerId || String(project.freelancerId) !== req.user!.id) {
    throw new ApiError(403, "Only the assigned freelancer can submit work for this milestone");
  }
  if (!["funded", "in_progress"].includes(milestone.status as string)) {
    throw new ApiError(400, "Milestone must be funded before you can submit work");
  }

  milestone.status = "submitted";
  milestone.submissionUrl = submissionUrl;
  
  // Mock Cloudinary upload from multer file buffer
  if (req.file) {
    // In production, upload req.file.buffer to Cloudinary
    milestone.evidenceUrl = "https://res.cloudinary.com/demo/image/upload/sample.jpg"; 
  }
  
  await milestone.save();

  const title = milestone.title as string;
  await createNotification(
    String(project.clientId),
    "milestone_submitted",
    "Work ready for review",
    `Your freelancer submitted deliverables for “${title}”. Review the proof and release payment when satisfied.`,
    `/projects/${project._id}`
  );

  emitToProject(String(project._id), "milestone:updated", { milestoneId: String(milestone._id), status: "submitted" });
  emitToProject(String(project._id), "milestone:submitted", milestone);

  const client = await User.findById(project.clientId);
  if (client?.email) {
    await sendEmail(
      client.email,
      "Deliverables Submitted — Action Required",
      `Hi ${client.name},\n\nYour freelancer has submitted deliverables for "${title}".\n\nYou can review the work and release escrowed funds at your project dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/projects/${project._id}`
    );
  }

  res.json(new ApiResponse(200, milestone, "Work submitted — your client has been notified"));
};

export const approveMilestone = async (req: AuthReq, res: Response) => {
  const milestone = await Milestone.findById(req.params.id);
  if (!milestone) throw new ApiError(404, "Milestone not found");
  const project = await Project.findById(milestone.projectId);
  
  if (String(project?.clientId) !== req.user!.id) {
    throw new ApiError(403, "Only the client can approve this milestone");
  }

  milestone.status = "approved";
  await milestone.save();

  // Check if all milestones are completed
  const allMilestones = await Milestone.find({ projectId: project!._id });
  const allCompleted = allMilestones.length > 0 && allMilestones.every(m => m.status === "approved" || m.status === "released");

  if (allCompleted && project!.status !== "completed") {
    project!.status = "completed";
    await project!.save();
    emitToProject(String(project!._id), "project:completed", project);
  }

  emitToProject(String(milestone.projectId), "milestone:approved", milestone);
  res.json(new ApiResponse(200, { milestone, projectCompleted: allCompleted }, "Milestone approved"));
};

export const rejectMilestone = async (req: AuthReq, res: Response) => {
  const milestone = await Milestone.findById(req.params.id);
  if (!milestone) throw new ApiError(404, "Milestone not found");
  const project = await Project.findById(milestone.projectId);
  
  if (String(project?.clientId) !== req.user!.id) {
    throw new ApiError(403, "Only the client can reject this milestone");
  }

  milestone.status = "rejected";
  milestone.feedback = req.body.feedback || "";
  await milestone.save();

  emitToProject(String(milestone.projectId), "milestone:rejected", milestone);
  res.json(new ApiResponse(200, milestone, "Milestone rejected"));
};

export const updateMilestone = async (req: AuthReq, res: Response) => {
  const milestone = await Milestone.findById(req.params.id);
  if (!milestone) throw new ApiError(404, "Milestone not found");
  const project = await Project.findById(milestone.projectId);
  
  if (String(project?.clientId) !== req.user!.id) {
    throw new ApiError(403, "Only the client can update this milestone");
  }

  Object.assign(milestone, req.body);
  await milestone.save();

  if (project!.freelancerId) {
    await createNotification(
      String(project!.freelancerId),
      "milestone_updated",
      "Milestone Details Updated",
      `The client has updated the details for milestone "${milestone.title}".`,
      `/projects/${project!._id}`
    );
    emitToProject(String(project!._id), "milestone:updated", milestone);
  }

  res.json(new ApiResponse(200, milestone, "Milestone updated"));
};
