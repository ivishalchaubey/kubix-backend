import { Types } from "mongoose";
import { ApplicationForm } from "../models/applicationForm.model.js";
import User from "../../auth/models/User.js";
import { HttpStatus, API_MESSAGES } from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";

class ApplicationFormRepository {
  // Create or update application form using single upsert
  createOrUpdateApplication = async (
    userId: string,
    collegeIds: string[],
    applicationData: any
  ): Promise<any> => {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(
        API_MESSAGES.ERROR.INVALID_INPUT,
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate all collegeIds are valid ObjectIds
    const invalidCollegeIds = collegeIds.filter(
      (id) => !Types.ObjectId.isValid(id)
    );
    if (invalidCollegeIds.length > 0) {
      throw new AppError(
        `Invalid college IDs: ${invalidCollegeIds.join(", ")}`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Convert to ObjectIds
    const collegeIdObjs = collegeIds.map((id) => new Types.ObjectId(id));

    // Validate all colleges exist and are universities
    const colleges = await User.find({
      _id: { $in: collegeIdObjs },
      role: "university",
    }).select("_id");

    const foundCollegeIds = colleges.map((c) => c._id.toString());
    const missingCollegeIds = collegeIds.filter(
      (id) => !foundCollegeIds.includes(id)
    );

    if (missingCollegeIds.length > 0) {
      throw new AppError(
        `Colleges not found: ${missingCollegeIds.join(", ")}`,
        HttpStatus.NOT_FOUND
      );
    }

    const userIdObj = new Types.ObjectId(userId);

    // Find existing application for this user
    const existingApplication = await ApplicationForm.findOne({
      userId: userIdObj,
    }).lean();

    // Prepare update document
    const updateDocument: any = {
      ...applicationData,
      userId: userIdObj,
      status: applicationData.status || "draft",
    };

    if (applicationData.status === "submitted") {
      updateDocument.submittedAt = new Date();
    }

    let result;
    if (existingApplication) {
      // Get existing collegeIds as strings for comparison
      const existingCollegeIds = (existingApplication.collegeIds || []).map(
        (id: any) => id.toString()
      );

      // Find new collegeIds that don't exist in the array
      const newCollegeIds = collegeIdObjs.filter(
        (id) => !existingCollegeIds.includes(id.toString())
      );

      // Prepare update object
      const updateObj: any = {
        $set: updateDocument,
      };

      // If there are new colleges, add them (duplicates will be skipped by $addToSet)
      if (newCollegeIds.length > 0) {
        updateObj.$addToSet = { collegeIds: { $each: newCollegeIds } };
      }

      // Update the application
      result = await ApplicationForm.findOneAndUpdate(
        { userId: userIdObj },
        updateObj,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate("collegeIds", "-password -otp -refreshToken -accessToken")
        .populate("userId", "-password -otp -refreshToken -accessToken")
        .lean();
    } else {
      // Create new application with collegeIds in array
      updateDocument.collegeIds = collegeIdObjs;
      result = await ApplicationForm.create(updateDocument);
      result = await ApplicationForm.findById(result._id)
        .populate("collegeIds", "-password -otp -refreshToken -accessToken")
        .populate("userId", "-password -otp -refreshToken -accessToken")
        .lean();
    }

    return result;
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

    const userIdObj = new Types.ObjectId(userId);
    const collegeIdObj = new Types.ObjectId(collegeId);

    const application = await ApplicationForm.findOne({
      userId: userIdObj,
      collegeIds: collegeIdObj,
    })
      .populate("collegeIds", "-password -otp -refreshToken -accessToken")
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

  // Get all applications for a user (returns single application with all colleges)
  getUserApplications = async (userId: string): Promise<any[]> => {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(
        API_MESSAGES.ERROR.INVALID_INPUT,
        HttpStatus.BAD_REQUEST
      );
    }

    const application = await ApplicationForm.findOne({
      userId: new Types.ObjectId(userId),
    })
      .populate("collegeIds", "-password -otp -refreshToken -accessToken")
      .populate("userId", "-password -otp -refreshToken -accessToken")
      .lean();

    // Return as array for consistency with existing API
    return application ? [application] : [];
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
      collegeIds: new Types.ObjectId(collegeId),
    })
      .populate("userId", "-password -otp -refreshToken -accessToken")
      .populate("collegeIds", "-password -otp -refreshToken -accessToken")
      .sort({ createdAt: -1 })
      .lean();

    return applications;
  };

  // Check if user has an application form (returns the form or null)
  checkUserApplication = async (userId: string): Promise<any | null> => {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(
        API_MESSAGES.ERROR.INVALID_INPUT,
        HttpStatus.BAD_REQUEST
      );
    }

    const application = await ApplicationForm.findOne({
      userId: new Types.ObjectId(userId),
    })
      .populate("collegeIds", "-password -otp -refreshToken -accessToken")
      .populate("userId", "-password -otp -refreshToken -accessToken")
      .lean();

    return application;
  };

  // Add colleges to existing application without requiring form fields
  addCollegesToApplication = async (
    userId: string,
    collegeIds: string[]
  ): Promise<any> => {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(
        API_MESSAGES.ERROR.INVALID_INPUT,
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate all collegeIds are valid ObjectIds
    const invalidCollegeIds = collegeIds.filter(
      (id) => !Types.ObjectId.isValid(id)
    );
    if (invalidCollegeIds.length > 0) {
      throw new AppError(
        `Invalid college IDs: ${invalidCollegeIds.join(", ")}`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Convert to ObjectIds
    const collegeIdObjs = collegeIds.map((id) => new Types.ObjectId(id));

    // Validate all colleges exist and are universities
    const colleges = await User.find({
      _id: { $in: collegeIdObjs },
      role: "university",
    }).select("_id");

    const foundCollegeIds = colleges.map((c) => c._id.toString());
    const missingCollegeIds = collegeIds.filter(
      (id) => !foundCollegeIds.includes(id)
    );

    if (missingCollegeIds.length > 0) {
      throw new AppError(
        `Colleges not found: ${missingCollegeIds.join(", ")}`,
        HttpStatus.NOT_FOUND
      );
    }

    const userIdObj = new Types.ObjectId(userId);

    // Check if user has an existing application
    const existingApplication = await ApplicationForm.findOne({
      userId: userIdObj,
    });

    if (!existingApplication) {
      throw new AppError(
        "Application form not found. Please fill the application form first.",
        HttpStatus.NOT_FOUND
      );
    }

    // Get existing collegeIds as strings for comparison
    const existingCollegeIds = (existingApplication.collegeIds || []).map(
      (id: any) => id.toString()
    );

    // Find new collegeIds that don't exist in the array
    const newCollegeIds = collegeIdObjs.filter(
      (id) => !existingCollegeIds.includes(id.toString())
    );

    if (newCollegeIds.length === 0) {
      // All colleges already exist, return existing application
      return await ApplicationForm.findById(existingApplication._id)
        .populate("collegeIds", "-password -otp -refreshToken -accessToken")
        .populate("userId", "-password -otp -refreshToken -accessToken")
        .lean();
    }

    // Add new colleges to the array
    const result = await ApplicationForm.findByIdAndUpdate(
      existingApplication._id,
      {
        $addToSet: { collegeIds: { $each: newCollegeIds } },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("collegeIds", "-password -otp -refreshToken -accessToken")
      .populate("userId", "-password -otp -refreshToken -accessToken")
      .lean();

    return result;
  };

  // Delete application (remove college from array, or delete if last college)
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

    const userIdObj = new Types.ObjectId(userId);
    const collegeIdObj = new Types.ObjectId(collegeId);

    const application = await ApplicationForm.findOne({
      userId: userIdObj,
      collegeIds: collegeIdObj,
    });

    if (!application) {
      throw new AppError(
        API_MESSAGES.APPLICATION_FORM.APPLICATION_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    // If only one college in array, delete the entire document
    if (application.collegeIds.length === 1) {
      await ApplicationForm.findByIdAndDelete(application._id);
    } else {
      // Remove the collegeId from the array
      await ApplicationForm.findByIdAndUpdate(application._id, {
        $pull: { collegeIds: collegeIdObj },
      });
    }
  };
}

export default ApplicationFormRepository;

