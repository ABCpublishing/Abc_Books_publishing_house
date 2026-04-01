
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function checkIslamic() {
    try {
        console.log('--- Checking Islamic Books Section ---');
        const books = await sql`
            SELECT bs.section_name, b.id, b.title, b.image, b.category, b.created_at
            FROM book_sections bs 
            JOIN books b ON bs.book_id = b.id 
            WHERE bs.section_name = 'islamicBooks'
            ORDER BY bs.display_order, b.id DESC
        `;
        
        console.log(`Found ${books.length} books in this section.`);
        books.forEach(b => {
             const isAmazon = (b.image || '').includes('amazon');
             console.log(`[ID: ${b.id}] "${b.title}" - Image: ${b.image ? b.image.substring(0, 40) : 'NULL'} (Amazon: ${isAmazon}, Created: ${b.created_at})`);
        });
        
    } catch (err) {
        console.error(err);
    }
}

checkIslamic();
