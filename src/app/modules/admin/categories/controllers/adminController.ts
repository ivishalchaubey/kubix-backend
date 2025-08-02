import { Request, Response, NextFunction } from 'express';
import ResponseUtil from "../../../../utils/response.js";
import { API_MESSAGES } from '../../../../constants/enums';
import AdminService from '../services/adminService';
class AdminController {
    private adminService: AdminService;
    constructor() {
        this.adminService = new AdminService();
        // this.adminService = new AdminService();
        // Initialize any necessary properties or services here
    }

    async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {   
            const { description , degree , branch, course , courseStream , subject } = req.body;

            const result = await this.adminService.createCategory(req.body);

            ResponseUtil.created(res, result, API_MESSAGES.ADMIN_SUCCESS.CATEGORY_CREATED);
        } catch (error) {
            next(error);
        }
    }

  // Add your methods here
}