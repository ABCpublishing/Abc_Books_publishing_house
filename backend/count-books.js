
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function count() {
    try {
        const res = await sql`SELECT COUNT(*) FROM books`;
        console.log(JSON.stringify(res, null, 2));
    } catch (err) {
        console.error(err);
    }
}

count();
