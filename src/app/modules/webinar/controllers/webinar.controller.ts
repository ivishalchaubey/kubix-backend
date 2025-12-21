import { Response, NextFunction } from 'express';
import { AuthRequest } from "../../../types/global.js";
import ResponseUtil from "../../../utils/response.js";
import { API_MESSAGES } from '../../../constants/enums.js';
import WebinarService from '../services/webinar.service.js';

class WebinarController {
    public webinarService: WebinarService;
    
    constructor() {
        this.webinarService = new WebinarService();
    }

    // Create a new webinar
    async createWebinar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const result = await this.webinarService.createWebinar(req.body, req.user._id);
            ResponseUtil.created(res, result, API_MESSAGES.WEBINAR.WEBINAR_CREATED);
        } catch (error) {
            next(error);
        }
    }

    // Get webinar by ID
    async getWebinarById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const webinarId = req.params.id;
            const result = await this.webinarService.getWebinarById(webinarId);
            ResponseUtil.success(res, result, API_MESSAGES.WEBINAR.WEBINAR_FETCHED);
        } catch (error) {
            next(error);
        }
    }

    // Get all webinars (Admin)
    async getAllWebinars(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this.webinarService.getAllWebinars();
            ResponseUtil.success(res, result, API_MESSAGES.WEBINAR.WEBINARS_FETCHED);
        } catch (error) {
            next(error);
        }
    }

    // Get webinars by university
    async getMyWebinars(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const result = await this.webinarService.getWebinarsByUniversity(req.user._id);
            ResponseUtil.success(res, result, API_MESSAGES.WEBINAR.WEBINARS_FETCHED);
        } catch (error) {
            next(error);
        }
    }

    // Get published webinars (for students)
    async getPublishedWebinars(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this.webinarService.getPublishedWebinars();
            ResponseUtil.success(res, result, API_MESSAGES.WEBINAR.WEBINARS_FETCHED);
        } catch (error) {
            next(error);
        }
    }

    // Get upcoming webinars
    async getUpcomingWebinars(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this.webinarService.getUpcomingWebinars();
            ResponseUtil.success(res, result, API_MESSAGES.WEBINAR.WEBINARS_FETCHED);
        } catch (error) {
            next(error);
        }
    }

    // Update webinar
    async updateWebinar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const webinarId = req.params.id;
            const updateData = req.body;
            const result = await this.webinarService.updateWebinar(
                webinarId, 
                updateData, 
                req.user._id, 
                req.user.role
            );
            ResponseUtil.success(res, result, API_MESSAGES.WEBINAR.WEBINAR_UPDATED);
        } catch (error) {
            next(error);
        }
    }

    // Delete webinar
    async deleteWebinar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const webinarId = req.params.id;
            await this.webinarService.deleteWebinar(webinarId, req.user._id, req.user.role);
            ResponseUtil.success(res, null, API_MESSAGES.WEBINAR.WEBINAR_DELETED);
        } catch (error) {
            next(error);
        }
    }

    // Publish webinar (deducts coins)
    async publishWebinar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const webinarId = req.params.id;
            const result = await this.webinarService.publishWebinar(webinarId, req.user._id, req.user.role);
            ResponseUtil.success(res, result, API_MESSAGES.WEBINAR.WEBINAR_PUBLISHED);
        } catch (error) {
            next(error);
        }
    }
}

export default WebinarController;
