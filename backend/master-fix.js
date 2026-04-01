
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function masterFix() {
    try {
        console.log('--- Master Fix: Image Rendering ---');
        
        // 1. Clear ALL sections
        console.log('🗑️ Clearing book_sections...');
        await sql`DELETE FROM book_sections`;

        // 2. Identify the "Good" books
        // Priority 1: Base64 images
        // Priority 2: Local images (to be set)
        // Priority 3: Non-Amazon images (if any)
        
        const base64Books = await sql`SELECT id, title, category FROM books WHERE image LIKE 'data:%'`;
        console.log(`Found ${base64Books.length} Base64 books.`);
        
        // 3. Update the specific books in the screenshot with local images
        // Based on analysis, the admin uploaded featured_book_1..6 for the top rows.
        const screenshotMappings = [
            { id: 1, img: '/images/featured_book_1_1767970652616.png' }, // The Sealed Nectar
            { id: 3, img: '/images/featured_book_2_1767970670231.png' }, // The Quran
            { id: 4, img: '/images/featured_book_3_1767970688644.png' }, // Sahih Al-Bukhari
            { id: 6, img: '/images/featured_book_4_1767970707050.png' }, // The Holy Quran (Arabic-English)
            { id: 7, img: '/images/featured_book_5_1767970727212.png' }, // Tafsir Ibn Kathir (Complete)
            { id: 8, img: '/images/featured_book_6_1767970747551.png' }, // Sahih Bukhari (Complete)
            { id: 9, img: '/images/placeholder.jpg' }                  // Riyadh-us-Saliheen (No real img found)
        ];
        
        for (const m of screenshotMappings) {
            console.log(`Updating ID ${m.id} image to ${m.img}...`);
            await sql`UPDATE books SET image = ${m.img} WHERE id = ${m.id}`;
        }

        // 4. Link these "Fixed" books to Islamic Wisdom
        console.log('🔗 Linking fixed books to islamicBooks section...');
        for (const m of screenshotMappings) {
            await sql`INSERT INTO book_sections (book_id, section_name, display_order) VALUES (${m.id}, 'islamicBooks', ${m.id})`;
        }
        
        // 5. Link Base64 books as well to ensure they show up
        for (const b of base64Books) {
            // Avoid duplicates
            const exists = await sql`SELECT 1 FROM book_sections WHERE book_id = ${b.id} AND section_name = 'islamicBooks'`;
            if (exists.length === 0) {
                await sql`INSERT INTO book_sections (book_id, section_name) VALUES (${b.id}, 'islamicBooks')`;
            }
        }

        // 6. Featured Section (mostly the same ones)
        console.log('🔗 Linking to featured section...');
        for (let i = 1; i <= 6; i++) {
             await sql`INSERT INTO book_sections (book_id, section_name) VALUES (${i}, 'featured')`;
        }
        
        console.log('🎉 MASTER FIX COMPLETE! Please refresh the page.');

    } catch (err) {
        console.error(err);
    }
}

masterFix();
