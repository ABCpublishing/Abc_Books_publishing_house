// ===== Update Users Table for Verification =====
require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateUsersTable() {
    console.log('🔄 Connecting to MySQL database...');
    const db = await mysql.createConnection(process.env.DATABASE_URL);

    try {
        console.log('📦 Updating users table...');

        // Add verification and reset columns
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN is_verified BOOLEAN DEFAULT TRUE,
            ADD COLUMN verification_token VARCHAR(255),
            ADD COLUMN reset_password_token VARCHAR(255),
            ADD COLUMN reset_password_expires TIMESTAMP NULL,
            ADD COLUMN is_admin BOOLEAN DEFAULT FALSE
        `);

        console.log('✅ verification columns added to users table');
        console.log('🎉 Update complete!');
    } catch (error) {
        console.error('❌ Error updating users table:', error);
        process.exit(1);
    } finally {
        if (db) await db.end();
    }
}

updateUsersTable();
