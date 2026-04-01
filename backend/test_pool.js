
const { Pool } = require('@neondatabase/serverless');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function test() {
    try {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const res = await pool.query('SELECT b.title FROM books b JOIN book_sections bs ON b.id = bs.book_id WHERE bs.section_name = $1', ['fiction']);
        console.log('Fiction books in DB:', res.rows);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

test();
