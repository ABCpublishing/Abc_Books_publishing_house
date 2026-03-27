
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function findBase64() {
    try {
        console.log('--- Searching for ALL Base64 Images ---');
        const books = await sql`
            SELECT id, title, left(image, 50) as img_start, length(image) as img_len
            FROM books 
            WHERE image LIKE 'data:%'
        `;
        
        console.log(`Found ${books.length} matches.`);
        books.forEach(b => {
             console.log(`[ID: ${b.id}] "${b.title}" - Length: ${b.img_len}`);
        });
        
    } catch (err) {
        console.error(err);
    }
}

findBase64();
