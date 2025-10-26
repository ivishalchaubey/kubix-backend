import { Types } from "mongoose";
import mongoose from "mongoose";
import User from "../../auth/models/User.js";
import { Course } from "../../courses/models/course.js";
import CategoryModel from "../../admin/categories/models/category.js";
import {
  HttpStatus,
  API_MESSAGES,
} from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";
import { UserRole } from "../../../constants/enums.js";

class ExploreRepository {
  
  /**
   * Get careers - siblings of ONLY user's selected categories
   * Only returns siblings of the specific categories user selected
   */
  async getCareers(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ careers: any[]; total: number }> {
    // Validate user
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (!user.categoryIds || user.categoryIds.length === 0) {
      return { careers: [], total: 0 };
    }

    // Get user's selected categories with their parentId
    const userCategories = await CategoryModel.find({
      _id: { $in: user.categoryIds }
    }).select('_id parentId').lean();

    if (userCategories.length === 0) {
      return { careers: [], total: 0 };
    }

    // For each user category, get all its siblings (categories with same parentId)
    const allSiblings: any[] = [];
    
    for (const userCategory of userCategories) {
      if (userCategory.parentId) {
        const siblings = await CategoryModel.find({
          parentId: userCategory.parentId
        }).lean();
        
        // Add siblings (but exclude the user's own selected category)
        siblings.forEach(sibling => {
          if (sibling._id.toString() !== userCategory._id.toString()) {
            allSiblings.push(sibling);
          }
        });
      }
    }

    // Remove duplicates
    let uniqueSiblings: any[] = Array.from(
      new Map(allSiblings.map(item => [item._id.toString(), item])).values()
    );

    // Apply search filter if provided
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase();
      uniqueSiblings = uniqueSiblings.filter(item => 
        item.name?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    const total = uniqueSiblings.length;
    const careers = uniqueSiblings.slice(skip, skip + limit);

    return { careers, total };
  }

  /**
   * Get all colleges (university users)
   */
  async getColleges(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ colleges: any[]; total: number }> {
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery: any = { role: UserRole.UNIVERSITY };
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      searchQuery.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { collegeName: searchRegex },
        { email: searchRegex },
        { location: searchRegex }
      ];
    }

    const colleges = await User.find(searchQuery)
      .select('-password -refreshToken -accessToken -otp -otpExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(searchQuery);

    return { colleges, total };
  }

  /**
   * Get courses relevant to user's selected categories
   * Populates categoryId with full category details
   */
  async getCourses(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ courses: any[]; total: number }> {
    // Validate user
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (!user.categoryIds || user.categoryIds.length === 0) {
      return { courses: [], total: 0 };
    }

    // Find all courses that match user's categoryIds
    const allCourses = [];
    
    for (const categoryId of user.categoryIds) {
      const courses = await Course.find({ categoryId })
        .populate('UniversityId')
        .populate('categoryId')
        .lean();
      allCourses.push(...courses);
    }

    // Remove duplicates
    let uniqueCourses = Array.from(
      new Map(allCourses.map(course => [course._id.toString(), course])).values()
    );

    // Apply search filter if provided
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase();
      uniqueCourses = uniqueCourses.filter(course =>
        course.name?.toLowerCase().includes(searchLower) ||
        course.description?.toLowerCase().includes(searchLower) ||
        course.duration?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    const total = uniqueCourses.length;
    const courses = uniqueCourses.slice(skip, skip + limit);

    return { courses, total };
  }
}

export default ExploreRepository;
