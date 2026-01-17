/**
 * Kylas CRM Facade
 *
 * Main entry point for Kylas CRM integration.
 * Provides a clean, simple API for consumers.
 *
 * Key behaviors:
 * - registerLead: Creates lead ONLY on user registration
 * - trackActivity: Updates existing lead (NEVER creates)
 * - addNote: Adds note to existing lead
 */

import KylasClient from "./client/KylasClient.js";
import KylasLeadRepository, {
  LeadData,
} from "./repositories/KylasLeadRepository.js";
import KylasActivityService from "./services/KylasActivityService.js";
import { ActivityType, KylasLead } from "./types/KylasTypes.js";
import logger from "../../utils/logger.js";

class KylasCRMFacade {
  private static instance: KylasCRMFacade | null = null;
  private client: KylasClient;
  private leadRepository: KylasLeadRepository;
  private activityService: KylasActivityService;

  private constructor() {
    this.client = KylasClient.getInstance();
    this.leadRepository = KylasLeadRepository.getInstance();
    this.activityService = KylasActivityService.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): KylasCRMFacade {
    if (!KylasCRMFacade.instance) {
      KylasCRMFacade.instance = new KylasCRMFacade();
    }
    return KylasCRMFacade.instance;
  }

  /**
   * Check if Kylas integration is enabled
   */
  public isEnabled(): boolean {
    return this.client.isEnabled();
  }

  /**
   * Register a new lead in Kylas CRM
   *
   * This should ONLY be called during user registration.
   * Uses findOrCreate to prevent duplicates.
   * Adds a "New User Registered" welcome note.
   *
   * @param userData - User registration data
   * @returns The created/existing lead, or null if disabled/error
   */
  public async registerLead(userData: LeadData): Promise<KylasLead | null> {
    if (!this.client.isEnabled()) {
      logger.warn("Kylas CRM is disabled, skipping lead registration");
      return null;
    }

    try {
      const lead = await this.leadRepository.findOrCreate(userData);

      if (lead) {
        // Add welcome note asynchronously (don't block)
        this.addRegistrationNote(lead.id, userData).catch((error) => {
          logger.error("Failed to add registration note:", error);
        });
      }

      return lead;
    } catch (error) {
      logger.error("Error registering lead in Kylas:", error);
      return null;
    }
  }

  /**
   * Ensure lead exists in Kylas CRM (without adding registration note)
   *
   * Use this when you need to ensure a lead exists for activity tracking,
   * but don't want to add a "New User Registered" note.
   *
   * @param userData - User data
   * @returns The created/existing lead, or null if disabled/error
   */
  public async ensureLeadExists(userData: LeadData): Promise<KylasLead | null> {
    if (!this.client.isEnabled()) {
      return null;
    }

    try {
      return await this.leadRepository.findOrCreate(userData);
    } catch (error) {
      logger.error("Error ensuring lead exists in Kylas:", error);
      return null;
    }
  }

  /**
   * Track user activity in Kylas CRM
   *
   * IMPORTANT: This method ONLY updates existing leads.
   * It will NOT create new leads - users must be registered first.
   *
   * @param email - User's email address
   * @param activityType - Type of activity
   * @param activityData - Activity data (string or array of strings)
   */
  public async trackActivity(
    email: string,
    activityType: ActivityType,
    activityData: string | string[]
  ): Promise<void> {
    if (!this.client.isEnabled()) return;

    try {
      await this.activityService.trackActivity(
        email,
        activityType,
        activityData
      );
    } catch (error) {
      logger.error("Error tracking activity:", error);
    }
  }

  /**
   * Add a note to a lead by email
   *
   * @param email - User's email address
   * @param note - Note content
   */
  public async addNote(email: string, note: string): Promise<void> {
    if (!this.client.isEnabled()) return;

    try {
      await this.activityService.addNoteToLead(email, note);
    } catch (error) {
      logger.error("Error adding note:", error);
    }
  }

  /**
   * Add a note to a lead by lead ID
   *
   * @param leadId - Kylas lead ID
   * @param note - Note content
   */
  public async addNoteById(leadId: number, note: string): Promise<void> {
    if (!this.client.isEnabled()) return;

    try {
      await this.leadRepository.addNote(leadId, note);
    } catch (error) {
      logger.error("Error adding note by ID:", error);
    }
  }

  /**
   * Find lead by email
   *
   * @param email - User's email address
   * @returns The lead if found, null otherwise
   */
  public async findLead(email: string): Promise<KylasLead | null> {
    if (!this.client.isEnabled()) return null;

    return this.leadRepository.findByEmail(email);
  }

  /**
   * Add registration welcome note
   */
  private async addRegistrationNote(
    leadId: number,
    userData: LeadData
  ): Promise<void> {
    const registrationDate = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const noteContent = `🎉 New User Registered\n\n• Date: ${registrationDate}\n• Email: ${
      userData.email
    }\n• Board: ${userData.board || "Not specified"}\n• Stream: ${
      userData.stream || "Not specified"
    }`;

    await this.leadRepository.addNote(leadId, noteContent);
  }
}

// Export singleton instance for easy import
const kylasCRM = KylasCRMFacade.getInstance();

export { KylasCRMFacade, kylasCRM };
export default kylasCRM;
