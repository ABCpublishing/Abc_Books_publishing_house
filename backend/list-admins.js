
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function listAdmins() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        console.log('Checking for all admins...');
        const admins = await sql`SELECT id, name, email, is_admin FROM users WHERE is_admin = TRUE`;
        console.table(admins);

        if (admins.length === 0) {
            console.log('No admins found in DB!');
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

listAdmins();
