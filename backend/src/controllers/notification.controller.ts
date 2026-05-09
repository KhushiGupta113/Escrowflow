import { Response } from "express";
import { Notification } from "../models";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { AuthReq } from "../middleware/auth.middleware";

export const getNotifications = async (req: AuthReq, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ userId: req.user!.id })
    .sort({ read: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({ userId: req.user!.id });

  res.json(new ApiResponse(200, {
    notifications,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  }));
};

export const markRead = async (req: AuthReq, res: Response) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw new ApiError(404, "Notification not found");
  
  if (String(notification.userId) !== req.user!.id) {
    throw new ApiError(403, "Forbidden");
  }

  notification.read = true;
  await notification.save();
  res.json(new ApiResponse(200, notification));
};
