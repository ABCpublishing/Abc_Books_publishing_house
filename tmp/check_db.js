
const { neon } = require('@neondatabase/serverless');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const sql = neon(process.env.DATABASE_URL);

async function check() {
    try {
        console.log('--- Database Check ---');
        console.log('URL:', process.env.DATABASE_URL.substring(0, 20) + '...');
        
        const books = await sql('SELECT COUNT(*) as count FROM books');
        console.log('Total Books:', books[0].count);
        
        const sections = await sql('SELECT section_name, COUNT(*) as count FROM book_sections GROUP BY section_name');
        console.log('Sections:', JSON.stringify(sections, null, 2));
        
        if (books[0].count > 0) {
            const firstN = await sql('SELECT id, title FROM books LIMIT 5');
            console.log('Sample Books:', JSON.stringify(firstN, null, 2));
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

check();
