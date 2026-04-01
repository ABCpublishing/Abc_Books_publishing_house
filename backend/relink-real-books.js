
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function cleanupAndRelink() {
    try {
        console.log('--- Cleaning Up Demo Books and Relinking to Admin Uploads ---');
        
        // 1. Get ALL books from the database
        const allBooks = await sql`
            SELECT id, title, image, category, created_at 
            FROM books 
            ORDER BY id DESC
        `;
        
        console.log(`Analyzing ${allBooks.length} books in database...`);
        
        // 2. Identify "Unique Recent" books (keep highest ID for each title)
        const uniqueBooksMap = new Map();
        for (const book of allBooks) {
            const title = (book.title || '').trim().toLowerCase();
            if (!uniqueBooksMap.has(title)) {
                // Check if this book has a "Real" image (not Amazon or very long Base64)
                const isAmazon = (book.image || '').includes('amazon');
                // The user specifically mentions demo ones failing to render (S, T, F letters)
                // If it's Amazon and we have a better version, or if it's the ONLY version but it's Amazon and the user is seeing letters...
                // Actually, I'll prioritize books that are NOT Amazon or were created TODAY.
                uniqueBooksMap.set(title, book);
            } else {
                 const existing = uniqueBooksMap.get(title);
                 const existingIsAmazon = (existing.image || '').includes('amazon');
                 const currentIsAmazon = (book.image || '').includes('amazon');
                 
                 // If current is NOT amazon but existing IS, swap it
                 if (existingIsAmazon && !currentIsAmazon) {
                     uniqueBooksMap.set(title, book);
                 }
            }
        }
        
        const realBooks = Array.from(uniqueBooksMap.values());
        console.log(`Distilled into ${realBooks.length} unique real/recent books.`);
        
        // 3. Clear existing sections
        console.log('\n🗑️ Clearing old book_sections...');
        await sql`DELETE FROM book_sections`;
        
        // 4. Relink Sections based on Real Books
        // Sections: hero, editors, featured, trending, newReleases, children, bestseller, boxSets, urdu, indianAuthors, english, arabic, islamicBooks, fiction, kashmiri
        console.log('\n🔗 Populating sections with newest books...');
        let linked = 0;
        
        // Filter some books with "Real" images for featured/hero
        const booksWithRealImages = realBooks.filter(b => (b.image && !b.image.includes('amazon')) || b.id > 116);
        console.log(`${booksWithRealImages.length} books have specific admin-uploaded images.`);

        for (const book of realBooks) {
            const cat = (book.category || '').toLowerCase();
            
            // Homepage Sections (mix of everything)
            if (linked < 8) await sql`INSERT INTO book_sections (book_id, section_name) VALUES (${book.id}, 'featured')`;
            if (linked < 5) await sql`INSERT INTO book_sections (book_id, section_name) VALUES (${book.id}, 'hero')`;
            
            // Language/Themed sections
            if (cat.includes('urdu')) {
                await sql`INSERT INTO book_sections (book_id, section_name) VALUES (${book.id}, 'urdu')`;
                await sql`INSERT INTO book_sections (book_id, section_name) VALUES (${book.id}, 'indianAuthors')`;
            } else if (cat.includes('islamic') || book.title.toLowerCase().includes('quran')) {
                await sql`INSERT INTO book_sections (book_id, section_name) VALUES (${book.id}, 'islamicBooks')`;
                await sql`INSERT INTO book_sections (book_id, section_name) VALUES (${book.id}, 'trending')`;
            } else if (cat.includes('english')) {
                await sql`INSERT INTO book_sections (book_id, section_name) VALUES (${book.id}, 'english')`;
            }
            
            linked++;
        }
        
        console.log(`\n🎉 Successfully linked ${linked} real books to sections!`);
        console.log('--- RELINK COMPLETE ---');

    } catch (err) {
        console.error('Relink error:', err);
    }
}

cleanupAndRelink();
