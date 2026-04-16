const fs = require('fs');

const filePath = 'backend/routes/auth.js';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Requirements
if (!code.includes('zavu-otp')) {
    code = code.replace(
        /const\s+emailService\s*=\s*require\(.*email.*\);/,
        "const emailService = require('../services/email');\nconst { sendOTP, generateOTP } = require('../services/zavu-otp');"
    );
}

// 2. Register
const regStartMarker = "router.post('/register', async (req, res) => {";
const regEndMarker = "res.status(500).json({ error: 'Registration failed', message: error.message });\n    }\n});";
const regMatchIndex = code.indexOf(regStartMarker);
if (regMatchIndex !== -1) {
    const regEndIndex = code.indexOf(regEndMarker, regMatchIndex) + regEndMarker.length;
    const newRegister = `router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone = null } = req.body;
        const db = req.sql;
        const existingUser = await db('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.length > 0) return res.status(400).json({ error: 'Email already registered' });
        const verificationToken = generateOTP();
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db(
            'INSERT INTO users (name, email, phone, password_hash, verification_token, is_verified) VALUES ($1, $2, $3, $4, $5, FALSE) RETURNING id, name, email, phone, created_at',
            [name, email, phone, hashedPassword, verificationToken]
        );
        const user = result[0];
        try { await sendOTP(phone, verificationToken); } catch (e) { console.error('Failed to send OTP:', e); }
        res.status(201).json({
            message: 'Registration initiated. Please verify your phone with the OTP sent.',
            requiresOtp: true,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone, createdAt: user.created_at, isVerified: false, isAdmin: false }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed', message: error.message });
    }
});`;
    code = code.substring(0, regMatchIndex) + newRegister + code.substring(regEndIndex);
}

// 3. Login block (Requires Refresh code to find the new login block accurately)
// The login block has the unverified warning. Let's find "Check verification" and replace the block.
const loginBlockStart = code.indexOf("// Check verification");
const loginBlockEnd = code.indexOf("// Verify password", loginBlockStart);
if (loginBlockStart !== -1 && loginBlockEnd !== -1) {
    const newLoginBlock = `// Check verification - hard block for phone OTP verification
        if (user.is_verified === false) {
            return res.status(403).json({ 
                error: 'Account not verified. Please verify your phone number.', 
                requiresOtp: true, 
                phone: user.phone 
            });
        }

        `;
    code = code.substring(0, loginBlockStart) + newLoginBlock + code.substring(loginBlockEnd);
}

// 4. Forgot password
const forgotStartMarker = "router.post('/forgot-password', async (req, res) => {";
const forgotEndMarker = "res.status(500).json({ error: 'Failed to process request' });\n    }\n});";
const forgotMatchIndex = code.indexOf(forgotStartMarker);
if (forgotMatchIndex !== -1) {
    const forgotEndIndex = code.indexOf(forgotEndMarker, forgotMatchIndex) + forgotEndMarker.length;
    const newForgot = `router.post('/forgot-password', async (req, res) => {
    try {
        const { phone } = req.body;
        const db = req.sql;
        const users = await db('SELECT id, name FROM users WHERE phone = $1', [phone]);
        if (users.length === 0) return res.json({ message: 'If an account exists with this phone, an OTP has been sent.', otpSent: true });
        const user = users[0];
        const resetOtp = generateOTP();
        const expiry = new Date(Date.now() + 600000); // 10 mins
        await db('UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3', [resetOtp, expiry, user.id]);
        try { await sendOTP(phone, resetOtp); } catch (e) { console.error('OTP error:', e); }
        res.json({ message: 'OTP sent to your phone number.', otpSent: true });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});`;
    code = code.substring(0, forgotMatchIndex) + newForgot + code.substring(forgotEndIndex);
}

// 5. Reset Password
const resetStartMarker = "router.post('/reset-password', async (req, res) => {";
const resetEndMarker = "res.status(500).json({ error: 'Failed to reset password' });\n    }\n});";
const resetMatchIndex = code.indexOf(resetStartMarker);
if (resetMatchIndex !== -1) {
    const resetEndIndex = code.indexOf(resetEndMarker, resetMatchIndex) + resetEndMarker.length;
    const newReset = `router.post('/reset-password', async (req, res) => {
    try {
        const { phone, otp, newPassword } = req.body;
        const db = req.sql;
        if (!phone || !otp || !newPassword) return res.status(400).json({ error: 'Missing phone, OTP, or new password' });
        const users = await db('SELECT id FROM users WHERE phone = $1 AND reset_password_token = $2 AND reset_password_expires > NOW()', [phone, otp]);
        if (users.length === 0) return res.status(400).json({ error: 'Invalid or expired OTP.' });
        const user = users[0];
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db('UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL, is_verified = TRUE WHERE id = $2', [hashedPassword, user.id]);
        res.json({ message: 'Password reset successful! You can now login.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});`;
    code = code.substring(0, resetMatchIndex) + newReset + code.substring(resetEndIndex);
}

fs.writeFileSync(filePath, code);
console.log('Backend patched successfully');
