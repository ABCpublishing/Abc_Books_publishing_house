
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function findNectar() {
    try {
        const books = await sql`
            SELECT id, title, image, price, original_price, created_at
            FROM books 
            WHERE title LIKE '%Sealed Nectar%' OR price = 299
        `;
        console.log(JSON.stringify(books, null, 2));
    } catch (err) {
        console.error(err);
    }
}

findNectar();
