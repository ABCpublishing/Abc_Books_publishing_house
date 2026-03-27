
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function checkDuplicates() {
    try {
        console.log('--- Checking for duplicate titles ---');
        const duplicates = await sql`
            SELECT title, COUNT(*) as count 
            FROM books 
            GROUP BY title 
            HAVING COUNT(*) > 1
        `;
        
        console.log(`Found ${duplicates.length} duplicate titles.`);
        for (const d of duplicates) {
             const versions = await sql`SELECT id, title, image, created_at FROM books WHERE title = ${d.title}`;
             console.log(`\nDuplicate: "${d.title}"`);
             versions.forEach(v => {
                 const isAmazon = (v.image || '').includes('amazon');
                 const isBase64 = (v.image || '').startsWith('data:');
                 console.log(`  [ID: ${v.id}] Created: ${v.created_at}, Amazon: ${isAmazon}, Base64: ${isBase64}`);
             });
        }
        
    } catch (err) {
        console.error(err);
    }
}

checkDuplicates();
