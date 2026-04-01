
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function checkPrices() {
    try {
        console.log('--- Searching for Screenshot Books by Price ---');
        const books = await sql`
            SELECT id, title, image, price, original_price, category 
            FROM books 
            WHERE price IN (299, 199, 599, 1299, 899, 399)
        `;
        
        console.log(`Found ${books.length} matching price matches.`);
        books.forEach(b => {
             const isAmazon = (b.image || '').includes('amazon');
             console.log(`[ID: ${b.id}] "${b.title}" - Price: ${b.price}/${b.original_price} - Amazon: ${isAmazon}`);
        });
        
    } catch (err) {
        console.error(err);
    }
}

checkPrices();
