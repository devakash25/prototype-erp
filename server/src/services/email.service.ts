import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// Email transporter
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!env.SMTP_HOST || !env.SMTP_USER) {
      logger.warn('Email not configured - skipping');
      return false;
    }

    const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;

    await transporter.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to: recipients,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    });

    logger.info({ to: recipients, subject: options.subject }, 'Email sent');
    return true;
  } catch (error) {
    logger.error({ error, to: options.to }, 'Email send failed');
    return false;
  }
}

// Email templates
export function welcomeEmail(name: string, role: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .btn { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to DEV ERP</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>Your account has been created as <strong>${role}</strong> in the DEV ERP system.</p>
          <p>You can now log in using your email and the password set by your administrator.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${env.APP_URL}/login" class="btn">Login to Dashboard</a>
          </p>
          <p>If you have any questions, please contact your administrator.</p>
        </div>
        <div class="footer">
          <p>DEV ERP - Digital Education & Management ERP</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function feeReminderEmail(name: string, amount: number, dueDate: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b, #f97316); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .amount { font-size: 32px; font-weight: bold; color: #f59e0b; text-align: center; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .btn { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Fee Payment Reminder</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>This is a reminder that your fee payment is pending.</p>
          <div class="amount">₹${amount.toLocaleString('en-IN')}</div>
          <p><strong>Due Date:</strong> ${dueDate}</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${env.APP_URL}/fees" class="btn">Pay Now</a>
          </p>
        </div>
        <div class="footer">
          <p>DEV ERP - Digital Education & Management ERP</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// SMS Service (stub - integrate with Twilio/MSG91/etc.)
export async function sendSMS(phone: string, message: string): Promise<boolean> {
  try {
    if (!env.SMS_API_KEY) {
      logger.warn('SMS not configured - skipping');
      return false;
    }

    // TODO: Integrate with SMS provider (Twilio, MSG91, etc.)
    logger.info({ phone, message }, 'SMS sent (stub)');
    return true;
  } catch (error) {
    logger.error({ error, phone }, 'SMS send failed');
    return false;
  }
}
