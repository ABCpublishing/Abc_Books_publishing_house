
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function listTables() {
    try {
        console.log('--- Listing Database Tables ---');
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        console.log(JSON.stringify(tables, null, 2));
    } catch (err) {
        console.error(err);
    }
}

listTables();
