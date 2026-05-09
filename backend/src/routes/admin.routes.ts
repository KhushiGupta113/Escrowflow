import { Router } from "express";
import { getAdminDisputes, getAdminUsers, getAdminStats } from "../controllers/admin.controller";
import { authRequired } from "../middleware/auth.middleware";
import { withRole } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import disputeRoutes from "./dispute.routes";

const router = Router();

router.use(authRequired, withRole("admin"));

router.get("/disputes", asyncHandler(getAdminDisputes));
router.get("/users", asyncHandler(getAdminUsers));
router.get("/stats", asyncHandler(getAdminStats));

// We can mount resolve logic inside admin/disputes
router.post("/disputes/:id/resolve", (req, res, next) => {
  // Pass to the dispute router which already handles resolve?
  // We can just forward or implement directly.
  // Actually, we mapped /disputes/:id/resolve in dispute.routes.ts, we can just use that.
  next();
});

export default router;
