import ApplicationSalesRepository from "../repositories/applicationSales.repository.js";
import logger from "../../../utils/logger.js";
import { HttpStatus, API_MESSAGES } from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";

class ApplicationSalesService {
  private applicationSalesRepository: ApplicationSalesRepository;

  constructor() {
    this.applicationSalesRepository = new ApplicationSalesRepository();
  }

  // Create application sale
  async createApplicationSale(data: any, userId: string): Promise<any> {
    try {
      data.universityId = userId;
      const result = await this.applicationSalesRepository.createApplicationSale(data);
      logger.info(`Application sale created: ${result._id}`);
      return result;
    } catch (error) {
      logger.error("Create application sale failed:", error);
      throw error;
    }
  }

  // Get by ID
  async getApplicationSaleById(id: string): Promise<any> {
    try {
      const applicationSale = await this.applicationSalesRepository.getApplicationSaleById(id);
      if (!applicationSale) {
        throw new AppError(API_MESSAGES.APPLICATION_SALES.NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      return applicationSale;
    } catch (error) {
      logger.error(`Get application sale failed: ${id}`, error);
      throw error;
    }
  }

  // Get all
  async getAllApplicationSales(): Promise<any[]> {
    try {
      return await this.applicationSalesRepository.getAllApplicationSales();
    } catch (error) {
      logger.error("Get all application sales failed:", error);
      throw error;
    }
  }

  // Get by university
  async getApplicationSalesByUniversity(universityId: string): Promise<any[]> {
    try {
      return await this.applicationSalesRepository.getApplicationSalesByUniversity(universityId);
    } catch (error) {
      logger.error("Get application sales by university failed:", error);
      throw error;
    }
  }

  // Get published with pagination
  async getPublishedApplicationSales(
    page: number,
    limit: number,
    search?: string
  ): Promise<{
    applicationSales: any[];
    total: number;
  }> {
    try {
      return await this.applicationSalesRepository.getPublishedApplicationSales(
        page,
        limit,
        search
      );
    } catch (error) {
      logger.error("Get published application sales failed:", error);
      throw error;
    }
  }

  // Update
  async updateApplicationSale(id: string, updateData: any, userId: string, userRole?: string): Promise<any> {
    try {
      const existing = await this.applicationSalesRepository.getApplicationSaleById(id);
      if (!existing) {
        throw new AppError(API_MESSAGES.APPLICATION_SALES.NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      // Allow admins or owner
      const isAdmin = userRole === "admin";
      const isOwner = existing.universityId.toString() === userId;

      if (!isAdmin && !isOwner) {
        throw new AppError(API_MESSAGES.ERROR.ACCESS_DENIED, HttpStatus.FORBIDDEN);
      }

      const result = await this.applicationSalesRepository.updateApplicationSale(id, updateData);
      logger.info(`Application sale updated: ${id}`);
      return result;
    } catch (error) {
      logger.error(`Update application sale failed: ${id}`, error);
      throw error;
    }
  }

  // Delete
  async deleteApplicationSale(id: string, userId: string, userRole?: string): Promise<void> {
    try {
      const existing = await this.applicationSalesRepository.getApplicationSaleById(id);
      if (!existing) {
        throw new AppError(API_MESSAGES.APPLICATION_SALES.NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      // Allow admins or owner
      const isAdmin = userRole === "admin";
      const isOwner = existing.universityId.toString() === userId;

      if (!isAdmin && !isOwner) {
        throw new AppError(API_MESSAGES.ERROR.ACCESS_DENIED, HttpStatus.FORBIDDEN);
      }

      await this.applicationSalesRepository.deleteApplicationSale(id);
      logger.info(`Application sale deleted: ${id}`);
    } catch (error) {
      logger.error(`Delete application sale failed: ${id}`, error);
      throw error;
    }
  }

  // Publish
  async publishApplicationSale(id: string, userId: string, userRole?: string): Promise<any> {
    try {
      const existing = await this.applicationSalesRepository.getApplicationSaleById(id);
      if (!existing) {
        throw new AppError(API_MESSAGES.APPLICATION_SALES.NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      // Allow admins or owner
      const isAdmin = userRole === "admin";
      const isOwner = existing.universityId.toString() === userId;

      if (!isAdmin && !isOwner) {
        throw new AppError(API_MESSAGES.ERROR.ACCESS_DENIED, HttpStatus.FORBIDDEN);
      }

      if (existing.status === "published" || existing.status === "active") {
        throw new AppError("Application sale already published", HttpStatus.BAD_REQUEST);
      }

      const result = await this.applicationSalesRepository.publishApplicationSale(id);
      logger.info(`Application sale published: ${id}`);
      return result;
    } catch (error) {
      logger.error(`Publish application sale failed: ${id}`, error);
      throw error;
    }
  }

  // Track application (3000 KX per application)
  async trackApplication(id: string): Promise<any> {
    try {
      const existing = await this.applicationSalesRepository.getApplicationSaleById(id);
      if (!existing) {
        throw new AppError(API_MESSAGES.APPLICATION_SALES.NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      // TODO: Implement actual coin payment logic here
      // Pay university 3000 KX coins per application

      const result = await this.applicationSalesRepository.trackApplication(id);
      logger.info(`Application tracked: ${id}, coins: 3000 KX`);
      return result;
    } catch (error) {
      logger.error(`Track application failed: ${id}`, error);
      throw error;
    }
  }
}

export default ApplicationSalesService;

