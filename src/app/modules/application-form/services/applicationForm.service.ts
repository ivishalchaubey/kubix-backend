import ApplicationFormRepository from "../repositories/applicationForm.repository.js";
import logger from "../../../utils/logger.js";
import { HttpStatus, API_MESSAGES } from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";

class ApplicationFormService {
  private applicationFormRepository: ApplicationFormRepository;

  constructor() {
    this.applicationFormRepository = new ApplicationFormRepository();
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

      const result = await this.applicationFormRepository.createOrUpdateApplication(
        userId,
        collegeIds,
        sanitizedData
      );

      logger.info(`Application form saved for user ${userId} with colleges: ${collegeIds.join(", ")}`);

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

    const twelfthFields = [
      "twelfthPercentage",
      "twelfthSchoolName",
      "passingYear",
      "twelfthMarksheet",
    ];

    const missingTwelfthFields = twelfthFields.filter((field) => !data[field]);

    if (missingTwelfthFields.length > 0) {
      throw new AppError(
        API_MESSAGES.APPLICATION_FORM.TWELFTH_FIELDS_REQUIRED,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // Get application by college ID
  async getApplicationByCollegeId(
    userId: string,
    collegeId: string
  ): Promise<any> {
    try {
      const result = await this.applicationFormRepository.getApplicationByCollegeId(
        userId,
        collegeId
      );
      return result;
    } catch (error) {
      logger.error("Get application form failed:", error);
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
      const result = await this.applicationFormRepository.getCollegeApplications(
        collegeId
      );
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
        `Colleges added to application for user ${userId}: ${collegeIds.join(", ")}`
      );
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
      logger.info(`Application deleted for user ${userId} and college ${collegeId}`);
    } catch (error) {
      logger.error("Delete application failed:", error);
      throw error;
    }
  }
}

export default ApplicationFormService;

