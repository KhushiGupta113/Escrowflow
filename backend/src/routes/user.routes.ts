import { Router } from "express";
import { z } from "zod";
import { getProfile, updateProfile, getDashboardSummary } from "../controllers/user.controller";
import { authRequired } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authRequired);

router.get("/profile", asyncHandler(getProfile));
router.patch("/profile", validate(z.object({
  name: z.string().min(2).optional(),
  bio: z.string().optional(),
  avatar: z.string().optional()
})), asyncHandler(updateProfile));

export default router;
