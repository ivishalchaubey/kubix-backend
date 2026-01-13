import ShortlistRepository from "../repositories/shortlist.repository.js";
import logger from "../../../utils/logger.js";
import { HttpStatus, API_MESSAGES } from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";
import { ShortlistType } from "../models/shortlist.model.js";
import KylasService from "../../kylas/services/KylasService.js";
import { ActivityType } from "../../kylas/types/KylasTypes.js";
import AuthRepository from "../../auth/repositories/AuthRepository.js";

class ShortlistService {
  private shortlistRepository: ShortlistRepository;
  private kylasService: KylasService;
  private authRepository: AuthRepository;

  constructor() {
    this.shortlistRepository = new ShortlistRepository();
    this.kylasService = new KylasService();
    this.authRepository = new AuthRepository();
  }

  // Create or toggle shortlist item
  async createShortlist(
    userId: string,
    itemId: string,
    itemType: ShortlistType
  ): Promise<any> {
    try {
      // Validate item type
      if (!["career", "colleges", "course"].includes(itemType)) {
        throw new AppError(
          API_MESSAGES.SHORTLIST.INVALID_ITEM_TYPE,
          HttpStatus.BAD_REQUEST
        );
      }

      const result = await this.shortlistRepository.createShortlist(
        userId,
        itemId,
        itemType
      );
      logger.info(
        `Shortlist ${result.action} for user ${userId}, item ${itemId}, type ${itemType}`
      );

      // Track activity in Kylas CRM (non-blocking)
      if (result.action === "added") {
        this.trackShortlistInKylas(userId, itemId, itemType).catch((error) => {
          logger.error(
            "Failed to track shortlist in Kylas (non-blocking):",
            error
          );
        });
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
    limit: number = 10
  ): Promise<any> {
    try {
      if (page < 1 || limit < 1 || limit > 100) {
        throw new AppError(
          "Invalid pagination parameters",
          HttpStatus.BAD_REQUEST
        );
      }

      if (itemType && !["career", "colleges", "course"].includes(itemType)) {
        throw new AppError(
          API_MESSAGES.SHORTLIST.INVALID_ITEM_TYPE,
          HttpStatus.BAD_REQUEST
        );
      }

      return await this.shortlistRepository.getShortlists(
        userId,
        itemType,
        page,
        limit
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
        shortlistId
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
    itemType: ShortlistType
  ): Promise<boolean> {
    try {
      if (!["career", "colleges", "course"].includes(itemType)) {
        throw new AppError(
          API_MESSAGES.SHORTLIST.INVALID_ITEM_TYPE,
          HttpStatus.BAD_REQUEST
        );
      }

      return await this.shortlistRepository.isShortlisted(
        userId,
        itemId,
        itemType
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
    itemType: ShortlistType
  ): Promise<void> {
    try {
      // Get user email
      const user = await this.authRepository.findUserById(userId);
      if (!user || !user.email) {
        logger.warn(
          `Cannot track Kylas activity - user ${userId} not found or has no email`
        );
        return;
      }

      // Get all shortlists of this type for the user
      const shortlists = await this.shortlistRepository.getShortlists(
        userId,
        itemType,
        1,
        100
      );
      const itemIds = shortlists.items.map((item: any) =>
        item.itemId.toString()
      );

      // Determine activity type and track
      let activityType: ActivityType;
      switch (itemType) {
        case "career":
          activityType = ActivityType.CAREER_SHORTLISTED;
          break;
        case "course":
          activityType = ActivityType.COURSE_SHORTLISTED;
          break;
        case "colleges":
          activityType = ActivityType.COLLEGE_SHORTLISTED;
          break;
        default:
          logger.warn(`Unknown shortlist type: ${itemType}`);
          return;
      }

      await this.kylasService.trackActivity(user.email, activityType, itemIds);
    } catch (error) {
      logger.error("Error tracking shortlist in Kylas:", error);
      // Don't throw - this is non-blocking
    }
  }
}

export default ShortlistService;
