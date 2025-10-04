/**
 * Email Service Usage Examples
 * 
 * This file demonstrates how to use the email service throughout your application.
 * Copy and adapt these examples based on your specific needs.
 */

import emailService, { EmailParams } from './emailService';
import { emailTemplates } from './emailTemplates';

/**
 * Example 1: Send a simple text email
 */
export async function sendSimpleEmail() {
  const emailParams: EmailParams = {
    to: 'user@example.com',
    subject: 'Test Email',
    text: 'This is a simple test email.',
    html: '<p>This is a simple test email.</p>'
  };

  const success = await emailService.sendEmail(emailParams);
  if (success) {
    console.log('Email sent successfully!');
  } else {
    console.log('Failed to send email.');
  }
}

/**
 * Example 2: Send email to multiple recipients
 */
export async function sendBulkEmail() {
  const emailParams: EmailParams = {
    to: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
    subject: 'Bulk Email Notification',
    html: '<h1>Important Update</h1><p>This is a bulk email notification.</p>',
    cc: 'manager@example.com',
    bcc: 'admin@example.com'
  };

  const success = await emailService.sendEmail(emailParams);
  return success;
}

/**
 * Example 3: Send welcome email using template
 */
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const templateData = {
    appName: 'Kubix Backend',
    userName: userName,
    userEmail: userEmail,
    accountType: 'Premium User',
    registrationDate: new Date().toLocaleDateString(),
    verificationLink: 'https://yourapp.com/verify?token=abc123'
  };

  const success = await emailService.sendTemplateEmail(
    userEmail,
    emailTemplates.welcome,
    templateData
  );

  return success;
}

/**
 * Example 4: Send password reset email
 */
export async function sendPasswordResetEmail(userEmail: string, userName: string, resetToken: string) {
  const templateData = {
    appName: 'Kubix Backend',
    userName: userName,
    resetLink: `https://yourapp.com/reset-password?token=${resetToken}`,
    expirationTime: '24 hours'
  };

  const success = await emailService.sendTemplateEmail(
    userEmail,
    emailTemplates.passwordReset,
    templateData
  );

  return success;
}

/**
 * Example 5: Send notification email
 */
export async function sendNotificationEmail(
  userEmail: string, 
  userName: string, 
  notificationTitle: string, 
  notificationMessage: string,
  actionLink?: string,
  actionText?: string
) {
  const templateData = {
    appName: 'Kubix Backend',
    userName: userName,
    notificationTitle: notificationTitle,
    notificationMessage: notificationMessage,
    actionLink: actionLink || '',
    actionText: actionText || 'View Details'
  };

  const success = await emailService.sendTemplateEmail(
    userEmail,
    emailTemplates.notification,
    templateData
  );

  return success;
}

/**
 * Example 6: Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  userEmail: string,
  userName: string,
  transactionId: string,
  amount: string,
  paymentMethod: string
) {
  const templateData = {
    appName: 'Kubix Backend',
    userName: userName,
    transactionId: transactionId,
    amount: amount,
    paymentMethod: paymentMethod,
    paymentDate: new Date().toLocaleDateString(),
    status: 'Completed',
    dashboardLink: 'https://yourapp.com/dashboard'
  };

  const success = await emailService.sendTemplateEmail(
    userEmail,
    emailTemplates.paymentConfirmation,
    templateData
  );

  return success;
}

/**
 * Example 7: Send email with attachments
 */
export async function sendEmailWithAttachments() {
  const emailParams: EmailParams = {
    to: 'user@example.com',
    subject: 'Document Attached',
    html: '<p>Please find the attached document.</p>',
    attachments: [
      {
        filename: 'document.pdf',
        content: Buffer.from('PDF content here'), // In real usage, read from file
        contentType: 'application/pdf'
      },
      {
        filename: 'image.jpg',
        content: Buffer.from('Image content here'), // In real usage, read from file
        contentType: 'image/jpeg'
      }
    ]
  };

  const success = await emailService.sendEmail(emailParams);
  return success;
}

/**
 * Example 8: Check if email service is available before sending
 */
export async function sendEmailSafely(userEmail: string, subject: string, message: string) {
  if (!emailService.isAvailable()) {
    console.error('Email service is not available. Please check your email configuration.');
    return false;
  }

  const emailParams: EmailParams = {
    to: userEmail,
    subject: subject,
    html: `<p>${message}</p>`
  };

  return await emailService.sendEmail(emailParams);
}

/**
 * Example 9: Send custom HTML email with styling
 */
export async function sendStyledEmail(userEmail: string, userName: string) {
  const customHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Custom Styled Email</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>This is a custom styled email with your own HTML and CSS.</p>
          <a href="#" class="button">Click Here</a>
        </div>
      </div>
    </body>
    </html>
  `;

  const emailParams: EmailParams = {
    to: userEmail,
    subject: 'Custom Styled Email',
    html: customHtml
  };

  return await emailService.sendEmail(emailParams);
}

/**
 * Example 10: Error handling and logging
 */
export async function sendEmailWithErrorHandling(userEmail: string, subject: string, message: string) {
  try {
    if (!emailService.isAvailable()) {
      throw new Error('Email service is not configured or available');
    }

    const emailParams: EmailParams = {
      to: userEmail,
      subject: subject,
      html: `<p>${message}</p>`
    };

    const success = await emailService.sendEmail(emailParams);
    
    if (!success) {
      throw new Error('Failed to send email');
    }

    console.log(`Email sent successfully to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    // You might want to log this to a database or external service
    return false;
  }
}

// Export all example functions for easy importing
export const emailExamples = {
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
};

