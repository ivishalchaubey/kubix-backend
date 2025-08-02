import category from "../models/category";
class AdminService {
    async getCategories() {
    }
    async createCategory(categoryData) {
        const newCategory = new category(categoryData);
        await newCategory.save();
        return newCategory;
    }
    async updateCategory(categoryId, categoryData) {
    }
    async deleteCategory(categoryId) {
    }
}
export default AdminService;
//# sourceMappingURL=adminService.js.map