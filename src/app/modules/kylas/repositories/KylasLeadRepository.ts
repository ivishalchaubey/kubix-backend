/**
 * Kylas Lead Repository
 *
 * Lead CRUD operations with:
 * - Proper email-based search for exact matching
 * - In-memory cache with TTL to prevent duplicate API calls
 * - findOrCreateLead with deduplication
 */

import KylasClient from "../client/KylasClient.js";
import KylasConfig from "../config/KylasConfig.js";
import {
  KylasLead,
  KylasSearchResponse,
  CreateLeadPayload,
  KylasPhoneNumber,
  KylasEmail,
  KylasCustomFields,
} from "../types/KylasTypes.js";
import logger from "../../../utils/logger.js";

// Cache entry with TTL
interface CacheEntry {
  leadId: number;
  timestamp: number;
}

// Lead creation data
export interface LeadData {
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
  platform?: string | undefined;
}

class KylasLeadRepository {
  private static instance: KylasLeadRepository | null = null;
  private client: KylasClient;

  // In-memory cache: email -> { leadId, timestamp }
  private leadCache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour (increased from 5 minutes)

  // Pending operations to prevent race conditions
  private pendingCreations: Map<string, Promise<KylasLead | null>> = new Map();

  private constructor() {
    this.client = KylasClient.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): KylasLeadRepository {
    if (!KylasLeadRepository.instance) {
      KylasLeadRepository.instance = new KylasLeadRepository();
    }
    return KylasLeadRepository.instance;
  }

  /**
   * Search for lead by email with exact match
   * Uses emails field for precise matching
   */
  public async findByEmail(email: string): Promise<KylasLead | null> {
    if (!this.client.isEnabled()) return null;

    const normalizedEmail = email.toLowerCase().trim();

    // Check cache first
    const cached = this.getFromCache(normalizedEmail);
    if (cached) {
      return { id: cached.leadId } as KylasLead;
    }

    try {
      const response = await this.client.post<any>("/search/lead", {
        fields: ["id", "firstName", "lastName", "emails", "phoneNumbers"],
        jsonRule: {
          rules: [
            {
              id: "emails",
              field: "emails",
              type: "string",
              input: "text",
              operator: "contains",
              value: normalizedEmail,
            },
          ],
          condition: "AND",
          valid: true,
        },
        limit: 5,
      });

      // Handle multiple Kylas API response formats
      const records = response.records || response.content || [];
      const totalCount =
        response.totalCount ?? response.totalElements ?? records.length;

      if (totalCount > 0 && records.length > 0) {
        // Find exact email match from results
        const exactMatch = records.find((lead: any) =>
          lead.emails?.some(
            (e: any) => e.value?.toLowerCase() === normalizedEmail,
          ),
        );

        if (exactMatch) {
          this.addToCache(normalizedEmail, exactMatch.id);
          return exactMatch;
        }
      }

      return null;
    } catch (error) {
      // RE-THROW the error so caller can distinguish "not found" from "search failed"
      logger.error("Error searching Kylas lead by email:", error);
      throw error;
    }
  }

  /**
   * Find or create lead - atomic operation with deduplication
   * This is the ONLY method that should create leads
   */
  public async findOrCreate(data: LeadData): Promise<KylasLead | null> {
    if (!this.client.isEnabled()) return null;

    const normalizedEmail = data.email.toLowerCase().trim();

    // Check if there's already a pending creation for this email
    const pendingCreation = this.pendingCreations.get(normalizedEmail);
    if (pendingCreation) {
      return pendingCreation;
    }

    // Create the promise for this email
    const creationPromise = this.performFindOrCreate(normalizedEmail, data);
    this.pendingCreations.set(normalizedEmail, creationPromise);

    try {
      const result = await creationPromise;
      return result;
    } finally {
      // Clean up pending operation
      this.pendingCreations.delete(normalizedEmail);
    }
  }

  /**
   * Internal find or create implementation
   */
  private async performFindOrCreate(
    normalizedEmail: string,
    data: LeadData,
  ): Promise<KylasLead | null> {
    try {
      // Step 1: Check if lead already exists
      const existingLead = await this.findByEmail(normalizedEmail);
      if (existingLead) {
        return existingLead;
      }

      // Step 2: Create new lead (only if search SUCCEEDED and returned null)
      return await this.create(data);
    } catch (error) {
      // Search failed (timeout, network error, etc.) - do NOT create to avoid duplicates
      logger.warn(
        `Search failed for ${normalizedEmail}, NOT creating lead to avoid potential duplicates`,
      );
      return null;
    }
  }

