import DashboardRepository from "../repositories/dashboardRepository.js";
import logger from "../../../../utils/logger.js";

class DashboardService {
  private dashboardRepository: DashboardRepository;

  constructor() {
    this.dashboardRepository = new DashboardRepository();
  }

  /**
   * Get comprehensive dashboard data with all analytics
   * @returns Complete dashboard analytics object
   */
  async getDashboardData(): Promise<any> {
    try {
      logger.info("Fetching comprehensive dashboard data");
      const stats = await this.dashboardRepository.getDashboardStats();
      logger.info("Dashboard data fetched successfully");
      return stats;
    } catch (error) {
      logger.error("Dashboard service error:", error);
      throw new Error(`Dashboard service error: ${error}`);
    }
  }

  /**
   * Get overview statistics only
   * @returns Overview statistics
   */
  async getOverviewData(): Promise<any> {
    try {
      const stats = await this.dashboardRepository.getOverviewStats();
      return stats;
    } catch (error) {
      logger.error("Overview service error:", error);
      throw new Error(`Overview service error: ${error}`);
    }
  }

  /**
   * Get revenue analytics only
   * @returns Revenue and coins analytics
   */
  async getRevenueData(): Promise<any> {
    try {
      const stats = await this.dashboardRepository.getRevenueStats();
      return stats;
    } catch (error) {
      logger.error("Revenue service error:", error);
      throw new Error(`Revenue service error: ${error}`);
    }
  }

  /**
   * Get recent activities only
   * @returns Recent activities from all modules
   */
  async getRecentActivitiesData(limit: number = 10): Promise<any> {
    try {
      const activities = await this.dashboardRepository.getRecentActivities(limit);
      return activities;
    } catch (error) {
      logger.error("Recent activities service error:", error);
      throw new Error(`Recent activities service error: ${error}`);
    }
  }

  /**
   * Get university analytics only
   * @returns University performance analytics
   */
  async getUniversityAnalyticsData(): Promise<any> {
    try {
      const analytics = await this.dashboardRepository.getUniversityAnalytics();
      return analytics;
    } catch (error) {
      logger.error("University analytics service error:", error);
      throw new Error(`University analytics service error: ${error}`);
    }
  }

  /**
   * Get user demographics only
   * @returns User demographics data
   */
  async getUserDemographicsData(): Promise<any> {
    try {
      const demographics = await this.dashboardRepository.getUserDemographics();
      return demographics;
    } catch (error) {
      logger.error("User demographics service error:", error);
      throw new Error(`User demographics service error: ${error}`);
    }
  }

  /**
   * Get time trends only
   * @returns Time-based trends for last 30 days
   */
  async getTimeTrendsData(): Promise<any> {
    try {
      const trends = await this.dashboardRepository.getTimeTrends();
      return trends;
    } catch (error) {
      logger.error("Time trends service error:", error);
      throw new Error(`Time trends service error: ${error}`);
    }
  }

  /**
   * Get upcoming webinars only
   * @returns Upcoming scheduled webinars
   */
  async getUpcomingWebinarsData(limit: number = 5): Promise<any> {
    try {
      const webinars = await this.dashboardRepository.getUpcomingWebinars(limit);
      return webinars;
    } catch (error) {
      logger.error("Upcoming webinars service error:", error);
      throw new Error(`Upcoming webinars service error: ${error}`);
    }
  }
}

export default DashboardService;
