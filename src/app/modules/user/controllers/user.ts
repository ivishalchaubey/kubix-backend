import { Request, Response, NextFunction } from "express";
import ResponseUtil from "../../../utils/response.js";
import { API_MESSAGES, PAGINATION } from "../../../constants/enums.js";
import { PaginationMeta } from "../../../types/global.js";
import UserService from "../services/user.js";
class UserController {
  public userService: UserService;
  constructor() {
    this.userService = new UserService();
  }

  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }
      const UserId = req.user._id;
      const UserData = req.body;
      if (UserData.courseId) {
        const result = await this.userService.likeCourse(
          UserId,
          UserData.courseId
        );
      }
      if (UserData.bookmarkCourseId) {
        const result = await this.userService.bookmarkCourse(
          UserId,
          UserData.bookmarkCourseId
        );
      }

      const result = await this.userService.updateUser(UserId, UserData);

      ResponseUtil.success(res, result, API_MESSAGES.USER.User_UPDATED);
    } catch (error) {
      next(error);
    }
  }

  async getUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      let categoryId = req.query.categoryId;
      const Users = await this.userService.getUsers();
      if (categoryId) {
        const UsersByCategory = await this.userService.getUsersByCategory(
          categoryId as string
        );
        ResponseUtil.success(
          res,
          UsersByCategory,
          API_MESSAGES.USER.UserS_FETCHED
        );
      }
      ResponseUtil.success(res, Users, API_MESSAGES.USER.UserS_FETCHED);
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE);
      const limit = Math.min(
        PAGINATION.MAX_LIMIT,
        Math.max(1, parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT)
      );
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;
      const sortBy = req.query.sortBy as string | undefined;
      const sortOrder = req.query.sortOrder as string | undefined;

      const { users, total } = await this.userService.getAllUsers(
        page,
        limit,
        search,
        status,
        sortBy,
        sortOrder
      );

      const totalPages = Math.ceil(total / limit);
      const meta: PaginationMeta = {
        page,
        limit,
        totalPages,
        totalResults: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };

      ResponseUtil.paginated(res, users, meta, API_MESSAGES.USER.UserS_FETCHED);
    } catch (error) {
      next(error);
    }
  }

  async likedCourses(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }
      const UserId = req.user._id;
      const user = await this.userService.getLikedCourse(UserId, {});
      ResponseUtil.success(res, user, API_MESSAGES.USER.LIKED_COURSES_FETCHED);
    } catch (error) {
      next(error);
    }
  }

  async bookmarkedCourses(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }
      const UserId = req.user._id;
      const user = await this.userService.getBookmarkedCourses(UserId);
      ResponseUtil.success(
        res,
        user,
        API_MESSAGES.USER.BOOKMARKED_COURSES_FETCHED
      );
    } catch (error) {
      next(error);
    }
  }

  async updateToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }
      const UserId = req.user._id;

      const user = await this.userService.updateToken(UserId, req.body.token);
      ResponseUtil.success(res, user, API_MESSAGES.USER.TOKEN_UPDATED);
    } catch (error) {
      next(error);
    }
  }

  async getHomeData(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }
      const UserId = req.user._id;
      const user = await this.userService.getHomeData(UserId);
      ResponseUtil.success(res, user, API_MESSAGES.USER.HOME_DATA_FETCHED);
    } catch (error) {
      next(error);
    }
  }

  async getUserCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }
      const UserId = req.user._id;
      const categories = await this.userService.getUserCategories(UserId);
      ResponseUtil.success(res, categories, API_MESSAGES.USER.UserS_FETCHED);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }
      const UserId = req.user._id;
      await this.userService.deleteUser(UserId);
      ResponseUtil.success(res, null, API_MESSAGES.USER.User_DELETED);
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
