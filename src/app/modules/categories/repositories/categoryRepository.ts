import mongoose from "mongoose";
import CategoryModel from "../../admin/categories/models/category.js";
import { ICategory } from "../../admin/categories/models/category.js";

class CategoryRepository {
  constructor() {}

  /**
   * Helper function to filter valid ObjectIds from an array
   */
  private filterValidObjectIds(items: any[]): mongoose.Types.ObjectId[] {
    if (!items || !Array.isArray(items)) return [];
    return items
      .filter((item) => {
        if (typeof item === 'string') {
          return mongoose.Types.ObjectId.isValid(item);
        }
        if (item instanceof mongoose.Types.ObjectId) {
          return true;
        }
        return false;
      })
      .map((item) => {
        if (typeof item === 'string') {
          return new mongoose.Types.ObjectId(item);
        }
        return item;
      });
  }

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
    // Also filter out invalid related_careers values (non-ObjectIds) and populate valid ones
    const categoriesWithLastNode = await Promise.all(
      categories.map(async (category: any) => {
        const hasChildren = await CategoryModel.exists({
          parentId: category._id,
        });
        
        // Filter and populate related_careers (categories)
        if (category.related_careers && Array.isArray(category.related_careers)) {
          const validIds = this.filterValidObjectIds(category.related_careers);
          if (validIds.length > 0) {
            try {
              const populated = await CategoryModel.find({ _id: { $in: validIds } }).lean();
              category.related_careers = populated;
            } catch (error) {
              // If population fails, set to empty array
              category.related_careers = [];
            }
          } else {
            category.related_careers = [];
          }
        } else {
          category.related_careers = [];
        }
        
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
    // Also filter out invalid related_careers values (non-ObjectIds) and populate valid ones
    const categoriesWithLastNode = await Promise.all(
      categories.map(async (category: any) => {
        const hasChildren = await CategoryModel.exists({
          parentId: category._id,
        });
        
        // Filter and populate related_careers (categories)
        if (category.related_careers && Array.isArray(category.related_careers)) {
          const validIds = this.filterValidObjectIds(category.related_careers);
          if (validIds.length > 0) {
            try {
              const populated = await CategoryModel.find({ _id: { $in: validIds } }).lean();
              category.related_careers = populated;
            } catch (error) {
              // If population fails, set to empty array
              category.related_careers = [];
            }
          } else {
            category.related_careers = [];
          }
        } else {
          category.related_careers = [];
        }
        
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

