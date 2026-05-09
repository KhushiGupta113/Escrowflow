import { Router } from "express";
import { z } from "zod";
import { createDispute, resolveDispute } from "../controllers/dispute.controller";
import { authRequired } from "../middleware/auth.middleware";
import { withRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authRequired);

router.post("/", withRole("client", "freelancer"), validate(z.object({
  milestoneId: z.string(),
  reason: z.string().min(10),
  evidenceUrls: z.array(z.string().url()).optional()
})), asyncHandler(createDispute));

// Move resolve to admin routes actually, but keeping it here for now with admin check
router.post("/:id/resolve", withRole("admin"), validate(z.object({
  resolution: z.enum(["client", "freelancer"]),
  notes: z.string().min(5)
})), asyncHandler(resolveDispute));

export default router;
