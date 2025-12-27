import { Types } from "mongoose";
import User from "../../auth/models/User.js";
import { Course } from "../../courses/models/course.js";
import CategoryModel from "../../admin/categories/models/category.js";
import { Webinar } from "../../webinar/models/webinar.model.js";
import { HttpStatus, API_MESSAGES } from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";
import { UserRole } from "../../../constants/enums.js";
import { Shortlist } from "../../shortlist/models/shortlist.model.js";

class ExploreRepository {
  /**
   * Get user's shortlisted item IDs for a specific type
   */
  private async getUserShortlistedIds(
    userId: string,
    itemType: "career" | "colleges" | "course"
  ): Promise<string[]> {
    if (!Types.ObjectId.isValid(userId)) {
      return [];
    }

    const shortlists = await Shortlist.find({
      userId: new Types.ObjectId(userId),
      itemType: itemType,
    })
      .select("itemId")
      .lean();

    return shortlists.map((s) => s.itemId.toString());
  }

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
      throw new AppError(
        API_MESSAGES.ERROR.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      throw new AppError(
        API_MESSAGES.ERROR.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    if (!user.categoryIds || user.categoryIds.length === 0) {
      return { careers: [], total: 0 };
    }

    // Get user's selected categories with their parentId
    const userCategories = await CategoryModel.find({
      _id: { $in: user.categoryIds },
    })
      .select("_id parentId")
      .lean();

    if (userCategories.length === 0) {
      return { careers: [], total: 0 };
    }

    // For each user category, get all its siblings (categories with same parentId)
    const allSiblings: any[] = [];

    for (const userCategory of userCategories) {
      if (userCategory.parentId) {
        const siblings = await CategoryModel.find({
          parentId: userCategory.parentId,
        }).lean();

        // Add siblings (but exclude the user's own selected category)
        siblings.forEach((sibling) => {
          if (sibling._id.toString() !== userCategory._id.toString()) {
            allSiblings.push(sibling);
          }
        });
      }
    }

    // Remove duplicates
    let uniqueSiblings: any[] = Array.from(
      new Map(allSiblings.map((item) => [item._id.toString(), item])).values()
    );

    // Apply search filter if provided
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase();
      uniqueSiblings = uniqueSiblings.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    const total = uniqueSiblings.length;
    const careers = uniqueSiblings.slice(skip, skip + limit);

    // Get user's shortlisted career IDs
    const shortlistedCareerIds = await this.getUserShortlistedIds(userId, "career");

    // Add isShortlisted field to each career
    const careersWithShortlist = careers.map((career) => ({
      ...career,
      isShortlisted: shortlistedCareerIds.includes(career._id.toString()),
    }));

    return { careers: careersWithShortlist, total };
  }

  /**
   * Get all colleges (university users)
   */
  async getColleges(
    userId: string,
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
        { location: searchRegex },
      ];
    }

    const colleges = await User.find(searchQuery)
      .select("-password -refreshToken -accessToken -otp -otpExpires")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(searchQuery);

    // Get user's shortlisted college IDs
    const shortlistedCollegeIds = await this.getUserShortlistedIds(userId, "colleges");

    // Add isShortlisted field to each college
    const collegesWithShortlist = colleges.map((college) => ({
      ...college,
      isShortlisted: shortlistedCollegeIds.includes(college._id.toString()),
    }));

    return { colleges: collegesWithShortlist, total };
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
      throw new AppError(
        API_MESSAGES.ERROR.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      throw new AppError(
        API_MESSAGES.ERROR.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    if (!user.categoryIds || user.categoryIds.length === 0) {
      return { courses: [], total: 0 };
    }

    // Find all courses that match user's categoryIds
    const allCourses = [];

    for (const categoryId of user.categoryIds) {
      const courses = await Course.find({ categoryId })
        .populate({
          path: "UniversityId",
          select:
            "-password -otp -refreshToken -accessToken -emailVerificationToken -passwordResetToken -passwordResetExpires",
        })
        .populate("categoryId")
        .populate("parentCategoryId")
        .lean();
      allCourses.push(...courses);
    }

    // Remove duplicates
    let uniqueCourses = Array.from(
      new Map(
        allCourses.map((course) => [course._id.toString(), course])
      ).values()
    );

    // Apply search filter if provided
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase();
      uniqueCourses = uniqueCourses.filter(
        (course) =>
          course.name?.toLowerCase().includes(searchLower) ||
          course.description?.toLowerCase().includes(searchLower) ||
          (course.duration !== undefined &&
            course.duration !== null &&
            String(course.duration).includes(searchLower))
      );
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    const total = uniqueCourses.length;
    const courses = uniqueCourses.slice(skip, skip + limit);

    // Get user's shortlisted course IDs
    const shortlistedCourseIds = await this.getUserShortlistedIds(userId, "course");

    // Add isShortlisted field to each course
    const coursesWithShortlist = courses.map((course) => ({
      ...course,
      isShortlisted: shortlistedCourseIds.includes(course._id.toString()),
    }));

    return { courses: coursesWithShortlist, total };
  }

  /**
   * Get webinars (published/live) with pagination and search
   */
  async getWebinars(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ webinars: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const query: any = {
      status: { $in: ["published", "live"] },
    };

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { universityName: searchRegex },
        { courseDetails: searchRegex },
        { targetAudience: searchRegex },
        { speakerName: searchRegex },
        { tags: searchRegex },
        { domains: searchRegex },
      ];
    }

