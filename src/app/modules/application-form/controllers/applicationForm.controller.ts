import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/global.js";
import ResponseUtil from "../../../utils/response.js";
import { API_MESSAGES } from "../../../constants/enums.js";
import ApplicationFormService from "../services/applicationForm.service.js";

class ApplicationFormController {
  public applicationFormService: ApplicationFormService;

  constructor() {
    this.applicationFormService = new ApplicationFormService();
  }

  // Create or update application form
  async createOrUpdateApplication(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }

      const userId = req.user._id;
      const { collegeId, ...applicationData } = req.body || {};

      if (!collegeId) {
        ResponseUtil.badRequest(res, "collegeId is required");
        return;
      }

      // Normalize collegeId to array (support both string and array)
      const collegeIds = Array.isArray(collegeId) ? collegeId : [collegeId];

      const result = await this.applicationFormService.createOrUpdateApplication(
        userId,
        collegeIds,
        applicationData
      );

      ResponseUtil.success(
        res,
        result,
        API_MESSAGES.APPLICATION_FORM.APPLICATION_CREATED_OR_UPDATED
      );
    } catch (error) {
      next(error);
    }
  }

  // Get application by college ID
  async getApplicationByCollegeId(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }

      const userId = req.user._id;
      const collegeId =
        (req.params?.collegeId as string) ||
        (req.query?.collegeId as string);

      if (!collegeId) {
        ResponseUtil.badRequest(res, "collegeId is required");
        return;
      }

      const result = await this.applicationFormService.getApplicationByCollegeId(
        userId,
        collegeId
      );

      ResponseUtil.success(
        res,
        result,
        API_MESSAGES.APPLICATION_FORM.APPLICATION_FETCHED
      );
    } catch (error) {
      next(error);
    }
  }

  // Get all applications for user
  async getUserApplications(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }

      const userId = req.user._id;
      const result = await this.applicationFormService.getUserApplications(userId);

      ResponseUtil.success(
        res,
        result,
        API_MESSAGES.APPLICATION_FORM.APPLICATIONS_FETCHED
      );
    } catch (error) {
      next(error);
    }
  }

  // Get all applications for college (university view)
  async getCollegeApplications(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }

      const collegeId = req.params.collegeId || req.query.collegeId;

      if (!collegeId) {
        ResponseUtil.badRequest(res, "collegeId is required");
        return;
      }

      const result = await this.applicationFormService.getCollegeApplications(
        collegeId as string
      );

      ResponseUtil.success(
        res,
        result,
        API_MESSAGES.APPLICATION_FORM.APPLICATIONS_FETCHED
      );
    } catch (error) {
      next(error);
    }
  }

  // Check if user has an application form
  async checkUserApplication(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }

      const userId = req.user._id;
      const result = await this.applicationFormService.checkUserApplication(userId);

      if (result) {
        ResponseUtil.success(
          res,
          result,
          "Application form found"
        );
      } else {
        ResponseUtil.success(
          res,
          null,
          "No application form found"
        );
      }
    } catch (error) {
      next(error);
    }
  }

  // Add colleges to existing application (without form fields)
  async addCollegesToApplication(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }

      const userId = req.user._id;
      const { collegeId } = req.body || {};

      if (!collegeId) {
        ResponseUtil.badRequest(res, "collegeId is required");
        return;
      }

      // Normalize collegeId to array (support both string and array)
      const collegeIds = Array.isArray(collegeId) ? collegeId : [collegeId];

      const result = await this.applicationFormService.addCollegesToApplication(
        userId,
        collegeIds
      );

      ResponseUtil.success(
        res,
        result,
        "Colleges added to application successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete application
  async deleteApplication(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }

      const userId = req.user._id;
      const collegeId = req.params.collegeId || req.body.collegeId;

      if (!collegeId) {
        ResponseUtil.badRequest(res, "collegeId is required");
        return;
      }

      await this.applicationFormService.deleteApplication(userId, collegeId as string);

      ResponseUtil.success(
        res,
        null,
        API_MESSAGES.APPLICATION_FORM.APPLICATION_DELETED
      );
    } catch (error) {
      next(error);
    }
  }
}

export default ApplicationFormController;

