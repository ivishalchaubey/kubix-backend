import User from "../../../auth/models/User.js";
import CategoryModel from "../models/category.js";
import { UserRole } from "../../../../constants/enums.js";

class DashboardRepository {
  /**
   * Get all dashboard statistics in one call
   */
  async getDashboardStats(): Promise<{
    totalStudents: number;
    totalUniversities: number;
    totalCareerPaths: number;
  }> {
    try {
      const [totalStudents, totalUniversities, totalCareerPaths] =
        await Promise.all([
          User.countDocuments({ role: UserRole.USER }),
          User.countDocuments({ role: UserRole.UNIVERSITY }),
          CategoryModel.countDocuments({ parentId: null }),
        ]);

      return {
        totalStudents,
        totalUniversities,
        totalCareerPaths,
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard statistics: ${error}`);
    }
  }
}

export default DashboardRepository;
