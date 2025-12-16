import { Router } from "express";
import WebinarController from "../controllers/webinar.controller.js";
import AuthMiddleware from "../../../middlewares/auth.js";
import { webinarValidation } from "../../../middlewares/validationMiddleware.js";

const webinarRouter = Router();
const webinarController = new WebinarController();

// Public routes - Students can view published webinars
webinarRouter.get("/published", webinarController.getPublishedWebinars.bind(webinarController));
webinarRouter.get("/upcoming", webinarController.getUpcomingWebinars.bind(webinarController));
webinarRouter.get("/:id", webinarController.getWebinarById.bind(webinarController));

// University routes - Require authentication
webinarRouter.post("/", AuthMiddleware.authenticate, webinarValidation.create, webinarController.createWebinar.bind(webinarController));
webinarRouter.get("/university/my-webinars", AuthMiddleware.authenticate, webinarController.getMyWebinars.bind(webinarController));
webinarRouter.patch("/:id", AuthMiddleware.authenticate, webinarValidation.update, webinarController.updateWebinar.bind(webinarController));
webinarRouter.delete("/:id", AuthMiddleware.authenticate, webinarController.deleteWebinar.bind(webinarController));
webinarRouter.post("/:id/publish", AuthMiddleware.authenticate, webinarController.publishWebinar.bind(webinarController));

// Admin route - Get all webinars
webinarRouter.get("/admin/all", AuthMiddleware.authenticate, webinarController.getAllWebinars.bind(webinarController));

export default webinarRouter;

