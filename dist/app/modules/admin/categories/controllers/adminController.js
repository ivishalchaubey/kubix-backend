import ResponseUtil from "../../../../utils/response.js";
import { API_MESSAGES } from '../../../../constants/enums';
import AdminService from '../services/adminService';
class AdminController {
    adminService;
    constructor() {
        this.adminService = new AdminService();
    }
    async createCategory(req, res, next) {
        try {
            const { description, degree, branch, course, courseStream, subject } = req.body;
            const result = await this.adminService.createCategory(req.body);
            ResponseUtil.created(res, result, API_MESSAGES.ADMIN_SUCCESS.CATEGORY_CREATED);
        }
        catch (error) {
            next(error);
        }
    }
    async updateCategory(req, res, next) {
        try {
            const categoryId = req.params.id;
            const categoryData = req.body;
            const result = await this.adminService.updateCategory(categoryId, categoryData);
            ResponseUtil.success(res, result, API_MESSAGES.ADMIN_SUCCESS.CATEGORY_UPDATED);
        }
        catch (error) {
            next(error);
        }
    }
}
export default AdminController;
//# sourceMappingURL=adminController.js.map