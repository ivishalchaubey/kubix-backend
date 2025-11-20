import mongoose from "mongoose";
import CategoryModel from "../../admin/categories/models/category.js";
import { ICategory } from "../../admin/categories/models/category.js";

class CategoryRepository {
  constructor() {}

  /**
   * Get parent categories (categories with no parentId)
   */
  async getParentCategories(): Promise<{
    categories: ICategory[];
    isLastNode: boolean;
  }> {
    const categories = await CategoryModel.find({
      $or: [{ parentId: { $exists: false } }, { parentId: null }],
    }).lean();

    // Check if each category has children and add isLastNode flag
    const categoriesWithLastNode = await Promise.all(
      categories.map(async (category: any) => {
        const hasChildren = await CategoryModel.exists({
          parentId: category._id,
        });
        return {
          ...category,
          isLastNode: !hasChildren || category.isLeafNode === true,
        } as any;
      })
    );

    // Check if all categories are last nodes (have no children)
    const allAreLastNodes =
      categoriesWithLastNode.length > 0 &&
      categoriesWithLastNode.every(
        (cat) => cat.isLastNode === true || cat.isLeafNode === true
      );

    return {
      categories: categoriesWithLastNode as any,
      isLastNode: allAreLastNodes,
    };
  }

  /**
   * Get children of selected categories grouped by parent category name
   */
  async getChildrenByParentIds(parentIds: string[]): Promise<{
    grouped: { [parentName: string]: ICategory[] };
    isLastNode: boolean;
  }> {
    const objectIds = parentIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // Fetch parent categories to get their names
    const parentCategories = await CategoryModel.find({
      _id: { $in: objectIds },
    }).lean();

    // Create a map of parentId to parentName
    const parentIdToNameMap: { [parentId: string]: string } = {};
    parentCategories.forEach((parent) => {
      parentIdToNameMap[parent._id.toString()] = parent.name;
    });

    // Fetch children of selected categories
    const categories = await CategoryModel.find({
      parentId: { $in: objectIds },
    }).lean();

    // Check if each category has children and add isLastNode flag
    const categoriesWithLastNode = await Promise.all(
      categories.map(async (category: any) => {
        const hasChildren = await CategoryModel.exists({
          parentId: category._id,
        });
        return {
          ...category,
          isLastNode: !hasChildren || category.isLeafNode === true,
        } as any;
      })
    );

    // Group categories by parent category name
    const grouped: { [parentName: string]: ICategory[] } = {};
    categoriesWithLastNode.forEach((category) => {
      const parentId = category.parentId?.toString() || "";
      const parentName = parentIdToNameMap[parentId] || "Unknown";
      
      if (!grouped[parentName]) {
        grouped[parentName] = [];
      }
      grouped[parentName].push(category);
    });

    // Also include parent categories that have no children (empty arrays)
    parentCategories.forEach((parent) => {
      const parentName = parent.name;
      if (!grouped[parentName]) {
        grouped[parentName] = [];
      }
    });

    // Check if all categories are last nodes (have no children)
    const allAreLastNodes =
      categoriesWithLastNode.length > 0 &&
      categoriesWithLastNode.every(
        (cat) => cat.isLastNode === true || cat.isLeafNode === true
      );

    return {
      grouped,
      isLastNode: allAreLastNodes,
    };
  }
}

export default CategoryRepository;

