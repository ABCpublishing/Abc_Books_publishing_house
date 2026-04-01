
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function checkBooks() {
    try {
        console.log('--- Checking Schema ---');
        const cols = await sql`
            SELECT column_name, table_name 
            FROM information_schema.columns 
            WHERE table_name IN ('books', 'book_sections')
        `;
        console.log(`Found ${cols.length} columns in these tables.`);
        
        console.log('\n--- Checking books in book_sections ---');
        // Let's use simpler query to avoid missing column error
        const booksInSections = await sql`
            SELECT b.id, b.title, b.image, bs.section_name 
            FROM books b 
            JOIN book_sections bs ON b.id = bs.book_id
            LIMIT 50
        `;
        
        console.log(`Found ${booksInSections.length} books currently in homepage sections.`);
        
        // Check for placeholder IDs (1, 2, 3) and demo titles
        const demoBooks = booksInSections.filter(b => {
             const title = (b.title || '').toLowerCase();
             return b.id <= 3 || title.includes('quran') || title.includes('modern india') || title.includes('sealed nectar');
        });
        
        console.log(`\nDemo books currently on display: ${demoBooks.length}`);
        demoBooks.forEach(b => console.log(`  [${b.id}] ${b.title} -> Section: ${b.section_name}`));
        
        console.log('\n--- Checking for REAL books with images ---');
        const realBooks = await sql`
            SELECT id, title, image, category 
            FROM books 
            WHERE id > 3 
              AND image IS NOT NULL 
              AND image != ''
              AND title NOT ILIKE '%Quran%'
            LIMIT 20
        `;
        
        console.log(`Found ${realBooks.length} other books that have images.`);
        realBooks.forEach(b => {
            const isAmazon = b.image.includes('amazon');
            const isBase64 = b.image.startsWith('data:');
            console.log(`  [${b.id}] ${b.title} (Image length: ${b.image.length}, Amazon: ${isAmazon}, Base64: ${isBase64})`);
        });
        
    } catch (err) {
        console.error('Diagnostic error:', err);
    }
}

checkBooks();
