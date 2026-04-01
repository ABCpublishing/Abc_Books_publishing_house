const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
console.log('Testing connection to:', dbUrl.split('@')[1] || 'URL hidden');

const sql = neon(dbUrl);

async function test() {
    try {
        console.log('🏗️ Checking database schema...');
        const tables = await sql("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('📋 Tables found:', tables.map(t => t.table_name).join(', '));
        
        const booksTable = tables.find(t => t.table_name === 'books');
        if (booksTable) {
            const columns = await sql("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'books'");
            console.log('🏛️ Books Columns:', columns.map(c => `${c.column_name}(${c.data_type})`).join(', '));
        }

        const sectionsTable = tables.find(t => t.table_name === 'book_sections');
        if (sectionsTable) {
             const columns = await sql("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'book_sections'");
             console.log('🏛️ Book Sections Columns:', columns.map(c => `${c.column_name}(${c.data_type})`).join(', '));
        } else {
             console.warn('⚠️ book_sections table is MISSING!');
        }

    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        console.error('Full Error:', err);
    }
}

test();
