
import { Router } from "express";
import category from "../models/category.js";

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
  // Define the service methods here
  async getCategories() {
    // Logic to get categories
  }

  async createCategory(categoryData : any) {
    console.log("Creating category with data:", categoryData);
    const newCategory = new category(categoryData);
    await newCategory.save();
    return newCategory;
    // Logic to create a new category
  }

  async updateCategory(categoryId : string, categoryData : any) {
    const updatedCategory = await category.findByIdAndUpdate(
      categoryId, 
      categoryData, 
      { new: true }
    );
    if (!updatedCategory) {
      throw new Error("Category not found");
    }
    // Logic to update an existing category
  }

  async deleteCategory(categoryId : string) {
    // Logic to delete a category
  }
  async getCategoryById(categoryId : string) {
    const categoryData = await category.findById(categoryId);
    if (!categoryData) {
      throw new Error("Category not found");
    }
    return categoryData;
    // Logic to get a category by ID
  }
  
}

export default AdminService;