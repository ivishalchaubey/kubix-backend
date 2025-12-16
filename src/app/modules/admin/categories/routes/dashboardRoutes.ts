import { Router, Request, Response, NextFunction } from "express";
import DashboardController from "../controllers/dashboardController.js";
import asyncHandler from "../../../../utils/asyncHandler.js";
import AuthMiddleware from "../../../../middlewares/auth.js";

const dashboardRouter = Router();
const dashboardController = new DashboardController();

// All routes require admin authentication
dashboardRouter.use(AuthMiddleware.authenticate);
dashboardRouter.use(AuthMiddleware.isAdmin);

/**
 * @route   GET /api/v1/admin/dashboard
 * @desc    Get complete dashboard with all analytics
 * @access  Admin only
 */
dashboardRouter.get(
  "/",
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    dashboardController.getDashboard(req, res, next)
  )
);

/**
 * @route   GET /api/v1/admin/dashboard/overview
 * @desc    Get overview statistics only
 * @access  Admin only
 */
dashboardRouter.get(
  "/overview",
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    dashboardController.getOverview(req, res, next)
  )
);

/**
 * @route   GET /api/v1/admin/dashboard/revenue
 * @desc    Get revenue and coins analytics
 * @access  Admin only
 */
dashboardRouter.get(
  "/revenue",
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    dashboardController.getRevenue(req, res, next)
  )
);

/**
 * @route   GET /api/v1/admin/dashboard/activities
 * @desc    Get recent activities from all modules
 * @access  Admin only
 */
dashboardRouter.get(
  "/activities",
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    dashboardController.getRecentActivities(req, res, next)
  )
);

/**
 * @route   GET /api/v1/admin/dashboard/universities
 * @desc    Get university analytics
 * @access  Admin only
 */
dashboardRouter.get(
  "/universities",
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    dashboardController.getUniversityAnalytics(req, res, next)
  )
);

/**
 * @route   GET /api/v1/admin/dashboard/demographics
 * @desc    Get user demographics
 * @access  Admin only
 */
dashboardRouter.get(
  "/demographics",
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    dashboardController.getUserDemographics(req, res, next)
  )
);

/**
 * @route   GET /api/v1/admin/dashboard/trends
 * @desc    Get time-based trends (last 30 days)
 * @access  Admin only
 */
dashboardRouter.get(
  "/trends",
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    dashboardController.getTimeTrends(req, res, next)
  )
);

/**
 * @route   GET /api/v1/admin/dashboard/upcoming-webinars
 * @desc    Get upcoming scheduled webinars
 * @access  Admin only
 */
dashboardRouter.get(
  "/upcoming-webinars",
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    dashboardController.getUpcomingWebinars(req, res, next)
  )
);

export default dashboardRouter;
