import { Router } from "express";
import { z } from "zod";
import { createProject, getProjects, getProjectDetails, applyToProject, updateProject } from "../controllers/project.controller";
import { authRequired } from "../middleware/auth.middleware";
import { withRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authRequired);

router.post("/", withRole("client"), validate(z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  budget: z.number().positive()
})), asyncHandler(createProject));

router.get("/", asyncHandler(getProjects));
router.get("/:id", asyncHandler(getProjectDetails));
router.patch("/:id", withRole("client"), validate(z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  budget: z.number().positive().optional()
})), asyncHandler(updateProject));
router.post("/:id/apply", withRole("freelancer"), asyncHandler(applyToProject));

export default router;
