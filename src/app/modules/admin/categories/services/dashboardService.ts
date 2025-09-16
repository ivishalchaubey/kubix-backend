import DashboardRepository from "../repositories/dashboardRepository.js";

class DashboardService {
  private dashboardRepository: DashboardRepository;

  constructor() {
    this.dashboardRepository = new DashboardRepository();
  }

  /**
   * Get clean dashboard data
   * @returns Simple object with totalStudents, totalUniversities, totalCareerPaths
   */
  async getDashboardData(): Promise<{
    totalStudents: number;
    totalUniversities: number;
    totalCareerPaths: number;
  }> {
    try {
      const stats = await this.dashboardRepository.getDashboardStats();

      return {
        totalStudents: stats.totalStudents,
        totalUniversities: stats.totalUniversities,
        totalCareerPaths: stats.totalCareerPaths,
      };
    } catch (error) {
      throw new Error(`Dashboard service error: ${error}`);
    }
  }
}

export default DashboardService;
