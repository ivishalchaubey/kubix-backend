import { Request, Response, NextFunction } from 'express';
import ResponseUtil from "../../../utils/response.js";
import { API_MESSAGES } from '../../../constants/enums.js';
import NotificationService from '../services/notification.service.js';

class NotificationController {
    public notificationService: NotificationService;
    
    constructor() {
        this.notificationService = new NotificationService();
    }

    // Create a new notification
    async createNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this.notificationService.createNotification(req.body);
            ResponseUtil.created(res, result, API_MESSAGES.NOTIFICATION.NOTIFICATION_CREATED);
        } catch (error) {
            next(error);
        }
    }

    // Get notification by ID
    async getNotificationById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const notificationId = req.params.id;
            const result = await this.notificationService.getNotificationById(notificationId);
            ResponseUtil.success(res, result, API_MESSAGES.NOTIFICATION.NOTIFICATION_FETCHED);
        } catch (error) {
            next(error);
        }
    }

    // Get all notifications with optional userId filter
    async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.query.userId as string;
            const result = await this.notificationService.getNotifications(userId);
            ResponseUtil.success(res, result, API_MESSAGES.NOTIFICATION.NOTIFICATIONS_FETCHED);
        } catch (error) {
            next(error);
        }
    }

    // Update notification by ID
    async updateNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const notificationId = req.params.id;
            const updateData = req.body;
            const result = await this.notificationService.updateNotification(notificationId, updateData);
            ResponseUtil.success(res, result, API_MESSAGES.NOTIFICATION.NOTIFICATION_UPDATED);
        } catch (error) {
            next(error);
        }
    }

    // Delete notification by ID
    async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const notificationId = req.params.id;
            await this.notificationService.deleteNotification(notificationId);
            ResponseUtil.success(res, null, API_MESSAGES.NOTIFICATION.NOTIFICATION_DELETED);
        } catch (error) {
            next(error);
        }
    }

    // Get notifications for authenticated user
    getUserNotifications = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            
            const userId = req.user._id;
            const notifications = await this.notificationService.getUserNotifications(userId);
            ResponseUtil.success(res, { notifications }, "User notifications retrieved successfully");
        } catch (error) {
            next(error);
        }
    };
}

export default NotificationController;
