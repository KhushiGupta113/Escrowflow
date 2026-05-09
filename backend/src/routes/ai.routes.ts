import { Router } from "express";
import { z } from "zod";
import { generateBrief, generateMilestone } from "../controllers/ai.controller";
import { authRequired } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/generate-brief", validate(z.object({
  prompt: z.string().min(5)
})), asyncHandler(generateBrief));

router.post("/generate-milestone", authRequired, validate(z.object({
  projectTitle: z.string(), 
  projectDescription: z.string(),
  existingMilestones: z.array(z.string())
})), asyncHandler(generateMilestone));

export default router;