    const webinars = await Webinar.find(query)
      .populate({
        path: "universityId",
        select:
          "firstName lastName email collegeName location profileImage bannerYoutubeVideoLink",
      })
      .sort({ scheduledDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Webinar.countDocuments(query);

    // Note: Webinars don't have shortlist functionality in the current system
    // But we add isShortlisted: false for consistency
    const webinarsWithShortlist = webinars.map((webinar) => ({
      ...webinar,
      isShortlisted: false,
    }));

    return { webinars: webinarsWithShortlist, total };
  }

  /**
   * Get top 3 courses for a category
   * First tries categoryId, then parentCategoryId, then parent category's courses
   */
  async getTopCoursesForCategory(
    categoryId: string,
    parentId: string | null
  ): Promise<any[]> {
    const categoryObjectId = new Types.ObjectId(categoryId);
    const courses: any[] = [];

    // First, try to find courses with this categoryId in the categoryId array
    const categoryCourses = await Course.find({
      categoryId: { $in: [categoryObjectId] },
    })
      .populate({
        path: "UniversityId",
        select:
          "-password -otp -refreshToken -accessToken -emailVerificationToken -passwordResetToken -passwordResetExpires",
      })
      .populate("categoryId")
      .populate("parentCategoryId")
      .limit(3)
      .lean();

    courses.push(...categoryCourses);

    // If we don't have 3 courses yet, try parentCategoryId
    if (courses.length < 3) {
      const parentCategoryCourses = await Course.find({
        parentCategoryId: { $in: [categoryObjectId] },
        _id: { $nin: courses.map((c) => c._id) }, // Exclude already found courses
      })
        .populate({
          path: "UniversityId",
          select:
            "-password -otp -refreshToken -accessToken -emailVerificationToken -passwordResetToken -passwordResetExpires",
        })
        .populate("categoryId")
        .populate("parentCategoryId")
        .limit(3 - courses.length)
        .lean();

      courses.push(...parentCategoryCourses);
    }

    // If still less than 3 and we have a parentId, try parent category's courses
    if (courses.length < 3 && parentId) {
      const parentObjectId = new Types.ObjectId(parentId);
      const parentCategoryCourses = await Course.find({
        $or: [
          { categoryId: { $in: [parentObjectId] } },
          { parentCategoryId: { $in: [parentObjectId] } },
        ],
        _id: { $nin: courses.map((c) => c._id) }, // Exclude already found courses
      })
        .populate({
          path: "UniversityId",
          select:
            "-password -otp -refreshToken -accessToken -emailVerificationToken -passwordResetToken -passwordResetExpires",
        })
        .populate("categoryId")
        .populate("parentCategoryId")
        .limit(3 - courses.length)
        .lean();

      courses.push(...parentCategoryCourses);
    }

    // Return only top 3
    return courses.slice(0, 3);
  }

  /**
   * Get career detail by ID with all populated fields
   */
  async getCareerDetail(careerId: string): Promise<any> {
    if (!Types.ObjectId.isValid(careerId)) {
      throw new AppError("Invalid career ID", HttpStatus.BAD_REQUEST);
    }

    // First, get the career without lean to use populate
    const careerDoc = await CategoryModel.findById(careerId)
      .populate("parentId")
      .populate({
        path: "related_careers",
        model: "Category",
        options: { strictPopulate: false }, // Don't throw error if some IDs are invalid
      });

    if (!careerDoc) {
      throw new AppError("Career not found", HttpStatus.NOT_FOUND);
    }

    // Convert to plain object
    const career = careerDoc.toObject();

    // Manually populate related_careers if Mongoose populate didn't work (fallback)
    if (
      career.related_careers &&
      Array.isArray(career.related_careers) &&
      career.related_careers.length > 0
    ) {
      // Check if already populated (has category properties like name, description)
      const firstItem = career.related_careers[0] as any;
      const isAlreadyPopulated =
        firstItem && typeof firstItem === "object" && firstItem.name;

      if (!isAlreadyPopulated) {
        try {
          // Filter valid ObjectIds
          const validIds = career.related_careers
            .map((id: any) => {
              if (typeof id === "string" && Types.ObjectId.isValid(id)) {
                return new Types.ObjectId(id);
              }
              if (id && id._id) {
                return id._id;
              }
              if (id instanceof Types.ObjectId) {
                return id;
              }
              return null;
            })
            .filter((id: any) => id !== null);

          if (validIds.length > 0) {
            const populatedCategories = await CategoryModel.find({
              _id: { $in: validIds },
            }).lean();
            (career as any).related_careers = populatedCategories;
          } else {
            (career as any).related_careers = [];
          }
        } catch (error) {
          // If population fails, set to empty array
          (career as any).related_careers = [];
        }
      }
    } else {
      (career as any).related_careers = [];
    }

    // Ensure array fields are arrays (handle legacy data where they might be strings)
    const ensureArray = (value: any): string[] => {
      if (Array.isArray(value)) return value;
      if (typeof value === "string" && value.trim()) {
        // Try to parse if it looks like JSON array
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          // If not JSON, return as single item array
          return [value];
        }
      }
      return [];
    };

    // Normalize array fields for the career
    if (career.pros !== undefined) {
      (career as any).pros = ensureArray(career.pros);
    }
    if (career.cons !== undefined) {
      (career as any).cons = ensureArray(career.cons);
    }
    if (career.technical_skills !== undefined) {
      (career as any).technical_skills = ensureArray(career.technical_skills);
    }
    if (career.soft_skills !== undefined) {
      (career as any).soft_skills = ensureArray(career.soft_skills);
    }

    // Normalize array fields for the parent category if it exists
    if (career.parentId && typeof career.parentId === "object") {
      const parent = career.parentId as any;
      if (parent.pros !== undefined) {
        parent.pros = ensureArray(parent.pros);
      }
      if (parent.cons !== undefined) {
        parent.cons = ensureArray(parent.cons);
      }
      if (parent.technical_skills !== undefined) {
        parent.technical_skills = ensureArray(parent.technical_skills);
      }
      if (parent.soft_skills !== undefined) {
        parent.soft_skills = ensureArray(parent.soft_skills);
      }
    }

    // Get top 3 courses for this category
    const parentId =
      career.parentId && typeof career.parentId === "object"
        ? (career.parentId as any)._id?.toString() || null
        : null;

    const topCourses = await this.getTopCoursesForCategory(careerId, parentId);

    // Add coursesAvailable section to response
    (career as any).coursesAvailable = topCourses;

    return career;
  }

