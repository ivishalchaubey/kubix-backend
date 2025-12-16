import { Types } from "mongoose";
import { ApplicationForm } from "../models/applicationForm.model.js";
import User from "../../auth/models/User.js";
import { HttpStatus, API_MESSAGES } from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";

class ApplicationFormRepository {
  // Create or update application form using single upsert
  createOrUpdateApplication = async (
    userId: string,
    collegeId: string,
    applicationData: any
  ): Promise<any> => {
    if (
      !Types.ObjectId.isValid(userId) ||
      !Types.ObjectId.isValid(collegeId)
    ) {
      throw new AppError(
        API_MESSAGES.ERROR.INVALID_INPUT,
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate college exists and is a university
    const collegeExists = await User.exists({
      _id: new Types.ObjectId(collegeId),
      role: "university",
    });

    if (!collegeExists) {
      throw new AppError(
        API_MESSAGES.APPLICATION_FORM.COLLEGE_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    const filter = {
      userId: new Types.ObjectId(userId),
      collegeId: new Types.ObjectId(collegeId),
    };

    const updateDocument: any = {
      ...applicationData,
      userId: filter.userId,
      collegeId: filter.collegeId,
      status: applicationData.status || "draft",
    };

    if (applicationData.status === "submitted") {
      updateDocument.submittedAt = new Date();
    }

    const upserted = await ApplicationForm.findOneAndUpdate(
      filter,
      { $set: updateDocument },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    )
      .populate("collegeId", "-password -otp -refreshToken -accessToken")
      .populate("userId", "-password -otp -refreshToken -accessToken")
      .lean();

    return upserted;
  };

  // Get application by college ID and user ID
  getApplicationByCollegeId = async (
    userId: string,
    collegeId: string
  ): Promise<any> => {
    if (
      !Types.ObjectId.isValid(userId) ||
      !Types.ObjectId.isValid(collegeId)
    ) {
      throw new AppError(
        API_MESSAGES.ERROR.INVALID_INPUT,
        HttpStatus.BAD_REQUEST
      );
    }

    const application = await ApplicationForm.findOne({
      userId: new Types.ObjectId(userId),
      collegeId: new Types.ObjectId(collegeId),
    })
      .populate("collegeId", "-password -otp -refreshToken -accessToken")
      .populate("userId", "-password -otp -refreshToken -accessToken")
      .lean();

    if (!application) {
      throw new AppError(
        API_MESSAGES.APPLICATION_FORM.APPLICATION_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    return application;
  };

  // Get all applications for a user
  getUserApplications = async (userId: string): Promise<any[]> => {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(
        API_MESSAGES.ERROR.INVALID_INPUT,
        HttpStatus.BAD_REQUEST
      );
    }

    const applications = await ApplicationForm.find({
      userId: new Types.ObjectId(userId),
    })
      .populate("collegeId", "-password -otp -refreshToken -accessToken")
      .populate("userId", "-password -otp -refreshToken -accessToken")
      .sort({ createdAt: -1 })
      .lean();

    return applications;
  };

  // Get all applications for a college (for university view)
  getCollegeApplications = async (collegeId: string): Promise<any[]> => {
    if (!Types.ObjectId.isValid(collegeId)) {
      throw new AppError(
        API_MESSAGES.ERROR.INVALID_INPUT,
        HttpStatus.BAD_REQUEST
      );
    }

    const applications = await ApplicationForm.find({
      collegeId: new Types.ObjectId(collegeId),
    })
      .populate("userId", "-password -otp -refreshToken -accessToken")
      .populate("collegeId", "-password -otp -refreshToken -accessToken")
      .sort({ createdAt: -1 })
      .lean();

    return applications;
  };

  // Delete application
  deleteApplication = async (
    userId: string,
    collegeId: string
  ): Promise<void> => {
    if (
      !Types.ObjectId.isValid(userId) ||
      !Types.ObjectId.isValid(collegeId)
    ) {
      throw new AppError(
        API_MESSAGES.ERROR.INVALID_INPUT,
        HttpStatus.BAD_REQUEST
      );
    }

    const deleted = await ApplicationForm.findOneAndDelete({
      userId: new Types.ObjectId(userId),
      collegeId: new Types.ObjectId(collegeId),
    });

    if (!deleted) {
      throw new AppError(
        API_MESSAGES.APPLICATION_FORM.APPLICATION_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
  };
}

export default ApplicationFormRepository;

