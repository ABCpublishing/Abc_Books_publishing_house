
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function promote() {
    try {
        const res = await sql`
            UPDATE users 
            SET is_admin = true 
            WHERE email IN ('admin@abcbooks.com', 'maktabailmuadab@gmail.com', 'admin@abcbooks.store') 
            RETURNING email, is_admin
        `;
        console.log(JSON.stringify(res, null, 2));
    } catch (err) {
        console.error(err);
    }
}

promote();
