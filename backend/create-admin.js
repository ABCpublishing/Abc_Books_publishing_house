
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    const db = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        const email = 'admin@abcbooks.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            console.log('Admin user exists. Updating details...');
            await db.query('UPDATE users SET password_hash = ?, is_admin = TRUE, is_verified = TRUE WHERE email = ?', [hashedPassword, email]);
        } else {
            console.log('Creating admin user...');
            await db.query('INSERT INTO users (name, email, password_hash, is_admin, is_verified) VALUES (?, ?, ?, TRUE, TRUE)', ['Admin', email, hashedPassword]);
        }
        console.log('Done!');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        if (db) await db.end();
    }
}

createAdmin();
