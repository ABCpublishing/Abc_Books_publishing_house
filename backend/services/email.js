// ===== Email Service (Mailgun Integration) =====
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

const mg = (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) 
    ? mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY,
        // url: 'https://api.eu.mailgun.net' // Uncomment if using EU region
    }) 
    : null;

const DOMAIN = process.env.MAILGUN_DOMAIN;
const FROM_EMAIL = `ABC Books <support@${DOMAIN || 'abcbooks.store'}>`;

module.exports = {
    sendVerificationEmail: async (toEmail, verifyLink) => {
        if (!mg) {
            console.log('📧 Mailgun not configured. Verification link:', verifyLink);
            return false;
        }

        try {
            await mg.messages.create(DOMAIN, {
                from: FROM_EMAIL,
                to: [toEmail],
                subject: 'Verify Your Email - ABC Books',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #e42b26; text-align: center;">Welcome to ABC Books!</h2>
                        <p>Thank you for joining our community of book lovers. Please verify your email address to get the full experience.</p>
                        <p>Click the button below to verify your account:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verifyLink}" style="display:inline-block;padding:12px 25px;background:#e42b26;color:white;text-decoration:none;border-radius:5px;font-weight: bold;">Verify My Email</a>
                        </div>
                        <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="text-align: center; font-size: 12px; color: #999;">ABC Publishing House</p>
                    </div>
                `
            });
            console.log('📧 Verification email sent via Mailgun to:', toEmail);
            return true;
        } catch (error) {
            console.error('Error sending verification email via Mailgun:', error);
            return false;
        }
    },

    sendPasswordResetEmail: async (toEmail, resetLink) => {
        if (!mg) {
            console.log('📧 Mailgun not configured. Reset link:', resetLink);
            return false;
        }

        try {
            await mg.messages.create(DOMAIN, {
                from: FROM_EMAIL,
                to: [toEmail],
                subject: 'Reset Your Password - ABC Books',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #e42b26; text-align: center;">Password Reset Request</h2>
                        <p>We received a request to reset your password for your ABC Books account.</p>
                        <p>Click the button below to choose a new password. This link will expire in 1 hour.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" style="display:inline-block;padding:12px 25px;background:#e42b26;color:white;text-decoration:none;border-radius:5px;font-weight: bold;">Reset My Password</a>
                        </div>
                        <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="text-align: center; font-size: 12px; color: #999;">ABC Publishing House</p>
                    </div>
                `
            });
            console.log('📧 Password reset email sent via Mailgun to:', toEmail);
            return true;
        } catch (error) {
            console.error('Error sending email via Mailgun:', error);
            return false;
        }
    },

    sendOrderConfirmationEmail: async (order) => {
        if (!mg) {
            console.log('📧 Mailgun not configured. Order confirmation for:', order.order_id);
            return false;
        }

        try {
            const itemsHtml = (order.items || []).map(item => `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">
                        <div style="font-weight: bold;">${item.title || item.book_title}</div>
                        <div style="font-size: 12px; color: #666;">Qty: ${item.quantity}</div>
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                        ₹${(item.price * item.quantity).toLocaleString()}
                    </td>
                </tr>
            `).join('');

            await mg.messages.create(DOMAIN, {
                from: FROM_EMAIL,
                to: [order.shipping_email],
                subject: `Order Confirmed - #${order.order_id}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h1 style="color: #e42b26; margin: 0;">ABC Books</h1>
                            <p style="color: #666; margin-top: 5px;">Thank you for your order!</p>
                        </div>
                        
                        <div style="background: #fdfdfd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <p style="margin: 0; font-weight: bold;">Order ID: #${order.order_id}</p>
                            <p style="margin: 5px 0 0; color: #666;">Estimated Delivery: 3-5 Business Days</p>
                        </div>

                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr>
                                    <th style="padding: 10px; border-bottom: 2px solid #eee; text-align: left;">Item</th>
                                    <th style="padding: 10px; border-bottom: 2px solid #eee; text-align: right;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td style="padding: 10px; font-weight: bold;">Subtotal</td>
                                    <td style="padding: 10px; text-align: right;">₹${order.subtotal.toLocaleString()}</td>
                                </tr>
                                ${order.discount > 0 ? `
                                <tr>
                                    <td style="padding: 10px; color: #27ae60;">Discount</td>
                                    <td style="padding: 10px; text-align: right; color: #27ae60;">-₹${order.discount.toLocaleString()}</td>
                                </tr>` : ''}
                                <tr>
                                    <td style="padding: 15px 10px; font-weight: bold; border-top: 2px solid #eee; font-size: 18px;">Grand Total</td>
                                    <td style="padding: 15px 10px; text-align: right; font-weight: bold; border-top: 2px solid #eee; font-size: 18px; color: #e42b26;">₹${order.total.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                            <h3 style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase; color: #999;">Shipping Address</h3>
                            <p style="margin: 0; color: #333; line-height: 1.5;">
                                ${order.shipping_first_name} ${order.shipping_last_name}<br>
                                ${order.shipping_address1}${order.shipping_address2 ? ', ' + order.shipping_address2 : ''}<br>
                                ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}
                            </p>
                        </div>

                        <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
                            <p>For any queries, contact us at support@${DOMAIN || 'abcbooks.store'}</p>
                            <p>© 2026 ABC Publishing House. All rights reserved.</p>
                        </div>
                    </div>
                `
            });
            console.log('📧 Order confirmation email sent via Mailgun for:', order.order_id);
            return true;
        } catch (error) {
            console.error('Error sending order confirmation email via Mailgun:', error);
            return false;
        }
    },

    sendAdminOrderNotification: async (order) => {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!mg || !adminEmail) {
            console.log('📧 Admin notification skipped (no Mailgun or ADMIN_EMAIL). Order:', order.order_id);
            return false;
        }

        try {
            const itemsSummary = (order.items || []).map(item => 
                `${item.title || item.book_title} (x${item.quantity}) - ₹${item.price * item.quantity}`
            ).join('<br>');

            await mg.messages.create(DOMAIN, {
                from: FROM_EMAIL,
                to: [adminEmail],
                subject: `🚨 NEW ORDER RECEIVED - #${order.order_id}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 2px solid #e42b26; border-radius: 12px; border-left: 10px solid #e42b26;">
                        <h2 style="color: #e42b26; margin-top: 0;">New Order Alert! 🎉</h2>
                        <p style="font-size: 16px;"><strong>Order ID:</strong> #${order.order_id}</p>
                        <p style="font-size: 16px;"><strong>Customer:</strong> ${order.shipping_first_name} ${order.shipping_last_name} (${order.shipping_email})</p>
                        <p style="font-size: 16px;"><strong>Phone:</strong> ${order.shipping_phone || 'N/A'}</p>
                        <p style="font-size: 16px;"><strong>Total Amount:</strong> ₹${order.total.toLocaleString()}</p>
                        
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd;">
                            <h3 style="margin-top: 0; font-size: 15px; color: #333; text-transform: uppercase;">Items Ordered:</h3>
                            <div style="font-size: 14px; line-height: 1.6;">${itemsSummary}</div>
                        </div>

                        <div style="margin-top: 20px;">
                            <h3 style="margin-bottom: 5px; font-size: 14px; color: #666; text-transform: uppercase;">Shipping To:</h3>
                            <p style="margin: 0; line-height: 1.5; color: #333;">
                                ${order.shipping_address1}${order.shipping_address2 ? ', ' + order.shipping_address2 : ''}<br>
                                ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}
                            </p>
                        </div>

                        <div style="margin-top: 30px; text-align: center;">
                            <a href="https://abcbooks.store/admin/admin.html" style="display:inline-block;padding:12px 25px;background:#333;color:white;text-decoration:none;border-radius:6px;font-weight: bold;">View in Admin Panel</a>
                        </div>
                    </div>
                `
            });
            console.log('📧 Admin notification email sent via Mailgun for:', order.order_id);
            return true;
        } catch (error) {
            console.error('Error sending admin notification email:', error);
            return false;
        }
    },

    sendContactNotification: async (contact) => {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!mg || !adminEmail) {
            console.log('📧 Contact notification skipped (no Mailgun or ADMIN_EMAIL).');
            return false;
        }

        try {
            await mg.messages.create(DOMAIN, {
                from: FROM_EMAIL,
                to: [adminEmail],
                subject: `📬 NEW MESSAGE: ${contact.subject}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; padding: 25px; background: #fdfdfd; border: 1px solid #e2e8f0; border-radius: 12px; border-top: 6px solid #4a5568;">
                        <h2 style="color: #2d3748; margin-top: 0;">New Message from Bookstore</h2>
                        <hr style="border: none; border-top: 1px solid #edf2f7; margin-bottom: 20px;">
                        
                        <div style="margin-bottom: 20px;">
                            <p style="margin: 0; font-size: 13px; color: #718096; text-transform: uppercase;">From:</p>
                            <p style="margin: 5px 0 0 0; font-size: 16px; color: #1a202c; font-weight: 600;">${contact.name} (${contact.email})</p>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <p style="margin: 0; font-size: 13px; color: #718096; text-transform: uppercase;">Subject/Reason:</p>
                            <p style="margin: 5px 0 0 0; font-size: 16px; color: #1a202c;">${contact.subject}</p>
                        </div>

                        ${contact.phone ? `
                        <div style="margin-bottom: 20px;">
                            <p style="margin: 0; font-size: 13px; color: #718096; text-transform: uppercase;">Phone Number:</p>
                            <p style="margin: 5px 0 0 0; font-size: 16px; color: #1a202c;">${contact.phone}</p>
                        </div>` : ''}

                        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <p style="margin: 0; font-size: 13px; color: #718096; text-transform: uppercase; margin-bottom: 8px;">Message:</p>
                            <div style="font-size: 15px; color: #2d3748; line-height: 1.6; white-space: pre-wrap;">${contact.message}</div>
                        </div>

                        <div style="margin-top: 30px; border-top: 1px solid #edf2f7; padding-top: 20px; text-align: center; color: #a0aec0; font-size: 12px;">
                            <p>This message was sent via the Contact Form on abcbooks.store</p>
                            <p>© 2026 ABC Publishing House</p>
                        </div>
                    </div>
                `
            });
            console.log('📧 Contact notification email sent for:', contact.email);
            return true;
        } catch (error) {
            console.error('Error sending contact notification email:', error);
            return false;
        }
    }
};


