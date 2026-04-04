// Migration script to add weight, dimensions to books table 
// and create addresses table
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function migrate() {
    const sql = neon(process.env.DATABASE_URL);
    console.log('🚀 Starting migration...');

    try {
        // 1. Add columns to books table
        console.log('📦 Updating books table...');
        try {
            await sql(`ALTER TABLE books ADD COLUMN IF NOT EXISTS weight VARCHAR(50)`);
            await sql(`ALTER TABLE books ADD COLUMN IF NOT EXISTS dimensions VARCHAR(100)`);
            console.log('✅ books table updated');
        } catch (e) {
            console.log('ℹ️ books table might already have weight/dimensions');
        }

        // 2. Add columns to users if missing from previous step (dob, gender)
        console.log('📦 Updating users table...');
        try {
            await sql(`ALTER TABLE users ADD COLUMN IF NOT EXISTS dob DATE`);
            await sql(`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20)`);
            console.log('✅ users table updated');
        } catch (e) {
            console.log('ℹ️ users table might already have dob/gender');
        }

        // 3. Create addresses table
        console.log('📦 Creating addresses table...');
        await sql(`
            CREATE TABLE IF NOT EXISTS addresses (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                type VARCHAR(20) DEFAULT 'Home',
                is_default BOOLEAN DEFAULT FALSE,
                first_name VARCHAR(50),
                last_name VARCHAR(50),
                phone VARCHAR(20),
                address_line1 TEXT NOT NULL,
                address_line2 TEXT,
                city VARCHAR(50) NOT NULL,
                state VARCHAR(50) NOT NULL,
                pincode VARCHAR(20) NOT NULL,
                country VARCHAR(50) DEFAULT 'India',
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ addresses table created');

        console.log('\n🎉 Migration complete!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

migrate();
