
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function listAll() {
    try {
        console.log('--- Listing ALL Books ---');
        const books = await sql`
            SELECT id, title, image, price, original_price, category, created_at
            FROM books 
            ORDER BY id DESC
        `;
        
        console.log(`Found ${books.length} books in database.`);
        books.forEach(b => {
             const isAmazon = (b.image || '').includes('amazon');
             const isBase64 = (b.image || '').startsWith('data:');
             const isReal = isBase64 || (b.image && !isAmazon);
             console.log(`[ID: ${b.id}] "${b.title}" - Real: ${isReal} - ${isBase64 ? 'Base64' : 'Other'}`);
        });
        
    } catch (err) {
        console.error(err);
    }
}

listAll();
