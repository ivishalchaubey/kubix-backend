import mongoose from "mongoose";
import category from "../models/category.js";
import AdminRepositories from "../repositories/adminRepositories.js";
class AdminService {
    adminRepositories;
    constructor() {
        this.adminRepositories = new AdminRepositories();
    }
    async getCategories() {
        const categories = await this.adminRepositories.getAllCategories();
        return categories;
    }
    async getUserCategories(stream, board) {
        const categories = await this.adminRepositories.getUserCategories(stream, board);
        return categories;
    }
    async createCategory(categoryData) {
        let orderToIdMap = {};
        for (const data of categoryData) {
            if (data.order > 1) {
                const parentOrder = data.order - 1;
                data.parentId = orderToIdMap[parentOrder];
            }
            const newCategory = new category(data);
            const savedCategory = await newCategory.save();
            orderToIdMap[data.order] = savedCategory._id.toString();
        }
        return { message: "Category created successfully" };
    }
    async updateCategory(categoryId, categoryData) {
        const ensureArray = (value) => {
            if (Array.isArray(value))
                return value;
            if (typeof value === "string" && value.trim())
                return [value];
            return [];
        };
        if (categoryData.pros !== undefined) {
            categoryData.pros = ensureArray(categoryData.pros);
        }
        if (categoryData.cons !== undefined) {
            categoryData.cons = ensureArray(categoryData.cons);
        }
        if (categoryData.technical_skills !== undefined) {
            categoryData.technical_skills = ensureArray(categoryData.technical_skills);
        }
        if (categoryData.soft_skills !== undefined) {
            categoryData.soft_skills = ensureArray(categoryData.soft_skills);
        }
        if (categoryData.qualifying_exams !== undefined) {
            categoryData.qualifying_exams = ensureArray(categoryData.qualifying_exams);
        }
        if (categoryData.checklist !== undefined) {
            categoryData.checklist = ensureArray(categoryData.checklist);
        }
        if (categoryData.potential_earnings !== undefined) {
            categoryData.potential_earnings = ensureArray(categoryData.potential_earnings);
        }
        if (categoryData.related_careers &&
            Array.isArray(categoryData.related_careers)) {
            categoryData.related_careers = categoryData.related_careers
                .filter((id) => {
                if (typeof id === "string") {
                    return mongoose.Types.ObjectId.isValid(id);
                }
                return id instanceof mongoose.Types.ObjectId;
            })
                .map((id) => {
                if (typeof id === "string") {
                    return new mongoose.Types.ObjectId(id);
                }
                return id;
            });
        }
        const updatedCategory = await category
            .findByIdAndUpdate(categoryId, categoryData, { new: true })
            .lean();
        if (!updatedCategory) {
            throw new Error("Category not found");
        }
        if (updatedCategory.related_careers &&
            Array.isArray(updatedCategory.related_careers) &&
            updatedCategory.related_careers.length > 0) {
            try {
                const Category = mongoose.model("Category");
                const validIds = updatedCategory.related_careers.filter((id) => mongoose.Types.ObjectId.isValid(id));
                if (validIds.length > 0) {
                    const populated = await Category.find({
                        _id: { $in: validIds },
                    }).lean();
                    updatedCategory.related_careers = populated;
                }
                else {
                    updatedCategory.related_careers = [];
                }
            }
            catch (error) {
                updatedCategory.related_careers = [];
            }
        }
        else {
            updatedCategory.related_careers = [];
        }
        return updatedCategory;
    }
    async deleteCategory(categoryId) {
        let children = await this.adminRepositories.getAllChildrenByParentId(categoryId);
        if (children.length > 0) {
            for (const child of children) {
                await this.adminRepositories.deleteCategory(child._id.toString());
            }
        }
        await this.adminRepositories.deleteCategory(categoryId);
    }
    async getCategoryById(categoryId) {
        const categoryData = await category.findById(categoryId).lean();
        if (!categoryData) {
            throw new Error("Category not found");
        }
        if (categoryData.related_careers &&
            Array.isArray(categoryData.related_careers) &&
            categoryData.related_careers.length > 0) {
            try {
                const Category = mongoose.model("Category");
                const validIds = categoryData.related_careers.filter((id) => mongoose.Types.ObjectId.isValid(id));
                if (validIds.length > 0) {
                    const populated = await Category.find({
                        _id: { $in: validIds },
                    }).lean();
                    categoryData.related_careers = populated;
                }
                else {
                    categoryData.related_careers = [];
                }
            }
            catch (error) {
                categoryData.related_careers = [];
            }
        }
        else {
            categoryData.related_careers = [];
        }
        return categoryData;
    }
}
export default AdminService;
//# sourceMappingURL=adminService.js.map