import { Router } from "express";
import NotificationController from "../controllers/notification.controller.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import AuthMiddleware from "../../../middlewares/auth.js";
import { notificationValidation } from "../../../middlewares/validationMiddleware.js";

const notificationRouter = Router();
const notificationController = new NotificationController();

// Public routes (if needed)
// notificationRouter.get("/", notificationController.getNotifications.bind(notificationController));

// Protected routes
notificationRouter.post("/", AuthMiddleware.authenticate, notificationValidation.create, notificationController.createNotification.bind(notificationController));
notificationRouter.get("/", AuthMiddleware.authenticate, notificationController.getNotifications.bind(notificationController));
notificationRouter.get("/:id", AuthMiddleware.authenticate, notificationController.getNotificationById.bind(notificationController));
notificationRouter.patch("/:id", AuthMiddleware.authenticate, notificationValidation.update, notificationController.updateNotification.bind(notificationController));
notificationRouter.delete("/:id", AuthMiddleware.authenticate, notificationController.deleteNotification.bind(notificationController));

// User-specific notifications
notificationRouter.get("/user/notifications", AuthMiddleware.authenticate, notificationController.getUserNotifications);

export default notificationRouter;
