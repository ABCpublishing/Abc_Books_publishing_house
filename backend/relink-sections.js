
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function relinkSections() {
    console.log('🔗 Relinking books to sections in Neon database...\n');
    try {
        const sql = neon(process.env.DATABASE_URL);

        // 1. Clear existing sections if any
        console.log('🗑️ Clearing existing book_sections...');
        await sql`DELETE FROM book_sections`;

        // 2. Get all books
        const books = await sql`SELECT id, title, category FROM books`;
        console.log(`Found ${books.length} books in database.`);

        // 3. Map categories to section names
        // Note: Based on admin/admin.html, sections are: hero, editors, featured, trending, newReleases, children, bestseller, boxSets, urdu, indianAuthors, english, arabic, islamicBooks, fiction, kashmiri
        const sectionsToAdd = [];

        books.forEach(book => {
            const cat = book.category.toLowerCase();
            
            // Language sections
            if (cat === 'urdu') {
                sectionsToAdd.push({ id: book.id, section: 'urdu' });
                sectionsToAdd.push({ id: book.id, section: 'indianAuthors' }); // Popular Urdu section
            }
            if (cat === 'english') sectionsToAdd.push({ id: book.id, section: 'english' });
            if (cat === 'arabic') sectionsToAdd.push({ id: book.id, section: 'arabic' });
            if (cat === 'kashmiri') sectionsToAdd.push({ id: book.id, section: 'kashmiri' });
            if (cat === 'islamic') sectionsToAdd.push({ id: book.id, section: 'islamicBooks' });

            // Mix them into homepage grids (first book of each category for Hero/Bestseller)
            if (book.id === 1) sectionsToAdd.push({ id: book.id, section: 'hero' });
            if (book.id % 2 === 0) sectionsToAdd.push({ id: book.id, section: 'featured' });
            if (book.id % 3 === 0) sectionsToAdd.push({ id: book.id, section: 'bestseller' });
        });

        // 4. Insert into book_sections
        console.log(`Adding ${sectionsToAdd.length} section links...`);
        for (const item of sectionsToAdd) {
             await sql`INSERT INTO book_sections (book_id, section_name) VALUES (${item.id}, ${item.section})`;
             console.log(`   ✅ Linked "${item.id}" to section: ${item.section}`);
        }

        console.log('\n🎉 Homepage sections updated successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error relinking sections:', error);
        process.exit(1);
    }
}

relinkSections();
