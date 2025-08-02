export interface ICategory {
    description: string;
    degree: string;
    branch: string;
    course: string;
    courseStream: string;
    subject: string;
}
declare class AdminService {
    getCategories(): Promise<(import("mongoose").Document<unknown, {}, import("../models/category.js").ICategory, {}> & import("../models/category.js").ICategory & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    createCategory(categoryData: any): Promise<import("mongoose").Document<unknown, {}, import("../models/category.js").ICategory, {}> & import("../models/category.js").ICategory & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    updateCategory(categoryId: string, categoryData: any): Promise<void>;
    deleteCategory(categoryId: string): Promise<void>;
    getCategoryById(categoryId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/category.js").ICategory, {}> & import("../models/category.js").ICategory & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
}
export default AdminService;
//# sourceMappingURL=adminService.d.ts.map