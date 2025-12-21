import { Request, Response, NextFunction } from "express";
import ResponseUtil from "../../../../utils/response.js";
import DashboardService from "../services/dashboardService.js";
import { API_MESSAGES } from "../../../../constants/enums.js";

class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  /**
   * Get complete dashboard data with all analytics
   * GET /api/v1/admin/dashboard
   */
  async getDashboard(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const data = await this.dashboardService.getDashboardData();
      ResponseUtil.success(res, data, "Dashboard data retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get overview statistics only
   * GET /api/v1/admin/dashboard/overview
   */
  async getOverview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const data = await this.dashboardService.getOverviewData();
      ResponseUtil.success(res, data, "Overview statistics retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get revenue analytics only
   * GET /api/v1/admin/dashboard/revenue
   */
  async getRevenue(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const data = await this.dashboardService.getRevenueData();
      ResponseUtil.success(res, data, "Revenue analytics retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent activities
   * GET /api/v1/admin/dashboard/activities
   */
  async getRecentActivities(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await this.dashboardService.getRecentActivitiesData(limit);
      ResponseUtil.success(res, data, "Recent activities retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get university analytics
   * GET /api/v1/admin/dashboard/universities
   */
  async getUniversityAnalytics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const data = await this.dashboardService.getUniversityAnalyticsData();
      ResponseUtil.success(res, data, "University analytics retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user demographics
   * GET /api/v1/admin/dashboard/demographics
   */
  async getUserDemographics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const data = await this.dashboardService.getUserDemographicsData();
      ResponseUtil.success(res, data, "User demographics retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get time trends
   * GET /api/v1/admin/dashboard/trends
   */
  async getTimeTrends(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const data = await this.dashboardService.getTimeTrendsData();
      ResponseUtil.success(res, data, "Time trends retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get upcoming webinars
   * GET /api/v1/admin/dashboard/upcoming-webinars
   */
  async getUpcomingWebinars(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const data = await this.dashboardService.getUpcomingWebinarsData(limit);
      ResponseUtil.success(res, data, "Upcoming webinars retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default DashboardController;
