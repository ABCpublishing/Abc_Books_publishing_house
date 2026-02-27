
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function checkSchema() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const columns = await sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'users' AND column_name = 'is_admin'
        `;
        console.table(columns);
    } catch (e) {
        console.error('Error:', e);
    }
}

checkSchema();
