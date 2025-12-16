import { Request, Response, NextFunction } from "express";
import ResponseUtil from "../../../utils/response.js";
import { API_MESSAGES, HttpStatus } from "../../../constants/enums.js";
import CategoryService from "../services/categoryService.js";

class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  /**
   * POST /api/v1/categories
   * Get categories based on selected_categories array
   */
  async getCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { selected_categories = [] } = req.body;

      // Validate selected_categories is an array
      if (!Array.isArray(selected_categories)) {
        ResponseUtil.badRequest(
          res,
          "selected_categories must be an array"
        );
        return;
      }

      // Validate all items in selected_categories are strings (IDs)
      if (
        selected_categories.length > 0 &&
        !selected_categories.every((id) => typeof id === "string")
      ) {
        ResponseUtil.badRequest(
          res,
          "All items in selected_categories must be strings (category IDs)"
        );
        return;
      }

      const result = await this.categoryService.getCategories(
        selected_categories
      );

      // Build response with isLastNode at top level (same level as success, message, data)
      const response: any = {
        success: true,
        message: API_MESSAGES.ADMIN_SUCCESS.CATEGORIES_FETCHED,
        data: result.data,
        statusCode: HttpStatus.OK,
      };

      // Add isLastNode to response if all categories are last nodes
      if (result.isLastNode) {
        response.isLastNode = true;
      }

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default CategoryController;