  /**
   * Create a new lead in Kylas CRM
   */
  public async create(data: LeadData): Promise<KylasLead | null> {
    if (!this.client.isEnabled()) return null;

    try {
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
      if (data.platform) {
        customFieldValues[KylasConfig.CUSTOM_FIELDS.PLATFORM] = data.platform;
      }

      // Build lead payload
      const payload: CreateLeadPayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        emails: this.formatEmail(data.email),
        phoneNumbers: this.formatPhoneNumber(
          data.phoneNumber,
          data.countryCode,
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

      // Cache the new lead
      const normalizedEmail = data.email.toLowerCase().trim();
      this.addToCache(normalizedEmail, response.id);

      return response;
    } catch (error: any) {
      // Try with progressively minimal payloads on validation errors
      if (error.response?.status === 400) {
        return await this.createWithFallback(data);
      }

      logger.error("Error creating Kylas lead:", {
        message: error.message,
        details: error.response?.data,
      });
      return null;
    }
  }

  /**
   * Create lead with fallback payloads on validation errors
   */
  private async createWithFallback(data: LeadData): Promise<KylasLead | null> {
    // Try without custom fields first
    try {
      const minimalPayload: CreateLeadPayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        emails: this.formatEmail(data.email),
        phoneNumbers: this.formatPhoneNumber(
          data.phoneNumber,
          data.countryCode,
        ),
        city: data.city,
        state: data.state,
        country: KylasConfig.DEFAULT_COUNTRY_CODE,
        requirementName: "Student Counselling",
      };

      const response = await this.client.post<KylasLead>(
        "/leads/",
        minimalPayload,
      );
      this.addToCache(data.email.toLowerCase().trim(), response.id);
      return response;
    } catch (error: any) {
      // Last resort: Name + Email only
      if (error.response?.status === 400) {
        try {
          const absoluteMinimalPayload: CreateLeadPayload = {
            firstName: data.firstName,
            lastName: data.lastName,
            emails: this.formatEmail(data.email),
            requirementName: "Student Counselling",
          };

          const response = await this.client.post<KylasLead>(
            "/leads/",
            absoluteMinimalPayload,
          );
          this.addToCache(data.email.toLowerCase().trim(), response.id);
          return response;
        } catch (lastError: any) {
          logger.error(
            "Absolute minimal creation failed:",
            lastError.response?.data,
          );
        }
      }

      logger.error("Error creating minimal Kylas lead:", error.response?.data);
      return null;
    }
  }

  /**
   * Get lead by ID
   */
  public async findById(leadId: number): Promise<KylasLead | null> {
    if (!this.client.isEnabled()) return null;

    try {
      return await this.client.get<KylasLead>(`/leads/${leadId}`);
    } catch (error) {
      logger.error(`Error fetching Kylas lead ${leadId}:`, error);
      return null;
    }
  }

  /**
   * Update lead with patch operations
   */
  public async patch(leadId: number, patchOperations: any[]): Promise<void> {
    if (!this.client.isEnabled()) return;

    await this.client.patch(`/leads/${leadId}`, patchOperations);
  }

  /**
   * Add note to lead
   */
  public async addNote(leadId: number, note: string): Promise<void> {
    if (!this.client.isEnabled()) return;

    try {
      await this.client.post("/notes/relation", {
        targetEntityId: leadId,
        targetEntityType: "LEAD",
        sourceEntity: {
          description: note,
        },
      });
    } catch (error) {
      logger.error(`Error adding note to Kylas lead ${leadId}:`, error);
    }
  }

  // ============ Helper Methods ============

  /**
   * Format phone number for Kylas API
   */
  private formatPhoneNumber(
    phoneNumber?: string,
    countryCode?: string,
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
        value: email.toLowerCase().trim(),
        primary: true,
      },
    ];
  }

  /**
   * Get cached lead ID
   */
  private getFromCache(email: string): CacheEntry | null {
    const entry = this.leadCache.get(email);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.CACHE_TTL_MS) {
      this.leadCache.delete(email);
      return null;
    }

    return entry;
  }

  /**
   * Add lead ID to cache
   */
  private addToCache(email: string, leadId: number): void {
    this.leadCache.set(email, {
      leadId,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache (useful for testing)
   */
  public clearCache(): void {
    this.leadCache.clear();
  }
}

export default KylasLeadRepository;
