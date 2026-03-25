const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: 'c:/Users/Danish/OneDrive/Desktop/ABC Books/backend/.env' });

async function checkBooks() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.log('NO_DB_URL');
        return;
    }
    
    // Fix pooler URL if present (neon HTTP driver needs direct endpoint)
    let finalUrl = dbUrl;
    if (finalUrl.includes('-pooler.')) {
        finalUrl = finalUrl.replace('-pooler.', '.');
    }

    try {
        const sql = neon(finalUrl);
        const books = await sql('SELECT count(*) FROM books');
        console.log(`TOTAL_BOOKS: ${books[0].count}`);
        
        if (parseInt(books[0].count) > 0) {
            const sample = await sql('SELECT title, author FROM books LIMIT 5');
            console.log('SAMPLE_BOOKS:');
            console.table(sample);
        }
    } catch (err) {
        console.error('DATABASE_ERROR:', err.message);
    }
}

checkBooks();
