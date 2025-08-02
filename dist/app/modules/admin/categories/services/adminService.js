import category from "../models/category.js";
class AdminService {
    async getCategories() {
        const categories = await category.find({});
        return categories;
    }
    async createCategory(categoryData) {
        console.log("Creating category with data:", categoryData);
        const newCategory = new category(categoryData);
        await newCategory.save();
        return newCategory;
    }
    async updateCategory(categoryId, categoryData) {
        const updatedCategory = await category.findByIdAndUpdate(categoryId, categoryData, { new: true });
        if (!updatedCategory) {
            throw new Error("Category not found");
        }
    }
    async deleteCategory(categoryId) {
    }
    async getCategoryById(categoryId) {
        const categoryData = await category.findById(categoryId);
        if (!categoryData) {
            throw new Error("Category not found");
        }
        return categoryData;
    }
}
export default AdminService;
//# sourceMappingURL=adminService.js.map