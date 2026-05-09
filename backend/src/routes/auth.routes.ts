import { Router } from "express";
import { z } from "zod";
import { sendOtp, signup, login, forgotPassword, refresh, logout } from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/otp/send", validate(z.object({
  email: z.string().email(),
  type: z.enum(["signup", "forgot_password"])
})), asyncHandler(sendOtp));

router.post("/signup", validate(z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["client", "freelancer", "admin"]),
  otp: z.string().length(6)
})), asyncHandler(signup));

router.post("/login", validate(z.object({
  email: z.string().email(),
  password: z.string().min(8)
})), asyncHandler(login));

router.post("/forgot-password", validate(z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8)
})), asyncHandler(forgotPassword));

router.post("/refresh", asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));

export default router;
