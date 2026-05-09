import { Router } from "express";
import { getMarketplace } from "../controllers/project.controller";
import { authRequired } from "../middleware/auth.middleware";
import { withRole } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", authRequired, withRole("freelancer"), asyncHandler(getMarketplace));

export default router;
