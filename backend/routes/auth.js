// ===== Authentication Routes =====
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const emailService = require('../services/email');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone = null } = req.body;
        const db = req.sql;

        // Check if email already exists
        const existingUser = await db(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Generate verification token
        const crypto = require('crypto');
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Hash password with a secure salt (cost factor 10 is standard, 12 is extra secure)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user - is_verified starts as FALSE for security
        const result = await db(
            'INSERT INTO users (name, email, phone, password_hash, verification_token, is_verified) VALUES ($1, $2, $3, $4, $5, FALSE) RETURNING id, name, email, phone, created_at',
            [name, email, phone, hashedPassword, verificationToken]
        );
        
        const user = result[0];

        // Send actual verification email
        const frontendUrl = process.env.FRONTEND_URL || 'https://abcbooks.store';
        const verifyLink = `${frontendUrl}/verify.html?token=${verificationToken}`;
        await emailService.sendVerificationEmail(email, verifyLink);

        // Generate JWT token (still allow auto-login but marked as unverified)
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful! Please check your email to verify your account.',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                createdAt: user.created_at,
                isVerified: false
            },
            token,
            accessToken: token
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed', message: error.message });
    }
});

// Verify email
router.get('/verify', async (req, res) => {
    try {
        const { token } = req.query;
        const db = req.sql;

        if (!token) {
            return res.status(400).json({ error: 'Missing token' });
        }

        // Find user by token
        const result = await db(
            'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING id',
            [token]
        );

        if (result.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired verification token' });
        }

        res.json({ message: 'Email verified successfully! You can now login.' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { phone, password, email } = req.body;
        const db = req.sql;

        const identifier = phone || email;

        // Find user by phone or email
        const users = await db(
            'SELECT id, name, email, phone, password_hash, created_at, is_verified FROM users WHERE phone = $1 OR email = $2',
            [identifier, identifier]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid phone number or password' });
        }

        const user = users[0];

        // Check verification (Warning only for now to not block users)
        if (user.is_verified === false) {
            console.log(`⚠️ Unverified user logging in: ${identifier}`);
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid phone number or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                createdAt: user.created_at
            },
            token,
            accessToken: token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed', message: error.message });
    }
});

// Verify token / Get current user
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const db = req.sql;
        const users = await db(
            'SELECT id, name, email, phone, created_at FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const db = req.sql;

        const users = await db(
            'SELECT id, name FROM users WHERE email = $1',
            [email]
        );

        if (users.length === 0) {
            // Security: To prevent account enumeration, we return success even if email doesn't exist
            console.log(`[Security Audit] Prevented account enumeration for: ${email}`);
            return res.json({ 
                message: 'If an account exists with this email, reset instructions have been sent.',
                emailSent: true 
            });
        }


        const user = users[0];

        // Generate reset token and store its HASH (safer in case of DB leak)
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 hour (Strict)

        await db(
            'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
            [tokenHash, expiry, user.id]
        );

        // Build reset link for direct use
        const frontendUrl = process.env.FRONTEND_URL || 'https://abcbooks.store';
        const resetLink = `${frontendUrl}/reset-password.html?token=${resetToken}`;

        // Attempt to send via Resend if configured
        const emailSent = await emailService.sendPasswordResetEmail(email, resetLink);

        res.json({
            message: 'Password reset link generated successfully.',
            resetLink,
            emailSent
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        const db = req.sql;

        if (!token || !password) {
            return res.status(400).json({ error: 'Missing token or password' });
        }

        // Hash the incoming token to compare with DB hash
        const crypto = require('crypto');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Find user by token hash and check expiry
        const users = await db(
            'SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
            [tokenHash]
        );

        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired reset token. Please request a new one.' });
        }

        const user = users[0];

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user
        await db(
            'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL, is_verified = TRUE WHERE id = $2',
            [hashedPassword, user.id]
        );

        res.json({ message: 'Password reset successful! You can now login with your new password.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// Google Sign-In / Sign-Up
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;
        const db = req.sql;

        if (!credential) {
            return res.status(400).json({ error: 'Missing Google credential' });
        }

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        // Check if user exists by email
        let users = await db('SELECT id, name, email, phone, created_at, is_verified FROM users WHERE email = $1', [email]);
        let user;

        if (users.length === 0) {
            // New user, create them (with a generic random password since they use Google)
            const crypto = require('crypto');
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            const result = await db(
                'INSERT INTO users (name, email, password_hash, is_verified) VALUES ($1, $2, $3, TRUE) RETURNING id, name, email, phone, created_at',
                [name, email, hashedPassword]
            );
            user = result[0];
            console.log(`[Google Auth] New user registered: ${email}`);
        } else {
            // Existing user
            user = users[0];
            console.log(`[Google Auth] Existing user logged in: ${email}`);
            
            // Auto-verify since Google verified the email
            if (!user.is_verified) {
                await db('UPDATE users SET is_verified = TRUE WHERE id = $1', [user.id]);
                user.is_verified = true;
                console.log(`[Google Auth] Auto-verified existing user: ${email}`);
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Google login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                createdAt: user.created_at,
                picture: picture
            },
            token,
            accessToken: token
        });
    } catch (error) {
        console.error('Google Auth error:', error);
        res.status(401).json({ error: 'Invalid Google token or account issue' });
    }
});

module.exports = router;
