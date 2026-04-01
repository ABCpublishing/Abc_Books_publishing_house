const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function createAdmin() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const email = 'admin@abcbooks.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(`Checking if admin user exists: ${email}`);
        const existing = await sql('SELECT id FROM users WHERE email = $1', [email]);

        if (existing.length > 0) {
            console.log('Admin user exists. Updating details...');
            await sql('UPDATE users SET password_hash = $1, is_admin = TRUE, is_verified = TRUE WHERE email = $2', [hashedPassword, email]);
        } else {
            console.log('Creating admin user...');
            await sql('INSERT INTO users (name, email, password_hash, is_admin, is_verified) VALUES ($1, $2, $3, TRUE, TRUE)', ['Admin', email, hashedPassword]);
        }
        console.log('✅ Admin creation/update complete!');
    } catch (e) {
        console.error('❌ Error during admin creation:', e.message);
    }
}

createAdmin();
