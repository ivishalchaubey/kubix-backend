import { Router, Request, Response, NextFunction } from "express";
import DashboardController from "../controllers/dashboardController.js";
import asyncHandler from "../../../../utils/asyncHandler.js";
import AuthMiddleware from "../../../../middlewares/auth.js";

const dashboardRouter = Router();
const dashboardController = new DashboardController();

// Get dashboard data
dashboardRouter.get(
  "/",
  AuthMiddleware.authenticate,
  AuthMiddleware.isAdmin,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    dashboardController.getDashboard(req, res, next)
  )
);

export default dashboardRouter;
