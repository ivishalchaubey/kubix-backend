import { Request, Response, NextFunction } from "express";
import ResponseUtil from "../../../../utils/response.js";
import { API_MESSAGES } from "../../../../constants/enums.js";
import AdminService from "../services/adminService.js";
import AdminRepositories from "../repositories/adminRepositories.js";
class AdminController {
  public adminService: AdminService;
  public adminRepositories: AdminRepositories;
  constructor() {
    this.adminService = new AdminService();
    this.adminRepositories = new AdminRepositories();
  }

  async createCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      // Handle both array and single object requests
      const categoryData = Array.isArray(req.body) ? req.body[0] : req.body;
      
      if (!categoryData) {
        return ResponseUtil.badRequest(res, "Category data is required");
      }

      const result = await this.adminRepositories.createSingleCategory(
        categoryData
      );
      ResponseUtil.created(
        res,
        result,
        API_MESSAGES.ADMIN_SUCCESS.CATEGORY_CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  async uploadCategoriesFromCSV(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      if (!req.file) {
        return ResponseUtil.badRequest(res, "CSV file is required");
      }

      const result = await this.adminRepositories.saveCategoriesFromCSV(
        req.file
      );
      ResponseUtil.created(
        res,
        { result },
        "Categories uploaded successfully from CSV"
      );
    } catch (error) {
      next(error);
    }
  }

  async uploadCategoriesFromCSVUnderParent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      // Validate file
      if (!req.file) {
        return ResponseUtil.badRequest(res, "CSV file is required");
      }

      // Validate file type
      if (
        !req.file.mimetype.includes("csv") &&
        !req.file.originalname.toLowerCase().endsWith(".csv")
      ) {
        return ResponseUtil.badRequest(res, "File must be a CSV file");
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        return ResponseUtil.badRequest(res, "File size must be less than 5MB");
      }

      const { parentId, order } = req.body;

      // Validate parentId
      if (!parentId || parentId.trim() === "") {
        return ResponseUtil.badRequest(res, "Parent ID is required");
      }

      // Validate parentId format (should be a valid MongoDB ObjectId)
      if (!/^[0-9a-fA-F]{24}$/.test(parentId)) {
        return ResponseUtil.badRequest(
          res,
          "Parent ID must be a valid MongoDB ObjectId"
        );
      }

      // Validate order
      if (!order || isNaN(Number(order)) || Number(order) < 1) {
        return ResponseUtil.badRequest(
          res,
          "Order must be a valid positive number"
        );
      }

      const result =
        await this.adminRepositories.saveCategoriesFromCSVUnderParent(
          req.file,
          parentId,
          Number(order)
        );
      ResponseUtil.created(
        res,
        { result },
        "Categories uploaded successfully under parent from CSV"
      );
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categoryId = req.params.id;
      const categoryData = req.body;

      const result = await this.adminService.updateCategory(
        categoryId,
        categoryData
      );

      ResponseUtil.success(
        res,
        result,
        API_MESSAGES.ADMIN_SUCCESS.CATEGORY_UPDATED
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categoryId = req.params.id;

      await this.adminService.deleteCategory(categoryId);

      ResponseUtil.success(
        res,
        null,
        API_MESSAGES.ADMIN_SUCCESS.CATEGORY_DELETED
      );
    } catch (error) {
      next(error);
    }
  }

  async getCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categories = await this.adminService.getCategories();
      ResponseUtil.success(
        res,
        categories,
        API_MESSAGES.ADMIN_SUCCESS.CATEGORIES_FETCHED
      );
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
      if (!req.user) {
        ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
        return;
      }
      let stream = req.user.stream;
      let board = req.user.board;
      if (!stream || !board) {
        ResponseUtil.badRequest(res, "Stream and board are required");
        return;
      }
      const categories = await this.adminService.getUserCategories(
        stream,
        board
      );
      ResponseUtil.success(
        res,
        categories,
        API_MESSAGES.ADMIN_SUCCESS.CATEGORIES_FETCHED
      );
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categoryId = req.params.id;

      const category = await this.adminService.getCategoryById(categoryId);

      if (!category) {
        ResponseUtil.notFound(res, API_MESSAGES.ADMIN_ERROR.CATEGORY_NOT_FOUND);
      }

      ResponseUtil.success(
        res,
        category,
        API_MESSAGES.ADMIN_SUCCESS.CATEGORY_FETCHED
      );
    } catch (error) {
      next(error);
    }
  }
}

export default AdminController;
