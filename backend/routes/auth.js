// ===== Authentication Routes =====
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const emailService = require('../services/email');
const { sendOTP, generateOTP } = require('../services/zavu-otp');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register new user (OTP based)
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

        // Generate verification OTP (numeric)
        const verificationToken = generateOTP();

        // Hash password with a secure salt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user - is_verified starts as FALSE
        const result = await db(
            'INSERT INTO users (name, email, phone, password_hash, verification_token, is_verified) VALUES ($1, $2, $3, $4, $5, FALSE) RETURNING id, name, email, phone, created_at',
            [name, email, phone, hashedPassword, verificationToken]
        );
        
        const user = result[0];

        // Send OTP via Zavu
        if (phone) {
            try {
                await sendOTP(phone, verificationToken);
            } catch (e) {
                console.error('Failed to send OTP:', e);
            }
        }

        res.status(201).json({
            message: 'Registration initiated. Please verify your phone with the OTP sent.',
            requiresOtp: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                createdAt: user.created_at,
                isVerified: false,
                isAdmin: false
            }
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

// Verify Phone OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const db = req.sql;

        const users = await db('SELECT id, is_verified FROM users WHERE phone = $1 AND verification_token = $2', [phone, otp]);
        
        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid OTP or phone number' });
        }

        const user = users[0];
        if (user.is_verified) {
            return res.json({ message: 'Already verified' });
        }

        await db('UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = $1', [user.id]);
        
        const freshUser = await db('SELECT id, name, email, phone, created_at, is_admin FROM users WHERE id = $1', [user.id]);
        
        const token = jwt.sign(
            { userId: freshUser[0].id, email: freshUser[0].email, isAdmin: !!freshUser[0].is_admin },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ message: 'Phone verified successfully!', user: freshUser[0], token, accessToken: token });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { phone } = req.body;
        const db = req.sql;

        const users = await db('SELECT id, is_verified FROM users WHERE phone = $1', [phone]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'No account found with this phone number' });
        }

        const otp = generateOTP();
        await db('UPDATE users SET verification_token = $1 WHERE id = $2', [otp, users[0].id]);
        
        await sendOTP(phone, otp);
        res.json({ message: 'New OTP sent' });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ error: 'Failed to resend OTP' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { phone, password, email } = req.body;
        const db = req.sql;

        const identifier = phone || email;

        // Find user by phone or email
        const users = await db(
            'SELECT id, name, email, phone, password_hash, created_at, is_verified, is_admin FROM users WHERE phone = $1 OR email = $2',
            [identifier, identifier]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid phone number or password' });
        }

        const user = users[0];

        // Check verification - hard block for phone OTP verification
        if (user.is_verified === false) {
            return res.status(403).json({ 
                error: 'Account not verified. Please verify your phone number.', 
                requiresOtp: true, 
                phone: user.phone 
            });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid phone number or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, isAdmin: !!user.is_admin },
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
                createdAt: user.created_at,
                isAdmin: !!user.is_admin
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

// Forgot Password (OTP)
router.post('/forgot-password', async (req, res) => {
    try {
        const { phone } = req.body;
        const db = req.sql;

        const users = await db('SELECT id FROM users WHERE phone = $1', [phone]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'No account with this phone number exists' });
        }

        const otp = generateOTP();
        const expiry = new Date(Date.now() + 600000); // 10 mins
        await db('UPDATE users SET verification_token = $1, reset_password_expires = $2 WHERE id = $3', [otp, expiry, users[0].id]);
        
        await sendOTP(phone, otp);
        res.json({ message: 'Password reset OTP sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// Reset Password with OTP
router.post('/reset-password', async (req, res) => {
    try {
        const { phone, otp, newPassword } = req.body;
        const db = req.sql;

        const users = await db('SELECT id FROM users WHERE phone = $1 AND verification_token = $2 AND reset_password_expires > NOW()', [phone, otp]);
        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db('UPDATE users SET password_hash = $1, verification_token = NULL, reset_password_expires = NULL WHERE id = $2', [hashedPassword, users[0].id]);

        res.json({ message: 'Password reset successfully' });
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
        let users = await db('SELECT id, name, email, phone, created_at, is_verified, is_admin FROM users WHERE email = $1', [email]);
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
            { userId: user.id, email: user.email, isAdmin: !!user.is_admin },
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
                picture: picture,
                isAdmin: !!user.is_admin
            },
            token,
            accessToken: token
        });
    } catch (error) {
        console.error('Google Auth error:', error);
        res.status(401).json({ error: 'Invalid Google token or account issue' });
    }
});

// Change password (authenticated)
router.put('/change-password', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const { currentPassword, newPassword } = req.body;
        const db = req.sql;

        const users = await db('SELECT password_hash FROM users WHERE id = $1', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await db('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hashedNewPassword, userId]);

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

module.exports = router;

