
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function check() {
    try {
        const res = await sql`
            SELECT b.id, b.title, b.image_url 
            FROM books b 
            JOIN book_sections bs ON b.id = bs.book_id 
            WHERE bs.section_id = 'fiction'
        `;
        console.log(JSON.stringify(res, null, 2));
    } catch (err) {
        console.error(err);
    }
}

check();
