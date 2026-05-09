import { Router } from "express";
import authRoutes from "./auth.routes";
import projectRoutes from "./project.routes";
import milestoneRoutes from "./milestone.routes";
import escrowRoutes from "./escrow.routes";
import disputeRoutes from "./dispute.routes";
import notificationRoutes from "./notification.routes";
import adminRoutes from "./admin.routes";
import userRoutes from "./user.routes";
import dashboardRoutes from "./dashboard.routes";
import aiRoutes from "./ai.routes";
import marketplaceRoutes from "./marketplace.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/milestones", milestoneRoutes);
router.use("/escrow", escrowRoutes);
router.use("/disputes", disputeRoutes);
router.use("/notifications", notificationRoutes);
router.use("/admin", adminRoutes);
router.use("/users", userRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/marketplace", marketplaceRoutes);
router.use("/", aiRoutes); // Contains generate-brief, generate-milestone

export default router;
