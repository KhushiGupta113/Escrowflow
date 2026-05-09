import { Response, NextFunction } from "express";
import { AuthReq } from "./auth.middleware";
import { UserRole } from "../types";

export const withRole = (...roles: UserRole[]) => (req: AuthReq, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (roles.length && !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
};
