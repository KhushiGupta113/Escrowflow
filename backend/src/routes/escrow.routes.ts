import { Router } from "express";
import { z } from "zod";
import { fundMilestone, verifyPayment, releaseEscrow, withdrawEscrow } from "../controllers/escrow.controller";
import { authRequired } from "../middleware/auth.middleware";
import { withRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authRequired);

router.post("/fund/:milestoneId", withRole("client"), asyncHandler(fundMilestone));
router.post("/verify", withRole("client"), validate(z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional()
})), asyncHandler(verifyPayment));

router.post("/release/:milestoneId", withRole("client", "admin"), asyncHandler(releaseEscrow));
router.post("/withdraw/:milestoneId", withRole("freelancer"), asyncHandler(withdrawEscrow));

export default router;
