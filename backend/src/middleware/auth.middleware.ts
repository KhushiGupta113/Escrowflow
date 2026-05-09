import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../types";

const accessSecret = process.env.JWT_ACCESS_SECRET ?? "dev_access_secret";

export type AuthReq = Request & { user?: { id: string; role: UserRole } };

export const authRequired = (req: AuthReq, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, accessSecret) as { sub: string; role: UserRole };
    req.user = { id: decoded.sub, role: decoded.role };
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
