import { Router } from "express";
import category from "../models/category.js";
import AdminRepositories from "../repositories/adminRepositories.js";
import { promises } from "dns";
export interface ICategory {
  description: string;
  degree: string; // engineering, arts, science
  branch: string; // circuit branch ie(computer , electronics, electrical) and non-circuit branch (civil, mechanical, chemical)
  course: string; // computer science, electronics, electrical, civil, mechanical, chemical
  courseStream: string; // frontend, backend, database, operating system, data structure, algorithm , drawing engineering, etc
  subject: string; // data structure, algorithm, operating system, etc
}

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
    const updatedCategory = await category.findByIdAndUpdate(
      categoryId,
      categoryData,
      { new: true }
    );
    if (!updatedCategory) {
      throw new Error("Category not found");
    }
  }

  async deleteCategory(categoryId: string) {
    // Logic to delete a category
  }
  async getCategoryById(categoryId: string) {
    const categoryData = await category.findById(categoryId);
    if (!categoryData) {
      throw new Error("Category not found");
    }
    return categoryData;
    // Logic to get a category by ID
  }
}

export default AdminService;
