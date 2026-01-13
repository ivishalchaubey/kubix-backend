import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import KylasConfig from "../config/KylasConfig.js";
import {
  CreateLeadPayload,
  UpdateLeadPayload,
  KylasLead,
  KylasSearchResponse,
  KylasApiError,
  ActivityType,
  KylasPhoneNumber,
  KylasEmail,
  KylasCustomFields,
} from "../types/KylasTypes.js";
import logger from "../../../utils/logger.js";

class KylasService {
  private client: AxiosInstance;
  private enabled: boolean;

  constructor() {
    this.enabled = !!KylasConfig.API_KEY;

    if (!this.enabled) {
      logger.warn(
        "Kylas CRM integration is disabled - KYLAS_API_KEY not configured"
      );
    }

    this.client = axios.create({
      baseURL: KylasConfig.BASE_URL,
      timeout: KylasConfig.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        "api-key": KylasConfig.API_KEY,
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        logger.info(
          `Kylas API Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error: AxiosError) => {
        logger.error("Kylas API Request Error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        logger.info(
          `Kylas API Response: ${response.status} ${response.config.url}`
        );
        return response;
      },
      (error: AxiosError) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Handle API errors with detailed logging
   */
  private handleApiError(error: AxiosError): void {
    if (error.response) {
      logger.error("Kylas API Error Response:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      logger.error("Kylas API No Response:", {
        url: error.config?.url,
        message: error.message,
      });
    } else {
      logger.error("Kylas API Error:", error.message);
    }
  }

  /**
   * Format phone number for Kylas API
   */
  private formatPhoneNumber(
    phoneNumber?: string,
    countryCode?: string
  ): KylasPhoneNumber[] | undefined {
    if (!phoneNumber) return undefined;

    return [
      {
        type: "MOBILE",
        code: countryCode || KylasConfig.DEFAULT_COUNTRY_CODE,
        value: phoneNumber,
        dialCode: countryCode?.startsWith("+")
          ? countryCode
          : KylasConfig.DEFAULT_DIAL_CODE,
        primary: true,
      },
    ];
  }

  /**
   * Format email for Kylas API
   */
  private formatEmail(email: string): KylasEmail[] {
    return [
      {
        type: "PERSONAL",
        value: email.toLowerCase(),
        primary: true,
      },
    ];
  }

  /**
   * Search for existing lead by email
   */
  async searchLead(email: string): Promise<KylasLead | null> {
    if (!this.enabled) return null;

    try {
      const response = await this.client.post<KylasSearchResponse>(
        "/search/lead",
        {
          fields: ["id", "firstName", "lastName", "emails"],
          jsonRule: {
            rules: [
              {
                id: "multi_field",
                field: "multi_field",
                type: "multi_field",
                input: "multi_field",
                operator: "multi_field",
                value: email,
              },
            ],
            condition: "AND",
            valid: true,
          },
          limit: 1,
        }
      );

      if (response.data.totalCount > 0 && response.data.records.length > 0) {
        logger.info(`Found existing Kylas lead for email: ${email}`);
        return response.data.records[0];
      }

      return null;
    } catch (error) {
      logger.error("Error searching Kylas lead:", error);
      return null;
    }
  }

  /**
   * Create a new lead in Kylas CRM
   */
  async createLead(data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string | undefined;
    countryCode?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    board?: string | undefined;
    stream?: string | undefined;
    grade?: string | undefined;
  }): Promise<KylasLead | null> {
    if (!this.enabled) {
      logger.warn("Kylas CRM is disabled, skipping lead creation");
      return null;
    }

    try {
      // Check if lead already exists
      const existingLead = await this.searchLead(data.email);
      if (existingLead) {
        logger.info(`Lead already exists for ${data.email}, skipping creation`);
        return existingLead;
      }

      // Build custom fields
      const customFieldValues: KylasCustomFields = {};
      if (data.board) {
        customFieldValues[KylasConfig.CUSTOM_FIELDS.BOARD] = data.board;
      }
      if (data.stream) {
        customFieldValues[KylasConfig.CUSTOM_FIELDS.STREAM] = data.stream;
      }
      if (data.grade) {
        customFieldValues[KylasConfig.CUSTOM_FIELDS.GRADE] = data.grade;
      }

      // Build lead payload
      const payload: CreateLeadPayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        emails: this.formatEmail(data.email),
        phoneNumbers: this.formatPhoneNumber(
          data.phoneNumber,
          data.countryCode
        ),
        city: data.city,
        state: data.state,
        country: KylasConfig.DEFAULT_COUNTRY_CODE,
        requirementName: "Student Counselling",
        customFieldValues:
          Object.keys(customFieldValues).length > 0
            ? customFieldValues
            : undefined,
      };

      const response = await this.client.post<KylasLead>("/leads/", payload);
      logger.info(
        `Created Kylas lead for ${data.email} with ID: ${response.data.id}`
      );

      return response.data;
    } catch (error) {
      logger.error("Error creating Kylas lead:", error);
      // Don't throw error - we don't want to fail user registration if Kylas is down
      return null;
    }
  }

  /**
   * Update an existing lead in Kylas CRM (Partial Update using JSON Patch)
   */
  async patchLead(leadId: number, patchOperations: any[]): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.client.patch(`/leads/${leadId}`, patchOperations, {
        headers: {
          "Content-Type": "application/json-patch+json",
        },
      });
      logger.info(`Patched Kylas lead ID: ${leadId}`);
    } catch (error: any) {
      logger.error(
        `Error patching Kylas lead ${leadId}:`,
        error.response?.data || error.message
      );
    }
  }

  /**
   * Update an existing lead in Kylas CRM (Full Update)
   */
  async updateLead(
    leadId: number,
    updateData: UpdateLeadPayload
  ): Promise<KylasLead | null> {
    if (!this.enabled) return null;

    try {
      const response = await this.client.put<KylasLead>(
        `/leads/${leadId}`,
        updateData
      );
      logger.info(`Updated Kylas lead ID: ${leadId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error updating Kylas lead ${leadId}:`, error);
      return null;
    }
  }

  /**
   * Track student activity by updating lead
   */
  async trackActivity(
    email: string,
    activityType: ActivityType,
    activityData: string | string[]
  ): Promise<void> {
    if (!this.enabled) return;

    try {
      // Find lead by email
      const lead = await this.searchLead(email);
      if (!lead) {
        logger.warn(`No Kylas lead found for ${email}, cannot track activity`);
        return;
      }

      // Build JSON Patch operations for custom fields
      const dataString = Array.isArray(activityData)
        ? activityData.join(", ")
        : activityData;

      let fieldName = "";
      switch (activityType) {
        case ActivityType.CAREER_FIELD_SELECTED:
          fieldName = KylasConfig.CUSTOM_FIELDS.CAREER_FIELD;
          break;
        case ActivityType.CAREER_SHORTLISTED:
          fieldName = KylasConfig.CUSTOM_FIELDS.SHORTLISTED_CAREERS;
          break;
        case ActivityType.COURSE_SHORTLISTED:
          fieldName = KylasConfig.CUSTOM_FIELDS.SHORTLISTED_COURSES;
          break;
        case ActivityType.COURSE_APPLIED:
          fieldName = KylasConfig.CUSTOM_FIELDS.APPLIED_COURSES;
          break;
        case ActivityType.COLLEGE_SHORTLISTED:
          fieldName = KylasConfig.CUSTOM_FIELDS.SHORTLISTED_COLLEGES;
          break;
      }

      if (fieldName) {
        await this.patchLead(lead.id, [
          {
            op: "replace",
            path: `/customFieldValues/${fieldName}`,
            value: dataString,
          },
        ]);
        logger.info(`Tracked ${activityType} for ${email}`);
      }
    } catch (error) {
      logger.error(
        `Error tracking activity ${activityType} for ${email}:`,
        error
      );
    }
  }

  /**
   * Add note to lead
   */
  async addNoteToLead(leadId: number, note: string): Promise<void> {
    if (!this.enabled) return;

    try {
      // Documentation says use /v1/notes/relation with sourceEntity.description
      await this.client.post(`/notes/relation`, {
        targetEntityId: leadId,
        targetEntityType: "LEAD",
        sourceEntity: {
          description: note,
        },
      });
      logger.info(`Added note to Kylas lead ${leadId}`);
    } catch (error) {
      logger.error(`Error adding note to Kylas lead ${leadId}:`, error);
    }
  }

  /**
   * Check if Kylas integration is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

export default KylasService;
