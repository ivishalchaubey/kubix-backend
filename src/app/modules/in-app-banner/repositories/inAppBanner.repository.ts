import { Types } from "mongoose";
import { InAppBanner } from "../models/inAppBanner.model.js";
import { HttpStatus, API_MESSAGES } from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";

class InAppBannerRepository {
  private buildDateFilters(currentDate: Date) {
    return {
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
    };
  }

  private async markExpiredBannersCompleted(): Promise<void> {
    const currentDate = new Date();
    await InAppBanner.updateMany(
      {
        endDate: { $exists: true, $ne: null, $lt: currentDate },
        status: { $ne: "completed" }
      },
      {
        $set: {
          status: "completed",
          isActive: false
        }
      }
    );
  }
  
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
    await this.markExpiredBannersCompleted();
    const currentDate = new Date();
    
    return await InAppBanner.find({
      isActive: true,
      status: { $ne: "completed" },
      ...this.buildDateFilters(currentDate)
    }).sort({ priority: -1, createdAt: -1 });
  };

  // Get active banners with pagination
  getActiveBannersPaginated = async (page: number, limit: number): Promise<any> => {
    await this.markExpiredBannersCompleted();
    const currentDate = new Date();
    const filter = {
      isActive: true,
      status: { $ne: "completed" },
      ...this.buildDateFilters(currentDate)
    };

    const skip = (page - 1) * limit;

    const [total, banners] = await Promise.all([
      InAppBanner.countDocuments(filter),
      InAppBanner.find(filter)
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    return {
      data: banners,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: totalPages > 0 && page < totalPages,
        hasPrevPage: page > 1 && total > 0
      }
    };
  };

  // Get top published banners for home data
  getTopPublishedBanners = async (limit: number): Promise<any[]> => {
    await this.markExpiredBannersCompleted();
    const currentDate = new Date();
    return await InAppBanner.find({
      isActive: true,
      $or: [
        { status: "published" },
        { status: { $exists: false } }
      ],
      ...this.buildDateFilters(currentDate)
    })
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit)
      .lean();
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
