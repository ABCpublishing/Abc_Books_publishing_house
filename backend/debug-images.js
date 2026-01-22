require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkRecentImages() {
    try {
        console.log('Checking last 5 books...');
        const books = await sql`
            SELECT id, title, image, length(image) as img_len 
            FROM books 
            ORDER BY created_at DESC 
            LIMIT 5
        `;

        console.log('Found', books.length, 'books.');
        books.forEach(b => {
            console.log(`\nID: ${b.id}`);
            console.log(`Title: ${b.title}`);
            console.log(`Image Length: ${b.img_len}`);
            console.log(`Image Start: ${b.image ? b.image.substring(0, 50) : 'null'}...`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

checkRecentImages();
