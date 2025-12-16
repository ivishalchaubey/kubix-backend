import { Types } from "mongoose";
import { Webinar } from "../models/webinar.model.js";
import { HttpStatus, API_MESSAGES } from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";

class WebinarRepository {
  
  // Mark past webinars as completed if their schedule has ended
  markCompletedWebinars = async (): Promise<void> => {
    const now = new Date();
    await Webinar.updateMany(
      {
        status: { $in: ["published", "live", "expired"] },
        $expr: {
          $lt: [
            { $add: ["$scheduledDate", { $multiply: ["$duration", 60000] }] },
            now
          ]
        }
      },
      { $set: { status: "completed" } }
    );
    await Webinar.updateMany({ status: "expired" }, { $set: { status: "completed" } });
  };
  
  // Create a new webinar
  createWebinar = async (webinarData: any): Promise<any> => {
    return await Webinar.create(webinarData);
  };

  // Get webinar by ID
  getWebinarById = async (webinarId: string): Promise<any> => {
    if (!Types.ObjectId.isValid(webinarId)) {
      throw new AppError(
        API_MESSAGES.WEBINAR.WEBINAR_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return await Webinar.findById(webinarId).populate({
      path: "universityId",
      select: "firstName lastName email collegeName"
    });
  };

  // Get all webinars
  getAllWebinars = async (): Promise<any[]> => {
    return await Webinar.find()
      .populate({
        path: "universityId",
        select: "firstName lastName email collegeName"
      })
      .sort({ scheduledDate: -1, createdAt: -1 });
  };

  // Get webinars by university
  getWebinarsByUniversity = async (universityId: string): Promise<any[]> => {
    if (!Types.ObjectId.isValid(universityId)) {
      throw new AppError(
        API_MESSAGES.ERROR.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return await Webinar.find({ universityId })
      .sort({ scheduledDate: -1, createdAt: -1 });
  };

  // Get published webinars (for students)
  getPublishedWebinars = async (): Promise<any[]> => {
    return await Webinar.find({ 
      status: { $in: ["published", "live"] }
    })
      .populate({
        path: "universityId",
        select: "firstName lastName email collegeName"
      })
      .sort({ scheduledDate: 1 });
  };

  // Get upcoming webinars
  getUpcomingWebinars = async (): Promise<any[]> => {
    const now = new Date();
    return await Webinar.find({
      status: { $in: ["published", "live"] },
      scheduledDate: { $gte: now }
    })
      .populate({
        path: "universityId",
        select: "firstName lastName email collegeName"
      })
      .sort({ scheduledDate: 1 });
  };

  // Update webinar
  updateWebinar = async (webinarId: string, updateData: any): Promise<any> => {
    if (!Types.ObjectId.isValid(webinarId)) {
      throw new AppError(
        API_MESSAGES.WEBINAR.WEBINAR_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return await Webinar.findByIdAndUpdate(
      webinarId,
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: "universityId",
      select: "firstName lastName email collegeName"
    });
  };

  // Delete webinar
  deleteWebinar = async (webinarId: string): Promise<any> => {
    if (!Types.ObjectId.isValid(webinarId)) {
      throw new AppError(
        API_MESSAGES.WEBINAR.WEBINAR_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return await Webinar.findByIdAndDelete(webinarId);
  };

  // Publish webinar
  publishWebinar = async (webinarId: string): Promise<any> => {
    if (!Types.ObjectId.isValid(webinarId)) {
      throw new AppError(
        API_MESSAGES.WEBINAR.WEBINAR_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return await Webinar.findByIdAndUpdate(
      webinarId,
      { 
        status: "published",
        publishedAt: new Date(),
        coinsDeducted: true
      },
      { new: true }
    );
  };

  // Check if webinar link should be visible (30 minutes before)
  shouldShowWebinarLink = async (webinarId: string): Promise<boolean> => {
    const webinar = await Webinar.findById(webinarId);
    if (!webinar) return false;
    
    const now = new Date();
    const scheduledDateTime = new Date(webinar.scheduledDate);
    const thirtyMinutesBefore = new Date(scheduledDateTime.getTime() - 30 * 60 * 1000);
    
    return now >= thirtyMinutesBefore && webinar.status === "published";
  };
}

export default WebinarRepository;

