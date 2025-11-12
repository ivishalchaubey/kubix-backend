import { Request, Response, NextFunction } from 'express';
import ResponseUtil from "../../../utils/response.js";
import { API_MESSAGES } from '../../../constants/enums.js';
import InAppBannerService from '../services/inAppBanner.service.js';

class InAppBannerController {
    public inAppBannerService: InAppBannerService;
    
    constructor() {
        this.inAppBannerService = new InAppBannerService();
    }

    // Create a new banner
    async createBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this.inAppBannerService.createBanner(req.body);
            ResponseUtil.created(res, result, API_MESSAGES.IN_APP_BANNER.BANNER_CREATED);
        } catch (error) {
            next(error);
        }
    }

    // Get banner by ID
    async getBannerById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const bannerId = req.params.id;
            const result = await this.inAppBannerService.getBannerById(bannerId);
            ResponseUtil.success(res, result, API_MESSAGES.IN_APP_BANNER.BANNER_FETCHED);
        } catch (error) {
            next(error);
        }
    }

    // Get all banners
    async getBanners(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this.inAppBannerService.getBanners();
            ResponseUtil.success(res, result, API_MESSAGES.IN_APP_BANNER.BANNERS_FETCHED);
        } catch (error) {
            next(error);
        }
    }

    // Get active banners
    async getActiveBanners(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this.inAppBannerService.getActiveBanners();
            ResponseUtil.success(res, result, API_MESSAGES.IN_APP_BANNER.ACTIVE_BANNERS_FETCHED);
        } catch (error) {
            next(error);
        }
    }

    // Get active banners with pagination
    async getActiveBannersPaginated(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page = "1", limit = "10" } = req.query;
            const pageNumber = parseInt(Array.isArray(page) ? page[0] : page, 10);
            const limitNumber = parseInt(Array.isArray(limit) ? limit[0] : limit, 10);
            const result = await this.inAppBannerService.getActiveBannersPaginated(pageNumber, limitNumber);
            ResponseUtil.success(res, result, API_MESSAGES.IN_APP_BANNER.ACTIVE_BANNERS_FETCHED);
        } catch (error) {
            next(error);
        }
    }

    // Update banner
    async updateBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const bannerId = req.params.id;
            const updateData = req.body;
            const result = await this.inAppBannerService.updateBanner(bannerId, updateData);
            ResponseUtil.success(res, result, API_MESSAGES.IN_APP_BANNER.BANNER_UPDATED);
        } catch (error) {
            next(error);
        }
    }

    // Delete banner
    async deleteBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const bannerId = req.params.id;
            await this.inAppBannerService.deleteBanner(bannerId);
            ResponseUtil.success(res, null, API_MESSAGES.IN_APP_BANNER.BANNER_DELETED);
        } catch (error) {
            next(error);
        }
    }
}

export default InAppBannerController;
