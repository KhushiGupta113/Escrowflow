import { Router } from "express";
import { getDashboardSummary } from "../controllers/user.controller";
import { authRequired } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authRequired);
router.get("/summary", asyncHandler(getDashboardSummary));

export default router;
