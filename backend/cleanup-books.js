
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function performCleanup() {
    try {
        console.log('--- Cleaning Up Demo Books ---');
        
        // 1. Identify demo book IDs
        const demoBooks = await sql`
            SELECT id FROM books 
            WHERE image LIKE '%amazon%'
               OR (id < 110 AND (image IS NULL OR image NOT LIKE 'data:%'))
        `;
        
        const demoIds = demoBooks.map(b => b.id);
        
        if (demoIds.length === 0) {
            console.log('No demo books found.');
            return;
        }

        console.log(`Removing ${demoIds.length} demo books from sections...`);
        await sql`DELETE FROM book_sections WHERE book_id = ANY(${demoIds})`;

        console.log(`Deleting ${demoIds.length} demo books from catalog...`);
        await sql`DELETE FROM books WHERE id = ANY(${demoIds})`;
        
        console.log('🎉 CLEANUP COMPLETE!');

    } catch (err) {
        console.error('Cleanup error:', err);
    }
}

performCleanup();
