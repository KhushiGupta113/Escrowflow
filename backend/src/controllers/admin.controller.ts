import { Response } from "express";
import { User, Dispute, Project, Escrow } from "../models";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

export const getAdminDisputes = async (req: any, res: Response) => {
  const disputes = await Dispute.find().populate("milestoneId").sort({ createdAt: -1 });
  res.json(new ApiResponse(200, disputes));
};

export const getAdminUsers = async (req: any, res: Response) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(new ApiResponse(200, users));
};

export const getAdminStats = async (req: any, res: Response) => {
  const [totalUsers, activeProjects, openDisputes, escrowVolume] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments({ status: "in_progress" }),
    Dispute.countDocuments({ status: "open" }),
    Escrow.aggregate([{ $match: { status: "released" } }, { $group: { _id: null, total: { $sum: "$amount" } } }])
  ]);

  res.json(new ApiResponse(200, {
    totalUsers,
    activeProjects,
    openDisputes,
    escrowVolume: escrowVolume[0]?.total || 0
  }));
};
