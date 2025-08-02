
import { Router } from "express";
import category from "../models/category";
interface IAdminService {
  getCategories(): Promise<any>;
    createCategory(categoryData: any): Promise<any>;
    updateCategory(categoryId: string, categoryData: any): Promise<any>;
    deleteCategory(categoryId: string): Promise<any>;
}

interface ICategory {
  description: string;  
    degree: string; // engineering, arts, science
    branch: string; // circuit branch ie(computer , electronics, electrical) and non-circuit branch (civil, mechanical, chemical)
    course: string; // computer science, electronics, electrical, civil, mechanical, chemical
    courseStream: string; // frontend, backend, database, operating system, data structure, algorithm , drawing engineering, etc
    subject: string; // data structure, algorithm, operating system, etc
}

class AdminService {
  // Define the service methods here
  async getCategories() {
    // Logic to get categories
  }

  async createCategory(categoryData : ICategory) {
    // Logic to create a new category
  }

  async updateCategory(categoryId : string, categoryData : ICategory) {
    // Logic to update an existing category
  }

  async deleteCategory(categoryId : string) {
    // Logic to delete a category
  }
}

export default AdminService;