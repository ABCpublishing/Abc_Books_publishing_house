
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function checkSpecificBooks() {
    try {
        const titles = [
            'Sahih Al-Bukhari',
            'The Holy Quran (Arabic-English)',
            'Sahih Bukhari (Complete)',
            'The Sealed Nectar (Ar-Raheeq Al-Makhtum)',
            'Fortress of the Muslim (Hisnul Muslim)',
            'The Book of Assistance'
        ];
        
        console.log('--- Database Check for Screenshot Books ---');
        const books = await sql`
            SELECT id, title, image, isbn 
            FROM books 
            WHERE title = ANY(${titles})
        `;
        
        books.forEach(b => {
             console.log(`[ID: ${b.id}] Title: ${b.title}`);
             console.log(`  Image: ${b.image ? (b.image.substring(0, 50) + '...') : 'NULL'}`);
        });
        
    } catch (err) {
        console.error(err);
    }
}

checkSpecificBooks();
