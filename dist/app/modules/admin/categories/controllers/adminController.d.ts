import { Request, Response, NextFunction } from "express";
import AdminService from "../services/adminService.js";
import AdminRepositories from "../repositories/adminRepositories.js";
declare class AdminController {
    adminService: AdminService;
    adminRepositories: AdminRepositories;
    constructor();
    createCategory(req: Request, res: Response, next: NextFunction): Promise<any>;
    uploadCategoriesFromCSV(req: Request, res: Response, next: NextFunction): Promise<any>;
    uploadCategoriesFromCSVUnderParent(req: Request, res: Response, next: NextFunction): Promise<any>;
    updateCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCategories(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserCategories(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export default AdminController;
//# sourceMappingURL=adminController.d.ts.map