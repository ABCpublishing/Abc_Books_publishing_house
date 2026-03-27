
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function check() {
    try {
        const res = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'books'
        `;
        console.log(JSON.stringify(res, null, 2));
    } catch (err) {
        console.error(err);
    }
}

check();
