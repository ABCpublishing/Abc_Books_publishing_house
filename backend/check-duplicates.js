
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function checkDuplicates() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const dupes = await sql`
            SELECT email, COUNT(*) 
            FROM users 
            GROUP BY email 
            HAVING COUNT(*) > 1
        `;
        console.log('Duplicate emails:', dupes);

        const allAdmins = await sql`SELECT id, email, is_admin FROM users WHERE is_admin = TRUE`;
        console.log('All admins in DB:', allAdmins);
    } catch (e) {
        console.error('Error:', e);
    }
}

checkDuplicates();
