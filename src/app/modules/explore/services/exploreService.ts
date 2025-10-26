import ExploreRepository from "../repositories/exploreRepository.js";
import logger from "../../../utils/logger.js";

class ExploreService {
  private exploreRepository: ExploreRepository;

  constructor() {
    this.exploreRepository = new ExploreRepository();
  }

  /**
   * Get careers based on user's selected categories
   */
  async getCareers(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ careers: any[]; total: number }> {
    try {
      const result = await this.exploreRepository.getCareers(userId, page, limit, search);
      logger.info(`Careers retrieved for user: ${userId}, page: ${page}, limit: ${limit}, search: ${search || 'none'}`);
      return result;
    } catch (error) {
      logger.error("Get careers failed:", error);
      throw error;
    }
  }

  /**
   * Get all colleges (universities)
   */
  async getColleges(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ colleges: any[]; total: number }> {
    try {
      const result = await this.exploreRepository.getColleges(page, limit, search);
      logger.info(`Colleges retrieved, page: ${page}, limit: ${limit}, search: ${search || 'none'}`);
      return result;
    } catch (error) {
      logger.error("Get colleges failed:", error);
      throw error;
    }
  }

  /**
   * Get courses based on user's selected categories
   */
  async getCourses(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ courses: any[]; total: number }> {
    try {
      const result = await this.exploreRepository.getCourses(userId, page, limit, search);
      logger.info(`Courses retrieved for user: ${userId}, page: ${page}, limit: ${limit}, search: ${search || 'none'}`);
      return result;
    } catch (error) {
      logger.error("Get courses failed:", error);
      throw error;
    }
  }
}

export default ExploreService;
