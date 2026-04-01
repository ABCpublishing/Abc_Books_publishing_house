
const { neon } = require('@neondatabase/serverless');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
    try {
        console.log('--- Migration: Adding weight and dimensions columns to books table ---');
        
        // Check if columns exist first (optional, but safer)
        const checkColumns = await sql(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'books' 
            AND (column_name = 'weight' OR column_name = 'dimensions')
        `);
        
        const existingColumns = checkColumns.map(c => c.column_name);
        
        if (!existingColumns.includes('weight')) {
            console.log('Adding weight column...');
            await sql('ALTER TABLE books ADD COLUMN weight VARCHAR(50)');
        } else {
            console.log('weight column already exists.');
        }
        
        if (!existingColumns.includes('dimensions')) {
            console.log('Adding dimensions column...');
            await sql('ALTER TABLE books ADD COLUMN dimensions VARCHAR(100)');
        } else {
            console.log('dimensions column already exists.');
        }
        
        console.log('Migration successful!');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

runMigration();
