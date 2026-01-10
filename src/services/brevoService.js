// Brevo Email Service for OTP Verification
// API Documentation: https://developers.brevo.com/
import toast from 'react-hot-toast';

const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || '';
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Store OTPs temporarily (in production, use backend/Redis)
const otpStore = new Map();

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP email via Brevo API
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient name
 * @returns {Promise<{success: boolean, message: string, otp?: string}>}
 */
export const sendOTPEmail = async (email, name = 'User') => {
    const otp = generateOTP();
    
    // Store OTP with expiration (10 minutes)
    otpStore.set(email, {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000,
        attempts: 0
    });

    const emailData = {
        sender: {
            name: 'Tickify',
            email: 'aroramadhav1312@gmail.com' // Replace with your verified Brevo sender email
        },
        to: [
            {
                email: email,
                name: name
            }
        ],
        subject: 'Your Tickify Verification Code',
        htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #111827;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="background-color: #1F2937; border: 4px solid #F9FAFB; padding: 40px; box-shadow: 8px 8px 0 #374151;">
                        <!-- Logo -->
                        <div style="text-align: center; margin-bottom: 32px;">
                            <div style="display: inline-block; width: 60px; height: 60px; background-color: #2563EB; border: 3px solid #F9FAFB; box-shadow: 4px 4px 0 #F9FAFB;">
                                <span style="font-size: 28px; line-height: 54px; color: #F9FAFB; font-weight: 900;">T</span>
                            </div>
                        </div>
                        
                        <h1 style="color: #F9FAFB; font-size: 28px; text-align: center; margin: 0 0 24px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 900;">
                            Verify Your Email
                        </h1>
                        
                        <p style="color: #D1D5DB; font-size: 16px; text-align: center; margin: 0 0 32px 0; line-height: 1.6;">
                            Hello <strong style="color: #F9FAFB;">${name}</strong>,<br>
                            Use the code below to complete your registration.
                        </p>
                        
                        <!-- OTP Box -->
                        <div style="background-color: #111827; border: 4px solid #2563EB; padding: 24px; text-align: center; margin-bottom: 32px; box-shadow: 6px 6px 0 #2563EB;">
                            <span style="font-family: 'Courier New', monospace; font-size: 48px; font-weight: 900; color: #2563EB; letter-spacing: 12px;">
                                ${otp}
                            </span>
                        </div>
                        
                        <p style="color: #9CA3AF; font-size: 14px; text-align: center; margin: 0 0 24px 0;">
                            This code expires in <strong style="color: #F59E0B;">10 minutes</strong>
                        </p>
                        
                        <div style="border-top: 2px dashed #374151; padding-top: 24px; text-align: center;">
                            <p style="color: #6B7280; font-size: 12px; margin: 0;">
                                If you didn't request this code, please ignore this email.
                            </p>
                        </div>
                    </div>
                    
                    <p style="color: #6B7280; font-size: 12px; text-align: center; margin-top: 24px;">
                        © 2025 Tickify. All rights reserved.
                    </p>
                </div>
            </body>
            </html>
        `
    };

    try {
        // In development without API key, simulate success
        if (!BREVO_API_KEY) {
            console.log('📧 DEV MODE - OTP for', email, ':', otp);
            return { success: true, message: 'OTP sent successfully (DEV MODE)', otp };
        }

        const response = await fetch(BREVO_API_URL, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });

        if (response.ok) {
            return { success: true, message: 'OTP sent successfully' };
        } else {
            const error = await response.json();
            return { success: false, message: error.message || 'Failed to send OTP' };
        }
    } catch (error) {
        toast.error('Error sending OTP');
        return { success: false, message: 'Network error. Please try again.' };
    }
};

/**
 * Verify OTP
 * @param {string} email - Email address
 * @param {string} inputOtp - OTP entered by user
 * @returns {{success: boolean, message: string}}
 */
export const verifyOTP = (email, inputOtp) => {
    const stored = otpStore.get(email);
    
    if (!stored) {
        return { success: false, message: 'OTP expired or not found. Please request a new one.' };
    }
    
    if (Date.now() > stored.expiresAt) {
        otpStore.delete(email);
        return { success: false, message: 'OTP has expired. Please request a new one.' };
    }
    
    if (stored.attempts >= 5) {
        otpStore.delete(email);
        return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }
    
    if (stored.otp === inputOtp) {
        otpStore.delete(email);
        return { success: true, message: 'Email verified successfully!' };
    }
    
    stored.attempts += 1;
    return { success: false, message: `Invalid OTP. ${5 - stored.attempts} attempts remaining.` };
};

/**
 * Send 'Registration Received' Email
 * @param {string} email
 * @param {string} name
 */
export const sendRegistrationReceivedEmail = async (email, name) => {
    const emailData = {
        sender: { name: 'Tickify', email: 'aroramadhav1312@gmail.com' },
        to: [{ email, name }],
        subject: 'Organizer Registration Received - Tickify',
        htmlContent: `
            <!DOCTYPE html>
            <html>
            <body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #111827;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="background-color: #1F2937; border: 4px solid #F9FAFB; padding: 40px; box-shadow: 8px 8px 0 #374151;">
                        <h1 style="color: #F9FAFB; text-align: center; text-transform: uppercase;">Registration Pending</h1>
                        <p style="color: #D1D5DB; text-align: center;">Hello ${name},</p>
                        <p style="color: #D1D5DB; text-align: center;">Thanks for registering as an Organizer. Your request is currently <strong>Pending Approval</strong>.</p>
                        <p style="color: #D1D5DB; text-align: center;">We will notify you once your account is active.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    return sendEmail(emailData);
};

/**
 * Send 'Organizer Approved' Email
 * @param {string} email
 * @param {string} name
 */
export const sendOrganizerApprovalEmail = async (email, name) => {
    const emailData = {
        sender: { name: 'Tickify', email: 'aroramadhav1312@gmail.com' },
        to: [{ email, name }],
        subject: 'Organizer Account Approved! - Tickify',
        htmlContent: `
             <!DOCTYPE html>
            <html>
            <body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #111827;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="background-color: #1F2937; border: 4px solid #10B981; padding: 40px; box-shadow: 8px 8px 0 #059669;">
                        <h1 style="color: #10B981; text-align: center; text-transform: uppercase;">Account Approved!</h1>
                        <p style="color: #D1D5DB; text-align: center;">Hello ${name},</p>
                        <p style="color: #D1D5DB; text-align: center;">Your Organizer account has been approved!</p>
                        <div style="background-color: #111827; border: 2px dashed #10B981; padding: 20px; margin: 20px 0; text-align: center;">
                            <p style="color: #F9FAFB; margin: 0;"><strong>Username:</strong> ${email}</p>
                            <p style="color: #F9FAFB; margin: 10px 0 0 0;"><strong>Password:</strong> (The password you set during registration)</p>
                        </div>
                         <p style="color: #D1D5DB; text-align: center;">
                            <a href="http://localhost:5173/organizer/login" style="color: #10B981; font-weight: bold;">Login to Dashboard</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    return sendEmail(emailData);
};

/**
 * Send 'Event Approved' Email
 * @param {string} email
 * @param {string} name
 * @param {string} eventTitle
 */
export const sendEventApprovalEmail = async (email, name, eventTitle) => {
    const emailData = {
        sender: { name: 'Tickify', email: 'aroramadhav1312@gmail.com' },
        to: [{ email, name }],
        subject: `Event Published: ${eventTitle} - Tickify`,
        htmlContent: `
             <!DOCTYPE html>
            <html>
            <body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #111827;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="background-color: #1F2937; border: 4px solid #10B981; padding: 40px; box-shadow: 8px 8px 0 #059669;">
                        <h1 style="color: #10B981; text-align: center; text-transform: uppercase;">Event Published!</h1>
                        <p style="color: #D1D5DB; text-align: center;">Hello ${name},</p>
                        <p style="color: #D1D5DB; text-align: center;">Congratulations! Your event <strong>"${eventTitle}"</strong> has been approved and is now live on Tickify.</p>
                         <p style="color: #D1D5DB; text-align: center;">
                            <a href="http://localhost:5173/events" style="color: #10B981; font-weight: bold;">View Live Events</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    return sendEmail(emailData);
};

/**
 * Send 'Event Rejected' Email
 * @param {string} email
 * @param {string} name
 * @param {string} eventTitle
 * @param {string} reason
 */
export const sendEventRejectionEmail = async (email, name, eventTitle, reason) => {
    const emailData = {
        sender: { name: 'Tickify', email: 'aroramadhav1312@gmail.com' },
        to: [{ email, name }],
        subject: `Update on your event submission: ${eventTitle}`,
        htmlContent: `
             <!DOCTYPE html>
            <html>
            <body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #111827;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="background-color: #1F2937; border: 4px solid #EF4444; padding: 40px; box-shadow: 8px 8px 0 #991B1B;">
                        <h1 style="color: #EF4444; text-align: center; text-transform: uppercase;">Action Required</h1>
                        <p style="color: #D1D5DB; text-align: center;">Hello ${name},</p>
                        <p style="color: #D1D5DB; text-align: center;">Your event submission <strong>"${eventTitle}"</strong> was not approved at this time.</p>
                        <div style="background-color: #111827; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0;">
                            <p style="color: #F87171; margin: 0; font-size: 14px;"><strong>Reason:</strong> ${reason}</p>
                        </div>
                         <p style="color: #D1D5DB; text-align: center;">You can edit your event and resubmit for approval from your dashboard.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    return sendEmail(emailData);
};

/**
 * Send 'Contact Form Confirmation' Email
 * @param {string} email - User's email
 * @param {string} name - User's name
 * @param {string} topic - The topic they selected
 */
export const sendContactConfirmationEmail = async (email, name, topic) => {
    const emailData = {
        sender: { name: 'Tickify Support', email: 'aroramadhav1312@gmail.com' },
        to: [{ email, name }],
        subject: 'We Received Your Message - Tickify Support',
        htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #111827;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="background-color: #1F2937; border: 4px solid #F9FAFB; padding: 40px; box-shadow: 8px 8px 0 #374151;">
                        <!-- Logo -->
                        <div style="text-align: center; margin-bottom: 32px;">
                            <div style="display: inline-block; width: 60px; height: 60px; background-color: #10B981; border: 3px solid #F9FAFB; box-shadow: 4px 4px 0 #F9FAFB;">
                                <span style="font-size: 28px; line-height: 54px; color: #F9FAFB; font-weight: 900;">✓</span>
                            </div>
                        </div>
                        
                        <h1 style="color: #10B981; font-size: 28px; text-align: center; margin: 0 0 24px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 900;">
                            Message Received!
                        </h1>
                        
                        <p style="color: #D1D5DB; font-size: 16px; text-align: center; margin: 0 0 24px 0; line-height: 1.6;">
                            Hello <strong style="color: #F9FAFB;">${name}</strong>,
                        </p>
                        
                        <p style="color: #D1D5DB; font-size: 16px; text-align: center; margin: 0 0 32px 0; line-height: 1.6;">
                            Thank you for reaching out to us! We have received your message regarding <strong style="color: #F59E0B;">"${topic}"</strong>.
                        </p>
                        
                        <!-- Response Time Box -->
                        <div style="background-color: #111827; border: 4px solid #2563EB; padding: 24px; text-align: center; margin-bottom: 32px; box-shadow: 6px 6px 0 #2563EB;">
                            <p style="color: #D1D5DB; font-size: 14px; margin: 0 0 8px 0;">Expected Response Time</p>
                            <span style="font-family: 'Arial', sans-serif; font-size: 32px; font-weight: 900; color: #2563EB;">
                                24-48 Hours
                            </span>
                        </div>
                        
                        <p style="color: #D1D5DB; font-size: 14px; text-align: center; margin: 0 0 24px 0; line-height: 1.6;">
                            Our support team is reviewing your request and will get back to you as soon as possible. In the meantime, you can check our <a href="http://localhost:5173/faq" style="color: #2563EB; text-decoration: none; font-weight: bold;">FAQ section</a> for quick answers.
                        </p>
                        
                        <div style="border-top: 2px dashed #374151; padding-top: 24px; margin-top: 24px;">
                            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0 0 8px 0;">
                                <strong>Need urgent help?</strong>
                            </p>
                            <p style="color: #6B7280; font-size: 12px; text-align: center; margin: 0;">
                                📧 support@tickify.com &nbsp;|&nbsp; 📱 +91 1800-XXX-XXXX
                            </p>
                        </div>
                    </div>
                    
                    <p style="color: #6B7280; font-size: 12px; text-align: center; margin-top: 24px;">
                        © 2025 Tickify. All rights reserved.<br>
                        This is an automated message. Please do not reply directly to this email.
                    </p>
                </div>
            </body>
            </html>
        `
    };
    return sendEmail(emailData);
};

// Helper to send email request
const sendEmail = async (data) => {
    try {
        if (!BREVO_API_KEY) {
            console.log('📧 DEV MODE - Email to', data.to[0].email, 'Subject:', data.subject);
            return { success: true };
        }
        const response = await fetch(BREVO_API_URL, {
            method: 'POST',
            headers: { 'accept': 'application/json', 'api-key': BREVO_API_KEY, 'content-type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.ok ? { success: true } : { success: false, message: 'Failed to send email' };
    } catch (e) {
        return { success: false, message: e.message };
    }
};

/**
 * Clear OTP for an email (for resend functionality)
 * @param {string} email - Email address
 */
export const clearOTP = (email) => {
    otpStore.delete(email);
};

/**
 * Send Job Application Email via Brevo
 * @param {Object} applicationData - Application details
 */
export const sendJobApplicationEmail = async (applicationData) => {
    const { name, email, phone, jobTitle, linkedIn, resumeUrl, coverLetter } = applicationData;
    
    const emailData = {
        sender: {
            name: 'Tickify Careers',
            email: 'aroramadhav1312@gmail.com'
        },
        to: [
            { email: 'aroramadhav1312@gmail.com', name: 'Tickify HR' }
        ],
        subject: `🎯 New Job Application: ${jobTitle} - ${name}`,
        htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border: 3px solid #000; padding: 0;">
                    <div style="background: #000; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">NEW JOB APPLICATION</h1>
                        <p style="margin: 5px 0 0; opacity: 0.8;">${jobTitle}</p>
                    </div>
                    
                    <div style="padding: 30px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #666; width: 120px;">Name</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold;">${name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Email</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #eee;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Phone</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #eee;"><a href="tel:${phone}" style="color: #2563eb;">${phone}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">LinkedIn</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                                    ${linkedIn ? `<a href="${linkedIn}" style="color: #2563eb;">${linkedIn}</a>` : '<span style="color: #999;">Not provided</span>'}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Resume</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                                    ${resumeUrl ? `<a href="${resumeUrl}" style="color: #2563eb; background: #000; color: white; padding: 5px 15px; text-decoration: none; display: inline-block;">View Resume</a>` : '<span style="color: #999;">Not provided</span>'}
                                </td>
                            </tr>
                        </table>
                        
                        ${coverLetter ? `
                        <div style="margin-top: 24px; padding: 20px; background: #f9f9f9; border-left: 4px solid #000;">
                            <p style="margin: 0 0 8px; font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase;">Cover Letter / Message</p>
                            <p style="margin: 0; line-height: 1.6;">${coverLetter.replace(/\n/g, '<br>')}</p>
                        </div>
                        ` : ''}
                        
                        <div style="margin-top: 24px; text-align: center;">
                            <a href="mailto:${email}?subject=Re: Your Application for ${jobTitle}" 
                               style="display: inline-block; background: #000; color: white; padding: 12px 30px; text-decoration: none; font-weight: bold; border: 2px solid #000;">
                                REPLY TO APPLICANT
                            </a>
                        </div>
                    </div>
                    
                    <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 11px; color: #666;">
                        Received via Tickify Careers Portal • ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    return sendEmail(emailData);
};

export default {
    sendOTPEmail,
    verifyOTP,
    generateOTP,
    clearOTP,
    sendEventApprovalEmail,
    sendEventRejectionEmail,
    sendOrganizerApprovalEmail,
    sendJobApplicationEmail
};
