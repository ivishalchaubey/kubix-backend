import { Request, Response, NextFunction } from 'express';
import AdminService from '../services/adminService';
declare class AdminController {
    adminService: AdminService;
    constructor();
    createCategory(req: Request, res: Response, next: NextFunction): Promise<any>;
    updateCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export default AdminController;
//# sourceMappingURL=adminController.d.ts.map