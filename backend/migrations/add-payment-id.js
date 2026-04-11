// Migration: Add payment_id column to orders table
// Run this once: node backend/migrations/add-payment-id.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { neon } = require('@neondatabase/serverless');

async function migrate() {
    console.log('🔄 Adding payment_id column to orders table...');

    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is not defined in .env');
        process.exit(1);
    }

    const sql = neon(process.env.DATABASE_URL);

    try {
        // Add payment_id column if it doesn't exist
        await sql(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS payment_id VARCHAR(100)
        `);
        console.log('✅ payment_id column added to orders table');

        // Create index for fast lookups by payment_id
        try {
            await sql('CREATE INDEX idx_orders_payment_id ON orders(payment_id)');
            console.log('✅ Index created on payment_id');
        } catch (e) {
            // Index may already exist
            console.log('ℹ️ Index already exists or could not be created:', e.message);
        }

        // Verify the column exists
        const columns = await sql(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name = 'payment_id'
        `);

        if (columns.length > 0) {
            console.log('✅ Verified: payment_id column exists -', columns[0].data_type);
        } else {
            console.error('❌ Column verification failed');
        }

        console.log('\n🎉 Migration complete!');
    } catch (error) {
        console.error('❌ Migration error:', error.message);
        process.exit(1);
    }
}

migrate();
