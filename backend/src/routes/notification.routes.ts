import { Router } from "express";
import { getNotifications, markRead } from "../controllers/notification.controller";
import { authRequired } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authRequired);
router.get("/", asyncHandler(getNotifications));
router.post("/read/:id", asyncHandler(markRead));

export default router;
