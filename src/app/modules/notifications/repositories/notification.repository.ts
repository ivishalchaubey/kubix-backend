import { Types } from "mongoose";
import { Notification } from "../models/notification.model.js";
import {
  HttpStatus,
  API_MESSAGES,
} from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";

class NotificationRepository {
  
  // Create a new notification
  createNotification = async (notificationData: any): Promise<any> => {
    return await Notification.create(notificationData);
  };

  // Get notification by ID
  getNotificationById = async (notificationId: string): Promise<any> => {
    if (!Types.ObjectId.isValid(notificationId)) {
      throw new AppError(
        API_MESSAGES.ERROR.NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return await Notification.findById(notificationId).populate("userId");
  };

  // Get all notifications with optional userId filter
  getNotifications = async (userId?: string): Promise<any[]> => {
    const query: any = {};
    
    if (userId) {
      if (!Types.ObjectId.isValid(userId)) {
        throw new AppError(
          API_MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }
      query.$or = [
        { userId: userId },
        { isSentToAll: true }
      ];
    }
    
    return await Notification.find(query)
      .populate("userId")
      .sort({ datetime: -1, createdAt: -1 });
  };

  // Update notification by ID
  updateNotification = async (notificationId: string, updateData: any): Promise<any> => {
    if (!Types.ObjectId.isValid(notificationId)) {
      throw new AppError(
        API_MESSAGES.ERROR.NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return await Notification.findByIdAndUpdate(
      notificationId,
      updateData,
      { new: true, runValidators: true }
    ).populate("userId");
  };

  // Delete notification by ID
  deleteNotification = async (notificationId: string): Promise<any> => {
    if (!Types.ObjectId.isValid(notificationId)) {
      throw new AppError(
        API_MESSAGES.ERROR.NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return await Notification.findByIdAndDelete(notificationId);
  };

  // Get notifications for a specific user (including global notifications)
  getUserNotifications = async (userId: string): Promise<any[]> => {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(
        API_MESSAGES.ERROR.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    return await Notification.find({
      $or: [
        { userId: userId },
        { isSentToAll: true }
      ]
    })
    .populate("userId")
    .sort({ datetime: -1, createdAt: -1 });
  };
}

export default NotificationRepository;
