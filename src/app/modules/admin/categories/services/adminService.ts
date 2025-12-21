import { Router } from "express";
import mongoose from "mongoose";
import category from "../models/category.js";
import AdminRepositories from "../repositories/adminRepositories.js";
// This interface is no longer used - using ICategory from models/category.ts instead

interface IAdminService {
  getCategories(): Promise<any>;
  createCategory(categoryData: any): void;
  updateCategory(categoryId: string, categoryData: any): Promise<any>;
  deleteCategory(categoryId: string): Promise<any>;
}

class AdminService {
  private adminRepositories: AdminRepositories;
  constructor() {
    this.adminRepositories = new AdminRepositories();
  }
  // Define the service methods here
  async getCategories(): Promise<any> {
    // Logic to get categories
    const categories = await this.adminRepositories.getAllCategories();
    return categories;
  }
  async getUserCategories(stream: string, board: string): Promise<any> {
    const categories = await this.adminRepositories.getUserCategories(
      stream,
      board
    );
    return categories;
  }

  async createCategory(categoryData: any[]) {
    let orderToIdMap: any = {};
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

  async updateCategory(categoryId: string, categoryData: any) {
    // Helper function to ensure array fields are arrays
    const ensureArray = (value: any): string[] => {
      if (Array.isArray(value)) return value;
      if (typeof value === "string" && value.trim()) return [value];
      return [];
    };

    // Ensure array fields are properly formatted
    if (categoryData.pros !== undefined) {
      categoryData.pros = ensureArray(categoryData.pros);
    }
    if (categoryData.cons !== undefined) {
      categoryData.cons = ensureArray(categoryData.cons);
    }
    if (categoryData.technical_skills !== undefined) {
      categoryData.technical_skills = ensureArray(
        categoryData.technical_skills
      );
    }
    if (categoryData.soft_skills !== undefined) {
      categoryData.soft_skills = ensureArray(categoryData.soft_skills);
    }
    if (categoryData.qualifying_exams !== undefined) {
      categoryData.qualifying_exams = ensureArray(
        categoryData.qualifying_exams
      );
    }
    if (categoryData.checklist !== undefined) {
      categoryData.checklist = ensureArray(categoryData.checklist);
    }
    if (categoryData.potential_earnings !== undefined) {
      categoryData.potential_earnings = ensureArray(
        categoryData.potential_earnings
      );
    }

    // Filter and convert related_careers to ObjectIds if they are valid strings
    if (
      categoryData.related_careers &&
      Array.isArray(categoryData.related_careers)
    ) {
      categoryData.related_careers = categoryData.related_careers
        .filter((id: any) => {
          if (typeof id === "string") {
            return mongoose.Types.ObjectId.isValid(id);
          }
          return id instanceof mongoose.Types.ObjectId;
        })
        .map((id: string | mongoose.Types.ObjectId) => {
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

    // Manually populate related_careers with error handling (categories)
    if (
      updatedCategory.related_careers &&
      Array.isArray(updatedCategory.related_careers) &&
      updatedCategory.related_careers.length > 0
    ) {
      try {
        const Category = mongoose.model("Category");
        const validIds = updatedCategory.related_careers.filter((id: any) =>
          mongoose.Types.ObjectId.isValid(id)
        );
        if (validIds.length > 0) {
          const populated = await Category.find({
            _id: { $in: validIds },
          }).lean();
          (updatedCategory as any).related_careers = populated;
        } else {
          (updatedCategory as any).related_careers = [];
        }
      } catch (error) {
        (updatedCategory as any).related_careers = [];
      }
    } else {
      (updatedCategory as any).related_careers = [];
    }

    return updatedCategory;
  }

  async deleteCategory(categoryId: string) {
    // here we have delete categoryId delete all the
    // get all the children from this
    let children = await this.adminRepositories.getAllChildrenByParentId(
      categoryId
    );
    if (children.length > 0) {
      for (const child of children) {
        await this.adminRepositories.deleteCategory(child._id.toString());
      }
    }
    await this.adminRepositories.deleteCategory(categoryId);

    // Logic to delete a category
  }
  async getCategoryById(categoryId: string) {
    const categoryData = await category.findById(categoryId).lean();
    if (!categoryData) {
      throw new Error("Category not found");
    }

    // Manually populate related_careers with error handling (categories)
    if (
      categoryData.related_careers &&
      Array.isArray(categoryData.related_careers) &&
      categoryData.related_careers.length > 0
    ) {
      try {
        const Category = mongoose.model("Category");
        const validIds = categoryData.related_careers.filter((id: any) =>
          mongoose.Types.ObjectId.isValid(id)
        );
        if (validIds.length > 0) {
          const populated = await Category.find({
            _id: { $in: validIds },
          }).lean();
          (categoryData as any).related_careers = populated;
        } else {
          (categoryData as any).related_careers = [];
        }
      } catch (error) {
        (categoryData as any).related_careers = [];
      }
    } else {
      (categoryData as any).related_careers = [];
    }

    return categoryData;
  }
}

export default AdminService;
