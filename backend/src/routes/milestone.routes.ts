import { Router } from "express";
import { z } from "zod";
import { createMilestone, submitMilestone, approveMilestone, rejectMilestone, updateMilestone } from "../controllers/milestone.controller";
import { authRequired } from "../middleware/auth.middleware";
import { withRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.use(authRequired);

router.post("/", withRole("client"), validate(z.object({
  projectId: z.string(),
  title: z.string().min(3),
  amount: z.number().positive()
})), asyncHandler(createMilestone));

router.patch("/:id", withRole("client"), validate(z.object({
  title: z.string().min(3).optional(),
  amount: z.number().positive().optional(),
  description: z.string().optional()
})), asyncHandler(updateMilestone));

router.post("/:id/submit", withRole("freelancer"), upload.single("evidence"), asyncHandler(submitMilestone));
router.post("/:id/approve", withRole("client"), asyncHandler(approveMilestone));
router.post("/:id/reject", withRole("client"), asyncHandler(rejectMilestone));

export default router;
