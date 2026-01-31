import ShortlistRepository from "../repositories/shortlist.repository.js";
import logger from "../../../utils/logger.js";
import { HttpStatus, API_MESSAGES } from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";
import { ShortlistType } from "../models/shortlist.model.js";
import { kylasCRM, ActivityType } from "../../kylas/index.js";
import AuthRepository from "../../auth/repositories/AuthRepository.js";

class ShortlistService {
  private shortlistRepository: ShortlistRepository;

  private authRepository: AuthRepository;

  constructor() {
    this.shortlistRepository = new ShortlistRepository();

    this.authRepository = new AuthRepository();
  }

  // Create or toggle shortlist item
  async createShortlist(
    userId: string,
    itemId: string,
    itemType: ShortlistType,
    platform?: string,
  ): Promise<any> {
    try {
      // Validate item type
      if (!["career", "colleges", "course"].includes(itemType)) {
        throw new AppError(
          API_MESSAGES.SHORTLIST.INVALID_ITEM_TYPE,
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.shortlistRepository.createShortlist(
        userId,
        itemId,
        itemType,
      );
      logger.info(
        `Shortlist ${result.action} for user ${userId}, item ${itemId}, type ${itemType}`,
      );

      // Track activity in Kylas CRM (non-blocking)
      if (result.action === "added") {
        this.trackShortlistInKylas(userId, itemId, itemType, platform).catch(
          (error) => {
            logger.error(
              "Failed to track shortlist in Kylas (non-blocking):",
              error,
            );
          },
        );
      }

      return result;
    } catch (error) {
      logger.error("Create shortlist failed:", error);
      throw error;
    }
  }

  // Get all shortlisted items with optional type filter and pagination
  async getShortlists(
    userId: string,
    itemType?: ShortlistType,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    try {
      if (page < 1 || limit < 1 || limit > 100) {
        throw new AppError(
          "Invalid pagination parameters",
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        itemType &&
        !["career", "colleges", "course", "applications"].includes(itemType)
      ) {
        throw new AppError(
          API_MESSAGES.SHORTLIST.INVALID_ITEM_TYPE,
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.shortlistRepository.getShortlists(
        userId,
        itemType,
        page,
        limit,
      );
    } catch (error) {
      logger.error("Get shortlists failed:", error);
      throw error;
    }
  }

  // Get shortlist by ID
  async getShortlistById(userId: string, shortlistId: string): Promise<any> {
    try {
      const result = await this.shortlistRepository.getShortlistById(
        userId,
        shortlistId,
      );
      return result;
    } catch (error) {
      logger.error(`Get shortlist failed: ${shortlistId}`, error);
      throw error;
    }
  }

  // Check if item is shortlisted
  async isShortlisted(
    userId: string,
    itemId: string,
    itemType: ShortlistType,
  ): Promise<boolean> {
    try {
      if (!["career", "colleges", "course"].includes(itemType)) {
        throw new AppError(
          API_MESSAGES.SHORTLIST.INVALID_ITEM_TYPE,
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.shortlistRepository.isShortlisted(
        userId,
        itemId,
        itemType,
      );
    } catch (error) {
      logger.error("Check shortlisted failed:", error);
      throw error;
    }
  }

  // Delete shortlist by ID
  async deleteShortlist(userId: string, shortlistId: string): Promise<void> {
    try {
      await this.shortlistRepository.deleteShortlist(userId, shortlistId);
      logger.info(`Shortlist deleted: ${shortlistId}`);
    } catch (error) {
      logger.error(`Delete shortlist failed: ${shortlistId}`, error);
      throw error;
    }
  }

  // Helper method to track shortlist in Kylas
  private async trackShortlistInKylas(
    userId: string,
    itemId: string,
    itemType: ShortlistType,
    platform?: string,
  ): Promise<void> {
    try {
      // Get user email
      const user = await this.authRepository.findUserById(userId);
      if (!user || !user.email) {
        logger.warn(
          `Cannot track Kylas activity - user ${userId} not found or has no email`,
        );
        return;
      }

      // Get the specific item that was just shortlisted (with parent info for careers)
      let itemName = "";
      let parentName = "";

      // Import the models dynamically to avoid circular dependencies
      const CategoryModel = (
        await import("../../admin/categories/models/category.js")
      ).default;
      const { Course } = await import("../../courses/models/course.js");
      const { default: User } = await import("../../auth/models/User.js");

      switch (itemType) {
        case "career":
          // Fetch the career with its parent populated
          const career =
            await CategoryModel.findById(itemId).populate("parentId");
          if (career) {
            itemName = career.name;
            // parentId is populated, so it's an object with name
            if (career.parentId && typeof career.parentId === "object") {
              parentName = (career.parentId as any).name || "";
            }
          }
          break;
        case "course":
          const course = await Course.findById(itemId);
          if (course) {
            itemName = (course as any).name || "";
          }
          break;
        case "colleges":
          // Colleges are stored as Users with role="university"
          const college = await User.findOne({
            _id: itemId,
            role: "university",
          });
          if (college) {
            // Access name field - collegeName is the actual field in User model
            itemName =
              (college as any).collegeName || (college as any).firstName || "";
          }
          break;
      }

      if (!itemName) {
        logger.warn(`Could not find item ${itemId} of type ${itemType}`);
        return;
      }

      // Determine activity type
      let activityType: ActivityType;
      let formattedData: string;

      switch (itemType) {
        case "career":
          activityType = ActivityType.CAREER_SHORTLISTED;
          // Format: "Career Name (under Parent Category)"
          formattedData = parentName
            ? `${itemName} (under ${parentName})`
            : itemName;
          break;
        case "course":
          activityType = ActivityType.COURSE_SHORTLISTED;
          formattedData = itemName;
          break;
        case "colleges":
          activityType = ActivityType.COLLEGE_SHORTLISTED;
          formattedData = itemName;
          break;
        default:
          logger.warn(`Unknown shortlist type: ${itemType}`);
          return;
      }

      await kylasCRM.trackActivity(
        user.email,
        activityType,
        formattedData,
        platform,
      );
    } catch (error: any) {
      logger.error("Error tracking shortlist in Kylas:", {
        message: error.message,
        stack: error.stack,
        details: error.response?.data,
      });
      // Don't throw - this is non-blocking
    }
  }
}

export default ShortlistService;
