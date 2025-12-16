import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/global.js";
import ResponseUtil from "../../../utils/response.js";
import { API_MESSAGES, PAGINATION } from "../../../constants/enums.js";
import ShortlistService from "../services/shortlist.service.js";
import { ShortlistType } from "../models/shortlist.model.js";

class ShortlistController {
  public shortlistService: ShortlistService;

  constructor() {
    this.shortlistService = new ShortlistService();
  }

  // Create or toggle shortlist item
  async createShortlist(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }

      const { id, type } = req.body;

      if (!id || !type) {
        ResponseUtil.badRequest(
          res,
          "Both 'id' and 'type' are required fields"
        );
        return;
      }

      const userId = req.user._id;
      const result = await this.shortlistService.createShortlist(
        userId,
        id,
        type as ShortlistType
      );

      const message = result.shortlisted
        ? API_MESSAGES.SHORTLIST.ITEM_SHORTLISTED
        : API_MESSAGES.SHORTLIST.ITEM_REMOVED;

      ResponseUtil.success(res, result, message);
    } catch (error) {
      next(error);
    }
  }

  // Get all shortlisted items with optional type filter and pagination
  async getShortlists(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }

      const userId = req.user._id;
      const itemType = req.query.type as ShortlistType | undefined;

      // Parse pagination parameters
      const pageParam = req.query.page ?? PAGINATION.DEFAULT_PAGE.toString();
      const limitParam = req.query.limit ?? PAGINATION.DEFAULT_LIMIT.toString();

      const pageStr = Array.isArray(pageParam)
        ? String(pageParam[0])
        : String(pageParam);
      const limitStr = Array.isArray(limitParam)
        ? String(limitParam[0])
        : String(limitParam);

      const page = parseInt(pageStr, 10) || PAGINATION.DEFAULT_PAGE;
      const limit =
        Math.min(parseInt(limitStr, 10) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT) ||
        PAGINATION.DEFAULT_LIMIT;

      const result = await this.shortlistService.getShortlists(
        userId,
        itemType,
        page,
        limit
      );

      ResponseUtil.paginated(
        res,
        result.data,
        result.pagination,
        API_MESSAGES.SHORTLIST.SHORTLISTS_FETCHED
      );
    } catch (error) {
      next(error);
    }
  }

  // Get shortlist by ID
  async getShortlistById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }

      const userId = req.user._id;
      const shortlistId = req.params.id;

      const result = await this.shortlistService.getShortlistById(
        userId,
        shortlistId
      );

      ResponseUtil.success(
        res,
        result,
        API_MESSAGES.SHORTLIST.SHORTLIST_FETCHED
      );
    } catch (error) {
      next(error);
    }
  }

  // Check if item is shortlisted
  async checkShortlisted(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }

      const userId = req.user._id;
      const { id, type } = req.query;

      if (!id || !type) {
        ResponseUtil.badRequest(
          res,
          "Both 'id' and 'type' query parameters are required"
        );
        return;
      }

      const isShortlisted = await this.shortlistService.isShortlisted(
        userId,
        id as string,
        type as ShortlistType
      );

      ResponseUtil.success(res, { isShortlisted }, API_MESSAGES.SHORTLIST.CHECK_SUCCESS);
    } catch (error) {
      next(error);
    }
  }

  // Delete shortlist by ID
  async deleteShortlist(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }

      const userId = req.user._id;
      const shortlistId = req.params.id;

      await this.shortlistService.deleteShortlist(userId, shortlistId);

      ResponseUtil.success(
        res,
        null,
        API_MESSAGES.SHORTLIST.SHORTLIST_DELETED
      );
    } catch (error) {
      next(error);
    }
  }
}

export default ShortlistController;

