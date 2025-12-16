import { Types } from "mongoose";
import { Shortlist, ShortlistType } from "../models/shortlist.model.js";
import { HttpStatus, API_MESSAGES } from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";
import CategoryModel from "../../admin/categories/models/category.js";
import { Course } from "../../courses/models/course.js";
import User from "../../auth/models/User.js";

class ShortlistRepository {
  // Create or toggle shortlist item
  createShortlist = async (
    userId: string,
    itemId: string,
    itemType: ShortlistType
  ): Promise<any> => {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(itemId)) {
      throw new AppError(
        API_MESSAGES.ERROR.INVALID_INPUT,
        HttpStatus.BAD_REQUEST
      );
    }

    // Check if item exists based on type
    await this.validateItemExists(itemId, itemType);

    // Check if already shortlisted
    const existing = await Shortlist.findOne({
      userId: new Types.ObjectId(userId),
      itemId: new Types.ObjectId(itemId),
      itemType,
    });

    if (existing) {
      // If already shortlisted, remove it (toggle off)
      await Shortlist.findByIdAndDelete(existing._id);
      return { shortlisted: false, action: "removed" };
    } else {
      // Create new shortlist entry
      const shortlist = await Shortlist.create({
        userId: new Types.ObjectId(userId),
        itemId: new Types.ObjectId(itemId),
        itemType,
      });
      return { shortlisted: true, action: "added", shortlist };
    }
  };

  // Validate item exists based on type
  private validateItemExists = async (
    itemId: string,
    itemType: ShortlistType
  ): Promise<void> => {
    let item;
    switch (itemType) {
      case "career":
        item = await CategoryModel.findById(itemId);
        if (!item) {
          throw new AppError(
            API_MESSAGES.SHORTLIST.CATEGORY_NOT_FOUND,
            HttpStatus.NOT_FOUND
          );
        }
        break;
      case "colleges":
        item = await User.findOne({
          _id: itemId,
          role: "university",
        });
        if (!item) {
          throw new AppError(
            API_MESSAGES.SHORTLIST.UNIVERSITY_NOT_FOUND,
            HttpStatus.NOT_FOUND
          );
        }
        break;
      case "course":
        item = await Course.findById(itemId);
        if (!item) {
          throw new AppError(
            API_MESSAGES.SHORTLIST.COURSE_NOT_FOUND,
            HttpStatus.NOT_FOUND
          );
        }
        break;
      default:
        throw new AppError(
          API_MESSAGES.ERROR.INVALID_INPUT,
          HttpStatus.BAD_REQUEST
        );
    }
  };

  // Get all shortlisted items for a user with optional type filter and pagination
  getShortlists = async (
    userId: string,
    itemType?: ShortlistType,
    page: number = 1,
    limit: number = 10
  ): Promise<any> => {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(
        API_MESSAGES.ERROR.INVALID_INPUT,
        HttpStatus.BAD_REQUEST
      );
    }

    const filter: any = {
      userId: new Types.ObjectId(userId),
    };

    if (itemType) {
      filter.itemType = itemType;
    }

    const skip = (page - 1) * limit;

    const [total, shortlists] = await Promise.all([
      Shortlist.countDocuments(filter),
      Shortlist.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    // Populate items based on type
    const populatedShortlists = await Promise.all(
      shortlists.map(async (shortlist) => {
        let item: any = null;
        switch (shortlist.itemType) {
          case "career":
            item = await CategoryModel.findById(shortlist.itemId).lean();
            break;
          case "colleges":
            item = await User.findById(shortlist.itemId)
              .select(
                "-password -otp -refreshToken -accessToken -emailVerificationToken -passwordResetToken -passwordResetExpires"
              )
              .lean();
            break;
          case "course":
            item = await Course.findById(shortlist.itemId)
              .populate({
                path: "UniversityId",
                select:
                  "-password -otp -refreshToken -accessToken -emailVerificationToken -passwordResetToken -passwordResetExpires",
              })
              .populate("categoryId")
              .populate("parentCategoryId")
              .lean();
            break;
        }

        return {
          _id: shortlist._id,
          itemType: shortlist.itemType,
          item: item,
          createdAt: shortlist.createdAt,
          updatedAt: shortlist.updatedAt,
        };
      })
    );

    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    return {
      data: populatedShortlists,
      pagination: {
        page,
        limit,
        totalResults: total,
        totalPages,
        hasNextPage: totalPages > 0 && page < totalPages,
        hasPrevPage: page > 1 && total > 0,
      },
    };
  };

  // Get shortlist by ID
  getShortlistById = async (
    userId: string,
    shortlistId: string
  ): Promise<any> => {
    if (
      !Types.ObjectId.isValid(userId) ||
      !Types.ObjectId.isValid(shortlistId)
    ) {
      throw new AppError(
        API_MESSAGES.ERROR.INVALID_INPUT,
        HttpStatus.BAD_REQUEST
      );
    }

    const shortlist = await Shortlist.findOne({
      _id: new Types.ObjectId(shortlistId),
      userId: new Types.ObjectId(userId),
    });

    if (!shortlist) {
      throw new AppError(
        API_MESSAGES.SHORTLIST.SHORTLIST_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    // Populate item based on type
    let item: any = null;
    switch (shortlist.itemType) {
      case "career":
        item = await CategoryModel.findById(shortlist.itemId).lean();
        break;
      case "colleges":
        item = await User.findById(shortlist.itemId)
          .select(
            "-password -otp -refreshToken -accessToken -emailVerificationToken -passwordResetToken -passwordResetExpires"
          )
          .lean();
        break;
      case "course":
        item = await Course.findById(shortlist.itemId)
          .populate({
            path: "UniversityId",
            select:
              "-password -otp -refreshToken -accessToken -emailVerificationToken -passwordResetToken -passwordResetExpires",
          })
          .populate("categoryId")
          .populate("parentCategoryId")
          .lean();
        break;
    }

    return {
      _id: shortlist._id,
      itemType: shortlist.itemType,
      item: item,
      createdAt: shortlist.createdAt,
      updatedAt: shortlist.updatedAt,
    };
  };

  // Check if item is shortlisted
  isShortlisted = async (
    userId: string,
    itemId: string,
    itemType: ShortlistType
  ): Promise<boolean> => {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(itemId)) {
      return false;
    }

    const shortlist = await Shortlist.findOne({
      userId: new Types.ObjectId(userId),
      itemId: new Types.ObjectId(itemId),
      itemType,
    });

    return !!shortlist;
  };

  // Delete shortlist by ID
  deleteShortlist = async (
    userId: string,
    shortlistId: string
  ): Promise<any> => {
    if (
      !Types.ObjectId.isValid(userId) ||
      !Types.ObjectId.isValid(shortlistId)
    ) {
      throw new AppError(
        API_MESSAGES.ERROR.INVALID_INPUT,
        HttpStatus.BAD_REQUEST
      );
    }

    const shortlist = await Shortlist.findOneAndDelete({
      _id: new Types.ObjectId(shortlistId),
      userId: new Types.ObjectId(userId),
    });

    if (!shortlist) {
      throw new AppError(
        API_MESSAGES.SHORTLIST.SHORTLIST_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    return shortlist;
  };
}

export default ShortlistRepository;