  /**
   * Get college detail by ID with all populated fields
   */
  async getCollegeDetail(collegeId: string): Promise<any> {
    if (!Types.ObjectId.isValid(collegeId)) {
      throw new AppError("Invalid college ID", HttpStatus.BAD_REQUEST);
    }

    const college = await User.findOne({
      _id: collegeId,
      role: UserRole.UNIVERSITY,
    })
      .select("-password -refreshToken -accessToken -otp -otpExpires")
      .lean();

    if (!college) {
      throw new AppError("College not found", HttpStatus.NOT_FOUND);
    }

    return college;
  }

  /**
   * Get course detail by ID with all populated fields
   */
  async getCourseDetail(courseId: string): Promise<any> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new AppError("Invalid course ID", HttpStatus.BAD_REQUEST);
    }

    const course = await Course.findById(courseId)
      .populate({
        path: "UniversityId",
        select:
          "-password -otp -refreshToken -accessToken -emailVerificationToken -passwordResetToken -passwordResetExpires",
      })
      .populate("categoryId")
      .populate("parentCategoryId")
      .lean();

    if (!course) {
      throw new AppError("Course not found", HttpStatus.NOT_FOUND);
    }

    return course;
  }

  /**
   * Get webinar detail by ID with populated university
   */
  async getWebinarDetail(webinarId: string): Promise<any> {
    if (!Types.ObjectId.isValid(webinarId)) {
      throw new AppError("Invalid webinar ID", HttpStatus.BAD_REQUEST);
    }

    const webinar = await Webinar.findById(webinarId)
      .populate({
        path: "universityId",
        select:
          "firstName lastName email collegeName location profileImage bannerYoutubeVideoLink",
      })
      .lean();

    if (!webinar) {
      throw new AppError("Webinar not found", HttpStatus.NOT_FOUND);
    }

    return webinar;
  }
}

export default ExploreRepository;
