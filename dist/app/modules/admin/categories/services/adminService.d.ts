import mongoose from "mongoose";
declare class AdminService {
    private adminRepositories;
    constructor();
    getCategories(): Promise<any>;
    getUserCategories(stream: string, board: string): Promise<any>;
    createCategory(categoryData: any[]): Promise<{
        message: string;
    }>;
    updateCategory(categoryId: string, categoryData: any): Promise<mongoose.FlattenMaps<import("../models/category.js").ICategory> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteCategory(categoryId: string): Promise<void>;
    getCategoryById(categoryId: string): Promise<mongoose.FlattenMaps<import("../models/category.js").ICategory> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
export default AdminService;
//# sourceMappingURL=adminService.d.ts.map