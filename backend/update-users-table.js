// ===== Update Users Table for Verification =====
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function updateUsersTable() {
    console.log('🔄 Connecting to Neon database...');
    const sql = neon(process.env.DATABASE_URL);

    try {
        console.log('📦 Updating users table...');

        // Add verification columns
        await sql`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255)
        `;

        console.log('✅ verification columns added to users table');
        console.log('🎉 Update complete!');
    } catch (error) {
        console.error('❌ Error updating users table:', error);
        process.exit(1);
    }
}

updateUsersTable();
