const { Client } = require('pg');
require('dotenv').config({ path: 'c:/Users/Danish/OneDrive/Desktop/ABC Books/backend/.env' });

async function checkBooks() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query('SELECT COUNT(*) FROM books');
        console.log(`TOTAL_BOOKS: ${res.rows[0].count}`);
        
        if (parseInt(res.rows[0].count) > 0) {
            const sample = await client.query('SELECT title, author FROM books LIMIT 5');
            console.log('SAMPLE_BOOKS:');
            console.table(sample.rows);
        }
    } catch (err) {
        console.error('DATABASE_ERROR:', err.message);
    } finally {
        await client.end();
    }
}

checkBooks();
