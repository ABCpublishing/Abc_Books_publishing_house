// Script to update order_items table to allow NULL book_id
// Run this once to fix foreign key constraint issues

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function updateDatabase() {
    console.log('🔄 Connecting to Neon database...');

    const sql = neon(process.env.DATABASE_URL);

    try {
        // Drop the foreign key constraint temporarily
        console.log('Updating order_items table...');

        // First, check if book_id is already nullable by trying to insert a test
        try {
            // Just run ALTER to make book_id nullable
            await sql`ALTER TABLE order_items ALTER COLUMN book_id DROP NOT NULL`;
            console.log('✅ book_id column is now nullable');
        } catch (err) {
            console.log('ℹ️ Column already nullable or constraint removed:', err.message);
        }

        // Add columns to store book info directly (optional, for when books aren't in DB)
        try {
            await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS book_title VARCHAR(255)`;
            console.log('✅ book_title column added');
        } catch (err) {
            console.log('ℹ️ book_title column:', err.message);
        }

        try {
            await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS book_author VARCHAR(100)`;
            console.log('✅ book_author column added');
        } catch (err) {
            console.log('ℹ️ book_author column:', err.message);
        }

        try {
            await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS book_image TEXT`;
            console.log('✅ book_image column added');
        } catch (err) {
            console.log('ℹ️ book_image column:', err.message);
        }

        // Check current tables
        console.log('\n📋 Current orders count:');
        const orderCount = await sql`SELECT COUNT(*) as count FROM orders`;
        console.log('   Orders:', orderCount[0].count);

        const itemCount = await sql`SELECT COUNT(*) as count FROM order_items`;
        console.log('   Order items:', itemCount[0].count);

        console.log('\n🎉 Database update complete!');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

updateDatabase();
