/**
 * Email Service Module
 * 
 * This module provides a complete email service solution with:
 * - SMTP configuration
 * - Pre-built email templates
 * - Usage examples
 * - TypeScript support
 */

// Export the main email service
export { default as emailService, EmailService } from '../emailService';
export type { EmailParams, EmailTemplate } from '../emailService';

// Export email templates
export { emailTemplates } from '../emailTemplates';
export type { EmailTemplate as EmailTemplateType } from '../emailService';

// Export usage examples
export { emailExamples } from '../emailUsageExamples';

// Re-export all example functions for convenience
export {
  sendSimpleEmail,
  sendBulkEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendNotificationEmail,
  sendPaymentConfirmationEmail,
  sendEmailWithAttachments,
  sendEmailSafely,
  sendStyledEmail,
  sendEmailWithErrorHandling
} from '../emailUsageExamples';

