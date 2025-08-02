import { Request, Response, NextFunction } from 'express';
import ResponseUtil from "../../../../utils/response.js";
import { API_MESSAGES } from '../../../../constants/enums.js';
import AdminService from '../services/adminService.js';
class AdminController {
    public adminService: AdminService;
    constructor() {
        this.adminService = new AdminService();
    }

    async createCategory(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {   
            const { description , degree , branch, course , courseStream , subject } = req.body;

            const result = await this.adminService.createCategory(req.body);

            ResponseUtil.created(res, result, API_MESSAGES.ADMIN_SUCCESS.CATEGORY_CREATED);
        } catch (error) {
            next(error);
        }
    }


    async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const categoryId = req.params.id;
            const categoryData = req.body;

            const result = await this.adminService.updateCategory(categoryId, categoryData);

            ResponseUtil.success(res, result, API_MESSAGES.ADMIN_SUCCESS.CATEGORY_UPDATED);
        } catch (error) {
            next(error);
        }
    }

    async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const categoryId = req.params.id;

            await this.adminService.deleteCategory(categoryId);

            ResponseUtil.success(res, null, API_MESSAGES.ADMIN_SUCCESS.CATEGORY_DELETED);
        } catch (error) {
            next(error);
        }
    }

    async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const categories = await this.adminService.getCategories();

            ResponseUtil.success(res, categories, API_MESSAGES.ADMIN_SUCCESS.CATEGORIES_FETCHED);
        } catch (error) {
            next(error);
        }
    }

    async getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {   
            const categoryId = req.params.id;

            const category = await this.adminService.getCategoryById(categoryId);

            if (!category) {
                 ResponseUtil.notFound(res, API_MESSAGES.ADMIN_ERROR.CATEGORY_NOT_FOUND);
            }

            ResponseUtil.success(res, category, API_MESSAGES.ADMIN_SUCCESS.CATEGORY_FETCHED);
        } catch (error) {
            next(error);
        }
    }

    // You can add more methods here as needed, such as for getting categories by specific criteria



  // Add your methods here
}

export default AdminController;