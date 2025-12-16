import WebinarRepository from "../repositories/webinar.repository.js";
import logger from "../../../utils/logger.js";
import { HttpStatus, API_MESSAGES } from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";

class WebinarService {
  private webinarRepository: WebinarRepository;

  constructor() {
    this.webinarRepository = new WebinarRepository();
  }

  // Create webinar
  async createWebinar(webinarData: any, userId: string): Promise<any> {
    try {
      webinarData.universityId = userId;
      const result = await this.webinarRepository.createWebinar(webinarData);
      logger.info(`Webinar created: ${result._id}`);
      return result;
    } catch (error) {
      logger.error("Create webinar failed:", error);
      throw error;
    }
  }

  // Get webinar by ID
  async getWebinarById(webinarId: string): Promise<any> {
    try {
      await this.webinarRepository.markCompletedWebinars();
      const webinar = await this.webinarRepository.getWebinarById(webinarId);
      if (!webinar) {
        throw new AppError(API_MESSAGES.WEBINAR.WEBINAR_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      // Hide webinar link if not within 30 minutes
      const shouldShowLink = await this.webinarRepository.shouldShowWebinarLink(webinarId);
      if (!shouldShowLink && webinar.status === "published") {
        const webinarObj = webinar.toObject();
        webinarObj.webinarLink = "Link will be available 30 minutes before the webinar";
        return webinarObj;
      }

      return webinar;
    } catch (error) {
      logger.error(`Get webinar failed: ${webinarId}`, error);
      throw error;
    }
  }

  // Get all webinars
  async getAllWebinars(): Promise<any[]> {
    try {
      await this.webinarRepository.markCompletedWebinars();
      return await this.webinarRepository.getAllWebinars();
    } catch (error) {
      logger.error("Get all webinars failed:", error);
      throw error;
    }
  }

  // Get webinars by university
  async getWebinarsByUniversity(universityId: string): Promise<any[]> {
    try {
      await this.webinarRepository.markCompletedWebinars();
      return await this.webinarRepository.getWebinarsByUniversity(universityId);
    } catch (error) {
      logger.error("Get webinars by university failed:", error);
      throw error;
    }
  }

  // Get published webinars
  async getPublishedWebinars(): Promise<any[]> {
    try {
      await this.webinarRepository.markCompletedWebinars();
      return await this.webinarRepository.getPublishedWebinars();
    } catch (error) {
      logger.error("Get published webinars failed:", error);
      throw error;
    }
  }

  // Get upcoming webinars
  async getUpcomingWebinars(): Promise<any[]> {
    try {
      await this.webinarRepository.markCompletedWebinars();
      return await this.webinarRepository.getUpcomingWebinars();
    } catch (error) {
      logger.error("Get upcoming webinars failed:", error);
      throw error;
    }
  }

  // Update webinar
  async updateWebinar(webinarId: string, updateData: any, userId: string, userRole?: string): Promise<any> {
    try {
      const existing = await this.webinarRepository.getWebinarById(webinarId);
      if (!existing) {
        throw new AppError(API_MESSAGES.WEBINAR.WEBINAR_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      // Allow admins to edit any webinar, or owner to edit their own
      const isAdmin = userRole === "admin";
      const isOwner = existing.universityId.toString() === userId;

      if (!isAdmin && !isOwner) {
        throw new AppError(API_MESSAGES.ERROR.ACCESS_DENIED, HttpStatus.FORBIDDEN);
      }

      const result = await this.webinarRepository.updateWebinar(webinarId, updateData);
      logger.info(`Webinar updated: ${webinarId}`);
      return result;
    } catch (error) {
      logger.error(`Update webinar failed: ${webinarId}`, error);
      throw error;
    }
  }

  // Delete webinar
  async deleteWebinar(webinarId: string, userId: string, userRole?: string): Promise<void> {
    try {
      const existing = await this.webinarRepository.getWebinarById(webinarId);
      if (!existing) {
        throw new AppError(API_MESSAGES.WEBINAR.WEBINAR_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      // Allow admins to delete any webinar, or owner to delete their own
      const isAdmin = userRole === "admin";
      const isOwner = existing.universityId.toString() === userId;

      if (!isAdmin && !isOwner) {
        throw new AppError(API_MESSAGES.ERROR.ACCESS_DENIED, HttpStatus.FORBIDDEN);
      }

      await this.webinarRepository.deleteWebinar(webinarId);
      logger.info(`Webinar deleted: ${webinarId}`);
    } catch (error) {
      logger.error(`Delete webinar failed: ${webinarId}`, error);
      throw error;
    }
  }

  // Publish webinar (deducts 5000 KX coins)
  async publishWebinar(webinarId: string, userId: string, userRole?: string): Promise<any> {
    try {
      const existing = await this.webinarRepository.getWebinarById(webinarId);
      if (!existing) {
        throw new AppError(API_MESSAGES.WEBINAR.WEBINAR_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      // Allow admins to publish any webinar, or owner to publish their own
      const isAdmin = userRole === "admin";
      const isOwner = existing.universityId.toString() === userId;

      if (!isAdmin && !isOwner) {
        throw new AppError(API_MESSAGES.ERROR.ACCESS_DENIED, HttpStatus.FORBIDDEN);
      }

      if (existing.status === "published") {
        throw new AppError("Webinar already published", HttpStatus.BAD_REQUEST);
      }
      if (existing.coinsDeducted) {
        throw new AppError("Coins already deducted", HttpStatus.BAD_REQUEST);
      }

      // TODO: Implement actual coin deduction logic here
      const result = await this.webinarRepository.publishWebinar(webinarId);
      logger.info(`Webinar published: ${webinarId}, coins: 5000 KX`);
      return result;
    } catch (error) {
      logger.error(`Publish webinar failed: ${webinarId}`, error);
      throw error;
    }
  }
}

export default WebinarService;
