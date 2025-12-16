import ShortlistRepository from "../repositories/shortlist.repository.js";
import logger from "../../../utils/logger.js";
import { HttpStatus, API_MESSAGES } from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";
import { ShortlistType } from "../models/shortlist.model.js";

class ShortlistService {
  private shortlistRepository: ShortlistRepository;

  constructor() {
    this.shortlistRepository = new ShortlistRepository();
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
}

export default ShortlistService;

