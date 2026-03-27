
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function finalCleanup() {
    try {
        console.log('--- Final Deep Cleanup: Removing Demo Books ---');
        
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

        console.log(`Found ${demoIds.length} demo books. Cleaning up dependencies...`);

        // 2. Remove from Sections
        await sql`DELETE FROM book_sections WHERE book_id = ANY(${demoIds})`;
        console.log('Deleted from book_sections.');

        // 3. Remove from Order Items
        await sql`DELETE FROM order_items WHERE book_id = ANY(${demoIds})`;
        console.log('Deleted from order_items.');

        // 4. Delete the Books
        await sql`DELETE FROM books WHERE id = ANY(${demoIds})`;
        console.log(`Successfully deleted ${demoIds.length} demo books.`);
        
        console.log('🎉 CLEANUP COMPLETE! The site is now ready for your fresh uploads.');

    } catch (err) {
        console.error('Final Cleanup error:', err);
    }
}

finalCleanup();
