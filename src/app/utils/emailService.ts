import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { config } from '../config/env.js';
import logger from './logger.js';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email parameters interface
export interface EmailParams {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// Email template interface
export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initialize the SMTP transporter
   */
  private initializeTransporter(): void {
    try {
      // Check if email configuration is available
      if (!config.email.smtp.host || !config.email.smtp.auth.user || !config.email.smtp.auth.pass) {
        logger.warn('Email configuration is incomplete. Email service will not be available.');
        return;
      }

      const emailConfig: EmailConfig = {
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        secure: config.email.smtp.port === 465, // true for 465, false for other ports
        auth: {
          user: config.email.smtp.auth.user,
          pass: config.email.smtp.auth.pass,
        },
      };

      this.transporter = nodemailer.createTransport(emailConfig);
      this.isInitialized = true;
      
      // Verify connection configuration
      this.verifyConnection();
      
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Verify SMTP connection
   */
  private async verifyConnection(): Promise<void> {
    if (!this.transporter) return;

    try {
      await this.transporter.verify();
      logger.info('SMTP connection verified successfully');
    } catch (error) {
      logger.error('SMTP connection verification failed:', error);
    }
  }

  /**
   * Send email using SMTP
   * @param params - Email parameters
   * @returns Promise<boolean> - Success status
   */
  async sendEmail(params: EmailParams): Promise<boolean> {
    if (!this.isInitialized || !this.transporter) {
      logger.error('Email service is not initialized. Please check your email configuration.');
      return false;
    }

    try {
      const mailOptions: SendMailOptions = {
        from: config.email.from || config.email.smtp.auth.user,
        to: Array.isArray(params.to) ? params.to.join(', ') : params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
        cc: params.cc ? (Array.isArray(params.cc) ? params.cc.join(', ') : params.cc) : undefined,
        bcc: params.bcc ? (Array.isArray(params.bcc) ? params.bcc.join(', ') : params.bcc) : undefined,
        attachments: params.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${params.to}. Message ID: ${result.messageId}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send email with template
   * @param to - Recipient email(s)
   * @param template - Email template
   * @param data - Template data for variable substitution
   * @returns Promise<boolean> - Success status
   */
  async sendTemplateEmail(
    to: string | string[],
    template: EmailTemplate,
    data?: Record<string, any>
  ): Promise<boolean> {
    let processedHtml = template.html;
    let processedText = template.text;
    let processedSubject = template.subject;

    // Replace template variables if data is provided
    if (data) {
      Object.keys(data).forEach(key => {
        const placeholder = `{{${key}}}`;
        const value = String(data[key]);
        processedHtml = processedHtml.replace(new RegExp(placeholder, 'g'), value);
        processedText = processedText?.replace(new RegExp(placeholder, 'g'), value);
        processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), value);
      });
    }

    return this.sendEmail({
      to,
      subject: processedSubject,
      html: processedHtml,
      text: processedText || '',
    });
  }

  /**
   * Check if email service is available
   * @returns boolean - Service availability
   */
  isAvailable(): boolean {
    return this.isInitialized && this.transporter !== null;
  }
}

// Create singleton instance
const emailService = new EmailService();

// Export the service instance and types
export default emailService;
export { EmailService };

