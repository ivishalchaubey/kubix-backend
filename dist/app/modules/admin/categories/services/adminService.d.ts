export interface ICategory {
    description: string;
    degree: string;
    branch: string;
    course: string;
    courseStream: string;
    subject: string;
}
declare class AdminService {
    getCategories(): Promise<void>;
    createCategory(categoryData: any): Promise<import("mongoose").Document<unknown, {}, import("../models/category").ICategory, {}> & import("../models/category").ICategory & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    updateCategory(categoryId: string, categoryData: any): Promise<void>;
    deleteCategory(categoryId: string): Promise<void>;
}
export default AdminService;
//# sourceMappingURL=adminService.d.ts.map