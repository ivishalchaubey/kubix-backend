import { Request, Response, NextFunction } from "express";
import ResponseUtil from "../../../../utils/response.js";
import DashboardService from "../services/dashboardService.js";

class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  /**
   * Get dashboard data
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
}

export default DashboardController;
