
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function findBooksByPrice() {
    try {
        console.log('--- Searching for Screenshot Books by Price (Exact) ---');
        // Prices from screenshot
        const screenshotPrices = [299, 199, 599, 1299, 899, 399];
        
        const books = await sql`
            SELECT id, title, image, price, original_price 
            FROM books 
            WHERE price IN (299, 199, 599, 1299, 899, 399)
               OR original_price IN (399, 299, 799, 1799, 1299, 599)
        `;
        
        console.log(JSON.stringify(books, null, 2));
    } catch (err) {
        console.error(err);
    }
}

findBooksByPrice();
