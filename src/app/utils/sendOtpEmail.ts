/**
 * Simple OTP Email Sender
 * 
 * This is a simplified function specifically for sending OTP emails.
 * Use this when you just need to send an OTP without complex templates.
 */

import emailService from './emailService';
import { emailTemplates } from './emailTemplates';

/**
 * Send OTP email with simple text format (like your current implementation)
 * @param email - Recipient email address
 * @param otp - The OTP code to send
 * @param purpose - Purpose of the OTP (e.g., "login", "verification")
 * @returns Promise<boolean> - Success status
 */
export async function sendSimpleOtpEmail(
  email: string, 
  otp: string, 
  purpose: string = 'login'
): Promise<boolean> {
  try {
    const success = await emailService.sendEmail({
      to: email,
      subject: `OTP for ${purpose.charAt(0).toUpperCase() + purpose.slice(1)}`,
      text: `Your OTP for ${purpose} is ${otp}`,
      html: `<p>Your OTP for ${purpose} is <strong>${otp}</strong></p>`
    });
    
    return success;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}

/**
 * Send OTP email with professional template
 * @param email - Recipient email address
 * @param otp - The OTP code to send
 * @param userName - User's name (optional)
 * @param purpose - Purpose of the OTP (e.g., "login", "verification")
 * @param expirationTime - When the OTP expires (e.g., "5 minutes")
 * @returns Promise<boolean> - Success status
 */
export async function sendProfessionalOtpEmail(
  email: string,
  otp: string,
  userName: string = 'User',
  purpose: string = 'login',
  expirationTime: string = '5 minutes'
): Promise<boolean> {
  try {
    const templateData = {
      appName: 'Kubix Backend',
      userName: userName,
      otp: otp,
      purpose: purpose,
      expirationTime: expirationTime
    };

    const success = await emailService.sendTemplateEmail(
      email,
      emailTemplates.otp,
      templateData
    );
    
    return success;
  } catch (error) {
    console.error('Error sending professional OTP email:', error);
    return false;
  }
}

/**
 * Send OTP email with error handling and logging
 * @param email - Recipient email address
 * @param otp - The OTP code to send
 * @param purpose - Purpose of the OTP
 * @param useTemplate - Whether to use the professional template (default: false)
 * @returns Promise<boolean> - Success status
 */
export async function sendOtpEmail(
  email: string,
  otp: string,
  purpose: string = 'login',
  useTemplate: boolean = false
): Promise<boolean> {
  // Check if email service is available
  if (!emailService.isAvailable()) {
    console.error('Email service is not available. Please check your email configuration.');
    return false;
  }

  try {
    let success: boolean;
    
    if (useTemplate) {
      success = await sendProfessionalOtpEmail(email, otp, 'User', purpose);
    } else {
      success = await sendSimpleOtpEmail(email, otp, purpose);
    }

    if (success) {
      console.log(`OTP email sent successfully to ${email}`);
    } else {
      console.error(`Failed to send OTP email to ${email}`);
    }

    return success;
  } catch (error) {
    console.error('Error in sendOtpEmail:', error);
    return false;
  }
}

// Export all functions
export default {
  sendSimpleOtpEmail,
  sendProfessionalOtpEmail,
  sendOtpEmail
};
