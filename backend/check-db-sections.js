const { neon } = require('@neondatabase/serverless');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkDb() {
    try {
        const sql = neon(process.env.DATABASE_URL);
        
        console.log('--- Books ---');
        const books = await sql('SELECT id, title FROM books LIMIT 10');
        console.log(books);

        console.log('\n--- Book Sections ---');
        const sections = await sql('SELECT * FROM book_sections LIMIT 10');
        console.log(sections);

        process.exit(0);
    } catch (e) {
        console.error('❌ Database connection error:', e.message);
        process.exit(1);
    }
}

checkDb();
