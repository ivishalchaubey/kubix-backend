/**
 * Kylas CRM Module
 *
 * Public exports for the Kylas CRM integration.
 *
 * Usage:
 * ```typescript
 * import { kylasCRM, ActivityType } from './modules/kylas';
 *
 * // Register lead on user registration
 * await kylasCRM.registerLead(userData);
 *
 * // Track activity (only updates existing leads)
 * await kylasCRM.trackActivity(email, ActivityType.COURSE_SHORTLISTED, "Course Name");
 * ```
 */

// Main facade (singleton)
export { KylasCRMFacade, kylasCRM, default } from "./KylasCRMFacade.js";

// Types - use 'export type' for interfaces
export { ActivityType } from "./types/KylasTypes.js";
export type {
  KylasLead,
  KylasEmail,
  KylasPhoneNumber,
  KylasCustomFields,
} from "./types/KylasTypes.js";

// Config (for customization)
export { default as KylasConfig } from "./config/KylasConfig.js";

// Lead data interface
export type { LeadData } from "./repositories/KylasLeadRepository.js";
