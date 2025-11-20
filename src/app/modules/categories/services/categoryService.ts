import CategoryRepository from "../repositories/categoryRepository.js";

class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  /**
   * Get categories based on selected_categories array
   * - If selected_categories is empty, return parent categories
   * - If selected_categories has IDs, return children of those categories grouped by parent name (standardized format)
   */
  async getCategories(selectedCategories: string[]): Promise<{
    data: any;
    isLastNode: boolean;
  }> {
    if (!selectedCategories || selectedCategories.length === 0) {
      // Return parent categories (categories with no parentId)
      const result = await this.categoryRepository.getParentCategories();
      return {
        data: result.categories,
        isLastNode: result.isLastNode,
      };
    } else {
      // Return children of selected categories grouped by parent category name (standardized format)
      const result = await this.categoryRepository.getChildrenByParentIds(
        selectedCategories
      );
      
      // Always return grouped structure by parent name (standardized format)
      return {
        data: result.grouped,
        isLastNode: result.isLastNode,
      };
    }
  }
}

export default CategoryService;

