import NotificationRepository from "../repositories/notification.repository.js";
import logger from "../../../utils/logger.js";
import {
  HttpStatus,
  API_MESSAGES,
} from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";

class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  // Create a new notification
  async createNotification(notificationData: any): Promise<any> {
    try {
      // Validate required fields
      if (!notificationData.title || !notificationData.content) {
        throw new AppError(
          API_MESSAGES.ERROR.VALIDATION_ERROR,
          HttpStatus.BAD_REQUEST
        );
      }

      // Set datetime if not provided
      if (!notificationData.datetime) {
        notificationData.datetime = new Date();
      }

      // Validate userId requirement when not sending to all
      if (!notificationData.isSentToAll && !notificationData.userId) {
        throw new AppError(
          "User ID is required when not sending to all users",
          HttpStatus.BAD_REQUEST
        );
      }

      const result = await this.notificationRepository.createNotification(notificationData);
      logger.info(`Notification created: ${result._id}`);
      return result;
    } catch (error) {
      logger.error("Create notification failed:", error);
      throw error;
    }
  }

  // Get notification by ID
  async getNotificationById(notificationId: string): Promise<any> {
    try {
      const notification = await this.notificationRepository.getNotificationById(notificationId);
      if (!notification) {
        throw new AppError(
          API_MESSAGES.ERROR.NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }
      return notification;
    } catch (error) {
      logger.error(`Get notification by ID failed: ${notificationId}`, error);
      throw error;
    }
  }

  // Get all notifications with optional userId filter
  async getNotifications(userId?: string): Promise<any[]> {
    try {
      const result = await this.notificationRepository.getNotifications(userId);
      logger.info(`Notifications retrieved${userId ? ` for user: ${userId}` : ''}`);
      return result;
    } catch (error) {
      logger.error("Get notifications failed:", error);
      throw error;
    }
  }

  // Update notification by ID
  async updateNotification(notificationId: string, updateData: any): Promise<any> {
    try {
      const notification = await this.notificationRepository.updateNotification(notificationId, updateData);
      if (!notification) {
        throw new AppError(
          API_MESSAGES.ERROR.NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }
      logger.info(`Notification updated: ${notificationId}`);
      return notification;
    } catch (error) {
      logger.error(`Update notification failed: ${notificationId}`, error);
      throw error;
    }
  }

  // Delete notification by ID
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const deletedNotification = await this.notificationRepository.deleteNotification(notificationId);
      if (!deletedNotification) {
        throw new AppError(
          API_MESSAGES.ERROR.NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }
      logger.info(`Notification deleted: ${notificationId}`);
    } catch (error) {
      logger.error(`Delete notification failed: ${notificationId}`, error);
      throw error;
    }
  }

  // Get notifications for a specific user
  async getUserNotifications(userId: string): Promise<any[]> {
    try {
      const notifications = await this.notificationRepository.getUserNotifications(userId);
      logger.info(`User notifications retrieved for user: ${userId}`);
      return notifications;
    } catch (error) {
      logger.error("Get user notifications failed:", error);
      throw error;
    }
  }
}

export default NotificationService;
