import { Request, Response, NextFunction } from 'express';
import ResponseUtil from "../../../utils/response.js";
import { API_MESSAGES, PAGINATION } from '../../../constants/enums.js';
import ExploreService from '../services/exploreService.js';
import { PaginationMeta } from '../../../types/global.js';

class ExploreController {
  public exploreService: ExploreService;

  constructor() {
    this.exploreService = new ExploreService();
  }

  /**
   * Explore API - Get data based on type parameter
   * Supports: careers, colleges, courses with pagination and search
   */
  async explore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
        return;
      }

      const userId = req.user._id;
      const type = (req.query.type as string)?.toLowerCase();
      const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;
      const search = req.query.search as string;

      // Validate type parameter
      if (!type) {
        ResponseUtil.badRequest(res, "Type parameter is required. Valid types: careers, colleges, courses");
        return;
      }

      let result: { data: any[]; total: number };
      let message: string;

      // Get data based on type (lowercase)
      switch (type) {
        case 'careers':
          const careersResult = await this.exploreService.getCareers(userId, page, limit, search);
          result = { data: careersResult.careers, total: careersResult.total };
          message = "Careers retrieved successfully";
          break;

        case 'colleges':
          const collegesResult = await this.exploreService.getColleges(page, limit, search);
          result = { data: collegesResult.colleges, total: collegesResult.total };
          message = "Colleges retrieved successfully";
          break;

        case 'courses':
          const coursesResult = await this.exploreService.getCourses(userId, page, limit, search);
          result = { data: coursesResult.courses, total: coursesResult.total };
          message = "Courses retrieved successfully";
          break;

        default:
          ResponseUtil.badRequest(res, "Invalid type parameter. Valid types: careers, colleges, courses");
          return;
      }

      // Calculate pagination metadata
      const totalPages = Math.ceil(result.total / limit);
      const meta: PaginationMeta = {
        page,
        limit,
        totalPages,
        totalResults: result.total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };

      // Send paginated response
      ResponseUtil.paginated(res, result.data, meta, message);
    } catch (error) {
      next(error);
    }
  }
}

export default ExploreController;
