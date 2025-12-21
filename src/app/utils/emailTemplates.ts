import { EmailTemplate } from './emailService';

/**
 * Common email templates for the application
 */

// Welcome email template
export const welcomeEmailTemplate: EmailTemplate = {
  subject: 'Welcome to {{appName}}!',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to {{appName}}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to {{appName}}!</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #495057; margin-top: 0;">Hello {{userName}}!</h2>
        
        <p>Thank you for joining {{appName}}. We're excited to have you on board!</p>
        
        <p>Your account has been successfully created with the following details:</p>
        <ul style="background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #667eea;">
          <li><strong>Email:</strong> {{userEmail}}</li>
          <li><strong>Account Type:</strong> {{accountType}}</li>
          <li><strong>Registration Date:</strong> {{registrationDate}}</li>
        </ul>
        
        <p>To get started, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{verificationLink}}" 
             style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 3px; font-family: monospace;">
          {{verificationLink}}
        </p>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        
        <p>Best regards,<br>The {{appName}} Team</p>
      </div>
    </body>
    </html>
  `,
  text: `
    Welcome to {{appName}}!
    
    Hello {{userName}}!
    
    Thank you for joining {{appName}}. We're excited to have you on board!
    
    Your account has been successfully created with the following details:
    - Email: {{userEmail}}
    - Account Type: {{accountType}}
    - Registration Date: {{registrationDate}}
    
    To get started, please verify your email address by visiting this link:
    {{verificationLink}}
    
    If you have any questions or need assistance, please don't hesitate to contact our support team.
    
    Best regards,
    The {{appName}} Team
  `
};

// Password reset email template
export const passwordResetEmailTemplate: EmailTemplate = {
  subject: 'Reset Your {{appName}} Password',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #495057; margin-top: 0;">Hello {{userName}}!</h2>
        
        <p>We received a request to reset your password for your {{appName}} account.</p>
        
        <p>If you made this request, click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{resetLink}}" 
             style="background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 3px; font-family: monospace;">
          {{resetLink}}
        </p>
        
        <p><strong>Important:</strong> This link will expire in {{expirationTime}} for security reasons.</p>
        
        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
        
        <p>For security reasons, if you continue to receive these emails, please contact our support team immediately.</p>
        
        <p>Best regards,<br>The {{appName}} Team</p>
      </div>
    </body>
    </html>
  `,
  text: `
    Password Reset Request
    
    Hello {{userName}}!
    
    We received a request to reset your password for your {{appName}} account.
    
    If you made this request, visit this link to reset your password:
    {{resetLink}}
    
    Important: This link will expire in {{expirationTime}} for security reasons.
    
    If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
    
    For security reasons, if you continue to receive these emails, please contact our support team immediately.
    
    Best regards,
    The {{appName}} Team
  `
};

// Notification email template
export const notificationEmailTemplate: EmailTemplate = {
  subject: '{{notificationTitle}} - {{appName}}',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>{{notificationTitle}}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">{{notificationTitle}}</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #495057; margin-top: 0;">Hello {{userName}}!</h2>
        
        <div style="background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #4ecdc4;">
          {{notificationMessage}}
        </div>
        
        {{#if actionLink}}
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{actionLink}}" 
             style="background: #4ecdc4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            {{actionText}}
          </a>
        </div>
        {{/if}}
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        
        <p>Best regards,<br>The {{appName}} Team</p>
      </div>
    </body>
    </html>
  `,
  text: `
    {{notificationTitle}}
    
    Hello {{userName}}!
    
    {{notificationMessage}}
    
    {{#if actionLink}}
    {{actionText}}: {{actionLink}}
    {{/if}}
    
    If you have any questions or need assistance, please don't hesitate to contact our support team.
    
    Best regards,
    The {{appName}} Team
  `
};

// Payment confirmation email template
export const paymentConfirmationEmailTemplate: EmailTemplate = {
  subject: 'Payment Confirmation - {{appName}}',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Payment Confirmed!</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #495057; margin-top: 0;">Hello {{userName}}!</h2>
        
        <p>Thank you for your payment! Your transaction has been successfully processed.</p>
        
        <div style="background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #56ab2f;">
          <h3 style="margin-top: 0; color: #495057;">Transaction Details</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 5px 0; border-bottom: 1px solid #e9ecef;"><strong>Transaction ID:</strong> {{transactionId}}</li>
            <li style="padding: 5px 0; border-bottom: 1px solid #e9ecef;"><strong>Amount:</strong> {{amount}}</li>
            <li style="padding: 5px 0; border-bottom: 1px solid #e9ecef;"><strong>Payment Method:</strong> {{paymentMethod}}</li>
            <li style="padding: 5px 0; border-bottom: 1px solid #e9ecef;"><strong>Date:</strong> {{paymentDate}}</li>
            <li style="padding: 5px 0;"><strong>Status:</strong> <span style="color: #56ab2f; font-weight: bold;">{{status}}</span></li>
          </ul>
        </div>
        
        <p>You can view your receipt and transaction history in your account dashboard.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardLink}}" 
             style="background: #56ab2f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            View Dashboard
          </a>
        </div>
        
        <p>If you have any questions about this transaction, please contact our support team.</p>
        
        <p>Best regards,<br>The {{appName}} Team</p>
      </div>
    </body>
    </html>
  `,
  text: `
    Payment Confirmed!
    
    Hello {{userName}}!
    
    Thank you for your payment! Your transaction has been successfully processed.
    
    Transaction Details:
    - Transaction ID: {{transactionId}}
    - Amount: {{amount}}
    - Payment Method: {{paymentMethod}}
    - Date: {{paymentDate}}
    - Status: {{status}}
    
    You can view your receipt and transaction history in your account dashboard: {{dashboardLink}}
    
    If you have any questions about this transaction, please contact our support team.
    
    Best regards,
    The {{appName}} Team
  `
};

// OTP email template
export const otpEmailTemplate: EmailTemplate = {
  subject: 'Your OTP Code - {{appName}}',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTP Code</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Your OTP Code</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #495057; margin-top: 0;">Hello {{userName}}!</h2>
        
        <p>You requested a One-Time Password (OTP) for {{purpose}}. Use the code below to complete your action:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #667eea; display: inline-block;">
            <h1 style="color: #667eea; margin: 0; font-size: 36px; letter-spacing: 5px; font-family: monospace;">{{otp}}</h1>
          </div>
        </div>
        
        <p><strong>Important Security Information:</strong></p>
        <ul style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
          <li>This code will expire in <strong>{{expirationTime}}</strong></li>
          <li>Never share this code with anyone</li>
          <li>If you didn't request this code, please ignore this email</li>
        </ul>
        
        <p>If you have any questions or need assistance, please contact our support team.</p>
        
        <p>Best regards,<br>The {{appName}} Team</p>
      </div>
    </body>
    </html>
  `,
  text: `
    Your OTP Code - {{appName}}
    
    Hello {{userName}}!
    
    You requested a One-Time Password (OTP) for {{purpose}}. Use the code below to complete your action:
    
    OTP Code: {{otp}}
    
    Important Security Information:
    - This code will expire in {{expirationTime}}
    - Never share this code with anyone
    - If you didn't request this code, please ignore this email
    
    If you have any questions or need assistance, please contact our support team.
    
    Best regards,
    The {{appName}} Team
  `
};

// Export all templates
export const emailTemplates = {
  welcome: welcomeEmailTemplate,
  passwordReset: passwordResetEmailTemplate,
  notification: notificationEmailTemplate,
  paymentConfirmation: paymentConfirmationEmailTemplate,
  otp: otpEmailTemplate,
};

