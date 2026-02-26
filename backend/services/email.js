// ===== Mailgun Email Service =====
const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY
});

const DOMAIN = process.env.MAILGUN_DOMAIN;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://abc-books.vercel.app';

/**
 * Send verification email to user
 * @param {string} email - User's email
 * @param {string} name - User's name
 * @param {string} token - Verification token
 */
async function sendVerificationEmail(email, name, token) {
    const verificationLink = `${FRONTEND_URL}/verify.html?token=${token}`;

    const data = {
        from: `ABC Books <noreply@${DOMAIN}>`,
        to: email,
        subject: 'Verify your ABC Books account',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #8B0000; margin: 0;">ABC BOOKS</h1>
                    <p style="color: #666; font-style: italic;">Rewrite Your Story With The Right Reads</p>
                </div>
                
                <h2 style="color: #333;">Welcome aboard, ${name}!</h2>
                <p style="color: #555; line-height: 1.6;">
                    Thank you for joining ABC Books. To complete your registration and start shopping for your favorite reads, please verify your email address by clicking the button below:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" 
                       style="background-color: #8B0000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Verify My Account
                    </a>
                </div>
                
                <p style="color: #888; font-size: 13px; line-height: 1.6;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="${verificationLink}" style="color: #8B0000;">${verificationLink}</a>
                </p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    &copy; 2025 ABC Books. All rights reserved.<br>
                    This is an automated email, please do not reply.
                </p>
            </div>
        `
    };

    try {
        console.log(`📧 Sending verification email to ${email}...`);
        const response = await mg.messages.create(DOMAIN, data);
        console.log('✅ Email sent successfully:', response);
        return response;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error;
    }
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(email, name, token) {
    const resetLink = `${FRONTEND_URL}/reset-password.html?token=${token}`;

    const data = {
        from: `ABC Books <noreply@${DOMAIN}>`,
        to: email,
        subject: 'Reset your ABC Books password',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #8B0000; margin: 0;">ABC BOOKS</h1>
                </div>
                
                <h2 style="color: #333;">Password Reset Request</h2>
                <p style="color: #555; line-height: 1.6;">
                    Hello ${name}, we received a request to reset your password. Click the button below to choose a new password:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" 
                       style="background-color: #8B0000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Reset My Password
                    </a>
                </div>
                
                <p style="color: #888; font-size: 13px; line-height: 1.6;">
                    This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
                </p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    &copy; 2025 ABC Books. All rights reserved.
                </p>
            </div>
        `
    };

    try {
        console.log(`📧 Sending password reset email to ${email}...`);
        const response = await mg.messages.create(DOMAIN, data);
        console.log('✅ Reset email sent successfully:', response);
        return response;
    } catch (error) {
        console.error('❌ Error sending reset email:', error);
        throw error;
    }
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
};
