import User from "../../../auth/models/User.js";
import CategoryModel from "../models/category.js";
import { UserRole } from "../../../../constants/enums.js";
import { Webinar } from "../../../webinar/models/webinar.model.js";
import { ApplicationSales } from "../../../application-sales/models/applicationSales.model.js";
import { InAppBanner } from "../../../in-app-banner/models/inAppBanner.model.js";
import { Course } from "../../../courses/models/course.js";

class DashboardRepository {
  /**
   * Get overview statistics
   */
  async getOverviewStats(): Promise<any> {
    try {
      const [
        totalStudents,
        totalUniversities,
        totalAdmins,
        activeUsers,
        totalWebinars,
        publishedWebinars,
        liveWebinars,
        totalApplicationSales,
        activeApplicationSales,
        totalBanners,
        activeBanners,
        totalCourses,
        totalCareerPaths,
      ] = await Promise.all([
        User.countDocuments({ role: UserRole.USER }),
        User.countDocuments({ role: UserRole.UNIVERSITY }),
        User.countDocuments({ role: UserRole.ADMIN }),
        User.countDocuments({ status: "active" }),
        Webinar.countDocuments(),
        Webinar.countDocuments({ status: "published" }),
        Webinar.countDocuments({ status: "live" }),
        ApplicationSales.countDocuments(),
        ApplicationSales.countDocuments({ status: { $in: ["published", "active"] } }),
        InAppBanner.countDocuments(),
        InAppBanner.countDocuments({ isActive: true }),
        Course.countDocuments(),
        CategoryModel.countDocuments({ parentId: null }),
      ]);

      return {
        users: {
          total: totalStudents + totalUniversities + totalAdmins,
          students: totalStudents,
          universities: totalUniversities,
          admins: totalAdmins,
          active: activeUsers,
        },
        webinars: {
          total: totalWebinars,
          published: publishedWebinars,
          live: liveWebinars,
        },
        applicationSales: {
          total: totalApplicationSales,
          active: activeApplicationSales,
        },
        banners: {
          total: totalBanners,
          active: activeBanners,
        },
        courses: {
          total: totalCourses,
        },
        careerPaths: {
          total: totalCareerPaths,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get overview statistics: ${error}`);
    }
  }

  /**
   * Get webinar statistics by status
   */
  async getWebinarStats(): Promise<any> {
    try {
      const stats = await Webinar.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalCoins: { $sum: "$coinsAmount" },
          },
        },
      ]);

      const statusMap: any = {
        draft: 0,
        published: 0,
        live: 0,
        completed: 0,
        cancelled: 0,
      };

      let totalCoinsDeducted = 0;

      stats.forEach((stat) => {
        statusMap[stat._id] = stat.count;
        if (stat._id !== "draft" && stat._id !== "cancelled") {
          totalCoinsDeducted += stat.totalCoins;
        }
      });

      return {
        byStatus: statusMap,
        totalCoinsDeducted,
      };
    } catch (error) {
      throw new Error(`Failed to get webinar statistics: ${error}`);
    }
  }

  /**
   * Get application sales statistics
   */
  async getApplicationSalesStats(): Promise<any> {
    try {
      const stats = await ApplicationSales.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalApplications: { $sum: "$applicationCount" },
            totalCoins: {
              $sum: { $multiply: ["$applicationCount", "$coinsPerApplication"] },
            },
          },
        },
      ]);

      const statusMap: any = {
        draft: 0,
        published: 0,
        active: 0,
        closed: 0,
      };

      let totalApplications = 0;
      let totalCoinsCredited = 0;

      stats.forEach((stat) => {
        statusMap[stat._id] = stat.count;
        totalApplications += stat.totalApplications || 0;
        totalCoinsCredited += stat.totalCoins || 0;
      });

      return {
        byStatus: statusMap,
        totalApplications,
        totalCoinsCredited,
      };
    } catch (error) {
      throw new Error(`Failed to get application sales statistics: ${error}`);
    }
  }

  /**
   * Get revenue and coins analytics
   */
  async getRevenueStats(): Promise<any> {
    try {
      const [webinarStats, appSalesStats] = await Promise.all([
        this.getWebinarStats(),
        this.getApplicationSalesStats(),
      ]);

      return {
        webinars: {
          totalCoinsDeducted: webinarStats.totalCoinsDeducted,
        },
        applicationSales: {
          totalApplications: appSalesStats.totalApplications,
          totalCoinsCredited: appSalesStats.totalCoinsCredited,
        },
        netCoins: webinarStats.totalCoinsDeducted - appSalesStats.totalCoinsCredited,
      };
    } catch (error) {
      throw new Error(`Failed to get revenue statistics: ${error}`);
    }
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit: number = 20): Promise<any> {
    try {
      const [recentWebinars, recentApplicationSales, recentBanners, recentUsers] =
        await Promise.all([
          Webinar.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select("universityName title status scheduledDate createdAt")
            .lean(),
          ApplicationSales.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select("universityName status applicationCount createdAt")
            .lean(),
          InAppBanner.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select("title isActive priority createdAt")
            .lean(),
          User.find({ role: UserRole.USER })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select("firstName lastName email createdAt")
            .lean(),
        ]);

      return {
        recentWebinars,
        recentApplicationSales,
        recentBanners,
        recentUsers,
      };
    } catch (error) {
      throw new Error(`Failed to get recent activities: ${error}`);
    }
  }

  /**
   * Get university analytics
   */
  async getUniversityAnalytics(): Promise<any> {
    try {
      const [webinarsByUniversity, applicationSalesByUniversity] = await Promise.all([
        Webinar.aggregate([
          {
            $group: {
              _id: "$universityId",
              universityName: { $first: "$universityName" },
              totalWebinars: { $sum: 1 },
              publishedWebinars: {
                $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] },
              },
              totalCoinsSpent: { $sum: "$coinsAmount" },
            },
          },
          { $sort: { totalWebinars: -1 } },
          { $limit: 10 },
        ]),
        ApplicationSales.aggregate([
          {
            $group: {
              _id: "$universityId",
              universityName: { $first: "$universityName" },
              totalApplicationSales: { $sum: 1 },
              totalApplications: { $sum: "$applicationCount" },
              totalCoinsEarned: {
                $sum: { $multiply: ["$applicationCount", "$coinsPerApplication"] },
              },
            },
          },
          { $sort: { totalApplications: -1 } },
          { $limit: 10 },
        ]),
      ]);

      return {
        topUniversitiesByWebinars: webinarsByUniversity,
        topUniversitiesByApplicationSales: applicationSalesByUniversity,
      };
    } catch (error) {
      throw new Error(`Failed to get university analytics: ${error}`);
    }
  }

  /**
   * Get user demographics
   */
  async getUserDemographics(): Promise<any> {
    try {
      const [byStream, byBoard, byStatus] = await Promise.all([
        User.aggregate([
          { $match: { role: UserRole.USER } },
          {
            $group: {
              _id: "$stream",
              count: { $sum: 1 },
            },
          },
        ]),
        User.aggregate([
          { $match: { role: UserRole.USER } },
          {
            $group: {
              _id: "$board",
              count: { $sum: 1 },
            },
          },
        ]),
        User.aggregate([
          { $match: { role: UserRole.USER } },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      return {
        byStream,
        byBoard,
        byStatus,
      };
    } catch (error) {
      throw new Error(`Failed to get user demographics: ${error}`);
    }
  }

  /**
   * Get time-based trends (last 30 days)
   */
  async getTimeTrends(): Promise<any> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [webinarTrends, applicationSalesTrends, userRegistrationTrends] =
        await Promise.all([
          Webinar.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ]),
          ApplicationSales.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                count: { $sum: 1 },
                applications: { $sum: "$applicationCount" },
              },
            },
            { $sort: { _id: 1 } },
          ]),
          User.aggregate([
            {
              $match: {
                role: UserRole.USER,
                createdAt: { $gte: thirtyDaysAgo },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ]),
        ]);

      return {
        webinars: webinarTrends,
        applicationSales: applicationSalesTrends,
        userRegistrations: userRegistrationTrends,
      };
    } catch (error) {
      throw new Error(`Failed to get time trends: ${error}`);
    }
  }

  /**
   * Get upcoming webinars
   */
  async getUpcomingWebinars(limit: number = 10): Promise<any> {
    try {
      const now = new Date();
      const upcomingWebinars = await Webinar.find({
        scheduledDate: { $gte: now },
        status: { $in: ["published", "live"] },
      })
        .sort({ scheduledDate: 1 })
        .limit(limit)
        .select("universityName title scheduledDate scheduledTime status")
        .lean();

      return upcomingWebinars;
    } catch (error) {
      throw new Error(`Failed to get upcoming webinars: ${error}`);
    }
  }

  /**
   * Get all comprehensive dashboard statistics
   */
  async getDashboardStats(): Promise<any> {
    try {
      const [
        overview,
        revenue,
        recentActivities,
        universityAnalytics,
        userDemographics,
        timeTrends,
        upcomingWebinars,
      ] = await Promise.all([
        this.getOverviewStats(),
        this.getRevenueStats(),
        this.getRecentActivities(10),
        this.getUniversityAnalytics(),
        this.getUserDemographics(),
        this.getTimeTrends(),
        this.getUpcomingWebinars(5),
      ]);

      return {
        overview,
        revenue,
        recentActivities,
        universityAnalytics,
        userDemographics,
        timeTrends,
        upcomingWebinars,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard statistics: ${error}`);
    }
  }
}

export default DashboardRepository;
