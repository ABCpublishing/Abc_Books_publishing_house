
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function checkRecentBooks() {
    try {
        console.log('--- Last 20 Books ---');
        const books = await sql`
            SELECT id, title, image, created_at 
            FROM books 
            ORDER BY id DESC 
            LIMIT 20
        `;
        console.log(JSON.stringify(books, null, 2));
    } catch (err) {
        console.error(err);
    }
}

checkRecentBooks();
