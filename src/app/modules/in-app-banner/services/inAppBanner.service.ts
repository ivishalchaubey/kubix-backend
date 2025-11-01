import InAppBannerRepository from "../repositories/inAppBanner.repository.js";
import logger from "../../../utils/logger.js";
import { HttpStatus, API_MESSAGES } from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";

class InAppBannerService {
  private inAppBannerRepository: InAppBannerRepository;

  constructor() {
    this.inAppBannerRepository = new InAppBannerRepository();
  }

  // Create banner
  async createBanner(bannerData: any): Promise<any> {
    try {
      // Validate date range if both provided
      if (bannerData.startDate && bannerData.endDate) {
        const start = new Date(bannerData.startDate);
        const end = new Date(bannerData.endDate);
        if (start >= end) {
          throw new AppError("Start date must be before end date", HttpStatus.BAD_REQUEST);
        }
      }

      const result = await this.inAppBannerRepository.createBanner(bannerData);
      logger.info(`Banner created: ${result._id}`);
      return result;
    } catch (error) {
      logger.error("Create banner failed:", error);
      throw error;
    }
  }

  // Get banner by ID
  async getBannerById(bannerId: string): Promise<any> {
    try {
      const banner = await this.inAppBannerRepository.getBannerById(bannerId);
      if (!banner) {
        throw new AppError(API_MESSAGES.IN_APP_BANNER.BANNER_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      return banner;
    } catch (error) {
      logger.error(`Get banner failed: ${bannerId}`, error);
      throw error;
    }
  }

  // Get all banners
  async getBanners(): Promise<any[]> {
    try {
      return await this.inAppBannerRepository.getBanners();
    } catch (error) {
      logger.error("Get banners failed:", error);
      throw error;
    }
  }

  // Get active banners
  async getActiveBanners(): Promise<any[]> {
    try {
      return await this.inAppBannerRepository.getActiveBanners();
    } catch (error) {
      logger.error("Get active banners failed:", error);
      throw error;
    }
  }

  // Update banner
  async updateBanner(bannerId: string, updateData: any): Promise<any> {
    try {
      // Validate date range if both provided
      if (updateData.startDate && updateData.endDate) {
        const start = new Date(updateData.startDate);
        const end = new Date(updateData.endDate);
        if (start >= end) {
          throw new AppError("Start date must be before end date", HttpStatus.BAD_REQUEST);
        }
      }

      const banner = await this.inAppBannerRepository.updateBanner(bannerId, updateData);
      if (!banner) {
        throw new AppError(API_MESSAGES.IN_APP_BANNER.BANNER_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      logger.info(`Banner updated: ${bannerId}`);
      return banner;
    } catch (error) {
      logger.error(`Update banner failed: ${bannerId}`, error);
      throw error;
    }
  }

  // Delete banner
  async deleteBanner(bannerId: string): Promise<void> {
    try {
      const deleted = await this.inAppBannerRepository.deleteBanner(bannerId);
      if (!deleted) {
        throw new AppError(API_MESSAGES.IN_APP_BANNER.BANNER_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      logger.info(`Banner deleted: ${bannerId}`);
    } catch (error) {
      logger.error(`Delete banner failed: ${bannerId}`, error);
      throw error;
    }
  }
}

export default InAppBannerService;
