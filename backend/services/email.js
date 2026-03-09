// ===== Email Service (Resend Integration) =====
const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// The "from" email address for Resend. It typically requires a domain you verify in Resend, or checking if onboarding@resend.dev is allowed.
// Let's use a generic verified domain if available, or the Resend test sender.
const FROM_EMAIL = 'support@abcbooks.store'; // User must verify this domain in Resend.

module.exports = {
    sendVerificationEmail: async () => {
        console.log('📧 Email service: user auto-verified on registration.');
    },
    sendPasswordResetEmail: async (toEmail, resetLink) => {
        if (!resend) {
            console.log('📧 Resend not configured. Reset link:', resetLink);
            return false;
        }

        try {
            const data = await resend.emails.send({
                from: `ABC Books <${FROM_EMAIL}>`, // Note: Domain must be verified in Resend for this from address
                to: [toEmail],
                subject: 'Reset Your Password - ABC Books',
                html: `
                    <h2>Password Reset Request</h2>
                    <p>We received a request to reset your password for ABC Books.</p>
                    <p>Click the link below to reset it. This link expires in 1 hour.</p>
                    <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#e42b26;color:white;text-decoration:none;border-radius:5px;">Reset Password</a>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                `
            });
            console.log('📧 Password reset email sent. Message ID:', data.id);
            return true;
        } catch (error) {
            console.error('Error sending email via Resend:', error);
            return false;
        }
    }
};
