/**
 * Email Service
 * Handles email sending functionality for authentication
 */

import nodemailer from 'nodemailer';
import { env } from '../config/environment';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize email service
   */
  private initialize(): void {
    try {
      // Check if email configuration is available
      if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
        logger.warn('Email service not configured - SMTP credentials missing');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 587,
        secure: env.SMTP_PORT === 465, // true for 465, false for other ports
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false, // For development
        },
      });

      this.isConfigured = true;
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service', { error });
    }
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      logger.warn('Email service not configured - skipping email send', { to: options.to });
      return false;
    }

    try {
      const mailOptions = {
        from: env.EMAIL_FROM || 'CounselFlow <noreply@counselflow.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Email sent successfully', {
        to: options.to,
        subject: options.subject,
        messageId: info.messageId,
      });

      return true;
    } catch (error) {
      logger.error('Failed to send email', {
        error,
        to: options.to,
        subject: options.subject,
      });
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${env.APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

    const html = this.generatePasswordResetHTML(resetUrl);
    const text = this.generatePasswordResetText(resetUrl);

    return this.sendEmail({
      to: email,
      subject: 'CounselFlow - Password Reset Request',
      html,
      text,
    });
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    const html = this.generateWelcomeHTML(firstName);
    const text = this.generateWelcomeText(firstName);

    return this.sendEmail({
      to: email,
      subject: 'Welcome to CounselFlow - Your Account is Ready',
      html,
      text,
    });
  }

  /**
   * Send email verification email
   */
  async sendEmailVerificationEmail(email: string, verificationToken: string): Promise<boolean> {
    const verificationUrl = `${env.APP_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;

    const html = this.generateEmailVerificationHTML(verificationUrl);
    const text = this.generateEmailVerificationText(verificationUrl);

    return this.sendEmail({
      to: email,
      subject: 'CounselFlow - Verify Your Email Address',
      html,
      text,
    });
  }

  /**
   * Generate password reset HTML email
   */
  private generatePasswordResetHTML(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #2563eb; font-size: 24px; font-weight: bold; }
            .content { background: #f9fafb; padding: 30px; border-radius: 8px; }
            .button { 
              display: inline-block; 
              background: #2563eb; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">CounselFlow</div>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>We received a request to reset your password for your CounselFlow account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
              <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            </div>
            <div class="footer">
              <p>© 2025 CounselFlow. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate password reset plain text email
   */
  private generatePasswordResetText(resetUrl: string): string {
    return `
CounselFlow - Password Reset Request

We received a request to reset your password for your CounselFlow account.

To reset your password, visit this link:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

© 2025 CounselFlow. All rights reserved.
This is an automated message, please do not reply to this email.
    `.trim();
  }

  /**
   * Generate welcome HTML email
   */
  private generateWelcomeHTML(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to CounselFlow</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #2563eb; font-size: 24px; font-weight: bold; }
            .content { background: #f9fafb; padding: 30px; border-radius: 8px; }
            .button { 
              display: inline-block; 
              background: #2563eb; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">CounselFlow</div>
            </div>
            <div class="content">
              <h2>Welcome to CounselFlow, ${firstName}!</h2>
              <p>Thank you for joining CounselFlow, the comprehensive legal practice management platform.</p>
              <p>Your account has been successfully created and you can now:</p>
              <ul>
                <li>Manage contracts and legal documents</li>
                <li>Track matters and client relationships</li>
                <li>Analyze legal risks with AI assistance</li>
                <li>Collaborate with your legal team</li>
              </ul>
              <a href="${env.APP_URL || 'http://localhost:3000'}/dashboard" class="button">Access Your Dashboard</a>
              <p>If you have any questions or need assistance, our support team is here to help.</p>
            </div>
            <div class="footer">
              <p>© 2025 CounselFlow. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate welcome plain text email
   */
  private generateWelcomeText(firstName: string): string {
    return `
CounselFlow - Welcome ${firstName}!

Thank you for joining CounselFlow, the comprehensive legal practice management platform.

Your account has been successfully created and you can now:
- Manage contracts and legal documents
- Track matters and client relationships
- Analyze legal risks with AI assistance
- Collaborate with your legal team

Access your dashboard at: ${env.APP_URL || 'http://localhost:3000'}/dashboard

If you have any questions or need assistance, our support team is here to help.

© 2025 CounselFlow. All rights reserved.
This is an automated message, please do not reply to this email.
    `.trim();
  }

  /**
   * Generate email verification HTML email
   */
  private generateEmailVerificationHTML(verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #2563eb; font-size: 24px; font-weight: bold; }
            .content { background: #f9fafb; padding: 30px; border-radius: 8px; }
            .button { 
              display: inline-block; 
              background: #2563eb; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">CounselFlow</div>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Thank you for creating your CounselFlow account!</p>
              <p>To complete your registration, please verify your email address by clicking the button below:</p>
              <a href="${verificationUrl}" class="button">Verify Email</a>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            </div>
            <div class="footer">
              <p>© 2025 CounselFlow. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate email verification plain text email
   */
  private generateEmailVerificationText(verificationUrl: string): string {
    return `
CounselFlow - Verify Your Email Address

Thank you for creating your CounselFlow account!

To complete your registration, please verify your email address by visiting:
${verificationUrl}

This link will expire in 24 hours.

© 2025 CounselFlow. All rights reserved.
This is an automated message, please do not reply to this email.
    `.trim();
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      logger.info('Email service connection test successful');
      return true;
    } catch (error) {
      logger.error('Email service connection test failed', { error });
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
