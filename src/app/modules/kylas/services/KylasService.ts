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

    // Request interceptor - silent
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        return config;
      },
      (error: AxiosError) => {
        logger.error("Kylas API Request Error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
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
      const data = error.response.data as any;
      const errorString = JSON.stringify(data || {});

      // Suppress expected errors as warnings (these are handled gracefully)
      const isExpectedError =
        errorString.includes("Field is not defined") ||
        errorString.includes("Invalid Mobile Number");

      if (isExpectedError) {
        // Don't log - these are handled by the calling code
        return;
      }

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

      return response.data;
    } catch (error: any) {
      // If validation error (400), try creating with minimal fields
      if (
        error.response?.status === 400 &&
        (data.board || data.stream || data.grade)
      ) {
        try {
          // Retry with minimal payload
          const minimalPayload: CreateLeadPayload = {
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
          };

          const retryResponse = await this.client.post<KylasLead>(
            "/leads/",
            minimalPayload
          );
          return retryResponse.data;
        } catch (retryError: any) {
          // If minimal failed (likely phone number issue), try absolute minimal (Name + Email only)
          if (retryError.response?.status === 400) {
            try {
              const absoluteMinimalPayload: CreateLeadPayload = {
                firstName: data.firstName,
                lastName: data.lastName,
                emails: this.formatEmail(data.email),
                requirementName: "Student Counselling",
              };
              const lastResortResponse = await this.client.post<KylasLead>(
                "/leads/",
                absoluteMinimalPayload
              );
              return lastResortResponse.data;
            } catch (lastResortError: any) {
              logger.error(
                "Absolute minimal creation failed:",
                lastResortError.response?.data
              );
            }
          }

          logger.error("Error creating minimal Kylas lead:", {
            message: retryError.message,
            stack: retryError.stack,
            details: retryError.response?.data,
          });
          return null;
        }
      }

      logger.error("Error creating Kylas lead:", {
        message: error.message,
        stack: error.stack,
        details: error.response?.data,
      });
      // Don't throw error - we don't want to fail user registration if Kylas is down
      return null;
    }
  }

  /**
   * Update an existing lead in Kylas CRM (Partial Update using JSON Patch)
   * Includes retry logic for rate limiting (429 errors)
   */
  async patchLead(
    leadId: number,
    patchOperations: any[],
    retryCount = 0
  ): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.client.patch(`/leads/${leadId}`, patchOperations, {
        headers: {
          "Content-Type": "application/json-patch+json",
        },
      });
    } catch (error: any) {
      // Retry on rate limit (429) with exponential backoff
      if (error.response?.status === 429 && retryCount < 3) {
        const delay = (retryCount + 1) * 1000; // 1s, 2s, 3s
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.patchLead(leadId, patchOperations, retryCount + 1);
      }
      // Re-throw error so caller can handle (e.g., fallback to notes)
      throw error;
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
    activityData: string | string[],
    userDetails?: {
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
    }
  ): Promise<void> {
    if (!this.enabled) return;

    try {
      // Find lead by email
      let lead = await this.searchLead(email);

      // If lead not found and we have details, create it
      if (!lead && userDetails) {
        lead = await this.createLead(userDetails);
      }

      if (!lead) {
        logger.warn(
          `No Kylas lead found (and creation failed/skipped) for ${email}, cannot track activity`
        );
        return;
      }

      // Build data string
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
        try {
          await this.patchLead(lead.id, [
            {
              op: "add",
              path: `/customFieldValues/${fieldName}`,
              value: dataString,
            },
          ]);
        } catch (patchError: any) {
          // If patching fails (likely missing field), fallback to adding a note
          if (
            patchError.response?.status === 400 &&
            JSON.stringify(patchError.response?.data || {}).includes(
              "Field is not defined"
            )
          ) {
            // Format note content with proper labels
            let noteTitle = "";
            switch (activityType) {
              case ActivityType.CAREER_SHORTLISTED:
                noteTitle = "📌 Shortlisted Careers";
                break;
              case ActivityType.COURSE_SHORTLISTED:
                noteTitle = "📌 Shortlisted Courses";
                break;
              case ActivityType.COLLEGE_SHORTLISTED:
                noteTitle = "📌 Shortlisted Colleges";
                break;
              case ActivityType.COURSE_APPLIED:
                noteTitle = "✅ Applied to Colleges";
                break;
              case ActivityType.CAREER_FIELD_SELECTED:
                noteTitle = "🎯 Selected Career Field";
                break;
              default:
                noteTitle = "📋 Activity";
            }

            // Format items as bullet list for readability
            const itemsList = Array.isArray(activityData)
              ? activityData.map((item) => `• ${item}`).join("\n")
              : `• ${activityData}`;

            const noteContent = `${noteTitle}\n\n${itemsList}`;
            await this.addNoteToLead(lead.id, noteContent);
          } else {
            throw patchError;
          }
        }
      }
    } catch (error: any) {
      logger.error(`Error tracking activity ${activityType} for ${email}:`, {
        message: error.message,
        stack: error.stack,
        details: error.response?.data,
      });
    }
  }

  /**
   * Add note to lead
   * Includes retry logic for rate limiting (429 errors)
   */
  async addNoteToLead(
    leadId: number,
    note: string,
    retryCount = 0
  ): Promise<void> {
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
    } catch (error: any) {
      // Retry on rate limit (429) with exponential backoff
      if (error.response?.status === 429 && retryCount < 3) {
        const delay = (retryCount + 1) * 1000; // 1s, 2s, 3s
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.addNoteToLead(leadId, note, retryCount + 1);
      }
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
