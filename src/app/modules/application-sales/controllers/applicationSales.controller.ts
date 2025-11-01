import { Response, NextFunction } from 'express';
import { AuthRequest } from "../../../types/global.js";
import ResponseUtil from "../../../utils/response.js";
import { API_MESSAGES } from '../../../constants/enums.js';
import ApplicationSalesService from '../services/applicationSales.service.js';

class ApplicationSalesController {
    public applicationSalesService: ApplicationSalesService;
    
    constructor() {
        this.applicationSalesService = new ApplicationSalesService();
    }

    // Create application sale
    async createApplicationSale(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const result = await this.applicationSalesService.createApplicationSale(req.body, req.user._id);
            ResponseUtil.created(res, result, API_MESSAGES.APPLICATION_SALES.CREATED);
        } catch (error) {
            next(error);
        }
    }

    // Get by ID
    async getApplicationSaleById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            const result = await this.applicationSalesService.getApplicationSaleById(id);
            ResponseUtil.success(res, result, API_MESSAGES.APPLICATION_SALES.FETCHED);
        } catch (error) {
            next(error);
        }
    }

    // Get all (Admin)
    async getAllApplicationSales(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this.applicationSalesService.getAllApplicationSales();
            ResponseUtil.success(res, result, API_MESSAGES.APPLICATION_SALES.FETCHED_ALL);
        } catch (error) {
            next(error);
        }
    }

    // Get my application sales
    async getMyApplicationSales(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const result = await this.applicationSalesService.getApplicationSalesByUniversity(req.user._id);
            ResponseUtil.success(res, result, API_MESSAGES.APPLICATION_SALES.FETCHED_ALL);
        } catch (error) {
            next(error);
        }
    }

    // Get published (Students)
    async getPublishedApplicationSales(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this.applicationSalesService.getPublishedApplicationSales();
            ResponseUtil.success(res, result, API_MESSAGES.APPLICATION_SALES.FETCHED_ALL);
        } catch (error) {
            next(error);
        }
    }

    // Update
    async updateApplicationSale(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const id = req.params.id;
            const updateData = req.body;
            const result = await this.applicationSalesService.updateApplicationSale(
                id, 
                updateData, 
                req.user._id, 
                req.user.role
            );
            ResponseUtil.success(res, result, API_MESSAGES.APPLICATION_SALES.UPDATED);
        } catch (error) {
            next(error);
        }
    }

    // Delete
    async deleteApplicationSale(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const id = req.params.id;
            await this.applicationSalesService.deleteApplicationSale(id, req.user._id, req.user.role);
            ResponseUtil.success(res, null, API_MESSAGES.APPLICATION_SALES.DELETED);
        } catch (error) {
            next(error);
        }
    }

    // Publish
    async publishApplicationSale(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const id = req.params.id;
            const result = await this.applicationSalesService.publishApplicationSale(id, req.user._id, req.user.role);
            ResponseUtil.success(res, result, API_MESSAGES.APPLICATION_SALES.PUBLISHED);
        } catch (error) {
            next(error);
        }
    }

    // Track application (Webhook/API endpoint)
    async trackApplication(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            const result = await this.applicationSalesService.trackApplication(id);
            ResponseUtil.success(res, result, API_MESSAGES.APPLICATION_SALES.APPLICATION_TRACKED);
        } catch (error) {
            next(error);
        }
    }
}

export default ApplicationSalesController;

