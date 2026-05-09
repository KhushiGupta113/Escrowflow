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
  const userId = req.user!.id;
  const role = req.user!.role;

  const [activeProjects, disputedCount] = await Promise.all([
    Project.countDocuments(role === "client" ? { clientId: userId, status: { $ne: "closed" } } : { freelancerId: userId, status: { $ne: "closed" } }),
    Milestone.countDocuments(role === "client" 
      ? { status: "disputed", projectId: { $in: await Project.find({ clientId: userId }).distinct("_id") } }
      : { status: "disputed", projectId: { $in: await Project.find({ freelancerId: userId }).distinct("_id") } }
    )
  ]);

  let escrowBalance = 0;
  let pendingApprovals = 0;

  if (role === "client") {
    // Escrow balance: funds verified but not yet released/refunded
    const escrows = await Escrow.find({ payerId: userId, status: "verified" });
    escrowBalance = escrows.reduce((sum, e) => sum + e.amount, 0);

    // Pending approvals: milestones submitted by freelancer
    const userProjects = await Project.find({ clientId: userId }).distinct("_id");
    pendingApprovals = await Milestone.countDocuments({ 
      projectId: { $in: userProjects }, 
      status: "submitted" 
    });
  } else {
    // For freelancers, escrow balance is what's coming their way
    const escrows = await Escrow.find({ payeeId: userId, status: "verified" });
    escrowBalance = escrows.reduce((sum, e) => sum + e.amount, 0);
  }
  
  res.json(new ApiResponse(200, { 
    activeProjects, 
    disputed: disputedCount, 
    escrowBalance, 
    pendingApprovals 
  }));
};
