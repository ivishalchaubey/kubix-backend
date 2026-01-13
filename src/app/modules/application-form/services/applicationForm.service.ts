import ApplicationFormRepository from "../repositories/applicationForm.repository.js";
import logger from "../../../utils/logger.js";
import { HttpStatus, API_MESSAGES } from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";
import KylasService from "../../kylas/services/KylasService.js";
import { ActivityType } from "../../kylas/types/KylasTypes.js";
import AuthRepository from "../../auth/repositories/AuthRepository.js";

class ApplicationFormService {
  private applicationFormRepository: ApplicationFormRepository;
  private kylasService: KylasService;
  private authRepository: AuthRepository;

  constructor() {
    this.applicationFormRepository = new ApplicationFormRepository();
    this.kylasService = new KylasService();
    this.authRepository = new AuthRepository();
  }

  // Create or update application form
  async createOrUpdateApplication(
    userId: string,
    collegeIds: string[],
    applicationData: any
  ): Promise<any> {
    try {
      const sanitizedData = this.sanitizeApplicationData(applicationData);
      this.validateRequiredFields(sanitizedData);
      this.validateTwelfthSection(sanitizedData);

      const result =
        await this.applicationFormRepository.createOrUpdateApplication(
          userId,
          collegeIds,
          sanitizedData
        );

      logger.info(
        `Application form saved for user ${userId} with colleges: ${collegeIds.join(
          ", "
        )}`
      );

      // Track course application in Kylas CRM (non-blocking)
      this.trackApplicationInKylas(userId, collegeIds).catch((error: any) => {
        logger.error(
          "Failed to track application in Kylas (non-blocking):",
          error
        );
      });

      return result;
    } catch (error) {
      logger.error("Create/update application form failed:", error);
      throw error;
    }
  }

