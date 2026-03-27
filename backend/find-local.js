
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function findLocalResources() {
    try {
        console.log('--- Checking for Local Image Links ---');
        const books = await sql`
            SELECT id, title, image, category 
            FROM books 
            WHERE image LIKE '%featured_book%' 
               OR image LIKE 'images/%' 
               OR image LIKE '/images/%'
        `;
        
        console.log(`Found ${books.length} matches.`);
        books.forEach(b => {
             console.log(`[ID: ${b.id}] "${b.title}" - Image: ${b.image}`);
        });
        
    } catch (err) {
        console.error(err);
    }
}

findLocalResources();
