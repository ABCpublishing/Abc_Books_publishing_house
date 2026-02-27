
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const email = 'admin@abcbooks.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const existing = await sql`SELECT id FROM users WHERE email = ${email}`;

        if (existing.length > 0) {
            console.log('Admin user exists. Updating details...');
            await sql`UPDATE users SET password_hash = ${hashedPassword}, is_admin = TRUE, is_verified = TRUE WHERE email = ${email}`;
        } else {
            console.log('Creating admin user...');
            await sql`INSERT INTO users (name, email, password_hash, is_admin, is_verified) VALUES ('Admin', ${email}, ${hashedPassword}, TRUE, TRUE)`;
        }
        console.log('Done!');
    } catch (e) {
        console.error('Error:', e);
    }
}

createAdmin();
