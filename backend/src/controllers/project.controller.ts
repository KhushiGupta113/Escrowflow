import { Response } from "express";
import mongoose from "mongoose";
import { Project, Milestone } from "../models";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { AuthReq } from "../middleware/auth.middleware";

export const createProject = async (req: AuthReq, res: Response) => {
  const project = await Project.create({ ...req.body, clientId: req.user!.id });
  res.json(new ApiResponse(201, project, "Project created"));
};

export const getProjects = async (req: AuthReq, res: Response) => {
  const query: any = req.user?.role === "client" 
    ? { clientId: new mongoose.Types.ObjectId(req.user.id) } 
    : req.user?.role === "freelancer" 
    ? { freelancerId: new mongoose.Types.ObjectId(req.user.id) } 
    : {};

  const projects = await Project.aggregate([
    { $match: query },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "milestones",
        localField: "_id",
        foreignField: "projectId",
        as: "milestones"
      }
    },
    {
      $addFields: {
        milestoneStats: {
          total: { $size: "$milestones" },
          completed: {
            $size: {
              $filter: {
                input: "$milestones",
                as: "m",
                cond: { $in: ["$$m.status", ["approved", "released"]] }
              }
            }
          }
        }
      }
    },
    {
      $project: {
        milestones: 0 // Exclude full milestones array to keep response light
      }
    }
  ]);

  res.json(new ApiResponse(200, projects));
};

export const getProjectDetails = async (req: AuthReq, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, "Project not found");
  const milestones = await Milestone.find({ projectId: project._id }).sort({ createdAt: 1 });
  res.json(new ApiResponse(200, { project, milestones }));
};

export const getMarketplace = async (req: AuthReq, res: Response) => {
  const projects = await Project.find({ freelancerId: { $exists: false } }).sort({ createdAt: -1 }).limit(10);
  res.json(new ApiResponse(200, projects));
};

export const updateProject = async (req: AuthReq, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, "Project not found");
  if (String(project.clientId) !== req.user!.id) throw new ApiError(403, "Only the client can update this project");

  Object.assign(project, req.body);
  await project.save();

  if (project.freelancerId) {
    const { createNotification } = require("../services/notification.service");
    await createNotification(
      String(project.freelancerId),
      "project_updated",
      "Project Scope Updated",
      `The client has updated the scope or details of project "${project.title}". Please review the changes.`,
      `/projects/${project._id}`
    );
    const { emitToProject } = require("../config/socket");
    emitToProject(String(project._id), "project:updated", project);
  }

  res.json(new ApiResponse(200, project, "Project updated"));
};

export const applyToProject = async (req: AuthReq, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, "Project not found");
  if (project.freelancerId) throw new ApiError(409, "Project already has a freelancer");
  
  project.freelancerId = req.user!.id as any;
  project.status = "in_progress";
  await project.save();
  
  res.json(new ApiResponse(200, project, "Application successful. You are now the freelancer for this project."));
};
