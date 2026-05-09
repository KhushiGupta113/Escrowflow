import { Response } from "express";
import { User, Project, Milestone, Escrow } from "../models";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { AuthReq } from "../middleware/auth.middleware";

export const getProfile = async (req: AuthReq, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(404, "User not found");
  res.json(new ApiResponse(200, user));
};

export const updateProfile = async (req: AuthReq, res: Response) => {
  const user = await User.findByIdAndUpdate(req.user!.id, { $set: req.body }, { new: true });
  if (!user) throw new ApiError(404, "User not found");
  res.json(new ApiResponse(200, user, "Profile updated"));
};

export const getDashboardSummary = async (req: AuthReq, res: Response) => {
  const role = req.user!.role;
  const [activeProjects, disputed, released] = await Promise.all([
    Project.countDocuments(role === "client" ? { clientId: req.user!.id, status: { $ne: "closed" } } : { freelancerId: req.user!.id }),
    Milestone.countDocuments({ status: "disputed" }),
    Escrow.countDocuments({ status: "released" })
  ]);
  
  res.json(new ApiResponse(200, { activeProjects, disputed, released, pendingApprovals: 0, escrowBalance: 0 }));
};
