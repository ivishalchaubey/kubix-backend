import { Types } from "mongoose";
import { InAppBanner } from "../models/inAppBanner.model.js";
import { HttpStatus, API_MESSAGES } from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";

class InAppBannerRepository {
  
  // Create a new banner
  createBanner = async (bannerData: any): Promise<any> => {
    return await InAppBanner.create(bannerData);
  };

  // Get banner by ID
  getBannerById = async (bannerId: string): Promise<any> => {
    if (!Types.ObjectId.isValid(bannerId)) {
      throw new AppError(
        API_MESSAGES.IN_APP_BANNER.BANNER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return await InAppBanner.findById(bannerId);
  };

  // Get all banners
  getBanners = async (): Promise<any[]> => {
    return await InAppBanner.find().sort({ priority: -1, createdAt: -1 });
  };

  // Get active banners
  getActiveBanners = async (): Promise<any[]> => {
    const currentDate = new Date();
    
    return await InAppBanner.find({
      isActive: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: null },
        { startDate: { $lte: currentDate } }
      ],
      $and: [
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: null },
            { endDate: { $gte: currentDate } }
          ]
        }
      ]
    }).sort({ priority: -1, createdAt: -1 });
  };

  // Update banner
  updateBanner = async (bannerId: string, updateData: any): Promise<any> => {
    if (!Types.ObjectId.isValid(bannerId)) {
      throw new AppError(
        API_MESSAGES.IN_APP_BANNER.BANNER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return await InAppBanner.findByIdAndUpdate(
      bannerId,
      updateData,
      { new: true, runValidators: true }
    );
  };

  // Delete banner
  deleteBanner = async (bannerId: string): Promise<any> => {
    if (!Types.ObjectId.isValid(bannerId)) {
      throw new AppError(
        API_MESSAGES.IN_APP_BANNER.BANNER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return await InAppBanner.findByIdAndDelete(bannerId);
  };
}

export default InAppBannerRepository;
