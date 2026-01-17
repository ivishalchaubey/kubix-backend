/**
 * Kylas Activity Service
 *
 * Activity tracking logic:
 * - Never creates leads - only updates existing
 * - Falls back to adding notes if custom fields don't exist
 */

import KylasLeadRepository from "../repositories/KylasLeadRepository.js";
import KylasConfig from "../config/KylasConfig.js";
import { ActivityType } from "../types/KylasTypes.js";
import logger from "../../../utils/logger.js";

class KylasActivityService {
  private static instance: KylasActivityService | null = null;
  private leadRepository: KylasLeadRepository;

  private constructor() {
    this.leadRepository = KylasLeadRepository.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): KylasActivityService {
    if (!KylasActivityService.instance) {
      KylasActivityService.instance = new KylasActivityService();
    }
    return KylasActivityService.instance;
  }

  /**
   * Track activity for an existing lead
   * IMPORTANT: This method NEVER creates leads - only updates existing ones
   */
  public async trackActivity(
    email: string,
    activityType: ActivityType,
    activityData: string | string[]
  ): Promise<void> {
    try {
      // Find existing lead - DO NOT create
      const lead = await this.leadRepository.findByEmail(email);

      if (!lead) {
        logger.warn(
          `No Kylas lead found for ${email}, cannot track activity. ` +
            `Lead must be created during registration.`
        );
        return;
      }

      // Build data string
      const dataString = Array.isArray(activityData)
        ? activityData.join(", ")
        : activityData;

      // Get field name for activity type
      const fieldName = this.getFieldNameForActivity(activityType);

      if (fieldName) {
        try {
          // Try to update custom field
          await this.leadRepository.patch(lead.id, [
            {
              op: "add",
              path: `/customFieldValues/${fieldName}`,
              value: dataString,
            },
          ]);
        } catch (patchError: any) {
          // If custom field doesn't exist, fallback to note
          if (
            patchError.response?.status === 400 &&
            JSON.stringify(patchError.response?.data || {}).includes(
              "Field is not defined"
            )
          ) {
            await this.addActivityAsNote(lead.id, activityType, activityData);
          } else {
            throw patchError;
          }
        }
      }
    } catch (error: any) {
      logger.error(`Error tracking activity ${activityType} for ${email}:`, {
        message: error.message,
        details: error.response?.data,
      });
    }
  }

  /**
   * Get custom field name for activity type
   */
  private getFieldNameForActivity(activityType: ActivityType): string {
    switch (activityType) {
      case ActivityType.CAREER_FIELD_SELECTED:
        return KylasConfig.CUSTOM_FIELDS.CAREER_FIELD;
      case ActivityType.CAREER_SHORTLISTED:
        return KylasConfig.CUSTOM_FIELDS.SHORTLISTED_CAREERS;
      case ActivityType.COURSE_SHORTLISTED:
        return KylasConfig.CUSTOM_FIELDS.SHORTLISTED_COURSES;
      case ActivityType.COURSE_APPLIED:
        return KylasConfig.CUSTOM_FIELDS.APPLIED_COURSES;
      case ActivityType.COLLEGE_SHORTLISTED:
        return KylasConfig.CUSTOM_FIELDS.SHORTLISTED_COLLEGES;
      default:
        return "";
    }
  }

  /**
   * Add activity as a formatted note when custom field doesn't exist
   */
  private async addActivityAsNote(
    leadId: number,
    activityType: ActivityType,
    activityData: string | string[]
  ): Promise<void> {
    // Get note title based on activity type
    const noteTitle = this.getNoteTitleForActivity(activityType);

    // Format items as bullet list for readability
    const itemsList = Array.isArray(activityData)
      ? activityData.map((item) => `• ${item}`).join("\n")
      : `• ${activityData}`;

    const noteContent = `${noteTitle}\n\n${itemsList}`;

    await this.leadRepository.addNote(leadId, noteContent);
  }

  /**
   * Get note title for activity type
   */
  private getNoteTitleForActivity(activityType: ActivityType): string {
    switch (activityType) {
      case ActivityType.CAREER_SHORTLISTED:
        return "📌 Shortlisted Careers";
      case ActivityType.COURSE_SHORTLISTED:
        return "📌 Shortlisted Courses";
      case ActivityType.COLLEGE_SHORTLISTED:
        return "📌 Shortlisted Colleges";
      case ActivityType.COURSE_APPLIED:
        return "✅ Applied to Colleges";
      case ActivityType.CAREER_FIELD_SELECTED:
        return "🎯 Selected Career Field";
      default:
        return "📋 Activity";
    }
  }

  /**
   * Add a custom note to a lead
   */
  public async addNoteToLead(email: string, note: string): Promise<void> {
    try {
      const lead = await this.leadRepository.findByEmail(email);

      if (!lead) {
        logger.warn(`No Kylas lead found for ${email}, cannot add note`);
        return;
      }

      await this.leadRepository.addNote(lead.id, note);
    } catch (error: any) {
      logger.error(`Error adding note for ${email}:`, error.message);
    }
  }
}

export default KylasActivityService;