  // Trim string inputs to keep payload clean
  private sanitizeApplicationData(data: any): any {
    const sanitized: any = {};

    Object.entries(data || {}).forEach(([key, value]) => {
      if (typeof value === "string") {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  // Validate required fields
  private validateRequiredFields(data: any): void {
    const requiredFields = [
      "firstName",
      "lastName",
      "dateOfBirth",
      "phoneCountryCode",
      "phoneNumber",
      "email",
      "tenthPercentage",
      "tenthMarksheet",
      "guardianName",
      "guardianPhoneCountryCode",
      "guardianPhoneNumber",
    ];

    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
      throw new AppError(
        `Missing required fields: ${missingFields.join(", ")}`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new AppError(
        API_MESSAGES.APPLICATION_FORM.INVALID_EMAIL,
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.dateOfBirth)) {
      throw new AppError(
        API_MESSAGES.APPLICATION_FORM.INVALID_DATE_FORMAT,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private validateTwelfthSection(data: any): void {
    if (!data.twelfthStatus) {
      return;
    }

    // Always required fields for twelfth section
    const alwaysRequiredFields = ["twelfthSchoolName", "passingYear"];

    // Fields that are only required if status is not "pending"
    const conditionalRequiredFields = ["twelfthPercentage", "twelfthMarksheet"];

    // Check always required fields
    const missingAlwaysRequired = alwaysRequiredFields.filter(
      (field) => !data[field] || data[field].trim() === ""
    );

    if (missingAlwaysRequired.length > 0) {
      throw new AppError(
        `Missing required fields: ${missingAlwaysRequired.join(", ")}`,
        HttpStatus.BAD_REQUEST
      );
    }

    // If status is not "pending", check conditional fields
    if (data.twelfthStatus !== "pending") {
      const missingConditionalFields = conditionalRequiredFields.filter(
        (field) => !data[field] || data[field].trim() === ""
      );

      if (missingConditionalFields.length > 0) {
        throw new AppError(
          `Missing required fields: ${missingConditionalFields.join(", ")}`,
          HttpStatus.BAD_REQUEST
        );
      }
    }
  }

  // Get application by college ID
  async getApplicationByCollegeId(
    userId: string,
    collegeId: string
  ): Promise<any> {
    try {
      const result =
        await this.applicationFormRepository.getApplicationByCollegeId(
          userId,
          collegeId
        );
      return result;
    } catch (error: any) {
      // 404 is expected when checking if application exists - don't log as error
      if (error.statusCode !== 404) {
        logger.error("Get application form failed:", error);
      }
      throw error;
    }
  }

  // Get all applications for user
  async getUserApplications(userId: string): Promise<any[]> {
    try {
      const result = await this.applicationFormRepository.getUserApplications(
        userId
      );
      return result;
    } catch (error) {
      logger.error("Get user applications failed:", error);
      throw error;
    }
  }

  // Get all applications for college (university view)
  async getCollegeApplications(collegeId: string): Promise<any[]> {
    try {
      const result =
        await this.applicationFormRepository.getCollegeApplications(collegeId);
      return result;
    } catch (error) {
      logger.error("Get college applications failed:", error);
      throw error;
    }
  }

  // Check if user has an application form
  async checkUserApplication(userId: string): Promise<any | null> {
    try {
      const result = await this.applicationFormRepository.checkUserApplication(
        userId
      );
      return result;
    } catch (error) {
      logger.error("Check user application failed:", error);
      throw error;
    }
  }

  // Add colleges to existing application without form fields
  async addCollegesToApplication(
    userId: string,
    collegeIds: string[]
  ): Promise<any> {
    try {
      const result =
        await this.applicationFormRepository.addCollegesToApplication(
          userId,
          collegeIds
        );
      logger.info(
        `Colleges added to application for user ${userId}: ${collegeIds.join(
          ", "
        )}`
      );

      // Track application in Kylas CRM (non-blocking)
      this.trackApplicationInKylas(userId, collegeIds).catch((error: any) => {
        logger.error(
          "Failed to track application in Kylas (non-blocking):",
          error
        );
      });

      return result;
    } catch (error) {
      logger.error("Add colleges to application failed:", error);
      throw error;
    }
  }

  // Delete application
  async deleteApplication(userId: string, collegeId: string): Promise<void> {
    try {
      await this.applicationFormRepository.deleteApplication(userId, collegeId);
      logger.info(
        `Application deleted for user ${userId} and college ${collegeId}`
      );
    } catch (error) {
      logger.error("Delete application failed:", error);
      throw error;
    }
  }

  // Helper method to track application in Kylas
  private async trackApplicationInKylas(
    userId: string,
    collegeIds: string[]
  ): Promise<void> {
    try {
      // Get user email
      const user = await this.authRepository.findUserById(userId);
      if (!user || !user.email) {
        return;
      }

      // Import User model dynamically to get college names
      const { default: User } = await import("../../auth/models/User.js");

      // Get the names of the colleges that were just applied to
      const collegeNames: string[] = [];

      for (const collegeId of collegeIds) {
        // First try with role filter, then without as fallback
        let college = await User.findOne({
          _id: collegeId,
          role: "university",
        });

        // Fallback: try without role filter
        if (!college) {
          college = await User.findById(collegeId);
        }

        if (college) {
          const collegeName =
            (college as any).collegeName || (college as any).firstName || "";
          if (collegeName) {
            collegeNames.push(collegeName);
          } else {
            // Use ID as fallback
            collegeNames.push(`College ID: ${collegeId}`);
          }
        } else {
          // College not found - skip silently
        }
      }

      if (collegeNames.length > 0) {
        // Format as a single string with proper formatting
        const formattedData =
          collegeNames.length === 1 ? collegeNames[0] : collegeNames;

        await this.kylasService.trackActivity(
          user.email,
          ActivityType.COURSE_APPLIED,
          formattedData,
          {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            countryCode: user.countryCode,
            city: user.city,
            state: user.state,
            board: user.board,
            stream: user.stream,
            grade: user.grade,
          }
        );
      }
    } catch (error: any) {
      logger.error("Error tracking application in Kylas:", {
        message: error.message,
        stack: error.stack,
        details: error.response?.data,
      });
      // Don't throw - this is non-blocking
    }
  }
}

export default ApplicationFormService;
