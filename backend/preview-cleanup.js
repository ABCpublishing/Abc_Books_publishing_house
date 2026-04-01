
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function previewCleanup() {
    try {
        console.log('--- Preview: Removing Demo Books ---');
        
        const demoBooks = await sql`
            SELECT id, title, image 
            FROM books 
            WHERE image LIKE '%amazon%'
               OR (id < 110 AND (image IS NULL OR image NOT LIKE 'data:%'))
        `;
        
        console.log(`Found ${demoBooks.length} demo books to be removed.`);
        demoBooks.forEach(b => {
             console.log(`[DELETE] ID: ${b.id} - "${b.title}"`);
        });

        const stayBooks = await sql`
            SELECT id, title, image 
            FROM books 
            WHERE NOT (image LIKE '%amazon%'
               OR (id < 110 AND (image IS NULL OR image NOT LIKE 'data:%')))
        `;
        
        console.log(`\n${stayBooks.length} REAL books will STAY:`);
        stayBooks.forEach(b => {
             console.log(`[STAY] ID: ${b.id} - "${b.title}"`);
        });
        
    } catch (err) {
        console.error(err);
    }
}

previewCleanup();
