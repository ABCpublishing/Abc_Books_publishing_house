// ===== Authentication Routes =====
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const sql = req.sql;

        // Check if email already exists
        const existingUser = await sql`
            SELECT id FROM users WHERE email = ${email}
        `;

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Generate verification token
        const crypto = require('crypto');
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user - Set is_verified to TRUE by default to avoid onboarding blockers
        const result = await sql`
            INSERT INTO users (name, email, phone, password_hash, verification_token, is_verified)
            VALUES (${name}, ${email}, ${phone}, ${hashedPassword}, ${verificationToken}, TRUE)
            RETURNING id, name, email, phone, created_at
        `;

        const user = result[0];

        // Send verification email
        const { sendVerificationEmail } = require('../services/email');
        try {
            await sendVerificationEmail(email, name, verificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // We still registered the user, but inform them email failed or just log it
        }

        // Generate JWT token for auto-login
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful. Your account is ready to use.',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                createdAt: user.created_at,
                isVerified: true
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
        const sql = req.sql;

        if (!token) {
            return res.status(400).json({ error: 'Missing token' });
        }

        // Find user by token
        const result = await sql`
            UPDATE users 
            SET is_verified = TRUE, verification_token = NULL
            WHERE verification_token = ${token}
            RETURNING id, name, email
        `;

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
        const { email, password } = req.body;
        const sql = req.sql;

        // Find user by email
        const users = await sql`
            SELECT id, name, email, phone, password_hash, created_at, is_verified
            FROM users WHERE email = ${email}
        `;

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];

        // Check verification (Warning only for now to not block users)
        if (user.is_verified === false) {
            console.log(`⚠️ Unverified user logging in: ${email}`);
            // Optionally auto-verify on first successful login if we want to be very lenient
            /*
            await sql`UPDATE users SET is_verified = TRUE WHERE id = ${user.id}`;
            */
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
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

        const sql = req.sql;
        const users = await sql`
            SELECT id, name, email, phone, created_at
            FROM users WHERE id = ${decoded.userId}
        `;

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
        const sql = req.sql;

        const users = await sql`
            SELECT id, name FROM users WHERE email = ${email}
        `;

        if (users.length === 0) {
            return res.status(404).json({ error: 'No account found with this email' });
        }

        const user = users[0];

        // Generate reset token
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 hour

        await sql`
            UPDATE users 
            SET reset_password_token = ${resetToken}, 
                reset_password_expires = ${expiry}
            WHERE id = ${user.id}
        `;

        // Send reset email
        const { sendPasswordResetEmail } = require('../services/email');
        try {
            await sendPasswordResetEmail(email, user.name, resetToken);
        } catch (emailError) {
            console.error('Failed to send reset email:', emailError);
            // In dev, we might want to return the token for testing
            if (process.env.NODE_ENV !== 'production') {
                return res.json({
                    message: 'Reset email failed to send, but here is your token (dev only)',
                    token: resetToken
                });
            }
        }

        res.json({ message: 'Password reset link sent to your email.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        const sql = req.sql;

        if (!token || !password) {
            return res.status(400).json({ error: 'Missing token or password' });
        }

        // Find user by token and check expiry
        const users = await sql`
            SELECT id FROM users 
            WHERE reset_password_token = ${token} 
            AND reset_password_expires > NOW()
        `;

        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const user = users[0];

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user
        await sql`
            UPDATE users 
            SET password_hash = ${hashedPassword},
                reset_password_token = NULL,
                reset_password_expires = NULL,
                is_verified = TRUE
            WHERE id = ${user.id}
        `;

        res.json({ message: 'Password reset successful! You can now login with your new password.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

module.exports = router;
