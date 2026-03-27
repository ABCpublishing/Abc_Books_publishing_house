
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function checkLocalImages() {
    try {
        console.log('--- Checking for Local Image Links ---');
        const books = await sql`
            SELECT id, title, image 
            FROM books 
            WHERE image LIKE '/images/%' 
               OR image LIKE 'images/%'
        `;
        
        console.log(`Found ${books.length} books with local image paths.`);
        books.forEach(b => console.log(`  [${b.id}] ${b.title} -> ${b.image}`));
        
    } catch (err) {
        console.error(err);
    }
}

checkLocalImages();
